import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { QuickRegistrationForm } from '@/components/auth/quick-registration-form';
import { Card, CardContent } from '@/components/ui/card';
import { Car, MapPin, Shield } from 'lucide-react';

export default function RegisterPage() {
    const [mounted, setMounted] = useState<boolean>(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSuccess = () => {
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

    const whyChoose = [
        'Inscription en 30 secondes',
        'Aucun engagement',
        'Service disponible immédiatement',
        'Notation des dépanneurs',
    ];

    return (
        <AppHeaderLayout>
            <Head title="Inscription - GoAssist" />
            
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Left: Features - 2 columns parallel, vertical */}
                        <div className="hidden lg:block">
                            <div className="mb-6">
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                    GoAssist
                                </h1>
                                <p className="text-lg text-gray-600">
                                    Votre service de dépannage automobile de confiance
                                </p>
                            </div>
                            
                            {/* 2 columns parallel - First row */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Card 1 */}
                                <Card className="bg-white border-gray-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                <Car className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {features[0].title}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {features[0].description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Card 2 */}
                                <Card className="bg-white border-gray-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <MapPin className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {features[1].title}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {features[1].description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* 2 columns parallel - Second row */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {/* Card 3 */}
                                <Card className="bg-white border-gray-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <Shield className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-sm">
                                                    {features[2].title}
                                                </h3>
                                                <p className="text-xs text-gray-500">
                                                    {features[2].description}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Card 4 - Why Choose */}
                                <Card className="bg-white border-gray-200 shadow-sm">
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-2">
                                            Pourquoi choisir GoAssist ?
                                        </h3>
                                        <ul className="space-y-1">
                                            {whyChoose.slice(0, 2).map((item, index) => (
                                                <li key={index} className="flex items-center gap-1 text-xs text-gray-600">
                                                    <span className="text-amber-500">✓</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Remaining Why Choose items */}
                            <Card className="bg-white border-gray-200 shadow-sm">
                                <CardContent className="p-4">
                                    <ul className="space-y-1">
                                        {whyChoose.slice(2).map((item, index) => (
                                            <li key={index} className="flex items-center gap-1 text-xs text-gray-600">
                                                <span className="text-amber-500">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
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
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mx-auto">
                                                <feature.icon className="h-5 w-5 text-amber-600" />
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                {feature.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

