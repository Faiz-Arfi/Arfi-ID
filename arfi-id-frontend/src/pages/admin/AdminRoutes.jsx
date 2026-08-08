import { Navigate, Route } from "react-router-dom";

import AdminOverview from "./dashboard-pages/AdminOverview";
import AdminUsers from "./dashboard-pages/AdminUsers";
import AdminProjects from "./dashboard-pages/AdminProjects";
import AdminSecurity from "./dashboard-pages/AdminSecurity";
import AdminLogs from "./dashboard-pages/AdminLogs";
import AdminClientManagement from "./dashboard-pages/AdminClientManagement";

const AdminRoutes = () => (
    <>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="logs" element={<AdminLogs />} />
        <Route path="clients" element={<AdminClientManagement />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </>
);

export default AdminRoutes;