import {
  BedDouble,
  Building2,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";

export const HOTEL_DASHBOARD_NAVIGATION = [
  {
    title: "Dashboard",
    href: "/dashboard/hotels",
    icon: LayoutDashboard,
  },
  {
    title: "Rooms & Inventory",
    href: "/dashboard/hotels/rooms",
    icon: BedDouble,
  },
  {
    title: "Hotel Facilities",
    href: "/dashboard/hotels/facilities",
    icon: Sparkles,
  },
  {
    title: "Hotel Settings",
    href: "/dashboard/hotels/settings",
    icon: Settings,
  },
];