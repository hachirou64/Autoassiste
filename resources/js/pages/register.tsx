import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { QuickRegistrationForm } from '@/components/auth/quick-registration-form';
import { Card, CardContent } from '@/components/ui/card';
import { Car, MapPin, Shield } from 'lucide-react';

export default function RegisterPage() {
    const [mounted, setMounted] = useState<boolean>(false);

    // Attendre que le composant soit mounted (côté client)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Fonction appelée après inscription réussie
    const handleSuccess = () => {
        // Vérifier si on est en mode admin
        const urlParams = new URLSearchParams(window.location.search);
        const isAdminMode = urlParams.get('admin') === 'true';
        
        if (isAdminMode) {
            window.location.href = '/admin/dashboard';
        } else {
            window.location.href = '/demande/nouvelle';
        }
    };

    const features = [
        {
            icon: Car,
            title: 'Dépannage rapide',
            description: 'Des dépanneurs disponibles 24h/24',
        },
        {
            icon: MapPin,
            title: 'Géolocalisation',
            description: 'Nous trouvons votre position exacte',
        },
        {
            icon: Shield,
            title: 'Paiement sécurisé',
            description: 'Transactions sécurisées',
        },
    ];

    return (
        <AppHeaderLayout>
            <Head title="Inscription - GoAssist" />
            
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Branding & Features */}
                        <div className="hidden lg:block space-y-8">
                            <div>
                                <h1 className="text-4xl font-bold text-white mb-4">
                                    GoAssist
                                </h1>
                                <p className="text-xl text-slate-400">
                                    Votre service de dépannage automobile de confiance
                                </p>
                            </div>
                            
                            <div className="grid gap-6">
                                {features.map((feature, index) => (
                                    <Card key={index} className="bg-slate-800/30 border-slate-700">
                                        <CardContent className="flex items-start gap-4 p-4">
                                            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                                <feature.icon className="h-6 w-6 text-amber-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                            
                            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700">
                                <h3 className="font-semibold text-white mb-4">
                                    Pourquoi choisir GoAssist ?
                                </h3>
                                <ul className="space-y-3 text-slate-400">
                                    <li className="flex items-center gap-2">
                                        <span className="text-amber-400">✓</span>
                                        Inscription en 30 secondes
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-amber-400">✓</span>
                                        Aucun engagement
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-amber-400">✓</span>
                                        Service disponible immédiatement
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-amber-400">✓</span>
                                        Notation des dépanneurs
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Right: Registration Form */}
                        <div className="lg:pl-8">
                            <QuickRegistrationForm
                                onSuccess={handleSuccess}
                                onLoginClick={() => {
                                    window.location.href = '/login';
                                }}
                            />
                            
                            {/* Mobile-only features */}
                            <div className="lg:hidden mt-8">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    {features.map((feature, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center mx-auto">
                                                <feature.icon className="h-5 w-5 text-amber-400" />
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {feature.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Terms */}
                            <p className="text-center text-xs text-slate-500 mt-4">
                                En vous inscrivant, vous acceptez nos{' '}
                                <a href="#" className="text-amber-400 hover:underline">
                                    Conditions d'utilisation
                                </a>{' '}
                                et notre{' '}
                                <a href="#" className="text-amber-400 hover:underline">
                                    Politique de confidentialité
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

