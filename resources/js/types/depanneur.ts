// Types pour le Dashboard Dépanneur GoAssist

// ==================== STATISTIQUES DÉPANNEUR ====================

export interface DepanneurStats {
    // Stats du jour
    interventions_aujourdhui: number;
    revenus_aujourdhui: number;
    demandes_acceptees_aujourdhui: number;
    note_moyenne_aujourdhui: number;
    
    // Stats du mois
    interventions_mois: number;
    revenus_mois: number;
    demandes_acceptees_mois: number;
    note_moyenne_mois: number;
    
    // Stats globales
    total_interventions: number;
    total_revenus: number;
    note_moyenne: number;
    total_clients: number;
    
    // Intervention en cours
    intervention_en_cours?: InterventionEnCours;
    
    // Statut
    status: 'disponible' | 'occupe' | 'hors_service';
    zones_count: number;
}

// ==================== DEMANDES DISPONIBLES ====================

export interface DemandeAvailable {
    id: number;
    codeDemande: string;
    typePanne: string;
    descriptionProbleme: string;
    localisation: string;
    latitude: number;
    longitude: number;
    distance: number; // en km
    createdAt: string;
    tempsRestant: number; // secondes avant expiration
    
    client: {
        id: number;
        fullName: string;
        phone: string;
        photo?: string;
    };
    
    vehicle?: {
        brand: string;
        model: string;
        color: string;
        plate: string;
    };
    
    localisationClient?: {
        lat: number;
        lng: number;
    };
}

export interface DemandeFilters {
    rayon: number; // 5, 10, 20 km
    typePanne?: string;
    statut?: string;
    vehicleType?: 'voiture' | 'moto' | 'all';
}

// ==================== INTERVENTION EN COURS ====================

// Type simplifié pour les interventions actives (sans les champs de facturation)
export interface ActiveIntervention {
    id: number;
    codeIntervention?: string;
    status: 'acceptee' | 'en_cours';
    demande: {
        id: number;
        codeDemande: string;
        typePanne: string;
        localisation: string;
        latitude: number;
        longitude: number;
        descriptionProbleme?: string;
    };
    client: {
        id: number;
        fullName: string;
        phone: string;
        photo?: string;
    };
    vehicle?: {
        brand: string;
        model: string;
        color: string;
        plate: string;
    } | null;
    startedAt?: string;
}

export interface InterventionEnCours {
    id: number;
    codeIntervention: string;
    status: 'planifiee' | 'acceptee' | 'en_cours' | 'terminee';
    
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
        photo?: string;
    };
    
    vehicle?: {
        brand: string;
        model: string;
        color: string;
        plate: string;
    };
    
    // Données intervention
    startedAt?: string;
    piecesRemplacees?: string;
    observations?: string;
    coutPiece: number;
    coutMainOeuvre: number;
    coutTotal: number;
    
    // Itinéraire
    distanceClient: number;
    dureeEstimee: number; // minutes
    adresseClient: string;
    
    // Photos uploadées
    photos?: string[];
}

export interface InterventionFormData {
    piecesRemplacees: string;
    observations: string;
    coutPiece: number;
    coutMainOeuvre: number;
    photos?: File[];
}

// ==================== PROFIL DÉPANNEUR ====================

export interface DepanneurProfile {
    id: number;
    promoteur_name: string;
    fullName?: string; // Alias pour promoteur_name (pour compatibilité)
    etablissement_name: string;
    IFU?: string;
    email: string;
    phone: string;
    photo?: string;
    logo?: string;
    status: 'disponible' | 'occupe' | 'hors_service';
    isActive: boolean;
    createdAt?: string;
    
    zones?: ZoneIntervention[];
    
    horaires?: HorairesDisponibilite[];
    
    preferences?: {
        notifications_sonores: boolean;
        notifications_sms: boolean;
        notifications_email: boolean;
        auto_accept: boolean;
        rayon_prefere: number;
    };
    
    statistiques?: {
        total_interventions: number;
        note_moyenne: number;
        depuis: string;
    };
    
    // Pour les données API
    type_vehicule?: string;
    localisation_actuelle?: string;
}

export interface ZoneIntervention {
    id: number;
    name: string;
    city: string;
    priorite: number;
    isActive: boolean;
}

export interface HorairesDisponibilite {
    jour: string; // 'lundi', 'mardi', etc.
    debut: string; // '08:00'
    fin: string; // '18:00'
    estActif: boolean;
}

// ==================== ZONES D'INTERVENTION ====================

export interface Zone {
    id: number;
    name: string;
    city: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    rayon?: number;
    priorite: number;
    isActive: boolean;
    createdAt: string;
    demandes_count?: number;
}

// ==================== HISTORIQUE INTERVENTIONS ====================

export interface InterventionHistoryItem {
    id: number;
    codeIntervention: string;
    codeDemande: string;
    date: string;
    typePanne: string;
    status: 'planifiee' | 'en_cours' | 'terminee' | 'annulee';
    
    client: {
        fullName: string;
        phone: string;
    };
    
    vehicle?: {
        brand: string;
        model: string;
        plate: string;
    };
    
    montant: number;
    duree: number; // en minutes
    coutPiece: number;
    coutMainOeuvre: number;
    
    evaluation?: {
        note: number;
        commentaire: string;
    };
    
    facture?: {
        id: number;
        montant: number;
        status: 'en_attente' | 'payee' | 'annulee';
        url?: string;
    };
    
    createdAt: string;
    completedAt?: string;
}

export interface HistoryFilters {
    date_from?: string;
    date_to?: string;
    status?: string;
    montant_min?: number;
    montant_max?: number;
    search?: string;
}

// ==================== FINANCIER & FACTURES ====================

export interface FinancialStats {
    revenus_jour: number;
    revenus_semaine: number;
    revenus_mois: number;
    revenus_total: number;
    
    factures_en_attente: number;
    factures_payees: number;
    factures_annulees: number;
    
    total_factures: number;
    
    interventions_terminees: number;
    interventions_en_cours: number;
    
    meilleur_jour: string;
    meilleur_montant: number;
}

export interface Facture {
    id: number;
    numeroFacture: string;
    montant: number;
    coutPiece: number;
    coutMainOeuvre: number;
    mdePaiement: 'cash' | 'mobile_money' | 'carte_bancaire' | 'virement';
    transactionId?: string;
    status: 'en_attente' | 'payee' | 'annulee' | 'remboursee';
    
    intervention: {
        id: number;
        codeIntervention: string;
        codeDemande: string;
        typePanne: string;
    };
    
    client: {
        fullName: string;
        phone: string;
    };
    
    createdAt: string;
    paidAt?: string;
    
    pdf_url?: string;
}

export interface RevenuChartData {
    date: string;
    revenus: number;
    interventions: number;
}

export interface RevenusParPeriode {
    parJour: RevenuChartData[];
    parSemaine: RevenuChartData[];
    parMois: RevenuChartData[];
}

// ==================== NOTIFICATIONS ====================

export interface DepanneurNotification {
    id: number;
    type: 'nouvelle_demande' | 'rappel' | 'message' | 'system' | 'evaluation';
    titre: string;
    message: string;
    isRead: boolean;
    data?: Record<string, unknown>;
    createdAt: string;
    
    demande?: {
        id: number;
        codeDemande: string;
    };
}

// ==================== ITINÉRAIRE ====================

export interface Itineraire {
    distance: number; // en km
    duree: number; // en minutes
    polyline?: string; // encoded polyline pour Google Maps
    etapes?: Etape[];
}

export interface Etape {
    latitude: number;
    longitude: number;
    adresse: string;
    ordre: number;
}

// ==================== ACTIONS ====================

export interface AcceptDemandeResponse {
    success: boolean;
    message: string;
    intervention?: InterventionEnCours;
}

export interface StartInterventionResponse {
    success: boolean;
    message: string;
    startedAt?: string;
}

export interface EndInterventionResponse {
    success: boolean;
    message: string;
    intervention?: InterventionHistoryItem;
    facture?: Facture;
}

export interface UpdateStatusResponse {
    success: boolean;
    message: string;
    status: 'disponible' | 'occupe' | 'hors_service';
}

// ==================== TYPES DE PANNE ====================

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

export const TYPES_PANNE_DEPANNAGE: { value: TypePanne; label: string; icon: string; color: string }[] = [
    { value: 'panne_seche', label: 'Panne sèche', icon: '⛽', color: 'text-orange-500' },
    { value: 'batterie', label: 'Panne de batterie', icon: '🔋', color: 'text-yellow-500' },
    { value: 'creaison', label: 'Créaison', icon: '🛞', color: 'text-gray-500' },
    { value: 'moteur', label: 'Problème moteur', icon: '⚙️', color: 'text-red-500' },
    { value: 'freins', label: 'Problème de freins', icon: '🛑', color: 'text-red-600' },
    { value: 'direction', label: 'Problème de direction', icon: '🎯', color: 'text-purple-500' },
    { value: 'electrique', label: 'Panne électrique', icon: '⚡', color: 'text-blue-500' },
    { value: 'carrosserie', label: 'Dégâts carrosserie', icon: '🚗', color: 'text-indigo-500' },
    { value: 'autre', label: 'Autre', icon: '❓', color: 'text-slate-500' },
];

// ==================== ÉTATS DISPONIBILITÉ ====================

export const STATUS_DISPONIBILITE = {
    DISPONIBLE: 'disponible' as const,
    OCCUPE: 'occupe' as const,
    HORS_SERVICE: 'hors_service' as const,
};

export type StatusDisponibilite = typeof STATUS_DISPONIBILITE[keyof typeof STATUS_DISPONIBILITE];

export const STATUS_LABELS: Record<StatusDisponibilite, string> = {
    [STATUS_DISPONIBILITE.DISPONIBLE]: 'Disponible',
    [STATUS_DISPONIBILITE.OCCUPE]: 'En intervention',
    [STATUS_DISPONIBILITE.HORS_SERVICE]: 'Hors service',
};

export const STATUS_COLORS: Record<StatusDisponibilite, string> = {
    [STATUS_DISPONIBILITE.DISPONIBLE]: 'bg-green-500 text-white',
    [STATUS_DISPONIBILITE.OCCUPE]: 'bg-orange-500 text-white',
    [STATUS_DISPONIBILITE.HORS_SERVICE]: 'bg-red-500 text-white',
};

export const STATUS_BG_COLORS: Record<StatusDisponibilite, string> = {
    [STATUS_DISPONIBILITE.DISPONIBLE]: 'bg-green-500/10 border-green-500/30',
    [STATUS_DISPONIBILITE.OCCUPE]: 'bg-orange-500/10 border-orange-500/30',
    [STATUS_DISPONIBILITE.HORS_SERVICE]: 'bg-red-500/10 border-red-500/30',
};

