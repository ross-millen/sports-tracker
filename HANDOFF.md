# Handoff — Ross' Tracker

## What This Is

A personal lifestyle/sports tracking app built with **Create React App** + **Supabase** (PostgreSQL). Single-page app, no backend beyond Supabase. Deployed via GitHub (branch: `master`).

---

## Trackers — Current State

### Home Page
Four buttons in this order: **Arsenal → Guinness → Pushups → Office**

---

### 1. Arsenal Tracker (`src/ArsenalTracker.js`)
Tracks Arsenal games seen live since season ticket access.

**Log fields:** Date, Opponent, Competition (with sub-stage selectors for Champions League and Carabao Cup), Venue (Home/Away/Neutral), Result (W/D/L), Score.

**Competition storage:** Combined string e.g. `"Champions League · Semi Final"` or `"Carabao Cup · Round 3"` — parsed back correctly in edit mode.

**History page:**
- 4 KPI cards: Games Seen, Win Rate, Unbeaten Run, Arsenal Goals Seen (Arsenal's goals only, left side of score string)
- Results donut (W/D/L with total in centre)
- **Opponent Result Bars** — the most recent visualization. Horizontal rows per opponent sorted by most-seen. Bar width encodes total games (frequency); segments encode W/D/L proportion. Hover flips right label from "N games" to "XW YD ZL". Pure CSS flexbox, no charting library.
- Timeline of all games with inline edit/delete

**Supabase table:** `arsenal_games` (id, date, opponent, competition, venue, result, score)

---

### 2. Guinness Log (`src/GuinnessLog.js`)
Tracks Guinness sessions.

**Log fields:** Date, Count (pints), Location.

**History:**
- KPIs: Total Pints, Best Day (sum of pints across all sessions on the same date, not per-session), Total Sessions
- Location is editable on existing records

**Supabase table:** `guinness_sessions`

---

### 3. Pushup Tracker (`src/PushupTracker.js`)
Tracks pushup sessions by target area.

**History:**
- KPIs: Total Reps, Total Days (unique date count), Day Streak (with animated SVG flame — three layered paths with separate flicker animations, number inside)
- Donut + bar chart, colours synced via shared `colorMap` keyed by target area label

**Supabase table:** `pushup_sessions`

---

### 4. Office Days (`src/OfficeDays.js`)
Tracks days worked in the office (date only, no other fields).

**History:**
- Single KPI: Total Days
- **Monthly Overview** (heatmap slideshow) — starts from April, one month at a time, ← → navigation with slide animation. Week rows colour-coded green (≥3 office days)/amber (1–2)/red (0). No legend/key shown.
- Timeline of entries

**Supabase table:** `office_days`

---

### 5. Sports Tracker (original, `src/App.js`)
Logs general sport sessions. Tab 1 = log form, Tab 2 = history with bar charts by sport and location.

**Supabase table:** `sessions`

---

## Architecture Notes

- **All styling** is inline CSS-in-JS via template literals injected into `<style>` tags — no CSS files, no CSS modules.
- **Fonts:** Cormorant Garamond (headings), Montserrat (UI text).
- **Primary colour:** `#8b0000` (dark red) for Sports/main app; each tracker has its own theme colour.
- **ESLint is strict** — unused variables cause build failure (CI treats warnings as errors). Always run `npm run build` before pushing.
- **No charting library currently in use.** recharts was installed during this session but then removed — the opponent chart is now pure CSS/SVG.
- **Supabase anon key** is hardcoded in `src/supabase.js` — acceptable given Supabase's anon key model (row-level security on Supabase side).

---

## Key Commands

```bash
npm start                         # Dev server at http://localhost:3000
npm run build                     # Production build — run before every push
npm test -- --watchAll=false      # Run tests once
```

---

## What Was Done This Session

1. **Pushup tracker:** Total Days KPI (unique dates), animated flame on Day Streak, synced donut/bar chart colours.
2. **Guinness log:** Best Day KPI (sum per date), location field added to log and edit forms.
3. **Office Days tracker:** Created from scratch — date-only logging, monthly heatmap slideshow (April onwards), single Total Days KPI on history.
4. **Arsenal tracker:** Created from scratch — full game logging with competition sub-stages, result donut, KPIs, opponent visualisation (went through bubble chart → lollipop → stacked bar → final proportional result bars), game timeline with edit/delete.
5. **Home page:** Renamed "Office Days" button to "Office"; reordered buttons to Arsenal, Guinness, Pushups, Office.
6. **Office Days history:** Renamed "Weekly Overview" to "Monthly Overview".
7. **Cleanup:** Removed recharts after it was no longer needed.

---

## Potential Next Steps (nothing formally agreed)

- The opponent result bars are functional but only visible on the history page once games are logged — worth testing with real data.
- No authentication — the app is public to anyone with the URL.
- Could add a competition breakdown chart to Arsenal history (was removed earlier as the user didn't want it, but may want it later).
- Office Days heatmap could highlight the current week more prominently.
