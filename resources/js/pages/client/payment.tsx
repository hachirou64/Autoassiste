import { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { PaymentForm } from '@/components/client/payment-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import type { SharedData } from '@/types';

interface FactureData {
    id: number;
    montant: number;
    status: string;
    transactionId: string;
    createdAt: string;
    intervention: {
        id: number;
        demande: {
            codeDemande: string;
            typePanne: string;
            client: {
                fullName: string;
            };
        };
        depanneur: {
            etablissement_name: string;
        };
    };
}

interface PaymentPageProps {
    factureId: number;
    facture?: FactureData;
    error?: string;
}

export default function ClientPaymentPage() {
    const { factureId, facture, error } = usePage<SharedData & PaymentPageProps>().props;
    
    const [loading, setLoading] = useState(!facture);
    const [factureData, setFactureData] = useState<FactureData | null>(facture || null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    // Charger les données de la facture si pas fournies
    useEffect(() => {
        if (!factureData) {
            fetchFactureData();
        }
    }, [factureId]);

    const fetchFactureData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/client/factures/${factureId}/payment-data`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const result = await response.json();

            if (result.success && result.facture) {
                setFactureData(result.facture);
            } else {
                setFactureData(null);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setFactureData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        // Rediriger vers le dashboard après 2 secondes
        setTimeout(() => {
            router.visit('/client/dashboard');
        }, 2000);
    };

    if (loading) {
        return (
            <AppHeaderLayout>
                <Head title="Paiement - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                        <p className="text-slate-400">Chargement de la facture...</p>
                    </div>
                </div>
            </AppHeaderLayout>
        );
    }

    if (error || !factureData) {
        return (
            <AppHeaderLayout>
                <Head title="Erreur - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <Card className="bg-slate-800/50 border-slate-700 max-w-md">
                        <CardContent className="p-8 text-center">
                            <p className="text-red-400 mb-4">{error || 'Facture non trouvée'}</p>
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

    if (paymentSuccess) {
        return (
            <AppHeaderLayout>
                <Head title="Paiement réussi - GoAssist" />
                <div className="min-h-screen bg-slate-950 p-4 flex items-center justify-center">
                    <Card className="bg-green-500/10 border-green-500/30 max-w-md">
                        <CardContent className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                            <h2 className="text-xl font-bold text-green-400 mb-2">Paiement réussi!</h2>
                            <p className="text-green-300 mb-4">
                                Votre paiement a été traité avec succès. Redirection...
                            </p>
                            <Loader2 className="h-5 w-5 animate-spin text-green-400 mx-auto" />
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    return (
        <AppHeaderLayout>
            <Head title={`Paiement - ${factureData.montant.toLocaleString('fr-FR')} CFA - GoAssist`} />

            <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.visit('/client/dashboard')}
                            className="text-slate-400 hover:text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-white">Paiement de la facture</h1>
                    </div>

                    {/* Détails de la facture */}
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <span>Facture #{factureData.transactionId}</span>
                                <span className="text-2xl font-bold text-amber-400">
                                    {factureData.montant.toLocaleString('fr-FR')} CFA
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Demande</p>
                                    <p className="text-white font-medium">{factureData.intervention.demande.codeDemande}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Type de panne</p>
                                    <p className="text-white font-medium">{factureData.intervention.demande.typePanne}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Dépanneur</p>
                                    <p className="text-white font-medium">{factureData.intervention.depanneur.etablissement_name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Date</p>
                                    <p className="text-white font-medium">
                                        {new Date(factureData.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Formulaire de paiement */}
                    <PaymentForm
                        amount={factureData.montant}
                        factureId={factureData.id}
                        onSuccess={handlePaymentSuccess}
                    />

                    {/* Aide */}
                    <Card className="bg-slate-800/30 border-slate-700/50">
                        <CardContent className="p-4">
                            <p className="text-slate-400 text-sm text-center">
                                Besoin d'aide? <span className="text-blue-400 cursor-pointer hover:underline">Contactez le support</span>
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

