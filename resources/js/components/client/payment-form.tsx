import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, DollarSign, Smartphone, Banknote, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentFormProps {
    amount: number;
    factureId?: number;
    demandeId?: number;
    onSuccess?: () => void;
    isLoading?: boolean;
}

type PaymentMethod = 'card' | 'cash' | 'mobile';

export function PaymentForm({
    amount,
    factureId,
    demandeId,
    onSuccess,
    isLoading = false,
}: PaymentFormProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });
    const [processing, setProcessing] = useState(false);

    // Mapper le méthode frontend vers le backend
    const mapMethodToBackend = (method: PaymentMethod): string => {
        switch (method) {
            case 'card': return 'carte_bancaire';
            case 'cash': return 'cash';
            case 'mobile': return 'mobile_money';
            default: return 'mobile_money';
        }
    };

    const handlePayment = async () => {
        setProcessing(true);

        try {
            // Déterminer l'endpoint à utiliser
            let endpoint = '';
            let body: Record<string, unknown> = {};

            if (factureId) {
                // Paiement par facture
                endpoint = `/api/client/factures/${factureId}/payer`;
                body = {
                    method: mapMethodToBackend(paymentMethod),
                };
            } else if (demandeId) {
                // Paiement par demande (ancien comportement)
                endpoint = `/api/demandes/${demandeId}/payment`;
                body = {
                    amount,
                    method: mapMethodToBackend(paymentMethod),
                    card_data: paymentMethod === 'card' ? cardData : null,
                };
            } else {
                alert('Erreur: Aucun identifiant de paiement fourni');
                return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (response.ok) {
                onSuccess?.();
            } else {
                const errorData = await response.json();
                alert(errorData.message || errorData.error || 'Erreur lors du paiement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors du traitement du paiement');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                    <span>Paiement</span>
                    <span className="text-2xl font-bold text-amber-400">{amount}€</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Méthodes de paiement */}
                <div>
                    <Label className="text-slate-300 text-sm mb-3 block">Méthode de paiement</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { value: 'card' as const, label: 'Carte bancaire', icon: <CreditCard className="h-5 w-5" /> },
                            { value: 'cash' as const, label: 'Espèces', icon: <Banknote className="h-5 w-5" /> },
                            { value: 'mobile' as const, label: 'Mobile Money', icon: <Smartphone className="h-5 w-5" /> },
                        ].map((method) => (
                            <button
                                key={method.value}
                                onClick={() => setPaymentMethod(method.value)}
                                className={`p-3 rounded-lg border-2 transition-all text-center ${
                                    paymentMethod === method.value
                                        ? 'border-amber-500 bg-amber-500/10 text-white'
                                        : 'border-slate-600 bg-slate-700/50 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                {method.icon}
                                <p className="text-xs mt-1">{method.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Informations selon la méthode */}
                {paymentMethod === 'card' && (
                    <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
                        <div>
                            <Label className="text-slate-300 text-sm">Numéro de carte</Label>
                            <Input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardData.cardNumber}
                                onChange={(e) =>
                                    setCardData({ ...cardData, cardNumber: e.target.value })
                                }
                                maxLength={16}
                                className="bg-slate-600 border-slate-500 text-white"
                            />
                        </div>

                        <div>
                            <Label className="text-slate-300 text-sm">Titulaire</Label>
                            <Input
                                type="text"
                                placeholder="Votre nom"
                                value={cardData.cardHolder}
                                onChange={(e) =>
                                    setCardData({ ...cardData, cardHolder: e.target.value })
                                }
                                className="bg-slate-600 border-slate-500 text-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-slate-300 text-sm">Expiration (MM/YY)</Label>
                                <Input
                                    type="text"
                                    placeholder="12/25"
                                    value={cardData.expiryDate}
                                    onChange={(e) =>
                                        setCardData({ ...cardData, expiryDate: e.target.value })
                                    }
                                    maxLength={5}
                                    className="bg-slate-600 border-slate-500 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-slate-300 text-sm">CVV</Label>
                                <Input
                                    type="text"
                                    placeholder="123"
                                    value={cardData.cvv}
                                    onChange={(e) =>
                                        setCardData({ ...cardData, cvv: e.target.value })
                                    }
                                    maxLength={4}
                                    className="bg-slate-600 border-slate-500 text-white"
                                />
                            </div>
                        </div>

                        <Alert className="bg-blue-500/10 border-blue-500/30">
                            <AlertCircle className="h-4 w-4 text-blue-400" />
                            <AlertDescription className="text-blue-300 text-sm">
                                Vos données sont sécurisées avec le cryptage SSL
                            </AlertDescription>
                        </Alert>
                    </div>
                )}

                {paymentMethod === 'cash' && (
                    <Alert className="bg-green-500/10 border-green-500/30">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <AlertDescription className="text-green-300 text-sm">
                            Vous paierez en espèces au dépanneur à son arrivée
                        </AlertDescription>
                    </Alert>
                )}

                {paymentMethod === 'mobile' && (
                    <Alert className="bg-purple-500/10 border-purple-500/30">
                        <Smartphone className="h-4 w-4 text-purple-400" />
                        <AlertDescription className="text-purple-300 text-sm">
                            Une demande de paiement Mobile Money vous sera envoyée
                        </AlertDescription>
                    </Alert>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handlePayment}
                    disabled={processing || (paymentMethod === 'card' && !cardData.cardNumber)}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3"
                >
                    {processing ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Traitement...
                        </>
                    ) : (
                        <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Payer {amount}€
                        </>
                    )}
                </Button>

                {/* Safety Info */}
                <p className="text-xs text-slate-500 text-center">
                    💳 Paiement sécurisé • Pas de frais supplémentaires
                </p>
            </CardContent>
        </Card>
    );
}
