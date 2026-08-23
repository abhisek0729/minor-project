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

const defaultModules: ModuleConfig[] = [
  {
    id: "accommodation",
    label: "Accommodation",
    icon: BedDouble,
    description: "Curated stays for every kind of trip",
    summary: "Boutique stays, mountain cabins, and family-friendly hotels",
    cards: [
      {
        id: "1",
        title: "Hotel Barahi",
        subtitle: "Lakeside luxury resort with mountain garden views",
        price: "NPR 6,500 / night",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=75",
        tag: "Verified Stay",
        location: "Pokhara, Gandaki",
      },
      {
        id: "2",
        title: "Dwarika's Heritage",
        subtitle: "Restored Newari palace hotel in central Kathmandu",
        price: "NPR 11,200 / night",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=75",
        tag: "Heritage",
        location: "Kathmandu, Bagmati",
      },
      {
        id: "3",
        title: "Temple Tree Resort",
        subtitle: "Boutique peaceful retreat with pool and garden",
        price: "NPR 7,800 / night",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=75",
        tag: "Boutique",
        location: "Pokhara, Gandaki",
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
        id: "1",
        title: "Moondance Restaurant & Bar",
        subtitle: "Wood-fired pizzas and fresh Himalayan trout",
        price: "NPR 850 / set",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=75",
        tag: "Lakeside",
        location: "Pokhara, Gandaki",
      },
      {
        id: "2",
        title: "Bhojan Griha Heritage Dining",
        subtitle: "Traditional Newari feasts and cultural performance",
        price: "NPR 1,200 / set",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=600&q=75",
        tag: "Cultural Feast",
        location: "Kathmandu, Bagmati",
      },
      {
        id: "3",
        title: "OR2K Middle Eastern",
        subtitle: "Fresh organic salads, hummus and vegan specialties",
        price: "NPR 750 / set",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=600&q=75",
        tag: "Organic Vegan",
        location: "Kathmandu, Bagmati",
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
        id: "1",
        title: "Phewa Lake & Tal Barahi",
        subtitle: "Peaceful boat rides with reflection of Annapurna",
        price: "Free access",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=75",
        tag: "Must Visit",
        location: "Gandaki Province",
      },
      {
        id: "2",
        title: "Everest Base Camp (EBC)",
        subtitle: "World famous trekking trail under Mount Everest",
        price: "NPR 9,500/day",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=600&q=75",
        tag: "High Trek",
        location: "Koshi Province",
      },
      {
        id: "3",
        title: "Pashupatinath Temple Complex",
        subtitle: "Sacred UNESCO World Heritage pagoda shrine on Bagmati",
        price: "NPR 2,000 entry",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=600&q=75",
        tag: "Heritage",
        location: "Bagmati Province",
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
        id: "1",
        title: "Jyoti Sharma",
        subtitle: "Specialized in Kathmandu Valley heritage, sacred courtyards, and folklore",
        price: "NPR 3,200 / day",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=75",
        tag: "Heritage Guide",
        location: "Kathmandu & Patan",
      },
      {
        id: "2",
        title: "Bikram Rai",
        subtitle: "High-altitude mountain guide for Annapurna, Mardi Himal & Poon Hill",
        price: "NPR 4,600 / day",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=75",
        tag: "Alpine Leader",
        location: "Pokhara & Annapurna",
      },
      {
        id: "3",
        title: "Sunita Tamang",
        subtitle: "Eco-tourism and wildlife naturalist leading jeep safaris & nature walks",
        price: "NPR 3,800 / day",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=75",
        tag: "Wildlife Safari",
        location: "Chitwan & Sauraha",
      },
    ],
  },
  {
    id: "expenses",
    label: "Expense Tracking",
    icon: ReceiptText,
    description: "Stay on budget with smarter trip tracking",
    summary: "Track stays, food, local transport, and daily spending in one place",
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

interface ModuleExplorerProps {
  featuredHotels?: ModuleCard[];
  featuredRestaurants?: ModuleCard[];
  featuredDestinations?: ModuleCard[];
  featuredGuides?: ModuleCard[];
}

function SafeCardImage({
  src,
  alt,
  fallback = "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop",
}: {
  src: string;
  alt: string;
  fallback?: string;
}) {
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    if (src) setImgSrc(src);
  }, [src]);

  return (
    <div className="relative h-40 sm:h-44 md:h-48 w-full overflow-hidden bg-muted">
      <Image
        src={imgSrc || fallback}
        alt={alt}
        fill
        unoptimized
        loading="lazy"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        onError={() => {
          if (imgSrc !== fallback) {
            setImgSrc(fallback);
          }
        }}
      />
    </div>
  );
}

export default function ModuleExplorer({
  featuredHotels,
  featuredRestaurants,
  featuredDestinations,
  featuredGuides,
}: ModuleExplorerProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [activeModuleId, setActiveModuleId] = useState<ModuleId>("accommodation");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isBooking, setIsBooking] = useState<string | null>(null);

  const [userExpenses, setUserExpenses] = useState<any[]>([]);

  const [expenseForm, setExpenseForm] = useState({
    name: "",
    amount: "",
    location: "",
    type: "food",
  });

  const dynamicModules: ModuleConfig[] = [
    {
      id: "accommodation",
      label: "Accommodation",
      icon: BedDouble,
      description: "Curated stays for every kind of trip",
      summary: "Boutique stays, mountain cabins, and family-friendly hotels",
      cards: featuredHotels && featuredHotels.length > 0 ? featuredHotels : defaultModules[0].cards,
    },
    {
      id: "food",
      label: "Food & Dining",
      icon: Utensils,
      description: "Local flavors and memorable dining",
      summary: "Foodie spots, rooftop dinners, and authentic local cuisine",
      cards: featuredRestaurants && featuredRestaurants.length > 0 ? featuredRestaurants : defaultModules[1].cards,
    },
    {
      id: "destination",
      label: "Destinations",
      icon: Compass,
      description: "Iconic places and hidden viewpoints",
      summary: "Heritage alleys, lakeside strolls, and alpine viewpoints",
      cards: featuredDestinations && featuredDestinations.length > 0 ? featuredDestinations : defaultModules[2].cards,
    },
    {
      id: "guides",
      label: "Tour Guides",
      icon: Users,
      description: "Certified locals who bring stories to life",
      summary: "Heritage specialists, trekking leaders, and culture storytellers",
      cards: featuredGuides && featuredGuides.length > 0 ? featuredGuides : defaultModules[3].cards,
    },
    {
      id: "expenses",
      label: "Expense Tracking",
      icon: ReceiptText,
      description: "Stay on budget with smarter trip tracking",
      summary: "Track stays, food, local transport, and daily spending in one place",
      cards: [],
    },
  ];

  const modules = dynamicModules;

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
        <div className="mb-6 text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Explore Categories
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Find what fits your next trip
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            {activeModule.summary}
          </p>
        </div>

        {/* Module Tab Selector */}
        <div role="tablist" aria-label="Tourism Categories" className="mb-6 flex gap-2 sm:gap-3 overflow-x-auto pb-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden justify-start sm:justify-center">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = module.id === activeModule.id;

            return (
              <button
                key={module.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Select ${module.label} module`}
                onClick={() => setActiveModuleId(module.id)}
                className={`group relative flex min-w-[130px] sm:min-w-[160px] items-center gap-2.5 rounded-full border px-3 py-2 sm:px-4 sm:py-2.5 text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : "border-border bg-card text-foreground hover:border-primary/30"
                }`}
              >
                <span
                  className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-primary-foreground/15 text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs sm:text-sm font-semibold truncate">
                    {module.label}
                  </span>
                  <span
                    className={`block text-[10px] sm:text-[11px] truncate ${isActive ? "text-primary-foreground/90 font-medium" : "text-muted-foreground"}`}
                  >
                    {module.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Module Content Container */}
        <div className="rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-5 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl sm:rounded-2xl bg-muted/60 px-3.5 py-2.5">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                  Featured Recommendations
                </p>
                <h3 className="text-xs sm:text-sm font-bold text-foreground">
                  {activeModule.label}
                </h3>
              </div>
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
              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {activeModule.cards.map((card) => {
                  const cardNumId = card.id.includes("-") ? card.id.split("-")[1] : card.id;
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
                      className="group overflow-hidden rounded-2xl sm:rounded-[22px] border border-border bg-card shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between"
                    >
                      <Link href={detailHref} className="block flex-1">
                        <div className="relative overflow-hidden">
                          <SafeCardImage src={card.image} alt={card.title} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
                          <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-xs backdrop-blur-sm pointer-events-none">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {card.rating.toFixed(1)}
                          </div>
                          <div className="absolute right-2.5 top-2.5 rounded-full bg-foreground/80 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.1em] text-background backdrop-blur-sm pointer-events-none">
                            {card.tag}
                          </div>
                        </div>

                        <div className="space-y-1.5 p-3 sm:p-3.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {card.title}
                              </h4>
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {card.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="truncate">{card.location}</span>
                          </div>
                        </div>
                      </Link>

                      <div className="p-3 sm:p-3.5 pt-0">
                        <div className="flex items-center justify-between border-t border-border pt-2.5">
                          <div>
                            <span className="block text-sm sm:text-base font-bold text-foreground">
                              {card.price}
                            </span>
                          </div>

                          {activeModule.id === "destination" ? (
                            <Link href={detailHref}>
                              <Button
                                size="sm"
                                className="h-8 rounded-full bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
                              >
                                Explore →
                              </Button>
                            </Link>
                          ) : activeModule.id === "food" ? (
                            <Link href={detailHref}>
                              <Button
                                size="sm"
                                className="h-8 rounded-full bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
                              >
                                View Menu →
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              size="sm"
                              className="h-8 rounded-full bg-primary px-3 text-xs text-primary-foreground hover:bg-primary/90 font-semibold cursor-pointer"
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
            {/* Dedicated Lower Explore More Button */}
            <div className="pt-4 sm:pt-6 flex justify-center border-t border-border/60">
              <Link href={getModuleExploreTarget(activeModule.id).href}>
                <Button
                  size="default"
                  variant="outline"
                  aria-label={`Explore more ${activeModule.label}`}
                  className="rounded-full border-primary/40 px-6 py-2.5 text-xs sm:text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground shadow-xs gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  {getModuleExploreTarget(activeModule.id).label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
