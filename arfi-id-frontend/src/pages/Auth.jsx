import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/auth/AuthContext'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import AuthCheckSpinner from '../components/auth/AuthCheckSpinner'

const Auth = () => {
  const { user, isLoading, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <AuthCheckSpinner />;
  }

  // If we have a user, don't render the form (the useEffect will handle the redirect)
  if (user) return null;

  const handleLogin = async (credentials) => {
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      throw error; // Re-throw so LoginForm can handle it
    }
  };
  
  const handleRegister = async (data) => {
    try {
      await register(data);
      alert('Registration successful! Please log in.');
      setMode('login');
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Re-throw so RegisterForm can handle it
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo & Tagline */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl font-bold text-foreground">ARFI</span>
              <span className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xl font-bold">ID</span>
            </div>
            <p className="text-muted-foreground">
              Safeguard your digital identity across all devices.
            </p>
          </div>

          {/* Auth Card */}
          <div className="card-elevated p-8">
            {mode === 'login' && (
              <LoginForm
                onLogin={handleLogin}
                onSwitchToRegister={() => setMode('register')}
                onForgotPassword={() => setMode('forgot')}
              />
            )}
            {mode === 'register' && (
              <RegisterForm
                onRegister={handleRegister}
                onSwitchToLogin={() => setMode('login')}
              />
            )}
            {mode === 'forgot' && (
              <ForgotPasswordForm
                onBackToLogin={() => setMode('login')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Auth