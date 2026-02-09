<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->decimal('montant', 10, 2);
            $table->enum('mdePaiement', ['cash', 'mobile_money', 'carte_bancaire', 'virement'])->default('cash');
            $table->string('transactionId')->unique();
            $table->enum('status', ['en_attente', 'payee', 'annulee', 'remboursee'])->default('en_attente');
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            $table->timestamp('paidAt')->nullable();
            $table->foreignId('id_intervention')->constrained('interventions')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};