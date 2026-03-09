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
        Schema::table('factures', function (Blueprint $table) {
            // Mobile Money (MTN) transaction fields
            $table->string('momo_transaction_id', 255)->nullable()->after('mdePaiement');
            $table->string('momo_phone', 20)->nullable()->after('momo_transaction_id');
            $table->string('momo_status', 50)->nullable()->after('momo_phone');
            $table->text('momo_failure_reason')->nullable()->after('momo_status');
            
            // FedaPay transaction fields
            $table->string('fedapay_transaction_id', 255)->nullable()->after('momo_failure_reason');
            $table->string('fedapay_status', 50)->nullable()->after('fedapay_transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('factures', function (Blueprint $table) {
            $table->dropColumn([
                'momo_transaction_id',
                'momo_phone',
                'momo_status',
                'momo_failure_reason',
                'fedapay_transaction_id',
                'fedapay_status',
            ]);
        });
    }
};

