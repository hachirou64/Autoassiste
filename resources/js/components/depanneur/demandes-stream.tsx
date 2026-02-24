import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Clock, 
    Phone, 
    Car, 
    Bike,
    X, 
    Check, 
    Volume2,
    VolumeX,
    RefreshCw,
    Navigation,
    AlertCircle
} from 'lucide-react';
import type { DemandeAvailable, DemandeFilters, TypePanne } from '@/types/depanneur';
import { TYPES_PANNE_DEPANNAGE } from '@/types/depanneur';
import { DEMANDE_STATUS_COLORS } from '@/types/client';
import { VEHICLE_TYPES, type VehicleType } from '@/types/vehicle';

interface DemandesStreamProps {
    demandes: DemandeAvailable[];
    filters: DemandeFilters;
    onFiltersChange: (filters: DemandeFilters) => void;
    onAccept: (demandeId: number) => void;
    onRefuse: (demandeId: number) => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
    isLoading?: boolean;
}

// Données mockées pour démonstration
const mockDemandes: DemandeAvailable[] = [
    {
        id: 1,
        codeDemande: 'DEM-2024-001',
        typePanne: 'batterie',
        descriptionProbleme: 'Véhicule qui ne démarre pas, batterie HS',
        localisation: 'Cotonou, Rue de la Paix',
        latitude: 6.366,
        longitude: 2.433,
        distance: 2.5,
        createdAt: new Date().toISOString(),
        tempsRestant: 180,
        client: {
            id: 1,
            fullName: 'Jean Dupont',
            phone: '+229 90 00 00 01',
            photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jean',
        },
        vehicle: {
            brand: 'Toyota',
            model: 'Corolla',
            color: 'Gris',
            plate: 'ABC-123',
        },
        localisationClient: { lat: 6.366, lng: 2.433 },
    },
    {
        id: 2,
        codeDemande: 'DEM-2024-002',
        typePanne: 'panne_seche',
        descriptionProbleme: 'Panne de carburant en route',
        localisation: 'Cotonou, Avenue de la Liberté',
        latitude: 6.370,
        longitude: 2.440,
        distance: 5.2,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        tempsRestant: 300,
        client: {
            id: 2,
            fullName: 'Marie Kouami',
            phone: '+229 90 00 00 02',
        },
        vehicle: {
            brand: 'Honda',
            model: 'Civic',
            color: 'Blanc',
            plate: 'DEF-456',
        },
        localisationClient: { lat: 6.370, lng: 2.440 },
    },
    {
        id: 3,
        codeDemande: 'DEM-2024-003',
        typePanne: 'creaison',
        descriptionProbleme: 'Pneu crevé sur la route',
        localisation: 'Cotonou, Boulevard Saint-Michel',
        latitude: 6.360,
        longitude: 2.435,
        distance: 8.1,
        createdAt: new Date(Date.now() - 60000).toISOString(),
        tempsRestant: 420,
        client: {
            id: 3,
            fullName: 'Paul Agossou',
            phone: '+229 90 00 00 03',
        },
        vehicle: {
            brand: 'Ford',
            model: 'Fiesta',
            color: 'Rouge',
            plate: 'GHI-789',
        },
        localisationClient: { lat: 6.360, lng: 2.435 },
    },
];

const mockTypePanne = TYPES_PANNE_DEPANNAGE;

function getTypePanneInfo(typePanne: string) {
    return mockTypePanne.find(t => t.value === typePanne) || { value: typePanne, label: typePanne, icon: '❓', color: 'text-slate-500' };
}

function formatDistance(distance: number): string {
    if (distance < 1) {
        return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
}

function formatTempsRestant(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function NewDemandeAnimation({ onComplete }: { onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="absolute inset-0 bg-green-500/20 animate-pulse rounded-xl" />
    );
}

export function DemandesStream({
    demandes,
    filters,
    onFiltersChange,
    onAccept,
    onRefuse,
    soundEnabled,
    onToggleSound,
    isLoading = false
}: DemandesStreamProps) {
    const [selectedDemande, setSelectedDemande] = useState<number | null>(null);
    const [animatingNew, setAnimatingNew] = useState<number[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevCountRef = useRef(demandes.length);

    // Lecture son lors de nouvelle demande
    useEffect(() => {
        if (demandes.length > prevCountRef.current && soundEnabled) {
            // Son de notification (simulation)
            if (audioRef.current) {
                audioRef.current.play().catch(() => {});
            }
        }
        prevCountRef.current = demandes.length;
    }, [demandes.length, soundEnabled]);

    // Timer pour chaque demande - timers sont mis à jour par le parent
    useEffect(() => {
        // Les timers sont gérés par le composant parent qui passe les données
        // Cette fonction peut être utilisée pour des mises à jour périodiques si nécessaire
        return () => {
            // Cleanup si nécessaire
        };
    }, []);

    // Filtrer les demandes selon les filtres actifs
    const filteredDemandes = demandes.filter((demande) => {
        // Filtrer par type de panne
        if (filters.typePanne && demande.typePanne !== filters.typePanne) {
            return false;
        }
        
        // Filtrer par distance (rayon)
        if (demande.distance > filters.rayon) {
            return false;
        }
        
        // Filtrer par type de véhicule (si spécifié)
        if (filters.vehicleType && filters.vehicleType !== 'all') {
            // Note: Les données du véhicule ne sont pas toujours présentes
            // Donc on filtre uniquement si on a l'info
            if (demande.vehicle) {
                // Pour l'instant, le type de véhicule n'est pas dans les données de la demande
                // Donc on laisse passer toutes les demandes
            }
        }
        
        return true;
    });

    const handleAccept = (demandeId: number) => {
        onAccept(demandeId);
        setSelectedDemande(null);
    };

    const handleRefuse = (demandeId: number) => {
        onRefuse(demandeId);
        setSelectedDemande(null);
    };

    return (
        <div className="space-y-4">
            {/* Header avec filtres */}
            <Card className="bg-white border-gray-200">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-500" />
                            Demandes disponibles
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                {filteredDemandes.length}
                            </Badge>
                        </CardTitle>
                        
                        <div className="flex items-center gap-2">
                            {/* Toggle son */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggleSound}
                                className="text-gray-500 hover:text-gray-900"
                            >
                                {soundEnabled ? (
                                    <Volume2 className="h-5 w-5" />
                                ) : (
                                    <VolumeX className="h-5 w-5" />
                                )}
                            </Button>
                            
                            {/* Rafraîchir */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-gray-900"
                            >
                                <RefreshCw className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="pb-3">
                    {/* Filtres par rayon et type de véhicule */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm text-gray-600 flex items-center">
                            <Navigation className="h-4 w-4 mr-1" />
                            Rayon:
                        </span>
                        {[5, 10, 20, 50].map((rayon) => (
                            <Button
                                key={rayon}
                                variant={filters.rayon === rayon ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, rayon })}
                                className={
                                    filters.rayon === rayon
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }
                            >
                                {rayon} km
                            </Button>
                        ))}
                    </div>
                    
                    {/* Filtre par type de véhicule */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-600 flex items-center">
                            {filters.vehicleType === 'voiture' ? (
                                <Car className="h-4 w-4 mr-1" />
                            ) : filters.vehicleType === 'moto' ? (
                                <Bike className="h-4 w-4 mr-1" />
                            ) : (
                                <Car className="h-4 w-4 mr-1" />
                            )}
                            Type:
                        </span>
                        <Button
                            variant={filters.vehicleType === undefined || filters.vehicleType === 'all' ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, vehicleType: 'all' })}
                            className={
                                filters.vehicleType === undefined || filters.vehicleType === 'all'
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                        >
                            Tous
                        </Button>
                        {VEHICLE_TYPES.map((type) => (
                            <Button
                                key={type.value}
                                variant={filters.vehicleType === type.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, vehicleType: type.value })}
                                className={
                                    filters.vehicleType === type.value
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }
                            >
                                {type.icon} {type.label}
                            </Button>
                        ))}
                    </div>
                    
                    {/* Filtre par type de panne */}
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-sm text-gray-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            Panne:
                        </span>
                        <Button
                            variant={!filters.typePanne ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFiltersChange({ ...filters, typePanne: undefined })}
                            className={
                                !filters.typePanne
                                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                        >
                            Toutes
                        </Button>
                        {TYPES_PANNE_DEPANNAGE.map((type) => (
                            <Button
                                key={type.value}
                                variant={filters.typePanne === type.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, typePanne: type.value })}
                                className={
                                    filters.typePanne === type.value
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                }
                            >
                                {type.icon} {type.label}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Liste des demandes */}
            <div className="space-y-3">
                {filteredDemandes.length === 0 ? (
                    <Card className="bg-white border-gray-200">
                        <CardContent className="py-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-gray-900 font-medium text-lg mb-2">
                                    Aucune demande disponible
                                </h3>
                                <p className="text-gray-500 text-sm">
                                    Aucune demande dans votre zone pour le moment.
                                    Élargissez votre rayon de recherche ou attendez de nouvelles demandes.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    filteredDemandes.map((demande) => {
                        const typeInfo = getTypePanneInfo(demande.typePanne);
                        const isSelected = selectedDemande === demande.id;
                        const isAnimating = animatingNew.includes(demande.id);

                        return (
                            <Card 
                                key={demande.id}
                                className={`bg-white border-gray-200 relative overflow-hidden transition-all ${
                                    isSelected ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                                } ${isAnimating ? 'animate-pulse' : ''}`}
                            >
                                {isAnimating && <NewDemandeAnimation onComplete={() => {
                                    setAnimatingNew(prev => prev.filter(id => id !== demande.id));
                                }} />}
                                
                                <CardContent className="p-4">
                                    {/* Header avec code et timer */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-50 text-blue-600 border-blue-200">
                                                {demande.codeDemande}
                                            </Badge>
                                            <Badge variant="outline" className={DEMANDE_STATUS_COLORS.en_attente}>
                                                En attente
                                            </Badge>
                                        </div>
                                        
                                        <div className={`flex items-center gap-1 text-sm font-mono ${
                                            demande.tempsRestant < 60 ? 'text-red-500' : 
                                            demande.tempsRestant < 180 ? 'text-orange-500' : 'text-gray-500'
                                        }`}>
                                            <Clock className="h-4 w-4" />
                                            <span>{formatTempsRestant(demande.tempsRestant)}</span>
                                        </div>
                                    </div>

                                    {/* Info principale */}
                                    <div className="flex gap-4">
                                        {/* Avatar ou icône type panne */}
                                        <div className="flex-shrink-0">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                                                'bg-gray-100'
                                            }`}>
                                                {typeInfo.icon}
                                            </div>
                                        </div>
                                        
                                        {/* Détails */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                                <span>{typeInfo.label}</span>
                                            </h4>
                                            
                                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{demande.localisation}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mt-2">
                                                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                    {formatDistance(demande.distance)}
                                                </Badge>
                                                {demande.vehicle && (
                                                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                                                        <Car className="h-3.5 w-3.5 mr-1" />
                                                        {demande.vehicle.brand} {demande.vehicle.model}
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                                {demande.descriptionProbleme}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Info client */}
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                                {demande.client.photo ? (
                                                    <img 
                                                        src={demande.client.photo} 
                                                        alt={demande.client.fullName}
                                                        className="w-8 h-8 rounded-full"
                                                    />
                                                ) : (
                                                    <span className="text-sm text-gray-600">
                                                        {demande.client.fullName.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-sm text-gray-700">
                                                {demande.client.fullName}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {/* Bouton refuser */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleRefuse(demande.id)}
                                                className="border-red-300 text-red-600 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Refuser
                                            </Button>
                                            
                                            {/* Bouton accepter */}
                                            <Button
                                                size="sm"
                                                onClick={() => handleAccept(demande.id)}
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Accepter
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Expanded details */}
                                    {isSelected && (
                                        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                                            <h5 className="text-sm font-medium text-white mb-2">
                                                Détails de la demande
                                            </h5>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Client:</span>
                                                    <span className="text-white ml-2">{demande.client.fullName}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Téléphone:</span>
                                                    <a 
                                                        href={`tel:${demande.client.phone}`}
                                                        className="text-blue-400 ml-2 hover:underline"
                                                    >
                                                        {demande.client.phone}
                                                    </a>
                                                </div>
                                                {demande.vehicle && (
                                                    <>
                                                        <div>
                                                            <span className="text-slate-400">Véhicule:</span>
                                                            <span className="text-white ml-2">
                                                                {demande.vehicle.brand} {demande.vehicle.model}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="text-slate-400">Plaque:</span>
                                                            <span className="text-white ml-2">{demande.vehicle.plate}</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Audio element pour les notifications */}
            <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
        </div>
    );
}

