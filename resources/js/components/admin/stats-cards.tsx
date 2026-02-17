import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wrench, FileText, DollarSign, Activity, TrendingUp } from 'lucide-react';
import type { AdminStats } from '@/types';

interface StatsCardsProps {
    stats: AdminStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const cards = [
        {
            title: 'Clients',
            value: stats.total_clients,
            subtitle: `${stats.total_clients} total`,
            icon: Users,
            gradient: 'from-blue-500 to-blue-600',
            bgGradient: 'from-blue-500/20 to-blue-600/10',
            iconBg: 'bg-blue-500',
        },
        {
            title: 'Dépanneurs',
            value: stats.total_depanneurs,
            subtitle: `${stats.depanneurs_actifs} actifs`,
            icon: Wrench,
            gradient: 'from-amber-500 to-orange-500',
            bgGradient: 'from-amber-500/20 to-orange-500/10',
            iconBg: 'bg-amber-500',
        },
        {
            title: 'Demandes',
            value: stats.total_demandes,
            subtitle: `${stats.demandes_aujourdhui} aujourd'hui`,
            icon: FileText,
            gradient: 'from-purple-500 to-pink-500',
            bgGradient: 'from-purple-500/20 to-pink-500/10',
            iconBg: 'bg-purple-500',
        },
        {
            title: 'En cours',
            value: stats.demandes_en_cours,
            subtitle: `${stats.demandes_en_attente} en attente`,
            icon: Activity,
            gradient: 'from-orange-500 to-red-500',
            bgGradient: 'from-orange-500/20 to-red-500/10',
            iconBg: 'bg-orange-500',
        },
        {
            title: 'Terminées',
            value: stats.demandes_terminees,
            subtitle: `${stats.interventions_terminees} interventions`,
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-teal-500',
            bgGradient: 'from-emerald-500/20 to-teal-500/10',
            iconBg: 'bg-emerald-500',
        },
        {
            title: 'Revenus',
            value: formatCurrency(stats.revenu_mois),
            subtitle: `${formatCurrency(stats.commission_mois)} commission`,
            icon: DollarSign,
            gradient: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-500/20 to-emerald-500/10',
            iconBg: 'bg-green-500',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => (
                <Card 
                    key={card.title} 
                    className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/80 transition-all duration-300 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-xl ${card.bgGradient} ${card.iconBg}`}>
                            <card.icon className="h-4 w-4 text-white" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{card.value}</div>
                        <p className="text-xs text-slate-400">{card.subtitle}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

