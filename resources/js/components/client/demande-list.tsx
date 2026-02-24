import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, MapPin, Wrench, Eye, XCircle, FileText } from 'lucide-react';
import { DEMANDE_STATUS_LABELS, DEMANDE_STATUS_COLORS } from '@/types/client';
import type { DemandeActive } from '@/types/client';

interface Demande {
    id: number;
    codeDemande: string;
    typePanne: string;
    localisation: string;
    date: string;
    status: 'en_attente' | 'acceptee' | 'en_cours' | 'terminee' | 'annulee';
    depanneur?: {
        etablissement_name: string;
        fullName: string;
    };
}

interface DemandeListProps {
    demandes: Demande[];
    demandeActive?: DemandeActive;
    onViewDetails?: (demande: Demande) => void;
    onCancel?: (demande: Demande) => void;
}

export function DemandeList({ demandes, demandeActive, onViewDetails, onCancel }: DemandeListProps) {
    const [filter, setFilter] = useState<'all' | 'en_cours' | 'terminees'>('all');

    const filteredDemandes = demandes.filter((d) => {
        if (filter === 'en_cours') return ['en_attente', 'acceptee', 'en_cours'].includes(d.status);
        if (filter === 'terminees') return d.status === 'terminee';
        return true;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Mes demandes
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filtres */}
                <Tabs defaultValue={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                    <TabsList className="bg-gray-100">
                        <TabsTrigger value="all" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Toutes</TabsTrigger>
                        <TabsTrigger value="en_cours" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">En cours</TabsTrigger>
                        <TabsTrigger value="terminees" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">Terminées</TabsTrigger>
                    </TabsList>

                    <TabsContent value={filter} className="mt-4">
                        {/* Demande active */}
                        {demandeActive && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-amber-600 font-medium">Intervention en cours</p>
                                        <p className="text-gray-900 font-bold">{demandeActive.codeDemande}</p>
                                        <p className="text-gray-500 text-sm">{DEMANDE_STATUS_LABELS[demandeActive.status]}</p>
                                    </div>
                                    <Badge className={DEMANDE_STATUS_COLORS[demandeActive.status]}>
                                        {DEMANDE_STATUS_LABELS[demandeActive.status]}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Liste des demandes */}
                        <div className="space-y-3">
                            {filteredDemandes.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">Aucune demande</p>
                            ) : (
                                filteredDemandes.map((demande) => (
                                    <div
                                        key={demande.id}
                                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-mono text-gray-900">{demande.codeDemande}</span>
                                                    <Badge className={DEMANDE_STATUS_COLORS[demande.status]}>
                                                        {DEMANDE_STATUS_LABELS[demande.status]}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600">{demande.typePanne}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {demande.localisation}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDate(demande.date)}
                                                </div>
                                                {demande.depanneur && (
                                                    <div className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                                                        <Wrench className="h-3 w-3" />
                                                        {demande.depanneur.etablissement_name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onViewDetails?.(demande)}
                                                    className="h-8 w-8 text-gray-600 hover:text-gray-900"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                {['en_attente'].includes(demande.status) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onCancel?.(demande)}
                                                        className="h-8 w-8 text-gray-600 hover:text-red-600"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}

