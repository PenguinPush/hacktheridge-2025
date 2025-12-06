from flask import Flask, jsonify, render_template
from threading import Thread
import time

app = Flask(__name__)

input_data = {"rotation_x": 0, "rotation_y": 0}


def update():
    global input_data
    while True:
        input_data["rotation_x"] += 1
        input_data["rotation_y"] += 1
        if input_data["rotation_x"] > 360:
            input_data["rotation_x"] = 0
        if input_data["rotation_y"] > 360:
            input_data["rotation_y"] = 0
        time.sleep(0.1)


@app.route('/')
def main():
    return render_template("index.html")


@app.route('/input_data', methods=['GET'])
def get_input_data():
    return jsonify(input_data), 200


def run_flask():
    app.run(debug=False, use_reloader=False)


if __name__ == '__main__':
    update_thread = Thread(target=update, daemon=True)
    update_thread.start()

    flask_thread = Thread(target=run_flask)
    flask_thread.start()

    flask_thread.join()