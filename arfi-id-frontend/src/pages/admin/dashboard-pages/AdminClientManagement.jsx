import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useAdminClients from '../../../hooks/useAdminClients';
import useClientDetailsModal from '../../../hooks/useClientDetailsModal';
import CreateClientModal from '../../../components/admin/client-management/CreateClientModal';
import ClientDetailsModal from '../../../components/admin/client-management/ClientDetailsModal';
import ClientTable from '../../../components/admin/client-management/ClientTable';
import ClientHero from '../../../components/admin/client-management/ClientHero';
import ClientSecretAlert from '../../../components/admin/client-management/ClientSecretAlert';

const AdminClientManagement = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    clients,
    selectedClient,
    createdClient,

    isLoading,
    isRefreshing,
    isDetailLoading,
    isCreating,

    form,
    setForm,

    editForm,
    setEditForm,
    resetEditForm,
    isUpdating,

    loadClients,
    inspectClient,
    createClient,
    updateClient,
    deleteClient,
  } = useAdminClients({ setIsCreateOpen });

  const detailsModal = useClientDetailsModal({
    inspectClient,
    updateClient,
    resetEditForm: resetEditForm,
  });

  const totalClients = clients.length;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Copy failed');
    }
  };

  return (
    <div className="space-y-6">
      <ClientHero
        totalClients={totalClients}
        selectedClient={selectedClient}

        isRefreshing={isRefreshing}
        onRefresh={() => loadClients({ silent: true })}
        onCreate={() => setIsCreateOpen(true)}
      />

      <ClientSecretAlert
        clientSecret={createdClient?.clientSecret}
        onCopy={handleCopy}
      />

      <ClientTable
        loading={isLoading}
        clients={clients}
        selectedClient={selectedClient}
        onView={detailsModal.openModal}
        onDelete={deleteClient}
      />


      <CreateClientModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        form={form}
        onFormChange={setForm}
        isCreating={isCreating}
        createProject={createClient}
      />

      <ClientDetailsModal
        open={detailsModal.isOpen}
        project={selectedClient}

        isEditing={detailsModal.isEditing}

        editForm={editForm}
        setEditForm={setEditForm}

        isUpdating={isUpdating}

        onEdit={detailsModal.startEdit}
        onCancelEdit={detailsModal.cancelEdit}
        onSave={detailsModal.saveEdit}

        onClose={detailsModal.closeDetails}
      />
    </div>
  );
};

export default AdminClientManagement;