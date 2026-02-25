import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
    Phone, 
    MapPin, 
    Navigation, 
    Play, 
    Square, 
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    Camera,
    Upload,
    X,
    Star,
    Wrench,
    User,
    Car,
    MessageSquare
} from 'lucide-react';
import type { InterventionEnCours, InterventionFormData } from '@/types/depanneur';

interface CurrentInterventionProps {
    intervention?: InterventionEnCours;
    onStart: () => void;
    onEnd: (data: InterventionFormData) => void;
    onCancel: () => void;
    onCallClient: () => void;
    onOpenMaps: () => void;
    status: 'aucune' | 'acceptee' | 'en_cours';
}

// Données mockées par défaut
const mockIntervention: InterventionEnCours = {
    id: 1,
    codeIntervention: 'INT-2024-001',
    status: 'en_cours',
    demande: {
        id: 1,
        codeDemande: 'DEM-2024-001',
        typePanne: 'batterie',
        localisation: 'Cotonou, Rue de la Paix',
        latitude: 6.366,
        longitude: 2.433,
        descriptionProbleme: 'Véhicule qui ne démarre pas, problème de batterie',
    },
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
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    piecesRemplacees: '',
    observations: '',
    coutPiece: 0,
    coutMainOeuvre: 0,
    coutTotal: 0,
    distanceClient: 3.5,
    dureeEstimee: 15,
    adresseClient: 'Cotonou, Rue de la Paix, en face de la station Shell',
    photos: [],
};

function formatDuree(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return `${h}h ${m}m`;
    }
    return `${m} min`;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FF', {
        style: 'currency',
        currency: 'XOF',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function CurrentIntervention({
    intervention = mockIntervention,
    onStart,
    onEnd,
    onCancel,
    onCallClient,
    onOpenMaps,
    status,
}: CurrentInterventionProps) {
    const [showEndForm, setShowEndForm] = useState(false);
    const [formData, setFormData] = useState<InterventionFormData>({
        piecesRemplacees: '',
        observations: '',
        coutPiece: 0,
        coutMainOeuvre: 0,
        photos: [],
    });
    const [elapsedTime, setElapsedTime] = useState(30); // en minutes

    // Timer pour le temps écoulé
    useState(() => {
        if (status === 'en_cours') {
            const interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 60000); // jede minute
            return () => clearInterval(interval);
        }
    });

    const handleSubmit = () => {
        onEnd(formData);
        setShowEndForm(false);
    };

    const calculateTotal = () => {
        return (formData.coutPiece || 0) + (formData.coutMainOeuvre || 0);
    };

    // Pas d'intervention en cours
    if (status === 'aucune') {
        return (
            <Card className="bg-white border-gray-200">
                <CardContent className="py-12">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wrench className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-gray-900 font-medium text-lg mb-2">
                            Aucune intervention en cours
                        </h3>
                        <p className="text-gray-500 text-sm">
                            Acceptez une demande pour démarrer une intervention
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header de l'intervention */}
            <Card className={`bg-white border-gray-200 ${
                status === 'en_cours' ? 'ring-2 ring-orange-500/50' : ''
            }`}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-gray-900 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-orange-500" />
                                Intervention #{intervention.codeIntervention}
                            </CardTitle>
                            <CardDescription className="text-gray-500">
                                Demande {intervention.demande.codeDemande}
                            </CardDescription>
                        </div>
                        
                        <Badge className={
                            status === 'en_cours' 
                                ? 'bg-orange-50 text-orange-600 border-orange-200'
                                : 'bg-blue-50 text-blue-600 border-blue-200'
                        }>
                            {status === 'en_cours' ? 'En cours' : 'Acceptée'}
                        </Badge>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Info client */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                {intervention.client.photo ? (
                                    <img 
                                        src={intervention.client.photo} 
                                        alt={intervention.client.fullName}
                                        className="w-12 h-12 rounded-full"
                                    />
                                ) : (
                                    <User className="h-6 w-6 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900">
                                    {intervention.client.fullName}
                                </h4>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Car className="h-3.5 w-3.5" />
                                    {intervention.vehicle && (
                                        <span>{intervention.vehicle.brand} {intervention.vehicle.model} - {intervention.vehicle.plate}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onCallClient}
                                className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={onOpenMaps}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                                <Navigation className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Adresse et distance */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-900 font-medium">
                                    {intervention.adresseClient}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Navigation className="h-3 w-3" />
                                        {intervention.distanceClient} km
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        ~{intervention.dureeEstimee} min
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timer et actions */}
                    {status === 'en_cours' ? (
                        <div className="space-y-4">
                            {/* Timer */}
                            <div className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="text-center">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Temps écoulé</p>
                                    <p className="text-4xl font-bold text-orange-600 font-mono">
                                        {formatDuree(elapsedTime)}
                                    </p>
                                </div>
                            </div>

                            {/* Bouton terminer */}
                            {showEndForm ? (
                                <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Finaliser l'intervention
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-600 mb-1 block">
                                                Coût des pièces (XOF)
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.coutPiece || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    coutPiece: parseFloat(e.target.value) || 0
                                                })}
                                                className="bg-white border-gray-300 text-gray-900"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-600 mb-1 block">
                                                Main d'œuvre (XOF)
                                            </label>
                                            <Input
                                                type="number"
                                                value={formData.coutMainOeuvre || ''}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    coutMainOeuvre: parseFloat(e.target.value) || 0
                                                })}
                                                className="bg-white border-gray-300 text-gray-900"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">
                                            Pièces remplacées
                                        </label>
                                        <Input
                                            value={formData.piecesRemplacees}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                piecesRemplacees: e.target.value
                                            })}
                                            className="bg-white border-gray-300 text-gray-900"
                                            placeholder="Ex: Batterie 12V, Courroie alternateur..."
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">
                                            Observations / Notes
                                        </label>
                                        <Textarea
                                            value={formData.observations}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                observations: e.target.value
                                            })}
                                            className="bg-white border-gray-300 text-gray-900"
                                            placeholder="Détails de l'intervention..."
                                            rows={3}
                                        />
                                    </div>
                                    
                                    {/* Upload photos */}
                                    <div>
                                        <label className="text-sm text-gray-600 mb-2 block">
                                            Photos du travail effectué
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-xs text-gray-500">
                                                Cliquez pour télécharger ou.glissez-déposez
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Total */}
                                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <span className="text-gray-900 font-medium">Total à facturer</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {formatCurrency(calculateTotal())}
                                        </span>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowEndForm(false)}
                                            className="flex-1"
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            onClick={handleSubmit}
                                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Terminer
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => setShowEndForm(true)}
                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <Square className="h-4 w-4 mr-2" />
                                    Terminer l'intervention
                                </Button>
                            )}
                        </div>
                    ) : (
                        /* Intervention acceptée mais pas encore démarrée */
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onCancel}
                                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Annuler
                            </Button>
                            <Button
                                onClick={onStart}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                <Play className="h-4 w-4 mr-2" />
                                Démarrer
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Info panneau Type de panne */}
            {intervention.demande.typePanne && (
                <Card className="bg-white border-gray-200">
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Wrench className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Type de panne</p>
                                <p className="text-gray-900 font-medium capitalize">
                                    {intervention.demande.typePanne.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                        <div className="mt-3 ml-12">
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-gray-700 text-sm">
                                {intervention.demande.descriptionProbleme}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

