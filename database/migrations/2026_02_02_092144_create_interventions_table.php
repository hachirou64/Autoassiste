<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('interventions', function (Blueprint $table) {
            $table->id();
            $table->string('piecesremplacees')->nullable();
            $table->text('observations')->nullable();
            $table->decimal('coutPiece', 10, 2)->default(0);
            $table->decimal('coutMainOeuvre', 10, 2)->default(0);
            $table->decimal('coutTotal', 10, 2)->default(0);
            $table->enum('status', ['planifiee', 'en_cours', 'terminee', 'annulee'])->default('planifiee');
            $table->timestamp('startedAt')->nullable();
            $table->timestamp('completedAt')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            $table->foreignId('id_demande')->constrained('demandes')->onDelete('cascade');
            $table->foreignId('id_depanneur')->constrained('depanneurs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('interventions');
    }
};