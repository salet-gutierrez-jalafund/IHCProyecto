"use client";

import { useEffect, useState } from "react";
import mqtt, { MqttClient } from "mqtt";

interface SensorData {
    temperatura: string;
    humedad: string;
    presion: string;
    luminosidad: string;
    timestamp: string;
}

const MQTTClient = () => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<
        { topic: string; message: string; timestamp: Date }[]
    >([]);
    const [sensorData, setSensorData] = useState<SensorData>({
        temperatura: "",
        humedad: "",
        presion: "",
        luminosidad: "",
        timestamp: "",
    });

    const MQTT_BROKER = "ws://localhost:9001";
    const TOPICS = [
        "topico/cpd/temperatura",
        "topico/cpd/humedad",
        "topico/cpd/presion",
        "topico/cpd/luminosidad",
        "topico/cpd/timestamp",
    ];

    useEffect(() => {
        const mqttClient = mqtt.connect(MQTT_BROKER);

        mqttClient.on("connect", () => {
            console.log("Conectado a MQTT broker");
            setIsConnected(true);

            TOPICS.forEach((topic) => {
                mqttClient.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`Error suscribiendo a ${topic}:`, err);
                    } else {
                        console.log(`Suscrito a ${topic}`);
                    }
                });
            });
        });

        mqttClient.on("message", (topic, message) => {
            const messageStr = message.toString();
            console.log(`Mensaje recibido en ${topic}: ${messageStr}`);

            setMessages((prev) => [
                ...prev.slice(-19),
                {
                    topic,
                    message: messageStr,
                    timestamp: new Date(),
                },
            ]);

            // TODO: push to database

            const topicName = topic.split("/").pop();
            if (topicName) {
                setSensorData((prev) => ({
                    ...prev,
                    [topicName]: messageStr,
                }));
            }
        });

        mqttClient.on("error", (err) => {
            console.error("Error MQTT:", err);
            setIsConnected(false);
        });

        mqttClient.on("close", () => {
            console.log("Conexión MQTT cerrada");
            setIsConnected(false);
        });

        setClient(mqttClient);

        return () => {
            if (mqttClient) {
                mqttClient.end();
            }
        };
    }, []);

    const clearMessages = () => {
        setMessages([]);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Monitor de Sensores MQTT
            </h1>

            {/* Estado de conexión */}
            <div className="mb-6 text-center">
                <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        isConnected
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                >
                    {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
                </span>
            </div>

            {/* Datos actuales de sensores */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-blue-800">Temperatura</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {sensorData.temperatura || "--"}
                    </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-green-800">Humedad</h3>
                    <p className="text-2xl font-bold text-green-600">
                        {sensorData.humedad || "--"}
                    </p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-yellow-800">Presión</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                        {sensorData.presion || "--"}
                    </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border">
                    <h3 className="font-semibold text-purple-800">
                        Luminosidad
                    </h3>
                    <p className="text-2xl font-bold text-purple-600">
                        {sensorData.luminosidad || "--"}
                    </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border md:col-span-2 lg:col-span-2">
                    <h3 className="font-semibold text-gray-800">Timestamp</h3>
                    <p className="text-lg font-bold text-gray-600">
                        {sensorData.timestamp || "--"}
                    </p>
                </div>
            </div>

            {/* Historial de mensajes */}
            <div className="bg-white border rounded-lg">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        Historial de Mensajes
                    </h2>
                    <button
                        onClick={clearMessages}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Limpiar
                    </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            No hay mensajes aún...
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className="p-3 border-b last:border-b-0 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-600">
                                            {msg.topic}
                                        </div>
                                        <div className="text-lg font-mono">
                                            {msg.message}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 ml-2">
                                        {msg.timestamp.toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MQTTClient;
