import { useEffect, useRef } from 'react';

interface MapsTrackerProps {
    clientLat: number;
    clientLng: number;
    depanneurLat?: number;
    depanneurLng?: number;
    depanneurName?: string;
    height?: string;
}

declare global {
    interface Window {
        L: any;
    }
}

export function MapsTracker({
    clientLat,
    clientLng,
    depanneurLat,
    depanneurLng,
    depanneurName,
    height = 'h-96',
}: MapsTrackerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<any>(null);
    const markers = useRef<any>([]);

    useEffect(() => {
        // Charger Leaflet
        if (!mapContainer.current) return;

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            initializeMap();
        };
        document.head.appendChild(script);

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    const initializeMap = () => {
        if (!mapContainer.current || !window.L) return;

        // Créer la carte centrée sur le client
        map.current = window.L.map(mapContainer.current).setView([clientLat, clientLng], 14);

        // Ajouter les tiles OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map.current);

        // Marqueur du client (rouge)
        const clientMarker = window.L.circleMarker([clientLat, clientLng], {
            radius: 8,
            fillColor: '#ef4444',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
        })
            .bindPopup('Vous êtes ici')
            .addTo(map.current);

        markers.current.push(clientMarker);

        // Marqueur du dépanneur (bleu)
        if (depanneurLat && depanneurLng) {
            const depanneurMarker = window.L.circleMarker([depanneurLat, depanneurLng], {
                radius: 10,
                fillColor: '#3b82f6',
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
            })
                .bindPopup(depanneurName || 'Dépanneur')
                .addTo(map.current);

            markers.current.push(depanneurMarker);

            // Tracer une ligne entre le client et le dépanneur
            const line = window.L.polyline(
                [[clientLat, clientLng], [depanneurLat, depanneurLng]],
                { color: 'blue', weight: 2, opacity: 0.6, dashArray: '5, 5' }
            ).addTo(map.current);

            // Ajuster le zoom pour voir les deux marqueurs
            const group = window.L.featureGroup([clientMarker, depanneurMarker]);
            map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }
    };

    return <div ref={mapContainer} className={`${height} rounded-lg border border-slate-600`} />;
}
