import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';

interface ActiveDemande {
    id: number;
    codeDemande: string;
    status: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
    typePanne: string;
    localisation: string;
    depanneur?: {
        fullName: string;
        etablissement_name: string;
        phone: string;
        estimated_arrival?: string;
        distance?: number;
    };
    createdAt: string;
}

interface UseActiveDemandeReturn {
    activeDemande: ActiveDemande | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    hasPending: boolean;
    hasAccepted: boolean;
    hasInProgress: boolean;
}

export function useActiveDemande(): UseActiveDemandeReturn {
    const { auth } = usePage<SharedData>().props;
    const isClient = auth?.user !== undefined;
    
    const [activeDemande, setActiveDemande] = useState<ActiveDemande | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchActiveDemande = useCallback(async () => {
        if (!isClient || !auth?.user) {
            setActiveDemande(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Simulation de l'API (à remplacer par un vrai appel)
            // const response = await fetch('/api/client/active-demande');
            // const data = await response.json();
            
            // Pour l'instant, retourne null (pas de demande active)
            setActiveDemande(null);
        } catch (err) {
            setError('Erreur lors de la récupération de la demande');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [isClient, auth]);

    useEffect(() => {
        fetchActiveDemande();
        
        // Polling toutes les 30 secondes pour vérifier l'état
        const interval = setInterval(fetchActiveDemande, 30000);
        
        return () => clearInterval(interval);
    }, [fetchActiveDemande]);

    return {
        activeDemande,
        isLoading,
        error,
        refetch: fetchActiveDemande,
        hasPending: activeDemande?.status === 'en_attente',
        hasAccepted: activeDemande?.status === 'acceptee',
        hasInProgress: activeDemande?.status === 'en_cours',
    };
}

// Hook pour le widget SOS avec état
export function useSosWidget() {
    const { activeDemande, isLoading, hasPending, hasAccepted, hasInProgress, refetch } = useActiveDemande();
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusConfig = () => {
        if (!activeDemande) {
            return {
                status: 'idle',
                label: 'Besoin d\'aide?',
                color: 'bg-red-500 hover:bg-red-600',
                icon: '📞',
            };
        }

        switch (activeDemande.status) {
            case 'en_attente':
                return {
                    status: 'pending',
                    label: 'Demande en attente',
                    color: 'bg-amber-500 hover:bg-amber-600',
                    icon: '⏳',
                    details: `${activeDemande.codeDemande} - En recherche de dépanneur`,
                };
            case 'acceptee':
                return {
                    status: 'accepted',
                    label: 'Dépanneur en route',
                    color: 'bg-blue-500 hover:bg-blue-600',
                    icon: '🚗',
                    details: activeDemande.depanneur 
                        ? `${activeDemande.depanneur.fullName} - ${activeDemande.depanneur.estimated_arrival || 'En route'}`
                        : 'Un dépanneur arrive',
                };
            case 'en_cours':
                return {
                    status: 'in_progress',
                    label: 'Intervention en cours',
                    color: 'bg-emerald-500 hover:bg-emerald-600',
                    icon: '🔧',
                    details: `${activeDemande.depanneur?.fullName || 'Dépanneur'} sur place`,
                };
            default:
                return {
                    status: 'idle',
                    label: 'Besoin d\'aide?',
                    color: 'bg-red-500 hover:bg-red-600',
                    icon: '📞',
                };
        }
    };

    const statusConfig = getStatusConfig();

    return {
        activeDemande,
        isLoading,
        isExpanded,
        setIsExpanded,
        statusConfig,
        hasPending,
        hasAccepted,
        hasInProgress,
        refetch,
        canCreateNew: !hasPending && !hasAccepted && !hasInProgress,
    };
}

