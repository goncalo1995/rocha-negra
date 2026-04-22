import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    timeout: 15000, // 15 seconds
});

// Interceptor to add JWT token to requests
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor to handle responses and offline states
api.interceptors.response.use(
    (response) => {
        // If a request succeeds, we know the backend is online
        window.dispatchEvent(new CustomEvent('backend-online'));
        return response;
    },
    (error) => {
        // If there's no response from server (Network Error, Timeout, Connection Refused)
        if (!error.response) {
            window.dispatchEvent(new CustomEvent('backend-offline'));
        }
        return Promise.reject(error);
    }
);

export default api;
