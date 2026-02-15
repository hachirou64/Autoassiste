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
     * API: Dernières activités (retourne JSON)
     */
    public function getRecentActivitiesApi()
    {
        $limit = request()->input('limit', 20);
        
        $activities = Demande::with(['client', 'depanneur'])
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

        return response()->json(['activities' => $activities]);
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

    /**
     * API: Récupérer la liste des clients (JSON)
     */
    public function clientsApi()
    {
        $perPage = request()->input('per_page', 15);
        $page = request()->input('page', 1);
        $search = request()->input('search', '');

        try {
            $query = Client::withCount('demandes');

            // Filtre par recherche
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('fullName', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            // Trier par date de création (plus récent en premier)
            $clients = $query->orderBy('createdAt', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            // Transformer les données pour le frontend
            $transformedData = collect($clients->items())->map(function($client) {
                return [
                    'id' => $client->id,
                    'fullName' => $client->fullName,
                    'email' => $client->email,
                    'phone' => $client->phone,
                    'createdAt' => $client->createdAt->format('Y-m-d H:i:s'),
                    'demandes_count' => $client->demandes_count ?? 0,
                    'total_depenses' => 0, // À implémenter quand la colonne existera
                ];
            })->values()->all(); // Convertir en array

            \Log::info('ClientsApi Response', [
                'total' => $clients->total(),
                'count' => count($transformedData),
                'data' => $transformedData,
            ]);

            return response()->json([
                'data' => $transformedData,
                'current_page' => $clients->currentPage(),
                'last_page' => $clients->lastPage(),
                'total' => $clients->total(),
                'per_page' => $clients->perPage(),
            ]);
        } catch (\Exception $e) {
            \Log::error('ClientsApi Error', ['error' => $e->getMessage()]);
            return response()->json([
                'error' => $e->getMessage(),
                'data' => [],
                'current_page' => 1,
                'last_page' => 1,
                'total' => 0,
                'per_page' => $perPage,
            ], 500);
        }
    }

    /**
     * Récupérer les données du dashboard client (API)
     */
    public function getClientDashboardData()
    {
        $utilisateur = Auth::user();
        
        // Vérifier si l'utilisateur est connecté
        if (!$utilisateur) {
            return response()->json([
                'success' => false,
                'error' => 'Non authentifié',
            ], 401);
        }

        // Récupérer le client via la relation
        $client = $utilisateur->client ?? null;

        // Si pas de client lié, retourner une erreur
        if (!$client) {
            return response()->json([
                'success' => false,
                'error' => 'Aucun compte client lié à cet utilisateur.',
            ], 403);
        }

        // Statistiques du client
        $stats = [
            'total_demandes' => $client->demandes()->count(),
            'demandes_en_cours' => $client->demandes()->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])->count(),
            'demandes_terminees' => $client->demandes()->where('status', 'terminee')->count(),
            'montant_total_depense' => $client->demandes()
                ->whereHas('interventions', function($q) {
                    $q->whereHas('facture', function($q2) {
                        $q2->where('status', 'payee');
                    });
                })
                ->with('interventions.facture')
                ->get()
                ->sum(function($d) {
                    $intervention = $d->interventions->first();
                    return $intervention?->facture?->montant ?? 0;
                }),
        ];

        // Demande active
        $demandeActive = $client->demandes()
            ->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])
            ->with(['depanneur'])
            ->orderBy('createdAt', 'desc')
            ->first();

        $demandeActiveData = null;
        if ($demandeActive) {
            $intervention = $demandeActive->interventions()
                ->whereIn('status', ['acceptee', 'en_cours'])
                ->with('depanneur')
                ->first();

            $demandeActiveData = [
                'id' => $demandeActive->id,
                'codeDemande' => $demandeActive->codeDemande,
                'status' => $demandeActive->status,
                'typePanne' => $demandeActive->typePanne,
                'localisation' => $demandeActive->localisation,
                'latitude' => $demandeActive->latitude,
                'longitude' => $demandeActive->longitude,
                'estimated_arrival' => $intervention ? '~' . rand(5, 30) . ' min' : null,
                'distance' => null,
                'depanneur' => $demandeActive->depanneur ? [
                    'id' => $demandeActive->depanneur->id,
                    'fullName' => $demandeActive->depanneur->promoteur_name,
                    'etablissement_name' => $demandeActive->depanneur->etablissement_name,
                    'phone' => $demandeActive->depanneur->phone,
                    'rating' => 4.5,
                ] : null,
            ];
        }

        // Dernières demandes
        $dernieresDemandes = $client->demandes()
            ->with(['depanneur'])
            ->orderBy('createdAt', 'desc')
            ->limit(10)
            ->get()
            ->map(function($d) {
                $intervention = $d->interventions()->first();
                return [
                    'id' => $d->id,
                    'codeDemande' => $d->codeDemande,
                    'date' => $d->createdAt->toIsoString(),
                    'typePanne' => $d->typePanne,
                    'status' => $d->status,
                    'localisation' => $d->localisation,
                    'depanneur' => $d->depanneur ? [
                        'fullName' => $d->depanneur->promoteur_name,
                        'etablissement_name' => $d->depanneur->etablissement_name,
                        'phone' => $d->depanneur->phone,
                        'rating' => 4.5,
                    ] : null,
                    'montant' => $intervention?->facture?->montant,
                    'duree' => $intervention ? $intervention->startedAt->diffInMinutes($intervention->completedAt) : null,
                ];
            });

        // Historique des interventions
        $history = $client->demandes()
            ->where('status', 'terminee')
            ->with(['depanneur', 'interventions.facture'])
            ->orderBy('createdAt', 'desc')
            ->limit(20)
            ->get()
            ->map(function($d) {
                $intervention = $d->interventions->first();
                return [
                    'id' => $d->id,
                    'codeDemande' => $d->codeDemande,
                    'date' => $d->createdAt->toIsoString(),
                    'typePanne' => $d->typePanne,
                    'status' => $d->status,
                    'depanneur' => $d->depanneur ? [
                        'fullName' => $d->depanneur->promoteur_name,
                        'etablissement_name' => $d->depanneur->etablissement_name,
                        'phone' => $d->depanneur->phone,
                        'rating' => 4.5,
                    ] : null,
                    'montant' => $intervention?->facture?->montant,
                    'duree' => $intervention ? $intervention->startedAt->diffInMinutes($intervention->completedAt) : null,
                    'evaluation' => $intervention?->note ? [
                        'note' => $intervention->note,
                        'commentaire' => $intervention->commentaire_evaluation,
                    ] : null,
                    'facture' => $intervention?->facture ? [
                        'id' => $intervention->facture->id,
                        'url' => '#',
                    ] : null,
                ];
            });

        // Notifications non lues
        $notifications = $client->notifications()
            ->where('isRead', false)
            ->orderBy('createdAt', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'titre' => $n->titre,
                'message' => $n->message,
                'isRead' => (bool) $n->isRead,
                'createdAt' => $n->createdAt->toIsoString(),
            ]);

        // Profil du client
        $profile = [
            'id' => $client->id,
            'fullName' => $utilisateur->fullName,
            'email' => $utilisateur->email,
            'phone' => $client->phone,
            'photo' => $client->photo,
            'createdAt' => $client->createdAt->format('Y-m-d'),
            'preferences' => [
                'methode_payement_preferee' => $client->methode_payement_preferee ?? 'mobile_money',
                'notifications_sms' => $client->notifications_sms ?? true,
                'notifications_email' => $client->notifications_email ?? true,
            ],
        ];

        // Stats du profil
        $profileStats = [
            'total_demandes' => $stats['total_demandes'],
            'demandes_terminees' => $stats['demandes_terminees'],
            'montant_total_depense' => $stats['montant_total_depense'],
            'membre_depuis' => $client->createdAt->format('F Y'),
        ];

        return response()->json([
            'success' => true,
            'stats' => $stats,
            'demande_active' => $demandeActiveData,
            'dernieres_demandes' => $dernieresDemandes,
            'history' => $history,
            'notifications' => $notifications,
            'profile' => $profile,
            'profileStats' => $profileStats,
        ]);
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

    /**
     * API: Récupérer la liste des dépanneurs (JSON)
     */
    public function depanneursApi()
    {
        $perPage = request()->input('per_page', 15);
        $page = request()->input('page', 1);
        $search = request()->input('search', '');
        $status = request()->input('status', '');

        $query = Depanneur::withCount('interventions')
            ->withSum('interventions as total_revenu', 'coutTotal')
            ->with('zones');

        // Filtre par statut
        if ($status) {
            $query->where('status', $status);
        }

        // Filtre par recherche
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('etablissement_name', 'like', "%{$search}%")
                  ->orWhere('promoteur_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('IFU', 'like', "%{$search}%");
            });
        }

        $depanneurs = $query->orderBy('createdAt', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        // Transformer les données pour le frontend
        $transformedData = collect($depanneurs->items())->map(function($depanneur) {
            return [
                'id' => $depanneur->id,
                'etablissement_name' => $depanneur->etablissement_name,
                'promoteur_name' => $depanneur->promoteur_name,
                'IFU' => $depanneur->IFU,
                'email' => $depanneur->email,
                'phone' => $depanneur->phone,
                'status' => $depanneur->status,
                'isActive' => $depanneur->isActive,
                'type_vehicule' => $depanneur->type_vehicule,
                'localisation_actuelle' => $depanneur->localisation_actuelle,
                'createdAt' => $depanneur->createdAt,
                'interventions_count' => $depanneur->interventions_count,
                'total_revenu' => $depanneur->total_revenu ?? 0,
                'zones' => $depanneur->zones->map(fn($z) => [
                    'id' => $z->id,
                    'name' => $z->name,
                    'city' => $z->city,
                ]),
                'zones_count' => $depanneur->zones->count(),
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'current_page' => $depanneurs->currentPage(),
            'last_page' => $depanneurs->lastPage(),
            'total' => $depanneurs->total(),
            'per_page' => $depanneurs->perPage(),
        ]);
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
        $utilisateur = Auth::user();
        
        // Vérifier si l'utilisateur est connecté
        if (!$utilisateur) {
            return inertia('client-dashboard', [
                'error' => 'Vous devez être connecté pour accéder à cette page.',
                'stats' => null,
                'profile' => null,
                'demandes' => [],
                'notifications' => [],
            ]);
        }
        
        // Récupérer le client via la relation
        $client = $utilisateur->client ?? null;

        // Si pas de client lié, retourner une erreur
        if (!$client) {
            return inertia('client-dashboard', [
                'error' => 'Aucun compte client lié à cet utilisateur.',
                'stats' => null,
                'profile' => null,
                'demandes' => [],
                'notifications' => [],
            ]);
        }

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
                               ->where('isRead', false)
                               ->orderBy('createdAt', 'desc')
                               ->limit(10)
                               ->get();

        // Profil du client
        $profile = [
            'id' => $client->id,
            'fullName' => $utilisateur->fullName,
            'email' => $utilisateur->email,
            'phone' => $client->phone,
            'photo' => $client->photo,
            'createdAt' => $client->createdAt->format('Y-m-d'),
        ];

        return inertia('client-dashboard', [
            'stats' => $stats,
            'dernieresDemandes' => $dernieresDemandes,
            'notifications' => $notifications,
            'profile' => $profile,
            'error' => null,
        ]);
    }

   
    public function depanneurDashboard()
    {
        $utilisateur = Auth::user();
        
        // Vérifier si l'utilisateur est connecté
        if (!$utilisateur) {
            return inertia('depanneur-dashboard', [
                'error' => 'Vous devez être connecté pour accéder à cette page.',
                'stats' => null,
                'profile' => null,
                'demandes' => [],
                'interventionEnCours' => null,
                'notifications' => [],
                'currentStatus' => 'hors_service',
            ]);
        }
        
        // Récupérer le dépanneur via la relation
        // Le modèle Utilisateur a une relation 'depanneur'
        $depanneur = $utilisateur->depanneur ?? null;

        // Si pas de dépanneur lié, retourner une erreur
        if (!$depanneur) {
            return inertia('depanneur-dashboard', [
                'error' => 'Aucun compte dépanneur lié à cet utilisateur.',
                'stats' => null,
                'profile' => null,
                'demandes' => [],
                'interventionEnCours' => null,
                'notifications' => [],
            ]);
        }

        // Statistiques du dépanneur
        $stats = [
            'interventions_aujourdhui' => $depanneur->interventions()->whereDate('createdAt', today())->count(),
            'revenus_aujourdhui' => $this->getRevenusJour($depanneur),
            'interventions_mois' => $depanneur->interventions()->whereMonth('createdAt', now()->month)->count(),
            'revenus_mois' => $this->getRevenusMois($depanneur),
            'total_interventions' => $depanneur->interventions()->count(),
            'total_revenus' => $this->getRevenusTotal($depanneur),
            'total_clients' => $depanneur->interventions()->with('demande')->get()->pluck('demande.id_client')->unique()->count(),
            'status' => $depanneur->status,
            'zones_count' => $depanneur->zones()->count(),
        ];

        // Profil du dépanneur
        $profile = [
            'id' => $depanneur->id,
            'fullName' => $depanneur->promoteur_name,
            'etablissement_name' => $depanneur->etablissement_name,
            'email' => $depanneur->email,
            'phone' => $depanneur->phone,
            'status' => $depanneur->status,
            'isActive' => $depanneur->isActive,
            'type_vehicule' => $depanneur->type_vehicule,
            'zones' => $depanneur->zones->map(fn($z) => [
                'id' => $z->id,
                'name' => $z->name,
                'city' => $z->city,
            ]),
            'localisation_actuelle' => $depanneur->localisation_actuelle,
            'horaires' => [
                ['jour' => 'lundi', 'debut' => '08:00', 'fin' => '18:00', 'estActif' => true],
                ['jour' => 'mardi', 'debut' => '08:00', 'fin' => '18:00', 'estActif' => true],
                ['jour' => 'mercredi', 'debut' => '08:00', 'fin' => '18:00', 'estActif' => true],
                ['jour' => 'jeudi', 'debut' => '08:00', 'fin' => '18:00', 'estActif' => true],
                ['jour' => 'vendredi', 'debut' => '08:00', 'fin' => '18:00', 'estActif' => true],
                ['jour' => 'samedi', 'debut' => '08:00', 'fin' => '14:00', 'estActif' => true],
                ['jour' => 'dimanche', 'debut' => '08:00', 'fin' => '18:00', 'estActif' => false],
            ],
            'preferences' => [
                'notifications_sonores' => true,
                'notifications_sms' => true,
                'notifications_email' => false,
                'auto_accept' => false,
                'rayon_prefere' => 10,
            ],
            'statistiques' => [
                'total_interventions' => $depanneur->interventions()->count(),
                'note_moyenne' => 4.5, // Default until rating system is implemented
                'depuis' => $depanneur->createdAt->format('F Y'),
            ],
        ];

        // Demandes disponibles dans les zones du dépanneur
        // Get all pending demands (no zone filtering in demandes table)
        $demandes = Demande::enAttente()
            ->with(['client'])
            ->orderBy('createdAt', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($d) => $this->formatDemandeForApi($d, $depanneur));

        // Intervention en cours
        $interventionEnCours = $depanneur->interventions()
            ->whereIn('status', ['acceptee', 'en_cours'])
            ->with(['demande.client'])
            ->first();

        $interventionData = null;
        if ($interventionEnCours) {
            $interventionData = [
                'id' => $interventionEnCours->id,
                'codeIntervention' => $interventionEnCours->codeIntervention ?? 'INT-'.$interventionEnCours->id,
                'status' => $interventionEnCours->status,
                'demande' => [
                    'id' => $interventionEnCours->demande->id,
                    'codeDemande' => $interventionEnCours->demande->codeDemande,
                    'typePanne' => $interventionEnCours->demande->typePanne,
                    'localisation' => $interventionEnCours->demande->localisation,
                    'latitude' => $interventionEnCours->demande->latitude,
                    'longitude' => $interventionEnCours->demande->longitude,
                    'descriptionProbleme' => $interventionEnCours->demande->descriptionProbleme,
                ],
                'client' => [
                    'id' => $interventionEnCours->demande->client->id,
                    'fullName' => $interventionEnCours->demande->client->fullName,
                    'phone' => $interventionEnCours->demande->client->phone,
                ],
                'vehicle' => $interventionEnCours->demande->vehicle ? [
                    'brand' => $interventionEnCours->demande->vehicle->marque,
                    'model' => $interventionEnCours->demande->vehicle->modele,
                    'color' => $interventionEnCours->demande->vehicle->couleur,
                    'plate' => $interventionEnCours->demande->vehicle->immatriculation,
                ] : null,
                'startedAt' => $interventionEnCours->startedAt?->toIsoString(),
            ];
        }

        // Notifications non lues
        $notifications = $depanneur->notifications()
            ->where('isRead', false)
            ->orderBy('createdAt', 'desc')
            ->limit(10)
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'titre' => $n->titre,
                'message' => $n->message,
                'isRead' => (bool) $n->isRead,
                'createdAt' => $n->createdAt->toIsoString(),
                'demande_id' => $n->demande_id,
            ]);

        return inertia('depanneur-dashboard', [
            'stats' => $stats,
            'profile' => $profile,
            'demandes' => $demandes,
            'interventionEnCours' => $interventionData,
            'notifications' => $notifications,
            'currentStatus' => $depanneur->status,
        ]);
    }

    /**
     * Récupérer les revenus du jour
     */
    private function getRevenusJour(Depanneur $depanneur): float
    {
        return $depanneur->interventions()
            ->whereDate('completedAt', today())
            ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
            ->with('facture')
            ->get()
            ->sum('facture.montant');
    }

    /**
     * Récupérer les revenus du mois
     */
    private function getRevenusMois(Depanneur $depanneur): float
    {
        return $depanneur->interventions()
            ->whereMonth('completedAt', now()->month)
            ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
            ->with('facture')
            ->get()
            ->sum('facture.montant');
    }

    /**
     * Récupérer les revenus totaux
     */
    private function getRevenusTotal(Depanneur $depanneur): float
    {
        return $depanneur->interventions()
            ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
            ->with('facture')
            ->get()
            ->sum('facture.montant');
    }

    /**
     * Formater une demande pour l'API
     */
    private function formatDemandeForApi(Demande $demande, Depanneur $depanneur): array
    {
        // Calculer la distance si on a la position du dépanneur
        $distance = null;
        if ($depanneur->localisation_actuelle && $demande->latitude && $demande->longitude) {
            $coords = explode(',', $depanneur->localisation_actuelle);
            $distance = $this->calculateDistance(
                (float) $coords[0],
                (float) $coords[1],
                $demande->latitude,
                $demande->longitude
            );
        }

        return [
            'id' => $demande->id,
            'codeDemande' => $demande->codeDemande,
            'typePanne' => $demande->typePanne,
            'descriptionProbleme' => $demande->descriptionProbleme,
            'localisation' => $demande->localisation,
            'latitude' => $demande->latitude,
            'longitude' => $demande->longitude,
            'distance' => $distance,
            'createdAt' => $demande->createdAt->toIsoString(),
            'tempsRestant' => now()->diffInSeconds($demande->createdAt->addMinutes(30)),
            'client' => [
                'id' => $demande->client->id,
                'fullName' => $demande->client->fullName,
                'phone' => $demande->client->phone,
            ],
            'vehicle' => [
                'type' => $demande->vehicle_type,
            ],
        ];
    }

    /**
     * Calculer la distance entre deux points GPS (en km)
     */
    private function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // Rayon de la Terre en km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c, 1);
    }

    // ==================== API DEPANNEUR ====================

    /**
     * Mettre à jour le statut de disponibilité du dépanneur
     */
    public function updateDepanneurStatus()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $request = request();
        $status = $request->input('status');

        // Valider le statut
        $validStatuses = [Depanneur::STATUS_DISPONIBLE, Depanneur::STATUS_OCCUPE, Depanneur::STATUS_HORS_SERVICE];
        if (!in_array($status, $validStatuses)) {
            return response()->json(['error' => 'Statut invalide'], 400);
        }

        // Vérifier s'il y a une intervention en cours
        if ($status === Depanneur::STATUS_DISPONIBLE && $depanneur->interventions()->whereIn('status', ['acceptee', 'en_cours'])->exists()) {
            return response()->json(['error' => 'Vous avez une intervention en cours'], 400);
        }

        $depanneur->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'status' => $status,
        ]);
    }

    /**
     * Récupérer les demandes disponibles pour le dépanneur
     */
    public function getDepanneurDemandes()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $zoneIds = $depanneur->zones()->pluck('zones.id')->toArray();
        $rayon = request()->input('rayon', 50); // km

        $demandes = Demande::enAttente()
            ->whereIn('id_zone', $zoneIds)
            ->with(['client'])
            ->orderBy('createdAt', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($d) => $this->formatDemandeForApi($d, $depanneur));

        return response()->json(['demandes' => $demandes]);
    }

    /**
     * Accepter une demande
     */
    public function acceptDemande($id)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        // Vérifier si le dépanneur est disponible
        if ($depanneur->status !== Depanneur::STATUS_DISPONIBLE) {
            return response()->json(['error' => 'Vous devez être disponible pour accepter une demande'], 400);
        }

        $demande = Demande::findOrFail($id);

        if ($demande->status !== 'en_attente') {
            return response()->json(['error' => 'Cette demande n\'est plus disponible'], 400);
        }

        // Vérifier que la demande est dans une zone du dépanneur
        $zoneIds = $depanneur->zones()->pluck('zones.id')->toArray();
        if (!in_array($demande->id_zone, $zoneIds)) {
            return response()->json(['error' => 'Cette demande n\'est pas dans votre zone d\'intervention'], 400);
        }

        // Créer l'intervention
        $intervention = Intervention::create([
            'id_demande' => $demande->id,
            'id_depanneur' => $depanneur->id,
            'status' => 'acceptee',
            'startedAt' => now(),
            'coutTotal' => 0,
        ]);

        // Mettre à jour la demande
        $demande->update([
            'status' => 'acceptee',
            'id_depanneur' => $depanneur->id,
        ]);

        // Mettre à jour le statut du dépanneur
        $depanneur->update(['status' => Depanneur::STATUS_OCCUPE]);

        // Créer une notification pour le client
        Notification::create([
            'id_client' => $demande->id_client,
            'id_depanneur' => $depanneur->id,
            'id_demande' => $demande->id,
            'type' => 'acceptee',
            'titre' => 'Demande acceptée',
            'message' => 'Le dépanneur ' . $depanneur->etablissement_name . ' a accepté votre demande et arrive bientôt.',
            'isRead' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Demande acceptée avec succès',
            'intervention' => [
                'id' => $intervention->id,
                'codeIntervention' => $intervention->codeIntervention,
                'demande' => [
                    'id' => $demande->id,
                    'codeDemande' => $demande->codeDemande,
                ],
            ],
        ]);
    }

    /**
     * Refuser une demande
     */
    public function refuseDemande($id)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $demande = Demande::findOrFail($id);

        if ($demande->status !== 'en_attente') {
            return response()->json(['error' => 'Cette demande n\'est plus disponible'], 400);
        }

        // Optionnel: Enregistrer le refus pour analytics
        // Log::info('Demande refusée', ['depanneur_id' => $depanneur->id, 'demande_id' => $id]);

        return response()->json([
            'success' => true,
            'message' => 'Demande refusée',
        ]);
    }

    /**
     * Démarrer une intervention
     */
    public function startIntervention($id)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $intervention = Intervention::where('id', $id)
            ->where('id_depanneur', $depanneur->id)
            ->where('status', 'acceptee')
            ->firstOrFail();

        $intervention->update([
            'status' => 'en_cours',
            'startedAt' => now(),
        ]);

        $intervention->demande->update(['status' => 'en_cours']);

        return response()->json([
            'success' => true,
            'message' => 'Intervention démarrée',
            'intervention' => [
                'id' => $intervention->id,
                'startedAt' => $intervention->startedAt->toIsoString(),
            ],
        ]);
    }

    /**
     * Terminer une intervention
     */
    public function endIntervention($id)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $request = request();
        
        $intervention = Intervention::where('id', $id)
            ->where('id_depanneur', $depanneur->id)
            ->where('status', 'en_cours')
            ->firstOrFail();

        $coutPiece = $request->input('coutPiece', 0);
        $coutMainOeuvre = $request->input('coutMainOeuvre', 0);
        $coutTotal = $coutPiece + $coutMainOeuvre;
        $notes = $request->input('notes', '');

        $intervention->update([
            'status' => 'terminee',
            'completedAt' => now(),
            'coutPiece' => $coutPiece,
            'coutMainOeuvre' => $coutMainOeuvre,
            'coutTotal' => $coutTotal,
            'notes' => $notes,
        ]);

        // Créer la facture
        Facture::create([
            'id_intervention' => $intervention->id,
            'montant' => $coutTotal,
            'coutPiece' => $coutPiece,
            'coutMainOeuvre' => $coutMainOeuvre,
            'status' => 'en_attente',
        ]);

        // Mettre à jour la demande
        $intervention->demande->update(['status' => 'terminee']);

        // Remettre le dépanneur en disponible
        $depanneur->update(['status' => Depanneur::STATUS_DISPONIBLE]);

        // Notifier le client
        Notification::create([
            'id_client' => $intervention->demande->id_client,
            'id_depanneur' => $depanneur->id,
            'id_demande' => $intervention->demande->id,
            'type' => 'terminee',
            'titre' => 'Intervention terminée',
            'message' => 'Votre intervention est terminée. Vous pouvez maintenant procéder au paiement.',
            'isRead' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Intervention terminée avec succès',
            'intervention' => [
                'id' => $intervention->id,
                'completedAt' => $intervention->completedAt->toIsoString(),
                'coutTotal' => $coutTotal,
            ],
        ]);
    }

    /**
     * Mettre à jour la position du dépanneur
     */
    public function updateLocation()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $request = request();
        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        if (!$latitude || !$longitude) {
            return response()->json(['error' => 'Coordonnées invalides'], 400);
        }

        $depanneur->update([
            'localisation_actuelle' => "{$latitude},{$longitude}",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Position mise à jour',
        ]);
    }

    /**
     * Récupérer les notifications du dépanneur
     */
    public function getDepanneurNotifications()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $notifications = $depanneur->notifications()
            ->orderBy('createdAt', 'desc')
            ->limit(20)
            ->get()
            ->map(fn($n) => [
                'id' => $n->id,
                'type' => $n->type,
                'titre' => $n->titre,
                'message' => $n->message,
                'isRead' => (bool) $n->isRead,
                'createdAt' => $n->createdAt->toIsoString(),
                'demande_id' => $n->demande_id,
            ]);

        return response()->json(['notifications' => $notifications]);
    }

    /**
     * Marquer une notification comme lue
     */
    public function markNotificationRead($id)
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $notification = $depanneur->notifications()->where('id', $id)->firstOrFail();
        $notification->update(['isRead' => true]);

        return response()->json(['success' => true]);
    }

    /**
     * Récupérer les statistiques du dépanneur
     */
    public function getDepanneurStats()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        // Get all interventions for calculations
        $allInterventions = $depanneur->interventions()->with('demande')->get();
        $interventionsTodayCount = $depanneur->interventions()->whereDate('createdAt', today())->count();
        $interventionsMonthCount = $depanneur->interventions()->whereMonth('createdAt', now()->month)->count();

        $stats = [
            // Stats du jour
            'interventions_aujourdhui' => $interventionsTodayCount,
            'revenus_aujourdhui' => $this->getRevenusJour($depanneur),
            'demandes_acceptees_aujourdhui' => $depanneur->interventions()->whereDate('createdAt', today())->where('status', 'acceptee')->count(),
            'note_moyenne_aujourdhui' => 4.5, // Default until rating system is implemented
            
            // Stats du mois
            'interventions_mois' => $interventionsMonthCount,
            'revenus_mois' => $this->getRevenusMois($depanneur),
            'demandes_acceptees_mois' => $depanneur->interventions()->whereMonth('createdAt', now()->month)->where('status', 'acceptee')->count(),
            'note_moyenne_mois' => 4.5, // Default until rating system is implemented
            
            // Stats globales
            'total_interventions' => $allInterventions->count(),
            'total_revenus' => $this->getRevenusTotal($depanneur),
            'note_moyenne' => 4.5, // Default until rating system is implemented
            'total_clients' => $allInterventions->pluck('demande.id_client')->unique()->count(),
            
            // Statut
            'status' => $depanneur->status,
            'zones_count' => $depanneur->zones()->count(),
        ];

        return response()->json(['stats' => $stats]);
    }

    /**
     * Récupérer l'historique des interventions du dépanneur
     */
    public function getInterventionHistory()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $perPage = request()->input('per_page', 20);
        $page = request()->input('page', 1);
        $status = request()->input('status', '');
        $search = request()->input('search', '');
        $dateFrom = request()->input('date_from', '');
        $dateTo = request()->input('date_to', '');

        $query = $depanneur->interventions()
            ->with(['demande.client', 'facture'])
            ->orderBy('createdAt', 'desc');

        // Filtre par statut
        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        // Filtre par recherche
        if ($search) {
            $query->whereHas('demande', function($q) use ($search) {
                $q->where('codeDemande', 'like', "%{$search}%")
                  ->orWhere('localisation', 'like', "%{$search}%");
            });
        }

        // Filtre par date
        if ($dateFrom) {
            $query->whereDate('createdAt', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('createdAt', '<=', $dateTo);
        }

        $interventions = $query->paginate($perPage, ['*'], 'page', $page);

        // Transformer les données
        $transformedData = collect($interventions->items())->map(function($intervention) {
            $duree = null;
            if ($intervention->startedAt && $intervention->completedAt) {
                $duree = $intervention->startedAt->diffInMinutes($intervention->completedAt);
            } elseif ($intervention->startedAt) {
                $duree = $intervention->startedAt->diffInMinutes(now());
            }

            return [
                'id' => $intervention->id,
                'codeIntervention' => $intervention->codeIntervention ?? 'INT-'.$intervention->id,
                'codeDemande' => $intervention->demande->codeDemande ?? 'DEM-'.$intervention->demande->id,
                'date' => $intervention->createdAt->toIsoString(),
                'typePanne' => $intervention->demande->typePanne ?? 'autre',
                'status' => $intervention->status,
                'client' => $intervention->demande->client ? [
                    'fullName' => $intervention->demande->client->fullName,
                    'phone' => $intervention->demande->client->phone,
                ] : ['fullName' => 'Client', 'phone' => ''],
                'vehicle' => $intervention->demande->vehicle ? [
                    'brand' => $intervention->demande->vehicle->marque,
                    'model' => $intervention->demande->vehicle->modele,
                    'plate' => $intervention->demande->vehicle->immatriculation,
                ] : null,
                'montant' => $intervention->facture?->montant ?? $intervention->coutTotal ?? 0,
                'duree' => $duree,
                'coutPiece' => $intervention->coutPiece ?? 0,
                'coutMainOeuvre' => $intervention->coutMainOeuvre ?? 0,
                'evaluation' => $intervention->note ? [
                    'note' => $intervention->note,
                    'commentaire' => $intervention->commentaire_evaluation,
                ] : null,
                'facture' => $intervention->facture ? [
                    'id' => $intervention->facture->id,
                    'montant' => $intervention->facture->montant,
                    'status' => $intervention->facture->status,
                    'url' => '#',
                ] : null,
                'createdAt' => $intervention->createdAt->toIsoString(),
                'completedAt' => $intervention->completedAt?->toIsoString(),
            ];
        });

        return response()->json([
            'data' => $transformedData,
            'current_page' => $interventions->currentPage(),
            'last_page' => $interventions->lastPage(),
            'total' => $interventions->total(),
            'per_page' => $interventions->perPage(),
        ]);
    }

    /**
     * Récupérer les données financières du dépanneur
     */
    public function getFinancialData()
    {
        $utilisateur = Auth::user();
        
        if (!$utilisateur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        $depanneur = $utilisateur->depanneur ?? null;
        
        if (!$depanneur) {
            return response()->json(['error' => 'Aucun compte dépanneur lié'], 403);
        }

        // Statistiques financières
        $stats = [
            'revenus_jour' => $this->getRevenusJour($depanneur),
            'revenus_semaine' => $this->getRevenusSemaine($depanneur),
            'revenus_mois' => $this->getRevenusMois($depanneur),
            'revenus_total' => $this->getRevenusTotal($depanneur),
            
            'factures_en_attente' => $depanneur->interventions()
                ->whereHas('facture', fn($q) => $q->where('status', 'en_attente'))
                ->count(),
            'factures_payees' => $depanneur->interventions()
                ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
                ->count(),
            'factures_annulees' => $depanneur->interventions()
                ->whereHas('facture', fn($q) => $q->where('status', 'annulee'))
                ->count(),
            
            'total_factures' => $depanneur->interventions()
                ->whereHas('facture')
                ->count(),
            
            'interventions_terminees' => $depanneur->interventions()
                ->where('status', 'terminee')
                ->count(),
            'interventions_en_cours' => $depanneur->interventions()
                ->whereIn('status', ['acceptee', 'en_cours'])
                ->count(),
            
            // Meilleur jour/mois
            'meilleur_jour' => $this->getMeilleurJour($depanneur),
            'meilleur_montant' => $this->getMeilleurMontant($depanneur),
        ];

        // Liste des factures
        $facturesQuery = Facture::whereHas('intervention', fn($q) => $q->where('id_depanneur', $depanneur->id))
            ->with(['intervention.demande.client'])
            ->orderBy('createdAt', 'desc');

        $factures = $facturesQuery->limit(50)->get()->map(function($facture) {
            return [
                'id' => $facture->id,
                'numeroFacture' => $facture->numeroFacture ?? 'FAC-'.$facture->id,
                'montant' => $facture->montant,
                'coutPiece' => $facture->coutPiece,
                'coutMainOeuvre' => $facture->coutMainOeuvre,
                'mdePaiement' => $facture->mdePaiement ?? 'mobile_money',
                'status' => $facture->status,
                'transactionId' => $facture->transactionId,
                'intervention' => [
                    'id' => $facture->intervention->id,
                    'codeIntervention' => $facture->intervention->codeIntervention ?? 'INT-'.$facture->intervention->id,
                    'codeDemande' => $facture->intervention->demande->codeDemande ?? 'DEM-'.$facture->intervention->demande->id,
                    'typePanne' => $facture->intervention->demande->typePanne ?? 'autre',
                ],
                'client' => $facture->intervention->demande->client ? [
                    'fullName' => $facture->intervention->demande->client->fullName,
                    'phone' => $facture->intervention->demande->client->phone,
                ] : ['fullName' => 'Client', 'phone' => ''],
                'createdAt' => $facture->createdAt->toIsoString(),
                'paidAt' => $facture->paidAt?->toIsoString(),
            ];
        });

        // Revenus par jour (7 derniers jours)
        $revenusParJour = $this->getRevenusParJour($depanneur, 7);

        // Revenus par mois (6 derniers mois)
        $revenusParMois = $this->getRevenusParMois($depanneur, 6);

        return response()->json([
            'stats' => $stats,
            'factures' => $factures,
            'revenusParJour' => $revenusParJour,
            'revenusParMois' => $revenusParMois,
        ]);
    }

    /**
     * Récupérer les revenus de la semaine
     */
    private function getRevenusSemaine(Depanneur $depanneur): float
    {
        return $depanneur->interventions()
            ->whereBetween('completedAt', [now()->startOfWeek(), now()->endOfWeek()])
            ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
            ->with('facture')
            ->get()
            ->sum('facture.montant');
    }

    /**
     * Récupérer le meilleur jour de revenus
     */
    private function getMeilleurJour(Depanneur $depanneur): string
    {
        $intervention = $depanneur->interventions()
            ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
            ->with('facture')
            ->get()
            ->groupBy(fn($i) => $i->completedAt->format('Y-m-d'))
            ->map(fn($items) => $items->sum(fn($i) => $i->facture->montant))
            ->sortDesc()
            ->first();

        return $intervention ? now()->format('Y-m-d') : '';
    }

    /**
     * Récupérer le meilleur montant
     */
    private function getMeilleurMontant(Depanneur $depanneur): float
    {
        return $depanneur->interventions()
            ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
            ->with('facture')
            ->get()
            ->max(fn($i) => $i->facture->montant) ?? 0;
    }

    /**
     * Récupérer les revenus par jour
     */
    private function getRevenusParJour(Depanneur $depanneur, int $days): array
    {
        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $revenu = $depanneur->interventions()
                ->whereDate('completedAt', $date)
                ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
                ->with('facture')
                ->get()
                ->sum('facture.montant');

            $result[] = [
                'date' => $date->format('Y-m-d'),
                'jour' => $date->format('D'),
                'revenus' => $revenu,
                'interventions' => $depanneur->interventions()
                    ->whereDate('completedAt', $date)
                    ->where('status', 'terminee')
                    ->count(),
            ];
        }
        return $result;
    }

    /**
     * Récupérer les revenus par mois
     */
    private function getRevenusParMois(Depanneur $depanneur, int $months): array
    {
        $result = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $revenu = $depanneur->interventions()
                ->whereMonth('completedAt', $date->month)
                ->whereYear('completedAt', $date->year)
                ->whereHas('facture', fn($q) => $q->where('status', 'payee'))
                ->with('facture')
                ->get()
                ->sum('facture.montant');

            $result[] = [
                'mois' => $date->format('Y-m'),
                'label' => $date->format('M Y'),
                'revenus' => $revenu,
                'interventions' => $depanneur->interventions()
                    ->whereMonth('completedAt', $date->month)
                    ->whereYear('completedAt', $date->year)
                    ->where('status', 'terminee')
                    ->count(),
            ];
        }
        return $result;
    }
}

