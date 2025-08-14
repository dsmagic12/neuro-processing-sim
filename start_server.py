#!/usr/bin/env python3
"""
HTTP server with Claude API proxy for the Claude Neural Visual Processing Simulator
Run this to avoid CORS issues when testing the web application
"""

import http.server
import socketserver
import webbrowser
import os
import sys
import json
import urllib.request
import urllib.parse
from urllib.error import HTTPError

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
MEMORY_FILE = os.path.join(DIRECTORY, 'visual_memories.json')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers to allow API calls
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, x-api-key, anthropic-version')
        super().end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight requests
        self.send_response(200)
        self.end_headers()
    
    def do_GET(self):
        # Handle memory loading requests
        if self.path == '/load-memory':
            self.handle_load_memory()
        else:
            super().do_GET()
    
    def do_POST(self):
        # Handle different POST endpoints
        if self.path == '/claude-proxy':
            self.handle_claude_proxy()
        elif self.path == '/save-memory':
            self.handle_save_memory()
        else:
            super().do_POST()
    
    def handle_claude_proxy(self):
        """Proxy requests to Claude API to avoid CORS issues"""
        try:
            # Read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Extract API key from request
            api_key = request_data.get('api_key')
            if not api_key:
                self.send_error(400, 'Missing API key')
                return
            
            # Remove api_key from request data before forwarding
            claude_request = {k: v for k, v in request_data.items() if k != 'api_key'}
            
            # Prepare the request to Claude API
            url = 'https://api.anthropic.com/v1/messages'
            headers = {
                'x-api-key': api_key,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            }
            
            # Make the request to Claude API
            req = urllib.request.Request(
                url,
                data=json.dumps(claude_request).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            
            try:
                with urllib.request.urlopen(req) as response:
                    # Forward the successful response
                    response_data = response.read()
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self.end_headers()
                    self.wfile.write(response_data)
                    
            except HTTPError as e:
                # Forward the error response
                error_data = e.read()
                self.send_response(e.code)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(error_data)
                
        except Exception as e:
            print(f"Error handling Claude proxy request: {e}")
            self.send_error(500, f'Server error: {str(e)}')
    
    def handle_save_memory(self):
        """Save visual memories to file"""
        try:
            # Read the request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            memory_data = json.loads(post_data.decode('utf-8'))
            
            # Save to file
            with open(MEMORY_FILE, 'w', encoding='utf-8') as f:
                json.dump(memory_data, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Saved {len(memory_data.get('memories', []))} visual memories to {MEMORY_FILE}")
            
            # Send success response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            response = {'status': 'success', 'message': 'Memories saved successfully'}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            print(f"Error saving memories: {e}")
            self.send_error(500, f'Error saving memories: {str(e)}')
    
    def handle_load_memory(self):
        """Load visual memories from file"""
        try:
            if os.path.exists(MEMORY_FILE):
                with open(MEMORY_FILE, 'r', encoding='utf-8') as f:
                    memory_data = json.load(f)
                
                print(f"📂 Loaded {len(memory_data.get('memories', []))} visual memories from {MEMORY_FILE}")
                
                # Send the memory data
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(memory_data).encode('utf-8'))
            else:
                # File doesn't exist - send 404
                print(f"📂 No memory file found at {MEMORY_FILE}")
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                response = {'status': 'not_found', 'message': 'No memory file found'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
        except Exception as e:
            print(f"Error loading memories: {e}")
            self.send_error(500, f'Error loading memories: {str(e)}')

def main():
    print(f"Claude Neural Visual Processing Simulator")
    print(f"Starting HTTP server on port {PORT}...")
    print(f"Directory: {DIRECTORY}")
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"Server running at http://localhost:{PORT}/")
            print(f"Opening web browser...")
            
            # Open the browser automatically
            webbrowser.open(f'http://localhost:{PORT}/index.html')
            
            print(f"Press Ctrl+C to stop the server")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        sys.exit(0)
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"Error: Port {PORT} is already in use")
            print(f"Try using a different port or stop the existing server")
        else:
            print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()