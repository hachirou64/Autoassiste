# Plan de correction - Redirection d'inscription

## Problème
Lorsqu'un utilisateur est connecté et qu'un nouvel utilisateur clique sur "S'inscrire", au lieu d'afficher la page de choix de type de compte (`/choose-register`), l'application le redirige vers le dashboard de l'utilisateur connecté.

## Cause
Le middleware `guest` sur les routes d'inscription (`/register`, `/choose-register`, `/register/depanneur`) redirige automatiquement les utilisateurs connectés vers le dashboard (configuré dans `config/fortify.php` avec `'home' => '/dashboard'`).

## Solution
1. Retirer le middleware `guest` des routes d'inscription dans `routes/web.php`
2. Modifier les composants d'inscription pour gérer le cas où un utilisateur est déjà connecté (afficher un message et option de déconnexion)

## Tâches
- [x] Analyser le problème
- [x] Retirer le middleware `guest` des routes d'inscription dans routes/web.php
- [x] Modifier register.tsx pour gérer les utilisateurs connectés
- [ ] Tester le flux d'inscription

