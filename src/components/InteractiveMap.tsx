import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Search, Check, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  latitude: number;
  longitude: number;
  address: string;
  onLocationChange: (lat: number, lng: number, address: string) => void;
  wardName?: string;
}

export const InteractiveMap: React.FC<Props> = ({
  latitude,
  longitude,
  address,
  onLocationChange,
  wardName,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState(address);

  // Sync internal state with prop
  useEffect(() => {
    setManualAddress(address);
  }, [address]);

  // Reverse geocoding helper
  const reverseGeocode = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setGeoError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const readable = data.display_name;
          setManualAddress(readable);
          onLocationChange(lat, lng, readable);
          return;
        }
      }
    } catch {
      // Graceful fallback to ward-based landmark
    } finally {
      setIsGeocoding(false);
    }

    // Default landmark fallback
    const fallback = `${wardName || 'Municipal Ward'}, Near Drainage Channel, Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    setManualAddress(fallback);
    onLocationChange(lat, lng, fallback);
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Custom Waterlogging Pin Icon
    const customIcon = L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="
          width: 38px;
          height: 38px;
          background: radial-gradient(circle, #0284c7 0%, #0369a1 100%);
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-size: 16px;
            font-weight: bold;
          ">💧</div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

    const initialLat = latitude || 28.6139;
    const initialLng = longitude || 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    // Marker drag event
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      reverseGeocode(position.lat, position.lng);
    });

    // Map click event
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Update marker position when coords change from props
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const current = markerRef.current.getLatLng();
      if (Math.abs(current.lat - latitude) > 0.0001 || Math.abs(current.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  // GPS Device Location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        reverseGeocode(lat, lng);
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        setGeoError('Unable to retrieve your exact GPS position. You can move the marker pin manually on the map.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Search Address / Landmark
  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setGeoError(null);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      if (res.ok) {
        const results = await res.json();
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          const displayName = results[0].display_name;

          if (mapInstanceRef.current && markerRef.current) {
            mapInstanceRef.current.setView([lat, lng], 16);
            markerRef.current.setLatLng([lat, lng]);
          }

          setManualAddress(displayName);
          onLocationChange(lat, lng, displayName);
          setSearchQuery('');
          return;
        }
      }
      setGeoError(`Could not find "${searchQuery}". Please drag the pin on the map to locate.`);
    } catch {
      setGeoError('Location search failed. You can pin the location directly on the map.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualAddressBlur = () => {
    onLocationChange(latitude, longitude, manualAddress);
  };

  return (
    <div className="space-y-4">
      {/* Search and GPS Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchLocation} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search road, junction, market, or landmark..."
            className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isLocating}
          className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 active:scale-95"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Use Current Location</span>
            </>
          )}
        </button>
      </div>

      {geoError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{geoError}</span>
        </div>
      )}

      {/* Map Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
        <div ref={mapContainerRef} className="h-72 w-full z-0 bg-slate-100" />
        
        {/* Map overlay hint */}
        <div className="absolute top-3 left-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm flex items-center gap-2 pointer-events-none">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Drag the blue pin or click on map to pinpoint waterlogging</span>
        </div>

        {isGeocoding && (
          <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-1 rounded-md text-xs text-slate-700 shadow flex items-center gap-2">
            <Loader2 className="w-3 h-3 animate-spin text-teal-600" />
            <span>Updating address...</span>
          </div>
        )}
      </div>

      {/* Coordinates & Readable Address details */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block font-medium">Latitude:</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {latitude ? latitude.toFixed(6) : '28.613900'}° N
            </span>
          </div>
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 block font-medium">Longitude:</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {longitude ? longitude.toFixed(6) : '77.209000'}° E
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            <span>Readable Address / Landmark (Verify & Edit):</span>
          </label>
          <textarea
            rows={2}
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            onBlur={handleManualAddressBlur}
            placeholder="e.g. Near Metro Pillar 142, Opposite South Lake Market, Main Road"
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Ensure nearby road number, market, or landmark is noted so municipal flood crews can locate the site immediately.
          </p>
        </div>
      </div>
    </div>
  );
};
