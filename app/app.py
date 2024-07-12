from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__)

# Simulated data storage
modules = [
    {"id": 1, "depth": 0, "temperature": 0, "location": {"lat": None, "lng": None}, "camera": 1, "history": []},
    {"id": 2, "depth": 0, "temperature": 0, "location": {"lat": None, "lng": None}, "camera": 1, "history": []},
    {"id": 3, "depth": 0, "temperature": 0, "location": {"lat": None, "lng": None}, "camera": 2, "history": []},
    {"id": 4, "depth": 0, "temperature": 0, "location": {"lat": None, "lng": None}, "camera": 2, "history": []},
    {"id": 5, "depth": 0, "temperature": 0, "location": {"lat": None, "lng": None}, "camera": 3, "history": []},
    {"id": 6, "depth": 0, "temperature": 0, "location": {"lat": None, "lng": None}, "camera": 3, "history": []}
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/modules', methods=['GET'])
def get_modules():
    return jsonify(modules)

@app.route('/api/modules/<int:module_id>', methods=['POST'])
def update_module(module_id):
    data = request.json
    for module in modules:
        if module['id'] == module_id:
            module['location'] = data['location']
            module['depth'] = data['depth']
            module['temperature'] = data['temperature']
            module['history'].append({
                "timestamp": datetime.now().isoformat(),
                "depth": data['depth'],
                "temperature": data['temperature']
            })
            break
    return jsonify({"success": True})

@app.route('/api/history/<int:module_id>', methods=['GET'])
def get_history(module_id):
    for module in modules:
        if module['id'] == module_id:
            return jsonify(module['history'])
    return jsonify({"error": "Module not found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
