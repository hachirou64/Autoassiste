import { useState, useEffect, useCallback } from 'react';
import type { DepanneurStats, DemandeAvailable, StatusDisponibilite, DepanneurProfile } from '@/types/depanneur';

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
}

export function useDepanneurData(): UseDepanneurDataReturn {
    const [data, setData] = useState<DepanneurData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fonction pour charger les données
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Dans un vrai projet, récupérer depuis l'API
            // const response = await fetch('/api/depanneur/dashboard');
            // const result = await response.json();
            
            // Simulation de données réelles basées sur l'utilisateur connecté
            // Ces données viendraient de l'API
            const mockData: DepanneurData = {
                stats: {
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
                },
                profile: {
                    id: 1,
                    fullName: 'Kouami Toto',
                    email: 'kouami@garage.com',
                    phone: '+229 90 00 11 11',
                    etablissement_name: 'Garage du Centre',
                    rating: 4.8,
                    status: 'disponible',
                },
                demandes: [
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
                ],
                currentStatus: 'disponible',
                interventionEnCours: null,
            };

            setData(mockData);
        } catch (err) {
            setError('Erreur lors du chargement des données');
            console.error('Error fetching depanneur data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Charger les données au montage
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Mettre à jour le statut
    const updateStatus = useCallback(async (status: StatusDisponibilite) => {
        if (!data) return;

        try {
            // Dans un vrai projet:
            // await fetch('/api/depanneur/status', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status }),
            // });

            setData(prev => prev ? { ...prev, currentStatus: status, stats: { ...prev.stats, status } } : null);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    }, [data]);

    // Accepter une demande
    const acceptDemande = useCallback(async (demandeId: number) => {
        if (!data) return;

        try {
            // Dans un vrai projet:
            // await fetch(`/api/demandes/${demandeId}/accepter`, {
            //     method: 'POST',
            // });

            const demande = data.demandes.find(d => d.id === demandeId);
            setData(prev => prev ? {
                ...prev,
                demandes: prev.demandes.filter(d => d.id !== demandeId),
                interventionEnCours: demande ? {
                    id: demande.id,
                    codeDemande: demande.codeDemande,
                    client: demande.client,
                    localisation: demande.localisation,
                    latitude: demande.latitude,
                    longitude: demande.longitude,
                    status: 'acceptee',
                } : null,
                currentStatus: 'occupe',
                stats: { ...prev.stats, status: 'occupe' },
            } : null);
        } catch (err) {
            console.error('Error accepting demande:', err);
        }
    }, [data]);

    // Refuser une demande
    const refuseDemande = useCallback(async (demandeId: number) => {
        if (!data) return;

        try {
            // Dans un vrai projet:
            // await fetch(`/api/demandes/${demandeId}/refuser`, {
            //     method: 'POST',
            // });

            setData(prev => prev ? {
                ...prev,
                demandes: prev.demandes.filter(d => d.id !== demandeId),
            } : null);
        } catch (err) {
            console.error('Error refusing demande:', err);
        }
    }, [data]);

    // Démarrer une intervention
    const startIntervention = useCallback(async (demandeId: number) => {
        if (!data) return;

        try {
            setData(prev => prev ? {
                ...prev,
                interventionEnCours: prev.interventionEnCours ? {
                    ...prev.interventionEnCours,
                    status: 'en_cours',
                } : null,
            } : null);
        } catch (err) {
            console.error('Error starting intervention:', err);
        }
    }, [data]);

    // Terminer une intervention
    const endIntervention = useCallback(async (endData: { montant: number; notes: string }) => {
        if (!data) return;

        try {
            // Dans un vrai projet:
            // await fetch('/api/interventions/end', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(endData),
            // });

            setData(prev => prev ? {
                ...prev,
                interventionEnCours: null,
                currentStatus: 'disponible',
                stats: {
                    ...prev.stats,
                    status: 'disponible',
                    interventions_aujourdhui: prev.stats.interventions_aujourdhui + 1,
                    revenus_aujourdhui: prev.stats.revenus_aujourdhui + endData.montant,
                },
            } : null);
        } catch (err) {
            console.error('Error ending intervention:', err);
        }
    }, [data]);

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        updateStatus,
        acceptDemande,
        refuseDemande,
        startIntervention,
        endIntervention,
    };
}
