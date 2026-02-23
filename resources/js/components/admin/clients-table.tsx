import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, Calendar, X, User, Lock, AlertCircle
} from 'lucide-react';
import type { Client } from '@/types';

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
    onCreate?: (client: { fullName: string; email: string; phone: string; password: string; password_confirmation: string }) => void;
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
    onCreate,
    isLoading = false,
}: ClientsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const handleOpenCreateModal = () => {
        setCreateForm({
            fullName: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
        });
        setCreateError(null);
        setShowCreateModal(true);
    };

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);
        setIsCreating(true);

        try {
            const response = await fetch('/admin/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify(createForm),
            });

            const data = await response.json();

            if (data.success) {
                setShowCreateModal(false);
                // Rafraîchir la page pour voir le nouveau client
                window.location.reload();
            } else {
                setCreateError(data.message || 'Erreur lors de la création');
            }
        } catch (error) {
            setCreateError('Erreur de connexion');
        } finally {
            setIsCreating(false);
        }
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
                    <Button variant="outline" size="sm" onClick={handleOpenCreateModal} className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
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
        <>
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Clients</span>
                        <Button variant="outline" size="sm" onClick={handleOpenCreateModal} className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Search */}
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/-y-1/2 transform -translate2 h-4 w-4 text-slate-400" />
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

            {/* Modal Create Client */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-md w-full mx-4 border border-slate-700/50">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">Ajouter un client</h3>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateClient} className="space-y-4">
                            {createError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    {createError}
                                </div>
                            )}

                            <div>
                                <Label htmlFor="fullName" className="text-slate-300">Nom complet *</Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="fullName"
                                        type="text"
                                        placeholder="Jean Dupont"
                                        value={createForm.fullName}
                                        onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-slate-300">Email *</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="jean@example.com"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-slate-300">Telephone *</Label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+229 XX XX XX XX"
                                        value={createForm.phone}
                                        onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-slate-300">Mot de passe *</Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation" className="text-slate-300">Confirmer mot de passe *</Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="••••••••"
                                        value={createForm.password_confirmation}
                                        onChange={(e) => setCreateForm({ ...createForm, password_confirmation: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="bg-slate-700 text-white hover:bg-slate-600"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    {isCreating ? 'Création...' : 'Créer le client'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

