import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Mail, Phone, MapPin, Navigation, CheckCircle, Building, Truck, Wallet, Clock, Lock, User } from 'lucide-react';
import { 
    SERVICES_DISPONIBLES, 
    ZONES_INTERVENTION, 
    JOURS_SEMAINE, 
    PAYMENT_METHODS,
    type VehicleTypeDepanneur,
    type PaymentMethod,
    type AvailabilityType,
    type DepanneurRegistrationData 
} from '@/types/depanneur-registration';

interface DepanneurRegistrationFormProps {
    onSuccess?: () => void;
}

export function DepanneurRegistrationForm({ onSuccess }: DepanneurRegistrationFormProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<DepanneurRegistrationData>({
        fullName: '',
        email: '',
        phone: '',
        promoteur_name: '',
        etablissement_name: '',
        IFU: '',
        adresse: '',
        localisation_actuelle: '',
        type_vehicule: 'voiture' as VehicleTypeDepanneur,
        services: [],
        methode_payement: [],
        numero_mobile_money: '',
        disponibilite: '08h_20h',
        jours_travail: [],
        password: '',
        passwordConfirmation: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    // Étape 1: Informations personnelles
    const handlePersonalInfoSubmit = () => {
        if (!formData.fullName || !formData.email || !formData.phone) {
            setError('Veuillez remplir tous les champs obligatoires');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Veuillez entrer une adresse email valide');
            return;
        }
        setError(null);
        setStep(2);
    };

    // Géolocalisation
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError('GPS non disponible sur cet appareil');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData({
                    ...formData,
                    latitude,
                    longitude,
                    localisation_actuelle: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                });
                setLocationLoading(false);
            },
            () => {
                setError('Impossible d\'obtenir votre position');
                setLocationLoading(false);
            }
        );
    };

    // Toggle service
    const toggleService = (serviceId: string) => {
        const currentServices = formData.services;
        if (currentServices.includes(serviceId)) {
            setFormData({ ...formData, services: currentServices.filter(s => s !== serviceId) });
        } else {
            setFormData({ ...formData, services: [...currentServices, serviceId] });
        }
    };

    // Toggle jour de travail
    const toggleJour = (jourId: string) => {
        const currentJours = formData.jours_travail;
        if (currentJours.includes(jourId)) {
            setFormData({ ...formData, jours_travail: currentJours.filter(j => j !== jourId) });
        } else {
            setFormData({ ...formData, jours_travail: [...currentJours, jourId] });
        }
    };

    // Toggle méthode de paiement
    const togglePayment = (methodId: string) => {
        const currentMethods = formData.methode_payement;
        if (currentMethods.includes(methodId as PaymentMethod)) {
            setFormData({ ...formData, methode_payement: currentMethods.filter(m => m !== methodId) as PaymentMethod[] });
        } else {
            setFormData({ ...formData, methode_payement: [...currentMethods, methodId] as PaymentMethod[] });
        }
    };

    // Soumission finale avec fetch pour éviter les erreurs DOM avec Inertia
    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        // Validation des champs requis
        if (!formData.password || !formData.passwordConfirmation) {
            setError('Veuillez entrer et confirmer votre mot de passe');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.passwordConfirmation) {
            setError('Les mots de passe ne correspondent pas');
            setLoading(false);
            return;
        }

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            console.log('CSRF Token:', csrfToken ? 'Present' : 'Missing');
            
            const response = await fetch('/depanneur/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                credentials: 'include',
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    promoteur_name: formData.promoteur_name,
                    etablissement_name: formData.etablissement_name,
                    IFU: formData.IFU,
                    adresse: formData.adresse,
                    localisation_actuelle: formData.localisation_actuelle,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    type_vehicule: formData.type_vehicule,
                    services: formData.services,
                    methode_payement: formData.methode_payement,
                    disponibilite: formData.disponibilite,
                    jours_travail: formData.jours_travail,
                    password: formData.password,
                    password_confirmation: formData.passwordConfirmation,
                }),
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            const data = await response.json();
            console.log('Response data:', data);

            if (!response.ok) {
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0];
                    setError(Array.isArray(firstError) ? firstError[0] : firstError);
                } else if (data.message) {
                    setError(data.message);
                } else {
                    setError('Erreur lors de l\'inscription. Veuillez réessayer.');
                }
                setLoading(false);
                return;
            }

            // Appeler le callback onSuccess si défini
            if (onSuccess) {
                onSuccess();
            } else {
                // Redirection vers le dashboard dépanneur par défaut
                window.location.href = '/depanneur/dashboard';
            }

        } catch (err) {
            console.error('Erreur complète:', err);
            setError('Erreur réseau. Veuillez vérifier votre connexion et réessayer.');
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6">
            {[1, 2, 3, 4, 5].map((s, index) => (
                <div key={s} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step === s
                            ? 'bg-amber-500 text-white'
                            : step > s
                                ? 'bg-green-500 text-white'
                                : 'bg-slate-700 text-slate-400'
                    }`}>
                        {step > s ? (
                            <CheckCircle className="h-5 w-5" />
                        ) : (
                            index + 1
                        )}
                    </div>
                    {index < 4 && (
                        <div className={`w-16 h-1 mx-2 ${
                            step > s ? 'bg-green-500' : 'bg-slate-700'
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );

    const stepLabels = [
        'Personnel',
        'Établissement',
        'Services',
        'Paiement',
        'Mot de passe'
    ];

    return (
        <Card className="w-full max-w-4xl mx-auto bg-slate-800/50 border-slate-700">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-3">
                    <Truck className="h-8 w-8 text-amber-500" />
                    Inscription Dépanneur
                </CardTitle>
                <p className="text-slate-400">
                    Rejoignez notre réseau de professionnels
                </p>
                {renderStepIndicator()}
                <div className="flex justify-center gap-2 flex-wrap">
                    {stepLabels.map((label, index) => (
                        <Badge 
                            key={index} 
                            variant={step === index + 1 ? 'default' : step > index + 1 ? 'default' : 'outline'}
                            className={step === index + 1 ? 'bg-amber-500' : step > index + 1 ? 'bg-green-500' : ''}
                        >
                            {label}
                        </Badge>
                    ))}
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* ÉTAPE 1: Informations personnelles */}
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Nom complet *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Votre nom complet"
                                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Email *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="votre@email.com"
                                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-300">Téléphone *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+229 XX XX XX XX"
                                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handlePersonalInfoSubmit}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-6"
                        >
                            Suivant
                        </Button>
                    </div>
                )}

                {/* ÉTAPE 2: Établissement */}
                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Nom du promoteur/responsable *</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={formData.promoteur_name}
                                        onChange={(e) => setFormData({ ...formData, promoteur_name: e.target.value })}
                                        placeholder="Nom du promoteur"
                                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Nom du garage/établissement *</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        value={formData.etablissement_name}
                                        onChange={(e) => setFormData({ ...formData, etablissement_name: e.target.value })}
                                        placeholder="Nom de l'établissement"
                                        className="pl-10 bg-slate-700 border-slate-600 text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">IFU *</Label>
                                <Input
                                    value={formData.IFU}
                                    onChange={(e) => setFormData({ ...formData, IFU: e.target.value })}
                                    placeholder="Numéro IFU"
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-300">Adresse du garage *</Label>
                                <Input
                                    value={formData.adresse}
                                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                                    placeholder="Adresse complète"
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label className="text-slate-300">Position GPS actuelle *</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={formData.localisation_actuelle}
                                        onChange={(e) => setFormData({ ...formData, localisation_actuelle: e.target.value })}
                                        placeholder="Cliquez sur 'Utiliser ma position'"
                                        className="flex-1 bg-slate-700 border-slate-600 text-white"
                                        readOnly
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleGetLocation}
                                        disabled={locationLoading}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    >
                                        <Navigation className={`h-4 w-4 ${locationLoading ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Type de véhicules */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Type de véhicules que vous dépannez *</Label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { value: 'voiture', label: 'Voiture', icon: '🚗' },
                                    { value: 'moto', label: 'Moto', icon: '🏍️' },
                                    { value: 'les_deux', label: 'Tous', icon: '🚗' },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type_vehicule: type.value as VehicleTypeDepanneur })}
                                        className={`p-4 rounded-lg border-2 transition-all ${
                                            formData.type_vehicule === type.value
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <span className="text-2xl block mb-1">{type.icon}</span>
                                        <span className="text-sm font-medium">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="flex-1 bg-slate-700 border-slate-600 text-white"
                            >
                                Retour
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 3: Services */}
                {step === 3 && (
                    <div className="space-y-4">
                        <Label className="text-slate-300 text-lg">Services proposés *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SERVICES_DISPONIBLES.map((service) => (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => toggleService(service.id)}
                                    className={`p-3 rounded-lg border transition-all text-left ${
                                        formData.services.includes(service.id)
                                            ? 'border-amber-500 bg-amber-500/10 text-white'
                                            : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                    }`}
                                >
                                    <span className="text-xl mr-2">{service.icon}</span>
                                    <span className="text-sm">{service.label}</span>
                                    {formData.services.includes(service.id) && (
                                        <CheckCircle className="h-4 w-4 text-amber-500 float-right" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(2)}
                                className="flex-1 bg-slate-700 border-slate-600 text-white"
                            >
                                Retour
                            </Button>
                            <Button
                                onClick={() => setStep(4)}
                                disabled={formData.services.length === 0}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 4: Paiement */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300 text-lg">Méthodes de paiement acceptées *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => togglePayment(method.id)}
                                        className={`p-3 rounded-lg border transition-all ${
                                            formData.methode_payement.includes(method.id as PaymentMethod)
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <span className="text-xl mr-2">{method.icon}</span>
                                        <span className="text-sm">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.methode_payement.includes('mobile_money') && (
                            <div className="space-y-2">
                                <Label className="text-slate-300">Numéro Mobile Money</Label>
                                <Input
                                    value={formData.numero_mobile_money}
                                    onChange={(e) => setFormData({ ...formData, numero_mobile_money: e.target.value })}
                                    placeholder="+229 XX XX XX XX"
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-lg">Disponibilité *</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {[
                                    { id: '24h', label: '24h/24', icon: '⏰' },
                                    { id: '08h_20h', label: '08h-20h', icon: '🌅' },
                                    { id: '08h_18h', label: '08h-18h', icon: '☀️' },
                                    { id: 'personnalise', label: 'Personnalisé', icon: '📅' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, disponibilite: item.id as AvailabilityType })}
                                        className={`p-3 rounded-lg border transition-all ${
                                            formData.disponibilite === item.id
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <span className="text-xl mr-2">{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.disponibilite === 'personnalise' && (
                            <div className="space-y-2">
                                <Label className="text-slate-300">Horaires personnalisés</Label>
                                <Input
                                    value={formData.horaires_personnalises}
                                    onChange={(e) => setFormData({ ...formData, horaires_personnalises: e.target.value })}
                                    placeholder="Ex: Lun-Ven: 9h-18h, Sam: 9h-13h"
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-slate-300 text-lg">Jours de travail *</Label>
                            <div className="flex gap-2 flex-wrap">
                                {JOURS_SEMAINE.map((jour) => (
                                    <button
                                        key={jour.id}
                                        type="button"
                                        onClick={() => toggleJour(jour.id)}
                                        className={`w-10 h-10 rounded-lg border transition-all ${
                                            formData.jours_travail.includes(jour.id)
                                                ? 'border-amber-500 bg-amber-500/10 text-white'
                                                : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                        }`}
                                    >
                                        <span className="text-sm font-medium">{jour.abbrev}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(3)}
                                className="flex-1 bg-slate-700 border-slate-600 text-white"
                            >
                                Retour
                            </Button>
                            <Button
                                onClick={() => setStep(5)}
                                disabled={formData.jours_travail.length === 0 || formData.methode_payement.length === 0}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 5: Mot de passe */}
                {step === 5 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Mot de passe *</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Confirmer le mot de passe *</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="password"
                                    value={formData.passwordConfirmation}
                                    onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
                                    placeholder="••••••••"
                                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-900/50 rounded-lg">
                            <h4 className="text-sm font-medium text-slate-300 mb-2">Récapitulatif</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                <p>Établissement: <span className="text-white">{formData.etablissement_name}</span></p>
                                <p>Services: <span className="text-white">{formData.services.length}</span></p>
                                <p>Véhicules: <span className="text-white capitalize">{formData.type_vehicule}</span></p>
                                <p>Jours: <span className="text-white">{formData.jours_travail.length}</span></p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(4)}
                                className="flex-1 bg-slate-700 border-slate-600 text-white"
                            >
                                Retour
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-6"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Création...
                                    </>
                                ) : (
                                    'Créer mon compte dépanneur'
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Lien vers connexion */}
                <p className="text-center text-sm text-slate-400">
                    Déjà un compte dépanneur ?{' '}
                    <a
                        href="/login"
                        className="text-amber-400 hover:text-amber-300 font-medium"
                    >
                        Se connecter
                    </a>
                </p>
            </CardContent>
        </Card>
    );
}

