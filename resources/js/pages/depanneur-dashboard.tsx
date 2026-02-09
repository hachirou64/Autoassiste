import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';

// Composants
import { DepanneurStatsCards } from '@/components/depanneur/depanneur-stats';
import { AvailabilityToggle } from '@/components/depanneur/availability-toggle';
import { DemandesStream } from '@/components/depanneur/demandes-stream';
import { DepanneurMap } from '@/components/depanneur/depanneur-map';
import { CurrentIntervention } from '@/components/depanneur/current-intervention';
import { InterventionHistory } from '@/components/depanneur/intervention-history';
import { FinancialDashboard } from '@/components/depanneur/financial-dashboard';
import { DepanneurNotifications } from '@/components/depanneur/depanneur-notifications';
import { DepanneurProfile } from '@/components/depanneur/depanneur-profile';
import { LoadingPage } from '@/components/ui/loading-spinner';

// Icons
import {
    LayoutDashboard,
    Wrench,
    MapPin,
    Clock,
    FileText,
    DollarSign,
    Bell,
    User,
    Settings,
    Menu,
    X,
    ChevronRight,
    BarChart3,
    AlertCircle
} from 'lucide-react';

// Types
import type { 
    DepanneurStats, 
    DemandeAvailable, 
    InterventionEnCours,
    DemandeFilters,
    StatusDisponibilite,
    DepanneurProfile as DepanneurProfileType 
} from '@/types/depanneur';

// Données mockées
const mockStats: DepanneurStats = {
    interventions_aujourdhui: 3,
    revenus_aujourdhui: 105000,
    demandes_acceptees_aujourdhui: 4,
    note_moyenne_aujourdhui: 4.8,
    interventions_mois: 28,
    revenus_mois: 720000,
    demandes_acceptees_mois: 32,
    note_moyenne_mois: 4.7,
    total_interventions: 156,
    total_revenus: 2450000,
    note_moyenne: 4.7,
    total_clients: 89,
    status: 'disponible',
    zones_count: 4,
};

const mockDemandes: DemandeAvailable[] = [
    {
        id: 1,
        codeDemande: 'DEM-2024-001',
        typePanne: 'batterie',
        descriptionProbleme: 'Véhicule qui ne démarre pas, batterie HS',
        localisation: 'Cotonou, Rue de la Paix',
        latitude: 6.366,
        longitude: 2.433,
        distance: 2.5,
        createdAt: new Date().toISOString(),
        tempsRestant: 180,
        client: {
            id: 1,
            fullName: 'Jean Dupont',
            phone: '+229 90 00 00 01',
        },
        vehicle: {
            brand: 'Toyota',
            model: 'Corolla',
            color: 'Gris',
            plate: 'ABC-123',
        },
    },
    {
        id: 2,
        codeDemande: 'DEM-2024-002',
        typePanne: 'panne_seche',
        descriptionProbleme: 'Panne de carburant en route',
        localisation: 'Cotonou, Avenue de la Liberté',
        latitude: 6.370,
        longitude: 2.440,
        distance: 5.2,
        createdAt: new Date(Date.now() - 120000).toISOString(),
        tempsRestant: 300,
        client: {
            id: 2,
            fullName: 'Marie Kouami',
            phone: '+229 90 00 00 02',
        },
    },
    {
        id: 3,
        codeDemande: 'DEM-2024-003',
        typePanne: 'creaison',
        descriptionProbleme: 'Pneu crevé sur la route',
        localisation: 'Cotonou, Boulevard Saint-Michel',
        latitude: 6.360,
        longitude: 2.435,
        distance: 8.1,
        createdAt: new Date(Date.now() - 60000).toISOString(),
        tempsRestant: 420,
        client: {
            id: 3,
            fullName: 'Paul Agossou',
            phone: '+229 90 00 00 03',
        },
    },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Mon Espace Dépanneur', href: '/depanneur/dashboard' },
];

// Navigation items
const navItems = [
    { id: 'overview', label: 'Aperçu', icon: LayoutDashboard },
    { id: 'demandes', label: 'Demandes', icon: MapPin },
    { id: 'intervention', label: 'Intervention', icon: Wrench },
    { id: 'history', label: 'Historique', icon: Clock },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'profile', label: 'Profil', icon: User },
];

// Types de vues
type TabType = 'overview' | 'demandes' | 'intervention' | 'history' | 'finances' | 'profile';

export default function DepanneurDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // États pour les données
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DepanneurStats>(mockStats);
    const [demandes, setDemandes] = useState<DemandeAvailable[]>(mockDemandes);
    const [filters, setFilters] = useState<DemandeFilters>({ rayon: 10 });
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<StatusDisponibilite>('disponible');
    const [interventionStatus, setInterventionStatus] = useState<'aucune' | 'acceptee' | 'en_cours'>('aucune');

    // Simuler le chargement
    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    // Handlers
    const handleAcceptDemande = useCallback((demandeId: number) => {
        console.log('Accepter demande:', demandeId);
        setDemandes(prev => prev.filter(d => d.id !== demandeId));
        setInterventionStatus('acceptee');
    }, []);

    const handleRefuseDemande = useCallback((demandeId: number) => {
        console.log('Refuser demande:', demandeId);
        setDemandes(prev => prev.filter(d => d.id !== demandeId));
    }, []);

    const handleStatusChange = useCallback((newStatus: StatusDisponibilite) => {
        setCurrentStatus(newStatus);
        console.log('Changer statut vers:', newStatus);
    }, []);

    const handleStartIntervention = useCallback(() => {
        setInterventionStatus('en_cours');
        setCurrentStatus('occupe');
    }, []);

    const handleEndIntervention = useCallback((data: any) => {
        console.log('Terminer intervention:', data);
        setInterventionStatus('aucune');
        setCurrentStatus('disponible');
        // Rafraîchir les stats
        setStats(prev => ({
            ...prev,
            interventions_aujourdhui: prev.interventions_aujourdhui + 1,
            revenus_aujourdhui: prev.revenus_aujourdhui + (data.coutPiece + data.coutMainOeuvre),
        }));
    }, []);

    const handleCancelIntervention = useCallback(() => {
        setInterventionStatus('aucune');
        setCurrentStatus('disponible');
    }, []);

    const handleCallClient = useCallback(() => {
        window.open('tel:+22990000001');
    }, []);

    const handleOpenMaps = useCallback(() => {
        window.open('https://maps.google.com', '_blank');
    }, []);

    const renderTabContent = () => {
        if (loading) {
            return <LoadingPage text="Chargement de votre espace..." />;
        }

        switch (activeTab) {
            case 'overview':
                return <OverviewTab 
                    stats={stats} 
                    currentStatus={currentStatus}
                    onStatusChange={handleStatusChange}
                    demandes={demandes}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onAccept={handleAcceptDemande}
                    onRefuse={handleRefuseDemande}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled(!soundEnabled)}
                    interventionStatus={interventionStatus}
                />;
            case 'demandes':
                return (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <DemandesStream
                            demandes={demandes}
                            filters={filters}
                            onFiltersChange={setFilters}
                            onAccept={handleAcceptDemande}
                            onRefuse={handleRefuseDemande}
                            soundEnabled={soundEnabled}
                            onToggleSound={() => setSoundEnabled(!soundEnabled)}
                        />
                        <DepanneurMap
                            currentLocation={{ lat: 6.366, lng: 2.433 }}
                            demandes={demandes}
                            rayon={filters.rayon}
                            onRayonChange={(rayon) => setFilters({ ...filters, rayon })}
                            onMarkerClick={(id) => console.log('Marqueur click:', id)}
                            onAccepterClick={handleAcceptDemande}
                        />
                    </div>
                );
            case 'intervention':
                return (
                    <div className="grid gap-6 lg:grid-cols-2">
                        <CurrentIntervention
                            status={interventionStatus}
                            onStart={handleStartIntervention}
                            onEnd={handleEndIntervention}
                            onCancel={handleCancelIntervention}
                            onCallClient={handleCallClient}
                            onOpenMaps={handleOpenMaps}
                        />
                        <DepanneurMap
                            currentLocation={{ lat: 6.366, lng: 2.433 }}
                            rayon={filters.rayon}
                            onRayonChange={(rayon) => setFilters({ ...filters, rayon })}
                        />
                    </div>
                );
            case 'history':
                return <InterventionHistory />;
            case 'finances':
                return <FinancialDashboard />;
            case 'profile':
                return <DepanneurProfile />;
            default:
                return <OverviewTab 
                    stats={stats} 
                    currentStatus={currentStatus}
                    onStatusChange={handleStatusChange}
                    demandes={demandes}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onAccept={handleAcceptDemande}
                    onRefuse={handleRefuseDemande}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled(!soundEnabled)}
                    interventionStatus={interventionStatus}
                />;
        }
    };

    const getPageTitle = (): string => {
        const titles: Record<TabType, string> = {
            overview: 'Tableau de bord',
            demandes: 'Demandes disponibles',
            intervention: 'Intervention en cours',
            history: 'Historique',
            finances: 'Finances',
            profile: 'Mon profil',
        };
        return titles[activeTab];
    };

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Dépanneur - GoAssist" />
            
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
                            <Wrench className="h-6 w-6 text-amber-400" />
                            {sidebarOpen && <span>GoAssist Pro</span>}
                        </h2>
                    </div>
                    
                    {/* Indicateur de statut */}
                    <div className="px-4 py-3 border-b border-slate-700">
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            currentStatus === 'disponible' ? 'bg-green-500/10' :
                            currentStatus === 'occupe' ? 'bg-orange-500/10' : 'bg-red-500/10'
                        }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${
                                currentStatus === 'disponible' ? 'bg-green-500' :
                                currentStatus === 'occupe' ? 'bg-orange-500' : 'bg-red-500'
                            } ${currentStatus === 'disponible' ? 'animate-pulse' : ''}`} />
                            {sidebarOpen && (
                                <span className={`text-sm font-medium ${
                                    currentStatus === 'disponible' ? 'text-green-400' :
                                    currentStatus === 'occupe' ? 'text-orange-400' : 'text-red-400'
                                }`}>
                                    {currentStatus === 'disponible' ? 'Disponible' :
                                     currentStatus === 'occupe' ? 'En intervention' : 'Hors service'}
                                </span>
                            )}
                        </div>
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
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                                    {sidebarOpen && (
                                        <>
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {item.id === 'demandes' && demandes.length > 0 && (
                                                <span className="ml-auto bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                    {demandes.length}
                                                </span>
                                            )}
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
                                                    ? 'bg-amber-500/20 text-amber-400' 
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                        >
                                            <IconComponent className="h-5 w-5" />
                                            <span className="text-sm font-medium">{item.label}</span>
                                            {item.id === 'demandes' && demandes.length > 0 && (
                                                <span className="ml-auto bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                                    {demandes.length}
                                                </span>
                                            )}
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
                                    Bienvenue sur votre espace dépanneur
                                </p>
                            </div>
                            
                            {/* Notifications quick access */}
                            <div className="flex items-center gap-2">
                                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                    <Bell className="h-5 w-5" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                                </button>
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

// Sous-composant: Vue d'ensemble
interface OverviewTabProps {
    stats: DepanneurStats;
    currentStatus: StatusDisponibilite;
    onStatusChange: (status: StatusDisponibilite) => void;
    demandes: DemandeAvailable[];
    filters: DemandeFilters;
    onFiltersChange: (filters: DemandeFilters) => void;
    onAccept: (id: number) => void;
    onRefuse: (id: number) => void;
    soundEnabled: boolean;
    onToggleSound: () => void;
    interventionStatus: 'aucune' | 'acceptee' | 'en_cours';
}

function OverviewTab({
    stats,
    currentStatus,
    onStatusChange,
    demandes,
    filters,
    onFiltersChange,
    onAccept,
    onRefuse,
    soundEnabled,
    onToggleSound,
    interventionStatus,
}: OverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Toggle de disponibilité */}
            <AvailabilityToggle 
                currentStatus={currentStatus}
                onStatusChange={onStatusChange}
                interventionActive={interventionStatus !== 'aucune'}
            />

            {/* Stats */}
            <DepanneurStatsCards stats={stats} />

            {/* Demandes et Map */}
            <div className="grid gap-6 lg:grid-cols-2">
                <DemandesStream
                    demandes={demandes}
                    filters={filters}
                    onFiltersChange={onFiltersChange}
                    onAccept={onAccept}
                    onRefuse={onRefuse}
                    soundEnabled={soundEnabled}
                    onToggleSound={onToggleSound}
                />
                <DepanneurMap
                    currentLocation={{ lat: 6.366, lng: 2.433 }}
                    demandes={demandes}
                    rayon={filters.rayon}
                    onRayonChange={(rayon) => onFiltersChange({ ...filters, rayon })}
                    interventionEnCours={interventionStatus !== 'aucune' ? {
                        latitude: 6.366,
                        longitude: 2.433,
                        adresse: 'Cotonou, Rue de la Paix',
                        distance: 3.5,
                        dureeEstimee: 15,
                    } : undefined}
                    onMarkerClick={(id) => console.log('Marqueur click:', id)}
                    onAccepterClick={onAccept}
                />
            </div>

            {/* Intervention en cours ou Notifications */}
            {interventionStatus !== 'aucune' ? (
                <CurrentIntervention
                    status={interventionStatus}
                    onStart={() => console.log('Start')}
                    onEnd={(data) => console.log('End:', data)}
                    onCancel={() => console.log('Cancel')}
                    onCallClient={() => window.open('tel:+22990000001')}
                    onOpenMaps={() => window.open('https://maps.google.com', '_blank')}
                />
            ) : (
                <DepanneurNotifications />
            )}
        </div>
    );
}

