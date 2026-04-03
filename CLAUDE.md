# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start        # Start dev server at http://localhost:3000
npm run build    # Build production bundle
npm test         # Run Jest tests in watch mode
npm test -- --watchAll=false  # Run tests once (CI mode)
```

## Architecture

This is a **Create React App** single-page application for logging and tracking sports sessions, backed by **Supabase** (PostgreSQL).

### Key files

- `src/App.js` — Monolithic main component (~2,400 lines). Contains all UI, state, and Supabase calls. Two tabs: "Log Session" and "History".
- `src/supabase.js` — Supabase client initialization (credentials hardcoded; acceptable given Supabase anon key model).

### Database

Single table `sessions` in Supabase:
- `id`, `type` (always `"sport"`), `sport_name`, `date`, `duration_mins`, `location`

### Data flow

1. Log Session form → auto-fill logic maps gym names to locations (e.g. "Schroders" → "Old Street")
2. Submit → `INSERT` into Supabase `sessions`
3. History tab → `SELECT` all sessions → displays list + bar charts (by sport and location) + KPI totals

### Styling

All styles are inline CSS-in-JS via a `globalStyles` template literal injected into a `<style>` tag in `App.js`. The design uses Cormorant Garamond (headings) and Montserrat (UI), with dark red (`#8b0000`) as the primary color.
