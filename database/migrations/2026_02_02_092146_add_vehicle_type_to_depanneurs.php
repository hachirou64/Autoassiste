<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->enum('type_vehicule', ['voiture', 'moto', 'les_deux'])
                  ->default('les_deux')
                  ->after('isActive');
            $table->string('localisation_actuelle', 100)
                  ->nullable()
                  ->after('type_vehicule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->dropColumn('type_vehicule');
        });
    }
};

