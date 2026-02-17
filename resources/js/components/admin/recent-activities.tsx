import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Wrench, ArrowRight } from 'lucide-react';
import type { RecentActivity, Demande } from '@/types';

interface RecentActivitiesProps {
    activities: RecentActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
    const getStatusColor = (status: Demande['status']) => {
        switch (status) {
            case 'en_attente':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'acceptee':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'en_cours':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'terminee':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'annulee':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: Demande['status']) => {
        switch (status) {
            case 'terminee':
                return 'text-green-400';
            case 'en_cours':
                return 'text-orange-400';
            case 'acceptee':
                return 'text-blue-400';
            default:
                return 'text-slate-400';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                        <Clock className="h-4 w-4 text-white" />
                    </div>
                    Activités récentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-all duration-300 hover:scale-[1.01] cursor-pointer group"
                        >
                            <div className="flex-shrink-0">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                    activity.client 
                                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                                        : 'bg-gradient-to-br from-amber-500 to-orange-500'
                                }`}>
                                    {activity.client ? (
                                        <User className="h-5 w-5 text-white" />
                                    ) : (
                                        <Wrench className="h-5 w-5 text-white" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white truncate">
                                        {activity.client?.fullName || 'Client anonyme'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(activity.status as Demande['status'])}`}>
                                        {activity.status_label}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                    <span className="font-mono text-blue-400">{activity.codeDemande}</span>
                                    {activity.depanneur && (
                                        <span className="text-slate-500">• Assigné à: <span className="text-amber-400">{activity.depanneur.etablissement_name}</span></span>
                                    )}
                                </p>
                            </div>
                            <div className="flex-shrink-0 text-right flex flex-col items-end gap-1">
                                <p className="text-xs text-slate-500">
                                    {formatDate(activity.created_at)}
                                </p>
                                <ArrowRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity ${getStatusIcon(activity.status as Demande['status'])}`} />
                            </div>
                        </div>
                    ))}
                    {activities.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                            <Clock className="h-12 w-12 mb-2 text-slate-600" />
                            <p>Aucune activité récente</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

