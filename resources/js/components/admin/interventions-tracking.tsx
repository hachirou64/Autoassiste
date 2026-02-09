import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Search, Filter, MoreHorizontal, Clock, Wrench, FileText, Eye,
    CheckCircle, XCircle, Edit, RefreshCw, DollarSign
} from 'lucide-react';
import type { Intervention } from '@/types';

interface InterventionsTrackingProps {
    interventions: Intervention[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters?: {
        status?: string;
        search?: string;
    };
    onPageChange?: (page: number) => void;
    onFilterChange?: (filters: { status?: string; search?: string }) => void;
    onView?: (intervention: Intervention) => void;
    onEdit?: (intervention: Intervention) => void;
    onGenerateFacture?: (intervention: Intervention) => void;
    isLoading?: boolean;
}

export function InterventionsTracking({
    interventions,
    pagination,
    filters,
    onPageChange,
    onFilterChange,
    onView,
    onEdit,
    onGenerateFacture,
    isLoading = false,
}: InterventionsTrackingProps) {
    const [localFilters, setLocalFilters] = useState(filters || {});

    const handleStatusFilterChange = (value: string) => {
        const newFilters = { ...localFilters, status: value === 'all' ? undefined : value };
        setLocalFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFilters = { ...localFilters, search: e.target.value || undefined };
        setLocalFilters(newFilters);
        onFilterChange?.(newFilters);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDuration = (minutes?: number) => {
        if (!minutes) return '-';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    const getStatusConfig = (status: Intervention['status']) => {
        switch (status) {
            case 'planifiee':
                return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Planifiee' };
            case 'en_cours':
                return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'En cours' };
            case 'terminee':
                return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Terminee' };
            default:
                return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: status };
        }
    };

    if (isLoading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Suivi des interventions</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>Suivi des interventions</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                            {pagination?.total || interventions.length} intervention(s)
                        </span>
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualiser
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher..."
                            value={localFilters.search || ''}
                            onChange={handleSearchChange}
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        />
                    </div>
                    <Select
                        value={localFilters.status || 'all'}
                        onValueChange={handleStatusFilterChange}
                    >
                        <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="planifiee">Planifiee</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="terminee">Terminee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                                <TableHead className="text-slate-300">ID</TableHead>
                                <TableHead className="text-slate-300">Demande</TableHead>
                                <TableHead className="text-slate-300">Depanneur</TableHead>
                                <TableHead className="text-slate-300">Pieces</TableHead>
                                <TableHead className="text-slate-300">Cout total</TableHead>
                                <TableHead className="text-slate-300">Duree</TableHead>
                                <TableHead className="text-slate-300">Statut</TableHead>
                                <TableHead className="text-slate-300">Terminee le</TableHead>
                                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {interventions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                                        Aucune intervention trouvee
                                    </TableCell>
                                </TableRow>
                            ) : (
                                interventions.map((intervention) => {
                                    const statusConfig = getStatusConfig(intervention.status);
                                    return (
                                        <TableRow key={intervention.id} className="hover:bg-slate-700/30">
                                            <TableCell className="text-slate-400">
                                                #{intervention.id}
                                            </TableCell>
                                            <TableCell className="text-white font-mono">
                                                {intervention.demande?.codeDemande || `#${intervention.id_demande}`}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <Wrench className="h-3 w-3 text-amber-400" />
                                                    {intervention.depanneur?.etablissement_name || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-400 max-w-[150px] truncate">
                                                {intervention.piecesremplacees || '-'}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-1">
                                                    <DollarSign className="h-3 w-3 text-green-400" />
                                                    {formatCurrency(intervention.coutTotal)}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {formatCurrency(intervention.coutPiece)} pieces + {formatCurrency(intervention.coutMainOeuvre)} MO
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3 text-slate-500" />
                                                    {intervention.duree_formatee || formatDuration(intervention.duree)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusConfig.color}>
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {intervention.completedAt ? formatDate(intervention.completedAt) : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onView?.(intervention)}
                                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit?.(intervention)}
                                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {intervention.status === 'terminee' && !intervention.facture && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onGenerateFacture?.(intervention)}
                                                            className="h-8 w-8 text-slate-400 hover:text-green-400"
                                                            title="Generer facture"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-slate-400">
                            Page {pagination.current_page} sur {pagination.last_page}
                        </span>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange?.(pagination.current_page - 1)}
                                disabled={pagination.current_page === 1}
                                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                                Precedent
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange?.(pagination.current_page + 1)}
                                disabled={pagination.current_page === pagination.last_page}
                                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                                Suivant
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

