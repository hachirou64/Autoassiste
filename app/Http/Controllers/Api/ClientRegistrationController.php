<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Utilisateur;
use App\Models\TypeCompte;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class ClientRegistrationController extends Controller
{
    /**
     * Inscrire un nouveau client (simple)
     * Retourne JSON avec redirect_url pour gestion côté frontend
     */
    public function register(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:utilisateurs,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|min:6|confirmed',
        ]);

        DB::beginTransaction();
        
        try {
            // Créer le profil client
            $client = Client::create([
                'fullName' => $validated['fullName'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            // Récupérer le type de compte "Client"
            $typeCompteClient = TypeCompte::where('name', 'Client')->firstOrFail();

            // Créer le compte utilisateur associé
            $utilisateur = Utilisateur::create([
                'fullName' => $validated['fullName'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'id_type_compte' => $typeCompteClient->id,
                'id_client' => $client->id,
                'email_verified' => false,
            ]);

            // Connecter automatiquement l'utilisateur après inscription
            Auth::login($utilisateur);
            
            // Régénérer la session pour sécurité
            $request->session()->regenerate();

            DB::commit();

            // Retourner réponse JSON avec redirect_url
            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie ! Bienvenue sur GoAssist.',
                'redirect_url' => route('demande.nouvelle'),
                'user' => [
                    'id' => $utilisateur->id,
                    'fullName' => $utilisateur->fullName,
                    'email' => $utilisateur->email,
                    'client_id' => $client->id,
                ],
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'inscription : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Vérifier si l'utilisateur est connecté
     * Utile pour le frontend pour éviter les requêtes inutiles
     */
    public function checkAuth(Request $request)
    {
        if ($request->user()) {
            return response()->json([
                'authenticated' => true,
                'user' => [
                    'id' => $request->user()->id,
                    'fullName' => $request->user()->fullName,
                    'email' => $request->user()->email,
                    'type' => $request->user()->typeCompte->name ?? 'unknown',
                ],
            ]);
        }

        return response()->json([
            'authenticated' => false,
        ]);
    }
}

