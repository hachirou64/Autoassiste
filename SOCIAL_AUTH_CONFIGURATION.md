# Guide de Configuration - Authentification Sociale (Google & Facebook)

## Variables d'environnement à ajouter dans `.env`

### Google OAuth

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Allez dans "Identifiants" → "Créer des identifiants" → "ID client OAuth"
4. Configurez l'URI de redirection autorisé :
   - `http://localhost/auth/google/callback` (pour le développement)
   - `https://votre-domaine.com/auth/google/callback` (pour la production)
5. Copiez les valeurs dans `.env` :

```env
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
GOOGLE_REDIRECT_URI=${APP_URL}/auth/google/callback
```

### Facebook OAuth

1. Allez sur [Facebook Developers](https://developers.facebook.com/)
2. Créez une nouvelle application
3. Ajoutez le produit "Facebook Login"
4. Configurez l'URI de redirection valide :
   - `http://localhost/auth/facebook/callback` (pour le développement)
   - `https://votre-domaine.com/auth/facebook/callback` (pour la production)
5. Copiez les valeurs dans `.env` :

```env
FACEBOOK_CLIENT_ID=votre_facebook_app_id
FACEBOOK_CLIENT_SECRET=votre_facebook_app_secret
FACEBOOK_REDIRECT_URI=${APP_URL}/auth/facebook/callback
```

## Configuration de la base de données

Exécutez la migration pour créer la table `social_accounts` :

```bash
php artisan migrate
```

## Utilisation

### Côté Frontend

Les boutons "Continuer avec Google" et "Continuer avec Facebook" sont maintenant disponibles sur la page de connexion (`/login`).

Lorsqu'un utilisateur clique sur un bouton social :
- Il est redirigé vers le provider OAuth
- Après autorisation, il est redirigé vers `/auth/{provider}/callback`
- Le contrôleur traite le callback et crée/connecte l'utilisateur
- L'utilisateur est redirigé vers son dashboard approprié

### Côté Backend

Le `SocialAuthController` gère :
1. La redirection vers le provider OAuth
2. La récupération des informations utilisateur
3. La création automatique d'un compte Client si nécessaire
4. La liaison avec un compte existant si l'email existe déjà
5. La connexion automatique de l'utilisateur

## Sécurité

- Les tokens d'accès sont stockés chiffrés en base de données
- L'email est considéré comme vérifié via OAuth
- Un mot de passe aléatoire est généré pour les comptes sociaux

## Résolution des problèmes

### "Invalid state" error avec Google
- Assurez-vous que l'URI de redirection correspond exactement à celle configurée dans Google Cloud Console

### Erreur CORS
- Vérifiez que les domaines sont correctement configurés dans les paramètres de l'application Facebook/Google

### Token expiré
- Les tokens sont automatiquement rafraichis si un refresh_token est disponible

