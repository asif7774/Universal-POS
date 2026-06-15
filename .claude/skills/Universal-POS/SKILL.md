```markdown
# Universal-POS Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to the development patterns used in the Universal-POS repository, a TypeScript-based point-of-sale system. It covers coding conventions, file organization, and step-by-step workflows for maintaining dashboard data synchronization and UI updates. The guide also outlines testing patterns and provides quick-access commands for common tasks.

## Coding Conventions

**File Naming**
- Use camelCase for file names.
  - Example: `orderController.ts`, `predictiveAnalytics.tsx`

**Import Style**
- Both default and named imports are used, sometimes mixed within the same file.
  - Example:
    ```typescript
    import React from 'react';
    import { fetchOrders, fetchDashboardData } from './queries';
    ```

**Export Style**
- Named exports are preferred.
  - Example:
    ```typescript
    export function calculateKPI(data: OrderData[]): KPIResult { ... }
    ```

**Commit Message Style**
- Conventional commits with prefixes (e.g., `fix:`).
  - Example: `fix: correct order total calculation on dashboard`

## Workflows

### Dashboard Backend-Frontend Sync Fix
**Trigger:** When you need to fix or update dashboard metrics or filtering, requiring changes in both backend logic and frontend display.  
**Command:** `/sync-dashboard-fix`

1. **Update backend logic**  
   Edit the relevant controller or service to fix or update dashboard/order metrics.
   - Example:  
     `backend/src/orders/orders.controller.ts`  
     `backend/src/orders/orders.service.ts`  
     `backend/src/dashboard/dashboard.controller.ts`
2. **Update frontend queries**  
   Adjust query utilities to match the backend changes.
   - Example:  
     `frontend/src/lib/queries.ts`
3. **Update dashboard display**  
   Modify the dashboard page to reflect the new or fixed data.
   - Example:  
     `frontend/src/pages/dashboard/index.tsx`
4. **Test the integration**  
   Ensure the dashboard displays accurate data and filters work as expected.

**Code Example:**
```typescript
// backend/src/dashboard/dashboard.controller.ts
export function getDashboardMetrics(req, res) {
  // Updated logic for new metric
  res.json({ totalSales: calculateTotalSales(), ... });
}

// frontend/src/lib/queries.ts
export async function fetchDashboardMetrics() {
  const res = await fetch('/api/dashboard/metrics');
  return res.json();
}
```

---

### Dashboard UI Component Update
**Trigger:** When you want to fix a UI bug or improve a dashboard component's appearance or behavior.  
**Command:** `/update-dashboard-ui`

1. **Modify dashboard or child components**  
   Edit the dashboard page or its components (e.g., KPI cards, analytics, sidebar).
   - Example:  
     `frontend/src/pages/dashboard/index.tsx`  
     `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx`  
     `frontend/src/components/organisms/sidebar/Sidebar.tsx`
2. **Adjust component logic or styles**  
   Refactor, fix bugs, or enhance UI/UX.
3. **Test changes**  
   View the dashboard to ensure the UI updates are correct and functional.

**Code Example:**
```typescript
// frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx
export function PredictiveAnalytics({ data }) {
  return (
    <div className="analytics-card">
      <h3>Predicted Sales</h3>
      <span>{data.predictedSales}</span>
    </div>
  );
}
```

## Testing Patterns

- Test files use the pattern `*.test.*` (e.g., `orders.test.ts`).
- The testing framework is not explicitly detected, but typical TypeScript test conventions apply.
- Example test file structure:
  ```typescript
  // orders.test.ts
  import { calculateOrderTotal } from './orders.service';

  test('calculates order total correctly', () => {
    expect(calculateOrderTotal([{ price: 10, qty: 2 }])).toBe(20);
  });
  ```

## Commands

| Command               | Purpose                                                      |
|-----------------------|--------------------------------------------------------------|
| /sync-dashboard-fix   | Synchronize dashboard data logic between backend and frontend |
| /update-dashboard-ui  | Update or fix dashboard UI components                        |
```
