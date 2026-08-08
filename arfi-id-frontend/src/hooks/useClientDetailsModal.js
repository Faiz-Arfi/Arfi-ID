import { useState } from "react";

const useClientDetailsModal = ({
    inspectClient,
    updateClient,
    resetEditForm,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const openModal = async (clientId) => {
        await inspectClient(clientId);
        setIsEditing(false);
        setIsOpen(true);
    }

    const startEdit = () => {
        setIsEditing(true);
    };

    const cancelEdit = () => {
        resetEditForm();
        setIsEditing(false);
    };

    const saveEdit = async (e) => {
        const success = await updateClient(e);

        if (success) {
            setIsEditing(false);
        }
    };

    const closeDetails = () => {
        setIsEditing(false);
        setIsOpen(false);
    };

    return {
        isOpen,
        isEditing,

        openModal,
        startEdit,
        cancelEdit,
        saveEdit,
        closeDetails,
    };
};

export default useClientDetailsModal;