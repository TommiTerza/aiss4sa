from flask import Flask, render_template, request, jsonify
import random
import datetime
from threading import Timer

app = Flask(__name__)

# Simulated data storage
modules = [
    {"id": 1, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 2, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 3, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 4, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 5, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 6, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 7, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 8, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 9, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 10, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 11, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 12, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},  
    {"id": 13, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 14, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 15, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 16, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 17, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 18, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None}
]

# Initialize an array to store the average water levels for each camera
average_levels = {module['id']: [0] * 60 for module in modules}
time_intervals = {module['id']: [0] * 60 for module in modules}
last_updated = {module['id']: datetime.datetime.now(datetime.timezone.utc) for module in modules}

def update_random_data():
    now = datetime.datetime.now(datetime.timezone.utc)
    for module in modules:
        module['depth'] = random.uniform(0, 1)
        module['temperature'] = random.uniform(20, 30)

def update_average_levels():
    now = datetime.datetime.now(datetime.timezone.utc)
    for module in modules:
        camera_id = module['camera']
        if camera_id is not None:
            elapsed_time = (now - last_updated[module['id']]).total_seconds()
            if elapsed_time >= 5:
                minute_index = (now.minute % 60)
                current_depth = module['depth']

                # Calculate the new average for the minute
                if time_intervals[module['id']][minute_index] == 0:
                    average_levels[module['id']][minute_index] = current_depth
                else:
                    average_levels[module['id']][minute_index] = (
                        average_levels[module['id']][minute_index] * time_intervals[module['id']][minute_index] + current_depth
                    ) / (time_intervals[module['id']][minute_index] + 1)

                time_intervals[module['id']][minute_index] += 1
                last_updated[module['id']] = now

def generate_random_data():
    now = datetime.datetime.now(datetime.timezone.utc)
    for module in modules:
        for i in range(60):  # Generate data for the past hour
            timestamp = now - datetime.timedelta(minutes=i)
            depth = random.uniform(0, 1)
            temperature = random.uniform(20, 30)
            time_intervals[module['id']][i] = 1
            average_levels[module['id']][i] = depth

generate_random_data()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/history/<int:camera_id>')
def show_history(camera_id):
    return render_template('history.html', camera_id=camera_id)

@app.route('/api/modules', methods=['GET'])
def get_modules():
    update_random_data()  # Update the random data each time the endpoint is called
    return jsonify(modules)

@app.route('/api/modules/<int:module_id>', methods=['POST'])
def update_module(module_id):
    data = request.json
    for module in modules:
        if module['id'] == module_id:
            module['location'] = data.get('location', module['location'])
            module['depth'] = data.get('depth', module['depth'])
            module['temperature'] = data.get('temperature', module['temperature'])
            module['camera'] = data.get('camera', module['camera'])
            break
    return jsonify({"success": True})

@app.route('/api/modules/<int:module_id>', methods=['DELETE'])
def delete_module(module_id):
    global modules, average_levels, time_intervals
    modules = [module for module in modules if module['id'] != module_id]
    if module_id in average_levels:
        del average_levels[module_id]
    if module_id in time_intervals:
        del time_intervals[module_id]
    return jsonify({"success": True})

@app.route('/api/average_levels', methods=['GET'])
def get_average_levels():
    camera_id = int(request.args.get('camera_id'))
    return jsonify(average_levels.get(camera_id, []))

# Regularly update average levels in the background
def update_data():
    update_average_levels()
    Timer(5, update_data).start()

update_data()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
