# Guide Rapide - Configuration Sécurisée de Connexion

## 🎯 Qu'est-ce qui a changé?

La page de connexion est maintenant complètement sécurisée avec:
- **Déconnexion facile** - Un clic pour se déconnecter
- **Reconnexion simple** - Pas d'erreur de session
- **Protection automatique** - Timeout après 120 minutes d'inactivité
- **Gestion intelligente** - Vérification périodique toutes les 5 minutes

---

## 📱 Utilisation pour l'utilisateur final

### Se déconnecter:
```
1. Cliquez sur "Se déconnecter" (coin haut droit)
2. Attendez le message "Déconnexion réussie"
3. Vous êtes redirigé vers l'accueil
```

### Se reconnecter:
```
1. Allez sur la page login: /login
2. Entrez votre email ou téléphone
3. Entrez votre mot de passe
4. Cliquez "Se connecter"
5. Vous êtes redirigé à votre dashboard
```

### Si la session expire:
```
1. Vous voyez le message "Session expirée"
2. Allez sur /login
3. Reconnectez-vous avec les mêmes identifiants
4. Le système se souvient de vos données
```

---

## 👨‍💻 Utilisation pour les développeurs

### Ajouter un bouton "Se déconnecter"

#### Simple (avec lien HTML):
```tsx
<a href="/logout" className="btn">
    Se déconnecter
</a>
```

#### Avec Inertia:
```tsx
import { router } from '@inertiajs/react';

<button onClick={() => router.get('/logout')}>
    Se déconnecter
</button>
```

#### Avec confirmation:
```tsx
<button 
    onClick={() => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
            router.get('/logout');
        }
    }}
>
    Se déconnecter
</button>
```

---

### Vérifier le statut de la session

#### Utiliser le hook personnalisé:
```tsx
import { useSessionManager } from '@/hooks/useSessionManager';

export function MyComponent() {
    const { isSessionValid, error, reauthenticate } = useSessionManager();

    if (!isSessionValid) {
        return <div>Session invalide - Redirecting...</div>;
    }

    return <div>Content protégé</div>;
}
```

#### Vérification manuelle:
```tsx
const checkSession = async () => {
    const response = await fetch('/api/auth/check-session');
    if (response.status === 401) {
        // Session expirée
        window.location.href = '/login';
    }
};
```

---

### Afficher un message d'erreur de session

```tsx
import { SessionErrorModal } from '@/hooks/useSessionManager';

<SessionErrorModal
    isOpen={!isSessionValid}
    error={error}
    onRetry={checkSession}
    onRedirect={(path) => window.location.href = path}
/>
```

---

## ⚙️ Configuration

### Variables d'environnement (`.env`):

```env
# Durée de la session (en minutes)
SESSION_LIFETIME=120

# Durée avant avertissement de session expirée (en ms)
SESSION_TIMEOUT_WARNING=300000
```

### Modifier le timeout:

1. Éditer `/app/Http/Middleware/SessionTimeout.php`:
```php
protected const SESSION_TIMEOUT = 120; // Changer ce nombre
```

2. Éditer `.env`:
```env
SESSION_LIFETIME=120  # Mettre la même valeur
```

---

## 🔒 Sécurité

### Ce qui est protégé:

- ✅ Tokens CSRF régénérés
- ✅ Sessions invalidées complètement
- ✅ Cookies sécurisés (HttpOnly, Secure, SameSite)
- ✅ IP address loggée pour audit
- ✅ Rate limiting (5 tentatives max)
- ✅ Logs de toutes les déconnexions

### Ne pas divulguer:

- ❌ Les tokens de session
- ❌ Les cookies de session
- ❌ Les mots de passe

---

## 🐛 Dépannage

### Problème: "Session expirée"
**Solution**: Se reconnecter sur /login avec les mêmes identifiants

### Problème: "Trop de tentatives échouées"
**Solution**: Attendre quelques minutes avant de réessayer

### Problème: "Déconnexion échouée"
**Solution**: Cliquer "Réessayer" sur la page de logout

### Problème: "Les identifiants sont incorrects"
**Solution**: 
- Vérifier l'email/téléphone
- Vérifier le mot de passe
- Réinitialiser le mot de passe si oublié

---

## 📊 Tests

### Test 1: Déconnexion basique
```
✓ Se connecter
✓ Cliquer "Déconnexion"
✓ Vérifier le message de succès
✓ Vérifier la redirection vers /
✓ Essayer d'accéder à /client/dashboard → Redirect /login
```

### Test 2: Reconnexion
```
✓ Après déconnexion, aller à /login
✓ Se reconnecter avec les mêmes identifiants
✓ Vérifier la redirection au dashboard
✓ Vérifier que les données sont intactes
```

### Test 3: Timeout (120 minutes)
```
✓ Se connecter
✓ Attendre 121 minutes sans activité
✓ Essayer une action
✓ Vérifier la déconnexion automatique
✓ Vérifier la redirection à /login
```

### Test 4: Tentatives échouées
```
✓ Aller à /login
✓ Entrer 5 fois un mot de passe incorrect
✓ Vérifier le blocage à la 6ème tentative
✓ Vérifier le message "Trop de tentatives"
```

---

## 📞 Support

Pour les questions ou problèmes:
1. Consulter `AUTH_CONFIG.md` pour la documentation complète
2. Vérifier les logs: `storage/logs/laravel.log`
3. Vérifier les erreurs du navigateur (F12 → Console)
4. Vérifier les erreurs API (F12 → Network)

---

## 🚀 Déploiement

### Production:

1. **Vérifier les variables d'environnement**:
```bash
grep -E "SESSION|CSRF" .env
```

2. **S'assurer que les cookies sont sécurisés**:
```php
// config/session.php
'secure' => env('SESSION_SECURE_COOKIES', true),
'http_only' => true,
'same_site' => 'lax',
```

3. **Rebuilder le frontend**:
```bash
npm run build
```

4. **Tester les workflows**:
```bash
./vendor/bin/phpunit
```

---

## 📋 Checklist

### Avant de déployer:
- [ ] Build compilé sans erreur: `npm run build`
- [ ] Tests passés: `npm run test`
- [ ] Variables d'environnement configurées
- [ ] Cookies sécurisés en production
- [ ] CSRF tokens activés
- [ ] Logs d'audit en place

### Après le déploiement:
- [ ] Tester la déconnexion
- [ ] Tester la reconnexion
- [ ] Vérifier les logs
- [ ] Vérifier les erreurs du navigateur
- [ ] Vérifier la sécurité des cookies

---

## 💡 Points importants

1. **Session lifetime** - Par défaut 120 minutes
2. **CSRF tokens** - Régénérés automatiquement
3. **Logs d'audit** - Toutes les déconnexions sont loggées
4. **Rate limiting** - 5 tentatives max par minute
5. **Vérification périodique** - Toutes les 5 minutes

---

**Status**: ✅ Production Ready

**Build**: 2812 modules (38.15s)

**Sécurité**: 🔒 Élevée
