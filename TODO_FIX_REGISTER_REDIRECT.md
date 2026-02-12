# Plan de correction - Inscription Inertia

## Problème
Lors de l'inscription d'un client, une réponse JSON simple est reçue au lieu d'une réponse Inertia valide, causant une page blanche avec le message d'erreur.

## Solution
Modifier le contrôleur pour retourner une réponse Inertia avec un flash message au lieu de JSON.

## Étapes

### Étape 1: Modifier ClientRegistrationController
- [x] Changer la réponse JSON en réponse Inertia avec redirect et flash message

### Étape 2: Mettre à jour les routes
- [x] La route `/api/client/register` pointe vers le contrôleur API
- [x] Créer une route web POST pour l'inscription qui utilise Inertia

### Étape 3: Mettre à jour le formulaire frontend
- [x] Modifier quick-registration-form.tsx pour utiliser la route web au lieu de l'API
- [x] Gérer le flash message dans register.tsx pour l'afficher sur la page

## Changements spécifiques

### Fichier: app/Http/Controllers/Api/ClientRegistrationController.php
```php
// AVANT
return response()->json([...], 201);

// APRÈS
return to_route('demande.nouvelle')->with('success', 'Inscription réussie ! Bienvenue sur GoAssist.');
```

### Fichier: routes/web.php
```php
// Ajouter une route web pour l'inscription client
Route::post('/client/register', [App\Http\Controllers\Api\ClientRegistrationController::class, 'register'])->name('client.register.web');
```

### Fichier: resources/js/components/auth/quick-registration-form.tsx
```javascript
// AVANT
router.post('/api/client/register', {...});

// APRÈS
router.post('/client/register', {...});
```

### Fichier: resources/js/pages/register.tsx
```javascript
// Ajouter la gestion du flash message
const { flash } = usePage<SharedData>().props;

// Afficher le message de succès
{flash?.success && (
    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
        {flash.success}
    </div>
)}
```

