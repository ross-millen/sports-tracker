# Codebase Tour — Ross' Tracker

A plain-English guide to every meaningful part of this codebase.

---

## 1. Big Picture

**What this means in plain English:** The app is a personal dashboard with five separate trackers. When you open it you see a home page with four buttons. Clicking one slides you into that tracker; clicking "← Ross' Tracker" brings you back. All your data lives in a cloud database called Supabase, not on your device.

The app is built with **React** (a JavaScript framework [library] made by Meta that lets you build interactive UIs by writing components — self-contained pieces of a page). It was bootstrapped [set up from a template] using **Create React App**, which means the build tooling [the programs that turn your source code into something a browser can run] is already configured and you almost never have to touch it.

The app has **no server** of its own. When you click "Record", the browser talks directly to Supabase over the internet, saves the row, and that's it. There is no backend code [code running on your own server] to maintain.

Because there is no login system, anyone with the URL can see and edit everything. This is a known, accepted trade-off.

---

## 2. Folder and File Structure

```
sports-tracker/
├── public/               Browser entry point — index.html lives here (rarely touched)
├── src/
│   ├── index.js          Boots the React app — 17 lines, effectively never changes
│   ├── index.css         ~10 lines of reset CSS; almost all styles are inline in components
│   ├── supabase.js       Creates and exports the Supabase client (database connection)
│   ├── App.js            Home page + Sports tracker (~700 lines)
│   ├── ArsenalTracker.js Arsenal tracker (~550 lines)
│   ├── GuinnessLog.js    Guinness tracker (~460 lines)
│   ├── PushupTracker.js  Pushup tracker (~620 lines)
│   └── OfficeDays.js     Office Days tracker (~470 lines)
├── package.json          Project config — lists dependencies and npm scripts
├── CLAUDE.md             Instructions for Claude Code (the AI that helps write this)
└── HANDOFF.md            Human-readable session summary
```

### Why is almost everything in `src/`?

Create React App expects your source code in `src/`. The `public/` folder is for static files (images, the base HTML) that get copied straight to the output without being processed.

### Why are the trackers separate files rather than one big file?

`App.js` was the original file and was already long. Each new tracker was added as its own file to keep things manageable. Each file is self-contained: it has its own styles, its own sub-components, and its own database calls.

---

## 3. Key Components and Functions

### `src/supabase.js` (lines 1–5)

**What it does:** Creates a single Supabase client [an object that knows how to talk to your Supabase database] and exports it so every other file can `import { supabase }` and use it.

**Why this way:** Supabase recommends one shared client per app. Having a dedicated file means you only ever specify the URL and key in one place.

**Gotcha:** The `supabaseKey` is an "anon key" [a public key that is safe to expose, unlike a secret key]. Supabase uses Row Level Security [database rules that control who can read/write which rows] to protect data. This key alone cannot do anything the database rules don't allow.

---

### `src/index.js` (lines 1–17)

**What it does:** Finds the `<div id="root">` element in `public/index.html` and tells React to render the `App` component inside it. This is the app's entry point [the first file that runs].

**Why this way:** Boilerplate [standard setup code] from Create React App. You will almost never edit this file.

---

### `src/App.js` — Routing and Home Page (lines 425–596)

**What it means in plain English:** This is the "home screen" logic. It decides which tracker to show based on a variable called `tracker`.

**What it does:**

The `App` function (line 425) holds a piece of state [a variable whose value React tracks and re-renders the page when it changes] called `tracker`, which starts as `'sports'`. The home page (lines 556–590) renders four buttons: Arsenal, Guinness, Pushups, Office. Clicking one calls `setTracker('arsenal')` etc., which updates the state and causes React to re-render [redraw] the page.

Lines 593–596 decide what to show:
```js
{tracker === 'pushups' && <PushupTracker onBack={() => setTracker('sports')} />}
{tracker === 'guinness' && <GuinnessLog onBack={() => setTracker('sports')} />}
{tracker === 'office' && <OfficeDays onBack={() => setTracker('sports')} />}
{tracker === 'arsenal' && <ArsenalTracker onBack={() => setTracker('sports')} />}
{tracker === 'sports' && (...Sports tracker JSX...)}
```

The `&&` operator here is a React pattern [convention] meaning "only render this if the left side is true". Each sub-tracker receives an `onBack` prop [a function passed as an argument to a component] that resets `tracker` back to `'sports'`.

**Why this way:** This is called "conditional rendering". There is no URL-based routing [changing the browser address bar to navigate]. Everything happens on one page with one URL. It's simpler for a personal app with no need for shareable deep links [URLs that go directly to a specific tracker].

**Gotcha:** The home page buttons and the Sports tracker are both inside `App()`. If you want to add a new tracker, you need to: (1) add a button to the array at line 568, (2) add an `import` at the top of the file, and (3) add a conditional render around line 593.

---

### `src/App.js` — Sports Tracker

**What it means in plain English:** The original tracker. Logs sport sessions with sport name, date, duration, and location.

**Key functions:**

- `handleSportChange` (line 453): Called every time you type in the "Sport / Activity" field. Checks your input against `LOCATION_RULES` (line 154) — currently maps `"schroders"` → `"Old Street"` and `"caine"` → `"Whitechapel"`. If there's a match it auto-fills the location field and sets `locationAutoFilled` to `true`, which disables the location input.

- `handleSubmit` (line 467): Validates the form and calls `supabase.from('sessions').insert(...)`. On success, shows a "✦ Session Recorded" confirmation for 3 seconds using `setTimeout`.

- `fetchSessions` (line 441): Calls `supabase.from('sessions').select('*').order('date', { ascending: false })` to load all sessions, newest first. Only runs when `page === 'history'` (the `useEffect` [a hook that runs code in response to something changing] at line 449).

- `DonutChart` (line 159): A hand-drawn SVG [Scalable Vector Graphics — an image format drawn with code, not pixels] donut chart. Takes an object of activity data and draws arc slices using the SVG `path` element with arc commands (`A`). Shows total hours in the centre. Has hover tooltips.

- `BubbleChart` (line 260): Animated bouncing circles, one per location. Uses `requestAnimationFrame` [a browser function that calls your code ~60 times per second to make smooth animation] to move circles, detect wall collisions, and detect circle-circle collisions (including elastic velocity exchange [bouncing off each other realistically]).

---

### `src/ArsenalTracker.js`

**What it means in plain English:** Tracks every Arsenal game you've seen live, with full match details and visualisations.

**Constants at the top (lines 18–26):**
- `COMPETITIONS`, `CL_STAGES`, `CARABAO_STAGES`, `VENUES`, `RESULTS` — fixed lists used to populate dropdowns and toggle buttons.
- `resultColor`, `resultLabel` — maps `'W'` / `'D'` / `'L'` to colours and readable labels.

**Competition storage gotcha (line 350):** Champions League and Carabao Cup games are stored in the database as a single combined string like `"Champions League · Semi Final"`. When you open the edit form, `startEdit` (line 359) parses this back by checking `startsWith('Champions League ·')` and splitting on ` · `. If you ever change the separator character or the competition name strings, the existing records in the database won't parse correctly.

**`ResultDonut` component (line 148):** Draws an SVG donut of Win/Draw/Loss. The total number of games is shown in the centre. White dividing lines are drawn as `<line>` elements at each slice boundary (line 186). Two `<circle>` elements draw the inner and outer edges of the donut ring (lines 193–194).

**`OpponentResultBars` component (line 221):**
- Groups all games by opponent name into a `byOpponent` object.
- Sorts opponents by most games seen (most frequent at top).
- For each opponent, draws a row: opponent name on the left, a proportional bar in the middle (bar width = frequency, bar colour segments = W/D/L proportion), and a stat label on the right.
- On hover, the right label flips from "N games" to "XW YD ZL" using the `hovered` state variable (line 222).
- Entirely CSS flexbox [a CSS layout system] — no SVG, no charting library.

**KPI calculations (lines 395–408):**
- `winPct`: wins ÷ total games × 100, rounded.
- `unbeatenRun` (line 399): Iterates through games (newest first) and counts consecutive non-losses. Breaks as soon as it hits an `'L'`.
- `goalsSeen` (line 405): Parses the score string (format `"2-1"`), takes the left side as Arsenal's goals.

---

### `src/GuinnessLog.js`

**What it means in plain English:** Logs Guinness sessions by date, pint count, and pub name.

**`GuinnessLineChart` component (line 16):** An SVG line chart of pints over time. Sorts sessions by date, maps each to an (x, y) coordinate, then draws a `<path>` through them. Also draws a filled gradient area below the line (the `areaPath` variable, line 33). Dots are `<circle>` elements with `onMouseMove` handlers that show a tooltip.

**`bestDay` calculation (lines 247–254):** Groups sessions by date and sums the pints on each date (because you might log multiple sessions on the same day). `pintsByDate` is a plain object used as a dictionary [key-value store]. `Object.entries(...).reduce(...)` finds the date with the highest total.

**`formatUKDate` (line 239):** Dates are stored in the database as `YYYY-MM-DD` (ISO format). This function splits on `-` and reassembles as `DD/MM/YYYY`. Every tracker has its own copy of this function — they're identical.

---

### `src/PushupTracker.js`

**What it means in plain English:** Logs pushup sessions by date, target area (e.g. "chest"), and rep count.

**`colorMap` (line 436):** A dictionary that maps each target area label to a colour from `BAR_COLORS`. Crucially, the same `colorMap` is passed to both `PushupDonutChart` and `PushupBarChart`, so the colour for "Chest" is the same in both charts. This is why the colours stay in sync.

**`PushupDonutChart` (line 152):** Same SVG arc approach as the Sports tracker's donut, but takes the `colorMap` as a prop instead of calculating colours internally.

**`PushupBarChart` (line 243):** A vertical bar chart. Each bar's height is proportional to reps. Uses the `colorMap` for bar colours.

**`FlameStreak` component (line 294):** Three layered SVG flame shapes (outer dark red-orange, middle orange, inner yellow), each in its own absolutely-positioned [pinned to a specific position regardless of page flow] `div` that has a different CSS animation (`flameOuter`, `flameMiddle`, `flameInner` — defined in `pushupStyles` at lines 122–135). The animations use `scaleX`/`scaleY`/`rotate` transforms to make each layer flicker independently. The number sits on top with `zIndex: 10` to ensure it renders above the animated flame layers.

**Day Streak calculation (lines 415–425):** Gets the list of unique dates the user has done pushups, sorted newest first. Only starts counting if today or yesterday is in the list (so a streak from 3 days ago doesn't still show). Walks backwards through dates one day at a time, breaking as soon as there's a gap.

**`uniqueDates` (line 408):** Uses `new Set(...)` [a JavaScript data structure that automatically removes duplicates] to count distinct dates, even if you logged multiple sessions on the same day.

---

### `src/OfficeDays.js`

**What it means in plain English:** Logs days you worked in the office (just a date — no other fields).

**`OfficeHeatmap` component (line 117):** A calendar grid showing one month at a time.

- `officeDates` (line 118): A JavaScript `Set` of all date strings from the database. Using a Set means checking if a specific date is an office day is instant (`officeDates.has(dateStr)`), rather than looping through an array.
- `START_MONTH = 3` (line 121): `3` means April. JavaScript months are 0-indexed [start counting from 0, so January = 0, April = 3].
- `getWeeks` (line 141): Calculates which days to show in a grid, always starting on Monday. The `offset` calculation `(firstDay.getDay() || 7) - 1` converts Sunday-based day numbering (Sunday = 0) to Monday-based (Monday = 0). It generates complete 7-day rows including days from the previous/next month (shown as empty cells).
- Week colour indicator (line 195): Each week row has a thin coloured bar on its left side — green if ≥3 office days that week, amber if 1–2, red if 0. Only weekdays (Mon–Fri) count.
- Slide animation (line 157): When you click ← or →, `setDir` records the direction and `setAnimKey` increments a counter. The `key={animKey}` prop [an attribute] on the calendar `div` (line 179) forces React to recreate the element from scratch, triggering the CSS slide-in animation fresh each time.

---

### Styling approach (all files)

**What it means in plain English:** All CSS is written as JavaScript strings and injected into a `<style>` tag. There are no `.css` files (except the near-empty `index.css`).

Each component file has a template literal [a multi-line string in backticks] called `guinnessStyles`, `arsenalStyles`, `pushupStyles`, etc. (e.g. `pushupStyles` at `PushupTracker.js:16`). At the top of each component's `return (...)` there is a `<style>{pushupStyles}</style>` line that injects these styles into the page.

Class names are prefixed per tracker (`gu-`, `ar-`, `pu-`, `of-`) to avoid clashes [two components accidentally sharing a class name and overriding each other's styles].

Each file also defines a palette object at the top (`G`, `A`, `P`, `O`) — a plain JavaScript object whose properties are colour hex codes. This means colours are defined once and reused, rather than the same hex code appearing 40 times. Example: `PushupTracker.js:4` defines `P.blue = '#1e3a8a'`.

---

### The KPI shimmer effect

**What it means in plain English:** The large numbers in the history stats cards animate with a slow left-to-right colour sweep.

Implemented as a CSS class in each tracker's style block (e.g. `pu-kpi-shimmer` at `PushupTracker.js:110`). It uses `-webkit-background-clip: text` [a CSS trick that clips a gradient background to the shape of the text, making the gradient visible through the letters] and `-webkit-text-fill-color: transparent` [makes the actual text colour invisible so only the gradient shows through]. The `background-position` then animates left-to-right.

**Gotcha:** Because this technique makes text transparent, `text-shadow` won't make it more readable — text shadows only work when text has a visible colour fill. This is why the flame streak number (`FlameStreak`) can't use the shimmer class without risking being hard to read against the flame.

---

## 4. Data Flow

**What this means in plain English:** Here is the full journey a piece of data takes, from you typing it to it appearing in your history.

### Logging a new entry

1. You fill in a form field → React updates a state variable (e.g. `setDate(e.target.value)`).
2. You click the submit button → the `handleSubmit` function runs.
3. `handleSubmit` validates the fields. If anything is missing, it calls `alert(...)` and stops.
4. `handleSubmit` calls `supabase.from('table_name').insert([{...}])`, sending the data to Supabase over HTTPS [secure internet connection].
5. Supabase stores the row in PostgreSQL [a relational database — data stored in tables with rows and columns].
6. The `supabase` call returns either `{ data, error }`. If `error` exists, an alert is shown. If not, the form resets and a "✦ Recorded" confirmation fades in for 3 seconds.

### Viewing history

1. You click "History" → `setPage('history')` updates state.
2. React re-renders. A `useEffect` hook fires because `page` changed.
3. The `useEffect` calls `fetchSessions()`.
4. `fetchSessions` calls `supabase.from('table').select('*').order('date', { ascending: false })`, fetching all rows from Supabase, newest first.
5. The result is stored in the `sessions` state variable.
6. React re-renders again. The `sessions` array is now available to calculate KPIs, build chart data, and render the timeline.

### Editing an entry

1. You click "Edit" on a timeline card → `startEdit(session)` is called.
2. `startEdit` copies the session's values into separate `editX` state variables (e.g. `editDate`, `editCount`).
3. `editingId` is set to the session's database ID.
4. React re-renders: the timeline card for that `id` switches from the display view to the edit form.
5. You change values in the edit inputs → `editX` state updates.
6. You click "Save" → `saveEdit(id)` calls `supabase.from('table').update({...}).eq('id', id)`.
7. On success, `editingId` is cleared and `fetchSessions()` re-fetches all data from the database.

### Deleting an entry

1. You click "Delete" → `window.confirm(...)` shows a browser confirmation dialog.
2. If confirmed, `supabase.from('table').delete().eq('id', id)` is called.
3. On success, `fetchSessions()` re-fetches.

---

## 5. External Dependencies

**What this means in plain English:** These are the third-party libraries the app relies on — code written by others that we import and use.

| Package | What it does |
|---|---|
| `react` | The core React library. Provides `useState`, `useEffect`, JSX [a syntax that lets you write HTML-like code inside JavaScript]. |
| `react-dom` | Connects React to the browser's actual HTML document. Used only in `index.js`. |
| `react-scripts` | The build toolchain [compilation, bundling, dev server] from Create React App. Provides `npm start`, `npm run build`, `npm test`. |
| `@supabase/supabase-js` | Supabase's official JavaScript client. Provides the `createClient` function and methods like `.from().select()`, `.insert()`, `.update()`, `.delete()`. |
| `@testing-library/react` etc. | Testing utilities. Currently unused in practice but present from the CRA template. |

**What is NOT a dependency:**
- No charting library (recharts was installed and removed). All charts are hand-drawn SVG or pure CSS.
- No routing library (react-router). Navigation is handled with simple state variables.
- No CSS framework (no Tailwind, Bootstrap, etc.). All styling is custom.
- No icon library. Icons are Unicode characters (← → ✦) or hand-drawn SVG paths.

**Fonts (loaded from Google Fonts, not npm):**
Loaded via `@import` in `globalStyles` (`App.js:9`):
- `Cormorant Garamond` — used for all large display numbers and headings (elegant, serif)
- `Montserrat` — used for all labels, buttons, and body text (clean, sans-serif)

---

## 6. Database and State

**What this means in plain English:** Data lives in two places — in Supabase (permanent) and in React state (temporary, only while the page is open).

### Supabase tables

Five tables in PostgreSQL on Supabase:

| Table | Columns | Used by |
|---|---|---|
| `sessions` | `id`, `type` (always `"sport"`), `sport_name`, `date`, `duration_mins`, `location` | Sports tracker (`App.js`) |
| `arsenal_games` | `id`, `date`, `opponent`, `competition`, `venue`, `result`, `score` | `ArsenalTracker.js` |
| `guinness_sessions` | `id`, `date`, `count`, `location` | `GuinnessLog.js` |
| `pushup_sessions` | `id`, `date`, `target`, `count` | `PushupTracker.js` |
| `office_days` | `id`, `date` | `OfficeDays.js` |

All `date` columns store strings in `YYYY-MM-DD` format. All `id` columns are auto-generated by Supabase (UUID or serial integer — you never set them manually).

### React state

Each tracker component holds its own state — none of them share state with each other. When you navigate back to the home page and re-open a tracker, its state is reset (so the History page re-fetches from the database).

Common state pattern in every tracker:
- `page` — `'log'` or `'history'`, controls which tab is shown
- `sessions` / `games` — the array of records fetched from the database
- One state variable per form field (e.g. `date`, `count`, `location`)
- `editingId` — the `id` of the record currently being edited, or `null` if none
- One `editX` variable per editable field (e.g. `editDate`, `editCount`)
- `saved` — a boolean that briefly turns `true` after a successful save, triggering the "✦ Recorded" message

---

## 7. Known Quirks

**Things that aren't obvious and that you should be careful not to break:**

### Competition string format (ArsenalTracker.js:350)
Champions League and Carabao Cup competitions are stored as `"Champions League · Semi Final"` — a combined string with a ` · ` separator (middle dot with spaces). `startEdit` at line 359 parses this back with `.startsWith()` and `.split(' · ')`. If you ever change the separator, add a new competition type, or rename an existing one, the parsing logic needs updating too — and any existing records in the database with the old format will show incorrectly in the edit form.

### Streak counts today AND yesterday (PushupTracker.js:416)
The streak counter starts if the most recent pushup date is either today or yesterday. This means if you do pushups then don't check the app until the next day, your streak still shows correctly. If you change this to only check today, streaks will appear to break overnight.

### Date handling: always use `T12:00:00` (PushupTracker.js:417)
When constructing `Date` objects from date strings for the streak counter, `T12:00:00` is appended before parsing: `new Date(uniqueDates[0] + 'T12:00:00')`. This forces the time to noon, avoiding timezone edge cases where `new Date('2026-04-10')` might be interpreted as midnight UTC and thus appear as the previous day in UK local time. Don't change this to bare date string parsing.

### `formatUKDate` is duplicated in every file
The same function (`YYYY-MM-DD` → `DD/MM/YYYY`) exists independently in `App.js`, `ArsenalTracker.js`, `GuinnessLog.js`, `PushupTracker.js`, and `OfficeDays.js`. If you need to change the date display format, you'd need to update it in all five places.

### ESLint treats warnings as errors on build (CLAUDE.md)
`npm run build` will fail if there are any unused variables in the code. Before pushing to GitHub, always run `npm run build` and fix any errors it reports. The dev server (`npm start`) is more lenient — it shows warnings but keeps running.

### `OfficeDays` fetches on mount, others fetch on tab switch
`OfficeDays.js:257` uses `useEffect(() => { fetchSessions() }, [])` — the empty array `[]` means "run once when the component first appears". The other trackers only fetch when `page === 'history'`. This means Office Days always has data ready, even when you're on the Log tab.

### The `BubbleChart` animation loop never stops (App.js:364)
The `requestAnimationFrame` loop in `BubbleChart` runs continuously while the Sports tracker history tab is open. The `useEffect` cleanup function at line 367 (`return () => cancelAnimationFrame(animRef.current)`) stops it when the component disappears. If you ever restructure the Sports tracker to keep the chart mounted permanently, you'd want to check this doesn't cause unnecessary CPU usage.

### Hover effects on timeline cards use inline event handlers (GuinnessLog.js:434–435)
Some card hover effects (border colour, box shadow) are applied via `onMouseOver` and `onMouseOut` inline handlers that directly mutate `e.currentTarget.style`, rather than using CSS classes. This is a workaround because CSS `:hover` pseudo-class [a CSS selector that applies when the mouse is over an element] doesn't work well with dynamically set inline styles. Don't try to add a CSS hover rule for these cards expecting it to override the inline style — it won't.

### `zIndex` and CSS animations create stacking contexts (PushupTracker.js:294–331)
CSS `animation` on an element creates a "stacking context" [a layer system that controls which elements appear in front of others]. The three flame layers each have animations, making them stack independently. The number in the flame needs `zIndex: 10` to appear above them. If you add more animated elements inside `FlameStreak`, be aware they may render on top of the number unless their z-index is set explicitly lower.

---

## 8. Where to Start if I Want to Change X

### Add a new tracker

1. Create `src/MyTracker.js`. Follow the same pattern as any existing tracker: palette object at the top, styles template literal, sub-components, then the main exported function with `onBack` prop.
2. In `src/App.js`:
   - Add `import MyTracker from './MyTracker'` at the top (around line 6).
   - Add `{ label: 'My Tracker', key: 'mytracker' }` to the buttons array at line 568.
   - Add `{tracker === 'mytracker' && <MyTracker onBack={() => setTracker('sports')} />}` around line 593.
3. Create a new table in Supabase with the columns you need.

### Add a new field to an existing tracker

Example: adding "Notes" to the Guinness Log.

1. Add the column to the `guinness_sessions` table in Supabase (via the Supabase web dashboard).
2. In `GuinnessLog.js`:
   - Add `const [notes, setNotes] = useState('')` near the other state variables (around line 183).
   - Add the input field to the log form (around line 330).
   - Include `notes` in the `supabase.insert(...)` call (line 204).
   - Add `const [editNotes, setEditNotes] = useState('')` for editing.
   - Update `startEdit` to populate it (around line 214).
   - Add the edit input to the edit form.
   - Include it in the `supabase.update(...)` call (line 232).

### Change a colour or theme

Each file has a palette object at the top:
- `App.js` / Sports tracker: `#8b0000` (dark red) — set directly as string literals throughout, not in a palette object
- `ArsenalTracker.js:4`: `const A = { red: '#EF0107', gold: '#9C824A', ... }`
- `GuinnessLog.js:4`: `const G = { gold: '#c9a452', bg: '#0d0c0b', ... }`
- `PushupTracker.js:4`: `const P = { blue: '#1e3a8a', ... }`
- `OfficeDays.js:4`: `const O = { green: '#1a5c38', ... }`

Change the value in the palette object and it propagates everywhere that value is used via the variable.

### Change how the monthly heatmap works (OfficeDays.js)

The `OfficeHeatmap` component starts at line 117. Key things:
- `START_MONTH = 3` (line 121): Change to `0` to start from January.
- Week row colours (lines 195–198): The thresholds `>= 3` and `>= 1` are where you'd change what counts as green/amber/red.
- Day cells (lines 212–217): The logic for what colour each individual day cell gets is here.

### Change the UI text or labels

Most visible text strings are inline in the JSX. Search the relevant file for the text you want to change. For example, to rename "Session Archive" on the Pushup history page, search `PushupTracker.js` for `"Session Archive"` (line 535).

### Add a chart to a tracker that doesn't have one

Use the same SVG-based donut pattern from `PushupDonutChart` (`PushupTracker.js:152`) or the bar chart from `PushupBarChart` (`PushupTracker.js:243`) as a template. Copy the component into the target tracker file, adjust the colour palette references, and pass it the data it needs. No charting library is needed.

### Modify which competitions/stages appear in Arsenal log

The lists are constants at the top of `ArsenalTracker.js`:
- `COMPETITIONS` (line 18): All competition names
- `CL_STAGES` (line 19): Champions League round options
- `CARABAO_STAGES` (line 20): Carabao Cup round options

Add or remove values from these arrays. Note the competition storage gotcha above — if you rename a competition, any existing records stored under the old name will need the database value updated manually.

### Run the app locally

```bash
npm start         # Starts dev server at http://localhost:3000, auto-reloads on save
npm run build     # Builds production bundle — run before pushing to check for ESLint errors
```
