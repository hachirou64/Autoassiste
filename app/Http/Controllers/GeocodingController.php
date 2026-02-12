<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class GeocodingController extends Controller
{
    /**
     * Timeout pour les requêtes API (secondes)
     */
    protected int $timeout = 5;

    /**
     * Cache TTL pour les adresses (30 minutes)
     */
    protected int $cacheTtl = 1800;

    /**
     * Géocodage inverse : coordonnées → adresse
     * Utilise Nominatim (OpenStreetMap) - Gratuit
     */
    public function reverse(Request $request)
    {
        $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');
        
        // Clé de cache unique
        $cacheKey = "geocode:reverse:{$latitude},{$longitude}";

        // Vérifier le cache d'abord
        if (Cache::has($cacheKey)) {
            return response()->json([
                'success' => true,
                'cached' => true,
                'data' => Cache::get($cacheKey),
            ]);
        }

        try {
            // Requête vers Nominatim (OpenStreetMap)
            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'User-Agent' => 'GoAssist/1.0 (contact@goassist.app)',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'zoom' => 16, // Niveau de détail approprié pour une adresse
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Erreur lors de la récupération de l\'adresse',
                    'code' => $response->status(),
                ], 500);
            }

            $data = $response->json();

            // Formater la réponse
            $formatted = $this->formatAddress($data, $latitude, $longitude);

            // Mettre en cache
            Cache::put($cacheKey, $formatted, $this->cacheTtl);

            return response()->json([
                'success' => true,
                'cached' => false,
                'data' => $formatted,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur de connexion au service de géocodage',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Géocodage normal : adresse → coordonnées
     * Utilise Nominatim (OpenStreetMap) - Gratuit
     */
    public function search(Request $request)
    {
        $request->validate([
            'q' => 'required|string|min:3|max:200',
            'country' => 'nullable|string|max:2',
            'city' => 'nullable|string|max:100',
        ]);

        $query = $request->input('q');
        $country = $request->input('country', 'bj'); // Par défaut : Bénin
        $city = $request->input('city');

        try {
            $params = [
                'q' => $query,
                'format' => 'json',
                'addressdetails' => 1,
                'limit' => 5,
                'countrycodes' => $country,
            ];

            // Ajouter la ville si spécifiée
            if ($city) {
                $params['city'] = $city;
            }

            $response = Http::timeout($this->timeout)
                ->withHeaders([
                    'User-Agent' => 'GoAssist/1.0 (contact@goassist.app)',
                ])
                ->get('https://nominatim.openstreetmap.org/search', $params);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Erreur lors de la recherche',
                    'code' => $response->status(),
                ], 500);
            }

            $results = $response->json();

            // Formater les résultats
            $formattedResults = collect($results)->map(function ($item) {
                return [
                    'latitude' => (float) $item['lat'],
                    'longitude' => (float) $item['lon'],
                    'display_name' => $item['display_name'],
                    'address' => [
                        'road' => $item['address']['road'] ?? '',
                        'suburb' => $item['address']['suburb'] ?? '',
                        'city' => $item['address']['city'] ?? $item['address']['town'] ?? $item['address']['village'] ?? '',
                        'department' => $item['address']['county'] ?? '',
                        'country' => $item['address']['country'] ?? '',
                        'postcode' => $item['address']['postcode'] ?? '',
                    ],
                    'type' => $item['type'] ?? '',
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'count' => count($formattedResults),
                'results' => $formattedResults,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Erreur de connexion au service de recherche',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Formater l'adresse depuis la réponse Nominatim
     */
    protected function formatAddress(array $data, float $latitude, float $longitude): array
    {
        $address = $data['address'] ?? [];
        
        // Construire l'adresse complète
        $parts = [];
        
        // Rue et numéro
        if (!empty($address['road'])) {
            $parts[] = $address['road'];
            if (!empty($address['house_number'])) {
                $parts[count($parts) - 1] .= ' ' . $address['house_number'];
            }
        }
        
        // Quartier
        if (!empty($address['suburb'])) {
            $parts[] = $address['suburb'];
        }
        
        // Ville
        $city = $address['city'] ?? $address['town'] ?? $address['village'] ?? '';
        if (!empty($city)) {
            $parts[] = $city;
        }
        
        // Département
        if (!empty($address['county'])) {
            $parts[] = $address['county'];
        }
        
        // Pays
        if (!empty($address['country'])) {
            $parts[] = $address['country'];
        }

        return [
            'latitude' => $latitude,
            'longitude' => $longitude,
            'display_name' => $data['display_name'] ?? implode(', ', $parts),
            'formatted_address' => implode(', ', $parts),
            'road' => $address['road'] ?? '',
            'house_number' => $address['house_number'] ?? '',
            'suburb' => $address['suburb'] ?? '',
            'city' => $city,
            'department' => $address['county'] ?? '',
            'country' => $address['country'] ?? '',
            'postcode' => $address['postcode'] ?? '',
            'type' => $data['type'] ?? '',
        ];
    }

    /**
     * Calculer la distance entre deux points (formule Haversine)
     */
    public function distance(Request $request)
    {
        $request->validate([
            'lat1' => 'required|numeric|between:-90,90',
            'lng1' => 'required|numeric|between:-180,180',
            'lat2' => 'required|numeric|between:-90,90',
            'lng2' => 'required|numeric|between:-180,180',
            'unit' => 'nullable|in:km,mi,m',
        ]);

        $lat1 = $request->input('lat1');
        $lng1 = $request->input('lng1');
        $lat2 = $request->input('lat2');
        $lng2 = $request->input('lng2');
        $unit = $request->input('unit', 'km');

        // Rayon de la Terre selon l'unité
        $earthRadius = match ($unit) {
            'mi' => 3958.8, // Miles
            'm' => 6371000, // Mètres
            default => 6371, // Kilomètres
        };

        // Convertir en radians
        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        // Formule de Haversine
        $a = sin($dLat / 2) ** 2 +
             cos($lat1Rad) * cos($lat2Rad) * sin($dLng / 2) ** 2;

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        $distance = $earthRadius * $c;

        // Calculer l'ETA (estimation basée sur 40 km/h en moyenne)
        $etaMinutes = round(($distance / 40) * 60);

        return response()->json([
            'success' => true,
            'data' => [
                'distance' => round($distance, 2),
                'unit' => $unit,
                'eta_minutes' => $etaMinutes,
                'formatted' => $this->formatDistance($distance, $unit),
                'formatted_eta' => $this->formatETA($etaMinutes),
            ],
        ]);
    }

    /**
     * Formater la distance pour l'affichage
     */
    protected function formatDistance(float $distance, string $unit): string
    {
        return match ($unit) {
            'mi' => number_format($distance, 1) . ' mi',
            'm' => number_format($distance, 0) . ' m',
            default => $distance < 1 
                ? number_format($distance * 1000, 0) . ' m' 
                : number_format($distance, 1) . ' km',
        };
    }

    /**
     * Formater l'ETA pour l'affichage
     */
    protected function formatETA(int $minutes): string
    {
        if ($minutes < 1) {
            return 'Moins d\'une minute';
        } elseif ($minutes < 60) {
            return $minutes . ' min';
        } else {
            $hours = intdiv($minutes, 60);
            $mins = $minutes % 60;
            return $hours . 'h' . str_pad($mins, 2, '0', STR_PAD_LEFT);
        }
    }
}

