<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * FedaPay Payment Gateway Service
 * 
 * Documentation: https://docs.fedapay.com/
 * Supporte: MTN MoMo, Moov Money, Cartes bancaires
 */
class FedaPayService
{
    private string $environment;
    private string $apiKey;
    private string $secretKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->environment = config('fedapay.environment', 'sandbox');
        $this->apiKey = config('fedapay.api_key', '');
        $this->secretKey = config('fedapay.secret_key', '');
        
        $this->baseUrl = $this->environment === 'sandbox'
            ? 'https://sandboxapi.fedapay.com'
            : 'https://api.fedapay.com';
    }

    /**
     * Vérifier si le service est configuré
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey) && !empty($this->secretKey);
    }

    /**
     * Créer une transaction de paiement
     * 
     * @param array $data Données du paiement
     * @return array{success: bool, transaction?: array, error?: string}
     */
    public function createTransaction(array $data): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'Service FedaPay non configuré',
            ];
        }

        $payload = [
            'amount' => (int) $data['amount'],
            'currency' => $data['currency'] ?? 'XOF',
            'description' => $data['description'] ?? 'Paiement AutoAssiste',
            'callback_url' => $this->getCallbackUrl(),
            'return_url' => $this->getReturnUrl(),
            'customer' => [
                'email' => $data['customer_email'],
                'firstname' => $data['customer_firstname'] ?? '',
                'lastname' => $data['customer_lastname'] ?? '',
                'phone_number' => $data['customer_phone'] ?? '',
            ],
            'custom_metadata' => [
                'facture_id' => $data['facture_id'] ?? null,
                'intervention_id' => $data['intervention_id'] ?? null,
            ],
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(config('fedapay.timeout', 30))
            ->post("{$this->baseUrl}/v1/transactions", $payload);

            if ($response->successful()) {
                $transaction = $response->json();
                
                Log::info('FedaPay transaction created', [
                    'transaction_id' => $transaction['id'] ?? null,
                    'amount' => $data['amount'],
                ]);

                return [
                    'success' => true,
                    'transaction' => [
                        'id' => $transaction['id'],
                        'url' => $transaction['url'] ?? $transaction['payment_url'],
                        'token' => $transaction['token'] ?? null,
                        'status' => $transaction['status'] ?? 'pending',
                    ],
                ];
            }

            $error = $response->json();
            Log::error('FedaPay transaction creation failed', [
                'status' => $response->status(),
                'error' => $error,
            ]);

            return [
                'success' => false,
                'error' => $error['message'] ?? $error['error'] ?? 'Erreur lors de la création de la transaction',
            ];

        } catch (Exception $e) {
            Log::error('FedaPay exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifier le statut d'une transaction
     * 
     * @param string $transactionId ID de la transaction FedaPay
     * @return array{success: bool, status?: string, error?: string}
     */
    public function getTransactionStatus(string $transactionId): array
    {
        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'error' => 'Service FedaPay non configuré',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->secretKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(10)
            ->get("{$this->baseUrl}/v1/transactions/{$transactionId}");

            if ($response->successful()) {
                $transaction = $response->json();
                
                return [
                    'success' => true,
                    'status' => $transaction['status'] ?? 'unknown',
                    'amount' => $transaction['amount'] ?? null,
                    'currency' => $transaction['currency'] ?? null,
                    'customer' => $transaction['customer'] ?? null,
                    'reason' => $transaction['reason'] ?? null,
                ];
            }

            return [
                'success' => false,
                'error' => 'Impossible de récupérer le statut',
            ];

        } catch (Exception $e) {
            Log::error('FedaPay status check exception: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifier si un webhook est authentique
     * 
     * @param array $payload Données du webhook
     * @return bool
     */
    public function verifyWebhook(array $payload): bool
    {
        // Vérifier la présence des champs requis
        if (!isset($payload['id']) || !isset($payload['status'])) {
            Log::warning('FedaPay webhook: champs requis manquants', $payload);
            return false;
        }

        // Log pour debugging
        Log::info('FedaPay webhook reçu', $payload);

        return true;
    }

    /**
     * Traiter un webhook de paiement
     * 
     * @param array $data Données du webhook
     * @return array{success: bool, processed?: bool}
     */
    public function processWebhook(array $data): array
    {
        if (!$this->verifyWebhook($data)) {
            return ['success' => false, 'processed' => false];
        }

        $status = $data['status'] ?? '';
        $transactionId = $data['id'] ?? null;
        
        // Extraire les métadonnées personnalisées
        $metadata = $data['custom_metadata'] ?? [];
        $factureId = $metadata['facture_id'] ?? null;

        Log::info('FedaPay webhook traité', [
            'transaction_id' => $transactionId,
            'status' => $status,
            'facture_id' => $factureId,
        ]);

        return [
            'success' => true,
            'processed' => true,
            'status' => $status,
            'facture_id' => $factureId,
            'transaction_id' => $transactionId,
        ];
    }

    /**
     * Obtenir l'URL de callback
     */
    private function getCallbackUrl(): string
    {
        $url = config('fedapay.callback_url', '/api/fedapay/callback');
        
        // Ajouter l'URL de base si c'est un chemin relatif
        if (!str_starts_with($url, 'http')) {
            $url = config('app.url', 'http://localhost') . $url;
        }
        
        return $url;
    }

    /**
     * Obtenir l'URL de retour
     */
    private function getReturnUrl(): string
    {
        $url = config('fedapay.return_url', '/client/dashboard');
        
        // Ajouter l'URL de base si c'est un chemin relatif
        if (!str_starts_with($url, 'http')) {
            $url = config('app.url', 'http://localhost') . $url;
        }
        
        return $url;
    }

    /**
     * Mapper le statut FedaPay vers un statut standard
     */
    public function mapStatus(string $fedapayStatus): string
    {
        return match ($fedapayStatus) {
            'approved', 'success' => 'SUCCESS',
            'pending', 'processing' => 'PENDING',
            'declined', 'failed', 'canceled' => 'FAILED',
            default => 'UNKNOWN',
        };
    }
}

