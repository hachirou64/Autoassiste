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
    Search, Filter, MoreHorizontal, MapPin, User, Wrench, Clock,
    CheckCircle, XCircle, Eye, Edit, RefreshCw
} from 'lucide-react';
import type { Demande, DemandeFilters } from '@/types';

interface DemandesTrackingProps {
    demandes: Demande[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    filters?: DemandeFilters;
    onPageChange?: (page: number) => void;
    onFilterChange?: (filters: DemandeFilters) => void;
    onView?: (demande: Demande) => void;
    onEdit?: (demande: Demande) => void;
    onReassign?: (demande: Demande) => void;
    onCancel?: (demande: Demande) => void;
    isLoading?: boolean;
}

export function DemandesTracking({
    demandes,
    pagination,
    filters,
    onPageChange,
    onFilterChange,
    onView,
    onEdit,
    onReassign,
    onCancel,
    isLoading = false,
}: DemandesTrackingProps) {
    const [localFilters, setLocalFilters] = useState<DemandeFilters>(filters || {});

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

    const getStatusConfig = (status: Demande['status']) => {
        switch (status) {
            case 'en_attente':
                return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'En attente' };
            case 'acceptee':
                return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Acceptee' };
            case 'en_cours':
                return { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'En cours' };
            case 'terminee':
                return { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Terminee' };
            case 'annulee':
                return { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Annulee' };
            default:
                return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: status };
        }
    };

    if (isLoading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Suivi des demandes</span>
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
                    <span>Suivi des demandes</span>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                            {pagination?.total || demandes.length} demande(s)
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
                            placeholder="Rechercher par code, localisation..."
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
                            <SelectItem value="en_attente">En attente</SelectItem>
                            <SelectItem value="acceptee">Acceptee</SelectItem>
                            <SelectItem value="en_cours">En cours</SelectItem>
                            <SelectItem value="terminee">Terminee</SelectItem>
                            <SelectItem value="annulee">Annulee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                <div className="rounded-md border border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                                <TableHead className="text-slate-300">Code</TableHead>
                                <TableHead className="text-slate-300">Client</TableHead>
                                <TableHead className="text-slate-300">Localisation</TableHead>
                                <TableHead className="text-slate-300">Probleme</TableHead>
                                <TableHead className="text-slate-300">Statut</TableHead>
                                <TableHead className="text-slate-300">Depanneur</TableHead>
                                <TableHead className="text-slate-300">Cree le</TableHead>
                                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {demandes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                                        Aucune demande trouvee
                                    </TableCell>
                                </TableRow>
                            ) : (
                                demandes.map((demande) => {
                                    const statusConfig = getStatusConfig(demande.status);
                                    return (
                                        <TableRow key={demande.id} className="hover:bg-slate-700/30">
                                            <TableCell className="text-white font-mono">
                                                {demande.codeDemande}
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-3 w-3 text-blue-400" />
                                                    {demande.client?.fullName || 'Anonyme'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                <div className="flex items-center gap-2 max-w-[150px] truncate">
                                                    <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                                                    <span className="truncate">{demande.localisation}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-400 max-w-[200px] truncate">
                                                {demande.descriptionProbleme}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={statusConfig.color}>
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-slate-300">
                                                {demande.depanneur ? (
                                                    <div className="flex items-center gap-2">
                                                        <Wrench className="h-3 w-3 text-amber-400" />
                                                        {demande.depanneur.etablissement_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-400 text-sm">
                                                {formatDate(demande.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onView?.(demande)}
                                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit?.(demande)}
                                                        className="h-8 w-8 text-slate-400 hover:text-white"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    {demande.status === 'en_attente' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onReassign?.(demande)}
                                                            className="h-8 w-8 text-slate-400 hover:text-blue-400"
                                                            title="Reassigner"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {['en_attente', 'acceptee'].includes(demande.status) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => onCancel?.(demande)}
                                                            className="h-8 w-8 text-slate-400 hover:text-red-400"
                                                            title="Annuler"
                                                        >
                                                            <XCircle className="h-4 w-4" />
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

