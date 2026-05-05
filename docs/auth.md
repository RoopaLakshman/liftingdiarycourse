# Authentication

## Provider

This app uses **Clerk** (`@clerk/nextjs`) for all authentication and user management. Do NOT implement custom auth, session handling, or JWT logic. Do NOT use NextAuth, Auth.js, or any other auth library.

## Setup

`<ClerkProvider>` wraps the entire app in `src/app/layout.tsx`. It must remain there — never move it or add a second instance.

Environment variables required:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Middleware

Route protection is handled via `clerkMiddleware` from `@clerk/nextjs/server` in `middleware.ts` at the project root.

- Use `createRouteMatcher` to define public routes
- All routes are protected by default; explicitly allow public routes
- Do NOT use the deprecated `authMiddleware`

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

## Reading Auth State

### Server Components (preferred)

Use `auth()` for session data or `currentUser()` for the full user object. Both are imported from `@clerk/nextjs/server`.

```ts
import { auth } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  // ...
}
```

```ts
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();
```

- `auth()` is cheaper — prefer it when you only need the `userId`
- `currentUser()` makes a network request — only use it when you need user profile data

### Client Components

Use the `useAuth()` or `useUser()` hooks, imported from `@clerk/nextjs`.

```ts
'use client';
import { useAuth } from '@clerk/nextjs';

const { userId, isLoaded, isSignedIn } = useAuth();
```

Do NOT call `auth()` or `currentUser()` inside client components — they are server-only.

## UI Components

Use Clerk's prebuilt components for all auth UI. Do NOT build custom sign-in/sign-up forms.

| Component | Purpose |
|---|---|
| `<SignInButton>` | Trigger sign-in (use `mode="modal"`) |
| `<SignUpButton>` | Trigger sign-up (use `mode="modal"`) |
| `<UserButton>` | User avatar + account menu |
| `<SignIn>` | Full sign-in page component |
| `<SignUp>` | Full sign-up page component |
| `<Show when="signed-in">` | Conditionally render for auth state |
| `<Show when="signed-out">` | Conditionally render for auth state |

All are imported from `@clerk/nextjs`.

## Protecting Data Access

Always verify `userId` before returning user-specific data in `/data` helpers:

```ts
import { auth } from '@clerk/nextjs/server';

export async function getUserWorkouts() {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  // query DB scoped to userId
}
```

Never trust a `userId` passed in from the client. Always read it from `auth()` on the server.

## What Not To Do

- Do NOT use `getAuth()` — it is legacy Pages Router API
- Do NOT use `withClerkMiddleware` — deprecated
- Do NOT store session tokens manually or in cookies
- Do NOT conditionally render auth-gated content based on client-side state alone — always enforce on the server
- Do NOT pass `userId` as a prop from client to server; read it server-side via `auth()`
