import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Truck } from 'lucide-react';
import { DepanneurRegistrationForm } from '@/components/auth/depanneur-registration-form';

export default function DepanneurRegisterPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    
    const handleSuccess = () => {
        // Rediriger vers le dashboard dépanneur après inscription réussie
        // Vérifier si on est en mode admin
        const urlParams = new URLSearchParams(window.location.search);
        const isAdminMode = urlParams.get('admin') === 'true';
        
        if (isAdminMode) {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/depanneur/dashboard';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Head title="Inscription Dépanneur - GoAssist" />
            
            {/* Header simple */}
            <header className="border-b border-gray-200 bg-white">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                            <Truck size={24} />
                        </div>
                        <span className="font-black text-2xl text-gray-900">
                            GoAssist<span className="text-amber-500">.</span>
                        </span>
                    </a>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Rejoignez notre réseau de dépanneurs
                    </h1>
                    <p className="text-gray-600">
                        Créez votre compte et commencez à accepter des demandes d'assistance
                    </p>
                </div>

                <DepanneurRegistrationForm
                    onSuccess={handleSuccess}
                />
            </main>

            {/* Footer simple */}
            <footer className="border-t border-gray-200 mt-12 py-6">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} GoAssist. Tous droits réservés.</p>
                    <p className="mt-1">
                        <a href="/mentions-legales" className="hover:text-gray-700">Mentions légales</a>
                        {' • '}
                        <a href="/confidentialite" className="hover:text-gray-700">Confidentialité</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
