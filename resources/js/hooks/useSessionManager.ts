import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * Hook personnalisé pour gérer les sessions et la reconnexion
 * Vérifie périodiquement si la session est valide
 * Réauthentifie automatiquement si la session a expiré
 */
export function useSessionManager() {
    const [isSessionValid, setIsSessionValid] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
        let isMounted = true;

        const performCheck = async () => {
            if (isMounted) {
                await checkSession();
            }
        };

        // Vérifier immédiatement au montage
        performCheck();

        // Configurer la vérification périodique
        checkIntervalRef.current = setInterval(() => {
            if (isMounted) {
                performCheck();
            }
        }, CHECK_INTERVAL);

        // Ajouter un listener pour les changements de visibilité
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && isMounted) {
                // Vérifier la session quand l'onglet redevient visible
                performCheck();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            isMounted = false;
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [CHECK_INTERVAL, checkSession]);

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

// Export le composant modal depuis le fichier séparé
export { SessionErrorModal } from './session-error-modal';
