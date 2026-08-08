import { CheckCircle2, Copy } from "lucide-react";

const ClientSecretAlert = ({
    clientSecret,
    onCopy,
}) => {

    if (!clientSecret) return null;

    return (
        <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                <div className="space-y-2">

                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">

                        <CheckCircle2 className="h-5 w-5" />

                        <h3 className="font-semibold">
                            Client registered successfully
                        </h3>

                    </div>

                    <p className="text-sm text-muted-foreground">
                        Copy the client secret now. It will not be shown again.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={() => onCopy(clientSecret)}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                >
                    <Copy className="h-4 w-4" />

                    Copy Secret

                </button>

            </div>

            <div className="mt-4 rounded-xl border border-emerald-500/20 bg-background/80 p-4 font-mono text-sm break-all">

                {clientSecret}

            </div>

        </section>
    );
};

export default ClientSecretAlert;