# Plan d'amélioration du formulaire de demande d'assistance

## Tâches à effectuer

- [ ] Créer la structure wizard (étapes) avec indicateur de progression visuel
- [ ] Refaire la sélection véhicule avec animations et meilleurs effets visuels
- [ ] Améliorer la section localisation avec carte interactive et confirmation visuelle
- [ ] Ajouter validation en temps réel avec messages d'erreur clairs
- [ ] Ajouter écran récapitulatif avant soumission
- [ ] Améliorer le bouton SOS avec animation de chargement

## Détails d'implémentation

### 1. Structure Wizard (3 étapes)
- Étape 1: Véhicule + Type de panne
- Étape 2: Localisation (carte + saisie)
- Étape 3: Récapitulatif + Confirmation

### 2. Sélection véhicule améliorée
- Icônes plus grandes (text-4xl)
- Animation scale au survol
- Animation pulse à la sélection
- Meilleure separation visuelle

### 3. Section localisation
- Carte Google Maps intégrée (si API disponible)
- Bouton de détection de position avec feedback
- Validation de la position
- Option de saisie manuelle

### 4. Validation en temps réel
- Messages d'erreur sous chaque champ
- Bordures colorées (rouge/vert)
- Indicateurs de validation

### 5. Écran récapitulatif
- Liste des informations saisies
- Boutons de modification par section
- Confirmation finale

### 6. Bouton SOS
- Animation de chargement (spinner)
- Désactivation pendant l'envoi
- Confirmation visuelle

## Fichier à modifier
- `resources/js/components/client/demande-form.tsx` - Refonte principale

