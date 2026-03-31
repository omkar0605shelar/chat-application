import axios from 'axios';

const createInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add the token to every request
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle common errors (like 401 Unauthorized)
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.error('Session expired or unauthorized');
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// User Service API (Default)
export const userApi = createInstance('http://localhost:5000/api/v1');

// Chat Service API
export const chatApi = createInstance('http://localhost:5002/api/v1');

// Export a default instance for general use (pointed to user service)
export default userApi;
