<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * MTN Mobile Money (MoMo) API Service - Benin
 * 
 * Documentation: https://momodeveloper.mtn.com/
 * API: Collection API (Request to Pay)
 */
class MoMoService
{
    private string $environment;
    private string $baseUrl;
    private string $clientId;
    private string $clientSecret;
    private string $subscriptionKey;
    private string $country;
    private string $currency;
    private ?string $accessToken = null;
    private ?string $tokenExpiry = null;

    public function __construct()
    {
        $this->environment = config('momo.environment', 'sandbox');
        $this->baseUrl = config('momo.benin.base_url', 'https://sandbox.momodeveloper.mtn.com');
        $this->clientId = config('momo.client_id', '');
        $this->clientSecret = config('momo.client_secret', '');
        $this->subscriptionKey = config('momo.subscription_key', '');
        $this->country = config('momo.benin.country', 'BEN');
        $this->currency = config('momo.benin.currency', 'XOF');
    }

    /**
     * Obtenir le token d'accès à l'API
     */
    public function getAccessToken(): ?string
    {
        // Vérifier si le token existant est encore valide
        if ($this->accessToken && $this->tokenExpiry && now()->lessThan($this->tokenExpiry)) {
            return $this->accessToken;
        }

        try {
            $response = Http::withHeaders([
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ])
            ->withBasicAuth($this->clientId, $this->clientSecret)
            ->asForm()
            ->post("{$this->baseUrl}/collection/token/2.0.0", [
                'grant_type' => 'client_credentials',
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->accessToken = $data['access_token'];
                // Définir l'expiration (par défaut 3600 secondes, moins 60 secondes de marge)
                $expiresIn = $data['expires_in'] ?? 3600;
                $this->tokenExpiry = now()->addSeconds($expiresIn - 60);
                
                Log::info('MoMo access token obtained successfully');
                return $this->accessToken;
            }

            Log::error('MoMo failed to get access token', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return null;

        } catch (Exception $e) {
            Log::error('MoMo exception getting access token: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Demander un paiement (Request to Pay)
     * 
     * @param string $phone Numéro de téléphone du client (format: 229XXXXXXXX)
     * @param float $amount Montant en XOF
     * @param string $externalId Identifiant externe unique
     * @param string $message Message pour le client
     * @return array{success: bool, transaction_id?: string, error?: string, status?: string}
     */
    public function requestToPay(string $phone, float $amount, string $externalId, string $message = 'Paiement AutoAssiste'): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return [
                'success' => false,
                'error' => 'Impossible d\'obtenir le token d\'authentification',
            ];
        }

        // Formater le numéro de téléphone
        $phone = $this->formatPhoneNumber($phone);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'X-Target-Environment' => $this->environment,
                'Content-Type' => 'application/json',
            ])
            ->timeout(config('momo.timeouts.request_to_pay', 30))
            ->post("{$this->baseUrl}/collection/v2_0/requesttopay", [
                'amount' => (string) $amount,
                'currency' => $this->currency,
                'externalId' => $externalId,
                'payer' => [
                    'partyIdType' => 'MSISDN',
                    'partyId' => $phone,
                ],
                'payerMessage' => $message,
                'payeeNote' => $message,
            ]);

            if ($response->successful() || $response->status() === 202) {
                // Récupérer l'ID de transaction depuis les headers
                $transactionId = $response->header('X-Reference-Id') ?? $externalId;
                
                Log::info('MoMo request to pay initiated', [
                    'transaction_id' => $transactionId,
                    'phone' => $phone,
                    'amount' => $amount,
                ]);

                return [
                    'success' => true,
                    'transaction_id' => $transactionId,
                    'status' => 'PENDING',
                ];
            }

            $errorBody = $response->json();
            Log::error('MoMo request to pay failed', [
                'status' => $response->status(),
                'body' => $response->body(),
                'error' => $errorBody,
            ]);

            return [
                'success' => false,
                'error' => $errorBody['error'] ?? $errorBody['message'] ?? 'Erreur lors de la demande de paiement',
                'status_code' => $response->status(),
            ];

        } catch (Exception $e) {
            Log::error('MoMo exception during request to pay: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Vérifier le statut d'une transaction
     * 
     * @param string $transactionId ID de la transaction
     * @return array{success: bool, status?: string, reason?: string, error?: string}
     */
    public function getTransactionStatus(string $transactionId): array
    {
        $token = $this->getAccessToken();
        
        if (!$token) {
            return [
                'success' => false,
                'error' => 'Impossible d\'obtenir le token d\'authentification',
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $token,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'X-Target-Environment' => $this->environment,
            ])
            ->timeout(config('momo.timeouts.get_status', 10))
            ->get("{$this->baseUrl}/collection/v2_0/requesttopay/{$transactionId}");

            if ($response->successful()) {
                $data = $response->json();
                
                $status = $this->mapStatus($data['status'] ?? 'UNKNOWN');
                
                Log::info('MoMo transaction status retrieved', [
                    'transaction_id' => $transactionId,
                    'status' => $status,
                ]);

                return [
                    'success' => true,
                    'status' => $status,
                    'reason' => $data['reason'] ?? null,
                    'amount' => $data['amount'] ?? null,
                    'currency' => $data['currency'] ?? null,
                    'payer_message' => $data['payerMessage'] ?? null,
                    'created_at' => $data['creationDate'] ?? null,
                ];
            }

            Log::error('MoMo get transaction status failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'error' => 'Impossible de récupérer le statut de la transaction',
                'status_code' => $response->status(),
            ];

        } catch (Exception $e) {
            Log::error('MoMo exception getting transaction status: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Exception: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Valider le callback de MTN
     * 
     * @param array $data Données du callback
     * @return bool
     */
    public function validateCallback(array $data): bool
    {
        // Vérifier la présence des champs requis
        if (!isset($data['externalId']) || !isset($data['amount'])) {
            Log::warning('MoMo callback missing required fields', $data);
            return false;
        }

        // Log le callback pour debugging
        Log::info('MoMo callback received', $data);

        return true;
    }

    /**
     * Formater le numéro de téléphone au format attendu par MTN
     * 
     * @param string $phone
     * @return string
     */
    private function formatPhoneNumber(string $phone): string
    {
        // Enlever tous les caractères non numériques
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // Si ça commence par 0, le remplacer par 229
        if (str_starts_with($phone, '0')) {
            $phone = '229' . substr($phone, 1);
        }
        // Si ça commence par +, l'enlever
        elseif (str_starts_with($phone, '+')) {
            $phone = substr($phone, 1);
        }
        // Si ça ne commence pas par 229, ajouter le préfixe
        elseif (!str_starts_with($phone, '229')) {
            $phone = '229' . $phone;
        }

        return $phone;
    }

    /**
     * Mapper le statut MTN vers un statut standard
     * 
     * @param string $status
     * @return string
     */
    private function mapStatus(string $status): string
    {
        return match ($status) {
            'SUCCESSFUL' => 'SUCCESS',
            'FAILED' => 'FAILED',
            'PENDING', 'PROCESSING' => 'PENDING',
            default => 'UNKNOWN',
        };
    }

    /**
     * Vérifier si le service est configuré
     * 
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->clientId) 
            && !empty($this->clientSecret) 
            && !empty($this->subscriptionKey);
    }
}

