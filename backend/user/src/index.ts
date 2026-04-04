import express from 'express';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import cors from 'cors';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDb } from './config/db.js';
import userRoutes from './routes/user.js';
import friendRoutes from './routes/friend.js';
import aiRoutes from './routes/ai.js';
import { connectRabbitMQ } from './config/rabbitmq.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://nextalkchatapp.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = process.env.PORT || 5000;

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('Missing REDIS_URL in environment variables');
}

export const redisClient = createClient({
  url: redisUrl,
})

redisClient.on('error', (err) => {
  console.log('Redis error:', err);
});

redisClient.connect()
  .then(() => {
    console.log("Connected to redis.")
  })
  .catch((err) => {
    console.log("Error connecting to redis:", err);
  })

connectRabbitMQ();

app.use(cors({
  origin: ["http://localhost:5173", "https://nextalkchatapp.onrender.com"],
  credentials: true
}));
app.use(express.json());

app.use("/api/v1", userRoutes);
app.use("/api/v1", aiRoutes);
app.use("/api/v1/friends", friendRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
})

// Socket logic
export const userSocketMap: { [key: string]: string } = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
  });
});

export { io };

httpServer.listen(port, async () => {
  await connectDb();
  console.log(`Server is running on port ${port}`)
})