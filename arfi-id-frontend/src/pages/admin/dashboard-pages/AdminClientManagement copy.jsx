import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  Copy,
  PencilLine,
  Eye,
  KeyRound,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  createAdminProject,
  deleteAdminProject,
  getAdminProjectById,
  getAdminProjects,
  updateAdminProject,
} from '../../../service/projectManagementService';

const emptyForm = {
  clientName: '',
  clientDescription: '',
  redirectUri: '',
};

const formatSecretPreview = (secret) => {
  if (!secret) {
    return 'Secret is only shown once after registration.';
  }

  if (secret.length <= 18) {
    return secret;
  }

  return `${secret.slice(0, 10)}…${secret.slice(-6)}`;
};

const AdminClientManagement = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [createdProject, setCreatedProject] = useState(null);
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);

  const loadProjects = async ({ silent = false } = {}) => {
    if (!silent) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const response = await getAdminProjects();
      const items = Array.isArray(response?.content) ? response.content : [];
      setProjects(items);

      if (!selectedProject && items.length > 0) {
        setSelectedProject(items[0]);
      }
    } catch (error) {
      toast.error('Failed to load clients', {
        description: error?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return projects;
    }

    return projects.filter((project) => {
      return [project.clientId, project.clientName, project.clientDescription, project.redirectUri]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [projects, search]);

  const totalProjects = projects.length;

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      toast.error('Copy failed');
    }
  };

  const handleInspectProject = async (clientId) => {
    setIsDetailLoading(true);

    try {
      const response = await getAdminProjectById(clientId);
      setSelectedProject(response);
      setEditForm({
        clientName: response?.clientName || '',
        clientDescription: response?.clientDescription || '',
        redirectUri: response?.redirectUri || '',
      });
    } catch (error) {
      toast.error('Failed to load client details', {
        description: error?.response?.data?.message || 'Please try again.',
      });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedProject) {
      return;
    }

    setEditForm({
      clientName: selectedProject.clientName || '',
      clientDescription: selectedProject.clientDescription || '',
      redirectUri: selectedProject.redirectUri || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (selectedProject) {
      setEditForm({
        clientName: selectedProject.clientName || '',
        clientDescription: selectedProject.clientDescription || '',
        redirectUri: selectedProject.redirectUri || '',
      });
    }
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();

    if (!selectedProject?.clientId) {
      return;
    }

    setIsUpdating(true);

    try {
      const response = await updateAdminProject(selectedProject.clientId, editForm);
      setSelectedProject(response);
      setEditForm({
        clientName: response?.clientName || '',
        clientDescription: response?.clientDescription || '',
        redirectUri: response?.redirectUri || '',
      });
      setIsEditing(false);
      toast.success('Client updated successfully');
      await loadProjects({ silent: true });
    } catch (error) {
      toast.error('Failed to update client', {
        description: error?.response?.data?.message || 'Please review the details and try again.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async (clientId) => {
    const confirmed = window.confirm('Delete this client? This action cannot be undone.');

    if (!confirmed) {
      return;
    }

    try {
      await deleteAdminProject(clientId);
      toast.success('Client deleted');
      if (selectedProject?.clientId === clientId) {
        setSelectedProject(null);
      }
      await loadProjects({ silent: true });
    } catch (error) {
      toast.error('Failed to delete client', {
        description: error?.response?.data?.message || 'Please try again.',
      });
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    setIsCreating(true);

    try {
      const response = await createAdminProject(form);
      setCreatedProject(response);
      toast.success('Client registered successfully');
      setForm(emptyForm);
      setIsCreateOpen(false);
      await loadProjects({ silent: true });
      if (response?.clientId) {
        await handleInspectProject(response.clientId);
      }
    } catch (error) {
      toast.error('Failed to register client', {
        description: error?.response?.data?.message || 'Please review the form and try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border bg-gradient-to-br from-card via-background to-muted/40 p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Admin Controller
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Client registry and OAuth project control
              </h2>
              <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-6">
                Register new OAuth clients, inspect their redirect targets, and manage access from a single
                operational view. Client secrets are revealed only once at creation.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="btn-primary inline-flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Register client
              </button>
              <button
                type="button"
                onClick={() => loadProjects({ silent: true })}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-md">
            <div className="rounded-2xl border border-border bg-card/90 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Total clients</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-3xl font-bold text-foreground">{totalProjects}</span>
                <ArrowLeftRight className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/90 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-lg font-semibold text-foreground truncate">
                  {selectedProject?.clientName || 'None'}
                </span>
                <Eye className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card/90 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Secret policy</p>
              <div className="mt-2 flex items-end justify-between gap-2">
                <span className="text-sm font-medium text-foreground">One-time display</span>
                <KeyRound className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {createdProject?.clientSecret && (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <h3 className="font-semibold">Client registered successfully</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Copy the client secret now. It will not be shown again.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(createdProject.clientSecret)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy secret
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-background/80 p-4 font-mono text-sm break-all text-foreground">
            {createdProject.clientSecret}
          </div>
        </section>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Registered clients</h3>
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} client{filteredProjects.length === 1 ? '' : 's'} visible
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by client name, id, or redirect URI"
                className="input-field pl-11"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card/80 shadow-sm">
            {isLoading ? (
              <div className="flex min-h-[360px] items-center justify-center text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading client registry...
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
                <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-5">
                  <KeyRound className="mx-auto h-10 w-10 text-muted-foreground" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-foreground">No clients found</h4>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  {projects.length === 0
                    ? 'Register the first OAuth client to start managing admin-controlled applications.'
                    : 'Try a broader search or clear the filter.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="btn-primary mt-5 inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Register client
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-left">
                  <thead className="bg-muted/40 text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Client</th>
                      <th className="px-5 py-4 font-semibold">Redirect URI</th>
                      <th className="px-5 py-4 font-semibold">Secret</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {filteredProjects.map((project) => (
                      <tr
                        key={project.clientId}
                        className={`transition-colors hover:bg-muted/40 ${selectedProject?.clientId === project.clientId ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-5 py-4 align-top">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{project.clientName}</p>
                            <p className="text-xs text-muted-foreground break-all">{project.clientId}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.clientDescription || 'No description provided'}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top text-sm text-muted-foreground break-all max-w-[280px]">
                          {project.redirectUri}
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                            <KeyRound className="h-3.5 w-3.5" />
                            {formatSecretPreview(project.clientSecret)}
                          </div>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleInspectProject(project.clientId)}
                              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await handleInspectProject(project.clientId);
                                setIsEditing(true);
                              }}
                              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                            >
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project.clientId)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-700 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-border bg-card/80 p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Client details</h3>
                <p className="text-sm text-muted-foreground">Inspect a client from the registry.</p>
              </div>
              {isDetailLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>

            <div className="mt-5 space-y-4">
              {selectedProject ? (
                isEditing ? (
                  <form onSubmit={handleUpdateProject} className="space-y-4">
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Client ID</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="break-all font-mono text-sm text-foreground">{selectedProject.clientId}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedProject.clientId)}
                          className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                          aria-label="Copy client id"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Client name</label>
                      <input
                        type="text"
                        required
                        value={editForm.clientName}
                        onChange={(event) => setEditForm((current) => ({ ...current, clientName: event.target.value }))}
                        className="input-field"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Description</label>
                      <textarea
                        rows={4}
                        required
                        value={editForm.clientDescription}
                        onChange={(event) => setEditForm((current) => ({ ...current, clientDescription: event.target.value }))}
                        className="input-field resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Redirect URI</label>
                      <input
                        type="url"
                        required
                        value={editForm.redirectUri}
                        onChange={(event) => setEditForm((current) => ({ ...current, redirectUri: event.target.value }))}
                        className="input-field"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <PencilLine className="h-4 w-4" />}
                        {isUpdating ? 'Saving...' : 'Save changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Client name</p>
                      <p className="mt-1 text-base font-semibold text-foreground">{selectedProject.clientName}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Client ID</p>
                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="break-all font-mono text-sm text-foreground">{selectedProject.clientId}</p>
                        <button
                          type="button"
                          onClick={() => handleCopy(selectedProject.clientId)}
                          className="shrink-0 rounded-lg border border-border p-2 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
                          aria-label="Copy client id"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Redirect URI</p>
                      <p className="mt-1 break-all text-sm text-foreground">{selectedProject.redirectUri}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Description</p>
                      <p className="mt-1 text-sm leading-6 text-foreground">
                        {selectedProject.clientDescription || 'No description provided.'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-muted/30 p-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Secret state</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedProject.clientSecret ? 'Hash stored on server' : 'Not available in this response'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <PencilLine className="h-4 w-4" />
                        Edit details
                      </button>
                    </div>
                  </>
                )
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-4 text-center">
                  <ShieldCheck className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 font-semibold text-foreground">No client selected</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose a row to inspect its client ID, redirect URI, and metadata.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-muted/30 p-5">
            <h4 className="font-semibold text-foreground">Operational notes</h4>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>• Client secrets are visible once after registration.</li>
              <li>• The list uses the hashed secret returned by the backend for display only.</li>
              <li>• Delete removes a client immediately from the registry.</li>
            </ul>
          </div>
        </aside>
      </section>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-foreground">Register new client</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new OAuth client and copy the secret before closing this dialog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="mt-6 grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Client name</label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                    placeholder="e.g. Arfi Admin Portal"
                    className="input-field"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={form.clientDescription}
                    onChange={(event) => setForm((current) => ({ ...current, clientDescription: event.target.value }))}
                    placeholder="Describe where this client is used and who owns it."
                    className="input-field resize-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Redirect URI</label>
                  <input
                    type="url"
                    required
                    value={form.redirectUri}
                    onChange={(event) => setForm((current) => ({ ...current, redirectUri: event.target.value }))}
                    placeholder="http://localhost:5173"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientManagement;