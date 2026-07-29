import sys
sys.path.append('.')
from local_fraud_detector import LocalFraudDetector

class MockRequest:
    def __init__(self):
        self.titre = "ok noromale house"
        self.description = "oklod"
        self.prix = 10.0
        self.localisation = "Tunis"
        self.user_annonce_count = 1
        self.images = [] # Let's test without images first

req = MockRequest()
res = LocalFraudDetector.moderate_annonce(req)
print("Result without images:", res)
