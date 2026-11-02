"""
Local HTTP Server for Disaster Rescue Path Planning System
Serves the application locally and automatically launches the default web browser.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

# Configure UTF-8 for Windows console
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    os.chdir(DIRECTORY)
    server_address = ("", PORT)
    try:
        with socketserver.TCPServer(server_address, Handler) as httpd:
            url = f"http://localhost:{PORT}"
            print("=" * 70)
            print("🚀 DISASTER RESCUE PATH PLANNING SYSTEM WEB SERVER")
            print("=" * 70)
            print(f" Serving files from: {DIRECTORY}")
            print(f" Web Application URL: {url}")
            print(" Press Ctrl+C in this terminal to stop the server.")
            print("=" * 70)
            # Open browser automatically
            try:
                webbrowser.open(url)
            except Exception:
                pass
            httpd.serve_forever()
    except OSError as e:
        print(f"Port {PORT} in use or error: {e}. Trying alternative port 8080...")
        with socketserver.TCPServer(("", 8080), Handler) as httpd:
            url = "http://localhost:8080"
            print(f"Web Application URL: {url}")
            webbrowser.open(url)
            httpd.serve_forever()

if __name__ == "__main__":
    start_server()
