import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar, Clock, MapPin, Wrench, Star, FileText,
    ChevronRight, Download, MessageSquare, Filter
} from 'lucide-react';
import type { InterventionHistoryItem } from '@/types/client';
import { DEMANDE_STATUS_LABELS, DEMANDE_STATUS_COLORS } from '@/types/client';

interface InterventionHistoryProps {
    history: InterventionHistoryItem[];
    onViewDetails?: (item: InterventionHistoryItem) => void;
    onDownloadFacture?: (factureId: number) => void;
    onEvaluer?: (item: InterventionHistoryItem) => void;
}

export function InterventionHistory({
    history,
    onViewDetails,
    onDownloadFacture,
    onEvaluer,
}: InterventionHistoryProps) {
    const [filter, setFilter] = useState<'all' | 'terminees' | 'annulees'>('all');
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const filteredHistory = history.filter((item) => {
        if (filter === 'terminees') return item.status === 'terminee';
        if (filter === 'annulees') return item.status === 'annulee';
        return true;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        return DEMANDE_STATUS_COLORS[status as keyof typeof DEMANDE_STATUS_COLORS] || 'bg-slate-500/20 text-slate-400';
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Historique des interventions
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filtres */}
                <div className="flex items-center justify-between mb-4">
                    <Tabs defaultValue={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                        <TabsList className="bg-slate-700">
                            <TabsTrigger value="all" className="data-[state=active]:bg-blue-500">
                                Toutes
                            </TabsTrigger>
                            <TabsTrigger value="terminees" className="data-[state=active]:bg-blue-500">
                                Terminées
                            </TabsTrigger>
                            <TabsTrigger value="annulees" className="data-[state=active]:bg-blue-500">
                                Annulées
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                        <Filter className="h-4 w-4 mr-1" />
                        Filtrer
                    </Button>
                </div>

                {/* Liste */}
                <div className="space-y-3">
                    {filteredHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="h-6 w-6 text-slate-400" />
                            </div>
                            <p className="text-slate-400">Aucune intervention dans l'historique</p>
                        </div>
                    ) : (
                        filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors"
                            >
                                {/* En-tête */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                                            <Wrench className="h-5 w-5 text-slate-300" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-white">{item.codeDemande}</span>
                                                <Badge className={getStatusColor(item.status)}>
                                                    {DEMANDE_STATUS_LABELS[item.status as keyof typeof DEMANDE_STATUS_LABELS] || item.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-400">{item.typePanne}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-400">{formatDate(item.date)}</p>
                                        <p className="text-sm text-slate-500">{formatDuration(item.duree)}</p>
                                    </div>
                                </div>

                                {/* Détails (affichés si développé) */}
                                {expandedId === item.id && (
                                    <div className="mt-4 pt-4 border-t border-slate-600 space-y-3">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500">Dépanneur</p>
                                                <p className="text-white">{item.depanneur.fullName}</p>
                                                <p className="text-slate-400 text-xs">{item.depanneur.etablissement_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">Montant</p>
                                                <p className="text-white font-medium">{formatCurrency(item.montant)}</p>
                                            </div>
                                        </div>

                                        {/* Évaluation */}
                                        {item.evaluation ? (
                                            <div className="p-3 bg-amber-500/10 rounded-lg">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                                                    <span className="font-medium text-white">{item.evaluation.note}/5</span>
                                                </div>
                                                {item.evaluation.commentaire && (
                                                    <p className="text-sm text-slate-400">"{item.evaluation.commentaire}"</p>
                                                )}
                                            </div>
                                        ) : item.status === 'terminee' ? (
                                            onEvaluer && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                                    onClick={() => onEvaluer(item)}
                                                >
                                                    <Star className="h-4 w-4 mr-2" />
                                                    Évaluer cette intervention
                                                </Button>
                                            )
                                        ) : null}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            {onViewDetails && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onViewDetails(item)}
                                                    className="flex-1 text-slate-400 hover:text-white"
                                                >
                                                    Détails
                                                </Button>
                                            )}
                                            {item.facture && onDownloadFacture && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDownloadFacture(item.facture!.id)}
                                                    className="flex-1 text-slate-400 hover:text-white"
                                                >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Facture
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600/50">
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <MapPin className="h-3 w-3" />
                                        {item.depanneur.etablissement_name}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                                        className="text-slate-400 hover:text-white h-auto p-0"
                                    >
                                        {expandedId === item.id ? 'Moins' : 'Plus'}
                                        <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedId === item.id ? 'rotate-90' : ''}`} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination simulée */}
                {filteredHistory.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-700">
                        <Button variant="ghost" size="sm" disabled className="text-slate-500">
                            Précédent
                        </Button>
                        <span className="text-sm text-slate-400">Page 1 sur 5</span>
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                            Suivant
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

