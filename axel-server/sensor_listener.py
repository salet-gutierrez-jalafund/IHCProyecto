import serial
import time
import json
import paho.mqtt.client as mqtt
from rich import print
from rich.panel import Panel

from mqtt_topics import TOPICS


class SensorListener:
    def __init__(
        self,
        serial_port: str = "/dev/ttyUSB0",
        baud_rate: int = 9600,
        mqtt_broker: str = "localhost",
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
            print(Panel("✅ Conectado al Arduino - Sensor de Luminosidad", title="🔌 Serial", style="green"))
        except serial.SerialException as e:
            print(
                Panel(
                    f"❌ Error conectando al Arduino: {e}",
                    title="🚨 Error Serial",
                    style="red",
                )
            )
            raise SystemExit(1)

    def _connect_mqtt(self):
        try:
            self.client.connect(self.mqtt_broker, self.mqtt_port)
            print(Panel("✅ Conectado al broker MQTT", title="📡 MQTT", style="green"))
        except Exception as e:
            print(
                Panel(
                    f"❌ Error conectando al broker MQTT: {e}",
                    title="🚨 Error MQTT",
                    style="red",
                )
            )
            raise SystemExit(1)

    def listen(self):
        print(
            Panel(
                "🚀 Sistema iniciado. Leyendo datos de luminosidad del Arduino y enviando a MQTT...\n💡 Presiona Ctrl+C para salir",
                title="🌟 Axel Server - Monitor de Luminosidad",
                style="cyan",
            )
        )
        try:
            while True:
                raw_line = self.ser.readline().decode("utf-8").strip()
                if not raw_line:
                    continue

                print(Panel(f"📥 Recibido: {raw_line}", style="blue"))

                try:
                    data = json.loads(raw_line)
                    for field, value in data.items():
                        if field in TOPICS:
                            topic = TOPICS[field]
                            self.client.publish(topic, str(value))
                            print(
                                f"  → [yellow]💡 {field}[/yellow]: [bold]{value} lux[/bold] enviado a [magenta]{topic}[/magenta]"
                            )
                        elif field == "timestamp":
                            print(f"  ⏱️  [dim]{field}: {value}[/dim]")
                    print("-" * 50)
                except json.JSONDecodeError:
                    print(f"[italic red]⚠️  Mensaje no JSON:[/italic red] {raw_line}")

        except KeyboardInterrupt:
            print(Panel("🛑 Desconectando...", style="yellow"))
            self._cleanup()

    def _cleanup(self):
        if self.ser and self.ser.is_open:
            self.ser.close()
        if self.client:
            self.client.disconnect()
        print(Panel("✅ Todas las conexiones cerradas. ¡Hasta luego! 👋", style="green"))