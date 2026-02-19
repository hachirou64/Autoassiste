<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Ajoute les colonnes manquantes pour l'inscription complète des depanneurs
     */
    public function up(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            // Adresse du garage
            $table->string('adresse', 500)->nullable()->after('localisation_actuelle');
            
            // Services proposés (stockés en JSON)
            $table->json('services')->nullable()->after('adresse');
            
            // Méthodes de paiement acceptées (stockées en JSON)
            $table->json('methode_payement')->nullable()->after('services');
            
            // Disponibilité
            $table->string('disponibilite', 50)->nullable()->after('methode_payement');
            
            // Jours de travail (stockés en JSON)
            $table->json('jours_travail')->nullable()->after('disponibilite');
            
            // Numéro Mobile Money
            $table->string('numero_mobile_money', 20)->nullable()->after('jours_travail');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->dropColumn([
                'adresse',
                'services',
                'methode_payement',
                'disponibilite',
                'jours_travail',
                'numero_mobile_money',
            ]);
        });
    }
};

