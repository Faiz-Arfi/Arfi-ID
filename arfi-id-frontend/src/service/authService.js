import api from "../lib/axios";

export const login = async (credentials) => {
    // return the promise data directily to keep the calling code clean
    const response = await api.post('/auth/login', credentials);
    return response.data;
};

export const register = async (userInfo) => {
    const response = await api.post('/auth/register', userInfo);
    return response.data;
}

export const logout = async () => {
    return await api.post('/auth/logout');
};

export const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};