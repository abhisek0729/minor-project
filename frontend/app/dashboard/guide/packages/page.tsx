import { getServerSession } from "next-auth";
import { Clock, MapPin, Package, Plus, Trash2, Users } from "lucide-react";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import {
  getGuideByUserId,
  getGuidePackages,
} from "@/app/features/guide/services/guide.service";
import PackageFormModal from "@/app/features/guide/components/packages/PackageFormModal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function GuidePackagesPage() {
  const session = await getServerSession(authOptions);
  const guide = await getGuideByUserId(Number(session?.user?.id));

  if (!guide) {
    return <div>Guide not found</div>;
  }

  const packages = await getGuidePackages(guide.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tour & Trek Packages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, update, and manage your guided tours and itineraries.
          </p>
        </div>

        <PackageFormModal />
      </div>

      {packages.length === 0 ? (
        <Card className="border-dashed bg-muted/15 p-12 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mx-auto mb-4">
            <Package className="size-8" />
          </div>
          <CardTitle className="text-xl">No tour packages created yet</CardTitle>
          <CardDescription className="max-w-md mx-auto mt-2">
            Create your first guided itinerary with daily pricing and destination details so tourists can book.
          </CardDescription>
          <div className="mt-6">
            <PackageFormModal />
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="overflow-hidden border shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <MapPin className="size-3 mr-1" /> {pkg.destination}
                    </Badge>
                    <span className="font-bold text-base text-foreground">
                      NPR {pkg.price.toLocaleString()}
                    </span>
                  </div>
                  <CardTitle className="text-lg leading-tight line-clamp-1">
                    {pkg.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs mt-1">
                    {pkg.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-2.5 text-xs text-muted-foreground pt-0">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-emerald-600" />
                    <span>Duration: <strong>{pkg.durationDays} Day{pkg.durationDays > 1 ? "s" : ""}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="size-3.5 text-emerald-600" />
                    <span>Max Group: <strong>{pkg.maxGroupSize} People</strong></span>
                  </div>
                  {pkg.included && (
                    <div className="pt-2 border-t text-[11px] line-clamp-1">
                      <span className="font-semibold text-foreground">Includes:</span> {pkg.included}
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t mt-4 flex items-center justify-end gap-2">
                <PackageFormModal
                  initialPackage={pkg}
                  triggerButton={
                    <Button variant="outline" size="sm" className="text-xs">
                      Edit Package
                    </Button>
                  }
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
