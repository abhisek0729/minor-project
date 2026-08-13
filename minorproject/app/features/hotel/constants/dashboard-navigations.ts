import {
  Building2,
  CalendarCheck,
  ChartColumn,
  ImageIcon,
  LayoutDashboard,
  Settings,
  Star,
  Wallet,
  BedDouble,
} from "lucide-react";

export const HOTEL_DASHBOARD_NAVIGATION = [
  {
    title: "Dashboard",
    href: "/dashboard/hotels",
    icon: LayoutDashboard,
  },
  {
    title: "Hotel Profile",
    href: "/dashboard/hotels/profile",
    icon: Building2,
  },
  {
    title: "Rooms",
    href: "/dashboard/hotels/rooms",
    icon: BedDouble,
  },
  {
    title: "Bookings",
    href: "/dashboard/hotels/bookings",
    icon: CalendarCheck,
  },
  {
    title: "Reviews",
    href: "/dashboard/hotels/reviews",
    icon: Star,
  },
  {
    title: "Gallery",
    href: "/dashboard/hotels/gallery",
    icon: ImageIcon,
  },
  {
    title: "Pricing",
    href: "/dashboard/hotels/pricing",
    icon: Wallet,
  },
  {
    title: "Analytics",
    href: "/dashboard/hotels/analytics",
    icon: ChartColumn,
  },
  {
    title: "Settings",
    href: "/dashboard/hotels/settings",
    icon: Settings,
  },
];