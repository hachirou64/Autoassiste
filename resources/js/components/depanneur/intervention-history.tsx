import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
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
    Download,
    Filter,
    Search,
    Star,
    FileText,
    Phone,
    Clock,
    MoreVertical,
    Eye,
    File,
    DollarSign,
    CheckCircle,
    Loader2
} from 'lucide-react';
import type { InterventionHistoryItem, HistoryFilters } from '@/types/depanneur';
import { DEMANDE_STATUS_COLORS, DEMANDE_STATUS_LABELS } from '@/types/client';

// Fonction utilitaire pour les appels API
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error('Erreur lors de la requête');
    }

    return response.json();
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDuree(minutes: number | null): string {
    if (!minutes) return '-';
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

interface InterventionHistoryProps {
    history?: InterventionHistoryItem[];
    onViewDetails?: (item: InterventionHistoryItem) => void;
    onDownloadFacture?: (factureId: number) => void;
    onExport?: (format: 'excel' | 'pdf') => void;
    fetchFromApi?: boolean;
}

export function InterventionHistory({
    history: initialHistory,
    onViewDetails,
    onDownloadFacture,
    onExport,
    fetchFromApi = false,
}: InterventionHistoryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<InterventionHistoryItem[]>(initialHistory || []);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 20,
    });

    const loadHistory = useCallback(async () => {
        if (!fetchFromApi) {
            setHistory(initialHistory || []);
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', String(pagination.current_page));
            params.append('per_page', String(pagination.per_page));
            
            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter);
            }
            if (searchQuery) {
                params.append('search', searchQuery);
            }
            if (dateFilter === 'today') {
                params.append('date_from', new Date().toISOString().split('T')[0]);
            } else if (dateFilter === 'week') {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                params.append('date_from', weekAgo.toISOString().split('T')[0]);
            } else if (dateFilter === 'month') {
                const monthAgo = new Date();
                monthAgo.setMonth(monthAgo.getMonth() - 1);
                params.append('date_from', monthAgo.toISOString().split('T')[0]);
            }

            const response = await fetchApi<{
                data: InterventionHistoryItem[];
                current_page: number;
                last_page: number;
                total: number;
                per_page: number;
            }>(`/api/depanneur/interventions/history?${params.toString()}`);

            setHistory(response.data);
            setPagination({
                current_page: response.current_page,
                last_page: response.last_page,
                total: response.total,
                per_page: response.per_page,
            });
        } catch (error) {
            console.error('Erreur chargement historique:', error);
            setHistory(initialHistory || []);
        } finally {
            setLoading(false);
        }
    }, [fetchFromApi, initialHistory, pagination.current_page, pagination.per_page, statusFilter, searchQuery, dateFilter]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleDateFilterChange = (value: string) => {
        setDateFilter(value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const displayHistory = fetchFromApi ? history : (initialHistory || []);
    
    const filteredHistory = !fetchFromApi ? displayHistory.filter(item => {
        const matchesSearch = 
            item.codeDemande.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.codeIntervention.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.client.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    }) : displayHistory;

    const stats = {
        total: filteredHistory.length,
        terminees: filteredHistory.filter(i => i.status === 'terminee').length,
        annulees: filteredHistory.filter(i => i.status === 'annulee').length,
        montantTotal: filteredHistory
            .filter(i => i.status === 'terminee')
            .reduce((sum, i) => sum + i.montant, 0),
    };

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'terminee':
                return 'bg-green-500';
            case 'en_cours':
                return 'bg-blue-500';
            case 'acceptee':
                return 'bg-amber-500';
            case 'annulee':
                return 'bg-red-500';
            default:
                return 'bg-slate-500';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'terminee':
                return 'Terminée';
            case 'en_cours':
                return 'En cours';
            case 'acceptee':
                return 'Acceptée';
            case 'annulee':
                return 'Annulée';
            default:
                return status;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header avec stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-white border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-50">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{fetchFromApi ? pagination.total : stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-50">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Terminées</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.terminees}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-50">
                                <Clock className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Annulées</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.annulees}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-white border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-50">
                                <DollarSign className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Revenus</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.montantTotal)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtres et recherche */}
            <Card className="bg-white border-gray-200">
                <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Rechercher par code, client..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-10 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                            />
                        </div>
                        
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-full md:w-48 bg-white border-gray-300 text-gray-900">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="terminee">Terminée</SelectItem>
                                <SelectItem value="en_cours">En cours</SelectItem>
                                <SelectItem value="acceptee">Acceptée</SelectItem>
                                <SelectItem value="annulee">Annulée</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                            <SelectTrigger className="w-full md:w-48 bg-white border-gray-300 text-gray-900">
                                <SelectValue placeholder="Période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les dates</SelectItem>
                                <SelectItem value="today">Aujourd'hui</SelectItem>
                                <SelectItem value="week">Cette semaine</SelectItem>
                                <SelectItem value="month">Ce mois</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onExport?.('excel')}
                                className="border-green-500/30 text-green-600 hover:bg-green-50"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Excel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onExport?.('pdf')}
                                className="border-red-500/30 text-red-600 hover:bg-red-50"
                            >
                                <File className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tableau */}
            <Card className="bg-white border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                        <span className="ml-2 text-gray-600">Chargement...</span>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-gray-200 hover:bg-gray-50">
                                <TableHead className="text-gray-600">Date</TableHead>
                                <TableHead className="text-gray-600">Code</TableHead>
                                <TableHead className="text-gray-600">Client</TableHead>
                                <TableHead className="text-gray-600">Type</TableHead>
                                <TableHead className="text-gray-600">Montant</TableHead>
                                <TableHead className="text-gray-600">Durée</TableHead>
                                <TableHead className="text-gray-600">Statut</TableHead>
                                <TableHead className="text-gray-600">Note</TableHead>
                                <TableHead className="text-gray-600 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredHistory.map((item) => (
                                <TableRow 
                                    key={item.id}
                                    className="border-gray-200 hover:bg-gray-50"
                                >
                                    <TableCell className="text-gray-600">
                                        {formatDate(item.date)}
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-gray-900">{item.codeIntervention}</p>
                                            <p className="text-xs text-gray-500">{item.codeDemande}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-gray-900">{item.client.fullName}</p>
                                            <p className="text-xs text-gray-500">{item.vehicle?.brand} {item.vehicle?.model}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-gray-600 capitalize">
                                        {item.typePanne.replace('_', ' ')}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(item.montant)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-gray-600">
                                        {formatDuree(item.duree)}
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(item.status)}>
                                            {getStatusLabel(item.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {item.evaluation ? (
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                                                <span className="text-gray-900">{item.evaluation.note}/5</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-gray-500">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white border-gray-200">
                                                <DropdownMenuItem 
                                                    onClick={() => onViewDetails?.(item)}
                                                    className="text-gray-900 hover:bg-gray-100"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Voir détails
                                                </DropdownMenuItem>
                                                {item.facture && (
                                                    <DropdownMenuItem 
                                                        onClick={() => onDownloadFacture?.(item.facture!.id)}
                                                        className="text-gray-900 hover:bg-gray-100"
                                                    >
                                                        <File className="h-4 w-4 mr-2" />
                                                        Facture
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="text-gray-900 hover:bg-gray-100">
                                                    <Phone className="h-4 w-4 mr-2" />
                                                    Appeler le client
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
                
                {filteredHistory.length === 0 && !loading && (
                    <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune intervention trouvée</p>
                    </div>
                )}
            </Card>

            {/* Pagination */}
            {fetchFromApi && pagination.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">
                        Affichage de {(pagination.current_page - 1) * pagination.per_page + 1} à{' '}
                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)} sur {pagination.total} interventions
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                            disabled={pagination.current_page === 1}
                        >
                            Précédent
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            Suivant
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

