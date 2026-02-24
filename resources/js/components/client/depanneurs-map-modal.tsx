import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Map from '@/components/Map';
import { X, MapPin, Clock, Star, Loader2 } from 'lucide-react';

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
    latitude?: number;
    longitude?: number;
}

interface DepanneursMapModalProps {
    isOpen: boolean;
    latitude: number;
    longitude: number;
    vehicleType: string;
    onSelectDepanneur: (depanneur: Depanneur) => void;
    onClose: () => void;
}

export function DepanneursMapModal({
    isOpen,
    latitude,
    longitude,
    vehicleType,
    onSelectDepanneur,
    onClose,
}: DepanneursMapModalProps) {
    const [depanneurs, setDepanneurs] = useState<Depanneur[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        if (!isOpen) return;

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
                
                // Debug: log la réponse API complète
                console.log('API Response:', data);
                console.log('Nombre de dépanneurs trouvés:', data.depanneurs?.length || 0);
                
                // Log détaillé de chaque dépanneur
                if (data.depanneurs && data.depanneurs.length > 0) {
                    data.depanneurs.forEach((d: Depanneur, index: number) => {
                        console.log(`Dépanneur ${index + 1}:`, {
                            id: d.id,
                            name: d.name,
                            distance: d.distance,
                            estimated_time: d.estimated_time,
                            price_min: d.price_min,
                            price_max: d.price_max,
                            latitude: d.latitude,
                            longitude: d.longitude
                        });
                    });
                }
                
                // Utiliser les coordonnées RÉELLES du dépanneur retournées par l'API
                const enrichedDepanneurs = (data.depanneurs || []).map((d: Depanneur) => ({
                    ...d,
                    // Les coordonnées réelles sont maintenant incluses dans la réponse API
                    latitude: d.latitude || latitude + (Math.random() - 0.5) * 0.02,
                    longitude: d.longitude || longitude + (Math.random() - 0.5) * 0.02,
                }));
                setDepanneurs(enrichedDepanneurs);
                
                if (enrichedDepanneurs.length === 0) {
                    setError('Aucun dépanneur trouvé dans un rayon de ' + (data.radius || 10) + 'km. Essayez d\'agrandir le rayon de recherche.');
                }
            } catch (err) {
                console.error('Erreur lors de la récupération des dépanneurs:', err);
                setError(err instanceof Error ? err.message : 'Erreur inconnue');
            } finally {
                setLoading(false);
            }
        };

        fetchDepanneurs();
    }, [isOpen, latitude, longitude, vehicleType]);

    const handleSelectDepanneur = (depanneur: Depanneur) => {
        setSelectedId(depanneur.id);
        onSelectDepanneur(depanneur);
        setTimeout(() => {
            onClose();
        }, 500);
    };

    if (!isOpen) return null;

    const markers = depanneurs.map((d) => ({
        lat: d.latitude || latitude,
        lng: d.longitude || longitude,
        label: d.name,
        icon: 'depanneur' as const,
    }));

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] bg-slate-800/95 border-slate-700 overflow-hidden flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-700">
                    <CardTitle className="text-white flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-amber-400" />
                        Sélectionnez un dépanneur
                    </CardTitle>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* Message d'erreur API (si échec total) */}
                    {error && !loading && depanneurs.length === 0 && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm mb-2">
                            ⚠️ {error}
                        </div>
                    )}
                    
                    {loading ? (
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="h-6 w-6 animate-spin text-amber-400 mr-2" />
                            <span className="text-slate-400">Chargement des dépanneurs...</span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
                            {/* Carte - Toujours affichée avec la position du client */}
                            <div className="lg:col-span-2">
                                <Map
                                    center={{ lat: latitude, lng: longitude }}
                                    markers={[
                                        {
                                            lat: latitude,
                                            lng: longitude,
                                            label: 'Votre position',
                                            icon: 'client',
                                        },
                                        ...markers,
                                    ]}
                                    zoom={14}
                                    height="400px"
                                />
                                {depanneurs.length === 0 ? (
                                    <p className="text-sm text-amber-400 mt-2 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">
                                        ⚠️ Aucun dépanneur disponible dans votre zone pour le moment. 
                                        Vous pouvez tout de même soumettre votre demande.
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-400 mt-2">
                                        Cliquez sur un dépanneur dans la liste pour le sélectionner
                                    </p>
                                )}
                            </div>

                            {/* Liste des dépanneurs */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {depanneurs.length === 0 ? (
                                    <div className="text-center py-8 text-slate-400 bg-slate-700/30 rounded-lg p-4">
                                        <MapPin className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                                        <p>Aucun dépanneur disponible</p>
                                        <p className="text-xs text-slate-500 mt-2">
                                            La carte affiche votre position. Vous pouvez soumettre une demande et nous vous attribuerons un dépanneur dès que possible.
                                        </p>
                                    </div>
                                ) : (
                                    depanneurs.map((depanneur) => (
                                        <Card
                                            key={depanneur.id}
                                            className={`cursor-pointer transition-all border-2 ${
                                                selectedId === depanneur.id
                                                    ? 'bg-amber-500/10 border-amber-500'
                                                    : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                                            }`}
                                            onClick={() =>
                                                handleSelectDepanneur(depanneur)
                                            }
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-2 mb-2">
                                                    {depanneur.avatar ? (
                                                        <img
                                                            src={
                                                                depanneur.avatar
                                                            }
                                                            alt={depanneur.name}
                                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {depanneur.name
                                                                .charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold text-white text-sm truncate">
                                                            🔧{' '}
                                                            {depanneur.name}
                                                        </h4>
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({
                                                                length: 5,
                                                            }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-2.5 w-2.5 ${
                                                                        i <
                                                                        Math.floor(
                                                                            depanneur.rating
                                                                        )
                                                                            ? 'fill-amber-400 text-amber-400'
                                                                            : 'text-slate-600'
                                                                    }`}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-slate-400 ml-1">
                                                                {depanneur.rating.toFixed(
                                                                    1
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <MapPin className="h-3 w-3" />
                                                        {depanneur.distance} km
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <Clock className="h-3 w-3" />
                                                        {depanneur.estimated_time}{' '}
                                                        min
                                                    </div>
                                                    <div className="font-semibold text-amber-400">
                                                        {depanneur.price_min}€ -{' '}
                                                        {depanneur.price_max}€
                                                    </div>
                                                </div>

                                                {selectedId === depanneur.id && (
                                                    <Badge className="w-full mt-2 bg-green-500 text-white border-0 justify-center">
                                                        ✓ Sélectionné
                                                    </Badge>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

                {selectedId && depanneurs.find((d) => d.id === selectedId) && (
                    <div className="border-t border-slate-700 p-4 bg-slate-700/30">
                        <Button
                            onClick={onClose}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                            ✓ Confirmer la sélection
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
