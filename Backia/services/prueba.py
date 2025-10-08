from openai import OpenAI
import os
from dotenv import load_dotenv


# Cargar variables de entorno desde el archivo .env
load_dotenv()
# Inicializar el cliente de OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Listar los modelos disponibles
models = client.models.list()
print([model.id for model in models.data])

