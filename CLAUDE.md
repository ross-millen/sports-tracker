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

This is a **Create React App** single-page application for logging and tracking sports/lifestyle sessions, backed by **Supabase** (PostgreSQL).

### Key files

- `src/App.js` — Root component. Renders home page nav and slides trackers in/out from the right via `slideInRight`/`slideOutRight` animations.
- `src/supabase.js` — Supabase client initialization (credentials hardcoded; acceptable given Supabase anon key model).
- `src/PushupTracker.js` — Pushup logging, donut by target area, best day KPI.
- `src/GuinnessLog.js` — Guinness session logging, daily aggregation bar chart, location bubble chart.
- `src/OfficeDays.js` — Office attendance heatmap (green=office, purple=WFH, amber=annual leave), weekdays only.
- `src/ArsenalTracker.js` — Arsenal match logging, donut chart (W/D/L), segmented toggle buttons for venue/result.
- `src/FootballLog.js` — General football session logging, donut by sport type, bubble chart by location.
- `src/TakeawayLog.js` — Takeaway order logging (see below).

### Database tables

`sessions` — used by FootballLog, PushupTracker, GuinnessLog, OfficeDays, ArsenalTracker:
- `id`, `type`, `sport_name`, `date`, `duration_mins`, `location`
- OfficeDays also uses: `wfh_approved` (boolean), `annual_leave` (boolean)

`takeaways` — used by TakeawayLog:
- `id`, `date`, `restaurant` (text), `price` (numeric), `is_breakfast` (boolean), `delivery_app` (text)

### TakeawayLog details

- Theme: warm amber `#92400e`
- Restaurant names: McDonald's variants are normalised to `"Mc Donald's"` via `normaliseRestaurant()` on both insert and edit
- Breakfast checkbox only appears when restaurant matches `/mc\s*donald/i`
- Delivery app: segmented toggle buttons (Deliveroo, Uber Eats, Just Eat, Collection) — same style as ArsenalTracker venue/result selector
- History: KPI grid → top-3 restaurant podium (gold/silver/bronze) → delivery app donut chart → collapsible entries

### Styling conventions

- Global styles in `App.js` `globalStyles` template literal (shared classes: `nav-btn`, `save-btn`, `input-field`, `session-card`, `edit-btn`, etc.)
- Each tracker has its own scoped `<style>` block with prefixed class names (e.g. `ta-`, `gu-`, `ar-`)
- Design system: Cormorant Garamond (headings), Montserrat (UI), dark red `#8b0000` as app-wide primary
- Tracker accent colours: pushups `#1a3a6b` (blue), guinness gold, office `#1a5c38` (green), arsenal `#EF0107` (red), football `#8b0000`, takeaway `#92400e` (amber)
- Donut charts: `R=80, cx=110, cy=95, stroke=28`, viewBox `0 0 220 190`, black border lines between slices and inner/outer circles
- Segmented toggle buttons: `.ar-toggle-btn` pattern — flex row, shared border, first/last radius, `.selected` fills with accent colour
- All trackers: collapsible "Entries" section, back button labelled "← home", `slideInRight` overlay navigation

### CI / deployment

- Hosted on Vercel. `CI=true npm run build` treats ESLint warnings as errors — always run this locally before pushing.
- Git remote: `https://github.com/ross-millen/sports-tracker.git`
