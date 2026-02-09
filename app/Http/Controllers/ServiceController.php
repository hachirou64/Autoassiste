<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Intervention;
use Illuminate\Http\Request;


class ServiceController extends Controller
{
    // Enregistrer un nouveau service pour une intervention
    public function store(Request $request, Intervention $intervention)
    {
        // Vérifier que c'est le dépanneur de l'intervention
        if (auth()->user()->depanneur->id !== $intervention->id_depanneur) {
            abort(403, 'Action non autorisée.');
        }

        // Valider les données
        $validated = $request->validate([
            'action' => 'required|in:remorquage,reparation_sur_place,changement_roue,depannage_batterie,fourniture_carburant,autre',
            'commentaire' => 'nullable|string|max:500',
        ]);

        // Créer le service
        $service = Service::create([
            'id_demande' => $intervention->id_demande,
            'id_depanneur' => $intervention->id_depanneur,
            'action' => $validated['action'],
            'commentaire' => $validated['commentaire'] ?? null,
            'dateAction' => now(),
        ]);

        return back()->with('success', 'Service enregistré avec succès.');
    }

   // Afficher la liste des services pour le dépanneur connecté
    public function index()
    {
        // Vérifier que c'est un dépanneur
        if (!auth()->user()->isDepanneur()) {
            abort(403, 'Accès réservé aux dépanneurs.');
        }

        $depanneur = auth()->user()->depanneur;

        // Récupérer tous les services du dépanneur
        $services = Service::where('id_depanneur', $depanneur->id)
                          ->with(['demande.client', 'demande'])
                          ->orderBy('dateAction', 'desc')
                          ->paginate(20);

        // Statistiques par type de service
        $stats = Service::where('id_depanneur', $depanneur->id)
                       ->select('action', \DB::raw('count(*) as total'))
                       ->groupBy('action')
                       ->get()
                       ->pluck('total', 'action');

        return view('depanneur.services.index', compact('services', 'stats'));
    }

   // Afficher les détails d'un service
    public function show(Service $service)
    {
        // Vérifier les autorisations
        $utilisateur = auth()->utilisateur();
        
        if ($utilisateur->isDepanneur() && $service->id_depanneur !== $utilisateur->depanneur->id) {
            abort(403, 'Action non autorisée.');
        }

        if ($utilisateur->isClient() && $service->demande->id_client !== $utilisateur->client->id) {
            abort(403, 'Action non autorisée.');
        }

        $service->load(['demande.client', 'depanneur']);

        return view('services.show', compact('service'));
    }

    // Mettre à jour un service
    public function update(Request $request, Service $service)
    {
        // Seul le dépanneur qui a créé le service peut le modifier
        if (auth()->user()->depanneur->id !== $service->id_depanneur) {
            abort(403, 'Action non autorisée.');
        }

        $validated = $request->validate([
            'commentaire' => 'nullable|string|max:500',
        ]);

        $service->update($validated);

        return back()->with('success', 'Service mis à jour avec succès.');
    }

    // Supprimer un service
    public function destroy(Service $service)
    {
        // Seul un admin ou le dépanneur concerné peut supprimer
        $utilisateur = auth()->utilisateur();
        
        if (!$utilisateur->isAdmin() && $service->id_depanneur !== $utilisateur->depanneur->id) {
            abort(403, 'Action non autorisée.');
        }

        $service->delete();

        return back()->with('success', 'Service supprimé avec succès.');
    }
}

