import { useEffect, useState, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    MapPin, Clock, Phone, MessageCircle, AlertTriangle, CheckCircle,
    TrendingUp, Navigation, ArrowLeft, RefreshCw
} from 'lucide-react';
import LiveTrackingMap from '@/components/client/LiveTrackingMap';
import { DistanceETA } from '@/components/client/DistanceETA';
import { SharedData } from '@/types';

interface Demande {
    id: number;
    codeDemande: string;
    localisation: string;
    latitude?: number;
    longitude?: number;
    vehicle_type: string;
    typePanne: string;
    descriptionProbleme: string;
    status: string;
    createdAt: string;
    acceptedAt?: string;
    completedAt?: string;
}

interface Depanneur {
    id: number;
    etablissement_name: string;
    phone: string;
    avatar_url?: string;
    localisation_actuelle?: string;
}

export default function SuiviDemandePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { demande, depanneur } = usePage<SharedData & {
        demande?: Demande;
        depanneur?: Depanneur;
    }>().props;

    const [currentStatus, setCurrentStatus] = useState(demande?.status || 'en_attente');
    const [depanneurLocation, setDepanneurLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [clientLocation, setClientLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(15);
    const [refreshing, setRefreshing] = useState(false);

    // Extraire la position du dépanneur depuis la localisation_actuelle
    useEffect(() => {
        if (depanneur?.localisation_actuelle) {
            const coords = depanneur.localisation_actuelle.split(',').map(Number);
            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                setDepanneurLocation({ lat: coords[0], lng: coords[1] });
            }
        }
    }, [depanneur]);

    // Géolocalisation du client avec API HTML5
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setClientLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Erreur géolocalisation:', error);
                    // Position par défaut (Paris) si GPS non disponible
                    setClientLocation({ lat: 48.8566, lng: 2.3522 });
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            // Fallback si pas de support GPS
            setClientLocation({ lat: 48.8566, lng: 2.3522 });
        }
    }, []);

    // Rafraîchir les données de la demande
    const refreshData = useCallback(async () => {
        if (!demande?.id) return;

        try {
            const response = await fetch(`/api/demandes/${demande.id}`, {
                headers: { 'Accept': 'application/json' },
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentStatus(data.status);

                // Récupérer la localisation du dépanneur si disponible
                if (data.depanneur?.location) {
                    setDepanneurLocation({
                        lat: data.depanneur.location.latitude,
                        lng: data.depanneur.location.longitude,
                    });
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        }
    }, [demande?.id]);

    // Mettre à jour le statut toutes les 10 secondes
    useEffect(() => {
        if (!demande?.id) return;

        const interval = setInterval(() => {
            refreshData();
        }, 10000);

        return () => clearInterval(interval);
    }, [demande?.id, refreshData]);

    // Décrémenter le temps restant
    useEffect(() => {
        if (currentStatus === 'acceptee') {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
            }, 60000);

            return () => clearInterval(timer);
        }
    }, [currentStatus]);

    const getStatusInfo = () => {
        switch (currentStatus) {
            case 'en_attente':
                return {
                    title: 'En attente de confirmation',
                    description: 'Un dépanneur va être affecté à votre demande',
                    icon: <Clock className="h-6 w-6 text-yellow-400" />,
                    color: 'bg-yellow-500/10',
                    borderColor: 'border-yellow-500/30',
                    textColor: 'text-yellow-400',
                };
            case 'acceptee':
                return {
                    title: 'Dépanneur en route',
                    description: `${depanneur?.etablissement_name || 'Un dépanneur'} arrive dans ${timeRemaining} minutes`,
                    icon: <Navigation className="h-6 w-6 text-blue-400" />,
                    color: 'bg-blue-500/10',
                    borderColor: 'border-blue-500/30',
                    textColor: 'text-blue-400',
                };
            case 'en_cours':
                return {
                    title: 'Intervention en cours',
                    description: 'Le dépanneur est arrivé et travaille sur votre véhicule',
                    icon: <TrendingUp className="h-6 w-6 text-orange-400" />,
                    color: 'bg-orange-500/10',
                    borderColor: 'border-orange-500/30',
                    textColor: 'text-orange-400',
                };
            case 'terminee':
                return {
                    title: 'Dépannage terminé',
                    description: 'Votre intervention est terminée',
                    icon: <CheckCircle className="h-6 w-6 text-green-400" />,
                    color: 'bg-green-500/10',
                    borderColor: 'border-green-500/30',
                    textColor: 'text-green-400',
                };
            case 'annulee':
                return {
                    title: 'Demande annulée',
                    description: 'Votre demande a été annulée',
                    icon: <AlertTriangle className="h-6 w-6 text-red-400" />,
                    color: 'bg-red-500/10',
                    borderColor: 'border-red-500/30',
                    textColor: 'text-red-400',
                };
            default:
                return {
                    title: 'Statut inconnu',
                    description: '',
                    icon: <AlertTriangle className="h-6 w-6" />,
                    color: 'bg-slate-700/30',
                    borderColor: 'border-slate-600',
                    textColor: 'text-slate-400',
                };
        }
    };

    const statusInfo = getStatusInfo();

    if (!demande) {
        return (
            <AppHeaderLayout>
                <Head title="Suivi demande - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-8 text-center">
                            <p className="text-slate-400">Demande non trouvée</p>
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title={`Suivi - ${demande.codeDemande} - GoAssist`} />

            <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        {refreshing && (
                            <span className="text-xs text-slate-400 flex items-center">
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                Mise à jour...
                            </span>
                        )}
                    </div>

                    {/* Status Alert */}
                    <Alert className={`${statusInfo.color} border ${statusInfo.borderColor}`}>
                        <div className="flex items-start gap-3">
                            {statusInfo.icon}
                            <div>
                                <h2 className={`font-bold ${statusInfo.textColor}`}>{statusInfo.title}</h2>
                                <AlertDescription className="text-slate-300 mt-1">
                                    {statusInfo.description}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>

                    {/* Code Demande */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span>Numéro de demande</span>
                                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                    {demande.codeDemande}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                    </Card>

                    {/* Carte de suivi en temps réel avec LiveTrackingMap */}
                    {clientLocation && (
                        <LiveTrackingMap
                            demandeId={demande.id}
                            clientPosition={clientLocation}
                            depanneurPosition={depanneurLocation || undefined}
                            depanneurName={depanneur?.etablissement_name}
                            depanneurEtablissement={depanneur?.etablissement_name}
                            depanneurPhone={depanneur?.phone}
                            status={currentStatus as 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee'}
                            onRefresh={refreshData}
                            openInMapsUrl={
                                clientLocation && depanneurLocation
                                    ? `https://www.google.com/maps/dir/${clientLocation.lat},${clientLocation.lng}/${depanneurLocation.lat},${depanneurLocation.lng}`
                                    : clientLocation
                                    ? `https://www.google.com/maps?q=${clientLocation.lat},${clientLocation.lng}`
                                    : undefined
                            }
                            height="450px"
                        />
                    )}

                    {/* Distance ETA Card */}
                    {clientLocation && depanneurLocation && currentStatus !== 'en_attente' && (
                        <DistanceETA
                            from={clientLocation}
                            to={depanneurLocation}
                            fromLabel="Votre position"
                            toLabel={depanneur?.etablissement_name || 'Dépanneur'}
                            expanded={true}
                        />
                    )}

                    {/* Détails du dépannage */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Détails du dépannage</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Type de véhicule</p>
                                    <p className="text-white font-semibold capitalize">{demande.vehicle_type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Type de panne</p>
                                    <p className="text-white font-semibold">{demande.typePanne}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-slate-400 mb-1">Description</p>
                                <p className="text-slate-300">{demande.descriptionProbleme || 'Aucune description fournie'}</p>
                            </div>

                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <MapPin className="h-4 w-4" />
                                <span>{demande.localisation}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dépanneur Info */}
                    {depanneur && currentStatus !== 'en_attente' && (
                        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 border-slate-600">
                            <CardHeader>
                                <CardTitle className="text-white">Votre dépanneur</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-4">
                                    {depanneur.avatar_url ? (
                                        <img
                                            src={depanneur.avatar_url}
                                            alt={depanneur.etablissement_name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                                            🔧
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-white font-bold text-lg">
                                            {depanneur.etablissement_name}
                                        </h3>
                                        <p className="text-slate-400 text-sm">Dépanneur certifié</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                        onClick={() => window.location.href = `tel:${depanneur.phone}`}
                                    >
                                        <Phone className="h-4 w-4 mr-2" />
                                        Appeler
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                                    >
                                        <MessageCircle className="h-4 w-4 mr-2" />
                                        Message
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white text-sm">Chronologie</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <div className="w-0.5 h-8 bg-slate-600"></div>
                                </div>
                                <div>
                                    <p className="text-slate-300 text-sm font-semibold">Demande créée</p>
                                    <p className="text-xs text-slate-500">{new Date(demande.createdAt).toLocaleString('fr-FR')}</p>
                                </div>
                            </div>

                            {demande.acceptedAt && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        <div className="w-0.5 h-8 bg-slate-600"></div>
                                    </div>
                                    <div>
                                        <p className="text-slate-300 text-sm font-semibold">Acceptée par le dépanneur</p>
                                        <p className="text-xs text-slate-500">{new Date(demande.acceptedAt).toLocaleString('fr-FR')}</p>
                                    </div>
                                </div>
                            )}

                            {demande.completedAt && (
                                <div className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-slate-300 text-sm font-semibold">Terminée</p>
                                        <p className="text-xs text-slate-500">{new Date(demande.completedAt).toLocaleString('fr-FR')}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

