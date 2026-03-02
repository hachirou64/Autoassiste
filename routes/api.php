<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DemandeController;
use App\Http\Controllers\DepanneurController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\GeocodingController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EmailRegistrationController;
use App\Http\Controllers\Api\ClientRegistrationController;



// ==================== AUTHENTIFICATION ====================

// Routes d'authentification sociale (Google, Facebook)
Route::prefix('auth')->group(function () {
    Route::get('/{provider}', [App\Http\Controllers\SocialAuthController::class, 'redirectToProvider'])->name('auth.social');
    Route::get('/{provider}/callback', [App\Http\Controllers\SocialAuthController::class, 'handleProviderCallback'])->name('auth.social.callback');
});

// Routes pour gérer les sessions
Route::get('/auth/check-session', [App\Http\Controllers\AuthController::class, 'checkSession'])->name('api.auth.check-session');
Route::post('/auth/reauth', [App\Http\Controllers\AuthController::class, 'reauth'])->name('api.auth.reauth');

// API Routes pour l'inscription par email - Accès restreint aux visiteurs uniquement
Route::prefix('auth')->middleware('guest')->group(function () {
    Route::post('/send-otp', [App\Http\Controllers\Api\EmailRegistrationController::class, 'sendOtp'])->name('api.auth.send-otp');
    Route::post('/verify-otp', [App\Http\Controllers\Api\EmailRegistrationController::class, 'verifyOtp'])->name('api.auth.verify-otp');
    Route::post('/resend-otp', [App\Http\Controllers\Api\EmailRegistrationController::class, 'resendOtp'])->name('api.auth.resend-otp');
    Route::post('/complete-registration', [App\Http\Controllers\Api\EmailRegistrationController::class, 'completeRegistration'])->name('api.auth.complete-registration');
});

// API Routes pour l'inscription dépanneur - Accès restreint aux visiteurs uniquement
Route::prefix('depanneur')->middleware('guest')->group(function () {
    Route::post('/register', [DepanneurController::class, 'register'])->name('depanneur.register');
    Route::get('/profile', [DepanneurController::class, 'profile'])->name('depanneur.profile');
    Route::put('/profile', [DepanneurController::class, 'updateProfile'])->name('depanneur.profile.update');
});

// ==================== CLIENT ====================

// API Routes pour les demandes clients
Route::prefix('demandes')->middleware(['auth:web'])->group(function () {
    Route::post('/', [DemandeController::class, 'storeApi'])->name('api.demandes.store');
    Route::get('/', [DemandeController::class, 'getClientDemandes'])->name('api.demandes.index');
    Route::get('/{id}', [DemandeController::class, 'show'])->name('api.demandes.show');
    Route::post('/{id}/cancel', [DemandeController::class, 'cancel'])->name('api.demandes.cancel');
    Route::post('/{id}/payment', [DemandeController::class, 'processPayment'])->name('api.demandes.payment');
    Route::post('/{id}/evaluate', [DemandeController::class, 'evaluate'])->name('api.demandes.evaluate');
});

// Route pour les données du dashboard client
Route::get('/client/dashboard', [DashboardController::class, 'getClientDashboardData'])->name('api.client.dashboard');

// API Routes Client pour les messages de contact - Public (pour envoyer)
Route::prefix('contact')->group(function () {
    Route::post('/send', [ContactController::class, 'store'])->name('contact.send');
});

// API Routes Client pour les messages de contact - Protégées
Route::prefix('admin/contact')->middleware(['auth'])->group(function () {
    Route::get('/messages', [ContactController::class, 'index'])->name('contact.messages');
    Route::get('/pending-count', [ContactController::class, 'pendingCount'])->name('contact.pending-count');
    Route::post('/{id}/mark-read', [ContactController::class, 'markAsRead'])->name('contact.mark-read');
    Route::post('/{id}/reply', [ContactController::class, 'reply'])->name('contact.reply');
    Route::delete('/{id}', [ContactController::class, 'destroy'])->name('contact.delete');
});

// API Routes pour l'inscription client (simple)
Route::prefix('client')->group(function () {
    Route::get('/check-auth', [ClientRegistrationController::class, 'checkAuth'])->name('client.check-auth');
});

// Route web pour l'inscription client (retourne une réponse Inertia) - Accès restreint aux visiteurs uniquement
Route::post('/client/register', [ClientRegistrationController::class, 'register'])->name('client.register.web')->middleware('guest');

// Routes Client - Notifications
Route::prefix('client')->middleware(['auth:web'])->group(function () {
    // Notifications
    Route::get('/notifications', [NotificationController::class, 'indexApi'])->name('client.api.notifications');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsReadApi'])->name('client.api.notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsReadApi'])->name('client.api.notifications.read-all');
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCountApi'])->name('client.api.notifications.unread-count');
    
    // Factures - Paiement
    Route::post('/factures/{id}/payer', [FactureController::class, 'payerApi'])->name('client.factures.payer');
    Route::get('/factures/{id}/payment-data', [FactureController::class, 'getForPayment'])->name('client.factures.payment-data');
    
    // Interventions - Détails
    Route::get('/intervention/{id}', [DemandeController::class, 'getInterventionDetails'])->name('client.intervention.details');
});

// ==================== DEPANNEUR ====================

// API Routes pour le Dépanneur
Route::prefix('depanneur')->middleware(['auth'])->group(function () {
    // Statut de disponibilité
    Route::post('/status', [DashboardController::class, 'updateDepanneurStatus'])->name('depanneur.api.status');
    
    // Demandes
    Route::get('/demandes', [DashboardController::class, 'getDepanneurDemandes'])->name('depanneur.api.demandes');
    Route::post('/demandes/{id}/accepter', [DashboardController::class, 'acceptDemande'])->name('depanneur.api.demandes.accept');
    Route::post('/demandes/{id}/refuser', [DashboardController::class, 'refuseDemande'])->name('depanneur.api.demandes.refuse');
    
    // Interventions
    Route::post('/interventions/{id}/start', [DashboardController::class, 'startIntervention'])->name('depanneur.api.interventions.start');
    Route::post('/interventions/{id}/end', [DashboardController::class, 'endIntervention'])->name('depanneur.api.interventions.end');
    
    // Localisation
    Route::post('/location', [DashboardController::class, 'updateLocation'])->name('depanneur.api.location');
    Route::get('/location', [DashboardController::class, 'getLocation'])->name('depanneur.api.location.get');
    
    // Notifications
    Route::get('/notifications', [DashboardController::class, 'getDepanneurNotifications'])->name('depanneur.api.notifications');
    Route::post('/notifications/{id}/read', [DashboardController::class, 'markNotificationRead'])->name('depanneur.api.notifications.read');
    
    // Statistiques
    Route::get('/stats', [DashboardController::class, 'getDepanneurStats'])->name('depanneur.api.stats');
    
    // Historique des interventions
    Route::get('/interventions/history', [DashboardController::class, 'getInterventionHistory'])->name('depanneur.api.interventions.history');
    
    // Données financières
    Route::get('/financial', [DashboardController::class, 'getFinancialData'])->name('depanneur.api.financial');
});

// ==================== ADMIN ====================

// Routes Admin API - Protégées par authentification
Route::prefix('admin')->middleware(['auth'])->group(function () {
    // Dashboard Admin - API
    Route::get('/stats', [DashboardController::class, 'getGlobalStats'])->name('admin.api.stats');
    Route::get('/trends', [DashboardController::class, 'getTrendsData'])->name('admin.api.trends');
    Route::get('/alerts', [DashboardController::class, 'getAlerts'])->name('admin.api.alerts');
    Route::get('/recent-activities', [DashboardController::class, 'getRecentActivitiesApi'])->name('admin.api.recent-activities');
    
    // Clients API
    Route::get('/clients', [DashboardController::class, 'clientsApi'])->name('admin.api.clients');
    Route::post('/clients', [ClientController::class, 'storeApi'])->name('admin.api.clients.store');
    Route::get('/clients/{client}', [ClientController::class, 'showApi'])->name('admin.api.clients.show');
    Route::put('/clients/{client}', [ClientController::class, 'updateApi'])->name('admin.api.clients.update');
    Route::delete('/clients/{client}', [ClientController::class, 'destroyApi'])->name('admin.api.clients.destroy');
    Route::post('/clients/{client}/restore', [ClientController::class, 'restoreApi'])->name('admin.api.clients.restore');
    
    // Dépanneurs API
    Route::get('/depanneurs', [DashboardController::class, 'depanneursApi'])->name('admin.api.depanneurs');
    Route::get('/depanneurs/pending', [DashboardController::class, 'depanneursEnAttente'])->name('admin.api.depanneurs.pending');
    Route::post('/depanneurs', [DepanneurController::class, 'storeApi'])->name('admin.api.depanneurs.store');
    
    // Activation/Désactivation compte dépanneur (Admin)
    Route::post('/depanneurs/{depanneur}/toggle-status', [DepanneurController::class, 'toggleStatus'])->name('admin.depanneur.toggle-status');
    Route::post('/depanneurs/{depanneur}/activate', [DepanneurController::class, 'activate'])->name('admin.depanneur.activate');
    Route::post('/depanneurs/{depanneur}/deactivate', [DepanneurController::class, 'deactivate'])->name('admin.depanneur.deactivate');
    Route::get('/depanneurs/{depanneur}', [DepanneurController::class, 'show'])->name('admin.depanneur.show');
    Route::put('/depanneurs/{depanneur}', [DepanneurController::class, 'update'])->name('admin.depanneur.update');
    Route::post('/depanneurs/{depanneur}/validate-ifu', [DepanneurController::class, 'validateIFU'])->name('admin.depanneur.validate-ifu');
    Route::delete('/depanneurs/{depanneur}', [DepanneurController::class, 'destroy'])->name('admin.depanneur.destroy');
    Route::post('/depanneurs/{depanneur}/restore', [DepanneurController::class, 'restoreApi'])->name('admin.depanneur.restore');
    
    // Demandes API
    Route::get('/demandes', [DashboardController::class, 'demandes'])->name('admin.api.demandes');
    
    // Interventions API
    Route::get('/interventions', [DashboardController::class, 'interventions'])->name('admin.api.interventions');
    
// Factures API
    Route::get('/factures', [DashboardController::class, 'factures'])->name('admin.api.factures');
    Route::post('/factures/{id}/payer', [FactureController::class, 'payerApi'])->name('api.factures.payer');
    
    // Rapports API
    Route::get('/rapports', [DashboardController::class, 'rapports'])->name('admin.api.rapports');
});

// ==================== GÉOCODAGE ====================

// API Routes pour le géocodage (gratuit avec Nominatim/OpenStreetMap)
Route::prefix('geocode')->group(function () {
    // Géocodage inverse : coordonnées → adresse
    Route::get('/reverse', [GeocodingController::class, 'reverse'])->name('geocode.reverse');
    
    // Recherche d'adresse : adresse → coordonnées
    Route::get('/search', [GeocodingController::class, 'search'])->name('geocode.search');
    
    // Calcul de distance et ETA entre deux points
    Route::get('/distance', [GeocodingController::class, 'distance'])->name('geocode.distance');
});

// ==================== DÉPANNEURS PUBLICS ====================

// API Route pour obtenir les dépanneurs disponibles proches
Route::get('/depanneurs/nearby', [DemandeController::class, 'getNearbyDepanneurs'])->name('api.depanneurs.nearby');

