// Types pour la gestion des véhicules (Moto & Voiture)

export type VehicleType = 'voiture' | 'moto';

export const VEHICLE_TYPES: { value: VehicleType; label: string; icon: string }[] = [
    { value: 'voiture', label: 'Voiture', icon: '🚗' },
    { value: 'moto', label: 'Moto', icon: '🏍️' },
];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
    voiture: 'Voiture',
    moto: 'Moto',
};

// Types de panne par type de véhicule
export const TYPES_PANNE_VOITURE: { value: string; label: string; icon: string }[] = [
    { value: 'batterie', label: 'Panne de batterie', icon: '🔋' },
    { value: 'moteur', label: 'Problème moteur', icon: '⚙️' },
    { value: 'panne_seche', label: 'Panne sèche', icon: '⛽' },
    { value: 'freins', label: 'Problème de freins', icon: '🛑' },
    { value: 'direction', label: 'Problème de direction', icon: '🎯' },
    { value: 'electrique', label: 'Panne électrique', icon: '⚡' },
    { value: 'carrosserie', label: 'Dégâts carrosserie', icon: '🚗' },
    { value: 'autre', label: 'Autre', icon: '❓' },
];

export const TYPES_PANNE_MOTO: { value: string; label: string; icon: string }[] = [
    { value: 'batterie', label: 'Panne de batterie', icon: '🔋' },
    { value: 'moteur', label: 'Problème moteur', icon: '⚙️' },
    { value: 'panne_seche', label: 'Panne sèche', icon: '⛽' },
    { value: 'creaison', label: 'Créaison', icon: '🛞' },
    { value: 'chaine', label: 'Problème de chaîne', icon: '⛓️' },
    { value: 'embrayage', label: 'Problème embrayage', icon: '⚙️' },
    { value: 'electrique', label: 'Panne électrique', icon: '⚡' },
    { value: 'autre', label: 'Autre', icon: '❓' },
];

export function getTypesPanneByVehicleType(vehicleType: VehicleType): { value: string; label: string; icon: string }[] {
    switch (vehicleType) {
        case 'voiture':
            return TYPES_PANNE_VOITURE;
        case 'moto':
            return TYPES_PANNE_MOTO;
        default:
            return TYPES_PANNE_VOITURE;
    }
}

// Véhicule complet (pour les clients qui ont plusieurs véhicules)
export interface Vehicle {
    id: number;
    type: VehicleType;
    brand: string;
    model: string;
    color: string;
    plate: string;
    year?: number;
    cylindree?: number; // Pour moto uniquement
    isDefault?: boolean;
}

// Données pour la sélection dans le formulaire
export interface VehicleSelectionData {
    vehicleType: VehicleType;
    typePanne: string;
    description: string;
    localisation: string;
    latitude?: number;
    longitude?: number;
    photos?: File[];
}

