"""
AI Content Analysis Microservice
- Sentiment analysis for reviews
- Content moderation for annonces, messages, and user data
- Fraud / suspicious behavior detection
Run with: uvicorn main:app --reload --port 8000
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv

from local_fraud_detector import LocalFraudDetector

# Load API key from .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

app = FastAPI(title="AI Content Analysis Service", version="2.0.0")

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import sys

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"Validation Error: {exc.errors()}", file=sys.stderr, flush=True)
    body = await request.body()
    print(f"Body: {body}", file=sys.stderr, flush=True)
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

# Allow calls from Spring Boot backend (port 8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    sentiment: str          # POSITIF | NEGATIF | NEUTRE
    confidence: str         # HIGH | MEDIUM | LOW
    explanation: str        # Short explanation


class ModerationRequest(BaseModel):
    text: str
    content_type: str = "GENERAL"  # ANNONCE | AVIS | MESSAGE | GENERAL


class AnnonceModerationRequest(BaseModel):
    titre: str
    description: str
    prix: float
    localisation: str
    user_annonce_count: int = 0
    images: list[str] = []
    surface: float | None = None
    account_age_days: int | None = None
    user_verified: bool | None = None


class ModerationResponse(BaseModel):
    flagged: bool
    risk_score: int         # 0-100
    raw_score: float = 0.0
    categories: list[str]   # e.g. SPAM, FRAUD, INAPPROPRIATE, SCAM
    signals: list[dict] = []
    explanation: str
    confidence: str         # HIGH | MEDIUM | LOW


@app.get("/health")
def health_check():
    return {"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)}


@app.post("/analyze", response_model=SentimentResponse)
def analyze_sentiment(request: SentimentRequest) -> SentimentResponse:
    """
    Analyze the sentiment of a review comment using Gemini Flash.
    Returns: POSITIF, NEGATIF, or NEUTRE
    """
    text = request.text.strip()

    # If no text or very short text, return NEUTRE
    if not text or len(text) < 3:
        return SentimentResponse(
            sentiment="NEUTRE",
            confidence="HIGH",
            explanation="Text too short to analyze."
        )

    # If no API key configured, use local fallback
    if not GEMINI_API_KEY:
        return _local_fallback_sentiment(text)

    try:
        client = genai.Client(api_key=GEMINI_API_KEY)

        prompt = f"""You are a sentiment analysis system for property listing reviews in Tunisia.
Analyze the following review comment and return ONLY a JSON object (no markdown, no backticks) in this exact format:
{{
  "sentiment": "POSITIF",
  "confidence": "HIGH",
  "explanation": "The user expresses satisfaction."
}}

Rules:
- "sentiment" must be exactly one of: POSITIF, NEGATIF, NEUTRE
- "confidence" must be exactly one of: HIGH, MEDIUM, LOW
- "explanation" must be a short English sentence (max 15 words)
- Treat neutral/factual/empty comments as NEUTRE
- The comment may be in French, Arabic, or English

Review comment: "{text}"

Return ONLY the raw JSON object:"""

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        raw = response.text.strip()

        # Strip markdown if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()

        import json
        result = json.loads(raw)

        sentiment = result.get("sentiment", "NEUTRE").upper()
        if sentiment not in ("POSITIF", "NEGATIF", "NEUTRE"):
            sentiment = "NEUTRE"

        confidence = result.get("confidence", "MEDIUM").upper()
        if confidence not in ("HIGH", "MEDIUM", "LOW"):
            confidence = "MEDIUM"

        return SentimentResponse(
            sentiment=sentiment,
            confidence=confidence,
            explanation=result.get("explanation", "")
        )

    except Exception as e:
        print(f"[Gemini Error] {e} — using local fallback")
        return _local_fallback_sentiment(text)


def _local_fallback_sentiment(text: str) -> SentimentResponse:
    """
    Simple keyword-based fallback when Gemini is unavailable.
    Works well for French and English comments.
    """
    import re
    text_lower = text.lower()

    positive_keywords = [
        "bien", "super", "excellent", "top", "parfait", "propre", "calme",
        "good", "great", "amazing", "perfect", "clean", "nice", "recommend",
        "satisfait", "content", "magnifique", "agréable", "merci", "bravo",
        "comfortable", "beau", "belle", "génial", "géniale", "sympa", "recommande",
        "best", "love", "loved", "awesome", "fantastic", "wonderful"
    ]

    negative_keywords = [
        "mauvais", "mauvaise", "sale", "nul", "horrible", "décevant", "problème", "déçu",
        "bad", "dirty", "awful", "terrible", "broken", "noisy", "bruyant", "bruit",
        "insatisfait", "dommage", "triste", "froid", "humide", "pire", "catastrophe",
        "worst", "hate", "hated", "disgusting", "poor", "unacceptable", "ugly"
    ]

    # Do not use strict \b boundaries so we can catch plurals and derivations (e.g., problèmes, catastrophique)
    pos_score = sum(1 for word in positive_keywords if word in text_lower)
    neg_score = sum(1 for word in negative_keywords if word in text_lower)

    if pos_score > neg_score:
        return SentimentResponse(
            sentiment="POSITIF",
            confidence="LOW",
            explanation="Positive keywords detected (local analysis)."
        )
    elif neg_score > pos_score:
        return SentimentResponse(
            sentiment="NEGATIF",
            confidence="LOW",
            explanation="Negative keywords detected (local analysis)."
        )
    else:
        return SentimentResponse(
            sentiment="NEUTRE",
            confidence="LOW",
            explanation="No clear sentiment detected (local analysis)."
        )


# ─── CONTENT MODERATION ─────────────────────────────────────

@app.post("/moderate-content", response_model=ModerationResponse)
def moderate_content(request: ModerationRequest) -> ModerationResponse:
    """Detect inappropriate, fraudulent, or spam content in user text."""
    text = request.text.strip()
    if not text or len(text) < 3:
        return ModerationResponse(
            flagged=False, risk_score=0, categories=[],
            explanation="Text too short to analyze.", confidence="HIGH"
        )
    if not GEMINI_API_KEY:
        return _local_fallback_moderation(text, request.content_type)
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = f"""You are a content moderation AI for a Tunisian property rental platform (Lofina).
Analyze the following {request.content_type} content for inappropriate, fraudulent, spam, or scam indicators.

Return ONLY a raw JSON object (no markdown):
{{
  "flagged": false,
  "risk_score": 0,
  "categories": [],
  "explanation": "Content appears legitimate.",
  "confidence": "HIGH"
}}

Rules:
- "flagged" = true if risk_score >= 60
- "risk_score" = 0-100 (0=safe, 100=definitely fraudulent/inappropriate)
- "categories" = list from: SPAM, FRAUD, SCAM, INAPPROPRIATE, HARASSMENT, MISLEADING, PHISHING (empty if safe)
- "explanation" = short French sentence explaining the decision (max 20 words)
- "confidence" = HIGH | MEDIUM | LOW
- Flag: external payment requests, fake listings, offensive language, phishing links, unrealistic promises
- Content may be in French, Arabic, or English

Content to analyze:
"{text}"

Return ONLY the raw JSON:"""
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return _parse_moderation_response(response.text.strip())
    except Exception as e:
        print(f"[Gemini Moderation Error] {e}")
        return _local_fallback_moderation(text, request.content_type)


@app.post("/moderate-annonce", response_model=ModerationResponse)
def moderate_annonce(request: AnnonceModerationRequest) -> ModerationResponse:
    """Analyze a property listing for fraud indicators using a fully local Python module."""
    try:
        result_dict = LocalFraudDetector.moderate_annonce(request)
        return ModerationResponse(
            flagged=result_dict.get("flagged", False),
            risk_score=result_dict.get("risk_score", 0),
            raw_score=result_dict.get("raw_score", 0.0),
            categories=result_dict.get("categories", []),
            signals=result_dict.get("signals", []),
            explanation=result_dict.get("explanation", ""),
            confidence=result_dict.get("confidence", "HIGH")
        )
    except Exception as e:
        print(f"[Local Moderation Error] {e}")
        return _local_fallback_annonce(request)


def _parse_moderation_response(raw: str) -> ModerationResponse:
    import json
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    result = json.loads(raw)
    risk = max(0, min(100, int(result.get("risk_score", 0))))
    categories = result.get("categories", [])
    if not isinstance(categories, list):
        categories = []
    flagged = bool(result.get("flagged", risk >= 60))
    confidence = result.get("confidence", "MEDIUM").upper()
    if confidence not in ("HIGH", "MEDIUM", "LOW"):
        confidence = "MEDIUM"
    return ModerationResponse(
        flagged=flagged,
        risk_score=risk,
        categories=[c.upper() for c in categories],
        explanation=result.get("explanation", ""),
        confidence=confidence
    )


def _local_fallback_moderation(text: str, content_type: str) -> ModerationResponse:
    """Keyword-based fallback for content moderation."""
    import re
    text_lower = text.lower()
    risk = 0
    categories = []

    fraud_keywords = [
        "western union", "crypto", "bitcoin", "virement", "paypal", "whatsapp only",
        "contactez moi sur", "paiement avant", "advance payment", "wire transfer",
        "gratuit", "free money", "gagnez", "click here", "http://", "https://"
    ]
    inappropriate_keywords = [
        "merde", "connard", "salope", "fuck", "shit", "bitch", "nude", "sexe",
        "porn", "xxx", "insulte"
    ]
    spam_keywords = [
        "promo", "offre spéciale", "cliquez", "gagnez", "100%", "urgent!!!",
        "limited time", "act now", "viagra", "casino"
    ]

    for kw in fraud_keywords:
        if kw in text_lower:
            risk += 25
            if "FRAUD" not in categories:
                categories.append("FRAUD")
    for kw in inappropriate_keywords:
        if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
            risk += 30
            if "INAPPROPRIATE" not in categories:
                categories.append("INAPPROPRIATE")
    for kw in spam_keywords:
        if kw in text_lower:
            risk += 15
            if "SPAM" not in categories:
                categories.append("SPAM")

    risk = min(100, risk)
    return ModerationResponse(
        flagged=risk >= 60,
        risk_score=risk,
        categories=categories,
        explanation="Analyse locale — mots-clés suspects détectés." if risk > 0 else "Contenu apparemment légitime.",
        confidence="LOW"
    )


def _local_fallback_annonce(request: AnnonceModerationRequest) -> ModerationResponse:
    """Rule-based fallback for annonce fraud detection."""
    risk = 0
    categories = []
    combined = f"{request.titre} {request.description}".lower()

    if request.prix < 50:
        risk += 60
        categories.append("FRAUD")
    if request.prix > 10000:
        risk += 15
        categories.append("MISLEADING")
    if request.user_annonce_count > 5:
        risk += 20
        categories.append("SPAM")

    fraud_signals = ["western union", "crypto", "virement avant", "whatsapp", "gratuit", "http"]
    for sig in fraud_signals:
        if sig in combined:
            risk += 25
            if "SCAM" not in categories:
                categories.append("SCAM")

    if len((request.description or "").strip()) < 30:
        risk += 20
        if "SPAM" not in categories:
            categories.append("SPAM")

    desc = request.description or ""
    if len(desc) > 20 and sum(1 for c in desc if c.isupper()) / len(desc) > 0.5:
        risk += 15
        if "SPAM" not in categories:
            categories.append("SPAM")
            
    if len((request.titre or "").strip()) < 10:
        risk += 15
        if "SPAM" not in categories:
            categories.append("SPAM")

    risk = min(100, risk)
    return ModerationResponse(
        flagged=risk >= 60,
        risk_score=risk,
        categories=categories,
        explanation="Analyse locale — signaux de fraude détectés." if risk >= 40 else "Annonce apparemment légitime.",
        confidence="LOW"
    )
