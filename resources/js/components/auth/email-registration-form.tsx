import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Mail, Lock, User, Phone, ArrowRight, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import type { RegistrationFormData } from '@/types/registration';

interface EmailRegistrationFormProps {
    onSuccess?: () => void;
    onLoginClick?: () => void;
}

export function EmailRegistrationForm({ onSuccess, onLoginClick }: EmailRegistrationFormProps) {
    const [step, setStep] = useState<'email' | 'verify' | 'complete'>('email');
    const [formData, setFormData] = useState<RegistrationFormData>({
        step: 'email',
        email: '',
        otp: '',
        fullName: '',
        phone: '',
        password: '',
        passwordConfirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [otpSent, setOtpSent] = useState(false);
    const [otpExpiresAt, setOtpExpiresAt] = useState<Date | null>(null);

    // Timer pour l'expiration OTP
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    const handleSendOtp = async () => {
        if (!formData.email) {
            setError('Veuillez entrer votre adresse email');
            return;
        }

        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulation d'envoi OTP (à remplacer par API réel)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dans un vrai projet, cela ferait un appel API:
            // const response = await fetch('/api/auth/send-otp', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: formData.email }),
            // });

            setOtpSent(true);
            setOtpExpiresAt(new Date(Date.now() + 5 * 60 * 1000)); // 5 minutes
            setTimeLeft(300);
            setStep('verify');
        } catch (err) {
            setError('Erreur lors de l\'envoi du code. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (formData.otp.length !== 6) {
            setError('Le code doit contenir 6 chiffres');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulation de vérification OTP
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Dans un vrai projet:
            // const response = await fetch('/api/auth/verify-otp', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ email: formData.email, otp: formData.otp }),
            // });

            setStep('complete');
        } catch (err) {
            setError('Code incorrect. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteRegistration = async () => {
        if (!formData.fullName || !formData.phone || !formData.password) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (formData.password !== formData.passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulation de création de compte
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Dans un vrai projet:
            // const response = await fetch('/api/auth/register', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         email: formData.email,
            //         fullName: formData.fullName,
            //         phone: formData.phone,
            //         password: formData.password,
            //         otp: formData.otp,
            //     }),
            // });

            onSuccess?.();
        } catch (err) {
            setError('Erreur lors de la création du compte. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOtpExpiresAt(new Date(Date.now() + 5 * 60 * 1000));
        setTimeLeft(300);
        setFormData({ ...formData, otp: '' });
        setLoading(false);
    };

    const formatTimeLeft = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer effect
    useEffect(() => {
        if (step === 'verify' && timeLeft > 0) {
            const interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [step, timeLeft]);

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            {['email', 'verify', 'complete'].map((s, index) => (
                <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === s
                            ? 'bg-amber-500 text-white'
                            : (['email', 'verify', 'complete'].indexOf(step) > index)
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-400'
                    }`}>
                        {['email', 'verify', 'complete'].indexOf(step) > index ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            index + 1
                        )}
                    </div>
                    {index < 2 && (
                        <div className={`w-16 h-1 mx-2 ${
                            ['email', 'verify', 'complete'].indexOf(step) > index
                                ? 'bg-green-500'
                                : 'bg-slate-700'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <Card className="w-full max-w-md mx-auto bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white">
                    Créer un compte
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Inscrivez-vous avec votre email
                </CardDescription>
                {renderStepIndicator()}
            </CardHeader>
            
            <CardContent>
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* ÉTAPE 1: Email */}
                {step === 'email' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-300">
                                Adresse email *
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="votre@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-6"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    Suivant
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>

                        <p className="text-center text-sm text-slate-400">
                            Déjà un compte ?{' '}
                            <button
                                onClick={onLoginClick}
                                className="text-amber-400 hover:text-amber-300 font-medium"
                            >
                                Se connecter
                            </button>
                        </p>
                    </div>
                )}

                {/* ÉTAPE 2: Vérification OTP */}
                {step === 'verify' && (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <Mail className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                            <p className="text-slate-300">
                                Nous avons envoyé un code de vérification à
                            </p>
                            <p className="text-white font-medium">{formData.email}</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-slate-300">
                                Code de vérification *
                            </Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="000000"
                                value={formData.otp}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    otp: e.target.value.replace(/\D/g, '').slice(0, 6) 
                                })}
                                className="text-center text-2xl tracking-[0.5em] font-mono bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                                maxLength={6}
                            />
                        </div>

                        <div className="text-center text-sm">
                            {timeLeft > 0 ? (
                                <p className="text-slate-400">
                                    Code expire dans <span className="text-amber-400 font-mono">{formatTimeLeft(timeLeft)}</span>
                                </p>
                            ) : (
                                <p className="text-red-400">Code expiré</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep('email')}
                                className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Retour
                            </Button>
                            <Button
                                onClick={handleVerifyOtp}
                                disabled={loading || timeLeft === 0}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                {loading ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    'Vérifier'
                                )}
                            </Button>
                        </div>

                        {timeLeft === 0 && (
                            <Button
                                variant="link"
                                onClick={handleResendOtp}
                                disabled={loading}
                                className="w-full text-amber-400 hover:text-amber-300"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Renvoyer le code
                            </Button>
                        )}
                    </div>
                )}

                {/* ÉTAPE 3: Compléter le profil */}
                {step === 'complete' && (
                    <div className="space-y-4">
                        <div className="text-center mb-4">
                            <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                            <p className="text-slate-300">
                                Email vérifié !
                            </p>
                            <p className="text-white font-medium">Complétez votre profil</p>
                        </div>

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
                                />
                            </div>
                        </div>

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

                        <Button
                            onClick={handleCompleteRegistration}
                            disabled={loading}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-6"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                    Création...
                                </>
                            ) : (
                                <>
                                    Créer mon compte
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

