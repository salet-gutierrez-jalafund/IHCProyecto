import serial
import time
import paho.mqtt.client as mqtt
from rich import print
from rich.panel import Panel
import json
from dotenv import load_dotenv
import os

load_dotenv()

TOPICS = {
    "distance": "topico/cpd/distance",
    "gas": "topico/cpd/gas",
    "timestamp": "topico/cpd/timestamp"
}

class SensorListener:
    def __init__(
        self,
        serial_port: str = "/dev/ttyUSB0",
        baud_rate: int = 9600,
        mqtt_broker: str = os.getenv("MOSQUITO_HOST","localhost"),
        mqtt_port: int = 1883,
        timeout: float = 1.0,
    ):
        print(os.getenv("MOSQUITO_HOST"))
        self.serial_port = serial_port
        self.baud_rate = baud_rate
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.timeout = timeout

        self.ser = None
        self.client = mqtt.Client()

        self._connect_serial()
        self._connect_mqtt()

    def _connect_serial(self):
        try:
            self.ser = serial.Serial(self.serial_port, self.baud_rate, timeout=self.timeout)
            time.sleep(2)  # Esperar a que el Arduino se inicialice
            print(Panel("Connected to Arduino", title="Serial", style="green"))
        except serial.SerialException as e:
            print(
                Panel(
                    f"Failed to connect to Arduino: {e}",
                    title="Serial Error",
                    style="red",
                )
            )
            raise SystemExit(1)

    def _connect_mqtt(self):
        try:
            self.client.connect(self.mqtt_broker, self.mqtt_port)
            print(Panel("Connected to MQTT broker", title="MQTT", style="green"))
        except Exception as e:
            print(
                Panel(
                    f"Failed to connect to MQTT broker: {e}",
                    title="MQTT Error",
                    style="red",
                )
            )
            raise SystemExit(1)

    def listen(self):
        print(
            Panel(
                "System started. Reading from Arduino and publishing to MQTT...\nPress Ctrl+C to exit",
                style="cyan",
            )
        )
        try:
            while True:
                raw_line = self.ser.readline().decode("utf-8").strip()
                if not raw_line:
                    continue

                print(Panel(f"Received raw: {raw_line}", style="cyan"))

                try:
                    # Parsear la línea como JSON
                    data = json.loads(raw_line)
                    
                    # Publicar cada campo al tópico correspondiente
                    for field, value in data.items():
                        if field in TOPICS:
                            topic = TOPICS[field]
                            self.client.publish(topic, str(value))
                            print(
                                f"  → [yellow]{field}[/yellow]: [bold]{value}[/bold] sent to [magenta]{topic}[/magenta]"
                            )
                        else:
                            print(f"[italic red]Unknown field:[/italic red] {field}")

                except json.JSONDecodeError:
                    print(f"[italic red]Failed to parse JSON:[/italic red] {raw_line}")
                except Exception as e:
                    print(f"[italic red]Error processing message:[/italic red] {e}")

        except KeyboardInterrupt:
            print(Panel("Disconnecting…", style="yellow"))
            self._cleanup()

    def _cleanup(self):
        if self.ser and self.ser.is_open:
            self.ser.close()
        if self.client:
            self.client.disconnect()
        print(Panel("All connections closed. Goodbye!", style="green"))

if __name__ == "__main__":
    listener = SensorListener(
        serial_port="/dev/ttyUSB0",  # Cambia a COM3, COM4, etc. en Windows
        baud_rate=9600,
        mqtt_broker=os.getenv("MOSQUITO_HOST","localhost"),
        mqtt_port=1883,
        timeout=1.0,
    )
    listener.listen()