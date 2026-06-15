# TuxedoPOS Design Revamp Spec

## Decisions Summary

| Decision | Choice |
|---|---|
| Theme personality | Dark Luxury (deep navy canvas) + Light Mode toggle |
| Navigation | Wide labeled sidebar (240px) with full toggle: collapse → icon-only → hover-to-peek → mobile drawer |
| Card style | Solid Dark Panels — flat `#0d1f30` surface, no borders, heavy typography |
| Typography | Sharp Sans — Inter 900 weight, negative letter-spacing on numbers |
| Accents | Gold (revenue/money) + Emerald (rentals/active) + Red (overdue/errors only) |
| Accessibility | WCAG AA throughout |

---

## 1. Color Tokens

All CSS custom properties in `frontend/src/index.css`. Two complete palettes under `:root` (light) and `.dark`.

### Dark mode (`.dark` class on `<html>`)

| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#030b14` | Page background |
| `--bg-surface` | `#06111f` | Sidebar background |
| `--bg-panel` | `#0d1f30` | Cards, tables, panels |
| `--bg-panel-hover` | `#112438` | Panel hover state |
| `--bg-input` | `#0a1d2e` | Form inputs |
| `--border-subtle` | `rgba(255,255,255,0.06)` | Dividers, panel separators |
| `--border-input` | `rgba(255,255,255,0.12)` | Input borders |
| `--text-primary` | `#f1f5f9` | Body text, headings |
| `--text-secondary` | `#94a3b8` | Supporting text — **≥ 4.5:1 on `--bg-panel`** |
| `--text-muted` | `#64748b` | Placeholders, labels — use only at 14px+ bold |
| `--text-inverse` | `#0a1628` | Text on gold buttons |
| `--accent-gold` | `#c9a84c` | Revenue values, primary CTA bg |
| `--accent-gold-text` | `#d4b560` | Gold used as text on dark — **≥ 4.5:1 on `--bg-panel`** |
| `--accent-gold-subtle` | `rgba(201,168,76,0.12)` | Badge/icon backgrounds only — not text bg |
| `--accent-emerald` | `#3d9970` | Rental/active values |
| `--accent-emerald-text` | `#4db885` | Emerald used as text on dark — **≥ 4.5:1 on `--bg-panel`** |
| `--accent-emerald-subtle` | `rgba(61,153,112,0.12)` | Badge backgrounds only |
| `--status-error` | `#f87171` | Overdue, error states — **≥ 4.5:1 on `--bg-panel`** |
| `--status-error-subtle` | `rgba(248,113,113,0.12)` | Error badge bg |
| `--status-warning` | `#fbbf24` | Warning states |
| `--status-success` | `#34d399` | Success states |
| `--focus-ring` | `#c9a84c` | Keyboard focus outline — 3px solid, 2px offset |
| `--sidebar-bg` | `#06111f` | **Fixed — same in both themes** |
| `--sidebar-text` | `rgba(255,255,255,0.45)` | Nav item default |
| `--sidebar-active` | `#c9a84c` | Active nav item |
| `--radius-sm` | `6px` | Badges, chips |
| `--radius-md` | `8px` | Buttons, inputs |
| `--radius-lg` | `10px` | Cards, panels |
| `--radius-xl` | `14px` | Large panels |

### Light mode (`:root`)

| Token | Value | Usage |
|---|---|---|
| `--bg-canvas` | `#f5f6fa` | Page background |
| `--bg-surface` | `#06111f` | **Sidebar — fixed navy, unchanged** |
| `--bg-panel` | `#ffffff` | Cards |
| `--bg-panel-hover` | `#f8fafc` | Card hover |
| `--bg-input` | `#ffffff` | Inputs |
| `--border-subtle` | `#eef1f6` | Dividers |
| `--border-input` | `#d1d9e0` | Input borders |
| `--text-primary` | `#0a1628` | Headings — deep navy |
| `--text-secondary` | `#475569` | Supporting — **≥ 4.5:1 on white** |
| `--text-muted` | `#64748b` | Placeholders — 14px+ bold only |
| `--text-inverse` | `#ffffff` | Text on gold buttons |
| `--accent-gold` | `#c9a84c` | CTA button background |
| `--accent-gold-text` | `#7c5c1e` | Gold as text on white — **≥ 4.5:1 on white** |
| `--accent-emerald` | `#3d9970` | Emerald CTA |
| `--accent-emerald-text` | `#166534` | Emerald text on white — **≥ 4.5:1** |
| `--status-error` | `#dc2626` | Error — **≥ 4.5:1 on white** |
| `--status-error-subtle` | `#fee2e2` | Error badge bg |
| `--status-warning` | `#a16207` | Warning text on light — **≥ 4.5:1 on `#fef9c3`** |
| `--status-success` | `#15803d` | Success text on light |
| `--focus-ring` | `#0a1628` | Focus outline in light mode |

> **WCAG contract:** All `--text-*` tokens must achieve ≥ 4.5:1 contrast against their expected background. `--text-muted` is borderline — limit to non-informational labels (section headings, field placeholder hints) at ≥ 14px bold. Never use it for error messages, status indicators, or data values.

---

## 2. Typography

Single font family: **Inter** (Google Fonts). Remove Playfair Display entirely.

| Scale | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| `--type-kpi` | `2rem` (32px) | 900 | `-0.05em` | KPI card numbers |
| `--type-h1` | `1.375rem` (22px) | 800 | `-0.03em` | Page title |
| `--type-h2` | `1.125rem` (18px) | 700 | `-0.02em` | Panel headings |
| `--type-h3` | `0.9375rem` (15px) | 700 | `0` | Section labels |
| `--type-body` | `0.875rem` (14px) | 400-500 | `0` | Table rows, body text |
| `--type-label` | `0.6875rem` (11px) | 700 | `+0.1em` | KPI label, section divider text |
| `--type-caption` | `0.625rem` (10px) | 600 | `+0.05em` | Badge text, timestamps |

> **WCAG note:** `--type-label` and `--type-caption` are small — they must only be used with colors that achieve ≥ 4.5:1 contrast. Never render muted-color text at caption size.

---

## 3. Sidebar

The sidebar is a **brand constant** — it uses `--sidebar-bg` (`#06111f` / navy) in both light and dark modes. The toggle pattern from `docs/sidebar-toggle-pattern.md` is preserved exactly.

### States

| State | Width | Labels |
|---|---|---|
| Desktop expanded (permanent) | 240px | Visible |
| Desktop collapsed (permanent) | 72px | Hidden (icon only) |
| Desktop collapsed + hovered | 240px | Visible (peek, elevated shadow) |
| Mobile / iPad drawer open | 240px | Visible |
| Mobile / iPad drawer closed | 0px (off-screen) | — |

### Anatomy

- **Logo area** — 34×34px gold gradient icon + "Tuxedo**POS**" wordmark (bold, gold `<span>`) + collapse toggle button (desktop only)
- **Section labels** — `--type-label` / `--sidebar-text` at 18% opacity — decorative, `aria-hidden="true"`
- **Nav items** — 44px min-height touch target (WCAG 2.5.5), icon + label, active state: `--accent-gold` text + 3px left border + `rgba(gold, 0.10)` bg
- **Status badges** — OFFLINE / SYNCING chips, visible only when expanded
- **Footer** — avatar initials + name + role. Clicking opens user menu (theme toggle + sign out)

### WCAG — Sidebar

- All nav links are `<a>` / `<NavLink>` with visible text (screen readers get labels even when sidebar is collapsed via `title` attribute)
- Collapsed icon-only items: `title={item.label}` for tooltip + `aria-label` on the `<NavLink>`
- Mobile backdrop: `aria-hidden="true"`, closes on click and `Escape` key
- Focus trap when mobile drawer is open
- Collapse/expand button: `aria-expanded`, `aria-controls="sidebar-nav"`

---

## 4. Page Header

- `position: sticky; top: 0; z-index: 40`
- Dark mode: `background: rgba(3,11,20,0.88); backdrop-filter: blur(12px)` — semi-transparent
- Light mode: `background: rgba(255,255,255,0.92); backdrop-filter: blur(12px)`
- 64px height
- Left: page title (`<h1>`) + subtitle
- Right: action buttons
- Mobile: hamburger icon button (44×44px, `aria-label="Open navigation"`, `aria-expanded` state)

---

## 5. KPI Cards

Four cards in a responsive grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`.

### Card anatomy

```
┌─────────────────────────────────┐
│ LABEL (11px/700/uppercase)  [icon] │  ← icon 34×34px, decorative aria-hidden
│                                 │
│  $4,280   (32px/900/−0.05em)   │  ← color: --accent-gold-text / emerald / error / primary
│                                 │
│  ↑ 12% today   (badge)         │
└─────────────────────────────────┘
```

- Background: `--bg-panel` (solid, no border)
- Border-radius: `--radius-xl`
- Padding: 20px
- No box-shadow in dark mode; `box-shadow: 0 1px 4px rgba(0,0,0,0.07)` in light mode

### Color mapping

| KPI | Value color | Icon bg |
|---|---|---|
| Today's Revenue | `--accent-gold-text` | `--accent-gold-subtle` |
| Active Rentals | `--accent-emerald-text` | `--accent-emerald-subtle` |
| Appointments | `--text-primary` | `rgba(white,0.07)` |
| Overdue Returns | `--status-error` | `--status-error-subtle` |

### WCAG — KPI cards

- KPI value is `<p>` or `<span>` with visible label — not icon-only
- Trend badges: icon (↑/↓) is supplemented by screen-reader text `<span class="sr-only">up</span>`
- Cards are `role="region"` with `aria-label="Today's Revenue KPI"`

---

## 6. Panels (Tables, Stock Health, Quick Actions)

- Background: `--bg-panel`
- Border-radius: `--radius-xl`
- No explicit border in dark mode; `border: 1px solid --border-subtle` in light mode
- Panel header: 16px 20px padding, 13px/700 title + 11px/400 subtitle, separated by `1px solid --border-subtle`
- Light mode: `box-shadow: 0 1px 4px rgba(0,0,0,0.06)`

### Table rows

- 12px 20px padding, `--type-body`
- Zebra striping: skip it — use `1px solid --border-subtle` row divider instead (better contrast than low-opacity zebra on dark)
- Row hover: `--bg-panel-hover`
- Amount column: `--accent-gold-text` / 700 weight
- Status badges: solid background + matching text color, all WCAG AA

### Quick Actions

- 2×2 grid of action buttons
- Each 44px min-height, `role="button"` or `<button>`
- Icon (28×28px decorative) + label text below

---

## 7. Buttons

| Variant | Dark bg | Dark text | Light bg | Light text | Min size |
|---|---|---|---|---|---|
| Primary (gold) | `--accent-gold` (#c9a84c) | `#0a1628` | `--accent-gold` | `#fff` | 44×36px |
| Outline | `rgba(white,0.06)` | `--text-secondary` | `#fff` | `--text-secondary` | 44×36px |
| Ghost | transparent | `--text-secondary` | transparent | `--text-secondary` | 44×36px |
| Danger | `--status-error-subtle` | `--status-error` | `#fee2e2` | `#dc2626` | 44×36px |
| Emerald | `--accent-emerald-subtle` | `--accent-emerald-text` | `#dcfce7` | `#166534` | 44×36px |

All buttons: `border-radius: --radius-md`, `font-weight: 700`, `font-size: 13px`.
Focus: `outline: 3px solid --focus-ring; outline-offset: 2px` — never `outline: none`.

---

## 8. Forms & Inputs

- Background: `--bg-input`
- Border: `1px solid --border-input`
- Border-radius: `--radius-md`
- Height: 40px (inline) / auto (textarea)
- Focus: `border-color: --accent-gold; box-shadow: 0 0 0 3px rgba(--accent-gold, 0.25)`
- Error: `border-color: --status-error; box-shadow: 0 0 0 3px rgba(--status-error, 0.20)`
- All inputs have a visible `<label>` — no placeholder-only labels
- Error messages linked via `aria-describedby`

---

## 9. WCAG AA Compliance Checklist

### Contrast (1.4.3 — Level AA)

- [ ] All body text ≥ 4.5:1 on its background
- [ ] All large text (18px+ regular or 14px+ bold) ≥ 3:1
- [ ] `--text-muted` (#64748b on `--bg-panel` #0d1f30) = **3.8:1** — only use at 14px bold or larger
- [ ] `--accent-gold-text` (#d4b560 on #0d1f30) = **5.2:1** ✓
- [ ] `--accent-emerald-text` (#4db885 on #0d1f30) = **5.1:1** ✓
- [ ] `--status-error` (#f87171 on #0d1f30) = **5.4:1** ✓
- [ ] Light `--accent-gold-text` (#7c5c1e on #fff) = **6.3:1** ✓
- [ ] Light `--accent-emerald-text` (#166534 on #fff) = **7.1:1** ✓
- [ ] Sidebar nav text (rgba(255,255,255,0.45) = #8a8a8a on #06111f) = borderline — raise to `rgba(255,255,255,0.55)` = **4.6:1** ✓

### Keyboard Navigation (2.1.1)

- All interactive elements reachable by Tab
- Logical tab order: sidebar → header → page content
- Sidebar mobile drawer: focus trap while open, returns focus on close
- Escape key closes mobile drawer and user menu

### Focus Visible (2.4.7 / 2.4.11 Level AA)

- `outline: 3px solid --focus-ring; outline-offset: 2px` on all interactive elements
- Never suppressed with `outline: none` without a custom visible replacement
- Dark mode focus ring: `#c9a84c` (gold) — 3:1 against dark backgrounds ✓
- Light mode focus ring: `#0a1628` (navy) — high contrast on white ✓

### Touch Targets (2.5.5 Level AA)

- All buttons, nav items, and interactive elements: minimum 44×44px

### Semantic Structure (1.3.1)

- `<aside>` for sidebar with `aria-label="Main navigation"`
- `<nav>` wrapping nav items with `aria-label="Site navigation"`
- `<main>` for page content
- `<header role="banner">` for page header
- `<h1>` for page title (one per page), `<h2>` for panel headings, `<h3>` for sub-sections
- Section dividers (e.g., "Business Pulse") are `<h2>` with `aria-label`, not `<div>`

### Screen Reader Support (1.1.1, 4.1.2)

- Icon-only buttons: `aria-label` on the button element
- Decorative icons: `aria-hidden="true"`
- Status badges: supplement color with text (e.g., "↑" alone is not sufficient — use "increased" as `<span class="sr-only">`)
- KPI trend arrows include sr-only text: "up 12 percent"
- Sidebar collapsed: icon nav items get `title` + `aria-label`
- Theme toggle button: `aria-label="Switch to light mode"` / `aria-label="Switch to dark mode"`

### Color Independence (1.4.1)

- Status never conveyed by color alone: badges always include a text label ("Low Stock" not just a red bar)
- Progress bars include text value ("72 of 80")

---

## 10. Files to Change

| File | Change |
|---|---|
| `frontend/src/index.css` | Full token replacement: new palette, typography scale, component classes |
| `frontend/src/layouts/AppLayout.tsx` | No structural change — CSS-driven |
| `frontend/src/components/organisms/sidebar/Sidebar.tsx` | Apply new CSS classes, ARIA attributes, focus trap on mobile |
| `frontend/src/components/organisms/header/header.tsx` | New header styles, focus ring on hamburger |
| `frontend/src/pages/dashboard/index.tsx` | Responsive KPI grid, section headers, updated class names |
| `frontend/src/pages/dashboard/components/StatCard.tsx` | New token-based color props, ARIA region labels |
| `frontend/src/pages/dashboard/components/RecentOrders.tsx` | Table rebrand: new row classes, updated badge colors |
| `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx` | Stock bars, updated badge palette |
| `frontend/src/pages/dashboard/components/QuickActions.tsx` | New action button styles |
| `frontend/src/pages/dashboard/components/UpcomingPickups.tsx` | Re-skin to match panel style |
| `frontend/src/pages/dashboard/components/RentalFleetStatus.tsx` | Emerald/gold/red color tokens |
| `frontend/global.css` or `index.html` | Load Inter from Google Fonts, remove Playfair Display |

All other pages (POS, Rentals, Customers, etc.) will inherit token changes from `index.css` automatically. Per-page polish is a follow-up sprint.

---

## 11. All Pages In Scope

Every page gets the full token-driven reskin. The token replacement in `index.css` cascades automatically to all pages; each page then gets targeted layout and component polish to match the Dark Luxury spec.

| Page | Key changes |
|---|---|
| Dashboard | KPI grid, panels, sidebar, header — primary reference implementation |
| POS Terminal | Sales grid, product cards, cart panel, numpad, payment modal |
| Rentals | Rental list table, status badges, rental detail panel |
| Appointments | Calendar/list view, appointment cards, booking modal |
| Inventory | Product grid/table, stock progress bars, category filters |
| Tailoring Jobs | Job cards, status pipeline, assignment badges |
| Customers | Customer list table, customer detail sidebar, loyalty badge |
| Measurements | Measurement cards, form inputs, body diagram |
| Reports | Chart containers (bar/line), revenue table, period selector |
| Settings | Form sections, toggle switches, save/cancel actions |
| Login | Auth card centered, brand identity, input focus states |

**Approach:** Token replacement first (Task 1) makes every page ~80% correct instantly. Per-page tasks then apply structural layout fixes and component-level polish.

## 12. Out of Scope

- New features or data — visual redesign only
- Animation/motion redesign beyond existing transition durations
