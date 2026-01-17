import { ArrowLeft, KeyRound } from 'lucide-react'
import React from 'react'

const ForgotPasswordForm = ({
  onBackToLogin,
}) => {
  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      {/* Icon and heading */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-secondary rounded-full flex items-center justify-center">
          <div className="w-14 h-10 sm:w-16 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
            <KeyRound className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">Forgot password?</h2>
        <p className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-0">
          This is under Development. Please contact at arfi.id@faizarfi.dev
        </p>
      </div>

      <button
        type="button"
        onClick={onBackToLogin}
        className="flex items-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors mx-auto"
      >
        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Back to Login
      </button>
    </div>
  )
}

export default ForgotPasswordForm