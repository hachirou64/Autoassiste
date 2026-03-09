<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Notification;
use App\Services\FedaPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Contrôleur pour l'API FedaPay Payment Gateway
 */
class FedaPayController extends Controller
{
    private FedaPayService $fedaPayService;

    public function __construct()
    {
        $this->fedaPayService = new FedaPayService();
    }

    /**
     * Créer une transaction de paiement
     * 
     * POST /api/fedapay/create-payment
     */
    public function createPayment(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'facture_id' => 'required|integer|exists:factures,id',
        ]);

        // Vérifier que l'utilisateur est connecté
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Non authentifié',
            ], 401);
        }

        // Vérifier que le service est configuré
        if (!$this->fedaPayService->isConfigured()) {
            return response()->json([
                'success' => false,
                'error' => 'Service de paiement non configuré',
                'configured' => false,
            ], 503);
        }

        // Récupérer la facture
        $facture = Facture::with(['intervention.demande.client', 'intervention.depanneur'])->find($validated['facture_id']);

        // Vérifier que la facture appartient au client
        if (!$user->client || $facture->intervention->demande->id_client !== $user->client->id) {
            return response()->json([
                'success' => false,
                'error' => 'Accès non autorisé',
            ], 403);
        }

        // Vérifier que la facture n'est pas déjà payée
        if ($facture->status === 'payee') {
            return response()->json([
                'success' => false,
                'error' => 'Cette facture a déjà été payée',
            ], 400);
        }

        // Préparer les données du client
        $client = $facture->intervention->demande->client;

        // Créer la transaction FedaPay
        $result = $this->fedaPayService->createTransaction([
            'amount' => (int) $facture->montant,
            'currency' => 'XOF',
            'description' => "Paiement facture {$facture->transactionId}",
            'facture_id' => $facture->id,
            'intervention_id' => $facture->intervention->id,
            'customer_email' => $client->email,
            'customer_firstname' => explode(' ', $client->fullName)[0] ?? '',
            'customer_lastname' => implode(' ', array_slice(explode(' ', $client->fullName), 1)) ?? '',
            'customer_phone' => $client->phone ?? '',
        ]);

        if ($result['success']) {
            // Sauvegarder l'ID de transaction FedaPay
            $facture->update([
                'fedapay_transaction_id' => $result['transaction']['id'],
                'mdePaiement' => 'mobile_money',
            ]);

            Log::info('FedaPay payment created', [
                'facture_id' => $facture->id,
                'fedapay_transaction_id' => $result['transaction']['id'],
            ]);

            return response()->json([
                'success' => true,
                'payment_url' => $result['transaction']['url'],
                'transaction_id' => $result['transaction']['id'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'] ?? 'Erreur lors de la création du paiement',
        ], 400);
    }

    /**
     * Vérifier le statut d'un paiement
     * 
     * GET /api/fedapay/check-status/{facture_id}
     */
    public function checkStatus(Request $request, int $factureId)
    {
        // Vérifier que l'utilisateur est connecté
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Non authentifié',
            ], 401);
        }

        // Récupérer la facture
        $facture = Facture::find($factureId);

        if (!$facture) {
            return response()->json([
                'success' => false,
                'error' => 'Facture non trouvée',
            ], 404);
        }

        // Vérifier que la facture appartient au client
        if (!$user->client) {
            return response()->json([
                'success' => false,
                'error' => 'Accès non autorisé',
            ], 403);
        }

        $facture->load('intervention.demande');
        if ($facture->intervention->demande->id_client !== $user->client->id) {
            return response()->json([
                'success' => false,
                'error' => 'Accès non autorisé',
            ], 403);
        }

        // Vérifier si on a un ID de transaction FedaPay
        if (!$facture->fedapay_transaction_id) {
            return response()->json([
                'success' => false,
                'error' => 'Aucune transaction trouvée',
            ], 400);
        }

        // Vérifier le statut via FedaPay
        $result = $this->fedaPayService->getTransactionStatus($facture->fedapay_transaction_id);

        if ($result['success']) {
            // Mettre à jour le statut de la facture si le paiement est réussi
            $mappedStatus = $this->fedaPayService->mapStatus($result['status']);
            
            if ($mappedStatus === 'SUCCESS' && $facture->status !== 'payee') {
                $this->processSuccessfulPayment($facture);
            }

            return response()->json([
                'success' => true,
                'status' => $mappedStatus,
                'fedapay_status' => $result['status'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'] ?? 'Erreur lors de la vérification du statut',
        ], 400);
    }

    /**
     * Callback pour recevoir les notifications de FedaPay (Webhook)
     * 
     * POST /api/fedapay/callback
     */
    public function callback(Request $request)
    {
        $data = $request->all();

        Log::info('FedaPay callback received', $data);

        // Traiter le webhook
        $result = $this->fedaPayService->processWebhook($data);

        if (!$result['success']) {
            return response()->json(['status' => 'error'], 400);
        }

        // Traiter selon le statut
        $status = $result['status'];
        $factureId = $result['facture_id'];
        $transactionId = $result['transaction_id'];

        if ($factureId) {
            $facture = Facture::find($factureId);

            if ($facture) {
                if ($status === 'SUCCESS') {
                    $this->processSuccessfulPayment($facture, $transactionId);
                } elseif ($status === 'FAILED') {
                    $facture->update([
                        'fedapay_status' => 'failed',
                    ]);
                }

                Log::info('FedaPay callback processed', [
                    'facture_id' => $factureId,
                    'status' => $status,
                ]);
            }
        }

        return response()->json(['status' => 'received']);
    }

    /**
     * Page de retour après paiement (depuis FedaPay)
     * 
     * GET /api/fedapay/return
     */
    public function returnPage(Request $request)
    {
        $status = $request->query('status');
        $transactionId = $request->query('transaction_id');

        Log::info('FedaPay return page', [
            'status' => $status,
            'transaction_id' => $transactionId,
        ]);

        // Rediriger vers le dashboard avec le résultat
        if ($status === 'approved' || $status === 'success') {
            return redirect('/client/dashboard?payment=success');
        }

        return redirect('/client/dashboard?payment=cancelled');
    }

    /**
     * Traiter un paiement réussi
     */
    private function processSuccessfulPayment(Facture $facture, ?string $transactionId = null): void
    {
        // Vérifier si la facture n'a pas déjà été payée
        if ($facture->status === 'payee') {
            Log::info('Facture déjà payée, ignorée', ['facture_id' => $facture->id]);
            return;
        }

        DB::beginTransaction();

        try {
            // Marquer la facture comme payée
            $facture->update([
                'status' => 'payee',
                'paidAt' => now(),
                'fedapay_status' => 'success',
            ]);

            // Notifier le dépanneur
            Notification::create([
                'message' => 'Paiement reçu pour la facture ' . $facture->transactionId . ' - Montant : ' . $facture->montant . 'FCFA',
                'type' => 'paiement_recu',
                'id_depanneur' => $facture->intervention->id_depanneur,
            ]);

            DB::commit();

            Log::info('Paiement FedaPay confirmé', [
                'facture_id' => $facture->id,
                'transaction_id' => $transactionId ?? $facture->fedapay_transaction_id,
                'amount' => $facture->montant,
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Erreur lors du traitement du paiement: ' . $e->getMessage());
        }
    }

    /**
     * Vérifier si le service est configuré
     * 
     * GET /api/fedapay/status
     */
    public function status()
    {
        return response()->json([
            'configured' => $this->fedaPayService->isConfigured(),
            'environment' => config('fedapay.environment'),
        ]);
    }
}

