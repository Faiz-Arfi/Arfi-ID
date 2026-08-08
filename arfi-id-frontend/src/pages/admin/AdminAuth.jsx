import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../components/auth/AuthContext';
import AuthCheckSpinner from '../../components/auth/AuthCheckSpinner';

const AdminAuth = () => {
    const { user, isLoading, adminLogin } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    //   process client id from env variable for admin login if available
    const clientId = import.meta.env.VITE_ADMIN_CLIENT_ID || 'arfi-id';
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasAdminAccess =
        user?.isAdmin === true ||
        user?.role === 'admin' ||
        user?.role === 'ADMIN' ||
        user?.role === 'ROLE_ADMIN' ||
        user?.roles?.includes('admin') ||
        user?.roles?.includes('ADMIN') ||
        user?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        if (!isLoading && hasAdminAccess) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [hasAdminAccess, isLoading, navigate]);

    if (isLoading) {
        return <AuthCheckSpinner />;
    }

    if (hasAdminAccess) {
        return null;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await adminLogin({ email, password, clientId });
            toast.success('Admin sign in successful');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error('Admin sign in failed', {
                description: error?.response?.data?.message || 'Please check your credentials and try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute top-1/3 -left-28 w-80 h-80 rounded-full bg-foreground/5 blur-3xl" />
            </div>

            <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
                <div className="w-full max-w-md">
                    <div className="text-center mb-8 animate-fade-in">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <span className="text-3xl font-bold text-foreground">ARFI</span>
                            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xl font-bold">ADMIN</span>
                        </div>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Secure access to the administrative console. Only authorized admin accounts can continue.
                        </p>
                    </div>

                    <div className="card-elevated p-8 space-y-6">
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/40">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Admin access only</p>
                                <p className="text-sm text-muted-foreground">
                                    Sign in with an administrator account to manage the platform.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground text-left block">
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        placeholder="Enter your admin email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="input-field pl-4"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground text-left block">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        className="input-field pl-12"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'Signing in...' : 'Enter Admin Console'}
                                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </form>

                        <div className="text-center pt-1">
                            <p className="text-sm text-muted-foreground">
                                Need regular account access?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/auth')}
                                    className="text-primary font-medium hover:underline"
                                >
                                    Go to user sign in
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAuth;