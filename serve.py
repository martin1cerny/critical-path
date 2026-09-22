#!/usr/bin/env python3
"""Minimal static server with SPA fallback for the Czech CPM app.

Usage:  python serve.py [port]      (default port 8000)
Then open http://127.0.0.1:8000/
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = self.translate_path(self.path.split("?", 1)[0])
        # Serve index.html for client-side routes that have no file on disk.
        if not os.path.exists(path) or (os.path.isdir(path) and
                                        not os.path.exists(os.path.join(path, "index.html"))):
            self.path = "/index.html"
        return super().do_GET()


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print("Serving the Czech CPM app on http://127.0.0.1:%d/" % PORT)
    print("Press Ctrl+C to stop.")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
