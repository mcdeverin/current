# Handoff — Current · twelve directions

> **For Claude Code:** This bundle is a developer handoff for the **Current** app (sober/sober-curious, present-tense, no-labels). It contains twelve design directions: eight new features and four reworks of existing screens. Implement them in **the existing codebase** (`src/` — React + Vite + Base44 SDK + Capacitor iOS + Tailwind + framer-motion + lucide-react). The HTML mockups in `design-canvas/` are **references, not production code** — read them, then write idiomatic React components using the codebase's existing patterns.

---

## Overview

Current is a calm, journal-toned app for people building presence — no labels, no programs. Two modes:
- **Streak** — tracks days from a chosen `sobriety_date`, displays a ring + day count
- **Exploring** — no clock, no count, just the app surfaces

The app already ships these surfaces:
- `Home` — greeting, ring or daily headline, mood check-in, "Today's Moment," stat cards, optional spots CTA
- `NearMe` — sober-friendly NYC + LA spots
- `Milestone` — celebratory overlay at day 1, 7, 30, 90, 180, 365…
- `Profile` — settings, "What brought me here," journey toggle, dark/light, delete account
- `Onboarding`, `Auth`, `Admin`, etc.

The twelve directions here extend that surface area in the app's existing voice ("that matters," "just today," "you're here, that's enough"). **Tone is critical** — every string in this doc is approved copy; preserve it verbatim unless you have a strong reason to swap it.

---

## About the design files

The files in `design-canvas/` are **HTML/JSX prototypes** built to communicate look and behavior. They are React mockups rendered on a Figma-style canvas via `<script type="text/babel">`. They were written to be read, not deployed.

Your job: **recreate each design as a real React component in `src/`**, using the codebase's existing conventions:
- Inline styles with `var(--t-bg)`, `var(--t-text)` etc. tokens from `ThemeContext.jsx` (the app does not use Tailwind for theme-aware color — it uses CSS vars on a wrapper div)
- Tailwind utilities for spacing/layout/typography only
- `lucide-react` icons (not the hand-traced SVGs in the mockups)
- `framer-motion` for transitions where useful
- `base44.entities.*` for any new data persistence
- `hapticLight()` / `hapticMedium()` from `@/lib/haptics` on any tap that's emotionally meaningful
- `authenticateWithBiometrics(...)` from `@/lib/biometrics` for anything private

---

## Fidelity

**Mid-fidelity.** The mockups show final tone, copy, color, type, hierarchy, and rough spacing, but are not pixel-perfect — they were hand-laid in inline styles, not from your real components. Treat them as **direction**, and prefer the codebase's existing components (`StreakRing`, `MoodCheckin`, `TodaysMoment`, `StatCard`, `PlaceCard`, `JourneySection`, `EditPanel`, `BottomNav`, `GlobalHeader`) wherever they already exist. Reuse before you re-implement.

---

## Design tokens (verbatim from `src/components/current/ThemeContext.jsx`)

The app already defines all of these. Reference them via CSS variables (`var(--t-bg)` etc.). Do not introduce new colors unless explicitly noted in a feature.

### Dark (default)
```
--t-bg            #0f1219
--t-card          #161b24
--t-card-alt      #1a2430
--t-primary-card  #1a2430
--t-border        #232a35
--t-text          #e8eaf0
--t-text-warm     #f0f2ee
--t-muted         #6a7280
--t-label         #6a7280
--t-accent        #6E8FA3   ← slate blue, never change
--t-accent-bg     rgba(110,143,163,0.15)
--t-danger        #7a2020
```

### Light
```
--t-bg          #f5f4ef
--t-card        #ffffff
--t-card-alt    #EEF3F6
--t-border      #d5d0c8
--t-text        #1a1a1a
--t-muted       #7a7870
--t-accent      #6E8FA3
```

### Type
```
Display    'Playfair Display', serif       (use .font-display)
Body       'DM Sans', sans-serif           (default on <body>)
Eyebrow    DM Sans 10px / uppercase / tracking 0.18em / weight 500
                  → existing pattern: text-[10px] uppercase tracking-widest font-medium
Quote/italic body:  'Playfair Display' italic, 14–16px, color var(--t-text-warm)
```

### Geometry
```
Card radius        12px  (rounded-xl)
Pill radius        9999  (rounded-full)
Card padding       16–20px
Page H padding     24px  (px-6)
Page top padding   calc(env(safe-area-inset-top, 0px) + 72px)
Bottom nav clearance  pb-24 (96px)
Borders            1px solid var(--t-border)
Cross-card divider 1px solid var(--t-border)
Focus ring         do not add — app does not use one
```

### Accent dot / progress head color
Slightly lifted slate `#a8c5d8` for halo / glow elements. Use sparingly.

---

## What's new vs. what gets edited

| # | Direction | Kind | New files | Files to edit | New Base44 entity |
|---|---|---|---|---|---|
| 01 | Anchor (urge tool) | New feature | `pages/Anchor.jsx`, `components/current/BreathRing.jsx` | `Home.jsx` (entry chip), `BottomNav.jsx` (optional 4th tab), `pages.config.js` (auto) | — (uses `UserProfile.why_i_started`, `UserProfile.anchor_contact`) |
| 02 | Evening Reflection | New feature | `pages/Reflection.jsx`, `components/current/ReflectionPrompt.jsx`, `components/current/ReflectionThread.jsx` | `Home.jsx` (pill entry), `lib/notifications.js` (9pm schedule) | **`Reflection`** |
| 03 | Presence Map | New feature | `components/current/PresenceMap.jsx`, `pages/Presence.jsx` | `Profile.jsx` or `Home.jsx` (entry tile) | — (derives from `Reflection` + `MoodLog` entities) |
| 04 | Pause / Shield | New feature | `components/current/PauseDrawer.jsx` | `JourneySection.jsx` (add action row), `Profile.jsx`, `milestoneData.jsx` (`getDaysSince` honours pause) | adds fields to `UserProfile`: `pause_start`, `pause_end`, `pause_reason` |
| 05 | Letters | New feature | `pages/Letters.jsx`, `components/current/LetterCard.jsx`, `components/current/LetterCompose.jsx` | `Home.jsx` (entry tile or rotation), `BottomNav.jsx` optional | **`Letter`** |
| 06 | Mocktails | New feature | `pages/Mocktails.jsx`, `components/current/DrinkCard.jsx`, `components/current/QuickOrderCard.jsx` | `NearMe.jsx` (cross-link), `pages.config.js` (auto) | **`Drink`** |
| 07 | Sober Budget | New feature | `pages/Budget.jsx`, `components/current/BudgetJar.jsx`, `components/current/BudgetGoalDrawer.jsx` | `Profile.jsx` (replace flat StatCard with entry tile) | adds fields to `UserProfile`: `budget_goal_label`, `budget_goal_amount` |
| 08 | Quiet Hours | New feature | `lib/quietHours.js` (window check), `components/current/QuietHoursOverlay.jsx` | `Home.jsx` (wraps content), `BottomNav.jsx` (hide tabs), `ThemeContext.jsx` (deeper-dark variant) | adds field to `UserProfile`: `quiet_hours_enabled`, `quiet_start`, `quiet_end` |
| 09 | Home v2 | Refinement | — | `Home.jsx` | — |
| 10 | Streak Ring v2 | Refinement | — | `StreakRing.jsx` | — |
| 11 | Mood scale + history | Refinement | `components/current/MoodScale.jsx`, `components/current/MoodHistory.jsx` | `MoodCheckin.jsx` (replace) | **`MoodLog`** |
| 12 | Spots v2 | Refinement | `components/current/SpotsMapView.jsx`, `components/current/PhotoSlot.jsx` | `NearMe.jsx` (tab toggle), `PlaceCard.jsx` (photo + open badge), `Places` entity gets `photo_url` |

---

## New Base44 entities

Implement these via the Base44 builder (or the SDK schema, depending on your workflow). Field names are canonical — use exactly these so future Claude Code sessions can refer to them.

### `Reflection`
```
id              string
user_email      string     // filter by current user
date            string     // YYYY-MM-DD, local
choice          enum       "small_win" | "person" | "made_it_through"
note            string?    // optional, ≤ 240 chars, private
created_at      ISO8601
```
Indexes: `user_email + date` unique (one per night). Read-only by other users.

### `Letter`
```
id              string
body            string     // ≤ 280 chars
author_day      number     // sobriety day count at time of writing (anonymous)
status          enum       "pending" | "approved" | "rejected"
created_at      ISO8601
delivered_count number     // how many times shown
```
Plus a delivery model: deliver one approved letter per `user_email` per day (server-side rotation or client-side modulo over approved set — see feature 05).

### `Drink`
```
id              string
name            string
kind            enum       "bar_order" | "home_recipe" | "zero_proof"
short           string     // one-liner
recipe          string     // markdown or plain text, ≤ 800 chars
ingredients     string[]   // for filtering
quick           boolean    // featured in "Last-minute" card
emoji           string?    // optional, e.g. "🍋"
status          enum       "approved" | "pending"
```

### `MoodLog`
```
id              string
user_email      string
date            string     // YYYY-MM-DD
value           number     // 0..4 (5-stop scale, 0 = struggling, 4 = good)
note            string?
created_at      ISO8601
```
Indexes: `user_email + date` unique. Replace `sessionStorage.mood_checkin_*` with this.

### Fields added to existing `UserProfile`
```
anchor_contact_name      string?   // "Mom", "Jamie", "James (sponsor)"
anchor_contact_phone     string?   // tel:
pause_start              string?   // YYYY-MM-DD
pause_end                string?   // YYYY-MM-DD, null = open
pause_reason             string?   // "travel" | "illness" | "custom"
budget_goal_label        string?   // "A week in Lisbon"
budget_goal_amount       number?   // dollars
quiet_hours_enabled      boolean   // default true
quiet_start              string    // "22:00", default "22:00"
quiet_end                string    // "06:00", default "06:00"
```

### Fields added to existing `Places` / `PlacesLA`
```
photo_url        string?
photo_credit     string?
```

---

## Per-feature specs

> Read the mockup file path before implementing. Open the canvas at `design-canvas/Current — Feature Explorations.html` for visuals. Source per artboard: `design-canvas/mockups/features.jsx` (01–08) and `design-canvas/mockups/refinements.jsx` (09–12).

---

### 01 · Anchor — urge tool
**Mockup:** `features.jsx → AnchorScreen`
**Route:** `/Anchor` (auto-registered via `pages/Anchor.jsx`)

**Purpose.** A single full-screen surface for an acute moment. One tap from Home opens it; everything else is muted.

**Layout (top to bottom).**
1. Status-bar safe-area gap
2. Top-right "Close" button (text only, `var(--t-muted)`, 13px, taps → navigate back). No nav header on this page.
3. Eyebrow: `Right now` — `text-[10px]` uppercase tracking-widest `var(--t-accent)`, centered.
4. Display headline (Playfair italic, 26px, `var(--t-text)`): **"Just breathe."**
5. **`<BreathRing/>`** — 230px circle, animated 4-7-8 breathing pattern (see below). Inner label cycles: "Breathe in" (4s) → "Hold" (7s) → "Breathe out" (8s). Progress arc strokes accent color.
6. **"Why you're here" card** — slim card, `var(--t-card)` background, 1px border, 16px padding. Eyebrow "Why you're here" in accent. Body in Playfair italic, 15px, `var(--t-text-warm)`. Content = `profile.why_i_started` (already in `UserProfile`). If empty, show: _"You'll be able to anchor to your own words when you add them in Profile."_
7. **Bottom CTAs** (28px from bottom):
   - Primary: `Text {anchor_contact_name}` — full-width, `var(--t-accent)` bg, `var(--t-bg)` text, 12px radius, 14px font. Tap opens `sms:{anchor_contact_phone}`. Hide entirely if no contact set; show a smaller "Set someone to text →" link in its place.
   - Secondary: "Move — go outside for 5" — outlined, 13px, `var(--t-muted)`. Optional, can be omitted.

**BreathRing component.** Plain SVG. Two stacked circles (outer ring + inner glow). Use `requestAnimationFrame` or `framer-motion` to animate `scale` 0.92 ↔ 1.04 on the inner circle, synced with the 4-7-8 cycle (inhale 4s scale up, hold 7s steady, exhale 8s scale down). The progress arc walks around the outer ring across one full 19s cycle. Honor `prefers-reduced-motion` → skip the scale animation, keep just the cycling label.

**Entry points.**
- **Home v2:** small "Anchor" chip top-right of greeting. See feature 09.
- **Optional 4th bottom-nav tab** ("Anchor", `AnchorIcon` from lucide) — only show if `profile.mode === "streak"` and an anchor contact is set. Otherwise keep nav at 3 tabs.

**Haptics.** `hapticMedium()` on opening Anchor. `hapticLight()` on each breath phase transition. `hapticHeavy()` on Text-CTA press.

**Done when:** opening Anchor from Home loads the screen in < 200ms, breath ring animates smoothly, tap-to-text deep-links to Messages on iOS native (Capacitor) with the contact's number prefilled.

---

### 02 · Evening Reflection
**Mockup:** `features.jsx → ReflectionScreen`
**Route:** `/Reflection`

**Purpose.** A 1-minute end-of-day prompt that builds a private "thread" of small wins. Scheduled at the user's chosen evening time; defaults to 9:00pm local.

**Layout.**
1. Standard `GlobalHeader` with back chevron.
2. Eyebrow (left-aligned): `Tonight · {h:mm a}` — e.g. `Tonight · 9:24 pm`.
3. Display question (Playfair, 28px, centered, max-w-sm): **"What kept you here today?"**
4. Sub (DM Sans 13px, `var(--t-muted)`, centered): "One word, one breath, one tap. That's it."
5. Three large choice rows (12px gap, rounded-xl, 1px border). Selected state: 1px `var(--t-accent)` border + `var(--t-accent-bg)` background + 6px accent dot on right.
   - "A small win"
   - "A person"
   - "Just made it through"
6. Optional one-line note: card with eyebrow "What was it (optional)", Playfair italic 15px input. 240 char max. Caret blinking is good. Save on blur or on Save button at bottom.
7. Footnote: "Saved to your thread. Only you ever see it." — 11px, muted, centered.

**Behavior.**
- On submit → `base44.entities.Reflection.create({ user_email, date: today_local, choice, note })`.
- If a `Reflection` already exists for today → load it and let the user **edit** (same form, pre-filled).
- `lib/notifications.js`: schedule a local notification at `profile.notification_time` (default 21:00) with body _"One word, one tap, then sleep."_ — only on days where no `Reflection` exists yet. Tap deep-links to `/Reflection`.

**Thread.** A `ReflectionThread` component (separate page, optional in v1) shows past entries grouped by month, Playfair-italic body, soft `var(--t-border)` divider between days. Reachable from Profile → "Your reflections."

**Done when:** a user can tap the Home pill, choose a reflection, type a line, hit save, refresh the app and see the entry persist (round-trips through Base44).

---

### 03 · Presence Map
**Mockup:** `features.jsx → PresenceMapScreen`
**Route:** `/Presence` (or in-place in Profile)

**Purpose.** A heat-grid showing days the user "showed up" (any of: opened the app, logged a mood, wrote a reflection). Replaces the abstract "X day streak" with the *texture* of presence.

**Layout.**
1. `GlobalHeader` with back.
2. Eyebrow: "Presence".
3. Display: **"{N} days present"** — count of unique days with any activity, current calendar year.
4. Sub: "this year, in your own quiet way."
5. **Heat grid card** — `var(--t-card)`. Grid: 22 cols × 7 rows (one column per week). Each cell is `aspectRatio: 1`, 2px radius, 3px gap.
   - Level 0 (no activity): `#1a2230`
   - Level 1 (1 surface): `rgba(110,143,163,0.30)`
   - Level 2 (2 surfaces): `rgba(110,143,163,0.60)`
   - Level 3 (3+ surfaces): `#6E8FA3`
   - Top row: month labels every 4 cols (`Jun`, `Jul`, …), 10px muted.
   - Top right: "this week +{n}" — count of unique days active this ISO week.
   - Bottom legend: `quieter · ▢ ▢ ▢ ▢ · fuller`, 10px muted.
6. Two **summary cards** below (flex row, gap 10):
   - "Longest weave" — `var(--t-text)` Playfair 26px number, "days" suffix in DM Sans 11px muted.
   - "Quiet days" — count of cells with level 0 (intentional: blanks are not failures).
7. Footer (Playfair italic, 14px, muted, centered): _"Not every day is loud. The blanks count too."_

**Data source.** Aggregate over (a) `Reflection` dates, (b) `MoodLog` dates, (c) app-open dates (write a lightweight `Presence` log entity if no app-open ping exists yet, OR re-use the user's `last_seen` style field).

**Done when:** the grid renders correctly for an account with sparse data (most cells level 0), and a busy account (most cells level 2–3), with no off-by-one date errors (use local date, not UTC — copy the `parseLocalDate` helper from `milestoneData.jsx`).

---

### 04 · Pause / Shield
**Mockup:** `features.jsx → PauseScreen`
**Surface:** `<PauseDrawer/>` opened from `JourneySection` in Profile.

**Purpose.** Let a user pause the streak counter for travel/illness/anything, without resetting. **Pausing isn't restarting.**

**Layout (drawer).**
1. Drag handle (10×1.5px pill, `var(--t-border)`).
2. Eyebrow: "Quiet pause" (accent).
3. Display: **"Take a breath. Your days stay yours."** (Playfair, 26px, two lines).
4. Body: "Pause the tracker for as long as you need. Pausing isn't restarting. Your number is waiting where you left it." — 13px, muted.
5. Four radio rows (rounded-xl cards):
   - One day — "Travel, an off day"
   - Three days — "Sick, or moving"
   - A week — "Holiday, big trip"
   - Until I come back — "No countdown"
6. Bottom: full-width accent CTA "Begin pause".
7. Footnote: _"You can come back whenever."_ — Playfair italic 13px.

**Behavior.**
- Writes `pause_start = today`, `pause_end = today + N` (null for "until I come back").
- `getDaysSince(sobriety_date)` in `milestoneData.jsx` must subtract any pause-day range from the count. **Critical**: update this function and add unit tests in your head — many surfaces (Home ring, Milestone, Profile, Presence) depend on it.
- While paused, `StreakRing` shows the count frozen with a small `Paused` pill below. `Home` greeting copy switches to "Welcome back when you're ready."
- Tapping the pill anywhere → "End pause early?" confirm.
- After `pause_end` passes, automatically resume.

**Entry.** New `ActionRow` in `JourneySection.jsx`: "Pause for a while" (streak mode only, no `pause_start` set). When paused, the row becomes "You're paused · until {date}" with a "End now" trailing button.

**Done when:** the streak ring shows a frozen count during a 3-day pause, then resumes counting on day 4 without losing the prior 228 days.

---

### 05 · Letters
**Mockup:** `features.jsx → LettersScreen`
**Route:** `/Letters`

**Purpose.** One anonymous note delivered each morning from another user. No replies, no profiles, no chat. Optionally compose your own letter to leave in the stream.

**Layout.**
1. Header back.
2. Eyebrow: "Letters".
3. Display (28px Playfair): **"From strangers, who are also here."**
4. Sub: "Anonymous. Read-only. One delivered each morning."
5. Stack of letter cards (12px gap):
   - Today's letter — slight emphasis: `var(--t-card-alt)` background, small `TODAY` micro-label top right (9px, accent, tracking 0.2em).
   - Yesterday + earlier in the stack — `var(--t-card)`.
   - Body in Playfair italic, 15px, `var(--t-text-warm)`, 1.55 line-height.
   - Attribution: `— someone on day 47` in 11px muted.
6. Bottom: dashed-border CTA "Leave one yourself" with `Send` icon. Opens a compose drawer (textarea, 280 char counter, "Submit anonymously" button). On submit → `Letter.create({ body, author_day, status: 'pending' })`. Show a calm confirmation: _"Thanks. We read every letter before it goes out."_

**Delivery rotation.** Client-side: take the SHA1 of `user_email + date` mod approved-letter count, pick that one. Persist `delivered_count++` server-side via a `Letter.update`. Simpler than a server cron.

**Moderation.** Letters start `pending`. An `Admin` page (already exists at `pages/Admin.jsx`) gains a "Letters" tab where a moderator approves/rejects.

**Done when:** a fresh user sees today's letter on first open of Letters, the same letter on the next open same-day, and a new one tomorrow.

---

### 06 · Mocktails
**Mockup:** `features.jsx → MocktailsScreen`
**Route:** `/Mocktails`

**Purpose.** A pocket script for "going out tonight." Bar order phrases + simple home recipes. Distinct from Spots — this is what to say at any bar, not where to go.

**Layout.**
1. Header back.
2. Eyebrow: "Going out tonight?"
3. Display (26px Playfair): "Something to hold."
4. **Hero card** ("Last-minute") — soft accent gradient background (linear-gradient 135deg, `rgba(110,143,163,0.18)` → `rgba(110,143,163,0.05)`), border. Eyebrow "Last-minute" + Playfair "Order with confidence" + Playfair italic body: _"Soda water, fresh lime, two drops of bitters, in a rocks glass."_ + 11px muted footer "Reads like a real order. Tastes like one too."
5. Filter chips row (existing pattern from `NearMe`): All · Bar order · Home · Zero-proof beer · 15-second.
6. List of drinks. Each card:
   - Name (14px medium, `var(--t-text)`)
   - Sub ("Bar · most bars do this" or "Home · 4 min · 5 ingredients") in 11.5px muted
   - Right-aligned uppercase tag pill: `BAR` or `HOME` (9.5px, accent border + accent text).
   - Tap → detail sheet with full recipe / phrasing.

**Detail sheet** (Drawer / Sheet — match the look of NearMe's `showTypeSheet`).
- Bar order: large quote in Playfair italic, "Tap to copy" button below ("Copied" toast on tap).
- Home recipe: ingredients list (DM Sans, 13px), step-by-step (numbered, 13px). 4-minute timer button at bottom is a nice touch but optional.

**Entry points.** Home → small surface "Going out? Order ideas →" (only in evening hours, optional). Also reachable from Spots header → "Mocktails" link.

**Done when:** at least 20 seed drinks are in the `Drink` entity (mix of bar/home), the filter chips correctly narrow the list, and tapping a bar order copies the script to the clipboard with light haptic.

---

### 07 · Sober Budget
**Mockup:** `features.jsx → BudgetScreen`
**Route:** `/Budget`

**Purpose.** Reframe abstract savings as a visible goal jar.

**Layout.**
1. Header back.
2. Eyebrow: "Quiet gains".
3. Sub: "{days} days × ${rate}/day, give or take."
4. **Hero number** — `Playfair 60px`, the `$N,NNN` total saved (days × `daily_savings_rate`). Below: tiny eyebrow "Not spent · {days} days".
5. **Jar card** — 180px tall, `var(--t-card)`, with a filled-from-bottom rectangle inside whose height is `(saved / goal_amount) × 100%`, slate-blue gradient. Overlaid (on top of the fill, top-aligned):
   - Eyebrow "Saving toward"
   - Playfair italic 22px: `{budget_goal_label}` (e.g. "A week in Lisbon")
   - Sub: `${saved} of ${goal} · ~{daysLeft} days to go`
6. **"What this could be" card** — `var(--t-card-alt)` background, 3 stacked rows with a divider between, no padding gap:
   - `114 · good paperbacks`
   - `28 · dinners out, with a friend`
   - `3 · rounds of therapy`
   - Big-number left in Playfair 20px accent, label right in 13px text.

**Goal drawer.** Tapping the jar opens a small drawer to set/change `budget_goal_label` and `budget_goal_amount`. Defaults to no goal → jar shows full as the "saved" rectangle and the eyebrow says "Set a goal →".

**Done when:** changes to `daily_savings_rate` re-flow the hero number immediately, and the jar visibly fills as more days accumulate.

---

### 08 · Quiet Hours
**Mockup:** `features.jsx → QuietHoursScreen`

**Purpose.** Between `quiet_start` and `quiet_end` (default 22:00 → 06:00), the app dampens everything decorative. No discovery, no stats, no nudges. Only a single anchor surface.

**Implementation.**
- `src/lib/quietHours.js` exports `isQuietNow(profile)` returning a boolean.
- A new `QuietHoursOverlay` component wraps Home content. When `isQuietNow()` is true:
  - Deepens the dark theme one notch (a `quiet` variant on `ThemeContext`):
    ```
    --t-bg:     #070a10
    --t-card:   #10141c
    --t-border: #1b222d
    --t-muted:  #5a6270
    ```
  - Replaces the entire Home body with: top eyebrow "Quiet hours · {h:mm a}" with a small `Moon` icon, then **"It's late. Just rest."** (Playfair italic, 36px), then a small "One breath" card with a 4-7-8 line, then a dashed "Discover, Spots, and Today's Move are tucked away. Back at sunrise." plate.
  - Bottom nav: keep `Today` only; soften the others to 30% opacity or hide entirely.
- Configurable via Profile → "Quiet hours" row. Drawer to toggle on/off and pick start/end times.

**Done when:** opening Home at 1:14am shows the quiet variant; at 7:00am shows the normal Home; the toggle in Profile disables the whole behavior.

---

### 09 · Home v2 — tighter rhythm
**Mockup:** `refinements.jsx → HomeV2Screen`
**File to edit:** `src/pages/Home.jsx`

**Changes (streak mode).**
1. Greeting line and **Anchor chip** on the same row:
   - Left: existing greeting (`Good evening, {first_name}.`) — keep, but reduce mb from `mb-10` → `mb-4`.
   - Right: small pill, `var(--t-accent-bg)` background, 1px `var(--t-accent)` border, accent text, 11px medium. Icon = lucide `Anchor` 12px, label "Anchor". Tap → `/Anchor`.
2. Ring unchanged. Reduce vertical breathing room around it by 8–12px.
3. Move "Since {date}" up to a single line directly below the day count.
4. Mood check-in: keep as-is (will be replaced by feature 11).
5. After "Today's Moment," add a **Reflection pill** — full-width pill-shaped (rounded-full), 12px padding, transparent background, 1px `var(--t-border)`, left-aligned content `<Sparkles size=12/> Tonight's reflection · 1 minute`, right chevron. Only show after 18:00 local AND if no `Reflection` exists for today.

**Changes (exploring mode).** Same Anchor chip in top-right (if anchor contact is set). Same Reflection pill rule.

**Done when:** the Home page feels tighter on a 390-wide iPhone (less negative space between blocks) and the new chip/pill are present without disrupting the existing flow.

---

### 10 · Streak Ring v2
**Mockup:** `refinements.jsx → StreakRingV2Screen`
**File to edit:** `src/components/current/StreakRing.jsx`

**Changes.**
- Increase `size` default from 220 → 240, `strokeWidth` from 4 → 5.
- Add a subtle radial halo *behind* the ring: a 260px `radial-gradient(circle, rgba(110,143,163,0.10), transparent 70%)` div centered on the ring.
- Stroke uses a `linearGradient` from `#5b7d92` (top-left) to `#8aa9bd` (bottom-right). Define this once as a `<linearGradient id="ringGrad">` in the SVG `<defs>`.
- At the progress head, add an absolutely-positioned 12px dot, color `#a8c5d8`, with `box-shadow: 0 0 16px 4px rgba(168,197,216,0.6)` for glow.
- Day number: bump size from `text-6xl` to ~86px, letter-spacing `-0.03em`, line-height 0.9.
- Below the number: small caps "Clear days" with 0.3em letter-spacing.
- **Optional but recommended:** Soft breath animation — scale the SVG between 1.00 and 1.012 over 4s, ease-in-out, infinite. Honor `prefers-reduced-motion`.

Below the ring on Home, add a **milestone strip card** (`var(--t-card-alt)`):
- Left: eyebrow "Next milestone" + Playfair 17px: "One Year · in 6 days".
- Right: 50px circle, 1.5px accent border, Playfair "6" centered.
Logic: find the next milestone in `milestones[]` greater than `days`, compute `next - days`. Hide the card if `next - days > 30`.

**Done when:** ring renders at higher visual weight, halo is subtle (not glowing AI-slop), milestone strip appears within 30 days of a milestone and never otherwise.

---

### 11 · Mood scale + history
**Mockup:** `refinements.jsx → MoodScaleScreen`
**Files to edit:** `src/components/current/MoodCheckin.jsx` (replace), add `MoodHistory.jsx`.

**Changes.**
- Replace 3 pill buttons with a **horizontal 5-stop scale** (0 = struggling, 4 = good). Each stop is a 10px dot on a hairline track. The active stop becomes a 26px filled circle with a 4px accent-bg ring. Track to the *left* of the active stop is filled accent.
- Track labels at the ends: `struggling` · `steady` · `good` (10px, muted).
- Above the scale, a single Playfair line that reflects the choice: `Struggling, today.` / `Getting by, today.` / `Steady, today.` / `Decent, today.` / `Good, today.` (28px, centered).
- Below the scale, a Playfair italic response line ("That's worth something." / "You're showing up. That counts." / etc.) — same response system as today, mapped to 5 stops instead of 3.
- **Below the response,** a small `MoodHistory` waveform card showing the last 7 days as a smooth interpolated line (cubic bezier between points). Final point gets a glowing 4px dot in `#a8c5d8`. Beneath: one-liner that describes the shape ("Mostly steady. One harder Tuesday.") — generate from value variance.

**Persistence.** Replace `sessionStorage.mood_checkin_*` with `MoodLog` reads + writes. On select → `MoodLog.upsert({ user_email, date: today_local, value })`. On reload, populate the scale from today's existing log.

**Bare mode.** The component currently supports a `bare` prop for guest mode. Preserve it — just render the same scale without the surrounding card.

**Done when:** a user can drag (or tap) the scale to pick a mood, see the response line + waveform update, and the value persists across reloads in Base44.

---

### 12 · Spots v2 — photo + map
**Mockup:** `refinements.jsx → SpotsV2Screen`
**Files to edit:** `src/pages/NearMe.jsx`, `src/components/current/PlaceCard.jsx`.

**Changes.**
1. **Tab toggle** (top right of the "Spots" header): segmented control between **List** and **Map**, pill-styled. Use the existing pill chip pattern. Active background `var(--t-accent)`, text `var(--t-bg)`.
2. **PlaceCard rework** — make it horizontal:
   - Left: 80×80 photo at 8px radius. If `photo_url` exists, render it. Otherwise the placeholder gradient (`linear-gradient(135deg, hsl(H,18%,22%), hsl(H,22%,32%))` where `H` is a deterministic hue from the place name) with a tiny monospace `PHOTO` label at 8px in the top-left.
   - Right: title (14px medium) with **open/closed badge** in the same row (9.5px tracking-wide pill — `OPEN` if `_isOpen` else `CLOSED`, accent vs muted), neighborhood line, bottom row with one tag pill + right-aligned distance.
3. **Map view** — new `<SpotsMapView/>`. v1 can be a stylized SVG/CSS map (no real tiles) with absolutely positioned pins colored by category. v2 swap to MapKit (Apple) via Capacitor or Mapbox GL JS depending on stack preference. Tapping a pin pops a small `<PlaceCard/>` floater at the top.
4. **Add `Tonight` chip** to the filter row — filters to "open after 8pm tonight."
5. **`Places` entity migration** — add `photo_url`, `photo_credit`. The Admin page should accept image upload for these.

**Done when:** list view shows real photos for places that have one and a deterministic gradient otherwise; map view renders at least mocked pins for NYC; switching cities (NYC/LA) updates both views.

---

## Cross-cutting work

### Routing
`pages.config.js` auto-registers pages — just drop your new `.jsx` file under `src/pages/` and it appears. No imports to add.

### Header
`GlobalHeader.jsx` already handles "back" automatically for non-root paths. New pages get this for free.

### Bottom nav
Currently 3 tabs (Today, Spots, You). If you add **Anchor** as a 4th tab (feature 01), set the icon to `Anchor` from lucide-react. Update the existing `tabs` array in `BottomNav.jsx`.

### Theme
All color decisions must reference `var(--t-*)` so light/dark/quiet variants work automatically. Don't hard-code `#161b24` or `#f5f4ef` — those move when the theme changes.

### Pull-to-refresh
Wrap new top-level pages in `<PullToRefresh onRefresh={loadFn}>` like the existing pages do.

### Auth & guest mode
Many pages handle guest mode by setting `isGuest = true` and rendering a stripped-down version. **Anchor, Reflection, Letters, Budget, and Mocktails** should follow the same pattern — show the surface to guests but disable persistence; nudge to sign in only when they try to save.

### Haptics
Anything that's emotionally meaningful (mood choice, reflection save, anchor open, pause begin) gets a `hapticLight()` or `hapticMedium()`. Cosmetic taps (filter chips) don't need haptics.

### Biometrics
- "What brought me here" already uses biometrics to unlock the note. Reflection thread history (feature 02, optional v2) should match.

### Capacitor specifics
- `sms:` deep-links work on iOS via `window.location.href = 'sms:+15551234567'`.
- Local notifications via `@capacitor/local-notifications` — `lib/notifications.js` already wraps it.

---

## Acceptance criteria (for the full pack)

A reviewer should be able to:
1. Open the app on iOS (`npm run dev` + Capacitor preview) and see Home v2's tighter rhythm + new entry points.
2. Tap the new Anchor chip; see a calm full-screen breath surface; tap "Text Mom"; iOS Messages opens with the saved number prefilled.
3. At 9pm, get a local notification "One word, one tap, then sleep."; tap it; complete a reflection; refresh and see it in their thread.
4. View Profile → Presence Map; see a heat grid that reflects their actual activity dates.
5. Profile → Journey → "Pause for a while" → choose "Three days" → ring freezes for 3 days, then resumes.
6. Letters tab shows today's anonymous letter; new letter tomorrow; can compose and submit one of their own.
7. Mocktails page lets them filter and tap a bar order to copy a script.
8. Sober Budget shows a filling jar with a real goal label.
9. Between 10pm and 6am, Home becomes Quiet Hours automatically; toggle in Profile turns it off.
10. Mood check-in is a 5-stop scale + 7-day waveform; value persists across reloads.
11. Spots has List/Map tabs; cards have photos (or deterministic gradient placeholders) and open/closed badges.

---

## Files in this bundle

```
design_handoff_current/
├── README.md                          ← this file
└── design-canvas/
    ├── Current — Feature Explorations.html   ← open this in a browser
    ├── design-canvas.jsx               ← canvas helper (not for production)
    ├── ios-frame.jsx                   ← iOS bezel helper (not for production)
    └── mockups/
        ├── shared.jsx                  ← tokens, icons, Screen shell
        ├── features.jsx                ← 01–08 mockups
        └── refinements.jsx             ← 09–12 mockups
```

Open the HTML file in any modern browser. Click any phone to focus it; use ← / → to step between artboards; Esc to return to the canvas.

---

## Implementation order — suggested

If you can only do 3, do **Pause (04) → Anchor (01) → Streak Ring v2 (10)**. They have the largest ratio of user value per line of code and they each unlock or improve a surface the user sees every day.

If you can do 6:
1. Pause (04) — humane fix, single drawer
2. Anchor (01) — acute use case, mostly new files
3. Streak Ring v2 (10) — quality bump everyone sees
4. Mood scale + history (11) — replaces a weak surface with a strong one and unlocks Presence Map
5. Evening Reflection (02) — quietly retentive
6. Home v2 (09) — pulls 01 + 02 + 10 into a coherent screen

Quiet Hours and Letters are the most adventurous; ship them once you've nailed the basics.

---

## Tone & copy rules (read once, internalize)

- **Never** say "sober," "alcoholic," "recovery," "addiction," "AA," "12-step," "sponsor," "program." Use "here," "this," "your days," "your number," "exploring," "tracking," "your person."
- Lead with verbs of presence: "stay," "show up," "notice," "hold," "wait," "breathe."
- **Lowercase** the word `current` everywhere (it's set in Playfair, accent color, in the header and on milestone cards).
- Numbers are nouns: "365 choices," "228 clear days," "a week."
- Italicize for warmth, never for emphasis.
- A blank day is a fine day. Never call it a "miss" or "gap."

---

End of handoff. If you have any questions about a specific spec, open the corresponding mockup file in `design-canvas/mockups/` and inspect the JSX — every visual decision is captured there.
