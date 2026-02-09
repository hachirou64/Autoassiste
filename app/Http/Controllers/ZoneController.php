<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Models\Depanneur;
use Illuminate\Http\Request;

class ZoneController extends Controller
{
   // Middleware pour restreindre l'accès aux administrateurs
    public function __construct()
    {
        // Seuls les admins peuvent créer/modifier/supprimer des zones
        $this->middleware(function ($request, $next) {
            if (!auth()->utilisateur()->isAdmin()) {
                abort(403, 'Accès réservé aux administrateurs.');
            }
            return $next($request);
        })->except(['index', 'show', 'myZones']);
    }

   // Afficher la liste des zones
    public function index()
    {
        // Récupérer toutes les zones avec le nombre de dépanneurs
        $zones = Zone::withCount('depanneurs')
                    ->orderBy('city')
                    ->orderBy('name')
                    ->paginate(20);

        return view('admin.zones.index', compact('zones'));
    }

    // Afficher le formulaire de création d'une nouvelle zone
    public function create()
    {
        return view('admin.zones.create');
    }
// Stocker une nouvelle zone
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'description' => 'nullable|string',
            'isActive' => 'boolean',
        ]);

        // Créer la zone
        $zone = Zone::create([
            'name' => $validated['name'],
            'city' => $validated['city'],
            'description' => $validated['description'] ?? null,
            'isActive' => $validated['isActive'] ?? true,
        ]);

        return redirect()->route('admin.zones.index')
                       ->with('success', 'Zone créée avec succès.');
    }

   // Afficher une zone spécifique
    public function show(Zone $zone)
    {
        // Charger les dépanneurs de cette zone avec leurs statistiques
        $zone->load(['depanneurs' => function($query) {
            $query->withCount('interventions');
        }]);

        // Statistiques de la zone
        $stats = [
            'total_depanneurs' => $zone->depanneurs->count(),
            'depanneurs_actifs' => $zone->depanneurs->where('isActive', true)->count(),
            'depanneurs_disponibles' => $zone->depanneurs->where('status', 'disponible')->count(),
        ];

        return view('admin.zones.show', compact('zone', 'stats'));
    }
// Afficher le formulaire de modification d'une zone
    public function edit(Zone $zone)
    {
        return view('admin.zones.edit', compact('zone'));
    }
// Mettre à jour une zone existante
    public function update(Request $request, Zone $zone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'description' => 'nullable|string',
            'isActive' => 'boolean',
        ]);

        $zone->update($validated);

        return redirect()->route('admin.zones.show', $zone)
                       ->with('success', 'Zone mise à jour avec succès.');
    }

   // Supprimer une zone
    public function destroy(Zone $zone)
    {
        // Vérifier qu'aucun dépanneur n'est assigné à cette zone
        if ($zone->depanneurs()->exists()) {
            return back()->with('error', 'Impossible de supprimer une zone ayant des dépanneurs assignés.');
        }

        $zone->delete();

        return redirect()->route('admin.zones.index')
                       ->with('success', 'Zone supprimée avec succès.');
    }

    // Activer/Désactiver une zone
    public function toggleStatus(Zone $zone)
    {
        $zone->update([
            'isActive' => !$zone->isActive,
        ]);

        $status = $zone->isActive ? 'activée' : 'désactivée';

        return back()->with('success', "Zone {$status} avec succès.");
    }
// Afficher les zones assignées au dépanneur connecté
    public function myZones()
    {
        // Vérifier que c'est un dépanneur
        if (!auth()->utilisateur()->isDepanneur()) {
            abort(403, 'Accès réservé aux dépanneurs.');
        }

        $depanneur = auth()->utilisateur()->depanneur;
        
        // Récupérer les zones du dépanneur avec les informations du pivot
        $zones = $depanneur->zones()
                          ->withPivot('priorite', 'dateAjout')
                          ->orderByPivot('priorite', 'desc')
                          ->get();

        return view('depanneur.zones', compact('zones'));
    }
}
