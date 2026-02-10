<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Client extends Model
{
    use HasFactory;

    
    protected $table = 'clients';

    
    public $timestamps = false;

    
    protected $fillable = [
        'fullName',   // Nom complet du client
        'email',      // Adresse email unique
        'phone',      // Numéro de téléphone
    ];

    
    protected $casts = [
        'createdAt' => 'datetime',  // Cast en objet Carbon
        'updatedAt' => 'datetime',  // Cast en objet Carbon
    ];

    
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    
    public function user(): HasOne
    {
        return $this->hasOne(Utilisateur::class, 'id_client');
    }

    
    public function demandes(): HasMany
    {
        return $this->hasMany(Demande::class, 'id_client');
    }

    
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'id_client');
    }

    public function scopeWithDemandesCount($query)
    {
        return $query->withCount('demandes');
    }

   
    public function scopeWithRecentDemandes($query, $limit = 5)
    {
        return $query->with(['demandes' => function($q) use ($limit) {
            $q->orderBy('createdAt', 'desc')->limit($limit);
        }]);
    }

  
    public function getNombreDemandesAttribute(): int
    {
        return $this->demandes()->count();
    }

    
    public function getNombreDemandesTermineesAttribute(): int
    {
        return $this->demandes()->where('status', 'terminee')->count();
    }

   
    public function getNombreDemandesEnCoursAttribute(): int
    {
        return $this->demandes()->whereIn('status', ['en_attente', 'acceptee', 'en_cours'])->count();
    }

    
    public function getTotalDepensesAttribute(): float
    {
        return $this->demandes()
            ->whereHas('interventions.facture', function($q) {
                $q->where('status', 'payee');
            })
            ->with('interventions.facture')
            ->get()
            ->flatMap->interventions
            ->pluck('facture')
            ->sum('montant');
    }

  
    public function getInitialesAttribute(): string
    {
        $mots = explode(' ', $this->fullName);
        $initiales = '';
        foreach ($mots as $mot) {
            $initiales .= strtoupper(substr($mot, 0, 1));
        }
        return substr($initiales, 0, 2);
    }
}
