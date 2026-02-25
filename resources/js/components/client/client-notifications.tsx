import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Bell, Check, CheckCheck, Clock, AlertTriangle, Wrench,
    CheckCircle, XCircle, Phone, MapPin, FileText, Settings
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ClientNotification } from '@/types/client';

interface ClientNotificationsProps {
    notifications: ClientNotification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
    onClearAll?: () => void;
}

interface NotificationIconConfig {
    icon: LucideIcon;
    color: string;
}

const NOTIFICATION_ICONS: Record<string, NotificationIconConfig> = {
    nouvelle_demande: { icon: Bell, color: 'text-blue-600 bg-blue-50' },
    demande_recue: { icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    demande_acceptee: { icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    demande_annulee: { icon: XCircle, color: 'text-red-600 bg-red-50' },
    annulee: { icon: XCircle, color: 'text-red-600 bg-red-50' },
    refusee: { icon: XCircle, color: 'text-red-600 bg-red-50' },
    depannage_en_route: { icon: Wrench, color: 'text-blue-600 bg-blue-50' },
    intervention_terminee: { icon: Check, color: 'text-emerald-600 bg-emerald-50' },
    paiement_recu: { icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    compte_active: { icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    compte_desactivate: { icon: XCircle, color: 'text-red-600 bg-red-50' },
};

// Fallback icon for unknown notification types
const DEFAULT_ICON: NotificationIconConfig = { icon: Bell, color: 'text-gray-400 bg-gray-50' };

// Helper function to get icon config with fallback for unknown types
function getNotificationIconConfig(type: string): NotificationIconConfig {
    return NOTIFICATION_ICONS[type] || DEFAULT_ICON;
}

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
        <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-gray-900 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-blue-600" />
                        Notifications
                    </span>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Actions */}
                <div className="flex items-center justify-between mb-4">
                    <Tabs defaultValue={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                        <TabsList className="bg-gray-100">
                            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                                Toutes ({notifications.length})
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
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
                                className="text-gray-500 hover:text-gray-900"
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
                                className="text-gray-500 hover:text-red-600"
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
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Bell className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500">
                                {filter === 'unread'
                                    ? 'Aucune notification non lue'
                                    : 'Aucune notification'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => {
                            const { icon: Icon, color } = getNotificationIconConfig(notification.type);

                            return (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg transition-colors ${
                                        notification.isRead
                                            ? 'bg-gray-50'
                                            : 'bg-blue-50 border border-blue-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${color}`}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={`font-medium ${
                                                    notification.isRead ? 'text-gray-600' : 'text-gray-900'
                                                }`}>
                                                    {notification.titre}
                                                </h4>
                                                <span className="text-xs text-gray-400 flex-shrink-0">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {notification.message}
                                            </p>
                                            {!notification.isRead && onMarkAsRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onMarkAsRead(notification.id)}
                                                    className="mt-2 text-blue-600 hover:text-blue-700 h-auto p-0"
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

