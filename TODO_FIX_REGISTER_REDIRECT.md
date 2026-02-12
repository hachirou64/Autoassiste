# Plan de correction - Inscription Inertia

## Problème
Lors de l'inscription d'un client, une réponse JSON simple est reçue au lieu d'une réponse Inertia valide, causant une page blanche avec le message d'erreur.

## Solution
Modifier le contrôleur pour retourner une réponse Inertia avec un flash message au lieu de JSON.

## Étapes

### Étape 1: Modifier ClientRegistrationController ✅
- [x] Changer la réponse JSON en réponse Inertia avec redirect et flash message

### Étape 2: Mettre à jour les routes ✅
- [x] La route `/api/client/register` pointait vers le contrôleur API
- [x] Créer une route web POST pour l'inscription qui utilise Inertia (`/client/register`)

### Étape 3: Mettre à jour le formulaire frontend ✅
- [x] Modifier quick-registration-form.tsx pour utiliser la route web au lieu de l'API
- [x] Gérer le flash message dans nouvelle-demande.tsx pour l'afficher sur la page

### Étape 4: Configurer les flash messages dans le middleware ✅
- [x] Ajouter la configuration des flash messages dans HandleInertiaRequests
- [x] Ajouter le type TypeScript pour FlashData

## Changements spécifiques

### Fichier: app/Http/Controllers/Api/ClientRegistrationController.php
```php
// AVANT
return response()->json([...], 201);

// APRÈS
return to_route('demande.nouvelle')
    ->with('success', 'Inscription réussie ! Bienvenue sur GoAssist.')
    ->with('user', [...]);
```

### Fichier: routes/web.php
```php
// Route web pour l'inscription client (retourne une réponse Inertia)
Route::post('/client/register', [App\Http\Controllers\Api\ClientRegistrationController::class, 'register'])->name('client.register.web');
```

### Fichier: resources/js/components/auth/quick-registration-form.tsx
```javascript
// AVANT
router.post('/api/client/register', {...});

// APRÈS
router.post('/client/register', {...});
```

### Fichier: app/Http/Middleware/HandleInertiaRequests.php
```php
'flash' => [
    'success' => $request->session()->get('success'),
    'error' => $request->session()->get('error'),
    'warning' => $request->session()->get('warning'),
    'info' => $request->session()->get('info'),
],
```

### Fichier: resources/js/pages/nouvelle-demande.tsx
```javascript
// Afficher le message de succès
{successMessage && (
    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 flex items-center gap-3">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium">{successMessage}</span>
    </div>
)}
```

## Résultat
L'inscription fonctionne maintenant correctement :
1. L'utilisateur remplit le formulaire d'inscription
2. Après soumission, Inertia traite la réponse correctement
3. L'utilisateur est redirigé vers `/demande/nouvelle`
4. Le message "Inscription réussie ! Bienvenue sur GoAssist" s'affiche sur la page

