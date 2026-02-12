# Configuration Sécurisée de la Connexion et Déconnexion

## Vue d'ensemble

Ce guide explique comment la page de connexion est configurée pour permettre aux utilisateurs de se déconnecter et se reconnecter facilement sans erreur.

## Fonctionnalités principales

### 1. **Gestion des sessions robuste**

#### Middleware SessionTimeout (`app/Http/Middleware/SessionTimeout.php`)
- Vérifie la durée d'inactivité de l'utilisateur
- Timeout par défaut: **120 minutes**
- Déconnecte automatiquement après expiration
- Affiche un message d'erreur approprié

```php
// Durée d'inactivité avant expiration
protected const SESSION_TIMEOUT = 120;
```

#### Détection de session expirée
- Suivi du timestamp de la dernière activité
- Vérification à chaque requête
- Régénération automatique du token CSRF

### 2. **Routes de sécurité renforcées**

#### Routes de connexion/déconnexion
```php
// Route GET - Affiche la page de logout
Route::get('/logout', function () {
    return Inertia::render('logout');
})->name('logout.page');

// Route POST - Effectue la déconnexion
Route::post('/logout', [App\Http\Controllers\AuthController::class, 'logout'])->name('logout');

// Vérification de session
Route::get('/api/auth/check-session', [App\Http\Controllers\AuthController::class, 'checkSession'])->name('api.auth.check-session');

// Réauthentification
Route::post('/api/auth/reauth', [App\Http\Controllers\AuthController::class, 'reauth'])->name('api.auth.reauth');
```

### 3. **Contrôleur d'authentification amélioré**

#### Méthode `logout()`
```php
public function logout(Request $request)
{
    // Vérifier que l'utilisateur est authentifié
    if (Auth::check()) {
        // Log la déconnexion pour audit
        \Log::info('User logged out', [
            'user_id' => $user?->id,
            'email' => $user?->email,
            'timestamp' => now(),
            'ip_address' => $request->ip(),
        ]);
    }

    // Déconnecter l'utilisateur
    Auth::logout();

    // Invalider la session
    $request->session()->invalidate();

    // Régénérer le token CSRF
    $request->session()->regenerateToken();

    // Nettoyer les cookies
    // ...

    return redirect()->route('home')
                   ->with('success', 'Déconnexion réussie.');
}
```

#### Méthode `checkSession()`
- Vérifie le statut de la session actuelle
- Retourne les informations de l'utilisateur et l'expiration
- Utilisée pour détecter les expirations de session

#### Méthode `reauth()`
- Permet la réauthentification après expiration
- Rafraîchit la session de l'utilisateur
- Utilisée pour la continuité de session

### 4. **Page de déconnexion interactif**

#### Fichier: `resources/js/pages/logout.tsx`

**Fonctionnalités:**
- Affiche l'état de déconnexion en temps réel
- Efface les données de session et localStorage
- Redirection automatique après succès
- Gestion des erreurs de déconnexion
- Messages clairs et conseils

**États:**
1. **Loading** - Affiche un spinner
2. **Success** - Message de succès avec conseils de reconnexion
3. **Error** - Message d'erreur avec boutons de retry

```tsx
// États possibles
'loading' | 'success' | 'error'

// Actions
- Réessayer la déconnexion
- Retour à l'accueil
- Redirection automatique
```

### 5. **Hook de gestion des sessions (`useSessionManager`)**

#### Fonction: `checkSession()`
```typescript
// Vérifie le statut actuel de la session
const checkSession = useCallback(async () => {
    // Appel à /api/auth/check-session
    // Retourne: isSessionValid (boolean)
}, []);
```

#### Fonction: `reauthenticate()`
```typescript
// Réauthentifie l'utilisateur automatiquement
const reauthenticate = useCallback(async () => {
    // Appel à /api/auth/reauth
    // Retourne: success (boolean)
}, []);
```

#### Vérification périodique
- Interval: **5 minutes**
- Vérification au retour au premier plan (visibilité)
- Gestion des changements de visibilité

### 6. **Composant LoginForm amélioré**

#### Gestion des tentatives de connexion
```typescript
// Limite: 5 tentatives
if (attemptCount >= 5) {
    setError('Trop de tentatives échouées...');
    return;
}

// Affichage des tentatives restantes
if (newAttemptCount >= 3) {
    const remainingAttempts = 5 - newAttemptCount;
    setError(`... (${remainingAttempts} tentative(s) restante(s))`);
}
```

#### Détection de session expirée
```typescript
const sessionExpired = sessionStorage.getItem('session_expired');
if (sessionExpired) {
    setShowSessionExpiredWarning(true);
    setError('Votre session a expiré. Veuillez vous reconnecter.');
}
```

#### Amélioration des messages d'erreur
- Messages spécifiques par type d'erreur
- Compteur de tentatives
- Affichage des tentatives restantes
- Logs détaillés

### 7. **Flow de déconnexion sécurisée**

```
Utilisateur clique "Déconnexion"
    ↓
Route GET /logout
    ↓
Affiche la page de logout.tsx
    ↓
Effectue POST /logout
    ↓
Contrôleur AuthController::logout()
    ↓
Effacer Auth
Invalider session
Régénérer CSRF
Nettoyer cookies
    ↓
Redirected vers /
```

### 8. **Flow de reconnexion facile**

```
Utilisateur se reconnecter
    ↓
Route GET /login
    ↓
Affiche la page login.tsx
    ↓
Vérifie si déjà authentifié
    ↓
Si oui: Redirect automatique au dashboard
Si non: Affiche le formulaire
    ↓
Utilisateur remplit form
    ↓
POST /login avec email/phone + password
    ↓
AuthController::login()
    ↓
Authentification réussie
    ↓
Auth::login($user, $remember)
Régénérer session
    ↓
Redirect au dashboard approprié
```

## Configuration d'utilisation

### 1. **Enregistrer le middleware**

Ajouter dans `app/Http/Kernel.php`:
```php
protected $middleware = [
    // ...
    \App\Http\Middleware\SessionTimeout::class,
];
```

### 2. **Configurer le timeout**

Dans `.env`:
```env
SESSION_LIFETIME=120
SESSION_TIMEOUT_WARNING=300000  # 5 minutes en ms
```

### 3. **Bouton de déconnexion**

Dans les pages/composants:
```tsx
<button onClick={() => window.location.href = '/logout'}>
    Se déconnecter
</button>

// OU avec Inertia:
import { router } from '@inertiajs/react';

<button onClick={() => router.get('/logout')}>
    Se déconnecter
</button>
```

## Gestion des erreurs courantes

### 1. **"Session expirée"**
**Cause**: Inactivité > 120 minutes
**Solution**: Se reconnecter via la page de login

### 2. **"Trop de tentatives échouées"**
**Cause**: 5 tentatives échouées consécutives
**Solution**: Attendre quelques minutes et réessayer

### 3. **"Les identifiants sont incorrects"**
**Cause**: Email/téléphone ou mot de passe invalide
**Solution**: Vérifier les données ou réinitialiser le mot de passe

### 4. **Erreur de déconnexion**
**Cause**: Problème serveur lors de la déconnexion
**Solution**: Bouton "Réessayer" sur la page de logout

## Sécurité

### 1. **Protections implémentées**
- ✓ Token CSRF régénéré
- ✓ Session invalidée complètement
- ✓ Cookies nettoyés
- ✓ Logs d'audit
- ✓ IP address trackée

### 2. **Sessions sécurisées**
```php
// Dans config/session.php
'secure' => env('SESSION_SECURE_COOKIES', true),
'http_only' => true,
'same_site' => 'lax',
```

### 3. **Rate limiting**
```php
RateLimiter::for('login', function (Request $request) {
    return Limit::perMinute(5)->by($request->session()->get('login.id'));
});
```

## Tests recommandés

### 1. **Test de déconnexion**
```bash
1. Se connecter avec un utilisateur
2. Cliquer sur "Déconnexion"
3. Vérifier que la session est effacée
4. Vérifier la redirection vers l'accueil
```

### 2. **Test de reconnexion**
```bash
1. Après déconnexion, aller sur /login
2. Se reconnecter avec les mêmes identifiants
3. Vérifier la redirection vers le dashboard
4. Vérifier que les données sont correctes
```

### 3. **Test de timeout de session**
```bash
1. Se connecter
2. Attendre 121 minutes sans activité
3. Vérifier la déconnexion automatique
4. Vérifier la redirection vers /login
```

### 4. **Test des tentatives échouées**
```bash
1. Entrer 5 fois des identifiants incorrects
2. Vérifier que la 6ème tentative est bloquée
3. Vérifier que le message d'erreur est clair
```

## Fichiers modifiés/créés

### Créés:
- `/app/Http/Middleware/SessionTimeout.php`
- `/resources/js/pages/logout.tsx`
- `/resources/js/hooks/useSessionManager.ts`
- `/AUTH_CONFIG.md` (ce fichier)

### Modifiés:
- `/app/Http/Controllers/AuthController.php`
  - Amélioré: `logout()`
  - Ajouté: `reauth()`
  - Ajouté: `checkSession()`
- `/routes/web.php`
  - Ajouté: Routes de logout sécurisées
  - Ajouté: Routes API de session
- `/resources/js/components/auth/login-form.tsx`
  - Amélioré: Gestion des tentatives
  - Ajouté: Détection de session expirée
  - Amélioré: Messages d'erreur

## Conclusion

Cette configuration assure que les utilisateurs peuvent:
1. ✓ Se déconnecter de manière sécurisée
2. ✓ Se reconnecter facilement sans erreur
3. ✓ Être informés des expirations de session
4. ✓ Être protégés contre les abus (rate limiting)
5. ✓ Avoir une expérience fluide et transparente
