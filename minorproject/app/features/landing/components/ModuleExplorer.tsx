"use client";

import { type FormEvent, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  BedDouble,
  Camera,
  Compass,
  MapPin,
  ReceiptText,
  Salad,
  Sparkles,
  Star,
  Ticket,
  Utensils,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type ModuleId =
  | "accommodation"
  | "food"
  | "destination"
  | "guides"
  | "travel"
  | "expenses";

type ModuleCard = {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  rating: number;
  image: string;
  tag: string;
  location: string;
};

type ModuleConfig = {
  id: ModuleId;
  label: string;
  icon: typeof BedDouble;
  description: string;
  summary: string;
  cards: ModuleCard[];
};

const modules: ModuleConfig[] = [
  {
    id: "accommodation",
    label: "Accommodation",
    icon: BedDouble,
    description: "Curated stays for every kind of trip",
    summary: "Boutique stays, mountain cabins, and family-friendly hotels",
    cards: [
      {
        id: "stay-1",
        title: "Lakeview Haven",
        subtitle: "Private villa with sunrise deck",
        price: "NPR 8,400 / night",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop",
        tag: "2 guests",
        location: "Pokhara",
      },
      {
        id: "stay-2",
        title: "Everest Heights",
        subtitle: "Warm cabins with mountain panoramas",
        price: "NPR 11,200 / night",
        rating: 5.0,
        image:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
        tag: "2 bedrooms",
        location: "Namche",
      },
      {
        id: "stay-3",
        title: "Garden Courtyard",
        subtitle: "Peaceful boutique stay in the city",
        price: "NPR 6,800 / night",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
        tag: "Family room",
        location: "Kathmandu",
      },
    ],
  },
  {
    id: "food",
    label: "Food",
    icon: Utensils,
    description: "Local flavors and memorable dining",
    summary: "Foodie spots, rooftop dinners, and authentic local cuisine",
    cards: [
      {
        id: "food-1",
        title: "Himalayan Table",
        subtitle: "Traditional thali and Himalayan tasting menu",
        price: "NPR 1,950 / person",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop",
        tag: "Local favorite",
        location: "Kathmandu",
      },
      {
        id: "food-2",
        title: "Lakeside Grill",
        subtitle: "Fresh grills with sunset views over Phewa",
        price: "NPR 2,300 / person",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop",
        tag: "Rooftop dining",
        location: "Pokhara",
      },
      {
        id: "food-3",
        title: "Hidden Curry House",
        subtitle: "Slow-cooked curries and Nepali classics",
        price: "NPR 1,250 / person",
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1200&auto=format&fit=crop",
        tag: "Chef special",
        location: "Lumbini",
      },
    ],
  },
  {
    id: "destination",
    label: "Destination",
    icon: Compass,
    description: "Discover iconic places and hidden gems",
    summary:
      "Unforgettable travel moments, nature escapes, and cultural landmarks",
    cards: [
      {
        id: "dest-1",
        title: "Pokhara",
        subtitle: "Lakes, valley views, and adventure-filled afternoons",
        price: "3-day trip from NPR 12,500",
        rating: 5.0,
        image:
          "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=1200&auto=format&fit=crop",
        tag: "Popular",
        location: "Gandaki Province",
      },
      {
        id: "dest-2",
        title: "Everest Base Camp",
        subtitle: "Epic trekking trail with breathtaking ridge views",
        price: "7-day trek from NPR 28,000",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1519904981063-b0cf448d479e?q=80&w=1200&auto=format&fit=crop",
        tag: "Adventure",
        location: "Solukhumbu",
      },
      {
        id: "dest-3",
        title: "Mustang",
        subtitle: "Dry cliffs, monasteries, and high-altitude landscapes",
        price: "4-day escapade from NPR 16,800",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
        tag: "Scenic",
        location: "Gandaki Province",
      },
    ],
  },
  {
    id: "guides",
    label: "Guides",
    icon: Users,
    description: "Context-rich local expertise from trusted guides",
    summary: "Local storytellers, cultural specialists, and trekking mentors",
    cards: [
      {
        id: "guide-1",
        title: "Aarati Gurung",
        subtitle: "Cultural guide for heritage walks and temple tours",
        price: "NPR 3,200 / day",
        rating: 5.0,
        image:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop",
        tag: "Cultural",
        location: "Kathmandu",
      },
      {
        id: "guide-2",
        title: "Bikram Rai",
        subtitle: "Experienced trekking guide for mountain trails",
        price: "NPR 4,600 / day",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1200&auto=format&fit=crop",
        tag: "Trekking",
        location: "Pokhara",
      },
      {
        id: "guide-3",
        title: "Sunita Tamang",
        subtitle: "Nature guide for wildlife and village experiences",
        price: "NPR 3,800 / day",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop",
        tag: "Wildlife",
        location: "Chitwan",
      },
    ],
  },
  {
    id: "travel",
    label: "Travel",
    icon: Ticket,
    description: "Smooth transfers, itineraries, and planning",
    summary: "Transport, checkpoints, and route planning built for comfort",
    cards: [
      {
        id: "travel-1",
        title: "Scenic Route Pass",
        subtitle: "Private transfer from airport to stay",
        price: "NPR 2,800",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200&auto=format&fit=crop",
        tag: "Transfer",
        location: "Airport to Pokhara",
      },
      {
        id: "travel-2",
        title: "Heritage Train Day",
        subtitle: "Train and bus combo for flexible sightseeing",
        price: "NPR 4,100",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1200&auto=format&fit=crop",
        tag: "Travel plan",
        location: "Kathmandu",
      },
      {
        id: "travel-3",
        title: "Adventure Connector",
        subtitle: "Route planning for jeep, flights, and local stops",
        price: "NPR 5,400",
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?q=80&w=1200&auto=format&fit=crop",
        tag: "Route",
        location: "Himalaya",
      },
    ],
  },
  {
    id: "expenses",
    label: "Expense Tracking",
    icon: ReceiptText,
    description: "Stay on budget with smarter trip tracking",
    summary:
      "Track stays, food, local transport, and daily spending in one place",
    cards: [
      {
        id: "expense-1",
        title: "Daily Budget Snapshot",
        subtitle: "Spend summary by accommodation, food, and travel",
        price: "NPR 18,400 / trip",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
        tag: "Budget smart",
        location: "Trip total",
      },
      {
        id: "expense-2",
        title: "Food & Stay Split",
        subtitle: "Breakdown of major trip costs and remaining budget",
        price: "NPR 9,800 / 3 days",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200&auto=format&fit=crop",
        tag: "Details",
        location: "Pokhara",
      },
      {
        id: "expense-3",
        title: "Cash Flow Planner",
        subtitle: "Smart forecasts for transport, meals, and experiences",
        price: "NPR 6,300 reserved",
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=1200&auto=format&fit=crop",
        tag: "Forecast",
        location: "Trip planner",
      },
    ],
  },
];

export default function ModuleExplorer() {
  const [activeModuleId, setActiveModuleId] =
    useState<ModuleId>("accommodation");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    location: "",
    type: "food",
  });

  const activeModule =
    modules.find((module) => module.id === activeModuleId) ?? modules[0];

  const handleExpenseChange = (
    field: keyof typeof expenseForm,
    value: string,
  ) => {
    setExpenseForm((current) => ({ ...current, [field]: value }));
  };

  const handleExpenseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = expenseForm.name.trim();
    const location = expenseForm.location.trim();
    const amount = Number(expenseForm.amount);

    if (!name || !location || !amount || amount <= 0) {
      toast.error("Please enter a valid expense name, amount, and location.");
      return;
    }

    setIsSubmittingExpense(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Expense submitted:", expenseForm);
      toast.success(
        `${name} saved successfully for ${location} (${expenseForm.type}).`,
      );
      setExpenseForm({ name: "", amount: "", location: "", type: "food" });
    } catch {
      toast.error("Unable to save the expense right now. Please try again.");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const handleBooking = async (card: ModuleCard) => {
    setIsBooking(card.id);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: activeModuleId,
          entity_id: parseInt(card.id.split("-")[1]),
          entity_name: card.title,
          location: card.location,
          total_cost: parseFloat(card.price.replace(/[^0-9.]/g, "")),
          booking_notes: card.subtitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      toast.success(`${card.title} booked successfully in ${card.location}!`);
    } catch {
      toast.error(`Unable to book ${card.title}. Please try again.`);
    } finally {
      setIsBooking(null);
    }
  };

  return (
    <section className="bg-muted/30 py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Explore the trip
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Find what fits your next stay
            </h2>
          </div>
          <Button
            variant="outline"
            className="w-fit rounded-full px-5 py-2.5 text-sm font-medium"
          >
            View all experiences
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = module.id === activeModule.id;

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setActiveModuleId(module.id)}
                className={`group relative flex min-w-[180px] items-center gap-3 rounded-full border px-4 py-3 text-left transition-all duration-200 ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">
                    {module.label}
                  </span>
                  <span
                    className={`block text-[11px] ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {module.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-[32px] border border-border bg-card p-4 shadow-sm md:p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/60 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Featured
                  </p>
                  <h3 className="text-base font-semibold text-foreground">
                    {activeModule.label}
                  </h3>
                </div>
              </div>
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
                {activeModule.summary}
              </span>
            </div>

            {activeModule.id === "expenses" ? (
              <form
                onSubmit={handleExpenseSubmit}
                className="rounded-[28px] border border-border bg-muted/30 p-5 md:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Add expense
                    </p>
                    <h4 className="mt-1 text-2xl font-bold text-foreground">
                      Record trip spending
                    </h4>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ReceiptText className="h-5 w-5" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 text-sm text-foreground">
                    <span className="font-medium">Expense name</span>
                    <input
                      value={expenseForm.name}
                      onChange={(event) =>
                        handleExpenseChange("name", event.target.value)
                      }
                      placeholder="Hotel stay"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm text-foreground">
                    <span className="font-medium">Amount</span>
                    <input
                      type="number"
                      min="1"
                      value={expenseForm.amount}
                      onChange={(event) =>
                        handleExpenseChange("amount", event.target.value)
                      }
                      placeholder="2500"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm text-foreground md:col-span-1">
                    <span className="font-medium">Location</span>
                    <input
                      value={expenseForm.location}
                      onChange={(event) =>
                        handleExpenseChange("location", event.target.value)
                      }
                      placeholder="Pokhara"
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      required
                    />
                  </label>

                  <label className="space-y-2 text-sm text-foreground md:col-span-1">
                    <span className="font-medium">Type</span>
                    <select
                      value={expenseForm.type}
                      onChange={(event) =>
                        handleExpenseChange("type", event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="food">food</option>
                      <option value="accommodation">accommodation</option>
                      <option value="transport">transport</option>
                      <option value="activity">activity</option>
                      <option value="other">other</option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                  <p className="text-sm text-muted-foreground">
                    Matches the existing expense schema: name, amount, location,
                    and type.
                  </p>
                  <Button
                    type="submit"
                    className="rounded-full"
                    disabled={isSubmittingExpense}
                  >
                    {isSubmittingExpense ? "Saving..." : "Save expense"}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {activeModule.cards.map((card) => (
                  <article
                    key={card.id}
                    className="group overflow-hidden rounded-[26px] border border-border bg-muted/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {card.rating.toFixed(1)}
                      </div>
                      <div className="absolute right-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-background backdrop-blur-sm">
                        {card.tag}
                      </div>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-lg font-semibold text-foreground">
                            {card.title}
                          </h4>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {card.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {card.location}
                      </div>

                      <div className="flex items-center justify-between border-t border-border pt-3">
                        <div>
                          <span className="block text-xl font-bold text-foreground">
                            {card.price}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleBooking(card)}
                          disabled={isBooking === card.id}
                        >
                          {isBooking === card.id ? "Booking..." : "Book now"}
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
