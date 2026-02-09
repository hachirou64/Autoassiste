<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

// Modèle représentant les types de comptes utilisateur
class TypeCompte extends Model
{
    use HasFactory;

    // Nom de la table dans la base de données
    protected $table = 'type_comptes';

    // Désactiver les timestamps automatiques car on utilise createdAt/updatedAt personnalisés
    public $timestamps = false;

    // Colonnes pouvant être remplies massivement (mass assignment)
    protected $fillable = [
        'name',
    ];

    // Définir les noms personnalisés des timestamps
    const CREATED_AT = 'createdAt';
    const UPDATED_AT = 'updatedAt';

    /**
     * RELATION : Un type de compte a plusieurs utilisateurs
     * Relation One-to-Many
     */
    public function users()
    {
        return $this->hasMany(User::class, 'id_type_compte');
    }
}
