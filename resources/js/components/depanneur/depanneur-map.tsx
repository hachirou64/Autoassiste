import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation } from 'lucide-react';

interface DepanneurMapProps {
    currentLocation?: { lat: number; lng: number };
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
    
    demandes?: Array<{
        id: number;
        latitude: number;
        longitude: number;
        distance: number;
        typePanne: string;
        codeDemande: string;
    }>;
    
    interventionEnCours?: {
        latitude: number;
        longitude: number;
        adresse: string;
        distance: number;
        dureeEstimee: number;
    };
    
    zones?: Array<{
        id: number;
        name: string;
        color?: string;
        coordinates?: Array<{ lat: number; lng: number }>;
    }>;
    
    rayon?: number;
    onRayonChange?: (rayon: number) => void;
    
    onMarkerClick?: (demandeId: number) => void;
    onAccepterClick?: (demandeId: number) => void;
}

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

export function DepanneurMap({
    currentLocation = { lat: 6.366, lng: 2.433 },
    demandes = [],
    interventionEnCours,
    zones = [],
    onMarkerClick,
}: DepanneurMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);

    const getMarkerStyle = (lat: number, lng: number) => {
        const centerLat = currentLocation.lat;
        const centerLng = currentLocation.lng;
        
        const offsetX = (lng - centerLng) * 10000;
        const offsetY = (centerLat - lat) * 10000;
        
        return {
            left: `calc(50% + ${offsetX}px)`,
            top: `calc(50% + ${offsetY}px)`,
        };
    };

    return (
        <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Carte des interventions
                </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0">
                <div ref={mapRef} className="relative h-96 w-full bg-gray-100">
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full">
                            <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#map-grid)" />
                        </svg>
                    </div>
                    
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
                    
                    <div 
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                        style={{ left: '50%', top: '50%' }}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                                <Navigation className="h-5 w-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-blue-600 rotate-45" />
                            <div className="absolute inset-0 w-10 h-10 bg-blue-600 rounded-full animate-ping opacity-25" />
                        </div>
                    </div>
                    
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
                                {hoveredMarker === demande.id && (
                                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white text-gray-900 text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap z-50 border border-gray-200">
                                        <div className="font-medium">{demande.codeDemande}</div>
                                        <div className="text-gray-500">{demande.distance.toFixed(1)} km</div>
                                    </div>
                                )}
                                
                                <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-lg ${
                                    demande.distance <= 5 ? 'bg-green-500' :
                                    demande.distance <= 10 ? 'bg-blue-500' :
                                    'bg-amber-500'
                                }`}>
                                    {typePanneIcons[demande.typePanne] || '❓'}
                                </div>
                                
                                <div className="absolute -top-1 -right-1 bg-white text-gray-900 text-xs px-1.5 py-0.5 rounded-full shadow">
                                    {demande.distance.toFixed(1)}km
                                </div>
                            </div>
                        </div>
                    ))}
                    
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
                    
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/90 backdrop-blur rounded-lg p-3 flex items-center justify-between shadow-sm border border-gray-200">
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                                    <span className="text-gray-700">Ma position</span>
                                </div>
                                {demandes.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        <span className="text-gray-700">{demandes.length} demande(s)</span>
                                    </div>
                                )}
                                {interventionEnCours && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                                        <span className="text-gray-700">Intervention en cours</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

