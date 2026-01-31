import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, // Sends HTTP-only cookies
    //timeout: 10000, 
});

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isAuthPath = ['/auth/me', '/auth/refresh', '/auth/login'].some(path =>
            originalRequest.url?.includes(path)
        );

        // If 401 and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthPath) {
            originalRequest._retry = true;

            // Don't redirect on /auth/me calls - let the auth context handle it
            if (originalRequest.url?.includes('/auth/me')) {
                return Promise.reject(error);
            }

            try {
                await api.post('/auth/refresh');
                return api(originalRequest); // Retry original request
            } catch (refreshError) {
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;