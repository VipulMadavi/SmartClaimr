# SmartClaimr — Build Journal

> This journal tracks decisions, progress, and lessons learned during the SmartClaimr MVP build.

---

## Phase 0: Project Scaffold — 2026-03-29 09:50 IST
**Duration**: ~20m planned
**What was built**: Monorepo scaffolded. React+Vite frontend with Tailwind v3, Express backend skeleton with SQLite ready. Root workspace config, .gitignore, README, and this journal.
**Decisions made**: SQLite over MongoDB for zero-config simplicity. Tailwind v3 for stability (not v4). Inter font from Google Fonts for fintech aesthetic. Indigo primary color palette for Stripe/Razorpay-inspired design.
**Blockers / Surprises**: —
**Commit**: `c0f00b9`

---

## Phase 1: Database + Auth — 2026-03-29 11:00 IST
**Duration**: ~35m actual / 45m planned
**What was built**: SQLite schema with 4 tables (companies, users, expenses, expense_approvals). Signup endpoint auto-creates company + admin user with JWT. Login endpoint validates credentials. Auth middleware with JWT verification and role-based access control. Frontend AuthPage with signup/login toggle form, AuthContext for state management, API service wrapper, and protected routes with BrowserRouter.
**Decisions made**: Used `better-sqlite3` transactions for atomic company+user creation. JWT tokens expire after 7 days. Passwords hashed with bcryptjs (10 rounds). CORS configured for multiple localhost ports. `react-router-dom` added for client routing.
**Blockers / Surprises**: CORS issue when Vite started on port 5174 instead of 5173 — fixed by accepting both ports. Signup response was missing currencyCode — fixed.
**Commit**: `pending`

---

## Phase 2: Admin Panel — 2026-03-29 11:30 IST
**Duration**: ~25m actual / 30m planned
**What was built**: Admin user management panel. Backend: `server/routes/users.js` with CRUD endpoints (GET list, POST create, PATCH update, DELETE remove) — all admin-only with `authenticate + authorize('admin')` middleware. Frontend: `AdminPage.jsx` with card-based user grid, stats row (admins/managers/employees counts), Add/Edit/Delete modals with form validation. `UserCard.jsx` component with role-specific avatar gradients, role badges (👑 Admin, 📋 Manager, 👤 Employee), manager relationship display (↑ arrow indicator), and hover-reveal edit/delete actions. Updated `Layout.jsx` with role-aware navigation (Dashboard + Team links for admins), user avatar with initials, and logout button. Skeleton loading states for async data fetching.
**Decisions made**: Card-based user list (not table) for better visual hierarchy and mobile readability. Users sorted by role priority (admin > manager > employee). Manager assignment validated server-side — employees can't be assigned as managers. Admin can't delete themselves or change their own role. DELETE cascades by nullifying manager_id references to deleted user.
**Blockers / Surprises**: None — clean execution. Browser test confirmed all flows: signup → navigate to Team → add manager → add employee with manager assignment → all stats and badges correct.
**Commit**: `pending`
