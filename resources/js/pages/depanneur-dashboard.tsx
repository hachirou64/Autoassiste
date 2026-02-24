import { useState, useEffect, useCallback, useRef } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
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
import { DepanneurGeolocationStatus } from '@/components/depanneur/depanneur-geolocation-status';
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
    AlertCircle,
    LogOut
} from 'lucide-react';

// Types
import type { 
    DepanneurStats, 
    DemandeAvailable, 
    ActiveIntervention,
    DemandeFilters,
    StatusDisponibilite,
    DepanneurProfile as DepanneurProfileType,
    DepanneurNotification
} from '@/types/depanneur';

// Types pour les données Inertia
interface DepanneurDashboardProps {
    stats: DepanneurStats | null;
    profile: DepanneurProfileType | null;
    demandes: DemandeAvailable[];
    interventionEnCours: {
        id: number;
        codeIntervention: string;
        status: 'acceptee' | 'en_cours';
        demande: {
            id: number;
            codeDemande: string;
            typePanne: string;
            localisation: string;
            latitude: number;
            longitude: number;
            descriptionProbleme: string;
        };
        client: {
            id: number;
            fullName: string;
            phone: string;
        };
        vehicle?: {
            brand: string;
            model: string;
            color: string;
            plate: string;
        } | null;
        startedAt?: string;
    } | null;
    notifications: DepanneurNotification[];
    currentStatus: string;
    // Nouvelles props pour la géolocalisation dynamique
    geolocationActive?: boolean;
    positionRecente?: boolean;
    error?: string;
}

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { props } = usePage<any>();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    // États pour les données
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DepanneurStats | null>(props.stats);
    const [demandes, setDemandes] = useState<DemandeAvailable[]>(props.demandes || []);
    const [filters, setFilters] = useState<DemandeFilters>({ rayon: 10 });
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<StatusDisponibilite>((props.currentStatus as StatusDisponibilite) || 'disponible');
    const [interventionStatus, setInterventionStatus] = useState<'aucune' | 'acceptee' | 'en_cours'>(
        props.interventionEnCours ? (props.interventionEnCours.status === 'acceptee' ? 'acceptee' : 'en_cours') : 'aucune'
    );
    
    // Extraire la localisation du profil
    const getProfileLocation = () => {
        if (props.profile?.localisation_actuelle) {
            const coords = props.profile.localisation_actuelle.split(',');
            if (coords.length === 2) {
                const lat = parseFloat(coords[0]);
                const lng = parseFloat(coords[1]);
                if (!isNaN(lat) && !isNaN(lng)) {
                    return { lat, lng };
                }
            }
        }
        // Valeur par défaut: Cotonou
        return { lat: 6.366, lng: 2.433 };
    };
    
    const [currentLocation, setCurrentLocation] = useState(getProfileLocation);
    
    // State pour la géolocalisation automatique
    const [geolocationActive, setGeolocationActive] = useState(false);
    
    // Mettre à jour la localisation quand le profil change ou quand la géolocalisation met à jour
    useEffect(() => {
        setCurrentLocation(getProfileLocation());
    }, [props.profile]);
    
    // Callback quand la position est mise à jour par la géolocalisation
    const handleGeolocationUpdate = useCallback((position: { lat: number; lng: number }) => {
        setCurrentLocation(position);
    }, []);
    
    // State pour le suivi de géolocalisation (synchrone avec le hook)
    const [isGeolocationTracking, setIsGeolocationTracking] = useState(false);
    
    // Polling pour les demandes en temps réel
    const [isPolling, setIsPolling] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fonction pour rafraîchir les demandes
    const refreshDemandes = useCallback(async () => {
        try {
            const response = await fetch('/api/depanneur/demandes', {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();
            if (data.demandes) {
                setDemandes(data.demandes);
                setLastUpdate(new Date());
            }
        } catch (error) {
            console.error('Erreur polling:', error);
        }
    }, []);

    // Démarrer le polling
    const startPolling = useCallback((interval = 10000) => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        
        setIsPolling(true);
        
        // Fetch immédiat
        refreshDemandes();
        
        // Configurer le polling
        pollingIntervalRef.current = setInterval(() => {
            refreshDemandes();
        }, interval);
        
        console.log(`Polling started: every ${interval/1000}s`);
    }, [refreshDemandes]);

    // Arrêter le polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsPolling(false);
        console.log('Polling stopped');
    }, []);

    // Démarrer le polling quand le composant est prêt et disponible
    useEffect(() => {
        if (!loading && currentStatus === 'disponible') {
            startPolling(10000); // Poll every 10 seconds
        }
        
        return () => {
            stopPolling();
        };
    }, [loading, currentStatus, startPolling, stopPolling]);

    // Charger les données initiales
    useEffect(() => {
        if (props.error) {
            console.error('Erreur:', props.error);
        }
        setStats(props.stats);
        setDemandes(props.demandes);
        setCurrentStatus((props.currentStatus as StatusDisponibilite) || 'disponible');
        if (props.interventionEnCours) {
            setInterventionStatus(props.interventionEnCours.status === 'acceptee' ? 'acceptee' : 'en_cours');
        }
        
        // Simuler un léger délai pour l'effet de chargement
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [props]);

    // Handlers pour les actions API
    const handleAcceptDemande = useCallback(async (demandeId: number) => {
        try {
            const response = await fetch(`/api/depanneur/demandes/${demandeId}/accepter`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Retirer la demande de la liste
                setDemandes(prev => prev.filter(d => d.id !== demandeId));
                setInterventionStatus('acceptee');
                setCurrentStatus('occupe');
            } else {
                alert(data.error || 'Erreur lors de l\'acceptation');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        }
    }, []);

    const handleRefuseDemande = useCallback(async (demandeId: number) => {
        try {
            const response = await fetch(`/api/depanneur/demandes/${demandeId}/refuser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Retirer la demande de la liste
                setDemandes(prev => prev.filter(d => d.id !== demandeId));
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }, []);

    const handleStatusChange = useCallback(async (newStatus: StatusDisponibilite) => {
        try {
            const response = await fetch('/api/depanneur/status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            
            const data = await response.json();
            
            if (data.success) {
                setCurrentStatus(newStatus);
            } else {
                alert(data.error || 'Erreur lors du changement de statut');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        }
    }, []);

    const handleStartIntervention = useCallback(async () => {
        if (!props.interventionEnCours) return;
        
        try {
            const response = await fetch(`/api/depanneur/interventions/${props.interventionEnCours?.id}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (data.success) {
                setInterventionStatus('en_cours');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        }
    }, [props.interventionEnCours]);

    const handleEndIntervention = useCallback(async (data: any) => {
        if (!props.interventionEnCours) return;
        
        try {
            const response = await fetch(`/api/depanneur/interventions/${props.interventionEnCours?.id}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify(data),
            });
            
            const result = await response.json();
            
            if (result.success) {
                setInterventionStatus('aucune');
                setCurrentStatus('disponible');
                // Rafraîchir les stats
                setStats(prev => prev ? ({
                    ...prev,
                    interventions_aujourdhui: prev.interventions_aujourdhui + 1,
                    revenus_aujourdhui: prev.revenus_aujourdhui + (data.coutPiece + data.coutMainOeuvre),
                }) : null);
            } else {
                alert(result.error || 'Erreur lors de la fin de l\'intervention');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        }
    }, [props.interventionEnCours]);

    const handleCancelIntervention = useCallback(() => {
        setInterventionStatus('aucune');
        setCurrentStatus('disponible');
    }, []);

    const handleCallClient = useCallback(() => {
        if (props.interventionEnCours?.client.phone) {
            window.open(`tel:${props.interventionEnCours.client.phone}`);
        }
    }, [props.interventionEnCours]);

    const handleOpenMaps = useCallback(() => {
        if (props.interventionEnCours?.demande.latitude && props.interventionEnCours?.demande.longitude) {
            window.open(`https://maps.google.com/?q=${props.interventionEnCours.demande.latitude},${props.interventionEnCours.demande.longitude}`, '_blank');
        }
    }, [props.interventionEnCours]);

    const handleLogout = useCallback(() => {
        router.post('/logout');
    }, []);

    // Fonction pour naviguer vers la page de changement de mot de passe
    const handleChangePassword = useCallback(() => {
        router.visit('/settings/password');
    }, []);

    const renderTabContent = () => {
        if (loading) {
            return <LoadingPage text="Chargement de votre espace..." />;
        }

        // Afficher un message d'erreur si pas de profil
        if (!props.profile && !props.error) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Compte non configuré</h2>
                    <p className="text-slate-400">
                        Vous n'avez pas encore de compte dépanneur lié à votre profil.
                    </p>
                </div>
            );
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
                    profile={props.profile}
                    currentLocation={currentLocation}
                    geolocationActive={props.geolocationActive}
                    positionRecente={props.positionRecente}
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
                            currentLocation={currentLocation}
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
                            intervention={props.interventionEnCours ? {
                                id: props.interventionEnCours.id,
                                codeIntervention: props.interventionEnCours.codeIntervention,
                                status: props.interventionEnCours.status,
                                demande: props.interventionEnCours.demande,
                                client: props.interventionEnCours.client,
                                vehicle: props.interventionEnCours.vehicle || undefined,
                                startedAt: props.interventionEnCours.startedAt,
                                coutPiece: 0,
                                coutMainOeuvre: 0,
                                coutTotal: 0,
                                distanceClient: 3.5,
                                dureeEstimee: 15,
                                adresseClient: props.interventionEnCours.demande.localisation,
                            } : undefined}
                            onStart={handleStartIntervention}
                            onEnd={handleEndIntervention}
                            onCancel={handleCancelIntervention}
                            onCallClient={handleCallClient}
                            onOpenMaps={handleOpenMaps}
                        />
                        <DepanneurMap
                            currentLocation={currentLocation}
                            rayon={filters.rayon}
                            onRayonChange={(rayon) => setFilters({ ...filters, rayon })}
                            interventionEnCours={props.interventionEnCours ? {
                                latitude: props.interventionEnCours.demande.latitude,
                                longitude: props.interventionEnCours.demande.longitude,
                                adresse: props.interventionEnCours.demande.localisation,
                                distance: 3.5,
                                dureeEstimee: 15,
                            } : undefined}
                        />
                    </div>
                );
            case 'history':
                return <InterventionHistory />;
            case 'finances':
                return <FinancialDashboard />;
            case 'profile':
                return <DepanneurProfile profile={props.profile || undefined} onChangePassword={handleChangePassword} onLogout={handleLogout} />;
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
                    profile={props.profile}
                    currentLocation={currentLocation}
                    geolocationActive={props.geolocationActive}
                    positionRecente={props.positionRecente}
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
                    
                    {/* Bouton de déconnexion */}
                    <div className="p-2">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            <LogOut className="h-5 w-5 flex-shrink-0" />
                            {sidebarOpen && <span className="text-sm font-medium">Déconnexion</span>}
                        </button>
                    </div>
                    
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
                                    {props.profile 
                                        ? `Bienvenue, ${props.profile.etablissement_name || props.profile.fullName}`
                                        : 'Bienvenue sur votre espace dépanneur'}
                                </p>
                            </div>
                            
                            {/* Notifications quick access */}
                            <div className="flex items-center gap-2">
                                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
                                    <Bell className="h-5 w-5" />
                                    {props.notifications.length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
                                    )}
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
    stats: DepanneurStats | null;
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
    profile?: DepanneurProfileType;
    currentLocation: { lat: number; lng: number };
    // Nouvelles props pour la géolocalisation
    geolocationActive?: boolean;
    positionRecente?: boolean;
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
    profile,
    currentLocation,
    geolocationActive = false,
    positionRecente = false,
}: OverviewTabProps) {
    return (
        <div className="space-y-6">
            {/* Toggle de disponibilité */}
            <AvailabilityToggle 
                currentStatus={currentStatus}
                onStatusChange={onStatusChange}
                interventionActive={interventionStatus !== 'aucune'}
            />

            {/* Composant de géolocalisation automatique */}
            <DepanneurGeolocationStatus 
                showControls={true}
                initialTrackingState={geolocationActive}
                isServerPositionRecent={positionRecente}
                onPositionUpdate={(position) => {
                    // La position sera mise à jour automatiquement via le state
                    console.log('Position mise à jour:', position);
                }}
            />

            {/* Stats */}
            {stats && <DepanneurStatsCards stats={stats} />}

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
                    currentLocation={currentLocation}
                    demandes={demandes}
                    rayon={filters.rayon}
                    onRayonChange={(rayon) => onFiltersChange({ ...filters, rayon })}
                    interventionEnCours={interventionStatus !== 'aucune' ? {
                        latitude: currentLocation.lat,
                        longitude: currentLocation.lng,
                        adresse: 'Position actuelle',
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
                <DepanneurNotifications notifications={[]} />
            )}
        </div>
    );
}

