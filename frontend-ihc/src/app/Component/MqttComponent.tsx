"use client"

import { useEffect } from 'react';
import client from '../mqttClient';

const MqttComponent = () => {
  useEffect(() => {
    // Escuchar mensajes en el tema
    client.on('message', (topic, message) => {
      console.log(`Mensaje recibido: ${message.toString()} en el tema ${topic}`);
    });

    // Cleanup al desmontar el componente
    return () => {
      client.end(); // Cierra la conexión MQTT al desmontar
    };
  }, []);

  const sendMessage = () => {
    client.publish('mi/tema', 'Mensaje desde el componente', { qos: 1 });
  };

  return (
    <div>
      <h1>Cliente MQTT en Next.js</h1>
      <button onClick={sendMessage}>Enviar Mensaje</button>
    </div>
  );
};

export default MqttComponent;