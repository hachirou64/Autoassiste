import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    Search, Plus, Edit, Trash2, MoreHorizontal, Mail, Phone, MapPin,
    CheckCircle, XCircle, Clock, Map, ToggleLeft, ToggleRight, X, User, Lock, AlertCircle, Building2
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
    onCreate?: (data: { promoteur_name: string; etablissement_name: string; IFU: string; email: string; phone: string; password: string; password_confirmation: string; type_vehicule: string }) => void;
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
    onCreate,
    isLoading = false,
}: DepanneursTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [createForm, setCreateForm] = useState({
        promoteur_name: '',
        etablissement_name: '',
        IFU: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        type_vehicule: 'voiture',
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch?.(query);
    };

    const handleOpenCreateModal = () => {
        setCreateForm({
            promoteur_name: '',
            etablissement_name: '',
            IFU: '',
            email: '',
            phone: '',
            password: '',
            password_confirmation: '',
            type_vehicule: 'voiture',
        });
        setCreateError(null);
        setShowCreateModal(true);
    };

    const handleCreateDepanneur = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);
        setIsCreating(true);

        try {
            const response = await fetch('/admin/api/depanneurs', {
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
                        <span>Depanneurs</span>
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

        {/* Modal Create Depanneur */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 max-w-lg w-full mx-4 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white">Ajouter un depanneur</h3>
                        <button 
                            onClick={() => setShowCreateModal(false)}
                            className="text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleCreateDepanneur} className="space-y-4">
                        {createError && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                {createError}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="promoteur_name" className="text-slate-300">Nom du promoteur *</Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="promoteur_name"
                                        type="text"
                                        placeholder="Jean Dupont"
                                        value={createForm.promoteur_name}
                                        onChange={(e) => setCreateForm({ ...createForm, promoteur_name: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="etablissement_name" className="text-slate-300">Etablissement *</Label>
                                <div className="relative mt-1">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="etablissement_name"
                                        type="text"
                                        placeholder="Garage du Centre"
                                        value={createForm.etablissement_name}
                                        onChange={(e) => setCreateForm({ ...createForm, etablissement_name: e.target.value })}
                                        className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="IFU" className="text-slate-300">IFU *</Label>
                            <Input
                                id="IFU"
                                type="text"
                                placeholder="1234567890123"
                                value={createForm.IFU}
                                onChange={(e) => setCreateForm({ ...createForm, IFU: e.target.value })}
                                className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-slate-300">Email *</Label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="garage@example.com"
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
                            <Label htmlFor="type_vehicule" className="text-slate-300">Type de vehicule</Label>
                            <select
                                id="type_vehicule"
                                value={createForm.type_vehicule}
                                onChange={(e) => setCreateForm({ ...createForm, type_vehicule: e.target.value })}
                                className="mt-1 w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                            >
                                <option value="voiture">Voiture</option>
                                <option value="moto">Moto</option>
                                <option value="camion">Camion</option>
                                <option value="utilitaire">Utilitaire</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                <Label htmlFor="password_confirmation" className="text-slate-300">Confirmer *</Label>
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
                                {isCreating ? 'Création...' : 'Créer le depanneur'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
        </>
    );
}

