import { useState, useCallback } from 'react';

export interface GeocodedAddress {
    latitude: number;
    longitude: number;
    display_name: string;
    formatted_address: string;
    road: string;
    house_number: string;
    suburb: string;
    city: string;
    department: string;
    country: string;
    postcode: string;
}

interface UseGeocodingReturn {
    getAddressFromCoordinates: (lat: number, lng: number) => Promise<GeocodedAddress | null>;
    addresses: Map<string, GeocodedAddress>;
    loading: boolean;
    error: string | null;
}

/**
 * Hook pour le géocodage inverse - convertir coordonnées en adresse
 * Utilise l'API /api/geocode/reverse
 */
export function useGeocoding(): UseGeocodingReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Cache des adresses pour éviter les requêtes répétées
    const [addresses] = useState<Map<string, GeocodedAddress>>(new Map());

    const getAddressFromCoordinates = useCallback(async (lat: number, lng: number): Promise<GeocodedAddress | null> => {
        // Clé unique pour le cache
        const cacheKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        
        // Vérifier le cache local
        if (addresses.has(cacheKey)) {
            return addresses.get(cacheKey) || null;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                latitude: lat.toString(),
                longitude: lng.toString(),
            });

            const response = await fetch(`/api/geocode/reverse?${params}`);

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'adresse');
            }

            const result = await response.json();

            if (result.success && result.data) {
                const address: GeocodedAddress = {
                    latitude: result.data.latitude,
                    longitude: result.data.longitude,
                    display_name: result.data.display_name,
                    formatted_address: result.data.formatted_address,
                    road: result.data.road || '',
                    house_number: result.data.house_number || '',
                    suburb: result.data.suburb || '',
                    city: result.data.city || '',
                    department: result.data.department || '',
                    country: result.data.country || '',
                    postcode: result.data.postcode || '',
                };

                // Mettre en cache
                addresses.set(cacheKey, address);
                
                return address;
            }

            return null;
        } catch (err) {
            console.error('Erreur de géocodage:', err);
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
            return null;
        } finally {
            setLoading(false);
        }
    }, [addresses]);

    return {
        getAddressFromCoordinates,
        addresses,
        loading,
        error,
    };
}

/**
 * Formater une adresse pour l'affichage
 * Retourne: "Rue X, Quartier, Ville" ou fallback vers les coordonnées
 */
export function formatAddress(address: GeocodedAddress | null | undefined, fallback?: string): string {
    if (!address) {
        return fallback || 'Adresse non disponible';
    }

    const parts: string[] = [];

    // Rue avec numéro
    if (address.road) {
        let road = address.road;
        if (address.house_number) {
            road += ' ' + address.house_number;
        }
        parts.push(road);
    }

    // Quartier
    if (address.suburb) {
        parts.push(address.suburb);
    }

    // Ville
    if (address.city) {
        parts.push(address.city);
    }

    if (parts.length > 0) {
        return parts.join(', ');
    }

    // Si pas assez de détails, essayer d'autres combinaisons
    if (address.department && address.city !== address.department) {
        parts.push(address.department);
    }

    if (address.country && parts.length === 0) {
        parts.push(address.country);
    }

    return parts.length > 0 ? parts.join(', ') : (fallback || address.display_name || 'Adresse non disponible');
}

/**
 * Formater une adresse courte (pour les listes)
 */
export function formatAddressShort(address: GeocodedAddress | null | undefined): string {
    if (!address) return 'Adresse non disponible';

    // Essayer: Rue > Quartier > Ville
    if (address.road) {
        return address.suburb 
            ? `${address.road}, ${address.suburb}`
            : address.city 
                ? `${address.road}, ${address.city}`
                : address.road;
    }

    if (address.suburb) {
        return address.city 
            ? `${address.suburb}, ${address.city}`
            : address.suburb;
    }

    if (address.city) {
        return address.city;
    }

    if (address.department) {
        return address.department;
    }

    return address.display_name || 'Adresse non disponible';
}

/**
 * Parser les coordonnées depuis une chaîne
 * Accepte: "lat,lng" ou "lat, lng"
 */
export function parseCoordinates(localisation: string): { lat: number; lng: number } | null {
    if (!localisation) return null;

    // Essayer de parser "lat,lng"
    const parts = localisation.split(',').map(s => parseFloat(s.trim()));
    
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        // Vérifier que les valeurs sont dans des ranges valides
        if (parts[0] >= -90 && parts[0] <= 90 && parts[1] >= -180 && parts[1] <= 180) {
            return { lat: parts[0], lng: parts[1] };
        }
    }

    return null;
}

/**
 * Vérifier si une chaîne est des coordonnées GPS
 */
export function isCoordinates(localisation: string): boolean {
    const coords = parseCoordinates(localisation);
    return coords !== null;
}

/**
 * Formater les coordonnées pour l'affichage
 */
export function formatCoordinates(lat: number, lng: number): string {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

