import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coffee,
  Hotel,
  MapPin,
  Mountain,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Utensils,
  Wifi,
} from "lucide-react";

import Navbar from "@/app/features/landing/components/Navbar";
import Footer from "@/app/features/landing/components/Footer";
import { db } from "@/app/lib/db";
import { hotelsTable, roomsTable, roomImagesTable, roomFacilitiesTable, facilitiesTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import HotelBookingModal from "./components/HotelBookingModal";

interface HotelDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const mockHotels: Record<number, any> = {
  1: {
    id: 1,
    name: "Lakeside Mountain Resort",
    description: "Boutique lakefront stay with private balconies, panoramic Annapurna mountain views, an in-house organic restaurant, and peaceful gardens.",
    district: "Pokhara",
    province: "Gandaki Province",
    street: "Lakeside Marg-6",
    phoneNumber: "+977 61-462345",
    rating: 4.9,
    coverImage: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
    rooms: [
      { id: 101, roomNumber: "101", type: "Deluxe Mountain View", price: 5200, capacity: 2, description: "King size bed with private balcony facing Phewa lake and mountain peaks." },
      { id: 102, roomNumber: "102", type: "Executive Lake Suite", price: 8400, capacity: 4, description: "Spacious master bedroom with living area, jacuzzi tub, and sunset terrace." },
    ],
    facilities: ["High-Speed WiFi", "Mountain Views", "24/7 Room Service", "Restaurant & Bar", "Free Parking", "Airport Pickup"],
  },
  2: {
    id: 2,
    name: "Everest Heights Lodge",
    description: "Cozy alpine lodge in the heart of Namche Bazaar featuring traditional Himalayan stone architecture, heated rooms, and warm Sherpa hospitality.",
    district: "Namche Bazaar",
    province: "Koshi Province",
    street: "Tenzing Norgay Trail",
    phoneNumber: "+977 38-540123",
    rating: 5.0,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
    rooms: [
      { id: 201, roomNumber: "201", type: "Alpine Pine Room", price: 7800, capacity: 2, description: "Heated wooden room with thermal blankets and panoramic views of Kongde Ri." },
      { id: 202, roomNumber: "202", type: "Himalayan Family Suite", price: 11200, capacity: 4, description: "Two interconnected heated rooms perfect for trekking groups and families." },
    ],
    facilities: ["Heated Rooms", "Sherpa Dining", "Hot Showers", "WiFi Access", "Oxygen Support", "Luggage Storage"],
  },
  3: {
    id: 3,
    name: "Heritage Courtyard Hotel",
    description: "Restored historic Newari architecture in the heart of old Patan with rooftop garden, carved wooden windows, and authentic cultural ambiance.",
    district: "Lalitpur",
    province: "Bagmati Province",
    street: "Patan Durbar Square Road",
    phoneNumber: "+977 1-5521980",
    rating: 4.8,
    coverImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
    rooms: [
      { id: 301, roomNumber: "301", type: "Newari Heritage Deluxe", price: 6500, capacity: 2, description: "Traditional brick walls with hand-carved woodwork and modern luxury bath." },
      { id: 302, roomNumber: "302", type: "Courtyard Garden Suite", price: 9200, capacity: 3, description: "Overlooks the 200-year-old stone courtyard and private rooftop terrace." },
    ],
    facilities: ["Free Breakfast", "Courtyard Dining", "High-Speed WiFi", "Heritage Walking Tours", "AC & Heating"],
  },
};

export default async function HotelDetailPage({ params }: HotelDetailPageProps) {
  const { id } = await params;
  const hotelId = parseInt(id, 10);

  if (isNaN(hotelId)) {
    notFound();
  }

  let hotel = mockHotels[hotelId] || mockHotels[1];

  try {
    const [dbHotel] = await db.select().from(hotelsTable).where(eq(hotelsTable.id, hotelId));
    if (dbHotel) {
      const dbRooms = await db.select().from(roomsTable).where(eq(roomsTable.hotelId, hotelId));
      hotel = {
        ...dbHotel,
        rating: 4.9,
        coverImage: dbHotel.coverImageUrl || hotel.coverImage,
        rooms: dbRooms.length > 0 ? dbRooms.map(r => ({
          id: r.id,
          roomNumber: r.roomNumber,
          type: r.type,
          price: Number(r.pricePerNight),
          capacity: r.capacity || 2,
          description: r.description || "Comfortable guest room with modern amenities.",
        })) : hotel.rooms,
        facilities: hotel.facilities,
      };
    }
  } catch (error) {
    console.error("Failed to query hotel detail:", error);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/hotels"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to All Hotels</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden border bg-card shadow-sm">
          <div className="relative h-72 sm:h-96 w-full bg-muted">
            <Image
              src={hotel.coverImage}
              alt={hotel.name}
              fill
              className="object-cover"
              unoptimized
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-md">
                <ShieldCheck className="size-3.5" /> Verified Hotel
              </span>
            </div>

            {/* Bottom Title on Hero */}
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold backdrop-blur-md">
                  <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                  {hotel.rating} / 5.0
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white text-xs backdrop-blur-md border-0">
                  {hotel.district}, {hotel.province || "Nepal"}
                </Badge>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-sm">
                {hotel.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90">
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-primary shrink-0" />
                  <span>{hotel.street || hotel.district}</span>
                </div>
                {hotel.phoneNumber && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-4 text-primary shrink-0" />
                    <span>{hotel.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description & Amenities Preview */}
          <div className="p-6 border-t bg-card grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                About the Property
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {hotel.description}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key Amenities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {(hotel.facilities || ["WiFi", "Mountain View", "Restaurant"]).map((f: string) => (
                  <Badge key={f} variant="outline" className="text-[11px] py-1 px-2">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Room Inventory & Direct Booking */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BedDouble className="size-6 text-primary" /> Available Room Categories
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select your room type and reserve instantly with instant booking confirmation.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {hotel.rooms.map((room: any) => (
              <Card key={room.id} className="p-6 border hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{room.type}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Room #{room.roomNumber}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      Up to {room.capacity} Guests
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {room.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-foreground/80 font-medium">
                    <span className="flex items-center gap-1"><Wifi className="size-3.5 text-primary" /> Free WiFi</span>
                    <span className="flex items-center gap-1"><Coffee className="size-3.5 text-primary" /> Breakfast Included</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block leading-none">Price per night</span>
                    <span className="text-xl font-extrabold text-foreground">
                      NPR {room.price.toLocaleString()}
                    </span>
                  </div>

                  <HotelBookingModal
                    hotelId={hotel.id}
                    hotelName={hotel.name}
                    roomId={room.id}
                    roomType={room.type}
                    pricePerNight={room.price}
                  />
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
