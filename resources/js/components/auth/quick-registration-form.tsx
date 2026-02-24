import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, User, Mail, Phone, Lock, ArrowRight, RefreshCw } from 'lucide-react';

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

        if (!formData.fullName.trim()) {
            setError('Veuillez entrer votre nom complet');
            return;
        }

        if (!formData.email.trim()) {
            setError('Veuillez entrer votre adresse email');
            return;
        }

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

        router.post('/client/register', {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            password_confirmation: formData.passwordConfirmation,
        }, {
            onSuccess: () => {
                sessionStorage.removeItem('pending_demande');
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
        <Card className="w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold text-gray-900">
                    Créer un compte GoAssist
                </CardTitle>
                <CardDescription className="text-gray-500">
                    Inscription Client rapide
                </CardDescription>
            </CardHeader>
            
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Nom complet */}
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-gray-700">
                            Nom complet *
                        </Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Jean Dupont"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">
                            Adresse email *
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="jean@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Téléphone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-700">
                            Numéro de téléphone *
                        </Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+229 XX XX XX XX"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700">
                            Mot de passe *
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirmation" className="text-gray-700">
                            Confirmer le mot de passe *
                        </Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                id="passwordConfirmation"
                                type="password"
                                placeholder="••••••••"
                                value={formData.passwordConfirmation}
                                onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                                className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Bouton soumettre */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-6"
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

                    {/* Séparateur */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">ou</span>
                        </div>
                    </div>

                    {/* Bouton Google */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.location.href = '/auth/google'}
                        className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-5"
                    >
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        S'inscrire avec Google
                    </Button>

                    {/* Lien vers connexion */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Déjà un compte ?{' '}
                        <button
                            type="button"
                            onClick={onLoginClick}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                        >
                            Se connecter
                        </button>
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}

