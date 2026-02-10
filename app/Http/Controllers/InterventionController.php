<?php



namespace App\Http\Controllers;

use App\Models\Intervention;
use App\Models\Demande;
use App\Models\Facture;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class InterventionController extends Controller
{
   
    public function index()
    {
        $utilisateur = Auth::user();

        if ($utilisateur->isDepanneur()) {
            // Dépanneur: voir ses propres interventions
            $interventions = Intervention::where('id_depanneur', $utilisateur->depanneur->id)
                                        ->with(['demande.client'])
                                        ->orderBy('createdAt', 'desc')
                                        ->paginate(15);

        } elseif ($utilisateur->isClient()) {
            // Client: voir les interventions de ses demandes
            $interventions = Intervention::whereHas('demande', function($q) use ($utilisateur) {
                                            $q->where('id_client', $utilisateur->client->id);
                                        })
                                        ->with(['depanneur'])
                                        ->orderBy('createdAt', 'desc')
                                        ->paginate(15);

        } else {
            // Admin: voir toutes les interventions
            $interventions = Intervention::with(['demande.client', 'depanneur'])
                                        ->orderBy('createdAt', 'desc')
                                        ->paginate(15);
        }

        return view('interventions.index', compact('interventions'));
    }

   
    public function show(Intervention $intervention)
    {
        // Charger les relations nécessaires
        $intervention->load(['demande.client', 'depanneur', 'facture']);

        return view('interventions.show', compact('intervention'));
    }

   
    public function start(Demande $demande)
    {
        $utilisateur = Auth::user();

        
        if (!$utilisateur->isDepanneur()) {
            abort(403, 'Seuls les dépanneurs peuvent démarrer une intervention.');
        }

        
        // Le dépanneur doit être celui assigné
        if ($demande->id_depanneur !== $utilisateur->depanneur->id) {
            abort(403, 'Cette demande ne vous est pas assignée.');
        }

       
        // La demande doit être acceptée
        if ($demande->status !== 'acceptee') {
            return back()->with('error', 'Cette demande n\'est pas dans le bon état.');
        }

        // begin est une méthde utilisée pour démarrer une transaction
        DB::beginTransaction();

        try {
            // créer l'intervention
            $intervention = Intervention::create([
                'id_demande' => $demande->id,
                'id_depanneur' => $utilisateur->depanneur->id,
                'status' => 'en_cours',
                'startedAt' => now(),
            ]);

            // Mettre à jour le statut de la demande
            $demande->update(['status' => 'en_cours']);

            // Notifier le client
            Notification::create([
                'message' => 'Le dépanneur est en route vers votre position.',
                'type' => 'depannage_en_route',
                'id_client' => $demande->id_client,
                'id_demande' => $demande->id,
            ]);

            // Valider la transaction
            DB::commit();

            // Rediriger vers la page de l'intervention
            return redirect()->route('interventions.show', $intervention)
                           ->with('success', 'Intervention démarrée avec succès.');

        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            DB::rollBack();

            return back()->with('error', 'Erreur lors du démarrage de l\'intervention.');
        }
    }

    
    public function complete(Request $request, Intervention $intervention)
    {
        // validation: vérifier que l'utilisateur est le dépanneur assigné
        $validated = $request->validate([
            'piecesremplacees' => 'nullable|string',  // Pièces remplacées
            'observations' => 'nullable|string',       // Observations
            'coutPiece' => 'required|numeric|min:0',   // Coût des pièces
            'coutMainOeuvre' => 'required|numeric|min:0', // Coût main d'œuvre
        ]);

        // begin est une méthode utilisée pour démarrer une transaction
        
        DB::beginTransaction();

        try {
            // mettre à jour l'intervention
            $intervention->update([
                'piecesremplacees' => $validated['piecesremplacees'],
                'observations' => $validated['observations'],
                'coutPiece' => $validated['coutPiece'],
                'coutMainOeuvre' => $validated['coutMainOeuvre'],
                'status' => 'terminee',
                'completedAt' => now(),
            ]);
            
            
            $intervention->demande->update([
                'status' => 'terminee',
                'completedAt' => now(),
            ]);

            
            Auth::user()->depanneur->update(['status' => 'disponible']);

            // créer la facture
            $facture = Facture::create([
                'montant' => $intervention->coutTotal,
                'mdePaiement' => 'cash', // Par défaut, sera choisi par le client
                'status' => 'en_attente',
                'id_intervention' => $intervention->id,
            ]);

            // Notifier le client
            Notification::create([
                'message' => 'Votre intervention est terminée. Montant à payer : ' . $intervention->coutTotal . ' FCFA',
                'type' => 'intervention_terminee',
                'id_client' => $intervention->demande->id_client,
                'id_demande' => $intervention->demande->id,
            ]);

            // Valider la transaction
            DB::commit();

            // Rediriger vers la page de la facture
            return redirect()->route('factures.show', $facture)
                           ->with('success', 'Intervention terminée avec succès.');

        } catch (\Exception $e) {
            // Annuler la transaction en cas d'erreur
            DB::rollBack();

            return back()->with('error', 'Erreur lors de la finalisation de l\'intervention.');
        }
    }

   // Afficher les interventions en cours du dépanneur
    public function enCours()
    {
        $utilisateur = Auth::user();

        if (!$utilisateur->isDepanneur()) {
            abort(403, 'Seuls les dépanneurs peuvent accéder à cette page.');
        }

        $interventions = Intervention::where('id_depanneur', $utilisateur->depanneur->id)
                                    ->where('status', 'en_cours')
                                    ->with(['demande.client'])
                                    ->orderBy('startedAt', 'desc')
                                    ->get();

        return view('depanneur.interventions.en-cours', compact('interventions'));
    }

   // 
    public function historique()
    {
        $utilisateur= Auth::user();

        if (!$utilisateur->isDepanneur()) {
            abort(403, 'Seuls les dépanneurs peuvent accéder à cette page.');
        }

        $interventions = Intervention::where('id_depanneur', $utilisateur->depanneur->id)
                                    ->where('status', 'terminee')
                                    ->with(['demande.client', 'facture'])
                                    ->orderBy('completedAt', 'desc')
                                    ->paginate(20);

        // Calculer les statistiques
        $stats = [
            'total' => $interventions->total(),
            'revenu_total' => $interventions->sum('coutTotal'),
            'revenu_mois' => $interventions->where('completedAt', '>=', now()->startOfMonth())->sum('coutTotal'),
        ];

        return view('depanneur.interventions.historique', compact('interventions', 'stats'));
    }
}

