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

    
    /**
     * API: Créer une demande et retourner du JSON
     */
    public function storeApi(Request $request)
    {
        // Vérifier que l'utilisateur est connecté
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être connecté pour créer une demande.',
                'code' => 'UNAUTHENTICATED'
            ], 401);
        }

        // Vérifier que l'utilisateur est un client
        $user = $request->user();
        
        // Charger la relation typeCompte si pas déjà chargée
        if (!$user->relationLoaded('typeCompte')) {
            $user->load('typeCompte');
        }
        
        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être connecté en tant que client pour créer une demande.',
                'code' => 'NOT_CLIENT'
            ], 403);
        }

        // Validation des données
        $validated = $request->validate([
            'vehicleType' => 'required|string|in:voiture,moto,camion,utilitaire',
            'typePanne' => 'required|string',
            'description' => 'nullable|string|max:500',
            'localisation' => 'required|string',
        ]);

        // Parser la localisation (format: "lat,lng")
        $coords = explode(',', $validated['localisation']);
        $latitude = trim($coords[0]);
        $longitude = isset($coords[1]) ? trim($coords[1]) : '';

        if (empty($latitude) || empty($longitude)) {
            return response()->json([
                'success' => false,
                'message' => 'Coordonnées GPS invalides.'
            ], 400);
        }

        try {
            // Créer la demande
            $demande = Demande::create([
                'localisation' => $validated['localisation'],
                'descriptionProbleme' => $validated['description'] ?? '',
                'vehicle_type' => $validated['vehicleType'],
                'typePanne' => $validated['typePanne'],
                'status' => 'en_attente',
                'id_client' => $request->user()->client->id,
            ]);

            // Trouver les dépanneurs à proximité
            $depanneursDisponibles = $this->findNearbyDepanneurs(
                (float)$latitude,
                (float)$longitude,
                $this->defaultRadius,
                $validated['vehicleType']
            );

            //Notifier les dépanneurs
            foreach ($depanneursDisponibles as $depanneur) {
                Notification::create([
                    'message' => 'Nouvelle demande: ' . $demande->codeDemande,
                    'type' => 'nouvelle_demande',
                    'id_depanneur' => $depanneur->id,
                    'id_demande' => $demande->id,
                ]);
            }

            // Notifier le client
            Notification::create([
                'message' => 'Votre demande a été enregistrée. Code: ' . $demande->codeDemande,
                'type' => 'demande_recue',
                'id_client' => $request->user()->client->id,
                'id_demande' => $demande->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Demande créée avec succès',
                'demande' => [
                    'id' => $demande->id,
                    'codeDemande' => $demande->codeDemande,
                    'status' => $demande->status,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la demande: ' . $e->getMessage()
            ], 500);
        }
    }

    
    public function index()
    {
        // Récupérer l'utilisateur connecté
        $utilisateur = Auth::user();

       
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
        
        if (!Auth::user()->isClient()) {
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
            'vehicle_type' => 'required|in:voiture,moto', // Type de véhicule obligatoire
        ]);

       
        $localisation = $validated['latitude'] . ',' . $validated['longitude'];

        
        // Note: Le code de demande est généré automatiquement par le modèle
        $demande = Demande::create([
            'localisation' => $localisation,
            'descriptionProbleme' => $validated['descriptionProbleme'],
            'vehicle_type' => $validated['vehicle_type'],
            'status' => 'en_attente',  // Statut initial
            'id_client' => Auth::user()->client->id,  // ID du client connecté
        ]);

       
        // Utilise une méthode helper qui calcule la distance avec Haversine
        // Filtre par type de véhicule du dépanneur
        $depanneursDisponibles = $this->findNearbyDepanneurs(
            $validated['latitude'],
            $validated['longitude'],
            $this->defaultRadius,
            $validated['vehicle_type']
        );

        
        foreach ($depanneursDisponibles as $depanneur) {
            Notification::create([
                'message' => 'Nouvelle demande d\'assistance disponible : ' . $demande->codeDemande . ' (' . $demande->vehicle_type_label . ')',
                'type' => 'nouvelle_demande',
                'id_depanneur' => $depanneur->id,
                'id_demande' => $demande->id,
            ]);
        }

        
        Notification::create([
            'message' => 'Votre demande a été enregistrée. Code : ' . $demande->codeDemande . ' - ' . ucfirst($demande->vehicle_type),
            'type' => 'nouvelle_demande',
            'id_client' => Auth::user()->client->id,
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
        $utilisateur = Auth::user();

        
        if (!$utilisateur->isDepanneur()) {
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
        
        if (Auth::user()->client->id !== $demande->id_client) {
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
            'vehicleType' => $demande->vehicle_type,
            'depanneur' => $demande->depanneur ? [
                'etablissement' => $demande->depanneur->etablissement_name,
            ] : null,
            'updatedAt' => $demande->updatedAt,
        ]);
    }

    private function findNearbyDepanneurs(float $latitude, float $longitude, int $radius = 10, string $vehicleType = 'voiture')
    {
        try {
            // Version simplifiée - rechercher simplement les dépanneurs actifs
            // sans calcul de distance complexe
            $depanneurs = Depanneur::where('isActive', true)
                ->whereIn('status', ['disponible', 'hors_service'])
                ->forVehicleType($vehicleType)
                ->limit(20)
                ->get();
                
            // Calculer la distance manuellement en PHP pour plus de fiabilité
            $depanneursWithDistance = $depanleurs->map(function ($depanneur) use ($latitude, $longitude) {
                $coords = $depanneur->coordinates;
                if ($coords['lat'] && $coords['lng']) {
                    $distance = $this->calculateDistance(
                        $latitude, 
                        $longitude, 
                        $coords['lat'], 
                        $coords['lng']
                    );
                    $depanneur->distance = $distance;
                } else {
                    // Si pas de coordonnées, attribuer une distance de 0 pour l'inclure
                    // (le dépanneur devra mettre à jour sa position)
                    $depanneur->distance = 0;
                }
                return $depanneur;
            });
            
            // Filtrer par rayon (inclure ceux sans coordonnées avec distance 0)
            return $depanneursWithDistance
                ->filter(fn($d) => $d->distance <= $radius)
                ->sortBy('distance')
                ->take($this->maxDepanneursToNotify);
                
        } catch (\Exception $e) {
            \Log::error('Error finding nearby depanneurs: ' . $e->getMessage());
            // Retourner une collection vide en cas d'erreur
            return collect([]);
        }
    }
    
    /**
     * Calculer la distance entre deux points en km (formule de Haversine)
     */
    private function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Rayon de la Terre en km
        
        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLon = deg2rad($lon2 - $lon1);
        
        $a = sin($deltaLat / 2) * sin($deltaLat / 2) +
             cos($lat1Rad) * cos($lat2Rad) *
             sin($deltaLon / 2) * sin($deltaLon / 2);
             
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }

    /**
     * API: Obtenir les dépanneurs disponibles proches
     */
    public function getNearbyDepanneurs(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'vehicle_type' => 'required|in:voiture,moto,camion',
            'radius' => 'nullable|integer|min:1|max:50',
        ]);

        $radius = $validated['radius'] ?? 10;
        
        $depanneurs = $this->findNearbyDepanneurs(
            (float)$validated['latitude'],
            (float)$validated['longitude'],
            $radius,
            $validated['vehicle_type']
        );

        return response()->json([
            'success' => true,
            'depanneurs' => $depanneurs->map(fn($d) => [
                'id' => $d->id,
                'name' => $d->etablissement_name,
                'rating' => $d->rating ?? 4.5,
                'reviews' => $d->reviews_count ?? 0,
                'distance' => round($d->distance, 1),
                'estimated_time' => round(($d->distance ?? 0) / 40 * 60), // Estimation basée sur 40km/h
                'price_min' => $d->price_min ?? 50,
                'price_max' => $d->price_max ?? 80,
                'specialities' => $d->specialites ?? '',
                'phone' => $d->phone ?? '',
                'avatar' => $d->avatar_url ?? null,
            ]),
        ]);
    }

    /**
     * API: Traiter un paiement
     */
    public function processPayment(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $demande = Demande::findOrFail($id);

        // Vérifier l'ownership
        $client = Client::where('id_utilisateur', $user->id)->first();
        
        if (!$client || $demande->id_client !== $client->id) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'required|in:card,cash,mobile',
            'card_data' => 'nullable|array',
        ]);

        try {
            // Créer une facture
            $facture = Facture::create([
                'code' => 'FAC-' . now()->format('YmdHis'),
                'id_demande' => $demande->id,
                'montant' => $validated['amount'],
                'status' => 'payee',
                'payment_method' => $validated['method'],
                'createdAt' => now(),
                'updatedAt' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Paiement traité avec succès',
                'facture' => [
                    'id' => $facture->id,
                    'code' => $facture->code,
                    'montant' => $facture->montant,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors du traitement du paiement',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * API: Évaluer une intervention
     */
    public function evaluate(Request $request, $id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $demande = Demande::findOrFail($id);

        // Vérifier l'ownership
        $client = Client::where('id_utilisateur', $user->id)->first();
        
        if (!$client || $demande->id_client !== $client->id) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        try {
            // Créer une notification pour le dépanneur
            if ($demande->id_depanneur) {
                $depanneur = Depanneur::findOrFail($demande->id_depanneur);
                
                Notification::create([
                    'titre' => 'Nouvelle évaluation',
                    'contenu' => "Note: {$validated['rating']}/5 - {$validated['comment']}",
                    'type' => 'evaluation',
                    'id_utilisateur' => $depanneur->id_utilisateur,
                    'id_demande' => $demande->id,
                    'is_read' => false,
                    'createdAt' => now(),
                    'updatedAt' => now(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Évaluation enregistrée',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Erreur lors de l\'enregistrement',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}


