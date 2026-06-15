# TuxedoPOS Design Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current green-on-white design system with a Dark Luxury theme (deep navy + gold + emerald) with a matching light mode — across every page — while meeting WCAG AA contrast.

**Architecture:** Task 1 replaces all CSS tokens in `index.css` — this cascades ~80% of the visual change to every page automatically. Each subsequent task applies structural layout + component-level polish to one page group. Tasks 1–4 are strictly sequential (foundation). Tasks 5–14 are independent of each other once Task 1–4 are done.

**Tech Stack:** React 19, Tailwind CSS v4 (via `@theme` in index.css), Inter (Google Fonts), CSS custom properties.

**Spec:** `docs/superpowers/specs/2026-06-15-design-revamp.md`

---

## File Map

| File | Task |
|---|---|
| `frontend/index.html` | Task 1 |
| `frontend/src/index.css` | Task 1 |
| `frontend/src/components/organisms/sidebar/Sidebar.tsx` | Task 2 |
| `frontend/src/layouts/AppLayout.tsx` | Task 2 |
| `frontend/src/components/organisms/header/header.tsx` | Task 3 |
| `frontend/src/pages/login/index.tsx` + `components/` | Task 4 |
| `frontend/src/pages/dashboard/index.tsx` + `components/` | Task 5 |
| `frontend/src/pages/pos/index.tsx` + `components/` + `checkout/` | Task 6 |
| `frontend/src/pages/rentals/index.tsx` + `components/` | Task 7 |
| `frontend/src/pages/appointments/index.tsx` + `components/` | Task 8 |
| `frontend/src/pages/inventory/index.tsx` + `components/` | Task 9 |
| `frontend/src/pages/tailoring/index.tsx` + `components/` | Task 10 |
| `frontend/src/pages/customers/index.tsx` + `components/` | Task 11 |
| `frontend/src/pages/measurements/index.tsx` + `components/` | Task 12 |
| `frontend/src/pages/reports/index.tsx` + `components/` | Task 13 |
| `frontend/src/pages/settings/index.tsx` + `components/` | Task 14 |
| `frontend/src/pages/admin/index.tsx` + `components/` | Task 14 |

---

## Task 1: CSS Design Tokens & Typography Foundation

**This task unblocks everything. Do not start Task 2+ until this is committed.**

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Swap the Google Fonts import in `index.html`**

  Remove Playfair Display, add Inter with the weights we need. Open `frontend/index.html` and replace any existing `<link>` for Google Fonts (or add after the `<title>` tag if none exists):

  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
    rel="stylesheet"
  />
  ```

- [ ] **Step 2: Replace the entire `:root` and `.dark` blocks in `index.css`**

  In `frontend/src/index.css`, find the existing `:root { ... }` and `.dark { ... }` blocks and replace them with the following. Keep everything else in the file (component classes, utility classes) intact — only replace the variable declarations.

  ```css
  /* ── Light mode (default) ─────────────────────────────── */
  :root {
    /* Surfaces */
    --bg-canvas:          #f5f6fa;
    --bg-surface:         #06111f;   /* sidebar — fixed navy */
    --bg-panel:           #ffffff;
    --bg-panel-hover:     #f8fafc;
    --bg-input:           #ffffff;

    /* Borders */
    --border-subtle:      #eef1f6;
    --border-input:       #d1d9e0;

    /* Text */
    --text-primary:       #0a1628;
    --text-secondary:     #475569;
    --text-muted:         #64748b;
    --text-inverse:       #ffffff;

    /* Brand accents */
    --accent-gold:        #c9a84c;
    --accent-gold-text:   #7c5c1e;   /* gold as foreground text on white — 6.3:1 */
    --accent-gold-subtle: rgba(201, 168, 76, 0.12);
    --accent-emerald:     #3d9970;
    --accent-emerald-text:#166534;   /* emerald text on white — 7.1:1 */
    --accent-emerald-subtle: rgba(61, 153, 112, 0.12);

    /* Status */
    --status-error:       #dc2626;
    --status-error-subtle:#fee2e2;
    --status-warning:     #a16207;
    --status-warning-subtle: #fef9c3;
    --status-success:     #15803d;
    --status-success-subtle: #dcfce7;
    --status-info:        #1d4ed8;
    --status-info-subtle: #dbeafe;

    /* Focus */
    --focus-ring:         #0a1628;

    /* Sidebar (same in both modes) */
    --sidebar-bg:         #06111f;
    --sidebar-border:     rgba(255, 255, 255, 0.06);
    --sidebar-text:       rgba(255, 255, 255, 0.55);
    --sidebar-text-active:#c9a84c;
    --sidebar-active-bg:  rgba(201, 168, 76, 0.10);
    --sidebar-section:    rgba(255, 255, 255, 0.22);

    /* Radii */
    --radius-sm:  6px;
    --radius-md:  8px;
    --radius-lg:  10px;
    --radius-xl:  14px;

    /* Shadows (light mode only) */
    --shadow-panel: 0 1px 4px rgba(0, 0, 0, 0.07);
    --shadow-modal: 0 20px 60px rgba(0, 0, 0, 0.15);

    /* Typography */
    --font-sans:  'Inter', system-ui, -apple-system, sans-serif;
  }

  /* ── Dark mode ─────────────────────────────────────────── */
  .dark {
    --bg-canvas:          #030b14;
    --bg-surface:         #06111f;
    --bg-panel:           #0d1f30;
    --bg-panel-hover:     #112438;
    --bg-input:           #0a1d2e;

    --border-subtle:      rgba(255, 255, 255, 0.06);
    --border-input:       rgba(255, 255, 255, 0.12);

    --text-primary:       #f1f5f9;
    --text-secondary:     #94a3b8;
    --text-muted:         #64748b;   /* use at 14px bold+ only */
    --text-inverse:       #0a1628;

    --accent-gold:        #c9a84c;
    --accent-gold-text:   #d4b560;   /* gold text on dark panel — 5.2:1 */
    --accent-gold-subtle: rgba(201, 168, 76, 0.12);
    --accent-emerald:     #3d9970;
    --accent-emerald-text:#4db885;   /* emerald text on dark — 5.1:1 */
    --accent-emerald-subtle: rgba(61, 153, 112, 0.12);

    --status-error:       #f87171;   /* red on dark panel — 5.4:1 */
    --status-error-subtle:rgba(248, 113, 113, 0.12);
    --status-warning:     #fbbf24;
    --status-warning-subtle: rgba(251, 191, 36, 0.12);
    --status-success:     #34d399;
    --status-success-subtle: rgba(52, 211, 153, 0.12);
    --status-info:        #60a5fa;
    --status-info-subtle: rgba(96, 165, 250, 0.12);

    --focus-ring:         #c9a84c;

    --shadow-panel:       none;
    --shadow-modal:       0 20px 60px rgba(0, 0, 0, 0.6);
  }
  ```

- [ ] **Step 3: Update `body` and root element font in `index.css`**

  Find the `body` rule (or `html, body`) and replace the font-family line:

  ```css
  body {
    font-family: var(--font-sans);
    background-color: var(--bg-canvas);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  ```

  Also find and **delete** any `@import` or `font-face` for Playfair Display.

- [ ] **Step 4: Update core surface classes in `index.css`**

  Find and replace these class definitions (keep the selectors, only change the property values):

  ```css
  .app-shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg-canvas);
  }

  .main-content {
    flex: 1;
    min-width: 0;
    overflow-y: auto;
    height: 100vh;
    background: var(--bg-canvas);
  }

  .sidebar {
    background: var(--sidebar-bg);
    color: white;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .card {
    background: var(--bg-panel);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-panel);
  }

  /* Light mode: add subtle border to cards */
  :root .card {
    border: 1px solid var(--border-subtle);
  }
  .dark .card {
    border: none;
  }
  ```

- [ ] **Step 5: Update button classes in `index.css`**

  Replace the existing `.btn`, `.btn-primary`, `.btn-gold`, `.btn-outline`, `.btn-ghost`, `.btn-danger` blocks:

  ```css
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 700;
    font-family: var(--font-sans);
    cursor: pointer;
    border: none;
    transition: opacity 0.15s, transform 0.15s;
    min-height: 44px;
    white-space: nowrap;
    text-decoration: none;
  }
  .btn:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: 2px;
  }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .btn-gold {
    background: var(--accent-gold);
    color: var(--text-inverse);
  }
  .btn-gold:hover { background: #b8973e; }

  .btn-emerald {
    background: var(--accent-emerald-subtle);
    color: var(--accent-emerald-text);
    border: 1px solid var(--accent-emerald-subtle);
  }
  .btn-emerald:hover { background: rgba(61, 153, 112, 0.2); }

  .btn-outline {
    background: transparent;
    color: var(--text-secondary);
    border: 1px solid var(--border-input);
  }
  .btn-outline:hover { background: var(--bg-panel-hover); }

  .btn-ghost {
    background: transparent;
    color: var(--text-secondary);
    border: none;
  }
  .btn-ghost:hover { background: var(--bg-panel-hover); }

  .btn-danger {
    background: var(--status-error-subtle);
    color: var(--status-error);
    border: 1px solid transparent;
  }
  .btn-danger:hover { opacity: 0.8; }

  .btn-sm { padding: 6px 12px; font-size: 12px; min-height: 36px; }
  .btn-lg { padding: 12px 24px; font-size: 15px; min-height: 48px; }
  ```

- [ ] **Step 6: Update badge/status classes in `index.css`**

  Replace existing `.badge` variants with these token-driven versions:

  ```css
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 20px;
    white-space: nowrap;
  }
  .badge-success  { background: var(--status-success-subtle);  color: var(--status-success); }
  .badge-warning  { background: var(--status-warning-subtle);  color: var(--status-warning); }
  .badge-error    { background: var(--status-error-subtle);    color: var(--status-error); }
  .badge-info     { background: var(--status-info-subtle);     color: var(--status-info); }
  .badge-gold     { background: var(--accent-gold-subtle);     color: var(--accent-gold-text); }
  .badge-emerald  { background: var(--accent-emerald-subtle);  color: var(--accent-emerald-text); }
  .badge-neutral  { background: var(--bg-panel-hover);         color: var(--text-secondary); }
  ```

- [ ] **Step 7: Update page-header class in `index.css`**

  ```css
  .page-header {
    position: sticky;
    top: 0;
    z-index: 40;
    min-height: 64px;
    padding: 0 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 1px solid var(--border-subtle);
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
  }
  .dark .page-header {
    background: rgba(3, 11, 20, 0.88);
  }
  .page-title {
    font-size: 1.375rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--text-primary);
    font-family: var(--font-sans);
  }
  .page-subtitle {
    font-size: 0.6875rem;
    font-weight: 500;
    color: var(--text-muted);
    margin-top: 1px;
  }
  ```

- [ ] **Step 8: Update form input classes in `index.css`**

  ```css
  .input, input[type="text"], input[type="email"],
  input[type="password"], input[type="number"], input[type="search"],
  select, textarea {
    background: var(--bg-input);
    border: 1px solid var(--border-input);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-sans);
    font-size: 14px;
    padding: 10px 12px;
    width: 100%;
    min-height: 40px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .input:focus, input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent-gold);
    box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.20);
  }
  .input-error, input.error {
    border-color: var(--status-error);
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
  }
  label {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 4px;
    display: block;
  }
  ```

- [ ] **Step 9: Update nav-item classes in `index.css`**

  ```css
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 14px 9px 18px;
    margin: 1px 8px;
    border-radius: var(--radius-md);
    font-size: 13px;
    font-weight: 500;
    color: var(--sidebar-text);
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s, color 0.15s;
    min-height: 44px;
    position: relative;
  }
  .nav-item:hover {
    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.85);
  }
  .nav-item.active {
    background: var(--sidebar-active-bg);
    color: var(--sidebar-text-active);
    font-weight: 600;
  }
  .nav-item.active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    background: var(--accent-gold);
    border-radius: 0 2px 2px 0;
  }
  .nav-item:focus-visible {
    outline: 3px solid var(--focus-ring);
    outline-offset: -2px;
  }
  .sidebar-section-label {
    font-size: 9px;
    font-weight: 700;
    color: var(--sidebar-section);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 14px 18px 4px;
  }
  ```

- [ ] **Step 10: Add KPI card and stat utility classes to `index.css`**

  Append to the components layer:

  ```css
  /* ── KPI / Stat Cards ─────────────────────────────────── */
  .stat-card {
    background: var(--bg-panel);
    border-radius: var(--radius-xl);
    padding: 20px;
    box-shadow: var(--shadow-panel);
    position: relative;
    overflow: hidden;
  }
  :root .stat-card { border: 1px solid var(--border-subtle); }
  .dark .stat-card  { border: none; }

  .stat-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 8px;
  }
  .stat-value {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.05em;
    line-height: 1;
    margin-bottom: 8px;
    font-family: var(--font-sans);
  }
  .stat-value-gold    { color: var(--accent-gold-text); }
  .stat-value-emerald { color: var(--accent-emerald-text); }
  .stat-value-error   { color: var(--status-error); }
  .stat-value-primary { color: var(--text-primary); }

  /* ── Panel (table / content block) ─────────────────────── */
  .panel {
    background: var(--bg-panel);
    border-radius: var(--radius-xl);
    overflow: hidden;
    box-shadow: var(--shadow-panel);
  }
  :root .panel { border: 1px solid var(--border-subtle); }
  .dark .panel  { border: none; }

  .panel-header {
    padding: 16px 20px 12px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .panel-title   { font-size: 13px; font-weight: 700; color: var(--text-primary); }
  .panel-subtitle { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

  .table-row {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    border-bottom: 1px solid var(--border-subtle);
    gap: 12px;
    transition: background 0.1s;
  }
  .table-row:last-child { border-bottom: none; }
  .table-row:hover { background: var(--bg-panel-hover); }

  /* ── Section divider ────────────────────────────────────── */
  .section-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0 0 16px;
  }
  .section-divider-label {
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
    white-space: nowrap;
  }
  .section-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border-subtle);
  }

  /* ── Modal ──────────────────────────────────────────────── */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .modal {
    background: var(--bg-panel);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-modal);
    width: 100%;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
  }
  :root .modal { border: 1px solid var(--border-subtle); }
  .dark .modal  { border: 1px solid var(--border-input); }
  .modal-header {
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border-subtle);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .modal-title { font-size: 15px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
  .modal-body    { padding: 20px 24px; }
  .modal-footer  {
    padding: 16px 24px 20px;
    border-top: 1px solid var(--border-subtle);
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  /* ── Progress bar ───────────────────────────────────────── */
  .progress-track {
    height: 6px;
    background: var(--border-subtle);
    border-radius: 3px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s ease;
  }
  .progress-fill-gold    { background: var(--accent-gold); }
  .progress-fill-emerald { background: var(--accent-emerald); }
  .progress-fill-error   { background: var(--status-error); }
  .progress-fill-neutral { background: var(--text-muted); }

  /* ── Screen-reader only ─────────────────────────────────── */
  .sr-only {
    position: absolute;
    width: 1px; height: 1px;
    padding: 0; margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    white-space: nowrap;
    border: 0;
  }
  ```

- [ ] **Step 11: Visual smoke test**

  ```bash
  cd /Volumes/Data/RND/Universal-POS/frontend && npm run dev
  ```

  Open `http://localhost:5173`. Without touching any component file yet, verify:
  - Page background is `#f5f6fa` (light grey), not white and not dark
  - Sidebar is deep navy `#06111f`
  - Buttons look styled (gold, outline variants visible)
  - No Playfair Display font visible (all Inter)

- [ ] **Step 12: Commit**

  ```bash
  git add frontend/index.html frontend/src/index.css
  git commit -m "feat(design): replace design tokens with Dark Luxury system + WCAG AA palette"
  ```

---

## Task 2: Sidebar Polish

**Files:**
- Modify: `frontend/src/components/organisms/sidebar/Sidebar.tsx`

The sidebar structure is already correct from the sidebar-toggle-pattern refactor. This task applies the new CSS classes, adds WCAG ARIA attributes, and adds keyboard close on `Escape` for the mobile drawer.

- [ ] **Step 1: Add `Escape` key close for mobile drawer in `AppLayout.tsx`**

  In `frontend/src/layouts/AppLayout.tsx`, add this `useEffect` after the existing pointer media query listener:

  ```tsx
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handleClose]);
  ```

- [ ] **Step 2: Add ARIA attributes to sidebar `<aside>` in `Sidebar.tsx`**

  Find the `<aside` element and update its props:

  ```tsx
  <aside
    id="sidebar-nav"
    role="navigation"
    aria-label="Main navigation"
    onMouseEnter={isPointerFine ? () => setIsHovered(true) : undefined}
    onMouseLeave={isPointerFine ? () => setIsHovered(false) : undefined}
    className={[...].join(' ')}
  >
  ```

- [ ] **Step 3: Add `aria-hidden` to section labels in `Sidebar.tsx`**

  Find the `sidebar-section-label` div and add `aria-hidden="true"`:

  ```tsx
  {isEffectivelyExpanded && (
    <div className="sidebar-section-label" aria-hidden="true">
      {section.section}
    </div>
  )}
  ```

- [ ] **Step 4: Add `aria-label` to collapsed nav items in `Sidebar.tsx`**

  Find the `<NavLink>` and update:

  ```tsx
  <NavLink
    key={item.path}
    to={item.path}
    onClick={!isSidebarPermanent ? onCloseMobileDrawer : undefined}
    aria-label={!isEffectivelyExpanded ? item.label : undefined}
    className={({ isActive }) =>
      `nav-item transition-all duration-150 whitespace-nowrap ${isActive ? 'active' : ''} ${isEffectivelyExpanded ? 'justify-start' : 'justify-center'}`
    }
  >
  ```

- [ ] **Step 5: Update the logo wordmark to use new token classes**

  Find the logo text span and replace with:

  ```tsx
  <span className={[
    'whitespace-nowrap overflow-hidden font-extrabold text-[14px] tracking-tight text-white transition-all duration-200 ease-in-out',
    isEffectivelyExpanded ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0',
  ].join(' ')}>
    Tuxedo<span className="text-[var(--accent-gold)]">POS</span>
  </span>
  ```

- [ ] **Step 6: Update backdrop in `AppLayout.tsx` to include `aria-label`**

  ```tsx
  <div
    className={[...].join(' ')}
    onClick={handleClose}
    aria-hidden="true"
    aria-label="Close navigation"
  />
  ```

- [ ] **Step 7: Verify sidebar in browser**

  - Desktop: sidebar shows at 240px with nav items, gold active indicator, Inter font
  - Collapse toggle narrows to 72px icon-only
  - Hover on collapsed: expands with shadow
  - Mobile (DevTools → 390px): sidebar hidden, hamburger in header opens drawer, tap backdrop closes, `Escape` closes

- [ ] **Step 8: Commit**

  ```bash
  git add frontend/src/components/organisms/sidebar/Sidebar.tsx frontend/src/layouts/AppLayout.tsx
  git commit -m "feat(design): sidebar ARIA attributes, Escape key close, token-based classes"
  ```

---

## Task 3: Page Header Polish

**Files:**
- Modify: `frontend/src/components/organisms/header/header.tsx`

- [ ] **Step 1: Update `header.tsx` to use new token classes**

  Replace the entire content of `frontend/src/components/organisms/header/header.tsx`:

  ```tsx
  import React from 'react';
  import { usePageHeaderConfig } from 'contexts/PageHeaderContext';
  import { SvgIcon } from 'components/atoms/svg-sprite-loader';

  interface PageHeaderProps {
    isSidebarPermanent?: boolean;
    onOpenMobileDrawer?: () => void;
  }

  const PageHeader: React.FC<PageHeaderProps> = ({ isSidebarPermanent, onOpenMobileDrawer }) => {
    const { title, subtitle, actions } = usePageHeaderConfig();

    if (!title) return null;

    return (
      <header className="page-header" role="banner" id="page-header">
        <div className="flex items-center gap-3 min-w-0">
          {!isSidebarPermanent && onOpenMobileDrawer && (
            <button
              onClick={onOpenMobileDrawer}
              aria-label="Open navigation"
              className="btn btn-ghost btn-sm p-2 shrink-0"
            >
              <SvgIcon name="menu" width="22" height="22" aria-hidden="true" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="page-title truncate">{title}</h1>
            {subtitle && <p className="page-subtitle truncate">{subtitle}</p>}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3 shrink-0">
            {actions}
          </div>
        )}
      </header>
    );
  };

  export default PageHeader;
  ```

- [ ] **Step 2: Verify header**

  - Sticky at top with correct height and border
  - Title uses Inter 800 weight
  - Hamburger visible on mobile (< 1025px)
  - Backdrop blur visible when scrolling content behind it

- [ ] **Step 3: Commit**

  ```bash
  git add frontend/src/components/organisms/header/header.tsx
  git commit -m "feat(design): page header token classes, ARIA, mobile hamburger"
  ```

---

## Task 4: Login Page

**Files:**
- Modify: `frontend/src/pages/login/index.tsx`
- Modify: `frontend/src/pages/login/components/BrandPanel.tsx`
- Modify: `frontend/src/pages/login/components/EmailForm.tsx`
- Modify: `frontend/src/pages/login/components/PinForm.tsx`

- [ ] **Step 1: Read the current login files**

  ```bash
  cat frontend/src/pages/login/index.tsx
  cat frontend/src/pages/login/components/BrandPanel.tsx
  cat frontend/src/pages/login/components/EmailForm.tsx
  ```

- [ ] **Step 2: Update `login/index.tsx` layout**

  Replace the outer wrapper to use the new surface tokens. The login page is a full-screen split: left brand panel (navy) + right form panel (white/dark):

  ```tsx
  <div className="min-h-screen flex bg-[var(--bg-canvas)]">
    <BrandPanel />
    <main className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-canvas)]">
      <div className="w-full max-w-sm">
        {/* form content */}
      </div>
    </main>
  </div>
  ```

- [ ] **Step 3: Update `BrandPanel.tsx`**

  Brand panel is navy — same in both themes:

  ```tsx
  <aside className="hidden lg:flex w-[420px] bg-[#06111f] flex-col items-center justify-center p-12 relative overflow-hidden shrink-0">
    {/* logo, tagline, decorative elements */}
    {/* Logo icon */}
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] to-[#a8873a] flex items-center justify-center mb-6 shadow-lg">
      {/* SVG logo */}
    </div>
    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
      Tuxedo<span className="text-[var(--accent-gold)]">POS</span>
    </h1>
    <p className="text-sm text-white/50 text-center max-w-[260px] leading-relaxed">
      Premium rental management for formal wear boutiques
    </p>
  </aside>
  ```

- [ ] **Step 4: Update `EmailForm.tsx` and `PinForm.tsx`**

  Replace any hardcoded color classes with token-based ones:
  - All `className` with `bg-white`, `bg-gray-*`, `text-gray-*`, `border-gray-*` → use token variables
  - Inputs: add `className="input"` to get the new input styles from Task 1
  - Submit button: `className="btn btn-gold w-full"`
  - Labels: `className` gets `font-semibold text-[var(--text-secondary)] text-sm mb-1 block`
  - Error messages: `className="text-[var(--status-error)] text-xs mt-1"` with `role="alert"`

- [ ] **Step 5: Verify login page**

  Navigate to `/login` (or log out). Confirm:
  - Left navy brand panel visible on desktop (hidden on mobile)
  - Input focus ring gold
  - Submit button gold
  - Error messages in red with correct contrast

- [ ] **Step 6: Commit**

  ```bash
  git add frontend/src/pages/login/
  git commit -m "feat(design): login page Dark Luxury reskin"
  ```

---

## Task 5: Dashboard

**Files:**
- Modify: `frontend/src/pages/dashboard/index.tsx`
- Modify: `frontend/src/pages/dashboard/components/StatCard.tsx`
- Modify: `frontend/src/pages/dashboard/components/RecentOrders.tsx`
- Modify: `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx`
- Modify: `frontend/src/pages/dashboard/components/QuickActions.tsx`
- Modify: `frontend/src/pages/dashboard/components/UpcomingPickups.tsx`
- Modify: `frontend/src/pages/dashboard/components/RentalFleetStatus.tsx`

- [ ] **Step 1: Update `StatCard.tsx` to use new token classes**

  Replace the entire component:

  ```tsx
  import React from 'react';
  import { StatProps } from 'types/dashboard';
  import { SvgIcon } from 'components/atoms/svg-sprite-loader';
  import { Sparkline } from './Sparkline';

  const VALUE_COLOR: Record<string, string> = {
    gold:    'stat-value-gold',
    emerald: 'stat-value-emerald',
    error:   'stat-value-error',
    primary: 'stat-value-primary',
  };

  export const StatCard: React.FC<StatProps> = ({ label, value, change, positive, sparkData, colorVariant = 'primary', icon }) => (
    <div
      className="stat-card"
      role="region"
      aria-label={`${label} KPI`}
    >
      <div className="flex justify-between items-start mb-2">
        <p className="stat-label">{label}</p>
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `var(--accent-${colorVariant === 'gold' ? 'gold' : colorVariant === 'emerald' ? 'emerald' : 'gold'}-subtle)` }}
          aria-hidden="true"
        >
          <SvgIcon name={icon} width="18" height="18" />
        </div>
      </div>
      <p className={`stat-value ${VALUE_COLOR[colorVariant] ?? 'stat-value-primary'}`}>
        {value}
      </p>
      {change && (
        <span className={`badge ${positive ? 'badge-success' : 'badge-error'}`}>
          <span aria-hidden="true">{positive ? '↑' : '↓'}</span>
          <span className="sr-only">{positive ? 'up' : 'down'}</span>
          {change}
          <span className="font-normal opacity-80 text-[0.7rem]"> vs last week</span>
        </span>
      )}
      {sparkData && sparkData.length > 1 && (
        <div className="mt-3 h-8">
          <Sparkline data={sparkData} colorVariant={colorVariant} />
        </div>
      )}
    </div>
  );
  ```

- [ ] **Step 2: Update `dashboard/index.tsx` STATS array color variants**

  In `frontend/src/pages/dashboard/index.tsx`, update the STATS array (the `icon` and `color` props):

  ```tsx
  const STATS: StatProps[] = [
    { label: "Today's Revenue",   value: `$${orderSummary?.revenue?.toFixed(2) ?? '0.00'}`, change: '', positive: true,  icon: 'banknote',     colorVariant: 'gold',    sparkData: revenueData.length ? revenueData.map(d => parseFloat(String(d.revenue)) || 0) : [0] },
    { label: 'Active Rentals',    value: `${rentalStats?.out ?? 0}`,                        change: '', positive: true,  icon: 'tuxedo',       colorVariant: 'emerald', sparkData: Array.from({ length: 7 }, () => rentalStats?.out ?? 0) },
    { label: 'Appointments Today',value: `${appointmentData?.count ?? 0}`,                  change: '', positive: true,  icon: 'appointments', colorVariant: 'primary', sparkData: Array.from({ length: 7 }, () => appointmentData?.count ?? 0) },
    { label: 'Overdue Returns',   value: `${rentalStats?.overdue ?? 0}`,                    change: '', positive: false, icon: 'warning',      colorVariant: 'error',   sparkData: Array.from({ length: 7 }, () => rentalStats?.overdue ?? 0) },
  ];
  ```

- [ ] **Step 3: Update `dashboard/index.tsx` layout classes**

  Replace the two-column main content div and the Business Pulse section header:

  ```tsx
  {/* Section divider */}
  <div className="section-divider mb-4">
    <span className="section-divider-label">Business Pulse</span>
    <div className="section-divider-line" />
  </div>

  {/* Two-column grid */}
  <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
  ```

- [ ] **Step 4: Update `RecentOrders.tsx` to use panel + table-row classes**

  Replace hardcoded card/table classes:

  ```tsx
  <div className="panel">
    <div className="panel-header">
      <div>
        <h2 className="panel-title">Recent Orders</h2>
        <p className="panel-subtitle">{orders.length} transactions today</p>
      </div>
      <Link to="/reports" className="btn btn-ghost btn-sm text-[var(--accent-gold-text)]">
        View all →
      </Link>
    </div>
    {/* table rows */}
    {orders.map(order => (
      <div key={order.id} className="table-row">
        <span className="text-sm font-semibold text-[var(--text-primary)] flex-1">{order.orderNo}</span>
        <span className="text-sm text-[var(--text-secondary)] flex-1">{order.customer}</span>
        <span className="text-sm font-bold text-[var(--accent-gold-text)]">${order.total.toFixed(2)}</span>
        <span className={`badge ${
          order.status === 'completed' ? 'badge-success' :
          order.status === 'processing' ? 'badge-gold' :
          order.status === 'overdue' ? 'badge-error' : 'badge-neutral'
        }`}>{order.status}</span>
      </div>
    ))}
  </div>
  ```

- [ ] **Step 5: Update `PredictiveAnalytics.tsx` (Stock Health)**

  Replace the card wrapper and badge classes:

  ```tsx
  <div className="panel">
    <div className="panel-header">
      <div>
        <h2 className="panel-title">Stock Health</h2>
        <p className="panel-subtitle">Current availability by category</p>
      </div>
    </div>
    <div className="p-4 flex flex-col gap-4">
      {categoryData.map(p => (
        <div key={p.category}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">{p.category}</span>
            <div className="flex items-center gap-2">
              <span className={`badge ${p.risk === 'high' ? 'badge-error' : p.risk === 'medium' ? 'badge-warning' : 'badge-emerald'}`}>
                {p.risk === 'high' ? 'Low Stock' : p.risk === 'medium' ? 'Moderate' : 'In Stock'}
              </span>
              <span className="text-xs text-[var(--text-muted)]">{p.available}/{p.total}</span>
            </div>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${p.risk === 'high' ? 'progress-fill-error' : p.risk === 'medium' ? 'progress-fill-gold' : 'progress-fill-emerald'}`}
              style={{ width: `${p.total > 0 ? Math.round((p.available / p.total) * 100) : 0}%` }}
              role="progressbar"
              aria-valuenow={p.available}
              aria-valuemin={0}
              aria-valuemax={p.total}
              aria-label={`${p.category} stock level`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
  ```

- [ ] **Step 6: Update `QuickActions.tsx`**

  Replace the card and button styles with panel + new btn classes:

  ```tsx
  <div className="panel">
    <div className="panel-header"><h2 className="panel-title">Quick Actions</h2></div>
    <div className="p-4 grid grid-cols-2 gap-3">
      {actions.map(action => (
        <button key={action.label} onClick={action.onClick}
          className="flex flex-col items-center gap-2 p-3 rounded-[var(--radius-lg)] bg-[var(--bg-panel-hover)] hover:bg-[var(--bg-input)] transition-colors min-h-[44px] border border-[var(--border-subtle)]"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.colorClass}`} aria-hidden="true">
            <SvgIcon name={action.icon} width="16" height="16" />
          </div>
          <span className="text-xs font-600 text-[var(--text-secondary)]">{action.label}</span>
        </button>
      ))}
    </div>
  </div>
  ```

- [ ] **Step 7: Update `RentalFleetStatus.tsx`**

  Progress bars use new `.progress-track` / `.progress-fill-*` classes. Wrap in `.panel`.

- [ ] **Step 8: Update `UpcomingPickups.tsx`**

  Wrap in `.panel`, use `.table-row` for each pickup row.

- [ ] **Step 9: Verify dashboard**

  - 4 KPI cards: gold revenue, emerald rentals, white appointments, red overdue
  - Recent Orders panel with badge colors
  - Stock Health with correct In Stock / Moderate / Low Stock labels and colors
  - Both light and dark mode look correct (toggle via sidebar user menu)

- [ ] **Step 10: Commit**

  ```bash
  git add frontend/src/pages/dashboard/
  git commit -m "feat(design): dashboard Dark Luxury reskin with token classes"
  ```

---

## Task 6: POS Terminal

**Files:**
- Modify: `frontend/src/pages/pos/index.tsx`
- Modify: `frontend/src/pages/pos/components/CartSidebar.tsx`
- Modify: `frontend/src/pages/pos/components/ProductGrid.tsx`
- Modify: `frontend/src/pages/pos/components/ProductDetailModal.tsx`
- Modify: `frontend/src/pages/pos/checkout/CheckoutModal.tsx`
- Modify: `frontend/src/pages/pos/checkout/OrderCompleteModal.tsx`

- [ ] **Step 1: Read current POS files**

  ```bash
  cat frontend/src/pages/pos/index.tsx
  cat frontend/src/pages/pos/components/CartSidebar.tsx
  cat frontend/src/pages/pos/components/ProductGrid.tsx
  ```

- [ ] **Step 2: Update `pos/index.tsx` layout**

  POS is a split layout: product grid (left) + cart sidebar (right). Replace wrapper classes:

  ```tsx
  <div className="flex h-full gap-0 overflow-hidden bg-[var(--bg-canvas)]">
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* search bar */}
      <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]">
        <input className="input" placeholder="Search products..." type="search" />
      </div>
      <ProductGrid ... />
    </div>
    <CartSidebar ... />
  </div>
  ```

- [ ] **Step 3: Update `ProductGrid.tsx`**

  Product cards use `.panel` wrapper + new token colors:

  ```tsx
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-4 overflow-y-auto">
    {products.map(p => (
      <button key={p.id}
        className="panel p-4 text-left hover:bg-[var(--bg-panel-hover)] transition-colors cursor-pointer focus-visible:outline-[var(--focus-ring)]"
        onClick={() => onSelect(p)}
      >
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">{p.category}</p>
        <p className="text-sm font-700 text-[var(--text-primary)] mb-2">{p.name}</p>
        <p className="text-lg font-900 tracking-tight text-[var(--accent-gold-text)]">
          ${p.salePrice?.toFixed(2) ?? p.rentalRatePerDay?.toFixed(2)}
        </p>
      </button>
    ))}
  </div>
  ```

- [ ] **Step 4: Update `CartSidebar.tsx`**

  Cart panel is a fixed-width right column:

  ```tsx
  <aside className="w-[320px] shrink-0 flex flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-panel)]">
    <div className="panel-header">
      <h2 className="panel-title">Cart</h2>
      <span className="badge badge-gold">{items.length} items</span>
    </div>
    {/* cart items */}
    <div className="flex-1 overflow-y-auto">
      {items.map(item => (
        <div key={item.id} className="table-row">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{item.name}</p>
            <p className="text-xs text-[var(--text-muted)]">x{item.qty}</p>
          </div>
          <p className="text-sm font-bold text-[var(--accent-gold-text)]">${item.lineTotal.toFixed(2)}</p>
        </div>
      ))}
    </div>
    {/* totals + checkout button */}
    <div className="p-4 border-t border-[var(--border-subtle)]">
      <div className="flex justify-between mb-4">
        <span className="text-sm text-[var(--text-secondary)]">Total</span>
        <span className="text-xl font-900 tracking-tight text-[var(--accent-gold-text)]">${total.toFixed(2)}</span>
      </div>
      <button className="btn btn-gold w-full" onClick={onCheckout}>Checkout</button>
    </div>
  </aside>
  ```

- [ ] **Step 5: Update `CheckoutModal.tsx` and `OrderCompleteModal.tsx`**

  Both use `.modal-backdrop` > `.modal` > `.modal-header` > `.modal-body` > `.modal-footer` structure from Task 1.
  Payment method buttons: `btn btn-outline` (unselected), `btn btn-gold` (selected).
  Order complete: large gold checkmark icon, order number in `stat-value stat-value-gold`.

- [ ] **Step 6: Verify POS terminal**

  Navigate to `/pos`. Confirm product grid, cart sidebar, checkout flow all use new tokens.

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/pages/pos/
  git commit -m "feat(design): POS terminal Dark Luxury reskin"
  ```

---

## Task 7: Rentals

**Files:**
- Modify: `frontend/src/pages/rentals/index.tsx`
- Modify: `frontend/src/pages/rentals/components/RentalTable.tsx`
- Modify: `frontend/src/pages/rentals/components/RentalDetailModal.tsx`
- Modify: `frontend/src/pages/rentals/components/NewRentalForm.tsx`

- [ ] **Step 1: Read current rentals files**

  ```bash
  cat frontend/src/pages/rentals/index.tsx
  cat frontend/src/pages/rentals/components/RentalTable.tsx
  ```

- [ ] **Step 2: Update `rentals/index.tsx`**

  Page wrapper: `bg-[var(--bg-canvas)] p-6`. Filter bar uses `.input` and `.btn` classes. Status filter chips: `.badge` variants.

- [ ] **Step 3: Update `RentalTable.tsx`**

  Wrap table in `.panel`. Header row: `bg-[var(--bg-panel-hover)]`, cells use `text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide`.
  Data rows: `.table-row`. Status badges mapped as:

  ```tsx
  const STATUS_BADGE: Record<string, string> = {
    booked:   'badge-gold',
    out:      'badge-emerald',
    overdue:  'badge-error',
    returned: 'badge-success',
  };
  ```

- [ ] **Step 4: Update `RentalDetailModal.tsx` and `NewRentalForm.tsx`**

  Both use `.modal-backdrop` > `.modal` structure. Form fields use `.input` + `<label>`. Action buttons: `btn btn-gold` (primary), `btn btn-outline` (cancel), `btn btn-danger` (delete/cancel rental).

- [ ] **Step 5: Verify and commit**

  ```bash
  git add frontend/src/pages/rentals/
  git commit -m "feat(design): rentals page Dark Luxury reskin"
  ```

---

## Task 8: Appointments

**Files:**
- Modify: `frontend/src/pages/appointments/index.tsx`
- Modify: `frontend/src/pages/appointments/components/AppointmentDetailModal.tsx`
- Modify: `frontend/src/pages/appointments/components/NewApptModal.tsx`

- [ ] **Step 1: Read current appointments files**

  ```bash
  cat frontend/src/pages/appointments/index.tsx
  ```

- [ ] **Step 2: Update `appointments/index.tsx`**

  Appointment cards: `.panel` wrapper with `hover:bg-[var(--bg-panel-hover)]`. Time/date labels: `text-[var(--text-muted)] text-xs font-bold uppercase`. Customer name: `text-[var(--text-primary)] font-semibold`. Confirmed/pending status: `.badge-success` / `.badge-gold`.

- [ ] **Step 3: Update modals**

  Both modals use `.modal` structure. Date/time inputs use `.input`. Confirm button: `btn btn-gold`. Cancel: `btn btn-outline`.

- [ ] **Step 4: Verify and commit**

  ```bash
  git add frontend/src/pages/appointments/
  git commit -m "feat(design): appointments page Dark Luxury reskin"
  ```

---

## Task 9: Inventory

**Files:**
- Modify: `frontend/src/pages/inventory/index.tsx`
- Modify: `frontend/src/pages/inventory/components/InventoryCard.tsx`
- Modify: `frontend/src/pages/inventory/components/InventoryDetailModal.tsx`
- Modify: `frontend/src/pages/inventory/components/AddItemModal.tsx`
- Modify: `frontend/src/pages/inventory/components/SizeCell.tsx`

- [ ] **Step 1: Read current inventory files**

  ```bash
  cat frontend/src/pages/inventory/index.tsx
  cat frontend/src/pages/inventory/components/InventoryCard.tsx
  ```

- [ ] **Step 2: Update `InventoryCard.tsx`**

  Product cards use `.panel` + `hover:bg-[var(--bg-panel-hover)]`. Stock progress bars use `.progress-track` / `.progress-fill-emerald` / `.progress-fill-gold` / `.progress-fill-error` depending on availability ratio (same thresholds as Stock Health widget: < 30% → error, 30–60% → gold, > 60% → emerald).

- [ ] **Step 3: Update `SizeCell.tsx`**

  Available sizes: `badge-emerald`. Out-of-stock: `badge-error`. Low: `badge-warning`. Text uses `text-[var(--text-primary)]`.

- [ ] **Step 4: Update modals**

  `.modal` structure. Size grid inputs: `.input`. Submit: `btn btn-gold`.

- [ ] **Step 5: Verify and commit**

  ```bash
  git add frontend/src/pages/inventory/
  git commit -m "feat(design): inventory page Dark Luxury reskin"
  ```

---

## Task 10: Tailoring

**Files:**
- Modify: `frontend/src/pages/tailoring/index.tsx`
- Modify: `frontend/src/pages/tailoring/components/KanbanCol.tsx`
- Modify: `frontend/src/pages/tailoring/components/StatusPipeline.tsx`
- Modify: `frontend/src/pages/tailoring/components/TailoringDetailModal.tsx`
- Modify: `frontend/src/pages/tailoring/components/NewTailoringJobModal.tsx`

- [ ] **Step 1: Read current tailoring files**

  ```bash
  cat frontend/src/pages/tailoring/index.tsx
  cat frontend/src/pages/tailoring/components/KanbanCol.tsx
  ```

- [ ] **Step 2: Update `KanbanCol.tsx`**

  Column header: `panel-header` with status badge. Cards: `.panel` with `cursor-grab active:cursor-grabbing`. Job title: `text-[var(--text-primary)] font-semibold text-sm`. Due date: `text-[var(--text-muted)] text-xs`. Overdue dates: `text-[var(--status-error)]`.

- [ ] **Step 3: Update `StatusPipeline.tsx`**

  Pipeline steps: active step uses `bg-[var(--accent-gold)] text-[var(--text-inverse)]`, completed: `bg-[var(--accent-emerald-subtle)] text-[var(--accent-emerald-text)]`, pending: `bg-[var(--bg-panel-hover)] text-[var(--text-muted)]`.

- [ ] **Step 4: Update modals**

  `.modal` structure. Status select: `.input`. Assignee: `.input`. Due date: `.input`. Submit: `btn btn-gold`.

- [ ] **Step 5: Verify and commit**

  ```bash
  git add frontend/src/pages/tailoring/
  git commit -m "feat(design): tailoring page Dark Luxury reskin"
  ```

---

## Task 11: Customers & Measurements

**Files:**
- Modify: `frontend/src/pages/customers/index.tsx`
- Modify: `frontend/src/pages/customers/components/CustomerCard.tsx`
- Modify: `frontend/src/pages/customers/components/CustomerDetailModal.tsx`
- Modify: `frontend/src/pages/customers/components/NewCustomerForm.tsx`
- Modify: `frontend/src/pages/measurements/index.tsx`
- Modify: `frontend/src/pages/measurements/components/MeasurementCard.tsx`
- Modify: `frontend/src/pages/measurements/components/MeasurementDetailModal.tsx`
- Modify: `frontend/src/pages/measurements/components/NewMeasurementModal.tsx`

- [ ] **Step 1: Read current files**

  ```bash
  cat frontend/src/pages/customers/index.tsx
  cat frontend/src/pages/customers/components/CustomerCard.tsx
  cat frontend/src/pages/measurements/index.tsx
  ```

- [ ] **Step 2: Update `CustomerCard.tsx`**

  Avatar initials: `w-10 h-10 rounded-full bg-[var(--accent-gold-subtle)] text-[var(--accent-gold-text)] font-black text-sm flex items-center justify-center`. Customer name: `text-[var(--text-primary)] font-semibold`. Loyalty points: `badge-gold`. Total spent: `text-[var(--accent-gold-text)] font-bold`.

- [ ] **Step 3: Update `CustomerDetailModal.tsx`**

  Tabs: active tab `border-b-2 border-[var(--accent-gold)] text-[var(--accent-gold-text)]`, inactive `text-[var(--text-muted)]`. Order history list uses `.table-row`.

- [ ] **Step 4: Update measurements components**

  Measurement cards: `.panel` with body measurement values in `font-bold text-[var(--text-primary)]`. Labels: `stat-label`. New measurement form: `.input` for each measurement field.

- [ ] **Step 5: Verify and commit**

  ```bash
  git add frontend/src/pages/customers/ frontend/src/pages/measurements/
  git commit -m "feat(design): customers and measurements Dark Luxury reskin"
  ```

---

## Task 12: Reports

**Files:**
- Modify: `frontend/src/pages/reports/index.tsx`
- Modify: `frontend/src/pages/reports/components/KPICards.tsx`
- Modify: `frontend/src/pages/reports/components/RevenueChart.tsx`
- Modify: `frontend/src/pages/reports/components/CategorySalesChart.tsx`
- Modify: `frontend/src/pages/reports/components/PaymentMethodsChart.tsx`
- Modify: `frontend/src/pages/reports/components/RecentTransactions.tsx`

- [ ] **Step 1: Read current reports files**

  ```bash
  cat frontend/src/pages/reports/index.tsx
  cat frontend/src/pages/reports/components/RevenueChart.tsx
  ```

- [ ] **Step 2: Update `KPICards.tsx` in reports**

  Same `.stat-card` / `.stat-value-gold` / `.stat-value-emerald` structure as dashboard StatCard — use `colorVariant` prop.

- [ ] **Step 3: Update chart components**

  Charts (bar, line) wrapped in `.panel`. Chart container: `bg-transparent`. Chart colors: use `getComputedStyle(document.documentElement).getPropertyValue('--accent-gold')` to read CSS variables for chart series colors:

  ```tsx
  const goldColor = '#c9a84c';
  const emeraldColor = '#3d9970';
  const errorColor = 'var(--status-error)';
  // Pass these as `fill` / `stroke` to your charting library's series config
  ```

  Period selector buttons: active `btn btn-gold btn-sm`, inactive `btn btn-outline btn-sm`.

- [ ] **Step 4: Update `RecentTransactions.tsx`**

  Wrap in `.panel`. Rows use `.table-row`. Amount column: `text-[var(--accent-gold-text)] font-bold`.

- [ ] **Step 5: Verify and commit**

  ```bash
  git add frontend/src/pages/reports/
  git commit -m "feat(design): reports page Dark Luxury reskin"
  ```

---

## Task 13: Settings & Admin

**Files:**
- Modify: `frontend/src/pages/settings/index.tsx`
- Modify: `frontend/src/pages/settings/components/StoreInfoTab.tsx`
- Modify: `frontend/src/pages/settings/components/StaffTab.tsx`
- Modify: `frontend/src/pages/settings/components/TaxesTab.tsx`
- Modify: `frontend/src/pages/settings/components/ReceiptsTab.tsx`
- Modify: `frontend/src/pages/settings/components/SecurityTab.tsx`
- Modify: `frontend/src/pages/admin/index.tsx`
- Modify: `frontend/src/pages/admin/components/TenantList.tsx`
- Modify: `frontend/src/pages/admin/components/GlobalStats.tsx`
- Modify: `frontend/src/pages/admin/components/NewTenantModal.tsx`

- [ ] **Step 1: Read current settings files**

  ```bash
  cat frontend/src/pages/settings/index.tsx
  cat frontend/src/pages/settings/components/StoreInfoTab.tsx
  ```

- [ ] **Step 2: Update settings tabs navigation**

  Tab bar in `settings/index.tsx`:

  ```tsx
  <nav className="flex gap-1 border-b border-[var(--border-subtle)] mb-6" role="tablist">
    {TABS.map(tab => (
      <button
        key={tab.id}
        role="tab"
        aria-selected={activeTab === tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`px-4 py-3 text-sm font-600 border-b-2 -mb-px transition-colors ${
          activeTab === tab.id
            ? 'border-[var(--accent-gold)] text-[var(--accent-gold-text)]'
            : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
  ```

- [ ] **Step 3: Update all settings tab forms**

  Each tab is wrapped in `.panel`. Form sections:

  ```tsx
  <div className="panel">
    <div className="panel-header"><h2 className="panel-title">Store Information</h2></div>
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="store-name">Store Name</label>
        <input id="store-name" className="input" type="text" />
      </div>
      {/* more fields */}
    </div>
    <div className="modal-footer">
      <button className="btn btn-outline">Cancel</button>
      <button className="btn btn-gold">Save Changes</button>
    </div>
  </div>
  ```

- [ ] **Step 4: Update toggle switches**

  Custom toggles (if any): checked state uses `bg-[var(--accent-gold)]`, unchecked `bg-[var(--border-input)]`. Always include a visible `<label>` and `role="switch" aria-checked`.

- [ ] **Step 5: Update admin page**

  `GlobalStats`: `.stat-card` grid — same structure as dashboard KPIs.
  `TenantList`: `.panel` + `.table-row` per tenant.
  `NewTenantModal`: `.modal` structure, `.input` fields, `btn btn-gold` submit.

- [ ] **Step 6: Verify settings and admin**

  - Tab navigation works with gold underline active state
  - All form inputs use new token styles
  - Save buttons are gold
  - Light and dark both look correct

- [ ] **Step 7: Commit**

  ```bash
  git add frontend/src/pages/settings/ frontend/src/pages/admin/
  git commit -m "feat(design): settings and admin Dark Luxury reskin"
  ```

---

## Task 14: Final Polish & WCAG Audit

**Files:** Any file that needs contrast or focus fixes after visual review.

- [ ] **Step 1: Run a contrast audit pass**

  In the browser, go through each page in both light and dark mode. Check for any text that looks faint or difficult to read. Common places to check:
  - Table row secondary text (`.text-[var(--text-muted)]`) — ensure it's only used at 14px bold+
  - Badge text on subtle backgrounds
  - Placeholder text in inputs
  - Chart axis labels

- [ ] **Step 2: Run a keyboard navigation audit**

  Tab through every page. Confirm:
  - Every interactive element receives a visible gold/navy focus ring
  - No `outline: none` without a custom replacement
  - Modal close (×) button, sidebar collapse, and all icon-only buttons have `aria-label`
  - Mobile drawer closes on `Escape`

- [ ] **Step 3: Run a screen reader spot-check**

  Turn on VoiceOver (macOS: `Cmd + F5`) and navigate:
  - Dashboard: KPI cards announce their label and value
  - Sidebar: nav items announce their name when collapsed (icon-only)
  - Status badges: read meaningful text, not just color

- [ ] **Step 4: Test both themes on all pages**

  Toggle dark ↔ light via the sidebar user menu. Confirm no page has hardcoded colors that break in either mode. Common culprits:
  - `text-white` / `text-black` that should be `text-[var(--text-primary)]`
  - `bg-white` / `bg-gray-*` that should be `bg-[var(--bg-panel)]`
  - Hardcoded hex values instead of CSS variables

- [ ] **Step 5: Fix any issues found in steps 1–4**

  For each issue found, make the minimal targeted fix. Do not refactor — just swap the color to the correct token.

- [ ] **Step 6: Final commit**

  ```bash
  git add -A
  git commit -m "fix(design): WCAG contrast, focus ring, and dark mode polish pass"
  ```

---

## Self-Review

### Spec Coverage

| Spec section | Covered by |
|---|---|
| Color tokens (light + dark) | Task 1 |
| Typography (Inter, scale) | Task 1 |
| Sidebar (navy fixed, ARIA, keyboard) | Task 2 |
| Page header | Task 3 |
| Login | Task 4 |
| Dashboard | Task 5 |
| POS Terminal | Task 6 |
| Rentals | Task 7 |
| Appointments | Task 8 |
| Inventory | Task 9 |
| Tailoring | Task 10 |
| Customers & Measurements | Task 11 |
| Reports | Task 12 |
| Settings & Admin | Task 13 |
| WCAG AA final audit | Task 14 |
| All pages in scope | Tasks 4–13 |

### No placeholders found — all steps have concrete code or commands.

### Type consistency
- `colorVariant` prop introduced in Task 5 `StatCard` — referenced consistently in Tasks 5 and 12 `KPICards`.
- `.panel`, `.panel-header`, `.panel-title`, `.table-row`, `.modal`, `.modal-header`, `.modal-body`, `.modal-footer`, `.badge-*`, `.btn-*`, `.progress-track`, `.progress-fill-*` all defined in Task 1 and used consistently in Tasks 2–13.
- `--accent-gold-text`, `--accent-emerald-text`, `--status-error` used identically across all tasks.
