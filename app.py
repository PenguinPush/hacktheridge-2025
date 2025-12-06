from flask import Flask, jsonify, render_template
from threading import Thread
import time
from pyjoycon import GyroTrackingJoyCon, ButtonEventJoyCon, get_L_id, get_R_id
from gestureHandler import GestureHandler

app = Flask(__name__)

input_data = {
    "ceilingLight": 1,
    "lamp": 1,
    "volume": 1,
    "door": -1,
    "windows": -1
}

button_mapping = {
    "ceilingLight": "zr",
    "lamp": "r",
    "volume": "y",
    "door": "a",
    "windows": "b"
}

def update():
    global input_data
    deadzone = 0.2
    gestureHandler = GestureHandler()
    tracking_gesture = False

    if joycon_l:
        sticks = joycon_l.stick_l

    while True:
        if joycon_l:
            for event in joycon_l.events():
                button, state = event
                if button == "left_sl" and state:
                    print("left_sl button pressed")
                    joycon_l.reset_orientation()

            joystick_x = (joycon_l.stick_l[0] - sticks[0]) / 1200
            joystick_y = (joycon_l.stick_l[1] - sticks[1]) / 1050

            if abs(joystick_x) < deadzone:
                joystick_x = 0
            if abs(joystick_y) < deadzone:
                joystick_y = 0

            input_data["joystick_x"] = joystick_x
            input_data["joystick_y"] = joystick_y
            input_data["rotation"] = joycon_l.rotation.z

        if joycon_r:
            for event in joycon_r.events():
                button, state = event
                if state == 1:
                    for item, mapped_button in button_mapping.items():
                        if button == mapped_button:
                            joycon_r.reset_orientation()
                            tracking_gesture = item
                            break
                elif state == 0:
                    tracking_gesture = False

            if tracking_gesture:
                if joycon_r.pointer is None:
                    tracking_gesture = False

            gesture = gestureHandler.update(joycon_r.pointer, tracking_gesture)
            input_data["axis"] = gesture["axis"]
            input_data["value"] = gesture["value"]
            if tracking_gesture:
                input_data[item] = gesture["value"]
                print(input_data, item)

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
            print("left")
        if joycon_r_id:
            joycon_r = WrappedJoyCon(*joycon_r_id)
            print("right")
    except Exception as e:
        print(f"Error initializing JoyCons: {e}")

    update_thread = Thread(target=update, daemon=True)
    update_thread.start()

    flask_thread = Thread(target=run_flask)
    flask_thread.start()

    flask_thread.join()
