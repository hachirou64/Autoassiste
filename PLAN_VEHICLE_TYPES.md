# Plan d'implémentation : Types de véhicules (Moto & Voiture)

## Objectif
Ajouter la distinction entre **Moto** et **Voiture** dans l'application AutoAssist pour mieux gérer les types de pannes, les dépanneurs spécialisés, et les tarifs.

---

## Étape 1 : Base de données

### 1.1 Modifier la table `depanneurs`
```sql
ALTER TABLE depanneurs ADD COLUMN type_vehicule ENUM('voiture', 'moto', 'les_deux') DEFAULT 'les_deux';
```

### 1.2 Modifier la table `demandes`
```sql
ALTER TABLE demandes ADD COLUMN vehicle_type ENUM('voiture', 'moto') NOT NULL;
```

### 1.3 Modifier la table `clients` (optionnel - pour stocker les véhicules du client)
```sql
ALTER TABLE clients ADD COLUMN vehicles JSON DEFAULT NULL;
```

---

## Étape 2 : Backend PHP (Laravel)

### 2.1 Modifier `app/Models/Depanneur.php`
- Ajouter `type_vehicule` au `$fillable`
- Ajouter constante `VEHICLE_TYPES`
- Ajouter scope `forVehicleType($type)`

### 2.2 Modifier `app/Models/Demande.php`
- Ajouter `vehicle_type` au `$fillable`
- Créer constantes pour les types

### 2.3 Modifier `app/Http/Controllers/DemandeController.php`
- Valider `vehicle_type` dans `store()`
- Filtrer les dépanneurs par `type_vehicule` dans `findNearbyDepanneurs()`

---

## Étape 3 : Types TypeScript

### 3.1 Créer `resources/js/types/vehicle.ts`
```typescript
export type VehicleType = 'voiture' | 'moto';

export const VEHICLE_TYPES: { value: VehicleType; label: string; icon: string }[] = [
    { value: 'voiture', label: 'Voiture', icon: '🚗' },
    { value: 'moto', label: 'Moto', icon: '🏍️' },
];
```

### 3.2 Modifier `resources/js/types/client.ts`
- Ajouter `vehicleType` à `DemandeFormData`
- Créer types de panne par véhicule

### 3.3 Modifier `resources/js/types/depanneur.ts`
- Ajouter `type_vehicule` à `DemandeFilters`
- Créer `VEHICLE_TYPES_DEPANNAGE`

---

## Étape 4 : Composants Frontend

### 4.1 Modifier `resources/js/components/client/demande-form.tsx`
- Ajouter sélecteur du type de véhicule (radio buttons)
- Afficher types de panne selon le véhicule sélectionné
- Valider le type de véhicule requis

### 4.2 Modifier `resources/js/components/depanneur/demandes-stream.tsx`
- Ajouter filtre par type de véhicule
- Afficher icône du type de véhicule dans les demandes

### 4.3 Modifier `resources/js/components/depanneur/profile.tsx`
- Ajouter sélecteur du type de véhicule pour le dépanneur
- Permettre "voiture", "moto", ou "les_deux"

---

## Étape 5 : Tests et validation

### 5.1 Vérifier
- [ ] Migration réussie
- [ ] Backend valide vehicle_type
- [ ] Frontend affiche les bons types de panne
- [ ] Dépanneurs reçoivent les bonnes demandes

---

## Ordre de priorité
1. Migrations DB
2. Modèles Laravel
3. Types TypeScript
4. Composant demande-form.tsx
5. Backend DemandeController
6. Composant depanneur profile & demandes-stream
7. Tests

