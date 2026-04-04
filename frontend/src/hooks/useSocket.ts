import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppSelector } from "../app/hooks";
import { useChatStore } from "../store/useChatStore";
import { useFriendStore } from "../store/useFriendStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useCallStore } from "../store/useCallStore";
import { friendService } from "../services/friendService";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://chat-app-user-5koa.onrender.com";

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token } = useAppSelector((state) => state.auth);

  const {
    addMessage,
    markMessagesAsSeen,
    setOnlineUsers,
    setTyping,
    activeChat,
  } = useChatStore();
  const { addPendingRequest, setFriends } = useFriendStore();
  const { addNotification } = useNotificationStore();
  const { receiveCall } = useCallStore();

  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      query: { userId: user._id },
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("newMessage", (msg) => {
      addMessage(msg);

      if (activeChat?.chat._id !== msg.chatId) {
        addNotification({
          id: msg._id,
          type: "message",
          title: "New Message",
          message: msg.text || "Sent an image",
          timestamp: new Date().toISOString(),
          read: false,
          data: { chatId: msg.chatId },
        });
      }
    });

    socket.on("messagesSeen", ({ chatId }) => {
      markMessagesAsSeen(chatId);
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("typing", ({ chatId, userId, isTyping }) => {
      setTyping(chatId, userId, isTyping);
    });

    socket.on("newFriendRequest", (req) => {
      addPendingRequest(req);
      addNotification({
        id: req._id,
        type: "friend-request",
        title: "Friend Request",
        message: `${req.sender.name} sent you a friend request`,
        timestamp: new Date().toISOString(),
        read: false,
      });
      toast.success(`New friend request from ${req.sender.name}`);
    });

    socket.on("friendRequestAccepted", () => {
      toast.success("Friend request accepted!");
      // Refresh friends list
      friendService.getFriends().then((friends) => setFriends(friends));
    });

    // Call Events
    socket.on("call:offer", ({ from, type }) => {
      receiveCall(from, type);
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [
    user,
    token,
    addMessage,
    markMessagesAsSeen,
    setOnlineUsers,
    setTyping,
    addPendingRequest,
    addNotification,
    receiveCall,
    activeChat,
  ]);

  return socketRef.current;
};
