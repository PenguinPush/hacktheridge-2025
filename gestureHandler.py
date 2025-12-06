class GestureHandler:
    def __init__(self):
        self.pointer_buffer = set()
        self.axis = None
        self.deadzone = 0.2

    def update(self, pointer, tracking_gesture):
        if tracking_gesture:
            x = round(min(max(pointer[0] / 0.8, -1), 1), 3)
            y = round(min(max(pointer[1] / 0.5, -1), 1), 3)

            if not self.gesture_active:
                self.gesture_active = True
                self.pointer_buffer.clear()
                self.axis = None

            if self.axis is None:
                if abs(x) > self.deadzone:
                    self.axis = 'x'
                elif abs(y) > self.deadzone:
                    self.axis = 'y'

            if self.axis == 'x':
                self.pointer_buffer.add((x, 0))
                return {"axis": "x", "value": x}

            elif self.axis == 'y':
                self.pointer_buffer.add((0, y))
                return {"axis": "y", "value": y}
        else:
            self.gesture_active = False

        return {"axis": None, "value": 0}
