import http.server
import json
import os
import sys
from urllib.parse import urlparse

# Ensure ml_engine can find modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml_engine.embedder import SBERTEmbedder

embedder: SBERTEmbedder = None

class MLRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: dict):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        try:
            self.wfile.write(response_bytes)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path in ["/", "/health"]:
            self._send_json(200, {
                "status": "ok",
                "model": "all-MiniLM-L6-v2",
                "dimension": 384
            })
        else:
            self._send_json(404, {"error": "Not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path == "/embed":
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._send_json(400, {"error": "Empty body"})
                return

            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except Exception as e:
                self._send_json(400, {"error": f"Invalid JSON: {str(e)}"})
                return

            global embedder
            if embedder is None:
                embedder = SBERTEmbedder()

            if "text" in data and isinstance(data["text"], str):
                vector = embedder.embed_text(data["text"])
                self._send_json(200, {"embedding": vector})
            elif "texts" in data and isinstance(data["texts"], list):
                vectors = embedder.embed_batch(data["texts"])
                self._send_json(200, {"embeddings": vectors})
            else:
                self._send_json(400, {"error": "Missing 'text' (string) or 'texts' (list) in payload"})
        else:
            self._send_json(404, {"error": "Not found"})

def run_server(port: int = 8000, host: str = "0.0.0.0"):
    global embedder
    print("Pre-loading SBERT model...")
    embedder = SBERTEmbedder()
    server_address = (host, port)
    httpd = http.server.ThreadingHTTPServer(server_address, MLRequestHandler)
    print(f"Alumnect ML Microservice running at http://{host}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down ML server.")
        httpd.server_close()

if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8000))
    run_server(port=port)

