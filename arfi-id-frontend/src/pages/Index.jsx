import React from 'react'
import Logo from '../icons/Logo'
import { useNavigate } from 'react-router-dom'
import { Shield, Monitor, Puzzle, ArrowRight, CheckCircle, LockKeyhole } from 'lucide-react';

const Index = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Shield,
            title: 'Secure by Design',
            description: 'Cookie-based authentication with short-lived tokens and device-bound refresh tokens.',
        },
        {
            icon: Monitor,
            title: 'Multi-Device Access',
            description: 'Sign in from multiple devices and manage active sessions from one dashboard.',
        },
        {
            icon: Puzzle,
            title: 'Connected Apps',
            description: 'One identity across all your projects with role-based access control.',
        },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="p-4 md:p-2 flex item-center justify-between max-w-6xl mx-auto">
                <Logo size={24} className="md:w-7 md:h-7" />
                <button
                    onClick={() => navigate('/auth')}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition"
                >
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                </button>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16">
                <div className="text-center mb-10 md:mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 bg-success-soft text-success-soft-foreground px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6">
                        <CheckCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Secure Identity Platform
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6 leading-tight">
                        One Identity.<br />
                        <span className="text-gradient">Endless Possibilities.</span>
                    </h1>

                    <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8 px-4">
                        ArfiID is your centralized authentication platform. Secure login,
                        multi-device access, and seamless integration across all projects hosted on faizarfi.dev
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
                        <button
                            onClick={() => navigate('/auth')}
                            className="btn-primary w-full sm:w-auto px-6 md:px-8 text-sm md:text-base"
                        >
                            Get Started
                        </button>
                        <button 
                            onClick={() => navigate('/about')}
                            className="btn-secondary w-full sm:w-auto px-6 md:px-8 text-sm md:text-base">
                            Learn More
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-2">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="card-elevated p-5 md:p-6 text-center animate-fade-in"
                                style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                            >
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                                </div>
                                <h3 className="text-base md:text-lg font-semibold text-foreground mb-1.5 md:mb-2">{feature.title}</h3>
                                <p className="text-sm md:text-base text-muted-foreground">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>

            </main>

            <footer className="py-6 md:py-8 text-center border-t border-border mt-12 md:mt-16">
                <p className="text-xs md:text-sm text-muted-foreground">
                    <LockKeyhole className="inline-block w-4 h-4 mb-0.5 mr-1" />
                    Secure Identity by Faiz Arfi - {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    )
}

export default Index