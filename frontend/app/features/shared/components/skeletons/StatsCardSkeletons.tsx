import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <Skeleton className="h-4 w-24" />

        <Skeleton className="h-10 w-10 rounded-lg" />
      </CardHeader>

      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-20" />

        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
}