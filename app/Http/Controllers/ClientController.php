<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// controller pour la gestion des clients par les administrateurs
class ClientController extends Controller
{
    // vérifier que seul les admins peuvent accéder à ce controller
    public function __construct()
    {
        // midleware est un méthode qui sexécute avant chaque action du controller
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user) {
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous devez être connecté.',
                    ], 401);
                }
                abort(403, 'Vous devez être connecté.');
            }
            
            // Charger la relation typeCompte si elle n'est pas déjà chargée
            if (!$user->relationLoaded('typeCompte')) {
                $user->load('typeCompte');
            }
            
            // Vérifier si l'utilisateur est admin
            if (!$user->isAdmin()) {
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Accès réservé aux administrateurs.',
                    ], 403);
                }
                abort(403, 'Accès réservé aux administrateurs.');
            }
            return $next($request);
        });
    }

    // afficher la liste des clients 
    public function index()
    {
        // Récupérer tous les clients avec pagination
        // withCount() compte le nombre de demandes associées à chaque client
        $clients = Client::withCount('demandes')
                        ->orderBy('createdAt', 'desc')
                        ->paginate(15);

        return view('admin.clients.index', compact('clients'));
    }

    // afficher le formulaire de création d'un nouveau client
    public function create()
    {
        return view('admin.clients.create');
    }

    // stocker un nouveau client dans la base de données
    public function store(Request $request)
    {
        // ÉTAPE 1 : Valider les données
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|min:8|confirmed', // password_confirmation doit être présent
        ]);

        // ÉTAPE 2 : Utiliser une transaction pour assurer la cohérence
        DB::beginTransaction();
        
        try {
            // Créer le profil client
            $client = Client::create([
                'fullName' => $validated['fullName'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
            ]);

            // Créer le compte utilisateur associé
            // where est utilisé pour récupérer l'ID du type de compte "Client"
            $typeCompteClient = \App\Models\TypeCompte::where('name', 'Client')->first();
            
            Utilisateur::create([
                'fullName' => $validated['fullName'],
                'email' => $validated['email'],
                'password' => $validated['password'], // Sera hashé automatiquement
                'id_type_compte' => $typeCompteClient->id,
                'id_client' => $client->id,
                'email_verified' => true, // Créé par admin = vérifié
            ]);

            DB::commit();

            return redirect()->route('admin.clients.index')
                           ->with('success', 'Client créé avec succès.');
                           
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                       ->with('error', 'Erreur lors de la création du client : ' . $e->getMessage());
        }
    }

    // afficher les détails d'un client spécifique
    public function show(Client $client)
    {
        // Charger toutes les relations nécessaires (eager loading)
        // load est utilisé pour charger des relations après la récupération initiale
        $client->load([
            'demandes.depanneur',           // Demandes avec leurs dépanneurs
            'demandes.interventions.facture', // Interventions avec factures
            'notifications'                  // Notifications du client
        ]);

        // Calculer des statistiques
        $stats = [
            'total_demandes' => $client->demandes->count(),
            'demandes_en_cours' => $client->demandes->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])->count(),
            'demandes_terminees' => $client->demandes->where('status', 'terminee')->count(),
            'demandes_annulees' => $client->demandes->where('status', 'annulee')->count(),
            'total_depense' => $client->demandes()
                                     ->whereHas('interventions.facture', function($q) {
                                         $q->where('status', 'payee');
                                     })
                                     ->with('interventions.facture')
                                     ->get()
                                     ->flatMap->interventions
                                     ->pluck('facture')
                                     ->sum('montant'),
        ];

        return view('admin.clients.show', compact('client', 'stats'));
    }

   // afficher le formulaire de modification d'un client
    public function edit(Client $client)
    {
        return view('admin.clients.edit', compact('client'));
    }

    // afficher le formulaire de mis à jour d'un client
    public function update(Request $request, Client $client)
    {
        // Validation : unique sauf pour le client actuel
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email,' . $client->id,
            'phone' => 'required|string|max:20',
        ]);

        DB::beginTransaction();
        
        try {
            // Mettre à jour le client
            $client->update($validated);

            // Mettre à jour aussi le compte utilisateur associé si existe
            if ($client->utilisateur) {
                $client->utilisateur->update([
                    'fullName' => $validated['fullName'],
                    'email' => $validated['email'],
                ]);
            }

            DB::commit();

            return redirect()->route('admin.clients.show', $client)
                           ->with('success', 'Client mis à jour avec succès.');
                           
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withInput()
                       ->with('error', 'Erreur lors de la mise à jour : ' . $e->getMessage());
        }
    }

    // permet de supprimer un client
    public function destroy(Client $client)
    {
        // Vérifier qu'il n'a pas de demandes en cours
        if ($client->demandes()->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])->exists()) {
            return back()->with('error', 'Impossible de supprimer un client avec des demandes en cours.');
        }

        DB::beginTransaction();
        
        try {
            // Supprimer le compte utilisateur associé
            if ($client->utilisateur) {
                $client->utilisateur->delete();
            }

            // Supprimer le client (cascade supprimera les demandes terminées)
            $client->delete();

            DB::commit();

            return redirect()->route('admin.clients.index')
                           ->with('success', 'Client supprimé avec succès.');
                           
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Erreur lors de la suppression : ' . $e->getMessage());
        }
    }

    // ==================== API METHODS ====================

    /**
     * Afficher les détails d'un client (API)
     */
    public function showApi(Client $client)
    {
        try {
            $client->load([
                'demandes.depanneur',
                'demandes.interventions.facture',
                'notifications'
            ]);

            // Calculer des statistiques
            $totalDepense = $client->demandes()
                ->whereHas('interventions.facture', function($q) {
                    $q->where('status', 'payee');
                })
                ->with('interventions.facture')
                ->get()
                ->flatMap->interventions
                ->pluck('facture')
                ->sum('montant');

            return response()->json([
                'success' => true,
                'client' => [
                    'id' => $client->id,
                    'fullName' => $client->fullName,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'createdAt' => $client->createdAt,
                    'updatedAt' => $client->updatedAt,
                    'demandes_count' => $client->demandes->count(),
                    'total_depenses' => $totalDepense,
                    'demandes' => $client->demandes->map(fn($d) => [
                        'id' => $d->id,
                        'codeDemande' => $d->codeDemande,
                        'status' => $d->status,
                        'createdAt' => $d->createdAt,
                    ]),
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
     * Créer un nouveau client (API) - Pour l'admin
     */
    public function storeApi(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email',
            'phone' => 'required|string|max:20',
            'password' => 'required|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            // Récupérer le type de compte "Client"
            $typeCompteClient = \App\Models\TypeCompte::where('name', 'Client')->first();

            // Si le type de compte n'existe pas, créer le client quand même sans utilisateur lié
            if (!$typeCompteClient) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de configuration: Type de compte "Client" non trouvé. Veuillez contacter l\'administrateur système.',
                ], 500);
            }

            // Créer le profil client
            $client = Client::create([
                'fullName' => $request->fullName,
                'email' => $request->email,
                'phone' => $request->phone,
            ]);

            // Créer le compte utilisateur associé
            $utilisateur = Utilisateur::create([
                'fullName' => $request->fullName,
                'email' => $request->email,
                'password' => $request->password,
                'id_type_compte' => $typeCompteClient->id,
                'id_client' => $client->id,
                'email_verified' => true, // Créé par admin = vérifié
                'isActive' => true,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Client créé avec succès.',
                'client' => [
                    'id' => $client->id,
                    'fullName' => $client->fullName,
                    'email' => $client->email,
                    'phone' => $client->phone,
                ],
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erreur création client API: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Mettre à jour un client (API)
     */
    public function updateApi(Request $request, Client $client)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email,' . $client->id,
            'phone' => 'required|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Données invalides.',
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::beginTransaction();
        
        try {
            $client->update($validator->validated());

            if ($client->utilisateur) {
                $client->utilisateur->update([
                    'fullName' => $request->fullName,
                    'email' => $request->email,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Client mis à jour avec succès.',
                'client' => $client,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Supprimer un client (API) - Suppression logique (soft delete)
     */
    public function destroyApi(Client $client)
    {
        // Vérifier qu'il n'a pas de demandes en cours
        if ($client->demandes()->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un client avec des demandes en cours.',
            ], 400);
        }

        try {
            // Suppression logique (soft delete)
            $client->delete();

            // Si l'utilisateur associé existe, le supprimer aussi logiquement
            if ($client->utilisateur) {
                $client->utilisateur->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Client supprimé avec succès (suppression logique).',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression : ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restaurer un client supprimé (API)
     */
    public function restoreApi(Client $client)
    {
        try {
            // Restaurer le client
            $client->restore();

            // Restaurer l'utilisateur associé si existant
            if ($client->utilisateur) {
                $client->utilisateur->restore();
            }

            return response()->json([
                'success' => true,
                'message' => 'Client restauré avec succès.',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la restauration : ' . $e->getMessage(),
            ], 500);
        }
    }
}
