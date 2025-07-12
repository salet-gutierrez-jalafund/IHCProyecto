void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  randomSeed(analogRead(0));
  Serial.println("Sistema de sensores para el servidor de Luiggy");
  delay(1000);
}

void loop() {
  float temperatura = random(1500, 3500) / 100.0;
  float humedad = random(30, 91);
  int puerta = random(0, 2);
  
  Serial.print("{");
  Serial.print("\"temperatura\":");
  Serial.print(temperatura, 2);
  Serial.print(",\"humedad\":");
  Serial.print(humedad, 1);
  Serial.print(",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");
  
  digitalWrite(LED_BUILTIN, HIGH);
  delay(100);
  digitalWrite(LED_BUILTIN, LOW);
  
  delay(1000);
}