// Types pour l'inscription des dépanneurs

export type VehicleTypeDepanneur = 'voiture' | 'moto' | 'tous';

export type PaymentMethod = 'mobile_money' | 'wave' | 'especes' | 'virement';

export type AvailabilityType = '24h' | '08h_20h' | '08h_18h' | 'personnalise';

export interface DepanneurRegistrationData {
    // Informations personnelles
    fullName: string;
    email: string;
    phone: string;
    photo?: File;
    
    // Établissement
    promoteur_name: string;  // Nom du promoteur/responsable
    etablissement_name: string;
    IFU: string;
    
    // Localisation
    adresse: string;
    localisation_actuelle: string;
    latitude?: number;
    longitude?: number;
    
    // Type de véhicules
    type_vehicule: VehicleTypeDepanneur;
    
    // Services
    services: string[];
    
    // Paiement
    methode_payement: PaymentMethod[];
    numero_mobile_money?: string;
    
    // Disponibilité
    disponibilite: AvailabilityType;
    jours_travail: string[];
    horaires_personnalises?: string;
    
    // Mot de passe
    password: string;
    passwordConfirmation: string;
}

export const SERVICES_DISPONIBLES = [
    { id: 'remorquage', label: 'Remorquage', icon: '🚛' },
    { id: 'reparation', label: 'Réparation sur place', icon: '🔧' },
    { id: 'carburant', label: 'Panne de carburant', icon: '⛽' },
    { id: 'pneu', label: 'Changement de pneu', icon: '🛞' },
    { id: 'batterie', label: 'Batterie/Démarrage', icon: '🔋' },
    { id: 'diagnostic', label: 'Diagnostic électronique', icon: '📱' },
    { id: 'climatisation', label: 'Climatisation', icon: '❄️' },
    { id: 'freinage', label: 'Système de freinage', icon: '🛑' },
    { id: 'moteur', label: 'Problème moteur', icon: '⚙️' },
    { id: 'carrosserie', label: 'Réparation carrosserie', icon: '🚗' },
    { id: 'assistance', label: 'Assistance route 24h', icon: '🚨' },
    { id: 'cle', label: 'Perte de clés/Serrurier', icon: '🔑' },
];

export const ZONES_INTERVENTION = [
    { id: 'cotonou', label: 'Cotonou', region: 'Littoral' },
    { id: 'porto-novo', label: 'Porto-Novo', region: 'Ouémé' },
    { id: 'abomey-calavi', label: 'Abomey-Calavi', region: 'Atlantique' },
    { id: 'ouidah', label: 'Ouidah', region: 'Atlantique' },
    { id: 'parakou', label: 'Parakou', region: 'Borgou' },
    { id: 'natitingou', label: 'Natitingou', region: 'Atacora' },
    { id: 'djougou', label: 'Djougou', region: 'Donga' },
    { id: 'lokossa', label: 'Lokossa', region: 'Mono' },
    { id: 'kandi', label: 'Kandi', region: 'Alibori' },
];

export const JOURS_SEMAINE = [
    { id: 'lundi', label: 'Lundi', abbrev: 'L' },
    { id: 'mardi', label: 'Mardi', abbrev: 'Ma' },
    { id: 'mercredi', label: 'Mercredi', abbrev: 'Me' },
    { id: 'jeudi', label: 'Jeudi', abbrev: 'J' },
    { id: 'vendredi', label: 'Vendredi', abbrev: 'V' },
    { id: 'samedi', label: 'Samedi', abbrev: 'S' },
    { id: 'dimanche', label: 'Dimanche', abbrev: 'D' },
];

export const PAYMENT_METHODS = [
    { id: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { id: 'wave', label: 'Wave', icon: '🌊' },
    { id: 'especes', label: 'Espèces', icon: '💵' },
    { id: 'virement', label: 'Virement bancaire', icon: '🏦' },
];

