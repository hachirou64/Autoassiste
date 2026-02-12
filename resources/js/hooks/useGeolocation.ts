import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationCoordinates {
    lat: number;
    lng: number;
    accuracy?: number;
    altitude?: number;
    altitudeAccuracy?: number;
    heading?: number;
    speed?: number;
}

export interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watchPosition?: boolean;
    onSuccess?: (coords: GeolocationCoordinates) => void;
    onError?: (error: GeolocationPositionError) => void;
}

export interface UseGeolocationReturn {
    coordinates: GeolocationCoordinates | null;
    error: string | null;
    loading: boolean;
    accuracy: number | null;
    isSupported: boolean;
    getCurrentPosition: () => Promise<GeolocationCoordinates | null>;
    startWatching: () => void;
    stopWatching: () => void;
    watching: boolean;
}

/**
 * Hook personnalisé pour l'API Geolocation HTML5
 * Support GPS, WiFi, et précision configurable
 */
export function useGeolocation({
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 0,
    watchPosition = false,
    onSuccess,
    onError,
}: UseGeolocationOptions = {}): UseGeolocationReturn {
    const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [watching, setWatching] = useState(false);
    const watchIdRef = useRef<number | null>(null);

    const isSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

    // Nettoyer le watch à la fin
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Fonction pour formater les coordonnées
    const formatCoordinates = (position: GeolocationPosition): GeolocationCoordinates => ({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude ?? undefined,
        altitudeAccuracy: position.coords.altitudeAccuracy ?? undefined,
        heading: position.coords.heading ?? undefined,
        speed: position.coords.speed ?? undefined,
    });

    // Fonction pour obtenir la position actuelle
    const getCurrentPosition = useCallback(async (): Promise<GeolocationCoordinates | null> => {
        if (!isSupported) {
            setError('Geolocation API non disponible');
            setLoading(false);
            return null;
        }

        setLoading(true);
        setError(null);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = formatCoordinates(position);
                    setCoordinates(coords);
                    setLoading(false);
                    setError(null);
                    onSuccess?.(coords);
                    resolve(coords);
                },
                (err) => {
                    const errorMessage = getGeolocationErrorMessage(err);
                    setError(errorMessage);
                    setLoading(false);
                    onError?.(err);
                    resolve(null);
                },
                { enableHighAccuracy, timeout, maximumAge }
            );
        });
    }, [isSupported, enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

    // Fonction pour démarrer le suivi
    const startWatching = useCallback(() => {
        if (!isSupported || watchIdRef.current !== null) return;

        setWatching(true);
        setError(null);

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const coords = formatCoordinates(position);
                setCoordinates(coords);
                setError(null);
                onSuccess?.(coords);
            },
            (err) => {
                const errorMessage = getGeolocationErrorMessage(err);
                setError(errorMessage);
                onError?.(err);
            },
            { enableHighAccuracy, timeout, maximumAge }
        );
    }, [isSupported, enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

    // Fonction pour arrêter le suivi
    const stopWatching = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
            setWatching(false);
        }
    }, []);

    // Effet initial pour obtenir la position
    useEffect(() => {
        if (!isSupported) {
            setError('Geolocation API non disponible');
            setLoading(false);
            return;
        }

        if (watchPosition) {
            startWatching();
            setLoading(false);
        } else {
            getCurrentPosition();
        }
    }, [isSupported, watchPosition, startWatching, getCurrentPosition]);

    return {
        coordinates,
        error,
        loading,
        accuracy: coordinates?.accuracy ?? null,
        isSupported,
        getCurrentPosition,
        startWatching,
        stopWatching,
        watching,
    };
}

/**
 * Obtenir un message d'erreur convivial
 */
function getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Vous avez refusé l\'accès à la position. Veuillez autoriser dans les paramètres de votre navigateur.';
        case error.POSITION_UNAVAILABLE:
            return 'Position non disponible. Vérifiez que le GPS est activé et que vous avez une connexion internet.';
        case error.TIMEOUT:
            return 'Timeout: La géolocalisation a pris trop de temps. Réessayez dans un endroit avec meilleure réception GPS.';
        default:
            return 'Erreur de géolocalisation: ' + error.message;
    }
}

/**
 * Utilitaire pour demander la permission de géolocalisation
 */
export async function requestGeolocationPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
        return 'granted'; // Navigateurs anciens - assume granted
    }

    try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return permission.state;
    } catch {
        return 'granted';
    }
}

/**
 * Vérifier si la géolocalisation est active
 */
export async function isGeolocationActive(): Promise<boolean> {
    if (!navigator.geolocation) return false;
    
    // Vérifier via Permissions API si disponible
    if (navigator.permissions) {
        try {
            const permission = await navigator.permissions.query({ name: 'geolocation' });
            return permission.state === 'granted';
        } catch {
            return true;
        }
    }
    
    return true;
}
