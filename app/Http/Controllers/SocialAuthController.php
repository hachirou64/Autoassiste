<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\SocialAccount;
use App\Models\Utilisateur;
use App\Models\TypeCompte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse;

class SocialAuthController extends Controller
{
    /**
     * Rediriger vers le provider OAuth.
     */
    public function redirectToProvider(string $provider): RedirectResponse|\Illuminate\Http\RedirectResponse
    {
        // Valider le provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')
                ->with('error', 'Provider non supporté.');
        }

        return Socialite::driver($provider)
            ->redirect();
    }

    /**
     * Gérer le callback du provider OAuth.
     */
    public function handleProviderCallback(string $provider): \Illuminate\Http\RedirectResponse
    {
        try {
            // Récupérer les informations de l'utilisateur depuis le provider
            $socialUser = Socialite::driver($provider)->user();

            // Valider le provider
            if (!in_array($provider, ['google', 'facebook'])) {
                return redirect()->route('login')
                    ->with('error', 'Provider non supporté.');
            }

            // Chercher si un compte social existe déjà
            $socialAccount = SocialAccount::findByProvider($provider, $socialUser->getId());

            $user = null;

            if ($socialAccount) {
                // Le compte social existe, récupérer l'utilisateur associé
                $user = $socialAccount->user;

                // Mettre à jour les informations du token
                $socialAccount->update([
                    'access_token' => $socialUser->token,
                    'refresh_token' => $socialUser->refreshToken,
                    'expires_at' => isset($socialUser->expiresIn) ? now()->addSeconds($socialUser->expiresIn) : null,
                    'provider_email' => $socialUser->getEmail(),
                    'provider_avatar' => $socialUser->getAvatar(),
                ]);
            } else {
                // Pas de compte social, vérifier si l'email existe déjà
                $user = Utilisateur::where('email', $socialUser->getEmail())->first();

                if (!$user) {
                    // Créer un nouvel utilisateur
                    $typeCompteClient = TypeCompte::where('name', 'Client')->firstOrFail();

                    DB::transaction(function () use ($socialUser, $provider, $typeCompteClient, &$user) {
                        // Créer le profil client
                        $client = Client::create([
                            'fullName' => $socialUser->getName() ?? $socialUser->getEmail(),
                            'email' => $socialUser->getEmail(),
                            'phone' => '', // Pas disponible via OAuth standard
                        ]);

                        // Créer l'utilisateur
                        $user = Utilisateur::create([
                            'fullName' => $socialUser->getName() ?? $socialUser->getEmail(),
                            'email' => $socialUser->getEmail(),
                            'password' => bcrypt(str_random(16)), // Mot de passe aléatoire
                            'id_type_compte' => $typeCompteClient->id,
                            'id_client' => $client->id,
                            'email_verified' => true,
                        ]);

                        // Créer le compte social
                        SocialAccount::create([
                            'user_id' => $user->id,
                            'provider_name' => $provider,
                            'provider_id' => $socialUser->getId(),
                            'provider_email' => $socialUser->getEmail(),
                            'provider_avatar' => $socialUser->getAvatar(),
                            'access_token' => $socialUser->token,
                            'refresh_token' => $socialUser->refreshToken ?? null,
                            'expires_at' => isset($socialUser->expiresIn) ? now()->addSeconds($socialUser->expiresIn) : null,
                        ]);
                    });
                } else {
                    // L'email existe, lier le compte social à l'utilisateur existant
                    SocialAccount::create([
                        'user_id' => $user->id,
                        'provider_name' => $provider,
                        'provider_id' => $socialUser->getId(),
                        'provider_email' => $socialUser->getEmail(),
                        'provider_avatar' => $socialUser->getAvatar(),
                        'access_token' => $socialUser->token,
                        'refresh_token' => $socialUser->refreshToken ?? null,
                        'expires_at' => isset($socialUser->expiresIn) ? now()->addSeconds($socialUser->expiresIn) : null,
                    ]);
                }
            }

            // Connecter l'utilisateur
            Auth::login($user);

            // Régénérer la session pour sécurité
            request()->session()->regenerate();

            // Rediriger vers le dashboard approprié selon le type de compte
            return $this->redirectToDashboard($user);

        } catch (\Exception $e) {
            // En cas d'erreur, rediriger vers la page de connexion avec un message
            return redirect()->route('login')
                ->with('error', 'Une erreur est survenue lors de la connexion avec ' . ucfirst($provider) . '. Veuillez réessayer.');
        }
    }

    /**
     * Déconnecter l'utilisateur d'un provider social (supprimer le token).
     */
    public function disconnectProvider(Request $request, string $provider): \Illuminate\Http\RedirectResponse
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Valider le provider
        if (!in_array($provider, ['google', 'facebook'])) {
            return redirect()->route('login')
                ->with('error', 'Provider non supporté.');
        }

        // Supprimer le compte social
        $user->socialAccounts()
            ->where('provider_name', $provider)
            ->delete();

        return redirect()->back()
            ->with('success', 'Compte ' . ucfirst($provider) . ' déconnecté avec succès.');
    }

    /**
     * Rediriger vers le dashboard selon le type de compte.
     */
    protected function redirectToDashboard(Utilisateur $user): \Illuminate\Http\RedirectResponse
    {
        if ($user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard'))
                ->with('success', 'Bienvenue ! Connexion réussie avec Google.');
        } elseif ($user->isClient()) {
            return redirect()->intended(route('client.dashboard'))
                ->with('success', 'Bienvenue ! Connexion réussie avec Google.');
        } elseif ($user->isDepanneur()) {
            return redirect()->intended(route('depanneur.dashboard'))
                ->with('success', 'Bienvenue ! Connexion réussie avec Google.');
        }

        // Par défaut, rediriger vers le dashboard client
        return redirect()->intended(route('client.dashboard'))
            ->with('success', 'Connexion réussie !');
    }
}

