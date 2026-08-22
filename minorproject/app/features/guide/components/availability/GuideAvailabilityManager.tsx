"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Check, Loader2, Plus, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  toggleGuideDateAvailability,
  updateGuideProfile,
} from "../../actions/guide.action";

interface GuideAvailabilityManagerProps {
  initialIsAvailable: boolean;
  initialSchedule: any[];
}

export default function GuideAvailabilityManager({
  initialIsAvailable,
  initialSchedule,
}: GuideAvailabilityManagerProps) {
  const [isAvailable, setIsAvailable] = useState(initialIsAvailable);
  const [schedule, setSchedule] = useState(initialSchedule || []);
  const [newDate, setNewDate] = useState("");
  const [dateNote, setDateNote] = useState("");
  const [dateStatus, setDateStatus] = useState<boolean>(false); // default: Busy on date

  const [isPending, startTransition] = useTransition();

  const handleGlobalToggle = () => {
    startTransition(async () => {
      const nextStatus = !isAvailable;
      setIsAvailable(nextStatus);

      toast.success(
        nextStatus
          ? "You are now marked as AVAILABLE for guiding."
          : "You are now marked as UNAVAILABLE."
      );
    });
  };

  const handleAddDateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      toast.error("Please pick a date");
      return;
    }

    startTransition(async () => {
      const res = await toggleGuideDateAvailability(newDate, dateStatus, dateNote);
      if (res.success) {
        toast.success(res.message);
        setSchedule((prev) => [
          ...prev.filter((s) => s.date !== newDate),
          { date: newDate, isAvailable: dateStatus, note: dateNote },
        ]);
        setNewDate("");
        setDateNote("");
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Global Status Card */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Live Guiding Status</CardTitle>
          <CardDescription>
            Instantly broadcast whether you are taking new tour clients right now.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`size-3.5 rounded-full ${
                isAvailable ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="font-semibold text-sm">
              {isAvailable ? "Accepting Treks & Tours" : "Currently Unavailable"}
            </span>
          </div>

          <Button
            onClick={handleGlobalToggle}
            variant={isAvailable ? "destructive" : "default"}
            size="sm"
            disabled={isPending}
            className={
              !isAvailable
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : ""
            }
          >
            {isAvailable ? "Set to Unavailable" : "Set to Available"}
          </Button>
        </CardContent>
      </Card>

      {/* Date-Specific Calendar Blockout */}
      <Card className="border shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg">Schedule Specific Dates</CardTitle>
          <CardDescription>
            Block out specific dates when you are already booked on a trek or on vacation.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleAddDateSlot} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="sm:w-48"
              required
            />
            <Input
              placeholder="Note (e.g. Annapurna Trek with John)"
              value={dateNote}
              onChange={(e) => setDateNote(e.target.value)}
              className="flex-1"
            />
            <select
              value={dateStatus ? "available" : "busy"}
              onChange={(e) => setDateStatus(e.target.value === "available")}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="busy">Mark as Busy / Booked</option>
              <option value="available">Mark as Free</option>
            </select>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 shrink-0"
            >
              <Plus className="size-4" /> Save Date
            </Button>
          </form>

          {/* Existing date list */}
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
              Scheduled Calendar Dates ({schedule.length})
            </h4>

            {schedule.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                No specific dates marked. You will appear open according to your global status.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {schedule.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="size-3.5 text-emerald-600" />
                      <span className="font-semibold text-foreground">{slot.date}</span>
                      {slot.note && (
                        <span className="text-muted-foreground">({slot.note})</span>
                      )}
                    </div>

                    <Badge
                      variant={slot.isAvailable ? "default" : "destructive"}
                      className="text-[11px]"
                    >
                      {slot.isAvailable ? "Free" : "Busy"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
