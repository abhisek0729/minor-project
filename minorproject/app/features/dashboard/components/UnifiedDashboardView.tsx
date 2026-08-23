"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  Compass,
  CreditCard,
  ExternalLink,
  Hotel,
  LayoutDashboard,
  Loader2,
  LogOut,
  MapPin,
  MapPinned,
  Menu,
  Package,
  Plus,
  Receipt,
  Settings,
  Shield,
  ShieldCheck,
  Siren,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import GlobalWorkspaceSwitcher from "@/app/components/dashboard/GlobalWorkspaceSwitcher";
import NotificationBell from "@/app/components/dashboard/NotificationBell";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { addExpenseAction } from "@/app/features/expenses/actions/expense.action";

interface UnifiedDashboardViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    provider: string;
    createdAt: string;
    initials: string;
  };
  roles: Array<{ name: string; approvalStatus?: string }>;
  restaurant: any;
  hotel: any;
  guide: any;
  bookings: any[];
  expenses?: any[];
}

export default function UnifiedDashboardView({
  user,
  roles,
  restaurant,
  hotel,
  guide,
  bookings,
  expenses = [],
}: UnifiedDashboardViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces" | "bookings" | "expenses" | "itinerary" | "settings">("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Filter roles and statuses
  const hotelRole = roles.find((r) => r.name === "hotelOwner");
  const restaurantRole = roles.find((r) => r.name === "restaurantOwner");
  const guideRole = roles.find((r) => r.name === "guide");
  const adminRole = roles.find((r) => r.name === "admin");

  const hasHotel = !!hotelRole;
  const hasRestaurant = !!restaurantRole;
  const hasGuide = !!guideRole;
  const hasAdmin = !!adminRole;

  const hotelStatus = hotelRole?.approvalStatus ?? "pending";
  const restaurantStatus = restaurantRole?.approvalStatus ?? "pending";
  const guideStatus = guideRole?.approvalStatus ?? "pending";
  const isAdminApproved = adminRole?.approvalStatus === "approved";

  // Booking stats
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;
  const totalSpent = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [payingBookingId, setPayingBookingId] = useState<number | null>(null);

  // Expense State & Filtering
  const [expensesList, setExpensesList] = useState<any[]>(expenses || []);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState("all");
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    location: "Nepal",
    type: "food",
  });

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name.trim() || !newExpense.amount || Number(newExpense.amount) <= 0) {
      toast.error("Please enter a valid expense name and amount.");
      return;
    }
    setIsSubmittingExpense(true);
    try {
      const res = await addExpenseAction({
        name: newExpense.name.trim(),
        amount: Number(newExpense.amount),
        location: newExpense.location.trim() || "Nepal",
        type: newExpense.type || "other",
      });
      if (res.success && res.data) {
        toast.success(res.message);
        setExpensesList((prev) => [res.data, ...prev]);
        setIsAddExpenseOpen(false);
        setNewExpense({ name: "", amount: "", location: "Nepal", type: "food" });
      } else {
        toast.error(res.message || "Failed to log expense");
      }
    } catch (err: any) {
      toast.error(err.message || "Error logging expense");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  const totalExpenseSum = expensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const foodExpenseSum = expensesList
    .filter((e) => e.type === "food" || e.type === "dining" || e.type === "meal")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const lodgingExpenseSum = expensesList
    .filter((e) => e.type === "lodging" || e.type === "hotel" || e.type === "stay")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const transitExpenseSum = expensesList
    .filter((e) => e.type === "transportation" || e.type === "transport" || e.type === "activities" || e.type === "travel")
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const filteredExpenses = expensesList.filter((e) => {
    const matchesCategory =
      expenseCategoryFilter === "all" ||
      e.type === expenseCategoryFilter ||
      (expenseCategoryFilter === "food" && (e.type === "dining" || e.type === "meal")) ||
      (expenseCategoryFilter === "lodging" && (e.type === "hotel" || e.type === "stay")) ||
      (expenseCategoryFilter === "transportation" && (e.type === "transport" || e.type === "bus" || e.type === "flight"));

    const matchesSearch =
      !expenseSearch.trim() ||
      e.name?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      e.location?.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      e.type?.toLowerCase().includes(expenseSearch.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handlePayKhalti = async (booking: any) => {
    try {
      setPayingBookingId(booking.id);
      toast.info("Connecting to Khalti secure checkout...");
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          amount: booking.totalAmount,
          itemName: booking.itemName || "Trip Reservation",
        }),
      });

      const data = await res.json();
      if (data.success && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        toast.error(data.error || "Failed to start Khalti payment");
      }
    } catch (err: any) {
      toast.error(err.message || "Payment initiation error");
    } finally {
      setPayingBookingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === "all") return true;
    return b.status === bookingFilter || b.bookingType === bookingFilter;
  });

  const renderNavButtons = (onSelect?: () => void) => (
    <nav className="space-y-1.5">
      {isAdminApproved && (
        <Link
          href="/dashboard/admin"
          onClick={() => onSelect && onSelect()}
          className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-md hover:opacity-95 transition-all mb-3 cursor-pointer"
        >
          <ShieldCheck className="size-4 shrink-0" />
          <span>Super Admin Console</span>
          <ArrowRight className="size-3.5 ml-auto" />
        </Link>
      )}

      <div className="px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
        Portal Navigation
      </div>

      <button
        type="button"
        onClick={() => {
          setActiveTab("overview");
          if (onSelect) onSelect();
        }}
        className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === "overview"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <LayoutDashboard className="size-4" />
        <span>Overview & Summary</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setActiveTab("workspaces");
          if (onSelect) onSelect();
        }}
        className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === "workspaces"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <Building2 className="size-4" />
          <span>My Workspaces</span>
        </div>
        {roles.filter((r) => r.name !== "tourist").length > 0 && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${activeTab === "workspaces" ? "border-white text-white" : ""}`}>
            {roles.filter((r) => r.name !== "tourist").length}
          </Badge>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setActiveTab("bookings");
          if (onSelect) onSelect();
        }}
        className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === "bookings"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <Package className="size-4" />
          <span>My Trips & Bookings</span>
        </div>
        {totalBookings > 0 && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${activeTab === "bookings" ? "border-white text-white" : ""}`}>
            {totalBookings}
          </Badge>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setActiveTab("expenses");
          if (onSelect) onSelect();
        }}
        className={`flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === "expenses"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <div className="flex items-center gap-3">
          <Receipt className="size-4" />
          <span>Expense Tracker</span>
        </div>
        {expensesList.length > 0 && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${activeTab === "expenses" ? "border-white text-white" : ""}`}>
            {expensesList.length}
          </Badge>
        )}
      </button>

      <button
        type="button"
        onClick={() => {
          setActiveTab("itinerary");
          if (onSelect) onSelect();
        }}
        className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === "itinerary"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <MapPinned className="size-4" />
        <span>AI Trip Planner</span>
      </button>

      <button
        type="button"
        onClick={() => {
          setActiveTab("settings");
          if (onSelect) onSelect();
        }}
        className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
          activeTab === "settings"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Settings className="size-4" />
        <span>Profile & Settings</span>
      </button>

      <Link
        href="/emergency"
        onClick={() => onSelect && onSelect()}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-500/30 mt-2"
      >
        <div className="flex items-center gap-3">
          <Siren className="size-4 animate-pulse text-rose-600" />
          <span>Emergency SOS Hub</span>
        </div>
        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 bg-rose-600">
          24/7
        </Badge>
      </Link>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20 w-full">
      {/* Desktop Left Sidebar (Pinned on large screens) */}
      <aside className="hidden lg:flex w-72 shrink-0 border-r bg-card flex-col justify-between overflow-y-auto p-5 space-y-6 shadow-2xs">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-bold text-lg text-foreground hover:opacity-90 transition-opacity">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <span className="block leading-tight font-bold">TravelNepal</span>
              <span className="block text-[10px] text-muted-foreground font-normal">Unified Workspace</span>
            </div>
          </Link>

          {/* User Quick Mini Profile */}
          <Card className="p-3.5 border shadow-2xs bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base border border-primary/20 shrink-0">
                {user.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xs truncate">{user.name}</h3>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-semibold">
                    <CheckCircle2 className="size-2.5 mr-0.5" /> Verified
                  </Badge>
                  {roles.some((r) => r.name === "admin") && (
                    <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-rose-500/30 text-rose-600 bg-rose-500/10 font-semibold">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Navigation Items */}
          {renderNavButtons()}
        </div>

        {/* Partner Upsell Card */}
        <Card className="p-4 border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center gap-2 text-primary font-bold text-xs">
            <Sparkles className="size-4" />
            <span>Join Partner Network</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Register your Hotel, Restaurant, or Tour Guide service on TravelNepal.
          </p>
          <Link href="/partner/business-type">
            <Button size="sm" className="w-full text-xs font-semibold gap-1.5 cursor-pointer">
              <Plus className="size-3.5" /> Become a Partner
            </Button>
          </Link>
        </Card>
      </aside>

      {/* Main Full-Width Right Workspace Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 sm:px-8 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 hover:bg-accent focus:outline-none lg:hidden cursor-pointer">
                <Menu className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="flex w-80 flex-col p-0">
                <SheetHeader className="border-b px-6 py-5">
                  <SheetTitle className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Building2 className="size-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-base text-foreground leading-none">TravelNepal</p>
                      <p className="text-xs text-muted-foreground mt-1">Unified Workspace</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  <Card className="p-3 border shadow-2xs bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
                        {user.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-xs truncate">{user.name}</h3>
                        <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                  </Card>
                  {renderNavButtons(() => setMobileNavOpen(false))}
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">Workspace View:</span>
              <Badge variant="secondary" className="text-xs font-semibold capitalize">
                {activeTab}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <GlobalWorkspaceSwitcher />

            <NotificationBell />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer h-9 px-2.5 sm:px-3"
            >
              <LogOut className="size-3.5 sm:mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Quick Horizontal Scrollable Tabs Bar for Mobile Screens */}
        <div className="lg:hidden flex items-center gap-1.5 px-4 py-2 border-b bg-background/80 backdrop-blur-sm overflow-x-auto shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("workspaces")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "workspaces"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Workspaces ({roles.filter((r) => r.name !== "tourist").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "bookings"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Bookings ({totalBookings})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("expenses")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "expenses"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Expenses ({expensesList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("itinerary")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "itinerary"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            AI Planner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === "settings"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted/60 text-muted-foreground hover:text-foreground"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Scrollable Main Content Container Occupying Entire Width */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB 1: OVERVIEW & SUMMARY */}
          {activeTab === "overview" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Traveler & Partner Dashboard</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Welcome back, {user.name}. Manage all your travel bookings, trip itineraries, and partner workspaces in one place.
                </p>
              </div>

              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-5 border shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Total Bookings</p>
                      <p className="text-2xl font-extrabold mt-1">{totalBookings}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                      <Package className="size-6" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {activeBookings} active trip / stay reservations
                  </p>
                </Card>

                <Card className="p-5 border shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Partner Workspaces</p>
                      <p className="text-2xl font-extrabold mt-1">{roles.filter((r) => r.name !== "tourist").length}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <Building2 className="size-6" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Active hotel, dining & guide listings
                  </p>
                </Card>

                <Card className="p-5 border shadow-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Digital Bookings Spend</p>
                      <p className="text-2xl font-extrabold mt-1">NPR {totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-600">
                      <CreditCard className="size-6" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Verified Khalti checkout payments
                  </p>
                </Card>

                <Card
                  onClick={() => setActiveTab("expenses")}
                  className="p-5 border shadow-xs hover:border-primary/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
                        Logged Expenses
                      </p>
                      <p className="text-2xl font-extrabold mt-1">NPR {totalExpenseSum.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-105 transition-transform">
                      <Receipt className="size-6" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center justify-between">
                    <span>{expensesList.length} items logged</span>
                    <span className="text-primary font-bold group-hover:underline">View Tracker →</span>
                  </p>
                </Card>
              </div>

              {/* Workspaces Quick Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">Partner Workspaces</h2>
                  <Button variant="link" size="sm" onClick={() => setActiveTab("workspaces")} className="text-xs text-primary p-0">
                    View all workspaces →
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Hotel Workspace Card */}
                  {hasHotel ? (
                    <Card className="border p-5 hover:border-primary/50 transition-all shadow-xs group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:scale-105 transition-transform">
                            <Hotel className="size-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{hotel?.name || "Hotel Management"}</h3>
                            <p className="text-xs text-muted-foreground">
                              {hotelStatus === "pending"
                                ? !hotel
                                  ? "Registration submitted • Onboarding needed"
                                  : "Application under administrator review"
                                : "Manage rooms, rates & guest check-ins"}
                            </p>
                          </div>
                        </div>
                        {hotelStatus === "pending" ? (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] gap-1">
                            <Clock3 className="size-2.5" /> Verification Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] gap-1">
                            <CheckCircle2 className="size-2.5" /> Approved
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Hotel Partner</span>
                        {hotelStatus === "pending" ? (
                          !hotel ? (
                            <Link href="/onboarding/hotel">
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                                Complete Onboarding <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/dashboard/hotels/pending">
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                                View Pending Status <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          )
                        ) : (
                          <Link href="/dashboard/hotels">
                            <Button size="sm" className="text-xs gap-1.5 h-8">
                              Open Hotel Dashboard <ArrowRight className="size-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  {/* Restaurant Workspace Card */}
                  {hasRestaurant ? (
                    <Card className="border p-5 hover:border-primary/50 transition-all shadow-xs group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 group-hover:scale-105 transition-transform">
                            <UtensilsCrossed className="size-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{restaurant?.name || "Restaurant Management"}</h3>
                            <p className="text-xs text-muted-foreground">
                              {restaurantStatus === "pending"
                                ? !restaurant
                                  ? "Registration submitted • Onboarding needed"
                                  : "Application under administrator review"
                                : "Food menus, live orders & table bookings"}
                            </p>
                          </div>
                        </div>
                        {restaurantStatus === "pending" ? (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] gap-1">
                            <Clock3 className="size-2.5" /> Verification Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] gap-1">
                            <CheckCircle2 className="size-2.5" /> Approved
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Dining Partner</span>
                        {restaurantStatus === "pending" ? (
                          !restaurant ? (
                            <Link href="/onboarding/restaurant">
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                                Complete Onboarding <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/dashboard/restaurant/pending">
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                                View Pending Status <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          )
                        ) : (
                          <Link href="/dashboard/restaurant">
                            <Button size="sm" className="text-xs gap-1.5 h-8">
                              Open Restaurant Panel <ArrowRight className="size-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  {/* Guide Workspace Card */}
                  {hasGuide ? (
                    <Card className="border p-5 hover:border-primary/50 transition-all shadow-xs group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 group-hover:scale-105 transition-transform">
                            <Compass className="size-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">{guide?.name || "Tour Guide Portal"}</h3>
                            <p className="text-xs text-muted-foreground">
                              {guideStatus === "pending"
                                ? !guide
                                  ? "Registration submitted • Onboarding needed"
                                  : "Application under administrator review"
                                : "Tour packages, guiding calendar & requests"}
                            </p>
                          </div>
                        </div>
                        {guideStatus === "pending" ? (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] gap-1">
                            <Clock3 className="size-2.5" /> Verification Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] gap-1">
                            <CheckCircle2 className="size-2.5" /> Approved & Active
                          </Badge>
                        )}
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Tour Guide Partner</span>
                        {guideStatus === "pending" ? (
                          <div className="flex items-center gap-2">
                            <Link href="/onboarding/guide">
                              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 cursor-pointer">
                                Complete Onboarding <ArrowRight className="size-3" />
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <Link href="/dashboard/guide">
                            <Button size="sm" className="text-xs gap-1.5 h-8 cursor-pointer">
                              Open Guide Portal <ArrowRight className="size-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  ) : null}

                  {/* Admin Workspace Card */}
                  {hasAdmin && isAdminApproved ? (
                    <Card className="border p-5 hover:border-primary/50 transition-all shadow-xs group border-primary/30">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                            <ShieldCheck className="size-6" />
                          </div>
                          <div>
                            <h3 className="font-bold text-sm">System Administration</h3>
                            <p className="text-xs text-muted-foreground">Platform oversight, approvals & analytics</p>
                          </div>
                        </div>
                        <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-[10px]">
                          Admin Control
                        </Badge>
                      </div>
                      <div className="mt-4 pt-3 border-t flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">Site Administrator</span>
                        <Link href="/dashboard/admin">
                          <Button size="sm" className="text-xs gap-1.5 h-8">
                            Open Admin Center <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ) : null}

                  {/* If user has no partner workspaces */}
                  {!hasHotel && !hasRestaurant && !hasGuide && !hasAdmin && (
                    <Card className="border-dashed bg-muted/15 p-6 text-center sm:col-span-2 space-y-2">
                      <p className="font-semibold text-sm">No business partner workspaces active</p>
                      <p className="text-xs text-muted-foreground">
                        You currently have a standard tourist account. You can register your hotel, restaurant, or guide service anytime.
                      </p>
                      <Link href="/partner/business-type" className="inline-block pt-2">
                        <Button size="sm" className="text-xs gap-1.5">
                          <Plus className="size-3.5" /> Register a Business
                        </Button>
                      </Link>
                    </Card>
                  )}
                </div>
              </div>

              {/* Recent Bookings Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold tracking-tight">Recent Trip Bookings</h2>
                  <Button variant="link" size="sm" onClick={() => setActiveTab("bookings")} className="text-xs text-primary p-0">
                    View all bookings ({totalBookings}) →
                  </Button>
                </div>

                {bookings.length === 0 ? (
                  <Card className="border-dashed p-8 text-center bg-muted/10">
                    <p className="text-sm font-semibold">No bookings recorded yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Explore hotels, restaurants, and guided tours across Nepal to book your first adventure.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <Link href="/hotels">
                        <Button size="sm" variant="outline" className="text-xs">Browse Hotels</Button>
                      </Link>
                      <Link href="/restaurants">
                        <Button size="sm" variant="outline" className="text-xs">Browse Restaurants</Button>
                      </Link>
                      <Link href="/guides">
                        <Button size="sm" variant="outline" className="text-xs">Find Guides</Button>
                      </Link>
                    </div>
                  </Card>
                ) : (
                  <div className="grid gap-3">
                    {bookings.slice(0, 3).map((b) => (
                      <Card key={b.id} className="p-4 border shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <Package className="size-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm">{b.itemName || "Travel Reservation"}</h4>
                            <p className="text-xs text-muted-foreground capitalize">
                              {b.bookingType} • {b.checkInDate ? `Dates: ${b.checkInDate}` : "Confirmed"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <p className="font-bold text-sm">NPR {b.totalAmount?.toLocaleString()}</p>
                            <Badge className="text-[10px] capitalize bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                              {b.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY WORKSPACES */}
          {activeTab === "workspaces" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">My Partner Workspaces</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Access and manage your registered tourism businesses and service provider portals.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Hotel Workspace */}
                {hasHotel && (
                  <Card className="border shadow-xs p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                          <Hotel className="size-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{hotel?.name || "Hotel Owner Portal"}</h3>
                          <p className="text-xs text-muted-foreground">
                            {hotelStatus === "pending"
                              ? !hotel
                                ? "Registration submitted • Onboarding needed"
                                : "Application under administrator review"
                              : "Hotel Accommodation & Rooms"}
                          </p>
                        </div>
                      </div>
                      {hotelStatus === "pending" ? (
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs gap-1">
                          <Clock3 className="size-3" /> Verification Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs gap-1">
                          <CheckCircle2 className="size-3" /> Approved & Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {hotelStatus === "pending"
                        ? "Your hotel owner application is currently under verification. Once approved, you can manage inventory, room categories, pricing, and guest check-ins."
                        : "Manage room listings, gallery photos, pricing per night, availability calendar, and guest check-ins."}
                    </p>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Hotel Workspace</span>
                      {hotelStatus === "pending" ? (
                        !hotel ? (
                          <Link href="/onboarding/hotel">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                              Complete Hotel Onboarding <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/dashboard/hotels/pending">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                              View Pending Status <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        )
                      ) : (
                        <Link href="/dashboard/hotels">
                          <Button size="sm" className="text-xs gap-1.5">
                            Open Hotel Dashboard <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                )}

                {/* Restaurant Workspace */}
                {hasRestaurant && (
                  <Card className="border shadow-xs p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                          <UtensilsCrossed className="size-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{restaurant?.name || "Restaurant Panel"}</h3>
                          <p className="text-xs text-muted-foreground">
                            {restaurantStatus === "pending"
                              ? !restaurant
                                ? "Registration submitted • Onboarding needed"
                                : "Application under administrator review"
                              : "Dining & Kitchen Management"}
                          </p>
                        </div>
                      </div>
                      {restaurantStatus === "pending" ? (
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs gap-1">
                          <Clock3 className="size-3" /> Verification Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs gap-1">
                          <CheckCircle2 className="size-3" /> Approved & Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {restaurantStatus === "pending"
                        ? "Your dining partner registration is awaiting administrator review. Once verified, you can manage food menus, operating hours, and live customer orders."
                        : "Update menu items, set open/closed status, receive live orders, and handle table reservations."}
                    </p>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Restaurant Workspace</span>
                      {restaurantStatus === "pending" ? (
                        !restaurant ? (
                          <Link href="/onboarding/restaurant">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                              Complete Dining Onboarding <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/dashboard/restaurant/pending">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10">
                              View Pending Status <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        )
                      ) : (
                        <Link href="/dashboard/restaurant">
                          <Button size="sm" className="text-xs gap-1.5">
                            Open Restaurant Panel <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                )}

                {/* Tour Guide Workspace */}
                {hasGuide && (
                  <Card className="border shadow-xs p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-600">
                          <Compass className="size-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">{guide?.name || "Tour Guide Portal"}</h3>
                          <p className="text-xs text-muted-foreground">
                            {guideStatus === "pending"
                              ? !guide
                                ? "Registration submitted • Onboarding needed"
                                : "Application under administrator review"
                              : "Trekking & Guiding Services"}
                          </p>
                        </div>
                      </div>
                      {guideStatus === "pending" ? (
                        <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-xs gap-1">
                          <Clock3 className="size-3" /> Verification Pending
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-xs gap-1">
                          <CheckCircle2 className="size-3" /> Approved & Active
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {guideStatus === "pending"
                        ? "Your tour guide profile and credentials are being reviewed by administrators. Once approved, your profile will be published live in the public Tour Guides catalog."
                        : "Publish tour packages, manage your working calendar, and coordinate directly with traveler requests."}
                    </p>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Guide Workspace</span>
                      {guideStatus === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Link href="/onboarding/guide">
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10 cursor-pointer">
                              Complete Guide Onboarding <ArrowRight className="size-3.5" />
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href="/dashboard/guide">
                          <Button size="sm" className="text-xs gap-1.5 cursor-pointer">
                            Open Guide Portal <ArrowRight className="size-3.5" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                )}

                {/* Admin Workspace */}
                {hasAdmin && isAdminApproved && (
                  <Card className="border shadow-xs p-6 space-y-4 border-primary/30 bg-primary/5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-sm">
                          <ShieldCheck className="size-7" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base">System Administration</h3>
                          <p className="text-xs text-muted-foreground">Full Platform Governance</p>
                        </div>
                      </div>
                      <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 text-xs">
                        Administrator
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Approve business partner applications, oversee all users and listings, and view GMV revenue analytics.
                    </p>

                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">Admin Workspace</span>
                      <Link href="/dashboard/admin">
                        <Button size="sm" className="text-xs gap-1.5">
                          Open Admin Center <ArrowRight className="size-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                )}
              </div>

              {/* Register Additional Business CTA */}
              <Card className="border-dashed p-6 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-sm">Have another service to offer?</h3>
                  <p className="text-xs text-muted-foreground">
                    You can operate multiple businesses on TravelNepal under a single account.
                  </p>
                </div>
                <Link href="/partner/business-type">
                  <Button className="text-xs font-semibold gap-1.5">
                    <Plus className="size-3.5" /> Register Another Business
                  </Button>
                </Link>
              </Card>
            </div>
          )}

          {/* TAB 3: MY TRIPS & BOOKINGS */}
          {activeTab === "bookings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">My Trips & Bookings</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View all your accommodation stays, dining table orders, and guided treks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {["all", "hotel", "restaurant", "guide"].map((filter) => (
                    <Button
                      key={filter}
                      size="sm"
                      variant={bookingFilter === filter ? "default" : "outline"}
                      onClick={() => setBookingFilter(filter)}
                      className="text-xs capitalize h-8"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <Card className="border-dashed p-12 text-center bg-muted/15">
                  <Package className="size-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-bold text-base">No bookings found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    You haven't made any bookings under this filter yet. Explore destinations to plan your next journey!
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link href="/hotels">
                      <Button size="sm" className="text-xs">Find Stays</Button>
                    </Link>
                    <Link href="/restaurants">
                      <Button size="sm" variant="outline" className="text-xs">Find Food</Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => (
                    <Card key={b.id} className="p-5 border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base">{b.itemName || "Travel Reservation"}</h3>
                          <Badge variant="outline" className="text-[10px] capitalize">
                            {b.bookingType}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {b.checkInDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5" /> Check-in: {b.checkInDate}
                            </span>
                          )}
                          {b.guests && <span>Guests: {b.guests}</span>}
                          {b.paymentStatus && (
                            <span className="capitalize">Payment: {b.paymentStatus}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total Cost</p>
                          <p className="font-extrabold text-base">NPR {b.totalAmount?.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            className={`text-xs capitalize ${
                              b.status === "confirmed" || b.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                : b.status === "pending"
                                ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                                : "bg-red-500/15 text-red-600 border-red-500/30"
                            }`}
                          >
                            {b.status}
                          </Badge>

                          {b.paymentStatus === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handlePayKhalti(b)}
                              disabled={payingBookingId === b.id}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-8 gap-1.5 rounded-xl cursor-pointer shadow-xs"
                            >
                              {payingBookingId === b.id ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : (
                                <Wallet className="size-3.5" />
                              )}
                              Pay with Khalti
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPENSE TRACKER */}
          {activeTab === "expenses" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Travel Expense Tracker</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Log and categorize your daily travel costs (meals, hotels, transportation, activities) in NPR.
                  </p>
                </div>

                <Button
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="font-semibold text-xs gap-1.5 rounded-xl shadow-xs cursor-pointer"
                >
                  <Plus className="size-4" /> Log New Expense
                </Button>
              </div>

              {/* Expense Stats Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 border shadow-xs bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Total Spent</p>
                      <p className="text-xl font-extrabold mt-1 text-foreground">NPR {totalExpenseSum.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Receipt className="size-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {expensesList.length} logged expense record{expensesList.length === 1 ? "" : "s"}
                  </p>
                </Card>

                <Card className="p-4 border shadow-xs bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Food & Meals</p>
                      <p className="text-xl font-extrabold mt-1 text-amber-600 dark:text-amber-400">NPR {foodExpenseSum.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
                      <UtensilsCrossed className="size-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Dining, snacks & cafes
                  </p>
                </Card>

                <Card className="p-4 border shadow-xs bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Lodging & Stays</p>
                      <p className="text-xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">NPR {lodgingExpenseSum.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600">
                      <Hotel className="size-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Hotels, resorts & homestays
                  </p>
                </Card>

                <Card className="p-4 border shadow-xs bg-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Transit & Activities</p>
                      <p className="text-xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">NPR {transitExpenseSum.toLocaleString()}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <Compass className="size-5" />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Cabs, buses & permits
                  </p>
                </Card>
              </div>

              {/* Filters & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search expenses by title, city, or tag..."
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    className="pl-3 bg-card rounded-xl text-xs"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: "all", label: "All" },
                    { id: "food", label: "Food & Meals" },
                    { id: "lodging", label: "Lodging" },
                    { id: "transportation", label: "Transit" },
                    { id: "activities", label: "Activities" },
                    { id: "other", label: "Other" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setExpenseCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        expenseCategoryFilter === cat.id
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "bg-card border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Expenses List */}
              {filteredExpenses.length === 0 ? (
                <Card className="border-dashed p-12 text-center bg-muted/15">
                  <Receipt className="size-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-bold text-base">No expenses found</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    {expenseSearch || expenseCategoryFilter !== "all"
                      ? "No expenses matched your search or category filter."
                      : "You haven't logged any travel expenses yet. Start tracking your meals, stays, and transit!"}
                  </p>
                  <div className="mt-4 flex justify-center">
                    <Button size="sm" onClick={() => setIsAddExpenseOpen(true)} className="text-xs gap-1.5">
                      <Plus className="size-3.5" /> Log First Expense
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredExpenses.map((exp, idx) => {
                    const typeLower = (exp.type || "other").toLowerCase();
                    const isFood = typeLower.includes("food") || typeLower.includes("dining") || typeLower.includes("meal");
                    const isLodging = typeLower.includes("lodging") || typeLower.includes("hotel") || typeLower.includes("stay");
                    const isTransit = typeLower.includes("transport") || typeLower.includes("bus") || typeLower.includes("taxi");
                    const isActivity = typeLower.includes("activit") || typeLower.includes("guide") || typeLower.includes("trek");

                    const dateStr = exp.createdAt
                      ? new Date(exp.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Today";

                    return (
                      <Card
                        key={exp.id || idx}
                        className="p-4 border shadow-xs bg-card hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-3 rounded-2xl shrink-0 ${
                              isFood
                                ? "bg-amber-500/10 text-amber-600"
                                : isLodging
                                ? "bg-blue-500/10 text-blue-600"
                                : isTransit
                                ? "bg-emerald-500/10 text-emerald-600"
                                : isActivity
                                ? "bg-purple-500/10 text-purple-600"
                                : "bg-slate-500/10 text-slate-600"
                            }`}
                          >
                            {isFood ? (
                              <UtensilsCrossed className="size-5" />
                            ) : isLodging ? (
                              <Hotel className="size-5" />
                            ) : isTransit ? (
                              <MapPin className="size-5" />
                            ) : isActivity ? (
                              <Compass className="size-5" />
                            ) : (
                              <Receipt className="size-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-sm text-foreground">{exp.name}</h3>
                              <Badge
                                variant="outline"
                                className={`text-[10px] capitalize px-2 py-0.5 ${
                                  isFood
                                    ? "border-amber-500/30 text-amber-600 bg-amber-500/5"
                                    : isLodging
                                    ? "border-blue-500/30 text-blue-600 bg-blue-500/5"
                                    : isTransit
                                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                                    : "border-purple-500/30 text-purple-600 bg-purple-500/5"
                                }`}
                              >
                                {exp.type}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3 text-primary" /> {exp.location || "Nepal"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" /> {dateStr}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-base font-extrabold text-foreground">
                            NPR {Number(exp.amount).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-muted-foreground">Recorded in ledger</p>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* IN-PLACE ADD EXPENSE MODAL */}
              {isAddExpenseOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
                  <div className="relative w-full max-w-md bg-card border rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Receipt className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-foreground">Log Travel Expense</h3>
                          <p className="text-xs text-muted-foreground">Record your trip spending</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsAddExpenseOpen(false)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer p-1"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddExpense} className="space-y-3.5 pt-1">
                      <Field>
                        <FieldLabel>Expense Name / Description</FieldLabel>
                        <Input
                          required
                          placeholder="e.g. Thakali Thali dinner in Pokhara"
                          value={newExpense.name}
                          onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
                        />
                      </Field>

                      <div className="grid grid-cols-2 gap-3">
                        <Field>
                          <FieldLabel>Amount (NPR)</FieldLabel>
                          <Input
                            required
                            type="number"
                            min="1"
                            placeholder="1500"
                            value={newExpense.amount}
                            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                          />
                        </Field>

                        <Field>
                          <FieldLabel>City / Location</FieldLabel>
                          <Input
                            required
                            placeholder="Pokhara / Kathmandu"
                            value={newExpense.location}
                            onChange={(e) => setNewExpense({ ...newExpense, location: e.target.value })}
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel>Category</FieldLabel>
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          {[
                            { id: "food", label: "Food & Meals" },
                            { id: "lodging", label: "Lodging" },
                            { id: "transportation", label: "Transit" },
                            { id: "activities", label: "Activities" },
                            { id: "other", label: "Other" },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setNewExpense({ ...newExpense, type: cat.id })}
                              className={`py-2 px-2 text-xs rounded-xl border font-semibold text-center transition-all cursor-pointer ${
                                newExpense.type === cat.id
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                  : "border-border text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </Field>

                      <div className="flex items-center justify-end gap-2 pt-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isSubmittingExpense}
                          onClick={() => setIsAddExpenseOpen(false)}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isSubmittingExpense}
                          className="rounded-xl font-bold gap-1.5 shadow-xs"
                        >
                          {isSubmittingExpense ? (
                            <>
                              <Loader2 className="size-3.5 animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Plus className="size-3.5" /> Save Expense
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AI ITINERARY */}
          {activeTab === "itinerary" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Trip Planner & Itineraries</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Generate customized day-by-day travel schedules across Nepal powered by AI.
                </p>
              </div>

              <Card className="p-8 border bg-card text-center space-y-4">
                <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <Sparkles className="size-8" />
                </div>
                <h2 className="text-xl font-bold">Plan Your Next Nepal Adventure</h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
                  Tell our AI your budget, travel dates, preferred trekking or leisure destinations, and get a complete customized itinerary in seconds.
                </p>
                <div className="pt-2">
                  <Link href="/ai-planner">
                    <Button className="gap-2 font-semibold">
                      <Sparkles className="size-4" /> Launch AI Trip Planner →
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: PROFILE & SETTINGS */}
          {activeTab === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Profile & Account Settings</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your personal traveler credentials and profile details.
                </p>
              </div>

              <Card className="p-6 border shadow-xs space-y-5">
                <h3 className="font-bold text-base">Personal Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Full Name</FieldLabel>
                    <Input defaultValue={user.name} />
                  </Field>

                  <Field>
                    <FieldLabel>Email Address</FieldLabel>
                    <Input defaultValue={user.email} disabled className="bg-muted" />
                    <p className="text-[11px] text-muted-foreground mt-1">Verified account email</p>
                  </Field>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={() => toast.success("Profile preferences saved!")}>
                    Save Changes
                  </Button>
                </div>
              </Card>

              <Card className="p-6 border shadow-xs space-y-3">
                <h3 className="font-bold text-base">Account Security & Role Overview</h3>
                <p className="text-xs text-muted-foreground">
                  Member since: {user.createdAt} • Authentication provider: {user.provider}
                </p>

                <div className="pt-2 flex flex-wrap gap-2">
                  {roles.map((r) => {
                    const isApp = r.approvalStatus === "approved";
                    const isPend = r.approvalStatus === "pending" || !r.approvalStatus;
                    return (
                      <Badge
                        key={r.name}
                        variant="outline"
                        className={`text-xs capitalize py-1 px-3 gap-1.5 ${
                          isApp
                            ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                            : isPend
                            ? "border-amber-500/30 text-amber-600 bg-amber-500/10"
                            : "border-rose-500/30 text-rose-600 bg-rose-500/10"
                        }`}
                      >
                        {isApp ? (
                          <CheckCircle2 className="size-3" />
                        ) : isPend ? (
                          <Clock3 className="size-3" />
                        ) : null}
                        {r.name} ({r.approvalStatus || "pending"})
                      </Badge>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
