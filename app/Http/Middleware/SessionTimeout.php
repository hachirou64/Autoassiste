<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class SessionTimeout
{
    /**
     * Durée d'inactivité avant expiration (en minutes)
     */
    protected const SESSION_TIMEOUT = 120;

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Vérifier si l'utilisateur est authentifié
        if (Auth::check()) {
            // Vérifier le timestamp de la dernière activité
            // Utiliser has() pour vérifier si la clé existe dans la session
            $hasLastActivity = Session::has('last_activity');
            $lastActivity = $hasLastActivity ? Session::get('last_activity') : null;
            $now = time();

            // Si le dernier accès dépasse le timeout, déconnecter
            if ($hasLastActivity && $lastActivity && ($now - $lastActivity) > (self::SESSION_TIMEOUT * 60)) {
                Auth::logout();
                Session::invalidate();
                Session::regenerateToken();

                // Retourner une réponse JSON pour les requêtes AJAX/API
                if ($request->expectsJson() || $request->is('api/*')) {
                    return response()->json([
                        'authenticated' => false,
                        'message' => 'Votre session a expiré. Veuillez vous reconnecter.',
                    ], 401);
                }

                return redirect('/login')->with('error', 'Votre session a expiré. Veuillez vous reconnecter.');
            }

            // Si pas de last_activity, initialiser (cas après reconnexion)
            if (!$hasLastActivity) {
                Session::put('last_activity', $now);
            } else {
                // Mettre à jour le timestamp de la dernière activité
                Session::put('last_activity', $now);
            }

            // Ajouter des informations de session valides à la réponse
            $response = $next($request);

            // Ajouter des headers pour indiquer le statut de session
            $response->headers->set('X-Session-Valid', 'true');
            $response->headers->set('X-Session-Expires', now()->addMinutes(config('session.lifetime'))->timestamp);

            return $response;
        }

        // Pour les utilisateurs non authentifiés, ne pas créer de last_activity
        // car cela peut causer des problèmes après logout

        return $next($request);
    }
}

