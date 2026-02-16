# Plan des modifications - Inscription et Activation Dépanneur

## Tâche 1: Ajouter le lien "S'inscrire" sur la page d'accueil ✅ TERMINÉ
- **Fichier**: `resources/js/pages/home.tsx`

## Tâche 2: Créer une nouvelle page avec deux boutons d'inscription ✅ TERMINÉ
- **Fichier créé**: `resources/js/pages/choose-register.tsx`

## Tâche 3: Ajouter la route pour la nouvelle page ✅ TERMINÉ
- **Fichier**: `routes/web.php`

## Tâche 4: Système de notification pour le dépanneur ✅ TERMINÉ

### 4a) Indicateur visuel sur le dashboard
- **Fichier**: `resources/js/components/depanneur/depanneur-profile.tsx`

### 4b) Notification dans le dashboard
- **Fichiers modifiés**: 
  - `app/Http/Controllers/DepanneurController.php`
  - `app/Models/Notification.php`

---

## Résumé

### Fichiers modifiés:
1. `resources/js/pages/home.tsx` - Bouton S'inscrire
2. `resources/js/pages/choose-register.tsx` - NOUVEAU
3. `routes/web.php` - Route /choose-register
4. `app/Http/Controllers/DepanneurController.php` - Notifications
5. `app/Models/Notification.php` - Types ajoutés
6. `resources/js/components/depanneur/depanneur-profile.tsx` - Badge visuel

### Fonctionnalités:
- ✅ Bouton "S'inscrire" sur page d'accueil
- ✅ Page avec deux boutons (client/dépanneur)
- ✅ Redirection vers inscriptions
- ✅ Badge visuel profil dépanneur
- ✅ Notification activation/désactivation

