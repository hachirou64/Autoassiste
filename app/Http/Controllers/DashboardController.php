<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\Intervention;
use App\Models\Depanneur;
use App\Models\Client;
use App\Models\Zone;
use App\Models\Facture;
use App\Models\Notification;
use App\Models\Service;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Dashboard Admin - Page principale avec toutes les statistiques
     */
    public function adminDashboard()
    {
        $stats = $this->getGlobalStats();
        $recentActivities = $this->getRecentActivities();
        $alerts = $this->getAlerts();

        return inertia('admin/Dashboard', [
            'stats' => $stats,
            'recentActivities' => $recentActivities,
            'alerts' => $alerts,
        ]);
    }

    /**
     * Récupérer toutes les statistiques globales
     */
    public function getGlobalStats()
    {
        // Statistiques de base
        $basicStats = [
            'total_clients' => Client::count(),
            'total_depanneurs' => Depanneur::count(),
            'depanneurs_actifs' => Depanneur::where('isActive', true)->count(),
            'depanneurs_en_attente' => Depanneur::where('isActive', false)->count(),
            'total_zones' => Zone::count(),
            'zones_actives' => Zone::where('isActive', true)->count(),
        ];

        // Statistiques des demandes
        $demandeStats = [
            'total_demandes' => Demande::count(),
            'demandes_en_attente' => Demande::where('status', 'en_attente')->count(),
            'demandes_en_cours' => Demande::where('status', 'en_cours')->count(),
            'demandes_acceptees' => Demande::where('status', 'acceptee')->count(),
            'demandes_terminees' => Demande::where('status', 'terminee')->count(),
            'demandes_annulees' => Demande::where('status', 'annulee')->count(),
            'demandes_aujourdhui' => Demande::whereDate('createdAt', today())->count(),
        ];

        // Statistiques des interventions
        $interventionStats = [
            'total_interventions' => Intervention::count(),
            'interventions_en_cours' => Intervention::where('status', 'en_cours')->count(),
            'interventions_terminees' => Intervention::where('status', 'terminee')->count(),
            'interventions_mois' => Intervention::whereMonth('createdAt', now()->month)->count(),
        ];

        // Statistiques financières
        $financialStats = [
            'total_factures' => Facture::count(),
            'factures_payees' => Facture::where('status', 'payee')->count(),
            'factures_en_attente' => Facture::where('status', 'en_attente')->count(),
            'factures_annulees' => Facture::where('status', 'annulee')->count(),
            'revenu_mois' => Intervention::whereMonth('completedAt', now()->month)
                ->whereHas('facture', function($q) {
                    $q->where('status', 'payee');
                })
                ->with('facture')
                ->get()
                ->sum('facture.montant'),
            'revenu_total' => Intervention::whereHas('facture', function($q) {
                $q->where('status', 'payee');
            })
            ->with('facture')
            ->get()
            ->sum('facture.montant'),
            'commission_mois' => Intervention::whereMonth('completedAt', now()->month)
                ->whereHas('facture', function($q) {
                    $q->where('status', 'payee');
                })
                ->with('facture')
                ->get()
                ->sum(fn($i) => $i->facture->montant * 0.10), // 10% de commission
        ];

        return array_merge($basicStats, $demandeStats, $interventionStats, $financialStats);
    }

    /**
     * Données pour les graphiques de tendances
     */
    public function getTrendsData()
    {
        // Demandes par jour (7 derniers jours)
        $demandesParJour = Demande::select(
            DB::raw('DATE(createdAt) as date'),
            DB::raw('COUNT(*) as total')
        )
        ->where('createdAt', '>=', now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        // Demandes par semaine (4 dernières semaines)
        $demandesParSemaine = Demande::select(
            DB::raw('YEARWEEK(createdAt) as semaine'),
            DB::raw('COUNT(*) as total')
        )
        ->where('createdAt', '>=', now()->subWeeks(4))
        ->groupBy('semaine')
        ->orderBy('semaine')
        ->get();

        // Demandes par mois (6 derniers mois)
        $demandesParMois = Demande::select(
            DB::raw('DATE_FORMAT(createdAt, "%Y-%m") as mois'),
            DB::raw('COUNT(*) as total')
        )
        ->where('createdAt', '>=', now()->subMonths(6))
        ->groupBy('mois')
        ->orderBy('mois')
        ->get();

        // Revenus par mois
        $revenusParMois = Intervention::select(
            DB::raw('DATE_FORMAT(completedAt, "%Y-%m") as mois'),
            DB::raw('SUM(interventions.coutTotal) as total')
        )
        ->where('completedAt', '>=', now()->subMonths(6))
        ->whereHas('facture', function($q) {
            $q->where('status', 'payee');
        })
        ->groupBy('mois')
        ->orderBy('mois')
        ->get();

        return [
            'demandesParJour' => $demandesParJour,
            'demandesParSemaine' => $demandesParSemaine,
            'demandesParMois' => $demandesParMois,
            'revenusParMois' => $revenusParMois,
        ];
    }

    /**
     * Top dépanneurs par performance
     */
    public function getTopDepanneurs($limit = 10)
    {
        return Depanneur::withCount('interventions')
            ->withSum('interventions as total_revenu', 'coutTotal')
            ->with(['zones' => function($q) {
                $q->select('zones.id', 'zones.name', 'zones.city');
            }])
            ->orderBy('interventions_count', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($depanneur) {
                return [
                    'id' => $depanneur->id,
                    'etablissement_name' => $depanneur->etablissement_name,
                    'promoteur_name' => $depanneur->promoteur_name,
                    'interventions_count' => $depanneur->interventions_count,
                    'total_revenu' => $depanneur->total_revenu ?? 0,
                    'status' => $depanneur->status,
                    'isActive' => $depanneur->isActive,
                    'zones' => $depanneur->zones->map(fn($z) => [
                        'id' => $z->id,
                        'name' => $z->name,
                        'city' => $z->city,
                    ]),
                ];
            });
    }

    /**
     * Statistiques par zone
     */
    public function getStatsByZone()
    {
        return Zone::withCount('depanneurs')
            ->withCount(['depanneurs as depanneurs_actifs' => function($q) {
                $q->where('isActive', true);
            }])
            ->withCount(['demandes' => function($q) {
                $q->whereIn('status', ['en_attente', 'en_cours', 'acceptee']);
            }])
            ->withCount(['demandes as demandes_terminees' => function($q) {
                $q->where('status', 'terminee');
            }])
            ->orderBy('depanneurs_count', 'desc')
            ->get();
    }

    /**
     * Types de pannes les plus fréquents
     */
    public function getMostCommonIssues()
    {
        return Service::select('typeService as type', DB::raw('COUNT(*) as count'))
            ->groupBy('typeService')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();
    }

    /**
     * Dernières activités
     */
    public function getRecentActivities($limit = 20)
    {
        return Demande::with(['client', 'depanneur'])
            ->orderBy('createdAt', 'desc')
            ->limit($limit)
            ->get()
            ->map(function($demande) {
                return [
                    'id' => $demande->id,
                    'codeDemande' => $demande->codeDemande,
                    'status' => $demande->status,
                    'status_label' => $demande->statut_label,
                    'created_at' => $demande->createdAt->toIsoString(),
                    'client' => $demande->client ? [
                        'id' => $demande->client->id,
                        'fullName' => $demande->client->fullName,
                    ] : null,
                    'depanneur' => $demande->depanneur ? [
                        'id' => $demande->depanneur->id,
                        'etablissement_name' => $demande->depanneur->etablissement_name,
                    ] : null,
                ];
            });
    }

    /**
     * Alertes pour l'admin
     */
    public function getAlerts()
    {
        $alerts = [];

        // Dépanneurs en attente de validation
        $depanneursEnAttente = Depanneur::where('isActive', false)->count();
        if ($depanneursEnAttente > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Dépanneurs en attente',
                'message' => "$depanneursEnAttente dépanneur(s) en attente de validation",
                'action' => 'admin.depanneurs.pending',
                'count' => $depanneursEnAttente,
            ];
        }

        // Demandes en retard (plus de 2h sans réponse)
        $demandesEnRetard = Demande::where('status', 'en_attente')
            ->where('createdAt', '<', now()->subHours(2))
            ->count();
        if ($demandesEnRetard > 0) {
            $alerts[] = [
                'type' => 'danger',
                'title' => 'Demandes en retard',
                'message' => "$demandesEnRetard demande(s) sans réponse depuis plus de 2h",
                'action' => 'admin.demandes.pending',
                'count' => $demandesEnRetard,
            ];
        }

        // Interventions en cours depuis longtemps
        $interventionsLongues = Intervention::where('status', 'en_cours')
            ->where('startedAt', '<', now()->subHours(3))
            ->count();
        if ($interventionsLongues > 0) {
            $alerts[] = [
                'type' => 'warning',
                'title' => 'Interventions prolongées',
                'message' => "$interventionsLongues intervention(s) en cours depuis plus de 3h",
                'action' => 'admin.interventions.in_progress',
                'count' => $interventionsLongues,
            ];
        }

        // Factures en attente de paiement
        $facturesEnAttente = Facture::where('status', 'en_attente')->count();
        if ($facturesEnAttente > 0) {
            $alerts[] = [
                'type' => 'info',
                'title' => 'Factures en attente',
                'message' => "$facturesEnAttente facture(s) en attente de paiement",
                'action' => 'admin.factures.pending',
                'count' => $facturesEnAttente,
            ];
        }

        return $alerts;
    }

    /**
     * Notifications non lues de l'admin
     */
    public function getNotifications()
    {
        return Notification::where('type', 'admin')
            ->orderBy('createdAt', 'desc')
            ->limit(20)
            ->get();
    }

    // ==================== CLIENTS ====================

    public function clients()
    {
        $clients = Client::withCount('demandes')
            ->withSum('demandes as total_depenses', 'coutTotal')
            ->orderBy('createdAt', 'desc')
            ->paginate(20);

        return inertia('admin/Clients', ['clients' => $clients]);
    }

    // ==================== DEPANNEURS ====================

    public function depanneurs()
    {
        $depanneurs = Depanneur::withCount('interventions')
            ->withSum('interventions as total_revenu', 'coutTotal')
            ->with('zones')
            ->orderBy('createdAt', 'desc')
            ->paginate(20);

        return inertia('admin/Depanneurs', ['depanneurs' => $depanneurs]);
    }

    public function depanneursEnAttente()
    {
        $depanneurs = Depanneur::where('isActive', false)
            ->withCount('interventions')
            ->with('zones')
            ->orderBy('createdAt', 'desc')
            ->paginate(20);

        return inertia('admin/DepanneursPending', ['depanneurs' => $depanneurs]);
    }

    // ==================== ZONES ====================

    public function zones()
    {
        $zones = Zone::withCount('depanneurs')
            ->withCount('demandes')
            ->orderBy('name')
            ->paginate(20);

        return inertia('admin/Zones', ['zones' => $zones]);
    }

    // ==================== DEMANDES ====================

    public function demandes()
    {
        $demandes = Demande::with(['client', 'depanneur', 'interventions'])
            ->orderBy('createdAt', 'desc')
            ->paginate(30);

        return inertia('admin/Demandes', ['demandes' => $demandes]);
    }

    // ==================== INTERVENTIONS ====================

    public function interventions()
    {
        $interventions = Intervention::with(['demande.client', 'depanneur', 'facture'])
            ->orderBy('createdAt', 'desc')
            ->paginate(30);

        return inertia('admin/Interventions', ['interventions' => $interventions]);
    }

    // ==================== FACTURES ====================

    public function factures()
    {
        $factures = Facture::with(['intervention.demande.client', 'intervention.depanneur'])
            ->orderBy('createdAt', 'desc')
            ->paginate(30);

        return inertia('admin/Factures', ['factures' => $factures]);
    }

    // ==================== RAPPORTS ====================

    public function rapports()
    {
        $data = [
            'trends' => $this->getTrendsData(),
            'topDepanneurs' => $this->getTopDepanneurs(10),
            'statsByZone' => $this->getStatsByZone(),
            'commonIssues' => $this->getMostCommonIssues(),
            'revenuMoyen' => Intervention::where('status', 'terminee')
                ->avg('coutTotal'),
            'dureeMoyenne' => Intervention::where('status', 'terminee')
                ->whereNotNull('completedAt')
                ->whereNotNull('startedAt')
                ->get()
                ->avg(fn($i) => $i->startedAt->diffInMinutes($i->completedAt)),
        ];

        return inertia('admin/Rapports', $data);
    }

    // ==================== PARAMÈTRES ====================

    public function settings()
    {
        return inertia('admin/Settings', [
            'typesPannes' => Service::select('typeService')->distinct()->pluck('typeService'),
            'zones' => Zone::orderBy('name')->get(),
        ]);
    }

    // ==================== DASHBOARDS SPÉCIFIQUES ====================

    public function clientDashboard()
    {
        $client = Auth::utlisateur()->client;

        // Statistiques du client
        $stats = [
            'total_demandes' => $client->demandes()->count(),
            'demandes_en_cours' => $client->demandes()->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])->count(),
            'demandes_terminees' => $client->demandes()->where('status', 'terminee')->count(),
        ];

        // Dernières demandes
        $dernieresDemandes = $client->demandes()
                                   ->with('depanneur')
                                   ->orderBy('createdAt', 'desc')
                                   ->limit(5)
                                   ->get();

        // Notifications non lues
        $notifications = $client->notifications()
                               ->nonLues()
                               ->orderBy('createdAt', 'desc')
                               ->limit(10)
                               ->get();

        return view('client.dashboard', compact('stats', 'dernieresDemandes', 'notifications'));
    }

   
    public function depanneurDashboard()
    {
        $depanneur = Auth::utilisateur()->depanneur;

        // Statistiques du dépanneur
        $stats = [
            'interventions_total' => $depanneur->interventions()->count(),
            'interventions_en_cours' => $depanneur->interventions()->where('status', 'en_cours')->count(),
            'interventions_terminees' => $depanneur->interventions()->where('status', 'terminee')->count(),
            'revenu_mensuel' => $depanneur->interventions()
                                         ->whereMonth('completedAt', now()->month)
                                         ->whereHas('facture', function($q) {
                                             $q->where('status', 'payee');
                                         })
                                         ->with('facture')
                                         ->get()
                                         ->sum('facture.montant'),
        ];

        // Demandes disponibles dans les zones du dépanneur
        $demandesDisponibles = Demande::enAttente()
                                      ->with('client')
                                      ->orderBy('createdAt', 'desc')
                                      ->limit(10)
                                      ->get();

        // Interventions en cours
        $interventionsEnCours = $depanneur->interventions()
                                         ->where('status', 'en_cours')
                                         ->with('demande.client')
                                         ->get();

        // Notifications non lues
        $notifications = $depanneur->notifications()
                                  ->nonLues()
                                  ->orderBy('createdAt', 'desc')
                                  ->limit(10)
                                  ->get();

        return view('depanneur.dashboard', compact('stats', 'demandesDisponibles', 'interventionsEnCours', 'notifications'));
    }
}

