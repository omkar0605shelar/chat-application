import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";
import { FriendRequest } from "../model/FriendRequest.js";
import { io, userSocketMap, redisClient } from "../index.js";

export const sendFriendRequest = TryCatch(async (req: AuthenticatedRequest, res) => {
    const senderId = req.user!._id;
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
    const userId = req.user!._id;
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
                Authorization: req.headers.authorization!
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
    const userId = req.user!._id;
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
    const userId = req.user!._id;

    const requests = await FriendRequest.find({
        receiver: userId,
        status: "pending"
    }).populate("sender", "name email");

    res.json({
        success: true,
        data: requests
    });
});

export const generateFriendOtp = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id;
    
    // Generate 5-digit OTP
    const otp = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Set in Redis with 10 mins (600 seconds) expiry
    await redisClient.setEx(`friend_otp:${otp}`, 600, userId!.toString());
    
    res.json({
        success: true,
        message: "OTP generated successfully",
        data: { otp, expiresInfo: "10 minutes" }
    });
});

export const addFriendByOtp = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id;
    const { otp } = req.body;
    
    if (!otp) return res.status(400).json({ success: false, message: "OTP is required" });
    
    const friendId = await redisClient.get(`friend_otp:${otp}`);
    
    if (!friendId) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    
    if (friendId === userId?.toString()) {
        return res.status(400).json({ success: false, message: "You cannot add yourself" });
    }
    
    const friend = await User.findById(friendId);
    if (!friend) {
        return res.status(404).json({ success: false, message: "User not found" });
    }
    
    const isAlreadyFriends = friend.friends.includes(userId as any);
    if (isAlreadyFriends) {
        return res.status(400).json({ success: false, message: "You are already friends" });
    }
    
    // Add to friends lists mutually
    await User.findByIdAndUpdate(userId, { $addToSet: { friends: friendId } });
    await User.findByIdAndUpdate(friendId, { $addToSet: { friends: userId } });
    
    // Invalidate the OTP to prevent reuse
    await redisClient.del(`friend_otp:${otp}`);
    
    // Create conversation in Chat Service
    try {
        await axios.post(`${process.env.CHAT_SERVICE}/api/v1/new`, {
            otherUserId: friendId
        }, {
            headers: {
                Authorization: req.headers.authorization!
            }
        });
    } catch (error) {
        console.error("Error creating conversation in chat service via OTP:", error);
    }
    
    // Notify both users' sockets so their UIs update automatically
    const friendSocketId = userSocketMap[friendId];
    if (friendSocketId) {
        io.to(friendSocketId).emit("friendRequestAccepted", {
            receiverId: userId
        });
    }
    
    const mySocketId = userSocketMap[userId!.toString()];
    if (mySocketId) {
        io.to(mySocketId).emit("friendRequestAccepted", {
            receiverId: friendId
        });
    }

    res.json({
        success: true,
        message: "Friend added via OTP successfully",
        data: { friendId }
    });
});

export const getMyFriends = TryCatch(async (req: AuthenticatedRequest, res) => {
    const userId = req.user!._id;
    const user = await User.findById(userId).populate("friends", "name email avatar");
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    // Map to normalized friend format with online status
    const formattedFriends = user.friends.map((f: any) => ({
        _id: f._id.toString(),
        name: f.name,
        email: f.email,
        avatar: f.avatar,
        online: Object.keys(userSocketMap).includes(f._id.toString())
    }));
    
    res.json({
        success: true,
        data: formattedFriends
    });
});
