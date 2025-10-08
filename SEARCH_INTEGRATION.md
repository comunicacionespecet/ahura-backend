# Integración del Buscador IA

Este documento explica la integración del sistema de búsqueda semántica con IA en el proyecto NestJS.

## 🎯 Características

- **Búsqueda semántica** usando embeddings y Elasticsearch
- **Extracción de texto** de PDF y DOCX
- **Almacenamiento en S3** (reemplaza Azure Blob Storage)
- **Indexación automática** de documentos
- **API RESTful** para búsqueda y gestión de documentos

## 📦 Componentes Integrados

### 1. **SearchModule** ([src/search/](src/search/))
Módulo principal que integra todos los servicios de búsqueda.

### 2. **Servicios Principales**

- **ElasticsearchConfig**: Configuración y conexión a Elasticsearch
- **TextExtractionService**: Extrae texto de PDF y DOCX
- **EmbeddingService**: Genera embeddings usando servicio Python
- **DocumentIndexingService**: Indexa documentos en Elasticsearch
- **SemanticSearchService**: Realiza búsquedas semánticas
- **DocumentStorageService**: Maneja almacenamiento en S3

## 🚀 Configuración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ES_INDEX=documents

# Embedding Service (Python)
EMBEDDING_API_URL=http://localhost:8001/generate-embedding
```

### 2. Iniciar Elasticsearch

Con Docker:
```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

### 3. Iniciar Servicio de Embeddings (Python)

```bash
# Instalar dependencias
cd Backia
pip install -r requirements.txt

# Iniciar servicio
python api/embedding_service.py
```

El servicio correrá en `http://localhost:8001`

### 4. Iniciar Aplicación NestJS

```bash
npm run start:dev
```

## 📡 Endpoints API

### POST /search/upload
Sube y indexa un documento.

**Request:**
```bash
curl -X POST http://localhost:3000/search/upload \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "id": "uuid",
  "filename": "document.pdf",
  "s3_key": "documents/uuid-document.pdf",
  "text_preview": "Extracted text preview..."
}
```

### POST /search/upload-link
Sube documento desde URL y lo indexa.

**Request:**
```json
POST /search/upload-link
{
  "url": "https://example.com/document.pdf"
}
```

### POST /search
Busca documentos por similitud semántica.

**Request:**
```json
POST /search
{
  "query": "¿Cómo funciona la autenticación?",
  "top_k": 10
}
```

**Response:**
```json
{
  "query": "¿Cómo funciona la autenticación?",
  "results": [
    {
      "id": "doc-id",
      "text": "Document text...",
      "metadata": {
        "filename": "auth-guide.pdf",
        "s3_key": "documents/..."
      },
      "score": 1.85
    }
  ]
}
```

### GET /search/preview/:id
Obtiene vista previa de un documento.

**Response:**
```json
{
  "id": "doc-id",
  "text": "Full document text",
  "metadata": {...},
  "preview_url": "https://s3.amazonaws.com/..."
}
```

### GET /search/dashboard
Estadísticas del sistema.

**Response:**
```json
{
  "total": 150,
  "latest": [
    {
      "id": "doc-id",
      "filename": "document.pdf",
      "uploaded_at": "2025-01-07T..."
    }
  ]
}
```

## 🔄 Flujo de Trabajo

1. **Upload**: El usuario sube un documento (PDF/DOCX)
2. **Extract**: Se extrae el texto del documento
3. **Store**: El documento se guarda en S3
4. **Embed**: Se genera un embedding del texto usando el servicio Python
5. **Index**: El documento se indexa en Elasticsearch con su embedding
6. **Search**: Los usuarios pueden buscar usando lenguaje natural

## 🔧 Arquitectura

```
┌─────────────┐
│   NestJS    │
│   Backend   │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
   ┌───▼────┐      ┌─────▼─────┐
   │   S3   │      │ Python    │
   │ Storage│      │ Embedding │
   └────────┘      │ Service   │
                   └─────┬─────┘
                         │
                   ┌─────▼──────┐
                   │Elasticsearch│
                   └────────────┘
```

## 📝 Diferencias con el Código Original (Backia)

### Azure → S3
- ❌ `AzureBlobService` → ✅ `DocumentStorageService` usando S3
- ❌ Azure Blob Storage → ✅ AWS S3 con presigned URLs

### Python FastAPI → NestJS
- ❌ FastAPI endpoints → ✅ NestJS controllers
- ✅ Servicio Python solo para embeddings (microservicio)
- ✅ Lógica de negocio en TypeScript/NestJS

### Mejoras Adicionales
- ✅ Tipos TypeScript completos
- ✅ Validación con class-validator
- ✅ Documentación Swagger automática
- ✅ Integración con sistema de usuarios existente
- ✅ Manejo de errores robusto

## 🧪 Testing

```bash
# Verificar servicio de embeddings
curl http://localhost:8001/health

# Verificar Elasticsearch
curl http://localhost:9200

# Test upload
curl -X POST http://localhost:3000/search/upload \
  -F "file=@test.pdf"

# Test search
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "búsqueda de prueba"}'
```

## 🔐 Seguridad

- Los documentos en S3 son privados por defecto
- URLs de preview/download son presigned (expiran en 15 min)
- Se recomienda agregar autenticación JWT a los endpoints
- Elasticsearch debe estar protegido en producción

## 📚 Próximos Pasos

1. Agregar autenticación a endpoints de búsqueda
2. Implementar permisos por documento
3. Agregar soporte para más formatos (imágenes con OCR)
4. Implementar cache de embeddings
5. Agregar métricas y logging avanzado
