"use client";

import { type FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  BedDouble,
  Camera,
  CheckCircle2,
  Compass,
  CreditCard,
  Loader2,
  Lock,
  LogIn,
  MapPin,
  Plus,
  ReceiptText,
  Salad,
  Sparkles,
  Star,
  Ticket,
  Users,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  addExpenseAction,
  getUserExpensesAction,
} from "@/app/features/expenses/actions/expense.action";

type ModuleId =
  | "accommodation"
  | "food"
  | "destination"
  | "guides"
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
    label: "Food & Dining",
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
        title: "Boutique Tea Garden",
        subtitle: "Organic breakfast bowls and fresh pastries",
        price: "NPR 1,200 / set",
        rating: 4.7,
        image:
          "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?q=80&w=1200&auto=format&fit=crop",
        tag: "Morning spot",
        location: "Patan",
      },
    ],
  },
  {
    id: "destination",
    label: "Destinations",
    icon: Compass,
    description: "Iconic places and hidden viewpoints",
    summary: "Heritage alleys, lakeside strolls, and alpine viewpoints",
    cards: [
      {
        id: "dest-1",
        title: "Phewa Lake Trail",
        subtitle: "Gentle morning walks with temple island stops",
        price: "Free access",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
        tag: "Nature",
        location: "Pokhara",
      },
      {
        id: "dest-2",
        title: "Patan Durbar Square",
        subtitle: "Historic courtyards, stone carvings, and artisan shops",
        price: "NPR 1,000 entry",
        rating: 4.8,
        image:
          "https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?q=80&w=1200&auto=format&fit=crop",
        tag: "Culture",
        location: "Lalitpur",
      },
      {
        id: "dest-3",
        title: "Nagarkot Ridge",
        subtitle: "Panoramic views from Annapurna to Everest range",
        price: "Day trip",
        rating: 4.9,
        image:
          "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
        tag: "Sunrise view",
        location: "Nagarkot",
      },
    ],
  },
  {
    id: "guides",
    label: "Tour Guides",
    icon: Users,
    description: "Certified locals who bring stories to life",
    summary: "Heritage specialists, trekking leaders, and culture storytellers",
    cards: [
      {
        id: "guide-1",
        title: "Aarav Sharma",
        subtitle: "Heritage walking tours and hidden courtyards",
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
    id: "expenses",
    label: "Expense Tracking",
    icon: ReceiptText,
    description: "Stay on budget with smarter trip tracking",
    summary:
      "Track stays, food, local transport, and daily spending in one place",
    cards: [],
  },
];

function getModuleExploreTarget(id: ModuleId): { href: string; label: string } {
  switch (id) {
    case "accommodation":
      return { href: "/hotels", label: "Explore More Hotels" };
    case "food":
      return { href: "/restaurants", label: "Explore More Restaurants" };
    case "destination":
      return { href: "/destinations", label: "Explore More Destinations" };
    case "guides":
      return { href: "/guides", label: "Explore More Tour Guides" };
    case "expenses":
      return { href: "/dashboard", label: "Explore Expense Tracker" };
  }
}

export default function ModuleExplorer() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [activeModuleId, setActiveModuleId] =
    useState<ModuleId>("accommodation");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isBooking, setIsBooking] = useState<string | null>(null);

  const [userExpenses, setUserExpenses] = useState<any[]>([]);

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    location: "",
    type: "food",
  });

  // Load existing expenses when signed in
  useEffect(() => {
    if (isAuthenticated) {
      getUserExpensesAction().then((res) => {
        if (res.success && res.data) {
          setUserExpenses(res.data);
        }
      });
    }
  }, [isAuthenticated]);

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

    if (!isAuthenticated) {
      toast.error("Please sign in to save expenses.");
      return;
    }

    const name = expenseForm.name.trim();
    const location = expenseForm.location.trim();
    const amount = Number(expenseForm.amount);

    if (!name || !location || !amount || amount <= 0) {
      toast.error("Please enter a valid expense name, amount, and location.");
      return;
    }

    setIsSubmittingExpense(true);

    try {
      const res = await addExpenseAction({
        name,
        amount,
        location,
        type: expenseForm.type,
      });

      if (res.success) {
        toast.success(res.message);
        if (res.data) {
          setUserExpenses((prev) => [res.data, ...prev]);
        }
        setExpenseForm({ name: "", amount: "", location: "", type: "food" });
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Unable to save the expense right now. Please try again.");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const totalUserExpenses = userExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );

  const handleBooking = async (card: ModuleCard) => {
    setIsBooking(card.id);
    try {
      const parsedCost = parseFloat(card.price.replace(/[^0-9.]/g, "")) || 1500;
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: activeModuleId === "food" ? "restaurant" : activeModuleId === "accommodation" ? "hotel" : activeModuleId,
          entity_id: parseInt(card.id.split("-")[1]) || 1,
          entity_name: card.title,
          location: card.location,
          total_cost: parsedCost,
          booking_notes: card.subtitle,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Booking failed");
      }

      const bookingId = data.booking?.id;

      // Initiate Khalti payment checkout
      toast.info(`Connecting to Khalti secure checkout for ${card.title}...`);
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount: parsedCost,
          itemName: card.title,
        }),
      });

      const payData = await payRes.json();
      if (payData.success && payData.payment_url) {
        window.location.href = payData.payment_url;
        return;
      }

      toast.success(`${card.title} reservation placed in ${card.location}!`);
    } catch {
      toast.error(`Unable to proceed with booking for ${card.title}. Please try again.`);
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
          <Link href={getModuleExploreTarget(activeModule.id).href}>
            <Button
              variant="outline"
              className="w-fit rounded-full px-5 py-2.5 text-sm font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-xs"
            >
              {getModuleExploreTarget(activeModule.id).label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Module Tab Selector */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = module.id === activeModule.id;

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => setActiveModuleId(module.id)}
                className={`group relative flex min-w-[180px] items-center gap-3 rounded-full border px-4 py-3 text-left transition-all duration-200 cursor-pointer ${
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

        {/* Active Module Content Container */}
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
              <Link href={getModuleExploreTarget(activeModule.id).href}>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5 cursor-pointer"
                >
                  {getModuleExploreTarget(activeModule.id).label} →
                </Button>
              </Link>
            </div>

            {/* EXPENSES MODULE */}
            {activeModule.id === "expenses" ? (
              !isAuthenticated ? (
                /* Unauthenticated Guard */
                <div className="rounded-[28px] border border-dashed bg-muted/20 p-8 md:p-12 text-center space-y-4">
                  <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Lock className="size-8" />
                  </div>
                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h3 className="text-xl font-bold">Sign In to Track Travel Expenses</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Keep your travel budget organized. Log daily meals, hotel stays, transport, and tour activities linked directly to your personal account.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link href="/sign-in">
                      <Button className="font-semibold gap-2 px-6">
                        <LogIn className="size-4" /> Sign In to Add Expenses
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Authenticated Expense Tracker Form & Live List */
                <div className="grid gap-6 lg:grid-cols-12">
                  <form
                    onSubmit={handleExpenseSubmit}
                    className="lg:col-span-7 rounded-[28px] border border-border bg-muted/30 p-5 md:p-6"
                  >
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                          Add expense
                        </p>
                        <h4 className="mt-1 text-xl font-bold text-foreground">
                          Record Trip Spending
                        </h4>
                      </div>
                      <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <ReceiptText className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-1.5 text-xs font-medium text-foreground sm:col-span-2">
                        <span>Expense Name / Note *</span>
                        <input
                          value={expenseForm.name}
                          onChange={(e) => handleExpenseChange("name", e.target.value)}
                          placeholder="e.g. Lakeside Dinner / Pokhara Taxi"
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                          required
                        />
                      </label>

                      <label className="space-y-1.5 text-xs font-medium text-foreground">
                        <span>Amount (NPR) *</span>
                        <input
                          type="number"
                          min="1"
                          value={expenseForm.amount}
                          onChange={(e) => handleExpenseChange("amount", e.target.value)}
                          placeholder="2500"
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                          required
                        />
                      </label>

                      <label className="space-y-1.5 text-xs font-medium text-foreground">
                        <span>Location / City *</span>
                        <input
                          value={expenseForm.location}
                          onChange={(e) => handleExpenseChange("location", e.target.value)}
                          placeholder="Pokhara"
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                          required
                        />
                      </label>

                      <label className="space-y-1.5 text-xs font-medium text-foreground sm:col-span-2">
                        <span>Category Type</span>
                        <select
                          value={expenseForm.type}
                          onChange={(e) => handleExpenseChange("type", e.target.value)}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/30"
                        >
                          <option value="food">🍽️ Food & Dining</option>
                          <option value="accommodation">🏨 Stay & Hotel</option>
                          <option value="transport">🚕 Transport & Taxi</option>
                          <option value="activity">🧗 Tour & Activity</option>
                          <option value="other">📦 Other</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-6 flex items-center justify-between gap-3 border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        Saved to your private travel budget
                      </p>
                      <Button
                        type="submit"
                        className="rounded-full font-semibold"
                        disabled={isSubmittingExpense}
                      >
                        {isSubmittingExpense ? (
                          <>
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Saving...
                          </>
                        ) : (
                          "Save Expense →"
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Right Column: Live Recorded Expenses */}
                  <div className="lg:col-span-5 rounded-[28px] border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <div>
                        <h4 className="font-bold text-sm">Your Logged Expenses</h4>
                        <p className="text-xs text-muted-foreground">
                          {userExpenses.length} recorded entry{userExpenses.length === 1 ? "" : "ies"}
                        </p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                        NPR {totalUserExpenses.toLocaleString()} Total
                      </Badge>
                    </div>

                    {userExpenses.length === 0 ? (
                      <div className="h-44 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed">
                        <ReceiptText className="size-8 text-muted-foreground mb-1.5" />
                        <p className="text-xs font-medium">No expenses logged yet</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Use the form to record your first stay, meal, or transport cost.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                        {userExpenses.slice(0, 5).map((exp) => (
                          <div
                            key={exp.id}
                            className="flex items-center justify-between rounded-xl border bg-muted/20 p-2.5 text-xs shadow-2xs"
                          >
                            <div className="space-y-0.5">
                              <p className="font-semibold text-foreground">{exp.name}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 capitalize">
                                📍 {exp.location} • {exp.type}
                              </p>
                            </div>
                            <span className="font-bold text-sm text-foreground">
                              NPR {exp.amount?.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            ) : (
              /* OTHER MODULES (Accommodation, Food, Destinations, Guides) */
              <div className="grid gap-4 md:grid-cols-3">
                {activeModule.cards.map((card) => {
                  const cardNumId = card.id.split("-")[1] || "1";
                  const detailHref =
                    activeModule.id === "accommodation"
                      ? `/hotels/${cardNumId}`
                      : activeModule.id === "food"
                      ? `/restaurants/${cardNumId}`
                      : activeModule.id === "destination"
                      ? `/destinations/${cardNumId}`
                      : `/guides/${cardNumId}`;

                  return (
                    <article
                      key={card.id}
                      className="group overflow-hidden rounded-[26px] border border-border bg-muted/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 flex flex-col justify-between"
                    >
                      <Link href={detailHref} className="block flex-1">
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
                              <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
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
                        </div>
                      </Link>

                      <div className="p-4 pt-0">
                        <div className="flex items-center justify-between border-t border-border pt-3">
                          <div>
                            <span className="block text-xl font-bold text-foreground">
                              {card.price}
                            </span>
                          </div>

                          {activeModule.id === "destination" ? (
                            <Link href={detailHref}>
                              <Button
                                size="sm"
                                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
                              >
                                Explore Details →
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
                              onClick={() => handleBooking(card)}
                              disabled={isBooking === card.id}
                            >
                              {isBooking === card.id ? "Booking..." : "Book now"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
