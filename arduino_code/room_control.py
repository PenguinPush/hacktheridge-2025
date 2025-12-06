import serial
import serial.tools.list_ports
import time


def find_arduino():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if 'Arduino' in port.description or 'usbmodem' in port.device or 'usbserial' in port.device:
            return port.device
    return None


class RoomControl:
    def __init__(self, port):
        self.arduino = serial.Serial("COM4", 9600, timeout=1)
        time.sleep(2)

        # Read initial message
        if self.arduino.in_waiting > 0:
            msg = self.arduino.readline().decode('utf-8').strip()
            print(f"Arduino: {msg}")

    def send_command(self, command):
        self.arduino.write(f"{command}\n".encode('utf-8'))
        time.sleep(0.1)

        if self.arduino.in_waiting > 0:
            response = self.arduino.readline().decode('utf-8').strip()
            print(f"  {response}")
            return response
        return None

    def lamp_on(self):
        self.send_command("LAMP_ON")

    def lamp_off(self):
        self.send_command("LAMP_OFF")

    def lamp_brightness(self, percent):
        percent = max(0, min(100, percent))  # Constrain 0-100
        print(f"→ Setting lamp brightness to {percent}%")
        self.send_command(f"LAMP_BRIGHTNESS:{percent}")

    def rgb_on(self):
        self.send_command("RGB_ON")

    def rgb_off(self):
        self.send_command("RGB_OFF")

    def rgb_red(self):
        self.send_command("RGB_RED")

    def rgb_green(self):
        self.send_command("RGB_GREEN")

    def rgb_blue(self):
        self.send_command("RGB_BLUE")

    def rgb_purple(self):
        self.send_command("RGB_PURPLE")

    def rgb_cyan(self):
        self.send_command("RGB_CYAN")

    def rgb_yellow(self):
        self.send_command("RGB_YELLOW")

    def rgb_warm(self):
        self.send_command("RGB_WARM")

    def rgb_rainbow(self):
        self.send_command("RGB_RAINBOW")

    def window_open(self):
        self.send_command("WINDOW_OPEN")

    def window_close(self):
        self.send_command("WINDOW_CLOSE")

    def window_position(self, percent):
        percent = max(0, min(100, percent))  # Constrain 0-100
        self.send_command(f"WINDOW_POSITION:{percent}")


def main():
    # Find and connect to Arduino
    port = "COM4"

    if not port:
        print("Arduino not found!")
        return

    print(f"Connecting to Arduino on port: {port}")

    try:
        room = RoomControl(port)

        # Interactive menu
        while True:
            print("\n" + "=" * 40)
            print("ROOM CONTROL MENU")
            print("=" * 40)
            print("\n[LAMP]")
            print("  1. Lamp ON")
            print("  2. Lamp OFF")
            print("  3. Set Lamp Brightness")

            print("\n[RGB LIGHTS]")
            print("  4. RGB ON (White)")
            print("  5. RGB OFF")
            print("  6. RGB Red")
            print("  7. RGB Green")
            print("  8. RGB Blue")
            print("  9. RGB Purple")
            print("  10. RGB Cyan")
            print("  11. RGB Yellow")
            print("  12. RGB Warm White")
            print("  13. RGB Rainbow")

            print("\n[WINDOW]")
            print("  14. Window Open")
            print("  15. Window Close")
            print("  16. Set Window Position")

            print("\n  q. Quit")

            choice = input("\nEnter choice: ").strip()

            if choice == 'q':
                break
            elif choice == '1':
                room.lamp_on()
            elif choice == '2':
                room.lamp_off()
            elif choice == '3':
                brightness = int(input("Enter brightness (0-100): "))
                room.lamp_brightness(brightness)
            elif choice == '4':
                room.rgb_on()
            elif choice == '5':
                room.rgb_off()
            elif choice == '6':
                room.rgb_red()
            elif choice == '7':
                room.rgb_green()
            elif choice == '8':
                room.rgb_blue()
            elif choice == '9':
                room.rgb_purple()
            elif choice == '10':
                room.rgb_cyan()
            elif choice == '11':
                room.rgb_yellow()
            elif choice == '12':
                room.rgb_warm()
            elif choice == '13':
                room.rgb_rainbow()
            elif choice == '14':
                room.window_open()
            elif choice == '15':
                room.window_close()
            elif choice == '16':
                position = int(input("Enter window position (0-100%): "))
                room.window_position(position)
            else:
                print("Invalid choice!")


    except serial.SerialException as e:
        print(f"Error: {e}")
    except KeyboardInterrupt:
        print("\n\nExiting...")


if __name__ == "__main__":
    main()
