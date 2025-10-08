# api/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
import uuid
import os
import requests
from dotenv import load_dotenv

from scripts.extract_text import extract_text_from_file
from scripts.generate_embedding import generate_embedding
from scripts.index_to_elastic import index_document, get_document_by_id
from services.search import search as es_search
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from models.search_request import SearchRequest, LinkRequest


# Cargar variables de entorno
load_dotenv()


app = FastAPI()

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.post("/embedding/link")
async def upload_link(request: LinkRequest):
    try:
        # Descargar el archivo desde el link
        url_str = str(request.url)
        response = requests.get(url_str)
        response.raise_for_status()
        filename = url_str.split("/")[-1]
        print(f"Descargando {filename} desde {url_str}")
        contents = response.content
        # Extracción de texto
        text = extract_text_from_file(filename, contents)
        # Generación de embedding
        embedding = generate_embedding(text)
        # Indexado en ElasticSearch
        doc_id = str(uuid.uuid4())
        metadata = {"filename": filename, "source_url": str(request.url)}
        index_document(doc_id, text, embedding, metadata)
        return {"id": doc_id, "text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search")
async def search_documents(request: SearchRequest):
    try:
        embedding = generate_embedding(request.query)
        results = es_search(embedding)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/preview/{doc_id}")
async def preview_document(doc_id: str):
    try:
        res = get_document_by_id(doc_id)
        source = res.get("_source", {})
        return {"id": doc_id, "text": source.get("text"), "metadata": source.get("metadata")}
    except Exception:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
from azure_blob.blob_service import AzureBlobService  # Agrega este import

@app.get("/dashboard")
async def blobs_summary():
    try:
        service = AzureBlobService()
        total = service.count_blobs()
        latest = service.get_latest_blobs()
        latest_serialized = [
            {"name": blob.name, "last_modified": blob.last_modified.isoformat()}
            for blob in latest
        ]
        return {"total": total, "latest": latest_serialized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
