import { Check, X } from 'lucide-react';
import React, { useEffect, useMemo } from 'react'

const PasswordStrength = ({ password = '', onValidityChange }) => {

    // Password strength logic
  const passwordRequirements = useMemo(() => [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ], [password]);

  const strengthScore = passwordRequirements.filter(req => req.met).length;
  const isValidPassword = strengthScore === passwordRequirements.length;

  // Notify parent component when validity changes
  useEffect(() => {
    onValidityChange?.(isValidPassword);
  }, [isValidPassword, onValidityChange]);

  const getStrengthColor = () => {
    if (strengthScore <= 1) return 'bg-destructive';
    if (strengthScore <= 2) return 'bg-warning';
    if (strengthScore <= 4) return 'bg-primary';
    return 'bg-success';
  };

  const getStrengthLabel = () => {
    if (strengthScore <= 1) return 'Weak';
    if (strengthScore <= 2) return 'Fair';
    if (strengthScore <= 4) return 'Good';
    return 'Strong';
  };

    if (password.length === 0) {
        return null;

    }
    return (
        <div className="space-y-1.5 sm:space-y-2 mt-2">
            <div className="space-y-1">
                <div className="flex justify-between text-[10px] sm:text-xs">
                    <span className="text-muted-foreground">Password strength</span>
                    <span className={`font-medium ${strengthScore <= 1 ? 'text-destructive' :
                        strengthScore <= 2 ? 'text-warning' :
                            strengthScore <= 4 ? 'text-primary' : 'text-success'
                        }`}>
                        {getStrengthLabel()}
                    </span>
                </div>
                <div className="h-1 sm:h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(strengthScore / passwordRequirements.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-0.5 sm:gap-1">
                {passwordRequirements.map((req, index) => (
                    <div
                        key={index}
                        className={`flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs transition-colors ${req.met ? 'text-success' : 'text-muted-foreground'
                            }`}
                    >
                        {req.met ? (
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        ) : (
                            <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        )}
                        <span>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PasswordStrength