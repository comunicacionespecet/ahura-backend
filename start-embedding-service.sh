#!/bin/bash

# Script para iniciar el servicio de embeddings

echo "🚀 Starting Embedding Service..."
echo ""

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed"
    exit 1
fi

# Ir al directorio del servicio
cd Backia

# Verificar si existe el archivo de requerimientos
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found"
    exit 1
fi

# Instalar dependencias (solo si no existe el modelo)
if [ ! -d "$HOME/.cache/huggingface" ]; then
    echo "📦 Installing Python dependencies..."
    pip3 install -r requirements.txt
fi

# Iniciar el servicio
echo "✅ Starting embedding service on port 8001..."
python3 api/embedding_service.py
