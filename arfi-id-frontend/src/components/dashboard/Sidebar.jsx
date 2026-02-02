import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutGrid, User, Shield, Monitor, Puzzle, Menu, X } from 'lucide-react';
import Logo from '../../icons/Logo';

const MENU_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid, path: '/dashboard' },
    { id: 'security', label: 'Security', icon: Shield, path: '/dashboard/security' },
    { id: 'devices', label: 'Devices', icon: Monitor, path: '/dashboard/devices' },
];

const Sidebar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => setIsOpen(!isOpen);

    // Check if a menu item is active
    const isActive = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(path);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };

    // Reusable Nav Component
    const Navigation = () => (
        <nav className="flex-1 p-3 md:p-4 space-y-1">
            {MENU_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={active ? 'sidebar-item-active w-full text-sm md:text-base' : 'sidebar-item w-full text-sm md:text-base'}
                    >
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );

    return (
        <>
            {/* Mobile top bar */}
            <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border z-50">
                <button
                    onClick={toggleSidebar}
                    className="p-2 bg-sidebar-accent rounded-lg hover:bg-sidebar-accent/80 transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} className="text-sidebar-foreground" /> : <Menu size={24} className="text-sidebar-foreground" />}
                </button>
                <Logo className="w-8" />
                <div className="w-10" /> {/* Spacer for centering logo */}
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={toggleSidebar}
                />
            )}

            {/* sidebar commom for both mobile and desktop view */}
            <aside className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out
            lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* User Profile Section */}
                    <div className="p-4 md:p-6 text-center border-b border-sidebar-border">
                        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-3 md:mb-4 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-sidebar shadow-sm">
                            <User className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                        </div>
                        <h2 className="font-bold text-sidebar-foreground text-base md:text-lg">{user?.name || 'Welcome'}</h2>
                        <p className="text-xs md:text-sm text-muted-foreground">{user?.email || 'username'}</p>
                    </div>

                    <Navigation />

                    {/* Footer Branding */}
                    <div className="p-4 md:p-6 mt-auto border-t border-sidebar-border bg-sidebar-accent/30">
                        <div className="flex items-center justify-center space-x-2">
                            <Logo className="w-16 md:w-20 text-primary" />
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;