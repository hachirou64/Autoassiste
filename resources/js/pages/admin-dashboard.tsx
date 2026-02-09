import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import type { BreadcrumbItem } from '@/types';
import { StatsCards } from '@/components/admin/stats-cards';
import { AlertsPanel } from '@/components/admin/alerts-panel';
import { RecentActivities } from '@/components/admin/recent-activities';
import { ClientsTable } from '@/components/admin/clients-table';
import { DepanneursTable } from '@/components/admin/depanneurs-table';
import { ZonesManagement } from '@/components/admin/zones-management';
import { DemandesTracking } from '@/components/admin/demandes-tracking';
import { InterventionsTracking } from '@/components/admin/interventions-tracking';
import { FinancialReports } from '@/components/admin/financial-reports';
import { AnalyticsCharts, StatusDistribution } from '@/components/admin/analytics-charts';
import {
    LayoutDashboard, Users, Wrench, MapPin, FileText,
    DollarSign, BarChart3, Settings, ChevronRight, Hammer
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AdminStats, AdminAlert, RecentActivity, Client, Depanneur, Zone, Demande, Intervention, Facture, TrendsData } from '@/types';

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
    { title: 'Zones', href: '/admin/zones', icon: MapPin },
    { title: 'Demandes', href: '/admin/demandes', icon: FileText },
    { title: 'Interventions', href: '/admin/interventions', icon: Hammer },
    { title: 'Factures', href: '/admin/factures', icon: DollarSign },
    { title: 'Analytiques', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Parametres', href: '/admin/settings', icon: Settings },
];

const mockStats: AdminStats = {
    total_clients: 12,
    total_depanneurs: 8,
    depanneurs_actifs: 5,
    depanneurs_en_attente: 10,
    total_zones: 6,
    zones_actives: 4,
    total_demandes: 6,
    demandes_en_attente: 2,
    demandes_en_cours: 1,
    demandes_acceptees: 2,
    demandes_terminees: 1,
    demandes_annulees: 0,
    demandes_aujourdhui: 10,
    total_interventions: 8,
    interventions_en_cours: 4,
    interventions_terminees: 4,
    interventions_mois: 5,
    total_factures: 8,
    factures_payees: 4,
    factures_en_attente:4,
    factures_annulees: 0,
    revenu_mois: 50000,
    revenu_total: 1200000,
    commission_mois: 5000,
};

const mockAlerts: AdminAlert[] = [
    { type: 'warning', title: 'Depanneurs en attente de validation', message: '11 nouveaux depanneurs attendent la validation de leur IFU', action: '/admin/depanneurs?status=pending', count: 11 },
    { type: 'danger', title: 'Demandes critiques', message: '5 demandes sont en attente depuis plus de 2 heures', action: '/admin/demandes?priority=high', count: 5 },
    { type: 'info', title: 'Maintenance systeme', message: 'Une mise a jour est prevue ce soir a 2h00', action: '/admin/settings', count: 1 },
];

const mockActivities: RecentActivity[] = [
    { id: 1, codeDemande: 'DEM-2024-001', status: 'en_attente', status_label: 'En attente', created_at: new Date().toISOString(), client: { id: 1, fullName: 'Jean Dupont' } },
    { id: 2, codeDemande: 'DEM-2024-002', status: 'en_cours', status_label: 'En cours', created_at: new Date(Date.now() - 3600000).toISOString(), client: { id: 2, fullName: 'Marie Martin' }, depanneur: { id: 1, etablissement_name: 'Garage du Centre' } },
    { id: 3, codeDemande: 'DEM-2024-003', status: 'terminee', status_label: 'Terminee', created_at: new Date(Date.now() - 7200000).toISOString(), client: { id: 3, fullName: 'Pierre Durand' }, depanneur: { id: 2, etablissement_name: 'Depannage Rapide' } },
];

const mockTrends: TrendsData = {
    demandesParJour: [], demandesParSemaine: [],
    demandesParMois: [
        { mois: 'Jan', total: 15 }, { mois: 'Fev', total: 25 }, { mois: 'Mar', total: 30 },
        { mois: 'Avr', total: 45 }, { mois: 'Mai', total: 27 }, { mois: 'Juin', total: 64 },
    ],
    revenusParMois: [
        { mois: 'Jan', total: 50000 }, { mois: 'Fev', total: 120000 }, { mois: 'Mar', total: 18 },
        { mois: 'Avr', total: 175000 }, { mois: 'Mai', total: 200000 }, { mois: 'Juin', total: 300000 },
    ],
};

type TabType = 'overview' | 'clients' | 'depanneurs' | 'zones' | 'demandes' | 'interventions' | 'financial' | 'analytics';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'clients': return <ClientsTab />;
            case 'depanneurs': return <DepanneursTab />;
            case 'zones': return <ZonesTab />;
            case 'demandes': return <DemandesTab />;
            case 'interventions': return <InterventionsTab />;
            case 'financial': return <FinancialTab />;
            case 'analytics': return <AnalyticsTab />;
            default: return <OverviewTab />;
        }
    };

    const getPageTitle = (): string => {
        const titles: Record<TabType, string> = {
            overview: 'Vue d\'ensemble',
            clients: 'Gestion des clients',
            depanneurs: 'Gestion des depanneurs',
            zones: 'Gestion des zones',
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
        if (href.includes('zones')) return 'zones';
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
                    <div className="p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <LayoutDashboard className="h-6 w-6 text-blue-400" />
                            {sidebarOpen && <span>Admin Panel</span>}
                        </h2>
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

function OverviewTab() {
    return (
        <div className="space-y-6">
            <StatsCards stats={mockStats} />
            <div className="grid gap-6 lg:grid-cols-2">
                <AlertsPanel alerts={mockAlerts} />
                <RecentActivities activities={mockActivities} />
            </div>
            <AnalyticsCharts trends={mockTrends} />
        </div>
    );
}

function ClientsTab() {
    const mockClients: Client[] = [
        { id: 1, fullName: 'Jean Dupont', email: 'jean@example.com', phone: '+229 90 00 00 01', createdAt: '2024-01-15', updatedAt: '2024-06-20', demandes_count: 5, total_depenses: 150000 },
        { id: 2, fullName: 'Marie Martin', email: 'marie@example.com', phone: '+229 90 00 00 02', createdAt: '2024-02-20', updatedAt: '2024-06-18', demandes_count: 3, total_depenses: 85000 },
        { id: 3, fullName: 'Pierre Durand', email: 'pierre@example.com', phone: '+229 90 00 00 03', createdAt: '2024-03-10', updatedAt: '2024-06-15', demandes_count: 8, total_depenses: 220000 },
    ];
    return <ClientsTable clients={mockClients} pagination={{ current_page: 1, last_page: 5, total: 1247, per_page: 10 }} />;
}

function DepanneursTab() {
    const mockDepanneurs: Depanneur[] = [
        { id: 1, promoteur_name: 'Kouami Toto', etablissement_name: 'Garage du Centre', IFU: '123456789', email: 'contact@centre.com', phone: '+229 90 00 11 11', status: 'disponible', isActive: true, createdAt: '2024-01-10', updatedAt: '2024-06-20', interventions_count: 156, total_revenu: 4500000, zones: [] },
        { id: 2, promoteur_name: 'Aime Sika', etablissement_name: 'Depannage Rapide', IFU: '987654321', email: 'contact@rapide.com', phone: '+229 90 00 22 22', status: 'occupe', isActive: true, createdAt: '2024-02-15', updatedAt: '2024-06-20', interventions_count: 98, total_revenu: 3200000, zones: [] },
        { id: 3, promoteur_name: 'Paul Agossou', etablissement_name: 'Service Auto', IFU: '456789123', email: 'contact@auto.com', phone: '+229 90 00 33 33', status: 'disponible', isActive: true, createdAt: '2024-03-01', updatedAt: '2024-06-19', interventions_count: 67, total_revenu: 2100000, zones: [] },
    ];
    return <DepanneursTable depanneurs={mockDepanneurs} pagination={{ current_page: 1, last_page: 10, total: 89, per_page: 10 }} />;
}

function ZonesTab() {
    const mockZones: Zone[] = [
        { id: 1, name: 'Centre-Ville', city: 'Cotonou', description: 'Zone du centre-ville de Cotonou', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-06-01', depanneurs_count: 15, demandes_count: 456 },
        { id: 2, name: 'Godomey', city: 'Abomey-Calavi', description: 'Zone de Godomey et environs', isActive: true, createdAt: '2024-01-15', updatedAt: '2024-05-20', depanneurs_count: 8, demandes_count: 234 },
        { id: 3, name: 'Pahou', city: 'Ouidah', description: 'Zone de Pahou', isActive: false, createdAt: '2024-02-01', updatedAt: '2024-04-15', depanneurs_count: 3, demandes_count: 89 },
    ];
    return <ZonesManagement zones={mockZones} pagination={{ current_page: 1, last_page: 2, total: 15, per_page: 10 }} />;
}

function DemandesTab() {
    const mockDemandes: Demande[] = [
        { id: 1, codeDemande: 'DEM-2024-001', localisation: 'Cotonou, Rue de la Paix', descriptionProbleme: 'Voiture qui ne demarre pas', status: 'en_attente', id_client: 1, createdAt: '2024-06-20T10:00:00', updatedAt: '2024-06-20T10:00:00', client: { id: 1, fullName: 'Jean Dupont', email: 'jean@example.com', phone: '+229 90 00 00 01', createdAt: '2024-01-15', updatedAt: '2024-06-20' } },
        { id: 2, codeDemande: 'DEM-2024-002', localisation: 'Abomey-Calavi, Rue des Ecoles', descriptionProbleme: 'Panne de batterie', status: 'en_cours', id_client: 2, id_depanneur: 1, createdAt: '2024-06-20T09:30:00', updatedAt: '2024-06-20T09:45:00', client: { id: 2, fullName: 'Marie Martin', email: 'marie@example.com', phone: '+229 90 00 00 02', createdAt: '2024-02-20', updatedAt: '2024-06-18' }, depanneur: { id: 1, promoteur_name: 'Kouami Toto', etablissement_name: 'Garage du Centre', IFU: '123456789', email: 'contact@centre.com', phone: '+229 90 00 11 11', status: 'disponible', isActive: true, createdAt: '2024-01-10', updatedAt: '2024-06-20' } },
        { id: 3, codeDemande: 'DEM-2024-003', localisation: 'Porto-Novo, Avenue de la Liberte', descriptionProbleme: 'Creaison de pneumatic', status: 'terminee', id_client: 3, id_depanneur: 2, createdAt: '2024-06-19T14:00:00', updatedAt: '2024-06-19T16:30:00', client: { id: 3, fullName: 'Pierre Durand', email: 'pierre@example.com', phone: '+229 90 00 00 03', createdAt: '2024-03-10', updatedAt: '2024-06-15' }, depanneur: { id: 2, promoteur_name: 'Aime Sika', etablissement_name: 'Depannage Rapide', IFU: '987654321', email: 'contact@rapide.com', phone: '+229 90 00 22 22', status: 'occupe', isActive: true, createdAt: '2024-02-15', updatedAt: '2024-06-20' } },
    ];
    return <DemandesTracking demandes={mockDemandes} pagination={{ current_page: 1, last_page: 50, total: 3456, per_page: 10 }} />;
}

function InterventionsTab() {
    const mockInterventions: Intervention[] = [
        { id: 1, piecesremplacees: 'Batterie 12V', observations: 'Remplacement effectif', coutPiece: 25000, coutMainOeuvre: 5000, coutTotal: 30000, status: 'terminee', id_demande: 2, id_depanneur: 1, createdAt: '2024-06-20T09:45:00', updatedAt: '2024-06-20T11:00:00', completedAt: '2024-06-20T11:00:00', demande: { id: 2, codeDemande: 'DEM-2024-002', localisation: '', descriptionProbleme: '', status: 'terminee', id_client: 2, createdAt: '', updatedAt: '' }, depanneur: { id: 1, promoteur_name: 'Kouami Toto', etablissement_name: 'Garage du Centre', IFU: '123456789', email: 'contact@centre.com', phone: '+229 90 00 11 11', status: 'disponible', isActive: true, createdAt: '', updatedAt: '' }, duree: 75, duree_formatee: '1h 15min' },
        { id: 2, piecesremplacees: 'Pneu avant gauche', coutPiece: 18000, coutMainOeuvre: 4000, coutTotal: 22000, status: 'en_cours', id_demande: 4, id_depanneur: 2, createdAt: '2024-06-20T08:00:00', updatedAt: '2024-06-20T10:30:00' },
        { id: 3, piecesremplacees: 'Bougies d\'allumage', coutPiece: 12000, coutMainOeuvre: 8000, coutTotal: 20000, status: 'planifiee', id_demande: 5, id_depanneur: 3, createdAt: '2024-06-20T07:00:00', updatedAt: '2024-06-20T07:00:00' },
    ];
    return <InterventionsTracking interventions={mockInterventions} pagination={{ current_page: 1, last_page: 40, total: 2987, per_page: 10 }} />;
}

function FinancialTab() {
    const mockFactures: Facture[] = [
        { id: 1, montant: 30000, mdePaiement: 'mobile_money', transactionId: 'TXN-001234', status: 'payee', id_intervention: 1, createdAt: '2024-06-20T11:00:00', updatedAt: '2024-06-20T11:05:00', paidAt: '2024-06-20T11:05:00', statut_label: 'Payee', mde_paiement_label: 'Mobile Money' },
        { id: 2, montant: 22000, mdePaiement: 'cash', transactionId: 'TXN-001235', status: 'en_attente', id_intervention: 2, createdAt: '2024-06-20T10:30:00', updatedAt: '2024-06-20T10:30:00', statut_label: 'En attente', mde_paiement_label: 'Especes' },
        { id: 3, montant: 45000, mdePaiement: 'carte_bancaire', transactionId: 'TXN-001236', status: 'payee', id_intervention: 3, createdAt: '2024-06-19T16:00:00', updatedAt: '2024-06-19T16:10:00', paidAt: '2024-06-19T16:10:00', statut_label: 'Payee', mde_paiement_label: 'Carte bancaire' },
    ];
    return <FinancialReports factures={mockFactures} pagination={{ current_page: 1, last_page: 30, total: 2854, per_page: 10 }} />;
}

function AnalyticsTab() {
    const statusData = [
        { label: 'En attente', value: 23, color: '#eab308' },
        { label: 'Acceptees', value: 67, color: '#3b82f6' },
        { label: 'En cours', value: 45, color: '#f97316' },
        { label: 'Terminees', value: 3210, color: '#22c55e' },
        { label: 'Annulees', value: 111, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            <AnalyticsCharts trends={mockTrends} />
            <div className="grid gap-6 md:grid-cols-2">
                <StatusDistribution data={statusData} title="Repartition des demandes par statut" />
                <StatusDistribution
                    data={[
                        { label: 'Mobile Money', value: 1456, color: '#8b5cf6' },
                        { label: 'Especes', value: 987, color: '#10b981' },
                        { label: 'Carte bancaire', value: 312, color: '#3b82f6' },
                        { label: 'Virement', value: 99, color: '#f59e0b' },
                    ]}
                    title="Repartition des paiements"
                />
            </div>
        </div>
    );
}

