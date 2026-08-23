"use client";

import { useState, useTransition } from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { updateRestaurantHours } from "../../actions/availability.action";

interface HoursFormProps {
  initialOpeningTime: string;
  initialClosingTime: string;
}

export default function HoursForm({
  initialOpeningTime,
  initialClosingTime,
}: HoursFormProps) {
  const [openingTime, setOpeningTime] = useState(initialOpeningTime || "09:00 AM");
  const [closingTime, setClosingTime] = useState(initialClosingTime || "10:00 PM");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateRestaurantHours({
        openingTime,
        closingTime,
      });

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const setPreset = (open: string, close: string) => {
    setOpeningTime(open);
    setClosingTime(close);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Clock className="size-5 text-primary" />
          Operating Hours
        </CardTitle>
        <CardDescription>
          Set your daily opening and closing hours shown to travelers and customers.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Opening Time</FieldLabel>
              <Input
                type="text"
                placeholder="e.g. 08:00 AM or 08:00"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                required
              />
            </Field>

            <Field>
              <FieldLabel>Closing Time</FieldLabel>
              <Input
                type="text"
                placeholder="e.g. 10:00 PM or 22:00"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
              />
            </Field>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Timing Presets
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPreset("07:00 AM", "09:00 PM")}
              >
                Breakfast & Lunch (7 AM - 9 PM)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPreset("10:00 AM", "10:00 PM")}
              >
                Standard (10 AM - 10 PM)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setPreset("11:00 AM", "11:00 PM")}
              >
                Dinner & Late Night (11 AM - 11 PM)
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving Hours...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Operating Hours
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
