# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

No test runner is configured yet.

## Architecture

- **Framework**: Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS v4
- **Entry point**: `src/app/` — uses the App Router convention (layout.tsx, page.tsx)
- **Styling**: Tailwind CSS v4 via PostCSS (config in `postcss.config.mjs`)

Next.js 16 has breaking changes from prior versions. Always consult `node_modules/next/dist/docs/` before writing Next.js-specific code.
