<?php


namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Intervention;
use App\Models\Notification;
use Illuminate\Http\Request;
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
        
        $user = auth()->utilisateur();

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
                'message' => 'Paiement reçu pour la facture ' . $facture->transactionId . ' - Montant : ' . $facture->montant . ' FCFA',
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

    
    public function downloadPdf(Facture $facture)
    {
        
        // VÉRIFICATION DES AUTORISATIONS
        // Seul le client propriétaire, le dépanneur assigné ou l'admin peuvent télécharger
        $utilisateur = auth()->utilisateur();

        if ($utilisateur->isClient() && $facture->intervention->demande->id_client !== $utilisateur->client->id) {
            abort(403, 'Accès non autorisé.');
        }

        if ($utilisateur->isDepanneur() && $facture->intervention->id_depanneur !== $utilisateur->depanneur->id) {
            abort(403, 'Accès non autorisé.');
        }

    
        // CHARGEMENT DES DONNÉES NÉCESSAIRES
        // Pour générer le PDF avec toutes les infos pertinentes
        $facture->load([
            'intervention.demande.client',
            'intervention.depanneur',
            'intervention.services'
        ]);

        
        // Pour l'instant, on retourne la vue HTML
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

    
    public function rembourser(Facture $facture)
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

