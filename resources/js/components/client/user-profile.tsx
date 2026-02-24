import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    User, Mail, Phone, CreditCard, Bell,
    Camera, Save, Edit2, Lock,
    Star, Award
} from 'lucide-react';
import type { UserProfile } from '@/types/client';

interface UserProfileProps {
    profile: UserProfile;
    stats?: {
        total_demandes: number;
        demandes_terminees: number;
        montant_total_depense: number;
        membre_depuis: string;
    };
    onSaveProfile?: (data: Partial<UserProfile>) => void;
    onChangePassword?: () => void;
}

type PaymentMethod = 'cash' | 'mobile_money' | 'carte_bancaire';

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Espèces' },
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'carte_bancaire', label: 'Carte Bancaire' },
];

export function UserProfile({
    profile,
    stats,
    onSaveProfile,
    onChangePassword,
}: UserProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Préférences locales avec types non nullables
    const [localPrefs, setLocalPrefs] = useState({
        methode_payement_preferee: profile.preferences?.methode_payement_preferee || 'cash' as PaymentMethod,
        notifications_sms: profile.preferences?.notifications_sms ?? true,
        notifications_email: profile.preferences?.notifications_email ?? true,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        onSaveProfile?.({
            ...editedProfile,
            preferences: localPrefs,
        });
        setIsEditing(false);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'janvier 2024';
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric',
        });
    };

    const handlePreferenceChange = (key: 'methode_payement_preferee' | 'notifications_sms' | 'notifications_email', value: string | boolean) => {
        setLocalPrefs(prev => ({ ...prev, [key]: value }));
        // Update editedProfile with proper typing
        if (key === 'methode_payement_preferee') {
            setEditedProfile(prev => ({
                ...prev,
                preferences: {
                    methode_payement_preferee: value as PaymentMethod,
                    notifications_sms: localPrefs.notifications_sms,
                    notifications_email: localPrefs.notifications_email,
                },
            }));
        } else {
            setEditedProfile(prev => ({
                ...prev,
                preferences: {
                    methode_payement_preferee: localPrefs.methode_payement_preferee,
                    [key]: value as boolean,
                } as UserProfile['preferences'],
            }));
        }
    };

    return (
        <div className="space-y-6">
            {/* En-tête du profil */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Photo de profil */}
                        <div className="relative">
                            <div className="w-24 h-24 bg-slate-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-slate-600">
                                {photoPreview || profile.photo ? (
                                    <img
                                        src={photoPreview || profile.photo}
                                        alt="Photo de profil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-slate-400" />
                                )}
                            </div>
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                                    <Camera className="h-4 w-4 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Infos principales */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
                                    <p className="text-slate-400">Client GoAssist</p>
                                </div>
                                <Button
                                    variant={isEditing ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                    className={isEditing ? 'bg-blue-500 hover:bg-blue-600' : 'bg-slate-700 border-slate-600 text-white'}
                                >
                                    {isEditing ? (
                                        <>
                                            <Save className="h-4 w-4 mr-1" />
                                            Enregistrer
                                        </>
                                    ) : (
                                        <>
                                            <Edit2 className="h-4 w-4 mr-1" />
                                            Modifier
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    <Award className="h-3 w-3 mr-1" />
                                    Membre depuis {stats?.membre_depuis || formatDate(profile.createdAt || undefined)}
                                </Badge>
                                {stats && stats.demandes_terminees >= 10 && (
                                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                                        <Star className="h-3 w-3 mr-1" />
                                        Client fidèle
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Formulaire d'édition */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Informations personnelles */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-400" />
                            Informations personnelles
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Nom complet</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={editedProfile.fullName}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                                    disabled={!isEditing}
                                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    type="email"
                                    value={editedProfile.email}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                                    disabled={!isEditing}
                                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Téléphone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={editedProfile.phone}
                                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className="pl-10 bg-slate-700 border-slate-600 text-white"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Préférences */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-400" />
                            Préférences
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Mode de paiement préféré</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map((method) => {
                                    const isSelected = localPrefs.methode_payement_preferee === method.value;

                                    return (
                                        <button
                                            key={method.value}
                                            type="button"
                                            onClick={() => handlePreferenceChange('methode_payement_preferee', method.value)}
                                            disabled={!isEditing}
                                            className={`p-3 rounded-lg border transition-colors ${
                                                isSelected
                                                    ? 'bg-blue-500/20 border-blue-500 text-white'
                                                    : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                                            }`}
                                        >
                                            <span className="text-xs">{method.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-slate-400" />
                                    <Label className="text-slate-300">Notifications SMS</Label>
                                </div>
                                <Button
                                    variant={localPrefs.notifications_sms ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePreferenceChange('notifications_sms', !localPrefs.notifications_sms)}
                                    disabled={!isEditing}
                                    className={localPrefs.notifications_sms ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700 border-slate-600'}
                                >
                                    {localPrefs.notifications_sms ? 'Activé' : 'Désactivé'}
                                </Button>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-slate-400" />
                                    <Label className="text-slate-300">Notifications Email</Label>
                                </div>
                                <Button
                                    variant={localPrefs.notifications_email ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => handlePreferenceChange('notifications_email', !localPrefs.notifications_email)}
                                    disabled={!isEditing}
                                    className={localPrefs.notifications_email ? 'bg-green-500 hover:bg-green-600' : 'bg-slate-700 border-slate-600'}
                                >
                                    {localPrefs.notifications_email ? 'Activé' : 'Désactivé'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistiques */}
                {stats && (
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-400" />
                                Statistiques
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <p className="text-2xl font-bold text-white">{stats.total_demandes}</p>
                                    <p className="text-sm text-slate-400">Demandes</p>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <p className="text-2xl font-bold text-green-400">{stats.demandes_terminees}</p>
                                    <p className="text-sm text-slate-400">Terminées</p>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-lg">
                                    <p className="text-2xl font-bold text-blue-400">
                                        {(stats.montant_total_depense / 1000).toFixed(0)}k
                                    </p>
                                    <p className="text-sm text-slate-400">XOF dépensé</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sécurité */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Lock className="h-5 w-5 text-blue-400" />
                            Sécurité
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            onClick={onChangePassword}
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            Changer le mot de passe
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
