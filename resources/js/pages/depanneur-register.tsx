import { Head, router } from '@inertiajs/react';
import { Truck, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DepanneurRegistrationForm } from '@/components/auth/depanneur-registration-form';

export default function DepanneurRegisterPage() {
    const handleSuccess = () => {
        // Rediriger vers le dashboard dépanneur après inscription réussie
        router.get('/depanneur/dashboard');
    };

    const handleLoginClick = () => {
        router.get('/login');
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Head title="Inscription Dépanneur - AutoAssist" />
            
            {/* Header simple */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white">
                            <Truck size={24} />
                        </div>
                        <span className="font-black text-2xl text-white">
                            AutoAssist<span className="text-amber-500">.</span>
                        </span>
                    </a>
                    
                    <Button
                        variant="ghost"
                        onClick={handleLoginClick}
                        className="text-slate-400 hover:text-white"
                    >
                        <LogIn className="h-4 w-4 mr-2" />
                        Se connecter
                    </Button>
                </div>
            </header>

            {/* Contenu principal */}
            <main className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Rejoignez notre réseau de dépanneurs
                    </h1>
                    <p className="text-slate-400">
                        Créez votre compte et commencez à accepter des demandes d'assistance
                    </p>
                </div>

                <DepanneurRegistrationForm
                    onSuccess={handleSuccess}
                    onLoginClick={handleLoginClick}
                />
            </main>

            {/* Footer simple */}
            <footer className="border-t border-slate-800 mt-12 py-6">
                <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} AutoAssist. Tous droits réservés.</p>
                    <p className="mt-1">
                        <a href="/mentions-legales" className="hover:text-slate-400">Mentions légales</a>
                        {' • '}
                        <a href="/confidentialite" className="hover:text-slate-400">Confidentialité</a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
