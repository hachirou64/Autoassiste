import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, Calendar
} from 'lucide-react';
import type { Client, PaginationParams, TableResponse } from '@/types';

interface ClientsTableProps {
    clients: Client[];
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    onPageChange?: (page: number) => void;
    onSearch?: (query: string) => void;
    onEdit?: (client: Client) => void;
    onDelete?: (client: Client) => void;
    onView?: (client: Client) => void;
    isLoading?: boolean;
}

export function ClientsTable({
    clients,
    pagination,
    onPageChange,
    onSearch,
    onEdit,
    onDelete,
    onView,
    isLoading = false,
}: ClientsTableProps) {
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

    if (isLoading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>Clients</span>
                    <Link href="/register">
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
                    <span>Clients</span>
                    <Link href="/register">
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
                            placeholder="Rechercher un client..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        />
                    </div>
                    <span className="text-sm text-slate-400">
                        {(pagination?.total || clients.length)} client(s)
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-md border border-slate-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                                <TableHead className="text-slate-300">ID</TableHead>
                                <TableHead className="text-slate-300">Nom complet</TableHead>
                                <TableHead className="text-slate-300">Email</TableHead>
                                <TableHead className="text-slate-300">Telephone</TableHead>
                                <TableHead className="text-slate-300">Demandes</TableHead>
                                <TableHead className="text-slate-300">Total depenses</TableHead>
                                <TableHead className="text-slate-300">Inscrit le</TableHead>
                                <TableHead className="text-slate-300 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                                        Aucun client trouve
                                    </TableCell>
                                </TableRow>
                            ) : (
                                clients.map((client) => (
                                    <TableRow key={client.id} className="hover:bg-slate-700/30">
                                        <TableCell className="text-slate-400">#{client.id}</TableCell>
                                        <TableCell className="text-white font-medium">
                                            {client.fullName}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-slate-500" />
                                                {client.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3 w-3 text-slate-500" />
                                                {client.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
                                                {client.demandes_count || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {formatCurrency(client.total_depenses || 0)}
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3 text-slate-500" />
                                                {formatDate(client.createdAt)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onView?.(client)}
                                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onEdit?.(client)}
                                                    className="h-8 w-8 text-slate-400 hover:text-white"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onDelete?.(client)}
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

