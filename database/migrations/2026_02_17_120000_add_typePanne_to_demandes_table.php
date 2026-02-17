<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Ajoute la colonne typePanne à la table demandes car elle est utilisée
     * par le formulaire de demande mais n'existe pas encore en base de données.
     */
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            // Types de panne pour les véhicules
            // Voiture: panne_seche, batterie, crevaison, moteur, transmission, Freins, carrosserie, autre
            // Moto: panne_seche, batterie, crevaison, moteur, electrique, autre
            $table->enum('typePanne', [
                'panne_seche',      // Panne sèche - le véhicule ne démarre plus du tout
                'batterie',         // Problème de batterie
                'crevaison',        // Pneumatique - crevaison
                'moteur',           // Problème moteur
                'transmission',     // Boîte de vitesses, embrayage
                'freins',           // Problèmes de freins
                'carrosserie',      // Dommages carrosserie
                'electrique',       // Problème électrique
                'vitres',           // Vitre cassée ou problème de vitre
                'climatisation',    // Problème climatisation
                'autre'             // Autre type de panne
            ])
            ->after('vehicle_type')
            ->default('autre');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn('typePanne');
        });
    }
};

