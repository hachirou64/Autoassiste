import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';
import { StatsCards } from '@/components/admin/stats-cards';
import { AlertsPanel } from '@/components/admin/alerts-panel';
import { RecentActivities } from '@/components/admin/recent-activities';
import { ClientsTable } from '@/components/admin/clients-table';
import { DepanneursTable } from '@/components/admin/depanneurs-table';
import { DemandesTracking } from '@/components/admin/demandes-tracking';
import { InterventionsTracking } from '@/components/admin/interventions-tracking';
import { FinancialReports } from '@/components/admin/financial-reports';
import { AnalyticsCharts, StatusDistribution } from '@/components/admin/analytics-charts';
import {
    LayoutDashboard, Users, Wrench, MapPin, FileText,
    DollarSign, BarChart3, Settings, ChevronRight, Hammer, RefreshCw
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AdminStats, AdminAlert, RecentActivity, TrendsData, Demande, Intervention, Facture } from '@/types';
import { useAdminData, useAdminClients, useAdminDepanneurs } from '@/hooks/use-admin-data';
import { useApi } from '@/hooks/use-admin-data';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin/dashboard' },
];

// Navigation locale avec types simplifiés
interface LocalNavItem {
    title: string;
    href: string;
    icon: LucideIcon;
}

const localNavItems: LocalNavItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Clients', href: '/admin/clients', icon: Users },
    { title: 'Depanneurs', href: '/admin/depanneurs', icon: Wrench },
    { title: 'Demandes', href: '/admin/demandes', icon: FileText },
    { title: 'Interventions', href: '/admin/interventions', icon: Hammer },
    { title: 'Factures', href: '/admin/factures', icon: DollarSign },
    { title: 'Analytiques', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Parametres', href: '/admin/settings', icon: Settings },
];

// Valeurs par défaut pour les stats
const defaultStats: AdminStats = {
    total_clients: 0,
    total_depanneurs: 0,
    depanneurs_actifs: 0,
    depanneurs_en_attente: 0,
    total_zones: 0,
    zones_actives: 0,
    total_demandes: 0,
    demandes_en_attente: 0,
    demandes_en_cours: 0,
    demandes_acceptees: 0,
    demandes_terminees: 0,
    demandes_annulees: 0,
    demandes_aujourdhui: 0,
    total_interventions: 0,
    interventions_en_cours: 0,
    interventions_terminees: 0,
    interventions_mois: 0,
    total_factures: 0,
    factures_payees: 0,
    factures_en_attente: 0,
    factures_annulees: 0,
    revenu_mois: 0,
    revenu_total: 0,
    commission_mois: 0,
};

const defaultAlerts: AdminAlert[] = [];
const defaultActivities: RecentActivity[] = [];
const defaultTrends: TrendsData = {
    demandesParJour: [],
    demandesParSemaine: [],
    demandesParMois: [],
    revenusParMois: [],
};

const defaultDemandes: Demande[] = [];
const defaultInterventions: Intervention[] = [];
const defaultFactures: Facture[] = [];

const defaultPagination = {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
};

type TabType = 'overview' | 'clients' | 'depanneurs' | 'demandes' | 'interventions' | 'financial' | 'analytics';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    // Utiliser les hooks pour récupérer les données dynamiques
    const { 
        stats: dynamicStats, 
        alerts: dynamicAlerts = defaultAlerts, 
        recentActivities: dynamicActivities = defaultActivities,
        loading: loadingAdminData,
        error: errorAdminData,
        refresh: refreshAdminData
    } = useAdminData();
    
    // Utiliser les stats par défaut si les données dynamiques sont null
    const stats = dynamicStats || defaultStats;
    
    // Données pour les clients (dynamiques avec pagination)
    const { 
        clients: dynamicClients = [], 
        pagination: clientsPagination,
        loading: loadingClients,
        refresh: refreshClients,
        setSearch,
        onPageChange
    } = useAdminClients({ per_page: 10 });
    
    // Données pour les depanneurs (dynamiques avec pagination)
    const { 
        depanneurs: dynamicDepanneurs = [], 
        pagination: depanneursPagination,
        loading: loadingDepanneurs,
        refresh: refreshDepanneurs 
    } = useAdminDepanneurs({ per_page: 10 });

    // Fonction de rafraîchissement global
    const handleRefresh = () => {
        refreshAdminData();
        refreshClients();
        refreshDepanneurs();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab stats={stats} alerts={dynamicAlerts} activities={dynamicActivities} />;
            case 'clients': return (
                <ClientsTab 
                    clients={dynamicClients} 
                    pagination={clientsPagination} 
                    isLoading={loadingClients}
                    onSearch={setSearch}
                    onPageChange={onPageChange}
                />
            );
            case 'depanneurs': return <DepanneursTab depanneurs={dynamicDepanneurs} pagination={depanneursPagination} isLoading={loadingDepanneurs} />;
            case 'demandes': return <DemandesTab />;
            case 'interventions': return <InterventionsTab />;
            case 'financial': return <FinancialTab />;
            case 'analytics': return <AnalyticsTab stats={stats} />;
            default: return <OverviewTab stats={stats} alerts={dynamicAlerts} activities={dynamicActivities} />;
        }
    };

    const getPageTitle = (): string => {
        const titles: Record<TabType, string> = {
            overview: 'Vue d\'ensemble',
            clients: 'Gestion des clients',
            depanneurs: 'Gestion des depanneurs',
            demandes: 'Suivi des demandes',
            interventions: 'Suivi des interventions',
            financial: 'Rapports financiers',
            analytics: 'Analytiques',
        };
        return titles[activeTab];
    };

    const getTabFromHref = (href: string): TabType => {
        if (href.includes('clients')) return 'clients';
        if (href.includes('depanneurs')) return 'depanneurs';
        if (href.includes('demandes')) return 'demandes';
        if (href.includes('interventions')) return 'interventions';
        if (href.includes('factures') || href.includes('financial')) return 'financial';
        if (href.includes('analytics') || href.includes('rapports')) return 'analytics';
        return 'overview';
    };

    return (
        <AppHeaderLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - GoAssist" />
            <div className="flex h-full">
                <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
                    <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6 text-blue-400" />
                            {sidebarOpen && <span>Admin Panel</span>}
                        </h2>
                        {sidebarOpen && (
                            <button 
                                onClick={handleRefresh}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                title="Rafraîchir les données"
                            >
                                <RefreshCw className={`h-4 w-4 ${loadingAdminData ? 'animate-spin' : ''}`} />
                            </button>
                        )}
                    </div>
                    <nav className="flex-1 p-2 space-y-1">
                        {localNavItems.map((item) => {
                            const itemTab = getTabFromHref(item.href);
                            const isActive = activeTab === itemTab;
                            const IconComponent = item.icon;

                            return (
                                <button
                                    key={item.title}
                                    onClick={() => setActiveTab(itemTab)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                                    {sidebarOpen && <span className="text-sm font-medium">{item.title}</span>}
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

                <div className="flex-1 overflow-auto bg-slate-950 p-6">
                    <div className="max-w-7xl mx-auto">
                        {errorAdminData && (
                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                                {errorAdminData}
                            </div>
                        )}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white">{getPageTitle()}</h1>
                            <p className="text-slate-400 mt-1">
                                Dashboard d'administration GoAssist - {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </AppHeaderLayout>
    );
}

// Composants d'onglets
interface OverviewTabProps {
    stats: AdminStats;
    alerts: AdminAlert[];
    activities: RecentActivity[];
}

function OverviewTab({ stats, alerts, activities }: OverviewTabProps) {
    return (
        <div className="space-y-6">
            <StatsCards stats={stats} />
            <div className="grid gap-6 lg:grid-cols-2">
                <AlertsPanel alerts={alerts} />
                <RecentActivities activities={activities} />
            </div>
        </div>
    );
}

interface ClientsTabProps {
    clients: import('@/types').Client[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    isLoading: boolean;
    onSearch?: (query: string) => void;
    onPageChange?: (page: number) => void;
}

function ClientsTab({ clients, pagination, isLoading, onSearch, onPageChange }: ClientsTabProps) {
    return (
        <ClientsTable 
            clients={clients} 
            pagination={pagination}
            isLoading={isLoading}
            onSearch={onSearch}
            onPageChange={onPageChange}
        />
    );
}

interface DepanneursTabProps {
    depanneurs: import('@/types').Depanneur[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    isLoading: boolean;
}

function DepanneursTab({ depanneurs, pagination, isLoading }: DepanneursTabProps) {
    return (
        <DepanneursTable 
            depanneurs={depanneurs} 
            pagination={pagination}
            isLoading={isLoading}
        />
    );
}

function DemandesTab() {
    return <DemandesTracking demandes={defaultDemandes} pagination={defaultPagination} />;
}

function InterventionsTab() {
    return <InterventionsTracking interventions={defaultInterventions} pagination={defaultPagination} />;
}

function FinancialTab() {
    return <FinancialReports factures={defaultFactures} pagination={defaultPagination} />;
}

interface AnalyticsTabProps {
    stats: AdminStats;
}

function AnalyticsTab({ stats }: AnalyticsTabProps) {
    const { data: trends } = useApi<TrendsData>('/admin/api/trends', { immediate: true });
    const finalTrends = trends || defaultTrends;
    
    const statusData = [
        { label: 'En attente', value: stats.demandes_en_attente, color: '#eab308' },
        { label: 'Acceptees', value: stats.demandes_acceptees, color: '#3b82f6' },
        { label: 'En cours', value: stats.demandes_en_cours, color: '#f97316' },
        { label: 'Terminees', value: stats.demandes_terminees, color: '#22c55e' },
        { label: 'Annulees', value: stats.demandes_annulees, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            <AnalyticsCharts trends={finalTrends} />
            <div className="grid gap-6 md:grid-cols-2">
                <StatusDistribution data={statusData} title="Répartition des demandes par statut" />
                <StatusDistribution
                    data={[
                        { label: 'Mobile Money', value: 0, color: '#8b5cf6' },
                        { label: 'Especes', value: 0, color: '#10b981' },
                        { label: 'Carte bancaire', value: 0, color: '#3b82f6' },
                        { label: 'Virement', value: 0, color: '#f59e0b' },
                    ]}
                    title="Répartition des paiements"
                />
            </div>
        </div>
    );
}

