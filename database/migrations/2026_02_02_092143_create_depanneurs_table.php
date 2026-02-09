<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('depanneurs', function (Blueprint $table) {
            $table->id();
            $table->string('promoteur_name');
            $table->string('etablissement_name');
            $table->string('IFU')->unique();
            $table->string('email')->unique();
            $table->string('phone');
            $table->enum('status', ['disponible', 'occupe', 'hors_service'])->default('disponible');
            $table->boolean('isActive')->default(true);
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('depanneurs');
    }
};