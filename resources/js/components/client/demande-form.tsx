import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, MapPin, Clock } from 'lucide-react';
import { TYPES_PANNE, type TypePanne } from '@/types/client';

interface DemandeFormProps {
    onSubmit: (data: {
        typePanne: TypePanne;
        description: string;
        localisation: string;
    }) => void;
    isLoading?: boolean;
}

export function DemandeForm({ onSubmit, isLoading = false }: DemandeFormProps) {
    const [typePanne, setTypePanne] = useState<TypePanne>('panne_seche');
    const [description, setDescription] = useState('');
    const [localisation, setLocalisation] = useState('');

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
        onSubmit({ typePanne, description, localisation });
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
                    {/* Type de panne */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Type de panne *</Label>
                        <Select value={typePanne} onValueChange={(v) => setTypePanne(v as TypePanne)}>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TYPES_PANNE.map((type) => (
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

