<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Client;
use App\Models\Depanneur;
use App\Models\TypeCompte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class AuthController extends Controller
{
   
    protected TypeCompte $typeCompte;

    
    public function __construct()
    {
        // Le middleware est appliqué directement sur les routes dans web.php
        // pour plus de flexibilité avec les groupes de routes
    }

   
    public function showRegister()
    {
        // Récupérer tous les types de comptes pour le formulaire
        // Typiquement: Admin, Client, Depanneur
        $typeComptes = TypeCompte::all();

        // Retourner la vue avec les types de comptes
        return view('auth.register', compact('typeComptes'));
    }

    
    public function register(Request $request)
    {
        
        // ÉTAPE 1: Validation des données envoyées par le formulaire
        
        $validated = $request->validate([
            // Champs obligatoires pour tous les utilisateurs
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone' => 'required|string|max:20',
            'id_type_compte' => 'required|exists:type_comptes,id',

            // Champs spécifiques pour les dépanneurs (conditionnels)
            'promoteur_name' => 'required_if:id_type_compte,3|string|max:255',
            'etablissement_name' => 'required_if:id_type_compte,3|string|max:255',
            'IFU' => 'required_if:id_type_compte,3|string|unique:depanneurs,IFU',
        ]);

        
        // ÉTAPE 2: Déterminer le type de compte
        
        $typeCompte = TypeCompte::find($validated['id_type_compte']);

        // Initialiser les ID à null
        $clientId = null;
        $depanneurId = null;

        
        // ÉTAPE 3: Créer le profil selon le type de compte
        
        if ($typeCompte->name === 'Client') {
            
            // Créer un enregistrement dans la table clients
            $client = Client::create([
                'fullName' => $validated['fullName'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            // Stocker l'ID du client pour le lien avec User
            $clientId = $client->id;

        } elseif ($typeCompte->name === 'Depanneur') {
            
            // Créer un enregistrement dans la table depanneurs
            $depanneur = Depanneur::create([
                'promoteur_name' => $validated['promoteur_name'],
                'etablissement_name' => $validated['etablissement_name'],
                'IFU' => $validated['IFU'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'status' => 'disponible',  // Par défaut disponible
                'isActive' => true,        // Par défaut actif
            ]);

            // Stocker l'ID du dépanneur pour le lien avec User
            $depanneurId = $depanneur->id;
        }

         
        // ÉTAPE 4: Créer le compte utilisateur
    
        $utilisateur = Utilisateur::create([
            'fullName' => $validated['fullName'],
            'email' => $validated['email'],
            'password' => $validated['password'], // Sera hashé automatiquement par le mutator
            'id_type_compte' => $validated['id_type_compte'],
            'id_client' => $clientId,
            'id_depanneur' => $depanneurId,
            'email_verified' => false, // Email non vérifié par défaut
        ]);

        
        // ÉTAPE 5: Connecter automatiquement l'utilisateur
        Auth::login($utilisateur);

        // ÉTAPE 6: Rediriger selon le type de compte
        if ($utilisateur->isAdmin()) {
            return redirect()->route('admin.dashboard')
                           ->with('success', 'Compte créé avec succès !');
        } elseif ($utilisateur->isClient()) {
            return redirect()->route('client.dashboard')
                           ->with('success', 'Bienvenue ! Votre compte a été créé.');
        } else {
            return redirect()->route('depanneur.dashboard')
                           ->with('success', 'Compte dépanneur créé avec succès !');
        }
    }

    // connection du client dépanneur admin et redirection selon le role 
    public function showLogin()
    {
        return view('auth.login');
    }

    
    
    public function login(Request $request)
    {
        // Validation des données du formulaire
        // Accepter email OU téléphone comme identifiant
        $credentials = $request->validate([
            'login' => 'required|string', // email ou téléphone
            'password' => 'required',
            'remember' => 'boolean',
        ]);

        // Nettoyer le login (enlever les espaces, tirets, points)
        $login = trim($credentials['login']);
        $cleanLogin = preg_replace('/[\s\-\.]/', '', $login);

        // Détecter si login est un email ou un téléphone
        $isEmail = filter_var($login, FILTER_VALIDATE_EMAIL);
        $isPhone = preg_match('/^(\+229|00229)?[0-9]{8,10}$/', $cleanLogin);

        // Rechercher l'utilisateur par email ou téléphone
        $user = null;

        if ($isEmail) {
            // Si c'est un email, chercher directement par email dans utilisateurs
            $user = Utilisateur::where('email', strtolower($login))->first();
        } elseif ($isPhone) {
            // Si c'est un téléphone, chercher dans la table clients
            // D'abord chercher le client par téléphone
            $client = \App\Models\Client::where('phone', $cleanLogin)->first();
            if ($client) {
                // Puis chercher l'utilisateur associé à ce client
                $user = Utilisateur::where('id_client', $client->id)->first();
            }

            // Si pas trouvé par client, chercher aussi par depanneur
            if (!$user) {
                $depanneur = \App\Models\Depanneur::where('phone', $cleanLogin)->first();
                if ($depanneur) {
                    $user = Utilisateur::where('id_depanneur', $depanneur->id)->first();
                }
            }
        } else {
            // Essaye comme email en dernier recours
            $user = Utilisateur::where('email', strtolower($login))->first();
        }

        // Si utilisateur toujours pas trouvé, chercher par téléphone dans client même si le format n'est pas parfait
        if (!$user) {
            // Recherche plus flexible pour le téléphone
            $client = \App\Models\Client::where('phone', 'like', '%' . $login . '%')->first();
            if ($client) {
                $user = Utilisateur::where('id_client', $client->id)->first();
            }
        }

        // Vérifier les credentials
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            // Log pour debugging
            \Log::warning('Échec de connexion', [
                'login' => $credentials['login'],
                'user_found' => $user ? 'yes' : 'no',
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Retourner une réponse JSON pour les requêtes AJAX
            if ($request->expectsJson() || $request->is('api/*') || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Les identifiants sont incorrects.',
                    'errors' => [
                        'login' => 'Les identifiants sont incorrects.',
                    ],
                ], 401);
            }

            return back()->withErrors([
                'login' => 'Les identifiants sont incorrects.',
            ])->onlyInput('login');
        }

        // Connecter l'utilisateur
        Auth::login($user, $request->boolean('remember'));

        // Régénérer la session pour sécurité
        $request->session()->regenerate();

        // Déterminer l'URL de redirection
        $redirectUrl = $this->getRedirectUrl($user);

        // Log de connexion réussie
        \Log::info('Connexion réussie', [
            'user_id' => $user->id,
            'email' => $user->email,
            'type_compte' => $user->typeCompte->name ?? 'Unknown',
            'ip' => $request->ip(),
        ]);

        // Retourner la réponse appropriée
        if ($request->expectsJson() || $request->is('api/*') || $request->ajax()) {
            return response()->json([
                'success' => true,
                'message' => 'Connexion réussie',
                'user' => [
                    'id' => $user->id,
                    'email' => $user->email,
                    'fullName' => $user->fullName,
                    'id_type_compte' => $user->id_type_compte,
                ],
                'redirect' => $redirectUrl,
                'url' => $redirectUrl,
            ]);
        }

        // Redirection selon le type de compte
        return redirect()->intended($redirectUrl)
                       ->with('success', 'Bienvenue, ' . $user->fullName . ' !');
    }

    /**
     * Déterminer l'URL de redirection selon le type de compte
     */
    protected function getRedirectUrl(Utilisateur $user): string
    {
        if ($user->isAdmin()) {
            return route('admin.dashboard');
        } elseif ($user->isClient()) {
            return route('client.dashboard');
        } elseif ($user->isDepanneur()) {
            return route('depanneur.dashboard');
        }

        // Par défaut, rediriger vers le dashboard client
        return route('client.dashboard');
    }

    /**
     * Détecter si l'input est un email ou un téléphone.
     */
    protected function detectLoginField(string $login): string
    {
        // Vérifier si c'est un email (contient @)
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            return 'email';
        }
        
        // Vérifier si c'est un téléphone (contient principalement des chiffres)
        // Accepte les formats: +229XXXXXXXX, 00229XXXXXXXX, XXXXXXXXXX
        $phonePattern = '/^(\+229|00229)?[0-9]{8,10}$/';
        if (preg_match($phonePattern, preg_replace('/[\s\-\.]/', '', $login))) {
            return 'phone';
        }

        // Par défaut, traiter comme email
        return 'email';
    }

   
    public function logout(Request $request)
    {
        // Vérifier que l'utilisateur est authentifié
        if (Auth::check()) {
            // Récupérer l'utilisateur avant déconnexion pour logs
            $user = Auth::user();
            
            // Log la déconnexion pour audit
            \Log::info('User logged out', [
                'user_id' => $user?->id,
                'email' => $user?->email,
                'timestamp' => now(),
                'ip_address' => $request->ip(),
            ]);
        }

        // Déconnecter l'utilisateur
        Auth::logout();

        // Invalider la session (supprime toutes les données de session)
        $request->session()->invalidate();

        // Régénérer le token CSRF pour éviter les attaques CSRF
        $request->session()->regenerateToken();

        // Nettoyer les cookies de mémorisation
        if ($request->hasCookie('remember_token')) {
            return redirect()->route('home')
                           ->withCookie(\Illuminate\Cookie\Middleware\EncryptCookies::hash('remember_token', '', -1))
                           ->with('success', 'Déconnexion réussie.');
        }

        // Stocker un indicateur de déconnexion dans la session pour la page suivante
        $request->session()->put('just_logged_out', true);

        // Rediriger vers la page d'accueil avec un message de succès
        return redirect()->route('home')
                       ->with('success', 'Déconnexion réussie.');
    }

    /**
     * Fonction pour réauthentifier un utilisateur après expiration de session
     * Utilisée pour la continuité de session
     */
    public function reauth(Request $request)
    {
        // Vérifier que l'utilisateur a une session valide
        if (!Auth::check()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Session expirée. Veuillez vous reconnecter.',
                ], 401);
            }

            return redirect()->route('login')->with('error', 'Session expirée. Veuillez vous reconnecter.');
        }

        // La session est encore valide, rafraîchir la session
        $request->session()->regenerate();

        // Retourner une réponse JSON pour AJAX
        return response()->json([
            'success' => true,
            'message' => 'Session réactivée',
            'user' => Auth::user(),
        ]);
    }

    /**
     * Vérifier le statut de la session
     * Utilisé pour détecter les expirations de session
     */
    public function checkSession(Request $request)
    {
        if (Auth::check()) {
            return response()->json([
                'authenticated' => true,
                'user' => Auth::user(),
                'expires_at' => now()->addMinutes(config('session.lifetime'))->timestamp,
            ]);
        }

        return response()->json([
            'authenticated' => false,
            'message' => 'Session expirée',
        ], 401);
    }

    
    public function listUsers()
    {
        // Récupérer tous les utilisateurs avec leur type de compte
        $utilisateurs = Utilisateur::with('typeCompte')
                    ->orderBy('createdAt', 'desc')
                    ->paginate(20);

        return view('admin.utilisateurs.index', compact('utilisateurs'));
    }

    
    public function toggleUserStatus(Utilisateur $utilisateur)
    {
        // Inverser le statut isActive
        $utilisateur->update([
            'isActive' => !$utilisateur->isActive,
        ]);

        // Message selon le nouvel état
        $status = $utilisateur->isActive ? 'activé' : 'désactivé';

        return back()->with('success', "Utilisateur {$status} avec succès.");
    }
}

