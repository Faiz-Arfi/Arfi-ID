import React, { useEffect, useState } from 'react'
import Sidebar from '../../components/dashboard/Sidebar'
import { useAuth } from '../../components/auth/AuthContext'
import Security from './Security';
import Overview from './Overview';
import { Route, Routes } from 'react-router-dom';
import Devices from './Devices';
import ConnectedApps from './ConnectedApps';
import { getAppData } from '../../service/projectManagementService';

const Dashboard = () => {

    const user = useAuth().user;
    const [appData, setAppData] = useState({
        connectedApps: [],
        revokedApps: [],
        availableApps: [],
        isLoading: true
    });

    useEffect(() => {
        const fetchAppData = async () => {
            try {
                const response = await getAppData();
                const apps = Array.isArray(response) ? response : [response];

                const connected = apps.filter(app => app.connected && !app.revoked);
                const available = apps.filter(app => !app.connected && !app.revoked);
                const revoked = apps.filter(app => app.revoked);

                setAppData({
                    connectedApps: connected,
                    availableApps: available,
                    revokedApps: revoked,
                    isLoading: false
                });
            } catch (error) {
                console.error('Error fetching app data:', error);
                setAppData(prev => ({ ...prev, isLoading: false }));
            }
        };
        fetchAppData();
    }, []);

    return (
        <div className="flex min-h-screen bg-background w-full">
            <Sidebar user={user} />

            {/* Main content area with top padding on mobile for fixed header */}
            <div className="flex-1 pt-16 lg:pt-0 min-w-0 overflow-x-hidden">
                <Routes>
                    <Route index element={<Overview />} />
                    <Route path="security" element={<Security />} />
                    <Route path="devices" element={<Devices />} />
                    <Route path="apps" element={<ConnectedApps
                        connectedApps={appData.connectedApps}
                        availableApps={appData.availableApps}
                        revokedApps={appData.revokedApps}
                        isLoading={appData.isLoading}
                        setConnectedApps={(apps) => setAppData(prev => ({ ...prev, connectedApps: apps }))}
                        setAvailableApps={(apps) => setAppData(prev => ({ ...prev, availableApps: apps }))}
                        setRevokedApps={(apps) => setAppData(prev => ({ ...prev, revokedApps: apps }))}
                    />} />
                </Routes>
            </div>
        </div>
    )
}

export default Dashboard