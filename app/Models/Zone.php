<?php

/**
 * =====================================================================================
 * FILE: Zone.php
 * -------------------------------------------------------------------------------------
 * Ce fichier contient le modèle Zone qui représente les zones géographiques
 * d'intervention des dépanneurs dans l'application GoAssist.
 * =====================================================================================
 *
 * FONCTIONNALITÉS:
 * - Représente les zones géographiques (quartiers, villes)
 * - Chaque zone peut être activée ou désactivée par l'admin
 * - Relation Many-to-Many avec les dépanneurs
 *
 * CAS D'USAGE:
 * - Définir les zones de couverture de chaque dépanneur
 * - Filtrer les demandes par zone
 * - Affecter automatiquement les dépanneurs disponibles par zone
 *
 * COLONNES DE LA TABLE 'zones':
 * - id: Identifiant unique auto-incrémenté
 * - name: Nom de la zone (ex: "Cocody", "Plateau")
 * - city: Ville de la zone (ex: "Abidjan")
 * - description: Description optionnelle
 * - isActive: Si la zone est active
 * - createdAt: Date de création
 * - updatedAt: Date de modification
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


class Zone extends Model
{
    use HasFactory;

    protected $table = 'zones';

    public $timestamps = false;

    protected $fillable = [
        'name',         // Nom de la zone
        'city',         // Ville
        'description',  // Description optionnelle
        'isActive',     // Statut actif/inactif
    ];

 
    protected $casts = [
        'isActive' => 'boolean',   // Convertit 0/1 en true/false
        'createdAt' => 'datetime', // Cast en objet Carbon
        'updatedAt' => 'datetime', // Cast en objet Carbon
    ];

   
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    public function depanneurs(): BelongsToMany
    {
        return $this->belongsToMany(Depanneur::class, 'depanneur_zones', 'id_zone', 'id_depanneur')
                    ->withPivot('priorite', 'dateAjout');
    }

   
    public function scopeActive($query)
    {
        return $query->where('isActive', true);
    }

    public function scopeParVille($query, string $city)
    {
        return $query->where('city', $city);
    }

   
    public function scopeWithDepanneursCount($query)
    {
        return $query->withCount('depanneurs');
    }

   
    public function getNomCompletAttribute(): string
    {
        return "{$this->name}, {$this->city}";
    }

    public function getNombreDepanneursAttribute(): int
    {
        return $this->depanneurs()->count();
    }

  
    public function getNombreDepanneursDisponiblesAttribute(): int
    {
        return $this->depanneurs()->disponible()->count();
    }

   
    public function getEstActiveAttribute(): bool
    {
        return $this->isActive;
    }

     
    public function setIsActiveAttribute(bool $value): void
    {
        $this->attributes['isActive'] = $value;
    }

    public function activer(): bool
    {
        return $this->update(['isActive' => true]);
    }

    
    public function desactiver(): bool
    {
        return $this->update(['isActive' => false]);
    }

    public function toggleStatus(): bool
    {
        return $this->update(['isActive' => !$this->isActive]);
    }
}

