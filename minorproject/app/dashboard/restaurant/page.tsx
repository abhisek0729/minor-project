import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import {
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Plus,
  Store,
  TrendingUp,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getRestaurantByOwnerId } from "@/app/features/restaurant/services/restaurant.service";
import { getMenuItems } from "@/app/features/restaurant/actions/menu.action";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusToggleCard from "@/app/features/restaurant/components/availability/StatusToggleCard";
import MenuCategoryBadge from "@/app/features/restaurant/components/menu/MenuCategoryBadge";
import Image from "next/image";

export default async function RestaurantDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const ownerRole = session.user.roles?.find(
    (role) => role.name === "restaurantOwner"
  );

  if (!ownerRole) {
    redirect("/unauthorized");
  }

  if (ownerRole.approvalStatus === "pending") {
    redirect("/dashboard/restaurant/pending");
  }

  const restaurant = await getRestaurantByOwnerId(Number(session.user.id));

  if (!restaurant) {
    redirect("/onboarding/restaurant");
  }

  const menuResult = await getMenuItems();
  const menuItems = menuResult.data || [];

  const totalItems = menuItems.length;
  const availableItems = menuItems.filter((i: any) => i.isAvailable !== false).length;
  const categories = Array.from(new Set(menuItems.map((i: any) => i.category || "Main Course"))).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session.user.name ?? "Owner"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage <span className="font-medium text-foreground">{restaurant.name}</span>, control menu items, and update store availability.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/dashboard/restaurant/menu" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto gap-2 shadow-sm">
              <Plus className="size-4" />
              Add Dish
            </Button>
          </Link>
          <Link href={`/restaurants`} target="_blank">
            <Button variant="outline" size="icon" title="View Public Page">
              <ExternalLink className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Status Card */}
      <StatusToggleCard
        initialIsOpen={restaurant.isOpen ?? true}
        restaurantName={restaurant.name}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Dishes */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
            <UtensilsCrossed className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {categories} {categories === 1 ? "category" : "categories"}
            </p>
          </CardContent>
        </Card>

        {/* Available Items */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active / Available</CardTitle>
            <TrendingUp className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {availableItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalItems - availableItems} currently marked sold out
            </p>
          </CardContent>
        </Card>

        {/* Operating Hours */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Operating Hours</CardTitle>
            <Clock className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold truncate">
              {restaurant.openingTime || "09:00 AM"} - {restaurant.closingTime || "10:00 PM"}
            </div>
            <Link
              href="/dashboard/restaurant/availability"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              Update hours →
            </Link>
          </CardContent>
        </Card>

        {/* Cuisine & Type */}
        <Card className="border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cuisine</CardTitle>
            <Utensils className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-base font-bold capitalize truncate">
              {restaurant.cuisine || "Multi-Cuisine"}
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              📍 {restaurant.location || "Nepal"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid: Recent Dishes & Restaurant Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Menu Items (2 cols) */}
        <Card className="lg:col-span-2 border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Menu Items</CardTitle>
              <CardDescription>Quick overview of your restaurant dishes.</CardDescription>
            </div>
            <Link href="/dashboard/restaurant/menu">
              <Button variant="ghost" size="sm" className="text-xs">
                View All Menu →
              </Button>
            </Link>
          </CardHeader>

          <CardContent>
            {menuItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-xl border border-dashed">
                <UtensilsCrossed className="size-8 text-muted-foreground mb-2" />
                <p className="font-semibold text-sm">No menu items added yet</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Add items so customers can see your delicious food offerings.
                </p>
                <Link href="/dashboard/restaurant/menu">
                  <Button size="sm" className="gap-1.5">
                    <Plus className="size-3.5" /> Add Food Item
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {menuItems.slice(0, 4).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 rounded-lg overflow-hidden border bg-muted shrink-0">
                        {item.menusImageUrl ? (
                          <Image
                            src={item.menusImageUrl}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Utensils className="size-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MenuCategoryBadge category={item.category || "Main Course"} />
                      <span className="font-bold text-sm">
                        NPR {Number(item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Quick Profile Card (1 col) */}
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Restaurant Profile</CardTitle>
            <CardDescription>Overview of your business listing</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {restaurant.restaurantImageUrl && (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border">
                <Image
                  src={restaurant.restaurantImageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Store className="size-4 shrink-0 text-primary" />
                <span className="font-medium text-foreground">{restaurant.name}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span className="truncate">{restaurant.location}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="size-4 shrink-0 text-primary" />
                <span>{restaurant.phoneNumber}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Utensils className="size-4 shrink-0 text-primary" />
                <span className="capitalize">{restaurant.cuisine} Cuisine</span>
              </div>
            </div>

            <div className="pt-2 border-t flex gap-2">
              <Link href="/dashboard/restaurant/settings" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Edit Restaurant Info
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
