"use client";

import { useState } from "react";
import Image from "next/image";
import { Filter, Search, Utensils, UtensilsCrossed } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MenuCategoryBadge from "../menu/MenuCategoryBadge";

interface PublicRestaurantMenuProps {
  items: any[];
}

export default function PublicRestaurantMenu({
  items,
}: PublicRestaurantMenuProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Distinct categories
  const categories = [
    "All",
    ...Array.from(new Set(items.map((i) => i.category || "Main Course"))),
  ];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" ||
      (item.category || "Main Course") === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Section */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0 mr-1">
            <Filter className="size-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium border transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card text-muted-foreground hover:text-foreground border-border hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      {filteredItems.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
            <UtensilsCrossed className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">No food items found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search || selectedCategory !== "All"
              ? "No dishes matched your search filters. Try selecting a different category or search term."
              : "This restaurant has not added any menu items yet."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`overflow-hidden border hover:border-primary/40 transition-all duration-300 shadow-xs flex flex-col justify-between ${
                item.isAvailable === false ? "opacity-60 bg-muted/20" : "bg-card"
              }`}
            >
              <div>
                {/* Dish Photo */}
                <div className="relative h-44 w-full bg-muted overflow-hidden">
                  {item.menusImageUrl ? (
                    <Image
                      src={item.menusImageUrl}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Utensils className="size-8 opacity-40" />
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md shadow-xs border ${
                        item.isAvailable !== false
                          ? "bg-emerald-500/90 text-white border-emerald-400/40"
                          : "bg-red-500/90 text-white border-red-400/40"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          item.isAvailable !== false
                            ? "bg-white"
                            : "bg-white"
                        }`}
                      />
                      {item.isAvailable !== false ? "Available" : "Sold Out"}
                    </span>
                  </div>

                  {/* Category Badge on image */}
                  <div className="absolute bottom-2.5 left-2.5">
                    <MenuCategoryBadge category={item.category || "Main Course"} />
                  </div>
                </div>

                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-base text-foreground line-clamp-1">
                      {item.name}
                    </h4>
                    <span className="font-extrabold text-base text-primary whitespace-nowrap">
                      NPR {Number(item.price).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
