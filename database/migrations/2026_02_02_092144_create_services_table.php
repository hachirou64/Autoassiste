<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_demande')->constrained('demandes')->onDelete('cascade');
            $table->foreignId('id_depanneur')->constrained('depanneurs')->onDelete('cascade');
            $table->enum('action', [
                'remorquage',
                'reparation_sur_place',
                'changement_roue',
                'depannage_batterie',
                'fourniture_carburant',
                'autre'
            ]);
            $table->timestamp('dateAction')->useCurrent();
            $table->text('commentaire')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};