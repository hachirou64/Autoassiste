# Plan: Flux d'inscription vers demande d'assistance

## Objectif
Implémenter un flux fluide où:
1. L'utilisateur clique sur "J'ai besoin d'aide"
2. Il est dirigé vers la page d'inscription
3. Après inscription, il voit le formulaire de demande
4. Après soumission, il accède au dashboard client

---

## Fichiers à modifier

### 1. `resources/js/components/sos-button.tsx`
**Modification:** Changer la redirection pour toujours aller vers `/register`

```tsx
// Actuel:
if (isAuthenticated) {
    window.location.href = '/client/dashboard?new-demande=true';
} else {
    window.location.href = '/register';
}

// Nouveau - toujours vers inscription:
const handlePrimaryAction = () => {
    // Stocker l'intention pour après inscription
    sessionStorage.setItem('redirectAfterLogin', '/client/dashboard?new-demande=true');
    window.location.href = '/register';
};
```

### 2. `resources/js/pages/register.tsx` (ou créer nouvelle page)
**Modification:** Après inscription réussie, vérifier `sessionStorage` et rediriger vers `/client/dashboard?new-demande=true`

### 3. `resources/js/pages/client-dashboard.tsx`
**Modification:** 
- Détecter le paramètre `?new-demande=true`
- Si présent, automatiquement afficher l'onglet "Nouvelle demande"

---

## Plan de mise en œuvre

### Étape 1: Modifier le SosButton
- [ ] Mettre à jour `handlePrimaryAction` pour stocker l'intention
- [ ] Rediriger vers `/register`

### Étape 2: Modifier la page d'inscription
- [ ] Dans `EmailRegistrationForm`, ajouter callback de succès
- [ ] Vérifier `sessionStorage` pour redirection vers formulaire

### Étape 3: Modifier le ClientDashboard
- [ ] Lire le paramètre URL `?new-demande=true`
- [ ] Si présent, changer `activeTab` vers `'new-demande'`

### Étape 4: Tester le flux complet
- [ ] Cliquer sur SOS → Inscription → Dashboard avec formulaire
- [ ] Vérifier que la soumission fonctionne

---

## Flux détaillé

```
1. Page d'accueil / welcome
   ↓
2. Cliquer sur "J'ai besoin d'aide" (bouton SOS)
   ↓
3. Redirection vers /register
   - sessionStorage.setItem('redirectAfterLogin', '/client/dashboard?new-demande=true')
   ↓
4. Remplir le formulaire d'inscription
   ↓
5. Soumettre → Connexion automatique
   ↓
6. Redirection vers /client/dashboard?new-demande=true
   ↓
7. ClientDashboard détecte le paramètre
   - Change activeTab vers 'new-demande'
   - Affiche le formulaire de demande
   ↓
8. Remplir et soumettre la demande
   ↓
9. Afficher dashboard complet avec suivi
```

---

## Code à implémenter

### SosButton - Nouvelle logique:

```tsx
const handlePrimaryAction = () => {
    // Stocker l'intention pour après inscription
    sessionStorage.setItem('pending_demande', 'true');
    // Rediriger vers inscription
    window.location.href = '/register';
};
```

### RegisterPage - Vérification après inscription:

```tsx
// Dans EmailRegistrationForm ou RegisterPage
useEffect(() => {
    if (auth?.user && sessionStorage.getItem('pending_demande')) {
        sessionStorage.removeItem('pending_demande');
        // Rediriger vers dashboard avec formulaire
        window.location.href = '/client/dashboard?new-demande=true';
    }
}, [auth]);
```

### ClientDashboard - Détection du paramètre:

```tsx
// Dans ClientDashboard
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('new-demande') === 'true') {
        setActiveTab('new-demande');
        // Nettoyer l'URL
        window.history.replaceState({}, '', '/client/dashboard');
    }
}, []);
```

