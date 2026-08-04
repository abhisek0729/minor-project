"use client";

import { useEffect, useTransition, useState } from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useDebounce } from "@/app/hooks/useDebounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RoomsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );

  const debouncedSearch = useDebounce(search, 400);

  // Keep input synced with URL (Back/Forward navigation)
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
  }, [searchParams]);

  function updateQuery(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    const nextUrl = `${pathname}${params.toString() ? `?${params}` : ""}`;
    const currentUrl = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

    if (nextUrl === currentUrl) {
      return;
    }

    startTransition(() => {
      router.replace(nextUrl);
    });
  }

  useEffect(() => {
    updateQuery("search", debouncedSearch);
  }, [debouncedSearch]);

  function clearFilters() {
    setSearch("");

    startTransition(() => {
      router.replace(pathname);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
      {/* Search */}

      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by room number..."
          className="pl-9"
        />
      </div>

      {/* Status */}

      <Select
        value={searchParams.get("status") ?? "all"}
        onValueChange={(value) => updateQuery("status", value!)}
      >
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Room Type */}

      <Select
        value={searchParams.get("roomType") ?? "all"}
        onValueChange={(value) => updateQuery("roomType", value!)}
      >
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="Room Type" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="single">Single</SelectItem>
          <SelectItem value="double">Double</SelectItem>
          <SelectItem value="twin">Twin</SelectItem>
          <SelectItem value="family">Family</SelectItem>
          <SelectItem value="suite">Suite</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}

      <Select
        value={searchParams.get("sortBy") ?? "newest"}
        onValueChange={(value) => updateQuery("sortBy", value!)}
      >
        <SelectTrigger className="w-full lg:w-52">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="priceAsc">Price: Low → High</SelectItem>
          <SelectItem value="priceDesc">Price: High → Low</SelectItem>
          <SelectItem value="capacityAsc">Capacity: Low → High</SelectItem>
          <SelectItem value="capacityDesc">Capacity: High → Low</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear */}

      <Button
        type="button"
        variant="outline"
        disabled={isPending}
        onClick={clearFilters}
      >
        <SlidersHorizontal className="mr-2 size-4" />
        Clear
      </Button>
    </div>
  );
}