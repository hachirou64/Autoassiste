<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL ne supporte pas directement la modification des ENUMs,
        // donc nous devons modifier la colonne en utilisant une méthode de contournement
        
        // Étape 1: Ajouter une colonne temporaire
        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type_temp', [
                'nouvelle_demande',
                'demande_recue',
                'demande_acceptee',
                'depannage_en_route',
                'intervention_terminee',
                'paiement_recu',
                'alerte_systeme',
                'evaluation',
                'acceptee',
                'terminee',
            ])->nullable();
        });

        // Étape 2: Copier les données de l'ancienne colonne vers la nouvelle
        DB::statement('UPDATE notifications SET type_temp = type');

        // Étape 3: Supprimer l'ancienne colonne
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        // Étape 4: Renommer la nouvelle colonne
        Schema::table('notifications', function (Blueprint $table) {
            $table->renameColumn('type_temp', 'type');
        });
    }

    public function down(): void
    {
        // Procéder inversement si nécessaire
        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type_temp', [
                'nouvelle_demande',
                'demande_acceptee',
                'depanneur_en_route',
                'intervention_terminee',
                'paiement_recu',
                'alerte_systeme',
            ])->nullable();
        });

        DB::statement('UPDATE notifications SET type_temp = type');

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('type');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->renameColumn('type_temp', 'type');
        });
    }
};

