import { Plus, RefreshCw, ShieldCheck } from "lucide-react"

const ClientHero = ({ totalClients, selectedClient, isRefreshing, onRefresh, onCreate }) => {
    return (
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
                            onClick={onCreate}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Register client
                        </button>
                        <button
                            type="button"
                            onClick={() => onRefresh()}
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ClientHero