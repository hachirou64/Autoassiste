import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    DollarSign, FileText, Download, TrendingUp, CreditCard, RefreshCw,
    CheckCircle, XCircle, Clock
} from 'lucide-react';
import type { Facture, RapportData } from '@/types';
import { useState } from 'react';

interface FinancialReportsProps {
    factures: Facture[];
    rapport?: RapportData;
    pagination?: {
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
    onPageChange?: (page: number) => void;
    onDownloadReport?: (period: string) => void;
    onViewFacture?: (facture: Facture) => void;
    isLoading?: boolean;
}

export function FinancialReports({
    factures,
    rapport,
    pagination,
    onPageChange,
    onDownloadReport,
    onViewFacture,
    isLoading = false,
}: FinancialReportsProps) {
    const [period, setPeriod] = useState('month');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'cash': return 'Especes';
            case 'mobile_money': return 'Mobile Money';
            case 'carte_bancaire': return 'Carte bancaire';
            case 'virement': return 'Virement';
            default: return method;
        }
    };

    const getStatusConfig = (status: Facture['status']) => {
        switch (status) {
            case 'en_attente':
                return { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock };
            case 'payee':
                return { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle };
            case 'annulee':
                return { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle };
            case 'remboursee':
                return { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: RefreshCw };
            default:
                return { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock };
        }
    };

    // Calculer les totaux
    const totalFactures = factures.reduce((sum, f) => sum + f.montant, 0);
    const payeeCount = factures.filter(f => f.status === 'payee').length;
    const pendingCount = factures.filter(f => f.status === 'en_attente').length;

    if (isLoading) {
        return (
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Rapports financiers</span>
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
        <div className="space-y-4">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Total factures</p>
                                <p className="text-2xl font-bold text-white">{pagination?.total || factures.length}</p>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-full">
                                <FileText className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Montant total</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(totalFactures)}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-full">
                                <DollarSign className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">Payees</p>
                                <p className="text-2xl font-bold text-green-400">{payeeCount}</p>
                            </div>
                            <div className="p-3 bg-green-500/10 rounded-full">
                                <CheckCircle className="h-6 w-6 text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-400">En attente</p>
                                <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                            </div>
                            <div className="p-3 bg-yellow-500/10 rounded-full">
                                <Clock className="h-6 w-6 text-yellow-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Card */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span>Historique des factures</span>
                        <div className="flex items-center gap-2">
                            <Select value={period} onValueChange={setPeriod}>
                                <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600 text-white">
                                    <SelectValue placeholder="Periode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">Cette semaine</SelectItem>
                                    <SelectItem value="month">Ce mois</SelectItem>
                                    <SelectItem value="quarter">Ce trimestre</SelectItem>
                                    <SelectItem value="year">Cette annee</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDownloadReport?.(period)}
                                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Telecharger
                            </Button>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Table */}
                    <div className="rounded-md border border-slate-700">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-700/50 hover:bg-slate-700/50">
                                    <TableHead className="text-slate-300">ID</TableHead>
                                    <TableHead className="text-slate-300">Transaction</TableHead>
                                    <TableHead className="text-slate-300">Montant</TableHead>
                                    <TableHead className="text-slate-300">Mode de paiement</TableHead>
                                    <TableHead className="text-slate-300">Statut</TableHead>
                                    <TableHead className="text-slate-300">Cree le</TableHead>
                                    <TableHead className="text-slate-300">Paye le</TableHead>
                                    <TableHead className="text-slate-300 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {factures.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                                            Aucune facture trouvee
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    factures.map((facture) => {
                                        const statusConfig = getStatusConfig(facture.status);
                                        const StatusIcon = statusConfig.icon;
                                        return (
                                            <TableRow key={facture.id} className="hover:bg-slate-700/30">
                                                <TableCell className="text-slate-400">#{facture.id}</TableCell>
                                                <TableCell className="text-white font-mono text-sm">
                                                    {facture.transactionId}
                                                </TableCell>
                                                <TableCell className="text-slate-300 font-medium">
                                                    {formatCurrency(facture.montant)}
                                                </TableCell>
                                                <TableCell className="text-slate-300">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-3 w-3 text-slate-500" />
                                                        {getPaymentMethodLabel(facture.mdePaiement)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={statusConfig.color}>
                                                        <StatusIcon className="h-3 w-3 mr-1" />
                                                        {facture.statut_label || facture.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm">
                                                    {formatDate(facture.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-slate-400 text-sm">
                                                    {facture.paidAt ? formatDate(facture.paidAt) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onViewFacture?.(facture)}
                                                        className="text-slate-400 hover:text-white"
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Voir
                                                    </Button>
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
        </div>
    );
}

