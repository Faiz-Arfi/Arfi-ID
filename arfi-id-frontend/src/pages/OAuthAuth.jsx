import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import AuthCheckSpinner from '../components/auth/AuthCheckSpinner';
import ContinueToApp from '../components/auth/ContinueToApp';
import Logo from '../icons/Logo';
import { Link2, ArrowRight, AlertCircle } from 'lucide-react';
import { authorizeOAuth, validateOAuthClient } from '../service/authService';

const OAuthAuth = () => {
  const { user, isLoading, login, register, logout } = useAuth();
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Client validation states
  const [clientInfo, setClientInfo] = useState(null);
  const [isValidatingClient, setIsValidatingClient] = useState(true);
  const [validationError, setValidationError] = useState(null);

  // Authorization states
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizationError, setAuthorizationError] = useState(null);
  const [isNewConnection, setIsNewConnection] = useState(false);

  // Get redirect URL and app info from query params
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_url') || searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const appName = searchParams.get('app_name') || 'Partner App';
  const appLogo = searchParams.get('app_logo');
  const appColor = searchParams.get('app_color') || '#6366f1';

  useEffect(() => {
    const validateClient = async () => {
      if (!clientId || !redirectUri) {
        setValidationError('Missing client_id or redirect_url in the request');
        setIsValidatingClient(false);
        return;
      }

      try {
        setIsValidatingClient(true);
        setValidationError(null);

        const validatedClient = await validateOAuthClient(clientId, redirectUri);
        if(!validatedClient.active) {
          setValidationError('This client application is currently inactive');
          return;
        }
        setClientInfo(validatedClient);
      } catch (error) {
        console.error('Error validating OAuth client:', error);

        if (error.response?.status === 404) {
          setValidationError('Application not found. Please check your link.');
        } else if (error.response?.status === 400) {
          setValidationError(error.response?.data?.message || 'Invalid authorization request');
        } else {
          setValidationError('Failed to validate application. Please try again.');
        }
      } finally {
        setIsValidatingClient(false);
      }
    };

    validateClient();
  }, [clientId, redirectUri]);

  const handleLogin = async (credentials) => {
    try {
      await login( ...credentials, clientId);
      console.log('Login successful, user state updated');
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw so LoginForm can handle it
    }
  };

  const handleRegister = async (data) => {
    try {
      await register(data);
      console.log('Registration successful, proceeding to login');
      await login({ email: data.email, password: data.password, clientId });
      // User state will be set and ContinueToApp will be shown
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw so RegisterForm can handle it
    }
  };

  const handleContinue = async () => {
    try {
      setIsAuthorizing(true);
      setAuthorizationError(null);

      console.log('Requesting authorization code...');
      
      const authResponse = await authorizeOAuth(clientId, redirectUri, state);
      
      console.log('Authorization code received:', authResponse.code.substring(0, 20) + '...');

      // Build redirect URL with authorization code
      const separator = redirectUri.includes('?') ? '&' : '?';
      let redirectUrl = `${redirectUri}${separator}code=${authResponse.code}`;
      
      // Add state for CSRF protection if provided
      if (authResponse.state) {
        redirectUrl += `&state=${authResponse.state}`;
      }

      console.log('Redirecting to:', redirectUrl);

      // Redirect to child app
      window.location.href = redirectUrl;
      
    } catch (error) {
      setIsAuthorizing(false);
      console.error('Authorization failed:', error);

      // Handle specific error cases
      if (error.response?.status === 403) {
        setAuthorizationError(
          'Access to this application has been revoked. Please restore access from your dashboard.'
        );
      } else if (error.response?.status === 401) {
        setAuthorizationError('Your session has expired. Please log in again.');
        // Log out and show login form
        await logout();
        setMode('login');
      } else {
        setAuthorizationError(
          error.response?.data?.message || 'Authorization failed. Please try again.'
        );
      }
    }
  };

  const handleUseAnotherAccount = async () => {
    try {
      await logout();
      setMode('login');
      setAuthorizationError(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Show loading spinner while checking auth status
  if (isLoading || isValidatingClient) {
    return <AuthCheckSpinner />;
  }

  // Show error if client validation failed
  if (validationError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <header className="absolute top-6 left-6">
          <Logo size={28} />
        </header>

        <div className="w-full max-w-md">
          <div className="card-elevated p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            
            <h2 className="text-xl font-bold text-foreground mb-2">
              Authorization Error
            </h2>
            
            <p className="text-sm text-muted-foreground mb-6">
              {validationError}
            </p>

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-secondary w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <Logo size={28} />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* App Linking Visual */}
          <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in">
            {/* Partner App Logo */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-border/50 bg-card"
              style={{ borderColor: appColor + '40' }}
            >
              {appLogo ? (
                <img
                  src={appLogo}
                  alt={appName}
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg ${appLogo ? 'hidden' : 'flex'}`}
                style={{ backgroundColor: appColor }}
              >
                {appName.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Linking Symbol */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground/30 to-primary/50"></div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-primary" />
              </div>
              <div className="w-8 h-0.5 bg-gradient-to-l from-muted-foreground/30 to-primary/50"></div>
            </div>

            {/* ARFI ID Logo */}
            <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center shadow-lg border border-primary/30">
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-foreground">A</span>
                <span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-sm font-bold">ID</span>
              </div>
            </div>
          </div>

          {/* Connection Info */}
          <div className="text-center mb-6 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-1">
              <span className="font-medium text-foreground">{appName}</span> wants to connect
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ArrowRight className="w-3 h-3" />
              <span>Sign in with ARFI ID to continue</span>
            </div>
          </div>

          {/* Logo & Tagline */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold text-foreground">ARFI</span>
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-lg text-lg font-bold">ID</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Secure single sign-on for connected apps
            </p>
          </div>

          {/* Auth Card */}
          <div className="card-elevated p-8">
            {user ? (
              <ContinueToApp
                user={user}
                appName={appName}
                appColor={appColor}
                onContinue={handleContinue}
                onUseAnotherAccount={handleUseAnotherAccount}
                isNewConnection={isNewConnection}
                isLoading={isAuthorizing}
              />
            ) : (
              <>
                {mode === 'login' && (
                  <LoginForm
                    onLogin={handleLogin}
                    onSwitchToRegister={() => setMode('register')}
                    onForgotPassword={() => setMode('forgot')}
                    clientId={clientId}
                  />
                )}
                {mode === 'register' && (
                  <RegisterForm
                    onRegister={handleRegister}
                    onSwitchToLogin={() => setMode('login')}
                    redirectUri={redirectUri}
                    appName={appName}
                  />
                )}
                {mode === 'forgot' && (
                  <ForgotPasswordForm
                    onBackToLogin={() => setMode('login')}
                  />
                )}
              </>
            )}
          </div>

          {/* Security Notice */}
          {redirectUri && clientInfo && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border/50 animate-fade-in">
              <p className="text-xs text-muted-foreground text-center">
                You'll be securely redirected back to <span className="font-medium text-foreground">{appName}</span> after authentication
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OAuthAuth;
