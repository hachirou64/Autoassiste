// Types pour le Dashboard Admin GoAssist

// ==================== STATISTIQUES ====================

export interface AdminStats {
    // Stats de base
    total_clients: number;
    total_depanneurs: number;
    depanneurs_actifs: number;
    depanneurs_en_attente: number;
    total_zones: number;
    zones_actives: number;
    
    // Stats demandes
    total_demandes: number;
    demandes_en_attente: number;
    demandes_en_cours: number;
    demandes_acceptees: number;
    demandes_terminees: number;
    demandes_annulees: number;
    demandes_aujourdhui: number;
    
    // Stats interventions
    total_interventions: number;
    interventions_en_cours: number;
    interventions_terminees: number;
    interventions_mois: number;
    
    // Stats financieres
    total_factures: number;
    factures_payees: number;
    factures_en_attente: number;
    factures_annulees: number;
    revenu_mois: number;
    revenu_total: number;
    commission_mois: number;
}

// ==================== CLIENTS ====================

export interface Client {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    createdAt: string;
    updatedAt: string;
    demandes_count?: number;
    total_depenses?: number;
}

export interface ClientFormData {
    fullName: string;
    email: string;
    phone: string;
}

// ==================== DEPANNEURS ====================

export interface Depanneur {
    id: number;
    promoteur_name: string;
    etablissement_name: string;
    IFU: string;
    email: string;
    phone: string;
    status: 'disponible' | 'occupe' | 'hors_service';
    isActive: boolean;
    type_vehicule?: string;
    localisation_actuelle?: string;
    createdAt: string;
    updatedAt: string;
    interventions_count?: number;
    total_revenu?: number;
    zones?: Zone[];
}

export interface DepanneurFormData {
    promoteur_name: string;
    etablissement_name: string;
    IFU: string;
    email: string;
    phone: string;
    zones?: number[];
}

// ==================== ZONES ====================

export interface Zone {
    id: number;
    name: string;
    city: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    depanneurs_count?: number;
    demandes_count?: number;
}

export interface ZoneFormData {
    name: string;
    city: string;
    description?: string;
    isActive: boolean;
}

// ==================== DEMANDES ====================

export interface Demande {
    id: number;
    codeDemande: string;
    localisation: string;
    descriptionProbleme: string;
    status: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
    acceptedAt?: string;
    completedAt?: string;
    id_client: number;
    id_depanneur?: number;
    createdAt: string;
    updatedAt: string;
    client?: Client;
    depanneur?: Depanneur;
    interventions?: Intervention[];
    statut_label?: string;
}

export interface DemandeFilters {
    status?: string;
    zone_id?: number;
    date_from?: string;
    date_to?: string;
    search?: string;
}

// ==================== INTERVENTIONS ====================

export interface Intervention {
    id: number;
    piecesremplacees?: string;
    observations?: string;
    coutPiece: number;
    coutMainOeuvre: number;
    coutTotal: number;
    status: 'planifiee' | 'en_cours' | 'terminee';
    startedAt?: string;
    completedAt?: string;
    id_demande: number;
    id_depanneur: number;
    createdAt: string;
    updatedAt: string;
    demande?: Demande;
    depanneur?: Depanneur;
    facture?: Facture;
    duree?: number;
    duree_formatee?: string;
    statut_label?: string;
}

// ==================== FACTURES ====================

export interface Facture {
    id: number;
    montant: number;
    mdePaiement: 'cash' | 'mobile_money' | 'carte_bancaire' | 'virement';
    transactionId: string;
    status: 'en_attente' | 'payee' | 'annulee' | 'remboursee';
    paidAt?: string;
    id_intervention: number;
    createdAt: string;
    updatedAt: string;
    intervention?: Intervention;
    montant_formate?: string;
    statut_label?: string;
    mde_paiement_label?: string;
}

// ==================== NOTIFICATIONS & ALERTES ====================

export interface AdminAlert {
    type: 'warning' | 'danger' | 'info' | 'success';
    title: string;
    message: string;
    action: string;
    count: number;
}

export interface Notification {
    id: number;
    type: string;
    titre: string;
    message: string;
    isRead: boolean;
    data?: Record<string, unknown>;
    createdAt: string;
}

// ==================== ACTIVITES ====================

export interface RecentActivity {
    id: number;
    codeDemande: string;
    status: string;
    status_label: string;
    created_at: string;
    client?: {
        id: number;
        fullName: string;
    };
    depanneur?: {
        id: number;
        etablissement_name: string;
    };
}

// ==================== DONNEES GRAPHIQUES ====================

export interface ChartDataPoint {
    date?: string;
    semaine?: string;
    mois?: string;
    total: number;
    [key: string]: string | number | undefined;
}

export interface TrendsData {
    demandesParJour: ChartDataPoint[];
    demandesParSemaine: ChartDataPoint[];
    demandesParMois: ChartDataPoint[];
    revenusParMois: ChartDataPoint[];
}

export interface TopDepanneur {
    id: number;
    etablissement_name: string;
    promoteur_name: string;
    interventions_count: number;
    total_revenu: number;
    status: string;
    isActive: boolean;
    zones: Array<{
        id: number;
        name: string;
        city: string;
    }>;
}

// ==================== TYPES DE PANNE ====================

export interface Service {
    id: number;
    typeService: string;
    description?: string;
    prixEstime?: number;
    id_demande: number;
    id_depanneur: number;
    createdAt: string;
}

// ==================== PARAMETRES ====================

export interface SystemSettings {
    typesPannes: string[];
    tarifBase: number;
    rayonRecherche: number;
    commissionPourcentage: number;
}

// ==================== RAPPORTS ====================

export interface RapportData {
    trends: TrendsData;
    topDepanneurs: TopDepanneur[];
    statsByZone: Zone[];
    commonIssues: Array<{ type: string; count: number }>;
    revenuMoyen: number;
    dureeMoyenne: number;
}

// ==================== FILTRES TABLEAUX ====================

export interface PaginationParams {
    page: number;
    per_page: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface TableResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

// ==================== ACTIONS ====================

export interface ActionResponse {
    success: boolean;
    message: string;
    data?: Record<string, unknown>;
}

