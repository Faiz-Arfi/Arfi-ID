import React from 'react';
import { Check, ArrowRight, User, Loader2 } from 'lucide-react';

const ContinueToApp = ({ user, appName, appColor, onContinue, onUseAnotherAccount, isNewConnection = false, isLoading = false }) => {
  return (
    <div className="space-y-6">
      {/* User Info */}
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-success/10 border-2 border-success/20 flex items-center justify-center mx-auto mb-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 status-online ring-2 ring-card">
              <Check className="w-2 h-2 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" strokeWidth={3} />
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Signed in as
        </h3>
        <p className="text-sm font-medium text-foreground mb-1">
          {user.email || user.username}
        </p>
        {user.name && (
          <p className="text-xs text-muted-foreground">
            {user.name}
          </p>
        )}
      </div>

      {/* New Connection Notice */}
      {isNewConnection && (
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/30 animate-fade-in">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-xs text-center text-foreground font-medium">
              First time connecting to <strong>{appName}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Connection Message */}
      <div className="p-4 bg-muted rounded-lg border border-border">
        <p className="text-sm text-center text-muted-foreground">
          Continue to <span className="font-semibold text-foreground">{appName}</span> with your ARFI ID account
        </p>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        disabled={isLoading}
        className="btn-primary flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Authorizing...</span>
          </>
        ) : (
          <>
            <span>Continue to {appName}</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      {/* Use Another Account */}
      {!isLoading && (
        <div className="text-center pt-2">
          <button
            onClick={onUseAnotherAccount}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 underline-offset-4 hover:underline font-medium"
          >
            Log out and use a different account
          </button>
        </div>
      )}
    </div>
  );
};

export default ContinueToApp;