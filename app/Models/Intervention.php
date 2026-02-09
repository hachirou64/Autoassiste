<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Intervention extends Model
{
    use HasFactory;

    
    protected $table = 'interventions';

   //  Indique que les timestamps ne sont pas gérés automatiquement
    public $timestamps = false;

    protected $fillable = [
        'piecesremplacees',   
        'observations',      
        'coutPiece',         
        'coutMainOeuvre',     
        'coutTotal',          
        'status',            
        'startedAt',          
        'completedAt',       
        'id_demande',         
        'id_depanneur',     
    ];

   
    protected $casts = [
        'coutPiece' => 'decimal:2',     // Cast en decimal avec 2 décimales
        'coutMainOeuvre' => 'decimal:2', // Cast en decimal avec 2 décimales
        'coutTotal' => 'decimal:2',     // Cast en decimal avec 2 décimales
        'startedAt' => 'datetime',      // Cast en objet Carbon
        'completedAt' => 'datetime',    // Cast en objet Carbon
        'createdAt' => 'datetime',      // Cast en objet Carbon
        'updatedAt' => 'datetime',      // Cast en objet Carbon
    ];


    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    
    const STATUS_PLANIFIEE = 'planifiee';

    const STATUS_EN_COURS = 'en_cours';

   
    const STATUS_TERMINEE = 'terminee';

    protected static function boot()
    {
        parent::boot();

        // Avant chaque sauvegarde (create ou update), calculer le coût total
        static::saving(function ($intervention) {
            // Calculer le coût total
            $intervention->coutTotal = (float) $intervention->coutPiece + (float) $intervention->coutMainOeuvre;
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

    
    public function facture(): HasOne
    {
        return $this->hasOne(Facture::class, 'id_intervention');
    }


    public function client(): HasOne
    {
        return $this->hasOneThrough(
            Client::class,
            Demande::class,
            'id',       // Clé étrangère sur demandes
            'id',       // Clé étrangère sur clients
            'id_demande', // Clé locale
            'id_client'   // Clé seconde
        );
    }

    
    public function scopeTerminee($query)
    {
        return $query->where('status', self::STATUS_TERMINEE);
    }

    
    public function scopeEnCours($query)
    {
        return $query->where('status', self::STATUS_EN_COURS);
    }

    public function scopeParDepanneur($query, $depanneurId)
    {
        return $query->where('id_depanneur', $depanneurId);
    }

   
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('createdAt', now()->month)
                     ->whereYear('createdAt', now()->year);
    }

   
    public function scopeWithFacturePayee($query)
    {
        return $query->whereHas('facture', function($q) {
            $q->where('status', 'payee');
        });
    }

   
    public function getDureeAttribute(): ?int
    {
        if ($this->startedAt && $this->completedAt) {
            return $this->startedAt->diffInMinutes($this->completedAt);
        }
        return null;
    }

   
    public function getDureeFormateeAttribute(): ?string
    {
        $minutes = $this->duree;
        if ($minutes === null) {
            return null;
        }

        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;

        if ($hours > 0) {
            return "{$hours}h " . ($mins > 0 ? "{$mins}min" : "");
        }
        return "{$mins}min";
    }

   
    public function getStatutLabelAttribute(): string
    {
        $labels = [
            self::STATUS_PLANIFIEE => 'Planifiée',
            self::STATUS_EN_COURS => 'En cours',
            self::STATUS_TERMINEE => 'Terminée',
        ];
        return $labels[$this->status] ?? 'Inconnu';
    }

    
    public function getStatutColorAttribute(): string
    {
        $colors = [
            self::STATUS_PLANIFIEE => 'info',
            self::STATUS_EN_COURS => 'warning',
            self::STATUS_TERMINEE => 'success',
        ];
        return $colors[$this->status] ?? 'secondary';
    }

    
    public function getEstTermineeAttribute(): bool
    {
        return $this->status === self::STATUS_TERMINEE;
    }

   
    public function getEstEnCoursAttribute(): bool
    {
        return $this->status === self::STATUS_EN_COURS;
    }

   
    public function getAFactureAttribute(): bool
    {
        return $this->facture !== null;
    }

    
    public function getMontantPayeAttribute(): ?float
    {
        return $this->facture?->montant;
    }

    
    public function setCoutTotalAttribute(float $value): void
    {
        // Le coût total est toujours calculé automatiquement dans le boot()
        // Cette méthode ne fait rien pour éviter les assignments manuels
    }

  
    public function setStatusAttribute(string $value): void
    {
        $validStatuses = [
            self::STATUS_PLANIFIEE,
            self::STATUS_EN_COURS,
            self::STATUS_TERMINEE,
        ];

        if (!in_array($value, $validStatuses)) {
            throw new \InvalidArgumentException("Statut invalide: {$value}");
        }

        $this->attributes['status'] = $value;
    }

   
    public function demarrer(): bool
    {
        return $this->update([
            'status' => self::STATUS_EN_COURS,
            'startedAt' => now(),
        ]);
    }

    
    public function terminer(): bool
    {
        return $this->update([
            'status' => self::STATUS_TERMINEE,
            'completedAt' => now(),
        ]);
    }

    public function getClient(): ?Client
    {
        return $this->demande?->client;
    }

    
    public function estProcheDeLActuel(int $minutes = 30): bool
    {
        return $this->createdAt->greaterThan(now()->subMinutes($minutes));
    }
}

