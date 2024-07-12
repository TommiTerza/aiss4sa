from threading import Timer
from flask import Flask, render_template, request, jsonify
import random
import datetime
from multiprocessing import Queue, Process

import board
import busio
import digitalio
import time
import re

import adafruit_rfm9x

app = Flask(__name__)

# Simulated data storage
modules = [
    {"id": 1, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 2, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 3, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 4, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 5, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None},
    {"id": 6, "depth": 0.0, "temperature": 0.0, "location": None, "camera": None}
]

# Simulated historical data storage for each module
history_data = {module['id']: [] for module in modules}

def sender(queue, sensor_id, water_lvl, temp):
	arr = [sensor_id, water_lvl, temp]
	queue.put(arr)
	print(f"Sent msg {arr}")

def extract_values(data):
    pattern = r"ID:\s*(\d+)\s*Temp:\s*([-+]?\d*\.\d+|\d+)\s*C,\s*Water level:\s*(\d+)\s*mm"
    match = re.search(pattern, data)
    if match:
        id_value = int(match.group(1))
        temp_value = float(match.group(2))
        water_level = int(match.group(3))
        return [id_value, temp_value, water_level]
    else:
        return None

def LoRaReceiver(queue):
	
	# Define radio parameters.
	RADIO_FREQ_MHZ = 433.0  # Frequency of the radio in Mhz. Must match your
	# module! Can be a value like 915.0, 433.0, etc.

	# Define pins connected to the chip, use these if wiring up the breakout according to the guide:
	CS = digitalio.DigitalInOut(board.CE1)
	RESET = digitalio.DigitalInOut(board.D25)

	# Initialize SPI bus.
	spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)

	# Initialze RFM radio
	rfm9x = adafruit_rfm9x.RFM9x(spi, CS, RESET, RADIO_FREQ_MHZ, baudrate=100000)

	# Note that the radio is configured in LoRa mode so you can't control sync
	# word, encryption, frequency deviation, or other settings!

	# You can however adjust the transmit power (in dB).  The default is 13 dB but
	# high power radios like the RFM95 can go up to 23 dB:
	rfm9x.tx_power = 23

	# Wait to receive packets.  Note that this library can't receive data at a fast
	# rate, in fact it can only receive and process one 252 byte packet at a time.
	# This means you should only use this for low bandwidth scenarios, like sending
	# and receiving a single message at a time.
	print("Waiting for packets...")
	
	while True:
				
		#packet = rfm9x.receive()
		# Optionally change the receive timeout from its default of 0.5 seconds:
		packet = rfm9x.receive(timeout=5.0,with_header=True)
		# If no packet was received during the timeout then None is returned.
		if packet is None:
			# Packet has not been received
			print("Received nothing! Listening again...")
		else:
			# Received a packet!
			# Print out the raw bytes of the packet:
			print("Received (raw bytes): {0}".format(packet))
			# And decode to ASCII text and print it too.  Note that you always
			# receive raw bytes and need to convert to a text format like ASCII
			# if you intend to do string processing on your data.  Make sure the
			# sending side is sending ASCII data before you try to decode!
			packet_text = str(packet, "ascii")
			print("Received (ASCII): {0}".format(packet_text))
			formatted_txt = extract_values(packet_text)
			
			# Also read the RSSI (signal strength) of the last received message and
			# print it.
			rssi = rfm9x.last_rssi
			print("Received signal strength: {0} dB".format(rssi))
			sender(q, formatted_txt[0], formatted_txt[1], formatted_txt[2])

	
def update_data(queue):
	if (not queue.empty()):
		data = queue.get()
		now = datetime.datetime.utcnow()
		timestamp = now
		depth = data[2]
		temperature = data[1]
		sens_id = data[0]
		for module in modules:
			if (module['id'] == sens_id):
				print("FOUND!")
				module['depth'] = depth/1000
				module['temperature'] = temperature
				# Add to historical data
				history_data[module['id']].append({
					"timestamp": now.isoformat() + "Z",
					"depth": module['depth'],
					"temperature": module['temperature']
				})

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/modules', methods=['GET'])
def get_modules():
    update_data(q)  # Update the random data each time the endpoint is called
    #update_random_data()
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
    global modules, history_data
    modules = [module for module in modules if module['id'] != module_id]
    if module_id in history_data:
        del history_data[module_id]
    return jsonify({"success": True})

if __name__ == '__main__':
	q = Queue()
	
	p = Process(target=LoRaReceiver, args=(q,))
	
	p.start()
	
	app.run(host='0.0.0.0', port=5000)
	
	p.join()

average_levels = {module['id']: [0] * 60 for module in modules}
time_intervals = {module['id']: [0] * 60 for module in modules}
last_updated = {module['id']: datetime.datetime.now(datetime.timezone.utc) for module in modules}
# Initialize an array to store the average water levels for each camera


def update_average_levels():
    now = datetime.datetime.now(datetime.timezone.utc)
        camera_id = module['camera']
    for module in modules:
            if elapsed_time >= 5:
            elapsed_time = (now - last_updated[module['id']]).total_seconds()
        if camera_id is not None:
                minute_index = (now.minute % 60)
                current_depth = module['depth']

                if time_intervals[module['id']][minute_index] == 0:
                # Calculate the new average for the minute
                    average_levels[module['id']][minute_index] = current_depth
                else:
                    average_levels[module['id']][minute_index] = (
                        average_levels[module['id']][minute_index] * time_intervals[module['id']][minute_index] + current_depth

                    ) / (time_intervals[module['id']][minute_index] + 1)
                last_updated[module['id']] = now
                time_intervals[module['id']][minute_index] += 1
@app.route('/history/<int:camera_id>')
def show_history(camera_id):

    return render_template('history.html', camera_id=camera_id)
@app.route('/api/modules/<int:module_id>', methods=['POST'])
def update_module(module_id):
    data = request.json
            module['location'] = data.get('location', module['location'])
    for module in modules:
        if module['id'] == module_id:
            module['temperature'] = data.get('temperature', module['temperature'])
            module['depth'] = data.get('depth', module['depth'])
            module['camera'] = data.get('camera', module['camera'])
            break
    return jsonify({"success": True})

@app.route('/api/modules/<int:module_id>', methods=['DELETE'])
def delete_module(module_id):
    modules = [module for module in modules if module['id'] != module_id]
    global modules, average_levels, time_intervals
        del average_levels[module_id]
    if module_id in average_levels:
        del time_intervals[module_id]
    if module_id in time_intervals:
    return jsonify({"success": True})

@app.route('/api/average_levels', methods=['GET'])
def get_average_levels():
    camera_id = int(request.args.get('camera_id'))
    return jsonify(average_levels.get(camera_id, []))

# Regularly update average levels in the background
    update_average_levels()
def update_data():
    Timer(5, update_data).start()

update_data()