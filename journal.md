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

---

## Phase 3: Expense Feed — 2026-03-29 12:00 IST
**Duration**: ~30m actual / 45m planned
**What was built**: Full expense submission and feed system. Backend: `server/routes/expenses.js` with role-scoped access (employee sees own, manager sees team's, admin sees all company expenses). Three endpoints: POST create, GET list with pagination/stats/filters, GET by ID with approval history. Frontend: `Dashboard.jsx` replacing the placeholder — greeting header with time-of-day awareness, 4 summary stat cards (Total, Pending, Approved, Rejected), filter tabs with live counts, vertical expense card feed with staggered animations, skeleton loading states, empty states per filter, and floating action button (FAB). `AddExpense.jsx` — receipt upload area (drag & drop ready for Phase 6 OCR), amount input with currency symbol prefix + dropdown (10 common currencies), 3×3 category grid with emoji icons (Food, Travel, Lodging, Transport, Office Supplies, Software, Entertainment, Communication, Other), description textarea, date picker, real-time preview card, submit with loading spinner. `ExpenseCard.jsx` — reusable card with category-specific gradient icons, formatted currency amounts (Intl.NumberFormat), status badges (pending=yellow, approved=green, rejected=red), date + employee name, placeholders for AI suggestions (Phase 6) and action buttons (Phase 4). Updated `App.jsx` — replaced inline Dashboard placeholder with real component, added /expenses/new route. Updated `server/app.js` — registered expenses router.
**Decisions made**: Category grid with emoji icons instead of a dropdown for better UX — makes category selection visual and fast. Summary stats computed in a separate query without status filter to always show accurate totals regardless of active filter. Currency formatting uses Intl.NumberFormat for locale-aware display. Receipt upload is visual-only for now (base64 preview) — actual OCR processing deferred to Phase 6. FAB button fixed position for mobile-first accessibility.
**Blockers / Surprises**: None — clean implementation. Browser test confirmed: expenses submit successfully, dashboard stats update in real-time, filter tabs work correctly with counts, empty states display properly.
**Commit**: `pending`

---

## Phase 4: Approval Workflow — 2026-03-29 12:40 IST
**Duration**: ~35m actual / 50m planned
**What was built**: Complete 2-level approval workflow. Backend: `server/routes/approvals.js` with 3 endpoints — `GET /api/approvals/pending` (role-scoped: manager sees direct reports' pending expenses, admin sees high-value escalated expenses), `POST /api/approvals/:expenseId/approve` (manager approves low-value <₹5000 → finalized; manager approves high-value ≥₹5000 → escalated to admin; admin approves → always finalized), `POST /api/approvals/:expenseId/reject` (any rejection at any level → immediately finalized as rejected). Both approve/reject support optional comments, recorded in `expense_approvals` table with approver identity and timestamp. Frontend: `ApprovalsPage.jsx` — pending expense feed for managers/admins with "Awaiting action" counter, expense cards with action variant showing Approve (green) / Reject (red) buttons, optional comment toggle with text input, card exit animation on action (opacity+scale+translate), toast notifications (green success / red error, auto-dismiss after 3.5s), skeleton loading states, and "All caught up! 🎉" empty state. Enhanced `ExpenseCard.jsx` — added `action` variant with working callbacks (onApprove, onReject), processing spinner on buttons during API calls, "⚡ High Value" amber badge for expenses ≥₹5000, approval history display for escalated items, disabled state during processing. Updated `Layout.jsx` — added Approvals nav link (✅ icon) visible to both manager and admin roles. Updated `App.jsx` — added `/approvals` protected route. Updated `server/app.js` — registered approvals router.
**Decisions made**: ₹5000 threshold for 2-level approvals (configurable server-side constant). Card animation uses CSS transitions (400ms ease-out) with opacity + scale + translate for smooth exit. Toast auto-dismisses after 3.5s. Comment is optional by default with toggle to reduce friction on quick approvals. "High Value" badge uses amber styling to draw attention without alarming.
**Blockers / Surprises**: None — tested full flow: created manager + employee test users, employee's expenses appeared correctly in manager's approval feed, approve action finalized low-value expense, reject action finalized high-value expense, status updates reflected in database and UI.
**Commit**: `pending`

---

## Phase 5: Currency Conversion — 2026-03-29 12:55 IST
**Duration**: ~15m actual / 20m planned
**What was built**: Multi-currency expense submission with real-time auto-conversion. Backend: `server/services/currency.js` — currency conversion service that fetches exchange rates from `https://api.exchangerate-api.com/v4/latest/{BASE}` with in-memory caching (Map with 1-hour TTL). Exports `convertCurrency(amount, from, to)` returning `{ convertedAmount, rate }`, `getRate(from, to)`, and `getCacheStats()`. Graceful fallback: returns stale cache if API is down, returns null if no cache exists (allowing manual entry). Modified `server/routes/expenses.js` — added `GET /api/expenses/convert?amount=X&from=USD&to=INR` endpoint for live frontend preview. Modified `POST /api/expenses` to be async and call `convertCurrency()` on creation, storing the converted amount in `amount_in_company_currency` column. If conversion fails, expense is still submitted with null conversion (can be retried later). Frontend: Rewrote `client/src/pages/AddExpense.jsx` — added `useEffect` with 400ms debounce that calls `/api/expenses/convert` whenever amount or currency changes. Shows three states: (1) loading spinner with "Converting...", (2) amber fallback warning if API unavailable, (3) branded conversion display with `💱` icon, converted amount in company currency, exchange rate line (e.g. "1 USD = 94.7700 INR"), and a "Live rate" badge. Preview card also shows the converted amount for foreign currencies.
**Decisions made**: Used hardcoded list of 10 common currencies (INR, USD, EUR, GBP, JPY, AUD, CAD, SGD, AED, CHF) instead of fetching from restcountries API — more reliable and faster, avoids an additional API dependency. 400ms debounce prevents excessive API calls while user types. Conversion endpoint placed at `/expenses/convert` (before `/:id` route) to avoid route collision with Express param matching. Used Node.js built-in `fetch` (Node 18+) — no additional dependencies needed.
**Blockers / Surprises**: None — API responded correctly. Verified in browser: 500 USD → ₹47,385.00 at 1 USD = 94.7700 INR rate. Caching confirmed working (subsequent requests served from cache).
**Commit**: `pending`

---

## Phase 6: OCR + AI — 2026-03-29 13:25 IST
**Duration**: ~35m actual / 40m planned
**What was built**: OCR receipt scanning via Tesseract.js and rule-based AI suggestions. Backend: `server/routes/ocr.js` — POST `/api/ocr/parse` accepts image uploads via multer (memory storage, 10MB limit, image-only filter), runs Tesseract.js OCR, passes extracted text through `aiSuggestions.js` parser. `server/services/aiSuggestions.js` — comprehensive rule-based engine: `extractAmount()` searches for "total" keywords then falls back to largest number; `extractDate()` handles ISO, DD/MM/YYYY, and named month formats; `extractMerchant()` takes first non-numeric line; `detectCategory()` uses weighted keyword matching across 8 categories (food, travel, lodging, transport, office_supplies, software, entertainment, communication); `generateApprovalSuggestion()` returns color-coded suggestions (safe <₹1K, normal ₹1-5K, warning >₹5K, danger=duplicate). Duplicate detection via same employee + amount + date SQL query. Frontend: `AddExpense.jsx` calls `/api/ocr/parse` on receipt upload, auto-fills form fields (amount, date, description, category), shows "🧠 Scanning receipt with AI..." loading state, "✓ Receipt scanned" success indicator, AI suggestion banner with detection details. `ExpenseCard.jsx` — color-coded AI suggestion line on every card with 4 levels (green safe, blue normal, amber warning, red danger). Modified `server/routes/expenses.js` to call `generateApprovalSuggestion()` on every expense and attach `ai_suggestion` + `ai_suggestion_level` to API responses.
**Decisions made**: Rule-based AI over ML — deterministic, no training data needed, fast execution. Keyword lists optimized for Indian market (Swiggy, Zomato, Ola, etc.). Tesseract runs on raw buffer (no temp file writes). OCR suggestion message is human-friendly ("Detected a Food expense from McDonald's").
**Blockers / Surprises**: None — Tesseract.js 7.x works well with buffer input. Category detection accuracy is surprisingly good for structured receipts.
**Commit**: `pending`

---

## Phase 7: UI Polish — 2026-03-29 13:40 IST
**Duration**: ~20m actual / 30m planned
**What was built**: Fintech-grade UI polish and responsive design overhaul. Created `client/src/components/Navbar.jsx` — full navigation component extracted from Layout: desktop top nav with SVG icons for Dashboard/Approvals/Team (stroke-based, thicker when active), active state with bottom indicator line, glassmorphism with saturated blur, user avatar with ring highlight. Mobile: bottom tab bar with Home/Approve/Team/Logout tabs, icon-label layout, safe-area-inset support for notched phones. Created `client/src/components/Toast.jsx` — global toast notification system using React context: `ToastProvider` wraps app, `useToast()` hook for any component; supports 4 types (success/error/warning/info) with gradient backgrounds, icon badges, slide-in/out animations, auto-dismiss configurable duration, manual dismissal, stacking support. Replaced inline toast in ApprovalsPage, added toast to AddExpense on submit success. Enhanced `client/src/index.css` — toast keyframe animations (toastIn/toastOut), skeleton shimmer effect (CSS gradient animation), pulse-ring animation for FAB, improved glassmorphism (blur 16px + saturate 180%), hover states on inputs, mobile card rounding adjustments. Updated `tailwind.config.js` — glow shadows (brand/success/danger), bounceIn animation, softer card shadows, xs breakpoint (475px). Updated `Layout.jsx` — simplified to use Navbar component, added mobile bottom padding for fixed bottom nav. Updated `App.jsx` — wrapped with ToastProvider, enhanced loading spinner with pulse-ring glow. Updated `Dashboard.jsx` — FAB now has pulse-ring animation + glow-brand shadow, repositioned above mobile bottom nav (bottom-24 on mobile). Updated `AuthPage.jsx` — subtle gradient background (via-brand-50/30), larger logo with glow shadow.
**Decisions made**: Bottom tab bar instead of hamburger menu for mobile — better discoverability. SVG icons over emoji for nav — cleaner, scalable, supports active/inactive states. Toast context over prop drilling — any component can trigger toasts without threading callbacks. Dark mode deferred (stretch goal — not enough time).
**Blockers / Surprises**: None — clean execution. Vite HMR handled all changes without restarts. Mobile viewport tested at 375x667 — bottom nav renders perfectly.
**Commit**: `pending`
