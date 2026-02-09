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
        // validation des données du formulaire
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // tentative de connexion avec les credentials fournis
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            
            // La régénération de la session empêche les attaques de fixation de session
            $request->session()->regenerate();

            // Récupérer l'utilisateur connecté
            $utilisateur = Auth::utilisateur();

            //redirection selon le role après 
            // la connexion, ou vers le dashboard par défaut
            if ($utilisateur->isAdmin()) {
                return redirect()->intended(route('admin.dashboard'));
            } elseif ($utilisateur->isClient()) {
                return redirect()->intended(route('client.dashboard'));
            } else {
                return redirect()->intended(route('depanneur.dashboard'));
            }
        }

        
        // Si les credentials sont incorrects, retourner au formulaire
        // avec un message d'erreur (sans révéler quelle information est incorrecte)
        return back()->withErrors([
            'email' => 'Les identifiants sont incorrects.',
        ])->onlyInput('email');
    }

   
    public function logout(Request $request)
    {
        // Déconnecter l'utilisateur
        Auth::logout();

        // Invalider la session (supprime toutes les données de session)
        $request->session()->invalidate();

        // Régénérer le token CSRF pour éviter les attaques CSRF
        $request->session()->regenerateToken();

        // Rediriger vers la page d'accueil avec un message de succès
        return redirect()->route('home')
                       ->with('success', 'Déconnexion réussie.');
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

