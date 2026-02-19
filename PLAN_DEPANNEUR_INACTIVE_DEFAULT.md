# Plan : Inscription Depanneur - Compte inactif par défaut

## Information Gathered

### Analyse du système actuel :
1. **DepanneurController.php** - La méthode `register()` crée le compte avec `isActive => true`
2. **Routes web.php** - Les routes `/register/depanneur` et `/depanneur/register` sont accessibles publiquement (middleware `guest`)
3. **TypeCompte** - Le système utilise TypeCompte pour identifier les types d'utilisateurs (Admin, Client, Depanneur)

### Comportement actuel :
- Quand un depanneur s'inscrit via le formulaire public → `isActive = true` (activé)
- L'admin peut activer/désactiver via les endpoints API

### Comportement souhaité :
- Inscription publique depanneur → `isActive = false` (inactif par défaut)
- L'admin devra activer le compte pour permettre au depanneur de travailler

---

## Plan

### Étape 1 : Modifier le contrôleur DepanneurController

**Fichier :** `app/Http/Controllers/DepanneurController.php`

Modifier la méthode `register()` pour :
- Changer `'isActive' => true` en `'isActive' => false`
- Ajouter un message informant que le compte est en attente d'activation par l'admin

### Étape 2 : Mettre à jour le formulaire frontend (optionnel mais recommandé)

**Fichier :** `resources/js/components/auth/depanneur-registration-form.tsx`

- Ajouter un message d'avertissement après l'inscription indiquant que le compte doit être activé par l'admin

### Étape 3 : Vérifier la cohérence des routes

**Fichier :** `routes/web.php`

- Les routes d'inscription publique restent accessibles (pour permettre l'inscription)
- L'admin peut toujours créer des comptes via l'interface admin

---

## Dependent Files to be Edited

1. `app/Http/Controllers/DepanneurController.php` - Modification principale
2. `resources/js/components/auth/depanneur-registration-form.tsx` - Message d'avertissement

---

## Followup Steps

1. Tester l'inscription d'un nouveau depanneur
2. Vérifier que le compte est bien inactif dans la base de données
3. Vérifier que l'admin peut activer le compte via le tableau de bord admin
4. Tester que le depanneur ne peut pas accepter de demandes quand son compte est inactif

