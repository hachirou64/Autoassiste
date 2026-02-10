import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';
import { ClientStatsCards } from '@/components/client/client-stats';
import { GMapComponent } from '@/components/client/gmap-component';
import { DemandeForm } from '@/components/client/demande-form';
import { DemandeList } from '@/components/client/demande-list';
import { InterventionTracker } from '@/components/client/intervention-tracker';
import { ClientNotifications } from '@/components/client/client-notifications';
import { InterventionHistory } from '@/components/client/intervention-history';
import { UserProfile } from '@/components/client/user-profile';
import { LoadingPage, LoadingGrid } from '@/components/ui/loading-spinner';
import {
    Home, PlusCircle, FileText, User, Bell,
    MapPin, Clock, ChevronRight, Menu, X, AlertCircle
} from 'lucide-react';
import type { ClientStats, ClientNotification, InterventionHistoryItem, UserProfile as UserProfileType } from '@/types/client';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mon Espace', href: '/client/dashboard' },
];

// Types pour les données du dashboard
interface DashboardData {
    stats: ClientStats;
    notifications: ClientNotification[];
    history: InterventionHistoryItem[];
    profile: UserProfileType;
    profileStats: {
        total_demandes: number;
        demandes_terminees: number;
        montant_total_depense: number;
        membre_depuis: string;
    };
}

// Données mockées par défaut (fallback)
const mockStats: ClientStats = {
    total_demandes: 12,
    demandes_en_cours: 1,
    demandes_terminees: 10,
    montant_total_depense: 450000,
    demande_active: {
        id: 1,
        codeDemande: 'DEM-2024-001',
        status: 'en_cours',
        typePanne: 'Panne de batterie',
        localisation: 'Cotonou, Rue de la Paix',
        latitude: 6.366,
        longitude: 2.433,
        estimated_arrival: '~15 min',
        distance: 3.5,
        depanneur: {
            id: 1,
            fullName: 'Kouami Toto',
            etablissement_name: 'Garage du Centre',
            phone: '+229 90 00 11 11',
            rating: 4.8,
        },
    },
};

const mockNotifications: ClientNotification[] = [
    { id: 1, type: 'depanneur_en_route', titre: 'Dépanneur en route', message: 'Kouami Toto est en route vers votre position', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, type: 'demande_acceptee', titre: 'Demande acceptée', message: 'Votre demande DEM-2024-001 a été acceptée', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 3, type: 'terminee', titre: 'Intervention terminée', message: 'L\'intervention DEM-2023-156 est terminée', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const mockHistory: InterventionHistoryItem[] = [
    { id: 1, codeDemande: 'DEM-2024-001', date: new Date().toISOString(), typePanne: 'Panne de batterie', status: 'en_cours', depanneur: { fullName: 'Kouami Toto', etablissement_name: 'Garage du Centre', phone: '+229 90 00 11 11', rating: 4.8 }, montant: 30000, duree: 45 },
    { id: 2, codeDemande: 'DEM-2023-156', date: new Date(Date.now() - 86400000 * 7).toISOString(), typePanne: 'Créaison', status: 'terminee', depanneur: { fullName: 'Aime Sika', etablissement_name: 'Dépannage Rapide', phone: '+229 90 00 22 22', rating: 4.5 }, montant: 22000, duree: 30, evaluation: { note: 5, commentaire: 'Service rapide et efficace!' }, facture: { id: 1, url: '#' } },
    { id: 3, codeDemande: 'DEM-2023-142', date: new Date(Date.now() - 86400000 * 14).toISOString(), typePanne: 'Panne sèche', status: 'terminee', depanneur: { fullName: 'Paul Agossou', etablissement_name: 'Service Auto', phone: '+229 90 00 33 33', rating: 4.2 }, montant: 15000, duree: 20, evaluation: { note: 4, commentaire: 'Bon service' }, facture: { id: 2, url: '#' } },
    { id: 4, codeDemande: 'DEM-2023-128', date: new Date(Date.now() - 86400000 * 30).toISOString(), typePanne: 'Problème moteur', status: 'terminee', depanneur: { fullName: 'Kouami Toto', etablissement_name: 'Garage du Centre', phone: '+229 90 00 11 11', rating: 4.8 }, montant: 55000, duree: 120, evaluation: { note: 5, commentaire: 'Excellent travail!' }, facture: { id: 3, url: '#' } },
];

const mockProfile: UserProfileType = {
    id: 1,
    fullName: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+229 90 00 00 01',
    photo: undefined,
    createdAt: '2024-01-15',
    preferences: {
        methode_payement_preferee: 'mobile_money',
        notifications_sms: true,
        notifications_email: true,
    },
};

const mockProfileStats = {
    total_demandes: 12,
    demandes_terminees: 10,
    montant_total_depense: 450000,
    membre_depuis: 'janvier 2024',
};

type TabType = 'home' | 'new-demande' | 'demandes' | 'history' | 'profile';

const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'new-demande', label: 'Nouvelle demande', icon: PlusCircle },
    { id: 'demandes', label: 'Mes demandes', icon: FileText },
    { id: 'history', label: 'Historique', icon: Clock },
    { id: 'profile', label: 'Profil', icon: User },
];

export default function ClientDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // États pour les données et le chargement
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Vérifier si l'utilisateur vient du bouton SOS avec une demande en attente
    // et automatiquement afficher le formulaire de demande
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('new-demande') === 'true') {
            // Activer l'onglet nouvelle demande
            setActiveTab('new-demande');
            // Nettoyer l'URL pour éviter que le paramètre revienne après refresh
            window.history.replaceState({}, '', '/client/dashboard');
        }
    }, []);

    // Fonction pour charger les données du dashboard
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Appel API réel pour récupérer les données du dashboard
            const response = await fetch('/api/client/dashboard', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include', // Pour inclure les cookies d'authentification
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des données');
            }

            const result = await response.json();

            if (result.success) {
                // Transformer les données API au format attendu par le composant
                const apiData = result;
                
                const dashboardData: DashboardData = {
                    stats: {
                        total_demandes: apiData.stats.total_demandes,
                        demandes_en_cours: apiData.stats.demandes_en_cours,
                        demandes_terminees: apiData.stats.demandes_terminees,
                        montant_total_depense: apiData.stats.montant_total_depense,
                        demande_active: apiData.demande_active ? {
                            id: apiData.demande_active.id,
                            codeDemande: apiData.demande_active.codeDemande,
                            status: apiData.demande_active.status,
                            typePanne: apiData.demande_active.typePanne,
                            localisation: apiData.demande_active.localisation,
                            latitude: apiData.demande_active.latitude,
                            longitude: apiData.demande_active.longitude,
                            estimated_arrival: apiData.demande_active.estimated_arrival,
                            distance: apiData.demande_active.distance,
                            depanneur: apiData.demande_active.depanneur,
                        } : undefined,
                    },
                    notifications: apiData.notifications.map((n: any) => ({
                        id: n.id,
                        type: n.type,
                        titre: n.titre,
                        message: n.message,
                        isRead: n.isRead,
                        createdAt: n.createdAt,
                    })),
                    history: apiData.history.map((h: any) => ({
                        id: h.id,
                        codeDemande: h.codeDemande,
                        date: h.date,
                        typePanne: h.typePanne,
                        status: h.status,
                        depanneur: h.depanneur,
                        montant: h.montant,
                        duree: h.duree,
                        evaluation: h.evaluation,
                        facture: h.facture,
                    })),
                    profile: apiData.profile,
                    profileStats: apiData.profileStats,
                };
                
                setData(dashboardData);
            } else {
                throw new Error(result.error || 'Erreur lors du chargement');
            }
        } catch (err) {
            setError('Erreur lors du chargement des données. Veuillez réessayer.');
            console.error('Error fetching dashboard data:', err);
            // En cas d'erreur, utiliser les données mockées comme fallback
            const dashboardData: DashboardData = {
                stats: mockStats,
                notifications: mockNotifications,
                history: mockHistory,
                profile: mockProfile,
                profileStats: mockProfileStats,
            };
            setData(dashboardData);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les données au montage du composant
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleNewDemande = (data: { typePanne: string; description: string; localisation: string }) => {
        console.log('Nouvelle demande:', data);
    };

    const handleViewDetails = (item: InterventionHistoryItem) => {
        console.log('Voir détails:', item);
    };

    const handleDownloadFacture = (factureId: number) => {
        console.log('Télécharger facture:', factureId);
    };

    const handleEvaluer = (item: InterventionHistoryItem) => {
        console.log('Évaluer:', item);
    };

    const handleSaveProfile = (data: Partial<UserProfileType>) => {
        console.log('Sauvegarder profil:', data);
    };

    const handleChangePassword = () => {
        console.log('Changer mot de passe');
    };

    const handleLogout = () => {
        console.log('Déconnexion');
    };

    const renderTabContent = () => {
        // Si les données sont en cours de chargement
        if (loading) {
            return <LoadingPage text="Chargement de votre espace..." />;
        }

        // Si une erreur est survenue
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2">Erreur de chargement</h3>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button
                        onClick={fetchDashboardData}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                        Réessayer
                    </button>
                </div>
            );
        }

        // Si pas de données (ne devrait pas arriver avec les mockées)
        if (!data) {
            return null;
        }

        switch (activeTab) {
            case 'home':
                return <HomeTab data={data} />;
            case 'new-demande':
                return <NewDemandeTab onSubmit={handleNewDemande} />;
            case 'demandes':
                return <DemandesTab data={data} />;
            case 'history':
                return <HistoryTab data={data} onViewDetails={handleViewDetails} onDownloadFacture={handleDownloadFacture} onEvaluer={handleEvaluer} />;
            case 'profile':
                return <ProfileTab data={data} onSaveProfile={handleSaveProfile} onChangePassword={handleChangePassword} onLogout={handleLogout} />;
            default:
                return <HomeTab data={data} />;
        }
    };

    const getPageTitle = (): string => {
        const titles: Record<TabType, string> = {
            home: 'Mon Espace',
            'new-demande': 'Nouvelle demande',
            demandes: 'Mes demandes',
            history: 'Historique',
            profile: 'Mon profil',
        };
        return titles[activeTab];
    };

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Client - GoAssist" />
            
            {/* Header mobile avec menu toggle */}
            <div className="lg:hidden bg-slate-900 border-b border-slate-700 p-4 flex items-center justify-between">
                <h1 className="text-white font-bold">{getPageTitle()}</h1>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-slate-400 hover:text-white p-2"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            <div className="flex h-full">
                {/* Sidebar Desktop */}
                <div className={`${sidebarOpen ? 'w-64' : 'w-16'} hidden lg:flex bg-slate-900 border-r border-slate-700 flex-col transition-all duration-300`}>
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <MapPin className="h-6 w-6 text-blue-400" />
                            {sidebarOpen && <span>GoAssist</span>}
                        </h2>
                    </div>
                    <nav className="flex-1 p-2 space-y-1">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as TabType)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                                    {sidebarOpen && (
                                        <>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                    <div className="p-2 border-t border-slate-700">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                            <ChevronRight className={`h-5 w-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
                            {sidebarOpen && <span className="text-sm">Replier</span>}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 h-full w-64 bg-slate-900 p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Menu</h2>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="space-y-2">
                                {navItems.map((item) => {
                                    const IconComponent = item.icon;
                                    const isActive = activeTab === item.id;

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setActiveTab(item.id as TabType);
                                                setMobileMenuOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                                                isActive 
                                                    ? 'bg-blue-500/20 text-blue-400' 
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 overflow-auto bg-slate-950 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Page Title */}
                        <div className="hidden lg:flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
                                <p className="text-slate-400 mt-1">
                                    {!loading && data ? `Bienvenue sur votre espace client ${data.profile.fullName}` : 'Bienvenue sur votre espace client GoAssist'}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

// Imports nécessaires pour les sous-composants
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Tab: Accueil
function HomeTab({ data }: { data: DashboardData }) {
    return (
        <div className="space-y-6">
            <ClientStatsCards stats={data.stats} />
            <div className="grid gap-6 lg:grid-cols-2">
                <GMapComponent demandeActive={data.stats.demande_active} />
                <InterventionTracker
                    demandeActive={data.stats.demande_active}
                    onContactDepanneur={() => {
                        if (data.stats.demande_active?.depanneur?.phone) {
                            window.open(`tel:${data.stats.demande_active.depanneur.phone}`);
                        } else {
                            console.log('Aucun numéro de téléphone disponible');
                        }
                    }}
                    onAnnuler={() => console.log('Annuler')}
                />
            </div>
            <ClientNotifications 
                notifications={data.notifications.slice(0, 3)}
                onMarkAsRead={(id) => console.log('Mark as read:', id)}
            />
        </div>
    );
}

// Tab: Nouvelle demande
function NewDemandeTab({ onSubmit }: { onSubmit: (data: { typePanne: string; description: string; localisation: string }) => void }) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <DemandeForm onSubmit={onSubmit} />
        </div>
    );
}

// Tab: Mes demandes
function DemandesTab({ data }: { data: DashboardData }) {
    const mockDemandes = data.history.map(h => ({
        id: h.id,
        codeDemande: h.codeDemande,
        typePanne: h.typePanne,
        localisation: 'Cotonou, Rue de la Paix',
        date: h.date,
        status: h.status as 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee',
        depanneur: { etablissement_name: h.depanneur.etablissement_name, fullName: h.depanneur.fullName },
    }));

    return (
        <div className="space-y-6">
            <DemandeList 
                demandes={mockDemandes}
                demandeActive={data.stats.demande_active}
                onViewDetails={(d) => console.log('View details:', d)}
                onCancel={(d) => console.log('Cancel:', d)}
            />
        </div>
    );
}

// Tab: Historique
function HistoryTab({ 
    data,
    onViewDetails, 
    onDownloadFacture, 
    onEvaluer 
}: { 
    data: DashboardData
    onViewDetails: (item: InterventionHistoryItem) => void
    onDownloadFacture: (id: number) => void
    onEvaluer: (item: InterventionHistoryItem) => void
}) {
    return (
        <div className="space-y-6">
            <InterventionHistory 
                history={data.history}
                onViewDetails={onViewDetails}
                onDownloadFacture={onDownloadFacture}
                onEvaluer={onEvaluer}
            />
        </div>
    );
}

// Tab: Profil
function ProfileTab({ 
    data,
    onSaveProfile, 
    onChangePassword, 
    onLogout 
}: { 
    data: DashboardData
    onSaveProfile: (data: Partial<UserProfileType>) => void
    onChangePassword: () => void
    onLogout: () => void
}) {
    return (
        <div className="space-y-6">
            <UserProfile 
                profile={data.profile}
                stats={data.profileStats}
                onSaveProfile={onSaveProfile}
                onChangePassword={onChangePassword}
                onLogout={onLogout}
            />
        </div>
    );
}

