import express from 'express';
import dotenv from 'dotenv';
import { connectDb } from './config/db.js';
import chatRoutes from './routes/chat.js';
const app = express();
dotenv.config();
const port = process.env.PORT || 5002;
app.use(express.json());
app.use("/api/v1", chatRoutes);
app.listen(port, async () => {
    await connectDb();
    console.log(`Server is running on ${port}`);
});
//# sourceMappingURL=index.js.map