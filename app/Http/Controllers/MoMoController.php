<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Notification;
use App\Services\MoMoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Contrôleur pour l'API MTN Mobile Money
 */
class MoMoController extends Controller
{
    private MoMoService $momoService;

    public function __construct()
    {
        $this->momoService = new MoMoService();
    }

    /**
     * Initier un paiement Mobile Money
     * 
     * POST /api/momo/request-payment
     */
    public function requestPayment(Request $request)
    {
        // Validation des données
        $validated = $request->validate([
            'facture_id' => 'required|integer|exists:factures,id',
            'phone' => 'required|string|regex:/^[0-9]{8,12}$/',
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
        if (!$this->momoService->isConfigured()) {
            return response()->json([
                'success' => false,
                'error' => 'Service Mobile Money non configuré',
            ], 503);
        }

        // Récupérer la facture
        $facture = Facture::with(['intervention.demande', 'intervention.depanneur'])->find($validated['facture_id']);

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

        // Générer un ID externe unique
        $externalId = 'FACT-' . $facture->id . '-' . time();

        // Message pour le client
        $message = "Paiement facture {$facture->transactionId} - {$facture->montant}FCFA";

        // Appeler l'API MoMo
        $result = $this->momoService->requestToPay(
            $validated['phone'],
            (float) $facture->montant,
            $externalId,
            $message
        );

        if ($result['success']) {
            // Sauvegarder l'ID de transaction dans la facture
            $facture->update([
                'momo_transaction_id' => $result['transaction_id'],
                'mdePaiement' => 'mobile_money',
                'momo_phone' => $validated['phone'],
            ]);

            Log::info('MoMo payment request initiated', [
                'facture_id' => $facture->id,
                'transaction_id' => $result['transaction_id'],
                'phone' => $validated['phone'],
                'amount' => $facture->montant,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Demande de paiement envoyée',
                'transaction_id' => $result['transaction_id'],
                'status' => 'PENDING',
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'] ?? 'Erreur lors de la demande de paiement',
        ], 400);
    }

    /**
     * Vérifier le statut d'un paiement
     * 
     * GET /api/momo/check-status/{facture_id}
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

        // Vérifier si on a un ID de transaction MoMo
        if (!$facture->momo_transaction_id) {
            return response()->json([
                'success' => false,
                'error' => 'Aucune transaction Mobile Money trouvée',
            ], 400);
        }

        // Vérifier le statut via l'API MoMo
        $result = $this->momoService->getTransactionStatus($facture->momo_transaction_id);

        if ($result['success']) {
            // Mettre à jour le statut de la facture si le paiement est réussi
            if ($result['status'] === 'SUCCESS') {
                $this->processSuccessfulPayment($facture);
            }

            return response()->json([
                'success' => true,
                'status' => $result['status'],
                'reason' => $result['reason'],
            ]);
        }

        return response()->json([
            'success' => false,
            'error' => $result['error'] ?? 'Erreur lors de la vérification du statut',
        ], 400);
    }

    /**
     * Callback pour recevoir les notifications de MTN
     * 
     * POST /api/momo/callback
     */
    public function callback(Request $request)
    {
        $data = $request->all();

        // Valider le callback
        if (!$this->momoService->validateCallback($data)) {
            return response()->json(['status' => 'invalid'], 400);
        }

        Log::info('MoMo callback received', $data);

        try {
            $externalId = $data['externalId'] ?? null;
            $status = $data['status'] ?? null;

            if (!$externalId) {
                return response()->json(['status' => 'missing_external_id'], 400);
            }

            // Extraire l'ID de la facture depuis externalId
            // Format: FACT-{id}-{timestamp}
            if (str_starts_with($externalId, 'FACT-')) {
                $parts = explode('-', $externalId);
                $factureId = $parts[1] ?? null;

                if ($factureId) {
                    $facture = Facture::find($factureId);

                    if ($facture) {
                        if ($status === 'SUCCESSFUL') {
                            $this->processSuccessfulPayment($facture);
                        } elseif ($status === 'FAILED') {
                            $facture->update([
                                'momo_status' => 'FAILED',
                                'momo_failure_reason' => $data['reason'] ?? 'Paiement échoué',
                            ]);
                        }

                        Log::info('MoMo callback processed', [
                            'facture_id' => $factureId,
                            'status' => $status,
                        ]);
                    }
                }
            }

            return response()->json(['status' => 'received']);

        } catch (\Exception $e) {
            Log::error('MoMo callback error: ' . $e->getMessage());
            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * Traiter un paiement réussi
     */
    private function processSuccessfulPayment(Facture $facture): void
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
                'momo_status' => 'SUCCESS',
            ]);

            // Notifier le dépanneur
            Notification::create([
                'message' => 'Paiement reçu pour la facture ' . $facture->transactionId . ' - Montant : ' . $facture->montant . 'FCFA',
                'type' => 'paiement_recu',
                'id_depanneur' => $facture->intervention->id_depanneur,
            ]);

            DB::commit();

            Log::info('Paiement Mobile Money confirmé', [
                'facture_id' => $facture->id,
                'transaction_id' => $facture->momo_transaction_id,
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
     * GET /api/momo/status
     */
    public function status()
    {
        return response()->json([
            'configured' => $this->momoService->isConfigured(),
            'environment' => config('momo.environment'),
        ]);
    }
}

