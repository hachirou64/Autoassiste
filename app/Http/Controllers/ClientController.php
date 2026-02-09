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
            if (!auth()->utilisateur()->isAdmin()) {
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
}
