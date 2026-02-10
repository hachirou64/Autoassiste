# TODO - Correction du bouton "Se connecter"

## Objectif
Le bouton "Se connecter" ne fonctionne pas car il redirige vers `/login` mais il n'y a pas de page de connexion Inertia configurée.

## Étapes à réaliser

### 1. Créer le composant de formulaire de connexion
- [x] Créer `resources/js/components/auth/login-form.tsx`
- [x] Composant avec email, mot de passe, remember me
- [x] Validation des champs
- [x] Gestion des erreurs
- [x] Appel API pour connexion

### 2. Créer la page de login Inertia
- [x] Créer `resources/js/pages/login.tsx`
- [x] Intégrer le LoginForm
- [x] Design cohérent avec la page d'inscription

### 3. Ajouter la route login dans web.php
- [x] Ajouter route GET `/login` pointant vers la page Inertia login

### 4. Ajouter la route loginInertia dans routes/index.ts
- [x] Ajouter la fonction de route pour /login Inertia

### 5. Compiler le frontend
- [ ] Exécuter `npm run build` pour compiler les changements

## Notes
- Utiliser Fortify pour l'authentification backend
- Utiliser Inertia pour le frontend React
- Préserver la cohérence visuelle avec l'inscription

