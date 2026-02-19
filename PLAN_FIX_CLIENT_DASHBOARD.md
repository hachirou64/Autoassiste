# Plan de correction: Problème de redirection dashboard client

## Problème identifié

### Symptôme
Lorsqu'un utilisateur clique sur le lien d'inscription client sans remplir le formulaire, il est redirigé vers un dashboard client qui ne fonctionne pas (affiche des données mockées/erreur).

### Cause racine
1. **Route non protégée**: La route `/client/dashboard` n'a pas le middleware `auth`
2. **Redirection automatique incorrecte**: Dans `register.tsx`, les utilisateurs déjà connectés sont redirigés vers `/client/dashboard` au lieu de leur dashboard approprié basé sur leur type de compte

### Flux problématique
1. Utilisateur connecté visite `/register`
2. Le code détecte `auth?.user` existant
3. Redirection vers `/client/dashboard` 
4. Le dashboard tente de charger les données API
5. Si pas de profil client lié → erreur 403
6. Le dashboard affiche les données mockées par défaut (qui ne fonctionnent pas)

## Corrections à appliquer

### 1. Protéger la route client dashboard
**Fichier**: `routes/web.php`

Ajouter le middleware `auth` à la route `/client/dashboard`:
```php
Route::get('/client/dashboard', function () {
    return Inertia::render('client-dashboard');
})->name('client.dashboard')->middleware('auth');
```

### 2. Améliorer la redirection après inscription
**Fichier**: `resources/js/pages/register.tsx`

Modifier la logique de redirection pour vérifier le type de compte:
- Admin (type 1) → `/admin/dashboard`
- Client (type 2) → `/demande/nouvelle` ou `/client/dashboard`
- Dépanneur (type 3) → `/depanneur/dashboard`

### 3. Améliorer le dashboard client pour gérer les erreurs
**Fichier**: `resources/js/pages/client-dashboard.tsx`

- Afficher un message d'erreur clair si pas de profil client
- Proposer de compléter le profil ou contacter le support

## Fichiers à modifier

1. `routes/web.php` - Ajouter middleware auth
2. `resources/js/pages/register.tsx` - Améliorer redirection
3. `resources/js/pages/client-dashboard.tsx` - Meilleure gestion erreurs

## Étapes de test

1. Tester l'inscription client complète
2. Tester la connexion après inscription
3. Tester l'accès au dashboard sans authentification (doit être redirigé)
4. Tester le dashboard avec un utilisateur sans profil client

