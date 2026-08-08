import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import AuthCheckSpinner from "./AuthCheckSpinner";

const ProtectedAdminRoute = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    const hasAdminAccess =
        user?.role === "ADMIN" ||
        user?.role === "ROLE_ADMIN"

    if (isLoading) {
        return <AuthCheckSpinner />;
    }

    if (!user || !hasAdminAccess) {
        return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;