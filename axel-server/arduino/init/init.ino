void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
  randomSeed(analogRead(0));
  Serial.println("Sistema de sensores de luminosidad para el servidor de Axel");
  delay(1000);
}

void loop() {
  // Generar datos random de luminosidad (100-1000 lux)
  int luminosidad = random(100, 1001);
  
  // Enviar datos en formato JSON
  Serial.print("{");
  Serial.print("\"luminosidad\":");
  Serial.print(luminosidad);
  Serial.print(",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");
  
  // Parpadear LED para indicar envío
  digitalWrite(LED_BUILTIN, HIGH);
  delay(100);
  digitalWrite(LED_BUILTIN, LOW);
  
  delay(2000);
}