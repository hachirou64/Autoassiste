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
    /** État initial du suivi de géolocalisation (depuis le serveur) */
    initialTrackingState?: boolean;
    /** Indique si la position du serveur est récente (moins de 5 min) */
    isServerPositionRecent?: boolean;
}

export function DepanneurGeolocationStatus({
    showControls = true,
    onPositionUpdate,
    initialTrackingState = false,
    isServerPositionRecent = false,
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
        autoUpdate: false, // On start manuellement par défaut
        initialTrackingState: initialTrackingState,
        onLocationUpdate: (pos) => {
            onPositionUpdate?.({ lat: pos.latitude, lng: pos.longitude });
        },
        onError: (err) => {
            console.error('Geolocation error:', err);
        },
    });

    // Déterminer si le suivi est actif (soit local, soit via le serveur)
    const isActive = isTracking || (isServerPositionRecent && !error);
    
    // Déterminer le texte du bouton et l'action
    const buttonText = isActive ? 'Désactiver' : 'Activer';
    const buttonAction = isActive ? stopTracking : startTracking;

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
        <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        Géolocalisation
                    </CardTitle>
                    
                    {/* Statut badge */}
                    <Badge 
                        className={
                            isActive 
                                ? "bg-green-50 text-green-600 border-green-200"
                                : error
                                ? "bg-red-50 text-red-600 border-red-200"
                                : "bg-gray-100 text-gray-600 border-gray-200"
                        }
                    >
                        {isActive ? (
                            <>
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse" />
                                Actif
                            </>
                        ) : error ? (
                            <>
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Erreur
                            </>
                        ) : (
                            <>
                                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1.5" />
                                Inactif
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Position actuelle */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        ) : position ? (
                            <MapPin className="h-5 w-5 text-green-500" />
                        ) : (
                            <MapPin className="h-5 w-5 text-gray-400" />
                        )}
                        
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {position 
                                    ? `${position.latitude.toFixed(6)}, ${position.longitude.toFixed(6)}`
                                    : 'Position non disponible'
                                }
                            </p>
                            {position && (
                                <p className="text-xs text-gray-500">
                                    Précision: {formatAccuracy(position.accuracy)}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    {/* Indicateur de positionnement en cours */}
                    {isLoading && (
                        <span className="text-xs text-blue-500 flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Détection...
                        </span>
                    )}
                </div>

                {/* Erreur */}
                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Statut serveur */}
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock className="h-4 w-4" />
                        <span>Dernière sync serveur:</span>
                    </div>
                    <span className="text-gray-900">
                        {lastServerUpdate ? (
                            <span className="flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                {formatLastUpdate(lastServerUpdate)}
                            </span>
                        ) : (
                            <span className="text-gray-400">Jamais synchronisé</span>
                        )}
                    </span>
                </div>

                {/* Contrôles */}
                {showControls && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                        <Button 
                            onClick={buttonAction}
                            className={`flex-1 ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                            size="sm"
                        >
                            <LocateFixed className="h-4 w-4 mr-2" />
                            {isActive ? 'Désactiver la géolocalisation' : 'Activer la géolocalisation'}
                        </Button>
                        {isActive && (
                            <Button 
                                onClick={detectPosition}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default DepanneurGeolocationStatus;

