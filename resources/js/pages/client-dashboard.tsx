import { useState, useEffect, useCallback } from 'react';
import { Head, router } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';
import { ClientStatsCards } from '@/components/client/client-stats';
import { GMapComponent } from '@/components/client/gmap-component';
import { DemandeForm } from '@/components/client/demande-form';
import { DemandeList } from '@/components/client/demande-list';
import { InterventionTracker } from '@/components/client/intervention-tracker';
import { InterventionHistory } from '@/components/client/intervention-history';
import { UserProfile } from '@/components/client/user-profile';
import { LoadingPage, LoadingGrid } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Home, PlusCircle, FileText, User, Bell,
    MapPin, Clock, ChevronRight, Menu, X, AlertCircle,
    LogOut, BellRing
} from 'lucide-react';
import type { ClientStats, ClientNotification, InterventionHistoryItem, UserProfile as UserProfileType, DemandeActive } from '@/types/client';
import { PaymentModal } from '@/components/client/payment-modal';
import { EvaluationModal } from '@/components/client/evaluation-modal';
import { InterventionDetailsModal } from '@/components/client/intervention-details-modal';

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
    { id: 1, type: 'depannage_en_route', titre: 'Dépanneur en route', message: 'Kouami Toto est en route vers votre position', isRead: false, createdAt: new Date().toISOString() },
    { id: 2, type: 'demande_acceptee', titre: 'Demande acceptée', message: 'Votre demande DEM-2024-001 a été acceptée', isRead: false, createdAt: new Date(Date.now() - 300000).toISOString() },
    { id: 3, type: 'intervention_terminee', titre: 'Intervention terminée', message: 'L\'intervention DEM-2023-156 est terminée', isRead: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
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

type TabType = 'home' | 'new-demande' | 'demandes' | 'history' | 'profile' | 'notifications';

const navItems = [
    { id: 'home', label: 'Tableau de bord', icon: Home },
    { id: 'new-demande', label: 'Nouvelle demande', icon: PlusCircle },
    { id: 'demandes', label: 'Mes demandes', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: BellRing },
    { id: 'history', label: 'Historique', icon: Clock },
    { id: 'profile', label: 'Profil', icon: User },
];

export default function ClientDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [demandesFilter, setDemandesFilter] = useState<string>('all');
    
    // États pour les modales
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showEvaluationModal, setShowEvaluationModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Données pour les modales
    const [selectedFactureId, setSelectedFactureId] = useState<number | undefined>(undefined);
    const [selectedInterventionId, setSelectedInterventionId] = useState<number | undefined>(undefined);
    const [selectedIntervention, setSelectedIntervention] = useState<any>(undefined);
    const [selectedFacture, setSelectedFacture] = useState<any>(undefined);
    
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
                        factureStatus: h.factureStatus,
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

    // Rafraîchir les données quand la page devient visible (après retour du paiement)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // La page est devenue visible, rafraîchir les données
                fetchDashboardData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // También监听窗口聚焦事件
        const handleFocus = () => {
            fetchDashboardData();
        };
        
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchDashboardData]);

    // Fonction pour gérer la soumission d'une nouvelle demande
    const handleNewDemande = async (data: { vehicleType: string; typePanne: string; description: string; localisation: string; depanneurId?: number }) => {
        console.log('Nouvelle demande:', data);
        
        // Extraire les coordonnées de la localisation (format: "lat,lng")
        const coords = data.localisation.split(',');
        const latitude = coords[0]?.trim();
        const longitude = coords[1]?.trim();
        
        if (!latitude || !longitude) {
            alert('Coordonnées GPS invalides. Veuillez sélectionner une position sur la carte.');
            return;
        }
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch('/api/demandes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
                body: JSON.stringify({
                    vehicleType: data.vehicleType,
                    typePanne: data.typePanne,
                    description: data.description,
                    localisation: data.localisation,
                }),
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Demande créée avec succès
                alert(`Demande créée avec succès!\nCode: ${result.demande?.codeDemande || 'N/A'}`);
                
                // Recharger les données du dashboard pour voir la nouvelle demande
                fetchDashboardData();
                
                // Revenir à l'accueil
                setActiveTab('home');
            } else {
                // Erreur lors de la création
                const errorMessage = result.message || 'Erreur lors de la création de la demande';
                alert(errorMessage);
                
                // Si erreur d'authentification, rediriger vers login
                if (response.status === 401 || response.status === 403) {
                    window.location.href = '/login';
                }
            }
        } catch (error) {
            console.error('Erreur lors de la création de la demande:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        }
    };

    const handleViewDetails = (item: InterventionHistoryItem) => {
        // Ouvrir la modal de détails avec les données de l'intervention
        setSelectedIntervention({
            id: item.id,
            codeDemande: item.codeDemande,
            status: item.status,
            typePanne: item.typePanne,
            localisation: 'Cotonou, Rue de la Paix', // Could be enhanced
            date: item.date,
            duree: item.duree,
            montant: item.montant,
            depanneur: item.depanneur,
            facture: item.facture ? { id: item.facture.id, status: item.factureStatus || 'en_attente', montant: item.montant } : undefined,
            evaluation: item.evaluation,
        });
        setSelectedInterventionId(item.id);
        setShowDetailsModal(true);
    };

    const handleDownloadFacture = (factureId: number) => {
        // Télécharger la facture en PDF
        window.open(`/api/client/factures/${factureId}/pdf`, '_blank');
    };

    const handlePayer = (factureId: number) => {
        // Ouvrir la modal de paiement
        setSelectedFactureId(factureId);
        setShowPaymentModal(true);
    };

    const handleEvaluer = (item: InterventionHistoryItem) => {
        // Ouvrir la modal d'évaluation
        setSelectedInterventionId(item.id);
        setSelectedIntervention({
            id: item.id,
            codeDemande: item.codeDemande,
            typePanne: item.typePanne,
            date: item.date,
            depanneur: item.depanneur,
        });
        setShowEvaluationModal(true);
    };

    const handleSaveProfile = (data: Partial<UserProfileType>) => {
        console.log('Sauvegarder profil:', data);
    };

    const handleChangePassword = () => {
        // Naviguer vers la page de changement de mot de passe
        router.visit('/settings/password');
    };

    const handleLogout = () => {
        // Déconnexion via Inertia router vers la route /logout (POST)
        router.post('/logout');
    };

    // Fonction pour naviguer vers un onglet avec un filtre
    const handleNavigate = (tab: TabType, filter?: string) => {
        if (filter) {
            setDemandesFilter(filter);
        }
        setActiveTab(tab);
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
                return <HomeTab data={data} onRefresh={fetchDashboardData} onNavigate={handleNavigate} onPayer={handlePayer} onEvaluer={handleEvaluer} />;
            case 'new-demande':
                return <NewDemandeTab onSubmit={handleNewDemande} />;
            case 'demandes':
                return <DemandesTab data={data} filter={demandesFilter} onFilterChange={setDemandesFilter} />;
            case 'history':
                return <HistoryTab data={data} onViewDetails={handleViewDetails} onDownloadFacture={handleDownloadFacture} onEvaluer={handleEvaluer} onPayer={handlePayer} />;
            case 'notifications':
                return <NotificationsTab />;
            case 'profile':
                return <ProfileTab data={data} onSaveProfile={handleSaveProfile} onChangePassword={handleChangePassword} />;
            default:
                return <HomeTab data={data} onRefresh={fetchDashboardData} onNavigate={handleNavigate} onPayer={handlePayer} onEvaluer={handleEvaluer} />;
        }
    };

    const getPageTitle = (): string => {
        const titles: Record<TabType, string> = {
            home: 'Tableau de bord',
            'new-demande': 'Nouvelle demande',
            demandes: 'Mes demandes',
            notifications: 'Notifications',
            history: 'Historique',
            profile: 'Mon profil',
        };
        return titles[activeTab];
    };

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Client - GoAssist" />
            
            {/* Header mobile avec menu toggle */}
            <div className="lg:hidden bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 p-4 flex items-center justify-between shadow-lg">
                <h1 className="text-white font-bold">{getPageTitle()}</h1>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="text-slate-300 hover:text-white p-2"
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar - Modern design with gradient */}
                <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex-col transition-all duration-300 sticky top-0 h-full shadow-xl`}>
                    {/* Logo */}
                    <div className="p-5 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <MapPin className="h-5 w-5 text-white" />
                            </div>
                            {sidebarOpen && (
                                <div>
                                    <h2 className="text-lg font-bold text-white">GoAssist</h2>
                                    <p className="text-xs text-slate-400">Espace Client</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Navigation */}
                    <nav className="flex-1 p-3 space-y-1.5">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as TabType)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                        isActive 
                                            ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10' 
                                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                    }`}
                                >
                                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400 transition-colors'}`} />
                                    {sidebarOpen && (
                                        <>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {isActive && <ChevronRight className="h-4 w-4 ml-auto text-blue-400" />}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                    
                    {/* Footer */}
                    <div className="p-3 border-t border-slate-700/50 space-y-2">
                        {/* Notifications Button */}
                        <NotificationsButton sidebarOpen={sidebarOpen} />
                        
                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 transition-all duration-300 group shadow-lg shadow-red-500/20 hover:shadow-red-500/40"
                        >
                            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            {sidebarOpen && <span className="text-sm font-semibold">Déconnexion</span>}
                        </button>
                        
                        {/* Collapse Button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all"
                        >
                            <ChevronRight className={`h-5 w-5 transition-transform duration-300 ${sidebarOpen ? 'rotate-180' : ''}`} />
                            {sidebarOpen && <span className="text-sm">Replier</span>}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {mobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
                        <div className="absolute right-0 top-0 h-full w-64 bg-white p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                                <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 p-2">
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
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                            
                            {/* Bouton Déconnexion - Visible sur mobile */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="text-sm font-medium">Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content - Modern dark theme */}
                <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Page Title */}
                        <div className="hidden lg:flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{getPageTitle()}</h1>
                                <p className="text-slate-600 mt-1">
                                    {!loading && data ? `Bienvenue sur votre espace client ${data.profile.fullName}` : 'Bienvenue sur votre espace client GoAssist'}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        {renderTabContent()}
                    </div>
                </div>

                {/* Modales */}
                <PaymentModal 
                    isOpen={showPaymentModal}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedFactureId(undefined);
                    }}
                    factureId={selectedFactureId}
                    facture={selectedFacture}
                />
                
                <EvaluationModal
                    isOpen={showEvaluationModal}
                    onClose={() => {
                        setShowEvaluationModal(false);
                        setSelectedInterventionId(undefined);
                        setSelectedIntervention(undefined);
                    }}
                    interventionId={selectedInterventionId}
                    intervention={selectedIntervention}
                />
                
                <InterventionDetailsModal
                    isOpen={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedInterventionId(undefined);
                        setSelectedIntervention(undefined);
                    }}
                    interventionId={selectedInterventionId}
                    intervention={selectedIntervention}
                />
            </div>
        </AppHeaderLayout>
    );
}

// Tab: Accueil
function HomeTab({ data, onRefresh, onNavigate, onPayer, onEvaluer }: { data: DashboardData; onRefresh?: () => void; onNavigate?: (tab: TabType, filter?: string) => void; onPayer?: (factureId: number) => void; onEvaluer?: (item: InterventionHistoryItem) => void }) {
    const handleCardClick = (type: string) => {
        // Navigate to the appropriate tab based on the card type
        switch (type) {
            case 'all':
            case 'en_cours':
            case 'terminee':
                // Navigate to 'demandes' tab with filter
                onNavigate?.('demandes', type);
                break;
            case 'active':
                // Already on home, scroll to the active demande section
                break;
            case 'depenses':
                // Navigate to history to see expenses
                onNavigate?.('history');
                break;
            default:
                break;
        }
    };

    // Handler pour l'évaluation depuis le tracker
    const handleEvaluerFromTracker = () => {
        if (data.stats.demande_active && onEvaluer && data.stats.demande_active.depanneur) {
            const item: InterventionHistoryItem = {
                id: data.stats.demande_active.id,
                codeDemande: data.stats.demande_active.codeDemande,
                date: new Date().toISOString(),
                typePanne: data.stats.demande_active.typePanne,
                status: data.stats.demande_active.status,
                depanneur: data.stats.demande_active.depanneur,
                montant: data.stats.demande_active.montant || 0,
                duree: 0,
            };
            onEvaluer(item);
        }
    };

    return (
        <div className="space-y-6">
            <ClientStatsCards stats={data.stats} onCardClick={handleCardClick} />
            <div className="grid gap-6 lg:grid-cols-2">
                <GMapComponent demandeActive={data.stats.demande_active} />
                <InterventionTracker
                    demandeActive={data.stats.demande_active}
                    factureId={data.stats.demande_active?.factureId}
                    montant={data.stats.demande_active?.montant}
                    onContactDepanneur={() => {
                        if (data.stats.demande_active && data.stats.demande_active.depanneur && data.stats.demande_active.depanneur.phone) {
                            window.open(`tel:${data.stats.demande_active.depanneur.phone}`);
                        } else {
                            console.log('Aucun numéro de téléphone disponible');
                        }
                    }}
                    onAnnuler={async () => {
                        if (!data.stats.demande_active) return;
                        
                        const demandeId = data.stats.demande_active.id;
                        if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
                            return;
                        }
                        
                        try {
                            const response = await fetch(`/api/demandes/${demandeId}/cancel`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                                },
                                credentials: 'include',
                            });
                            
                            const result = await response.json();
                            
                            if (result.success) {
                                alert('Demande annulée avec succès');
                                if (onRefresh) onRefresh();
                            } else {
                                alert(result.message || 'Erreur lors de l\'annulation');
                            }
                        } catch (error) {
                            console.error('Erreur:', error);
                            alert('Erreur lors de l\'annulation');
                        }
                    }}
                    onPayer={() => {
                        // Ouvrir la modale de paiement au lieu de naviguer vers une page
                        if (data.stats.demande_active?.factureId && onPayer) {
                            onPayer(data.stats.demande_active.factureId);
                        }
                    }}
                    onViewHistory={() => {
                        onNavigate?.('history');
                    }}
                    onEvaluer={handleEvaluerFromTracker}
                    onStepClick={(status: string) => {
                        // Navigate to the appropriate filter based on status
                        switch (status) {
                            case 'en_attente':
                            case 'acceptee':
                                // Show in-progress demands
                                onNavigate?.('demandes', 'en_cours');
                                break;
                            case 'en_cours':
                                onNavigate?.('demandes', 'en_cours');
                                break;
                            case 'terminee':
                                // Show completed interventions in history
                                onNavigate?.('history');
                                break;
                            default:
                                onNavigate?.('demandes', 'all');
                                break;
                        }
                    }}
                />
            </div>
        </div>
    );
}

// Tab: Nouvelle demande
function NewDemandeTab({ onSubmit }: { onSubmit?: (data: any) => void }) {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <DemandeForm onSubmit={onSubmit || (() => {})} />
        </div>
    );
}

// Tab: Mes demandes
function DemandesTab({ data, filter = 'all', onFilterChange }: { data: DashboardData; filter?: string; onFilterChange?: (filter: string) => void }) {
    // Filter the demandes based on the filter prop
    const filteredHistory = data.history.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'en_cours') return item.status === 'en_cours';
        if (filter === 'terminee') return item.status === 'terminee';
        return true;
    });

    const mockDemandes = filteredHistory.map(h => ({
        id: h.id,
        codeDemande: h.codeDemande,
        typePanne: h.typePanne,
        localisation: 'Cotonou, Rue de la Paix',
        date: h.date,
        status: h.status as 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee',
        depanneur: h.depanneur ? { etablissement_name: h.depanneur.etablissement_name, fullName: h.depanneur.fullName } : { etablissement_name: 'N/A', fullName: 'N/A' },
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
    onEvaluer,
    onPayer
}: { 
    data: DashboardData
    onViewDetails: (item: InterventionHistoryItem) => void
    onDownloadFacture: (id: number) => void
    onEvaluer: (item: InterventionHistoryItem) => void
    onPayer?: (factureId: number) => void
}) {
    return (
        <div className="space-y-6">
            <InterventionHistory 
                history={data.history}
                onViewDetails={onViewDetails}
                onDownloadFacture={onDownloadFacture}
                onEvaluer={onEvaluer}
                onPayer={onPayer}
            />
        </div>
    );
}

// Tab: Profil
function ProfileTab({ 
    data,
    onSaveProfile, 
    onChangePassword, 
}: { 
    data: DashboardData
    onSaveProfile: (data: Partial<UserProfileType>) => void
    onChangePassword: () => void
}) {
    return (
        <div className="space-y-6">
            <UserProfile 
                profile={data.profile}
                stats={data.profileStats}
                onSaveProfile={onSaveProfile}
                onChangePassword={onChangePassword}
            />
        </div>
    );
}

// Tab: Notifications - Page dédiée agrandie
function NotificationsTab() {
    const [notifications, setNotifications] = useState<ClientNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread' | 'demande' | 'paiement' | 'intervention'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch notifications
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/client/notifications', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                setNotifications(result.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications(mockNotifications);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch(`/api/client/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch('/api/client/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
        return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    };

    const getNotificationType = (type: string): string => {
        if (type.includes('demande') || type.includes('nouvelle')) return 'demande';
        if (type.includes('paiement') || type.includes('paye')) return 'paiement';
        if (type.includes('intervention') || type.includes('depannage') || type.includes('terminee')) return 'intervention';
        return 'autre';
    };

    const getFilterLabel = (f: string): string => {
        switch (f) {
            case 'all': return 'Toutes';
            case 'unread': return 'Non lues';
            case 'demande': return 'Demandes';
            case 'paiement': return 'Paiements';
            case 'intervention': return 'Interventions';
            default: return f;
        }
    };

    const getNotificationIcon = (type: string) => {
        const notificationType = getNotificationType(type);
        switch (notificationType) {
            case 'demande':
                return <FileText className="h-5 w-5 text-blue-500" />;
            case 'paiement':
                return <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">€</div>;
            case 'intervention':
                return <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs">⚡</div>;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    // Apply filters
    const applyFilters = () => {
        let filtered = notifications;
        
        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.isRead);
        } else if (filter === 'demande') {
            filtered = filtered.filter(n => getNotificationType(n.type) === 'demande');
        } else if (filter === 'paiement') {
            filtered = filtered.filter(n => getNotificationType(n.type) === 'paiement');
        } else if (filter === 'intervention') {
            filtered = filtered.filter(n => getNotificationType(n.type) === 'intervention');
        }
        
        return filtered;
    };

    const filteredNotifications = applyFilters();
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques et actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Mes Notifications</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {unreadCount > 0 
                                ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}`
                                : 'Toutes vos notifications ont été lues'
                            }
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Bell className="h-4 w-4" />
                            Tout marquer comme lu
                        </button>
                    )}
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-wrap gap-2">
                    {(['all', 'unread', 'demande', 'paiement', 'intervention'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {getFilterLabel(f)}
                            {f === 'unread' && unreadCount > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des notifications - Zone agrandie */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Chargement des notifications...</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
                        <p className="text-gray-500">
                            {filter !== 'all' 
                                ? `Vous n'avez pas de ${getFilterLabel(filter).toLowerCase()}`
                                : 'Vous n\'avez pas encore de notifications'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {paginatedNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => markAsRead(notification.id)}
                                className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                                    !notification.isRead ? 'bg-blue-50/50' : ''
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icône */}
                                    <div className={`p-2 rounded-full flex-shrink-0 ${
                                        !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    
                                    {/* Contenu */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className={`text-base font-medium ${
                                                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                }`}>
                                                    {notification.titre}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.isRead && (
                                                <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 mt-3">
                                            <span className="text-xs text-gray-400">
                                                {getTimeAgo(notification.createdAt)}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                getNotificationType(notification.type) === 'demande' ? 'bg-blue-100 text-blue-700' :
                                                getNotificationType(notification.type) === 'paiement' ? 'bg-green-100 text-green-700' :
                                                getNotificationType(notification.type) === 'intervention' ? 'bg-orange-100 text-orange-700' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {getFilterLabel(getNotificationType(notification.type))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredNotifications.length)} sur {filteredNotifications.length} notifications
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
function NotificationsButton({ sidebarOpen }: { sidebarOpen: boolean }) {
    const [notifications, setNotifications] = useState<ClientNotification[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread' | 'demande' | 'paiement' | 'intervention'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Fetch notifications
    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/client/notifications', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });
            const result = await response.json();
            if (result.success) {
                setNotifications(result.notifications || []);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Fallback to mock data
            setNotifications(mockNotifications);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch(`/api/client/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            await fetch('/api/client/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'À l\'instant';
        if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
        return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
    };

    const getNotificationType = (type: string): string => {
        if (type.includes('demande') || type.includes('nouvelle')) return 'demande';
        if (type.includes('paiement') || type.includes('paye')) return 'paiement';
        if (type.includes('intervention') || type.includes('depannage') || type.includes('terminee')) return 'intervention';
        return 'autre';
    };

    const getFilterLabel = (f: string): string => {
        switch (f) {
            case 'all': return 'Toutes';
            case 'unread': return 'Non lues';
            case 'demande': return 'Demandes';
            case 'paiement': return 'Paiements';
            case 'intervention': return 'Interventions';
            default: return f;
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    // Apply filters
    const applyFilters = () => {
        let filtered = notifications;
        
        if (filter === 'unread') {
            filtered = filtered.filter(n => !n.isRead);
        } else if (filter === 'demande') {
            filtered = filtered.filter(n => getNotificationType(n.type) === 'demande');
        } else if (filter === 'paiement') {
            filtered = filtered.filter(n => getNotificationType(n.type) === 'paiement');
        } else if (filter === 'intervention') {
            filtered = filtered.filter(n => getNotificationType(n.type) === 'intervention');
        }
        
        return filtered;
    };

    const filteredNotifications = applyFilters();
    const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
    const paginatedNotifications = filteredNotifications.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    return (
        <div className="relative">
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 group"
            >
                <div className="relative">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {sidebarOpen && <span className="text-sm">Notifications</span>}
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[700px]">
                    <div className="p-3 border-b bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">Notifications</span>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Tout marquer lu
                                </button>
                            )}
                        </div>
                        {/* Filter tabs */}
                        <div className="flex flex-wrap gap-1">
                            {(['all', 'unread', 'demande', 'paiement', 'intervention'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-2 py-1 text-xs rounded-full ${
                                        filter === f ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    }`}
                                >
                                    {getFilterLabel(f)}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="overflow-y-auto max-h-96">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Chargement...</div>
                        ) : filteredNotifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                Aucune notification {filter !== 'all' ? getFilterLabel(filter).toLowerCase() : ''}
                            </div>
                        ) : (
                            paginatedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => markAsRead(notification.id)}
                                    className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                                        !notification.isRead ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                                            !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                                        }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {notification.titre}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-gray-400">
                                                    {getTimeAgo(notification.createdAt)}
                                                </p>
                                                <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                    {getFilterLabel(getNotificationType(notification.type))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-2 border-t bg-gray-50 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                                Page {currentPage}/{totalPages}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                                >
                                    Préc
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-2 py-1 text-xs bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
                                >
                                    Suiv
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

