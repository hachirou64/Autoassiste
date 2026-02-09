<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ClearDataExceptSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clear-data-except-super-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clear all database data except the super admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to clear database data except super admin...');

        // Disable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Get the admin type compte
        $adminType = \App\Models\TypeCompte::where('name', 'Admin')->first();

        if (!$adminType) {
            $this->error('Admin type compte not found. Cannot proceed.');
            return;
        }

        // Delete all utilisateurs except super admin (admin type)
        \App\Models\Utilisateur::where('id_type_compte', '!=', $adminType->id)->delete();

        // List of tables to truncate (all except utilisateurs, password_reset_tokens, sessions)
        $tablesToTruncate = [
            'clients',
            'depanneurs',
            'demandes',
            'depanneur_zones',
            'interventions',
            'services',
            'notifications',
            'factures',
            'zones',
            'type_comptes', // Keep type_comptes as it defines roles
        ];

        foreach ($tablesToTruncate as $table) {
            DB::table($table)->truncate();
            $this->info("Truncated table: $table");
        }

        // Truncate password_reset_tokens and sessions
        DB::table('password_reset_tokens')->truncate();
        DB::table('sessions')->truncate();

        // Enable foreign key checks
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->info('Database cleared successfully. Super admin user preserved.');
    }
}
