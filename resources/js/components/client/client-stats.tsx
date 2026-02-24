import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    FileText, Clock, CheckCircle, DollarSign, AlertCircle
} from 'lucide-react';
import type { ClientStats } from '@/types';

interface ClientStatsCardsProps {
    stats: ClientStats;
}

export function ClientStatsCards({ stats }: ClientStatsCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const cards = [
        {
            title: 'Total demandes',
            value: stats.total_demandes,
            subtitle: 'Depuis votre inscription',
            icon: FileText,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            title: 'En cours',
            value: stats.demandes_en_cours,
            subtitle: stats.demandes_en_cours > 0 ? 'Intervention en cours' : 'Aucune',
            icon: Clock,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
        {
            title: 'Terminées',
            value: stats.demandes_terminees,
            subtitle: 'Interventions complétées',
            icon: CheckCircle,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            title: 'Total dépensé',
            value: formatCurrency(stats.montant_total_depense),
            subtitle: 'Montant total',
            icon: DollarSign,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
    ];

    if (stats.demande_active) {
        cards.splice(1, 0, {
            title: 'Demande active',
            value: stats.demande_active.codeDemande,
            subtitle: stats.demande_active.status,
            icon: AlertCircle,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        });
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-4 w-4 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                        <p className="text-xs text-gray-500">{card.subtitle}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

