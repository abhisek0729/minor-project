"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Calendar,
  Compass,
  DollarSign,
  ExternalLink,
  Eye,
  Globe,
  Loader2,
  MapPin,
  Mountain,
  Plus,
  Search,
  Sparkles,
  Star,
  SunMedium,
  Trash2,
  X,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createDestinationAdminAction,
  deleteDestinationAdminAction,
  DestinationFormData,
} from "../../actions/destination-admin.action";

interface AdminDestinationsTableProps {
  initialDestinations: any[];
}

const provinces = [
  "all",
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

const categories = [
  "all",
  "Lakes & Mountains",
  "Culture & Heritage",
  "High Altitude Trek",
  "Wildlife & Safari",
  "Viewpoint & Adventure",
  "Spiritual & Pilgrimage",
  "Expedition & Culture",
  "Scenic Viewpoint",
];

export default function AdminDestinationsTable({
  initialDestinations,
}: AdminDestinationsTableProps) {
  const [destinations, setDestinations] = useState<any[]>(initialDestinations || []);
  const [search, setSearch] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<any | null>(null);
  const [deletingDestination, setDeletingDestination] = useState<any | null>(null);

  const [isPending, startTransition] = useTransition();

  // Form State for Add Destination
  const [formData, setFormData] = useState<DestinationFormData>({
    name: "",
    region: "Gandaki Province",
    category: "Lakes & Mountains",
    altitude: "",
    bestSeason: "October – May",
    startingCost: "NPR 5,000",
    coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
    shortDescription: "",
    historyAndCulture: "",
    activities: [],
    highlights: [],
    mapQuery: "",
  });

  const [activitiesInput, setActivitiesInput] = useState("Sightseeing, Photography, Cultural Tour");
  const [highlightsInput, setHighlightsInput] = useState("Scenic Himalayan Views, Local Culture, Photography Spots");

  const filteredDestinations = destinations.filter((dest) => {
    const q = search.toLowerCase();
    const matchesSearch =
      dest.name.toLowerCase().includes(q) ||
      dest.region.toLowerCase().includes(q) ||
      dest.category.toLowerCase().includes(q) ||
      dest.shortDescription.toLowerCase().includes(q);

    const matchesProvince = selectedProvince === "all" || dest.region.includes(selectedProvince);
    const matchesCategory = selectedCategory === "all" || dest.category === selectedCategory;

    return matchesSearch && matchesProvince && matchesCategory;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const parsedActivities = activitiesInput
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);

      const parsedHighlights = highlightsInput
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      const payload: DestinationFormData = {
        ...formData,
        activities: parsedActivities,
        highlights: parsedHighlights,
        mapQuery: formData.mapQuery || `${formData.name}, Nepal`,
      };

      const res = await createDestinationAdminAction(payload);
      if (res.success && res.data) {
        toast.success(res.message);
        setDestinations((prev) => [res.data, ...prev]);
        setIsAddModalOpen(false);
        // Reset form
        setFormData({
          name: "",
          region: "Gandaki Province",
          category: "Lakes & Mountains",
          altitude: "",
          bestSeason: "October – May",
          startingCost: "NPR 5,000",
          coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
          shortDescription: "",
          historyAndCulture: "",
          activities: [],
          highlights: [],
          mapQuery: "",
        });
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleDelete = () => {
    if (!deletingDestination) return;
    startTransition(async () => {
      const res = await deleteDestinationAdminAction(deletingDestination.id);
      if (res.success) {
        toast.success(res.message);
        setDestinations((prev) => prev.filter((d) => d.id !== deletingDestination.id));
        setDeletingDestination(null);
        setSelectedDestination(null);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls: Search, Filters & Add Button */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, region, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card rounded-2xl"
            />
          </div>

          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 px-5 font-bold gap-2 rounded-2xl bg-primary text-primary-foreground shadow-sm cursor-pointer hover:bg-primary/90"
          >
            <Plus className="size-4.5" /> Add New Destination
          </Button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Province Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {provinces.map((prov) => (
              <button
                key={prov}
                onClick={() => setSelectedProvince(prov)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedProvince === prov
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "bg-card text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {prov === "all" ? "All Provinces" : prov}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground border-border"
              }`}
            >
              {cat === "all" ? "All Categories" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Destinations Table */}
      {filteredDestinations.length === 0 ? (
        <Card className="border-dashed bg-muted/10 p-12 text-center rounded-3xl">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-3">
            <Mountain className="size-7" />
          </div>
          <h3 className="text-lg font-semibold">No destinations found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {search
              ? "No destinations matched your search and filter criteria."
              : "Click 'Add New Destination' to register a new travel hotspot."}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden border shadow-xs rounded-3xl bg-card">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead className="w-[300px]">Destination & Cover</TableHead>
                <TableHead>Province & Region</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Elevation & Season</TableHead>
                <TableHead>Est. Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDestinations.map((dest) => (
                <TableRow key={dest.id} className="hover:bg-muted/30">
                  <TableCell className="font-mono font-bold text-xs text-muted-foreground">
                    #{dest.id}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 rounded-2xl overflow-hidden bg-muted shrink-0 border">
                        <Image
                          src={dest.coverImage}
                          alt={dest.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground line-clamp-1">
                          {dest.name}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">
                          {dest.shortDescription}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-primary shrink-0" />
                      {dest.region}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-xs font-semibold bg-muted/30">
                      {dest.category}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-0.5 text-xs">
                      {dest.altitude && (
                        <div className="font-medium text-foreground flex items-center gap-1">
                          <Mountain className="size-3 text-emerald-500" />
                          {dest.altitude}
                        </div>
                      )}
                      {dest.bestSeason && (
                        <div className="text-muted-foreground text-[11px] flex items-center gap-1">
                          <SunMedium className="size-3 text-amber-500" />
                          {dest.bestSeason}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="font-bold text-xs text-primary">
                      {dest.startingCost || "NPR 3,500"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDestination(dest)}
                        className="h-8 px-2 text-xs font-semibold rounded-xl gap-1 text-primary hover:bg-primary/10 cursor-pointer"
                      >
                        <Eye className="size-3.5" /> Details
                      </Button>

                      <Link href={`/destinations/${dest.id}`} target="_blank">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs font-semibold rounded-xl text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <ExternalLink className="size-3.5" />
                        </Button>
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeletingDestination(dest)}
                        className="h-8 px-2 text-xs font-semibold rounded-xl gap-1 text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ADD NEW DESTINATION MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-card border rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between bg-muted/20 shrink-0">
              <div>
                <h2 className="text-xl font-bold">Add New Nepal Destination</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Register a destination into the platform database and AI recommendation engine.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-foreground">Destination Name *</label>
                  <Input
                    required
                    placeholder="e.g. Khumai Danda & Great Wall"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Region */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Province / District *</label>
                  <Input
                    required
                    placeholder="e.g. Kaski District, Gandaki Province"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border bg-card text-foreground text-xs"
                  >
                    <option value="Lakes & Mountains">Lakes & Mountains</option>
                    <option value="Culture & Heritage">Culture & Heritage</option>
                    <option value="High Altitude Trek">High Altitude Trek</option>
                    <option value="Wildlife & Safari">Wildlife & Safari</option>
                    <option value="Viewpoint & Adventure">Viewpoint & Adventure</option>
                    <option value="Spiritual & Pilgrimage">Spiritual & Pilgrimage</option>
                    <option value="Scenic Viewpoint">Scenic Viewpoint</option>
                    <option value="Expedition & Culture">Expedition & Culture</option>
                  </select>
                </div>

                {/* Altitude */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Altitude / Elevation</label>
                  <Input
                    placeholder="e.g. 3,245 m (10,646 ft)"
                    value={formData.altitude}
                    onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Best Season */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Best Season</label>
                  <Input
                    placeholder="e.g. October – May"
                    value={formData.bestSeason}
                    onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Starting Cost */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Estimated Starting Cost</label>
                  <Input
                    placeholder="e.g. NPR 8,500"
                    value={formData.startingCost}
                    onChange={(e) => setFormData({ ...formData, startingCost: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Map Query */}
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Google Maps Query</label>
                  <Input
                    placeholder="e.g. Khumai Danda, Kaski, Nepal"
                    value={formData.mapQuery}
                    onChange={(e) => setFormData({ ...formData, mapQuery: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-foreground">Cover Image URL *</label>
                  <Input
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={formData.coverImage}
                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Short Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-foreground">Short Summary Description *</label>
                  <Textarea
                    required
                    rows={2}
                    placeholder="Brief 1-2 sentence overview of the destination..."
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                {/* History & Culture */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-foreground">History, Heritage & Culture</label>
                  <Textarea
                    rows={3}
                    placeholder="In-depth background, cultural significance, and heritage story..."
                    value={formData.historyAndCulture}
                    onChange={(e) => setFormData({ ...formData, historyAndCulture: e.target.value })}
                    className="rounded-xl"
                  />
                </div>

                {/* Activities */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-foreground">Activities (comma-separated)</label>
                  <Input
                    placeholder="e.g. Camping, Ridge Hike, Sunrise View, Photography"
                    value={activitiesInput}
                    onChange={(e) => setActivitiesInput(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>

                {/* Highlights */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-foreground">Highlights (comma-separated)</label>
                  <Input
                    placeholder="e.g. Mardi Himal View, Sacred Great Wall Ridge, Rhododendron Forests"
                    value={highlightsInput}
                    onChange={(e) => setHighlightsInput(e.target.value)}
                    className="h-10 rounded-xl"
                  />
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-end gap-2 pt-4 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl font-bold bg-primary text-primary-foreground cursor-pointer"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin mr-1" /> : <Plus className="size-4 mr-1" />}
                  Save Destination
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DESTINATION DETAILS MODAL */}
      {selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-card border rounded-3xl overflow-hidden shadow-2xl space-y-0 max-h-[90vh] flex flex-col">
            <div className="relative h-48 w-full bg-muted overflow-hidden shrink-0">
              <Image
                src={selectedDestination.coverImage}
                alt={selectedDestination.name}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <Badge className="bg-primary text-primary-foreground text-xs font-bold mb-1">
                  {selectedDestination.category}
                </Badge>
                <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md">
                  {selectedDestination.name}
                </h2>
                <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-primary" /> {selectedDestination.region}
                </p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <p className="p-3.5 rounded-2xl bg-muted/40 border leading-relaxed text-foreground">
                {selectedDestination.shortDescription}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Altitude</span>
                  <span className="font-bold text-foreground text-sm block">
                    {selectedDestination.altitude || "N/A"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Best Season</span>
                  <span className="font-bold text-foreground text-sm block">
                    {selectedDestination.bestSeason || "Autumn & Spring"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Estimated Cost</span>
                  <span className="font-bold text-primary text-sm block">
                    {selectedDestination.startingCost || "NPR 4,500"}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-muted/30 border space-y-0.5">
                  <span className="text-muted-foreground text-[11px]">Catalog Ref</span>
                  <span className="font-mono font-bold text-foreground text-sm block">
                    ID #{selectedDestination.id}
                  </span>
                </div>
              </div>

              {selectedDestination.historyAndCulture && (
                <div className="space-y-1">
                  <span className="font-bold text-foreground uppercase tracking-wider text-muted-foreground text-[11px]">
                    Heritage & Culture
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedDestination.historyAndCulture}
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t bg-card flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDestination(null)}
                className="rounded-xl cursor-pointer"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Link href={`/destinations/${selectedDestination.id}`} target="_blank">
                  <Button size="sm" className="gap-1.5 rounded-xl cursor-pointer">
                    <ExternalLink className="size-3.5" /> View Public Page
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE DESTINATION MODAL */}
      {deletingDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 rounded-2xl bg-rose-500/10">
                <Trash2 className="size-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Remove Destination</h3>
                <p className="text-xs text-muted-foreground">This will remove it from the catalog.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete <strong className="text-foreground">{deletingDestination.name}</strong> (ID #{deletingDestination.id})?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => setDeletingDestination(null)}
                className="rounded-xl cursor-pointer"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                disabled={isPending}
                onClick={handleDelete}
                className="rounded-xl gap-1.5 font-semibold cursor-pointer"
              >
                {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                Confirm & Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
