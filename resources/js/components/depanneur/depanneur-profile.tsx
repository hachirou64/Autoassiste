import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    User,
    Building,
    Phone,
    Mail,
    MapPin,
    Clock,
    Camera,
    Edit,
    Save,
    X,
    FileText,
    Settings,
    LogOut,
    Star,
    Calendar,
    Shield,
    Bell,
    Wallet,
    Globe,
    Plus,
    Trash2,
    ChevronRight
} from 'lucide-react';
import type { DepanneurProfile, ZoneIntervention, HorairesDisponibilite } from '@/types/depanneur';

// Données mockées
const mockProfile: DepanneurProfile = {
    id: 1,
    promoteur_name: 'Kouami Toto',
    etablissement_name: 'Garage du Centre',
    IFU: '123456789012345',
    email: 'contact@garagecentre.bj',
    phone: '+229 90 00 11 11',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kouami',
    status: 'disponible',
    isActive: true,
    createdAt: '2023-01-15',
    
    zones: [
        { id: 1, name: 'Cotonou Centre', city: 'Cotonou', priorite: 1, isActive: true },
        { id: 2, name: 'Cotonou Nord', city: 'Cotonou', priorite: 2, isActive: true },
        { id: 3, name: 'Calavi', city: 'Abomey-Calavi', priorite: 3, isActive: true },
        { id: 4, name: 'Porto-Novo', city: 'Porto-Novo', priorite: 4, isActive: false },
    ],
    
    horaires: [
        { jour: 'lundi', debut: '08:00', fin: '18:00', estActif: true },
        { jour: 'mardi', debut: '08:00', fin: '18:00', estActif: true },
        { jour: 'mercredi', debut: '08:00', fin: '18:00', estActif: true },
        { jour: 'jeudi', debut: '08:00', fin: '18:00', estActif: true },
        { jour: 'vendredi', debut: '08:00', fin: '18:00', estActif: true },
        { jour: 'samedi', debut: '09:00', fin: '14:00', estActif: true },
        { jour: 'dimanche', debut: '', fin: '', estActif: false },
    ],
    
    preferences: {
        notifications_sonores: true,
        notifications_sms: true,
        notifications_email: false,
        auto_accept: false,
        rayon_prefere: 10,
    },
    
    statistiques: {
        total_interventions: 156,
        note_moyenne: 4.7,
        depuis: 'janvier 2023',
    },
};

const JOURS_SEMAINE = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' },
];

interface DepanneurProfileProps {
    profile?: DepanneurProfile;
    onSaveProfile?: (data: Partial<DepanneurProfile>) => void;
    onSavePreferences?: (data: DepanneurProfile['preferences']) => void;
    onChangePassword?: () => void;
    onLogout?: () => void;
}

export function DepanneurProfile({
    profile = mockProfile,
    onSaveProfile,
    onSavePreferences,
    onChangePassword,
    onLogout,
}: DepanneurProfileProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState(profile);

    const handleSave = () => {
        onSaveProfile?.(editedProfile);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
            {/* Header avec avatar */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <Avatar className="w-24 h-24">
                                <AvatarImage src={profile.photo} alt={profile.etablissement_name} />
                                <AvatarFallback className="bg-blue-500/20 text-blue-400 text-2xl">
                                    {profile.etablissement_name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="outline"
                                size="icon"
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-slate-700 border-slate-600"
                            >
                                <Camera className="h-4 w-4 text-slate-300" />
                            </Button>
                        </div>
                        
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-white">
                                    {profile.etablissement_name}
                                </h2>
                                {/* Indicateur de statut de compte (activé/désactivé par admin) */}
                                <Badge className={profile.isActive 
                                    ? "bg-green-500/20 text-green-400 border-green-500/30" 
                                    : "bg-red-500/20 text-red-400 border-red-500/30"
                                }>
                                    {profile.isActive ? '✅ Activé' : '🚫 Désactivé'}
                                </Badge>
                            </div>
                            {!profile.isActive && (
                                <p className="text-sm text-red-400 mb-2">
                                    Votre compte est désactivé. Veuillez contacter l'administrateur.
                                </p>
                            )}
                            <p className="text-slate-400">
                                {profile.promoteur_name}
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                                {profile.statistiques && (
                                    <>
                                        <div className="flex items-center gap-1 text-amber-400">
                                            <Star className="h-5 w-5 fill-amber-400" />
                                            <span className="font-bold">{(profile.statistiques.note_moyenne ?? 0).toFixed(1)}</span>
                                            <span className="text-slate-400">({profile.statistiques.total_interventions} interventions)</span>
                                        </div>
                                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                            {profile.statistiques.depuis}
                                        </Badge>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button
                                variant={isEditing ? "outline" : "default"}
                                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                                className={isEditing ? "border-red-500/30 text-red-400" : ""}
                            >
                                {isEditing ? (
                                    <>
                                        <X className="h-4 w-4 mr-2" />
                                        Annuler
                                    </>
                                ) : (
                                    <>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Modifier
                                    </>
                                )}
                            </Button>
                            {isEditing && (
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Sauvegarder
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Informations de l'établissement */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Building className="h-5 w-5 text-blue-400" />
                            Informations de l'établissement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">
                                    Nom de l'établissement
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.etablissement_name}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile,
                                            etablissement_name: e.target.value
                                        })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                ) : (
                                    <p className="text-white">{profile.etablissement_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">
                                    Nom du responsable
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.promoteur_name}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile,
                                            promoteur_name: e.target.value
                                        })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                ) : (
                                    <p className="text-white">{profile.promoteur_name}</p>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm text-slate-400 mb-1 block">
                                IFU
                            </label>
                            {isEditing ? (
                                <Input
                                    value={editedProfile.IFU}
                                    onChange={(e) => setEditedProfile({
                                        ...editedProfile,
                                        IFU: e.target.value
                                    })}
                                    className="bg-slate-700 border-slate-600 text-white"
                                />
                            ) : (
                                <p className="text-white font-mono">{profile.IFU}</p>
                            )}
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">
                                    Email
                                </label>
                                {isEditing ? (
                                    <Input
                                        type="email"
                                        value={editedProfile.email}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile,
                                            email: e.target.value
                                        })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                ) : (
                                    <p className="text-white">{profile.email}</p>
                                )}
                            </div>
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">
                                    Téléphone
                                </label>
                                {isEditing ? (
                                    <Input
                                        value={editedProfile.phone}
                                        onChange={(e) => setEditedProfile({
                                            ...editedProfile,
                                            phone: e.target.value
                                        })}
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                ) : (
                                    <p className="text-white">{profile.phone}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Horaires de disponibilité */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-400" />
                            Horaires de disponibilité
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {JOURS_SEMAINE.map((jour) => {
                                const horaire = profile.horaires?.find(h => h.jour === jour.key);
                                return (
                                    <div 
                                        key={jour.key}
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                            horaire?.estActif ? 'bg-slate-700/30' : 'bg-slate-700/10 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-3 h-3 rounded-full ${
                                                horaire?.estActif ? 'bg-green-500' : 'bg-slate-500'
                                            }`} />
                                            <span className="text-white font-medium">{jour.label}</span>
                                        </div>
                                        <div className="text-right">
                                            {horaire?.estActif ? (
                                                <span className="text-slate-300">
                                                    {horaire.debut} - {horaire.fin}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">Fermé</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Zones d'intervention */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-white flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-400" />
                                Zones d'intervention
                            </CardTitle>
                            {profile.zones && profile.zones.length > 0 && (
                                <Badge variant="outline" className="bg-slate-700">
                                    {profile.zones.filter(z => z.isActive).length} active(s)
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {profile.zones && profile.zones.length > 0 ? (
                                profile.zones
                                .sort((a, b) => a.priorite - b.priorite)
                                .map((zone) => (
                                    <div 
                                        key={zone.id}
                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                            zone.isActive ? 'bg-slate-700/30' : 'bg-slate-700/10 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Badge className={
                                                zone.isActive 
                                                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                                                    : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                            }>
                                                #{zone.priorite}
                                            </Badge>
                                            <div>
                                                <p className="text-white font-medium">{zone.name}</p>
                                                <p className="text-sm text-slate-400">{zone.city}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`w-3 h-3 rounded-full ${
                                                zone.isActive ? 'bg-green-500' : 'bg-slate-500'
                                            }`} />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Préférences */}
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Settings className="h-5 w-5 text-purple-400" />
                            Préférences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-white">Notifications sonores</p>
                                        <p className="text-sm text-slate-400">Sons pour les nouvelles demandes</p>
                                    </div>
                                </div>
                                <Button
                                    variant={profile.preferences.notifications_sonores ? "default" : "outline"}
                                    size="sm"
                                    className={profile.preferences.notifications_sonores ? "bg-green-500" : ""}
                                >
                                    {profile.preferences.notifications_sonores ? 'Oui' : 'Non'}
                                </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-white">Notifications SMS</p>
                                        <p className="text-sm text-slate-400">Recevoir les alertes par SMS</p>
                                    </div>
                                </div>
                                <Button
                                    variant={profile.preferences.notifications_sms ? "default" : "outline"}
                                    size="sm"
                                    className={profile.preferences.notifications_sms ? "bg-green-500" : ""}
                                >
                                    {profile.preferences.notifications_sms ? 'Oui' : 'Non'}
                                </Button>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Globe className="h-5 w-5 text-slate-400" />
                                    <div>
                                        <p className="text-white">Rayon préféré</p>
                                        <p className="text-sm text-slate-400">Distance de recherche par défaut</p>
                                    </div>
                                </div>
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                    {profile.preferences.rayon_prefere} km
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions du compte */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">
                        Compte
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4">
                        <Button
                            variant="outline"
                            onClick={onChangePassword}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            Changer le mot de passe
                        </Button>
                        <Button
                            variant="outline"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            Mes documents
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onLogout}
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10 ml-auto"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Déconnexion
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

