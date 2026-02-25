<?php

namespace App\Services;

use App\Models\Client;
use App\Models\Depanneur;
use App\Models\Utilisateur;
use App\Models\Notification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Mail\WelcomeClient;
use App\Mail\WelcomeDepanneur;
use App\Mail\AccountCreatedByAdmin;

class NotificationService
{
    /**
     * Types de notification
     */
    const TYPE_CLIENT = 'client';
    const TYPE_DEPANNEUR = 'depanneur';
    const TYPE_ADMIN = 'admin';

    /**
     * Vérifier si les notifications sont activées
     */
    public function isEnabled(): bool
    {
        return config('notification.enabled', true);
    }

    /**
     * Envoyer un email de bienvenue
     */
    public function sendWelcomeEmail(Utilisateur $user, string $type): bool
    {
        // Vérifier si les emails sont activés
        if (!config('notification.email.enabled', true)) {
            Log::info("Email désactivé, envoi ignoré pour: {$user->email}");
            return false;
        }

        try {
            $mailClass = $this->getWelcomeMailClass($type);
            
            if (!$mailClass) {
                Log::warning("No mail class found for type: {$type}");
                return false;
            }

            Mail::to($user->email)->send(new $mailClass($user));
            Log::info("Welcome email sent to: {$user->email}");
            return true;
        } catch (\Exception $e) {
            Log::error("Failed to send welcome email: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer un SMS de bienvenue
     */
    public function sendWelcomeSMS(Utilisateur $user, string $type): bool
    {
        // Vérifier si les SMS sont activés
        if (!config('notification.sms.enabled', false)) {
            Log::info("SMS désactivé, envoi ignoré pour: {$user->email}");
            return false;
        }

        try {
            // Récupérer le numéro de téléphone selon le type
            $phone = $this->getPhoneForUser($user, $type);
            
            if (!$phone) {
                Log::warning("No phone number found for user: {$user->email}");
                return false;
            }

            // Message selon le type
            $message = $this->getWelcomeSMSMessage($type, $user);

            // Envoyer selon le provider configuré
            $provider = config('notification.sms.provider', 'log');
            
            return match ($provider) {
                'twilio' => $this->sendSMSViaTwilio($phone, $message),
                'freemobile' => $this->sendSMSViaFreeMobile($phone, $message),
                default => $this->sendSMSViaLog($phone, $message),
            };
        } catch (\Exception $e) {
            Log::error("Failed to send welcome SMS: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer une notification in-app
     */
    public function sendInAppNotification(Utilisateur $user, string $type): ?Notification
    {
        // Vérifier si les notifications in-app sont activées
        if (!config('notification.in_app.enabled', true)) {
            Log::info("Notification in-app désactivée pour: {$user->email}");
            return null;
        }

        try {
            $data = $this->getInAppNotificationData($user, $type);
            
            return Notification::create($data);
        } catch (\Exception $e) {
            Log::error("Failed to create in-app notification: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Envoyer toutes les notifications d'inscription
     */
    public function sendWelcomeNotifications(Utilisateur $user, string $type, bool $sendEmail = true, bool $sendSMS = true, bool $sendInApp = true): array
    {
        // Vérifier si les notifications sont globalement activées
        if (!$this->isEnabled()) {
            Log::info("Notifications désactivées globalement pour: {$user->email}");
            return [
                'email' => false,
                'sms' => false,
                'in_app' => false,
                'disabled' => true,
            ];
        }

        $results = [
            'email' => false,
            'sms' => false,
            'in_app' => false,
        ];

        if ($sendEmail) {
            $results['email'] = $this->sendWelcomeEmail($user, $type);
        }

        if ($sendSMS) {
            $results['sms'] = $this->sendWelcomeSMS($user, $type);
        }

        if ($sendInApp) {
            $notification = $this->sendInAppNotification($user, $type);
            $results['in_app'] = $notification !== null;
        }

        return $results;
    }

    /**
     * Obtenir la classe de mail selon le type
     */
    private function getWelcomeMailClass(string $type): ?string
    {
        return match ($type) {
            self::TYPE_CLIENT => WelcomeClient::class,
            self::TYPE_DEPANNEUR => WelcomeDepanneur::class,
            self::TYPE_ADMIN => AccountCreatedByAdmin::class,
            default => null,
        };
    }

    /**
     * Obtenir le numéro de téléphone selon le type d'utilisateur
     */
    private function getPhoneForUser(Utilisateur $user, string $type): ?string
    {
        return match ($type) {
            self::TYPE_CLIENT => $user->client?->phone,
            self::TYPE_DEPANNEUR => $user->depanneur?->phone,
            default => null,
        };
    }

    /**
     * Obtenir le message SMS selon le type
     */
    private function getWelcomeSMSMessage(string $type, Utilisateur $user): string
    {
        return match ($type) {
            self::TYPE_CLIENT => "Bienvenue sur GoAssist, {$user->fullName}! Votre compte client a été créé avec succès. Vous pouvez maintenant demander de l'assistance.",
            self::TYPE_DEPANNEUR => "Bienvenue sur GoAssist Pro, {$user->fullName}! Votre compte dépanneur a été créé. En attente de validation par l'administrateur.",
            self::TYPE_ADMIN => "Votre compte GoAssist a été créé par l'administrateur. Connectez-vous pour gérer vos services.",
            default => "Bienvenue sur GoAssist!",
        };
    }

    /**
     * Obtenir les données de notification in-app
     */
    private function getInAppNotificationData(Utilisateur $user, string $type): array
    {
        $data = [
            'type' => Notification::TYPE_BIENVENUE,
            'isRead' => false,
        ];

        switch ($type) {
            case self::TYPE_CLIENT:
                $data['id_client'] = $user->client?->id;
                $data['titre'] = 'Bienvenue sur GoAssist!';
                $data['message'] = "Bienvenue {$user->fullName}! Votre compte a été créé avec succès. Vous pouvez maintenant demander de l'assistance véhicule.";
                break;
            case self::TYPE_DEPANNEUR:
                $data['id_depanneur'] = $user->depanneur?->id;
                $data['titre'] = 'Bienvenue sur GoAssist Pro!';
                $data['message'] = "Bienvenue {$user->fullName}! Votre compte dépanneur est en attente de validation.";
                break;
            case self::TYPE_ADMIN:
                $data['message'] = "Votre compte administrateur a été créé.";
                break;
        }

        return $data;
    }

    /**
     * Envoyer SMS via Log (simulation)
     */
    private function sendSMSViaLog(string $phone, string $message): bool
    {
        Log::info("SMS [LOG] to {$phone}: {$message}");
        return true;
    }

    /**
     * Envoyer SMS via Twilio
     */
    private function sendSMSViaTwilio(string $phone, string $message): bool
    {
        $sid = config('notification.sms.twilio.sid');
        $token = config('notification.sms.twilio.token');
        $from = config('notification.sms.twilio.from');

        if (empty($sid) || empty($token) || empty($from)) {
            Log::warning("Twilio configuration incomplete, fallback to log");
            return $this->sendSMSViaLog($phone, $message);
        }

        try {
            $twilio = new \Twilio\Rest\Client($sid, $token);
            $twilio->messages->create($phone, [
                'from' => $from,
                'body' => $message,
            ]);
            Log::info("SMS [TWILIO] sent to {$phone}");
            return true;
        } catch (\Exception $e) {
            Log::error("Twilio SMS failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Envoyer SMS via Free Mobile (France)
     */
    private function sendSMSViaFreeMobile(string $phone, string $message): bool
    {
        $user = config('notification.sms.freemobile.user');
        $key = config('notification.sms.freemobile.key');

        if (empty($user) || empty($key)) {
            Log::warning("Free Mobile configuration incomplete, fallback to log");
            return $this->sendSMSViaLog($phone, $message);
        }

        try {
            $url = "https://smsapi.free-mobile.fr/sendmsg.php";
            $params = [
                'user' => $user,
                'pass' => $key,
                'msg' => $message,
            ];
            
            $client = new \GuzzleHttp\Client();
            $client->get($url, ['query' => $params]);
            
            Log::info("SMS [FREEMOBILE] sent to {$phone}");
            return true;
        } catch (\Exception $e) {
            Log::error("Free Mobile SMS failed: " . $e->getMessage());
            return false;
        }
    }
}

