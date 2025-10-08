import os
#import openai
#from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Cargar variables de entorno desde el archivo .env
#load_dotenv()

# Configurar la clave de API de OpenAI
#api_key = os.getenv("OPENAI_API_KEY")
#if not api_key:
#    raise ValueError("La clave de API de OpenAI no está configurada.")
#openai.api_key = api_key

model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

def generate_embedding(text: str) -> list:
    """
    Genera un embedding para el texto dado usando un modelo local de Hugging Face.
    """
    try:
        embedding = model.encode(text).tolist()
        return embedding
    except Exception as e:
        print(f"Error inesperado: {e}")
        raise

# Ejemplo de uso
if __name__ == "__main__":
    texto = "Hola, ¿cómo estás?"
    vector = generate_embedding(texto)

    if vector:
        print(f"Embedding generado con éxito ({len(vector)} dimensiones):\n")
        print(vector)