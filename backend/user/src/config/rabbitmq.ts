import amqp from 'amqplib';
import dotenv from 'dotenv';

let channel: amqp.Channel;
dotenv.config();

export const connectRabbitMQ = async () => {
  try{
    const connection = await amqp.connect(process.env.RABBITMQ_URL as string);

    channel = await connection.createChannel()

    console.log("✅ connected to rabbitmq")
  }
  catch(err){
    console.log("Failed to connect to rabbitMQ", err)
  }
}

export const publishToQueue = async (queueName: string, message: any) => {
  if(!channel){
    console.log("Rabbitmq channel is not initialised")
    return;
  }
  await channel.assertQueue(queueName, {durable: true});

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true
  })
}