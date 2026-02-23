import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationPosition {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    timestamp: number;
}

interface UseDepanneurGeolocationOptions {
    /** Intervalle de mise à jour en millisecondes (défaut: 30000 = 30s) */
    updateInterval?: number;
    /** Précision maximale acceptée en mètres (défaut: 1000m) */
    maxAccuracy?: number;
    /** Activer la mise à jour automatique (défaut: true) */
    autoUpdate?: boolean;
    /** État initial du suivi (depuis le serveur) */
    initialTrackingState?: boolean;
    /** Callback appelé lors d'une mise à jour réussie */
    onLocationUpdate?: (position: GeolocationPosition) => void;
    /** Callback appelé en cas d'erreur */
    onError?: (error: string) => void;
    /** Callback appelé quand le suivi est démarré */
    onTrackingStart?: () => void;
    /** Callback appelé quand le suivi est arrêté */
    onTrackingStop?: () => void;
}

interface UseDepanneurGeolocationReturn {
    /** Position actuelle */
    position: GeolocationPosition | null;
    /** Indique si la position est en cours de détection */
    isLoading: boolean;
    /** Indique si le suivi automatique est actif */
    isTracking: boolean;
    /** Erreur actuelle */
    error: string | null;
    /** Précision de la position actuelle */
    accuracy: number | null;
    /**Dernière date de mise à jour réussie vers le serveur */
    lastServerUpdate: Date | null;
    /** Force une détection de position */
    detectPosition: () => Promise<void>;
    /** Démarre le suivi automatique */
    startTracking: () => void;
    /** Arrête le suivi automatique */
    stopTracking: () => void;
    /** Envoie la position au serveur */
    sendPositionToServer: () => Promise<boolean>;
}

/**
 * Hook pour la géolocalisation automatique du dépanneur
 * Gère la détection de position et l'envoi automatique au serveur
 */
export function useDepanneurGeolocation({
    updateInterval = 30000, // 30 secondes
    maxAccuracy = 1000, // 1km
    autoUpdate = true,
    onLocationUpdate,
    onError,
}: UseDepanneurGeolocationOptions = {}): UseDepanneurGeolocationReturn {
    const [position, setPosition] = useState<GeolocationPosition | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastServerUpdate, setLastServerUpdate] = useState<Date | null>(null);

    const watchIdRef = useRef<number | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastUpdateRef = useRef<number>(0);

    /**
     * Détecter la position actuelle via l'API Geolocation
     * Avec retry automatique pour améliorer la précision
     */
    const detectPosition = useCallback(async (): Promise<void> => {
        if (!navigator.geolocation) {
            const errMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
            setError(errMsg);
            onError?.(errMsg);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Fonction interne pour tenter d'obtenir une position avec haute précision
        const getHighAccuracyPosition = (): Promise<GeolocationPosition> => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const newPosition: GeolocationPosition = {
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                            accuracy: pos.coords.accuracy,
                            timestamp: pos.timestamp,
                        };
                        resolve(newPosition);
                    },
                    (err) => {
                        reject(err);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000, // 15 secondes pour la première tentative
                        maximumAge: 0, // Pas de cache
                    }
                );
            });
        };

        // Fonction pour obtenir une position avec fallback
        const getPositionWithRetry = async (): Promise<GeolocationPosition> => {
            const maxRetries = 3;
            let lastError: GeolocationPositionError | null = null;

            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Tentative de géolocalisation ${attempt}/${maxRetries}...`);
                    const position = await getHighAccuracyPosition();
                    
                    // Vérifier la précision
                    if (position.accuracy && position.accuracy <= maxAccuracy) {
                        console.log(`Position obtained with accuracy: ${position.accuracy}m`);
                        return position;
                    }
                    
                    // Si la précision n'est pas assez bonne, mais pas catastrophique
                    if (position.accuracy && position.accuracy <= 5000) {
                        console.warn(`Accuracy ${position.accuracy}m is not ideal but acceptable`);
                        // Retourner quand même la position pour ne pas bloquer l'utilisateur
                        return position;
                    }
                    
                    // Précision trop mauvaise (> 5km), réessayer
                    if (attempt < maxRetries) {
                        console.warn(`Bad accuracy (${position.accuracy}m), retrying...`);
                        await new Promise(resolve => setTimeout(resolve, 2000)); // Attendre 2s
                    }
                } catch (err: any) {
                    lastError = err;
                    console.error(`Attempt ${attempt} failed:`, err);
                    if (attempt < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
            }

            // Si toutes les tentatives ont échoué, throw la dernière erreur
            throw lastError || new Error('Impossible d\'obtenir la position');
        };

        try {
            const newPosition = await getPositionWithRetry();

            // Vérifier la précision finale
            if (newPosition.accuracy && newPosition.accuracy > maxAccuracy) {
                const warnMsg = `Précision insuffisante: ${Math.round(newPosition.accuracy)}m (max: ${maxAccuracy}m). Veuillez vous déplacer vers un endroit dégagé ou activer le GPS haute précision.`;
                setError(warnMsg);
                console.warn(warnMsg);
                // On continue quand même car mieux vaut avoir une position approximative que rien
            }

            setPosition(newPosition);
            onLocationUpdate?.(newPosition);
            setIsLoading(false);
        } catch (err: any) {
            let errMsg = 'Erreur de géolocalisation';
            
            switch (err?.code) {
                case err?.PERMISSION_DENIED:
                    errMsg = 'Permission de géolocalisation refusée. Veuillez activer la localisation dans les paramètres de votre navigateur.';
                    break;
                case err?.POSITION_UNAVAILABLE:
                    errMsg = 'Position non disponible. Vérifiez que le GPS est activé et que vous avez une connexion internet.';
                    break;
                case err?.TIMEOUT:
                    errMsg = 'Délai de géolocalisation dépassé. Réessayez dans un endroit avec meilleure réception GPS.';
                    break;
                default:
                    errMsg = err?.message || 'Erreur de géolocalisation. Assurez-vous que le GPS est activé.';
            }
            
            setError(errMsg);
            onError?.(errMsg);
            setIsLoading(false);
        }
    }, [maxAccuracy, onLocationUpdate, onError]);

    /**
     * Envoyer la position au serveur
     */
    const sendPositionToServer = useCallback(async (): Promise<boolean> => {
        if (!position) {
            return false;
        }

        // Rate limiting: minimum 10 secondes entre les mises à jour
        const now = Date.now();
        if (now - lastUpdateRef.current < 10000) {
            console.log('Trop tôt pour envoyer la position');
            return false;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/api/depanneur/location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    latitude: position.latitude,
                    longitude: position.longitude,
                    accuracy: position.accuracy,
                }),
            });

            const data = await response.json();

            if (data.success) {
                lastUpdateRef.current = now;
                setLastServerUpdate(new Date());
                setError(null);
                return true;
            } else {
                // Gérer les erreurs spécifiques du serveur
                if (response.status === 429) {
                    // Too Many Requests - attendre un peu
                    console.log('Rate limited par le serveur');
                }
                
                // Gérer l'erreur de précision insuffisante (422)
                if (response.status === 422 && data.error === 'Précision insuffisante') {
                    const precisionMsg = `Précision GPS insuffisante: ${data.accuracy}m. Veuillez vous déplacer vers un endroit dégagé et activer le GPS haute précision.`;
                    setError(precisionMsg);
                    console.warn(precisionMsg);
                } else {
                    setError(data.message || 'Erreur lors de la mise à jour de la position');
                }
                return false;
            }
        } catch (err) {
            console.error('Erreur envoi position:', err);
            setError('Erreur de connexion');
            return false;
        }
    }, [position]);

    /**
     * Démarrer le suivi automatique
     */
    const startTracking = useCallback(() => {
        if (isTracking) return;
        
        setIsTracking(true);
        
        // Détecter immédiatement la position
        detectPosition();
        
        // Envoyer la position détectée au serveur
        if (position) {
            sendPositionToServer();
        }

        // Configurer le polling pour les mises à jour régulières
        intervalRef.current = setInterval(() => {
            detectPosition().then(() => {
                sendPositionToServer();
            });
        }, updateInterval);

        // Optionnel: utiliser watchPosition pour un suivi plus précis
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    const newPosition: GeolocationPosition = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        timestamp: pos.timestamp,
                    };
                    
                    setPosition(newPosition);
                    onLocationUpdate?.(newPosition);
                    
                    // Envoyer au serveur si la précision est suffisante
                    if (pos.coords.accuracy <= maxAccuracy) {
                        sendPositionToServer();
                    }
                },
                (err) => {
                    console.error('Watch position error:', err);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 10000, // 10 secondes de cache
                }
            );
        }
    }, [isTracking, detectPosition, sendPositionToServer, updateInterval, maxAccuracy, onLocationUpdate, position]);

    /**
     * Arrêter le suivi automatique
     */
    const stopTracking = useCallback(() => {
        setIsTracking(false);
        
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        
        if (watchIdRef.current !== null && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    // Nettoyage au unmount
    useEffect(() => {
        return () => {
            stopTracking();
        };
    }, [stopTracking]);

    // Auto-start si activé
    useEffect(() => {
        if (autoUpdate && !isTracking) {
            startTracking();
        }
    }, [autoUpdate, isTracking, startTracking]);

    return {
        position,
        isLoading,
        isTracking,
        error,
        accuracy: position?.accuracy ?? null,
        lastServerUpdate,
        detectPosition,
        startTracking,
        stopTracking,
        sendPositionToServer,
    };
}

export default useDepanneurGeolocation;

