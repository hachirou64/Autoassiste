import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock, MapPin, Phone, CheckCircle, Wrench, Navigation,
    Star, MessageSquare, FileText
} from 'lucide-react';
import type { DemandeActive, AssignedDepanneur } from '@/types/client';
import { DEMANDE_STATUS_LABELS, DEMANDE_STATUS_COLORS } from '@/types/client';

interface InterventionTrackerProps {
    demandeActive?: DemandeActive;
    onContactDepanneur?: () => void;
    onAnnuler?: () => void;
    onFacture?: () => void;
    onEvaluer?: () => void;
}

const STEPS = [
    { status: 'en_attente', label: 'Demande soumise', icon: Clock },
    { status: 'acceptee', label: 'Dépanneur assigné', icon: Wrench },
    { status: 'en_cours', label: 'Intervention en cours', icon: Wrench },
    { status: 'terminee', label: 'Intervention terminée', icon: CheckCircle },
];

export function InterventionTracker({
    demandeActive,
    onContactDepanneur,
    onAnnuler,
    onFacture,
    onEvaluer,
}: InterventionTrackerProps) {
    if (!demandeActive) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-blue-400" />
                        Suivi de l'intervention
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wrench className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-white font-medium mb-2">Aucune intervention en cours</h3>
                        <p className="text-slate-400 text-sm">
                            Vous n'avez pas de demande d'assistance active.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const currentStepIndex = STEPS.findIndex((s) => s.status === demandeActive.status);

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-blue-400" />
                        Suivi de l'intervention
                    </span>
                    <Badge className={DEMANDE_STATUS_COLORS[demandeActive.status]}>
                        {DEMANDE_STATUS_LABELS[demandeActive.status]}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Code demande */}
                <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-slate-400 text-sm">Numéro de demande</p>
                    <p className="text-2xl font-bold text-white font-mono">{demandeActive.codeDemande}</p>
                </div>

                {/* Timeline des étapes */}
                <div className="relative">
                    <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-600" />
                    <div className="relative flex justify-between">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            const isCompleted = index < currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.status} className="flex flex-col items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                                            isCompleted
                                                ? 'bg-green-500 text-white'
                                                : isCurrent
                                                    ? 'bg-blue-500 text-white animate-pulse'
                                                    : 'bg-slate-600 text-slate-400'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <p
                                        className={`text-xs mt-2 text-center ${
                                            isCompleted || isCurrent ? 'text-white' : 'text-slate-500'
                                        }`}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Informations détaillées selon le statut */}
                {['acceptee', 'en_cours'].includes(demandeActive.status) && demandeActive.depanneur && (
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg space-y-3">
                        <h4 className="font-medium text-white flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-blue-400" />
                            Dépanneur assigné
                        </h4>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                                <span className="text-xl font-bold text-white">
                                    {demandeActive.depanneur.fullName.charAt(0)}
                                </span>
                            </div>
                            <div className="flex-1">
                                <h5 className="font-medium text-white">
                                    {demandeActive.depanneur.fullName}
                                </h5>
                                <p className="text-sm text-slate-400">
                                    {demandeActive.depanneur.etablissement_name}
                                </p>
                                <div className="flex items-center gap-1 mt-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-3 w-3 ${
                                                star <= Math.floor(demandeActive.depanneur!.rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-slate-500'
                                            }`}
                                        />
                                    ))}
                                    <span className="text-xs text-slate-400 ml-1">
                                        ({demandeActive.depanneur.rating})
                                    </span>
                                </div>
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                                onClick={onContactDepanneur}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Temps estimé */}
                        {demandeActive.estimated_arrival && (
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-blue-400" />
                                <span className="text-slate-300">
                                    Arrivée estimée dans <span className="text-white font-medium">{demandeActive.estimated_arrival}</span>
                                </span>
                            </div>
                        )}

                        {/* Distance */}
                        {demandeActive.distance && (
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-blue-400" />
                                <span className="text-slate-300">
                                    Distance: <span className="text-white font-medium">{demandeActive.distance} km</span>
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Intervention terminée */}
                {demandeActive.status === 'terminee' && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <h4 className="font-medium text-white">Intervention terminée</h4>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">
                            L'intervention a été réalisée avec succès. Vous pouvez consulter la facture
                            et laisser un avis sur le service.
                        </p>
                        <div className="flex gap-2">
                            {onFacture && (
                                <Button
                                    variant="outline"
                                    className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                    onClick={onFacture}
                                >
                                    <FileText className="h-4 w-4 mr-2" />
                                    Voir la facture
                                </Button>
                            )}
                            {onEvaluer && (
                                <Button
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                    onClick={onEvaluer}
                                >
                                    <Star className="h-4 w-4 mr-2" />
                                    Évaluer
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                {demandeActive.status === 'en_attente' && onAnnuler && (
                    <Button
                        variant="outline"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={onAnnuler}
                    >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Annuler la demande
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

