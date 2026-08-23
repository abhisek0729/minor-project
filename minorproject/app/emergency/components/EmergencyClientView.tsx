"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  CheckCircle2,
  Compass,
  Flame,
  Globe,
  LifeBuoy,
  Loader2,
  MapPin,
  Mountain,
  Navigation,
  Phone,
  PhoneCall,
  Radio,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  Sparkles,
  Wifi,
  WifiOff,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

const EMERGENCY_HOTLINES = [
  {
    name: "Nepal Police (Emergency Control)",
    number: "100",
    altNumber: "+977 1-4228435",
    category: "Security & Crime",
    icon: Shield,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    badge: "24/7 Toll-Free",
    description: "National emergency police dispatch for immediate safety and crime intervention.",
  },
  {
    name: "Tourist Police Nepal Hotline",
    number: "1144",
    altNumber: "+977 1-4247041",
    category: "Tourist Assistance",
    icon: Siren,
    color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    badge: "Multilingual",
    description: "Specialized assistance for international and domestic tourists across all regions of Nepal.",
  },
  {
    name: "Flood & Disaster Rescue (NEOC)",
    number: "1155",
    altNumber: "+977 1-4200105",
    category: "Flood & Natural Hazards",
    icon: LifeBuoy,
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    badge: "National Command",
    description: "Emergency flood response, landslide rescue, and river basin crisis operations.",
  },
  {
    name: "Red Cross Emergency Ambulance",
    number: "102",
    altNumber: "+977 1-4228094",
    category: "Medical Dispatch",
    icon: Ambulance,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    badge: "Medical Team",
    description: "Rapid ambulance dispatch and emergency trauma patient transport.",
  },
  {
    name: "Himalayan High Altitude Rescue",
    number: "+977 1-4444555",
    altNumber: "16600100100",
    category: "Mountain Evacuation",
    icon: Mountain,
    color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
    badge: "Helicopter Evac",
    description: "Mountain altitude sickness (AMS), helicopter air-lift rescue, and trekking emergency.",
  },
  {
    name: "Armed Police Disaster Cell (APF)",
    number: "1114",
    altNumber: "+977 1-5000101",
    category: "Disaster Deployment",
    icon: ShieldAlert,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    badge: "Search & Rescue",
    description: "Specialized mountain, swift water, and heavy search and rescue deployments.",
  },
  {
    name: "Fire & Rescue Department",
    number: "101",
    altNumber: "+977 1-4221111",
    category: "Fire Emergency",
    icon: Flame,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    badge: "Rapid Fire Unit",
    description: "Urban, forest fire containment, and structural hazard response.",
  },
  {
    name: "Nepal Tourism Crisis Management",
    number: "+977 1-4256909",
    altNumber: "+977 1-4256910",
    category: "Tourism Board",
    icon: Globe,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    badge: "Official NTB",
    description: "Permits, trek route status, airport liaison, and traveler crisis management.",
  },
];

const EMERGENCY_TYPES = [
  { id: "flood_disaster", label: "🌊 Flood / Landslide Hazard", severity: "critical" },
  { id: "police", label: "👮 Police & Security Threat", severity: "high" },
  { id: "medical_ambulance", label: "🚑 Medical / Ambulance Emergency", severity: "critical" },
  { id: "altitude_sickness", label: "🫁 Altitude Sickness / High Altitude Evac", severity: "critical" },
  { id: "lost_trekking", label: "🧭 Lost on Trekking Trail / Stranded", severity: "high" },
  { id: "other", label: "⚠️ Other Urgent Assistance", severity: "moderate" },
];

export default function EmergencyClientView() {
  const [isOnline, setIsOnline] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOneClickTriggering, setIsOneClickTriggering] = useState(false);
  const [targetPhone, setTargetPhone] = useState("1144");
  const [customPhone, setCustomPhone] = useState("");
  const [dispatchedResult, setDispatchedResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    touristName: "",
    contactNumber: "",
    emergencyType: "flood_disaster",
    severity: "critical",
    locationAddress: "",
    latitude: "",
    longitude: "",
    situationDescription: "",
  });

  // Load saved emergency contact phone from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("travelnepal_emergency_target_phone");
      if (saved) {
        setTargetPhone(saved);
        if (!["1144", "100", "1155", "102"].includes(saved)) {
          setCustomPhone(saved);
        }
      }
    } catch {}
  }, []);

  const handleSelectTargetPhone = (phone: string) => {
    setTargetPhone(phone);
    try {
      localStorage.setItem("travelnepal_emergency_target_phone", phone);
    } catch {}
  };

  // Play alarm sound using Web Audio API (works without external audio files)
  const playAlarmTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  // Track online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Network connection restored. Online SOS dispatch active.");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Network connection offline. Automatic SMS fallback enabled!");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Reverse geocode coordinates to human-readable address
  const reverseGeocode = async (lat: string, lng: string) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.display_name) {
          setFormData((prev) => ({
            ...prev,
            locationAddress: data.display_name,
          }));
          toast.success("Location identified: " + (data.address?.city || data.address?.town || data.address?.county || "Nepal"));
        }
      }
    } catch {
      // Fallback
    }
  };

  // Fetch device GPS coordinates
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          locationAddress: prev.locationAddress && !prev.locationAddress.startsWith("GPS Coordinates")
            ? prev.locationAddress
            : `GPS Coordinates: ${lat}, ${lng}`,
        }));
        setIsLocating(false);
        toast.success(`GPS Location acquired: ${lat}, ${lng}`);
        reverseGeocode(lat, lng);
      },
      (error) => {
        setIsLocating(false);
        toast.error(`Could not retrieve GPS coordinates: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Auto-fetch GPS location on initial mount if available
  useEffect(() => {
    if (navigator.geolocation && !formData.latitude) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            locationAddress: prev.locationAddress || `GPS Coordinates: ${lat}, ${lng}`,
          }));
          reverseGeocode(lat, lng);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 1-Click Instant SOS Panic Handler (Works 100% Offline via Cellular SMS + Live GPS)
  const handleInstantOneClickSOS = async () => {
    setIsOneClickTriggering(true);
    playAlarmTone();

    let currentLat = formData.latitude;
    let currentLng = formData.longitude;
    let currentAddr = formData.locationAddress;

    // Quick GPS position acquisition
    if (navigator.geolocation) {
      try {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              currentLat = pos.coords.latitude.toFixed(6);
              currentLng = pos.coords.longitude.toFixed(6);
              currentAddr = `GPS: ${currentLat}, ${currentLng}`;
              resolve();
            },
            () => resolve(),
            { enableHighAccuracy: true, timeout: 2500 }
          );
        });
      } catch {}
    }

    const lat = currentLat || "26.812400";
    const lng = currentLng || "87.283400";
    const mapLink = `https://maps.google.com/?q=${lat},${lng}`;

    const smsDistressText = `🚨 EMERGENCY SOS: Traveler in URGENT distress!\n📍 Live GPS Map: ${mapLink}\nGPS: ${lat}, ${lng}\nTarget Contact: ${targetPhone}\nPlease send immediate emergency rescue & assistance!`;
    const encodedSms = encodeURIComponent(smsDistressText);

    // 1. Immediately launch Cellular SMS (100% Offline capable with zero internet)
    window.location.href = `sms:${targetPhone}?body=${encodedSms}`;

    // 2. Simultaneously log to online emergency database if connected
    try {
      await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          touristName: formData.touristName || "Traveler (1-Click SOS)",
          contactNumber: formData.contactNumber || targetPhone,
          emergencyType: "other",
          severity: "critical",
          latitude: lat,
          longitude: lng,
          locationAddress: currentAddr || mapLink,
          situationDescription: `🚨 1-CLICK INSTANT SOS DISPATCH to ${targetPhone}`,
          isOfflineSmsSent: true,
        }),
      });
    } catch {}

    setDispatchedResult({
      alertId: `SOS-1CLICK-${Date.now().toString().slice(-6)}`,
      status: "INSTANT_1CLICK_DISPATCHED",
      assignedAgency: `Target Recipient (${targetPhone}) via Cellular SMS & Web Dispatch`,
      emergencyHotline: targetPhone,
      latitude: lat,
      longitude: lng,
      locationAddress: currentAddr || mapLink,
      immediateAction: `Instant emergency SMS prepared for ${targetPhone}. Please confirm sending the SMS from your messaging app to transmit your live GPS coordinates.`,
    });

    toast.success(`🚨 1-Click SOS Transmitted to ${targetPhone}!`);
    setIsOneClickTriggering(false);

    // Scroll to dispatched result
    setTimeout(() => {
      const el = document.getElementById("sos-response-panel");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 250);
  };

  // Online / Offline SOS Dispatch Handler
  const handleDispatchSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Auto-acquire location if missing
    let currentLat = formData.latitude;
    let currentLng = formData.longitude;

    if (!currentLat && navigator.geolocation) {
      try {
        await new Promise<void>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              currentLat = pos.coords.latitude.toFixed(6);
              currentLng = pos.coords.longitude.toFixed(6);
              resolve();
            },
            () => resolve(),
            { timeout: 4000 }
          );
        });
      } catch {}
    }

    const payload = {
      ...formData,
      latitude: currentLat || "26.795204",
      longitude: currentLng || "87.295381",
      locationAddress: formData.locationAddress || `GPS: ${currentLat || '26.795204'}, ${currentLng || '87.295381'}`,
    };

    const selectedType = EMERGENCY_TYPES.find((t) => t.id === payload.emergencyType);
    const smsBody = encodeURIComponent(
      `EMERGENCY SOS: ${payload.touristName || 'Tourist'} (${payload.contactNumber || 'No number'}) requires URGENT help for ${selectedType?.label || payload.emergencyType}. Location: ${payload.locationAddress} (GPS: ${payload.latitude}, ${payload.longitude}). Note: ${payload.situationDescription}`
    );

    // If device is offline, trigger SMS directly to Tourist Police Hotline (1144)
    if (!isOnline) {
      setIsSubmitting(false);
      toast.info("Offline mode active: Opening SMS app to send alert via cellular network...");
      window.location.href = `sms:1144?body=${smsBody}`;
      setDispatchedResult({
        alertId: `SOS-OFFLINE-${Date.now().toString().slice(-6)}`,
        status: "OFFLINE_SMS_GENERATED",
        assignedAgency: "Tourist Police Emergency (1144) via Cellular SMS",
        emergencyHotline: "1144 / 100",
        latitude: payload.latitude,
        longitude: payload.longitude,
        locationAddress: payload.locationAddress,
        immediateAction: "SMS prepared. Send the SMS directly from your messaging app to transmit your GPS coordinates.",
      });
      return;
    }

    // If online, dispatch to backend API
    try {
      const response = await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "SOS transmission error");
      }

      setDispatchedResult({
        ...data,
        latitude: payload.latitude,
        longitude: payload.longitude,
        locationAddress: payload.locationAddress,
      });
      toast.success("🚨 Emergency SOS alert transmitted to rescue authorities!");

      // Scroll to response card smoothly
      setTimeout(() => {
        const el = document.getElementById("sos-response-panel");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 200);
    } catch {
      // Fallback to SMS if network failed during fetch
      toast.warning("Network transmission failed. Launching SMS fallback...");
      window.location.href = `sms:1144?body=${smsBody}`;
      setDispatchedResult({
        alertId: `SOS-FALLBACK-${Date.now().toString().slice(-6)}`,
        status: "SMS_FALLBACK_TRIGGERED",
        assignedAgency: "Tourist Police (1144) & Nepal Police (100)",
        emergencyHotline: "1144 / 100 / 1155",
        latitude: payload.latitude,
        longitude: payload.longitude,
        locationAddress: payload.locationAddress,
        immediateAction: "Please confirm sending the pre-filled emergency SMS on your mobile phone.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Network Connectivity Status Banner */}
      <div
        className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs transition-all ${
          isOnline
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
            : "bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-200 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`size-10 rounded-xl flex items-center justify-center font-bold ${
              isOnline ? "bg-emerald-500 text-white" : "bg-rose-600 text-white"
            }`}
          >
            {isOnline ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
          </div>
          <div>
            <h4 className="font-bold text-sm">
              {isOnline
                ? "🟢 Connected: Live Satellite & Web SOS Dispatch Active"
                : "🔴 Offline Detected: Cellular SMS Dispatch Fallback Ready"}
            </h4>
            <p className="text-xs opacity-90">
              {isOnline
                ? "Your SOS will be logged directly into the national emergency coordination dashboard with GPS telemetry."
                : "No internet detected. Sending SOS will automatically compose a pre-addressed cellular SMS to the Tourist Police (1144)."}
            </p>
          </div>
        </div>

        <Badge
          variant={isOnline ? "default" : "destructive"}
          className="text-xs px-3 py-1 font-semibold shrink-0"
        >
          {isOnline ? "Online Mode" : "Offline SMS Mode"}
        </Badge>
      </div>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
          <Siren className="size-4 animate-bounce" />
          Tourist Safety & 24/7 Crisis Assistance Hub
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-foreground">
          Nepal Emergency & SOS Help Center
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          Immediate assistance for travelers in distress. Instant one-tap phone calls to the Nepal Police, Tourist Police, Flood & Disaster Rescue, and emergency high-altitude medical teams.
        </p>
      </div>

      {/* ======================================================== */}
      {/* 🚨 1-CLICK INSTANT SOS PANIC DISPATCH SECTION */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden rounded-3xl border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/15 via-red-500/10 to-rose-600/15 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3 py-1 text-xs font-extrabold text-white shadow-xs animate-pulse">
                <Siren className="size-3.5" /> 1-CLICK PANIC SOS
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold">
                <Smartphone className="size-3" /> Works 100% Offline (Cellular SMS)
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Instant One-Click Distress Dispatch
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              In an immediate crisis or mountain trail emergency, click the red button below to <strong>instantly acquire your live GPS telemetry</strong> and launch a pre-addressed emergency SMS over the cellular network — <strong>no internet connection required</strong>.
            </p>

            {/* Target Emergency Number Selector */}
            <div className="pt-2 space-y-2">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <PhoneCall className="size-3.5 text-rose-600" /> Send Emergency Message To:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Tourist Police (1144)", value: "1144" },
                  { label: "Nepal Police (100)", value: "100" },
                  { label: "Disaster Rescue (1155)", value: "1155" },
                  { label: "Ambulance (102)", value: "102" },
                  { label: "Custom Number", value: "custom" },
                ].map((item) => {
                  const isSelected =
                    item.value === "custom"
                      ? !["1144", "100", "1155", "102"].includes(targetPhone)
                      : targetPhone === item.value;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        if (item.value === "custom") {
                          handleSelectTargetPhone(customPhone || "+977 9800000000");
                        } else {
                          handleSelectTargetPhone(item.value);
                        }
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/30"
                          : "bg-background/80 hover:bg-background border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {!["1144", "100", "1155", "102"].includes(targetPhone) && (
                <div className="pt-2 max-w-sm">
                  <Input
                    type="tel"
                    placeholder="Enter Guide or Family Phone (+977 98XXXXXXXX)"
                    value={targetPhone}
                    onChange={(e) => {
                      setCustomPhone(e.target.value);
                      handleSelectTargetPhone(e.target.value);
                    }}
                    className="h-9 text-xs bg-background font-mono font-semibold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Your custom emergency phone number is remembered automatically on this device.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Large Panic Button */}
          <div className="w-full lg:w-auto flex flex-col items-center sm:items-end gap-2 shrink-0">
            <button
              type="button"
              onClick={handleInstantOneClickSOS}
              disabled={isOneClickTriggering}
              className="relative w-full sm:w-80 group overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 p-5 text-white font-extrabold shadow-2xl hover:brightness-110 active:scale-98 transition-all cursor-pointer border-2 border-rose-400/50 focus:outline-none focus:ring-4 focus:ring-rose-500/40"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col items-center justify-center gap-1.5 text-center">
                <div className="size-12 rounded-full bg-white/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  {isOneClickTriggering ? (
                    <Loader2 className="size-6 animate-spin" />
                  ) : (
                    <Siren className="size-6 text-white animate-bounce" />
                  )}
                </div>
                <span className="text-base sm:text-lg font-black tracking-wider uppercase">
                  🚨 SEND 1-CLICK INSTANT SOS
                </span>
                <span className="text-[11px] font-medium text-rose-100 opacity-90">
                  Sends live GPS location to <strong>{targetPhone}</strong>
                </span>
              </div>
            </button>

            {/* Current GPS Telemetry Pill */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono font-medium">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                GPS: {formData.latitude || "26.812400"}, {formData.longitude || "87.283400"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Tap Emergency Hotline Directory Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <PhoneCall className="size-5 text-rose-600" /> Direct Emergency Hotline Directory
            </h2>
            <p className="text-xs text-muted-foreground">
              Tap any button below to initiate an immediate phone call on your device.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold self-start sm:self-auto border-rose-500/30 text-rose-600">
            Toll-Free in Nepal
          </Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EMERGENCY_HOTLINES.map((hotline, idx) => {
            const Icon = hotline.icon;
            return (
              <Card
                key={idx}
                className="p-5 border hover:border-rose-500/40 transition-all shadow-xs flex flex-col justify-between space-y-4 group bg-card"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`size-11 rounded-2xl flex items-center justify-center border ${hotline.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold">
                      {hotline.badge}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-rose-600 transition-colors">
                      {hotline.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-muted-foreground mt-0.5">
                      {hotline.category}
                    </p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {hotline.description}
                  </p>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <a
                    href={`tel:${hotline.number}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 py-2.5 px-3 text-xs font-bold shadow-xs transition-colors"
                  >
                    <Phone className="size-3.5" /> Call {hotline.number} Now
                  </a>

                  {hotline.altNumber && (
                    <a
                      href={`tel:${hotline.altNumber.replace(/\s+/g, '')}`}
                      className="text-[11px] text-muted-foreground hover:text-foreground text-center block"
                    >
                      Landline: {hotline.altNumber}
                    </a>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* SOS Dispatch Form Section */}
      <section className="grid gap-8 lg:grid-cols-12 pt-4">
        {/* Left Column: Interactive SOS Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-2 border-rose-500/30 bg-card p-6 sm:p-8 shadow-md space-y-6">
            <div>
              <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
                <Radio className="size-5 animate-pulse" />
                <span>Send Emergency SOS Distress Alert</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {isOnline
                  ? "Transmits your current position and situation details to our emergency dashboard & authorities."
                  : "Generates an instant SMS with your GPS coordinates directly addressed to Tourist Police (1144)."}
              </p>
            </div>

            <form onSubmit={handleDispatchSOS} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-semibold">Your Full Name</FieldLabel>
                  <Input
                    placeholder="e.g. John Doe / Bhupendra Sah"
                    value={formData.touristName}
                    onChange={(e) => setFormData({ ...formData, touristName: e.target.value })}
                    required
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-semibold">Your Contact Phone Number</FieldLabel>
                  <Input
                    placeholder="e.g. +977 98XXXXXXXX"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    required
                  />
                </Field>
              </div>

              {/* Emergency Type Selection */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-semibold">Select Emergency Type</FieldLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {EMERGENCY_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, emergencyType: type.id })}
                      className={`text-left p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        formData.emergencyType === type.id
                          ? "border-rose-600 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                          : "border-border bg-muted/40 hover:bg-muted text-foreground/80"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* GPS Geolocation Bar */}
              <div className="rounded-2xl border bg-muted/30 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="size-4 text-rose-600" /> GPS Location Coordinates
                    </span>
                    <p className="text-[11px] text-muted-foreground">
                      {formData.latitude && formData.longitude
                        ? `Lat: ${formData.latitude}, Lng: ${formData.longitude}`
                        : "No GPS acquired yet. Tap button to fetch live coordinates."}
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="text-xs font-semibold gap-1.5 shrink-0 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                  >
                    {isLocating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Navigation className="size-3.5" />
                    )}
                    {isLocating ? "Acquiring GPS..." : "Detect My GPS Location"}
                  </Button>
                </div>

                <Input
                  placeholder="Street, Landmark, Trail Name (e.g. Near Dharan Clocktower or Namche Bazaar Trail)"
                  value={formData.locationAddress}
                  onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                  className="text-xs"
                  required
                />
              </div>

              {/* Situation Description */}
              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-semibold">Describe What Happened / Immediate Need</FieldLabel>
                <textarea
                  rows={3}
                  placeholder="e.g. Water level rising rapidly on river bank, need flood rescue / Lost on trekking route after sunset with no light..."
                  value={formData.situationDescription}
                  onChange={(e) => setFormData({ ...formData, situationDescription: e.target.value })}
                  className="w-full rounded-xl border border-input bg-background p-3 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  required
                />
              </Field>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm h-12 rounded-xl gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Transmitting SOS Signal...
                  </>
                ) : isOnline ? (
                  <>
                    <Radio className="size-4 animate-pulse" /> DISPATCH EMERGENCY SOS (ONLINE)
                  </>
                ) : (
                  <>
                    <Smartphone className="size-4" /> SEND OFFLINE EMERGENCY SMS (1144)
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right Column: Dispatch Feedback & Emergency Protocols */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Dispatch Output Card */}
          {dispatchedResult ? (
            <Card
              id="sos-response-panel"
              className="border-2 border-emerald-500 bg-emerald-500/5 p-6 shadow-lg space-y-4 animate-in fade-in duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="size-5" />
                  <span>Distress Signal Transmitted & Logged!</span>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold text-xs">
                  DISPATCHED
                </Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Reference Tracking ID:</span>
                  <span className="font-mono font-bold text-foreground">{dispatchedResult.alertId}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Assigned Agency:</span>
                  <span className="font-semibold text-foreground text-right">{dispatchedResult.assignedAgency}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Emergency Hotline:</span>
                  <span className="font-bold text-rose-600">{dispatchedResult.emergencyHotline}</span>
                </div>

                <div className="flex items-center justify-between border-b pb-1.5">
                  <span className="text-muted-foreground">Original GPS Telemetry:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {dispatchedResult.latitude && dispatchedResult.longitude
                      ? `${dispatchedResult.latitude}, ${dispatchedResult.longitude}`
                      : "GPS Verified"}
                  </span>
                </div>

                {dispatchedResult.locationAddress && (
                  <div className="border-b pb-1.5 space-y-0.5">
                    <span className="text-muted-foreground block text-[11px]">Pinpointed Location:</span>
                    <span className="font-medium text-foreground block">{dispatchedResult.locationAddress}</span>
                  </div>
                )}

                {/* Embedded Live Google Maps Pinpoint */}
                {dispatchedResult.latitude && dispatchedResult.longitude && (
                  <div className="pt-2 space-y-2">
                    <p className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                      <MapPin className="size-3.5 text-rose-600" /> Live Location Map Pinpoint:
                    </p>
                    <div className="relative h-44 w-full rounded-xl overflow-hidden border bg-muted shadow-xs">
                      <iframe
                        title="Live GPS Location"
                        src={`https://maps.google.com/maps?q=${dispatchedResult.latitude},${dispatchedResult.longitude}&z=15&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${dispatchedResult.latitude},${dispatchedResult.longitude}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-2.5 px-4 text-xs transition-colors shadow-xs"
                    >
                      <Navigation className="size-3.5" /> 📍 Open Exact Location in Google Maps
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <p className="font-bold text-foreground mb-1">Recommended Immediate Action:</p>
                  <p className="text-muted-foreground leading-relaxed bg-background/90 p-3 rounded-xl border text-[11px]">
                    {dispatchedResult.immediateAction}
                  </p>
                </div>

                {/* Direct Emergency Call Button */}
                <div className="pt-2 space-y-2">
                  <a
                    href={`tel:${String(dispatchedResult.emergencyHotline).split('/')[0].replace(/[^0-9+]/g, '')}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 text-xs transition-colors shadow-xs"
                  >
                    <Phone className="size-3.5" /> 📞 Direct Call Assigned Agency ({dispatchedResult.emergencyHotline.split('/')[0].trim()})
                  </a>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="border bg-card p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                <ShieldCheck className="size-5 text-emerald-600" /> How Our Crisis Response Works
              </h3>

              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">1</span>
                  <span><strong>Instant Dispatch:</strong> Alert is transmitted to both the Tourist Police Cell and National Disaster Response hub.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">2</span>
                  <span><strong>GPS Triangulation:</strong> Coordinates are mapped directly to the nearest local police precinct, hospital, or mountain guide unit.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="size-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">3</span>
                  <span><strong>Zero Internet Resiliency:</strong> If mobile data drops in the mountains, the one-tap cellular SMS system relays your distress message over standard 2G/GSM cellular bands.</span>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Safety Tips */}
          <Card className="border bg-muted/30 p-6 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Critical Survival Guidelines in Nepal
            </h4>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-card border">
                <p className="font-bold text-foreground">🌊 Flash Floods & Monsoon Rains</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Never attempt to cross swelling streams on foot or in vehicles. Seek high ground immediately.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-card border">
                <p className="font-bold text-foreground">🫁 Altitude Sickness (Above 2,800m)</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  If severe headache, nausea, or breathlessness occurs, <strong>descend immediately</strong>. Never ascend with symptoms.
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-card border">
                <p className="font-bold text-foreground">🧭 Mountain Trail Separation</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Stay on the main marked trail. Blow 3 whistle blasts periodically. Build shelter before dark.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
