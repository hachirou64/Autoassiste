# Plan de modifications - Dashboard Client

## Tâche: Modifier le dashboard client
- Remplacer "Accueil" par "Tableau de bord" ✅
- Supprimer la section notifications du dashboard ✅
- Créer un menu de notifications dans le header principal ✅

## Fichiers modifiés:

### 1. resources/js/pages/client-dashboard.tsx
- [x] Remplacer "Accueil" par "Tableau de bord" dans navItems
- [x] Mettre à jour le titre dans getPageTitle()
- [x] Supprimer l'import de ClientNotifications
- [x] Supprimer le composant ClientNotifications de HomeTab

### 2. resources/js/components/app-header.tsx
- [x] Ajouter l'icône Bell (notifications)
- [x] Créer un dropdown menu pour les notifications
- [x] Intégrer les données de notifications avec fetch API

## Résumé des modifications:
1. "Accueil" → "Tableau de bord" dans le menu latéral
2. Section notifications supprimée du dashboard client
3. Nouveau menu notifications ajouté dans le header principal avec:
   - Affichage du nombre de notifications non lues
   - Liste des 10 dernières notifications
   - Possibilité de marquer comme lu
   - Possibilité de tout marquer comme lu

