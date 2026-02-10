import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Phone, Navigation, MapPin, Clock, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SharedData } from '@/types';

interface SosButtonProps {
    variant?: 'floating' | 'inline' | 'compact';
    showLocation?: boolean;
    onClick?: () => void;
}

interface LocationData {
    loading: boolean;
    error: string | null;
    position: { lat: number; lng: number } | null;
    address: string | null;
}

export function SosButton({ variant = 'floating', showLocation = true, onClick }: SosButtonProps) {
    const { auth } = usePage<SharedData>().props;
    const isAuthenticated = !!auth?.user;
    
    const [isOpen, setIsOpen] = useState(false);
    const [location, setLocation] = useState<LocationData>({
        loading: false,
        error: null,
        position: null,
        address: null,
    });

    const getLocation = async () => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'GPS non disponible sur cet appareil' }));
            return;
        }

        setLocation(prev => ({ ...prev, loading: true, error: null }));

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000,
                });
            });

            const { latitude, longitude } = position.coords;
            
            // Simulation d'adresse (à remplacer par API de géocodage)
            const address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            setLocation({
                loading: false,
                error: null,
                position: { lat: latitude, lng: longitude },
                address,
            });
        } catch (error) {
            let errorMessage = 'Impossible d\'obtenir votre position';
            
            if (error instanceof GeolocationPositionError) {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Vous avez refusé l\'accès à la position. Veuillez autoriser dans les paramètres.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Position non disponible. Vérifiez votre connexion GPS.';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Timeout. Réessayez.';
                        break;
                }
            }

            setLocation(prev => ({ 
                ...prev, 
                loading: false, 
                error: errorMessage 
            }));
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (showLocation && !location.position && !location.error) {
            getLocation();
        }
        onClick?.();
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handlePrimaryAction = async () => {
        // Vérifier si l'utilisateur est déjà connecté
        try {
            const response = await fetch('/api/client/check-auth', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include', // Important pour les cookies de session
            });

            const data = await response.json();

            if (data.authenticated) {
                // Utilisateur déjà connecté - aller directement à nouvelle demande
                window.location.href = '/demande/nouvelle';
            } else {
                // Non connecté - stocker l'intention et rediriger vers inscription
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    sessionStorage.setItem('pending_demande', 'true');
                }
                window.location.href = '/register';
            }
        } catch (error) {
            // En cas d'erreur, rediriger vers inscription par défaut
            console.error('Erreur lors de la vérification auth:', error);
            if (typeof window !== 'undefined' && window.sessionStorage) {
                sessionStorage.setItem('pending_demande', 'true');
            }
            window.location.href = '/register';
        }
    };

    // Variant: Floating (rond, fixe en bas à droite)
    if (variant === 'floating') {
        return (
            <>
                {/* Bouton SOS principal */}
                <button
                    onClick={handleOpen}
                    className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-4 border-white/20 group animate-pulse"
                    aria-label="J'ai besoin d'aide"
                >
                    <Phone className="h-8 w-8 transform group-hover:rotate-12 transition-transform" />
                </button>

                {/* Panel SOS */}
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <div 
                            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                            onClick={handleClose}
                        />
                        
                        {/* Panel */}
                        <div className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom-4">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                                            <Phone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Assistance d'urgence</h3>
                                            <p className="text-sm text-white/80">Nous sommes là pour vous</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-4">
                                {/* Statut */}
                                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span>24/7 disponible</span>
                                </div>

                                {/* Localisation */}
                                {showLocation && (
                                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="h-4 w-4 text-amber-500" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                Votre position
                                            </span>
                                        </div>
                                        
                                        {location.loading ? (
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <Clock className="h-4 w-4 animate-spin" />
                                                <span>Localisation en cours...</span>
                                            </div>
                                        ) : location.error ? (
                                            <div className="text-sm text-red-500">
                                                <p>{location.error}</p>
                                                <button
                                                    onClick={getLocation}
                                                    className="mt-2 text-amber-500 hover:text-amber-600 font-medium"
                                                >
                                                    Réessayer
                                                </button>
                                            </div>
                                        ) : location.address ? (
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {location.address}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={getLocation}
                                                className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-600 font-medium"
                                            >
                                                <Navigation className="h-4 w-4" />
                                                Activer ma position
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Info */}
                                <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                    Temps moyen d'intervention: <span className="font-medium text-slate-700 dark:text-slate-300">15-30 min</span>
                                </div>

                                {/* Bouton principal */}
                                <Button
                                    onClick={handlePrimaryAction}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                    size="lg"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    {isAuthenticated ? 'Créer une demande' : 'Créer un compte pour continue'}
                                </Button>

                                {/* Lien vers connexion si non connecté */}
                                {!isAuthenticated && (
                                    <p className="text-xs text-center text-slate-500">
                                        Déjà un compte?{' '}
                                        <button
                                            onClick={() => window.location.href = '/login'}
                                            className="text-amber-500 hover:text-amber-600 font-medium"
                                        >
                                            Se connecter
                                        </button>
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </>
        );
    }

    // Variant: Inline (dans une section)
    if (variant === 'inline') {
        return (
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-xl">Besoin d'aide immédiate?</h3>
                        <p className="text-white/80 text-sm">Notre équipe est disponible 24/7</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Phone className="h-6 w-6" />
                    </div>
                </div>
                
                <Button
                    onClick={handlePrimaryAction}
                    className="w-full bg-white text-red-600 hover:bg-white/90 font-bold py-4"
                    size="lg"
                >
                    {isAuthenticated ? 'Nouvelle demande' : 'Commencer'}
                </Button>
            </div>
        );
    }

    // Variant: Compact (petit, pour la navbar)
    return (
        <Button
            onClick={handlePrimaryAction}
            variant="destructive"
            size="sm"
            className="gap-2"
        >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">J'ai besoin d'aide</span>
        </Button>
    );
}

// Hook pour détecter si l'utilisateur a une demande active
export function useActiveDemande() {
    const [hasActiveDemande, setHasActiveDemande] = useState(false);
    const [demandeInfo, setDemandeInfo] = useState<{
        id: number;
        status: string;
        estimatedArrival?: string;
    } | null>(null);

    useEffect(() => {
        // Simuler la vérification d'une demande active
        // Dans un vrai projet: API call to /api/demandes/active
        const checkActiveDemande = async () => {
            try {
                // Simulation
                const hasActive = false; // À remplacer par la vraie logique
                setHasActiveDemande(hasActive);
            } catch (error) {
                console.error('Erreur lors de la vérification:', error);
            }
        };

        checkActiveDemande();
    }, []);

    return { hasActiveDemande, demandeInfo };
}

