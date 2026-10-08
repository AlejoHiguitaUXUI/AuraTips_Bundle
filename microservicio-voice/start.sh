#!/bin/bash
set -e

# En Render el plan Free tiene 512MB de RAM.
# No necesitamos uvicorn (FastAPI) porque los tokens ya los genera Next.js en Vercel.
# Ejecutamos únicamente el Worker de LiveKit para que opere con holgura de memoria.

echo "🎙️ Iniciando Worker de Voz LiveKit (AURA)..."
exec python voice/main.py dev

