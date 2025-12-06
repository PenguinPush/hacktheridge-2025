from flask import Flask, request, jsonify, render_template
from threading import Thread
import time

app = Flask(__name__)

input_data = {"rotation_x": 0, "rotation_y": 0}


@app.route('/')
def main():
    return render_template("index.html")


@app.route('/update', methods=['POST'])
def update_camera_data():
    global input_data
    data = request.json  # Expecting JSON input
    if data:
        input_data["rotation_x"] = data.get("rotation_x", input_data["rotation_x"])
        input_data["rotation_y"] = data.get("rotation_y", input_data["rotation_y"])
    else:
        input_data["rotation_x"] = 0
        input_data["rotation_y"] = 90

    return jsonify({"status": "success", "data": input_data}), 200


@app.route('/input_data', methods=['GET'])
def input_data():
    return jsonify(input_data), 200


def run_flask():
    app.run(debug=True, use_reloader=False)


if __name__ == '__main__':
    flask_thread = Thread(target=run_flask)
    flask_thread.start()
