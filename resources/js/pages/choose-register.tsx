import { Head } from '@inertiajs/react';
import { Car, Wrench, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ChooseRegister() {
    const features = [
        { text: 'Inscription Client rapide' },
        { text: 'Aucun engagement' },
        { text: 'Service disponible 24/7' },
        { text: 'Paiement sécurisé' },
    ];

    const proFeatures = [
        { text: 'Revenus garantis' },
        { text: 'Clients qualifiés' },
        { text: 'Outils professionnels' },
        { text: 'Support dédié' },
    ];

    return (
        <>
            <Head title="S'inscrire - GoAssist" />
            
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="container mx-auto max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-6">
                            <Car className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Rejoignez GoAssist
                        </h1>
                        <p className="text-lg text-gray-600">
                            Choisissez le type de compte qui vous convient
                        </p>
                    </div>

                    {/* Two Cards */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Card 1: Client */}
                        <Card className="bg-white border-gray-200 hover:border-amber-400 transition-all duration-300 hover:-translate-y-1 shadow-md">
                            <CardContent className="p-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                                    <Car className="h-7 w-7 text-white" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    Créer un compte client
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Accédez à nos services de dépannage rapide et professionnel.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => window.location.href = '/register'}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-3 text-lg font-semibold"
                                >
                                    Créer un compte client
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Card 2: Dépanneur */}
                        <Card className="bg-white border-gray-200 hover:border-blue-400 transition-all duration-300 hover:-translate-y-1 shadow-md">
                            <CardContent className="p-8">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                                    <Wrench className="h-7 w-7 text-white" />
                                </div>
                                
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    Créer un compte dépanneur
                                </h2>
                                <p className="text-gray-600 mb-6">
                                    Rejoignez notre réseau de professionnels et développez votre activité.
                                </p>

                                <ul className="space-y-3 mb-8">
                                    {proFeatures.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-gray-700">
                                            <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                            <span>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    onClick={() => window.location.href = '/register/depanneur'}
                                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-3 text-lg font-semibold"
                                >
                                    Créer un compte dépanneur
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    
                </div>
            </div>
        </>
    );
}

