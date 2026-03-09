import { router } from '@inertiajs/react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, Loader2, MapPin, Phone, Clock, Wrench, 
    Star, FileText, CreditCard, CheckCircle
} from 'lucide-react';

interface InterventionDetails {
    id: number;
    codeDemande: string;
    status: string;
    typePanne: string;
    localisation: string;
    date: string;
    duree: number;
    montant: number;
    depanneur: {
        fullName: string;
        etablissement_name: string;
        phone: string;
        rating: number;
    };
    facture?: {
        id: number;
        status: string;
        montant: number;
    };
    evaluation?: {
        note: number;
        commentaire: string;
    };
}

interface InterventionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    interventionId?: number;
    intervention?: InterventionDetails;
}

export function InterventionDetailsModal({ isOpen, onClose, interventionId, intervention }: InterventionDetailsModalProps) {
    
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'terminee':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'en_cours':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'acceptee':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'en_attente':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'annulee':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'terminee':
                return 'Terminée';
            case 'en_cours':
                return 'En cours';
            case 'acceptee':
                return 'Acceptée';
            case 'en_attente':
                return 'En attente';
            case 'annulee':
                return 'Annulée';
            default:
                return status;
        }
    };

    const handlePayer = () => {
        if (intervention?.facture?.id) {
            onClose();
            router.visit(`/client/paiement/${intervention.facture.id}`);
        }
    };

    const handleEvaluer = () => {
        if (intervention?.id) {
            onClose();
            router.visit(`/client/intervention/${intervention.id}/evaluer`);
        }
    };

    const handleClose = () => {
        onClose();
    };

    // Loading state
    if (!intervention) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-2xl bg-white text-slate-900 border-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-900">
                           Détails de l'intervention
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-600">Chargement...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                        <span>{intervention.codeDemande}</span>
                        <Badge className={getStatusColor(intervention.status)}>
                            {getStatusLabel(intervention.status)}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        Détails de l'intervention du {formatDate(intervention.date)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Main Info */}
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-blue-500" />
                                Informations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500">Type de panne</p>
                                    <p className="text-slate-900 font-medium">{intervention.typePanne}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Durée</p>
                                    <p className="text-slate-900 font-medium">{intervention.duree} minutes</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Montant</p>
                                    <p className="text-slate-900 font-bold text-amber-600">
                                        {formatCurrency(intervention.montant)}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-500 text-sm">Localisation</p>
                                <p className="text-slate-900 font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                    {intervention.localisation}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Depanneur Info */}
                    {intervention.depanneur && (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-blue-500" />
                                    Dépanneur
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-lg font-bold text-white">
                                            {intervention.depanneur.fullName.charAt(0)}
                                        </span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-900 font-medium">{intervention.depanneur.fullName}</p>
                                        <p className="text-slate-500 text-sm">{intervention.depanneur.etablissement_name}</p>
                                        <div className="flex items-center gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-3 w-3 ${
                                                        star <= Math.floor(intervention.depanneur.rating)
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-slate-300'
                                                    }`}
                                                />
                                            ))}
                                            <span className="text-slate-500 text-xs ml-1">
                                                ({intervention.depanneur.rating})
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                        onClick={() => window.open(`tel:${intervention.depanneur.phone}`)}
                                    >
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Facture */}
                    {intervention.facture && (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Facture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-sm">Montant</p>
                                        <p className="text-slate-900 font-bold text-xl">
                                            {formatCurrency(intervention.facture.montant)}
                                        </p>
                                    </div>
                                    <Badge className={intervention.facture.status === 'payee' 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'}>
                                        {intervention.facture.status === 'payee' ? 'Payée' : 'En attente'}
                                    </Badge>
                                </div>

                                {intervention.facture.status === 'en_attente' && (
                                    <Button
                                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                                        onClick={handlePayer}
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Payer maintenant
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Evaluation */}
                    {intervention.evaluation ? (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500" />
                                    Votre évaluation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${
                                                star <= intervention.evaluation!.note
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-slate-300'
                                            }`}
                                        />
                                    ))}
                                    <span className="text-slate-900 font-medium ml-2">
                                        {intervention.evaluation.note}/5
                                    </span>
                                </div>
                                {intervention.evaluation.commentaire && (
                                    <p className="text-slate-600 italic">"{intervention.evaluation.commentaire}"</p>
                                )}
                            </CardContent>
                        </Card>
                    ) : intervention.status === 'terminee' ? (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-4 text-center">
                                <p className="text-slate-600 mb-3">Vous n'avez pas encore évalué cette intervention</p>
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={handleEvaluer}
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    Évaluer cette intervention
                                </Button>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            variant="outline"
                            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                            onClick={handleClose}
                        >
                            Fermer
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

