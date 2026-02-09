<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->text('message');
            $table->enum('type', [
                'nouvelle_demande',
                'demande_acceptee',
                'depanneur_en_route',
                'intervention_terminee',
                'paiement_recu',
                'alerte_systeme'
            ]);
            $table->boolean('isRead')->default(false);
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            $table->foreignId('id_client')->nullable()->constrained('clients')->onDelete('cascade');
            $table->foreignId('id_demande')->nullable()->constrained('demandes')->onDelete('cascade');
            $table->foreignId('id_depanneur')->nullable()->constrained('depanneurs')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};