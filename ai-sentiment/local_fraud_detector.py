import re
import base64
import io
import warnings
warnings.filterwarnings("ignore")

try:
    from PIL import Image, ImageStat
    import imagehash
    from transformers import pipeline, CLIPProcessor, CLIPModel
    import torch
    HAS_AI = True
except ImportError:
    HAS_AI = False
    print("WARNING: Transformers or torch not installed. Falling back to basic heuristics.")

# Globals for models
AI_DETECTOR = None
CLIP_MODEL = None
CLIP_PROCESSOR = None
SEEN_HASHES = set()

def load_ai_models():
    global AI_DETECTOR, CLIP_MODEL, CLIP_PROCESSOR
    if not HAS_AI:
        return
    if AI_DETECTOR is None:
        print("[Local Fraud Detector] Loading umm-maybe/AI-image-detector...")
        AI_DETECTOR = pipeline("image-classification", model="umm-maybe/AI-image-detector", device=-1)
    if CLIP_MODEL is None:
        print("[Local Fraud Detector] Loading openai/clip-vit-base-patch32...")
        CLIP_MODEL = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        CLIP_PROCESSOR = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

class LocalFraudDetector:
    
    @staticmethod
    def moderate_annonce(request) -> dict:
        total_risk = 0
        categories = set()
        signals_list = []
        
        # 1. Analyze Text
        text_risk, text_cats, text_sigs = LocalFraudDetector._analyze_text(request.titre, request.description)
        total_risk += text_risk
        categories.update(text_cats)
        signals_list.extend(text_sigs)
        
        # 2. Analyze Price
        price_risk, price_cats, price_sigs = LocalFraudDetector._analyze_price(request.prix)
        total_risk += price_risk
        categories.update(price_cats)
        signals_list.extend(price_sigs)
        
        # 3. Analyze Behavior
        if request.user_annonce_count > 5:
            total_risk += 15
            categories.add("SPAM")
            signals_list.append({"signal": "high_user_annonce_count", "weight": 15})
            
        # 4. Analyze Images
        if request.images and HAS_AI:
            load_ai_models()
            img_risk = 0
            for img_str in request.images:
                risk, cats, sigs = LocalFraudDetector._analyze_image_deep(img_str, request.prix)
                img_risk += risk
                categories.update(cats)
                signals_list.extend(sigs)
            total_risk += img_risk
        elif not request.images:
            total_risk += 10
            signals_list.append({"signal": "no_images_provided", "weight": 10})

        raw_score = total_risk
        total_risk = min(100, max(0, int(total_risk)))
        flagged = total_risk >= 60
        
        explanation = "Analyse locale — Annonce légitime."
        if flagged:
            explanation = "Analyse locale — Signaux de fraude/spam détectés par Deep Learning."
        elif total_risk > 0:
            explanation = "Analyse locale — Quelques éléments suspects."

        return {
            "flagged": flagged,
            "risk_score": total_risk,
            "raw_score": raw_score,
            "categories": list(categories),
            "signals": signals_list,
            "explanation": explanation,
            "confidence": "HIGH" if HAS_AI else "MEDIUM"
        }

    @staticmethod
    def _analyze_text(titre: str, description: str):
        risk = 0
        cats = []
        sigs = []
        
        titre = titre or ""
        description = description or ""
        combined = f"{titre} {description}".lower()
        
        if len(description.strip()) < 30:
            risk += 20
            cats.append("SPAM")
            sigs.append({"signal": "description_too_short", "weight": 20})
            
        if len(titre.strip()) < 10:
            risk += 15
            cats.append("SPAM")
            sigs.append({"signal": "title_too_short", "weight": 15})
            
        if len(description) > 20 and sum(1 for c in description if c.isupper()) / len(description) > 0.5:
            risk += 15
            cats.append("SPAM")
            sigs.append({"signal": "too_many_caps", "weight": 15})
            
        fraud_keywords = [
            "western union", "crypto", "bitcoin", "virement", "paypal", "whatsapp only",
            "contactez moi sur", "paiement avant", "advance payment", "wire transfer",
            "gratuit", "free money", "gagnez", "click here", "http://", "https://"
        ]
        for kw in fraud_keywords:
            if kw in combined:
                risk += 35
                cats.append("SCAM")
                sigs.append({"signal": f"fraud_keyword_detected: {kw}", "weight": 35})
                
        inappropriate_keywords = [
            "merde", "connard", "salope", "fuck", "shit", "bitch", "nude", "sexe",
            "porn", "xxx", "insulte"
        ]
        for kw in inappropriate_keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', combined):
                risk += 40
                cats.append("INAPPROPRIATE")
                sigs.append({"signal": f"inappropriate_keyword: {kw}", "weight": 40})
                
        return risk, cats, sigs

    @staticmethod
    def _analyze_price(prix: float):
        risk = 0
        cats = []
        sigs = []
        if prix < 50:
            risk += 60
            cats.append("FRAUD")
            sigs.append({"signal": f"absolute_price_too_low:{prix}", "weight": 60})
        elif prix > 10000:
            risk += 15
            cats.append("MISLEADING")
            sigs.append({"signal": f"price_too_high:{prix}", "weight": 15})
        return risk, cats, sigs

    @staticmethod
    def _analyze_image_deep(b64_str: str, prix: float):
        risk = 0
        cats = []
        sigs = []
        try:
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            img_data = base64.b64decode(b64_str)
            img = Image.open(io.BytesIO(img_data)).convert('RGB')
            
            # 1. Duplicate Detection (ImageHash)
            img_hash = str(imagehash.phash(img))
            if img_hash in SEEN_HASHES:
                risk += 40
                cats.append("DUPLICATE_SPAM")
                sigs.append({"signal": f"duplicate_image_hash:{img_hash}", "weight": 40})
            else:
                SEEN_HASHES.add(img_hash)
            
            # 2. AI-Generated Image Detection
            if AI_DETECTOR is not None:
                res = AI_DETECTOR(img)
                # Usually returns [{'label': 'artificial', 'score': 0.9}, ...]
                top_label = res[0]['label'].lower()
                top_score = res[0]['score']
                if 'artificial' in top_label or 'ai' in top_label or 'fake' in top_label:
                    if top_score > 0.7:
                        risk += 50
                        cats.append("FAKE_IMAGE")
                        sigs.append({"signal": f"ai_generated_image:{top_score:.2f}", "weight": 50})

            # 3. CLIP Luxury vs Price Check
            if CLIP_MODEL is not None and CLIP_PROCESSOR is not None:
                labels = ["a luxurious expensive mansion", "a standard house", "a cheap rundown apartment", "not a house"]
                inputs = CLIP_PROCESSOR(text=labels, images=img, return_tensors="pt", padding=True)
                outputs = CLIP_MODEL(**inputs)
                logits_per_image = outputs.logits_per_image
                probs = logits_per_image.softmax(dim=1).detach().numpy()[0]
                
                # Probs index matches labels index
                # 0: luxurious, 1: standard, 2: cheap, 3: not a house
                
                # Check if it's completely irrelevant
                if probs[3] > 0.6:
                    risk += 30
                    cats.append("IRRELEVANT_IMAGE")
                    sigs.append({"signal": f"irrelevant_image_not_a_house:{probs[3]:.2f}", "weight": 30})
                
                # Check for scam mismatch: Looks like a luxury mansion but extremely cheap
                elif probs[0] > max(probs[1], probs[2]) and prix < 200:
                    risk += 60
                    cats.append("SCAM")
                    cats.append("PRICE_MISMATCH")
                    sigs.append({"signal": f"luxury_image_low_price_scam", "weight": 60})

            return risk, cats, sigs
        except Exception as e:
            print(f"[Local Fraud Detector Deep] Error parsing image: {e}")
            return 0, [], []
