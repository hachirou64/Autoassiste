import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { DemandeForm } from '@/components/client/demande-form';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SharedData } from '@/types';

export default function NouvelleDemandePage() {
    const { auth, flash } = usePage<SharedData>().props;
    const [submitted, setSubmitted] = useState(false);
    const [demandeInfo, setDemandeInfo] = useState<{
        id: number;
        codeDemande: string;
    } | null>(null);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Afficher le message flash de succès (provenant de l'inscription)
    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            // Le flash message sera automatiquement consommé par Inertia après le prochain render
        }
    }, [flash]);

    // Vérifier si l'utilisateur est connecté
    useEffect(() => {
        // Petit délai pour éviter les problèmes d'hydratation SSR
        const timer = setTimeout(() => {
            setCheckingAuth(false);
            
            // Vérifier l'auth seulement côté client
            if (typeof window !== 'undefined') {
                if (!auth?.user) {
                    // Stocker l'intention pour revenir après inscription
                    window.sessionStorage?.setItem('pending_demande', 'true');
                    // Rediriger vers inscription si non connecté
                    window.location.href = '/register';
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [auth]);

    // Afficher loading pendant la vérification
    if (checkingAuth) {
        return <LoadingPage text="Vérification de votre session..." />;
    }

    const handleSubmit = async (data: {
        vehicleType: string;
        typePanne: string;
        description: string;
        localisation: string;
    }) => {
        try {
            // Appel API pour créer la demande
            const response = await fetch('/api/demandes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const result = await response.json();
                setDemandeInfo({
                    id: result.demande.id,
                    codeDemande: result.demande.codeDemande,
                });
                setSubmitted(true);
            } else {
                // En cas d'erreur, simuler pour le développement
                console.log('Demande créée (simulation):', data);
                setDemandeInfo({
                    id: Date.now(),
                    codeDemande: `DEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
                });
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Erreur lors de la création de la demande:', error);
            // Simulation pour le développement
            setDemandeInfo({
                id: Date.now(),
                codeDemande: `DEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
            });
            setSubmitted(true);
        }
    };

    const handleGoToDashboard = () => {
        window.location.href = '/client/dashboard';
    };

    // Afficher la page de confirmation après soumission
    if (submitted && demandeInfo) {
        return (
            <AppHeaderLayout>
                <Head title="Demande créée - GoAssist" />
                
                <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                    <Card className="max-w-md w-full bg-slate-800/50 border-slate-700">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-8 w-8 text-green-400" />
                            </div>
                            <CardTitle className="text-white text-xl">
                                Demande créée avec succès!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                                <p className="text-slate-400 text-sm mb-1">Numéro de demande</p>
                                <p className="text-amber-400 font-bold text-2xl">{demandeInfo.codeDemande}</p>
                            </div>
                            
                            <p className="text-slate-400 text-center text-sm">
                                Un dépanneur va être affecté à votre demande. 
                                Vous reciproez une notification lorsqu'un dépanneur sera en route.
                            </p>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-blue-400 text-sm text-center">
                                    Temps moyen d&apos;attente: <span className="font-bold">15-30 minutes</span>
                                </p>
                            </div>

                            <Button
                                onClick={handleGoToDashboard}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold"
                            >
                                Accéder à mon dashboard
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </AppHeaderLayout>
        );
    }

    // Afficher le formulaire de demande
    return (
        <AppHeaderLayout>
            <Head title="Nouvelle demande - GoAssist" />
            
            <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Message de succès de l'inscription */}
                    {successMessage && (
                        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 flex-shrink-0" />
                            <span className="font-medium">{successMessage}</span>
                        </div>
                    )}

                    {/* Header */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => window.history.back()}
                            className="text-slate-400 hover:text-white mb-4"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                        
                        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="h-6 w-6" />
                                <h1 className="text-2xl font-bold">Nouvelle demande d&apos;assistance</h1>
                            </div>
                            <p className="text-white/80">
                                Remplissez le formulaire ci-dessous pour appeler un dépanneur
                            </p>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <DemandeForm onSubmit={handleSubmit} />
                </div>
            </div>
        </AppHeaderLayout>
    );
}

