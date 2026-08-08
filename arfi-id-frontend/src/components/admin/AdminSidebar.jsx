import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Shield,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthContext';

const navigationItems = [
  { label: 'Overview', path: 'dashboard', icon: LayoutDashboard },
  { label: 'Users', path: 'users', icon: Users },
  { label: 'Projects', path: 'projects', icon: FolderKanban },
  { label: 'Security', path: 'security', icon: Shield },
  { label: 'Audit Logs', path: 'logs', icon: AlertTriangle },
  { label: 'Client Management', path: 'clients', icon: ShieldCheck },
];

const NavItem = ({ item, isCollapsed, onCloseMobile }) => {
  const { label, path, icon: Icon } = item;

  return (
    <NavLink
      to={`/admin/${path}`}
      onClick={onCloseMobile}
      className={({ isActive }) =>
        [
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
          isCollapsed && 'lg:justify-center lg:px-2',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

const AdminSidebar = ({
  isCollapsed,
  isMobileOpen,
  onCloseMobile,
  onToggleCollapse,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out from admin console');
      onCloseMobile?.();
      navigate('/admin-login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  return (
    <aside
      className={`
      fixed left-0 top-0 z-50
      h-screen
      overflow-y-auto
      border-r border-border
      bg-card/95 backdrop-blur-sm
      p-5
      transition-all duration-300
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      ${isCollapsed ? 'lg:w-18' : 'lg:w-72'}
      `}
    >
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-3">
        {!isCollapsed && (
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              ArfiID
            </p>
            <h1 className="mt-1 text-xl font-bold text-foreground">
              Admin Console
            </h1>
          </div>
        )}

        <button
          type="button"
          onClick={onCloseMobile}
          className="ml-auto rounded-lg border border-border p-2 text-foreground lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop Collapse Button */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-6 -right-0 hidden rounded-full border border-border bg-card p-2 text-foreground shadow-md lg:flex"
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isCollapsed={isCollapsed}
            onCloseMobile={onCloseMobile}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-border pt-6">
        {!isCollapsed && (
          <p className="truncate text-sm font-medium text-foreground">
            {user?.email ?? 'Admin user'}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className={[
            'mt-3 flex w-full items-center justify-center gap-2 rounded-lg',
            'border border-border px-3 py-2 text-sm text-foreground',
            'transition-colors hover:bg-muted',
            isCollapsed && 'lg:px-2',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;