# 🚀 Inicio Rápido - Buscador IA

## Opción 1: Docker Compose (Recomendado)

### 1. Iniciar todos los servicios

```bash
# Iniciar Elasticsearch y MongoDB
docker-compose -f docker-compose.search.yml up -d

# Esperar a que Elasticsearch esté listo (30 segundos aprox)
sleep 30

# Verificar que todo esté corriendo
docker-compose -f docker-compose.search.yml ps
```

### 2. Iniciar servicio de embeddings

```bash
# Opción A: Con Docker (incluido en docker-compose)
# Ya está corriendo si usaste docker-compose.search.yml

# Opción B: Localmente con Python
./start-embedding-service.sh
```

### 3. Iniciar NestJS

```bash
# Configurar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de AWS S3
# ELASTICSEARCH_URL ya está configurado para Docker

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run start:dev
```

### 4. Probar la integración

```bash
# Verificar servicios
curl http://localhost:9200                    # Elasticsearch
curl http://localhost:8001/health             # Embedding service
curl http://localhost:3000/search/dashboard   # NestJS

# Swagger UI
open http://localhost:3000/docs
```

## Opción 2: Servicios Individuales

### 1. Elasticsearch

```bash
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

### 2. MongoDB (si no usas Atlas)

```bash
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  mongo:latest
```

### 3. Servicio de Embeddings

```bash
cd Backia
pip install -r requirements.txt
python api/embedding_service.py
```

### 4. NestJS

```bash
cp .env.example .env
# Editar .env con tus credenciales
npm install
npm run start:dev
```

## 🧪 Pruebas

### 1. Subir un documento

```bash
curl -X POST http://localhost:3000/search/upload \
  -F "file=@test.pdf"
```

### 2. Buscar

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "tu búsqueda aquí",
    "top_k": 5
  }'
```

### 3. Ver dashboard

```bash
curl http://localhost:3000/search/dashboard
```

## 🛑 Detener todo

```bash
# Detener Docker Compose
docker-compose -f docker-compose.search.yml down

# O detener servicios individuales
docker stop elasticsearch mongodb embedding-service
docker rm elasticsearch mongodb embedding-service
```

## 📝 Variables de Entorno Requeridas

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ahura

# AWS S3
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_S3_BUCKET=tu-bucket

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ES_INDEX=documents

# Embedding Service
EMBEDDING_API_URL=http://localhost:8001/generate-embedding
```

## ❓ Troubleshooting

### Elasticsearch no inicia
```bash
# Aumentar memoria virtual (Linux/macOS)
sudo sysctl -w vm.max_map_count=262144

# Windows WSL2
wsl -d docker-desktop sysctl -w vm.max_map_count=262144
```

### Puerto 9200 ya en uso
```bash
# Ver qué proceso usa el puerto
lsof -i :9200

# Cambiar puerto de Elasticsearch en docker-compose
# y actualizar ELASTICSEARCH_URL en .env
```

### Embedding service falla
```bash
# Instalar dependencias manualmente
pip install sentence-transformers fastapi uvicorn

# Verificar Python version >= 3.8
python --version
```

## 📚 Documentación Completa

- [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) - Resumen completo de la integración
- [SEARCH_INTEGRATION.md](SEARCH_INTEGRATION.md) - Guía detallada de búsqueda
- [README.md](README.md) - Documentación principal del proyecto
