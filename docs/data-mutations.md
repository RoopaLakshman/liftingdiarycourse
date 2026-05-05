---
title: Data Mutations
---

# Data Mutations

## Mutations via /data Helpers

**ALL database mutations must go through helper functions in the `src/data` directory.**

- Do NOT call Drizzle ORM directly from server actions, components, or anywhere else
- Do NOT write raw SQL anywhere in the codebase
- Every `src/data` helper must use Drizzle ORM to perform the mutation

Example structure:

```
src/data
  exercises.ts     # createExercise(), updateExercise(), deleteExercise(), etc.
  workouts.ts      # createWorkout(), updateWorkout(), deleteWorkout(), etc.
```

Example helper:

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(userId: string, name: string, date: Date) {
  return db.insert(workouts).values({ userId, name, date }).returning();
}

export async function deleteWorkout(id: string) {
  return db.delete(workouts).where(eq(workouts.id, id));
}
```

## Server Actions for All Mutations

**ALL mutations must be triggered via server actions defined in co-located `actions.ts` files.**

- Do NOT mutate data in route handlers (`app/api/`)
- Do NOT mutate data directly in client or server components
- Each feature's server actions live in an `actions.ts` file co-located with the route segment that owns them

Example structure:

```
src/app/workouts/
  page.tsx
  actions.ts    ← server actions for the workouts feature
```

Example server action:

```ts
// src/app/workouts/actions.ts
"use server";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // ...
}
```

## Typed Parameters — No FormData

**All server action parameters must be explicitly typed. `FormData` is forbidden as a parameter type.**

- Define input types as TypeScript interfaces or inferred Zod types
- Pass structured objects, not raw `FormData`, into server actions
- Client components must extract and structure form values before calling the action

```ts
// WRONG
export async function createWorkoutAction(data: FormData) { ... }

// CORRECT
export async function createWorkoutAction(input: CreateWorkoutInput) { ... }
```

## Zod Validation in Every Server Action

**Every server action must validate its arguments with Zod before doing anything else.**

- Define a Zod schema for every action's input
- Call `schema.parse(input)` (or `safeParse` with explicit error handling) at the top of the action
- Never trust input shape or content — validate even when the caller is your own client code

Example:

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

const CreateWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.coerce.date(),
});

type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const validated = CreateWorkoutSchema.parse(input);

  return createWorkout(session.user.id, validated.name, validated.date);
}
```

## No Redirects Inside Server Actions

**Never call `redirect()` inside a server action.** Redirects must be handled client-side after the action resolves.

- Do NOT import or call `redirect` from `next/navigation` inside an `actions.ts` file
- Server actions must return a result (or throw an error) — navigation is the caller's responsibility
- The client component calls the action, awaits it, then calls `router.push()` or `router.replace()` to navigate

```ts
// WRONG — redirects inside the server action
export async function createWorkoutAction(input: CreateWorkoutInput) {
  const result = await createWorkout(...);
  redirect('/dashboard'); // ❌
}

// CORRECT — action returns, client navigates
export async function createWorkoutAction(input: CreateWorkoutInput) {
  return createWorkout(...); // ✅ return the result
}
```

```ts
// client component
'use client';
import { useRouter } from 'next/navigation';

const router = useRouter();

async function handleSubmit() {
  await createWorkoutAction(input);
  router.push('/dashboard'); // ✅ navigate after action resolves
}
```

## Authorization in Server Actions

**Every mutation must verify the current user owns the resource being mutated.**

- Always retrieve the session at the top of the action
- Always confirm the resource belongs to `session.user.id` before mutating
- Never accept a `userId` from the client — derive it from the session

```ts
// WRONG — trusts client-supplied userId
export async function deleteWorkoutAction(input: { workoutId: string; userId: string }) { ... }

// CORRECT — derives userId from session
export async function deleteWorkoutAction(input: { workoutId: string }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workout = await getWorkoutById(input.workoutId);
  if (workout.userId !== session.user.id) throw new Error("Forbidden");

  return deleteWorkout(input.workoutId);
}
```
