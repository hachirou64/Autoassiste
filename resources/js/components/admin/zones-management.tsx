import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Search, Plus, Edit, Trash2, MoreHorizontal, MapPin, Users, Wrench,
    CheckCircle, XCircle
} from 'lucide-react';
import type { Zone, ZoneFormData } from '@/types';

interface ZonesManagementProps {
    zones: Zone[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    onEdit?: (zone: Zone) => void;
    onDelete?: (zone: Zone) => void;
    onToggleActive?: (zone: Zone) => void;
    onViewDepanneurs?: (zone: Zone) => void;
    onAdd?: () => void;
    isLoading?: boolean;
}

export function ZonesManagement({
    zones,
    pagination,
    onPageChange,
    onSearch,
    onEdit,
    onDelete,
    onToggleActive,
    onViewDepanneurs,
    onAdd,
    isLoading = false,
}: ZonesManagementProps) {
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

    if (isLoading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Zones geographiques</span>
                        <Button variant="outline" size="sm" disabled>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
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
                    <span>Zones geographiques</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAdd}
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une zone
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Search */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Rechercher une zone..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        />
                    </div>
                    <span className="text-sm text-slate-400">
                        {pagination?.total || zones.length} zone(s)
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-md border border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                                <TableHead className="text-slate-300">ID</TableHead>
                                <TableHead className="text-slate-300">Nom</TableHead>
                                <TableHead className="text-slate-300">Ville</TableHead>
                                <TableHead className="text-slate-300">Description</TableHead>
                                <TableHead className="text-slate-300">Depanneurs</TableHead>
                                <TableHead className="text-slate-300">Demandes</TableHead>
                                <TableHead className="text-slate-300">Statut</TableHead>
                                <TableHead className="text-slate-300">Cree le</TableHead>
                                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-slate-400">
                                        Aucune zone trouvee
                                    </TableCell>
                                </TableRow>
                            ) : (
                                zones.map((zone) => (
                                    <TableRow key={zone.id} className="hover:bg-slate-700/30">
                                        <TableCell className="text-slate-400">#{zone.id}</TableCell>
                                        <TableCell className="text-white font-medium">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-400" />
                                                {zone.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <Badge variant="outline" className="border-slate-600 text-slate-300">
                                                {zone.city}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-400 max-w-xs truncate">
                                            {zone.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onViewDepanneurs?.(zone)}
                                                className="text-amber-400 hover:text-amber-300"
                                            >
                                                <Wrench className="h-3 w-3 mr-1" />
                                                {zone.depanneurs_count || 0}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-sm">
                                                {zone.demandes_count || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {zone.isActive ? (
                                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                                    Active
                                                </Badge>
                                            ) : (
                                                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {formatDate(zone.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onToggleActive?.(zone)}
                                                    className="h-8 w-8 text-slate-400 hover:text-green-400"
                                                    title={zone.isActive ? 'Desactiver' : 'Activer'}
                                                >
                                                    {zone.isActive ? (
                                                        <XCircle className="h-4 w-4" />
                                                    ) : (
                                                        <CheckCircle className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit?.(zone)}
                                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete?.(zone)}
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

