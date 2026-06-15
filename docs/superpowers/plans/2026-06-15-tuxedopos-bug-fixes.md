# TuxedoPOS Bug Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 7 reported defects in TuxedoPOS covering theme flash, revenue sum, date-driven widgets, server-side time authority, stock health labels, icon semantics, and mobile responsiveness.

**Architecture:** Backend fixes go through NestJS controllers/services; frontend fixes touch React Query hooks, a new ThemeContext, and Tailwind responsive classes. Each task is self-contained — tasks can be done in any order except Task 4 (server time) must precede Task 3b (date context wiring) for end-to-end correctness, though Task 3 is independently testable.

**Tech Stack:** NestJS (backend), React 19 + React Query, Tailwind CSS v4, Drizzle ORM, TypeScript

---

## File Map

| File | Changed by task |
|---|---|
| `frontend/index.html` | Task 1 |
| `frontend/src/components/organisms/sidebar/Sidebar.tsx` | Task 1 |
| `backend/src/orders/orders.service.ts` | Task 2, Task 3 |
| `backend/src/orders/orders.controller.ts` | Task 3 |
| `frontend/src/lib/queries.ts` | Task 3, Task 4 |
| `frontend/src/pages/dashboard/index.tsx` | Task 3, Task 4, Task 6, Task 7 |
| `backend/src/dashboard/dashboard.controller.ts` | Task 4 |
| `backend/src/dashboard/dashboard.module.ts` | Task 4 |
| `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx` | Task 5 |
| `frontend/src/index.css` | Task 7 |

---

## Task 1: Fix Theme Flash / Inconsistency

**Root cause:** Theme class (`dark`) is applied to `document.documentElement` inside a `useEffect` in `Sidebar.tsx`. `useEffect` fires *after* paint, causing a flash of the wrong theme on every page load. Additionally, if the system OS is in dark mode but the user saved `light` in localStorage, the initial render uses system dark mode styles before the effect overrides it.

**Files:**
- Modify: `frontend/index.html` (add blocking script before `<body>`)
- Modify: `frontend/src/components/organisms/sidebar/Sidebar.tsx:71-79`

- [ ] **Step 1: Add a blocking theme-init script to `index.html`**

  Insert this script block into `frontend/index.html`, right before `</head>`. It runs synchronously before any paint, so the `dark` class is applied before React hydrates.

  ```html
  <!-- Theme initialization — must run synchronously before first paint -->
  <script>
    (function() {
      var saved = localStorage.getItem('theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
  ```

  Place it just before the closing `</head>` tag in `frontend/index.html`, after the existing scripts but before `<body>`.

- [ ] **Step 2: Change `useEffect` to `useLayoutEffect` in Sidebar.tsx**

  In `frontend/src/components/organisms/sidebar/Sidebar.tsx`, change line 71 from:
  ```ts
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  ```
  To:
  ```ts
  useLayoutEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);
  ```
  Add `useLayoutEffect` to the React import at line 1:
  ```ts
  import React, { useState, useEffect, useLayoutEffect } from 'react';
  ```

- [ ] **Step 3: Verify fix manually**

  1. Set localStorage `theme` to `'light'` in browser DevTools: `localStorage.setItem('theme', 'light')`
  2. Hard-reload the page (`Cmd+Shift+R`)
  3. Confirm no dark flash occurs on load
  4. Toggle theme via user menu → confirm it switches and persists across reloads

- [ ] **Step 4: Commit**

  ```bash
  git add frontend/index.html frontend/src/components/organisms/sidebar/Sidebar.tsx
  git commit -m "fix(theme): prevent flash by applying dark class synchronously before paint"
  ```

---

## Task 2: Fix Today's Revenue Sum (getDailySummary)

**Root cause:** In `orders.service.ts:118`, `o.createdAt.toISOString()` assumes `o.createdAt` is a `Date` object. Drizzle ORM may return it as a string from PostgreSQL/SQLite. Calling `.toISOString()` on a string throws `TypeError`, which causes the filter to throw and `dayOrders` to be empty or only partially populated — resulting in an incorrect revenue total.

**Files:**
- Modify: `backend/src/orders/orders.service.ts:118`

- [ ] **Step 1: Fix the date comparison in `getDailySummary`**

  In `backend/src/orders/orders.service.ts`, change line 118 from:
  ```ts
  const dayOrders = all.filter(o => o.createdAt.toISOString().split('T')[0] === date);
  ```
  To:
  ```ts
  const dayOrders = all.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === date);
  ```
  `new Date(value)` safely handles both `Date` objects and ISO strings.

- [ ] **Step 2: Verify fix**

  Run the backend in dev mode and call the endpoint directly (replacing YOUR_JWT and DATE):
  ```bash
  curl -H "Authorization: Bearer YOUR_JWT" \
    "http://localhost:3000/api/v1/orders/summary?date=$(date +%Y-%m-%d)"
  ```
  Expected: `{ "revenue": <sum_of_all_today_completed_orders>, "count": <N>, ... }`
  Confirm `revenue` equals the sum of all completed orders for the day, not just one.

- [ ] **Step 3: Commit**

  ```bash
  git add backend/src/orders/orders.service.ts
  git commit -m "fix(orders): handle string createdAt when filtering daily revenue summary"
  ```

---

## Task 3: Fix Recent Orders — Date Context

**Root cause:** `useRecentOrders` calls `GET /orders/recent?limit=5` which returns the 5 most recent orders globally (no date filter). When the dashboard's date context changes (or is manipulated), the Recent Orders list does not update because there is no `date` parameter.

**Files:**
- Modify: `backend/src/orders/orders.service.ts:127-145` (add `date` param)
- Modify: `backend/src/orders/orders.controller.ts:21-23` (pass `date` to service)
- Modify: `frontend/src/lib/queries.ts:282-288` (add `date` param to hook)
- Modify: `frontend/src/pages/dashboard/index.tsx:40,150` (pass `todayStr`)

- [ ] **Step 1: Update `findRecent` service to accept an optional `date` parameter**

  In `backend/src/orders/orders.service.ts`, modify the `findRecent` method signature and add date filtering. Replace lines 127-145:

  ```ts
  async findRecent(tenantId: string, limit = 5, date?: string): Promise<Order[]> {
    const res = await db.select({
      order: orders,
      customer: {
        firstName: customers.firstName,
        lastName: customers.lastName,
      }
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.tenantId, tenantId))
    .orderBy(desc(orders.createdAt))
    .limit(date ? 200 : limit); // fetch more when filtering by date

    const mapped = res.map(row => ({
      ...row.order,
      customerName: row.customer?.firstName
        ? `${row.customer.firstName} ${row.customer.lastName || ''}`.trim()
        : 'Guest'
    })) as any[];

    if (!date) return mapped.slice(0, limit);

    return mapped
      .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === date)
      .slice(0, limit);
  }
  ```

- [ ] **Step 2: Pass `date` query param through in the controller**

  In `backend/src/orders/orders.controller.ts`, update lines 21-23:
  ```ts
  @Get('recent')
  findRecent(
    @Request() req: any,
    @Query('limit') limit = '5',
    @Query('date') date?: string,
  ) {
    return this.svc.findRecent(req.user.tenantId, +limit, date);
  }
  ```

- [ ] **Step 3: Update the React Query hook to accept and pass `date`**

  In `frontend/src/lib/queries.ts`, replace lines 282-288:
  ```ts
  export const useRecentOrders = (limit = 5, date?: string) =>
    useQuery({
      queryKey: QK.recentOrders(limit, date),
      queryFn:  () => apiClient.get<Order[]>(
        `/orders/recent?limit=${limit}${date ? `&date=${date}` : ''}`
      ),
      staleTime: 30 * 1000,
      refetchInterval: 60 * 1000,
    });
  ```

  Also update the `QK.recentOrders` key to accept `date`:
  ```ts
  recentOrders: (limit?: number, date?: string) => ['orders', 'recent', limit, date] as const,
  ```

- [ ] **Step 4: Pass `todayStr` to `useRecentOrders` in the Dashboard**

  In `frontend/src/pages/dashboard/index.tsx`, change line 40:
  ```ts
  const { data: recentOrders = [] } = useRecentOrders(5, todayStr);
  ```

- [ ] **Step 5: Verify fix**

  1. Open the dashboard — recent orders should show today's orders.
  2. Open DevTools and set `localStorage` to a date with no orders (e.g., `2020-01-01`) and hard-reload.
  3. The Recent Orders list should be empty (since server time isn't wired yet, this tests the date filter).

- [ ] **Step 6: Commit**

  ```bash
  git add backend/src/orders/orders.service.ts \
           backend/src/orders/orders.controller.ts \
           frontend/src/lib/queries.ts \
           frontend/src/pages/dashboard/index.tsx
  git commit -m "fix(dashboard): filter recent orders by active date context"
  ```

---

## Task 4: Server-Authoritative Timestamp

**Root cause:** `todayStr` in the dashboard is computed from `new Date()` (client clock). Changing the OS clock lets a user manipulate the date used for all revenue and order queries. The server's own clock is authoritative.

**Files:**
- Modify: `backend/src/dashboard/dashboard.controller.ts` (add `GET /dashboard/time`)
- Modify: `backend/src/dashboard/dashboard.module.ts` (no change needed if controller is already registered)
- Modify: `frontend/src/lib/queries.ts` (add `useServerTime` hook)
- Modify: `frontend/src/pages/dashboard/index.tsx:22-26,51` (use server date)

- [ ] **Step 1: Add `GET /dashboard/time` endpoint**

  In `backend/src/dashboard/dashboard.controller.ts`, add the following route. Read the current file first to see existing routes, then append:
  ```ts
  @Get('time')
  getServerTime() {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
    };
  }
  ```
  This endpoint is protected by the existing `@UseGuards(JwtAuthGuard)` at the controller level, so no extra auth is needed.

- [ ] **Step 2: Add `useServerTime` query hook**

  In `frontend/src/lib/queries.ts`, add to the `QK` object:
  ```ts
  serverTime: () => ['server-time'] as const,
  ```

  Then append this hook at the end of the file:
  ```ts
  export const useServerTime = () =>
    useQuery({
      queryKey: QK.serverTime(),
      queryFn:  () => apiClient.get<{ timestamp: string; date: string }>('/dashboard/time'),
      staleTime: 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    });
  ```

- [ ] **Step 3: Use server date in dashboard**

  In `frontend/src/pages/dashboard/index.tsx`, replace lines 22-26:

  ```ts
  const { data: serverTime } = useServerTime();
  const now = serverTime ? new Date(serverTime.timestamp) : new Date();
  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';
  const todayStr = serverTime?.date ?? new Date().toISOString().split('T')[0];
  ```

  Add `useServerTime` to the import on line 7:
  ```ts
  import { useDashboardAlerts, useRecentOrders, useUpcomingRentals, useAppointmentCount, useSettings, useRevenueReport, useServerTime } from '../../lib/queries';
  ```

  Also update the subtitle on line 51 to use server time:
  ```ts
  subtitle: `${settings?.name || 'TuxedoPOS'} · ${now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`,
  ```

- [ ] **Step 4: Verify fix**

  1. Change your OS clock to a different date.
  2. Reload the dashboard.
  3. Confirm "Today's Revenue" and "Recent Orders" still reflect the server's actual current date, not the manipulated OS date.

- [ ] **Step 5: Commit**

  ```bash
  git add backend/src/dashboard/dashboard.controller.ts \
           frontend/src/lib/queries.ts \
           frontend/src/pages/dashboard/index.tsx
  git commit -m "fix(dashboard): use server-authoritative timestamp for date-driven metrics"
  ```

---

## Task 5: Fix Stock Health Widget Labels

**Root cause:** In `PredictiveAnalytics.tsx`, the `risk` variable uses the values `'low'`, `'medium'`, `'high'` to represent *stockout risk* (i.e., `'low'` risk = healthy inventory). However, the badge renders `{p.risk} stock`, so `risk = 'low'` produces the badge text **"low stock"** — which is the opposite of the intent. An item at 90% capacity (ratio = 0.9) gets `risk = 'low'` and a "low stock" badge in green, which is nonsensical.

**Files:**
- Modify: `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx:65-70`

- [ ] **Step 1: Replace badge text with a proper label map**

  In `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx`, replace lines 65-70:

  ```tsx
  <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
    p.risk === 'high' ? 'bg-status-error/10 text-status-error' :
    p.risk === 'medium' ? 'bg-status-warning/10 text-status-warning' :
    'bg-status-success/10 text-status-success'
  }`}>
    {p.risk === 'high' ? 'Low Stock' : p.risk === 'medium' ? 'Moderate' : 'In Stock'}
  </span>
  ```

  The colour coding already correctly uses red/amber/green. Only the text label needed fixing.

- [ ] **Step 2: Verify fix**

  Open the dashboard. Categories with > 60% availability should now show **"In Stock"** (green). Categories 30–60% show **"Moderate"** (amber). Categories below 30% show **"Low Stock"** (red).

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx
  git commit -m "fix(stock-health): correct inverted badge labels - high ratio is In Stock not Low Stock"
  ```

---

## Task 6: Fix Active Rentals Icon

**Root cause:** The `rental` SVG icon in the sprite (`public/sprites/app-icons.svg`) renders as a heart-like shape, which carries the semantic meaning of "favourites/likes" — not active rental transactions. The `tuxedo` icon is more contextually appropriate for a formal-wear rental business.

**Files:**
- Modify: `frontend/src/pages/dashboard/index.tsx:85`

- [ ] **Step 1: Change the Active Rentals stat card icon**

  In `frontend/src/pages/dashboard/index.tsx`, change line 85 from:
  ```ts
  { label: 'Active Rentals', value: `${rentalStats?.out ?? 0}`, change: '', positive: true, icon: 'rental', color: 'var(--tux-gold)', sparkData: Array.from({ length: 7 }, () => rentalStats?.out ?? 0) },
  ```
  To:
  ```ts
  { label: 'Active Rentals', value: `${rentalStats?.out ?? 0}`, change: '', positive: true, icon: 'tuxedo', color: 'var(--tux-gold)', sparkData: Array.from({ length: 7 }, () => rentalStats?.out ?? 0) },
  ```

- [ ] **Step 2: Verify fix**

  Reload the dashboard. The "Active Rentals" KPI card should now show a tuxedo icon instead of the heart shape.

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/pages/dashboard/index.tsx
  git commit -m "fix(ui): replace heart icon with tuxedo icon on Active Rentals KPI card"
  ```

---

## Task 7: Mobile Responsiveness

**Root cause:** The dashboard uses fixed grid layouts (`grid-cols-[1fr_340px]`, `grid-cols-4`) with no responsive prefixes. The sidebar is `position: fixed` with no mobile drawer/overlay behaviour. The result is a broken desktop layout forced onto small screens.

**Files:**
- Modify: `frontend/src/pages/dashboard/index.tsx:72-79,108,149`
- Modify: `frontend/src/index.css` (sidebar mobile styles)
- Modify: `frontend/src/components/organisms/sidebar/Sidebar.tsx` (hamburger trigger for mobile)

### 7a: Dashboard grid breakpoints

- [ ] **Step 1: Make the main two-column grid responsive**

  In `frontend/src/pages/dashboard/index.tsx`, change line 149 from:
  ```tsx
  <div className="grid grid-cols-[1fr_340px] gap-5 items-start">
  ```
  To:
  ```tsx
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
  ```

- [ ] **Step 2: Make the skeleton loading grid responsive**

  In `frontend/src/pages/dashboard/index.tsx`, change line 69 from:
  ```tsx
  <div className="mt-4 grid grid-cols-4 gap-4 mb-8">
  ```
  To:
  ```tsx
  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  ```

  And change line 72 from:
  ```tsx
  <div className="grid grid-cols-[1fr_340px] gap-5">
  ```
  To:
  ```tsx
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
  ```

### 7b: Sidebar mobile drawer

- [ ] **Step 3: Add mobile state and overlay to `Sidebar.tsx`**

  In `frontend/src/components/organisms/sidebar/Sidebar.tsx`, add a `isMobileOpen` state after existing state declarations (after line 62):

  ```ts
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  ```

  Wrap the existing `<nav>` with an overlay div and add mobile classes. Replace lines 119-124:

  ```tsx
  {/* Mobile overlay */}
  {isMobileOpen && (
    <div
      className="fixed inset-0 bg-black/40 z-40 lg:hidden"
      onClick={() => { setIsMobileOpen(false); }}
    />
  )}

  <nav
    className={`sidebar fixed left-0 top-0 bottom-0 z-50 transition-[width,transform] duration-200 ease-in-out
      ${isEffectivelyExpanded ? 'w-[260px]' : 'w-[68px]'}
      ${(collapsed && isEffectivelyExpanded) ? 'shadow-[4px_0_24px_rgba(0,0,0,0.2)]' : 'shadow-none'}
      lg:translate-x-0
      ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    aria-label="Main navigation"
    onMouseEnter={isPointerFine ? () => { setIsHovered(true); } : undefined}
    onMouseLeave={isPointerFine ? () => { setIsHovered(false); } : undefined}
  >
  ```

- [ ] **Step 4: Add mobile hamburger button to the dashboard header area**

  In `frontend/src/pages/dashboard/index.tsx`, the `actions` JSX (lines 53-63) is displayed in the page header. Add a mobile menu trigger by exporting `setIsMobileOpen` via context — but since Sidebar owns that state, the simpler approach is to add a separate `MobileMenuButton` component that dispatches a custom event.

  Add a `mobile-menu-open` custom event in `Sidebar.tsx` after the `isMobileOpen` state:
  ```ts
  useEffect(() => {
    const handler = () => { setIsMobileOpen(true); };
    window.addEventListener('mobile-menu-open', handler);
    return () => { window.removeEventListener('mobile-menu-open', handler); };
  }, []);
  ```

  In `frontend/src/pages/dashboard/index.tsx`, add a mobile hamburger button to the `actions` JSX (lines 53-63):
  ```tsx
  actions: (
    <div className="flex gap-3 items-center">
      <button
        className="btn btn-outline bg-[var(--surface-card)] border-[1.5px] lg:hidden"
        onClick={() => { window.dispatchEvent(new CustomEvent('mobile-menu-open')); }}
        aria-label="Open navigation"
      >
        <SvgIcon name="menu" width="20" height="20" />
      </button>
      <button className="btn btn-outline bg-[var(--surface-card)] border-[1.5px] hidden sm:flex" onClick={() => { navigate('/pos'); }}>
        <SvgIcon name="search" width="16" height="16" />
        Quick Search
      </button>
      <Link to="/pos" className="btn btn-gold py-3 px-6 shadow-gold">
        <SvgIcon name="pos" width="20" height="20" />
        <span className="hidden sm:inline">Open POS Terminal</span>
        <span className="sm:hidden">POS</span>
      </Link>
    </div>
  ),
  ```

### 7c: Sidebar spacer fix for mobile

- [ ] **Step 5: Hide the sidebar spacer on mobile**

  In `frontend/src/components/organisms/sidebar/Sidebar.tsx`, change line 117 from:
  ```tsx
  <div className={`shrink-0 transition-[width] duration-200 ease-in-out ${collapsed ? 'w-[68px]' : 'w-[260px]'}`} />
  ```
  To:
  ```tsx
  <div className={`hidden lg:block shrink-0 transition-[width] duration-200 ease-in-out ${collapsed ? 'w-[68px]' : 'w-[260px]'}`} />
  ```

- [ ] **Step 6: Verify responsiveness**

  1. Open the dashboard in Chrome DevTools with a 390px viewport (iPhone 14 simulation).
  2. Confirm the stat cards stack 2-per-row, then 1-per-row at very small widths.
  3. Confirm the main content fills full width (right sidebar stacks below).
  4. Tap the hamburger → sidebar slides in from left with overlay.
  5. Tap outside sidebar → it closes.

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/pages/dashboard/index.tsx \
           frontend/src/components/organisms/sidebar/Sidebar.tsx \
           frontend/src/index.css
  git commit -m "fix(mobile): add responsive breakpoints and mobile sidebar drawer to dashboard"
  ```

---

## Self-Review

### Spec Coverage Check

| Defect | Covered by task |
|---|---|
| Theme state inconsistency / dark flash | Task 1 ✅ |
| Mobile responsiveness | Task 7 ✅ |
| Today's Revenue KPI shows wrong sum | Task 2 ✅ |
| Recent Orders shows stale/undated data | Task 3 ✅ |
| Client clock manipulation | Task 4 ✅ |
| Stock Health — inverted low stock labels | Task 5 ✅ |
| Active Rentals — heart icon | Task 6 ✅ |

### Placeholder Scan

No TBDs or "implement later" entries. All code blocks are complete and runnable.

### Type Consistency

- `useRecentOrders(limit, date?)` — `date` param added to both the hook signature and `QK.recentOrders`. ✅
- `useServerTime()` — return type `{ timestamp: string; date: string }` used consistently in both hook and dashboard consumer. ✅
- `findRecent(tenantId, limit, date?)` — optional `date` appended to service method signature; controller passes it through. ✅
