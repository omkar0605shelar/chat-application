import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        query: { userId },
    });

    socket.on('connect', () => {
        console.log('Connected to socket', socket?.id);
    });

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
