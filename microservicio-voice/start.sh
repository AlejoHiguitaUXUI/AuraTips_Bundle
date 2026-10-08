#!/bin/bash
set -e

PORT="${PORT:-10000}"

echo "🌐 Levantando micro-responder de salud en puerto ${PORT} para Render..."
# Un micro-responder HTTP nativo ultra-ligero (0MB RAM) para que Render detecte el puerto abierto y marque el deploy exitoso de inmediato
python3 -c "
import http.server, socketserver, os
port = int(os.environ.get('PORT', 10000))
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write(b'OK')
    def log_message(self, format, *args):
        pass
with socketserver.TCPServer(('', port), Handler) as httpd:
    httpd.serve_forever()
" &
HTTP_PID=$!

echo "🎙️ Iniciando Worker de Voz LiveKit (AURA)..."
python3 voice/main.py start &
WORKER_PID=$!

trap "kill -TERM $HTTP_PID $WORKER_PID 2>/dev/null" SIGTERM SIGINT

wait -n


