<?php



namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Demande extends Model
{
    use HasFactory;

    
    protected $table = 'demandes';

    public $timestamps = false;

    
    
    protected $fillable = [
        'codeDemande',         // Code unique généré automatiquement
        'localisation',        // Position GPS au format "lat,lng"
        'descriptionProbleme', // Description du problème
        'vehicle_type',       // Type de véhicule (voiture, moto)
        'typePanne',          // Type de panne
        'status',              // Statut de la demande
        'acceptedAt',          // Date d'acceptation
        'completedAt',         // Date de completion
        'id_client',           // FK client
        'id_depanneur',        // FK dépanneur (nullable)
    ];

    protected $casts = [
        'createdAt' => 'datetime',   // Cast en objet Carbon
        'updatedAt' => 'datetime',   // Cast en objet Carbon
        'acceptedAt' => 'datetime',  // Cast en objet Carbon
        'completedAt' => 'datetime', // Cast en objet Carbon
    ];

    
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    
    
    const STATUS_EN_ATTENTE = 'en_attente';

    
    const STATUS_ACCEPTEE = 'acceptee';

    const STATUS_EN_COURS = 'en_cours';

    
    const STATUS_TERMINEE = 'terminee';

    const STATUS_ANNULEE = 'annulee';

    
    // Types de véhicules
    const VEHICULE_VOITURE = 'voiture';
    const VEHICULE_MOTO = 'moto';

    
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($demande) {
            // Générer un code unique : DEM-YYYYMMDD-XXXXX
            // Exemple: DEM-20240101-00001
            $demande->codeDemande = 'DEM-' . date('Ymd') . '-' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        });
    }

    
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    
    public function depanneur(): BelongsTo
    {
        return $this->belongsTo(Depanneur::class, 'id_depanneur');
    }

    
    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'id_demande');
    }

    public function interventions(): HasMany
    {
        return $this->hasMany(Intervention::class, 'id_demande');
    }

    public function interventionActive(): HasOne
    {
        return $this->hasOne(Intervention::class, 'id_demande')->whereIn('status', ['en_cours', 'planifiee']);
    }

   
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'id_demande');
    }

    public function scopeEnAttente($query)
    {
        return $query->where('status', self::STATUS_EN_ATTENTE);
    }

   
    public function scopeEnCours($query)
    {
        return $query->where('status', self::STATUS_EN_COURS);
    }

   
    public function scopeTerminees($query)
    {
        return $query->where('status', self::STATUS_TERMINEE);
    }

    
    public function scopeParClient($query, $clientId)
    {
        return $query->where('id_client', $clientId);
    }

    public function scopeParDepanneur($query, $depanneurId)
    {
        return $query->where('id_depanneur', $depanneurId);
    }

    
    public function scopeRecent($query)
    {
        return $query->orderBy('createdAt', 'desc');
    }

   
    public function scopeToday($query)
    {
        return $query->whereDate('createdAt', today());
    }

   
    public function getCoordinatesAttribute(): array
    {
        // Supposant que localisation est au format "6.3703,2.3912"
        $coords = explode(',', $this->localisation);
        return [
            'lat' => (float) ($coords[0] ?? 0),
            'lng' => (float) ($coords[1] ?? 0),
        ];
    }

    public function getStatutLabelAttribute(): string
    {
        $labels = [
            self::STATUS_EN_ATTENTE => 'En attente',
            self::STATUS_ACCEPTEE => 'Acceptée',
            self::STATUS_EN_COURS => 'En cours',
            self::STATUS_TERMINEE => 'Terminée',
            self::STATUS_ANNULEE => 'Annulée',
        ];
        return $labels[$this->status] ?? 'Inconnu';
    }

    
    public function getStatutColorAttribute(): string
    {
        $colors = [
            self::STATUS_EN_ATTENTE => 'warning',   // Orange/Jaune
            self::STATUS_ACCEPTEE => 'info',        // Bleu
            self::STATUS_EN_COURS => 'primary',     // Bleu foncé
            self::STATUS_TERMINEE => 'success',     // Vert
            self::STATUS_ANNULEE => 'danger',       // Rouge
        ];
        return $colors[$this->status] ?? 'secondary';
    }

    
    public function getEstEnAttenteAttribute(): bool
    {
        return $this->status === self::STATUS_EN_ATTENTE;
    }

    
    public function getEstAnnuleeAttribute(): bool
    {
        return $this->status === self::STATUS_ANNULEE;
    }

    public function getPeutEtreAnnuleeAttribute(): bool
    {
        return $this->status === self::STATUS_EN_ATTENTE;
    }

    
    public function getVehicleTypeLabelAttribute(): string
    {
        $labels = [
            self::VEHICULE_VOITURE => 'Voiture',
            self::VEHICULE_MOTO => 'Moto',
        ];
        return $labels[$this->vehicle_type] ?? 'Non spécifié';
    }

    
    public function getDureeEstimeeAttribute(): ?int
    {
        if (!$this->acceptedAt || !$this->completedAt) {
            return null;
        }
        return $this->acceptedAt->diffInMinutes($this->completedAt);
    }

    public function setLocalisationAttribute(string $value): void
    {
        // Valider le format "lat,lng"
        $coords = explode(',', $value);
        if (count($coords) !== 2) {
            throw new \InvalidArgumentException("Format de localisation invalide. Utiliser: lat,lng");
        }

        // Valider que ce sont des nombres
        if (!is_numeric($coords[0]) || !is_numeric($coords[1])) {
            throw new \InvalidArgumentException("Les coordonnées doivent être des nombres");
        }

        $this->attributes['localisation'] = $value;
    }

    public function setStatusAttribute(string $value): void
    {
        $validStatuses = [
            self::STATUS_EN_ATTENTE,
            self::STATUS_ACCEPTEE,
            self::STATUS_EN_COURS,
            self::STATUS_TERMINEE,
            self::STATUS_ANNULEE,
        ];

        if (!in_array($value, $validStatuses)) {
            throw new \InvalidArgumentException("Statut invalide: {$value}");
        }

        $this->attributes['status'] = $value;
    }

    public function accepter(Depanneur $depanneur): bool
    {
        return $this->update([
            'status' => self::STATUS_ACCEPTEE,
            'id_depanneur' => $depanneur->id,
            'acceptedAt' => now(),
        ]);
    }

    public function demarrerIntervention(): bool
    {
        return $this->update([
            'status' => self::STATUS_EN_COURS,
        ]);
    }

    public function terminer(): bool
    {
        return $this->update([
            'status' => self::STATUS_TERMINEE,
            'completedAt' => now(),
        ]);
    }

    
    public function annuler(): bool
    {
        if (!$this->peutEtreAnnulee) {
            throw new \LogicException("Cette demande ne peut pas être annulée");
        }
        return $this->update(['status' => self::STATUS_ANNULEE]);
    }

    public function getLatitude(): float
    {
        return $this->coordinates['lat'];
    }

    public function getLongitude(): float
    {
        return $this->coordinates['lng'];
    }

    public function getLatitudeAttribute(): float
    {
        return $this->coordinates['lat'];
    }

    public function getLongitudeAttribute(): float
    {
        return $this->coordinates['lng'];
    }

    public function estAssignmentValide(int $depanneurId): bool
    {
        return $this->status === self::STATUS_EN_ATTENTE;
    }
}

