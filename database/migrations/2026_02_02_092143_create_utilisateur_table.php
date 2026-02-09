<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id();
            $table->string('fullName');
            $table->string('email')->unique();
            $table->string('password');
            $table->boolean('boolean')->default(false); // email_verified
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('createdAt')->useCurrent();
            $table->timestamp('updatedAt')->useCurrent()->useCurrentOnUpdate();
            $table->string('created_By')->nullable();
            $table->string('updatedBy')->nullable();
            $table->string('DeleteedBy')->nullable();
            $table->foreignId('id_type_compte')->constrained('type_comptes')->onDelete('cascade');
            $table->foreignId('id_client')->nullable()->constrained('clients')->onDelete('set null');
            $table->foreignId('id_depanneur')->nullable()->constrained('depanneurs')->onDelete('set null');
            $table->rememberToken();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};