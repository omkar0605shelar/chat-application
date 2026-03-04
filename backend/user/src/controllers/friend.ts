import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";
import { FriendRequest } from "../model/FriendRequest.js";
import { io, userSocketMap } from "../index.js";

export const sendFriendRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user?._id;
    const { receiverId } = req.body;

    if (!receiverId) {
        return res.status(400).json({ success: false, message: "Receiver ID is required." });
    }

    if (senderId === receiverId) {
        return res.status(400).json({ success: false, message: "You cannot send a friend request to yourself." });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
        return res.status(404).json({ success: false, message: "User not found." });
    }

    const isAlreadyFriends = receiver.friends.includes(senderId as any);
    if (isAlreadyFriends) {
        return res.status(400).json({ success: false, message: "You are already friends." });
    }

    const existingRequest = await FriendRequest.findOne({
        sender: senderId,
        receiver: receiverId,
        status: "pending"
    });

    if (existingRequest) {
        return res.status(400).json({ success: false, message: "Friend request already sent." });
    }

    const newRequest = await FriendRequest.create({
        sender: senderId,
        receiver: receiverId
    });

    // Notify receiver via Socket.IO
    const receiverSocketId = userSocketMap[receiverId.toString()];
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newFriendRequest", {
            requestId: newRequest._id,
            senderId: senderId
        });
    }

    res.status(201).json({
        success: true,
        message: "Friend request sent.",
        data: newRequest
    });
});

export const acceptFriendRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ success: false, message: "Friend request not found." });
    }

    if (request.receiver.toString() !== userId?.toString()) {
        return res.status(403).json({ success: false, message: "You are not authorized to accept this request." });
    }

    if (request.status !== "pending") {
        return res.status(400).json({ success: false, message: "Request has already been processed." });
    }

    request.status = "accepted";
    await request.save();

    // Add to friends lists
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: request.sender } });
    await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: userId } });

    // Create conversation in Chat Service
    try {
        await axios.post(`${process.env.CHAT_SERVICE}/api/v1/new`, {
            otherUserId: request.sender
        }, {
            headers: {
                Authorization: req.headers.authorization
            }
        });
    } catch (error) {
        console.error("Error creating conversation in chat service:", error);
        // Even if chat creation fails, the friend request is accepted. 
        // The user might need a retry mechanism or the chat service should handle idempotency.
    }

    // Notify sender via Socket.IO
    const senderSocketId = userSocketMap[request.sender.toString()];
    if (senderSocketId) {
        io.to(senderSocketId).emit("friendRequestAccepted", {
            receiverId: userId
        });
    }

    res.json({
        success: true,
        message: "Friend request accepted.",
        data: request
    });
});

export const rejectFriendRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;
    const { requestId } = req.params;

    const request = await FriendRequest.findById(requestId);
    if (!request) {
        return res.status(404).json({ success: false, message: "Friend request not found." });
    }

    if (request.receiver.toString() !== userId?.toString()) {
        return res.status(403).json({ success: false, message: "You are not authorized to reject this request." });
    }

    request.status = "rejected";
    await request.save();

    res.json({
        success: true,
        message: "Friend request rejected.",
        data: request
    });
});

export const getFriendRequests = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?._id;

    const requests = await FriendRequest.find({
        receiver: userId,
        status: "pending"
    }).populate("sender", "name email");

    res.json({
        success: true,
        data: requests
    });
});
