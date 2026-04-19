import axios from 'axios';

const createInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    // Do not force Content-Type globally.
    // Axios will set the correct header for JSON bodies and will allow the browser
    // to set multipart boundaries for FormData uploads.
    headers: {},
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
export const userApi = createInstance(`${import.meta.env.VITE_USER_SERVICE_URL}`);

// Chat Service API
export const chatApi = createInstance(`${import.meta.env.VITE_CHAT_SERVICE_URL}`);

// Export a default instance for general use (pointed to user service)
export default userApi;
