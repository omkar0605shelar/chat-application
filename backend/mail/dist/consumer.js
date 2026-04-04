import amqp from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
export const startSendOtpConsumer = async () => {
    try {
        // Build RabbitMQ URL from separate env variables or use RABBITMQ_URL directly
        const rabbitmqUrl = process.env.RABBITMQ_URL ||
            `amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("✅ Mail service consumer started listening for otp emails.");
        channel.consume(queueName, async (message) => {
            if (!message)
                return;
            try {
                const { to, subject, body } = JSON.parse(message.content.toString());
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true, // ✅ important for 465
                    auth: {
                        user: process.env.USER,
                        pass: process.env.PASSWORD,
                    },
                });
                await transporter.sendMail({
                    from: process.env.USER,
                    to,
                    subject,
                    text: body,
                });
                console.log(`Otp mail sent to ${to}`);
                channel.ack(message); // ✅ VERY IMPORTANT
            }
            catch (err) {
                console.log("Failed to send otp", err);
                channel.nack(message, false, false);
                // reject message, don't requeue
            }
        });
    }
    catch (err) {
        console.log("Falied to start rabbitmq consumer", err);
    }
};
//# sourceMappingURL=consumer.js.map