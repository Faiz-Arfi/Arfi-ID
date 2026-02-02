import React from 'react'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../components/auth/AuthContext'
import Security from './Security';
import Overview from './Overview';
import { Route, Routes } from 'react-router-dom';
import Devices from './Devices';

const Dashboard = () => {

    const user = useAuth().user;

    return (
        <div className="flex min-h-screen bg-background w-full">
            <Sidebar user={user} />

            {/* Main content area with top padding on mobile for fixed header */}
            <div className="flex-1 pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="security" element={<Security />} />
                    <Route path="devices" element={<Devices />} />
                </Routes>
            </div>
        </div>
    )
}

export default Dashboard