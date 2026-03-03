import axios from 'axios';

const CHAT_URL = import.meta.env.VITE_SOCKET_URL + '/api/v1';

const chatApi = axios.create({
    baseURL: CHAT_URL,
});

chatApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const chatService = {
    getChats: async () => {
        return chatApi.get('/chat/all');
    },
    getMessages: async (chatId: string) => {
        return chatApi.get(`/message/${chatId}`);
    },
    sendMessage: async (chatId: string, text: string, image?: File) => {
        const formData = new FormData();
        formData.append('chatId', chatId);
        if (text) formData.append('text', text);
        if (image) formData.append('image', image);
        return chatApi.post('/message', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    createChat: async (otherUserId: string) => {
        return chatApi.post('/chat/new', { otherUserId });
    },
};

export default chatApi;
