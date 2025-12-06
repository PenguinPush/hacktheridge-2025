
#include <Servo.h>
#include <FastLED.h>

#define LED_PIN     7
#define NUM_LEDS    8
#define Lamp_LED    5

CRGB leds[NUM_LEDS];

Servo windowServo;  // create servo object to control a servo
// twelve servo objects can be created on most boards

int pos = 0;    // variable to store the servo position


void setup() {
  windowServo.attach(8); // window servo control pin
  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS);
  pinMode(Lamp_LED, OUTPUT);
}

void loop() {
  for (int brightness = 0; brightness <= 255; brightness += 5) {
    analogWrite(Lamp_LED, brightness); // Set brightness level
    delay(30); // Wait a bit to see the change
  }

  // Fade LED to dim (255 to 0)
  for (int brightness = 255; brightness >= 0; brightness -= 5) {
    analogWrite(Lamp_LED, brightness); // Set brightness level
    delay(30); // Wait a bit to see the change
  }

  for (pos = 0; pos <= 90; pos += 1) { // goes from 0 degrees to 180 degrees
    // in steps of 1 degree
    windowServo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  }
  for (pos = 90; pos >= 0; pos -= 1) { // goes from 180 degrees to 0 degrees
    windowServo.write(pos);              // tell servo to go to position in variable 'pos'
    delay(15);                       // waits 15ms for the servo to reach the position
  } // servo motor code
  leds[0] = CRGB(255, 0, 0);
  FastLED.show();
  delay(500);  
  leds[1] = CRGB(0, 255, 0);
  FastLED.show();
  delay(500);
  leds[2] = CRGB(0, 0, 255);
  FastLED.show();
  delay(500);
  leds[5] = CRGB(150, 0, 255);
  FastLED.show();
}

