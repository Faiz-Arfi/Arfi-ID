import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true, 
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Check if the error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // 2. Avoid infinite loops: Don't attempt refresh if the failed request WAS the refresh or login
            if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/login')) {
                window.location.href = '/auth';
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                // 3. Attempt the refresh
                await api.post('/auth/refresh');
                
                // 4. If successful, retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // 5. If refresh fails, clear everything and go to login
                window.location.href = '/auth';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;