# Backend para Extracción de Texto con FastAPI

Este proyecto es un backend desarrollado con FastAPI que permite la extracción de texto desde archivos PDF, DOCX e imágenes (PNG, JPG, JPEG). Es ideal para integraciones con aplicaciones que requieren procesamiento de documentos y análisis de texto.

## 🚀 Características

- **Extracción de texto** desde archivos PDF, DOCX e imágenes.
- **API RESTful** basada en FastAPI.
- **Extensible** con soporte opcional para búsqueda semántica y embeddings.
- **Configuración sencilla** mediante un archivo `.env`.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Python 3.12.1 o superior**
- **pip 25.0.1 o superior** 
- Opcional: **virtualenv** para entornos virtuales

---

## 🛠️ Instalación y Configuración

Sigue estos pasos para configurar y ejecutar el proyecto:

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Jonathand77/pecet
cd pecet/backend
```

### 2. Crear y Activar un Entorno Virtual

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

### 3. Instalar Dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar Variables de Entorno

Crea un archivo .env en la raíz del proyecto con el siguiente contenido:

```bash
OPENAI_API_KEY=sk-xxxx
```

Esto es necesario si planeas usar funcionalidades que dependan de OpenAI.

## 🗂️ Estructura del Proyecto

```bash
backend/
│
├── api/
│   └── [main.py](http://_vscodecontentref_/0)          ← Archivo principal de FastAPI
│
├── data/
│   └── assets/          ← Carpeta para almacenar archivos subidos
│
├── scripts/
│   ├── extract_text.py  ← Funciones para extraer texto de archivos
│   ├── generate_embedding.py
│   └── index_to_elastic.py
│
├── services/
│   └── search.py        ← Funciones para búsqueda semántica
│
├── .env                 ← Variables de entorno
└── requirements.txt     ← Dependencias del proyecto
```

## 🏃‍♂️ Ejecución del Proyecto

### 1. Iniciar el servidor

Ejecuta el siguiente comando para iniciar el servidor de desarrollo:

```bash
uvicorn api.main:app --reload
```

### 1. Acceder a la API

- Documentación interactiva: http://127.0.0.1:8000/docs
- Documentación alternativa: http://127.0.0.1:8000/redoc