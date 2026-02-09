import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ChartDataPoint, TrendsData } from '@/types';

interface AnalyticsChartsProps {
    trends: TrendsData;
    title?: string;
}

export function AnalyticsCharts({ trends, title = 'Analytiques' }: AnalyticsChartsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('fr-FR').format(num);
    };

    // Calculer les totaux et tendances
    const totalDemandes = trends.demandesParMois.reduce((sum, d) => sum + d.total, 0);
    const totalRevenus = trends.revenusParMois.reduce((sum, d) => sum + d.total, 0);
    const avgDemandes = Math.round(totalDemandes / Math.max(trends.demandesParMois.length, 1));
    const avgRevenus = totalRevenus / Math.max(trends.revenusParMois.length, 1);

    // Dernier mois vs mois precedent
    const lastMonthDemandes = trends.demandesParMois.length > 0 ? trends.demandesParMois[trends.demandesParMois.length - 1]?.total || 0 : 0;
    const prevMonthDemandes = trends.demandesParMois.length > 1 ? trends.demandesParMois[trends.demandesParMois.length - 2]?.total || 0 : 0;
    const demandeTrend = prevMonthDemandes > 0 ? ((lastMonthDemandes - prevMonthDemandes) / prevMonthDemandes) * 100 : 0;

    const lastMonthRevenus = trends.revenusParMois.length > 0 ? trends.revenusParMois[trends.revenusParMois.length - 1]?.total || 0 : 0;
    const prevMonthRevenus = trends.revenusParMois.length > 1 ? trends.revenusParMois[trends.revenusParMois.length - 2]?.total || 0 : 0;
    const revenuTrend = prevMonthRevenus > 0 ? ((lastMonthRevenus - prevMonthRevenus) / prevMonthRevenus) * 100 : 0;

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-400" />;
        if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return 'text-green-400';
        if (trend < 0) return 'text-red-400';
        return 'text-slate-400';
    };

    // Hauteur maximale pour les barres (pour normalisation)
    const maxDemandes = Math.max(...trends.demandesParMois.map(d => d.total), 1);
    const maxRevenus = Math.max(...trends.revenusParMois.map(d => d.total), 1);

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {/* Chart: Demandes par mois */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Demandes par mois</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{formatNumber(lastMonthDemandes)}</span>
                            <div className={`flex items-center gap-1 text-sm ${getTrendColor(demandeTrend)}`}>
                                {getTrendIcon(demandeTrend)}
                                {demandeTrend > 0 ? '+' : ''}{demandeTrend.toFixed(1)}%
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Bar Chart */}
                    <div className="space-y-3">
                        {trends.demandesParMois.slice(-6).map((data, index) => {
                            const height = (data.total / maxDemandes) * 100;
                            const isLast = index === trends.demandesParMois.slice(-6).length - 1;
                            return (
                                <div key={data.mois || index} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 w-16">
                                        {data.mois || ''}
                                    </span>
                                    <div className="flex-1">
                                        <div className="h-8 bg-slate-700 rounded-md relative overflow-hidden">
                                            <div
                                                className={`absolute left-0 top-0 h-full rounded-md transition-all duration-300 ${
                                                    isLast ? 'bg-blue-500' : 'bg-blue-500/50'
                                                }`}
                                                style={{ width: `${height}%` }}
                                            />
                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-medium">
                                                {data.total}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total (6 derniers mois)</span>
                            <span className="text-white font-medium">{formatNumber(totalDemandes)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-slate-400">Moyenne mensuelle</span>
                            <span className="text-white font-medium">{formatNumber(avgDemandes)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chart: Revenus par mois */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Revenus par mois</span>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-white">{formatCurrency(lastMonthRevenus)}</span>
                            <div className={`flex items-center gap-1 text-sm ${getTrendColor(revenuTrend)}`}>
                                {getTrendIcon(revenuTrend)}
                                {revenuTrend > 0 ? '+' : ''}{revenuTrend.toFixed(1)}%
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Bar Chart */}
                    <div className="space-y-3">
                        {trends.revenusParMois.slice(-6).map((data, index) => {
                            const height = (data.total / maxRevenus) * 100;
                            const isLast = index === trends.revenusParMois.slice(-6).length - 1;
                            return (
                                <div key={data.mois || index} className="flex items-center gap-3">
                                    <span className="text-xs text-slate-400 w-16">
                                        {data.mois || ''}
                                    </span>
                                    <div className="flex-1">
                                        <div className="h-8 bg-slate-700 rounded-md relative overflow-hidden">
                                            <div
                                                className={`absolute left-0 top-0 h-full rounded-md transition-all duration-300 ${
                                                    isLast ? 'bg-green-500' : 'bg-green-500/50'
                                                }`}
                                                style={{ width: `${height}%` }}
                                            />
                                            <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-white font-medium">
                                                {formatCurrency(data.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Total (6 derniers mois)</span>
                            <span className="text-white font-medium">{formatCurrency(totalRevenus)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-slate-400">Moyenne mensuelle</span>
                            <span className="text-white font-medium">{formatCurrency(avgRevenus)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Simple donut chart component for status distribution
interface StatusDistributionProps {
    data: {
        label: string;
        value: number;
        color: string;
    }[];
    title: string;
}

export function StatusDistribution({ data, title }: StatusDistributionProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-6">
                    {/* Donut Chart */}
                    <div className="relative w-32 h-32">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                            {data.reduce((acc, item, index) => {
                                const percentage = (item.value / total) * 100;
                                const strokeWidth = 20;
                                const radius = 40;
                                const circumference = 2 * Math.PI * radius;
                                const offset = circumference * (1 - acc / 100);

                                // Skip empty segments
                                if (percentage === 0) return acc;

                                return acc + percentage;
                            }, 0)}
                            {data.map((item, index) => {
                                const percentage = (item.value / total) * 100;
                                if (percentage === 0) return null;

                                const strokeWidth = 20;
                                const radius = 40;
                                const circumference = 2 * Math.PI * radius;
                                const previousPercentages = data
                                    .slice(0, index)
                                    .reduce((sum, d) => sum + (d.value / total) * 100, 0);
                                const offset = circumference * (1 - previousPercentages / 100 - percentage / 100);

                                return (
                                    <circle
                                        key={index}
                                        cx="50"
                                        cy="50"
                                        r={radius}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={`${circumference * (percentage / 100)} ${circumference}`}
                                        strokeDashoffset={offset}
                                        className="transition-all duration-500"
                                    />
                                );
                            })}
                        </svg>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 space-y-2">
                        {data.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-slate-300">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-white font-medium">{item.value}</span>
                                    <span className="text-xs text-slate-400">
                                        ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

