<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Renommer la colonne 'boolean' en 'email_verified' dans la table 'utilisateurs'
        Schema::table('utilisateurs', function (Blueprint $table) {
            if (Schema::hasColumn('utilisateurs', 'boolean')) {
                $table->renameColumn('boolean', 'email_verified');
            }
        });
    }

    public function down(): void
    {
        // Renommer la colonne 'email_verified' en 'boolean' (rollback)
        Schema::table('utilisateurs', function (Blueprint $table) {
            if (Schema::hasColumn('utilisateurs', 'email_verified')) {
                $table->renameColumn('email_verified', 'boolean');
            }
        });
    }
};

