<?php

namespace Database\Seeders;

use App\Models\TypeCompte;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class TypeCompteSeeder extends Seeder
{
    /**
     * Seed the type comptes
     */
    public function run(): void
    {
        // Créer les types de comptes (sans description car la colonne n'existe pas)
        $types = ['Admin', 'Client', 'Depanneur'];

        foreach ($types as $typeName) {
            TypeCompte::firstOrCreate(
                ['name' => $typeName]
            );
        }

        // Créer les zones d'intervention
        $zones = [
            ['name' => 'Cotonou Centre', 'city' => 'Cotonou', 'isActive' => true],
            ['name' => 'Cotonou Nord', 'city' => 'Cotonou', 'isActive' => true],
            ['name' => 'Cotonou Sud', 'city' => 'Cotonou', 'isActive' => true],
            ['name' => 'Abomey-Calavi', 'city' => 'Abomey-Calavi', 'isActive' => true],
            ['name' => 'Porto-Novo', 'city' => 'Porto-Novo', 'isActive' => true],
            ['name' => 'Ouidah', 'city' => 'Ouidah', 'isActive' => true],
            ['name' => 'Parakou', 'city' => 'Parakou', 'isActive' => true],
        ];

        foreach ($zones as $zone) {
            Zone::firstOrCreate(
                ['name' => $zone['name'], 'city' => $zone['city']],
                $zone
            );
        }
    }
}
