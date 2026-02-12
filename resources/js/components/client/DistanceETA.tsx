import { useMemo } from 'react';
import { MapPin, Clock, Navigation, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { calculateDistance, calculateETA, formatDistance, formatETA } from '@/lib/geolocation';

export interface DistanceETAProps {
    /** Position de départ (client) */
    from: { lat: number; lng: number } | null | undefined;
    /** Position d'arrivée (dépanneur) */
    to: { lat: number; lng: number } | null | undefined;
    /** Label pour la position de départ */
    fromLabel?: string;
    /** Label pour la position d'arrivée */
    toLabel?: string;
    /** Vitesse moyenne personnalisée (km/h) */
    averageSpeed?: number;
    /** Afficher les détails cachés par défaut */
    expanded?: boolean;
    /** Classe CSS supplémentaire */
    className?: string;
}

export function DistanceETA({
    from,
    to,
    fromLabel = 'Votre position',
    toLabel = 'Dépanneur',
    averageSpeed = 40,
    expanded = false,
    className = '',
}: DistanceETAProps) {
    // Calculer la distance et l'ETA
    const { distance, eta, isValid, distanceKm } = useMemo(() => {
        if (!from || !to) {
            return { distance: null, eta: null, isValid: false, distanceKm: 0 };
        }

        const distanceKm = calculateDistance(from, to, 'km');
        const etaMinutes = calculateETA(distanceKm, averageSpeed);

        return {
            distance: formatDistance(distanceKm),
            eta: formatETA(etaMinutes),
            isValid: true,
            distanceKm,
        };
    }, [from, to, averageSpeed]);

    // Obtenir la couleur selon la distance
    const getStatusColor = () => {
        if (!isValid || distanceKm === 0) return 'text-slate-400';
        if (distanceKm < 2) return 'text-green-400';
        if (distanceKm < 5) return 'text-yellow-400';
        if (distanceKm < 10) return 'text-orange-400';
        return 'text-red-400';
    };

    // Obtenir l'icône selon l'ETA
    const getETAIcon = () => {
        if (!isValid || distanceKm === 0) return <Clock className="h-4 w-4" />;
        if (distanceKm < 2) return <Zap className="h-4 w-4 animate-pulse" />;
        return <Clock className="h-4 w-4" />;
    };

    return (
        <Card className={`bg-slate-800/50 border-slate-700 ${className}`}>
            <CardContent className="p-4">
                {!isValid ? (
                    // Affichage quand les positions ne sont pas disponibles
                    <div className="flex items-center justify-center py-4 text-slate-400">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>En attente de la position...</span>
                    </div>
                ) : (
                    // Affichage normal avec distance et ETA
                    <div className="space-y-3">
                        {/* Ligne de route */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                                <span className="text-slate-300">{fromLabel}</span>
                            </div>
                            <div className="flex items-center text-slate-500">
                                <Navigation className="h-4 w-4 mx-2" />
                            </div>
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2" />
                                <span className="text-slate-300">{toLabel}</span>
                            </div>
                        </div>

                        {/* Distance et ETA */}
                        <div className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                            <div className="flex items-center">
                                <MapPin className={`h-5 w-5 mr-2 ${getStatusColor()}`} />
                                <div>
                                    <p className={`text-lg font-bold ${getStatusColor()}`}>
                                        {distance}
                                    </p>
                                    <p className="text-xs text-slate-500">Distance</p>
                                </div>
                            </div>

                            <div className="h-8 w-px bg-slate-600" />

                            <div className="flex items-center">
                                <div className="mr-3 text-right">
                                    <p className={`text-lg font-bold ${getStatusColor()}`}>
                                        {eta}
                                    </p>
                                    <p className="text-xs text-slate-500">Temps d&apos;arrivée</p>
                                </div>
                                {getETAIcon()}
                            </div>
                        </div>

                        {/* Indicateur visuel de l'état */}
                        {expanded && (
                            <div className={`text-xs text-center py-2 rounded ${
                                distanceKm < 2 
                                    ? 'bg-green-500/10 text-green-400'
                                    : distanceKm < 5
                                    ? 'bg-yellow-500/10 text-yellow-400'
                                    : 'bg-slate-700 text-slate-400'
                            }`}>
                                {distanceKm < 2
                                    ? '🔥 Le dépanneur arrive très bientôt!'
                                    : distanceKm < 5
                                    ? '⏱️ Le dépanneur arrive dans quelques minutes'
                                    : `📍 Le dépanneur est à ${distance} de vous`}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/**
 * Petit composant pour afficher uniquement la distance
 */
export function DistanceBadge({
    from,
    to,
    className = '',
}: {
    from: { lat: number; lng: number } | null | undefined;
    to: { lat: number; lng: number } | null | undefined;
    className?: string;
}) {
    const distance = useMemo(() => {
        if (!from || !to) return null;
        return formatDistance(calculateDistance(from, to, 'km'));
    }, [from, to]);

    if (!distance) return null;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-300 ${className}`}>
            <MapPin className="h-3 w-3 mr-1" />
            {distance}
        </span>
    );
}

/**
 * Petit composant pour afficher uniquement l'ETA
 */
export function ETABadge({
    from,
    to,
    averageSpeed = 40,
    className = '',
}: {
    from: { lat: number; lng: number } | null | undefined;
    to: { lat: number; lng: number } | null | undefined;
    averageSpeed?: number;
    className?: string;
}) {
    const eta = useMemo(() => {
        if (!from || !to) return null;
        const distanceKm = calculateDistance(from, to, 'km');
        return formatETA(calculateETA(distanceKm, averageSpeed));
    }, [from, to, averageSpeed]);

    if (!eta) return null;

    return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 ${className}`}>
            <Clock className="h-3 w-3 mr-1" />
            {eta}
        </span>
    );
}

