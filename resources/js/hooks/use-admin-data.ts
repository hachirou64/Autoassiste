import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdminStats, AdminAlert, RecentActivity, Client, Depanneur, PaginationParams, TableResponse } from '@/types';

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
            const [statsRes, alertsRes, activitiesRes] = await Promise.all([
                fetch('/admin/api/stats'),
                fetch('/admin/api/alerts'),
                fetch('/admin/api/recent-activities'),
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
            const response = await fetch(`/admin/api/clients?${queryParams}`);

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des clients');
            }

            const result = await response.json();

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
        fetchClients();
    }, [fetchClients]);

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
            const response = await fetch(`/admin/api/depanneurs?${queryParams}`);

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
            const response = await fetch(fetchUrl || url);

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

