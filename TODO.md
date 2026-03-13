# TODO: Supprimer fonction en attente de confirmation intervention

## Étapes planifiées (approuvées par l'utilisateur):

1. **[x]** Modifier `app/Models/Intervention.php` (terminé)
   - Supprimer `STATUS_EN_ATTENTE_CONFIRMATION`
   - Nettoyer `getStatutLabelAttribute()`
   - Nettoyer `setStatusAttribute()`

2. **[x]** Modifier `app/Http/Controllers/DashboardController.php` (terminé)
   - `startIntervention()`: passer directement à `'en_cours'`
   - Supprimer `confirmInterventionStart()` et `refuseInterventionStart()`
   - Nettoyer `endIntervention()`

3. **[ ]** Nettoyer routes dans `routes/api.php`
   - Supprimer/commenter confirm-start/refuse-start

4. **[x]** Nettoyer routes dans `routes/web.php` (terminé)
   - Supprimer/commenter confirm-start/refuse-start

5. **[ ]** Nettoyer frontend routes (fichier non trouvé, ignoré)

6. **[ ]** Tester le flux complet
   - Accepter demande → Start → directement en_cours → End

**Statut:** Prêt à implémenter étape par étape
