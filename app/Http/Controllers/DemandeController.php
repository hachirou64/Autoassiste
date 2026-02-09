<?php



namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\Depanneur;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class DemandeController extends Controller
{
    
    protected int $defaultRadius = 10;

    
    protected int $maxDepanneursToNotify = 5;

    
    public function index()
    {
        // Récupérer l'utilisateur connecté
        $user = Auth::utilisateur();

    
       
        if ($utilisateur->isClient()) {
            $demandes = Demande::where('id_client', $utilisateur->client->id)
                               // Charger les relations pour éviter les requêtes N+1
                               ->with(['depanneur', 'services'])
                               // Trier par date de création décroissante
                               ->orderBy('createdAt', 'desc')
                               ->paginate(10);

        } elseif ($utilisateur->isDepanneur()) {
            
            $demandes = Demande::where('id_depanneur', $utilisateur->depanneur->id)
                               ->with(['client', 'services'])
                               ->orderBy('createdAt', 'desc')
                               ->paginate(10);

        } else {
            
            $demandes = Demande::with(['client', 'depanneur'])
                               ->orderBy('createdAt', 'desc')
                               ->paginate(10);
        }

        // Retourner la vue avec les demandes
        return view('demandes.index', compact('demandes'));
    }

    
    public function create()
    {
        
        if (!Auth::utilisateur()->isClient()) {
            // Si ce n'est pas un client, retourner une erreur 403
            abort(403, 'Action non autorisée. Seul un client peut créer une demande.');
        }

        // Afficher le formulaire de création
        return view('demandes.create');
    }

   
    public function store(Request $request)
    {
       // validation des données
        $validated = $request->validate([
            'latitude' => 'required|numeric',           // Latitude obligatoire
            'longitude' => 'required|numeric',          // Longitude obligatoire
            'descriptionProbleme' => 'required|string|min:10', // Description min 10 caractères
        ]);

       
        $localisation = $validated['latitude'] . ',' . $validated['longitude'];

        
        // Note: Le code de demande est généré automatiquement par le modèle
        $demande = Demande::create([
            'localisation' => $localisation,
            'descriptionProbleme' => $validated['descriptionProbleme'],
            'status' => 'en_attente',  // Statut initial
            'id_client' => Auth::utilisateur()->client->id,  // ID du client connecté
        ]);

       
        // Utilise une méthode helper qui calcule la distance avec Haversine
        $depanneursDisponibles = $this->findNearbyDepanneurs(
            $validated['latitude'],
            $validated['longitude'],
            $this->defaultRadius
        );

        
        foreach ($depanneursDisponibles as $depanneur) {
            Notification::create([
                'message' => 'Nouvelle demande d\'assistance disponible : ' . $demande->codeDemande,
                'type' => 'nouvelle_demande',
                'id_depanneur' => $depanneur->id,
                'id_demande' => $demande->id,
            ]);
        }

        
        Notification::create([
            'message' => 'Votre demande a été enregistrée. Code : ' . $demande->codeDemande,
            'type' => 'nouvelle_demande',
            'id_client' => Auth::utilisateur()->client->id,
            'id_demande' => $demande->id,
        ]);

        
        return redirect()->route('demandes.show', $demande)
                         ->with('success', 'Demande créée avec succès ! Code : ' . $demande->codeDemande);
    }

    
    public function show(Demande $demande)
    {
       
        // La méthode authorize() vérifie les policies (si définies)
        // Ici on fait une vérification manuelle simple
        $this->authorize('view', $demande);

        
        // Charger toutes les relations nécessaires pour éviter les requêtes N+1
        $demande->load(['client', 'depanneur', 'services', 'interventions.facture']);

        return view('demandes.show', compact('demande'));
    }

    
    public function accepter(Demande $demande)
    {
        // Récupérer l'utilisateur connecté
        $utilisateur = Auth::utilisateur();

        
        if (!$user->isDepanneur()) {
            abort(403, 'Seuls les dépanneurs peuvent accepter des demandes.');
        }

      
        if ($demande->status !== 'en_attente') {
            return back()->with('error', 'Cette demande n\'est plus disponible.');
        }

        
        DB::beginTransaction();

        try {
           
            $demande->update([
                'status' => 'acceptee',
                'id_depanneur' => $utilisateur->depanneur->id,
                'acceptedAt' => now(),  // Enregistrer la date d'acceptation
            ]);

            
            $utilisateur->depanneur->update([
                'status' => 'occupe',  // Le dépanneur devient occupé
            ]);

            
            Notification::create([
                'message' => 'Votre demande a été acceptée par ' . $utilisateur->depanneur->etablissement_name,
                'type' => 'demande_acceptee',
                'id_client' => $demande->id_client,
                'id_demande' => $demande->id,
            ]);

            
            DB::commit();

            // Rediriger vers la page de détails avec succès
            return redirect()->route('demandes.show', $demande)
                           ->with('success', 'Demande acceptée avec succès !');

        } catch (\Exception $e) {
            
            DB::rollBack();

            // Retourner avec erreur
            return back()->with('error', 'Erreur lors de l\'acceptation de la demande.');
        }
    }

   
    public function annuler(Demande $demande)
    {
        
        if (Auth::utilisateur()->client->id !== $demande->id_client) {
            abort(403, 'Action non autorisée. Vous n\'êtes pas le propriétaire de cette demande.');
        }

        
        if ($demande->status !== 'en_attente') {
            return back()->with('error', 'Cette demande ne peut plus être annulée.');
        }

      
        $demande->update(['status' => 'annulee']);

        // Rediriger vers la liste des demandes
        return redirect()->route('demandes.index')
                       ->with('success', 'Demande annulée avec succès.');
    }

   
    public function getStatus(Demande $demande)
    {
        return response()->json([
            'codeDemande' => $demande->codeDemande,
            'status' => $demande->status,
            'statutLabel' => $demande->statut_label,
            'depanneur' => $demande->depanneur ? [
                'etablissement' => $demande->depanneur->etablissement_name,
            ] : null,
            'updatedAt' => $demande->updatedAt,
        ]);
    }

    private function findNearbyDepanneurs(float $latitude, float $longitude, int $radius = 10)
    {
        
        // Scope: status = disponible ET isActive = true
        return Depanneur::disponible() 
            ->select('depanneurs.*')
            ->selectRaw(
                // Calcul de la distance en km avec la formule de Haversine
                '(6371 * acos(cos(radians(?)) * cos(radians(SUBSTRING_INDEX(localisation_actuelle, ",", 1))) *
                 cos(radians(SUBSTRING_INDEX(localisation_actuelle, ",", -1)) - radians(?)) +
                 sin(radians(?)) * sin(radians(SUBSTRING_INDEX(localisation_actuelle, ",", 1))))) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->having('distance', '<', $radius)  // Filtrer par rayon
            ->orderBy('distance')               // Trier par distance croissante
            ->limit($this->maxDepanneursToNotify)  // Limiter le nombre
            ->get();
    }
}

