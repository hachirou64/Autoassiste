# Plan d'amélioration du flux inscription-connexion-demande

## Problème identifié

Le flux actuel présente des problèmes:
1. L'inscription via API (`/api/client/register`) appelle `Auth::login()` mais Inertia utilise fetch/XHR qui ne maintient pas automatiquement les cookies de session
2. Après inscription, l'utilisateur est redirigé vers `/demande/nouvelle` mais l'authentification peut ne pas être détectée
3. Le bouton SOS redirige vers `/register` mais sans indicateur clair du flux

## Solution proposée

### 1. Améliorer `ClientRegistrationController`

Modifier pour retourner un redirect Inertia avec établisement de session:

```php
public function register(Request $request)
{
    // Validation
    $validated = $request->validate([...]);
    
    DB::transaction(function() use ($validated) {
        // Créer client + utilisateur + login
    });
    
    // Au lieu de retourner JSON, faire un redirect Inertia
    return to_route('client.dashboard')
        ->with('success', 'Inscription réussie ! Bienvenue sur GoAssist.');
}
```

### 2. Modifier `quick-registration-form.tsx`

Utiliser Inertia `router.post` pour soumettre le formulaire:

```typescript
router.post('/api/client/register', formData, {
    onSuccess: () => {
        // Inertia gère automatiquement la session
        // Redirect vers nouvelle-demande
        router.visit('/demande/nouvelle', { method: 'get' });
    }
});
```

### 3. Améliorer `sos-button.tsx`

Le bouton SOS doit:
- Détecter si utilisateur déjà connecté
- Si connecté: aller directement à `/demande/nouvelle`
- Si non connecté: aller à `/register` avec `pending_demande=true`

### 4. Modifier `nouvelle-demande.tsx`

Vérifier l'auth côté serveur (middleware) plutôt que côté client uniquement

## Fichiers à modifier

1. `app/Http/Controllers/Api/ClientRegistrationController.php`
2. `resources/js/components/auth/quick-registration-form.tsx`
3. `resources/js/components/sos-button.tsx`
4. `resources/js/pages/nouvelle-demande.tsx`
5. `routes/web.php` (éventuellement)

## Flux cible

```
Bouton SOS
    ↓
[Déjà connecté?] → OUI → /demande/nouvelle
    ↓ NON
[pending_demande = true]
    ↓
/register (avec message: "Créez un compte pour continuer")
    ↓
Formulaire inscription (QuickRegistrationForm)
    ↓
router.post('/api/client/register')
    ↓
[Session établie automatiquement]
    ↓
Redirect vers /demande/nouvelle
    ↓
Vérification auth OK
    ↓
Formulaire demande
    ↓
Soumettre demande
    ↓
Confirmation + Dashboard
```

## Actions détaillées

### Étape 1: Modifier ClientRegistrationController

- Retourner une réponse JSON avec `redirect_url` au lieu de try `Auth::login()` pour les API
- Ou utiliser `Auth::login()` + retourner success

### Étape 2: Modifier QuickRegistrationForm

- Utiliser `router.post` d'Inertia pour préserver la session
- Gérer la réponse et redirect vers `/demande/nouvelle`

### Étape 3: Vérifier et tester le flux complet

1. Cliquer SOS → inscription → demande → confirmation
2. Cliquer SOS → si déjà connecté → demande directe
3. Inscription puis connexion → dashboard → nouvelle demande

## Tests à effectuer

- [ ] Inscription nouveau client
- [ ] Connexion client existant
- [ ] Accès à /demande/nouvelle sans auth (doit rediriger vers /register)
- [ ] Création de demande après inscription
- [ ] Accès à /demande/nouvelle avec auth (accès autorisé)

