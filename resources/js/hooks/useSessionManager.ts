import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook personnalisé pour gérer les sessions et la reconnexion
 * Vérifie périodiquement si la session est valide
 * Réauthentifie automatiquement si la session a expiré
 */
export function useSessionManager() {
    const [isSessionValid, setIsSessionValid] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Intervalle de vérification (toutes les 5 minutes)
    const CHECK_INTERVAL = 5 * 60 * 1000;

    /**
     * Vérifier le statut de la session
     */
    const checkSession = useCallback(async () => {
        try {
            setIsChecking(true);
            const response = await fetch('/api/auth/check-session', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.status === 401) {
                // Session expirée
                setIsSessionValid(false);
                setError('Votre session a expiré');
                return false;
            }

            if (response.ok) {
                const data = await response.json();
                setIsSessionValid(data.authenticated);
                setError(null);
                return data.authenticated;
            }

            setError('Erreur lors de la vérification de session');
            return false;
        } catch (err) {
            console.error('Session check error:', err);
            setError('Erreur de communication');
            return false;
        } finally {
            setIsChecking(false);
        }
    }, []);

    /**
     * Réauthentifier l'utilisateur après expiration
     */
    const reauthenticate = useCallback(async () => {
        try {
            setIsChecking(true);
            const response = await fetch('/api/auth/reauth', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setIsSessionValid(true);
                setError(null);
                return true;
            }

            setIsSessionValid(false);
            setError('Réauthentification échouée');
            return false;
        } catch (err) {
            console.error('Reauthentication error:', err);
            setError('Erreur de réauthentification');
            setIsSessionValid(false);
            return false;
        } finally {
            setIsChecking(false);
        }
    }, []);

    /**
     * Effet pour vérifier la session périodiquement
     */
    useEffect(() => {
        // Vérifier immédiatement au montage
        checkSession();

        // Configurer la vérification périodique
        const interval = setInterval(() => {
            checkSession();
        }, CHECK_INTERVAL);

        // Ajouter un listener pour les changements de visibilité
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // Vérifier la session quand l'onglet redevient visible
                checkSession();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [checkSession]);

    return {
        isSessionValid,
        isChecking,
        error,
        checkSession,
        reauthenticate,
    };
}

/**
 * Hook pour gérer la reconnexion après déconnexion involontaire
 */
export function useAutoReconnect() {
    const [isAttemptingReconnect, setIsAttemptingReconnect] = useState(false);

    const attemptReconnect = useCallback(async (email: string, password: string) => {
        try {
            setIsAttemptingReconnect(true);

            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    login: email,
                    password: password,
                    remember: true,
                }),
                credentials: 'include',
            });

            if (response.ok) {
                return { success: true, message: 'Reconnexion réussie' };
            }

            return { success: false, message: 'Erreur de reconnexion' };
        } catch (error) {
            console.error('Auto-reconnect error:', error);
            return { success: false, message: 'Erreur de communication' };
        } finally {
            setIsAttemptingReconnect(false);
        }
    }, []);

    return {
        isAttemptingReconnect,
        attemptReconnect,
    };
}

/**
 * Composant modal pour afficher les erreurs de session
 */
export function SessionErrorModal({
    isOpen,
    error,
    onRetry,
    onRedirect,
}: {
    isOpen: boolean;
    error: string | null;
    onRetry?: () => void;
    onRedirect?: (path: string) => void;
}) {
    if (!isOpen || !error) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Erreur de Session</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex gap-3">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
                        >
                            Réessayer
                        </button>
                    )}
                    {onRedirect && (
                        <button
                            onClick={() => onRedirect('/login')}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg transition"
                        >
                            Retour à la connexion
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
