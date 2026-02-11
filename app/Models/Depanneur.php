<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Depanneur extends Model
{
    use HasFactory;

    protected $table = 'depanneurs';

    public $timestamps = false;

    
    protected $fillable = [
        'promoteur_name',      // Nom du promoteur/responsable
        'etablissement_name',  // Nom de l'établissement
        'IFU',                 // Numéro d'Identification Fiscal Unique
        'email',               // Adresse email professionnelle
        'phone',               // Numéro de téléphone
        'status',              // Statut actuel
        'isActive',            // Si le compte est activé
        'type_vehicule',       // Type de véhicule (voiture, moto, les_deux)
        'localisation_actuelle', // Position GPS actuelle (format: "lat,lng")
    ];

   
    protected $casts = [
        'isActive' => 'boolean',     // Cast en boolean
        'createdAt' => 'datetime',   // Cast en objet Carbon
        'updatedAt' => 'datetime',   // Cast en objet Carbon
    ];

    
    
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    
    const STATUS_DISPONIBLE = 'disponible';

    
     //Statut: Occupé par une intervention en cours

    const STATUS_OCCUPE = 'occupe';

    
     //Statut: Hors service, indisponible pour les interventions
    const STATUS_HORS_SERVICE = 'hors_service';

    
    // Types de véhicules
    const VEHICULE_VOITURE = 'voiture';
    const VEHICULE_MOTO = 'moto';
    const VEHICULE_LES_DEUX = 'les_deux';

    
    public function utilisateur(): HasOne
    {
        return $this->hasOne(Utilisateur::class, 'id_depanneur');
    }

  
    public function zones(): BelongsToMany
    {
        return $this->belongsToMany(Zone::class, 'depanneur_zones', 'id_depanneur', 'id_zone')
                    ->withPivot('priorite', 'dateAjout');
    }

    
    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class, 'id_depanneur');
    }

    public function interventions(): HasMany
    {
        return $this->hasMany(Intervention::class, 'id_depanneur');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'id_depanneur');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'id_depanneur');
    }

   
   
    public function scopeDisponible($query)
    {
        return $query->where('status', self::STATUS_DISPONIBLE)
                     ->where('isActive', true);
    }

    
    public function scopeForVehicleType($query, string $vehicleType)
    {
        return $query->whereIn('type_vehicule', [$vehicleType, self::VEHICULE_LES_DEUX]);
    }

   
    public function scopeOccupe($query)
    {
        return $query->where('status', self::STATUS_OCCUPE);
    }

   
    public function scopeActif($query)
    {
        return $query->where('isActive', true);
    }

  
    public function scopeWithInterventionsCount($query)
    {
        return $query->withCount('interventions');
    }

  
    public function scopeByZone($query, $zoneId)
    {
        return $query->whereHas('zones', function($q) use ($zoneId) {
            $q->where('zones.id', $zoneId);
        });
    }

    
    public function getEstDisponibleAttribute(): bool
    {
        return $this->status === self::STATUS_DISPONIBLE && $this->isActive;
    }

    public function getStatutLabelAttribute(): string
    {
        $labels = [
            self::STATUS_DISPONIBLE => 'Disponible',
            self::STATUS_OCCUPE => 'En intervention',
            self::STATUS_HORS_SERVICE => 'Hors service',
        ];
        return $labels[$this->status] ?? 'Inconnu';
    }

    
    public function getTypeVehiculeLabelAttribute(): string
    {
        $labels = [
            self::VEHICULE_VOITURE => 'Voiture',
            self::VEHICULE_MOTO => 'Moto',
            self::VEHICULE_LES_DEUX => 'Voiture & Moto',
        ];
        return $labels[$this->type_vehicule] ?? 'Non défini';
    }


    public function getTotalInterventionsAttribute(): int
    {
        return $this->interventions()->count();
    }

    
    public function getInterventionsTermineesAttribute(): int
    {
        return $this->interventions()->where('status', 'terminee')->count();
    }

    public function getRevenuTotalAttribute(): float
    {
        return $this->interventions()
            ->whereHas('facture', function($q) {
                $q->where('status', 'payee');
            })
            ->with('facture')
            ->get()
            ->sum('facture.montant');
    }

 
    public function getNombreZonesAttribute(): int
    {
        return $this->zones()->count();
    }

    public function getInitialesAttribute(): string
    {
        $mots = explode(' ', $this->etablissement_name);
        $initiales = '';
        foreach ($mots as $mot) {
            $initiales .= strtoupper(substr($mot, 0, 1));
        }
        return substr($initiales, 0, 2);
    }

    public function getCoordinatesAttribute(): array
    {
        if (!$this->localisation_actuelle) {
            return ['lat' => null, 'lng' => null];
        }
        $coords = explode(',', $this->localisation_actuelle);
        return [
            'lat' => (float) ($coords[0] ?? 0),
            'lng' => (float) ($coords[1] ?? 0),
        ];
    }


    public function setStatusAttribute(string $value): void
    {
        // Valider le statut
        $validStatuses = [self::STATUS_DISPONIBLE, self::STATUS_OCCUPE, self::STATUS_HORS_SERVICE];
        if (!in_array($value, $validStatuses)) {
            throw new \InvalidArgumentException("Statut invalide: {$value}");
        }
        $this->attributes['status'] = $value;
    }

    
    public function setLocalisationActuelleAttribute(string $value): void
    {
        // Valider le format "lat,lng"
        $coords = explode(',', $value);
        if (count($coords) !== 2) {
            throw new \InvalidArgumentException("Format de localisation invalide. Utiliser: lat,lng");
        }
        $this->attributes['localisation_actuelle'] = $value;
    }

   
    public function rendreDisponible(): bool
    {
        return $this->update(['status' => self::STATUS_DISPONIBLE]);
    }

    public function rendreOccupe(): bool
    {
        return $this->update(['status' => self::STATUS_OCCUPE]);
    }

    public function mettreHorsService(): bool
    {
        return $this->update(['status' => self::STATUS_HORS_SERVICE]);
    }

    
    public function mettreAJourPosition(float $latitude, float $longitude): bool
    {
        return $this->update([
            'localisation_actuelle' => "{$latitude},{$longitude}"
        ]);
    }

    
    public function activer(): bool
    {
        return $this->update(['isActive' => true]);
    }

    
    public function desactiver(): bool
    {
        return $this->update(['isActive' => false]);
    }
}
