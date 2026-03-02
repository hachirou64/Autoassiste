<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Demande;
use App\Models\Facture;
use App\Models\Intervention;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class FactureController extends Controller
{
    public function index()
    {
        $utilisateur = auth()->utilisateur();

        if ($utilisateur->isClient()) {
            // Client: voir uniquement ses factures
            $factures = Facture::whereHas('intervention.demande', function($q) use ($utilisateur) {
                            $q->where('id_client', $utilisateur->client->id);
                        })
                        ->with(['intervention.demande', 'intervention.depanneur'])
                        ->orderBy('createdAt', 'desc')
                        ->paginate(15);

        } elseif ($utilisateur->isDepanneur()) {
            // Dépanneur: voir les factures de ses interventions
            $factures = Facture::whereHas('intervention', function($q) use ($utilisateur) {
                            $q->where('id_depanneur', $utilisateur->depanneur->id);
                        })
                        ->with(['intervention.demande.client'])
                        ->orderBy('createdAt', 'desc')
                        ->paginate(15);

        } else {
            // Admin: voir toutes les factures
            $factures = Facture::with(['intervention.demande.client', 'intervention.depanneur'])
                              ->orderBy('createdAt', 'desc')
                              ->paginate(20);
        }

        // Statistiques globales
        $stats = [
            'total' => $factures->total(),
            'en_attente' => Facture::where('status', 'en_attente')->count(),
            'payees' => Facture::where('status', 'payee')->count(),
            'montant_total' => $factures->sum('montant'),
        ];

        return view('factures.index', compact('factures', 'stats'));
    }

    public function show(Facture $facture)
    {
        // VÉRIFICATION DES AUTORISATIONS
        $utilisateur = auth()->utilisateur();

        if ($utilisateur->isClient() && $facture->intervention->demande->id_client !== $utilisateur->client->id) {
            abort(403, 'Accès non autorisé.');
        }

        if ($utilisateur->isDepanneur() && $facture->intervention->id_depanneur !== $utilisateur->depanneur->id) {
            abort(403, 'Accès non autorisé.');
        }

        // CHARGEMENT DES RELATIONS
        $facture->load([
            'intervention.demande.client',
            'intervention.depanneur',
            'intervention.services'
        ]);

        return view('factures.show', compact('facture'));
    }

    /**
     * API: Payer une facture existante
     */
    public function payer(Request $request, Facture $facture)
    {
        // VÉRIFICATION: Le client doit être le propriétaire
        $utilisateur = auth()->utilisateur();

        if (!$utilisateur->isClient() || $facture->intervention->demande->id_client !== $utilisateur->client->id) {
            abort(403, 'Action non autorisée.');
        }

        // VÉRIFICATION: La facture ne doit pas être déjà payée
        if ($facture->status === 'payee') {
            return back()->with('error', 'Cette facture a déjà été payée.');
        }

        // VALIDATION DU MODE DE PAIEMENT
        $validated = $request->validate([
            'mdePaiement' => 'required|in:cash,mobile_money,carte_bancaire,virement',
        ]);

        // TRANSACTION BDD
        DB::beginTransaction();

        try {
            // ÉTAPE 1: Mettre à jour la facture avec le mode de paiement
            $facture->update([
                'mdePaiement' => $validated['mdePaiement'],
            ]);

            // ÉTAPE 2: Marquer la facture comme payée
            $facture->marquerCommePayee();

            // ÉTAPE 3: Notifier le dépanneur du paiement
            Notification::create([
                'message' => 'Paiement reçu pour la facture ' . $facture->transactionId . ' - Montant : ' . $facture->montant . 'FCFA',
                'type' => 'paiement_recu',
                'id_depanneur' => $facture->intervention->id_depanneur,
            ]);

            // Valider la transaction
            DB::commit();

            // Rediriger vers la page de la facture avec succès
            return redirect()->route('client.factures.show', $facture)
                           ->with('success', 'Paiement effectué avec succès !');

        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            DB::rollBack();

            return back()->with('error', 'Erreur lors du paiement : ' . $e->getMessage());
        }
    }

/**
     * API: Payer une facture par ID (JSON)
     */
    public function payerApi(Request $request, $id)
    {
        $utilisateur = auth()->utilisateur();

        if (!$utilisateur) {
            return response()->json(['success' => false, 'error' => 'Non authentifié'], 401);
        }

        $facture = Facture::findOrFail($id);

        // Vérifier que le client est le propriétaire
        if (!$utilisateur->client || $facture->intervention->demande->id_client !== $utilisateur->client->id) {
            return response()->json(['success' => false, 'error' => 'Accès non autorisé'], 403);
        }

        // Vérifier que la facture n'est pas déjà payée
        if ($facture->status === 'payee') {
            return response()->json(['success' => false, 'error' => 'Facture déjà payée'], 400);
        }

        // Validation du mode de paiement
        $validated = $request->validate([
            'method' => 'required|in:cash,mobile_money,carte_bancaire,virement',
        ]);

        DB::beginTransaction();

        try {
            // Mettre à jour la facture
            $facture->update([
                'mdePaiement' => $validated['method'],
            ]);

            // Marquer comme payée
            $facture->marquerCommePayee();

            // Notifier le dépanneur
            Notification::create([
                'message' => 'Paiement reçu pour la facture ' . $facture->transactionId . ' - Montant : ' . $facture->montant . 'FCFA',
                'type' => 'paiement_recu',
                'id_depanneur' => $facture->intervention->id_depanneur,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Paiement effectué avec succès',
                'facture' => [
                    'id' => $facture->id,
                    'status' => $facture->status,
                    'paidAt' => $facture->paidAt,
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'error' => 'Erreur lors du paiement',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Récupérer les données d'une facture pour la page de paiement
     */
    public function getForPayment($id)
    {
        $utilisateur = auth()->utilisateur();

        if (!$utilisateur) {
            return response()->json(['success' => false, 'error' => 'Non authentifié'], 401);
        }

        $facture = Facture::with([
            'intervention.demande.client',
            'intervention.depanneur',
        ])->findOrFail($id);

        // Vérifier que le client est le propriétaire
        if (!$utilisateur->client || $facture->intervention->demande->id_client !== $utilisateur->client->id) {
            return response()->json(['success' => false, 'error' => 'Accès non autorisé'], 403);
        }

        return response()->json([
            'success' => true,
            'facture' => [
                'id' => $facture->id,
                'montant' => $facture->montant,
                'status' => $facture->status,
                'transactionId' => $facture->transactionId,
                'createdAt' => $facture->createdAt->toIsoString(),
                'intervention' => [
                    'id' => $facture->intervention->id,
                    'demande' => [
                        'codeDemande' => $facture->intervention->demande->codeDemande,
                        'typePanne' => $facture->intervention->demande->typePanne,
                        'client' => [
                            'fullName' => $facture->intervention->demande->client->fullName,
                        ],
                    ],
                    'depanneur' => [
                        'etablissement_name' => $facture->intervention->depanneur->etablissement_name,
                    ],
                ],
            ],
        ]);
    }

    public function downloadPdf(Facture $facture)
    {
        // VÉRIFICATION DES AUTORISATIONS
        $utilisateur = auth()->utilisateur();

        if ($utilisateur->isClient() && $facture->intervention->demande->id_client !== $utilisateur->client->id) {
            abort(403, 'Accès non autorisé.');
        }

        if ($utilisateur->isDepanneur() && $facture->intervention->id_depanneur !== $utilisateur->depanneur->id) {
            abort(403, 'Accès non autorisé.');
        }

        // CHARGEMENT DES DONNÉES NÉCESSAIRES
        $facture->load([
            'intervention.demande.client',
            'intervention.depanneur',
            'intervention.services'
        ]);

        return view('factures.pdf', compact('facture'));
    }

    public function annuler(Facture $facture)
    {
        // Vérifier que c'est un admin
        if (!auth()->utilisateur()->isAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        // Une facture payée ne peut pas être annulée
        if ($facture->status === 'payee') {
            return back()->with('error', 'Impossible d\'annuler une facture déjà payée.');
        }

        $facture->update(['status' => 'annulee']);

        return back()->with('success', 'Facture annulée avec succès.');
    }

    public function remboursser(Facture $facture)
    {
        // Vérifier que c'est un admin
        if (!auth()->utilisateur()->isAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        // Seules les factures payées peuvent être remboursées
        if ($facture->status !== 'payee') {
            return back()->with('error', 'Seules les factures payées peuvent être remboursées.');
        }

        DB::beginTransaction();

        try {
            // Marquer comme remboursée
            $facture->update(['status' => 'remboursee']);

            // Notifier le client
            Notification::create([
                'message' => 'Votre facture ' . $facture->transactionId . ' a été remboursée.',
                'type' => 'paiement_recu',
                'id_client' => $facture->intervention->demande->id_client,
            ]);

            DB::commit();

            return back()->with('success', 'Facture remboursée avec succès.');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Erreur lors du remboursement.');
        }
    }

    // Afficher les statistiques des factures (Admin uniquement)
    public function statistiques()
    {
        if (!auth()->utilisateur()->isAdmin()) {
            abort(403, 'Accès réservé aux administrateurs.');
        }

        // Statistiques du mois
        $statsMois = [
            'total_factures' => Facture::thisMonth()->count(),
            'montant_total' => Facture::thisMonth()->sum('montant'),
            'factures_payees' => Facture::thisMonth()->payee()->count(),
            'factures_en_attente' => Facture::thisMonth()->enAttente()->count(),
        ];

        // Répartition par mode de paiement
        $repartitionMode = Facture::payee()
            ->thisMonth()
            ->selectRaw('mdePaiement, COUNT(*) as count, SUM(montant) as total')
            ->groupBy('mdePaiement')
            ->get();

        return view('admin.factures.statistiques', compact('statsMois', 'repartitionMode'));
    }
}

