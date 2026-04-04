import amqp from 'amqplib';
import dotenv from 'dotenv';

let channel: amqp.Channel;
dotenv.config();

export const connectRabbitMQ = async () => {
  try{
    // Build RabbitMQ URL from separate env variables or use RABBITMQ_URL directly
    const rabbitmqUrl = process.env.RABBITMQ_URL || 
      `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
    
    const connection = await amqp.connect(rabbitmqUrl);

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