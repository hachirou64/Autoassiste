import { useState, useEffect } from 'react';
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
    X,
    Star,
    Wrench,
    User,
    Car,
    MessageSquare,
    PlayCircle
} from 'lucide-react';
import type { InterventionEnCours, InterventionFormData } from '@/types/depanneur';

interface CurrentInterventionProps {
    intervention?: InterventionEnCours;
    onStart: () => void;
    onEnd: (data: InterventionFormData) => void;
    onCancel: () => void;
    onCallClient: () => void;
    onOpenMaps: () => void;
    status: 'aucune' | 'acceptee' | 'en_attente_confirmation' | 'en_cours';
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
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
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

// ==================== FONCTIONS UTILITAIRES ====================

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

function formatTypePanne(typePanne: string): string {
    const types: Record<string, string> = {
        panne_seche: 'Panne sèche',
        batterie: 'Panne de batterie',
        creaison: 'Créaison',
        moteur: 'Problème moteur',
        freins: 'Problème de freins',
        direction: 'Problème de direction',
        electrique: 'Panne électrique',
        carrosserie: 'Dégâts carrosserie',
        autre: 'Autre',
    };
    return types[typePanne] || typePanne;
}

// ==================== SOUS-COMPOSANTS ====================

// Badge de statut d'intervention
function InterventionStatusBadge({ status }: { status: string }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'en_cours':
                return { label: 'En cours', className: 'bg-orange-50 text-orange-600 border-orange-200' };
            case 'en_attente_confirmation':
                return { label: 'En attente confirmation', className: 'bg-purple-50 text-purple-600 border-purple-200' };
            case 'acceptee':
                return { label: 'Acceptée', className: 'bg-blue-50 text-blue-600 border-blue-200' };
            case 'planifiee':
                return { label: 'Planifiée', className: 'bg-gray-50 text-gray-600 border-gray-200' };
            default:
                return { label: status, className: 'bg-gray-50 text-gray-600 border-gray-200' };
        }
    };

    const config = getStatusConfig();
    return <Badge className={config.className}>{config.label}</Badge>;
}

// Badge "Démarré" quand l'intervention est en cours
function DemarreBadge() {
    return (
        <Badge className="bg-green-50 text-green-600 border-green-200 flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5" />
            Démarré
        </Badge>
    );
}

// Informations du client
function ClientInfo({ 
    client, 
    vehicle, 
    onCall, 
    onOpenMaps 
}: { 
    client: InterventionEnCours['client'];
    vehicle?: InterventionEnCours['vehicle'];
    onCall: () => void;
    onOpenMaps: () => void;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                    {client.photo ? (
                        <img 
                            src={client.photo} 
                            alt={client.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <User className="h-6 w-6 text-blue-500" />
                    )}
                </div>
                <div>
                    <h4 className="font-medium text-gray-900">
                        {client.fullName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Car className="h-3.5 w-3.5" />
                        {vehicle && (
                            <span>{vehicle.brand} {vehicle.model} - {vehicle.plate}</span>
                        )}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onCall}
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
    );
}

// Adresse et localisation
function InterventionLocation({ 
    adresseClient, 
    distanceClient, 
    dureeEstimee,
    latitude,
    longitude 
}: { 
    adresseClient: string;
    distanceClient: number;
    dureeEstimee: number;
    latitude: number;
    longitude: number;
}) {
    return (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                    <p className="text-sm text-gray-900 font-medium">
                        {adresseClient}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {distanceClient} km
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ~{dureeEstimee} min
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Timer d'intervention
function InterventionTimer({ 
    status, 
    elapsedTime 
}: { 
    status: string;
    elapsedTime: number;
}) {
    return (
        <div className="flex items-center justify-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {status === 'en_attente_confirmation' 
                        ? 'En attente de confirmation du client...' 
                        : 'Temps écoulé'}
                </p>
                <p className="text-4xl font-bold text-orange-600 font-mono">
                    {status === 'en_attente_confirmation' 
                        ? '--:--' 
                        : formatDuree(elapsedTime)}
                </p>
            </div>
        </div>
    );
}

// Détails du véhicule
function VehicleDetails({ vehicle }: { vehicle?: InterventionEnCours['vehicle'] }) {
    if (!vehicle) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Car className="h-4 w-4" />
                Informations véhicule
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                    <span className="text-gray-500">Marque:</span>
                    <span className="text-gray-900 ml-2 font-medium">{vehicle.brand}</span>
                </div>
                <div>
                    <span className="text-gray-500">Modèle:</span>
                    <span className="text-gray-900 ml-2 font-medium">{vehicle.model}</span>
                </div>
                <div>
                    <span className="text-gray-500">Couleur:</span>
                    <span className="text-gray-900 ml-2 font-medium">{vehicle.color}</span>
                </div>
                <div>
                    <span className="text-gray-500">Plaque:</span>
                    <span className="text-gray-900 ml-2 font-medium">{vehicle.plate}</span>
                </div>
            </div>
        </div>
    );
}

// Informations complètes du client (pour les détails)
function ClientDetails({ client }: { client: InterventionEnCours['client'] }) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4" />
                Informations client
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                    <span className="text-gray-500">Nom complet:</span>
                    <span className="text-gray-900 ml-2 font-medium">{client.fullName}</span>
                </div>
                <div>
                    <span className="text-gray-500">Téléphone:</span>
                    <a href={`tel:${client.phone}`} className="text-blue-600 ml-2 hover:underline">
                        {client.phone}
                    </a>
                </div>
            </div>
        </div>
    );
}

// Description du problème
function ProblemDescription({ 
    descriptionProbleme 
}: { 
    descriptionProbleme?: string;
}) {
    if (!descriptionProbleme) return null;

    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Description du problème
            </h5>
            <p className="text-sm text-gray-600">
                {descriptionProbleme}
            </p>
        </div>
    );
}

// Adresse complète détaillée
function FullAddress({ 
    adresseClient, 
    localisation,
    latitude, 
    longitude 
}: { 
    adresseClient: string;
    localisation: string;
    latitude: number;
    longitude: number;
}) {
    return (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresse complète
            </h5>
            <p className="text-sm text-gray-600">
                {adresseClient || localisation}
            </p>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">
                    Coordonnées: {latitude}, {longitude}
                </span>
            </div>
        </div>
    );
}

// Formulaire de fin d'intervention
function EndInterventionForm({ 
    formData, 
    onChange, 
    onSubmit, 
    onCancel 
}: { 
    formData: InterventionFormData;
    onChange: (data: InterventionFormData) => void;
    onSubmit: () => void;
    onCancel: () => void;
}) {
    const calculateTotal = () => {
        return (formData.coutPiece || 0) + (formData.coutMainOeuvre || 0);
    };

    return (
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
                        onChange={(e) => onChange({
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
                        onChange={(e) => onChange({
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
                    onChange={(e) => onChange({
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
                    onChange={(e) => onChange({
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
                    onClick={onCancel}
                    className="flex-1"
                >
                    Annuler
                </Button>
                <Button
                    onClick={onSubmit}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Terminer
                </Button>
            </div>
        </div>
    );
}

// Panneau type de panne
function TypePannePanel({ 
    typePanne, 
    descriptionProbleme 
}: { 
    typePanne: string;
    descriptionProbleme?: string;
}) {
    return (
        <Card className="bg-white border-gray-200">
            <CardContent className="py-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Wrench className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Type de panne</p>
                        <p className="text-gray-900 font-medium">
                            {formatTypePanne(typePanne)}
                        </p>
                    </div>
                </div>
                {descriptionProbleme && (
                    <div className="mt-3 ml-12">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="text-gray-700 text-sm">
                            {descriptionProbleme}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

// ==================== COMPOSANT PRINCIPAL ====================

export function CurrentIntervention({
    intervention,
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
    const [elapsedTime, setElapsedTime] = useState(30);

    // Timer pour le temps écoulé
    useEffect(() => {
        if (status === 'en_cours') {
            const interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [status]);

    const handleSubmit = () => {
        onEnd(formData);
        setShowEndForm(false);
    };

    // Pas d'intervention en cours
    if (status === 'aucune' || !intervention) {
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
                        
                        <div className="flex items-center gap-2">
                            <InterventionStatusBadge status={status} />
                            {status === 'en_cours' && <DemarreBadge />}
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    {/* Info client */}
                    <ClientInfo 
                        client={intervention.client}
                        vehicle={intervention.vehicle}
                        onCall={onCallClient}
                        onOpenMaps={onOpenMaps}
                    />

                    {/* Adresse et distance */}
                    <InterventionLocation 
                        adresseClient={intervention.adresseClient}
                        distanceClient={intervention.distanceClient}
                        dureeEstimee={intervention.dureeEstimee}
                        latitude={intervention.demande.latitude}
                        longitude={intervention.demande.longitude}
                    />

                    {/* Timer et actions */}
                    {status === 'en_cours' || status === 'en_attente_confirmation' ? (
                        <div className="space-y-4">
                            {/* Timer */}
                            <InterventionTimer 
                                status={status}
                                elapsedTime={elapsedTime}
                            />

                            {/* Bouton terminer ou formulaire */}
                            {showEndForm ? (
                                <EndInterventionForm 
                                    formData={formData}
                                    onChange={setFormData}
                                    onSubmit={handleSubmit}
                                    onCancel={() => setShowEndForm(false)}
                                />
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
                
                {/* Détails supplémentaires toujours visibles */}
                <div className="px-6 pb-6 space-y-4">
                    <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Détails supplémentaires
                        </h4>
                        
                        {/* Informations complètes du client */}
                        <ClientDetails client={intervention.client} />
                        
                        {/* Informations complètes du véhicule */}
                        <div className="mt-3">
                            <VehicleDetails vehicle={intervention.vehicle} />
                        </div>
                        
                        {/* Description du problème */}
                        <div className="mt-3">
                            <ProblemDescription descriptionProbleme={intervention.demande.descriptionProbleme} />
                        </div>
                        
                        {/* Adresse complète */}
                        <div className="mt-3">
                            <FullAddress 
                                adresseClient={intervention.adresseClient}
                                localisation={intervention.demande.localisation}
                                latitude={intervention.demande.latitude}
                                longitude={intervention.demande.longitude}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Info panneau Type de panne */}
            {intervention.demande.typePanne && (
                <TypePannePanel 
                    typePanne={intervention.demande.typePanne}
                    descriptionProbleme={intervention.demande.descriptionProbleme}
                />
            )}
        </div>
    );
}

