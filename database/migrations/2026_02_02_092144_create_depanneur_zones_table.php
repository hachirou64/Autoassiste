<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depanneur_zones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_depanneur')->constrained('depanneurs')->onDelete('cascade');
            $table->foreignId('id_zone')->constrained('zones')->onDelete('cascade');
            $table->integer('priorite')->default(1);
            $table->timestamp('dateAjout')->useCurrent();
           
            
            // Éviter les doublons
            $table->unique(['id_depanneur', 'id_zone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depanneur_zones');
    }
};