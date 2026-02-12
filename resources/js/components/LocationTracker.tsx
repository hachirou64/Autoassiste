import { useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface LocationTrackerProps {
    demandeId: number;
    enabled?: boolean;
    updateInterval?: number; // en millisecondes
}

export default function LocationTracker({
    demandeId,
    enabled = true,
    updateInterval = 10000, // 10 secondes par défaut
}: LocationTrackerProps) {
    const { coordinates, error, loading } = useGeolocation({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
    });

    const [isTracking, setIsTracking] = useState(enabled);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    // Envoyer la position au serveur toutes les X secondes
    useEffect(() => {
        if (!isTracking || !coordinates) return;

        const interval = setInterval(async () => {
            try {
                const response = await fetch('/api/depanneur/location', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        latitude: coordinates.lat,
                        longitude: coordinates.lng,
                        demande_id: demandeId,
                    }),
                });

                if (response.ok) {
                    setUpdateStatus('success');
                    setLastUpdate(new Date());
                    setTimeout(() => setUpdateStatus('idle'), 2000);
                } else {
                    setUpdateStatus('error');
                    setTimeout(() => setUpdateStatus('idle'), 2000);
                }
            } catch (err) {
                console.error('Erreur lors de l\'envoi de la position:', err);
                setUpdateStatus('error');
                setTimeout(() => setUpdateStatus('idle'), 2000);
            }
        }, updateInterval);

        return () => clearInterval(interval);
    }, [isTracking, coordinates, demandeId, updateInterval]);

    if (!enabled) return null;

    return (
        <div className="space-y-4">
            {error && (
                <Alert className="bg-red-500/10 border border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                        Erreur de géolocalisation: {error}
                    </AlertDescription>
                </Alert>
            )}

            {updateStatus === 'success' && (
                <Alert className="bg-green-500/10 border border-green-500/30">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                        Position mise à jour avec succès
                        {lastUpdate && (
                            <p className="text-xs text-green-300/70 mt-1">
                                Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                            </p>
                        )}
                    </AlertDescription>
                </Alert>
            )}

            {updateStatus === 'error' && (
                <Alert className="bg-orange-500/10 border border-orange-500/30">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-400">
                        Impossible de mettre à jour la position
                    </AlertDescription>
                </Alert>
            )}

            <div className="flex items-center gap-2">
                <Button
                    onClick={() => setIsTracking(!isTracking)}
                    className={`flex-1 ${
                        isTracking
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    disabled={loading || !coordinates}
                >
                    <MapPin className="h-4 w-4 mr-2" />
                    {isTracking ? 'Arrêter le suivi' : 'Démarrer le suivi'}
                </Button>
            </div>

            {coordinates && isTracking && (
                <div className="bg-slate-800/50 rounded p-3 text-xs text-slate-400 border border-slate-600 space-y-1">
                    <p>
                        <strong>Latitude:</strong>{' '}
                        {coordinates.lat.toFixed(6)}
                    </p>
                    <p>
                        <strong>Longitude:</strong>{' '}
                        {coordinates.lng.toFixed(6)}
                    </p>
                    {lastUpdate && (
                        <p>
                            <strong>Dernière sync:</strong>{' '}
                            {lastUpdate.toLocaleTimeString('fr-FR')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
