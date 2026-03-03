<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {{ $facture->transactionId }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #333; background: #fff; padding: 20px; }
        .invoice-container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #4f46e5; }
        .logo { font-size: 28px; font-weight: bold; color: #4f46e5; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 32px; color: #4f46e5; margin-bottom: 5px; }
        .invoice-number { font-size: 16px; color: #666; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { width: 45%; }
        .info-box h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 10px; letter-spacing: 1px; }
        .info-box p { margin-bottom: 5px; }
        .info-box .name { font-weight: bold; font-size: 16px; }
        .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
        .status-payee { background: #d1fae5; color: #065f46; }
        .status-en_attente { background: #fef3c7; color: #92400e; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        .text-right { text-align: right; }
        .total-row { background: #f9fafb; font-weight: bold; }
        .total-row td { font-size: 18px; border-bottom: none; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
        .payment-info { background: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .payment-info h3 { font-size: 14px; margin-bottom: 10px; color: #333; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="logo">🚗 AutoAssiste</div>
            <div class="invoice-title">
                <h1>FACTURE</h1>
                <p class="invoice-number">{{ $facture->transactionId }}</p>
                <span class="status-badge status-{{ $facture->status }}">{{ $facture->statut_label }}</span>
            </div>
        <div class="info-section">
            <div class="info-box">
                <h3>Client</h3>
                <p class="name">{{ $facture->intervention->demande->client->fullName }}</p>
                <p>{{ $facture->intervention->demande->client->email }}</p>
                <p>{{ $facture->intervention->demande->client->phone }}</p>
            </div>
            <div class="info-box">
                <h3>Dépanneur</h3>
                <p class="name">{{ $facture->intervention->depanneur->etablissement_name }}</p>
                <p>{{ $facture->intervention->depanneur->promoteur_name }}</p>
                <p>IFU: {{ $facture->intervention->depanneur->IFU ?? 'N/A' }}</p>
            </div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th class="text-right">Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Intervention #{{ $facture->intervention->id }}</strong><br><small>{{ $facture->intervention->demande->typePanne ?? 'Dépannage' }}</small></td>
                    <td>{{ $facture->intervention->createdAt->format('d/m/Y') }}</td>
                    <td class="text-right">{{ number_format($facture->intervention->coutTotal, 0, ',', ' ') }} CFA</td>
                </tr>
                <tr>
                    <td><strong>Pièces remplacées</strong><br><small>{{ $facture->intervention->piecesremplacees ?? 'Aucune' }}</small></td>
                    <td>-</td>
                    <td class="text-right">{{ number_format($facture->intervention->coutPiece, 0, ',', ' ') }} CFA</td>
                </tr>
                <tr>
                    <td><strong>Main d'œuvre</strong></td>
                    <td>-</td>
                    <td class="text-right">{{ number_format($facture->intervention->coutMainOeuvre, 0, ',', ' ') }} CFA</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2"><strong>Total</strong></td>
                    <td class="text-right"><strong>{{ number_format($facture->montant, 0, ',', ' ') }} CFA</strong></td>
                </tr>
            </tbody>
        </table>
        @if($facture->mdePaiement)
        <div class="payment-info">
            <h3>💳 Informations de paiement</h3>
            <p><strong>Mode de paiement:</strong> {{ $facture->mde_paiement_label }}</p>
            @if($facture->paidAt)
            <p><strong>Date de paiement:</strong> {{ $facture->paidAt->format('d/m/Y à H:i') }}</p>
            @endif
        </div>
        @endif
        <div class="footer">
            <p>Facture générée le {{ now()->format('d/m/Y à H:i') }}</p>
            <p>AutoAssiste - Votre partenaire de confiance pour le dépannage automobile</p>
        </div>
</body>
</html>
