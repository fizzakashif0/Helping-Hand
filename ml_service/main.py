from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pipeline import is_spam, is_toxic, get_sentiment

app = FastAPI()


class ReviewInput(BaseModel):
    text: str


class ReviewOutput(BaseModel):
    status: str  # 'accepted' or 'rejected'
    stars: int = None
    sentiment: str = None
    toxScore: float = None
    rejectReason: str = None


@app.post("/analyze", response_model=ReviewOutput)
async def analyze_review(input_data: ReviewInput):
    """
    Analyze a review text for spam, toxicity, and sentiment.
    
    Process order:
    1. Check for spam → reject if spam
    2. Check for toxicity → reject if toxic
    3. Get sentiment and map to stars
    
    Returns: ReviewOutput with status (accepted/rejected), stars, sentiment, toxScore, rejectReason
    """
    text = input_data.text
    
    # 1. Check for spam
    if is_spam(text):
        return ReviewOutput(
            status="rejected",
            rejectReason="Review appears to be spam"
        )
    
    # 2. Check for toxicity
    is_toxic_result, tox_score = is_toxic(text)
    if is_toxic_result:
        return ReviewOutput(
            status="rejected",
            toxScore=tox_score,
            rejectReason="Review contains toxic or offensive content"
        )
    
    # 3. Get sentiment
    stars, sentiment_label = get_sentiment(text)
    
    return ReviewOutput(
        status="accepted",
        stars=stars,
        sentiment=sentiment_label,
        toxScore=tox_score if tox_score else 0.0
    )


@app.get("/health")
async def health_check():
    return {"status": "ok"}
