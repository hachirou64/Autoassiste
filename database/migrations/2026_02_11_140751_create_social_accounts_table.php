<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Table pour stocker les comptes sociaux (Google, Facebook)
     */
    public function up(): void
    {
        Schema::create('social_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('utilisateurs')->onDelete('cascade');
            $table->string('provider_name'); // 'google', 'facebook', etc.
            $table->string('provider_id'); // ID unique du provider
            $table->string('provider_email')->nullable(); // Email du provider
            $table->string('provider_avatar')->nullable(); // URL avatar
            $table->text('access_token')->nullable();
            $table->text('refresh_token')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            // Index unique pour éviter les doublons
            $table->unique(['provider_name', 'provider_id'], 'social_provider_unique');
            
            // Index pour recherche par email provider
            $table->index('provider_email', 'social_email_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_accounts');
    }
};
