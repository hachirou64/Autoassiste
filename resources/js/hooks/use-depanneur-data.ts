import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
    DepanneurStats, 
    DemandeAvailable, 
    StatusDisponibilite, 
    DepanneurProfile,
    InterventionHistoryItem,
    FinancialStats,
    Facture,
    DepanneurNotification
} from '@/types/depanneur';

// Types pour les données du dépanneur
interface DepanneurData {
    stats: DepanneurStats;
    profile: DepanneurProfile;
    demandes: DemandeAvailable[];
    currentStatus: StatusDisponibilite;
    interventionEnCours?: {
        id: number;
        codeDemande: string;
        client: {
            fullName: string;
            phone: string;
        };
        localisation: string;
        latitude: number;
        longitude: number;
        status: 'acceptee' | 'en_cours';
    } | null;
}

interface InterventionHistoryData {
    data: InterventionHistoryItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

interface FinancialData {
    stats: FinancialStats;
    factures: Facture[];
    revenusParJour: { date: string; jour: string; revenus: number; interventions: number }[];
    revenusParMois: { mois: string; label: string; revenus: number; interventions: number }[];
}

interface UseDepanneurDataReturn {
    data: DepanneurData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    updateStatus: (status: StatusDisponibilite) => Promise<void>;
    acceptDemande: (demandeId: number) => Promise<void>;
    refuseDemande: (demandeId: number) => Promise<void>;
    startIntervention: (demandeId: number) => Promise<void>;
    endIntervention: (data: { montant: number; notes: string }) => Promise<void>;
    
    // Fonctions pour les données dynamiques
    fetchHistory: (filters?: { status?: string; search?: string; date_from?: string; date_to?: string }) => Promise<InterventionHistoryData | null>;
    fetchFinancialData: () => Promise<FinancialData | null>;
    fetchNotifications: () => Promise<DepanneurNotification[] | null>;
    markNotificationRead: (notificationId: number) => Promise<boolean>;
    
    // Gestion du polling
    startPolling: (interval?: number) => void;
    stopPolling: () => void;
    isPolling: boolean;
    lastUpdate: Date | null;
}

// Fonction utilitaire pour les appels API
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
        throw new Error(error.error || error.message || 'Erreur lors de la requête');
    }

    return response.json();
}

export function useDepanneurData(): UseDepanneurDataReturn {
    const [data, setData] = useState<DepanneurData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fonction pour charger les données depuis le backend
    const fetchData = useCallback(async (showLoading = false) => {
        if (showLoading) setLoading(true);
        setError(null);

        try {
            // Récupérer les stats via API
            const statsResponse = await fetchApi<{ stats: DepanneurStats }>('/api/depanneur/stats');
            
            // Récupérer les demandes via API
            const demandesResponse = await fetchApi<{ demandes: DemandeAvailable[] }>('/api/depanneur/demandes');
            
            // Récupérer les notifications
            const notificationsResponse = await fetchApi<{ notifications: DepanneurNotification[] }>('/api/depanneur/notifications');

            setData(prev => prev ? {
                ...prev,
                stats: statsResponse.stats,
                demandes: demandesResponse.demandes,
                notifications: notificationsResponse.notifications,
            } : null);
            
            setLastUpdate(new Date());
            
        } catch (err) {
            console.error('Erreur lors du chargement des données:', err);
            // On ne gère pas l'erreur ici pour ne pas bloquer L'affichage
        } finally {
            if (showLoading) setLoading(false);
        }
    }, []);

    // Charger les données initiales
    useEffect(() => {
        // Initialisation - les données viennent des props
        setLoading(false);
    }, []);

    // Démarrer le polling pour les demandes en temps réel
    const startPolling = useCallback((interval = 10000) => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
        }
        
        setIsPolling(true);
        
        // Fetch immédiat
        fetchData(true);
        
        // Configurer le polling
        pollingIntervalRef.current = setInterval(() => {
            fetchData(false);
        }, interval);
        
        console.log(`Polling started: every ${interval/1000}s`);
    }, [fetchData]);

    // Arrêter le polling
    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setIsPolling(false);
        console.log('Polling stopped');
    }, []);

    // Nettoyer le polling au unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Mettre à jour le statut
    const updateStatus = useCallback(async (status: StatusDisponibilite) => {
        try {
            const result = await fetchApi<{ success: boolean; status: StatusDisponibilite }>('/api/depanneur/status', {
                method: 'POST',
                body: JSON.stringify({ status }),
            });

            if (result.success) {
                setData(prev => prev ? { 
                    ...prev, 
                    currentStatus: result.status,
                    stats: { ...prev.stats, status: result.status }
                } : null);
            }
        } catch (err) {
            console.error('Erreur mise à jour statut:', err);
            throw err;
        }
    }, []);

    // Accepter une demande
    const acceptDemande = useCallback(async (demandeId: number) => {
        try {
            const result = await fetchApi<{ success: boolean; intervention: { id: number } }>(
                `/api/depanneur/demandes/${demandeId}/accepter`,
                { method: 'POST' }
            );

            if (result.success) {
                setData(prev => {
                    if (!prev) return null;
                    
                    const acceptedDemande = prev.demandes.find(d => d.id === demandeId);
                    
                    return {
                        ...prev,
                        demandes: prev.demandes.filter(d => d.id !== demandeId),
                        interventionEnCours: acceptedDemande ? {
                            id: result.intervention.id,
                            codeDemande: acceptedDemande.codeDemande,
                            client: acceptedDemande.client,
                            localisation: acceptedDemande.localisation,
                            latitude: acceptedDemande.latitude,
                            longitude: acceptedDemande.longitude,
                            status: 'acceptee',
                        } : null,
                        currentStatus: 'occupe' as StatusDisponibilite,
                        stats: { ...prev.stats, status: 'occupe' as StatusDisponibilite },
                    };
                });
            }
        } catch (err) {
            console.error('Erreur acceptation demande:', err);
            throw err;
        }
    }, []);

    // Refuser une demande
    const refuseDemande = useCallback(async (demandeId: number) => {
        try {
            const result = await fetchApi<{ success: boolean }>(
                `/api/depanneur/demandes/${demandeId}/refuser`,
                { method: 'POST' }
            );

            if (result.success) {
                setData(prev => prev ? {
                    ...prev,
                    demandes: prev.demandes.filter(d => d.id !== demandeId),
                } : null);
            }
        } catch (err) {
            console.error('Erreur refus demande:', err);
            throw err;
        }
    }, []);

    // Démarrer une intervention
    const startIntervention = useCallback(async (demandeId: number) => {
        try {
            const result = await fetchApi<{ success: boolean }>(
                `/api/depanneur/interventions/${demandeId}/start`,
                { method: 'POST' }
            );

            if (result.success) {
                setData(prev => prev ? {
                    ...prev,
                    interventionEnCours: prev.interventionEnCours ? {
                        ...prev.interventionEnCours,
                        status: 'en_cours',
                    } : undefined,
                } : null);
            }
        } catch (err) {
            console.error('Erreur démarrage intervention:', err);
            throw err;
        }
    }, []);

    // Terminer une intervention
    const endIntervention = useCallback(async (endData: { montant: number; notes: string }) => {
        if (!data?.interventionEnCours) return;

        try {
            const result = await fetchApi<{ success: boolean }>(
                `/api/depanneur/interventions/${data.interventionEnCours.id}/end`,
                {
                    method: 'POST',
                    body: JSON.stringify(endData),
                }
            );

            if (result.success) {
                setData(prev => prev ? {
                    ...prev,
                    interventionEnCours: null,
                    currentStatus: 'disponible' as StatusDisponibilite,
                    stats: {
                        ...prev.stats,
                        status: 'disponible' as StatusDisponibilite,
                        interventions_aujourdhui: prev.stats.interventions_aujourdhui + 1,
                        revenus_aujourdhui: prev.stats.revenus_aujourdhui + endData.montant,
                    },
                } : null);
            }
        } catch (err) {
            console.error('Erreur fin intervention:', err);
            throw err;
        }
    }, [data?.interventionEnCours]);

    // Récupérer l'historique des interventions
    const fetchHistory = useCallback(async (filters?: { 
        status?: string; 
        search?: string; 
        date_from?: string; 
        date_to?: string 
    }): Promise<InterventionHistoryData | null> => {
        try {
            const params = new URLSearchParams();
            if (filters?.status) params.append('status', filters.status);
            if (filters?.search) params.append('search', filters.search);
            if (filters?.date_from) params.append('date_from', filters.date_from);
            if (filters?.date_to) params.append('date_to', filters.date_to);

            const url = `/api/depanneur/interventions/history${params.toString() ? '?' + params.toString() : ''}`;
            const result = await fetchApi<InterventionHistoryData>(url);
            
            return result;
        } catch (err) {
            console.error('Erreur récupération historique:', err);
            return null;
        }
    }, []);

    // Récupérer les données financières
    const fetchFinancialData = useCallback(async (): Promise<FinancialData | null> => {
        try {
            const result = await fetchApi<FinancialData>('/api/depanneur/financial');
            return result;
        } catch (err) {
            console.error('Erreur récupération données financières:', err);
            return null;
        }
    }, []);

    // Récupérer les notifications
    const fetchNotifications = useCallback(async (): Promise<DepanneurNotification[] | null> => {
        try {
            const result = await fetchApi<{ notifications: DepanneurNotification[] }>('/api/depanneur/notifications');
            return result.notifications;
        } catch (err) {
            console.error('Erreur récupération notifications:', err);
            return null;
        }
    }, []);

    // Marquer une notification comme lue
    const markNotificationRead = useCallback(async (notificationId: number): Promise<boolean> => {
        try {
            const result = await fetchApi<{ success: boolean }>(
                `/api/depanneur/notifications/${notificationId}/read`,
                { method: 'POST' }
            );
            return result.success;
        } catch (err) {
            console.error('Erreur marquage notification:', err);
            return false;
        }
    }, []);

    return {
        data,
        loading,
        error,
        refresh: () => fetchData(true),
        updateStatus,
        acceptDemande,
        refuseDemande,
        startIntervention,
        endIntervention,
        fetchHistory,
        fetchFinancialData,
        fetchNotifications,
        markNotificationRead,
        startPolling,
        stopPolling,
        isPolling,
        lastUpdate,
    };
}

