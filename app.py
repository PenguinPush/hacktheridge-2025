from flask import Flask, jsonify, render_template
from threading import Thread
import time
from pyjoycon import GyroTrackingJoyCon, ButtonEventJoyCon, get_L_id, get_R_id
import math

app = Flask(__name__)

input_data = {"rotation": 0}


def update():
    global input_data
    deadzone = 0.2

    if joycon_l:
        sticks = joycon_l.stick_l

    while True:
        if joycon_l:
            joystick_x = (joycon_l.stick_l[0] - sticks[0]) / 1200
            joystick_y = (joycon_l.stick_l[1] - sticks[1]) / 1050

            if abs(joystick_x) < deadzone:
                joystick_x = 0
            if abs(joystick_y) < deadzone:
                joystick_y = 0

            input_data["joystick_x"] = joystick_x
            input_data["joystick_y"] = joystick_y
            input_data["rotation"] = joycon_l.rotation.z

            print(input_data)

        time.sleep(0.05)

@app.route('/')
def main():
    return render_template("index.html")


@app.route('/input_data', methods=['GET'])
def get_input_data():
    return jsonify(input_data), 200


def run_flask():
    app.run(debug=False, use_reloader=False)


if __name__ == '__main__':

    class WrappedJoyCon(
        GyroTrackingJoyCon,
        ButtonEventJoyCon,
    ):
        pass


    global joycon_l, joycon_r
    joycon_l_id = get_L_id()
    joycon_r_id = get_R_id()

    print(joycon_l_id, joycon_r_id)

    joycon_l, joycon_r = None, None
    try:
        if joycon_l_id:
            joycon_l = WrappedJoyCon(*joycon_l_id)
        if joycon_r_id:
            joycon_r = WrappedJoyCon(*joycon_r_id)
    except Exception as e:
        print(f"Error initializing JoyCons: {e}")


    update_thread = Thread(target=update, daemon=True)
    update_thread.start()

    flask_thread = Thread(target=run_flask)
    flask_thread.start()

    flask_thread.join()
