
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "text_toxicity_model.joblib"

app = FastAPI(title="ModerAI ML Service", version="1.0.0")

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Trained model not found: {MODEL_PATH}")

saved_model = joblib.load(MODEL_PATH)
model = saved_model["model"]
labels = saved_model["labels"]


class TextRequest(BaseModel):
    text: str = Field(min_length=1, max_length=20000)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ModerAI ML Service",
        "model_loaded": True,
        "labels": labels,
        "model_type": "TF-IDF + One-vs-Rest Logistic Regression",
    }


@app.post("/predict/text")
def predict_text(request: TextRequest):
    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text must not be empty.",
        )

    probabilities = model.predict_proba([text])[0]
    scores = {
        label: round(float(score), 6)
        for label, score in zip(labels, probabilities)
    }

    return {
        "text": text,
        "scores": scores,
        "model": "TF-IDF + One-vs-Rest Logistic Regression",
        "label_order": labels,
        "score_type": "raw model score",
    }
