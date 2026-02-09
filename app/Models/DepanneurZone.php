<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;


class DepanneurZone extends Pivot
{
    protected $table = 'depanneur_zones';
    public $timestamps = false;

    protected $fillable = [
        'id_depanneur',
        'id_zone',
        'priorite',
        'dateAjout',
    ];

    protected $casts = [
        'dateAjout' => 'datetime',
    ];
     
    // RELATION : Accéder au dépanneur
     
    public function depanneur()
    {
        return $this->belongsTo(Depanneur::class, 'id_depanneur');
    }

    // RELATION : Accéder à la zone
    public function zone()
    {
        return $this->belongsTo(Zone::class, 'id_zone');
    }
}
