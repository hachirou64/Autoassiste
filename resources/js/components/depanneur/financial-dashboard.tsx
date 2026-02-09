import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    FileText,
    Download,
    Calendar,
    Wallet,
    CheckCircle,
    Clock,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import type { FinancialStats, Facture, RevenusParPeriode } from '@/types/depanneur';

// Données mockées
const mockFinancialStats: FinancialStats = {
    revenus_jour: 35000,
    revenus_semaine: 185000,
    revenus_mois: 720000,
    revenus_total: 2450000,
    
    factures_en_attente: 3,
    factures_payees: 45,
    factures_annulees: 2,
    
    total_factures: 50,
    
    interventions_terminees: 48,
    interventions_en_cours: 1,
    
    meilleur_jour: '2024-01-15',
    meilleur_montant: 85000,
};

const mockFactures: Facture[] = [
    {
        id: 1,
        numeroFacture: 'FAC-2024-001',
        montant: 35000,
        coutPiece: 15000,
        coutMainOeuvre: 20000,
        mdePaiement: 'mobile_money',
        status: 'payee',
        transactionId: 'TXN-001',
        intervention: {
            id: 1,
            codeIntervention: 'INT-2024-001',
            codeDemande: 'DEM-2024-001',
            typePanne: 'batterie',
        },
        client: {
            fullName: 'Jean Dupont',
            phone: '+229 90 00 00 01',
        },
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
    },
    {
        id: 2,
        numeroFacture: 'FAC-2024-002',
        montant: 25000,
        coutPiece: 10000,
        coutMainOeuvre: 15000,
        mdePaiement: 'cash',
        status: 'en_attente',
        intervention: {
            id: 2,
            codeIntervention: 'INT-2024-002',
            codeDemande: 'DEM-2024-002',
            typePanne: 'panne_seche',
        },
        client: {
            fullName: 'Marie Kouami',
            phone: '+229 90 00 00 02',
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 3,
        numeroFacture: 'FAC-2024-003',
        montant: 85000,
        coutPiece: 45000,
        coutMainOeuvre: 40000,
        mdePaiement: 'carte_bancaire',
        status: 'payee',
        transactionId: 'TXN-003',
        intervention: {
            id: 3,
            codeIntervention: 'INT-2024-003',
            codeDemande: 'DEM-2024-003',
            typePanne: 'moteur',
        },
        client: {
            fullName: 'Paul Agossou',
            phone: '+229 90 00 00 03',
        },
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        paidAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
];

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'XOF',
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'payee':
            return <CheckCircle className="h-4 w-4 text-green-400" />;
        case 'en_attente':
            return <Clock className="h-4 w-4 text-amber-400" />;
        case 'annulee':
        case 'remboursee':
            return <AlertCircle className="h-4 w-4 text-red-400" />;
        default:
            return <FileText className="h-4 w-4 text-slate-400" />;
    }
}

function getMdeIcon(mde: string) {
    switch (mde) {
        case 'cash':
            return <Wallet className="h-4 w-4 text-green-400" />;
        case 'mobile_money':
            return <CreditCard className="h-4 w-4 text-blue-400" />;
        case 'carte_bancaire':
            return <CreditCard className="h-4 w-4 text-purple-400" />;
        case 'virement':
            return <ArrowUpRight className="h-4 w-4 text-cyan-400" />;
        default:
            return <DollarSign className="h-4 w-4 text-slate-400" />;
    }
}

interface FinancialDashboardProps {
    stats?: FinancialStats;
    factures?: Facture[];
    onDownloadFacture?: (factureId: number) => void;
    onExport?: (format: 'excel' | 'pdf') => void;
}

export function FinancialDashboard({
    stats = mockFinancialStats,
    factures = mockFactures,
    onDownloadFacture,
    onExport,
}: FinancialDashboardProps) {

    // Calculer les stats pour les onglets
    const facturesPayees = factures.filter(f => f.status === 'payee');
    const facturesEnAttente = factures.filter(f => f.status === 'en_attente');
    const totalPaye = facturesPayees.reduce((sum, f) => sum + f.montant, 0);
    const totalEnAttente = facturesEnAttente.reduce((sum, f) => sum + f.montant, 0);

    return (
        <div className="space-y-6">
            {/* Stats principales */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Revenus aujourd'hui
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(stats.revenus_jour)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            +12% vs hier
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Revenus ce mois
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(stats.revenus_mois)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-400 mt-1">
                            <ArrowUpRight className="h-3 w-3" />
                            +8% vs mois dernier
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Total revenus
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(stats.revenus_total)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Depuis votre inscription
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            En attente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400">
                            {formatCurrency(totalEnAttente)}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats.factures_en_attente} facture(s)
                        </p>
                    </CardContent>
                </Card>
            </div>

                {/* Graphiques et tabs */}
                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-slate-800 border-slate-700">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
                            Aperçu
                        </TabsTrigger>
                        <TabsTrigger value="factures" className="data-[state=active]:bg-slate-700">
                            Factures
                        </TabsTrigger>
                        <TabsTrigger value="revenus" className="data-[state=active]:bg-slate-700">
                            Revenus
                        </TabsTrigger>
                    </TabsList>

                {/* Aperçu */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Chart des revenus (simulé) */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-400" />
                                    Revenus - 7 derniers jours
                                </CardTitle>
                                <CardDescription className="text-slate-400">
                                    Évolution de vos revenus
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64 flex items-end justify-between gap-2">
                                    {[
                                        { day: 'Lun', amount: 45000 },
                                        { day: 'Mar', amount: 52000 },
                                        { day: 'Mer', amount: 38000 },
                                        { day: 'Jeu', amount: 65000 },
                                        { day: 'Ven', amount: 72000 },
                                        { day: 'Sam', amount: 35000 },
                                        { day: 'Dim', amount: 28000 },
                                    ].map((item, index) => (
                                        <div key={index} className="flex flex-col items-center gap-2 flex-1">
                                            <div 
                                                className="w-full bg-green-500/20 rounded-t-lg relative group cursor-pointer hover:bg-green-500/30 transition-colors"
                                                style={{ 
                                                    height: `${(item.amount / 72000) * 200}px`,
                                                    minHeight: '20px'
                                                }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {formatCurrency(item.amount)}
                                                </div>
                                            </div>
                                            <span className="text-xs text-slate-400">{item.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stats interventions */}
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-400" />
                                    Interventions & Factures
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-400" />
                                        <span className="text-slate-300">Payées</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-400">{formatCurrency(totalPaye)}</p>
                                        <p className="text-xs text-slate-400">{stats.factures_payees} factures</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-amber-400" />
                                        <span className="text-slate-300">En attente</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-amber-400">{formatCurrency(totalEnAttente)}</p>
                                        <p className="text-xs text-slate-400">{stats.factures_en_attente} factures</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-400" />
                                        <span className="text-slate-300">Annulées</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-400">{formatCurrency(0)}</p>
                                        <p className="text-xs text-slate-400">{stats.factures_annulees} factures</p>
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-slate-700">
                                    <div className="flex items-center justify-between">
                                        <span className="text-white font-medium">Total factures</span>
                                        <span className="text-xl font-bold text-white">{stats.total_factures}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Factures */}
                <TabsContent value="factures" className="space-y-4">
                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white">
                                    Liste des factures
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Excel
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        PDF
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {factures.map((facture) => (
                                    <div 
                                        key={facture.id}
                                        className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${
                                                facture.status === 'payee' ? 'bg-green-500/20' :
                                                facture.status === 'en_attente' ? 'bg-amber-500/20' : 'bg-red-500/20'
                                            }`}>
                                                {getStatusIcon(facture.status)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{facture.numeroFacture}</p>
                                                <p className="text-sm text-slate-400">
                                                    {facture.client.fullName} - {facture.intervention.typePanne}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                {getMdeIcon(facture.mdePaiement)}
                                                <span className="text-sm text-slate-300 capitalize">
                                                    {facture.mdePaiement.replace('_', ' ')}
                                                </span>
                                            </div>
                                            
                                            <div className="text-right">
                                                <p className="font-bold text-white">{formatCurrency(facture.montant)}</p>
                                                <p className="text-xs text-slate-400">
                                                    {formatDate(facture.createdAt)}
                                                </p>
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDownloadFacture?.(facture.id)}
                                                className="text-slate-400 hover:text-white"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Revenus détaillés */}
                <TabsContent value="revenus" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-400">Aujourd'hui</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-400">
                                    {formatCurrency(stats.revenus_jour)}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                    +12%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-400">Cette semaine</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-400">
                                    {formatCurrency(stats.revenus_semaine)}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                    +5%
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-400">Ce mois</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-green-400">
                                    {formatCurrency(stats.revenus_mois)}
                                </p>
                                <div className="flex items-center gap-1 mt-2 text-sm text-green-400">
                                    <ArrowUpRight className="h-4 w-4" />
                                    +8%
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-slate-800/50 border-slate-700">
                        <CardHeader>
                            <CardTitle className="text-white">
                                Répartition par type de service
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    { type: 'Panne de batterie', count: 15, amount: 525000, percent: 35 },
                                    { type: 'Panne sèche', count: 12, amount: 360000, percent: 28 },
                                    { type: 'Créaison', count: 8, amount: 180000, percent: 18 },
                                    { type: 'Problème moteur', count: 4, amount: 320000, percent: 12 },
                                    { type: 'Autre', count: 3, amount: 90000, percent: 7 },
                                ].map((item, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-white">{item.type}</span>
                                            <span className="text-slate-400">{formatCurrency(item.amount)} ({item.percent}%)</span>
                                        </div>
                                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${item.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

