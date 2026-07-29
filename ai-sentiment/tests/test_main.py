import pytest
from main import _local_fallback_sentiment, _local_fallback_annonce, AnnonceModerationRequest

def test_local_fallback_sentiment_positive():
    result = _local_fallback_sentiment("C'est vraiment un super appartement, très propre et parfait.")
    assert result.sentiment == "POSITIF"

def test_local_fallback_sentiment_negative():
    result = _local_fallback_sentiment("C'est nul et très sale, c'est une catastrophe, très mauvais.")
    assert result.sentiment == "NEGATIF"

def test_local_fallback_sentiment_neutral():
    result = _local_fallback_sentiment("Je suis allé à la maison.")
    assert result.sentiment == "NEUTRE"

def test_local_fallback_annonce_scam_keywords():
    request = AnnonceModerationRequest(
        titre="Appartement à louer",
        description="Contactez moi sur whatsapp only et payez par western union.",
        prix=500.0,
        localisation="Tunis",
        user_annonce_count=1,
        images=[],
        surface=50.0,
        account_age_days=10,
        user_verified=False
    )
    result = _local_fallback_annonce(request)
    assert result.flagged == True
    assert "SCAM" in result.categories

def test_local_fallback_annonce_suspicious_pricing_low():
    request = AnnonceModerationRequest(
        titre="Super villa avec piscine",
        description="Une très belle villa avec une grande piscine et jardin.",
        prix=20.0,  # Below 50 is flagged as FRAUD
        localisation="Sousse",
        user_annonce_count=1,
        images=[],
        surface=200.0,
        account_age_days=30,
        user_verified=True
    )
    result = _local_fallback_annonce(request)
    assert result.flagged == True
    assert "FRAUD" in result.categories

def test_local_fallback_annonce_legitimate():
    request = AnnonceModerationRequest(
        titre="Appartement s+2 propre",
        description="Je loue un bel appartement s+2 à Tunis centre ville, très bien situé et proche de toutes les commodités.",
        prix=800.0,
        localisation="Tunis",
        user_annonce_count=1,
        images=[],
        surface=80.0,
        account_age_days=100,
        user_verified=True
    )
    result = _local_fallback_annonce(request)
    assert result.flagged == False
    assert result.risk_score < 60
