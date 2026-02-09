import { useState } from 'react';
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
    Calendar,
    Download,
    Filter,
    Search,
    Star,
    FileText,
    Phone,
    MapPin,
    Clock,
    MoreVertical,
    Eye,
    File,
    DollarSign
} from 'lucide-react';
import type { InterventionHistoryItem, HistoryFilters } from '@/types/depanneur';
import { DEMANDE_STATUS_COLORS, DEMANDE_STATUS_LABELS } from '@/types/client';

// Données mockées
const mockHistory: InterventionHistoryItem[] = [
    {
        id: 1,
        codeIntervention: 'INT-2024-001',
        codeDemande: 'DEM-2024-001',
        date: new Date().toISOString(),
        typePanne: 'batterie',
        status: 'terminee',
        client: {
            fullName: 'Jean Dupont',
            phone: '+229 90 00 00 01',
        },
        vehicle: {
            brand: 'Toyota',
            model: 'Corolla',
            plate: 'ABC-123',
        },
        montant: 35000,
        duree: 45,
        coutPiece: 15000,
        coutMainOeuvre: 20000,
        evaluation: {
            note: 5,
            commentaire: 'Service rapide et professionnel!'
        },
        facture: {
            id: 1,
            montant: 35000,
            status: 'payee',
            url: '#',
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
    },
    {
        id: 2,
        codeIntervention: 'INT-2024-002',
        codeDemande: 'DEM-2024-002',
        date: new Date(Date.now() - 86400000).toISOString(),
        typePanne: 'panne_seche',
        status: 'terminee',
        client: {
            fullName: 'Marie Kouami',
            phone: '+229 90 00 00 02',
        },
        vehicle: {
            brand: 'Honda',
            model: 'Civic',
            plate: 'DEF-456',
        },
        montant: 25000,
        duree: 30,
        coutPiece: 10000,
        coutMainOeuvre: 15000,
        evaluation: {
            note: 4,
            commentaire: 'Bon service, délai respecté'
        },
        facture: {
            id: 2,
            montant: 25000,
            status: 'payee',
            url: '#',
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 3,
        codeIntervention: 'INT-2024-003',
        codeDemande: 'DEM-2024-003',
        date: new Date(Date.now() - 86400000 * 7).toISOString(),
        typePanne: 'creaison',
        status: 'terminee',
        client: {
            fullName: 'Paul Agossou',
            phone: '+229 90 00 00 03',
        },
        vehicle: {
            brand: 'Ford',
            model: 'Fiesta',
            plate: 'GHI-789',
        },
        montant: 15000,
        duree: 25,
        coutPiece: 5000,
        coutMainOeuvre: 10000,
        evaluation: {
            note: 5,
            commentaire: 'Excellent travail!'
        },
        facture: {
            id: 3,
            montant: 15000,
            status: 'en_attente',
            url: '#',
        },
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
    {
        id: 4,
        codeIntervention: 'INT-2024-004',
        codeDemande: 'DEM-2024-004',
        date: new Date(Date.now() - 86400000 * 14).toISOString(),
        typePanne: 'moteur',
        status: 'terminee',
        client: {
            fullName: 'Sika Aime',
            phone: '+229 90 00 00 04',
        },
        vehicle: {
            brand: 'Peugeot',
            model: '308',
            plate: 'JKL-012',
        },
        montant: 85000,
        duree: 180,
        coutPiece: 45000,
        coutMainOeuvre: 40000,
        evaluation: {
            note: 5,
            commentaire: 'Problème résolu rapidement'
        },
        facture: {
            id: 4,
            montant: 85000,
            status: 'payee',
            url: '#',
        },
        createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    {
        id: 5,
        codeIntervention: 'INT-2024-005',
        codeDemande: 'DEM-2024-005',
        date: new Date(Date.now() - 86400000 * 21).toISOString(),
        typePanne: 'freins',
        status: 'annulee',
        client: {
            fullName: 'Koffi Jean',
            phone: '+229 90 00 00 05',
        },
        vehicle: {
            brand: 'Renault',
            model: 'Clio',
            plate: 'MNO-345',
        },
        montant: 0,
        duree: 10,
        coutPiece: 0,
        coutMainOeuvre: 0,
        createdAt: new Date(Date.now() - 86400000 * 21).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 21).toISOString(),
    },
];

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

function formatDuree(minutes: number): string {
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
}

export function InterventionHistory({
    history = mockHistory,
    onViewDetails,
    onDownloadFacture,
    onExport,
}: InterventionHistoryProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');

    // Filtrer l'historique
    const filteredHistory = history.filter(item => {
        const matchesSearch = 
            item.codeDemande.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.codeIntervention.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.client.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    // Statistiques
    const stats = {
        total: filteredHistory.length,
        terminees: filteredHistory.filter(i => i.status === 'terminee').length,
        annulees: filteredHistory.filter(i => i.status === 'annulee').length,
        montantTotal: filteredHistory
            .filter(i => i.status === 'terminee')
            .reduce((sum, i) => sum + i.montant, 0),
    };

    return (
        <div className="space-y-6">
            {/* Header avec stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <FileText className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total</p>
                                <p className="text-2xl font-bold text-white">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Terminées</p>
                                <p className="text-2xl font-bold text-white">{stats.terminees}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10">
                                <Clock className="h-5 w-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Annulées</p>
                                <p className="text-2xl font-bold text-white">{stats.annulees}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10">
                                <DollarSign className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Revenus</p>
                                <p className="text-2xl font-bold text-white">{formatCurrency(stats.montantTotal)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtres et recherche */}
            <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Recherche */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher par code, client..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            />
                        </div>
                        
                        {/* Filtre statut */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Statut" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les statuts</SelectItem>
                                <SelectItem value="terminee">Terminée</SelectItem>
                                <SelectItem value="en_cours">En cours</SelectItem>
                                <SelectItem value="annulee">Annulée</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {/* Filtre date */}
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                            <SelectTrigger className="w-full md:w-48 bg-slate-700/50 border-slate-600 text-white">
                                <SelectValue placeholder="Période" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les dates</SelectItem>
                                <SelectItem value="today">Aujourd'hui</SelectItem>
                                <SelectItem value="week">Cette semaine</SelectItem>
                                <SelectItem value="month">Ce mois</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {/* Export */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => onExport?.('excel')}
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Excel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onExport?.('pdf')}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                                <File className="h-4 w-4 mr-2" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tableau */}
            <Card className="bg-slate-800/50 border-slate-700">
                <Table>
                    <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-slate-700/50">
                            <TableHead className="text-slate-300">Date</TableHead>
                            <TableHead className="text-slate-300">Code</TableHead>
                            <TableHead className="text-slate-300">Client</TableHead>
                            <TableHead className="text-slate-300">Type</TableHead>
                            <TableHead className="text-slate-300">Montant</TableHead>
                            <TableHead className="text-slate-300">Durée</TableHead>
                            <TableHead className="text-slate-300">Statut</TableHead>
                            <TableHead className="text-slate-300">Note</TableHead>
                            <TableHead className="text-slate-300 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredHistory.map((item) => (
                            <TableRow 
                                key={item.id}
                                className="border-slate-700 hover:bg-slate-700/50"
                            >
                                <TableCell className="text-slate-300">
                                    {formatDate(item.date)}
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="font-medium text-white">{item.codeIntervention}</p>
                                        <p className="text-xs text-slate-400">{item.codeDemande}</p>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div>
                                        <p className="text-white">{item.client.fullName}</p>
                                        <p className="text-xs text-slate-400">{item.vehicle?.brand} {item.vehicle?.model}</p>
                                    </div>
                                </TableCell>
                                <TableCell className="text-slate-300 capitalize">
                                    {item.typePanne.replace('_', ' ')}
                                </TableCell>
                                <TableCell>
                                    <span className="font-medium text-green-400">
                                        {formatCurrency(item.montant)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-slate-300">
                                    {formatDuree(item.duree)}
                                </TableCell>
                                <TableCell>
                                    <Badge className={DEMANDE_STATUS_COLORS[item.status as keyof typeof DEMANDE_STATUS_COLORS] || 'bg-slate-500'}>
                                        {DEMANDE_STATUS_LABELS[item.status as keyof typeof DEMANDE_STATUS_LABELS] || item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {item.evaluation ? (
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                            <span className="text-white">{item.evaluation.note}/5</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-slate-400">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                            <DropdownMenuItem 
                                                onClick={() => onViewDetails?.(item)}
                                                className="text-white hover:bg-slate-700"
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                Voir détails
                                            </DropdownMenuItem>
                                            {item.facture && (
                                                <DropdownMenuItem 
                                                    onClick={() => onDownloadFacture?.(item.facture.id)}
                                                    className="text-white hover:bg-slate-700"
                                                >
                                                    <File className="h-4 w-4 mr-2" />
                                                    Facture
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-white hover:bg-slate-700">
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
                
                {filteredHistory.length === 0 && (
                    <div className="py-12 text-center">
                        <FileText className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">Aucune intervention trouvée</p>
                    </div>
                )}
            </Card>
        </div>
    );
}

