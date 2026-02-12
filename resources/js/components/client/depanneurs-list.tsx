import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, AlertCircle, Loader2 } from 'lucide-react';

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
        <div className="space-y-3">
            <h3 className="text-white font-semibold mb-4">
                Dépanneurs disponibles ({depanneurs.length})
            </h3>
            
            {depanneurs.map((depanneur) => (
                <Card 
                    key={depanneur.id} 
                    className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
                    onClick={() => onSelectDepanneur?.(depanneur)}
                >
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                            {/* Avatar & Info */}
                            <div className="flex items-start gap-3 flex-1">
                                {depanneur.avatar ? (
                                    <img
                                        src={depanneur.avatar}
                                        alt={depanneur.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                        {depanneur.name.charAt(0)}
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-white truncate">
                                            🔧 {depanneur.name}
                                        </h4>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-3.5 w-3.5 ${
                                                    i < Math.floor(depanneur.rating)
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-slate-600'
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-1 text-xs text-slate-400">
                                            {depanneur.rating.toFixed(1)}/5 ({depanneur.reviews} avis)
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {depanneur.distance} km
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {depanneur.estimated_time} min
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex flex-col items-end gap-2">
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">Tarif estimé</p>
                                    <p className="font-bold text-amber-400">
                                        {depanneur.price_min}€ - {depanneur.price_max}€
                                    </p>
                                </div>
                                
                                <Badge 
                                    variant="outline"
                                    className="bg-green-500/10 text-green-400 border-green-500/30"
                                >
                                    Disponible
                                </Badge>
                            </div>
                        </div>

                        {/* Specialities */}
                        {depanneur.specialities && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <p className="text-xs text-slate-400 mb-1">Spécialités:</p>
                                <div className="flex flex-wrap gap-1">
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
                            onClick={() => onSelectDepanneur?.(depanneur)}
                            className="w-full mt-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                        >
                            Sélectionner ce dépanneur
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
