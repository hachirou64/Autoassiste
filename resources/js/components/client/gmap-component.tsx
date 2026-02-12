import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, User, Phone, Clock } from 'lucide-react';
import { useState } from 'react';
import type { DemandeActive, AssignedDepanneur } from '@/types/client';

interface GMapComponentProps {
    demandeActive?: DemandeActive;
    userLocation?: { lat: number; lng: number };
}

export function GMapComponent({ demandeActive }: GMapComponentProps) {
    const [isDetecting, setIsDetecting] = useState(false);

    const handleDetectLocation = () => {
        setIsDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                () => setIsDetecting(false),
                () => setIsDetecting(false)
            );
        } else {
            setIsDetecting(false);
        }
    };

    const getStatusInfo = () => {
        if (!demandeActive) {
            return {
                title: 'Carte de localisation',
                message: 'Cliquez sur "Ma position" pour vous localiser',
                showDepanneur: false,
            };
        }

        switch (demandeActive.status) {
            case 'en_attente':
                return {
                    title: 'Recherche de dépanneur',
                    message: 'Un dépanneur va bientôt accepter votre demande',
                    showDepanneur: false,
                };
            case 'acceptee':
            case 'en_cours':
                return {
                    title: 'Dépanneur en route',
                    message: `${demandeActive.estimated_arrival || '~15 min'} d\'attente`,
                    showDepanneur: true,
                };
            case 'terminee':
                return {
                    title: 'Intervention terminée',
                    message: 'Merci de votre confiance !',
                    showDepanneur: false,
                };
            default:
                return {
                    title: 'Carte',
                    message: '',
                    showDepanneur: false,
                };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    {statusInfo.title}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Carte simulée */}
                <div className="relative h-64 bg-slate-700 rounded-lg overflow-hidden">
                    {/* Grille de fond */}
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full">
                            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>

                    {/* Position utilisateur (point rouge au centre) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                                <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-red-500 rotate-45" />
                        </div>
                    </div>

                    {/* Dépanneur en route (si applicable) */}
                    {statusInfo.showDepanneur && demandeActive && demandeActive.depanneur && (
                        <div className="absolute top-1/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
                            <div className="relative">
                                <div className="w-8 h-8 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                    <Navigation className="h-4 w-4 text-white" />
                                </div>
                                <div className="absolute inset-0 w-8 h-8 bg-blue-500 rounded-full animate-ping opacity-25" />
                            </div>
                        </div>
                    )}

                    {/* Info overlay */}
                    <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 rounded-lg p-3">
                        <p className="text-sm text-white flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-400" />
                            {statusInfo.message}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                    <Button
                        variant="outline"
                        className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                    >
                        <Navigation className="h-4 w-4 mr-2" />
                        {isDetecting ? 'Détection...' : 'Ma position'}
                    </Button>
                </div>

                {/* Info dépanneur */}
                {statusInfo.showDepanneur && demandeActive?.depanneur && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-white">
                                    {demandeActive.depanneur.etablissement_name || 'Dépanneur'}
                                </h4>
                                <p className="text-sm text-slate-400">
                                    {demandeActive.depanneur.fullName || 'N/A'}
                                </p>
                            </div>
                            <Button
                                size="icon"
                                variant="outline"
                                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
                                onClick={() => {
                                    if (demandeActive.depanneur?.phone) {
                                        window.open(`tel:${demandeActive.depanneur.phone}`);
                                    }
                                }}
                            >
                                <Phone className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

