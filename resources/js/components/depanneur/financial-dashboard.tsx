import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    FileText,
    Download,
    Calendar,
    Wallet,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Loader2
} from 'lucide-react';
import type { FinancialStats, Facture, RevenusParPeriode } from '@/types/depanneur';

// Fonction utilitaire pour les appels API
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la requête');
    }

    return response.json();
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'payee':
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case 'en_attente':
            return <Clock className="h-4 w-4 text-amber-600" />;
        case 'annulee':
        case 'remboursee':
            return <AlertCircle className="h-4 w-4 text-red-600" />;
        default:
            return <FileText className="h-4 w-4 text-gray-400" />;
    }
}

function getMdeIcon(mde: string) {
    switch (mde) {
        case 'cash':
            return <Wallet className="h-4 w-4 text-green-600" />;
        case 'mobile_money':
            return <CreditCard className="h-4 w-4 text-blue-600" />;
        case 'carte_bancaire':
            return <CreditCard className="h-4 w-4 text-purple-600" />;
        case 'virement':
            return <ArrowUpRight className="h-4 w-4 text-cyan-600" />;
        default:
            return <DollarSign className="h-4 w-4 text-gray-400" />;
    }
}

interface FinancialDashboardProps {
    stats?: FinancialStats;
    factures?: Facture[];
    onDownloadFacture?: (factureId: number) => void;
    onExport?: (format: 'excel' | 'pdf') => void;
    // Nouvelles props pour les données dynamiques
    fetchFromApi?: boolean;
}

interface FinancialApiData {
    stats: FinancialStats;
    factures: Facture[];
    revenusParJour: { date: string; jour: string; revenus: number; interventions: number }[];
    revenusParMois: { mois: string; label: string; revenus: number; interventions: number }[];
}

export function FinancialDashboard({
    stats: initialStats,
    factures: initialFactures,
    onDownloadFacture,
    onExport,
    fetchFromApi = false,
}: FinancialDashboardProps) {
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<FinancialStats | undefined>(initialStats);
    const [factures, setFactures] = useState<Facture[]>(initialFactures || []);
    const [revenusParJour, setRevenusParJour] = useState<{ date: string; jour: string; revenus: number; interventions: number }[]>([]);
    const [revenusParMois, setRevenusParMois] = useState<{ mois: string; label: string; revenus: number; interventions: number }[]>([]);

    // Charger les données depuis l'API
    const loadFinancialData = useCallback(async () => {
        if (!fetchFromApi) {
            setStats(initialStats);
            setFactures(initialFactures || []);
            return;
        }

        setLoading(true);
        try {
            const data = await fetchApi<FinancialApiData>('/api/depanneur/financial');
            
            setStats(data.stats);
            setFactures(data.factures);
            setRevenusParJour(data.revenusParJour);
            setRevenusParMois(data.revenusParMois);
        } catch (error) {
            console.error('Erreur chargement données financières:', error);
            // En cas d'erreur, utiliser les données initiales
            setStats(initialStats);
            setFactures(initialFactures || []);
        } finally {
            setLoading(false);
        }
    }, [fetchFromApi, initialStats, initialFactures]);

    useEffect(() => {
        loadFinancialData();
    }, [loadFinancialData]);

    // Données à afficher
    const displayStats = stats;
    const displayFactures = fetchFromApi ? factures : (initialFactures || []);
    const displayRevenusParJour = fetchFromApi ? revenusParJour : [];
    const displayRevenusParMois = fetchFromApi ? revenusParMois : [];

    // Calculer les stats pour les onglets
    const facturesPayees = displayFactures.filter(f => f.status === 'payee');
    const facturesEnAttente = displayFactures.filter(f => f.status === 'en_attente');
    const totalPaye = facturesPayees.reduce((sum, f) => sum + f.montant, 0);
    const totalEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.montant, 0);

    // Préparer les données du graphique (7 derniers jours par défaut ou depuis l'API)
    const chartData = displayRevenusParJour.length > 0 
        ? displayRevenusParJour.map((d) => ({ day: d.jour, amount: d.revenus }))
        : [
            { day: 'Lun', amount: 0 },
            { day: 'Mar', amount: 0 },
            { day: 'Mer', amount: 0 },
            { day: 'Jeu', amount: 0 },
            { day: 'Ven', amount: 0 },
            { day: 'Sam', amount: 0 },
            { day: 'Dim', amount: 0 },
        ];

    const maxAmount = Math.max(...chartData.map((d) => d.amount), 1);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                <span className="ml-2 text-gray-600">Chargement des données financières...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Revenus aujourd'hui
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {displayStats ? formatCurrency(displayStats.revenus_jour) : formatCurrency(0)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            +12% vs hier
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Revenus ce mois
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {displayStats ? formatCurrency(displayStats.revenus_mois) : formatCurrency(0)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            +8% vs mois dernier
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Total revenus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {displayStats ? formatCurrency(displayStats.revenus_total) : formatCurrency(0)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Depuis votre inscription
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            En attente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">
                            {formatCurrency(totalEnAttente)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {displayStats?.factures_en_attente || 0} facture(s)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques et tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="bg-gray-100 border border-gray-200 p-1">
                    <TabsTrigger 
                        value="overview" 
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-white hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-md transition-colors"
                    >
                        Aperçu
                    </TabsTrigger>
                    <TabsTrigger 
                        value="factures" 
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-white hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-md transition-colors"
                    >
                        Factures
                    </TabsTrigger>
                    <TabsTrigger 
                        value="revenus" 
                        className="data-[state=active]:bg-amber-500 data-[state=active]:text-white hover:bg-amber-100 hover:text-amber-700 px-4 py-2 rounded-md transition-colors"
                    >
                        Revenus
                    </TabsTrigger>
                </TabsList>

                {/* Aperçu */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Chart des revenus - Thème clair */}
                        <Card className="bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900 flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    Revenus - 7 derniers jours
                                </CardTitle>
                                <CardDescription className="text-gray-500">
                                    Évolution de vos revenus
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {chartData.map((item, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                            <div 
                                                className="w-full bg-green-100 rounded-t-lg relative group cursor-pointer hover:bg-green-200 transition-colors"
                                                style={{ 
                                                    height: `${(item.amount / maxAmount) * 200}px`,
                                                    minHeight: '20px'
                                                }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatCurrency(item.amount)}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats interventions - Thème clair */}
                        <Card className="bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Interventions & Factures
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <span className="text-gray-700">Payées</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{formatCurrency(totalPaye)}</p>
                                        <p className="text-xs text-gray-500">{displayStats?.factures_payees || 0} factures</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-amber-600" />
                                        <span className="text-gray-700">En attente</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-amber-600">{formatCurrency(totalEnAttente)}</p>
                                        <p className="text-xs text-gray-500">{displayStats?.factures_en_attente || 0} factures</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                        <span className="text-gray-700">Annulées</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">{formatCurrency(0)}</p>
                                        <p className="text-xs text-gray-500">{displayStats?.factures_annulees || 0} factures</p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-900 font-medium">Total factures</span>
                                        <span className="text-xl font-bold text-gray-900">{displayStats?.total_factures || 0}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Factures */}
                <TabsContent value="factures" className="space-y-4">
                    <Card className="bg-white border-gray-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-gray-900">
                                    Liste des factures
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-500 text-green-600 hover:bg-green-50"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500 text-red-600 hover:bg-red-50"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {displayFactures.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    Aucune facture trouvée
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {displayFactures.map((facture) => (
                                        <div 
                                            key={facture.id}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${
                                                    facture.status === 'payee' ? 'bg-green-100' :
                                                    facture.status === 'en_attente' ? 'bg-amber-100' : 'bg-red-100'
                                                }`}>
                                                    {getStatusIcon(facture.status)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{facture.numeroFacture}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {facture.client.fullName} - {facture.intervention.typePanne}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    {getMdeIcon(facture.mdePaiement)}
                                                    <span className="text-sm text-gray-600 capitalize">
                                                        {facture.mdePaiement.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{formatCurrency(facture.montant)}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatDate(facture.createdAt)}
                                                    </p>
                                                </div>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDownloadFacture?.(facture.id)}
                                                    className="text-gray-500 hover:text-gray-900"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Revenus détaillés */}
                <TabsContent value="revenus" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-600">Aujourd'hui</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">
                                    {displayStats ? formatCurrency(displayStats.revenus_jour) : formatCurrency(0)}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                    <ArrowUpRight className="h-4 w-4" />
                                    +12%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-600">Cette semaine</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">
                                    {displayStats ? formatCurrency(displayStats.revenus_semaine) : formatCurrency(0)}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                    <ArrowUpRight className="h-4 w-4" />
                                    +5%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-gray-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-gray-600">Ce mois</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-600">
                                    {displayStats ? formatCurrency(displayStats.revenus_mois) : formatCurrency(0)}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                                    <ArrowUpRight className="h-4 w-4" />
                                    +8%
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-gray-900">
                                Répartition par type de service
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { type: 'Panne de batterie', count: 15, amount: 525000, percent: 35 },
                                    { type: 'Panne sèche', count: 12, amount: 360000, percent: 28 },
                                    { type: 'Créaison', count: 8, amount: 180000, percent: 18 },
                                    { type: 'Problème moteur', count: 4, amount: 320000, percent: 12 },
                                    { type: 'Autre', count: 3, amount: 90000, percent: 7 },
                                ].map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">{item.type}</span>
                                            <span className="text-gray-500">{formatCurrency(item.amount)} ({item.percent}%)</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-amber-500 rounded-full"
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

