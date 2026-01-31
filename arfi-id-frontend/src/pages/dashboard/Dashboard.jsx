import React from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
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
        <div> Protected Dashboard
            {/* logout Button */}
            <button
                className="m-5 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition" 
                onClick={handleLogout}>Logout</button>
        </div>
    )
}

export default Dashboard