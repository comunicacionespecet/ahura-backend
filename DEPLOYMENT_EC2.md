# 🚀 Guía de Despliegue en AWS EC2

Esta guía te ayudará a desplegar la integración de búsqueda con IA en tu instancia EC2 de AWS.

## 📋 Prerequisitos en EC2

Tu instancia EC2 debe tener:
- Ubuntu 20.04+ o Amazon Linux 2
- Node.js >= 18.x
- Python 3.8+
- Docker instalado
- Al menos 4GB de RAM (recomendado 8GB para Elasticsearch)
- Puertos abiertos: 3000 (NestJS), 8001 (Embeddings), 9200 (Elasticsearch)

## 🔧 Paso 1: Conectar a EC2

```bash
ssh -i tu-key.pem ec2-user@tu-instancia-ec2.compute.amazonaws.com
```

## 📥 Paso 2: Actualizar el Código

```bash
# Ir al directorio del proyecto
cd /ruta/a/ahura-backend

# Hacer pull de los cambios
git fetch origin
git checkout search
git pull origin search

# O si prefieres mergear a main primero
git checkout main
git merge search
git push origin main
```

## 📦 Paso 3: Instalar Dependencias

```bash
# Dependencias de Node.js
npm install

# Dependencias de Python para el servicio de embeddings
cd Backia
pip3 install -r requirements.txt
cd ..
```

## 🐳 Paso 4: Configurar Servicios con Docker

### Opción A: Docker Compose (Recomendado)

```bash
# Iniciar Elasticsearch y MongoDB
docker-compose -f docker-compose.search.yml up -d

# Verificar que estén corriendo
docker ps
```

### Opción B: Docker Manual

```bash
# Elasticsearch
docker run -d \
  --name elasticsearch \
  --restart unless-stopped \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e "xpack.security.enabled=false" \
  -e "ES_JAVA_OPTS=-Xms1g -Xmx1g" \
  docker.elastic.co/elasticsearch/elasticsearch:8.11.0

# MongoDB (si no usas Atlas)
docker run -d \
  --name mongodb \
  --restart unless-stopped \
  -p 27017:27017 \
  -v /data/mongodb:/data/db \
  mongo:latest
```

## ⚙️ Paso 5: Configurar Variables de Entorno

```bash
# Crear archivo .env
nano .env
```

Contenido del `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ahura
# O si usas MongoDB Atlas
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ahura

# AWS S3 (usar tus credenciales reales)
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key_real
AWS_SECRET_ACCESS_KEY=tu_secret_key_real
AWS_S3_BUCKET=tu-bucket-produccion

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200
ES_INDEX=documents

# Embedding Service
EMBEDDING_API_URL=http://localhost:8001/generate-embedding

# JWT
JWT_SECRET=tu_jwt_secret_production_muy_seguro
JWT_EXPIRATION=24h

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password

# App
PORT=3000
NODE_ENV=production
```

## 🐍 Paso 6: Configurar Servicio de Embeddings con PM2

```bash
# Instalar PM2 si no lo tienes
sudo npm install -g pm2

# Crear archivo de configuración PM2 para el servicio de embeddings
cat > ecosystem.config.js << 'EOF'
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
EOF
```

## 🏗️ Paso 7: Compilar y Desplegar

```bash
# Compilar el proyecto
npm run build

# Iniciar servicios con PM2
pm2 start ecosystem.config.js

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para inicio automático
pm2 startup
# Ejecutar el comando que PM2 te muestre
```

## 🔍 Paso 8: Verificar Servicios

```bash
# Ver estado de los servicios
pm2 status

# Ver logs
pm2 logs ahura-backend
pm2 logs embedding-service

# Verificar Elasticsearch
curl http://localhost:9200

# Verificar servicio de embeddings
curl http://localhost:8001/health

# Verificar NestJS
curl http://localhost:3000
```

## 🌐 Paso 9: Configurar Nginx (Opcional pero Recomendado)

```bash
# Instalar Nginx si no está instalado
sudo apt-get update
sudo apt-get install nginx

# Crear configuración
sudo nano /etc/nginx/sites-available/ahura
```

Contenido de la configuración:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # NestJS API
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Aumentar tamaño máximo para uploads
    client_max_body_size 100M;
}
```

```bash
# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/ahura /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

## 🔒 Paso 10: Configurar Security Groups en AWS

Asegúrate de que tu Security Group de EC2 tenga estas reglas de entrada:

```
Puerto 80 (HTTP): 0.0.0.0/0
Puerto 443 (HTTPS): 0.0.0.0/0
Puerto 22 (SSH): Tu IP
Puerto 3000: 0.0.0.0/0 (si no usas Nginx)
```

## 🧪 Paso 11: Probar la Integración

```bash
# Desde tu máquina local o desde EC2

# 1. Verificar dashboard
curl http://tu-ec2-ip:3000/search/dashboard

# 2. Subir documento de prueba
curl -X POST http://tu-ec2-ip:3000/search/upload \
  -F "file=@test.pdf"

# 3. Buscar
curl -X POST http://tu-ec2-ip:3000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "búsqueda de prueba", "top_k": 5}'
```

## 🔄 Paso 12: Actualizaciones Futuras

Para actualizar la aplicación:

```bash
cd /ruta/a/ahura-backend
git pull origin main
npm install
npm run build
pm2 restart all
```

## 📊 Monitoreo

```bash
# Ver logs en tiempo real
pm2 logs

# Ver uso de recursos
pm2 monit

# Ver métricas
pm2 status

# Ver logs de Elasticsearch
docker logs -f elasticsearch

# Ver logs de MongoDB
docker logs -f mongodb
```

## 🐛 Troubleshooting

### Elasticsearch no inicia

```bash
# Aumentar memoria virtual
sudo sysctl -w vm.max_map_count=262144

# Para que persista después de reinicio
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
```

### Servicio de embeddings falla

```bash
# Verificar que Python 3.8+ esté instalado
python3 --version

# Reinstalar dependencias
cd Backia
pip3 install --upgrade -r requirements.txt
```

### Problemas de memoria

```bash
# Agregar swap si la instancia tiene poca RAM
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Para que persista
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Puerto 3000 en uso

```bash
# Encontrar proceso
sudo lsof -i :3000

# Matar proceso
sudo kill -9 PID
```

## 🎯 Checklist de Despliegue

- [ ] Código actualizado (git pull)
- [ ] Dependencias instaladas (npm install)
- [ ] Variables de entorno configuradas (.env)
- [ ] Elasticsearch corriendo (docker ps)
- [ ] MongoDB corriendo o Atlas configurado
- [ ] Servicio de embeddings iniciado
- [ ] Aplicación compilada (npm run build)
- [ ] PM2 configurado y corriendo
- [ ] Nginx configurado (opcional)
- [ ] Security Groups configurados
- [ ] Pruebas de endpoints exitosas

## 📞 Soporte

Si encuentras problemas:
1. Revisar logs: `pm2 logs`
2. Verificar servicios: `pm2 status` y `docker ps`
3. Comprobar conectividad: `curl http://localhost:9200`

---

**¡Despliegue completado! 🎉**
