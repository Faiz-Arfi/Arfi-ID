import { Loader2, Plus } from "lucide-react";
import ClientForm from "./ClientForm";
import Modal from "../../ui/Modal";

const CreateClientModal = ({ open, onClose, form, onFormChange, isCreating, createProject }) => {
    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Register New Client"
            subtitle="Create a new OAuth client for your application."
        >
            <form
                onSubmit={async (e) => {
                    const success = await createProject(e);

                    if (success) {
                        onClose();
                    }
                }}
                className="mt-6 grid gap-4">
                <ClientForm
                    values={form}
                    onChange={onFormChange}
                />

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        {isCreating ? 'Registering...' : 'Register client'}
                    </button>
                </div>
            </form>

        </Modal>
    );
};

export default CreateClientModal;