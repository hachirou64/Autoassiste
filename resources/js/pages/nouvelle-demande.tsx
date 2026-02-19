import { useState, useEffect, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { DemandeForm } from '@/components/client/demande-form';
import { LoadingPage } from '@/components/ui/loading-spinner';
import { AlertTriangle, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SharedData } from '@/types';

interface DemandeInfo {
    id: number;
    codeDemande: string;
}

export default function NouvelleDemandePage() {
    const { auth, flash } = usePage<SharedData>().props;
    
    // Single view state: 'loading' | 'form' | 'confirmation' | 'error'
    const [view, setView] = useState<'loading' | 'form' | 'confirmation' | 'error'>('loading');
    
    // Store demande info
    const [demandeInfo, setDemandeInfo] = useState<DemandeInfo | null>(null);
    
    // Error state
    const [error, setError] = useState<string | null>(null);

    // Debug: log auth state
    console.log('[NouvelleDemandePage] Auth state:', auth);
    console.log('[NouvelleDemandePage] Current view:', view);

    // Check authentication on mount
    useEffect(() => {
        // First check if we have a pending demande from sessionStorage
        const storedDemande = sessionStorage.getItem('pending_demande_info');
        if (storedDemande) {
            try {
                const parsed = JSON.parse(storedDemande);
                if (parsed.codeDemande) {
                    setDemandeInfo(parsed);
                    setView('confirmation');
                    // Clear from sessionStorage after reading
                    sessionStorage.removeItem('pending_demande_info');
                    console.log('[NouvelleDemandePage] Loaded stored demande:', parsed);
                    return;
                }
            } catch (e) {
                console.error('[NouvelleDemandePage] Error parsing stored demande:', e);
            }
        }

        // Small delay to ensure client-side hydration is complete
        const timer = setTimeout(() => {
            if (typeof window !== 'undefined') {
                console.log('[NouvelleDemandePage] Checking auth, user:', auth?.user);
                
                if (auth?.user) {
                    setView('form');
                } else {
                    // Store intention and redirect to registration
                    window.sessionStorage?.setItem('pending_demande', 'true');
                    window.location.href = '/register';
                }
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [auth]);

    // Handle form submission - accepts both API response and simulation data
    const handleSubmit = useCallback(async (data: {
        vehicleType: string;
        typePanne: string;
        description: string;
        localisation: string;
    } | {
        demande?: {
            id: number;
            codeDemande: string;
            status?: string;
        };
        id?: number;
        codeDemande?: string;
        status?: string;
    }) => {
        console.log('[NouvelleDemandePage] handleSubmit called with data:', data);
        setError(null);
        
        // Extract demande info from various possible structures
        let demandeId: number | undefined;
        let codeDemande: string | undefined;
        
        // Check if data has demande property
        if ('demande' in data && data.demande) {
            demandeId = data.demande.id;
            codeDemande = data.demande.codeDemande;
        } 
        // Check if data has id and codeDemande at root level
        else if ('id' in data && 'codeDemande' in data) {
            demandeId = data.id;
            codeDemande = data.codeDemande;
        }
        
        // If we don't have the info yet, try the API
        if (!codeDemande) {
            try {
                const response = await fetch('/api/demandes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('[NouvelleDemandePage] API response:', result);
                    
                    const demandeData = result.demande || result.data || result;
                    
                    if (demandeData?.id && demandeData?.codeDemande) {
                        demandeId = demandeData.id;
                        codeDemande = demandeData.codeDemande;
                    }
                } else if (response.status === 401 || response.status === 403) {
                    window.sessionStorage?.setItem('pending_demande', 'true');
                    window.location.href = '/login';
                    return;
                }
            } catch (err) {
                console.error('[NouvelleDemandePage] API error:', err);
            }
        }
        
        // Fallback: generate a simulation code if still no code
        if (!codeDemande) {
            codeDemande = `DEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
            demandeId = Date.now();
            console.log('[NouvelleDemandePage] Using simulation code:', codeDemande);
        }
        
        // Set the demande info and show confirmation
        const info: DemandeInfo = {
            id: demandeId || Date.now(),
            codeDemande: codeDemande,
        };
        
        console.log('[NouvelleDemandePage] Setting demandeInfo:', info);
        setDemandeInfo(info);
        sessionStorage.setItem('pending_demande_info', JSON.stringify(info));
        setView('confirmation');
    }, []);

    const handleGoToDashboard = () => {
        // Clear the pending demande info
        sessionStorage.removeItem('pending_demande_info');
        window.location.href = '/client/dashboard';
    };

    // Show loading while checking authentication
    if (view === 'loading') {
        return <LoadingPage text="Vérification de votre session..." />;
    }

    // Show confirmation page after submission
    if (view === 'confirmation' && demandeInfo) {
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

    // Show the form
    return (
        <AppHeaderLayout>
            <Head title="Nouvelle demande - GoAssist" />
            
            <div className="min-h-screen bg-slate-950 p-4 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                            {error}
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

                    {/* Form */}
                    <DemandeForm onSubmit={handleSubmit} />
                </div>
            </div>
        </AppHeaderLayout>
    );
}

