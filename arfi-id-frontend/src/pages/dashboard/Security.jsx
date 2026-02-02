import React from 'react'
import { useAuth } from '../../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');

        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-foreground mb-4">Security</h1>
            <p className="text-muted-foreground mb-6">Protected Security Page</p>
            
            {/* logout Button */}
            <button
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
                onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Setting