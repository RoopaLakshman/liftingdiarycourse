# UI Coding Standards

## Component Library

**Only shadcn/ui components may be used for UI in this project.**

- Do NOT create custom components. If shadcn/ui provides a component that fits the need, use it.
- Do NOT reach for raw HTML elements or third-party component libraries for UI primitives.
- If a required component does not exist in shadcn/ui, open a discussion before building anything custom.
- All shadcn/ui components live in `src/components/ui/` and are added via the shadcn CLI (`npx shadcn@latest add <component>`).

## Date Formatting

All date formatting must use [date-fns](https://date-fns.org/). No other date library or manual string manipulation is permitted.

Dates must be displayed in the following format:

```
1st Sep 2020
2nd Jun 2024
4th Jan 2026
```

Use `do MMM yyyy` as the format string:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // "1st Sep 2020"
```
