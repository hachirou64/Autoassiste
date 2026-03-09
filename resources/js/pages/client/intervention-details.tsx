import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    ArrowLeft, Loader2, MapPin, Phone, Clock, Wrench, 
    Star, FileText, CreditCard, CheckCircle
} from 'lucide-react';
import type { SharedData } from '@/types';

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

interface InterventionDetailsPageProps {
    interventionId: number;
    intervention?: InterventionDetails;
    error?: string;
}

export default function InterventionDetailsPage() {
    const { interventionId, intervention, error } = usePage<SharedData & InterventionDetailsPageProps>().props;
    
    const [loading, setLoading] = useState(false);
    const [interventionData, setInterventionData] = useState<InterventionDetails | null>(intervention || null);

    // Les données de l'intervention sont maintenant passées via les props du serveur
    // Plus besoin de faire un appel API séparé

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

    if (loading) {
        return (
            <AppHeaderLayout>
                <Head title="Détails de l'intervention - GoAssist" />
                <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-600">Chargement des détails...</p>
                    </div>
                </div>
            </AppHeaderLayout>
        );
    }

    if (error || !interventionData) {
        return (
            <AppHeaderLayout>
                <Head title="Erreur - GoAssist" />
                <div className="min-h-screen bg-white p-4 flex items-center justify-center">
                    <Card className="bg-slate-50 border-slate-200 max-w-md">
                        <CardContent className="p-8 text-center">
                            <p className="text-red-500 mb-4">{error || 'Intervention non trouvée'}</p>
                            <Button onClick={() => router.visit('/client/dashboard')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour au dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title={`Détails ${interventionData.codeDemande} - GoAssist`} />

            <div className="min-h-screen bg-white p-4 lg:p-8">
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/client/dashboard')}
                            className="text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-slate-900">{interventionData.codeDemande}</h1>
                            <Badge className={getStatusColor(interventionData.status)}>
                                {getStatusLabel(interventionData.status)}
                            </Badge>
                        </div>
                    </div>

                    {/* Informations principales */}
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-blue-500" />
                                Informations de l'intervention
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-sm">Type de panne</p>
                                    <p className="text-slate-900 font-medium">{interventionData.typePanne}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-sm">Date</p>
                                    <p className="text-slate-900 font-medium">{formatDate(interventionData.date)}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-sm">Durée</p>
                                    <p className="text-slate-900 font-medium">{interventionData.duree} minutes</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-sm">Montant</p>
                                    <p className="text-slate-900 font-medium text-amber-600">
                                        {formatCurrency(interventionData.montant)}
                                    </p>
                                </div>
                            </div>

                            {/* Localisation */}
                            <div>
                                <p className="text-slate-500 text-sm">Localisation</p>
                                <p className="text-slate-900 font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-500" />
                                    {interventionData.localisation}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Informations du dépanneur */}
                    <Card className="bg-slate-50 border-slate-200">
                        <CardHeader>
                            <CardTitle className="text-slate-900 flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-blue-500" />
                                Dépanneur
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-xl font-bold text-white">
                                        {interventionData.depanneur.fullName.charAt(0)}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-slate-900 font-medium">{interventionData.depanneur.fullName}</p>
                                    <p className="text-slate-500 text-sm">{interventionData.depanneur.etablissement_name}</p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${
                                                    star <= Math.floor(interventionData.depanneur.rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-300'
                                                }`}
                                            />
                                        ))}
                                        <span className="text-slate-500 text-sm ml-1">
                                            ({interventionData.depanneur.rating})
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="bg-green-50 border-green-200 text-green-600 hover:bg-green-100"
                                    onClick={() => window.open(`tel:${interventionData.depanneur.phone}`)}
                                >
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Facture */}
                    {interventionData.facture && (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-500" />
                                    Facture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-sm">Montant</p>
                                        <p className="text-slate-900 font-bold text-xl">
                                            {formatCurrency(interventionData.facture.montant)}
                                        </p>
                                    </div>
                                    <Badge className={interventionData.facture.status === 'payee' 
                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                        : 'bg-yellow-100 text-yellow-700 border-yellow-200'}>
                                        {interventionData.facture.status === 'payee' ? 'Payée' : 'En attente'}
                                    </Badge>
                                </div>

                                {interventionData.facture.status === 'en_attente' && (
                                    <Button
                                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                                        onClick={() => router.visit(`/client/paiement/${interventionData.facture!.id}`)}
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Payer maintenant
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Évaluation */}
                    {interventionData.evaluation ? (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-slate-900 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500" />
                                    Votre évaluation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-6 w-6 ${
                                                star <= interventionData.evaluation!.note
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-slate-300'
                                            }`}
                                        />
                                    ))}
                                    <span className="text-slate-900 font-medium ml-2">
                                        {interventionData.evaluation.note}/5
                                    </span>
                                </div>
                                {interventionData.evaluation.commentaire && (
                                    <p className="text-slate-600 italic">"{interventionData.evaluation.commentaire}"</p>
                                )}
                            </CardContent>
                        </Card>
                    ) : interventionData.status === 'terminee' ? (
                        <Card className="bg-slate-50 border-slate-200">
                            <CardContent className="p-6 text-center">
                                <p className="text-slate-600 mb-4">Vous n'avez pas encore évalué cette intervention</p>
                                <Button
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={() => router.visit(`/client/intervention/${interventionData.id}/evaluer`)}
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    Évaluer cette intervention
                                </Button>
                            </CardContent>
                        </Card>
                    ) : null}

                    {/* Boutons d'action */}
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={() => router.visit('/client/dashboard')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour au dashboard
                        </Button>
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

