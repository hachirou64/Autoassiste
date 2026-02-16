import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, AlertCircle, Loader2, Wrench, Phone, Car } from 'lucide-react';

interface Depanneur {
    id: number;
    name: string;
    rating: number;
    reviews: number;
    distance: number;
    estimated_time: number;
    price_min: number;
    price_max: number;
    specialities: string;
    phone: string;
    avatar: string | null;
    garage?: string;
}

interface DemandeursListProps {
    latitude: number;
    longitude: number;
    vehicleType: string;
    onSelectDepanneur?: (depanneur: Depanneur) => void;
    isLoading?: boolean;
}

export function DepanneursListComponent({
    latitude,
    longitude,
    vehicleType,
    onSelectDepanneur,
    isLoading = false,
}: DemandeursListProps) {
    const [depanneurs, setDepanneurs] = useState<Depanneur[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDepanneur, setSelectedDepanneur] = useState<Depanneur | null>(null);

    useEffect(() => {
        const fetchDepanneurs = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await fetch(
                    `/api/depanneurs/nearby?latitude=${latitude}&longitude=${longitude}&vehicle_type=${vehicleType}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                        },
                        credentials: 'include',
                    }
                );

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des dépanneurs');
                }

                const data = await response.json();
                setDepanneurs(data.depanneurs || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        if (latitude && longitude && vehicleType) {
            fetchDepanneurs();
        }
    }, [latitude, longitude, vehicleType]);

    const handleSelectDepanneur = (depanneur: Depanneur) => {
        setSelectedDepanneur(depanneur);
        onSelectDepanneur?.(depanneur);
    };

    if (loading || isLoading) {
        return (
            <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                <span className="ml-2 text-slate-400">Recherche de dépanneurs...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="font-semibold text-red-400">Erreur</h3>
                    <p className="text-red-300 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (depanneurs.length === 0) {
        return (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6 text-center">
                <p className="text-blue-300">
                    Aucun dépanneur disponible actuellement dans votre zone.
                    Veuillez réessayer dans quelques moments.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-white font-semibold mb-4">
                Dépanneurs disponibles ({depanneurs.length})
            </h3>
            
            {/* Grille principale avec carte agrandie et panneau d'information */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Liste des dépanneurs - 2 colonnes */}
                <div className="xl:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {depanneurs.map((depanneur) => (
                        <Card 
                            key={depanneur.id} 
                            className={`bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer ${
                                selectedDepanneur?.id === depanneur.id ? 'ring-2 ring-amber-500' : ''
                            }`}
                            onClick={() => handleSelectDepanneur(depanneur)}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Avatar & Info */}
                                    <div className="flex items-start gap-4 flex-1">
                                        {depanneur.avatar ? (
                                            <img
                                                src={depanneur.avatar}
                                                alt={depanneur.name}
                                                className="w-16 h-16 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl">
                                                {depanneur.name.charAt(0)}
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-semibold text-white text-lg truncate">
                                                    🔧 {depanneur.name}
                                                </h4>
                                            </div>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mb-3">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${
                                                            i < Math.floor(depanneur.rating)
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-slate-600'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="ml-1 text-sm text-slate-400">
                                                    {depanneur.rating.toFixed(1)}/5 ({depanneur.reviews} avis)
                                                </span>
                                            </div>

                                            {/* Details principaux */}
                                            <div className="grid grid-cols-3 gap-3 text-sm">
                                                <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg">
                                                    <MapPin className="h-4 w-4 text-amber-400" />
                                                    <span className="text-white font-medium">{depanneur.distance} km</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg">
                                                    <Clock className="h-4 w-4 text-blue-400" />
                                                    <span className="text-white font-medium">{depanneur.estimated_time} min</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded-lg">
                                                    <Wrench className="h-4 w-4 text-emerald-400" />
                                                    <span className="text-white font-medium">{depanneur.price_min}€ - {depanneur.price_max}€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Price & Action */}
                                    <div className="flex flex-col items-end gap-2">
                                        <Badge 
                                            variant="outline"
                                            className="bg-green-500/10 text-green-400 border-green-500/30 text-sm px-3 py-1"
                                        >
                                            Disponible
                                        </Badge>
                                    </div>
                                </div>

                                {/* Specialities */}
                                {depanneur.specialities && (
                                    <div className="mt-4 pt-4 border-t border-slate-700">
                                        <p className="text-xs text-slate-400 mb-2">Spécialités:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {depanneur.specialities.split(',').map((spec, i) => (
                                                <Badge 
                                                    key={i} 
                                                    className="bg-slate-700 text-slate-300 text-xs"
                                                >
                                                    {spec.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <Button
                                    onClick={() => handleSelectDepanneur(depanneur)}
                                    className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3"
                                >
                                    {selectedDepanneur?.id === depanneur.id ? '✓ Sélectionné' : 'Sélectionner ce dépanneur'}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Panneau d'information du depanneur sélectionné - 1 colonne */}
                <div className="xl:col-span-1">
                    {selectedDepanneur ? (
                        <Card className="bg-slate-800/80 border-amber-500/50 sticky top-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-white text-lg flex items-center gap-2">
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                        <Car className="h-5 w-5 text-amber-400" />
                                    </div>
                                    Infos Dépanneur
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Avatar et nom */}
                                <div className="flex items-center gap-3">
                                    {selectedDepanneur.avatar ? (
                                        <img
                                            src={selectedDepanneur.avatar}
                                            alt={selectedDepanneur.name}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                                            {selectedDepanneur.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-white font-semibold text-lg">{selectedDepanneur.name}</p>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3 w-3 ${
                                                        i < Math.floor(selectedDepanneur.rating)
                                                            ? 'fill-amber-400 text-amber-400'
                                                            : 'text-slate-600'
                                                    }`}
                                                />
                                            ))}
                                            <span className="ml-1 text-xs text-slate-400">
                                                {selectedDepanneur.rating.toFixed(1)}/5
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Garage */}
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Wrench className="h-4 w-4 text-amber-400" />
                                        <span className="text-slate-400 text-sm">Garage</span>
                                    </div>
                                    <p className="text-white font-medium">
                                        {selectedDepanneur.garage || 'Garage Principal'}
                                    </p>
                                </div>

                                {/* Temps d'intervention */}
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Clock className="h-4 w-4 text-blue-400" />
                                        <span className="text-slate-400 text-sm">Temps d'intervention</span>
                                    </div>
                                    <p className="text-white font-medium text-2xl">
                                        {selectedDepanneur.estimated_time} <span className="text-lg">min</span>
                                    </p>
                                </div>

                                {/* Distance */}
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="h-4 w-4 text-emerald-400" />
                                        <span className="text-slate-400 text-sm">Distance</span>
                                    </div>
                                    <p className="text-white font-medium text-2xl">
                                        {selectedDepanneur.distance} <span className="text-lg">km</span>
                                    </p>
                                </div>

                                {/* Tarif */}
                                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg p-4 border border-amber-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-slate-400 text-sm">Tarif estimé</span>
                                    </div>
                                    <p className="text-amber-400 font-bold text-2xl">
                                        {selectedDepanneur.price_min}€ - {selectedDepanneur.price_max}€
                                    </p>
                                </div>

                                {/* Bouton appeler */}
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                                    onClick={() => {
                                        if (selectedDepanneur.phone) {
                                            window.location.href = `tel:${selectedDepanneur.phone}`;
                                        }
                                    }}
                                >
                                    <Phone className="h-4 w-4 mr-2" />
                                    Appeler maintenant
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-slate-800/50 border-slate-700 h-full min-h-[300px]">
                            <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                    <Wrench className="h-8 w-8 text-slate-500" />
                                </div>
                                <p className="text-slate-400 text-lg mb-2">Sélectionnez un dépanneur</p>
                                <p className="text-slate-500 text-sm">
                                    Cliquez sur une carte pour voir les détails (garage, temps, distance)
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
