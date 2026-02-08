import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Shield, ExternalLink, RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import { connectApp, getAppData, restoreAppAccess, revokeAppAccess } from '../../service/projectManagementService';

const ConnectedApps = () => {
  const [connectedApps, setConnectedApps] = useState([]);
  const [availableApps, setAvailableApps] = useState([]);
  const [revokedApps, setRevokedApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppData = async () => {
      try {
        const response = await getAppData();

        // Ensure response is an array
        const apps = Array.isArray(response) ? response : [response];

        // Redistribute apps based on connected and revoked status
        const connected = apps.filter(app => app.connected && !app.revoked);
        const available = apps.filter(app => !app.connected && !app.revoked);
        const revoked = apps.filter(app => app.revoked);

        setConnectedApps(connected);
        setAvailableApps(available);
        setRevokedApps(revoked);
      } catch (error) {
        console.error('Error fetching app data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppData();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastUsed = (timestamp) => {
    if (!timestamp) {
      return 'Never used';
    }

    const now = new Date();
    const lastUsedDate = new Date(timestamp);
    const diffInMs = now - lastUsedDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInHours < 1) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getAppInitial = (clientName) => {
    return clientName?.charAt(0).toUpperCase() || '?';
  };

  const handleConnect = async (clientId) => {
    try {
      const response = await connectApp(clientId);
      const app = availableApps.find(a => a.clientId === clientId);
      if (app) {
        setAvailableApps(availableApps.filter(a => a.clientId !== clientId));
        setConnectedApps([...connectedApps, {
          ...app,
          connected: true,
          connectedOn: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error connecting app:', error);
    }
  };

  const handleRevoke = async (clientId) => {
    try {
      const response = await revokeAppAccess(clientId);
      const app = connectedApps.find(a => a.clientId === clientId);
      if (app) {
        setConnectedApps(connectedApps.filter(a => a.clientId !== clientId));
        setRevokedApps([...revokedApps, {
          ...app,
          revoked: true,
          revokedAt: new Date().toISOString(),
          connected: false
        }]);
      }
    } catch (error) {
      console.error('Error revoking app access:', error);
    }
  };

  const handleRestore = async (clientId) => {
    try {
      const response = await restoreAppAccess(clientId);

      const app = revokedApps.find(a => a.clientId === clientId);
      if (app) {
        setRevokedApps(revokedApps.filter(a => a.clientId !== clientId));
        setConnectedApps([...connectedApps, {
          ...app,
          revoked: false,
          revokedAt: null,
          connected: true,
          connectedOn: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error restoring app access:', error);
    }
  };

  const handleDeleteRevoked = (clientId) => {
    alert('Not implemented yet. This would permanently delete the revoked app from your history.');
    setRevokedApps(revokedApps.filter(a => a.clientId !== clientId));
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading apps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Connected Apps</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage applications that have access to your ArfiID account
        </p>
      </div>

      <main className="max-w-5xl mx-auto space-y-8">
        {/* Connected Apps Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Connected Apps
              <span className="text-sm font-normal text-muted-foreground">
                ({connectedApps.length})
              </span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              These apps currently have access to your account
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {connectedApps.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No connected apps</p>
              </div>
            ) : (
              connectedApps.map((app, index) => (
                <div
                  key={app.clientId}
                  className="card-elevated p-4 md:p-5 animate-fade-in hover:shadow-lg transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl md:text-2xl font-bold text-primary flex-shrink-0">
                        {getAppInitial(app.clientName)}
                      </div>

                      <div className="space-y-2 min-w-0 flex-1">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                            {app.clientName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {app.clientDescription || 'No description available'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Last used: {formatLastUsed(app.lastUsedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Shield className="w-3.5 h-3.5" />
                            Connected: {formatDate(app.connectedOn)}
                          </span>
                          {app.role && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                              {app.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          if (app.redirectUri) {
                            window.open(app.redirectUri, '_blank', 'noopener,noreferrer');
                          } else {
                            alert("Redirection link is not available");
                          }
                        }}
                        className="btn-outline text-primary border-primary hover:bg-primary/10 flex items-center justify-center gap-2 px-4 py-2 text-sm flex-1 sm:flex-initial sm:min-w-[100px]"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </button>
                      <button
                        onClick={() => handleRevoke(app.clientId)}
                        className="btn-outline text-destructive border-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 px-4 py-2 text-sm flex-1 sm:flex-initial sm:min-w-[100px]"
                      >
                        <XCircle className="w-4 h-4" />
                        Revoke
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Available Apps Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-primary" />
              Available Apps
              <span className="text-sm font-normal text-muted-foreground">
                ({availableApps.length})
              </span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Apps that you can connect using the same ArfiID account for a seamless experience. Only connect apps you trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {availableApps.map((app, index) => (
              <div
                key={app.clientId}
                className="card-elevated p-4 md:p-5 animate-fade-in hover:shadow-lg transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl font-bold text-foreground flex-shrink-0">
                    {getAppInitial(app.clientName)}
                  </div>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div>
                      <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                        {app.clientName}
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {app.clientDescription || 'No description available'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleConnect(app.clientId)}
                      className="btn-outline text-primary border-primary hover:bg-primary/10 flex items-center justify-center gap-2 w-full text-sm px-4 py-2 mt-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Revoked Apps Section */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-foreground flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Revoked Apps
              <span className="text-sm font-normal text-muted-foreground">
                ({revokedApps.length})
              </span>
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Apps that no longer have access to your account
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {revokedApps.length === 0 ? (
              <div className="card-elevated p-8 text-center">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No revoked apps</p>
              </div>
            ) : (
              revokedApps.map((app, index) => (
                <div
                  key={app.clientId}
                  className="card-elevated p-4 md:p-5 animate-fade-in opacity-60 hover:opacity-100 transition-all"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-destructive/10 flex items-center justify-center text-xl md:text-2xl font-bold text-destructive/60 flex-shrink-0">
                        {getAppInitial(app.clientName)}
                      </div>

                      <div className="space-y-2 min-w-0 flex-1">
                        <div>
                          <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">
                            {app.clientName}
                          </h3>
                          <p className="text-xs md:text-sm text-muted-foreground">
                            {app.clientDescription || 'No description available'}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-destructive" />
                            Revoked: {formatDate(app.revokedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Manually revoked
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleRestore(app.clientId)}
                        className="btn-outline text-success border-success hover:bg-success/10 flex items-center justify-center gap-2 px-4 py-2 text-sm flex-1 sm:flex-initial sm:min-w-[100px]"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </button>
                      <button
                        onClick={() => handleDeleteRevoked(app.clientId)}
                        className="btn-outline text-destructive border-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 px-4 py-2 text-sm flex-1 sm:flex-initial sm:min-w-[100px]"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Security Info Banner */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 md:p-4 flex items-start gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground mb-0.5 md:mb-1 text-sm md:text-base">
              Security Tip
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              Regularly review your connected apps and revoke access for apps you no longer use. Only grant permissions that apps actually need.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConnectedApps;