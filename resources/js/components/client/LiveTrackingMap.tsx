import { useEffect, useState, useCallback, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    MapPin, Navigation, Clock, Phone, MessageCircle, 
    RefreshCw, ExternalLink, Loader, AlertTriangle, CheckCircle 
} from 'lucide-react';
import Map, { LocationMarker, MapRoute } from '@/components/Map';
import { DistanceETA, DistanceBadge, ETABadge } from '@/components/client/DistanceETA';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance, formatETA } from '@/lib/geolocation';

export interface LiveTrackingProps {
    /** ID de la demande à suivre */
    demandeId: number;
    /** Position du client */
    clientPosition: { lat: number; lng: number } | null;
    /** Position du dépanneur (optionnel) */
    depanneurPosition?: { lat: number; lng: number } | null;
    /** Nom du dépanneur */
    depanneurName?: string;
    /** Établissement du dépanneur */
    depanneurEtablissement?: string;
    /** Téléphone du dépanneur */
    depanneurPhone?: string;
    /** Statut de la demande */
    status: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
    /** Callback pour rafraîchir les données */
    onRefresh?: () => Promise<void>;
    /** URL pour ouvrir dans Google Maps */
    openInMapsUrl?: string;
    /** Hauteur de la carte */
    height?: string;
    /** Activer le suivi automatique de la position client */
    autoTrackClient?: boolean;
}

export default function LiveTrackingMap({
    demandeId,
    clientPosition,
    depanneurPosition,
    depanneurName,
    depanneurEtablissement,
    depanneurPhone,
    status,
    onRefresh,
    openInMapsUrl,
    height = '400px',
    autoTrackClient = true,
}: LiveTrackingProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Suivi de la position du client
    const { 
        coordinates: liveClientPosition, 
        loading: geoLoading, 
        error: geoError,
        watching,
        startWatching,
        stopWatching,
        getCurrentPosition 
    } = useGeolocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
        watchPosition: autoTrackClient,
    });

    // Utiliser la position live si disponible, sinon celle passée en props
    const currentClientPosition = useMemo(() => {
        if (autoTrackClient && liveClientPosition) {
            return liveClientPosition;
        }
        return clientPosition;
    }, [autoTrackClient, liveClientPosition, clientPosition]);

    // Calculer la distance et l'ETA
    const trackingInfo = useMemo(() => {
        if (!currentClientPosition || !depanneurPosition) {
            return null;
        }

        const distance = calculateDistance(currentClientPosition, depanneurPosition, 'km');
        const etaMinutes = Math.ceil((distance / 40) * 60);

        return {
            distance,
            etaMinutes,
            distanceFormatted: formatDistance(distance),
            etaFormatted: formatETA(etaMinutes),
        };
    }, [currentClientPosition, depanneurPosition]);

    // Rafraîchir les données
    const handleRefresh = useCallback(async () => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        try {
            await onRefresh?.();
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Erreur lors du rafraîchissement:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [onRefresh, isRefreshing]);

    // Démarrer le suivi GPS
    const handleStartTracking = () => {
        startWatching();
    };

    // Obtenir la position actuelle
    const handleGetCurrentPosition = async () => {
        await getCurrentPosition();
    };

    // Marqueur du client
    const clientMarker: LocationMarker | null = currentClientPosition ? {
        lat: currentClientPosition.lat,
        lng: currentClientPosition.lng,
        label: 'Votre position',
        icon: 'client',
        popup: `
            <div class="text-center">
                <strong>Vous êtes ici</strong><br/>
                ${trackingInfo ? `${trackingInfo.distanceFormatted} du dépanneur` : ''}
            </div>
        `,
    } : null;

    // Marqueur du dépanneur
    const depanneurMarker: LocationMarker | null = depanneurPosition ? {
        lat: depanneurPosition.lat,
        lng: depanneurPosition.lng,
        label: depanneurEtablissement || 'Dépanneur',
        icon: 'depanneur',
        popup: `
            <div class="text-center">
                <strong>${depanneurEtablissement || 'Dépanneur'}</strong><br/>
                ${depanneurName ? `(${depanneurName})` : ''}
            </div>
        `,
    } : null;

    // Route entre le client et le dépanneur
    const route: MapRoute | null = currentClientPosition && depanneurPosition ? {
        coordinates: [currentClientPosition, depanneurPosition],
        color: '#3b82f6',
        weight: 4,
        dashArray: '10, 10',
    } : null;

    // Centre de la carte
    const center = depanneurPosition || currentClientPosition || { lat: 48.8566, lng: 2.3522 };

    // Zoom automatique si les deux positions sont disponibles
    const fitBounds = !!(clientMarker && depanneurMarker);

    return (
        <div className="space-y-4">
            {/* En-tête avec statut */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {status === 'acceptee' && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            <Navigation className="h-3 w-3 mr-1 animate-pulse" />
                            En route
                        </Badge>
                    )}
                    {status === 'en_cours' && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            <Loader className="h-3 w-3 mr-1 animate-spin" />
                            Intervention
                        </Badge>
                    )}
                    {status === 'terminee' && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Terminée
                        </Badge>
                    )}
                    {status === 'en_attente' && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                            <Clock className="h-3 w-3 mr-1" />
                            En attente
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Indicateur de dernière mise à jour */}
                    {lastUpdate && (
                        <span className="text-xs text-slate-500">
                            Mis à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                        </span>
                    )}
                    
                    {/* Bouton de rafraîchissement */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="text-slate-400 hover:text-white"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* Distance et ETA */}
            {trackingInfo && status !== 'en_attente' && (
                <DistanceETA
                    from={currentClientPosition}
                    to={depanneurPosition}
                    fromLabel="Votre position"
                    toLabel={depanneurEtablissement || 'Dépanneur'}
                    expanded={true}
                />
            )}

            {/* Carte */}
            <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        Suivi en temps réel
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Indicateurs de statut GPS */}
                    <div className="px-4 py-2 flex items-center justify-between bg-slate-900/30 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                            {geoLoading ? (
                                <span className="text-xs text-slate-400 flex items-center">
                                    <Loader className="h-3 w-3 mr-1 animate-spin" />
                                    GPS en cours...
                                </span>
                            ) : watching ? (
                                <span className="text-xs text-green-400 flex items-center">
                                    <Navigation className="h-3 w-3 mr-1" />
                                    Suivi GPS actif
                                </span>
                            ) : (
                                <span className="text-xs text-slate-500">
                                    GPS inactif
                                </span>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                            {!autoTrackClient && !watching && currentClientPosition && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGetCurrentPosition}
                                    className="text-xs text-slate-400 h-6"
                                >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    Actualiser
                                </Button>
                            )}
                            {!watching && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleStartTracking}
                                    className="text-xs text-blue-400 h-6"
                                >
                                    <Navigation className="h-3 w-3 mr-1" />
                                    Suivre
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Erreur de géolocalisation */}
                    {geoError && (
                        <Alert className="m-4 bg-orange-500/10 border-orange-500/30">
                            <AlertTriangle className="h-4 w-4 text-orange-400" />
                            <AlertDescription className="text-orange-400 text-sm">
                                {geoError}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Carte */}
                    {currentClientPosition || depanneurPosition ? (
                        <Map
                            center={center}
                            markers={[
                                ...(clientMarker ? [clientMarker] : []),
                                ...(depanneurMarker ? [depanneurMarker] : []),
                            ].filter(Boolean) as LocationMarker[]}
                            routes={route ? [route] : []}
                            zoom={fitBounds ? 14 : 16}
                            height={height}
                            fitBounds={fitBounds}
                        />
                    ) : (
                        <div 
                            className="flex items-center justify-center bg-slate-900"
                            style={{ height }}
                        >
                            <div className="text-center">
                                <MapPin className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                                <p className="text-slate-400">
                                    En attente de la position...
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Actions */}
            {depanneurPhone && status !== 'terminee' && status !== 'annulee' && (
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.open(`tel:${depanneurPhone}`)}
                    >
                        <Phone className="h-4 w-4 mr-2" />
                        Appeler
                    </Button>
                    <Button
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        onClick={() => window.open(`sms:${depanneurPhone}`)}
                    >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                    </Button>
                </div>
            )}

            {/* Ouvrir dans Google Maps */}
            {openInMapsUrl && (currentClientPosition || depanneurPosition) && (
                <Button
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white"
                    onClick={() => window.open(openInMapsUrl, '_blank')}
                >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir dans Google Maps
                </Button>
            )}
        </div>
    );
}

/**
 * Version simplifiée du composant pour utilisation dans d'autres composants
 */
export function SimpleLiveTracking({
    clientPosition,
    depanneurPosition,
    depanneurName,
    height = '300px',
}: {
    clientPosition: { lat: number; lng: number } | null;
    depanneurPosition?: { lat: number; lng: number } | null;
    depanneurName?: string;
    height?: string;
}) {
    const clientMarker: LocationMarker | null = clientPosition ? {
        lat: clientPosition.lat,
        lng: clientPosition.lng,
        label: 'Vous',
        icon: 'client',
    } : null;

    const depanneurMarker: LocationMarker | null = depanneurPosition ? {
        lat: depanneurPosition.lat,
        lng: depanneurPosition.lng,
        label: depanneurName || 'Dépanneur',
        icon: 'depanneur',
    } : null;

    const route: MapRoute | null = clientPosition && depanneurPosition ? {
        coordinates: [clientPosition, depanneurPosition],
        color: '#3b82f6',
        weight: 3,
        dashArray: '5, 5',
    } : null;

    const center = depanneurPosition || clientPosition || { lat: 48.8566, lng: 2.3522 };
    const fitBounds = !!(clientMarker && depanneurMarker);

    if (!clientPosition) {
        return (
            <div 
                className="flex items-center justify-center bg-slate-800 rounded-lg"
                style={{ height }}
            >
                <p className="text-slate-400">Position non disponible</p>
            </div>
        );
    }

    return (
        <Map
            center={center}
            markers={[
                ...(clientMarker ? [clientMarker] : []),
                ...(depanneurMarker ? [depanneurMarker] : []),
            ].filter(Boolean) as LocationMarker[]}
            routes={route ? [route] : []}
            zoom={fitBounds ? 14 : 15}
            height={height}
            fitBounds={fitBounds}
        />
    );
}

