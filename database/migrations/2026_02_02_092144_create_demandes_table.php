<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->string('codeDemande')->unique();
            $table->string('localisation'); // coordonnées GPS
            $table->text('descriptionProbleme');
            $table->enum('status', ['en_attente', 'acceptee', 'en_cours', 'terminee', 'annulee'])->default('en_attente');
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('acceptedAt')->nullable();
            $table->timestamp('completedAt')->nullable();
            $table->foreignId('id_client')->constrained('clients')->onDelete('cascade');
            $table->foreignId('id_depanneur')->nullable()->constrained('depanneurs')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};