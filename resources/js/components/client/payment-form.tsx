import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Smartphone, Banknote, AlertCircle, Loader2, CheckCircle, XCircle, Timer, ExternalLink } from 'lucide-react';

interface PaymentFormProps {
    amount: number;
    factureId?: number;
    demandeId?: number;
    onSuccess?: () => void;
    isLoading?: boolean;
}

type PaymentMethod = 'card' | 'cash' | 'mobile';
type PaymentStatus = 'idle' | 'pending' | 'processing' | 'success' | 'failed';

export function PaymentForm({
    amount,
    factureId,
    demandeId,
    onSuccess,
    isLoading = false,
}: PaymentFormProps) {
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile');
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
    });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [processing, setProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

    // Reset status when method changes
    useEffect(() => {
        setPaymentStatus('idle');
        setErrorMessage(null);
        setTransactionId(null);
        setPaymentUrl(null);
    }, [paymentMethod]);

    // Polling pour vérifier le statut du paiement
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (paymentStatus === 'pending' && transactionId && factureId) {
            interval = setInterval(async () => {
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                    const response = await fetch(`/api/fedapay/check-status/${factureId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        credentials: 'include',
                    });

                    const result = await response.json();

                    if (result.success) {
                        if (result.status === 'SUCCESS') {
                            setPaymentStatus('success');
                            clearInterval(interval);
                            setTimeout(() => {
                                onSuccess?.();
                            }, 2000);
                        } else if (result.status === 'FAILED') {
                            setPaymentStatus('failed');
                            setErrorMessage(result.reason || 'Paiement échoué');
                            clearInterval(interval);
                        }
                    }
                } catch (error) {
                    console.error('Erreur lors de la vérification du statut:', error);
                }
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [paymentStatus, transactionId, factureId, onSuccess]);

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
        setErrorMessage(null);

        try {
            // Pour Mobile Money avec FedaPay
            if (paymentMethod === 'mobile' && factureId) {
                // Essayer d'abord FedaPay, sinon revenir à l'API locale
                try {
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                    
                    // Vérifier si FedaPay est configuré
                    const statusResponse = await fetch('/api/fedapay/status', {
                        method: 'GET',
                        credentials: 'include',
                    });
                    const statusData = await statusResponse.json();

                    if (statusData.configured) {
                        // Utiliser FedaPay
                        const response = await fetch('/api/fedapay/create-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                            },
                            credentials: 'include',
                            body: JSON.stringify({
                                facture_id: factureId,
                            }),
                        });

                        const result = await response.json();

                        if (result.success) {
                            setPaymentStatus('pending');
                            setTransactionId(result.transaction_id);
                            // Rediriger vers la page de paiement FedaPay
                            if (result.payment_url) {
                                setPaymentUrl(result.payment_url);
                                // Optionnel: automatiquement rediriger
                                // window.location.href = result.payment_url;
                            }
                        } else {
                            setPaymentStatus('failed');
                            setErrorMessage(result.error || 'Erreur lors de la création du paiement');
                        }
                        
                        setProcessing(false);
                        return;
                    }
                } catch (e) {
                    console.log('FedaPay non disponible, utilisation de l\'API locale');
                }

                // Revenir à l'API locale si FedaPay n'est pas configuré
                if (!phoneNumber || phoneNumber.length < 8) {
                    setErrorMessage('Veuillez entrer un numéro de téléphone valide');
                    setProcessing(false);
                    return;
                }

                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                const response = await fetch('/api/momo/request-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        facture_id: factureId,
                        phone: phoneNumber,
                    }),
                });

                const result = await response.json();

                if (result.success) {
                    setPaymentStatus('pending');
                    setTransactionId(result.transaction_id);
                } else {
                    setPaymentStatus('failed');
                    setErrorMessage(result.error || 'Erreur lors de la demande de paiement');
                }
                
                setProcessing(false);
                return;
            }

            // Pour les autres méthodes (card, cash), utiliser l'API existante
            let endpoint = '';
            let body: Record<string, unknown> = {};

            if (factureId) {
                endpoint = `/api/client/factures/${factureId}/payer`;
                body = {
                    method: mapMethodToBackend(paymentMethod),
                };
            } else if (demandeId) {
                endpoint = `/api/demandes/${demandeId}/payment`;
                body = {
                    amount,
                    method: mapMethodToBackend(paymentMethod),
                    card_data: paymentMethod === 'card' ? cardData : null,
                };
            } else {
                alert('Erreur: Aucun identifiant de paiement fourni');
                setProcessing(false);
                return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'include',
                body: JSON.stringify(body),
            });

            if (response.ok) {
                onSuccess?.();
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || errorData.error || 'Erreur lors du paiement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setErrorMessage('Erreur lors du traitement du paiement');
        } finally {
            setProcessing(false);
        }
    };

    // Formater le numéro de téléphone
    const formatPhoneNumber = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 4) return `${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
        if (cleaned.length <= 6) return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4)}`;
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    // Rediriger vers FedaPay
    const redirectToPayment = () => {
        if (paymentUrl) {
            window.location.href = paymentUrl;
        }
    };

    return (
        <Card className="bg-slate-50 border-slate-200">
            <CardHeader>
                <CardTitle className="text-slate-900 flex items-center justify-between">
                    <span>Paiement</span>
                    <span className="text-2xl font-bold text-amber-600">{amount.toLocaleString('fr-FR')} CFA</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Statut du paiement */}
                {paymentStatus === 'pending' && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <Timer className="h-4 w-4 text-blue-600 animate-pulse" />
                        <AlertDescription className="text-blue-700 text-sm">
                            {paymentUrl ? (
                                <>
                                    <strong>Redirection vers le paiement...</strong><br />
                                    Cliquez sur le bouton ci-dessous pour finaliser votre paiement.
                                </>
                            ) : (
                                <>
                                    <strong>En attente de confirmation</strong><br />
                                    Veuillez valider le paiement sur votre téléphone.
                                </>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {paymentStatus === 'success' && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700 text-sm">
                            <strong>Paiement confirmé!</strong><br />
                            Redirection en cours...
                        </AlertDescription>
                    </Alert>
                )}

                {paymentStatus === 'failed' && (
                    <Alert className="bg-red-50 border-red-200">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 text-sm">
                            <strong>Paiement échoué</strong><br />
                            {errorMessage || 'Veuillez réessayer ou choisir un autre moyen de paiement.'}
                        </AlertDescription>
                    </Alert>
                )}

                {errorMessage && paymentStatus === 'idle' && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 text-sm">
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Bouton de redirection FedaPay */}
                {paymentUrl && paymentStatus === 'pending' && (
                    <Button
                        onClick={redirectToPayment}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4"
                    >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Payer maintenant sur FedaPay
                    </Button>
                )}

                {/* Méthodes de paiement */}
                {!paymentUrl && paymentStatus === 'idle' && (
                    <>
                        <div>
                            <Label className="text-slate-700 text-sm mb-3 block">Méthode de paiement</Label>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'mobile' as const, label: 'Mobile Money', icon: <Smartphone className="h-5 w-5" />, desc: 'MTN/Moov' },
                                    { value: 'cash' as const, label: 'Espèces', icon: <Banknote className="h-5 w-5" />, desc: 'Sur place' },
                                    { value: 'card' as const, label: 'Carte', icon: <CreditCard className="h-5 w-5" />, desc: 'Visa/Mastercard' },
                                ].map((method) => (
                                    <button
                                        key={method.value}
                                        onClick={() => setPaymentMethod(method.value)}
                                        className={`p-3 rounded-lg border-2 transition-all text-center ${
                                            paymentMethod === method.value
                                                ? 'border-amber-500 bg-amber-50 text-slate-900'
                                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {method.icon}
                                        <p className="text-xs mt-1 font-medium">{method.label}</p>
                                        <p className="text-[10px] text-slate-400">{method.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Informations selon la méthode */}
                        {paymentMethod === 'card' && (
                            <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
                                <div>
                                    <Label className="text-slate-700 text-sm">Numéro de carte</Label>
                                    <Input
                                        type="text"
                                        placeholder="1234 5678 9012 3456"
                                        value={cardData.cardNumber}
                                        onChange={(e) =>
                                            setCardData({ ...cardData, cardNumber: e.target.value })
                                        }
                                        maxLength={16}
                                        className="bg-white border-slate-300 text-slate-900"
                                    />
                                </div>

                                <div>
                                    <Label className="text-slate-700 text-sm">Titulaire</Label>
                                    <Input
                                        type="text"
                                        placeholder="Votre nom"
                                        value={cardData.cardHolder}
                                        onChange={(e) =>
                                            setCardData({ ...cardData, cardHolder: e.target.value })
                                        }
                                        className="bg-white border-slate-300 text-slate-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-slate-700 text-sm">Expiration</Label>
                                        <Input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardData.expiryDate}
                                            onChange={(e) =>
                                                setCardData({ ...cardData, expiryDate: e.target.value })
                                            }
                                            maxLength={5}
                                            className="bg-white border-slate-300 text-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-slate-700 text-sm">CVV</Label>
                                        <Input
                                            type="text"
                                            placeholder="123"
                                            value={cardData.cvv}
                                            onChange={(e) =>
                                                setCardData({ ...cardData, cvv: e.target.value })
                                            }
                                            maxLength={4}
                                            className="bg-white border-slate-300 text-slate-900"
                                        />
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertCircle className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-700 text-sm">
                                        Paiement sécurisé par FedaPay
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {paymentMethod === 'cash' && (
                            <Alert className="bg-green-50 border-green-200">
                                <Banknote className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700 text-sm">
                                    Vous paierez en espèces au dépanneur à son arrivée
                                </AlertDescription>
                            </Alert>
                        )}

                        {paymentMethod === 'mobile' && (
                            <div className="space-y-3 p-4 bg-white rounded-lg border border-slate-200">
                                <div>
                                    <Label className="text-slate-700 text-sm">Numéro Mobile Money</Label>
                                    <Input
                                        type="tel"
                                        placeholder="22x xxx xx xx"
                                        value={phoneNumber}
                                        onChange={handlePhoneChange}
                                        maxLength={11}
                                        className="bg-white border-slate-300 text-slate-900 text-lg"
                                    />
                                </div>

                                <Alert className="bg-purple-50 border-purple-200">
                                    <Smartphone className="h-4 w-4 text-purple-600" />
                                    <AlertDescription className="text-purple-700 text-sm">
                                        Une demande de paiement sera envoyée. Paiement sécurisé par FedaPay.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            onClick={handlePayment}
                            disabled={processing || (paymentMethod === 'card' && !cardData.cardNumber)}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    {paymentMethod === 'mobile' ? <Smartphone className="h-4 w-4 mr-2" /> : 
                                     paymentMethod === 'cash' ? <Banknote className="h-4 w-4 mr-2" /> : 
                                     <CreditCard className="h-4 w-4 mr-2" />}
                                    Payer {amount.toLocaleString('fr-FR')} CFA
                                </>
                            )}
                        </Button>

                        <p className="text-xs text-slate-500 text-center">
                            🔒 Paiement sécurisé par FedaPay • Pas de frais supplémentaires
                        </p>
                    </>
                )}

                {/* Status-based buttons */}
                {paymentStatus === 'pending' && !paymentUrl && (
                    <Button
                        onClick={() => setPaymentStatus('idle')}
                        variant="outline"
                        className="w-full border-slate-300 text-slate-700"
                    >
                        Annuler et réessayer
                    </Button>
                )}

                {paymentStatus === 'failed' && (
                    <Button
                        onClick={() => {
                            setPaymentStatus('idle');
                            setErrorMessage(null);
                            setPaymentUrl(null);
                        }}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3"
                    >
                        Réessayer le paiement
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
