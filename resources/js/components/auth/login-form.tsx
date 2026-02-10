import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, ArrowRight, RefreshCw, Eye, EyeOff, Car, Phone, MapPin, Shield } from 'lucide-react';
import type { SharedData } from '@/types';

interface LoginFormProps {
    onSuccess?: () => void;
    onRegisterClick?: () => void;
}

interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
    const { ziggy } = usePage().props;
    const { auth } = usePage<SharedData>().props;
    const [formData, setFormData] = useState<LoginFormData>({
        email: '',
        password: '',
        remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Wait for mount before checking auth (client-side only)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Redirect if already logged in (client-side only)
    useEffect(() => {
        if (!mounted) return;
        
        if (auth?.user) {
            // User is already logged in, redirect to appropriate dashboard
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.href = '/client/dashboard';
            }
        }
    }, [auth, mounted, onSuccess]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.email.trim()) {
            setError('Veuillez entrer votre adresse email');
            return;
        }

        // Validation email simple
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        if (!formData.password) {
            setError('Veuillez entrer votre mot de passe');
            return;
        }

        setLoading(true);

        // Utiliser router.post d'Inertia pour préserver la session
        router.post('/login', {
            email: formData.email,
            password: formData.password,
            remember: formData.remember,
        }, {
            onSuccess: () => {
                // Success handler - Inertia will handle the redirect
                if (onSuccess) {
                    onSuccess();
                }
            },
            onError: (errors) => {
                setLoading(false);
                if (errors.email) {
                    setError(errors.email);
                } else if (errors.password) {
                    setError(errors.password);
                } else if (errors.root) {
                    setError(errors.root);
                } else {
                    setError('Les identifiants sont incorrects. Veuillez réessayer.');
                }
            },
            onFinish: () => {
                setLoading(false);
            },
        });
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
        <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Branding & Features */}
            <div className="hidden lg:block space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                            <Car size={28} />
                        </div>
                        <span className="font-black text-3xl tracking-tighter text-white">
                            AutoAssist<span className="text-amber-500">.</span>
                        </span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Content de vous revoir !
                    </h1>
                    <p className="text-xl text-slate-400">
                        Connectez-vous pour accéder à votre compte et obtenir de l'aide rapidement
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
                        Pourquoi choisir AutoAssist ?
                    </h3>
                    <ul className="space-y-3 text-slate-400">
                        <li className="flex items-center gap-2">
                            <span className="text-amber-400">✓</span>
                            Intervention en moins de 30 minutes
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-400">✓</span>
                            Prix transparents et connus à l'avance
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-400">✓</span>
                            Suivi en temps réel de votre dépanneur
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-amber-400">✓</span>
                            Notation des dépanneurs
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="lg:pl-8">
                <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-slate-700">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-white">
                            Connexion à AutoAssist
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                            Entrez vos identifiants pour accéder à votre compte
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">
                                    Adresse email *
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jean@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Mot de passe */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-slate-300">
                                    Mot de passe *
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="pl-10 pr-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Remember me & Forgot password */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.remember}
                                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-800"
                                    />
                                    <span className="text-sm text-slate-400">Se souvenir de moi</span>
                                </label>
                                <a 
                                    href="/forgot-password" 
                                    className="text-sm text-amber-400 hover:text-amber-300"
                                >
                                    Mot de passe oublié ?
                                </a>
                            </div>

                            {/* Bouton soumettre */}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium py-6"
                            >
                                {loading ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Connexion en cours...
                                    </>
                                ) : (
                                    <>
                                        Se connecter
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </>
                                )}
                            </Button>

                            {/* Lien vers inscription */}
                            <p className="text-center text-sm text-slate-400 mt-4">
                                Pas encore de compte ?{' '}
                                <button
                                    type="button"
                                    onClick={onRegisterClick}
                                    className="text-amber-400 hover:text-amber-300 font-medium"
                                >
                                    Créer un compte
                                </button>
                            </p>

                            {/* Conditions */}
                            <p className="text-center text-xs text-slate-500 mt-4">
                                En vous connectant, vous acceptez nos{' '}
                                <a href="#" className="text-amber-400 hover:underline">
                                    Conditions d'utilisation
                                </a>
                            </p>
                        </form>
                    </CardContent>
                </Card>

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
            </div>
        </div>
    );
}

