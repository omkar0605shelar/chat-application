import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addMessage, markSeen } from '../features/chat/chatSlice';
import toast from 'react-hot-toast';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!token || !user) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('newMessage', (msg) => {
      dispatch(addMessage(msg));
      // Optional: Browser notification or toast if not active chat
    });

    socket.on('messagesSeen', ({ chatId }) => {
      dispatch(markSeen({ chatId }));
    });

    socket.on('newFriendRequest', (req) => {
      toast.success(`New friend request from ${req.senderName}`);
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, token, dispatch]);

  return socketRef.current;
};
