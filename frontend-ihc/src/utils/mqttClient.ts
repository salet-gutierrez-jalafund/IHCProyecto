import mqtt, { MqttClient } from "mqtt";

let client: MqttClient | null = null;

interface MQTTOptions {
    host: string;
    port: number;
    protocol: "mqtt" | "mqtts" | "ws" | "wss";
    clientId: string;
    clean: boolean;
    reconnectPeriod: number;
    connectTimeout: number;
}

export const connectMQTT = (): MqttClient => {
    if (client) return client;

    const options: MQTTOptions = {
        host: process.env.NEXT_MOSQUITO_HOST ?? "localhost",
        port: 1883,
        protocol: "mqtt",
        clientId: `nextjs_client_${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000,
    };

    client = mqtt.connect(options);

    client.on("connect", () => {
        console.log("✅ Conectado al broker MQTT");

        client?.subscribe("topico/cpd/temperatura", (err?: any) => {
            if (!err) {
                console.log("📡 Suscrito al tópico: topico/cpd/temperatura");
            } else {
                console.error("❌ Error al suscribirse:", err);
            }
        });
    });

    client.on("message", (topic: string, message: Buffer) => {
        console.log("📨 Mensaje recibido:");
        console.log("   Tópico:", topic);
        console.log("   Mensaje:", message.toString());
        console.log("   Timestamp:", new Date().toISOString());
        console.log("---");
    });

    client.on("error", (error: Error) => {
        console.error("❌ Error MQTT:", error);
    });

    client.on("close", () => {
        console.log("🔌 Desconectado del broker MQTT");
    });

    return client;
};

export const disconnectMQTT = (): void => {
    if (client) {
        client.end();
        client = null;
        console.log("🔌 Cliente MQTT desconectado");
    }
};
