---
name: dashboard-ui-component-update
description: Workflow command scaffold for dashboard-ui-component-update in Universal-POS.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /dashboard-ui-component-update

Use this workflow when working on **dashboard-ui-component-update** in `Universal-POS`.

## Goal

Update or fix dashboard UI components, such as KPI cards, analytics, or sidebar, often for bug fixes or UI improvements.

## Common Files

- `frontend/src/pages/dashboard/index.tsx`
- `frontend/src/pages/dashboard/components/PredictiveAnalytics.tsx`
- `frontend/src/components/organisms/sidebar/Sidebar.tsx`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Modify dashboard page or its child components.
- Adjust relevant component files (e.g., sidebar, analytics, KPI cards).
- Test changes in the dashboard view.

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.