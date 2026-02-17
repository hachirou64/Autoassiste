<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use App\Models\TypeCompte;
use Illuminate\Database\Seeder;

class AdminAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Pour créer un admin, exécuter :
     * php artisan db:seed --class=AdminAccountSeeder
     */
    public function run(): void
    {
        // Récupérer le type de compte Admin
        $typeCompteAdmin = TypeCompte::where('name', 'Admin')->first();

        if (!$typeCompteAdmin) {
            $this->command->error('Type de compte Admin non trouvé. Exécutez TypeCompteSeeder d\'abord.');
            return;
        }

        // Paramètres par défaut
        $email = 'admin@goassiste.com';
        $name = 'Administrateur';
        $password = 'admin123';

        // Vérifier si l'admin existe déjà
        $existingAdmin = Utilisateur::where('email', $email)
            ->where('id_type_compte', $typeCompteAdmin->id)
            ->first();

        if ($existingAdmin) {
            $this->command->info('Un admin avec cet email existe déjà.');
            return;
        }

        // Créer le compte admin
        // Note: Ne pas utiliser Hash::make() ici car le modèle Utilisateur
        // a un mutateur setPasswordAttribute qui hache automatiquement avec bcrypt()
        $admin = Utilisateur::create([
            'fullName' => $name,
            'email' => $email,
            'password' => $password, // Le modèle va le hacher automatiquement
            'id_type_compte' => $typeCompteAdmin->id,
            'id_client' => null,
            'id_depanneur' => null,
            'email_verified' => true, // Admin considéré comme vérifié
        ]);

        $this->command->info('=');
        $this->command->info('Compte Admin créé avec succès!');
        $this->command->info('Email: ' . $email);
        $this->command->info('Mot de passe: ' . $password);
        $this->command->info('ID: ' . $admin->id);
        $this->command->info('=');
        $this->command->info('Vous pouvez maintenant vous connecter sur /login');
    }
}

