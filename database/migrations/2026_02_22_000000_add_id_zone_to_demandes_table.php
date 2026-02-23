<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->foreignId('id_zone')->nullable()->constrained('zones')->onDelete('set null');
            $table->index('id_zone');
        });
    }

    public function down(): void
    {
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropForeign(['id_zone']);
            $table->dropIndex(['id_zone']);
            $table->dropColumn('id_zone');
        });
    }
};
