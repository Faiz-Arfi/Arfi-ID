import api from "../lib/axios";

export const getAppData = async () => {
    const response = await api.get('/auth/projects/status');
    return response.data;
};

export const revokeAppAccess = async (clientId) => {
    const response = await api.post(`/auth/projects/revoke/${clientId}`);
    return response.data;
};

export const restoreAppAccess = async (clientId) => {
    const response = await api.post(`/auth/projects/restore/${clientId}`);
    return response.data;
};

export const connectApp = async (clientId) => {
    const response = await api.post(`/auth/projects/connect/${clientId}`);
    return response.data;
};