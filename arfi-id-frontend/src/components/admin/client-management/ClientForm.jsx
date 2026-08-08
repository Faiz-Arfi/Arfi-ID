const ClientForm = ({ values, onChange }) => {

    const handleChange = (field, value) => {
        onChange(current => ({
            ...current,
            [field]: value,
        }));
    };

    return (
        <div className="grid gap-4">

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Client Name
                </label>

                <input
                    type="text"
                    required
                    value={values.clientName}
                    onChange={(e) =>
                        handleChange("clientName", e.target.value)
                    }
                    className="input-field"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Description
                </label>

                <textarea
                    rows={4}
                    required
                    value={values.clientDescription}
                    onChange={(e) =>
                        handleChange(
                            "clientDescription",
                            e.target.value
                        )
                    }
                    className="input-field resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                    Redirect URI
                </label>

                <input
                    type="url"
                    required
                    value={values.redirectUri}
                    onChange={(e) =>
                        handleChange(
                            "redirectUri",
                            e.target.value
                        )
                    }
                    className="input-field"
                />
            </div>

        </div>
    );
};

export default ClientForm;