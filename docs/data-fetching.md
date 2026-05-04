---
title: Data Fetching
---

# Data Fetching

## Server Components Only

**ALL data fetching must be done via React Server Components.** This is non-negotiable.

- Do NOT fetch data in route handlers (`app/api/`)
- Do NOT fetch data in client components (`"use client"`)
- Do NOT use `useEffect` + `fetch` patterns
- Do NOT use SWR, React Query, or similar client-side data fetching libraries

Every component that needs data must be a Server Component (no `"use client"` directive), and data must be fetched at render time by calling helper functions directly.

## Database Access via /data Helpers

**ALL database queries must go through helper functions in the `/data` directory.**

- Do NOT write raw SQL anywhere in the codebase
- Do NOT use Drizzle's query builder outside of `/data` helper functions
- Every `/data` helper must use Drizzle ORM to query the database

Example structure:

```
/data
  exercises.ts     # getExercises(), getExerciseById(), etc.
  workouts.ts      # getWorkouts(), getWorkoutById(), etc.
```

Example helper:

```ts
// data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsForUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

## Data Authorization — Users Can Only Access Their Own Data

**Every data helper that returns user-owned data MUST scope queries to the authenticated user's ID.**

- Always retrieve the current user's ID from the session before querying
- Always filter queries with `where(eq(table.userId, currentUserId))`
- Never return data for a user ID that was supplied by the client/URL without verifying it matches the session user
- A logged-in user must NEVER be able to access another user's data — not through a URL parameter, not through a form field, not through any other mechanism

Example of correct authorization in a Server Component:

```ts
// app/workouts/page.tsx
import { auth } from "@/auth";
import { getWorkoutsForUser } from "@/data/workouts";

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const workouts = await getWorkoutsForUser(session.user.id);
  // ...
}
```

Never pass user IDs from `params` or `searchParams` directly into data helpers without first confirming they match `session.user.id`.
