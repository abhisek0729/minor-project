"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ExternalLink,
  Loader2,
  LocateFixed,
  MapPin,
  Search,
  Crosshair,
  CheckCircle2,
  Compass,
  Plus,
  Minus,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface LocationMapPickerProps {
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  onChange: (location: {
    latitude: number;
    longitude: number;
    address: string;
    mapQuery: string;
  }) => void;
  label?: string;
  description?: string;
  defaultZoom?: number;
}

export const NEPAL_CITY_COORDINATES: Record<string, { lat: number; lng: number; province: string }> = {
  "Dharan": { lat: 26.8124, lng: 87.2834, province: "Koshi" },
  "Itahari": { lat: 26.6631, lng: 87.2776, province: "Koshi" },
  "Biratnagar": { lat: 26.4525, lng: 87.2718, province: "Koshi" },
  "Bhedetar": { lat: 26.8789, lng: 87.3292, province: "Koshi" },
  "Ilam": { lat: 26.9113, lng: 87.9275, province: "Koshi" },
  "Birtamod": { lat: 26.6437, lng: 87.9892, province: "Koshi" },
  "Damak": { lat: 26.6644, lng: 87.6974, province: "Koshi" },
  "Kathmandu": { lat: 27.7172, lng: 85.3240, province: "Bagmati" },
  "Thamel": { lat: 27.7152, lng: 85.3123, province: "Bagmati" },
  "Lalitpur": { lat: 27.6588, lng: 85.3247, province: "Bagmati" },
  "Bhaktapur": { lat: 27.6710, lng: 85.4298, province: "Bagmati" },
  "Nagarkot": { lat: 27.7174, lng: 85.5204, province: "Bagmati" },
  "Hetauda": { lat: 27.4285, lng: 85.0331, province: "Bagmati" },
  "Pokhara": { lat: 28.2096, lng: 83.9856, province: "Gandaki" },
  "Lakeside": { lat: 28.2120, lng: 83.9570, province: "Gandaki" },
  "Bandipur": { lat: 27.9333, lng: 84.4167, province: "Gandaki" },
  "Mustang": { lat: 28.9985, lng: 83.8473, province: "Gandaki" },
  "Jomsom": { lat: 28.7833, lng: 83.7333, province: "Gandaki" },
  "Chitwan": { lat: 27.5794, lng: 84.4989, province: "Bagmati" },
  "Sauraha": { lat: 27.5794, lng: 84.4989, province: "Bagmati" },
  "Butwal": { lat: 27.7006, lng: 83.4484, province: "Lumbini" },
  "Bhairahawa": { lat: 27.5045, lng: 83.4497, province: "Lumbini" },
  "Lumbini": { lat: 27.4839, lng: 83.2760, province: "Lumbini" },
  "Nepalgunj": { lat: 28.0500, lng: 81.6167, province: "Lumbini" },
  "Janakpur": { lat: 26.7288, lng: 85.9244, province: "Madhesh" },
  "Surkhet": { lat: 28.6000, lng: 81.6333, province: "Karnali" },
  "Dhangadhi": { lat: 28.6944, lng: 80.5978, province: "Sudurpashchim" },
};

const POPULAR_HUBS = [
  { name: "Dharan (Bhanu Chowk)", lat: 26.8124, lng: 87.2834 },
  { name: "Pokhara (Lakeside)", lat: 28.2096, lng: 83.9856 },
  { name: "Kathmandu (Thamel)", lat: 27.7172, lng: 85.3240 },
  { name: "Butwal (Traffic Chowk)", lat: 27.7006, lng: 83.4484 },
  { name: "Itahari (Main Chowk)", lat: 26.6631, lng: 87.2776 },
  { name: "Chitwan (Sauraha)", lat: 27.5794, lng: 84.4989 },
  { name: "Lumbini (Mayadevi)", lat: 27.4839, lng: 83.2760 },
  { name: "Biratnagar (Roadcess)", lat: 26.4525, lng: 87.2718 },
  { name: "Bhedetar Viewpoint", lat: 26.8789, lng: 87.3292 },
  { name: "Bandipur Heritage", lat: 27.9333, lng: 84.4167 },
];

export default function LocationMapPicker({
  latitude,
  longitude,
  address = "",
  onChange,
  label = "Pinpoint Exact Location on Map",
  description = "Click anywhere on the map canvas to pinpoint your exact spot, or drag the red marker.",
  defaultZoom = 17,
}: LocationMapPickerProps) {
  const [lat, setLat] = useState<number>(() => latitude || 26.8124);
  const [lng, setLng] = useState<number>(() => longitude || 87.2834);
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [lastUpdatedCity, setLastUpdatedCity] = useState<string>("");
  const [isMapReady, setIsMapReady] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const updateCoordinates = useCallback(
    (newLat: number, newLng: number, newAddr?: string) => {
      const roundedLat = Number(newLat.toFixed(6));
      const roundedLng = Number(newLng.toFixed(6));
      setLat(roundedLat);
      setLng(roundedLng);

      const resolvedAddress = newAddr || address || `Location (${roundedLat}, ${roundedLng})`;
      onChange({
        latitude: roundedLat,
        longitude: roundedLng,
        address: resolvedAddress,
        mapQuery: `${roundedLat},${roundedLng}`,
      });
    },
    [address, onChange]
  );

  // Sync with incoming parent props if changed externally
  useEffect(() => {
    if (latitude && Math.abs(latitude - lat) > 0.00001) setLat(latitude);
    if (longitude && Math.abs(longitude - lng) > 0.00001) setLng(longitude);
  }, [latitude, longitude]);

  // If address contains a known city (e.g. Dharan, Butwal, Pokhara) and user hasn't set coordinates yet
  useEffect(() => {
    if (!address) return;
    for (const [city, coords] of Object.entries(NEPAL_CITY_COORDINATES)) {
      if (address.toLowerCase().includes(city.toLowerCase()) && lastUpdatedCity !== city) {
        setLastUpdatedCity(city);
        if (!latitude && !longitude) {
          updateCoordinates(coords.lat, coords.lng, address);
        }
        break;
      }
    }
  }, [address, lastUpdatedCity, latitude, longitude, updateCoordinates]);

  // Initialize Interactive Leaflet Map (Click & Drag Canvas Pinpoint)
  useEffect(() => {
    let isMounted = true;

    const setupMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || mapInstanceRef.current) return;

      try {
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });

        const initialLat = lat || 26.8124;
        const initialLng = lng || 87.2834;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: defaultZoom,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap",
        }).addTo(map);

        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          autoPan: true,
        }).addTo(map);

        // Marker Drag Event
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          updateCoordinates(pos.lat, pos.lng);
          toast.success(`Pinned location: ${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
        });

        // Map Click Event: Click anywhere to drop and move pin
        map.on("click", (e: any) => {
          const { lat: clickLat, lng: clickLng } = e.latlng;
          marker.setLatLng([clickLat, clickLng]);
          map.panTo([clickLat, clickLng]);
          updateCoordinates(clickLat, clickLng);
          toast.success(`Pinned location: ${clickLat.toFixed(5)}, ${clickLng.toFixed(5)}`);
        });

        map.on("zoomend", () => {
          setCurrentZoom(map.getZoom());
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        if (isMounted) setIsMapReady(true);
      } catch (err) {
        console.warn("Leaflet Map init error:", err);
      }
    };

    if ((window as any).L) {
      setupMap();
    } else {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        if (isMounted) setupMap();
      };
      document.body.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Synchronize Leaflet map view whenever coordinates change
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      const currentMarker = markerRef.current.getLatLng();
      if (
        Math.abs(currentMarker.lat - lat) > 0.00001 ||
        Math.abs(currentMarker.lng - lng) > 0.00001
      ) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.flyTo([lat, lng], mapInstanceRef.current.getZoom() || defaultZoom, {
          duration: 0.8,
        });
      }
    }
  }, [lat, lng, defaultZoom]);

  // Search Address or Landmark via OpenStreetMap Nominatim Geocoder
  const handleSearchLocation = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check local Nepal preset matches first
    const queryLower = searchQuery.toLowerCase().trim();
    for (const [city, coords] of Object.entries(NEPAL_CITY_COORDINATES)) {
      if (queryLower === city.toLowerCase() || queryLower.includes(city.toLowerCase())) {
        updateCoordinates(coords.lat, coords.lng, searchQuery);
        toast.success(`Pinned location to ${city}, Nepal`);
        return;
      }
    }

    setIsSearching(true);
    try {
      const endpoint = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ", Nepal"
      )}&limit=1`;
      const res = await fetch(endpoint, {
        headers: { "Accept-Language": "en" },
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const foundLat = parseFloat(data[0].lat);
        const foundLng = parseFloat(data[0].lon);
        updateCoordinates(foundLat, foundLng, data[0].display_name);
        toast.success(`Location found: ${data[0].display_name.split(",")[0]}`);
      } else {
        toast.error("Location not found. Try searching a major city, landmark, or street in Nepal.");
      }
    } catch {
      toast.error("Could not search location. Please use manual coordinate entry or presets.");
    } finally {
      setIsSearching(false);
    }
  };

  // GPS Auto-Detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsDetectingGPS(true);
    toast.info("Acquiring GPS coordinates...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedLat = Number(pos.coords.latitude.toFixed(6));
        const detectedLng = Number(pos.coords.longitude.toFixed(6));
        updateCoordinates(detectedLat, detectedLng, `GPS Pin (${detectedLat}, ${detectedLng})`);
        setIsDetectingGPS(false);
        toast.success(`GPS Location Locked: ${detectedLat}, ${detectedLng}`);
      },
      (err) => {
        setIsDetectingGPS(false);
        toast.error(`GPS Error: ${err.message || "Failed to retrieve location"}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Preset Selection
  const handleSelectPreset = (hub: { name: string; lat: number; lng: number }) => {
    updateCoordinates(hub.lat, hub.lng, hub.name);
    toast.success(`Pinned location to ${hub.name}`);
  };

  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
        <div>
          <h4 className="text-sm font-bold flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            {label}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="font-bold text-xs h-8 gap-1.5 rounded-xl cursor-pointer shrink-0 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        >
          {isDetectingGPS ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Acquiring GPS...
            </>
          ) : (
            <>
              <LocateFixed className="size-3.5" />
              Detect GPS Location
            </>
          )}
        </Button>
      </div>

      {/* Address / Landmark Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search landmark (e.g. Bhanu Chowk Dharan, Lakeside Pokhara, Thamel)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                handleSearchLocation();
              }
            }}
            className="pl-9 text-xs h-9"
          />
        </div>
        <Button
          type="button"
          onClick={() => handleSearchLocation()}
          size="sm"
          disabled={isSearching || !searchQuery.trim()}
          className="h-9 px-4 text-xs font-semibold cursor-pointer"
        >
          {isSearching ? <Loader2 className="size-3.5 animate-spin" /> : "Search & Pin"}
        </Button>
      </div>

      {/* Popular Nepal Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Compass className="size-3 text-primary" /> Quick Nepal Tourism Hubs:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_HUBS.map((hub) => (
            <Badge
              key={hub.name}
              variant="outline"
              onClick={() => handleSelectPreset(hub)}
              className="text-xs font-medium py-1 px-2.5 cursor-pointer hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all"
            >
              {hub.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Interactive Leaflet Map Canvas (Click & Drag Anywhere to Pinpoint) */}
      <div className="relative w-full h-80 sm:h-96 rounded-xl overflow-hidden border shadow-inner bg-muted/20">
        <div ref={mapContainerRef} className="w-full h-full z-0 cursor-crosshair" />

        {/* Center Pinpoint Reticle Badge */}
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-sm text-xs font-mono font-bold flex items-center gap-2 z-10 pointer-events-none">
          <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-foreground font-semibold">
            Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
          </span>
          <CheckCircle2 className="size-3.5 text-emerald-600 ml-1" />
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-3 right-3 flex flex-col items-center gap-1 bg-background/95 backdrop-blur-md p-1 rounded-xl border shadow-sm z-10">
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomIn();
              }
            }}
            className="size-7 text-xs font-bold rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
            title="Zoom In"
          >
            <Plus className="size-3.5" />
          </button>
          <span className="text-[10px] font-mono font-bold px-1 select-none">{currentZoom}x</span>
          <button
            type="button"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomOut();
              }
            }}
            className="size-7 text-xs font-bold rounded-lg hover:bg-muted flex items-center justify-center cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <Minus className="size-3.5" />
          </button>
        </div>

        {/* Map Interactive Hint Overlay */}
        <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border shadow-xs text-[10px] text-muted-foreground flex items-center gap-1.5 z-10 pointer-events-none">
          <Crosshair className="size-3 text-primary animate-spin" />
          <span>Click anywhere or drag marker to update location</span>
        </div>

        {/* Direct Google Maps link */}
        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 bg-background/95 hover:bg-background backdrop-blur-md px-3 py-1.5 rounded-xl border shadow-sm text-xs font-bold text-primary flex items-center gap-1.5 transition-all z-10"
        >
          <span>Open in Google Maps</span>
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      {/* Precise Coordinates Inputs with Real-Time Form Sync */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Crosshair className="size-3 text-primary" /> Latitude (Decimal Degrees)
          </label>
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              updateCoordinates(val, lng);
            }}
            placeholder="26.8124"
            className="text-xs font-mono h-9"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Crosshair className="size-3 text-primary" /> Longitude (Decimal Degrees)
          </label>
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              updateCoordinates(lat, val);
            }}
            placeholder="87.2834"
            className="text-xs font-mono h-9"
          />
        </div>
      </div>
    </div>
  );
}
