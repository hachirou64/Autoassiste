import { useEffect, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';

export default function LogoutPage() {
    const { ziggy } = usePage().props;
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Déconnexion en cours...');

    useEffect(() => {
        // Effectuer la déconnexion
        const performLogout = async () => {
            try {
                // Appel API POST pour logout
                const response = await fetch('/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'include',
                });

                if (response.ok) {
                    // Effacer le sessionStorage et localStorage
                    sessionStorage.clear();
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_data');

                    // Afficher le message de succès
                    setStatus('success');
                    setMessage('Déconnexion réussie !');

                    // Rediriger vers la page d'accueil après 2 secondes
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    // Erreur lors de la déconnexion
                    setStatus('error');
                    setMessage('Erreur lors de la déconnexion. Veuillez réessayer.');
                    console.error('Logout error:', response.statusText);
                }
            } catch (error) {
                setStatus('error');
                setMessage('Une erreur s\'est produite. Veuillez réessayer.');
                console.error('Logout error:', error);
            }
        };

        performLogout();
    }, []);

    return (
        <AppHeaderLayout>
            <Head title="Déconnexion - GoAssist" />
            
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center space-y-4">
                        {/* Icône selon le statut */}
                        <div className="flex justify-center">
                            {status === 'loading' && (
                                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                            {status === 'success' && (
                                <CheckCircle className="w-16 h-16 text-green-500" />
                            )}
                            {status === 'error' && (
                                <AlertCircle className="w-16 h-16 text-red-500" />
                            )}
                        </div>

                        {/* Message principal */}
                        <div>
                            <h1 className="text-2xl font-bold text-white mb-2">
                                {status === 'loading' && 'Déconnexion'}
                                {status === 'success' && 'À bientôt !'}
                                {status === 'error' && 'Erreur'}
                            </h1>
                            <p className={`text-lg ${
                                status === 'error' ? 'text-red-400' :
                                status === 'success' ? 'text-green-400' :
                                'text-slate-400'
                            }`}>
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        {status === 'error' && (
                            <div className="space-y-2 mt-6">
                                <button
                                    onClick={() => window.location.href = '/logout'}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg transition"
                                >
                                    Réessayer
                                </button>
                                <button
                                    onClick={() => window.location.href = '/'}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 rounded-lg transition"
                                >
                                    Retour à l'accueil
                                </button>
                            </div>
                        )}

                        {status === 'success' && (
                            <p className="text-sm text-slate-500 mt-4">
                                Redirection vers l'accueil...
                            </p>
                        )}
                    </div>

                    {/* Tips pour éviter les erreurs de reconnexion */}
                    {status === 'success' && (
                        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 text-sm text-blue-300">
                            <p className="font-medium mb-2">💡 Conseils pour une reconnexion facile :</p>
                            <ul className="space-y-1 text-xs">
                                <li>✓ Votre historique de connexion est conservé</li>
                                <li>✓ Vous pouvez vous reconnecter avec le même email/téléphone</li>
                                <li>✓ Votre compte reste actif et sécurisé</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </AppHeaderLayout>
    );
}
