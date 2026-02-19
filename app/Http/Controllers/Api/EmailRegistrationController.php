<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Utilisateur;
use App\Models\TypeCompte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;

class EmailRegistrationController extends Controller
{
    /**
     * Étape 1: Vérifier l'email et envoyer le code OTP
     */
    public function sendOtp(Request $request)
    {
        // Validation de l'email
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Cette adresse email est déjà utilisée.',
            ], 422);
        }

        // Générer un code OTP à 6 chiffres
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Stocker l'OTP dans le cache pour 5 minutes
        $cacheKey = 'registration_otp_' . $request->email;
        Cache::put($cacheKey, [
            'otp' => Hash::make($otp),
            'attempts' => 0,
        ], now()->addMinutes(5));

        // TODO: Envoyer l'OTP par email (simulation pour le moment)
        // Mail::to($request->email)->send(new OtpMail($otp));
        
        // En développement, retourner l'OTP dans la réponse
        return response()->json([
            'success' => true,
            'message' => 'Code OTP envoyé à votre adresse email.',
            'debug_otp' => $otp, // À supprimer en production
            'expiresAt' => now()->addMinutes(5)->toIso8601String(),
        ]);
    }

    /**
     * Étape 2: Vérifier le code OTP
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Code invalide.',
            ], 422);
        }

        $cacheKey = 'registration_otp_' . $request->email;
        $cachedData = Cache::get($cacheKey);

        if (!$cachedData) {
            return response()->json([
                'success' => false,
                'message' => 'Le code a expiré. Veuillez en demander un nouveau.',
            ], 400);
        }

        // Vérifier le code OTP
        if (!Hash::check($request->otp, $cachedData['otp'])) {
            // Incrémenter le compteur d'essais
            $cachedData['attempts']++;
            Cache::put($cacheKey, $cachedData, now()->addMinutes(5));

            // Bloquer après 3 tentatives
            if ($cachedData['attempts'] >= 3) {
                Cache::forget($cacheKey);
                return response()->json([
                    'success' => false,
                    'message' => 'Trop de tentatives. Veuillez demander un nouveau code.',
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Code incorrect. Il vous reste ' . (3 - $cachedData['attempts']) . ' tentatives.',
            ], 400);
        }

        // Générer un token de session pour compléter l'inscription
        $sessionToken = Str::random(64);
        
        // Stocker le token avec l'email vérifié
        Cache::put('registration_session_' . $sessionToken, [
            'email' => $request->email,
            'verified_at' => now(),
        ], now()->addHours(2));

        // Supprimer l'OTP utilisé
        Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'Email vérifié avec succès.',
            'sessionToken' => $sessionToken,
        ]);
    }

    /**
     * Étape 3: Compléter l'inscription avec les informations du profil
     */
    public function completeRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sessionToken' => 'required|string',
            'fullName' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Vérifier le token de session
        $sessionKey = 'registration_session_' . $request->sessionToken;
        $sessionData = Cache::get($sessionKey);

        if (!$sessionData) {
            return response()->json([
                'success' => false,
                'message' => 'Session expirée. Veuillez reprendre l\'inscription.',
            ], 400);
        }

        // Récupérer le type de compte "Client"
        $clientType = TypeCompte::where('name', 'Client')->first();
        
        if (!$clientType) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de configuration. Veuillez contacter l\'administrateur.',
            ], 500);
        }

        // Créer l'enregistrement client
        $client = Client::create([
            'fullName' => $request->fullName,
            'email' => $sessionData['email'],
            'phone' => $request->phone,
        ]);

        // Créer l'utilisateur
        // Note: On passe le mot de passe en clair, le mutateur du modèle
        // se chargera de le hacher automatiquement avec bcrypt()
        $user = Utilisateur::create([
            'fullName' => $request->fullName,
            'email' => $sessionData['email'],
            'password' => $request->password,
            'id_type_compte' => $clientType->id,
            'id_client' => $client->id,
            'id_depanneur' => null,
            'email_verified' => true,
        ]);

        // Supprimer le token de session
        Cache::forget($sessionKey);

        // Connecter automatiquement l'utilisateur
        Auth::login($user);

        return response()->json([
            'success' => true,
            'message' => 'Compte créé avec succès !',
            'user' => [
                'id' => $user->id,
                'fullName' => $user->fullName,
                'email' => $user->email,
                'type' => 'Client',
            ],
        ]);
    }

    /**
     * Renvoyer l'OTP
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email invalide.',
            ], 422);
        }

        // Supprimer l'ancien OTP s'il existe
        Cache::forget('registration_otp_' . $request->email);

        // Générer un nouveau code OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        Cache::put('registration_otp_' . $request->email, [
            'otp' => Hash::make($otp),
            'attempts' => 0,
        ], now()->addMinutes(5));

        return response()->json([
            'success' => true,
            'message' => 'Nouveau code OTP envoyé.',
            'debug_otp' => $otp, // À supprimer en production
        ]);
    }
}

