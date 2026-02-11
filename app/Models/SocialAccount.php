<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SocialAccount extends Model
{
    /**
     * Les attributs qui sont assignables en masse.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'provider_name',
        'provider_id',
        'provider_email',
        'provider_avatar',
        'access_token',
        'refresh_token',
        'expires_at',
    ];

    /**
     * Les attributs qui doivent être castés.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Relation avec l'utilisateur.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'user_id');
    }

    /**
     * Trouver un compte social par provider et provider_id.
     */
    public static function findByProvider(string $provider, string $providerId): ?self
    {
        return static::where('provider_name', $provider)
            ->where('provider_id', $providerId)
            ->first();
    }

    /**
     * Vérifier si le token est expiré.
     */
    public function isTokenExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }
}
