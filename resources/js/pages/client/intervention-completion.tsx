import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { PaymentForm } from '@/components/client/payment-form';
import { EvaluationForm } from '@/components/client/evaluation-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Download } from 'lucide-react';
import type { SharedData } from '@/types';

interface Intervention {
    id: number;
    id_demande: number;
    price: number;
    status: string;
    startedAt: string;
    completedAt: string;
}

interface Demande {
    id: number;
    codeDemande: string;
    vehicle_type: string;
    typePanne: string;
    status: string;
}

interface Depanneur {
    etablissement_name: string;
}

export default function InterventionCompletionPage() {
    const { intervention, demande, depanneur } = usePage<SharedData & {
        intervention?: Intervention;
        demande?: Demande;
        depanneur?: Depanneur;
    }>().props;

    const [step, setStep] = useState<'payment' | 'evaluation' | 'complete'>('payment');
    const [receipt, setReceipt] = useState<any>(null);

    const handlePaymentSuccess = () => {
        setStep('evaluation');
    };

    const handleEvaluationSuccess = () => {
        setStep('complete');
    };

    if (!intervention || !demande) {
        return (
            <AppHeaderLayout>
                <Head title="Intervention terminée - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-8 text-center">
                            <p className="text-slate-400">Intervention non trouvée</p>
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title="Finaliser l'intervention - GoAssist" />

            <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="h-6 w-6" />
                            <h1 className="text-2xl font-bold">Intervention terminée!</h1>
                        </div>
                        <p className="text-white/80">
                            Finalisez votre dépannage en procédant au paiement et en nous laissant votre avis
                        </p>
                    </div>

                    {/* Détails intervention */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">Résumé de l'intervention</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-400 text-sm">Demande #</p>
                                    <p className="text-white font-bold">{demande.codeDemande}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Type de panne</p>
                                    <p className="text-white font-bold">{demande.typePanne}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Dépanneur</p>
                                    <p className="text-white font-bold">{depanneur?.etablissement_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-sm">Montant</p>
                                    <p className="text-amber-400 font-bold text-lg">{intervention.price}€</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between">
                        {[
                            { step: 'payment', label: 'Paiement', icon: '💳' },
                            { step: 'evaluation', label: 'Évaluation', icon: '⭐' },
                            { step: 'complete', label: 'Terminé', icon: '✅' },
                        ].map((item, index) => (
                            <div key={item.step} className="flex items-center flex-1">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                                        step === item.step || (step === 'evaluation' && item.step === 'payment') || step === 'complete'
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                    }`}
                                >
                                    {item.icon}
                                </div>
                                {index < 2 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 ${
                                            (step === 'evaluation' && item.step === 'payment') || step === 'complete'
                                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                                : 'bg-slate-700'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    {step === 'payment' && (
                        <PaymentForm
                            amount={intervention.price}
                            demande_id={demande.id}
                            onSuccess={handlePaymentSuccess}
                        />
                    )}

                    {step === 'evaluation' && (
                        <EvaluationForm
                            demande_id={demande.id}
                            depanneur_name={depanneur?.etablissement_name || 'Dépanneur'}
                            onSubmit={handleEvaluationSuccess}
                        />
                    )}

                    {step === 'complete' && (
                        <div className="space-y-4">
                            {/* Success Message */}
                            <Card className="bg-green-500/10 border-green-500/30">
                                <CardContent className="p-6">
                                    <div className="text-center space-y-3">
                                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                                            <CheckCircle className="h-8 w-8 text-green-400" />
                                        </div>
                                        <h2 className="text-xl font-bold text-green-400">Merci!</h2>
                                        <p className="text-green-300">
                                            Votre évaluation nous aide à améliorer notre service
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Receipt */}
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-white">Reçu & Facture</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Dépannage:</span>
                                            <span className="text-white">{intervention.price}€</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-700">
                                            <span>Frais:</span>
                                            <span className="text-white">0€</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-white">
                                            <span>Total:</span>
                                            <span className="text-amber-400">{intervention.price}€</span>
                                        </div>
                                    </div>

                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                        <Download className="h-4 w-4 mr-2" />
                                        Télécharger la facture
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    variant="outline"
                                    className="bg-slate-700 border-slate-600 hover:bg-slate-600 text-white"
                                    onClick={() => window.location.href = '/client/dashboard'}
                                >
                                    Retour au dashboard
                                </Button>
                                <Button
                                    className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                    onClick={() => window.location.href = '/demande/nouvelle'}
                                >
                                    Nouvelle demande
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppHeaderLayout>
    );
}
