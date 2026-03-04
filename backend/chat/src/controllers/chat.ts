import axios from "axios";
import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/Chat.js";
import { Messages } from "../models/Message.js";
import { io, userSocketMap } from "../index.js";

export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  const { otherUserId } = req.body;

  if (!otherUserId) {
    res.status(400).json({
      message: "Other userid is required."
    })

    return;
  }

  const existingChat = await Chat.findOne({
    users: {
      $all: [userId, otherUserId],
      $size: 2
    }
  })

  if (existingChat) {
    res.json({
      message: "Chat already exists",
      chatId: existingChat._id
    })
    return;
  }

  const newChat = await Chat.create({
    users: [userId, otherUserId],
  });

  res.status(201).json({
    message: "new chat created",
    chatId: newChat._id
  })
})

export const getAllChats = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(400).json({
      message: "UserId missing."
    })
    return;
  }

  const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

  const chatWithUserData = await Promise.all(
    chats.map(async (chat) => {
      const otherUserId = chat.users.find((id) => id !== userId);

      const unseenCount = await Messages.countDocuments({
        chatId: chat._id,
        sender: {
          $ne: userId
        },
        seen: false
      });

      try {
        const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`)

        return {
          user: data,
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          }
        }
      } catch (error) {
        console.log("Error while chat with user data", error);

        return {
          user: { _id: otherUserId, name: "Unknown User" },
          chat: {
            ...chat.toObject(),
            latestMessage: chat.latestMessage || null,
            unseenCount,
          }
        }
      }
    })
  )

  res.json({
    chats: chatWithUserData
  })
})

export const sendMessage = TryCatch(async (req: AuthenticatedRequest, res) => {
  const senderId = req.user?._id;
  const { chatId, text } = req.body;
  const imageFile = req.file;

  if (!senderId) {
    res.status(401).json({
      message: "Unauthorized."
    })

    return;
  }

  if (!chatId) {
    res.status(400).json({
      message: "ChatId required."
    })
    return;
  }

  if (!text && !imageFile) {
    res.status(400).json({
      message: "Either text or image is required."
    })

    return;
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404).json({
      message: "Chat not found."
    });

    return;
  }

  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === senderId.toString()
  )

  if (!isUserInChat) {
    res.status(403).json({
      message: "you are not a participant of these chat."
    })

    return;
  }

  const otherUserId = chat.users.find(
    (userId) => userId.toString() !== senderId.toString()
  )

  if (!otherUserId) {
    res.status(401).json({
      message: "No other user."
    })

    return;
  }

  //socket setup

  let messageData: any = {
    chatId: chatId,
    sender: senderId,
    seen: false,
    seenAt: undefined,
  }

  if (imageFile) {
    messageData.image = {
      url: imageFile.path,
      publicId: imageFile.filename
    };

    messageData.messageType = "image";
    messageData.text = text || "";
  }
  else {
    messageData.text = text;
    messageData.messageType = "text";
  }
  const message = new Messages(messageData);

  const savedMessage = await message.save();

  const latestMessageText = imageFile ? "📷 Image" : text

  await Chat.findByIdAndUpdate(chatId, {
    latestMessage: {
      text: latestMessageText,
      sender: senderId
    },
    updatedAt: new Date(),
  }, { returnDocument: 'after' });

  //emit to sockets
  const receiverId = otherUserId.toString();
  const receiverSocketId = userSocketMap[receiverId];

  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", savedMessage);
  }

  res.status(201).json({
    message: savedMessage,
    sender: senderId
  })
})

export const markAsRead = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const { chatId } = req.params;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized." });
    return;
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    res.status(404).json({ message: "Chat not found." });
    return;
  }

  const isUserInChat = chat.users.includes(userId.toString());
  if (!isUserInChat) {
    res.status(403).json({ message: "Access denied." });
    return;
  }

  await Messages.updateMany(
    { chatId, sender: { $ne: userId }, seen: false },
    { seen: true, seenAt: new Date() }
  );

  const otherUserId = chat.users.find(id => id !== userId.toString());
  if (otherUserId) {
    const otherUserSocketId = userSocketMap[otherUserId];
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("messagesSeen", { chatId, seenAt: new Date() });
    }
  }

  res.json({ message: "Messages marked as read" });
});

export const getMessagesByChat = TryCatch(async (req: AuthenticatedRequest, res) => {
  const userId = req.user?._id;
  const { chatId } = req.params;

  if (!chatId) {
    res.status(400).json({
      message: "ChatId required."
    })

    return;
  }

  if (!userId) {
    res.status(401).json({
      message: "Unauthorized."
    })

    return;
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    res.status(404).json({
      message: "Chat not found."
    })

    return;
  }


  const isUserInChat = chat.users.some(
    (userId) => userId.toString() === userId.toString()
  )

  if (!isUserInChat) {
    res.status(403).json({
      message: "You are not participant of these chat"
    })
    return;
  }

  const messagesToMarkSeen = await Messages.find({
    chatId: chatId,
    sender: {
      $ne: userId
    },
    seen: false
  })

  await Messages.updateMany({
    chatId: chatId,
    sender: { $ne: userId },
    seen: false
  }, {
    seen: true,
    seenAt: new Date()
  })

  const messages = await Messages.find({ chatId }).sort({ createdAt: 1 });

  const otherUserId = chat.users.find(
    (user) => user.toString() !== userId.toString()
  )

  try {
    const { data } = await axios.get(`${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`);

    if (!otherUserId) {
      res.status(400).json({
        message: "No other user."
      })
      return;
    }

    //socket work
    if (otherUserId) {
      const otherUserSocketId = userSocketMap[otherUserId.toString()];
      if (otherUserSocketId) {
        io.to(otherUserSocketId).emit("messagesSeen", { chatId, seenAt: new Date() });
      }
    }

    res.json({
      messages,
      user: data,
    })
  } catch (error) {
    console.log(error);
    res.json({
      messages,
      user: { _id: otherUserId, name: "Unknown User" }
    })
  }
})