import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell, Check, CheckCheck, Clock, AlertTriangle, Wrench,
    CheckCircle, XCircle, Phone, MapPin, FileText, Settings
} from 'lucide-react';
import type { ClientNotification } from '@/types/client';

interface ClientNotificationsProps {
    notifications: ClientNotification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
    onClearAll?: () => void;
}

const NOTIFICATION_ICONS: Record<ClientNotification['type'], { icon: typeof Bell; color: string }> = {
    demande_acceptee: { icon: CheckCircle, color: 'text-green-400 bg-green-500/10' },
    depanneur_en_route: { icon: Wrench, color: 'text-blue-400 bg-blue-500/10' },
    arrivee: { icon: MapPin, color: 'text-amber-400 bg-amber-500/10' },
    terminee: { icon: Check, color: 'text-emerald-400 bg-emerald-500/10' },
    annulee: { icon: XCircle, color: 'text-red-400 bg-red-500/10' },
};

export function ClientNotifications({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
}: ClientNotificationsProps) {
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'unread') return !n.isRead;
        return true;
    });

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-400" />
                        Notifications
                    </span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Actions */}
                <div className="flex items-center justify-between mb-4">
                    <Tabs defaultValue={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                        <TabsList className="bg-slate-700">
                            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500">
                                Toutes ({notifications.length})
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="data-[state=active]:bg-blue-500">
                                Non lues ({unreadCount})
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <div className="flex gap-2">
                        {unreadCount > 0 && onMarkAllAsRead && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMarkAllAsRead}
                                className="text-slate-400 hover:text-white"
                            >
                                <CheckCheck className="h-4 w-4 mr-1" />
                                Tout marquer lu
                            </Button>
                        )}
                        {notifications.length > 0 && onClearAll && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClearAll}
                                className="text-slate-400 hover:text-red-400"
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Liste des notifications */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-slate-400">
                                {filter === 'unread'
                                    ? 'Aucune notification non lue'
                                    : 'Aucune notification'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const { icon: Icon, color } = NOTIFICATION_ICONS[notification.type];

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg transition-colors ${
                                        notification.isRead
                                            ? 'bg-slate-700/30'
                                            : 'bg-blue-500/5 border border-blue-500/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`font-medium ${
                                                    notification.isRead ? 'text-slate-300' : 'text-white'
                                                }`}>
                                                    {notification.titre}
                                                </h4>
                                                <span className="text-xs text-slate-500 flex-shrink-0">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {notification.message}
                                            </p>
                                            {!notification.isRead && onMarkAsRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onMarkAsRead(notification.id)}
                                                    className="mt-2 text-blue-400 hover:text-blue-300 h-auto p-0"
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Marquer comme lu
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

