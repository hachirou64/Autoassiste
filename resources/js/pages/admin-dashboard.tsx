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
import { useAdminData, useAdminClients, useAdminDepanneurs, useAdminDemandes } from '@/hooks/use-admin-data';
import { useApi } from '@/hooks/use-admin-data';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard Admin', href: '/admin/dashboard' },
];

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
    
    const { 
        stats: dynamicStats, 
        alerts: dynamicAlerts = defaultAlerts, 
        recentActivities: dynamicActivities = defaultActivities,
        loading: loadingAdminData,
        error: errorAdminData,
        refresh: refreshAdminData
    } = useAdminData();
    
    const stats = dynamicStats || defaultStats;
    
    const { 
        clients: dynamicClients = [], 
        pagination: clientsPagination,
        loading: loadingClients,
        refresh: refreshClients,
        setSearch,
        onPageChange
    } = useAdminClients({ per_page: 10 });
    
    const { 
        depanneurs: dynamicDepanneurs = [], 
        pagination: depanneursPagination,
        loading: loadingDepanneurs,
        refresh: refreshDepanneurs,
        setSearch: setDepanneurSearch
    } = useAdminDepanneurs({ per_page: 10 });

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
            case 'depanneurs': return <DepanneursTab depanneurs={dynamicDepanneurs} pagination={depanneursPagination} isLoading={loadingDepanneurs} setSearch={setDepanneurSearch} />;
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

function OverviewTab({ stats, alerts, activities }: { stats: AdminStats; alerts: AdminAlert[]; activities: RecentActivity[] }) {
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

function ClientsTab({ clients, pagination, isLoading, onSearch, onPageChange }: { clients: import('@/types').Client[]; pagination: { current_page: number; last_page: number; total: number; per_page: number }; isLoading: boolean; onSearch?: (query: string) => void; onPageChange?: (page: number) => void }) {
    const [selectedClient, setSelectedClient] = useState<import('@/types').Client | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [editFormData, setEditFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
    });

    const handleView = async (client: import('@/types').Client) => {
        setSelectedClient(client);
        setShowViewModal(true);
    };

    const handleEdit = async (client: import('@/types').Client) => {
        setSelectedClient(client);
        setEditFormData({
            fullName: client.fullName,
            email: client.email,
            phone: client.phone,
        });
        setShowEditModal(true);
    };

    const handleDelete = async (client: import('@/types').Client) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le client "${client.fullName}" ? Cette action est irréversible.`)) {
            return;
        }
        setIsLoadingAction(true);
        try {
            const response = await fetch(`/admin/api/clients/${client.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert('Client supprimé avec succès');
                window.location.reload();
            } else {
                alert(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClient) return;
        
        setIsLoadingAction(true);
        try {
            const response = await fetch(`/admin/api/clients/${selectedClient.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify(editFormData),
            });
            const data = await response.json();
            if (data.success) {
                alert('Client mis à jour avec succès');
                setShowEditModal(false);
                window.location.reload();
            } else {
                alert(data.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur mise à jour:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setIsLoadingAction(false);
        }
    };

    return (
        <>
            <ClientsTable 
                clients={clients} 
                pagination={pagination}
                isLoading={isLoading || isLoadingAction}
                onSearch={onSearch}
                onPageChange={onPageChange}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            
            {/* Modal View Client Details */}
            {showViewModal && selectedClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4">Détails du client</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-slate-400 text-sm">ID</p><p className="text-white">#{selectedClient.id}</p></div>
                            <div><p className="text-slate-400 text-sm">Nom complet</p><p className="text-white">{selectedClient.fullName}</p></div>
                            <div><p className="text-slate-400 text-sm">Email</p><p className="text-white">{selectedClient.email}</p></div>
                            <div><p className="text-slate-400 text-sm">Téléphone</p><p className="text-white">{selectedClient.phone}</p></div>
                            <div><p className="text-slate-400 text-sm">Nombre de demandes</p><p className="text-white">{selectedClient.demandes_count || 0}</p></div>
                            <div><p className="text-slate-400 text-sm">Total dépenses</p><p className="text-white">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(selectedClient.total_depenses || 0)}</p></div>
                            <div><p className="text-slate-400 text-sm">Date d'inscription</p><p className="text-white">{new Date(selectedClient.createdAt).toLocaleDateString('fr-FR')}</p></div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Fermer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Edit Client */}
            {showEditModal && selectedClient && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-white mb-4">Modifier le client</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Nom complet</label>
                                    <input
                                        type="text"
                                        value={editFormData.fullName}
                                        onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoadingAction}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {isLoadingAction ? 'Enregistrement...' : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function DepanneursTab({ depanneurs, pagination, isLoading, setSearch }: { depanneurs: import('@/types').Depanneur[]; pagination: { current_page: number; last_page: number; total: number; per_page: number }; isLoading: boolean; setSearch?: (query: string) => void }) {
    const [selectedDepanneur, setSelectedDepanneur] = useState<import('@/types').Depanneur | null>(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [isLoadingAction, setIsLoadingAction] = useState(false);

    const handleView = async (depanneur: import('@/types').Depanneur) => {
        setSelectedDepanneur(depanneur);
        setShowViewModal(true);
    };

    const handleEdit = async (depanneur: import('@/types').Depanneur) => {
        alert('Fonctionnalité de modification à implémenter');
    };

    const handleValidate = async (depanneur: import('@/types').Depanneur) => {
        if (!confirm('Êtes-vous sûr de vouloir valider l\'IFU de ce dépanneur ?')) {
            return;
        }
        setIsLoadingAction(true);
        try {
            const response = await fetch(`/admin/api/depanneurs/${depanneur.id}/validate-ifu`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert('IFU validé avec succès');
                window.location.reload();
            } else {
                alert(data.message || 'Erreur lors de la validation IFU');
            }
        } catch (error) {
            console.error('Erreur validation IFU:', error);
            alert('Erreur lors de la validation IFU');
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleDelete = async (depanneur: import('@/types').Depanneur) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le dépanneur "${depanneur.etablissement_name}" ? Cette action est irréversible.`)) {
            return;
        }
        setIsLoadingAction(true);
        try {
            const response = await fetch(`/admin/api/depanneurs/${depanneur.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert('Dépanneur supprimé avec succès');
                window.location.reload();
            } else {
                alert(data.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert('Erreur lors de la suppression');
        } finally {
            setIsLoadingAction(false);
        }
    };

    const handleToggleStatus = async (depanneur: import('@/types').Depanneur) => {
        setIsLoadingAction(true);
        try {
            const response = await fetch(`/admin/api/depanneurs/${depanneur.id}/toggle-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                window.location.reload();
            } else {
                alert(data.message || 'Erreur lors du changement de statut');
            }
        } catch (error) {
            console.error('Erreur toggle status:', error);
            alert('Erreur lors du changement de statut');
        } finally {
            setIsLoadingAction(false);
        }
    };

    return (
        <>
            <DepanneursTable 
                depanneurs={depanneurs} 
                pagination={pagination}
                isLoading={isLoading || isLoadingAction}
                onSearch={setSearch}
                onView={handleView}
                onEdit={handleEdit}
                onValidate={handleValidate}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
            />
            {showViewModal && selectedDepanneur && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4">Détails du dépanneur</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-slate-400 text-sm">ID</p><p className="text-white">#{selectedDepanneur.id}</p></div>
                            <div><p className="text-slate-400 text-sm">Établissement</p><p className="text-white">{selectedDepanneur.etablissement_name}</p></div>
                            <div><p className="text-slate-400 text-sm">Promoteur</p><p className="text-white">{selectedDepanneur.promoteur_name}</p></div>
                            <div><p className="text-slate-400 text-sm">IFU</p><p className="text-white">{selectedDepanneur.IFU}</p></div>
                            <div><p className="text-slate-400 text-sm">Email</p><p className="text-white">{selectedDepanneur.email}</p></div>
                            <div><p className="text-slate-400 text-sm">Téléphone</p><p className="text-white">{selectedDepanneur.phone}</p></div>
                            <div><p className="text-slate-400 text-sm">Statut</p><p className="text-white">{selectedDepanneur.status}</p></div>
                            <div><p className="text-slate-400 text-sm">Compte</p><p className="text-white">{selectedDepanneur.isActive ? 'Actif' : 'Inactif'}</p></div>
                            <div><p className="text-slate-400 text-sm">Type véhicule</p><p className="text-white">{selectedDepanneur.type_vehicule}</p></div>
                            <div><p className="text-slate-400 text-sm">Date d'inscription</p><p className="text-white">{new Date(selectedDepanneur.createdAt).toLocaleDateString('fr-FR')}</p></div>
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setShowViewModal(false)} className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Fermer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function DemandesTab() {
    const { 
        demandes: dynamicDemandes = [], 
        pagination: demandesPagination,
        loading: loadingDemandes,
        refresh: refreshDemandes,
        setSearch,
        setFilters,
        onPageChange
    } = useAdminDemandes({ per_page: 15 });

    const handleView = async (demande: import('@/types').Demande) => {
        alert(`Voir les détails de la demande ${demande.codeDemande}`);
    };

    const handleEdit = async (demande: import('@/types').Demande) => {
        alert(`Modifier la demande ${demande.codeDemande}`);
    };

    const handleReassign = async (demande: import('@/types').Demande) => {
        alert(`Réassigner la demande ${demande.codeDemande}`);
    };

    const handleCancel = async (demande: import('@/types').Demande) => {
        if (!confirm(`Êtes-vous sûr de vouloir annuler la demande "${demande.codeDemande}" ?`)) {
            return;
        }
        try {
            const response = await fetch(`/api/demandes/${demande.id}/cancel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                alert('Demande annulée avec succès');
                refreshDemandes();
            } else {
                alert(data.message || 'Erreur lors de l\'annulation');
            }
        } catch (error) {
            console.error('Erreur annulation:', error);
            alert('Erreur lors de l\'annulation');
        }
    };

    return (
        <DemandesTracking 
            demandes={dynamicDemandes} 
            pagination={demandesPagination}
            isLoading={loadingDemandes}
            onPageChange={onPageChange}
            onView={handleView}
            onEdit={handleEdit}
            onReassign={handleReassign}
            onCancel={handleCancel}
        />
    );
}

function InterventionsTab() {
    return <InterventionsTracking interventions={defaultInterventions} pagination={defaultPagination} />;
}

function FinancialTab() {
    return <FinancialReports factures={defaultFactures} pagination={defaultPagination} />;
}

function AnalyticsTab({ stats }: { stats: AdminStats }) {
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

