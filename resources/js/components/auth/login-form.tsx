import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, ArrowRight, RefreshCw, Eye, EyeOff } from 'lucide-react';
import type { SharedData } from '@/types';

interface LoginFormProps {
    onSuccess?: (user?: any) => void;
}

interface LoginFormData {
    login: string;
    password: string;
    remember: boolean;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const { auth } = usePage<SharedData>().props;
    const [formData, setFormData] = useState<LoginFormData>({
        login: '',
        password: '',
        remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [inputType, setInputType] = useState<'email' | 'phone'>('email');
    const [attemptCount, setAttemptCount] = useState(0);

    useEffect(() => {
        setMounted(true);
        const sessionExpired = sessionStorage.getItem('session_expired');
        const justLoggedOut = sessionStorage.getItem('just_logged_out');
        
        if (sessionExpired) {
            sessionStorage.removeItem('session_expired');
            setError('Votre session a expiré. Veuillez vous reconnecter.');
        } else if (justLoggedOut) {
            sessionStorage.removeItem('just_logged_out');
        }
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (auth?.user) {
            let redirectUrl = '/demande/nouvelle';
            if (auth.user.id_type_compte) {
                switch (auth.user.id_type_compte) {
                    case 1: redirectUrl = '/admin/dashboard'; break;
                    case 2: redirectUrl = '/demande/nouvelle'; break;
                    case 3: redirectUrl = '/depanneur/dashboard'; break;
                }
            }
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.href = redirectUrl;
            }
        }
    }, [auth, mounted, onSuccess]);

    const handleLoginChange = (value: string) => {
        setFormData({ ...formData, login: value });
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phonePattern = /^(\+229|00229)?[0-9]{8,10}$/;
        const cleanValue = value.replace(/[\s\-\.]/g, '');
        
        if (emailRegex.test(value)) {
            setInputType('email');
        } else if (phonePattern.test(cleanValue) && value.length >= 8) {
            setInputType('phone');
        }
    };

    const getCsrfToken = () => {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.login.trim()) {
            setError('Veuillez entrer votre adresse email ou numéro de téléphone');
            return;
        }

        if (!formData.password) {
            setError('Veuillez entrer votre mot de passe');
            return;
        }

        if (attemptCount >= 5) {
            setError('Trop de tentatives échouées. Veuillez réessayer dans quelques minutes.');
            return;
        }

        setLoading(true);

        try {
            sessionStorage.removeItem('login_attempts');
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    login: formData.login,
                    password: formData.password,
                    remember: formData.remember,
                }),
                credentials: 'include',
            });

            setAttemptCount(0);
            sessionStorage.removeItem('login_attempts');

            if (response.ok) {
                const data = await response.json();
                sessionStorage.setItem('just_logged_in', 'true');
                
                if (onSuccess) {
                    onSuccess(data.user);
                } else {
                    const redirectUrl = data.redirect || data.url || getRedirectUrl(data.user);
                    window.location.href = redirectUrl;
                }
                return;
            }

            const errorData = await response.json().catch(() => ({}));
            const newAttemptCount = attemptCount + 1;
            setAttemptCount(newAttemptCount);
            sessionStorage.setItem('login_attempts', newAttemptCount.toString());

            let errorMessage = 'Les identifiants sont incorrects. Veuillez réessayer.';
            
            if (errorData.errors?.login) {
                errorMessage = errorData.errors.login;
            } else if (errorData.message) {
                errorMessage = errorData.message;
            } else if (response.status === 419) {
                errorMessage = 'Votre session a expiré. Veuillez rafraîchir la page et réessayer.';
            } else if (response.status === 500) {
                errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            }

            if (newAttemptCount >= 3) {
                const remainingAttempts = 5 - newAttemptCount;
                errorMessage = `${errorMessage} (${remainingAttempts} tentative${remainingAttempts > 1 ? 's' : ''} restante${remainingAttempts > 1 ? 's' : ''})`;
            }

            setError(errorMessage);

        } catch (err) {
            console.error('Login error:', err);
            setError('Erreur de connexion. Veuillez vérifier votre connexion internet et réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const getRedirectUrl = (user: any): string => {
        if (!user) return '/demande/nouvelle';
        switch (user.id_type_compte) {
            case 1: return '/admin/dashboard';
            case 2: return '/demande/nouvelle';
            case 3: return '/depanneur/dashboard';
            default: return '/demande/nouvelle';
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <Card className="w-full max-w-md bg-white border-gray-300 shadow-lg">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Connexion
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                        Entrez vos identifiants pour accéder à votre compte
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

                        <div className="space-y-2">
                            <Label htmlFor="login" className="text-gray-700">
                                Email ou téléphone
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="login"
                                    type="text"
                                    placeholder="Entrez votre email ou numéro de téléphone (+229 XX XX XX XX)"
                                    value={formData.login}
                                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                                    className="pl-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">
                                Mot de passe *
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="pl-10 pr-10 bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />
                                <span className="text-sm text-gray-600">Se souvenir de moi</span>
                            </label>
                            <a 
                                href="/forgot-password" 
                                className="text-sm text-amber-600 hover:text-amber-700"
                            >
                                Mot de passe oublié ?
                            </a>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-6"
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

                        <p className="text-center text-xs text-gray-500 mt-4">
                            En vous connectant, vous acceptez nos{' '}
                            <a href="#" className="text-amber-600 hover:underline">
                                Conditions d'utilisation
                            </a>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

