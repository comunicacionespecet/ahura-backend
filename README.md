# 🚀 AHURA API

Sistema de gestión de activos de conocimiento empresarial construido con NestJS.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Descripción

AHURA es una API RESTful para la gestión integral de activos de conocimiento empresarial. Permite crear, organizar, buscar y gestionar documentos, procedimientos y conocimientos de la organización con un sistema robusto de autenticación, roles y auditoría.

### ✨ Características Principales

- 🔐 **Autenticación JWT** con roles (usuario, administrador, super_administrador)
- 📚 **Gestión de activos** de conocimiento con filtros avanzados
- 💬 **Sistema de comentarios** con control de autorización
- 📊 **Logs de auditoría** para seguimiento de actividades
- 📁 **Subida de archivos** con almacenamiento en AWS S3
- 🏷️ **Catálogos dinámicos** para clasificación de contenido
- 🔍 **Búsquedas avanzadas** con paginación y filtros anidados
- 🤖 **Búsqueda semántica con IA** usando embeddings y Elasticsearch
- 📄 **Extracción de texto** de PDF y DOCX automática
- 📖 **Documentación Swagger** completa e interactiva

## 🛠️ Tecnologías

- **Framework**: NestJS 11.x
- **Base de Datos**: MongoDB con Mongoose
- **Búsqueda**: Elasticsearch + Sentence Transformers
- **Autenticación**: JWT + Passport
- **Documentación**: Swagger/OpenAPI
- **Validación**: Class Validator + Class Transformer
- **Almacenamiento**: AWS S3
- **IA/ML**: Python FastAPI (embeddings service)
- **Testing**: Jest
- **Linting**: ESLint + Prettier

## ⚙️ Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.x
- MongoDB >= 5.x
- AWS S3 Bucket (para archivos)
- Elasticsearch >= 8.x (para búsqueda semántica)
- Python >= 3.8 (para servicio de embeddings)

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd ahura
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con todas las configuraciones sensibles:

> ⚠️ **Importante**: Todas las credenciales de base de datos y configuraciones sensibles se manejan a través de variables de entorno para mayor seguridad. Nunca commitar credenciales reales al repositorio.

```env
# Base de Datos
MONGODB_URI=mongodb://localhost:27017/ahura

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h

# API Key
API_KEY=tu_api_key_secreta

# AWS S3 (Opcional)
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=tu-bucket-name

# Email (Para reset de contraseña)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password

# Puerto de la aplicación
PORT=3000
```

### 4. Iniciar Servicios Necesarios

#### MongoDB
```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O usar MongoDB Atlas (recomendado para producción)
```

#### Elasticsearch (para búsqueda semántica)
```bash
# Con Docker
docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0
```

#### Servicio de Embeddings (Python)
```bash
# Instalar dependencias Python
cd Backia
pip install -r requirements.txt

# Iniciar servicio
python api/embedding_service.py

# O usar el script de inicio
chmod +x start-embedding-service.sh
./start-embedding-service.sh
```

## 🚀 Ejecución

### Desarrollo

```bash
# Modo desarrollo con hot reload
npm run start:dev

# Modo debug
npm run start:debug
```

### Producción

```bash
# Construir la aplicación
npm run build

# Ejecutar en producción
npm run start:prod
```

### Scripts Disponibles

```bash
npm run build          # Compilar TypeScript
npm run start          # Iniciar aplicación
npm run start:dev      # Desarrollo con hot reload
npm run start:prod     # Modo producción
npm run lint           # Linting con ESLint
npm run format         # Formatear código con Prettier
npm run test           # Ejecutar tests unitarios
npm run test:e2e       # Tests end-to-end
npm run test:cov       # Coverage de tests
```

## 📖 Documentación de la API

### Swagger UI

Una vez iniciada la aplicación, la documentación interactiva estará disponible en:

- **Swagger UI**: `http://localhost:3000/docs`
- **JSON Schema**: `http://localhost:3000/swagger/json`

### 🔐 Autenticación

La API utiliza dos métodos de autenticación:

#### 1. JWT Bearer Token
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API Key (Para servicios externos)
```bash
X-API-Key: tu_api_key_secreta
```

### 📋 Endpoints Principales

#### Autenticación
- `POST /auth/login` - Login con email y contraseña
- `POST /auth/password-reset/request` - Solicitar reset de contraseña
- `POST /auth/password-reset/confirm` - Confirmar reset de contraseña

#### Activos de Conocimiento
- `GET /assets` - Obtener activos (público, con filtros avanzados)
- `GET /assets/:id` - Obtener activo por ID (público)
- `POST /assets` - Crear activo (requiere auth)
- `PUT /assets/:id` - Actualizar activo (requiere auth)
- `DELETE /assets/:id` - Eliminar activo (requiere auth)

#### Comentarios
- `GET /comments` - Obtener comentarios con filtros
- `GET /comments/:id` - Obtener comentario por ID
- `POST /comments` - Crear comentario
- `PATCH /comments/:id/:authorId` - Actualizar comentario (solo autor)
- `DELETE /comments/:id/:authorId` - Eliminar comentario (solo autor/admin)

#### Usuarios
- `POST /users` - Crear usuario (público)
- `GET /users` - Obtener usuarios (solo super_admin)
- `GET /users/:id` - Obtener usuario por ID
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

#### Archivos
- `POST /upload` - Subir archivo
- `GET /upload/download?key=...` - Obtener URL de descarga
- `GET /upload/preview?key=...` - Obtener URL de vista previa

#### Catálogos
- `GET /catalogs` - Obtener todos los catálogos
- `GET /catalogs/:slug` - Obtener catálogo por slug
- `POST /catalogs` - Crear catálogo
- `PATCH /catalogs/:slug` - Actualizar catálogo
- `DELETE /catalogs/:slug` - Eliminar catálogo

#### Logs de Auditoría
- `GET /loggers` - Obtener logs (solo super_admin)
- `POST /loggers` - Crear log de auditoría
- `GET /loggers/:id` - Obtener log por ID

#### Búsqueda Semántica con IA 🤖
- `POST /search/upload` - Subir y indexar documento (PDF/DOCX)
- `POST /search/upload-link` - Indexar documento desde URL
- `POST /search` - Búsqueda semántica por similitud
- `GET /search/preview/:id` - Obtener preview de documento
- `GET /search/dashboard` - Estadísticas de búsqueda

> 📚 Para más detalles sobre la búsqueda semántica, ver [SEARCH_INTEGRATION.md](SEARCH_INTEGRATION.md)

## 🔍 Ejemplos de Uso

### Autenticarse y Obtener Token

```bash
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@empresa.com",
    "password": "password123"
  }'
```

### Buscar Activos con Filtros

```bash
# Búsqueda pública sin autenticación
curl -X GET "http://localhost:3000/assets?q=API&title=Manual&page=1&limit=10"

# Búsqueda avanzada con filtros anidados
curl -X GET "http://localhost:3000/assets?legalAny=copyright&confidentiality=true&sort=-publishDate"
```

### Crear un Nuevo Activo

```bash
curl -X POST "http://localhost:3000/assets" \
  -H "Authorization: Bearer tu_jwt_token" \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ASSET-001",
    "title": "Manual de API REST",
    "description": "Guía completa para usar la API",
    "knowledgeType": "Documentación técnica",
    "publishDate": "2024-01-15T10:00:00Z",
    "origin": "Interno",
    "ownerId": "USER-123",
    "availability": {
      "accessibility": true,
      "location": "Repositorio central"
    },
    "classificationLevel": {
      "level": "Público"
    },
    "keywords": ["API", "REST", "documentación"],
    "viewCount": 0,
    "downloadCount": 0,
    "commentCount": 0
  }'
```

### Obtener Comentarios de un Activo

```bash
curl -X GET "http://localhost:3000/comments?assetId=ASSET-001&userName=Juan" \
  -H "Authorization: Bearer tu_jwt_token"
```

### Búsqueda Semántica con IA

```bash
# Subir y indexar un documento
curl -X POST "http://localhost:3000/search/upload" \
  -H "Authorization: Bearer tu_jwt_token" \
  -F "file=@manual.pdf"

# Buscar usando lenguaje natural
curl -X POST "http://localhost:3000/search" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "¿Cómo configurar la autenticación JWT?",
    "top_k": 5
  }'
```

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm run test

# Tests con watch mode
npm run test:watch

# Coverage report
npm run test:cov

# Tests end-to-end
npm run test:e2e
```

## 🏗️ Estructura del Proyecto

```
src/
├── app.controller.ts          # Controlador principal
├── app.module.ts             # Módulo principal
├── main.ts                   # Punto de entrada
│
├── auth/                     # Módulo de autenticación
│   ├── controllers/         # Controladores de auth
│   ├── guards/             # Guards de seguridad
│   ├── strategies/         # Estrategias de Passport
│   └── services/           # Servicios de autenticación
│
├── assets/                   # Módulo de activos
│   ├── dto/                # DTOs y validaciones
│   ├── schemas/            # Schemas de MongoDB
│   ├── asset.controller.ts # Controlador de activos
│   └── asset.service.ts    # Lógica de negocio
│
├── search/                  # 🤖 Módulo de búsqueda IA
│   ├── dto/                # DTOs de búsqueda
│   ├── elasticsearch.config.ts     # Config de Elasticsearch
│   ├── text-extraction.service.ts  # Extracción de texto
│   ├── embedding.service.ts        # Generación de embeddings
│   ├── document-indexing.service.ts # Indexación
│   ├── semantic-search.service.ts  # Búsqueda semántica
│   ├── document-storage.service.ts # Almacenamiento S3
│   └── search.controller.ts        # Controlador de búsqueda
│
├── comments/                 # Módulo de comentarios
├── users/                   # Módulo de usuarios
├── upload/                  # Módulo de archivos
├── catalogs/                # Módulo de catálogos
├── loggers/                 # Módulo de auditoría
│
└── common/                  # Recursos compartidos
    └── dto/                # DTOs comunes (errores, respuestas)

Backia/                      # 🐍 Servicio Python de embeddings
├── api/
│   └── embedding_service.py # Servicio FastAPI para embeddings
└── requirements.txt         # Dependencias Python
```

## 🚀 Despliegue

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

```bash
# Construir imagen
docker build -t ahura-api .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env ahura-api
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - MONGODB_URI=mongodb://mongo:27017/ahura
    depends_on:
      - mongo
  
  mongo:
    image: mongo:latest
    ports:
      - '27017:27017'
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

### Variables de Entorno para Producción

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ahura
JWT_SECRET=super_secret_jwt_key_production
API_KEY=production_api_key
AWS_ACCESS_KEY_ID=prod_access_key
AWS_SECRET_ACCESS_KEY=prod_secret_key
```

## 🔒 Seguridad

- **Validación de datos** con class-validator
- **Sanitización** automática de inputs
- **Rate limiting** configurado
- **CORS** habilitado
- **JWT** con expiración configurable
- **Bcrypt** para hash de contraseñas
- **Guards** para control de acceso por roles
- **Variables de entorno** para credenciales de base de datos y configuraciones sensibles

## 📚 Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com)
- [Mongoose ODM](https://mongoosejs.com)
- [Swagger/OpenAPI](https://swagger.io)
- [JWT.io](https://jwt.io)

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es privado y propietario.

## 👥 Equipo

- **Desarrollo**: Equipo AHURA
- **Framework**: [NestJS](https://nestjs.com)

---

Para más información o soporte, contacta al equipo de desarrollo. 🚀