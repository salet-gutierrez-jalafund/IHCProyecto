from dotenv import load_dotenv
import os

load_dotenv()
from sensor_listener import SensorListener

if __name__ == "__main__":
    listener = SensorListener(
        serial_port="/dev/ttyUSB0",
        baud_rate=9600,
        mqtt_broker=os.getenv("MOSQUITO_HOST","localhost"),
        mqtt_port=1883,
        timeout=1.0,
    )
    listener.listen()
