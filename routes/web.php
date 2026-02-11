<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

// Route Connexion (Inertia)
Route::get('/login', function () {
    return Inertia::render('login');
})->name('login');

// Routes d'authentification sociale (Google, Facebook)
Route::prefix('auth')->group(function () {
    // Routes OAuth génériques avec paramètre provider
    Route::get('/{provider}', [App\Http\Controllers\SocialAuthController::class, 'redirectToProvider'])->name('auth.social');
    Route::get('/{provider}/callback', [App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback'])->name('auth.social.callback');
});

// Routes Admin - Accessible sans authentification
Route::prefix('admin')->group(function () {
    // Dashboard Admin - utilise la page React admin-dashboard
    Route::get('/dashboard', fn () => Inertia::render('admin-dashboard'))->name('admin.dashboard');
    
    // Routes API pour le dashboard
    Route::get('/api/stats', [App\Http\Controllers\DashboardController::class, 'getGlobalStats'])->name('admin.api.stats');
    Route::get('/api/trends', [App\Http\Controllers\DashboardController::class, 'getTrendsData'])->name('admin.api.trends');
    Route::get('/api/alerts', [App\Http\Controllers\DashboardController::class, 'getAlerts'])->name('admin.api.alerts');
    Route::get('/api/recent-activities', [App\Http\Controllers\DashboardController::class, 'getRecentActivitiesApi'])->name('admin.api.recent-activities');
    
    // Clients API
    Route::get('/api/clients', [App\Http\Controllers\DashboardController::class, 'clientsApi'])->name('admin.api.clients');
    
    // Dépanneurs API
    Route::get('/api/depanneurs', [App\Http\Controllers\DashboardController::class, 'depanneursApi'])->name('admin.api.depanneurs');
    Route::get('/api/depanneurs/pending', [App\Http\Controllers\DashboardController::class, 'depanneursEnAttente'])->name('admin.api.depanneurs.pending');
    
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

// Route Inscription Simplifiée (Email + OTP)
Route::get('/register', function () {
    return Inertia::render('register');
})->name('register');

// Route Inscription Dépanneur
Route::get('/register/depanneur', function () {
    return Inertia::render('depanneur-register');
})->name('register.depanneur');

// Ancien lien d'inscription client - redirige vers /register
Route::get('/register/client', function () {
    return redirect()->route('register');
})->name('register.client');

// Route POST Inscription Dépanneur (avec redirection vers dashboard)
Route::post('/depanneur/register', [App\Http\Controllers\DepanneurController::class, 'register'])->name('depanneur.register.post');

// API Routes pour l'inscription par email
Route::prefix('api/auth')->group(function () {
    Route::post('/send-otp', [App\Http\Controllers\Api\EmailRegistrationController::class, 'sendOtp'])->name('api.auth.send-otp');
    Route::post('/verify-otp', [App\Http\Controllers\Api\EmailRegistrationController::class, 'verifyOtp'])->name('api.auth.verify-otp');
    Route::post('/resend-otp', [App\Http\Controllers\Api\EmailRegistrationController::class, 'resendOtp'])->name('api.auth.resend-otp');
    Route::post('/complete-registration', [App\Http\Controllers\Api\EmailRegistrationController::class, 'completeRegistration'])->name('api.auth.complete-registration');
});

// API Routes pour l'inscription dépanneur
Route::prefix('api/depanneur')->group(function () {
    Route::post('/register', [App\Http\Controllers\DepanneurController::class, 'register'])->name('depanneur.register');
    Route::get('/profile', [App\Http\Controllers\DepanneurController::class, 'profile'])->name('depanneur.profile');
    Route::put('/profile', [App\Http\Controllers\DepanneurController::class, 'updateProfile'])->name('depanneur.profile.update');
});

// Route Client Dashboard
Route::get('/client/dashboard', function () {
    return Inertia::render('client-dashboard');
})->name('client.dashboard');

// Route Dashboard (alias for client dashboard)
Route::get('/dashboard', function () {
    return Inertia::render('client-dashboard');
})->name('dashboard');

// Route Nouvelle Demande (protégée - nécessite authentification)
Route::get('/demande/nouvelle', function () {
    return Inertia::render('nouvelle-demande');
})->name('demande.nouvelle')->middleware('auth');

// Route Contact
Route::get('/contact', function () {
    return Inertia::render('contact');
})->name('contact');

// API Routes pour l'inscription client (simple)
Route::prefix('api/client')->group(function () {
    Route::post('/register', [App\Http\Controllers\Api\ClientRegistrationController::class, 'register'])->name('client.register');
    Route::get('/check-auth', [App\Http\Controllers\Api\ClientRegistrationController::class, 'checkAuth'])->name('client.check-auth');
});

// API Route pour les données du dashboard client
Route::get('/api/client/dashboard', [App\Http\Controllers\DashboardController::class, 'getClientDashboardData'])->name('api.client.dashboard');

// API Route pour créer une demande (JSON)
Route::post('/api/demandes', [App\Http\Controllers\DemandeController::class, 'storeApi'])->name('api.demandes.store');

// Route Dépanneur Dashboard
Route::get('/depanneur/dashboard', [App\Http\Controllers\DashboardController::class, 'depanneurDashboard'])->name('depanneur.dashboard');

// API Routes pour le Dépanneur
Route::prefix('api/depanneur')->middleware(['auth'])->group(function () {
    // Statut de disponibilité
    Route::post('/status', [App\Http\Controllers\DashboardController::class, 'updateDepanneurStatus'])->name('depanneur.api.status');
    
    // Demandes
    Route::get('/demandes', [App\Http\Controllers\DashboardController::class, 'getDepanneurDemandes'])->name('depanneur.api.demandes');
    Route::post('/demandes/{id}/accepter', [App\Http\Controllers\DashboardController::class, 'acceptDemande'])->name('depanneur.api.demandes.accept');
    Route::post('/demandes/{id}/refuser', [App\Http\Controllers\DashboardController::class, 'refuseDemande'])->name('depanneur.api.demandes.refuse');
    
    // Interventions
    Route::post('/interventions/{id}/start', [App\Http\Controllers\DashboardController::class, 'startIntervention'])->name('depanneur.api.interventions.start');
    Route::post('/interventions/{id}/end', [App\Http\Controllers\DashboardController::class, 'endIntervention'])->name('depanneur.api.interventions.end');
    
    // Localisation
    Route::post('/location', [App\Http\Controllers\DashboardController::class, 'updateLocation'])->name('depanneur.api.location');
    
    // Notifications
    Route::get('/notifications', [App\Http\Controllers\DashboardController::class, 'getDepanneurNotifications'])->name('depanneur.api.notifications');
    Route::post('/notifications/{id}/read', [App\Http\Controllers\DashboardController::class, 'markNotificationRead'])->name('depanneur.api.notifications.read');
    
    // Statistiques
    Route::get('/stats', [App\Http\Controllers\DashboardController::class, 'getDepanneurStats'])->name('depanneur.api.stats');
});

// Logout Route
Route::post('/logout', function () {
    Auth::logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/');
})->name('logout');

require __DIR__.'/settings.php';

