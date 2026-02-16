# Plan d'amélioration du formulaire de demande d'assistance

## Informations collectées

### Fichiers analysés:
- `resources/js/components/client/demande-form.tsx` - Formulaire principal
- `resources/js/pages/nouvelle-demande.tsx` - Page contenant le formulaire
- `resources/js/types/vehicle.ts` - Types de véhicules et pannes

### État actuel du formulaire:
1. **Structure**: Carte simple avec thème sombre (slate-800/50)
2. **Champs existants**:
   - Type de véhicule (boutons avec icônes)
   - Type de panne (dropdown avec icônes)
   - Localisation (input + bouton géolocalisation)
   - Description (textarea)
   - Sélection de dépanneur sur carte (modale)
   - Bouton SOS de soumission

### Problèmes identifiés:
1. Pas de validation visuelle claire
2. Flux utilisateur non guidé (tout sur une page)
3. Manque d'indicateurs de progression
4. Expérience mobile perfectible
5. Feedback visuel limité lors de la soumission
6. Sections non clairement séparées

---

## Plan d'amélioration

### Phase 1: Refonte visuelle du formulaire (demande-form.tsx)

1. **Ajout d'un indicateur de progression (Wizard)**
   - Étape 1: Véhicule et type de panne
   - Étape 2: Localisation
   - Étape 3: Confirmation

2. **Amélioration de la sélection du type de véhicule**
   - Meilleure présentation visuelle
   - Animation au survol et sélection
   - Icônes plus grandes et visibles

3. **Amélioration de la section localisation**
   - Carte interactive intégrée
   - Confirmation visuelle de la position
   - Option de saisie manuelle OU détection automatique

4. **Ajout de validation en temps réel**
   - Messages d'erreur clairs
   - Indicateurs visuels (borders rouge/vert)

5. **Résumé avant soumission**
   - Récapitulatif des informations saisies
   - Modification possible avant validation

6. **Amélioration du bouton de soumission**
   - Animation de chargement
   - Confirmation visuelle

### Phase 2: Améliorations UX supplémentaires

1. **Sauvegarde automatique** (sessionStorage)
2. **Mode hors ligne** - gestion gracieuse
3. **Accessibilité** - aria-labels, focus visible

---

## Fichiers à modifier

1. `resources/js/components/client/demande-form.tsx` - Refonte principale
2. `resources/js/pages/nouvelle-demande.tsx` - Ajustements mineurs si nécessaire

---

## Étapes de mise en œuvre

1. ✅ Analyser le code existant
2. ⬜ Créer la structure wizard (étapes)
3. ⬜ Refaire la sélection véhicule avec animations
4. ⬜ Améliorer la section localisation
5. ⬜ Ajouter validation en temps réel
6. ⬜ Ajouter écran récapitulatif
7. ⬜ Tester et valider les changements

