import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

# Conexión a ElasticSearch
es = Elasticsearch(os.getenv("ELASTICSEARCH_URL", "http://localhost:9200"))
INDEX_NAME = os.getenv("ES_INDEX", "documents")

def index_document(doc_id: str, text: str, embedding: list, metadata: dict):
    """
    Indexa un documento en ElasticSearch con su embedding y metadata.
    """
    body = {
        "text": text,
        "embedding": embedding,
        "metadata": metadata
    }
    es.index(index=INDEX_NAME, id=doc_id, body=body)


def get_document_by_id(doc_id: str):
    """
    Recupera un documento completo por su ID.
    """
    return es.get(index=INDEX_NAME, id=doc_id)


if __name__ == "__main__":
    try:
        # Verificar conexión a Elasticsearch
        if es.ping():
            print("Conexión exitosa a Elasticsearch")
        else:
            print("Error al conectar con Elasticsearch")
            exit(1)

        # Verificar si el índice existe
        if es.indices.exists(index=INDEX_NAME):
            print(f"El índice '{INDEX_NAME}' ya existe.")
        else:
            print(f"El índice '{INDEX_NAME}' no existe. Creándolo...")
            es.indices.create(index=INDEX_NAME)
            print(f"Índice '{INDEX_NAME}' creado con éxito.")

    except Exception as e:
        print(f"Error al conectar o configurar Elasticsearch: {e}")