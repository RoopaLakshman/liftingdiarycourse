import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardDatePicker } from "@/components/dashboard/date-picker";
import { getWorkoutsForUserOnDate } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date: dateParam } = await searchParams;

  let selectedDate = new Date();
  if (dateParam) {
    const parsed = parseISO(dateParam);
    if (isValid(parsed)) selectedDate = parsed;
  }

  const workouts = await getWorkoutsForUserOnDate(userId, selectedDate);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <DashboardDatePicker selectedDate={selectedDate} />
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
                      <span>Started: {format(workout.startedAt, "h:mm a")}</span>
                    )}
                    {workout.completedAt && (
                      <span>Completed: {format(workout.completedAt, "h:mm a")}</span>
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
