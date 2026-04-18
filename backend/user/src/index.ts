import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDb } from './config/db.js';
import userRoutes from './routes/user.js';
import friendRoutes from './routes/friend.js';
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "https://nextalkchat.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const port = process.env.PORT || 5000;

app.use(cors({
  origin: ["http://localhost:5173", "https://nextalkchatapp.onrender.com", "https://nextalkchat.onrender.com"],
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