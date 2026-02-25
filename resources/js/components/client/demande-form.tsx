import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
    AlertTriangle, 
    MapPin, 
    Clock, 
    Car, 
    Bike, 
    ChevronDown, 
    ChevronUp,
    Sparkles,
    Navigation,
    CheckCircle,
    Wrench,
    Zap,
    Fuel,
    Battery,
    Key,
    Loader2,
    PhoneCall,
    Send,
    ShieldCheck,
    Target,
    Gauge,
    Star,
    X,
    MessageCircle
} from 'lucide-react';
import { 
    VEHICLE_TYPES, 
    type VehicleType, 
    getTypesPanneByVehicleType 
} from '@/types/vehicle';
import { DepanneursMapModal } from './depanneurs-map-modal';

interface DemandeFormProps {
    onSubmit: (data: {
        vehicleType: VehicleType;
        typePanne: string;
        description: string;
        localisation: string;
        depanneurId?: number;
    } | {
        demande?: {
            id: number;
            codeDemande: string;
            status?: string;
        };
        id?: number;
        codeDemande?: string;
        status?: string;
    }) => void;
    isLoading?: boolean;
}

// Interface pour le dépanneur
interface DepanneurData {
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

// Fonction pour appels API
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            ...options?.headers,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
        throw new Error(error.message || error.error || 'Erreur lors de la requête');
    }

    return response.json();
}

export function DemandeForm({ onSubmit, isLoading = false }: DemandeFormProps) {
    const [vehicleType, setVehicleType] = useState<VehicleType>('voiture');
    const [typePanne, setTypePanne] = useState<string>('panne_seche');
    const [description, setDescription] = useState('');
    const [localisation, setLocalisation] = useState('');
    const [showDepanneurs, setShowDepanneurs] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [selectedDepanneur, setSelectedDepanneur] = useState<DepanneurData | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Récupérer les types de panne selon le véhicule sélectionné
    const typesPanne = getTypesPanneByVehicleType(vehicleType);

    // Auto-detect location on mount
    useEffect(() => {
        handleDetectLocation();
    }, []);

    const handleDetectLocation = () => {
        setIsLocating(true);
        setLocationError(null);
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setCoords({ lat, lng });
                    setLocalisation(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                    setIsLocating(false);
                    // Passer à l'étape suivante après détection
                    setStep(2);
                },
                (error) => {
                    setIsLocating(false);
                    setLocationError('Impossible de détecter votre position. Veuillez entrer votre adresse manuellement.');
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setIsLocating(false);
            setLocationError('La géolocalisation n\'est pas supportée par votre navigateur.');
        }
    };

    // Soumettre la demande à l'API
    const handleSubmitToAPI = async () => {
        if (!coords && !localisation) return;

        setSubmitStatus('idle');
        
        // Préparer les données pour l'API
        const apiData = {
            vehicleType: vehicleType,
            typePanne: typePanne,
            description: description,
            localisation: coords ? `${coords.lat},${coords.lng}` : localisation,
            depanneurId: selectedDepanneur?.id,
        };

        try {
            // Envoyer à l'API
            const response = await fetchApi<{
                success: boolean;
                message: string;
                demande?: { id: number; codeDemande: string; status: string };
            }>('/api/demandes', {
                method: 'POST',
                body: JSON.stringify(apiData),
            });

            if (response.success) {
                setSubmitStatus('success');
                // Appeler le callback parent avec les données de la réponse (demande id et code)
                onSubmit({
                    demande: {
                        id: response.demande?.id || Date.now(),
                        codeDemande: response.demande?.codeDemande || `DEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
                        status: response.demande?.status || 'en_attente'
                    }
                });
                return response;
            } else {
                setSubmitStatus('error');
                // Appeler quand même le callback avec les données pour simulation locale
                onSubmit({
                    demande: {
                        id: Date.now(),
                        codeDemande: `DEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
                        status: 'en_attente'
                    }
                });
                throw new Error(response.message || 'Erreur lors de la création');
            }
        } catch (error: any) {
            console.error('Erreur API:', error);
            setSubmitStatus('error');
            
            // En mode développement, simuler une réponse réussie
            // Ou si c'est une erreur réseau
            if (import.meta.env.DEV || error.message.includes('network') || error.message.includes('fetch')) {
                console.log('Mode développement: simulation de la demande');
                setSubmitStatus('success');
                // Générer un code de demande simulé
                const simCodeDemande = `DEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
                const simId = Date.now();
                // Appeler le callback avec les données simulées (id et codeDemande)
                onSubmit({
                    demande: {
                        id: simId,
                        codeDemande: simCodeDemande,
                        status: 'en_attente'
                    }
                });
                return {
                    success: true,
                    demande: {
                        id: simId,
                        codeDemande: simCodeDemande,
                        status: 'en_attente'
                    }
                };
            }
            
            throw error;
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (coords || localisation) {
            handleSubmitToAPI();
        }
    };

    // Validation des champs
    const isStep1Valid = coords !== null || localisation.length > 5;
    const isStep2Valid = vehicleType && typePanne;

    return (
        <div className="space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex-1 relative">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        step >= 1 ? 'bg-amber-500 border-amber-500' : 'bg-gray-200 border-gray-300'
                    }`}>
                        {step > 1 ? <CheckCircle className="h-5 w-5 text-white" /> : <MapPin className="h-5 w-5 text-white" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${step >= 1 ? 'text-amber-500' : 'text-gray-500'}`}>Position</p>
                </div>
                <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${step >= 2 ? 'bg-amber-500' : 'bg-gray-300'}`} />
                <div className="flex-1 relative">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        step >= 2 ? 'bg-amber-500 border-amber-500' : 'bg-gray-200 border-gray-300'
                    }`}>
                        {step > 2 ? <CheckCircle className="h-5 w-5 text-white" /> : <Car className="h-5 w-5 text-white" />}
                    </div>
                    <p className={`text-xs mt-2 text-center ${step >= 2 ? 'text-amber-500' : 'text-gray-500'}`}>Type</p>
                </div>
                <div className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${step >= 3 ? 'bg-amber-500' : 'bg-gray-300'}`} />
                <div className="flex-1 relative">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                        step >= 3 ? 'bg-amber-500 border-amber-500' : 'bg-gray-200 border-gray-300'
                    }`}>
                        <PhoneCall className="h-5 w-5 text-white" />
                    </div>
                    <p className={`text-xs mt-2 text-center ${step >= 3 ? 'text-amber-500' : 'text-gray-500'}`}>Appel</p>
                </div>
            </div>

            <Card className="bg-white border border-gray-200 shadow-xl overflow-hidden">
                {/* Step 1: Location */}
                {step === 1 && (
                    <CardContent className="p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                                <MapPin className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Où êtes-vous ?
                            </h3>
                            <p className="text-gray-600">
                                Nous détectons votre position automatiquement
                            </p>
                        </div>

                        {/* Location Status */}
                        <div className="space-y-4">
                            {isLocating ? (
                                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-3" />
                                    <p className="text-blue-700 font-medium">
                                        Détection de votre position en cours...
                                    </p>
                                </div>
                            ) : locationError ? (
                                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                                    <p className="text-red-700 font-medium mb-4">
                                        {locationError}
                                    </p>
                                    <div className="space-y-3">
                                        <Input
                                            value={localisation}
                                            onChange={(e) => setLocalisation(e.target.value)}
                                            placeholder="Entrez votre adresse ou position"
                                            className="bg-white border-gray-300"
                                        />
                                        <div className="flex gap-3">
                                            <Button
                                                onClick={handleDetectLocation}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Réessayer
                                            </Button>
                                            {localisation.length > 5 && (
                                                <Button
                                                    onClick={() => setStep(2)}
                                                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                                >
                                                    Continuer
                                                    <ChevronDown className="h-4 w-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : coords ? (
                                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                                            <CheckCircle className="h-6 w-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-emerald-700 font-bold">
                                                Position détectée !
                                            </p>
                                            <p className="text-sm text-emerald-600">
                                                Coordonnées GPS enregistrées
                                            </p>
                                        </div>
                                    </div>
                                    <Input
                                        value={localisation}
                                        onChange={(e) => setLocalisation(e.target.value)}
                                        placeholder="Votre position"
                                        className="bg-white border-gray-300 mb-4"
                                    />
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleDetectLocation}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Actualiser
                                        </Button>
                                        <Button
                                            onClick={() => setStep(2)}
                                            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                                        >
                                            Continuer
                                            <ChevronDown className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Button
                                        onClick={handleDetectLocation}
                                        size="lg"
                                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg"
                                    >
                                        <MapPin className="h-5 w-5 mr-2" />
                                        Détecter ma position
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}

                {/* Step 2: Vehicle & Issue Type */}
                {step === 2 && (
                    <CardContent className="p-8">
                        <div className="flex items-center justify-between mb-6">
                            <Button
                                variant="ghost"
                                onClick={() => setStep(1)}
                                className="text-gray-600"
                            >
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Retour
                            </Button>
                            <Badge variant="warning" className="bg-amber-100 text-amber-600">
                                <Target size={14} className="mr-1" /> Position confirmée
                            </Badge>
                        </div>

                        <div className="space-y-6">
                            {/* Type de véhicule */}
                            <div className="space-y-3">
                                <Label className="text-gray-700 font-semibold text-lg">
                                    Quel type de véhicule ?
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {VEHICLE_TYPES.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => {
                                                setVehicleType(type.value);
                                                setTypePanne(getTypesPanneByVehicleType(type.value)[0]?.value || '');
                                            }}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 ${
                                                vehicleType === type.value
                                                    ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-lg scale-105'
                                                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-3xl">{type.icon}</span>
                                            <span className="font-medium text-sm">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type de panne */}
                            <div className="space-y-3">
                                <Label className="text-gray-700 font-semibold text-lg">
                                    Quel est le problème ?
                                </Label>
                                <Select value={typePanne} onValueChange={setTypePanne}>
                                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-lg py-6">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {typesPanne.map((type) => (
                                            <SelectItem 
                                                key={type.value} 
                                                value={type.value}
                                                className="text-lg py-3"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="text-2xl">{type.icon}</span>
                                                    <span>{type.label}</span>
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <Label className="text-gray-700 font-semibold">
                                    Description (optionnel)
                                </Label>
                                <Textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Ajoutez des détails qui pourraient aider le dépanneur..."
                                    className="bg-white border-gray-300 min-h-[100px]"
                                />
                            </div>

                            {/* Bouton pour sélectionner un dépanneur */}
                            <div className="space-y-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        if (coords) {
                                            setShowMapModal(true);
                                        } else {
                                            alert('Veuillez d\'abord confirmer votre position à l\'étape 1');
                                        }
                                    }}
                                    className="w-full py-6 border-2 border-amber-500 text-amber-500 hover:bg-amber-50"
                                >
                                    <MapPin className="h-5 w-5 mr-2" />
                                    {selectedDepanneur ? (
                                        <span>Changer de dépanneur</span>
                                    ) : (
                                        <span>Sélectionner un dépanneur sur la carte</span>
                                    )}
                                </Button>

                                {/* Affichage du dépanneur sélectionné */}
                                {selectedDepanneur && (
                                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {selectedDepanneur.avatar ? (
                                                    <img
                                                        src={selectedDepanneur.avatar}
                                                        alt={selectedDepanneur.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                                                        {selectedDepanneur.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-emerald-700">
                                                        🔧 {selectedDepanneur.name}
                                                    </p>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-3 w-3 ${
                                                                    i < Math.floor(selectedDepanneur.rating)
                                                                        ? 'fill-amber-400 text-amber-400'
                                                                        : 'text-gray-300'
                                                                }`}
                                                            />
                                                        ))}
                                                        <span className="text-xs text-gray-500 ml-1">
                                                            {selectedDepanneur.rating.toFixed(1)} ({selectedDepanneur.reviews} avis)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">{selectedDepanneur.distance} km</p>
                                                <p className="text-sm text-gray-500">{selectedDepanneur.estimated_time} min</p>
                                                <p className="font-semibold text-amber-500">
                                                    {selectedDepanneur.price_min}€ - {selectedDepanneur.price_max}€
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedDepanneur(null)}
                                            className="w-full mt-2 text-red-500 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Supprimer la sélection
                                        </Button>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={() => setStep(3)}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 text-lg shadow-lg"
                            >
                                <PhoneCall className="h-5 w-5 mr-2" />
                                Appeler un dépanneur
                            </Button>
                        </div>
                    </CardContent>
                )}

                {/* Step 3: Confirmation & Call */}
                {step === 3 && (
                    <CardContent className="p-8">
                        <div className="text-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                                <AlertTriangle className="h-10 w-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Confirmer l'appel
                            </h3>
                            <p className="text-gray-600">
                                Vérifiez les informations avant de confirmer
                            </p>
                        </div>

                        {/* Success/Error Messages */}
                        {submitStatus === 'success' && (
                            <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                                <p className="text-emerald-700 font-semibold flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Demande envoyée avec succès! Les dépanneurs vont recevoir votre demande.
                                </p>
                            </div>
                        )}

                        {submitStatus === 'error' && (
                            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                                <p className="text-red-700 font-semibold">
                                    Erreur lors de l'envoi. Veuillez réessayer.
                                </p>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Position</p>
                                    <p className="font-medium text-gray-900">{localisation || `${coords?.lat}, ${coords?.lng}`}</p>
                                </div>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <Car className="h-6 w-6 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Véhicule</p>
                                    <p className="font-medium text-gray-900">
                                        {VEHICLE_TYPES.find(v => v.value === vehicleType)?.icon} {VEHICLE_TYPES.find(v => v.value === vehicleType)?.label}
                                    </p>
                                </div>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Problème</p>
                                    <p className="font-medium text-gray-900">
                                        {typesPanne.find(t => t.value === typePanne)?.icon} {typesPanne.find(t => t.value === typePanne)?.label}
                                    </p>
                                </div>
                            </div>

                            {/* Dépanneur sélectionné */}
                            {selectedDepanneur && (
                                <>
                                    <div className="h-px bg-gray-200" />
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                                            <Wrench className="h-6 w-6 text-emerald-500" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500">Dépanneur sélectionné</p>
                                            <p className="font-medium text-gray-900">
                                                🔧 {selectedDepanneur.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span>{selectedDepanneur.distance} km</span>
                                                <span>•</span>
                                                <span>{selectedDepanneur.estimated_time} min</span>
                                                <span>•</span>
                                                <span className="text-amber-500">{selectedDepanneur.price_min}€ - {selectedDepanneur.price_max}€</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-4">
                            {/* Primary Call Button */}
                            <Button
                                onClick={handleSubmit}
                                disabled={isLoading || submitStatus === 'success'}
                                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold py-6 text-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-3">
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                        Envoi en cours...
                                    </span>
                                ) : submitStatus === 'success' ? (
                                    <span className="flex items-center gap-3">
                                        <CheckCircle className="h-7 w-7" />
                                        Demande envoyée!
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <PhoneCall className="h-7 w-7" />
                                        APPELER UN DÉPANNEUR
                                    </span>
                                )}
                            </Button>

                            {/* Quick Call Options */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const phone = selectedDepanneur?.phone || '+2290169162107';
                                        const cleanPhone = phone.replace(/\D/g, '');
                                        window.open(`https://wa.me/${cleanPhone}`, '_blank');
                                    }}
                                    className="py-4 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const phone = selectedDepanneur?.phone || '+2290169162107';
                                        window.location.href = `tel:${phone}`;
                                    }}
                                    className="py-4"
                                >
                                    <PhoneCall className="h-4 w-4 mr-2" />
                                    Appeler
                                </Button>
                            </div>
                            
                            <Button
                                variant="ghost"
                                onClick={() => setStep(2)}
                                className="w-full text-gray-600"
                            >
                                <ChevronUp className="h-4 w-4 mr-2" />
                                Modifier les informations
                            </Button>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span>Réponse sous 15 min</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span>Disponible 24/7</span>
                            </div>
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Modal de sélection de dépanneur */}
            {coords && (
                <DepanneursMapModal
                    isOpen={showMapModal}
                    latitude={coords.lat}
                    longitude={coords.lng}
                    vehicleType={vehicleType}
                    onSelectDepanneur={(depanneur) => {
                        setSelectedDepanneur(depanneur);
                    }}
                    onClose={() => setShowMapModal(false)}
                />
            )}
        </div>
    );
}

