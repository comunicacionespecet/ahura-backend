from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


class TextRequest(BaseModel):
    text: str


@app.post("/generate-embedding")
async def generate_embedding(request: TextRequest):
    """Generate embedding for the given text"""
    try:
        embedding = model.encode(request.text).tolist()
        return {"embedding": embedding, "dimensions": len(embedding)}
    except Exception as e:
        return {"error": str(e)}, 500


@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "all-MiniLM-L6-v2"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
