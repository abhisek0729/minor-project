import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  // Hotel
  approved: {
    label: "Approved",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  rejected: {
    label: "Rejected",
    className:
      "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },
  suspended: {
    label: "Suspended",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  },

  // Booking
  confirmed: {
    label: "Confirmed",
    className:
      "bg-sky-100 text-sky-700 border-sky-200 hover:bg-sky-100",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  cancelled: {
    label: "Cancelled",
    className:
      "bg-red-100 text-red-700 border-red-200 hover:bg-red-100",
  },

  // Room
  available: {
    label: "Available",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  unavailable: {
    label: "Unavailable",
    className:
      "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100",
  },
  maintenance: {
    label: "Maintenance",
    className:
      "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-100",
  },

  // Payment
  paid: {
    label: "Paid",
    className:
      "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  },
  refunded: {
    label: "Refunded",
    className:
      "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-100",
  },
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const key = status.toLowerCase();

  const config = statusStyles[key] ?? {
    label: status,
    className:
      "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn(config.className)}
    >
      {config.label}
    </Badge>
  );
}