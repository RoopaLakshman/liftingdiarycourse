"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Placeholder workout type — replace with real type once server-side code exists
type Workout = {
  id: number;
  name: string | null;
  notes: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
};

// Placeholder data — replace with real data fetching
const PLACEHOLDER_WORKOUTS: Workout[] = [
  {
    id: 1,
    name: "Morning Push Day",
    notes: "Felt strong today",
    startedAt: new Date(),
    completedAt: new Date(),
  },
  {
    id: 2,
    name: "Leg Day",
    notes: null,
    startedAt: new Date(),
    completedAt: null,
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Placeholder: replace with real filtered workouts for selectedDate
  const workouts: Workout[] = PLACEHOLDER_WORKOUTS;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "do MMM yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Workouts on {format(selectedDate, "do MMM yyyy")}
        </h2>

        {workouts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No workouts logged for this date.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {workouts.map((workout) => (
              <Card key={workout.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {workout.name ?? "Unnamed Workout"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {workout.notes && <p>{workout.notes}</p>}
                  <div className="flex gap-4 text-xs">
                    {workout.startedAt && (
                      <span suppressHydrationWarning>Started: {format(workout.startedAt, "h:mm a")}</span>
                    )}
                    {workout.completedAt && (
                      <span suppressHydrationWarning>Completed: {format(workout.completedAt, "h:mm a")}</span>
                    )}
                    {workout.startedAt && !workout.completedAt && (
                      <span className="text-yellow-600">In progress</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
