import React, { useEffect, useState } from 'react';
import { Monitor, Smartphone, Globe, Clock, LogOut } from 'lucide-react';
import { getActiveSessions, logoutSession } from '../../service/sessionService';

const Devices = () => {

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getActiveSessions();
      setSessions(data.reverse());
    } catch (err) {
      setError('Failed to load sessions.');
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async (sessionId) => {
    try {
      await logoutSession(sessionId);
      // dont make the api call again, just filter out the logged out session
      setSessions(sessions.filter(session => session.id !== sessionId));
    } catch (err) {
      setError('Failed to log out of session.');
      console.error(err);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const formatLastActive = (timestamp) => {
    const now = new Date();
    const lastActiveDate = new Date(timestamp);
    const diffInMs = now - lastActiveDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Active now';
    } else if (diffInHours < 1) {
      return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getDeviceIcon = (type) => { switch (type) { case 'mobile': return Smartphone; default: return Monitor; } };

  const handleLogoutAll = () => console.log('Logout all other sessions');

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Devices & Sessions</h1>
        <p className="text-sm md:text-base text-muted-foreground">Manage your active sessions and trusted devices</p>
      </div>

      <main className="max-w-5xl mx-auto space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">Active Sessions</h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              {sessions.length} devices currently signed in
            </p>
          </div>
          <button
            onClick={handleLogoutAll}
            className="btn-outline text-destructive border-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 w-full sm:w-auto text-sm md:text-base whitespace-nowrap"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out all other devices</span>
            <span className="sm:hidden">Sign out all others</span>
          </button>
        </div>
        <div className="space-y-3 md:space-y-4">
          {sessions.map((session, index) => {
            const DeviceIcon = getDeviceIcon(session.deviceType);

            return (
              <div
                key={session.id}
                className="card-elevated p-4 md:p-5 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${session.currentSession
                          ? 'bg-success/10 text-success'
                          : 'bg-secondary text-muted-foreground'
                        }`}
                    >
                      <DeviceIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>

                    <div className="space-y-1.5 md:space-y-2 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm md:text-base">
                          {session.os}
                        </h3>
                        {session.currentSession && (
                          <span className="text-[10px] md:text-xs bg-success/10 text-success px-1.5 md:px-2 py-0.5 rounded-full font-medium">
                            This device
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{session.browser}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs md:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          {formatLastActive(session.lastActive)}
                        </span>
                        <span className="text-[10px] md:text-xs">
                          IP: {session.ipAddress}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!session.currentSession && (
                    <button
                      onClick={() => handleLogout(session.id)}
                      className="btn-outline text-destructive border-destructive hover:bg-destructive/10 flex items-center justify-center gap-2 w-full sm:w-auto text-sm md:text-base flex-shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 md:p-4 flex items-start gap-3">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Monitor className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground mb-0.5 md:mb-1 text-sm md:text-base">
              Security Tip
            </h4>
            <p className="text-xs md:text-sm text-muted-foreground">
              If you see a device you don't recognize, sign out of it immediately and change your password.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Devices;
