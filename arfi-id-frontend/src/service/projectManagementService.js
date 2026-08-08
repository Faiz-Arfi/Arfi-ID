import api from "../lib/axios";

export const getAppData = async () => {
    const response = await api.get('/auth/projects/status');
    return response.data;
};

export const getAdminProjects = async () => {
    const response = await api.get('/admin/projects');
    return response.data;
};

export const createAdminProject = async (projectData) => {
    const response = await api.post('/admin/projects', projectData);
    return response.data;
};

export const updateAdminProject = async (clientId, projectData) => {
    const response = await api.put(`/admin/projects/${clientId}`, projectData);
    return response.data;
};

export const getAdminProjectById = async (clientId) => {
    const response = await api.get(`/admin/projects/${clientId}`);
    return response.data;
};

export const deleteAdminProject = async (clientId) => {
    const response = await api.delete(`/admin/projects/${clientId}`);
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