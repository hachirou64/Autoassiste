<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Socialite\Contracts\User as SocialUser;


class Utilisateur extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'utilisateurs';
    public $timestamps = true;

    protected $fillable = [
        'fullName',
        'email',
        'password',
        'localisation_actuelle',
        'email_verified',
        'email_verified_at',
        'created_By',
        'updatedBy',
        'DeleteedBy',
        'id_type_compte',
        'id_client',
        'id_depanneur',
    ];

    // Colonnes cachées lors de la sérialisation (sécurité)
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified' => 'boolean',
        'email_verified_at' => 'datetime',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    
    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = bcrypt($value);
    }

    
    public function typeCompte()
    {
        return $this->belongsTo(TypeCompte::class, 'id_type_compte');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    
    public function depanneur()
    {
        return $this->belongsTo(Depanneur::class, 'id_depanneur');
    }

    /**
     * Relation avec les comptes sociaux.
     */
    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }

    
    public function isAdmin()
    {
        return $this->typeCompte->name === 'Admin';
    }

    
    public function isClient()
    {
        return $this->typeCompte->name === 'Client';
    }

   
    public function isDepanneur()
    {
        return $this->typeCompte->name === 'Depanneur';
    }

    /**
     * Créer ou récupérer un utilisateur via OAuth social.
     */
    public static function findOrCreateFromSocial(SocialUser $socialUser, string $provider): self
    {
        // Chercher par email ou par compte social
        $user = static::where('email', $socialUser->getEmail())->first();
        
        if ($user) {
            // Mettre à jour le nom si nécessaire
            if (!$user->fullName && $socialUser->getName()) {
                $user->fullName = $socialUser->getName();
                $user->save();
            }
            return $user;
        }

        // Créer un nouvel utilisateur
        $user = static::create([
            'fullName' => $socialUser->getName() ?? $socialUser->getEmail(),
            'email' => $socialUser->getEmail(),
            'password' => bcrypt(str_random(16)), // Mot de passe aléatoire
            'email_verified' => true, // Considéré comme vérifié par le provider
            'id_type_compte' => 2, // Type Client par défaut
        ]);

        return $user;
    }
}
