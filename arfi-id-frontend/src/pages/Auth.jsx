import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LoginForm from '../components/auth/LoginForm'
import RegisterForm from '../components/auth/RegisterForm'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'

const Auth = () => {

  const [mode, setMode] = useState('login');
  const navigate = useNavigate();

  const handleLogin = (data) => {
    console.log('Login data:', data);
    navigate('/dashboard');
  };
  const handleRegister = (data) => {
    console.log('Register data:', data);
    navigate('/dashboard');
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