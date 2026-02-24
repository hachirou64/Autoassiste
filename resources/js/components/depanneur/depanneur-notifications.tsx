import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Bell,
    BellRing,
    Check,
    CheckCheck,
    X,
    AlertCircle,
    Clock,
    Wrench,
    MessageSquare,
    Star,
    MapPin,
    MoreVertical
} from 'lucide-react';
import type { DepanneurNotification } from '@/types/depanneur';

// Données mockées
const mockNotifications: DepanneurNotification[] = [
    {
        id: 1,
        type: 'nouvelle_demande',
        titre: 'Nouvelle demande à proximité',
        message: 'Une nouvelle demande de dépannage est disponible à 2.5 km de votre position.',
        isRead: false,
        createdAt: new Date().toISOString(),
        demande: { id: 1, codeDemande: 'DEM-2024-001' },
    },
    {
        id: 2,
        type: 'rappel',
        titre: 'Rappel d\'intervention',
        message: 'N\'oubliez pas de finaliser l\'intervention #INT-2024-001.',
        isRead: false,
        createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    {
        id: 3,
        type: 'evaluation',
        titre: 'Nouvelle évaluation',
        message: 'Vous avez reçu une note de 5 étoiles de Jean Dupont.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: 4,
        type: 'message',
        titre: 'Message du client',
        message: 'Jean Dupont vous a envoyé un message concernant l\'intervention.',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
        id: 5,
        type: 'system',
        titre: 'Mise à jour disponible',
        message: 'Une nouvelle version de l\'application est disponible.',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

function formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
}

function getNotificationIcon(type: string) {
    switch (type) {
        case 'nouvelle_demande':
            return <MapPin className="h-5 w-5 text-blue-400" />;
        case 'rappel':
            return <Clock className="h-5 w-5 text-amber-400" />;
        case 'evaluation':
            return <Star className="h-5 w-5 text-amber-400" />;
        case 'message':
            return <MessageSquare className="h-5 w-5 text-green-400" />;
        case 'system':
            return <AlertCircle className="h-5 w-5 text-purple-400" />;
        default:
            return <Bell className="h-5 w-5 text-slate-400" />;
    }
}

interface DepanneurNotificationsProps {
    notifications?: DepanneurNotification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
    onClearAll?: () => void;
    onNotificationClick?: (notification: DepanneurNotification) => void;
}

export function DepanneurNotifications({
    notifications = mockNotifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    onNotificationClick,
}: DepanneurNotificationsProps) {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <Card className="bg-white border-gray-200">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                        {unreadCount > 0 ? (
                            <BellRing className="h-5 w-5 text-amber-500" />
                        ) : (
                            <Bell className="h-5 w-5 text-blue-500" />
                        )}
                        Notifications
                        {unreadCount > 0 && (
                            <Badge className="bg-amber-50 text-amber-600 border-amber-200">
                                {unreadCount}
                            </Badge>
                        )}
                    </CardTitle>
                    
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onMarkAllAsRead}
                                    className="text-slate-400 hover:text-white text-xs"
                                >
                                    <CheckCheck className="h-3 w-3 mr-1" />
                                    Tout marquer lu
                                </Button>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-slate-400">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                    <DropdownMenuItem 
                                        onClick={onClearAll}
                                        className="text-white hover:bg-slate-700"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Effacer tout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-8 w-8 text-slate-500" />
                            </div>
                            <p className="text-slate-400">Aucune notification</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                                        !notification.isRead ? 'bg-blue-500/5' : ''
                                    }`}
                                    onClick={() => onNotificationClick?.(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-full flex-shrink-0 ${
                                            !notification.isRead ? 'bg-blue-500/10' : 'bg-slate-700/50'
                                        }`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <p className={`text-sm ${
                                                        !notification.isRead ? 'font-medium text-white' : 'text-slate-300'
                                                    }`}>
                                                        {notification.titre}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onMarkAsRead?.(notification.id);
                                                    }}
                                                    className="text-xs text-slate-400 hover:text-white h-auto p-0"
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Marquer lu
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

