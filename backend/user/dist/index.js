import express from 'express';
import dotenv from 'dotenv';
import { createClient } from 'redis';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDb } from './config/db.js';
import userRoutes from './routes/user.js';
import friendRoutes from './routes/friend.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const port = process.env.PORT || 5000;
export const redisClient = createClient({
    url: process.env.REDIS_URL
});
redisClient.connect()
    .then(() => {
    console.log("Connected to redis.");
})
    .catch((err) => {
    console.log("Error connecting to redis:", err);
});
connectRabbitMQ();
app.use(cors());
app.use(express.json());
app.use("/api/v1", userRoutes);
app.use("/api/v1/friends", friendRoutes);
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
// Socket logic
export const userSocketMap = {};
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId)
        userSocketMap[userId] = socket.id;
    socket.on("disconnect", () => {
        delete userSocketMap[userId];
    });
});
export { io };
httpServer.listen(port, async () => {
    await connectDb();
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map