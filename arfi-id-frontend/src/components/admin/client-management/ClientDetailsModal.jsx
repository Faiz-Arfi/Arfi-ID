import ClientForm from "./ClientForm";
import Modal from "../../ui/Modal";

const ClientDetailsModal = ({
    open,
    project,

    isEditing,

    editForm,
    setEditForm,

    isUpdating,

    onEdit,
    onCancelEdit,
    onSave,

    onClose,
}) => {
    if (!open || !project) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Client Details"
            subtitle="View and manage this OAuth client."
        >
            {isEditing ? (
                <form
                    onSubmit={onSave}
                    className="space-y-6"
                >
                    <ClientForm
                        values={editForm}
                        onChange={setEditForm}
                    />

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancelEdit}
                            className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="btn-primary"
                        >
                            {isUpdating
                                ? "Saving..."
                                : "Save Changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    <div className="space-y-4">

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Client Name
                            </p>

                            <p className="font-semibold">
                                {project.clientName}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Client ID
                            </p>

                            <p className="font-mono break-all">
                                {project.clientId}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Redirect URI
                            </p>

                            <p className="break-all">
                                {project.redirectUri}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Description
                            </p>

                            <p>
                                {project.clientDescription ||
                                    "No description provided."}
                            </p>
                        </div>

                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-border px-4 py-2 hover:bg-muted"
                        >
                            Close
                        </button>

                        <button
                            type="button"
                            onClick={onEdit}
                            className="btn-primary"
                        >
                            Edit
                        </button>
                    </div>
                </>
            )}

        </Modal>
    );
};

export default ClientDetailsModal;