import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminStats, AdminAlert, RecentActivity, Client, Depanneur, PaginationParams, TableResponse, Demande, DemandeFilters, ContactMessage, ContactMessageFilters, Intervention, Facture } from '@/types';

// Types pour les données admin
interface AdminData {
    stats: AdminStats | null;
    alerts: AdminAlert[];
    recentActivities: RecentActivity[];
}

interface ClientsData {
    clients: Client[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

interface DepanneursData {
    depanneurs: Depanneur[];
    pagination: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

// Fonction utilitaire pour les options d'authentification
const getAuthOptions = () => ({
    credentials: 'include' as RequestCredentials,
    headers: {
        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        'Content-Type': 'application/json',
    },
});

// Hook principal pour les données admin
export function useAdminData() {
    const [data, setData] = useState<AdminData>({
        stats: null,
        alerts: [],
        recentActivities: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAdminData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const authOptions = getAuthOptions();
            const [statsRes, alertsRes, activitiesRes] = await Promise.all([
                fetch('/admin/api/stats', authOptions),
                fetch('/admin/api/alerts', authOptions),
                fetch('/admin/api/recent-activities', authOptions),
            ]);

            if (!statsRes.ok) throw new Error('Erreur lors du chargement des statistiques');
            if (!alertsRes.ok) throw new Error('Erreur lors du chargement des alertes');
            if (!activitiesRes.ok) throw new Error('Erreur lors du chargement des activités');

            const [statsData, alertsData, activitiesData] = await Promise.all([
                statsRes.json(),
                alertsRes.json(),
                activitiesRes.json(),
            ]);

            setData({
                stats: statsData,
                alerts: alertsData.alerts || alertsData,
                recentActivities: activitiesData.activities || activitiesData,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdminData();
    }, [fetchAdminData]);

    return {
        ...data,
        loading,
        error,
        refresh: fetchAdminData,
    };
}

// Hook pour les clients
export function useAdminClients(initialParams: Partial<PaginationParams> = {}) {
    const [clientsData, setClientsData] = useState<ClientsData>({
        clients: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: initialParams.per_page || 15,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const searchRef = useRef(search);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchClients = useCallback(async (params: Partial<PaginationParams> = {}) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(params.page || 1));
        queryParams.set('per_page', String(params.per_page || 15));
        if (params.sort_by) queryParams.set('sort_by', params.sort_by);
        if (params.sort_order) queryParams.set('sort_order', params.sort_order);
        // Utiliser searchRef pour éviter les problèmes de closure
        if (searchRef.current) queryParams.set('search', searchRef.current);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/clients?${queryParams}`, authOptions);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Erreur lors du chargement des clients`);
            }

            const result = await response.json();
            console.log('[useAdminClients] API Response:', result);

            // Adapter le format selon la réponse de l'API
            if (result.data) {
                setClientsData({
                    clients: result.data,
                    pagination: {
                        current_page: result.current_page,
                        last_page: result.last_page,
                        total: result.total,
                        per_page: result.per_page,
                    },
                });
            } else {
                // Si l'API retourne directement les clients paginés
                setClientsData({
                    clients: result.clients?.data || result,
                    pagination: {
                        current_page: result.clients?.current_page || 1,
                        last_page: result.clients?.last_page || 1,
                        total: result.clients?.total || 0,
                        per_page: result.clients?.per_page || 15,
                    },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, []); // Pas de dépendances - utilise searchRef

    // Effect pour charger les données au montage
    useEffect(() => {
        console.log('[useAdminClients] Composant monté, chargement initial des clients');
        fetchClients();
    }, []); // Vide pour éviter les re-fetches inutiles

    const handleSearch = (query: string) => {
        // Mettre à jour la ref immédiatement
        searchRef.current = query;
        // Mettre à jour l'état pour l'UI
        setSearch(query);

        // Debounce: attendre 300ms avant de refetch
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchClients({ page: 1 }); // Retour à la première page lors d'une recherche
        }, 300);
    };

    const handlePageChange = (page: number) => {
        fetchClients({ page });
    };

    // Cleanup du timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        ...clientsData,
        loading,
        error,
        search,
        setSearch: handleSearch,
        refresh: () => fetchClients(),
        onPageChange: handlePageChange,
        refetch: fetchClients,
    };
}

// Hook pour les depanneurs
export function useAdminDepanneurs(initialParams: Partial<PaginationParams> & { status?: string } = {}) {
    const [depanneursData, setDepanneursData] = useState<DepanneursData>({
        depanneurs: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: initialParams.per_page || 15,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialParams.status || '');

    const fetchDepanneurs = useCallback(async (params: Partial<PaginationParams> = {}) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(params.page || 1));
        queryParams.set('per_page', String(params.per_page || 15));
        if (params.sort_by) queryParams.set('sort_by', params.sort_by);
        if (params.sort_order) queryParams.set('sort_order', params.sort_order);
        if (search) queryParams.set('search', search);
        if (statusFilter) queryParams.set('status', statusFilter);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/depanneurs?${queryParams}`, authOptions);

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des depanneurs');
            }

            const result = await response.json();

            // Adapter le format selon la réponse de l'API
            if (result.data) {
                setDepanneursData({
                    depanneurs: result.data,
                    pagination: {
                        current_page: result.current_page,
                        last_page: result.last_page,
                        total: result.total,
                        per_page: result.per_page,
                    },
                });
            } else {
                setDepanneursData({
                    depanneurs: result.depanneurs?.data || result,
                    pagination: {
                        current_page: result.depanneurs?.current_page || 1,
                        last_page: result.depanneurs?.last_page || 1,
                        total: result.depanneurs?.total || 0,
                        per_page: result.depanneurs?.per_page || 15,
                    },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchDepanneurs();
    }, [fetchDepanneurs]);

    const handleSearch = (query: string) => {
        setSearch(query);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
    };

    const handlePageChange = (page: number) => {
        fetchDepanneurs({ page });
    };

    return {
        ...depanneursData,
        loading,
        error,
        search,
        statusFilter,
        setSearch: handleSearch,
        setStatusFilter: handleStatusFilter,
        refresh: () => fetchDepanneurs(),
        onPageChange: handlePageChange,
        refetch: fetchDepanneurs,
    };
}

// Hook générique pour les requêtes API
export function useApi<T>(
    url: string,
    options: {
        immediate?: boolean;
        onSuccess?: (data: T) => void;
        onError?: (error: Error) => void;
    } = {}
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(options.immediate ?? true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (fetchUrl?: string) => {
        setLoading(true);
        setError(null);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(fetchUrl || url, authOptions);

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            options.onSuccess?.(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            options.onError?.(err instanceof Error ? err : new Error(errorMessage));
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        if (options.immediate !== false) {
            fetchData();
        }
    }, [fetchData, options.immediate]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
}

// Hook pour les demandes admin
export function useAdminDemandes(initialParams: Partial<PaginationParams> & { status?: string } = {}) {
    const [demandesData, setDemandesData] = useState<{
        demandes: Demande[];
        pagination: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
    }>({
        demandes: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: initialParams.per_page || 15,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<DemandeFilters>({});
    const searchRef = useRef('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchDemandes = useCallback(async (params: Partial<PaginationParams> = {}) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(params.page || 1));
        queryParams.set('per_page', String(params.per_page || 15));
        
        if (params.sort_by) queryParams.set('sort_by', params.sort_by);
        if (params.sort_order) queryParams.set('sort_order', params.sort_order);
        
        // Appliquer les filtres
        if (searchRef.current) queryParams.set('search', searchRef.current);
        if (filters.status) queryParams.set('status', filters.status);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/demandes?${queryParams}`, authOptions);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Erreur lors du chargement des demandes`);
            }

            const result = await response.json();
            console.log('[useAdminDemandes] API Response:', result);

            // Adapter le format selon la réponse de l'API
            if (result.data) {
                setDemandesData({
                    demandes: result.data,
                    pagination: {
                        current_page: result.current_page,
                        last_page: result.last_page,
                        total: result.total,
                        per_page: result.per_page,
                    },
                });
            } else {
                setDemandesData({
                    demandes: result.demandes?.data || result,
                    pagination: {
                        current_page: result.demandes?.current_page || 1,
                        last_page: result.demandes?.last_page || 1,
                        total: result.demandes?.total || 0,
                        per_page: result.demandes?.per_page || 15,
                    },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Effect pour charger les données au montage
    useEffect(() => {
        console.log('[useAdminDemandes] Composant monté, chargement initial des demandes');
        fetchDemandes();
    }, []); // Vide pour éviter les re-fetches inutiles

    const handleSearch = (query: string) => {
        searchRef.current = query;
        
        // Debounce: attendre 300ms avant de refetch
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchDemandes({ page: 1 });
        }, 300);
    };

    const handleFilterChange = (newFilters: DemandeFilters) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        fetchDemandes({ page });
    };

    // Cleanup du timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        ...demandesData,
        loading,
        error,
        filters,
        setSearch: handleSearch,
        setFilters: handleFilterChange,
        refresh: () => fetchDemandes(),
        onPageChange: handlePageChange,
        refetch: fetchDemandes,
    };
}

// Hook pour les messages de contact
export function useContactMessages(initialParams: Partial<PaginationParams> & { status?: string } = {}) {
    const [messagesData, setMessagesData] = useState<{
        messages: ContactMessage[];
        pagination: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
        pendingCount: number;
    }>({
        messages: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: initialParams.per_page || 15,
        },
        pendingCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState(initialParams.status || '');
    const searchRef = useRef('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchMessages = useCallback(async (params: Partial<PaginationParams> = {}) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(params.page || 1));
        queryParams.set('per_page', String(params.per_page || 15));
        
        if (params.sort_by) queryParams.set('sort_by', params.sort_by);
        if (params.sort_order) queryParams.set('sort_order', params.sort_order);
        
        // Appliquer les filtres
        if (searchRef.current) queryParams.set('search', searchRef.current);
        if (statusFilter) queryParams.set('status', statusFilter);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/contact/messages?${queryParams}`, authOptions);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Erreur lors du chargement des messages`);
            }

            const result = await response.json();
            console.log('[useContactMessages] API Response:', result);

            // Compter les messages en attente
            const countResponse = await fetch('/admin/api/contact/pending-count', authOptions);
            const countResult = await countResponse.json();

            setMessagesData({
                messages: result.data || result,
                pagination: {
                    current_page: result.current_page || 1,
                    last_page: result.last_page || 1,
                    total: result.total || 0,
                    per_page: result.per_page || 15,
                },
                pendingCount: countResult.count || 0,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    // Effect pour charger les données au montage
    useEffect(() => {
        console.log('[useContactMessages] Composant mounted, chargement initial des messages');
        fetchMessages();
    }, []); // Vide pour éviter les re-fetches inutiles

    // Charger le count des messages en attente
    const fetchPendingCount = useCallback(async () => {
        try {
            const authOptions = getAuthOptions();
            const response = await fetch('/admin/api/contact/pending-count', authOptions);
            const result = await response.json();
            setMessagesData(prev => ({
                ...prev,
                pendingCount: result.count || 0,
            }));
        } catch (err) {
            console.error('Erreur lors du chargement du count:', err);
        }
    }, []);

    const handleSearch = (query: string) => {
        searchRef.current = query;
        
        // Debounce: attendre 300ms avant de refetch
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchMessages({ page: 1 });
        }, 300);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
    };

    const handlePageChange = (page: number) => {
        fetchMessages({ page });
    };

    // Fonction pour marquer un message comme lu
    const markAsRead = useCallback(async (id: number) => {
        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/contact/${id}/mark-read`, {
                ...authOptions,
                method: 'POST',
            });
            const result = await response.json();
            if (result.success) {
                // Mettre à jour le message dans la liste
                setMessagesData(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg => 
                        msg.id === id ? { ...msg, status: 'read' as const, read_at: result.data.read_at } : msg
                    ),
                    pendingCount: Math.max(0, prev.pendingCount - 1),
                }));
            }
            return result;
        } catch (err) {
            console.error('Erreur lors du marquage comme lu:', err);
            throw err;
        }
    }, []);

    // Fonction pour répondre à un message
    const replyToMessage = useCallback(async (id: number, response: string) => {
        try {
            const authOptions = getAuthOptions();
            const res = await fetch(`/admin/api/contact/${id}/reply`, {
                ...authOptions,
                method: 'POST',
                body: JSON.stringify({ response }),
            });
            const result = await res.json();
            if (result.success) {
                // Mettre à jour le message dans la liste
                setMessagesData(prev => ({
                    ...prev,
                    messages: prev.messages.map(msg => 
                        msg.id === id ? { 
                            ...msg, 
                            status: 'replied' as const, 
                            admin_response: response,
                            replied_at: result.data.replied_at 
                        } : msg
                    ),
                }));
            }
            return result;
        } catch (err) {
            console.error('Erreur lors de la réponse:', err);
            throw err;
        }
    }, []);

    // Fonction pour supprimer un message
    const deleteMessage = useCallback(async (id: number) => {
        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/contact/${id}`, {
                ...authOptions,
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                // Retirer le message de la liste
                setMessagesData(prev => ({
                    ...prev,
                    messages: prev.messages.filter(msg => msg.id !== id),
                }));
            }
            return result;
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            throw err;
        }
    }, []);

    // Cleanup du timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        ...messagesData,
        loading,
        error,
        statusFilter,
        setSearch: handleSearch,
        refresh: () => fetchMessages(),
        setStatusFilter: handleStatusFilter,
        refreshPendingCount: fetchPendingCount,
        onPageChange: handlePageChange,
        markAsRead,
        replyToMessage,
        deleteMessage,
    };
}

// Hook pour les interventions admin
export function useAdminInterventions(initialParams: Partial<PaginationParams> & { status?: string } = {}) {
    const [interventionsData, setInterventionsData] = useState<{
        interventions: Intervention[];
        pagination: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
    }>({
        interventions: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: initialParams.per_page || 15,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ status?: string; search?: string }>({});
    const searchRef = useRef('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchInterventions = useCallback(async (params: Partial<PaginationParams> = {}) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(params.page || 1));
        queryParams.set('per_page', String(params.per_page || 15));
        
        if (params.sort_by) queryParams.set('sort_by', params.sort_by);
        if (params.sort_order) queryParams.set('sort_order', params.sort_order);
        
        // Appliquer les filtres
        if (searchRef.current) queryParams.set('search', searchRef.current);
        if (filters.status) queryParams.set('status', filters.status);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/interventions?${queryParams}`, authOptions);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Erreur lors du chargement des interventions`);
            }

            const result = await response.json();
            console.log('[useAdminInterventions] API Response:', result);

            // Adapter le format selon la réponse de l'API
            if (result.data) {
                setInterventionsData({
                    interventions: result.data,
                    pagination: {
                        current_page: result.current_page,
                        last_page: result.last_page,
                        total: result.total,
                        per_page: result.per_page,
                    },
                });
            } else {
                setInterventionsData({
                    interventions: result.interventions?.data || result,
                    pagination: {
                        current_page: result.interventions?.current_page || 1,
                        last_page: result.interventions?.last_page || 1,
                        total: result.interventions?.total || 0,
                        per_page: result.interventions?.per_page || 15,
                    },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Effect pour charger les données au montage
    useEffect(() => {
        console.log('[useAdminInterventions] Composant mounted, chargement initial des interventions');
        fetchInterventions();
    }, []); // Vide pour éviter les re-fetches inutiles

    const handleSearch = (query: string) => {
        searchRef.current = query;
        
        // Debounce: attendre 300ms avant de refetch
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchInterventions({ page: 1 });
        }, 300);
    };

    const handleFilterChange = (newFilters: { status?: string; search?: string }) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        fetchInterventions({ page });
    };

    // Cleanup du timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        ...interventionsData,
        loading,
        error,
        filters,
        setSearch: handleSearch,
        setFilters: handleFilterChange,
        refresh: () => fetchInterventions(),
        onPageChange: handlePageChange,
        refetch: fetchInterventions,
    };
}

// Hook pour les factures admin
export function useAdminFactures(initialParams: Partial<PaginationParams> & { status?: string } = {}) {
    const [facturesData, setFacturesData] = useState<{
        factures: Facture[];
        pagination: {
            current_page: number;
            last_page: number;
            total: number;
            per_page: number;
        };
    }>({
        factures: [],
        pagination: {
            current_page: 1,
            last_page: 1,
            total: 0,
            per_page: initialParams.per_page || 15,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ status?: string; search?: string }>({});
    const searchRef = useRef('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const fetchFactures = useCallback(async (params: Partial<PaginationParams> = {}) => {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        queryParams.set('page', String(params.page || 1));
        queryParams.set('per_page', String(params.per_page || 15));
        
        if (params.sort_by) queryParams.set('sort_by', params.sort_by);
        if (params.sort_order) queryParams.set('sort_order', params.sort_order);
        
        // Appliquer les filtres
        if (searchRef.current) queryParams.set('search', searchRef.current);
        if (filters.status) queryParams.set('status', filters.status);

        try {
            const authOptions = getAuthOptions();
            const response = await fetch(`/admin/api/factures?${queryParams}`, authOptions);

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: Erreur lors du chargement des factures`);
            }

            const result = await response.json();
            console.log('[useAdminFactures] API Response:', result);

            // Adapter le format selon la réponse de l'API
            if (result.data) {
                setFacturesData({
                    factures: result.data,
                    pagination: {
                        current_page: result.current_page,
                        last_page: result.last_page,
                        total: result.total,
                        per_page: result.per_page,
                    },
                });
            } else {
                setFacturesData({
                    factures: result.factures?.data || result,
                    pagination: {
                        current_page: result.factures?.current_page || 1,
                        last_page: result.factures?.last_page || 1,
                        total: result.factures?.total || 0,
                        per_page: result.factures?.per_page || 15,
                    },
                });
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Effect pour charger les données au montage
    useEffect(() => {
        console.log('[useAdminFactures] Composant mounted, chargement initial des factures');
        fetchFactures();
    }, []); // Vide pour éviter les re-fetches inutiles

    const handleSearch = (query: string) => {
        searchRef.current = query;
        
        // Debounce: attendre 300ms avant de refetch
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
            fetchFactures({ page: 1 });
        }, 300);
    };

    const handleFilterChange = (newFilters: { status?: string; search?: string }) => {
        setFilters(newFilters);
    };

    const handlePageChange = (page: number) => {
        fetchFactures({ page });
    };

    // Cleanup du timer
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    return {
        ...facturesData,
        loading,
        error,
        filters,
        setSearch: handleSearch,
        setFilters: handleFilterChange,
        refresh: () => fetchFactures(),
        onPageChange: handlePageChange,
        refetch: fetchFactures,
    };
}

