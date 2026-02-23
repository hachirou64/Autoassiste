<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Ajoute la colonne deleted_at pour la suppression logique (soft delete)
     */
    public function up(): void
    {
        // Ajouter deleted_at à la table clients
        Schema::table('clients', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Ajouter deleted_at à la table depanneurs
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->softDeletes();
        });

        // Ajouter deleted_at à la table utilisateurs
        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clients', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('depanneurs', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('utilisateurs', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};

