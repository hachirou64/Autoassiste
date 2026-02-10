import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Car, Mail, Phone, User, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface FormData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
}

interface Errors {
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    password_confirmation?: string;
    general?: string;
}

export default function ClientRegistrationForm() {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const [errors, setErrors] = useState<Errors>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Errors = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Le nom complet est requis';
        } else if (formData.fullName.length < 3) {
            newErrors.fullName = 'Le nom doit contenir au moins 3 caractères';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Veuillez entrer un email valide';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Le numéro de téléphone est requis';
        } else if (!/^[0-9+\s-]{8,}$/.test(formData.phone)) {
            newErrors.phone = 'Veuillez entrer un numéro de téléphone valide';
        }

        if (!formData.password) {
            newErrors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user types
        if (errors[name as keyof Errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});

        try {
            const response = await fetch('/api/client/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsSuccess(true);
            } else {
                setErrors({
                    general: data.message || 'Une erreur est survenue lors de l\'inscription',
                });
            }
        } catch (error) {
            setErrors({
                general: 'Impossible de se connecter au serveur. Veuillez réessayer.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
                <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                    <CardContent className="pt-8 pb-8 text-center">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Inscription réussie !</h2>
                        <p className="text-slate-300 mb-6">
                            Votre compte client a été créé avec succès. Vous pouvez maintenant vous connecter.
                        </p>
                        <Link href="/login">
                            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                                Se connecter
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
            <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-xl">
                <CardHeader className="space-y-1">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Car className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-center text-white">
                        Créer un compte client
                    </CardTitle>
                    <CardDescription className="text-center text-slate-400">
                        Inscrivez-vous pour bénéficier de nos services de dépannage
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {errors.general && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                                <p className="text-sm text-red-400">{errors.general}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-slate-300">
                                Nom complet
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className={`pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                                        errors.fullName ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                />
                            </div>
                            {errors.fullName && (
                                <p className="text-sm text-red-400">{errors.fullName}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                                        errors.email ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-sm text-red-400">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-slate-300">
                                Téléphone
                            </Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="+229 90 00 00 00"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                                        errors.phone ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-sm text-red-400">{errors.phone}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-300">
                                Mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                                        errors.password ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
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
                            {errors.password && (
                                <p className="text-sm text-red-400">{errors.password}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-slate-300">
                                Confirmer le mot de passe
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type={showPasswordConfirm ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className={`pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 ${
                                        errors.password_confirmation ? 'border-red-500 focus:border-red-500' : ''
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPasswordConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password_confirmation && (
                                <p className="text-sm text-red-400">{errors.password_confirmation}</p>
                            )}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <Button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Inscription en cours...
                                </span>
                            ) : (
                                'Créer mon compte'
                            )}
                        </Button>

                        <p className="text-sm text-slate-400 text-center">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="text-blue-400 hover:text-blue-300">
                                Se connecter
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

