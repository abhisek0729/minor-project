<<<<<<< HEAD
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Hotel,
  LogOut,
  Mail,
  Plus,
  Shield,
  User,
  UtensilsCrossed,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { db } from "@/app/lib/db";
import { usersTable } from "@/app/lib/db/schema";
import { eq } from "drizzle-orm";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import { getHotelByOwnerId } from "@/app/features/hotel/actions/getHotelByOwnerId";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const [dbUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(session.user.id)));

  const roles = session.user.roles ?? [];
  const hasRestaurant = roles.some((r) => r.name === "restaurantOwner");
  const hasHotelRole = roles.some((r) => r.name === "hotelOwner");
  const adminRole = roles.find((r) => r.name === "admin");
  const hasAdmin = !!adminRole;
  const isAdminApproved = adminRole?.approvalStatus === "approved";

  // Fetch business listings if user has partner roles
  const [restaurant, hotel] = await Promise.all([
    hasRestaurant ? getRestaurantByOwnerId(Number(session.user.id)) : Promise.resolve(null),
    hasHotelRole ? getHotelByOwnerId(Number(session.user.id)) : Promise.resolve(null),
  ]);

  const name = dbUser?.name || session.user.name || "User";
  const email = dbUser?.email || session.user.email || "";
  const isVerified = dbUser?.isVerified ?? session.user.is_verified ?? false;
  const provider = dbUser?.provider || "credentials";
  const joinDate = dbUser?.createdAt
    ? new Date(dbUser.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recent";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-muted/20 pb-16">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {hasRestaurant && (
            <Link href="/dashboard/restaurant">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <UtensilsCrossed className="size-3.5 text-primary" />
                Restaurant Dashboard
              </Button>
            </Link>
          )}

          {hasHotelRole && (
            <Link href="/dashboard/hotels">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Hotel className="size-3.5 text-primary" />
                Hotel Dashboard
              </Button>
            </Link>
          )}

          {hasAdmin && (
            <Link
              href={
                isAdminApproved
                  ? "/dashboard/admin"
                  : "/dashboard/admin/pending"
              }
            >
              <Button
                variant="default"
                size="sm"
                className="gap-2 text-xs bg-primary"
              >
                <Shield className="size-3.5" />
                Admin Portal
              </Button>
            </Link>
          )}

          <Link href="/api/auth/signout">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 gap-1.5 text-xs"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="container max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* User Hero Banner */}
        <Card className="overflow-hidden border shadow-sm bg-card">
          <div className="h-28 bg-gradient-to-r from-primary/80 via-primary to-primary/60 relative">
            <div className="absolute inset-0 bg-black/10" />
          </div>

          <CardContent className="relative px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <div className="flex size-24 items-center justify-center rounded-2xl bg-card border-4 border-background text-primary font-bold text-3xl shadow-lg ring-1 ring-border">
                  {initials}
                </div>

                <div className="space-y-1 mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                      {name}
                    </h1>
                    {isVerified && (
                      <span title="Verified Account">
                        <BadgeCheck className="size-5 text-emerald-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Mail className="size-3.5" /> {email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs">
                  Joined {joinDate}
                </Badge>
                <Badge
                  variant="outline"
                  className="px-3 py-1 text-xs capitalize border-primary/30 text-primary"
                >
                  {provider} Account
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workspaces & Active Roles Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Your Workspaces & Roles</h2>
              <p className="text-xs text-muted-foreground">
                Manage your tourism businesses and access role-specific dashboards.
              </p>
            </div>

            <Link href="/workspace">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Workspace Selector <ArrowRight className="size-3" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Restaurant Owner Workspace */}
            {hasRestaurant ? (
              <Card className="border hover:border-primary/50 transition-all shadow-xs group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <UtensilsCrossed className="size-6" />
                    </div>

                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                    >
                      Active Partner
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    Restaurant Owner
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    {restaurant
                      ? `Managing "${restaurant.name}" — ${restaurant.cuisine} Cuisine`
                      : "Complete your restaurant onboarding to manage menu and orders."}
                  </p>

                  <Link href="/dashboard/restaurant" className="w-full">
                    <Button className="w-full gap-2 text-xs font-semibold">
                      Open Restaurant Panel
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed bg-muted/10 hover:bg-muted/20 transition-all">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                      <UtensilsCrossed className="size-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      List a Restaurant
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Are you a restaurant owner? Partner with TravelNepal to showcase your dishes and menu to tourists.
                    </p>
                  </div>

                  <Link href="/partner/register?role=restaurantOwner">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Plus className="size-3.5" /> Become a Restaurant Partner
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Hotel Owner Workspace */}
            {hasHotelRole ? (
              <Card className="border hover:border-primary/50 transition-all shadow-xs group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                      <Hotel className="size-6" />
                    </div>

                    <Badge
                      variant="outline"
                      className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs"
                    >
                      Active Partner
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground">
                    Hotel Owner
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4">
                    {hotel
                      ? `Managing "${hotel.name}" — Rooms, Pricing & Bookings`
                      : "Complete hotel onboarding to list rooms and accept bookings."}
                  </p>

                  <Link href="/dashboard/hotels" className="w-full">
                    <Button className="w-full gap-2 text-xs font-semibold">
                      Open Hotel Dashboard
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed bg-muted/10 hover:bg-muted/20 transition-all">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-4">
                      <Hotel className="size-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">
                      List a Hotel or Resort
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Own a hotel, lodge, or resort? Register as a partner to accept room reservations from travelers.
                    </p>
                  </div>

                  <Link href="/partner/register?role=hotelOwner">
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      <Plus className="size-3.5" /> Become a Hotel Partner
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Administrator Workspace (if user requested or has admin role) */}
            {hasAdmin && (
              <Card className="border hover:border-primary/50 transition-all shadow-xs group md:col-span-2">
                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform shrink-0 shadow-md">
                      <Shield className="size-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-foreground">
                          Administrator
                        </h3>
                        {isAdminApproved ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                            Approved in Database
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs font-semibold"
                          >
                            Pending Owner Approval
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-0.5">
                        {isAdminApproved
                          ? "Full platform access: verify businesses, approve partner accounts, and manage platform data."
                          : "Your administrator access request is recorded and awaiting manual database verification by the website owner."}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={
                      isAdminApproved
                        ? "/dashboard/admin"
                        : "/dashboard/admin/pending"
                    }
                    className="w-full sm:w-auto"
                  >
                    <Button
                      variant={isAdminApproved ? "default" : "outline"}
                      className="w-full sm:w-auto text-xs font-semibold gap-1.5"
                    >
                      {isAdminApproved
                        ? "Open Admin Portal →"
                        : "View Pending Status →"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Account Details & Security Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-xs">
                Your registered credentials and contact details.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground text-xs">Full Name</span>
                <span className="font-semibold text-xs">{name}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground text-xs">Email Address</span>
                <span className="font-semibold text-xs">{email}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground text-xs">Email Status</span>
                <span className="font-semibold text-xs flex items-center gap-1.5">
                  {isVerified ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="size-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-500">Unverified</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-muted-foreground text-xs">Sign-In Method</span>
                <span className="font-semibold text-xs capitalize">{provider}</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Security */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                Account Security & Actions
              </CardTitle>
              <CardDescription className="text-xs">
                Manage your session and access control.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl bg-muted/40 border space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  Need to switch business or dashboard?
                </p>
                <p className="text-xs text-muted-foreground">
                  You can jump directly to any of your registered workspaces.
                </p>
                <div className="pt-2">
                  <Link href="/workspace">
                    <Button variant="outline" size="sm" className="w-full text-xs gap-2">
                      <Building2 className="size-3.5" />
                      Switch Workspace
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-2">
                <Link href="/api/auth/signout" className="w-full">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full gap-2 text-xs font-semibold"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out of Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
=======
"use client";

import { useState } from "react";
import { Save, User, Mail, Phone, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    phone: "+977-1-234-5678",
    location: "Kathmandu, Nepal",
    bio: "Travel enthusiast and adventure seeker. Love exploring new places and experiencing local cultures.",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Profile Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-12 w-12" />
              </div>
              <Button className="mt-4" variant="outline" size="sm">
                Change Picture
              </Button>
            </CardContent>
          </Card>

          {/* Main Profile Form */}
          <Card className="border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Full Name
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Location
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Bio
                </label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your app preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-foreground">
                  Receive booking notifications
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-foreground">
                  Receive promotional emails
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="h-4 w-4" />
                <span className="text-sm text-foreground">
                  Enable dark mode
                </span>
              </label>
            </CardContent>
          </Card>

          <Card className="border-border border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Logout</p>
                <p className="text-sm text-muted-foreground">
                  Sign out from your account
                </p>
              </div>
              <Button variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
>>>>>>> 50fa1b76e6ba71f6883d55a9f502efab9a027125
    </div>
  );
}
