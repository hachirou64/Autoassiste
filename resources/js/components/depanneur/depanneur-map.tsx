import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MapPin, 
    Navigation, 
    LocateFixed,
    Layers,
    ZoomIn,
    ZoomOut,
    Crosshair
} from 'lucide-react';

interface DepanneurMapProps {
    // Position actuelle du dépanneur
    currentLocation?: { lat: number; lng: number };
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
    
    // Demandes disponibles (marqueurs)
    demandes?: Array<{
        id: number;
        latitude: number;
        longitude: number;
        distance: number;
        typePanne: string;
        codeDemande: string;
    }>;
    
    // Intervention en cours
    interventionEnCours?: {
        latitude: number;
        longitude: number;
        adresse: string;
        distance: number;
        dureeEstimee: number;
    };
    
    // Zones d'intervention
    zones?: Array<{
        id: number;
        name: string;
        color?: string;
        coordinates?: Array<{ lat: number; lng: number }>;
    }>;
    
    // Filtre rayon
    rayon: number;
    onRayonChange: (rayon: number) => void;
    
    // Actions
    onMarkerClick?: (demandeId: number) => void;
    onAccepterClick?: (demandeId: number) => void;
}

// Icônes pour les types de panne
const typePanneIcons: Record<string, string> = {
    panne_seche: '⛽',
    batterie: '🔋',
    creaison: '🛞',
    moteur: '⚙️',
    freins: '🛑',
    direction: '🎯',
    electrique: '⚡',
    carrosserie: '🚗',
    autre: '❓',
};

const RAYON_OPTIONS = [
    { value: 5, label: '5 km', color: 'bg-green-500' },
    { value: 10, label: '10 km', color: 'bg-blue-500' },
    { value: 20, label: '20 km', color: 'bg-amber-500' },
    { value: 50, label: '50 km', color: 'bg-purple-500' },
];

export function DepanneurMap({
    currentLocation = { lat: 6.366, lng: 2.433 }, // Default: Cotonou
    onLocationUpdate,
    demandes = [],
    interventionEnCours,
    zones = [],
    rayon,
    onRayonChange,
    onMarkerClick,
    onAccepterClick,
}: DepanneurMapProps) {
    const [isDetecting, setIsDetecting] = useState(false);
    const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
    const mapRef = useRef<HTMLDivElement>(null);
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

    // Simulation de détection de position
    const handleDetectLocation = () => {
        setIsDetecting(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    onLocationUpdate?.({ lat: latitude, lng: longitude });
                    setIsDetecting(false);
                },
                () => {
                    setIsDetecting(false);
                }
            );
        } else {
            setIsDetecting(false);
        }
    };

    // Calculer la position relative des marqueurs (simulée)
    const getMarkerStyle = (lat: number, lng: number) => {
        const centerLat = currentLocation.lat;
        const centerLng = currentLocation.lng;
        
        // Simulation très basique - en production, utiliser Google Maps API
        const offsetX = (lng - centerLng) * 10000;
        const offsetY = (centerLat - lat) * 10000;
        
        return {
            left: `calc(50% + ${offsetX}px)`,
            top: `calc(50% + ${offsetY}px)`,
        };
    };

    return (
        <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-blue-400" />
                        Carte des interventions
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                        {/* Toggle type de carte */}
                        <div className="flex rounded-lg bg-slate-700/50 p-1">
                            <button
                                onClick={() => setMapType('standard')}
                                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                    mapType === 'standard' 
                                        ? 'bg-slate-600 text-white' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Standard
                            </button>
                            <button
                                onClick={() => setMapType('satellite')}
                                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                    mapType === 'satellite' 
                                        ? 'bg-slate-600 text-white' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                Satellite
                            </button>
                        </div>
                        
                        {/* Bouton ma position */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDetectLocation}
                            disabled={isDetecting}
                            className="text-slate-400 hover:text-white"
                        >
                            {isDetecting ? (
                                <LocateFixed className="h-4 w-4 animate-spin" />
                            ) : (
                                <LocateFixed className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {/* Zone de carte */}
                <div 
                    ref={mapRef}
                    className={`relative h-96 w-full ${
                        mapType === 'satellite' 
                            ? 'bg-slate-800' 
                            : 'bg-slate-700'
                    }`}
                    style={{
                        background: mapType === 'satellite'
                            ? 'linear-gradient(135deg, #1a365d 0%, #2d3748 100%)'
                            : undefined,
                    }}
                >
                    {/* Grille de fond pour simuler une carte */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full">
                            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#map-grid)" />
                        </svg>
                    </div>
                    
                    {/* Zones d'intervention surlignées (si applicable) */}
                    {zones.map((zone) => (
                        <div
                            key={zone.id}
                            className={`absolute rounded-full border-2 ${zone.color || 'border-blue-500/30'} opacity-20`}
                            style={{
                                left: '25%',
                                top: '25%',
                                width: '50%',
                                height: '50%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        />
                    ))}
                    
                    {/* Indicateur de rayon */}
                    <div 
                        className="absolute border border-dashed border-blue-500/30 rounded-full pointer-events-none"
                        style={{
                            left: '50%',
                            top: '50%',
                            width: `${rayon * 4}%`,
                            height: `${rayon * 4}%`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    />
                    
                    {/* Position actuelle du dépanneur */}
                    <div 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ left: '50%', top: '50%' }}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                                <Navigation className="h-5 w-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-500 rotate-45" />
                            <div className="absolute inset-0 w-10 h-10 bg-blue-500 rounded-full animate-ping opacity-25" />
                        </div>
                    </div>
                    
                    {/* Marqueurs des demandes disponibles */}
                    {demandes.map((demande) => (
                        <div
                            key={demande.id}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-all duration-200 ${
                                hoveredMarker === demande.id ? 'scale-125 z-30' : ''
                            }`}
                            style={getMarkerStyle(demande.latitude, demande.longitude)}
                            onMouseEnter={() => setHoveredMarker(demande.id)}
                            onMouseLeave={() => setHoveredMarker(null)}
                            onClick={() => onMarkerClick?.(demande.id)}
                        >
                            <div className="relative">
                                {/* Popup au hover */}
                                {hoveredMarker === demande.id && (
                                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50">
                                        <div className="font-medium">{demande.codeDemande}</div>
                                        <div className="text-slate-400">{demande.distance.toFixed(1)} km</div>
                                    </div>
                                )}
                                
                                {/* Marqueur */}
                                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg ${
                                    demande.distance <= 5 ? 'bg-green-500' :
                                    demande.distance <= 10 ? 'bg-blue-500' :
                                    'bg-amber-500'
                                }`}>
                                    {typePanneIcons[demande.typePanne] || '❓'}
                                </div>
                                
                                {/* Badge distance */}
                                <div className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs px-1.5 py-0.5 rounded-full">
                                    {demande.distance.toFixed(1)}km
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Marqueur d'intervention en cours */}
                    {interventionEnCours && (
                        <div
                            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 animate-bounce"
                            style={getMarkerStyle(interventionEnCours.latitude, interventionEnCours.longitude)}
                        >
                            <div className="relative">
                                <div className="w-10 h-10 bg-orange-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                    <span className="text-lg">🚗</span>
                                </div>
                                <div className="absolute inset-0 w-10 h-10 bg-orange-500 rounded-full animate-ping opacity-25" />
                            </div>
                        </div>
                    )}
                    
                    {/* Overlay info */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-slate-900/90 backdrop-blur rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                                    <span className="text-white">Ma position</span>
                                </div>
                                {demandes.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        <span className="text-white">{demandes.length} demande(s)</span>
                                    </div>
                                )}
                                {interventionEnCours && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                                        <span className="text-white">Intervention en cours</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <ZoomOut className="h-4 w-4 text-slate-400" />
                                <div className="w-20 h-1 bg-slate-600 rounded">
                                    <div className="w-1/2 h-full bg-blue-500 rounded" />
                                </div>
                                <ZoomIn className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Filtres par rayon */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-400">Rayon de recherche:</span>
                        </div>
                        <div className="flex gap-2">
                            {RAYON_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onRayonChange(option.value)}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                                        rayon === option.value
                                            ? `${option.color} text-white shadow-lg`
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

