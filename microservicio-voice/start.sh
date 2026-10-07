#!/bin/bash
set -e

# Puerto definido por el entorno de la nube (Railway/Render) o por defecto 8000
PORT="${PORT:-8000}"

echo "🚀 Iniciando API FastAPI de AURA en el puerto ${PORT}..."
uvicorn api.main:app --host 0.0.0.0 --port "${PORT}" &
UVICORN_PID=$!

echo "🎙️ Iniciando Worker de Voz LiveKit + ElevenLabs (AURA)..."
python voice/main.py dev &
WORKER_PID=$!

# Manejo de señales para apagado limpio
trap "kill -TERM $UVICORN_PID $WORKER_PID 2>/dev/null" SIGTERM SIGINT

# Esperar a que los procesos se ejecuten
wait -n
