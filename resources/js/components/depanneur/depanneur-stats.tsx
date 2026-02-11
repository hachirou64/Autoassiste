import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Wrench, 
    DollarSign, 
    Star, 
    CheckCircle,
    TrendingUp,
    Clock,
    MapPin,
    Users
} from 'lucide-react';
import type { DepanneurStats } from '@/types/depanneur';

interface DepanneurStatsCardsProps {
    stats: DepanneurStats;
}

export function DepanneurStatsCards({ stats }: DepanneurStatsCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNote = (note: number | undefined) => {
        if (!note && note !== 0) return '0.0';
        return note.toFixed(1);
    };

    // Cartes principales
    const mainCards = [
        {
            title: "Aujourd'hui",
            value: stats.interventions_aujourdhui,
            subtitle: 'Interventions',
            icon: Wrench,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            accent: stats.interventions_aujourdhui > 0,
        },
        {
            title: 'Revenus jour',
            value: formatCurrency(stats.revenus_aujourdhui),
            subtitle: "Aujourd'hui",
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Note moyenne',
            value: formatNote(stats.note_moyenne),
            subtitle: '/ 5.0',
            icon: Star,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            title: 'Demandes acceptées',
            value: stats.demandes_acceptees_aujourdhui,
            subtitle: "Aujourd'hui",
            icon: CheckCircle,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
    ];

    // Cartes du mois
    const monthCards = [
        {
            title: 'Ce mois',
            value: stats.interventions_mois,
            subtitle: 'Interventions',
            icon: TrendingUp,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'Revenus mois',
            value: formatCurrency(stats.revenus_mois),
            subtitle: 'Ce mois',
            icon: DollarSign,
            color: 'text-teal-500',
            bgColor: 'bg-teal-500/10',
        },
        {
            title: 'Acceptées',
            value: stats.demandes_acceptees_mois,
            subtitle: 'Ce mois',
            icon: Users,
            color: 'text-indigo-500',
            bgColor: 'bg-indigo-500/10',
        },
        {
            title: 'Total clients',
            value: stats.total_clients,
            subtitle: 'Uniques',
            icon: Users,
            color: 'text-cyan-500',
            bgColor: 'bg-cyan-500/10',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Stats du jour */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Statistiques du jour
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {mainCards.map((card) => (
                        <Card 
                            key={card.title} 
                            className={`bg-slate-800/50 border-slate-700 hover:bg-slate-800 transition-all ${
                                card.accent ? 'ring-2 ring-blue-500/50' : ''
                            }`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">
                                    {card.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{card.value}</div>
                                <p className="text-xs text-slate-400">{card.subtitle}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Stats du mois */}
            <div>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Statistiques du mois
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {monthCards.map((card) => (
                        <Card key={card.title} className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-300">
                                    {card.title}
                                </CardTitle>
                                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">{card.value}</div>
                                <p className="text-xs text-slate-400">{card.subtitle}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Stats globales */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-blue-500/10">
                                <Wrench className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total interventions</p>
                                <p className="text-2xl font-bold text-white">{stats.total_interventions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-green-500/10">
                                <DollarSign className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Revenus totaux</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(stats.total_revenus)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-amber-500/10">
                                <Star className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Note moyenne globale</p>
                                <p className="text-2xl font-bold text-white">{formatNote(stats.note_moyenne)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

