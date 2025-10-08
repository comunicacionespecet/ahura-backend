import os
from elasticsearch import Elasticsearch
from dotenv import load_dotenv

load_dotenv()

def get_es_client() -> Elasticsearch:
    url = os.getenv("ELASTICSEARCH_URL", "http://localhost:9200")
    return Elasticsearch(url)

def create_index(index_name: str, dims: int = 384):
    """
    Crea un índice en Elasticsearch con un campo 'embedding' configurado como dense_vector.
    """
    es = get_es_client()
    mapping = {
        "mappings": {
            "properties": {
                "embedding": {
                    "type": "dense_vector",
                    "dims": dims
                },
                "metadata": {
                    "properties": {
                        "filename": {
                            "type": "text",
                            "fields": {
                                "keyword": {
                                    "type": "keyword",
                                    "ignore_above": 256
                                }
                            }
                        }
                    }
                },
                "text": {
                    "type": "text",
                    "fields": {
                        "keyword": {
                            "type": "keyword",
                            "ignore_above": 256
                        }
                    }
                }
            }
        }
    }

    if not es.indices.exists(index=index_name):
        es.indices.create(index=index_name, **mapping)
        print(f"Índice '{index_name}' creado con éxito.")
    else:
        print(f"El índice '{index_name}' ya existe.")