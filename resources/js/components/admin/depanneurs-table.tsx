import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, MapPin,
    CheckCircle, XCircle, Clock, Map, ToggleLeft, ToggleRight
} from 'lucide-react';
import type { Depanneur } from '@/types';

interface DepanneursTableProps {
    depanneurs: Depanneur[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    onEdit?: (depanneur: Depanneur) => void;
    onDelete?: (depanneur: Depanneur) => void;
    onValidate?: (depanneur: Depanneur) => void;
    onView?: (depanneur: Depanneur) => void;
    onViewZones?: (depanneur: Depanneur) => void;
    onToggleStatus?: (depanneur: Depanneur) => void;
    isLoading?: boolean;
}

export function DepanneursTable({
    depanneurs,
    pagination,
    onPageChange,
    onSearch,
    onEdit,
    onDelete,
    onValidate,
    onView,
    onViewZones,
    onToggleStatus,
    isLoading = false,
}: DepanneursTableProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadge = (status: string, isActive: boolean) => {
        if (!isActive) {
            return <Badge variant="secondary" className="bg-slate-500/20 text-slate-400">Inactif</Badge>;
        }
        switch (status) {
            case 'disponible':
                return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Disponible</Badge>;
            case 'occupe':
                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Occupe</Badge>;
            case 'hors_service':
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Hors service</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    if (isLoading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                        <span>Depanneurs</span>
                        <Link href="/register/depanneur?admin=true">
                            <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter
                            </Button>
                        </Link>
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
                    <span>Depanneurs</span>
                    <Link href="/register/depanneur?admin=true">
                        <Button variant="outline" size="sm" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
                    </Link>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher un depanneur..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        />
                    </div>
                    <span className="text-sm text-slate-400">
                        {pagination?.total || depanneurs.length} depanneur(s)
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-md border border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                                <TableHead className="text-slate-300">ID</TableHead>
                                <TableHead className="text-slate-300">Etablissement</TableHead>
                                <TableHead className="text-slate-300">Promoteur</TableHead>
                                <TableHead className="text-slate-300">Contact</TableHead>
                                <TableHead className="text-slate-300">Statut</TableHead>
                                <TableHead className="text-slate-300">Interventions</TableHead>
                                <TableHead className="text-slate-300">Revenus</TableHead>
                                <TableHead className="text-slate-300">Inscrit le</TableHead>
                                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {depanneurs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={10} className="text-center py-8 text-slate-400">
                                        Aucun depanneur trouve
                                    </TableCell>
                                </TableRow>
                            ) : (
                                depanneurs.map((depanneur) => (
                                    <TableRow key={depanneur.id} className="hover:bg-slate-700/30">
                                        <TableCell className="text-slate-400">#{depanneur.id}</TableCell>
                                        <TableCell className="text-white font-medium">
                                            {depanneur.etablissement_name}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {depanneur.promoteur_name}
                                            <div className="text-xs text-slate-500">IFU: {depanneur.IFU}</div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-1 text-sm">
                                                <Mail className="h-3 w-3 text-slate-500" />
                                                {depanneur.email}
                                            </div>
                                            <div className="flex items-center gap-1 text-sm mt-1">
                                                <Phone className="h-3 w-3 text-slate-500" />
                                                {depanneur.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(depanneur.status, depanneur.isActive)}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm">
                                                {depanneur.interventions_count || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {formatCurrency(depanneur.total_revenu || 0)}
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {formatDate(depanneur.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onView?.(depanneur)}
                                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit?.(depanneur)}
                                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onValidate?.(depanneur)}
                                                    className="h-8 w-8 text-slate-400 hover:text-green-400"
                                                    title="Valider IFU"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onToggleStatus?.(depanneur)}
                                                    className={`h-8 w-8 ${depanneur.isActive ? 'text-green-400 hover:text-red-400' : 'text-red-400 hover:text-green-400'}`}
                                                    title={depanneur.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                                                >
                                                    {depanneur.isActive ? (
                                                        <ToggleRight className="h-4 w-4" />
                                                    ) : (
                                                        <ToggleLeft className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete?.(depanneur)}
                                                    className="h-8 w-8 text-slate-400 hover:text-red-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
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

