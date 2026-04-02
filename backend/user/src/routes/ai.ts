import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { chatCompletion } from "../controllers/ai.js";

const router = express.Router();

router.post("/ai/chat", isAuth, chatCompletion);

export default router;
