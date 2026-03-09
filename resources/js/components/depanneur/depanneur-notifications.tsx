import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
    MoreVertical,
    Search,
    Filter,
    Loader2,
    RefreshCw,
    CreditCard,
    CheckCircle,
    XCircle,
    Send
} from 'lucide-react';
import type { DepanneurNotification } from '@/types/depanneur';

// Types de notifications
const NOTIFICATION_TYPES = [
    { value: 'all', label: 'Toutes', icon: Bell },
    { value: 'nouvelle_demande', label: 'Nouvelles demandes', icon: MapPin },
    { value: 'rappel', label: 'Rappels', icon: Clock },
    { value: 'evaluation', label: 'Évaluations', icon: Star },
    { value: 'message', label: 'Messages', icon: MessageSquare },
    { value: 'paiement_recu', label: 'Paiements', icon: CreditCard },
    { value: 'acceptee', label: 'Acceptations', icon: CheckCircle },
    { value: 'refusee', label: 'Refus', icon: XCircle },
    { value: 'system', label: 'Système', icon: AlertCircle },
];

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
        type: 'paiement_recu',
        titre: 'Paiement reçu',
        message: 'Paiement de 15 000 CFA reçu pour l\'intervention #INT-2024-002.',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 6,
        type: 'system',
        titre: 'Mise à jour disponible',
        message: 'Une nouvelle version de l\'application est disponible.',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
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
        case 'paiement_recu':
            return <CreditCard className="h-5 w-5 text-green-400" />;
        case 'acceptee':
            return <CheckCircle className="h-5 w-5 text-blue-400" />;
        case 'refusee':
            return <XCircle className="h-5 w-5 text-red-400" />;
        case 'system':
            return <AlertCircle className="h-5 w-5 text-purple-400" />;
        default:
            return <Bell className="h-5 w-5 text-slate-400" />;
    }
}

function getTypeColor(type: string): string {
    switch (type) {
        case 'nouvelle_demande':
            return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'rappel':
            return 'bg-amber-50 text-amber-600 border-amber-200';
        case 'evaluation':
            return 'bg-purple-50 text-purple-600 border-purple-200';
        case 'message':
            return 'bg-green-50 text-green-600 border-green-200';
        case 'paiement_recu':
            return 'bg-green-50 text-green-600 border-green-200';
        case 'acceptee':
            return 'bg-blue-50 text-blue-600 border-blue-200';
        case 'refusee':
            return 'bg-red-50 text-red-600 border-red-200';
        case 'system':
            return 'bg-gray-50 text-gray-600 border-gray-200';
        default:
            return 'bg-gray-50 text-gray-600 border-gray-200';
    }
}

interface DepanneurNotificationsProps {
    notifications?: DepanneurNotification[];
    onMarkAsRead?: (id: number) => void;
    onMarkAllAsRead?: () => void;
    onClearAll?: () => void;
    onNotificationClick?: (notification: DepanneurNotification) => void;
    fetchFromApi?: boolean;
}

export function DepanneurNotifications({
    notifications = mockNotifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    onNotificationClick,
    fetchFromApi = false,
}: DepanneurNotificationsProps) {
    // Estados locales
    const [localNotifications, setLocalNotifications] = useState<DepanneurNotification[]>(notifications);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 15,
    });

    // Charger les notifications depuis l'API
    const loadNotifications = useCallback(async () => {
        if (!fetchFromApi) {
            setLocalNotifications(notifications);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(pagination.current_page));
            params.append('per_page', String(pagination.per_page));
            
            if (typeFilter && typeFilter !== 'all') {
                params.append('type', typeFilter);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }

            const response = await fetch(`/api/depanneur/notifications?${params.toString()}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            
            const data = await response.json();
            
            if (data.notifications) {
                setLocalNotifications(data.notifications);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
            }
        } catch (error) {
            console.error('Erreur chargement notifications:', error);
            setLocalNotifications(notifications);
        } finally {
            setLoading(false);
        }
    }, [fetchFromApi, notifications, pagination.current_page, pagination.per_page, typeFilter, searchQuery]);

    // Charger au montage et lors des changements de filtres
    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    // Calculer les notifications non lues
    const unreadCount = localNotifications.filter(n => !n.isRead).length;

    // Filtrer les notifications localement (pour l'affichage sans API)
    const filteredNotifications = !fetchFromApi 
        ? localNotifications.filter(n => {
            const matchesType = typeFilter === 'all' || n.type === typeFilter;
            const matchesSearch = !searchQuery || 
                n.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.message.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        })
        : localNotifications;

    // Handlers
    const handleMarkAsRead = async (id: number) => {
        if (fetchFromApi && onMarkAsRead) {
            await onMarkAsRead(id);
        }
        // Mise à jour locale
        setLocalNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
    };

    const handleMarkAllAsRead = async () => {
        if (fetchFromApi && onMarkAllAsRead) {
            await onMarkAllAsRead();
        }
        setLocalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleClearAll = async () => {
        if (fetchFromApi && onClearAll) {
            await onClearAll();
        }
        setLocalNotifications([]);
    };

    const handleTypeFilterChange = (value: string) => {
        setTypeFilter(value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

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
                    
                    <div className="flex items-center gap-2">
                        {/* Bouton rafraîchir */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={loadNotifications}
                            className="text-gray-500 hover:text-gray-900"
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>

                        {localNotifications.length > 0 && (
                            <>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleMarkAllAsRead}
                                        className="text-gray-500 hover:text-gray-900 text-xs"
                                    >
                                        <CheckCheck className="h-3 w-3 mr-1" />
                                        Tout lire
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-gray-500">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white border-gray-200">
                                        <DropdownMenuItem 
                                            onClick={handleClearAll}
                                            className="text-gray-900 hover:bg-gray-100"
                                        >
                                            <X className="h-4 w-4 mr-2" />
                                            Effacer tout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>
                
                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {/* Recherche */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher dans les notifications..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                    
                    {/* Filtre par type */}
                    <Select value={typeFilter} onValueChange={handleTypeFilterChange}>
                        <SelectTrigger className="w-full sm:w-48 bg-white border-gray-300 text-gray-900">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            {NOTIFICATION_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    <div className="flex items-center gap-2">
                                        <type.icon className="h-4 w-4" />
                                        {type.label}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {/* Liste des notifications */}
                <div className="max-h-[500px] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                            <span className="ml-2 text-gray-600">Chargement...</span>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">Aucune notification</p>
                            {searchQuery || typeFilter !== 'all' ? (
                                <p className="text-gray-400 text-sm mt-1">
                                    Essayez de modifier vos filtres
                                </p>
                            ) : null}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                        !notification.isRead ? 'bg-blue-50/50' : ''
                                    }`}
                                    onClick={() => onNotificationClick?.(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-full flex-shrink-0 ${
                                            !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                                        }`}>
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <p className={`text-sm ${
                                                        !notification.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                        {notification.titre}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                
                                                {!notification.isRead && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge 
                                                        variant="outline" 
                                                        className={`text-xs ${getTypeColor(notification.type)}`}
                                                    >
                                                        {NOTIFICATION_TYPES.find(t => t.value === notification.type)?.label || notification.type}
                                                    </Badge>
                                                    <span className="text-xs text-gray-400">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </span>
                                                </div>
                                                
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    className="text-xs text-gray-500 hover:text-gray-900 h-auto p-0"
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
                
                {/* Pagination (si chargé depuis API) */}
                {fetchFromApi && pagination.last_page > 1 && (
                    <div className="border-t border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                                Affichage de {(pagination.current_page - 1) * pagination.per_page + 1} à{' '}
                                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur {pagination.total}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                    disabled={pagination.current_page === 1}
                                    className="border-gray-300"
                                >
                                    Précédent
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="border-gray-300"
                                >
                                    Suivant
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

