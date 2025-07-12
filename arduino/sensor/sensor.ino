void setup() {
  Serial.begin(9600);
}

void loop() {
  delay(2000);
  
  float temperatura = random(20, 30);
  float humedad = random(40, 80);
  long gas = random(100, 1000);
  
  Serial.print(" Temperatura: ");
  Serial.print(temperatura);
  Serial.println(" C ");
  Serial.print(" Humedad: ");
  Serial.print(humedad);
  Serial.println(" % ");
  Serial.print(" Gas: ");
  Serial.print(gas);
  Serial.println(" ppm");
  Serial.println(" ---------------------------");
}
