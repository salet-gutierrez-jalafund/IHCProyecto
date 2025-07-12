import serial
import time
import json
import paho.mqtt.client as mqtt
from rich import print
from rich.panel import Panel
from dotenv import load_dotenv
import os

load_dotenv()

from mqtt_topics import TOPICS

class SensorListener:
    def __init__(
        self,
        serial_port: str = "/dev/ttyUSB0",
        baud_rate: int = 9600,
        mqtt_broker: str = os.getenv("MOSQUITO_HOST", "localhost"),
        mqtt_port: int = 1883,
        timeout: float = 1.0,
    ):
        self.serial_port = serial_port
        self.baud_rate = baud_rate
        self.mqtt_broker = mqtt_broker
        self.mqtt_port = mqtt_port
        self.timeout = timeout

        self.ser = serial.Serial(self.serial_port, self.baud_rate, timeout=self.timeout)
        self.client = mqtt.Client()

        self._connect_serial()
        self._connect_mqtt()

    def _connect_serial(self):
        try:

            time.sleep(2)
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
                    data = json.loads(raw_line)
                    for field, value in data.items():
                        if field in TOPICS:
                            topic = TOPICS[field]
                            self.client.publish(topic, str(value))
                            print(
                                f"  → [yellow]{field}[/yellow]: [bold]{value}[/bold] sent to [magenta]{topic}[/magenta]"
                            )
                except json.JSONDecodeError:
                    print(f"[italic red]Non-JSON message:[/italic red] {raw_line}")

        except KeyboardInterrupt:
            print(Panel("Disconnecting…", style="yellow"))
            self._cleanup()

    def _cleanup(self):
        if self.ser and self.ser.is_open:
            self.ser.close()
        if self.client:
            self.client.disconnect()
        print(Panel("All connections closed. Goodbye!", style="green"))
