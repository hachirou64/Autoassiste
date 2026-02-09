<?php

use App\Http\Controllers\MecaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::redirect('/meca-old', '/meca')->name('meca.old');

// Routes Admin - Accessible sans authentification
Route::prefix('admin')->group(function () {
    // Dashboard Admin - utilise la page React admin-dashboard
    Route::get('/dashboard', fn () => Inertia::render('admin-dashboard'))->name('admin.dashboard');
    
    // Routes API pour le dashboard
    Route::get('/api/stats', [App\Http\Controllers\DashboardController::class, 'getGlobalStats'])->name('admin.api.stats');
    Route::get('/api/trends', [App\Http\Controllers\DashboardController::class, 'getTrendsData'])->name('admin.api.trends');
    Route::get('/api/alerts', [App\Http\Controllers\DashboardController::class, 'getAlerts'])->name('admin.api.alerts');
    
    // Clients API
    Route::get('/api/clients', [App\Http\Controllers\DashboardController::class, 'clients'])->name('admin.api.clients');
    
    // Dépanneurs API
    Route::get('/api/depanneurs', [App\Http\Controllers\DashboardController::class, 'depanneurs'])->name('admin.api.depanneurs');
    Route::get('/api/depanneurs/pending', [App\Http\Controllers\DashboardController::class, 'depanneursEnAttente'])->name('admin.api.depanneurs.pending');
    
    // Zones API
    Route::get('/api/zones', [App\Http\Controllers\DashboardController::class, 'zones'])->name('admin.api.zones');
    
    // Demandes API
    Route::get('/api/demandes', [App\Http\Controllers\DashboardController::class, 'demandes'])->name('admin.api.demandes');
    
    // Interventions API
    Route::get('/api/interventions', [App\Http\Controllers\DashboardController::class, 'interventions'])->name('admin.api.interventions');
    
    // Factures API
    Route::get('/api/factures', [App\Http\Controllers\DashboardController::class, 'factures'])->name('admin.api.factures');
    
    // Rapports API
    Route::get('/api/rapports', [App\Http\Controllers\DashboardController::class, 'rapports'])->name('admin.api.rapports');
    
    // Paramètres
    Route::get('/settings', [App\Http\Controllers\DashboardController::class, 'settings'])->name('admin.settings');
});


Route::get('meca', MecaController::class)->name('meca');

// Route Client Dashboard
Route::get('/client/dashboard', function () {
    return Inertia::render('client-dashboard');
})->name('client.dashboard');

// Route Dépanneur Dashboard
Route::get('/depanneur/dashboard', function () {
    return Inertia::render('depanneur-dashboard');
})->name('depanneur.dashboard');

require __DIR__.'/settings.php';

