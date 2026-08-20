"use client";

import { useState } from "react";
import {
  ExternalLink,
  Loader2,
  LocateFixed,
  MapPin,
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

const NEPAL_PRESETS = [
  { name: "Kathmandu (Thamel)", lat: 27.7172, lng: 85.3240 },
  { name: "Pokhara (Lakeside)", lat: 28.2096, lng: 83.9856 },
  { name: "Chitwan (Sauraha)", lat: 27.5794, lng: 84.4989 },
  { name: "Namche Bazaar (EBC)", lat: 27.8053, lng: 86.7140 },
  { name: "Lumbini (Mayadevi)", lat: 27.4839, lng: 83.2760 },
  { name: "Mustang (Jomsom)", lat: 28.7833, lng: 83.7333 },
  { name: "Nagarkot Viewpoint", lat: 27.7174, lng: 85.5204 },
  { name: "Bandipur Heritage", lat: 27.9333, lng: 84.4167 },
];

export default function LocationMapPicker({
  latitude,
  longitude,
  address = "",
  onChange,
  label = "Pin Exact Map Location",
  description = "Search an address, use GPS, or click a popular tourism hub to position the pin on Google Maps.",
  defaultZoom = 15,
}: LocationMapPickerProps) {
  const [lat, setLat] = useState<number>(latitude || 28.2096);
  const [lng, setLng] = useState<number>(longitude || 83.9856);
  const [searchQuery, setSearchQuery] = useState(address);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // Handle GPS Auto-Detection
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
        setLat(detectedLat);
        setLng(detectedLng);

        const newAddress = searchQuery || `GPS Location (${detectedLat}, ${detectedLng})`;
        const mapQuery = `${detectedLat},${detectedLng}`;

        onChange({
          latitude: detectedLat,
          longitude: detectedLng,
          address: newAddress,
          mapQuery,
        });

        setIsDetectingGPS(false);
        toast.success(`Location locked: ${detectedLat}, ${detectedLng}`);
      },
      (err) => {
        setIsDetectingGPS(false);
        toast.error(`GPS Error: ${err.message || "Failed to retrieve location"}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle Preset Click
  const handleSelectPreset = (preset: { name: string; lat: number; lng: number }) => {
    setLat(preset.lat);
    setLng(preset.lng);
    setSearchQuery(preset.name);

    onChange({
      latitude: preset.lat,
      longitude: preset.lng,
      address: preset.name,
      mapQuery: `${preset.lat},${preset.lng}`,
    });

    toast.success(`Pinned location to ${preset.name}`);
  };

  // Handle Manual Lat/Lng Change
  const handleCoordChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    onChange({
      latitude: newLat,
      longitude: newLng,
      address: searchQuery,
      mapQuery: `${newLat},${newLng}`,
    });
  };

  const mapEmbedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${defaultZoom}&output=embed`;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-5 shadow-xs">
      {/* Header */}
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
          className="font-bold text-xs h-8 gap-1.5 rounded-xl cursor-pointer shrink-0"
        >
          {isDetectingGPS ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Acquiring GPS...
            </>
          ) : (
            <>
              <LocateFixed className="size-3.5 text-emerald-600" />
              Detect My GPS Location
            </>
          )}
        </Button>
      </div>

      {/* Quick Tourism Presets */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Popular Nepal Tourism Presets:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {NEPAL_PRESETS.map((preset) => (
            <Badge
              key={preset.name}
              variant="outline"
              onClick={() => handleSelectPreset(preset)}
              className="text-xs font-medium py-1 px-2.5 cursor-pointer hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all"
            >
              {preset.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Map Live Embed */}
      <div className="relative w-full h-64 sm:h-72 rounded-xl overflow-hidden border shadow-inner bg-muted/40">
        <iframe
          title="Interactive Map Location"
          src={mapEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          allowFullScreen
        />

        {/* Floating Coordinates Badge */}
        <div className="absolute top-2.5 left-2.5 bg-background/90 backdrop-blur-md px-2.5 py-1 rounded-lg border shadow-xs text-[11px] font-mono font-medium flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lat.toFixed(5)}, {lng.toFixed(5)}</span>
        </div>

        <a
          href={googleMapsSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2.5 right-2.5 bg-background/90 hover:bg-background backdrop-blur-md px-2.5 py-1 rounded-lg border shadow-xs text-xs font-bold text-primary flex items-center gap-1 transition-all"
        >
          <span>Open Full Google Maps</span>
          <ExternalLink className="size-3" />
        </a>
      </div>

      {/* Precise Coordinates Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Latitude</label>
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => handleCoordChange(parseFloat(e.target.value) || 0, lng)}
            placeholder="28.2096"
            className="text-xs font-mono h-9"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Longitude</label>
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => handleCoordChange(lat, parseFloat(e.target.value) || 0)}
            placeholder="83.9856"
            className="text-xs font-mono h-9"
          />
        </div>
      </div>
    </div>
  );
}
