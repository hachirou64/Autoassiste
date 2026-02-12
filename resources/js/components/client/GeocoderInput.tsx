import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, MapPin, Loader, X, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGeolocation } from '@/hooks/useGeolocation';

export interface AddressResult {
    latitude: number;
    longitude: number;
    display_name: string;
    address: {
        road?: string;
        suburb?: string;
        city?: string;
        department?: string;
        country?: string;
        postcode?: string;
    };
}

export interface GeocoderInputProps {
    /** Emplacements possibles: 'top', 'bottom' */
    position?: 'top' | 'bottom';
    /** Placeholder du champ de recherche */
    placeholder?: string;
    /** Label affiché */
    label?: string;
    /** Fonction appelée quand une adresse est sélectionnée */
    onAddressSelect?: (address: AddressResult) => void;
    /** Fonction appelée quand les coordonnées changent */
    onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
    /** Coordonnées actuelles (si valeur contrôlée) */
    value?: { lat: number; lng: number } | null;
    /** Mode lecture seule */
    readOnly?: boolean;
    /** Largeur maximale du composant */
    maxWidth?: string;
    /** Pays par défaut pour la recherche */
    defaultCountry?: string;
    /** Classe CSS supplémentaire */
    className?: string;
}

export function GeocoderInput({
    position = 'bottom',
    placeholder = 'Rechercher une adresse...',
    label = 'Localisation',
    onAddressSelect,
    onCoordinatesChange,
    value,
    readOnly = false,
    maxWidth = 'max-w-md',
    defaultCountry = 'bj',
    className = '',
}: GeocoderInputProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<AddressResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<AddressResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Géolocalisation automatique
    const { coordinates: geoCoords, loading: geoLoading, error: geoError, getCurrentPosition } = useGeolocation({
        enableHighAccuracy: true,
        timeout: 10000,
    });

    // Effet pour synchroniser avec la valeur contrôlée
    useEffect(() => {
        if (value && !selectedAddress) {
            // Si une valeur est passée mais pas d'adresse sélectionnée,
            // on pourrait faire un géocodage inverse pour obtenir l'adresse
        }
    }, [value, selectedAddress]);

    // Rechercher une adresse avec debounce
    const searchAddress = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 3) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: searchQuery,
                countrycodes: defaultCountry,
                limit: '5',
            });

            const response = await fetch(`/api/geocode/search?${params}`);

            if (!response.ok) {
                throw new Error('Erreur lors de la recherche');
            }

            const data = await response.json();

            if (data.success && data.results) {
                setResults(data.results);
                setIsOpen(true);
            } else {
                setResults([]);
                setError(data.error || 'Aucune adresse trouvée');
            }
        } catch (err) {
            console.error('Erreur de géocodage:', err);
            setError('Impossible de rechercher cette adresse');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [defaultCountry]);

    // Gérer le changement de texte avec debounce
    const handleQueryChange = (newQuery: string) => {
        setQuery(newQuery);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchAddress(newQuery);
        }, 300);
    };

    // Sélectionner une adresse
    const handleSelectAddress = (address: AddressResult) => {
        setSelectedAddress(address);
        setQuery(address.display_name);
        setIsOpen(false);
        setError(null);

        onAddressSelect?.(address);
        onCoordinatesChange?.({ lat: address.latitude, lng: address.longitude });
    };

    // Utiliser la géolocalisation actuelle
    const handleUseCurrentLocation = async () => {
        setError(null);
        
        try {
            const coords = await getCurrentPosition();
            
            if (coords) {
                // Faire un géocodage inverse pour obtenir l'adresse
                const params = new URLSearchParams({
                    latitude: coords.lat.toString(),
                    longitude: coords.lng.toString(),
                });

                const response = await fetch(`/api/geocode/reverse?${params}`);

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.success && data.data) {
                        const address: AddressResult = {
                            latitude: coords.lat,
                            longitude: coords.lng,
                            display_name: data.data.formatted_address,
                            address: {
                                road: data.data.road,
                                suburb: data.data.suburb,
                                city: data.data.city,
                                department: data.data.department,
                                country: data.data.country,
                                postcode: data.data.postcode,
                            },
                        };

                        setSelectedAddress(address);
                        setQuery(address.display_name);
                        onAddressSelect?.(address);
                        onCoordinatesChange?.({ lat: coords.lat, lng: coords.lng });
                    }
                }
            }
        } catch (err) {
            console.error('Erreur géolocalisation:', err);
            setError('Impossible d\'obtenir votre position');
        }
    };

    // Effet pour fermer la liste quand on clique dehors
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Nettoyer le debounce
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    return (
        <div className={`relative ${maxWidth} ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Champ de recherche */}
                <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isLoading ? 'text-slate-400' : 'text-slate-500'}`} />
                    
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => handleQueryChange(e.target.value)}
                        onFocus={() => results.length > 0 && setIsOpen(true)}
                        placeholder={placeholder}
                        disabled={readOnly || geoLoading}
                        className="w-full pl-10 pr-20 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    />

                    {/* Boutons à droite */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        {isLoading && (
                            <Loader className="h-4 w-4 text-slate-400 animate-spin" />
                        )}
                        
                        {query && !isLoading && (
                            <button
                                onClick={() => {
                                    setQuery('');
                                    setSelectedAddress(null);
                                    setResults([]);
                                    onCoordinatesChange?.(null as any);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        {!readOnly && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleUseCurrentLocation}
                                disabled={geoLoading}
                                className="text-xs text-slate-400 hover:text-amber-400 px-2"
                            >
                                <Navigation className="h-3 w-3 mr-1" />
                                {geoLoading ? '...' : 'GPS'}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Liste des résultats */}
                {isOpen && results.length > 0 && (
                    <Card className="absolute z-50 mt-1 w-full bg-slate-800 border-slate-600 shadow-xl">
                        <CardContent className="p-0">
                            <ul className="max-h-60 overflow-y-auto">
                                {results.map((result, index) => (
                                    <li key={index}>
                                        <button
                                            onClick={() => handleSelectAddress(result)}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-700 flex items-start gap-3 transition-colors border-b border-slate-700 last:border-0"
                                        >
                                            <MapPin className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {result.address.road || 'Adresse'}
                                                </p>
                                                <p className="text-xs text-slate-400 truncate">
                                                    {result.address.suburb}, {result.address.city}
                                                </p>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Erreur */}
            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}

            {/* Erreur de géolocalisation */}
            {geoError && !error && (
                <p className="mt-1 text-sm text-orange-400">{geoError}</p>
            )}

            {/* Adresse sélectionnée */}
            {selectedAddress && (
                <div className="mt-2 flex items-center text-sm text-green-400">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{selectedAddress.address.road || selectedAddress.display_name}</span>
                </div>
            )}
        </div>
    );
}

/**
 * Version simplifiée pour utilisation dans les formulaires
 */
export function SimpleGeocoder({
    onChange,
    value,
    label = 'Position',
    required = false,
}: {
    onChange: (coords: { lat: number; lng: number } | null) => void;
    value?: { lat: number; lng: number } | null;
    label?: string;
    required?: boolean;
}) {
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(value || null);
    const { getCurrentPosition, loading, error } = useGeolocation();

    const handleSelectAddress = (address: AddressResult) => {
        setCoords({ lat: address.latitude, lng: address.longitude });
        onChange({ lat: address.latitude, lng: address.longitude });
    };

    const handleUseGPS = async () => {
        const result = await getCurrentPosition();
        if (result) {
            setCoords(result);
            onChange(result);
        }
    };

    return (
        <div className="space-y-2">
            <GeocoderInput
                label={label}
                onAddressSelect={handleSelectAddress}
                onCoordinatesChange={(c) => {
                    setCoords(c);
                    onChange(c);
                }}
                value={coords}
                placeholder="Rechercher une adresse..."
            />

            {!coords && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseGPS}
                    disabled={loading}
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                    {loading ? (
                        <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Localisation en cours...
                        </>
                    ) : (
                        <>
                            <Navigation className="h-4 w-4 mr-2" />
                            Utiliser ma position actuelle
                        </>
                    )}
                </Button>
            )}

            {error && (
                <p className="text-sm text-red-400">{error}</p>
            )}

            {coords && (
                <input type="hidden" name="latitude" value={coords.lat} />
            )}
            {coords && (
                <input type="hidden" name="longitude" value={coords.lng} />
            )}
        </div>
    );
}

