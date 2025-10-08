import os
from dotenv import load_dotenv

load_dotenv()

# Obtiene la cadena de conexión desde una variable de entorno
AZURE_STORAGE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

# Nombre del contenedor principal
AZURE_STORAGE_CONTAINER = os.getenv("AZURE_STORAGE_CONTAINER", "default-container")