import { useDepanneurGeolocation } from '@/hooks/useDepanneurGeolocation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Navigation, 
    LocateFixed,
    RefreshCw,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';

interface DepanneurGeolocationStatusProps {
    /** Afficher le bouton pour démarrer/arrêter le suivi */
    showControls?: boolean;
    /** Callback quand la position est mise à jour */
    onPositionUpdate?: (position: { lat: number; lng: number }) => void;
}

export function DepanneurGeolocationStatus({
    showControls = true,
    onPositionUpdate,
}: DepanneurGeolocationStatusProps) {
    const {
        position,
        isLoading,
        isTracking,
        error,
        accuracy,
        lastServerUpdate,
        detectPosition,
        startTracking,
        stopTracking,
    } = useDepanneurGeolocation({
        updateInterval: 30000, // 30 secondes
        maxAccuracy: 1000, // 1km
        autoUpdate: false, // On start manuellement
        onLocationUpdate: (pos) => {
            onPositionUpdate?.({ lat: pos.latitude, lng: pos.longitude });
        },
        onError: (err) => {
            console.error('Geolocation error:', err);
        },
    });

    // Formater la précision
    const formatAccuracy = (acc: number | null) => {
        if (acc === null) return 'N/A';
        if (acc < 100) return `${Math.round(acc)}m (Excellente)`;
        if (acc < 500) return `${Math.round(acc)}m (Bonne)`;
        if (acc < 1000) return `${Math.round(acc)}m (Acceptable)`;
        return `${Math.round(acc)}m (Faible)`;
    };

    // Formater la dernière mise à jour serveur
    const formatLastUpdate = (date: Date | null) => {
        if (!date) return 'Jamais';
        
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        
        if (diffSec < 60) return 'À l\'instant';
        if (diffSec < 3600) return `Il y a ${Math.floor(diffSec / 60)} min`;
        return `Il y a ${Math.floor(diffSec / 3600)}h`;
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        Géolocalisation
                    </CardTitle>
                    
                    {/* Statut badge */}
                    <Badge 
                        className={
                            isTracking 
                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                : error
                                ? "bg-red-500/20 text-red-400 border-red-500/30"
                                : "bg-slate-500/20 text-slate-400 border-slate-500/30"
                        }
                    >
                        {isTracking ? (
                            <>
                                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                                Actif
                            </>
                        ) : error ? (
                            <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erreur
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 bg-slate-400 rounded-full mr-1.5" />
                                Inactif
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Position actuelle */}
                <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                        ) : position ? (
                            <MapPin className="h-5 w-5 text-green-400" />
                        ) : (
                            <MapPin className="h-5 w-5 text-slate-500" />
                        )}
                        
                        <div>
                            <p className="text-sm font-medium text-white">
                                {position 
                                    ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
                                    : 'Position non disponible'
                                }
                            </p>
                            {position && (
                                <p className="text-xs text-slate-400">
                                    Précision: {formatAccuracy(position.accuracy)}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Indicateur de positionnement en cours */}
                    {isLoading && (
                        <span className="text-xs text-blue-400 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Détection...
                        </span>
                    )}
                </div>

                {/* Erreur */}
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Statut serveur */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-4 w-4" />
                        <span>Dernière sync serveur:</span>
                    </div>
                    <span className="text-white">
                        {lastServerUpdate ? (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-400" />
                                {formatLastUpdate(lastServerUpdate)}
                            </span>
                        ) : (
                            <span className="text-slate-500">Jamais synchronisé</span>
                        )}
                    </span>
                </div>

                {/* Contrôles */}
                {showControls && (
                    <div className="flex gap-2 pt-2 border-t border-slate-700">
                        {!isTracking ? (
                            <Button 
                                onClick={startTracking}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                size="sm"
                            >
                                <LocateFixed className="h-4 w-4 mr-2" />
                                Activer la géolocalisation
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    onClick={detectPosition}
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                    Actualiser
                                </Button>
                                <Button 
                                    onClick={stopTracking}
                                    variant="outline"
                                    size="sm"
                                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                    <Navigation className="h-4 w-4 mr-2" />
                                    Arrêter
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default DepanneurGeolocationStatus;

