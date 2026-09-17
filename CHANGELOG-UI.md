# UI Amplification Changelog

This document summarizes the comprehensive frontend and design overhaul completed for the Agentathon platform.

---

## 1. Explicit Backend Immutability Confirmation
**CONFIRMED**: Zero backend files were modified or touched.
- `supabase/` directory: 0 changes
- `src/lib/supabase/` directory: 0 changes
- `src/lib/auth.ts`, `src/lib/deadlines.ts`, `src/lib/validation.ts`: 0 changes
- `src/middleware.ts`: 0 changes
- Server actions (`src/app/**/actions.ts`): 0 changes (signatures, exports, logic intact)
- Form inputs: 100% identical `name` attributes preserved across all forms
- Route paths and redirect targets: 100% preserved
- No unauthorized external packages added (only `lucide-react` added as explicitly permitted)

---

## 2. Design Tokens & Styling (`globals.css`)
Introduced a developer-tool SaaS design system with dark-mode-first tokens:
- **Surface & Background**:
  - `--background`: `#09090b` (deep neutral dark)
  - `--surface`: `#111114` (sleek component background)
  - `--surface-hover`: `#18181d`
  - `--surface-elevated`: `#1f1f26`
- **Hairline Borders**:
  - `--border`: `#27272e` (1px subtle border)
  - `--border-subtle`: `#1e1e24`
  - `--border-strong`: `#3f3f4a`
- **Color Accents & System States**:
  - `--accent`: vibrant lime `#84cc16` / `#a3e635`
  - `--accent-hover`: `#bef264`
  - `--accent-muted`: `rgba(132, 204, 22, 0.12)`
  - `--success`: `#22c55e`
  - `--warning`: `#f59e0b`
  - `--danger`: `#ef4444`
  - `--info`: `#38bdf8`
- **Typography & Details**:
  - Geist Sans and Geist Mono font integration
  - Custom sleek scrollbars
  - High-contrast accessible focus-visible rings (`focus-visible:ring-2 focus-visible:ring-accent`)
  - Ambient radial background glow utilities

---

## 3. New Design System Components Added (`src/components/ui/` & `src/components/`)
1. **`Button` (`src/components/ui/button.tsx`)**:
   - Variants: `primary`, `secondary`, `ghost`, `destructive`, `outline`
   - Sizes: `sm`, `md`, `lg`, `icon`
   - Integrated loading spinner, disabled states, icon slot, Next.js link support
2. **`Card` family (`src/components/ui/card.tsx`)**:
   - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
   - Rounded-xl, hairline borders, responsive padding, optional hover effects
3. **Form controls (`src/components/ui/input.tsx`, `textarea.tsx`, `select.tsx`)**:
   - `Input`, `Textarea`, `Select`, `Label`, `FieldError`, `FormRow`
   - Accessible ARIA labels, live error announcements, Lucide icon prefixes
4. **`Badge` (`src/components/ui/badge.tsx`)**:
   - Variants: `neutral`, `info`, `success`, `warning`, `danger`, `accent` with optional pulsating live dots
5. **`StatusPill` (`src/components/ui/status-pill.tsx`)**:
   - Distinctive pills for review lifecycle states: `Open`, `Locked`, `Submitted`, `Scored`, `Not open`, `Not submitted`
6. **`Countdown` (`src/components/ui/countdown.tsx`)**:
   - Live client-side timer ticking down to any ISO deadline (`Xd Xh Xm Xs`), urgent warnings, and lock state display
7. **`Dialog` (`src/components/ui/dialog.tsx`)**:
   - Accessible headless modal dialog with focus trapping, backdrop blur, and Escape key dismissal
8. **`Toast` (`src/components/ui/toast.tsx`)**:
   - Accessible floating feedback notification with `role="status"` and `aria-live="polite"`
9. **`EmptyState` (`src/components/ui/empty-state.tsx`)**:
   - Polished empty state with dashed boundary, icon plate, title, description, and action button
10. **`Skeleton` (`src/components/ui/skeleton.tsx`) & `Divider` (`src/components/ui/divider.tsx`)**:
    - Shimmer loading placeholders and labeled dividers
11. **`AppShell` (`src/components/app-shell.tsx`)**:
    - Global responsive shell featuring brand glyph, current user email chip, role badge (`Participant` / `Admin`), sign out action, and subnav slot

---

## 4. Files Changed & Page Upgrades
- **Landing (`src/app/(public)/page.tsx` & `layout.tsx`)**:
  - Complete SaaS product hero with pitch, product badge, and two primary CTAs
  - 3-step "How It Works" visual evaluation timeline
  - Feature highlights grid (strict deadlines, signed downloads, multi-track, CSV export)
  - Ambient radial background glow and active system status indicator
- **Sign In (`src/app/(public)/login/page.tsx` & `login-form.tsx`)**:
  - Two-column showcase layout: Left panel presents competition specs, strict deadline cutoffs, and private storage features; Right panel hosts the elevated auth card
  - Segmented switcher tabs (`Sign In` | `Register Team`) for zero-friction switching
  - Password show/hide toggle (Eye / EyeOff)
  - Visual field icons, loading button with spinner, inline error feedback
  - Preserved exact field names: `email`, `password`
- **Registration (`src/app/(public)/register/page.tsx` & `register-form.tsx`)**:
  - Two-column guide layout: Left panel presents team size rules (1–10 members), track specialization notes, and workspace unlock rules
  - Segmented switcher tabs (`Sign In` | `Register Team`)
  - Interactive track preview card displaying track description as soon as user selects a track from the dropdown
  - Roster management with dedicated "Team Lead" badge on Member #1, individual "Remove" buttons, and an "+ Add Another Member" button
  - Password visibility toggle with live requirement indicator (`✓ Minimum 8 characters`)
  - Preserved exact field names: `team_name`, `track_id`, `member_count`, `member_names`, `contact_email`, `contact_phone`, `password`
- **Participant Dashboard (`src/app/dashboard/page.tsx`, `review-slot.tsx`, `review-slots.tsx`, `layout.tsx`)**:
  - Top hero banner with team name, track pill, contact details, member roster chips
  - Prominent checkpoint cards (R1, R2, R3) with live `Countdown`, `StatusPill`, uploaded deck chips, and dropzone file upload
  - Direct repository & live demo link chips with external launch icons
  - Visual lock state indicator when review deadline has elapsed
  - Assigned track overview card and all-tracks explorer
- **Admin Portal (`src/app/admin/*`)**:
  - **Header & Navigation (`admin-nav.tsx`, `layout.tsx`)**: Horizontal tab bar with icons and animated active indicator
  - **Overview (`page.tsx`)**: Command center overview cards with direct routing to sections
  - **Tracks (`tracks/page.tsx`, `new-track-form.tsx`, `track-row.tsx`)**: Track counter, modal Dialog creation, modal Dialog editing, and delete confirmation
  - **Settings (`settings/page.tsx`, `registration-toggle.tsx`, `review-deadlines.tsx`)**: Visual cohort registration gate toggle and 3 responsive datetime-local deadline cards
  - **Teams (`teams/page.tsx`, `score-form.tsx`, `download-ppt-button.tsx`)**: Dense table with expandable team details, per-review submission breakdown, signed PPT download button, and numerical scoring form (/10) with judge remarks
  - **Leaderboard (`leaderboard/page.tsx`, `export-csv-button.tsx`)**: Official live standings with podium rank medals (Gold, Silver, Bronze), per-checkpoint score chips, total score /30, and CSV export
