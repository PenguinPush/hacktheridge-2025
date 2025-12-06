import serial
import serial.tools.list_ports
import time

def find_arduino():
    """Find Arduino port automatically"""
    ports = serial.tools.list_ports.comports()
    for port in ports:
        if 'usbmodem' in port.device or 'usbserial' in port.device:
            return port.device
    return None

class RoomControl:
    def __init__(self, port):
        self.arduino = serial.Serial(port, 9600, timeout=1)
        time.sleep(2)  # Wait for Arduino to reset
        
        # Read initial message
        if self.arduino.in_waiting > 0:
            msg = self.arduino.readline().decode('utf-8').strip()
            print(f"Arduino: {msg}")
        
    def send_command(self, command):
        """Send a command and wait for response"""
        self.arduino.write(f"{command}\n".encode('utf-8'))
        time.sleep(0.1)
        
        # Read response
        if self.arduino.in_waiting > 0:
            response = self.arduino.readline().decode('utf-8').strip()
            print(f"  {response}")
            return response
        return None
    
    # ===== LAMP CONTROLS =====
    def lamp_on(self):
        """Turn lamp fully on"""
        print("→ Turning lamp ON")
        self.send_command("LAMP_ON")
    
    def lamp_off(self):
        """Turn lamp off"""
        print("→ Turning lamp OFF")
        self.send_command("LAMP_OFF")
    
    def lamp_brightness(self, percent):
        """Set lamp brightness (0-100%)"""
        percent = max(0, min(100, percent))  # Constrain 0-100
        print(f"→ Setting lamp brightness to {percent}%")
        self.send_command(f"LAMP_BRIGHTNESS:{percent}")
    
    # ===== RGB LED CONTROLS =====
    def rgb_on(self):
        """Turn RGB LEDs on (white)"""
        print("→ Turning RGB LEDs ON")
        self.send_command("RGB_ON")
    
    def rgb_off(self):
        """Turn RGB LEDs off"""
        print("→ Turning RGB LEDs OFF")
        self.send_command("RGB_OFF")
    
    def rgb_red(self):
        """Set RGB LEDs to red"""
        print("→ Setting RGB to Red")
        self.send_command("RGB_RED")
    
    def rgb_green(self):
        """Set RGB LEDs to green"""
        print("→ Setting RGB to Green")
        self.send_command("RGB_GREEN")
    
    def rgb_blue(self):
        """Set RGB LEDs to blue"""
        print("→ Setting RGB to Blue")
        self.send_command("RGB_BLUE")
    
    def rgb_purple(self):
        """Set RGB LEDs to purple"""
        print("→ Setting RGB to Purple")
        self.send_command("RGB_PURPLE")
    
    def rgb_cyan(self):
        """Set RGB LEDs to cyan"""
        print("→ Setting RGB to Cyan")
        self.send_command("RGB_CYAN")
    
    def rgb_yellow(self):
        """Set RGB LEDs to yellow"""
        print("→ Setting RGB to Yellow")
        self.send_command("RGB_YELLOW")
    
    def rgb_warm(self):
        """Set RGB LEDs to warm white"""
        print("→ Setting RGB to Warm White")
        self.send_command("RGB_WARM")
    
    def rgb_rainbow(self):
        """Set RGB LEDs to rainbow pattern"""
        print("→ Setting RGB to Rainbow")
        self.send_command("RGB_RAINBOW")
    
    # ===== WINDOW CONTROLS =====
    def window_open(self):
        """Fully open window"""
        print("→ Opening window fully")
        self.send_command("WINDOW_OPEN")
    
    def window_close(self):
        """Fully close window"""
        print("→ Closing window")
        self.send_command("WINDOW_CLOSE")
    
    def window_position(self, percent):
        """Set window position (0-100%)"""
        percent = max(0, min(100, percent))  # Constrain 0-100
        print(f"→ Setting window to {percent}% open")
        self.send_command(f"WINDOW_POSITION:{percent}")
    
    def close(self):
        """Close serial connection"""
        self.arduino.close()
        print("Disconnected from Arduino")

def main():
    # Find and connect to Arduino
    port = find_arduino()
    
    if not port:
        print("Arduino not found!")
        return
    
    print(f"Connecting to Arduino on port: {port}")
    
    try:
        room = RoomControl(port)
        
        # Interactive menu
        while True:
            print("\n" + "="*40)
            print("ROOM CONTROL MENU")
            print("="*40)
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
        
        room.close()
        
    except serial.SerialException as e:
        print(f"Error: {e}")
    except KeyboardInterrupt:
        print("\n\nExiting...")
        room.close()

if __name__ == "__main__":
    main()