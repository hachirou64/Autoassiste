<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Exécuter le seeder des types de comptes et zones
        $this->call(TypeCompteSeeder::class);

        // Exécuter le seeder des données de démonstration
        $this->call(DemoDataSeeder::class);
    }
}
