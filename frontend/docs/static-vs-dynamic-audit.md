# TuxedoPOS — Static vs Dynamic Data Audit

> **Generated**: May 15, 2026  
> **Scope**: All pages, components, and data flows in `frontend/src/`

---

## Executive Summary

The application has a **well-structured API layer** (`apiClient.ts` + `queries.ts`) and uses **React Query** for server-state management. However, a significant portion of the UI still relies on **hardcoded constants**, **mock arrays**, and **local-only state** that never persists to a backend. Several modules have a hybrid pattern: they *read* from the API but *write* locally (or vice versa).

| Category | Count |
|---|---|
| ✅ Fully Dynamic (API Read + Write) | 6 modules |
| ⚠️ Partially Dynamic (mixed static/API) | 4 modules |
| 🔴 Fully Static / Mock Only | 3 modules |

---

## Module-by-Module Breakdown

### ✅ Fully Dynamic — API Read + Write

These modules fetch data via `apiClient` and persist mutations back to the server.

#### 1. **Login / Authentication**
- **Read**: `POST /auth/login` and `POST /auth/login/pin`
- **Write**: JWT stored in `localStorage`, session restored on mount
- **Status**: ✅ Fully wired

#### 2. **POS Terminal** — [pos/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/pos/index.tsx)
- **Read**: `GET /products`, `GET /customers`
- **Write**: `POST /orders` via `useMutation`
- **Hardware**: Cash drawer, receipt printing via HAL
- ⚠️ **Minor gap**: `stock: 99` is hardcoded on line 49 — real stock levels are not fetched from the API

#### 3. **Rentals** — [rentals/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/rentals/index.tsx)
- **Read**: `GET /rentals`, `GET /customers`
- **Write**: `POST /rentals` (create new booking)
- **Status**: ✅ Fully wired

#### 4. **Customers** — [customers/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/customers/index.tsx)
- **Read**: `GET /customers`, `GET /customers/:id/measurements`
- **Write**: `POST /customers` (create)
- ⚠️ **Minor gap**: No `PUT /customers/:id` (edit) or `DELETE /customers/:id` wired

#### 5. **Appointments** — [appointments/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/appointments/index.tsx)
- **Read**: `GET /appointments`
- **Write**: `POST /appointments` (create), `PUT /appointments/:id/status` (update status)
- ⚠️ **Minor gap**: Staff list in [NewApptModal](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/appointments/components/NewApptModal.tsx#L70-L73) is hardcoded (`James Miller`, `Sarah Connor`, `Tony Russo`)

#### 6. **Tailoring** — [tailoring/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/tailoring/index.tsx)
- **Read**: `GET /tailoring`
- **Write**: `PUT /tailoring/:id/status` (advance workflow stage)
- ⚠️ **Minor gap**: No `POST /tailoring` (create new job) — the "+ New Job Card" button has no handler

---

### ⚠️ Partially Dynamic — Mix of API + Static

#### 7. **Dashboard** — [dashboard/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/dashboard/index.tsx)
| Element | Source | Status |
|---|---|---|
| Today's Revenue | `GET /orders/summary?date=` | ✅ API |
| Active Rentals / Overdue | `GET /rentals/stats` | ✅ API |
| Appointments Today | Hardcoded `'8'` on line 35 | 🔴 Static |
| Spark chart data | Hardcoded arrays `[32,28,45,...]` | 🔴 Static |
| Change % (`12.4%`, `3`, `2`, `1`) | Hardcoded strings | 🔴 Static |
| Recent Orders table | `RECENT_ORDERS` from [constants/dashboard.ts](file:///Volumes/Data/RND/Universal-POS/frontend/src/constants/dashboard.ts#L3-L9) | 🔴 Static mock |
| Upcoming Pickups | `UPCOMING_RENTALS` from constants | 🔴 Static mock |
| Priority Alerts | `ALERTS` from constants | 🔴 Static mock |
| Rental Fleet Status | Derived from `rentalStats` API | ✅ API |

#### 8. **Inventory** — [inventory/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/inventory/index.tsx)
| Element | Source | Status |
|---|---|---|
| Product listing | `GET /inventory` | ✅ API |
| Add product | `POST /products` in [AddItemModal](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/inventory/components/AddItemModal.tsx) | ✅ API |
| Edit / Delete product | Not implemented | 🔴 Missing |
| Size/Stock management | Read from API, no update endpoint | ⚠️ Read-only |

#### 9. **Measurements** — [measurements/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/measurements/index.tsx)
| Element | Source | Status |
|---|---|---|
| Measurement records | `GET /customers/measurements/all` | ✅ API |
| Customer dropdown | `GET /customers` | ✅ API |
| Create measurement | `POST /customers/:id/measurements` | ✅ API |
| Edit / Delete measurement | Not implemented | 🔴 Missing |

#### 10. **Reports** — [reports/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/reports/index.tsx)
| Element | Source | Status |
|---|---|---|
| KPI cards (revenue, order count) | `GET /orders/summary?date=` | ✅ API |
| Recent transactions table | `GET /orders?limit=50` | ✅ API |
| Revenue chart (7-day) | **Hybrid** — uses API data but falls back to `mockBaseline` array on line 45-46 | ⚠️ Fallback mock |
| Payment methods chart | **Hybrid** — uses API data but falls back to hardcoded values (`2500`, `5800`, `450`) on lines 59-61 | ⚠️ Fallback mock |
| Category sales chart | 100% hardcoded on lines 65-70 (`Tuxedo Rentals: 4500`, etc.) | 🔴 Static mock |
| Period filter (Today/Week/Month) | Not wired — `period` state is unused in any API call | 🔴 Non-functional |

---

### 🔴 Fully Static / Mock Only

#### 11. **Settings** — [settings/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/settings/index.tsx)
- **All data is local state**: Store info (name, address, tax rate) is initialized as a `useState` object on lines 15-27
- **Save button**: Sets a `saved` boolean for 2.5 seconds — **no API call**
- **Staff tab**: Uses `STAFF` from [constants/settings.ts](file:///Volumes/Data/RND/Universal-POS/frontend/src/constants/settings.ts#L3-L8) — 100% hardcoded
- **Taxes, Receipts, Security tabs**: All local state, no persistence
- **No endpoints**: No `GET /settings` or `PUT /settings` exist in `queries.ts`

#### 12. **Admin Panel** — [admin/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/admin/index.tsx)
- **Tenant list**: `MOCK_TENANTS` from [constants/admin.ts](file:///Volumes/Data/RND/Universal-POS/frontend/src/constants/admin.ts#L3-L8) — 100% hardcoded
- **Global stats**: Hardcoded in [GlobalStats.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/pages/admin/components/GlobalStats.tsx)
- **"+ New Tenant" button**: No handler attached
- **No endpoints**: No admin API endpoints exist

#### 13. **Retail Plugin (Returns)** — [plugins/retail/index.tsx](file:///Volumes/Data/RND/Universal-POS/frontend/src/plugins/retail/index.tsx)
- **Returns page**: Renders a static `<div>` with text — no API
- **Loyalty settings**: Local form with `defaultChecked` checkbox — no persistence
- **Redeem Points**: Static button, no logic

---

## Cross-Cutting Static Elements

These are items embedded in otherwise-dynamic pages:

| Element | Location | Issue |
|---|---|---|
| Staff / Assigned-to dropdowns | Appointments `NewApptModal` | Hardcoded 3 staff names instead of `GET /staff` |
| Product stock count | POS `index.tsx:49` | Always `99`, not from inventory API |
| Appointment types list | `NewApptModal` select | Hardcoded enum, not configurable |
| Appointment durations | `NewApptModal` select | Hardcoded `[15,20,30,45,60,90]` |
| Tax rate | POS `index.tsx:14` | Hardcoded `0.0875` instead of from settings |
| Currency format | Throughout app | Hardcoded `$` prefix, no i18n |
| Store name in receipts | POS `index.tsx:214` | Hardcoded `'TuxedoPOS'` |
| Logo SVG bowtie color | Sidebar logo | Was hardcoded `#D4AF37`, now uses `var(--tux-gold)` |

---

## API Endpoints Summary

### Implemented in `queries.ts` (with hooks):
| Endpoint | Method | Used By |
|---|---|---|
| `/auth/login` | POST | Login |
| `/auth/login/pin` | POST | Login |
| `/products` | GET | POS, Inventory |
| `/products` | POST | AddItemModal |
| `/products/categories` | GET | (hook exists, unused) |
| `/customers` | GET | Customers, POS, Rentals, Measurements |
| `/customers` | POST | Customers |
| `/customers/:id` | GET | (hook exists, unused) |
| `/customers/:id/loyalty` | POST | (hook exists, unused) |
| `/customers/:id/measurements` | GET, POST | Customers, Measurements |
| `/customers/measurements/all` | GET | Measurements |
| `/rentals` | GET | Rentals |
| `/rentals` | POST | Rentals |
| `/rentals/stats` | GET | Dashboard |
| `/rentals/overdue` | GET | (hook exists, unused) |
| `/rentals/:id/checkout` | PATCH | (hook exists, unused) |
| `/rentals/:id/checkin` | PATCH | (hook exists, unused) |
| `/orders` | GET | Reports |
| `/orders` | POST | POS |
| `/orders/summary` | GET | Dashboard, Reports |
| `/appointments` | GET | Appointments |
| `/appointments` | POST | Appointments |
| `/appointments/:id/status` | PUT | Appointments |
| `/tailoring` | GET | Tailoring |
| `/tailoring/:id/status` | PUT | Tailoring |
| `/inventory` | GET | Inventory |

### Missing (needed to remove static data):
| Endpoint | Purpose |
|---|---|
| `GET /settings` | Load store settings |
| `PUT /settings` | Save store settings |
| `GET /staff` | Load staff list for dropdowns |
| `POST /staff`, `PUT /staff/:id` | Manage staff |
| `GET /admin/tenants` | Load tenant list |
| `POST /admin/tenants` | Create tenant |
| `GET /dashboard/alerts` | Dynamic alerts |
| `GET /orders/recent` | Recent orders for dashboard |
| `GET /rentals/upcoming` | Upcoming pickups for dashboard |
| `GET /reports/category-sales` | Category breakdown |
| `GET /reports/revenue?period=` | Period-filtered revenue |
| `POST /tailoring` | Create tailoring job |
| `PUT /customers/:id` | Edit customer |
| `DELETE /customers/:id` | Delete customer |
| `GET /inventory/:id/stock` | Real stock levels |
| `PUT /inventory/:id/stock` | Update stock |

---

## Priority Recommendations

### 🔴 High Priority (fully static pages)
1. **Settings**: Wire `GET/PUT /settings` — this controls tax rates, store info, and receipt config used across the entire app
2. **Admin Panel**: Wire `GET /admin/tenants` — currently unusable with mock data
3. **Dashboard alerts, orders, pickups**: Replace 3 hardcoded arrays with live API queries

### ⚠️ Medium Priority (partial gaps)
4. **Reports category chart**: Add `GET /reports/category-sales` endpoint
5. **Reports period filter**: Wire the `period` state to actual API query params
6. **POS stock**: Replace `stock: 99` with real inventory availability
7. **Staff dropdown**: Create `GET /staff` and use it in Appointments + Settings

### 💡 Low Priority (polish)
8. **Tax rate**: Pull from settings API instead of `const TAX_RATE = 0.0875`
9. **Store name**: Pull from settings for receipt printing
10. **CRUD gaps**: Add edit/delete for Customers, Inventory, Measurements
