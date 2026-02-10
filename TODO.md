# TODO - AutoAssist Project

## 🚗🚙 Implémentation Types de Véhicules (Moto & Voiture) - TERMINÉ ✅

### Migrations de base de données
- [x] `2026_02_02_092146_add_vehicle_type_to_depanneurs.php`
- [x] `2026_02_02_092147_add_vehicle_type_to_demandes.php`

### Backend Laravel
- [x] `app/Models/Depanneur.php` - `type_vehicule` + constantes + scope `forVehicleType()`
- [x] `app/Models/Demande.php` - `vehicle_type` + constantes + accesseur
- [x] `app/Http/Controllers/DemandeController.php` - Validation + filtrage

### Frontend TypeScript
- [x] `resources/js/types/vehicle.ts` - Types pour Moto/Voiture
- [x] `resources/js/components/client/demande-form.tsx` - Sélecteur visuel
- [x] `resources/js/components/depanneur/demandes-stream.tsx` - Filtre par type

---

## 📧 Inscription Simplifiée (Email + OTP) - TERMINÉ ✅

### Backend Laravel
- [x] `app/Http/Controllers/Api/EmailRegistrationController.php`
  - `sendOtp()` - Envoi code 6 chiffres (5 min expiration)
  - `verifyOtp()` - Vérification avec tentative limitée (3 essais)
  - `completeRegistration()` - Création compte client
  - `resendOtp()` - Renvoyer le code

### Frontend TypeScript
- [x] `resources/js/types/registration.ts` - Types pour l'inscription
- [x] `resources/js/components/auth/email-registration-form.tsx` - Formulaire 3 étapes
- [x] `resources/js/pages/register.tsx` - Page d'inscription complète

### Routes ajoutées
- [x] `GET /register` - Page d'inscription
- [x] `POST /api/auth/send-otp` - Envoyer OTP
- [x] `POST /api/auth/verify-otp` - Vérifier OTP
- [x] `POST /api/auth/resend-otp` - Renvoyer OTP
- [x] `POST /api/auth/complete-registration` - Finaliser inscription

---

## 🆘 Bouton SOS Dynamique - TERMINÉ ✅

### Composants créés
- [x] `resources/js/components/sos-button.tsx`
  - Bouton flottant (flotte en bas à droite)
  - Panel avec géolocalisation
  - 3 variantes: floating, inline, compact
  - Changement de couleur selon l'état (rouge → ambre → bleu → vert)
  
- [x] `resources/js/hooks/use-active-demande.ts`
  - Hook pour vérifier les demandes actives
  - Polling automatique toutes les 30 secondes
  - États: en_attente, acceptee, en_cours
  - hook `useSosWidget()` pour le widget intelligent

### Fonctionnalités du bouton SOS
| État | Couleur | Label | Action |
|------|---------|-------|--------|
| Idle (non connecté) | 🔴 Rouge | "J'ai besoin d'aide" | → Page inscription |
| Idle (connecté) | 🔴 Rouge | "Créer une demande" | → Formulaire |
| En attente | 🟠 Ambré | "Recherche dépanneur..." | → Suivi |
| Accepté | 🔵 Bleu | "Dépanneur en route" | → Carte + Suivi |
| En cours | 🟢 Vert | "Intervention en cours" | → Détails |

---

## 🐛 Bug Fix
- [x] Fix `ReferenceError: dashboard is not defined` in `app-header.tsx`

---

## Prochaines étapes
- [ ] Configurer l'envoi d'emails réels (Laravel Mail)
- [ ] Connecter le hook `useActiveDemande` à l'API réelle
- [ ] Ajouter des tests unitaires
