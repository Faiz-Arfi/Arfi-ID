const Modal = ({
    open,
    onClose,
    title,
    subtitle,
    children,
    size = "2xl",
}) => {
    if (!open) return null;

    const maxWidth = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
        "2xl": "max-w-2xl",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm px-4">

            <div
                className={`w-full ${maxWidth[size]} rounded-3xl border border-border bg-card p-6 shadow-2xl`}
            >
                <div className="flex items-start justify-between">

                    <div>
                        <h2 className="text-xl font-bold">
                            {title}
                        </h2>

                        {subtitle && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border px-4 py-2 hover:bg-muted transition-colors"
                    >
                        Close
                    </button>

                </div>

                <div className="mt-6">
                    {children}
                </div>

            </div>
        </div>
    );
};

export default Modal;