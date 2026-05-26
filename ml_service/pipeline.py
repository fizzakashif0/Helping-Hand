import re
from detoxify import Detoxify
from transformers import pipeline

# Load models ONCE at module level
detoxify_model = Detoxify('multilingual')
sentiment_pipeline = pipeline(
    'sentiment-analysis',
    model='cardiffnlp/twitter-xlm-roberta-base-sentiment'
)


def is_spam(text):
    """
    Reject if:
    - fewer than 4 words
    - all caps
    - contains URL
    - fewer than 3 unique words
    """
    if not text:
        return True
    
    words = text.split()
    
    # Check word count
    if len(words) < 4:
        return True
    
    # Check if all caps
    if text.isupper() and len(text) > 3:
        return True
    
    # Check for URLs
    url_pattern = r'https?://|www\.'
    if re.search(url_pattern, text):
        return True
    
    # Check unique word count
    unique_words = len(set(words))
    if unique_words < 3:
        return True
    
    return False


def is_toxic(text):
    """
    Run Detoxify.
    Return (True, score) + max score if any score > 0.6, else (False, 0)
    """
    if not text:
        return False, 0.0
    
    results = detoxify_model.predict(text)
    
    # results is a dict with keys like 'toxicity', 'severe_toxicity', etc.
    max_score = max(results.values())
    
    if max_score > 0.6:
        return True, max_score
    
    return False, max_score


def get_sentiment(text):
    """
    Run sentiment model.
    Map to stars:
      POSITIVE >= 0.7 → 5, POSITIVE >= 0.4 → 4
      NEUTRAL → 3
      NEGATIVE >= 0.4 → 2, NEGATIVE >= 0.7 → 1
    
    Returns: (stars: int, label: str)
    """
    if not text:
        return 3, "NEUTRAL"
    
    result = sentiment_pipeline(text)[0]
    label = result['label']
    score = result['score']
    
    if label == "POSITIVE":
        if score >= 0.7:
            return 5, label
        elif score >= 0.4:
            return 4, label
        else:
            return 3, "NEUTRAL"
    elif label == "NEGATIVE":
        if score >= 0.7:
            return 1, label
        elif score >= 0.4:
            return 2, label
        else:
            return 3, "NEUTRAL"
    else:  # NEUTRAL
        return 3, label
