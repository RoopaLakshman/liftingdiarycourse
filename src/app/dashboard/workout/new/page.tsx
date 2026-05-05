import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { parseISO, isValid } from "date-fns";
import { NewWorkoutForm } from "./new-workout-form";

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { date: dateParam } = await searchParams;

  let initialDate = new Date();
  if (dateParam) {
    const parsed = parseISO(dateParam);
    if (isValid(parsed)) initialDate = parsed;
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">New workout</h1>
        <p className="text-sm text-muted-foreground mt-1">Log a workout for a chosen date.</p>
      </div>
      <NewWorkoutForm initialDate={initialDate} />
    </div>
  );
}
