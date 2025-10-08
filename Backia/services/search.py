import os
from elastic.config import create_index, get_es_client
from dotenv import load_dotenv

load_dotenv()

# Conexión compartida
es = get_es_client()

INDEX_NAME = os.getenv("ES_INDEX", "documents")
create_index(INDEX_NAME)

def search(query_embedding: list, top_k: int = 10) -> list:
    """
    Realiza búsqueda semántica usando cosineSimilarity sobre el campo 'embedding'.
    Devuelve lista de resultados con id, texto y metadata.
    """
    script_query = {
        "script_score": {
            "query": { "match_all": {} },
            "script": {
                # ElasticSearch debe tener support para "cosineSimilarity"
                "source": "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                "params": {"query_vector": query_embedding}
            }
        }
    }
    resp = es.search(
        index=INDEX_NAME,
        body={
            "size": top_k,
            "query": script_query,
            "_source": ["text", "metadata"]
        }
    )
    hits = resp["hits"]["hits"]
    return [{"id": hit["_id"], **hit["_source"]} for hit in hits]