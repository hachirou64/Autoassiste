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
            $lastActivity = Session::get('last_activity');
            $now = time();

            // Si le dernier accès dépasse le timeout, déconnecter
            if ($lastActivity && ($now - $lastActivity) > (self::SESSION_TIMEOUT * 60)) {
                Auth::logout();
                Session::invalidate();
                Session::regenerateToken();

                return redirect('/login')->with('error', 'Votre session a expiré. Veuillez vous reconnecter.');
            }

            // Mettre à jour le timestamp de la dernière activité
            Session::put('last_activity', $now);

            // Ajouter des informations de session valides à la réponse
            $response = $next($request);

            // Ajouter des headers pour indiquer le statut de session
            $response->header('X-Session-Valid', 'true');
            $response->header('X-Session-Expires', now()->addMinutes(config('session.lifetime'))->timestamp);

            return $response;
        }

        // Mettre à jour le timestamp même pour les utilisateurs non authentifiés
        Session::put('last_activity', time());

        return $next($request);
    }
}
