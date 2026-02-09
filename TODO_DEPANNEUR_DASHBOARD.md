# TODO Dashboard Dépanneur - Frontend Only

## Phase 1: Types TypeScript ✅
- [x] Créer `resources/js/types/depanneur.ts`
  - [x] DepanneurStats
  - [x] DemandeAvailable
  - [x] InterventionEnCours
  - [x] DepanneurProfile
  - [x] Facture & historique

## Phase 2: Composants UI Base ✅
- [x] Créer `resources/js/components/depanneur/depanneur-stats.tsx`
  - [x] Cartes interventions jour/mois
  - [x] Revenus du jour/mois
  - [x] Note moyenne (étoiles)
  - [x] Nombre demandes acceptées

- [x] Créer `resources/js/components/depanneur/availability-toggle.tsx`
  - [x] Toggle ON/OFF visible
  - [x] Statuts: Disponible / Occupé / Hors service
  - [x] Désactivation auto si intervention
  - [x] Indicateur visuel (pastille vert/rouge)

- [x] Créer `resources/js/components/depanneur/demandes-stream.tsx`
  - [x] Liste actualisée en direct
  - [x] Animation nouvelles demandes
  - [x] Type de panne, distance, description
  - [x] Boutons "Accepter" / "Refuser"
  - [x] Notification sonore
  - [x] Timer de disponibilité

- [x] Créer `resources/js/components/depanneur/depanneur-map.tsx`
  - [x] Carte interactive (simulée)
  - [x] Marqueurs demandes en attente
  - [x] Distance pour chaque demande
  - [x] Filtrage par rayon (5km, 10km, 20km)
  - [x] Zone d'intervention surlignée
  - [x] Clic marqueur pour détails

- [x] Créer `resources/js/components/depanneur/current-intervention.tsx`
  - [x] Carte avec itinéraire vers client
  - [x] Infos client (nom, téléphone)
  - [x] Bouton "Appeler le client"
  - [x] Bouton "Démarrer l'intervention"
  - [x] Formulaire fin d'intervention:
    - [x] Pièces remplacées
    - [x] Observations
    - [x] Coût pièces
    - [x] Coût main d'œuvre
    - [x] Photos du travail

- [x] Créer `resources/js/components/depanneur/intervention-history.tsx`
  - [x] Liste complète interventions passées
  - [x] Filtres: Date, Statut, Montant
  - [x] Export Excel/PDF
  - [x] Détails de chaque intervention
  - [x] Factures générées

- [x] Créer `resources/js/components/depanneur/financial-dashboard.tsx`
  - [x] Graphique revenus (jour/semaine/mois)
  - [x] Factures en attente
  - [x] Factures payées
  - [x] Total des gains
  - [x] Stats par type de service

- [x] Créer `resources/js/components/depanneur/depanneur-notifications.tsx`
  - [x] Nouvelles demandes dans zone
  - [x] Rappels d'interventions
  - [x] Messages système
  - [x] Badge compteur

- [x] Créer `resources/js/components/depanneur/depanneur-profile.tsx`
  - [x] Infos établissement
  - [x] IFU
  - [x] Zones d'intervention
  - [x] Horaires disponibilité
  - [x] Photo/logo

## Phase 3: Page Dashboard ✅
- [x] Créer `resources/js/pages/depanneur-dashboard.tsx`
  - [x] Layout principal avec sidebar
  - [x] Navigation entre onglets
  - [x] Intégration de tous les composants
  - [x] Données mockées pour test

## Phase 4: Routes
- [ ] Ajouter route `/depanneur/dashboard` dans `routes/web.php`

## Fichiers créés:
```
resources/js/
├── types/
│   └── depanneur.ts          ✅
└── components/
    └── depanneur/
        ├── depanneur-stats.tsx                    ✅
        ├── availability-toggle.tsx                ✅
        ├── demandes-stream.tsx                    ✅
        ├── depanneur-map.tsx                      ✅
        ├── current-intervention.tsx                ✅
        ├── intervention-history.tsx                ✅
        ├── financial-dashboard.tsx                 ✅
        ├── depanneur-notifications.tsx             ✅
        └── depanneur-profile.tsx                   ✅

resources/js/pages/
└── depanneur-dashboard.tsx        ✅
```

