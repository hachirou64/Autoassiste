# TODO - Intégration de la table utilisateurs pour l'authentification

## Modifications effectuées:

### 1. **app/Models/Utilisateur.php**
- Changé `$table = 'users'` vers `$table = 'utilisateurs'`
- Changé `$timestamps = false` vers `$timestamps = true`

### 2. **config/auth.php**
- Changé `'model' => App\Models\User::class` vers `'model' => App\Models\Utilisateur::class`
- Ajouté le password broker `'utilisateurs'`

### 3. **config/fortify.php**
- Changé `'passwords' => 'users'` vers `'passwords' => 'utilisateurs'`

### 4. **app/Models/Client.php**
- Changé `hasOne(User::class, 'id_client')` vers `hasOne(Utilisateur::class, 'id_client')`

### 5. **app/Models/Depanneur.php**
- Changé `hasOne(User::class, 'id_depanneur')` vers `hasOne(Utilisateur::class, 'id_depanneur')`

### 6. **Contrôleurs corrigés** (Auth::utilisateur() → Auth::user())
- `app/Http/Controllers/AuthController.php`
- `app/Http/Controllers/InterventionController.php`
- `app/Http/Controllers/NotificationController.php`
- `app/Http/Controllers/DemandeController.php`

---

## Notes
- La table `utilisateurs` existe déjà avec les colonnes:
  - id, fullName, email, password, email_verified, email_verified_at
  - createdAt, updatedAt, created_By, updated_By, DeleteedBy
  - id_type_compte, id_client, id_depanneur
  - remember_token

## Prochaines étapes
- Tester l'authentification
- Vérifier que les migrations fonctionnent correctement

