import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Icônes personnalisées pour Leaflet
const createIcon = (color: 'blue' | 'red' | 'green' | 'grey' | 'yellow', size: number = 25) => {
    return L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        iconSize: [size, size * 1.6],
        iconAnchor: [size / 2, size * 1.6],
        popupAnchor: [0, -size * 1.4],
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        shadowSize: [size, size * 1.6],
        shadowAnchor: [size / 2, size * 1.6],
    });
};

export interface LocationMarker {
    lat: number;
    lng: number;
    label: string;
    icon?: 'client' | 'depanneur' | 'destination' | 'user';
    popup?: string;
    tooltip?: string;
}

export interface MapRoute {
    coordinates: Array<{ lat: number; lng: number }>;
    color?: string;
    weight?: number;
    dashArray?: string;
}

export interface MapProps {
    center?: { lat: number; lng: number };
    markers?: LocationMarker[];
    routes?: MapRoute[];
    zoom?: number;
    height?: string;
    width?: string;
    scrollWheelZoom?: boolean;
    zoomControl?: boolean;
    fitBounds?: boolean;
    onMapClick?: (coords: { lat: number; lng: number }) => void;
    className?: string;
}

export default function Map({
    center = { lat: 48.8566, lng: 2.3522 }, // Paris par défaut
    markers = [],
    routes = [],
    zoom = 13,
    height = '400px',
    width = '100%',
    scrollWheelZoom = true,
    zoomControl = true,
    fitBounds = false,
    onMapClick,
    className = '',
}: MapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const polylinesRef = useRef<L.Polyline[]>([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    // Initialiser la carte
    useEffect(() => {
        if (!mapRef.current) {
            // Créer la carte
            mapRef.current = L.map('map', {
                center: [center.lat, center.lng],
                zoom,
                scrollWheelZoom,
                zoomControl,
                attributionControl: true,
            });

            // Ajouter les tuiles OpenStreetMap
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                maxZoom: 19,
            }).addTo(mapRef.current);

            setMapLoaded(true);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Mettre à jour les marqueurs
    useEffect(() => {
        if (!mapRef.current || !mapLoaded) return;

        // Nettoyer les anciens marqueurs
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        // Nettoyer les anciennes polylignes
        polylinesRef.current.forEach((polyline) => polyline.remove());
        polylinesRef.current = [];

        // Ajouter les nouvelles polylignes
        if (routes.length > 0 && mapRef.current) {
            routes.forEach((route) => {
                const polyline = L.polyline(
                    route.coordinates.map((c) => [c.lat, c.lng]),
                    {
                        color: route.color ?? '#3b82f6',
                        weight: route.weight ?? 4,
                        opacity: 0.8,
                        dashArray: route.dashArray ?? undefined,
                    }
                ).addTo(mapRef.current!);
                polylinesRef.current.push(polyline);
            });
        }

        // Ajouter les nouveaux marqueurs
        if (mapRef.current && markers.length > 0) {
            markers.forEach((markerData) => {
                let icon;
                switch (markerData.icon) {
                    case 'client':
                        icon = createIcon('blue');
                        break;
                    case 'depanneur':
                        icon = createIcon('red');
                        break;
                    case 'destination':
                        icon = createIcon('green');
                        break;
                    case 'user':
                        icon = createIcon('yellow');
                        break;
                    default:
                        icon = createIcon('grey');
                }

                const marker = L.marker([markerData.lat, markerData.lng], { icon });

                // Ajouter le popup
                if (markerData.popup) {
                    marker.bindPopup(markerData.popup);
                } else if (markerData.label) {
                    marker.bindPopup(`<strong>${markerData.label}</strong>`);
                }

                // Ajouter le tooltip
                if (markerData.tooltip) {
                    marker.bindTooltip(markerData.tooltip);
                } else if (markerData.label) {
                    marker.bindTooltip(markerData.label);
                }

                marker.addTo(mapRef.current!);
                markersRef.current.push(marker);
            });

            // Ajuster le zoom sur les marqueurs si demandé
            if (fitBounds && markersRef.current.length > 0) {
                const group = new L.FeatureGroup(markersRef.current);
                mapRef.current.fitBounds(group.getBounds().pad(0.1));
            }
        } else if (mapRef.current) {
            // Mettre à jour le centre et le zoom
            mapRef.current.setView([center.lat, center.lng], zoom);
        }
    }, [center, markers, routes, zoom, fitBounds, mapLoaded]);

    // Gestionnaire de clic sur la carte
    useEffect(() => {
        if (!mapRef.current || !onMapClick) return;

        const handleClick = (e: L.LeafletMouseEvent) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        };

        mapRef.current.on('click', handleClick);

        return () => {
            mapRef.current?.off('click', handleClick);
        };
    }, [onMapClick]);

    return (
        <div
            id="map"
            style={{
                height,
                width,
                borderRadius: '0.5rem',
            }}
            className={`${className} border border-slate-600`}
        />
    );
}

/**
 * Utilitaire pour centrer la carte sur plusieurs points
 */
export function getBoundsCenter(
    points: Array<{ lat: number; lng: number }>
): { lat: number; lng: number } | null {
    if (points.length === 0) return null;

    const sum = points.reduce(
        (acc, point) => ({
            lat: acc.lat + point.lat,
            lng: acc.lng + point.lng,
        }),
        { lat: 0, lng: 0 }
    );

    return {
        lat: sum.lat / points.length,
        lng: sum.lng / points.length,
    };
}

/**
 * Calculer les bounds pour afficher tous les points
 */
export function getBounds(
    points: Array<{ lat: number; lng: number }>
): [[number, number], [number, number]] | null {
    if (points.length === 0) return null;

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    points.forEach((point) => {
        minLat = Math.min(minLat, point.lat);
        maxLat = Math.max(maxLat, point.lat);
        minLng = Math.min(minLng, point.lng);
        maxLng = Math.max(maxLng, point.lng);
    });

    return [
        [minLat, minLng],
        [maxLat, maxLng],
    ];
}

