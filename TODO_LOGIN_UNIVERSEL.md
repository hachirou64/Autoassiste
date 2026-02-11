# TODO: Rendre le bouton de connexion universel

## Objectif
Le bouton "Se connecter" doit fonctionner pour tous les types d'utilisateurs (clients, dépanneurs, admins) et le bouton SOS doit proposer une option de connexion claire.

## Modifications effectuées

### 1. Modifier `sos-button.tsx` ✅ TERMINÉ
- ✅ Ajout d'un lien direct vers la page de connexion pour les utilisateurs non-authentifiés
- ✅ Amélioration du texte du bouton pour être plus clair ("Se connecter / Créer un compte")
- ✅ Ajout de deux boutons séparés : "Se connecter" et "Créer un compte"
- ✅ Ajout d'un texte informatif "Clients, dépanneurs & admins"

### 2. Modifier `login-form.tsx` ✅ TERMINÉ
- ✅ Vérification que la redirection fonctionne pour tous les types d'utilisateurs (Admin, Client, Depanneur)
- ✅ Amélioration de la détection du type d'utilisateur avec switch case pour `id_type_compte`
  - 1 = Admin → /admin/dashboard
  - 2 = Client → /client/dashboard
  - 3 = Depanneur → /depanneur/dashboard

## Tests à effectuer
- [ ] Tester la connexion avec un compte client
- [ ] Tester la connexion avec un compte dépanneur
- [ ] Tester la connexion avec un compte admin
- [ ] Vérifier que le bouton SOS redirige correctement vers la page de connexion

