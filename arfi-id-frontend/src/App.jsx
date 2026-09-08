import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./components/auth/AuthContext";
import { Toaster } from "sonner";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import OAuthAuth from "./pages/OAuthAuth";
import AdminAuth from "./pages/admin/AdminAuth";
import NotFound from "./pages/NotFound";

// User
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Dashboard from "./pages/dashboard/Dashboard";

// Admin
import ProtectedAdminRoute from "./components/auth/ProtectedAdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";

import AdminOverview from "./pages/admin/dashboard-pages/AdminOverview";
import AdminUsers from "./pages/admin/dashboard-pages/AdminUsers";
import AdminProjects from "./pages/admin/dashboard-pages/AdminProjects";
import AdminSecurity from "./pages/admin/dashboard-pages/AdminSecurity";
import AdminLogs from "./pages/admin/dashboard-pages/AdminLogs";
import AdminClientManagement from "./pages/admin/dashboard-pages/AdminClientManagement";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ========================= */}
          {/* Public Routes */}
          {/* ========================= */}

          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/oauth" element={<OAuthAuth />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin-login" element={<AdminAuth />} />

          {/* ========================= */}
          {/* User Routes */}
          {/* ========================= */}

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
          </Route>

          {/* ========================= */}
          {/* Admin Routes */}
          {/* ========================= */}

          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              {/* Redirect /admin -> /admin/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="clients" element={<AdminClientManagement />} />

              {/* Invalid admin route */}
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* ========================= */}
          {/* 404 */}
          {/* ========================= */}

          <Route path="*" element={<NotFound />} />
        </Routes>

        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;