import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wrench, MapPin, FileText, DollarSign, Activity } from 'lucide-react';
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
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'Dépanneurs',
            value: stats.total_depanneurs,
            subtitle: `${stats.depanneurs_actifs} actifs, ${stats.depanneurs_en_attente} en attente`,
            icon: Wrench,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            title: 'Zones',
            value: stats.total_zones,
            subtitle: `${stats.zones_actives} actives`,
            icon: MapPin,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
        {
            title: 'Demandes',
            value: stats.total_demandes,
            subtitle: `${stats.demandes_aujourdhui} aujourd'hui`,
            icon: FileText,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            title: 'En cours',
            value: stats.demandes_en_cours,
            subtitle: `${stats.demandes_en_attente} en attente`,
            icon: Activity,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'Revenus',
            value: formatCurrency(stats.revenu_mois),
            subtitle: `${formatCurrency(stats.commission_mois)} commission`,
            icon: DollarSign,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cards.map((card) => (
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
    );
}

