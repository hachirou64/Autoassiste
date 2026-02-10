# TODO - Correction Bug Redirection Inscription ✅ TERMINÉ

## Problème
Lorsque l'utilisateur clique sur "J'ai besoin d'aide" et arrive sur `/register`, le formulaire d'inscription s'affiche puis redirige immédiatement vers le dashboard. Ce comportement est causé par :
1. Le `useEffect` qui vérifie `auth?.user` et redirige immédiatement
2. Cette vérification peut retourner `true` pendant l'hydratation SSR d'Inertia

## SolutionImplémentée ✅

### 1. Corriger `register.tsx` ✅
- [x] Ajouter un état `mounted` pour éviter la redirection sur le premier rendu SSR
- [x] Ne rediriger que si l'utilisateur était déjà connecté AVANT d'arriver sur la page
- [x] Après inscription réussie (`handleSuccess`), rediriger vers `/demande/nouvelle` (formulaire de demande)
- [x] Le formulaire s'affiche maintenant correctement sans redirection automatique

### 2. Corriger `nouvelle-demande.tsx` ✅
- [x] Ajouter un timer de 100ms pour éviter les problèmes d'hydratation SSR
- [] Stocker `pending_demande` si l'utilisateur n'est pas connecté
- [ ] Rediriger vers `/register` si non connecté

### 3. Flux corrigé
1. Utilisateur clique sur "J'ai besoin d'aide" → Stocke `pending_demande` → Redirige vers `/register`
2. Sur `/register` : ✅ Le formulaire s'affiche correctement (pas de redirection)
3. Utilisateur remplit et valide le formulaire
4. Après inscription → Rediriger vers `/demande/nouvelle`
5. Après création de la demande → Rediriger vers `/client/dashboard`

## Fichiers modifiés
- `resources/js/pages/register.tsx`
- `resources/js/pages/nouvelle-demande.tsx`

