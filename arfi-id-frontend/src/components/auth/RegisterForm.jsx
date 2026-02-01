import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    clientId: import.meta.env.VITE_CLIENT_ID,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onRegister(formData);
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">

      <div className="text-center mb-4 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-secondary rounded-full flex items-center justify-center">
          <div className="w-10 h-8 sm:w-12 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Create your account</h2>
        <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
          Enter your email and create a secure password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium text-foreground">EMAIL</label>
          <div className="relative">
            <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="Enter your email"
              className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base py-2.5 sm:py-3"
              required
            />
            {isValidEmail && (
              <Check className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-success" />
            )}
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-medium text-foreground">PASSWORD</label>
          <div className="relative">
            <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => updateForm('password', e.target.value)}
              placeholder="Create a password"
              className="input-field pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base py-2.5 sm:py-3"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValidEmail}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-2.5 sm:py-3"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </span>
          ) : (
            'CONTINUE'
          )}
        </button>
      </form>

      <button
        type="button"
        onClick={onSwitchToLogin}
        className="flex items-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        Back to Login
      </button>
    </div>
  );
};

export default RegisterForm;
