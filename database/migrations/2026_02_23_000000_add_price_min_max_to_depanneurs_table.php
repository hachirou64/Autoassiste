<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->decimal('price_min', 10, 2)->nullable()->after('localisation_actuelle');
            $table->decimal('price_max', 10, 2)->nullable()->after('price_min');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('depanneurs', function (Blueprint $table) {
            $table->dropColumn(['price_min', 'price_max']);
        });
    }
};

