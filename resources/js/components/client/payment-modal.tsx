import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PaymentForm } from '@/components/client/payment-form';
import { CheckCircle, ArrowLeft, Loader2, X } from 'lucide-react';

interface FactureData {
    id: number;
    montant: number;
    status: string;
    transactionId: string;
    createdAt: string;
    intervention: {
        id: number;
        demande: {
            codeDemande: string;
            typePanne: string;
            client: {
                fullName: string;
            };
        };
        depanneur: {
            etablissement_name: string;
        };
    };
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    factureId?: number;
    facture?: FactureData;
}

export function PaymentModal({ isOpen, onClose, factureId, facture }: PaymentModalProps) {
    const [loading, setLoading] = useState(!facture);
    const [factureData, setFactureData] = useState<FactureData | null>(facture || null);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    useEffect(() => {
        if (isOpen && !factureData) {
            fetchFactureData();
        }
    }, [isOpen, factureId]);

    const fetchFactureData = async () => {
        if (!factureId) return;
        
        setLoading(true);
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(`/api/client/factures/${factureId}/payment-data`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'include',
            });

            const result = await response.json();

            if (result.success && result.facture) {
                setFactureData(result.facture);
            } else {
                setFactureData(null);
            }
        } catch (err) {
            console.error('Erreur:', err);
            setFactureData(null);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = () => {
        setPaymentSuccess(true);
        // Fermer après 2 secondes
        setTimeout(() => {
            setPaymentSuccess(false);
            onClose();
            router.visit('/client/dashboard');
        }, 2000);
    };

    const handleClose = () => {
        if (!paymentSuccess) {
            setFactureData(facture || null);
            setPaymentSuccess(false);
        }
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-white text-slate-900 border-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">
                        {paymentSuccess ? 'Paiement réussi!' : 'Paiement de la facture'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-600">
                        {paymentSuccess 
                            ? 'Votre paiement a été traité avec succès.' 
                            : 'Veuillez sélectionner votre méthode de paiement préférée.'}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <span className="ml-2 text-slate-600">Chargement...</span>
                    </div>
                ) : paymentSuccess ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <p className="text-green-700 font-medium">Redirection en cours...</p>
                        <Loader2 className="h-5 w-5 animate-spin text-green-500 mx-auto mt-2" />
                    </div>
                ) : !factureData ? (
                    <div className="text-center py-6">
                        <p className="text-red-500 mb-4">Facture non trouvée</p>
                        <Button onClick={handleClose} variant="outline">
                            Fermer
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Facture Details */}
                        <Card className="bg-slate-50 border-slate-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center justify-between text-slate-900">
                                    <span>Facture #{factureData.transactionId}</span>
                                    <span className="text-2xl font-bold text-amber-600">
                                        {factureData.montant.toLocaleString('fr-FR')} CFA
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <p className="text-slate-500">Demande</p>
                                        <p className="text-slate-900 font-medium">{factureData.intervention.demande.codeDemande}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Type</p>
                                        <p className="text-slate-900 font-medium">{factureData.intervention.demande.typePanne}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Dépanneur</p>
                                        <p className="text-slate-900 font-medium">{factureData.intervention.depanneur.etablissement_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Date</p>
                                        <p className="text-slate-900 font-medium">
                                            {new Date(factureData.createdAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Form */}
                        <PaymentForm
                            amount={factureData.montant}
                            factureId={factureData.id}
                            onSuccess={handlePaymentSuccess}
                        />
                    </div>
                )}

                <DialogFooter className="sm:justify-between gap-2">
                    {!paymentSuccess && (
                        <Button 
                            variant="outline" 
                            onClick={handleClose}
                            className="border-slate-300 text-slate-700 hover:bg-slate-100"
                        >
                            Annuler
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

