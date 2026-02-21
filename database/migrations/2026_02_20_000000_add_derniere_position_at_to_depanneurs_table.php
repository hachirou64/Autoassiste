<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Ajoute le champ pour suivre la date de dernière mise à jour de position
     */
    public function up(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            // Ajouter un champ pour suivre quand la position a été mise à jour
            $table->timestamp('derniere_position_at')
                ->nullable()
                ->after('localisation_actuelle');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->dropColumn('derniere_position_at');
        });
    }
};

