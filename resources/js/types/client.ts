// Types pour le Dashboard Client GoAssist

export interface ClientStats {
    total_demandes: number;
    demandes_en_cours: number;
    demandes_terminees: number;
    montant_total_depense: number;
    demande_active?: DemandeActive;
}

export interface DemandeActive {
    id: number;
    codeDemande: string;
    status: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee';
    typePanne: string;
    localisation: string;
    latitude?: number;
    longitude?: number;
    depanneur?: AssignedDepanneur;
    estimated_arrival?: string;
    distance?: number;
    // Données de facture pour le paiement
    factureId?: number;
    montant?: number;
    factureStatus?: string;
}

export interface AssignedDepanneur {
    id: number;
    fullName: string;
    etablissement_name: string;
    phone: string;
    photo?: string;
    rating: number;
    localisation?: {
        lat: number;
        lng: number;
    };
}

// Types de panne
export type TypePanne = 
    | 'panne_seche'
    | 'batterie'
    | 'creaison'
    | 'moteur'
    | 'freins'
    | 'direction'
    | 'electrique'
    | 'carrosserie'
    | 'autre';

export const TYPES_PANNE: { value: TypePanne; label: string; icon: string }[] = [
    { value: 'panne_seche', label: 'Panne sèche', icon: '⛽' },
    { value: 'batterie', label: 'Panne de batterie', icon: '🔋' },
    { value: 'creaison', label: 'Créaison', icon: '🛞' },
    { value: 'moteur', label: 'Problème moteur', icon: '⚙️' },
    { value: 'freins', label: 'Problème de freins', icon: '🛑' },
    { value: 'direction', label: 'Problème de direction', icon: '🎯' },
    { value: 'electrique', label: 'Panne électrique', icon: '⚡' },
    { value: 'carrosserie', label: 'Dégâts carrosserie', icon: '🚗' },
    { value: 'autre', label: 'Autre', icon: '❓' },
];

// Formulaire de demande
export interface DemandeFormData {
    vehicleType: 'voiture' | 'moto';
    typePanne: TypePanne;
    description: string;
    localisation: string;
    latitude?: number;
    longitude?: number;
    photos?: File[];
}

// Notifications
export type ClientNotificationType = 
    | 'nouvelle_demande'
    | 'demande_recue'
    | 'demande_acceptee'
    | 'demande_annulee'
    | 'demande_refusee'
    | 'depannage_en_route'
    | 'intervention_terminee'
    | 'paiement_recu'
    | 'compte_active'
    | 'compte_desactivate';

export interface ClientNotification {
    id: number;
    type: ClientNotificationType;
    titre: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    data?: Record<string, unknown>;
}

// Historique des interventions
export interface InterventionHistoryItem {
    id: number;
    codeDemande: string;
    date: string;
    typePanne: string;
    status: string;
    depanneur: {
        fullName: string;
        etablissement_name: string;
        phone: string;
        rating: number;
    };
    montant: number;
    duree: number; // en minutes
    facture?: {
        id: number;
        url: string;
    };
    factureStatus?: string; // 'en_attente' | 'payee' | 'annulee'
    evaluation?: {
        note: number;
        commentaire: string;
    };
}

// Profil utilisateur
export interface UserProfile {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    photo?: string;
    createdAt?: string;
    preferences?: {
        methode_payement_preferee: 'cash' | 'mobile_money' | 'carte_bancaire';
        notifications_sms: boolean;
        notifications_email: boolean;
    };
}

// État de la demande en cours
export type DemandeStatus = 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';

export const DEMANDE_STATUS_LABELS: Record<DemandeStatus, string> = {
    en_attente: 'En attente',
    acceptee: 'Acceptée',
    en_cours: 'En cours',
    terminee: 'Terminée',
    annulee: 'Annulée',
};

export const DEMANDE_STATUS_COLORS: Record<DemandeStatus, string> = {
    en_attente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    acceptee: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    en_cours: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    terminee: 'bg-green-500/20 text-green-400 border-green-500/30',
    annulee: 'bg-red-500/20 text-red-400 border-red-500/30',
};

