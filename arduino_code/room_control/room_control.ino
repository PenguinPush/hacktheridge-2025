#include <Servo.h>
#include <FastLED.h>

#define LED_PIN     7
#define NUM_LEDS    8
#define Lamp_LED    5

CRGB leds[NUM_LEDS];
Servo windowServo;

void setup() {
  Serial.begin(9600);
  windowServo.attach(8);
  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  pinMode(Lamp_LED, OUTPUT);
  
  Serial.println("Room Control Ready!");
}

void loop() {
  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();
    
    // Parse command (format: "COMMAND:VALUE")
    int colonIndex = command.indexOf(':');
    String cmd = command;
    int value = 0;
    
    if (colonIndex > 0) {
      cmd = command.substring(0, colonIndex);
      value = command.substring(colonIndex + 1).toInt();
    }
    
    // Lamp commands
    if (cmd == "LAMP_ON") {
      lampOn();
    }
    else if (cmd == "LAMP_OFF") {
      lampOff();
    }
    else if (cmd == "LAMP_BRIGHTNESS") {
      setLampBrightness(value);
    }
    
    // RGB LED commands
    else if (cmd == "RGB_ON") {
      rgbOn();
    }
    else if (cmd == "RGB_OFF") {
      rgbOff();
    }
    else if (cmd == "RGB_RED") {
      rgbRed();
    }
    else if (cmd == "RGB_GREEN") {
      rgbGreen();
    }
    else if (cmd == "RGB_BLUE") {
      rgbBlue();
    }
    else if (cmd == "RGB_PURPLE") {
      rgbPurple();
    }
    else if (cmd == "RGB_CYAN") {
      rgbCyan();
    }
    else if (cmd == "RGB_YELLOW") {
      rgbYellow();
    }
    else if (cmd == "RGB_WARM") {
      rgbWarm();
    }
    else if (cmd == "RGB_RAINBOW") {
      rgbRainbow();
    }
    
    // Window commands
    else if (cmd == "WINDOW_OPEN") {
      windowOpen();
    }
    else if (cmd == "WINDOW_CLOSE") {
      windowClose();
    }
    else if (cmd == "WINDOW_POSITION") {
      setWindowPosition(value);
    }
    
    else {
      Serial.println("ERROR: Unknown command");
    }
  }
}

// ===== LAMP FUNCTIONS =====
void lampOn() {
  analogWrite(Lamp_LED, 255);
  Serial.println("OK: Lamp ON (100%)");
}

void lampOff() {
  analogWrite(Lamp_LED, 0);
  Serial.println("OK: Lamp OFF");
}

void setLampBrightness(int brightness) {
  // Constrain brightness between 0-100
  brightness = constrain(brightness, 0, 100);
  int pwmValue = map(brightness, 0, 100, 0, 255);
  analogWrite(Lamp_LED, pwmValue);
  Serial.print("OK: Lamp brightness set to ");
  Serial.print(brightness);
  Serial.println("%");
}

// ===== RGB LED FUNCTIONS =====
void rgbOn() {
  fill_solid(leds, NUM_LEDS, CRGB::White);
  FastLED.show();
  Serial.println("OK: RGB LEDs ON (White)");
}

void rgbOff() {
  FastLED.clear();
  FastLED.show();
  Serial.println("OK: RGB LEDs OFF");
}

void rgbRed() {
  fill_solid(leds, NUM_LEDS, CRGB::Red);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Red");
}

void rgbGreen() {
  fill_solid(leds, NUM_LEDS, CRGB::Green);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Green");
}

void rgbBlue() {
  fill_solid(leds, NUM_LEDS, CRGB::Blue);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Blue");
}

void rgbPurple() {
  fill_solid(leds, NUM_LEDS, CRGB::Purple);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Purple");
}

void rgbCyan() {
  fill_solid(leds, NUM_LEDS, CRGB::Cyan);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Cyan");
}

void rgbYellow() {
  fill_solid(leds, NUM_LEDS, CRGB::Yellow);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Yellow");
}

void rgbWarm() {
  fill_solid(leds, NUM_LEDS, CRGB(255, 147, 41));  // Warm white/orange
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Warm White");
}

void rgbRainbow() {
  fill_rainbow(leds, NUM_LEDS, 0, 32);
  FastLED.show();
  Serial.println("OK: RGB LEDs set to Rainbow");
}

// ===== WINDOW FUNCTIONS =====
void windowOpen() {
  windowServo.write(90);
  Serial.println("OK: Window fully open (90°)");
}

void windowClose() {
  windowServo.write(0);
  Serial.println("OK: Window closed (0°)");
}

void setWindowPosition(int percentage) {
  // Convert percentage (0-100) to servo angle (0-90)
  percentage = constrain(percentage, 0, 100);
  int angle = map(percentage, 0, 100, 0, 90);
  windowServo.write(angle);
  Serial.print("OK: Window set to ");
  Serial.print(percentage);
  Serial.print("% (");
  Serial.print(angle);
  Serial.println("°)");
}