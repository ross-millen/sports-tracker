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
- `src/useEntriesLock.js` — Shared password-lock hook for all Entries sections (see below).
- `src/Dashboard.js` — Cross-tracker overview: live elapsed timer since 4 Apr 2026, 2-column grid of KPI cards for each tracker.
- `src/PushupTracker.js` — Pushup logging, donut by target area, flame streak KPI, best day KPI.
- `src/GuinnessLog.js` — Guinness session logging, daily aggregation bar chart, location leaderboard (ranked bar chart by pints).
- `src/OfficeDays.js` — Office attendance heatmap (green=office, purple=WFH, amber=annual leave), weekdays only.
- `src/ArsenalTracker.js` — Arsenal match logging, donut chart (W/D/L), Champions League journey, opponents chart grouped by competition, goalscorer leaderboard.
- `src/FootballLog.js` — General football session logging, donut by sport type, bubble chart by location.
- `src/TakeawayLog.js` — Takeaway order logging (see below).

### Database tables

`sessions` — used by FootballLog, PushupTracker, GuinnessLog, OfficeDays, ArsenalTracker:
- `id`, `type`, `sport_name`, `date`, `duration_mins`, `location`
- OfficeDays also uses: `wfh_approved` (boolean), `annual_leave` (boolean)

`arsenal_games` — used by ArsenalTracker:
- `id`, `date`, `opponent`, `venue` (Home/Away), `result` (W/D/L), `score`, `competition`, `goalscorers` (comma-separated text)
- Goalscorer names: `normaliseGoalscorers()` replaces any `gyokeres` variant with `Gyökeres` on insert and edit

`guinness_sessions` — used by GuinnessLog:
- `id`, `date`, `count`, `location`

`pushup_sessions` — used by PushupTracker:
- `id`, `date`, `count`, `target_area`

`office_days` — used by OfficeDays:
- `id`, `date`, `wfh_approved` (boolean), `annual_leave` (boolean)

`takeaways` — used by TakeawayLog:
- `id`, `date`, `restaurant` (text), `price` (numeric), `is_breakfast` (boolean), `delivery_app` (text)

### Entries password lock (`src/useEntriesLock.js`)

All 6 trackers password-lock their Entries (history) section using a shared hook.

- Password is defined in one place: `export const ENTRIES_PASSWORD = '1066'` — change this line to update the password everywhere.
- `useEntriesLock()` returns `{ unlocked, showPrompt, input, wrong, guard, submit, setInput, dismiss }`.
- `guard(fn)` — if already unlocked, calls `fn()` immediately; otherwise shows the password prompt and stores `fn` to call on success.
- Unlock state persists in `sessionStorage` (key `entries_unlocked`) so navigating between trackers doesn't re-lock; resets when browser is closed.
- `EntriesLockPrompt` — inline component rendered inside each tracker. Takes `lock` (hook return), `accent` (rgba border colour), `dark` (boolean for light text on dark bg).
- `LockIcon` — small SVG padlock used on the Entries button when locked.

### TakeawayLog details

- Theme: warm amber `#92400e`
- Restaurant names: McDonald's variants are normalised to `"Mc Donald's"` via `normaliseRestaurant()` on both insert and edit
- Breakfast checkbox only appears when restaurant matches `/mc\s*donald/i`
- Delivery app: segmented toggle buttons (Deliveroo, Uber Eats, Just Eat, Collection) — same style as ArsenalTracker venue/result selector
- History: KPI grid → top-3 restaurant podium (gold/silver/bronze) → delivery app donut chart → collapsible entries (password-locked)

### ArsenalTracker details

- Theme: `#EF0107` Arsenal red
- `CLJourney` component: reads CL knockout games for the current season from `arsenal_games`, renders a stage-by-stage path (R16 → QF → SF). Attended stages shown as red circles with checkmarks; unattended as hollow/dimmed. Season detection uses football-year logic: `month < 7 ? year - 1 : year` (so May 2026 → 2025/26).
- `GoalscorerLeaderboard` component: parses comma-separated `goalscorers` field, counts per player, renders a ranked bar chart. Placed just above the Entries button.
- `OpponentResultBars`: groups opponents by competition using inline `─── Competition ───` dividers. Competition order: Premier League → Champions League → FA Cup → Carabao Cup. Bars are normalised within each competition group. No colour key shown.
- Donut chart has no centre text.

### GuinnessLog details

- `LocationLeaderboard` component: ranks locations by total pints with a proportional bar, visits count, and avg pints/visit. Replaced the previous bubble chart.
- Line chart is angular (point-to-point), with dots on each data point and value labels.

### Styling conventions

- Global styles in `App.js` `globalStyles` template literal (shared classes: `nav-btn`, `save-btn`, `input-field`, `session-card`, `edit-btn`, etc.)
- Each tracker has its own scoped `<style>` block with prefixed class names (e.g. `ta-`, `gu-`, `ar-`, `db-`)
- Design system: Cormorant Garamond (headings), Montserrat (UI labels/buttons), Inter (KPI numbers), dark red `#8b0000` as app-wide primary
- Tracker accent colours: pushups `#1a3a6b` (blue), guinness `#c9a452` (gold), office `#1a5c38` (green), arsenal `#EF0107` (red), football `#8b0000`, takeaway `#92400e` (amber)
- Donut charts: `R=80, cx=110, cy=95, stroke=28`, viewBox `0 0 220 190`, black border lines between slices and inner/outer circles, no centre text
- Segmented toggle buttons: `.ar-toggle-btn` pattern — flex row, shared border, first/last radius, `.selected` fills with accent colour
- All tracker headers: back button (`← home`) → centred Cormorant Garamond title → decorative gradient line (no subtitle)
- All trackers: collapsible password-locked "Entries" section, `slideInRight` overlay navigation
- KPI numbers use Inter font; flame streak number in PushupTracker matches this (not Cormorant Garamond)

### Dashboard

- `max-width: 480px`, 2-column tracker card grid
- Live elapsed timer (days / hours / minutes / seconds) since 4 April 2026, updates every second
- Each tracker card has a coloured top bar, label, and summary stat (football hours, Arsenal W/D/L + proportion bar, guinness pints, pushup reps, office days in, takeaway spend)
- Header matches other trackers: back button → centred title → gradient line

### CI / deployment

- Hosted on Vercel. `CI=true npm run build` treats ESLint warnings as errors — always run this locally before pushing.
- Git remote: `https://github.com/ross-millen/sports-tracker.git`
