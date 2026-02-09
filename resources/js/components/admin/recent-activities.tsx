import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Wrench } from 'lucide-react';
import type { RecentActivity, Demande } from '@/types';

interface RecentActivitiesProps {
    activities: RecentActivity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
    const getStatusColor = (status: Demande['status']) => {
        switch (status) {
            case 'en_attente':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'acceptee':
                return 'bg-blue-500/20 text-blue-400';
            case 'en_cours':
                return 'bg-orange-500/20 text-orange-400';
            case 'terminee':
                return 'bg-green-500/20 text-green-400';
            case 'annulee':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'A l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour(s)`;
        return date.toLocaleDateString('fr-FR');
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Activites recentes
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                        >
                            <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center">
                                    {activity.client ? (
                                        <User className="h-5 w-5 text-blue-400" />
                                    ) : (
                                        <Wrench className="h-5 w-5 text-amber-400" />
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white truncate">
                                        {activity.client?.fullName || 'Client anonyme'}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status as Demande['status'])}`}>
                                        {activity.status_label}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 truncate">
                                    Demande: {activity.codeDemande}
                                </p>
                                {activity.depanneur && (
                                    <p className="text-xs text-slate-500 mt-1">
                                        Assigne a: {activity.depanneur.etablissement_name}
                                    </p>
                                )}
                            </div>
                            <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-slate-500">
                                    {formatDate(activity.created_at)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

