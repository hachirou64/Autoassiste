/**
 * Utilitaires géographiques pour l'application GoAssist
 * 
 * Fonctions pour:
 * - Calcul de distance (Haversine)
 * - Calcul d'ETA (temps d'arrivée estimé)
 * - Validation de coordonnées
 * - Formatage des distances
 */

/**
 * Rayon de la Terre en kilomètres
 */
const EARTH_RADIUS_KM = 6371;

/**
 * Rayon de la Terre en mètres
 */
const EARTH_RADIUS_M = 6371000;

/**
 * Vitesse moyenne pour le calcul ETA (km/h)
 */
const AVERAGE_SPEED_KMH = 40;

/**
 * Interface pour les coordonnées
 */
export interface Coordinates {
    lat: number;
    lng: number;
}

export interface DistanceResult {
    kilometers: number;
    meters: number;
    miles: number;
    formatted: string;
}

export interface ETAResult {
    minutes: number;
    hours: number;
    formatted: string;
}

/**
 * Calculer la distance entre deux points (formule de Haversine)
 * @param point1 Premier point {lat, lng}
 * @param point2 Deuxième point {lat, lng}
 * @param unit Unité de retour: 'km', 'm', 'mi'
 * @returns Distance dans l'unité spécifiée
 */
export function calculateDistance(
    point1: Coordinates,
    point2: Coordinates,
    unit: 'km' | 'm' | 'mi' = 'km'
): number {
    const lat1Rad = toRadians(point1.lat);
    const lat2Rad = toRadians(point2.lat);
    const deltaLat = toRadians(point2.lat - point1.lat);
    const deltaLng = toRadians(point2.lng - point1.lng);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1Rad) *
            Math.cos(lat2Rad) *
            Math.sin(deltaLng / 2) *
            Math.sin(deltaLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    switch (unit) {
        case 'm':
            return EARTH_RADIUS_M * c;
        case 'mi':
            return (EARTH_RADIUS_KM * c) / 1.60934;
        default:
            return EARTH_RADIUS_KM * c;
    }
}

/**
 * Obtenir un objet de distance complet
 */
export function getDistanceDetails(point1: Coordinates, point2: Coordinates): DistanceResult {
    const km = calculateDistance(point1, point2, 'km');
    const m = calculateDistance(point1, point2, 'm');
    const mi = calculateDistance(point1, point2, 'mi');

    return {
        kilometers: Math.round(km * 10) / 10,
        meters: Math.round(m),
        miles: Math.round(mi * 10) / 10,
        formatted: formatDistance(km),
    };
}

/**
 * Calculer l'ETA (temps d'arrivée estimé)
 * @param distance Distance en kilomètres
 * @param averageSpeed Vitesse moyenne en km/h (défaut: 40 km/h)
 * @returns ETA en minutes
 */
export function calculateETA(distance: number, averageSpeed: number = AVERAGE_SPEED_KMH): number {
    if (distance <= 0) return 0;
    return Math.ceil((distance / averageSpeed) * 60);
}

/**
 * Obtenir les détails complets de l'ETA
 */
export function getETADetails(point1: Coordinates, point2: Coordinates): ETAResult {
    const distanceKm = calculateDistance(point1, point2, 'km');
    const minutes = calculateETA(distanceKm);

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let formatted: string;
    if (minutes < 1) {
        formatted = 'Moins d\'une minute';
    } else if (minutes < 60) {
        formatted = `${minutes} min`;
    } else {
        formatted = `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
    }

    return {
        minutes,
        hours,
        formatted,
    };
}

/**
 * Formater une distance pour l'affichage
 * @param kilometers Distance en kilomètres
 * @returns Format français (ex: "1.5 km" ou "500 m")
 */
export function formatDistance(kilometers: number): string {
    if (kilometers < 0.1) {
        return 'Proche';
    } else if (kilometers < 1) {
        return `${Math.round(kilometers * 1000)} m`;
    } else {
        return `${kilometers.toFixed(1)} km`.replace('.', ',');
    }
}

/**
 * Formater l'ETA pour l'affichage
 */
export function formatETA(minutes: number): string {
    if (minutes < 1) {
        return 'Arrivant';
    } else if (minutes < 60) {
        return `~${minutes} min`;
    } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `~${hours}h${mins.toString().padStart(2, '0')}`;
    }
}

/**
 * Valider si des coordonnées sont valides
 */
export function isValidCoordinates(coords: Coordinates | null | undefined): boolean {
    if (!coords) return false;
    return (
        typeof coords.lat === 'number' &&
        typeof coords.lng === 'number' &&
        coords.lat >= -90 &&
        coords.lat <= 90 &&
        coords.lng >= -180 &&
        coords.lng <= 180
    );
}

/**
 * Convertir des degrés en radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Générer une position approximative avec un offset
 * Utile pour tester l'affichage des cartes
 */
export function generateNearbyCoordinate(
    base: Coordinates,
    maxDistanceKm: number = 0.1
): Coordinates {
    // Convertir la distance max en degrés (approximatif)
    const latOffset = (Math.random() - 0.5) * (maxDistanceKm / 111);
    const lngOffset = (Math.random() - 0.5) * (maxDistanceKm / (111 * Math.cos(toRadians(base.lat))));

    return {
        lat: base.lat + latOffset,
        lng: base.lng + lngOffset,
    };
}

/**
 * Calculer le centre de plusieurs points
 */
export function calculateCenter(points: Coordinates[]): Coordinates | null {
    if (points.length === 0) return null;

    let sumLat = 0;
    let sumLng = 0;

    points.forEach((point) => {
        sumLat += point.lat;
        sumLng += point.lng;
    });

    return {
        lat: sumLat / points.length,
        lng: sumLng / points.length,
    };
}

/**
 * Vérifier si un point est dans un rayon donné
 */
export function isWithinRadius(
    point: Coordinates,
    center: Coordinates,
    radiusKm: number
): boolean {
    return calculateDistance(point, center, 'km') <= radiusKm;
}

/**
 * Trouver le point le plus proche dans une liste
 */
export function findNearestPoint(
    target: Coordinates,
    points: Coordinates[]
): { point: Coordinates; distance: number } | null {
    if (points.length === 0) return null;

    let nearest = { point: points[0], distance: Infinity };

    points.forEach((point) => {
        const distance = calculateDistance(target, point, 'km');
        if (distance < nearest.distance) {
            nearest = { point, distance };
        }
    });

    return nearest;
}

/**
 * Interface pour l'adresse formatée
 */
export interface FormattedAddress {
    full: string;
    short: string;
    city?: string;
    road?: string;
}

/**
 * Formater une adresse courte pour l'affichage
 */
export function formatAddressShort(address: string): string {
    // Enlever le pays et le code postal pour avoir une adresse plus courte
    const parts = address.split(',').map((p) => p.trim());
    
    if (parts.length <= 3) return address;
    
    // Prendre les 3 dernières parties
    return parts.slice(-3).join(', ');
}

/**
 * Obtenir les coordonnées depuis différents formats possibles
 */
export function parseCoordinates(input: string | { lat: number; lng: number } | null | undefined): Coordinates | null {
    if (!input) return null;
    
    if (typeof input === 'object' && 'lat' in input && 'lng' in input) {
        return {
            lat: Number(input.lat),
            lng: Number(input.lng),
        };
    }
    
    if (typeof input === 'string') {
        const parts = input.split(',').map((p) => parseFloat(p.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return { lat: parts[0], lng: parts[1] };
        }
    }
    
    return null;
}

