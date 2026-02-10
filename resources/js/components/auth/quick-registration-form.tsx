import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, User, Mail, Phone, Lock, ArrowRight, CheckCircle, RefreshCw, Truck } from 'lucide-react';

interface QuickRegistrationFormProps {
    onSuccess: () => void;
    onLoginClick?: () => void;
}

interface QuickFormData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
}

export function QuickRegistrationForm({ onSuccess, onLoginClick }: QuickRegistrationFormProps) {
    const [formData, setFormData] = useState<QuickFormData>({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        passwordConfirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.fullName.trim()) {
            setError('Veuillez entrer votre nom complet');
            return;
        }

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

        if (!formData.phone.trim()) {
            setError('Veuillez entrer votre numéro de téléphone');
            return;
        }

        if (!formData.password) {
            setError('Veuillez entrer un mot de passe');
            return;
        }

        if (formData.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        if (formData.password !== formData.passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);

        // Utiliser router.post d'Inertia pour préserver la session
        router.post('/api/client/register', {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
        }, {
            onSuccess: () => {
                // Nettoyer le pending_demande de sessionStorage
                sessionStorage.removeItem('pending_demande');
                // Appeler onSuccess qui redirigera vers nouvelle-demande
                onSuccess();
            },
            onError: (errors) => {
                setLoading(false);
                if (errors.email) {
                    setError(errors.email);
                } else if (errors.password) {
                    setError(errors.password);
                } else if (errors.general) {
                    setError(errors.general);
                } else {
                    setError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
                }
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                    Créer un compte GoAssist
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Inscription rapide en 30 secondes
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

                    {/* Nom complet */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-slate-300">
                            Nom complet *
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Jean Dupont"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
                            />
                        </div>
                    </div>

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
                            />
                        </div>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-300">
                            Numéro de téléphone *
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+229 XX XX XX XX"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
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
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirmation" className="text-slate-300">
                            Confirmer le mot de passe *
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                id="passwordConfirmation"
                                type="password"
                                placeholder="••••••••"
                                value={formData.passwordConfirmation}
                                onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
                            />
                        </div>
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
                                Inscription en cours...
                            </>
                        ) : (
                            <>
                                Créer mon compte
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                        )}
                    </Button>

                    {/* Lien vers connexion */}
                    <p className="text-center text-sm text-slate-400 mt-4">
                        Déjà un compte ?{' '}
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="text-amber-400 hover:text-amber-300 font-medium"
                        >
                            Se connecter
                        </button>
                    </p>

                    {/* Lien vers inscription dépanneur */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-800/50 text-slate-400">OU</span>
                        </div>
                    </div>

                    <a
                        href="/register/depanneur"
                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-medium rounded-lg transition-all"
                    >
                        <Truck className="h-5 w-5" />
                        Devenir dépanneur partenaire
                    </a>

                    <p className="text-center text-xs text-slate-400 mt-3">
                        Rejoignez notre réseau de dépanneurs professionnels
                    </p>

                    {/* Conditions */}
                    <p className="text-center text-xs text-slate-500 mt-4">
                        En vous inscrivant, vous acceptez nos{' '}
                        <a href="#" className="text-amber-400 hover:underline">
                            Conditions d'utilisation
                        </a>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}

