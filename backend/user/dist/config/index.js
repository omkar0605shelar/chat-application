import express from 'express';
import { connectDb } from './db.js';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(port, async () => {
    await connectDb();
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=index.js.map