#!/bin/bash
set -e

echo "🎙️ Iniciando Worker de Voz LiveKit (AURA)..."
# Ejecutamos el agente directamente. LiveKit levanta automáticamente un servidor HTTP de salud en el puerto 8081.
python3 voice/main.py start
