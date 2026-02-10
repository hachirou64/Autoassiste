# TODO: Flux Inscription → Connexion → Demande d'assistance

## Objectif
Implémenter un flux standard:
1. Inscription du client
2. Connexion automatique après inscription OU page de connexion séparée
3. Accès au dashboard client
4. Création d'une demande d'assistance

## Tâches

### Tâche 1: Améliorer le contrôleur d'inscription client ✅
- [x] Modifier `ClientRegistrationController` pour retourner une réponse JSON avec redirect_url
- [x] S'assurer que la session est correctement établie après inscription
- [x] Ajouter la route `checkAuth` pour vérifier l'authentification

### Tâche 2: Mettre à jour le formulaire d'inscription rapide ✅
- [x] Modifier `quick-registration-form.tsx` pour utiliser router.post d'Inertia
- [x] Gérer la redirection automatique après inscription réussie
- [x] Afficher un message de succès

### Tâche 3: Améliorer le bouton SOS ✅
- [x] Détecter si l'utilisateur est déjà connecté via `/api/client/check-auth`
- [x] Rediriger vers la page appropriée (nouvelle-demande si connecté, register si non)

### Tâche 4: Vérifier la page nouvelle-demande ✅
- [x] Protéger la route `/demande/nouvelle` avec le middleware `auth`
- [x] Rediriger vers connexion si non autenticifié (via Inertia)

### Tâche 5: Tester le flux complet
- [ ] Inscription → Dashboard → Nouvelle demande
- [ ] Connexion → Dashboard → Nouvelle demande
- [ ] Bouton SOS → Inscription/Connexion → Demande

## Notes
- Utiliser le middleware `auth` de Laravel pour protéger les routes
- Les cookies de session doivent être correctement gérés par Inertia
- Messages d'erreur et de succès clairs pour l'utilisateur

## Flux implémenté

```
Bouton SOS ↓
    │
    ├─→ Appel /api/client/check-auth
    │
    ├─→ [Déjà connecté?] → OUI → /demande/nouvelle (accès autorisé)
    │                       │
    │                       NON
    │                       ↓
    │                   /register + pending_demande
    │                       ↓
    │                   Formulaire inscription (QuickRegistrationForm)
    │                       ↓
    │                   router.post('/api/client/register')
    │                       ↓
    │                   Auth::login() + session()->regenerate()
    │                       ↓
    │                   Redirect → /demande/nouvelle
    │                       ↓
    │                   Middleware auth vérifie (OK)
    │                       ↓
    │                   Formulaire demande
    │                       ↓
    │                   Soumettre demande
    │                       ↓
    │                   Confirmation + Dashboard
```

