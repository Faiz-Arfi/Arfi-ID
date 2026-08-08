import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
    createAdminProject,
    deleteAdminProject,
    getAdminProjectById,
    getAdminProjects,
    updateAdminProject,
} from "../service/projectManagementService";

const emptyForm = {
    clientName: "",
    clientDescription: "",
    redirectUri: "",
};

const useAdminClients = ({ setIsCreateOpen }) => {
    // Project data
    const [clients, setClients] = useState([]);
    const [selectedClient, setselectedClient] = useState(null);
    const [createdClient, setCreatedClient] = useState(null);

    // Loading states
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Forms
    const [form, setForm] = useState(emptyForm);
    const [editForm, setEditForm] = useState(emptyForm);

    useEffect(() => {
        loadClients();
    }, []);

    const loadClients = async ({ silent = false } = {}) => {
        if (!silent) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            const response = await getAdminProjects();
            const items = Array.isArray(response?.content)
                ? response.content
                : [];

            setClients(items);

            // Automatically select the first client on initial load
            if (!selectedClient && items.length > 0) {
                setselectedClient(items[0]);
            }
        } catch (error) {
            toast.error("Failed to load clients", {
                description:
                    error?.response?.data?.message || "Please try again.",
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const inspectClient = async (clientId) => {
        setIsDetailLoading(true);

        try {
            const response = await getAdminProjectById(clientId);

            setselectedClient(response);

            setEditForm({
                clientName: response?.clientName || "",
                clientDescription: response?.clientDescription || "",
                redirectUri: response?.redirectUri || "",
            });
        } catch (error) {
            toast.error("Failed to load client details", {
                description:
                    error?.response?.data?.message ||
                    "Please try again.",
            });
        } finally {
            setIsDetailLoading(false);
        }
    };

    const createClient = async (event) => {
        event.preventDefault();

        setIsCreating(true);

        try {
            const response = await createAdminProject(form);

            setCreatedClient(response);

            setIsCreateOpen(false);

            toast.success("Client registered successfully");

            setForm(emptyForm);

            await loadClients({ silent: true });

            if (response?.clientId) {
                await inspectClient(response.clientId);
            }

            return true;
        } catch (error) {
            toast.error("Failed to register client", {
                description:
                    error?.response?.data?.message ||
                    "Please review the form and try again.",
            });

            return false;
        } finally {
            setIsCreating(false);
        }
    };

    const updateClient = async (event) => {
        event.preventDefault();

        if (!selectedClient?.clientId) {
            return false;
        }

        setIsUpdating(true);

        try {
            const response = await updateAdminProject(
                selectedClient.clientId,
                editForm
            );

            setselectedClient(response);

            setEditForm({
                clientName: response?.clientName || "",
                clientDescription: response?.clientDescription || "",
                redirectUri: response?.redirectUri || "",
            });

            toast.success("Client updated successfully");

            await loadClients({ silent: true });

            return true;
        } catch (error) {
            toast.error("Failed to update client", {
                description:
                    error?.response?.data?.message ||
                    "Please review the details and try again.",
            });

            return false;
        } finally {
            setIsUpdating(false);
        }
    };

    const deleteClient = async (clientId) => {
        const confirmed = window.confirm(
            "Delete this client? This action cannot be undone."
        );

        if (!confirmed) {
            return false;
        }

        try {
            await deleteAdminProject(clientId);

            toast.success("Client deleted");

            if (selectedClient?.clientId === clientId) {
                setselectedClient(null);
            }

            await loadClients({ silent: true });

            return true;
        } catch (error) {
            toast.error("Failed to delete client", {
                description:
                    error?.response?.data?.message || "Please try again.",
            });

            return false;
        }
    };

    const resetEditForm = () => {
        if (!selectedClient) return;

        setEditForm({
            clientName: selectedClient.clientName || "",
            clientDescription: selectedClient.clientDescription || "",
            redirectUri: selectedClient.redirectUri || "",
        });
    };

    return {
        clients,
        selectedClient,
        createdClient,

        isLoading,
        isRefreshing,
        isDetailLoading,
        isCreating,
        isUpdating,

        form,
        setForm,
        editForm,
        setEditForm,
        resetEditForm,

        loadClients,
        inspectClient,
        createClient,
        updateClient,
        deleteClient,

        // setSelectedClient,
    };
};

export default useAdminClients;