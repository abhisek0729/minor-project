import {
  BedDouble,
  CheckCircle2,
  Wrench,
  CircleOff,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface RoomsStatsProps {
  stats: {
    total: number;
    available: number;
    maintenance: number;
    inactive: number;
  };
}

export default function RoomsStats({
  stats,
}: RoomsStatsProps) {
  const cards = [
    {
      title: "Total Rooms",
      value: stats.total,
      icon: BedDouble,
      iconClass: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Available",
      value: stats.available,
      icon: CheckCircle2,
      iconClass: "text-green-600",
      iconBg: "bg-green-500/10",
    },
    {
      title: "Maintenance",
      value: stats.maintenance,
      icon: Wrench,
      iconClass: "text-amber-600",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Inactive",
      value: stats.inactive,
      icon: CircleOff,
      iconClass: "text-red-600",
      iconBg: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card
            key={card.title}
            className="transition-shadow hover:shadow-md"
          >
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {card.title}
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight">
                  {card.value}
                </h2>
              </div>

              <div
                className={`flex size-12 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon
                  className={`size-6 ${card.iconClass}`}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}