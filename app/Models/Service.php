<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class Service extends Model
{
    use HasFactory;

    protected $table = 'services';

    public $timestamps = false;

    
    protected $fillable = [
        'id_demande',     // FK vers demande
        'id_depanneur',   // FK vers dépanneur
        'action',         // Type de service
        'dateAction',     // Date du service
        'commentaire',    // Commentaire optionnel
    ];

   
    protected $casts = [
        'dateAction' => 'datetime',  // Cast en objet Carbon
        'createdAt' => 'datetime',   // Cast en objet Carbon
        'updatedAt' => 'datetime',   // Cast en objet Carbon
    ];

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

   
    const ACTION_REMORQUAGE = 'remorquage';

    
    const ACTION_REPARATION_SUR_PLACE = 'reparation_sur_place';

   // Action: Changement de roue
    const ACTION_CHANGEMENT_ROUE = 'changement_roue';

   // Action: Dépannage batterie
    const ACTION_DEPANNAGE_BATTERIE = 'depannage_batterie';

    // Action: Fourniture de carburant
    const ACTION_FOURNITURE_CARBURANT = 'fourniture_carburant';

    // Action: Autre service
    const ACTION_AUTRE = 'autre';

    
    protected static function boot()
    {
        parent::boot();

        // Si dateAction n'est pas définie, utiliser la date actuelle
        static::creating(function ($service) {
            if (!$service->dateAction) {
                $service->dateAction = now();
            }
        });
    }

    public function demande(): BelongsTo
    {
        return $this->belongsTo(Demande::class, 'id_demande');
    }

    
    public function depanneur(): BelongsTo
    {
        return $this->belongsTo(Depanneur::class, 'id_depanneur');
    }

    public function scopeParAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    
    public function scopeParDepanneur($query, int $depanneurId)
    {
        return $query->where('id_depanneur', $depanneurId);
    }

   
    public function scopeParDemande($query, int $demandeId)
    {
        return $query->where('id_demande', $demandeId);
    }


    public function scopeThisMonth($query)
    {
        return $query->whereMonth('createdAt', now()->month)
                     ->whereYear('createdAt', now()->year);
    }

   
    public function getActionLabelAttribute(): string
    {
        $labels = [
            self::ACTION_REMORQUAGE => 'Remorquage',
            self::ACTION_REPARATION_SUR_PLACE => 'Réparation sur place',
            self::ACTION_CHANGEMENT_ROUE => 'Changement de roue',
            self::ACTION_DEPANNAGE_BATTERIE => 'Dépannage batterie',
            self::ACTION_FOURNITURE_CARBURANT => 'Fourniture de carburant',
            self::ACTION_AUTRE => 'Autre service',
        ];

        return $labels[$this->action] ?? $this->action;
    }

    public function getActionColorAttribute(): string
    {
        $colors = [
            self::ACTION_REMORQUAGE => 'primary',
            self::ACTION_REPARATION_SUR_PLACE => 'success',
            self::ACTION_CHANGEMENT_ROUE => 'info',
            self::ACTION_DEPANNAGE_BATTERIE => 'warning',
            self::ACTION_FOURNITURE_CARBURANT => 'secondary',
            self::ACTION_AUTRE => 'light',
        ];

        return $colors[$this->action] ?? 'secondary';
    }

    public function getEstRemorquageAttribute(): bool
    {
        return $this->action === self::ACTION_REMORQUAGE;
    }

    
    public function getACommentaireAttribute(): bool
    {
        return !empty($this->commentaire);
    }

   
    public function setActionAttribute(string $value): void
    {
        $validActions = [
            self::ACTION_REMORQUAGE,
            self::ACTION_REPARATION_SUR_PLACE,
            self::ACTION_CHANGEMENT_ROUE,
            self::ACTION_DEPANNAGE_BATTERIE,
            self::ACTION_FOURNITURE_CARBURANT,
            self::ACTION_AUTRE,
        ];

        if (!in_array($value, $validActions)) {
            throw new \InvalidArgumentException("Type d'action invalide: {$value}");
        }

        $this->attributes['action'] = $value;
    }

   
    public static function getListeActions(): array
    {
        return [
            self::ACTION_REMORQUAGE => 'Remorquage',
            self::ACTION_REPARATION_SUR_PLACE => 'Réparation sur place',
            self::ACTION_CHANGEMENT_ROUE => 'Changement de roue',
            self::ACTION_DEPANNAGE_BATTERIE => 'Dépannage batterie',
            self::ACTION_FOURNITURE_CARBURANT => 'Fourniture de carburant',
            self::ACTION_AUTRE => 'Autre service',
        ];
    }
}

