import api from "../lib/axios";

export const getActiveSessions = async () => {
    const response = await api.get('/auth/session');
    return response.data;
};

export const logoutSession = async (sessionId) => {
    const response = await api.delete(`/auth/session/${sessionId}`);
    return response.data;
}