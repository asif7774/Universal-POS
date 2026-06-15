---
name: dashboard-backend-frontend-sync-fix
description: Workflow command scaffold for dashboard-backend-frontend-sync-fix in Universal-POS.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /dashboard-backend-frontend-sync-fix

Use this workflow when working on **dashboard-backend-frontend-sync-fix** in `Universal-POS`.

## Goal

Synchronize dashboard data logic between backend and frontend to fix or update metrics, filters, or display.

## Common Files

- `backend/src/orders/orders.controller.ts`
- `backend/src/orders/orders.service.ts`
- `backend/src/dashboard/dashboard.controller.ts`
- `frontend/src/lib/queries.ts`
- `frontend/src/pages/dashboard/index.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Update backend controller and/or service logic for dashboard or orders.
- Update frontend query utilities to match backend changes.
- Update frontend dashboard page to reflect new or fixed data.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.