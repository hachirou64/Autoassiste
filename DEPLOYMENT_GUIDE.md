# 🚀 Guide de Déploiement & Configuration

## Prérequis

- PHP 8.1+
- Node.js 18+
- MySQL 8.0 / PostgreSQL 12+
- Composer
- npm / yarn

---

## Installation Locale

### 1️⃣ Cloner le projet
```bash
git clone <repo-url> autoAssiste
cd autoAssiste
```

### 2️⃣ Installer les dépendances
```bash
# PHP dependencies
composer install

# JavaScript dependencies
npm install
```

### 3️⃣ Configuration environnement
```bash
cp .env.example .env
php artisan key:generate
```

Éditer `.env`:
```env
APP_NAME=GoAssist
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=go_assist
DB_USERNAME=root
DB_PASSWORD=

# Authentification sociale
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GOOGLE_REDIRECT_URI=${APP_URL}/auth/google/callback

FACEBOOK_CLIENT_ID=your-facebook-id
FACEBOOK_CLIENT_SECRET=your-facebook-secret
FACEBOOK_REDIRECT_URI=${APP_URL}/auth/facebook/callback
```

### 4️⃣ Base de données
```bash
# Migrations
php artisan migrate

# Seeders (optionnel)
php artisan db:seed
```

### 5️⃣ Compiler les assets
```bash
npm run build
# ou pour développement avec hot-reload
npm run dev
```

### 6️⃣ Lancer le serveur
```bash
php artisan serve
```

L'application est accessible sur `http://localhost:8000`

---

## Configuration Authentification Sociale

### Google OAuth

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet
3. Activer Google+ API
4. Créer les credentials (OAuth 2.0)
5. Ajouter `http://localhost:8000/auth/google/callback` comme URI autorisé
6. Copier les IDs dans `.env`

### Facebook OAuth

1. Aller sur [Facebook Developers](https://developers.facebook.com/)
2. Créer une application
3. Configurer Facebook Login
4. Ajouter `http://localhost:8000/auth/facebook/callback` comme redirect URI
5. Copier les IDs dans `.env`

---

## Configuration Paiement (À venir)

### Stripe
```env
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### PayPal
```env
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

### Mobile Money (Africa)
```env
ORANGE_MONEY_API_KEY=...
MTN_MOMO_API_KEY=...
```

---

## Déploiement Production

### 1️⃣ Sur Heroku
```bash
heroku login
heroku create go-assist
git push heroku main
heroku run php artisan migrate
```

### 2️⃣ Sur DigitalOcean / Linode

```bash
# SSH sur le serveur
ssh root@your-server

# Installer les dépendances
apt-get update
apt-get install -y php8.1 php8.1-mysql nodejs npm

# Cloner le projet
git clone <repo> /var/www/go-assist

# Installation
cd /var/www/go-assist
composer install --no-dev
npm install --production
npm run build

# Configuration
cp .env.example .env
# Éditer .env pour production
php artisan key:generate
php artisan migrate --force

# Permissions
chown -R www-data:www-data /var/www/go-assist
chmod -R 755 /var/www/go-assist/storage
```

### 3️⃣ Configuration Nginx
```nginx
server {
    listen 80;
    server_name go-assist.com www.go-assist.com;
    root /var/www/go-assist/public;
    
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    
    index index.html index.php;
    
    charset utf-8;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
    
    error_page 404 /index.php;
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
    
    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 4️⃣ SSL avec Let's Encrypt
```bash
apt-get install certbot python3-certbot-nginx
certbot --nginx -d go-assist.com -d www.go-assist.com
```

---

## Maintenance Production

### Sauvegarde de base de données
```bash
# Backup
mysqldump -u user -p database > backup-$(date +%Y%m%d).sql

# Restore
mysql -u user -p database < backup-20260212.sql
```

### Monitoring
```bash
# Logs
tail -f storage/logs/laravel.log

# Queue jobs
php artisan queue:work

# Scheduler
php artisan schedule:work
```

### Mise à jour
```bash
git pull origin main
composer install
npm install
npm run build
php artisan migrate
php artisan cache:clear
```

---

## Troubleshooting

### Port 8000 déjà utilisé
```bash
php artisan serve --port=8001
```

### Permission denied sur storage
```bash
chmod -R 777 storage
chmod -R 777 bootstrap/cache
```

### Database connection error
```bash
# Vérifier MySQL est running
mysql -u root -p

# Vérifier les credentials .env
php artisan config:show
```

### Geolocation ne fonctionne pas
- Doit être en HTTPS (ou localhost)
- Vérifier les permissions du navigateur
- Vérifier la console browser (F12)

---

## Testing

### Unit Tests
```bash
php artisan test
```

### Integration Tests
```bash
php artisan test --testsuite=Feature
```

### Load Testing
```bash
npm install -g artillery
artillery run tests/load-test.yml
```

---

## Monitoring & Analytics (À venir)

- Sentry pour error tracking
- DataDog pour monitoring
- Mixpanel pour analytics utilisateur
- LogRocket pour session replay

---

## Support

- Docs: `docs/` ou Wiki du projet
- Issues: GitHub Issues
- Email: support@go-assist.com
- Chat: Discord / Slack

---

**Dernière mise à jour:** 12 février 2026
**Version:** 1.0.0
**Statut:** 🟢 Production-Ready
