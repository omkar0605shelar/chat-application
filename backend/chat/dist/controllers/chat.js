import TryCatch from "../config/TryCatch.js";
import { Chat } from "../models/Chat.js";
export const createNewChat = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const { otherUserId } = req.body;
    if (!otherUserId) {
        res.status(400).json({
            message: "Other userid is required."
        });
        return;
    }
    const existingChat = await Chat.findOne({
        users: {
            $all: [userId, otherUserId],
            $size: 2
        }
    });
    if (existingChat) {
        res.json({
            message: "Chat already exists",
            chatId: existingChat._id
        });
        return;
    }
    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });
    res.status(201).json({
        message: "new chat created",
        chatId: newChat._id
    });
});
export const getAllChats = TryCatch(async (req, res) => {
    const userId = req.user._id;
    if (!userId) {
        res.tstus(40);
    }
});
//# sourceMappingURL=chat.js.map