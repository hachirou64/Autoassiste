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
    /** Callback appelé lors d'une mise à jour réussie */
    onLocationUpdate?: (position: GeolocationPosition) => void;
    /** Callback appelé en cas d'erreur */
    onError?: (error: string) => void;
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
     */
    const detectPosition = useCallback(async () => {
        if (!navigator.geolocation) {
            const errMsg = 'La géolocalisation n\'est pas supportée par votre navigateur';
            setError(errMsg);
            onError?.(errMsg);
            return;
        }

        setIsLoading(true);
        setError(null);

        return new Promise<void>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newPosition: GeolocationPosition = {
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        timestamp: pos.timestamp,
                    };

                    // Vérifier la précision
                    if (pos.coords.accuracy > maxAccuracy) {
                        const warnMsg = `Précision insuffisante: ${Math.round(pos.coords.accuracy)}m (max: ${maxAccuracy}m)`;
                        setError(warnMsg);
                        console.warn(warnMsg);
                        // On continue quand même car mieux vaut avoir une position approximative que rien
                    }

                    setPosition(newPosition);
                    onLocationUpdate?.(newPosition);
                    setIsLoading(false);
                    resolve();
                },
                (err) => {
                    let errMsg = 'Erreur de géolocalisation';
                    
                    switch (err.code) {
                        case err.PERMISSION_DENIED:
                            errMsg = 'Permission de géolocalisation refusée. Veuillez activer la localisation.';
                            break;
                        case err.POSITION_UNAVAILABLE:
                            errMsg = 'Position unavailable. Vérifiez votre connexion GPS.';
                            break;
                        case err.TIMEOUT:
                            errMsg = 'Délai de géolocalisation dépassé';
                            break;
                    }
                    
                    setError(errMsg);
                    onError?.(errMsg);
                    setIsLoading(false);
                    reject(new Error(errMsg));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000, // 10 secondes
                    maximumAge: 0, // Pas de cache
                }
            );
        });
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
                setError(data.message || 'Erreur lors de la mise à jour de la position');
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

