import { Outlet, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";

const AdminLayout = () => {
    const location = useLocation();

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setCollapsed] = useState(false);

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen bg-background">

            {isSidebarOpen && (
                <button
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                isCollapsed={isCollapsed}
                isMobileOpen={isSidebarOpen}
                onCloseMobile={() => setSidebarOpen(false)}
                onToggleCollapse={() => setCollapsed(!isCollapsed)}
            />

            <div
                className={`flex flex-1 flex-col transition-all ${isCollapsed ? "lg:ml-28" : "lg:ml-72"
                    }`}
            >
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background lg:hidden p-4">

                    <button onClick={() => setSidebarOpen(true)}>
                        <Menu />
                    </button>

                    <h1 className="font-semibold">
                        Admin Console
                    </h1>

                </header>

                <main className="flex-1 p-6">

                    <Outlet />

                </main>

            </div>
        </div>
    );
};

export default AdminLayout;