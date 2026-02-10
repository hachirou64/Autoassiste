# TODO - Simplification des formulaires d'inscription

## Objectif
Supprimer les formulaires d'inscriptionredondants et garder un seul formulaire principal.

## Modifications à faire

### 1. QuickRegistrationForm (PRIORITÉ HAUTE)
- [x] Ajouter le champ email au formulaire
- [x] Ajouter une option "Devenir dépanneur" avec lien vers /register/depanneur
- [x] Mettre à jour le type RegistrationFormData

### 2. Register Page (/register)
- [x] Vérifier que QuickRegistrationForm est correctement utilisé
- [x] Mettre à jour le titre et la description

### 3. Routes (web.php)
- [x] Ajouter une redirection de /register/client vers /register

### 4. Liens à mettre à jour
- [x] home.tsx - bouton inscription client → /register
- [x] sos-button.tsx - lien inscription → /register (déjà correct)
- [x] admin/clients-table.tsx - lien inscription client → /register
- [x] admin/depanneurs-table.tsx - lien inscription depanneur → /register/depanneur (déjà correct)

### 5. Fichiers à archiver (optionnel)
- [ ] client-register.tsx - archiver ou supprimer (la page redirige maintenant)
- [ ] client-registration-form.tsx - archiver ou supprimer (non utilisé)

## Progression
- [x] Plan approuvé par l'utilisateur
- [x] TODO créé
- [x] QuickRegistrationForm mis à jour (email + lien dépanneur)
- [x] Routes mises à jour (/register/client redirige vers /register)
- [x] Liens home.tsx mis à jour
- [x] Liens sos-button.tsx vérifiés (déjà corrects)
- [x] Liens tables admin mis à jour
- [ ] Tâches terminées - Simplification réussie!

