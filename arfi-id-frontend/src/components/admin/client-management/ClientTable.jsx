import { useMemo, useState } from "react";
import { Eye, KeyRound, Loader2, Trash2, Search, Plus } from "lucide-react";

const ClientTable = ({
    loading,
    clients,
    selectedClient,
    onView,
    onDelete,
}) => {

    const [search, setSearch] = useState("");

    const filteredClients = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return clients;
        }

        return clients.filter((client) =>
            [
                client.clientId,
                client.clientName,
                client.clientDescription,
                client.redirectUri,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value)
                        .toLowerCase()
                        .includes(query)
                )
        );
    }, [clients, search]);

    const formatSecretPreview = (secret) => {
        if (!secret) {
            return 'Secret is only shown once after registration.';
        }

        if (secret.length <= 18) {
            return secret;
        }

        return `${secret.slice(0, 10)}…${secret.slice(-6)}`;
    };

    return (
        <>
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Registered clients</h3>
                    <p className="text-sm text-muted-foreground">
                        {filteredClients.length} client{filteredClients.length === 1 ? '' : 's'} visible
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

                {loading ? (

                    <div className="flex min-h-[360px] items-center justify-center text-muted-foreground">

                        <div className="flex items-center gap-3">

                            <Loader2 className="h-5 w-5 animate-spin" />

                            Loading client registry...

                        </div>

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
                                {filteredClients.map((client) => (
                                    <tr
                                        key={client.clientId}
                                        className={`transition-colors hover:bg-muted/40 ${selectedClient?.clientId === client.clientId ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="px-5 py-4 align-top">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground">{client.clientName}</p>
                                                <p className="text-xs text-muted-foreground break-all">{client.clientId}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {client.clientDescription || 'No description provided'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-top text-sm text-muted-foreground break-all max-w-[280px]">
                                            {client.redirectUri}
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                                                <KeyRound className="h-3.5 w-3.5" />
                                                {formatSecretPreview(client.clientSecret)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 align-top">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => onView(client.clientId)}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(client.clientId)}
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

        </>

    );

};

export default ClientTable;