#include <ArduinoJson.h>

const int TriggerPin = 2;
const int EchoPin = 3;

long duration, distanceCm;

void setup() {
  Serial.begin(9600);
  pinMode(TriggerPin, OUTPUT);
  pinMode(EchoPin, INPUT);
  randomSeed(analogRead(0));
  delay(2000);
}

void loop() {
  StaticJsonDocument<200> doc;
  
  distanceCm = ping(TriggerPin, EchoPin);
  doc["distance"] = distanceCm;
  doc["gas"] = random(100, 1000);
  doc["timestamp"] = millis();
  
  String jsonOutput;
  serializeJson(doc, jsonOutput);
  Serial.println(jsonOutput);

  delay(1000);
}

int ping(int TriggerPin, int EchoPin) {
  digitalWrite(TriggerPin, LOW);
  delayMicroseconds(4);
  digitalWrite(TriggerPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(TriggerPin, LOW);
  duration = pulseIn(EchoPin, HIGH);
  distanceCm = (duration * 0.0343) / 2;
  if (distanceCm <= 0 || distanceCm > 400) {
    distanceCm = 0;
  }
  return distanceCm;
}
