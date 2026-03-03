import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authService = {
    login: async (email: string) => {
        return api.post('/login', { email });
    },
    verify: async (email: string, otp: string) => {
        return api.post('/verify', { email, otp });
    },
    getMe: async () => {
        return api.get('/me');
    },
    getAllUsers: async () => {
        return api.get('/user/all');
    },
};

export default api;
