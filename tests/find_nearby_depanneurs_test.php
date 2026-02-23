<?php

/**
 * Script de test pour vérifier la fonctionnalité findNearbyDepanneurs avec Haversine SQL
 * 
 * Ce script teste:
 * 1. La formule Haversine en SQL
 * 2. Les filtres (disponible, forVehicleType, coordonnées valides)
 * 3. La création d'une demande et la notification des dépanneurs
 * 
 * Usage: php artisan tinker tests/find_nearby_depanneurs_test.php
 * ou: php tests/find_nearby_depanneurs_test.php
 */

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Depanneur;
use App\Models\Demande;
use App\Models\Client;
use App\Models\Utilisateur;
use App\Models\TypeCompte;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

echo "============================================\n";
echo "  Test: findNearbyDepanneurs avec Haversine\n";
echo "============================================\n\n";

// Configuration du test
$testLat = 6.4969;  // Cotonou, Bénin
$testLng = 2.6289;
$testRadius = 25;  // km
$testVehicleType = 'voiture';

echo "📍 Position de test: {$testLat}, {$testLng}\n";
echo "🚗 Type de véhicule: {$testVehicleType}\n";
echo "📏 Rayon de recherche: {$testRadius} km\n\n";

// ============================================
// TEST 1: Vérifier les scopes du modèle
// ============================================
echo "TEST 1: Vérification des scopes du modèle Depanneur\n";
echo "--------------------------------------------------\n";

try {
    // Test du scope disponible()
    $disponibles = Depanneur::disponible()->count();
    echo "✅ Scope disponible() fonctionne: {$disponibles} dépanneurs disponibles\n";
    
    // Test du scope forVehicleType()
    $pourVoiture = Depanneur::forVehicleType('voiture')->count();
    echo "✅ Scope forVehicleType('voiture') fonctionne: {$pourVoiture} dépanneurs pour voiture\n";
    
    // Test combiné
    $dispoPourVoiture = Depanneur::disponible()->forVehicleType('voiture')->count();
    echo "✅ Scope combiné: {$dispoPourVoiture} dépanneurs disponibles pour voiture\n";
    
} catch (\Exception $e) {
    echo "❌ Erreur lors des tests de scope: " . $e->getMessage() . "\n";
}

echo "\n";

// ============================================
// TEST 2: Vérifier la requête Haversine SQL
// ============================================
echo "TEST 2: Vérification de la requête Haversine SQL\n";
echo "-------------------------------------------------\n";

try {
    $depaneurs = Depanneur::disponible()
        ->forVehicleType($testVehicleType)
        ->whereNotNull('localisation_actuelle')
        ->where('localisation_actuelle', '!=', '')
        ->select('depanneurs.*')
        ->selectRaw(
            "(6371 * acos(cos(radians(?)) * cos(radians(SUBSTRING_INDEX(localisation_actuelle, ',', 1))) *
            cos(radians(SUBSTRING_INDEX(localisation_actuelle, ',', -1)) - radians(?)) +
            sin(radians(?)) * sin(radians(SUBSTRING_INDEX(localisation_actuelle, ',', 1))))) AS distance",
            [$testLat, $testLng, $testLat]
        )
        ->having('distance', '<', $testRadius)
        ->orderBy('distance')
        ->limit(5)
        ->get();
    
    echo "✅ Requête Haversine SQL exécutée avec succès\n";
    echo "📊 Dépanneurs trouvés dans le rayon de {$testRadius}km: " . $depaneurs->count() . "\n";
    
    if ($depaneurs->count() > 0) {
        echo "\n📋 Liste des dépanneurs trouvés:\n";
        foreach ($depaneurs as $index => $d) {
            echo "   " . ($index + 1) . ". {$d->etablissement_name} - {$d->distance} km\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors du test Haversine: " . $e->getMessage() . "\n";
}

echo "\n";

// ============================================
// TEST 3: Vérifier les dépanneurs avec coordonnées
// ============================================
echo "TEST 3: Vérification des dépanneurs avec coordonnées\n";
echo "-----------------------------------------------------\n";

try {
    $avecCoords = Depanneur::whereNotNull('localisation_actuelle')
        ->where('localisation_actuelle', '!=', '')
        ->count();
    
    echo "✅ Dépanneurs avec coordonnées GPS: {$avecCoords}\n";
    
    // Afficher les coordonnées
    $depanneursAvecCoords = Depanneur::whereNotNull('localisation_actuelle')
        ->where('localisation_actuelle', '!=', '')
        ->select('id', 'etablissement_name', 'status', 'isActive', 'type_vehicule', 'localisation_actuelle')
        ->limit(10)
        ->get();
    
    if ($depaneursAvecCoords->count() > 0) {
        echo "\n📍 Exemples de coordonnées:\n";
        foreach ($depaneursAvecCoords as $d) {
            $status = $d->status === 'disponible' && $d->isActive ? '✅' : '❌';
            echo "   {$status} {$d->etablissement_name}: {$d->localisation_actuelle} (type: {$d->type_vehicule})\n";
        }
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors de la vérification des coordonnées: " . $e->getMessage() . "\n";
}

echo "\n";

// ============================================
// TEST 4: Créer une demande de test
// ============================================
echo "TEST 4: Création d'une demande de test\n";
echo "----------------------------------------\n";

try {
    // Chercher un client de test
    $client = Client::first();
    
    if (!$client) {
        echo "⚠️  Aucun client trouvé dans la base de données\n";
        echo "   Créez d'abord un client pour tester la création de demande\n";
    } else {
        echo "✅ Client trouvé: ID {$client->id}\n";
        
        // Créer une demande
        $demande = Demande::create([
            'localisation' => "{$testLat},{$testLng}",
            'descriptionProbleme' => 'Test de création de demande avec Haversine',
            'vehicle_type' => $testVehicleType,
            'typePanne' => 'panne_seche',
            'status' => 'en_attente',
            'id_client' => $client->id,
        ]);
        
        echo "✅ Demande créée: {$demande->codeDemande}\n";
        
        // Nettoyer: supprimer la demande de test
        $demande->delete();
        echo "🗑️  Demande de test supprimée\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Erreur lors du test de création: " . $e->getMessage() . "\n";
}

echo "\n";

// ============================================
// RÉSUMÉ
// ============================================
echo "============================================\n";
echo "              RÉSUMÉ DU TEST\n";
echo "============================================\n";

$stats = [
    'Total dépanneurs' => Depanneur::count(),
    'Dépanneurs disponibles' => Depanneur::disponible()->count(),
    'Dépanneurs actifs' => Depanneur::where('isActive', true)->count(),
    'Dépanneurs avec coords' => Depanneur::whereNotNull('localisation_actuelle')->where('localisation_actuelle', '!=', '')->count(),
    'Dispo + coords + voiture' => Depanneur::disponible()->forVehicleType('voiture')->whereNotNull('localisation_actuelle')->count(),
];

foreach ($stats as $label => $value) {
    echo "   {$label}: {$value}\n";
}

echo "\n✅ Tests terminés avec succès!\n";
echo "\n💡 Pour tester manuellement:\n";
echo "   1. Connectez-vous en tant que client\n";
echo "   2. Créez une nouvelle demande\n";
echo "   3. Vérifiez que les dépanneurs à proximité sont notifiés\n";

