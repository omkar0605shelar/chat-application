import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { connectDb } from './config/db.js';
import chatRoutes from './routes/chat.js';

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

const port = process.env.PORT || 5002;

app.use(cors({
  origin: ["http://localhost:5173", "https://nextalkchatapp.onrender.com"],
  credentials: true
}));
app.use(express.json());
app.use("/api/v1", chatRoutes);

app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      message: 'Image is too large. Maximum file size is 5MB.',
    });
  }

  if (err) {
    return res.status(500).json({
      message: err.message || 'Internal server error',
    });
  }

  next();
});

// Socket.IO Logic
export const userSocketMap: { [key: string]: string } = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId as string;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("typing", ({ chatId, receiverId, isTyping }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { chatId, isTyping });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io };

httpServer.listen(port, async () => {
  await connectDb();
  console.log(`Server is running on ${port}`)
})