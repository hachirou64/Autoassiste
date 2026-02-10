# TODO: Implémentation du flux SOS → Inscription → Formulaire → Dashboard

## Étape 1: Modifier SosButton ✅
- [x] 1.1 Stocker l'intention dans sessionStorage
- [x] 1.2 Rediriger vers /register

## Étape 2: Modifier RegisterPage ✅
- [x] 2.1 Vérifier sessionStorage après inscription
- [x] 2.2 Rediriger vers /demande/nouvelle (page dédiée)

## Étape 3: Créer page nouvelle-demande.tsx ✅
- [x] 3.1 Page dédiée au formulaire de demande
- [x] 3.2 Afficher confirmation après soumission
- [x] 3.3 Redirection vers dashboard après confirmation

## Étape 4: Ajouter route API pour demandes ✅
- [x] 4.1 Route POST /api/demandes
- [x] 4.2 Méthode storeApi dans DemandeController

## Flux complet implémenté:
```
1. Page d'accueil / Welcome
   ↓ Cliquer sur "J'ai besoin d'aide"
2. Redirection vers /register
   (sessionStorage: pending_demande = true)
   ↓ Inscription + Connexion automatique
3. Redirection vers /demande/nouvelle
   ↓ Remplir formulaire + Soumettre
4. Page de confirmation (code demande)
   ↓ Cliquer "Accéder à mon dashboard"
5. Redirection vers /client/dashboard
   ↓ Dashboard complet avec suivi d'intervention
```

