<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Utilisateur;
use App\Models\Depanneur;
use App\Models\Demande;
use App\Models\Zone;
use App\Models\TypeCompte;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    /**
     * Seed the application's database with demo data.
     */
    public function run(): void
    {
        // D'abord exécuter le seeder de base
        $this->call(TypeCompteSeeder::class);

        // Récupérer le type de compte Client
        $typeCompteClient = TypeCompte::where('name', 'Client')->first();
        $typeCompteDepanneur = TypeCompte::where('name', 'Depanneur')->first();

        if (!$typeCompteClient || !$typeCompteDepanneur) {
            $this->command->error('Types de comptes non trouvés. Exécutez TypeCompteSeeder d\'abord.');
            return;
        }

        // Récupérer les zones
        $zones = Zone::all();
        if ($zones->isEmpty()) {
            $this->command->error('Zones non trouvées. Exécutez TypeCompteSeeder d\'abord.');
            return;
        }

        $this->command->info('Création des clients de test...');

        // Créer 10 clients de test
        $clientsData = [
            [
                'fullName' => 'Jean Dupont',
                'email' => 'jean.dupont@email.com',
                'phone' => '+229 97 12 34 56',
            ],
            [
                'fullName' => 'Marie Kouami',
                'email' => 'marie.kouami@email.com',
                'phone' => '+229 98 23 45 67',
            ],
            [
                'fullName' => 'Pierre Mensah',
                'email' => 'pierre.mensah@email.com',
                'phone' => '+229 95 34 56 78',
            ],
            [
                'fullName' => 'Aminata Traoré',
                'email' => 'aminata.traore@email.com',
                'phone' => '+229 96 45 67 89',
            ],
            [
                'fullName' => 'Thomas Hounvou',
                'email' => 'thomas.hounvou@email.com',
                'phone' => '+229 94 56 78 90',
            ],
            [
                'fullName' => 'Fatou Bamba',
                'email' => 'fatou.bamba@email.com',
                'phone' => '+229 93 67 89 01',
            ],
            [
                'fullName' => 'Paul Agossou',
                'email' => 'paul.agossou@email.com',
                'phone' => '+229 92 78 90 12',
            ],
            [
                'fullName' => 'Sonia Adeoti',
                'email' => 'sonia.adeoti@email.com',
                'phone' => '+229 91 89 01 23',
            ],
            [
                'fullName' => 'Marc Soglo',
                'email' => 'marc.soglo@email.com',
                'phone' => '+229 90 90 12 34',
            ],
            [
                'fullName' => 'Claire Hounton',
                'email' => 'claire.hounton@email.com',
                'phone' => '+229 99 01 23 45',
            ],
        ];

        $clients = [];
        foreach ($clientsData as $clientData) {
            // Vérifier si le client existe déjà
            $client = Client::where('email', $clientData['email'])->first();
            
            if (!$client) {
                $client = Client::create($clientData);
                
                // Créer le compte utilisateur associé
                Utilisateur::create([
                    'fullName' => $clientData['fullName'],
                    'email' => $clientData['email'],
                    'password' => 'password123', // Sera hashé automatiquement par le mutateur du modèle
                    'id_type_compte' => $typeCompteClient->id,
                    'id_client' => $client->id,
                    'email_verified' => true,
                ]);
                
                $clients[] = $client;
                $this->command->info("  Client créé: {$clientData['fullName']}");
            } else {
                $clients[] = $client;
                $this->command->warn("  Client existant: {$clientData['fullName']}");
            }
        }

        $this->command->info(count($clients) . ' clients créés ou existants.');

        // Créer quelques dépanneurs de test
        $this->command->info('Création des dépanneurs de test...');

        // Coordonnées pour les tests: (6.517555, 2.349466)
        $depanneursData = [
            [
                'promoteur_name' => 'Koffi Ahoué',
                'etablissement_name' => 'Auto Répare Plus',
                'IFU' => '0123456789012',
                'email' => 'contact@autorepare.com',
                'phone' => '+229 60 11 22 33',
                'type_vehicule' => 'les_deux',
                'localisation_actuelle' => '6.517555,2.349466', // Zone de test
            ],
            [
                'promoteur_name' => 'Patrice Lokonon',
                'etablissement_name' => 'Dépannage Express',
                'IFU' => '0123456789013',
                'email' => 'info@depannageexpress.com',
                'phone' => '+229 60 44 55 66',
                'type_vehicule' => 'voiture',
                'localisation_actuelle' => '6.517555,2.349466', // Zone de test
            ],
            [
                'promoteur_name' => 'Alain Chitou',
                'etablissement_name' => 'Mécanique Pro',
                'IFU' => '0123456789014',
                'email' => 'contact@mecaniquepro.com',
                'phone' => '+229 60 77 88 99',
                'type_vehicule' => 'moto',
                'localisation_actuelle' => '6.4963,2.6289', // Zone Porto-Novo
            ],
            // Nouveau dépanneur pour test de démonstration
            [
                'promoteur_name' => 'Demo Testeur',
                'etablissement_name' => 'Dépanneur Test',
                'IFU' => '0123456789015',
                'email' => 'test@depanneur.com',
                'phone' => '+229 60 00 00 00',
                'type_vehicule' => 'les_deux',
                'localisation_actuelle' => '6.517555,2.349466', // Coordonnées exactes du client
            ],
        ];

        $depanneurs = [];
        foreach ($depanneursData as $depanneurData) {
            $depanneur = Depanneur::where('email', $depanneurData['email'])->first();
            
            if (!$depanneur) {
                $depanneur = Depanneur::create([
                    ...$depanneurData,
                    'status' => 'disponible',
                    'isActive' => true,
                ]);
                
                // Créer le compte utilisateur associé
                Utilisateur::create([
                    'fullName' => $depanneurData['promoteur_name'],
                    'email' => $depanneurData['email'],
                    'password' => 'password123', // Sera hashé automatiquement par le mutateur du modèle
                    'id_type_compte' => $typeCompteDepanneur->id,
                    'id_depanneur' => $depanneur->id,
                    'email_verified' => true,
                ]);
                
                // Assigner des zones (au hasard)
                $randomZones = $zones->random(min(2, $zones->count()));
                $depanneur->zones()->attach($randomZones->pluck('id')->toArray());
                
                $depanneurs[] = $depanneur;
                $this->command->info("  Dépanneur créé: {$depanneurData['etablissement_name']}");
            } else {
                // Mettre à jour les coordonnées si le dépanneur existe déjà
                $depanneur->update([
                    'localisation_actuelle' => $depanneurData['localisation_actuelle'],
                    'status' => 'disponible',
                    'isActive' => true,
                ]);
                $depanneurs[] = $depanneur;
                $this->command->warn("  Dépanneur existant: {$depanneurData['etablissement_name']} - coordonnées mises à jour");
            }
        }

        $this->command->info(count($depanneurs) . ' dépanneurs créés ou existants.');

        // Créer quelques demandes de test si on a des clients et des dépanneurs
        if (count($clients) > 0 && count($depanneurs) > 0) {
            $this->command->info('Création des demandes de test...');

            $statuses = ['en_attente', 'acceptee', 'en_cours', 'terminee', 'annulee'];
            $typesPanne = [
                'Panne moteur',
                'Pneu crevé',
                'Batterie déchargée',
                'Problème de freinage',
                'Démarrage impossible',
                'Surchauffe',
                'Accident léger',
            ];

            for ($i = 0; $i < 15; $i++) {
                $client = $clients[array_rand($clients)];
                $zone = $zones->random();
                $typePanne = $typesPanne[array_rand($typesPanne)];
                $status = $statuses[array_rand($statuses)];
                
                // Coordonnées approximatives de la zone
                $lat = 6.3 + (mt_rand(-100, 100) / 1000);
                $lng = 2.3 + (mt_rand(-100, 100) / 1000);

                // Générer un code unique
                $uniqueId = strtoupper(substr(md5(time() . $i . $client->id), 0, 8));
                $description = $typePanne . ' - Description de l\'incident sur le véhicule';

                $demande = Demande::create([
                    'codeDemande' => 'DEM-' . $uniqueId,
                    'localisation' => $lat . ',' . $lng,
                    'descriptionProbleme' => $description,
                    'status' => $status,
                    'id_client' => $client->id,
                    'id_depanneur' => $status !== 'en_attente' ? $depanneurs[array_rand($depanneurs)]->id : null,
                ]);

                $this->command->info("  Demande créée: {$demande->codeDemande} - {$status}");
            }

            $this->command->info('15 demandes créées.');
        }

        $this->command->info('=');
        $this->command->info('Données de démonstration créées avec succès!');
        $this->command->info('Clients: ' . count($clients));
        $this->command->info('Dépanneurs: ' . count($depanneurs));
        $this->command->info('Zones: ' . $zones->count());
        $this->command->info('Coordonnées des dépanneurs: 6.517555, 2.349466');
        $this->command->info('=');
    }
}

