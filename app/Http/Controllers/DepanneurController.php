<?php

namespace App\Http\Controllers;

use App\Models\Depanneur;
use App\Models\Utilisateur;
use App\Models\TypeCompte;
use App\Models\Zone;
use App\Models\Notification;
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
            'email' => [
                'required',
                'email',
                'max:255',
                function ($attribute, $value, $fail) {
                    // Check if email exists in depanneurs table
                    if (\App\Models\Depanneur::where('email', $value)->exists()) {
                        $fail('Un compte avec cet email existe déjà en tant que dépanneur.');
                        return;
                    }
                    // Check if email exists in utilisateurs table
                    if (\App\Models\Utilisateur::where('email', $value)->exists()) {
                        $fail('Un compte avec cet email existe déjà.');
                    }
                },
            ],
            'phone' => 'required|string|max:20',
            'promoteur_name' => 'required|string|max:255',
            'etablissement_name' => 'required|string|max:255',
            'IFU' => 'required|string|max:50',
            'adresse' => 'required|string|max:500',
            'localisation_actuelle' => 'required|string|max:100',
            'type_vehicule' => 'required|in:voiture,moto,les_deux',
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
                'isActive' => false,
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

            // Connecter automatiquement l'utilisateur avec regeneration de session
            Auth::login($user, true);
            $request->session()->regenerate();

            // Rediriger vers le dashboard dépanneur
            return redirect(route('depanneur.dashboard'))
                ->with('success', 'Compte créé avec succès ! Bienvenue ' . $user->fullName);

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Erreur DB inscription dépanneur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Erreur de base de données: Email déjà utilisé ou données invalides.'])->withInput();
        } catch (\Exception $e) {
            \Log::error('Erreur inscription dépanneur: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Erreur lors de la création du compte: ' . $e->getMessage()])->withInput();
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

    /**
     * Activer ou désactiver un compte dépanneur (pour l'admin)
     */
    public function toggleStatus(Depanneur $depanneur)
    {
        try {
            // Inverser le statut actuel
            $newStatus = !$depanneur->isActive;
            $depanneur->update(['isActive' => $newStatus]);

            // Mettre à jour aussi l'utilisateur associé
            if ($depanneur->utilisateur) {
                $depanneur->utilisateur->update(['isActive' => $newStatus]);
            }

            $statusText = $newStatus ? 'activé' : 'désactivé';

            return response()->json([
                'success' => true,
                'message' => "Compte dépanneur {$statusText} avec succès.",
                'isActive' => $newStatus,
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur toggle status depanneur: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la modification du statut.',
            ], 500);
        }
    }

    /**
     * Activer un compte dépanneur
     */
    public function activate(Depanneur $depanneur)
    {
        try {
            $depanneur->update(['isActive' => true]);

            if ($depanneur->utilisateur) {
                $depanneur->utilisateur->update(['isActive' => true]);
            }

            // Créer une notification pour le dépanneur
            Notification::create([
                'titre' => 'Compte activé',
                'message' => 'Votre compte a été activé par l\'administrateur. Vous pouvez maintenant recevoir des demandes.',
                'type' => Notification::TYPE_COMPTE_ACTIVATE,
                'isRead' => false,
                'id_depanneur' => $depanneur->id,
                'createdAt' => now(),
                'updatedAt' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte dépanneur activé avec succès.',
                'isActive' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'activation du compte.',
            ], 500);
        }
    }

    /**
     * Désactiver un compte dépanneur
     */
    public function deactivate(Depanneur $depanneur)
    {
        try {
            $depanneur->update(['isActive' => false]);

            if ($depanneur->utilisateur) {
                $depanneur->utilisateur->update(['isActive' => false]);
            }

            // Créer une notification pour le dépanneur
            Notification::create([
                'titre' => 'Compte désactivé',
                'message' => 'Votre compte a été désactivé par l\'administrateur. Vous ne pouvez plus recevoir de demandes.',
                'type' => Notification::TYPE_COMPTE_DESACTIVATE,
                'isRead' => false,
                'id_depanneur' => $depanneur->id,
                'createdAt' => now(),
                'updatedAt' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Compte dépanneur désactivé avec succès.',
                'isActive' => false,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la désactivation du compte.',
            ], 500);
        }
    }

    /**
     * Afficher les détails d'un dépanneur
     */
    public function show(Depanneur $depanneur)
    {
        try {
            $depanneur->load(['zones', 'utilisateur']);
            
            return response()->json([
                'success' => true,
                'depanneur' => [
                    'id' => $depanneur->id,
                    'promoteur_name' => $depanneur->promoteur_name,
                    'etablissement_name' => $depanneur->etablissement_name,
                    'IFU' => $depanneur->IFU,
                    'email' => $depanneur->email,
                    'phone' => $depanneur->phone,
                    'status' => $depanneur->status,
                    'isActive' => $depanneur->isActive,
                    'type_vehicule' => $depanneur->type_vehicule,
                    'localisation_actuelle' => $depanneur->localisation_actuelle,
                    'createdAt' => $depanneur->createdAt,
                    'zones' => $depanneur->zones->map(fn($z) => [
                        'id' => $z->id,
                        'name' => $z->name,
                        'city' => $z->city,
                    ]),
                    'interventions_count' => $depanneur->interventions()->count(),
                    'demandes_count' => $depanneur->demandes()->count(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des détails.',
            ], 500);
        }
    }

    /**
     * Mettre à jour un dépanneur (admin)
     */
    public function update(Request $request, Depanneur $depanneur)
    {
        $validator = Validator::make($request->all(), [
            'promoteur_name' => 'sometimes|string|max:255',
            'etablissement_name' => 'sometimes|string|max:255',
            'IFU' => 'sometimes|string|max:50',
            'phone' => 'sometimes|string|max:20',
            'type_vehicule' => 'sometimes|in:voiture,moto,les_deux',
            'status' => 'sometimes|in:disponible,occupe,hors_service',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $depanneur->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Dépanneur mis à jour avec succès.',
                'depanneur' => $depanneur,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour.',
            ], 500);
        }
    }

    /**
     * Valider l'IFU d'un dépanneur
     */
    public function validateIFU(Depanneur $depanneur)
    {
        try {
            $depanneur->update(['ifu_validated' => true]);

            return response()->json([
                'success' => true,
                'message' => 'IFU validé avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la validation IFU.',
            ], 500);
        }
    }

    /**
     * Supprimer un dépanneur
     */
    public function destroy(Depanneur $depanneur)
    {
        try {
            // Supprimer l'utilisateur associé
            if ($depanneur->utilisateur) {
                $depanneur->utilisateur->delete();
            }

            // Supprimer les relations
            $depanneur->zones()->detach();
            $depanneur->demandes()->delete();
            $depanneur->interventions()->delete();
            $depanneur->notifications()->delete();
            $depanneur->services()->delete();

            // Supprimer le dépanneur
            $depanneur->delete();

            return response()->json([
                'success' => true,
                'message' => 'Dépanneur supprimé avec succès.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Erreur suppression depanneur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression.',
            ], 500);
        }
    }
}
