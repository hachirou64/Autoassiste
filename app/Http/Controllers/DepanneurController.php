<?php

namespace App\Http\Controllers;

use App\Models\Depanneur;
use App\Models\Utilisateur;
use App\Models\TypeCompte;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DepanneurController extends Controller
{
    /**
     * Inscrire un nouveau dépanneur (avec Inertia pour redirection)
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'required|string|max:20',
            'promoteur_name' => 'required|string|max:255',
            'etablissement_name' => 'required|string|max:255',
            'IFU' => 'required|string|max:50',
            'adresse' => 'required|string|max:500',
            'localisation_actuelle' => 'required|string|max:100',
            'type_vehicule' => 'required|in:voiture,moto,tous',
            'services' => 'required|array|min:1',
            'methode_payement' => 'required|array|min:1',
            'disponibilite' => 'required|string',
            'jours_travail' => 'required|array|min:1',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Récupérer le type de compte "Depanneur"
        $depanneurType = TypeCompte::where('name', 'Depanneur')->first();
        
        if (!$depanneurType) {
            return back()->withErrors(['email' => 'Erreur de configuration: Type de compte "Depanneur" non trouvé.'])->withInput();
        }

        try {
            // Créer le dépanneur
            $depanneur = Depanneur::create([
                'promoteur_name' => $request->promoteur_name,
                'etablissement_name' => $request->etablissement_name,
                'IFU' => $request->IFU,
                'email' => $request->email,
                'phone' => $request->phone,
                'status' => 'disponible',
                'isActive' => true,
                'type_vehicule' => $request->type_vehicule,
                'localisation_actuelle' => $request->localisation_actuelle,
            ]);

            // Créer l'utilisateur lié au dépanneur
            $user = Utilisateur::create([
                'fullName' => $request->fullName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'id_type_compte' => $depanneurType->id,
                'id_client' => null,
                'id_depanneur' => $depanneur->id,
                'email_verified' => true,
            ]);

            // Attacher les zones par défaut
            $zones = Zone::where('isActive', true)->get();
            if ($zones->isNotEmpty()) {
                $depanneur->zones()->attach($zones->pluck('id')->toArray(), [
                    'priorite' => 1,
                    'dateAjout' => now(),
                ]);
            }

            // Connecter automatiquement l'utilisateur
            Auth::login($user);

            // Rediriger vers le dashboard dépanneur
            return redirect(route('depanneur.dashboard'))
                ->with('success', 'Compte créé avec succès ! Bienvenue ' . $user->fullName);

        } catch (\Exception $e) {
            return back()->withErrors(['email' => 'Erreur lors de la création du compte: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Mettre à jour le profil du dépanneur
     */
    public function updateProfile(Request $request)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Vous devez être connecté'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $validator = Validator::make($request->all(), [
            'etablissement_name' => 'sometimes|string|max:255',
            'IFU' => 'sometimes|string|max:50',
            'phone' => 'sometimes|string|max:20',
            'adresse' => 'sometimes|string|max:500',
            'type_vehicule' => 'sometimes|in:voiture,moto,tous',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Mettre à jour le dépanneur
        $depanneur->update($validator->validated());

        // Mettre à jour l'utilisateur si nécessaire
        if ($request->has('phone')) {
            $utilisateur->update(['phone' => $request->phone]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour avec succès',
            'depanneur' => [
                'id' => $depanneur->id,
                'etablissement_name' => $depanneur->etablissement_name,
                'IFU' => $depanneur->IFU,
                'phone' => $depanneur->phone,
                'type_vehicule' => $depanneur->type_vehicule,
            ],
        ]);
    }

    /**
     * Récupérer le profil du dépanneur connecté
     */
    public function profile()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Vous devez être connecté'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        return response()->json([
            'depanneur' => [
                'id' => $depanneur->id,
                'fullName' => $depanneur->promoteur_name,
                'etablissement_name' => $depanneur->etablissement_name,
                'IFU' => $depanneur->IFU,
                'email' => $depanneur->email,
                'phone' => $depanneur->phone,
                'status' => $depanneur->status,
                'isActive' => $depanneur->isActive,
                'type_vehicule' => $depanneur->type_vehicule,
                'localisation_actuelle' => $depanneur->localisation_actuelle,
                'zones' => $depanneur->zones->map(fn($z) => [
                    'id' => $z->id,
                    'name' => $z->name,
                    'city' => $z->city,
                ]),
            ],
            'user' => [
                'id' => $utilisateur->id,
                'fullName' => $utilisateur->fullName,
                'email' => $utilisateur->email,
            ],
        ]);
    }
}
