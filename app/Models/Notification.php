<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    public $timestamps = false;

    
    protected $fillable = [
        'message',       // Texte de la notification
        'titre',         // Titre de la notification
        'type',          // Type de notification
        'isRead',        // Statut lu/non lu
        'id_client',     // FK client (optionnel)
        'id_demande',    // FK demande (optionnel)
        'id_depanneur',  // FK dépanneur (optionnel)
    ];

   
    protected $casts = [
        'isRead' => 'boolean',   // Convertit 0/1 en true/false
        'createdAt' => 'datetime', // Cast en objet Carbon
        'updatedAt' => 'datetime', // Cast en objet Carbon
    ];

    
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

   
   
    const TYPE_NOUVELLE_DEMANDE = 'nouvelle_demande';

    // Type: Demande reçue (confirmation pour le client)
    const TYPE_DEMANDE_RECUE = 'demande_recue';

    const TYPE_DEMANDE_ACCEPTEE = 'demande_acceptee';

    // Type: Demande annulée
    const TYPE_DEMANDE_ANNULEE = 'demande_annulee';

    // Type: Dépannage en route
    const TYPE_DEPANNAGE_EN_ROUTE = 'depannage_en_route';

    // Type: Intervention terminée
    const TYPE_INTERVENTION_TERMINEE = 'intervention_terminee';

    // Type: Paiement reçu
    const TYPE_PAIEMENT_RECU = 'paiement_recu';

    // Type: Compte activé (pour dépanneur)
    const TYPE_COMPTE_ACTIVATE = 'compte_active';

    // Type: Compte désactivé (pour dépanneur)
    const TYPE_COMPTE_DESACTIVATE = 'compte_desactive';

   
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class, 'id_demande');
    }

   
    public function depanneur(): BelongsTo
    {
        return $this->belongsTo(Depanneur::class, 'id_depanneur');
    }

    
    public function scopeNonLues($query)
    {
        return $query->where('isRead', false);
    }

   
    public function scopeLues($query)
    {
        return $query->where('isRead', true);
    }

    
    public function scopeParType($query, string $type)
    {
        return $query->where('type', $type);
    }

   
    public function scopePourClient($query, int $clientId)
    {
        return $query->where('id_client', $clientId);
    }

    
    public function scopePourDepanneur($query, int $depanneurId)
    {
        return $query->where('id_depanneur', $depanneurId);
    }

   
    public function scopeRecentes($query)
    {
        return $query->orderBy('createdAt', 'desc');
    }

    
    public function scopeLast24Hours($query)
    {
        return $query->where('createdAt', '>=', now()->subHours(24));
    }

    
    public function getTypeLabelAttribute(): string
    {
        $labels = [
            self::TYPE_NOUVELLE_DEMANDE => 'Nouvelle demande',
            self::TYPE_DEMANDE_RECUE => 'Demande reçue',
            self::TYPE_DEMANDE_ACCEPTEE => 'Demande acceptée',
            self::TYPE_DEMANDE_ANNULEE => 'Demande annulée',
            self::TYPE_DEPANNAGE_EN_ROUTE => 'Dépanneur en route',
            self::TYPE_INTERVENTION_TERMINEE => 'Intervention terminée',
            self::TYPE_PAIEMENT_RECU => 'Paiement reçu',
        ];

        return $labels[$this->type] ?? $this->type;
    }

   
    public function getTypeIconAttribute(): string
    {
        $icons = [
            self::TYPE_NOUVELLE_DEMANDE => '📋',
            self::TYPE_DEMANDE_RECUE => '✅',
            self::TYPE_DEMANDE_ACCEPTEE => '✅',
            self::TYPE_DEMANDE_ANNULEE => '❌',
            self::TYPE_DEPANNAGE_EN_ROUTE => '🚗',
            self::TYPE_INTERVENTION_TERMINEE => '🔧',
            self::TYPE_PAIEMENT_RECU => '💰',
            self::TYPE_COMPTE_ACTIVATE => '✅',
            self::TYPE_COMPTE_DESACTIVATE => '🚫',
        ];

        return $icons[$this->type] ?? '🔔';
    }

   
    public function getTypeColorAttribute(): string
    {
        $colors = [
            self::TYPE_NOUVELLE_DEMANDE => 'info',
            self::TYPE_DEMANDE_RECUE => 'success',
            self::TYPE_DEMANDE_ACCEPTEE => 'success',
            self::TYPE_DEMANDE_ANNULEE => 'danger',
            self::TYPE_DEPANNAGE_EN_ROUTE => 'warning',
            self::TYPE_INTERVENTION_TERMINEE => 'primary',
            self::TYPE_PAIEMENT_RECU => 'success',
            self::TYPE_COMPTE_ACTIVATE => 'success',
            self::TYPE_COMPTE_DESACTIVATE => 'danger',
        ];

        return $colors[$this->type] ?? 'secondary';
    }

    
    public function getEstLueAttribute(): bool
    {
        return $this->isRead;
    }

   
    public function getEstNonLueAttribute(): bool
    {
        return !$this->isRead;
    }

    public function getTempsEcouleAttribute(): string
    {
        return $this->createdAt->diffForHumans();
    }

    public function setTypeAttribute(string $value): void
    {
        $validTypes = [
            self::TYPE_NOUVELLE_DEMANDE,
            self::TYPE_DEMANDE_RECUE,
            self::TYPE_DEMANDE_ACCEPTEE,
            self::TYPE_DEMANDE_ANNULEE,
            self::TYPE_DEPANNAGE_EN_ROUTE,
            self::TYPE_INTERVENTION_TERMINEE,
            self::TYPE_PAIEMENT_RECU,
        ];

        if (!in_array($value, $validTypes)) {
            throw new \InvalidArgumentException("Type de notification invalide: {$value}");
        }

        $this->attributes['type'] = $value;
    }

   
    public function setIsReadAttribute(bool $value): void
    {
        $this->attributes['isRead'] = $value;
    }

   
    public function marquerCommeLue(): bool
    {
        return $this->update(['isRead' => true]);
    }

    public function marquerCommeNonLue(): bool
    {
        return $this->update(['isRead' => false]);
    }

   
    public function toggleRead(): bool
    {
        return $this->update(['isRead' => !$this->isRead]);
    }

    
    public static function getListeTypes(): array
    {
        return [
            self::TYPE_NOUVELLE_DEMANDE => 'Nouvelle demande',
            self::TYPE_DEMANDE_RECUE => 'Demande reçue',
            self::TYPE_DEMANDE_ACCEPTEE => 'Demande acceptée',
            self::TYPE_DEMANDE_ANNULEE => 'Demande annulée',
            self::TYPE_DEPANNAGE_EN_ROUTE => 'Dépanneur en route',
            self::TYPE_INTERVENTION_TERMINEE => 'Intervention terminée',
            self::TYPE_PAIEMENT_RECU => 'Paiement reçu',
            self::TYPE_COMPTE_ACTIVATE => 'Compte activé',
            self::TYPE_COMPTE_DESACTIVATE => 'Compte désactivé',
        ];
    }
}

