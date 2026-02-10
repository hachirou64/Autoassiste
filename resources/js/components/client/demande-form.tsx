import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, MapPin, Clock, Car, Bike } from 'lucide-react';
import { 
    VEHICLE_TYPES, 
    type VehicleType, 
    getTypesPanneByVehicleType 
} from '@/types/vehicle';

interface DemandeFormProps {
    onSubmit: (data: {
        vehicleType: VehicleType;
        typePanne: string;
        description: string;
        localisation: string;
    }) => void;
    isLoading?: boolean;
}

export function DemandeForm({ onSubmit, isLoading = false }: DemandeFormProps) {
    const [vehicleType, setVehicleType] = useState<VehicleType>('voiture');
    const [typePanne, setTypePanne] = useState<string>('panne_seche');
    const [description, setDescription] = useState('');
    const [localisation, setLocalisation] = useState('');

    // Récupérer les types de panne selon le véhicule sélectionné
    const typesPanne = getTypesPanneByVehicleType(vehicleType);

    const handleDetectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocalisation(
                        `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                    );
                },
                () => {
                    setLocalisation('Position non disponible');
                }
            );
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ vehicleType, typePanne, description, localisation });
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Demande d'assistance urgente
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type de véhicule */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Type de véhicule *</Label>
                        <div className="grid grid-cols-2 gap-4">
                            {VEHICLE_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setVehicleType(type.value);
                                        // Réinitialiser le type de panne
                                        setTypePanne(getTypesPanneByVehicleType(type.value)[0]?.value || '');
                                    }}
                                    className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                        vehicleType === type.value
                                            ? 'border-amber-500 bg-amber-500/10 text-white'
                                            : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <span className="text-2xl">{type.icon}</span>
                                    <span className="font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Type de panne */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Type de panne *</Label>
                        <Select value={typePanne} onValueChange={setTypePanne}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {typesPanne.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.icon} {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Localisation */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Localisation *</Label>
                        <div className="flex gap-2">
                            <Input
                                value={localisation}
                                onChange={(e) => setLocalisation(e.target.value)}
                                placeholder="Entrez ou détectez votre position"
                                className="flex-1 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleDetectLocation}
                                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                                <MapPin className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Description du problème</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décrivez votre problème..."
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            rows={3}
                        />
                    </div>

                    {/* Bouton SOS */}
                    <Button
                        type="submit"
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-6 text-lg"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Clock className="h-5 w-5 mr-2 animate-spin" />
                                Envoi...
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-5 w-5 mr-2" />
                                APPELER UN DÉPANNEUR
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

