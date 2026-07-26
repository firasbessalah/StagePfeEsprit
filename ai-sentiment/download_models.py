import sys
sys.path.append('.')
from local_fraud_detector import load_ai_models

print("Pre-downloading AI models to cache...")
load_ai_models()
print("Done! Models are cached.")
