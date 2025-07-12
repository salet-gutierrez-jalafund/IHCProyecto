import mqtt, { MqttClient, IClientOptions } from 'mqtt';

const brokerUrl = 'mqtt://localhost:1883'; // URL del broker Mosquitto en Docker
const options: IClientOptions = {
  clientId: `mqttjs_${Math.random().toString(16).slice(3)}`, // ID único para el cliente
  // Opcional: Agrega credenciales si el broker las requiere
  // username: 'tu_usuario',
  // password: 'tu_contraseña',
};

const client: MqttClient = mqtt.connect(brokerUrl, options);

client.on('connect', () => {
  console.log('Conectado al broker MQTT');
  // Suscribirse a un tema
  client.subscribe('mi/tema', (err) => {
    if (!err) {
      console.log('Suscrito a mi/tema');
      // Publicar un mensaje
      client.publish('mi/tema', 'Hola desde Next.js con TypeScript', { qos: 1 });
    } else {
      console.error('Error al suscribirse:', err);
    }
  });
});

client.on('message', (topic: string, message: Buffer) => {
  console.log(`Mensaje recibido en ${topic}: ${message.toString()}`);
});

client.on('error', (err) => {
  console.error('Error de conexión:', err);
});

export default client;