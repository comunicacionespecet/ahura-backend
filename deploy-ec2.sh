#!/bin/bash

# Script de despliegue para EC2
# Uso: ./deploy-ec2.sh

set -e  # Exit on error

echo "🚀 Iniciando despliegue de Ahura Backend con búsqueda IA..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# 1. Actualizar código
echo "📥 Actualizando código desde Git..."
git pull origin search || {
    print_error "Error al hacer pull del repositorio"
    exit 1
}
print_status "Código actualizado"
echo ""

# 2. Instalar dependencias Node.js
echo "📦 Instalando dependencias de Node.js..."
npm install || {
    print_error "Error al instalar dependencias de Node.js"
    exit 1
}
print_status "Dependencias de Node.js instaladas"
echo ""

# 3. Instalar dependencias Python
echo "🐍 Instalando dependencias de Python..."
cd Backia
pip3 install -r requirements.txt --quiet || {
    print_warning "Advertencia: Algunas dependencias de Python pueden haber fallado"
}
cd ..
print_status "Dependencias de Python instaladas"
echo ""

# 4. Verificar servicios Docker
echo "🐳 Verificando servicios Docker..."

# Verificar si Elasticsearch está corriendo
if docker ps | grep -q elasticsearch; then
    print_status "Elasticsearch está corriendo"
else
    print_warning "Elasticsearch no está corriendo. Iniciando..."
    docker run -d \
      --name elasticsearch \
      --restart unless-stopped \
      -p 9200:9200 \
      -p 9300:9300 \
      -e "discovery.type=single-node" \
      -e "xpack.security.enabled=false" \
      -e "ES_JAVA_OPTS=-Xms1g -Xmx1g" \
      docker.elastic.co/elasticsearch/elasticsearch:8.11.0 || {
        print_error "Error al iniciar Elasticsearch"
        exit 1
    }
    echo "Esperando a que Elasticsearch inicie..."
    sleep 30
    print_status "Elasticsearch iniciado"
fi
echo ""

# 5. Compilar aplicación
echo "🏗️  Compilando aplicación..."
npm run build || {
    print_error "Error al compilar la aplicación"
    exit 1
}
print_status "Aplicación compilada exitosamente"
echo ""

# 6. Verificar archivo .env
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado"
    echo "Por favor, crea un archivo .env basado en .env.example"
    echo "cp .env.example .env"
    echo "nano .env  # Edita con tus credenciales"
    exit 1
fi
print_status "Archivo .env encontrado"
echo ""

# 7. Configurar PM2 si no existe
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    sudo npm install -g pm2 || {
        print_error "Error al instalar PM2"
        exit 1
    }
    print_status "PM2 instalado"
fi
echo ""

# 8. Crear archivo ecosystem.config.js si no existe
if [ ! -f ecosystem.config.js ]; then
    echo "📝 Creando configuración de PM2..."
    cat > ecosystem.config.js << 'EOFPM2'
module.exports = {
  apps: [
    {
      name: 'ahura-backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'embedding-service',
      script: 'Backia/api/embedding_service.py',
      interpreter: 'python3',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        PORT: 8001
      }
    }
  ]
};
EOFPM2
    print_status "Configuración de PM2 creada"
fi
echo ""

# 9. Reiniciar servicios
echo "🔄 Reiniciando servicios..."

# Detener servicios existentes
pm2 delete all 2>/dev/null || true

# Iniciar servicios
pm2 start ecosystem.config.js || {
    print_error "Error al iniciar servicios con PM2"
    exit 1
}

# Guardar configuración de PM2
pm2 save

print_status "Servicios reiniciados"
echo ""

# 10. Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 10

# 11. Verificar servicios
echo "🔍 Verificando servicios..."

# Verificar NestJS
if curl -s http://localhost:3000 > /dev/null; then
    print_status "NestJS está respondiendo en puerto 3000"
else
    print_error "NestJS no está respondiendo"
    echo "Revisa los logs con: pm2 logs ahura-backend"
fi

# Verificar Elasticsearch
if curl -s http://localhost:9200 > /dev/null; then
    print_status "Elasticsearch está respondiendo en puerto 9200"
else
    print_warning "Elasticsearch no está respondiendo correctamente"
fi

# Verificar servicio de embeddings
if curl -s http://localhost:8001/health > /dev/null; then
    print_status "Servicio de embeddings está respondiendo en puerto 8001"
else
    print_warning "Servicio de embeddings no está respondiendo"
    echo "Revisa los logs con: pm2 logs embedding-service"
fi

echo ""
echo "✨ Despliegue completado!"
echo ""
echo "📊 Comandos útiles:"
echo "  pm2 status          - Ver estado de los servicios"
echo "  pm2 logs            - Ver logs de todos los servicios"
echo "  pm2 logs ahura-backend  - Ver logs de NestJS"
echo "  pm2 logs embedding-service  - Ver logs del servicio de embeddings"
echo "  pm2 monit           - Monitor en tiempo real"
echo "  pm2 restart all     - Reiniciar todos los servicios"
echo ""
echo "🧪 Prueba los endpoints:"
echo "  curl http://localhost:3000/search/dashboard"
echo "  curl http://localhost:8001/health"
echo ""
