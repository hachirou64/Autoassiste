import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { LoginForm } from '@/components/auth/login-form';
import { Car } from 'lucide-react';
import type { SharedData } from '@/types';

export default function LoginPage() {
    const { ziggy } = usePage().props;
    const { auth } = usePage<SharedData>().props;
    const [mounted, setMounted] = useState(false);
    const [redirecting, setRedirecting] = useState(false);

    // Wait for mount before checking auth (client-side only)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if already logged in (client-side only)
    useEffect(() => {
        if (!mounted) return;
        
        if (auth?.user) {
            // User is already logged in, redirect to appropriate dashboard
            setRedirecting(true);
            
            // Determine where to redirect based on user type
            if (auth.user.id_type_compte === 1) {
                // Admin
                window.location.href = '/admin/dashboard';
            } else if (auth.user.id_type_compte === 2) {
                // Client
                window.location.href = '/client/dashboard';
            } else if (auth.user.id_type_compte === 3) {
                // Depanneur
                window.location.href = '/depanneur/dashboard';
            } else {
                window.location.href = '/client/dashboard';
            }
        }
    }, [auth, mounted]);

    // Function called after successful login
    const handleSuccess = () => {
        console.log('[LoginPage] Connexion réussie!');
        // Redirect will be handled by Inertia/Laravel based on user type
    };

    // Function called when user wants to register
    const handleRegisterClick = () => {
        window.location.href = '/register';
    };

    // Show loading while redirecting
    if (redirecting) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg">Redirection vers votre dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title="Connexion - AutoAssist" />
            
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="container mx-auto px-4 py-12">
                    <LoginForm
                        onSuccess={handleSuccess}
                        onRegisterClick={handleRegisterClick}
                    />
                </div>
            </div>
        </AppHeaderLayout>
    );
}

