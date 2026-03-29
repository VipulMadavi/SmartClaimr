# SmartClaimr — Phase Plan & Execution Tracker

> **Purpose**: This file is the **single source of truth** for tracking MVP progress across multiple chat sessions. Before starting any work, read this file to determine which phase to execute next. After completing a phase, mark it as **✅ COMPLETED** with a timestamp.

> [!IMPORTANT]
> **How to use this file:**
> 1. Open a new chat session
> 2. Reference this file to see which phase is next
> 3. Execute ONLY that phase
> 4. Mark the phase completed below with date/time
> 5. Commit changes including this file update

---

## 🔒 Locked-In Tech Decisions

| Decision | Choice | Rationale |
|---|---|---|
| **Frontend** | React (Vite) + Tailwind CSS v3 | Fast setup, stable, well-documented |
| **Backend** | Node.js + Express | Simple REST APIs, fast to build |
| **Database** | SQLite (via `better-sqlite3`) | Zero-config, no external services, file-based |
| **OCR** | Tesseract.js | Free, no API key needed, runs in Node.js |
| **Currency API** | exchangerate-api.com | Free tier, no key required |
| **Country API** | restcountries.com | Free, no key required |
| **Deployment** | Deferred (local-only for MVP) | Will be addressed post-MVP |
| **Project Name** | SmartClaimr | Display name throughout the app |

---

## 📊 Progress Overview

| Phase | Title | Time Est. | Status |
|-------|-------|-----------|--------|
| 0 | Project Scaffold + Git Init | 20 min | ✅ COMPLETED |
| 1 | Database Models + Auth System | 45 min | ✅ COMPLETED |
| 2 | User Management — Admin Panel | 30 min | ⬜ NOT STARTED |
| 3 | Expense Submission + Feed UI | 45 min | ⬜ NOT STARTED |
| 4 | Approval Workflow | 50 min | ⬜ NOT STARTED |
| 5 | Currency Conversion | 20 min | ⬜ NOT STARTED |
| 6 | OCR Receipt Scanning + AI Suggestions | 40 min | ⬜ NOT STARTED |
| 7 | UI Polish + Responsive Design | 30 min | ⬜ NOT STARTED |
| 8 | Testing + Final Fixes + Release Tag | 20 min | ⬜ NOT STARTED |
| | **Total** | **~5 hrs** | |

---

## 🎯 Priority Tiers (If Time Runs Short)

| Priority | Features | Cut Strategy |
|----------|----------|--------------|
| **P0 — Must Ship** | Auth, expense submission, basic approval, feed UI | Never cut |
| **P1 — Should Ship** | Currency conversion, AI suggestions, OCR | Simplify: hardcoded rates, basic keyword matching |
| **P2 — Nice to Have** | Admin panel, UI polish, dark mode | Drop entirely if behind schedule |

---

## Phase 0: Project Scaffold + Git Init + Journal Setup

- **Status**: ✅ COMPLETED
- **Completed**: 2026-03-29 10:10 IST
- **Estimated Time**: 20 minutes

### Goal
Monorepo structure, all dependencies installed, git initialized, first journal entry written.

### Tasks

- [x] Create root `package.json` (workspace config)
- [x] Create `.gitignore` (Node, env, build artifacts, SQLite DB files)
- [x] Create `README.md` with project overview
- [x] Create `journal.md` with first entry
- [x] Scaffold `client/` — `npx -y create-vite@latest ./client --template react`
- [x] Install & configure Tailwind CSS v3 in client
- [x] Set up Tailwind config with fintech color palette (indigo primary, slate backgrounds)
- [x] Add Inter font from Google Fonts
- [x] Create base layout component with simple nav placeholder
- [x] Scaffold `server/` — `npm init -y`
- [x] Install server deps: `express`, `cors`, `dotenv`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`
- [x] Create `server/app.js` with basic Express + CORS + JSON middleware
- [x] Create `server/.env` with `JWT_SECRET`, `DB_PATH`
- [x] Verify both `client` and `server` start without errors
- [x] Git init + first commit

### Files to Create
```
SmartClaimr/
├── package.json
├── .gitignore
├── README.md
├── journal.md
├── PHASE_PLAN.md          (this file — already exists)
├── client/                (Vite + React + Tailwind v3)
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css       (Tailwind directives + custom styles)
│       └── components/
│           └── Layout.jsx
└── server/
    ├── package.json
    ├── .env
    └── app.js
```

### Acceptance Criteria
- [x] `cd client && npm run dev` → Vite dev server starts, shows styled page
- [x] `cd server && node app.js` → Express server starts on port 5000
- [x] Tailwind classes render correctly (test with a colored div)
- [x] Git repo initialized with first commit

### Git
```
git init
git add .
git commit -m "chore: project scaffold — React+Vite client, Express server, docs, journal"
```

### Journal Entry Template
```markdown
## Phase 0: Project Scaffold — <TIMESTAMP>
**Duration**: Xm actual / 20m planned
**What was built**: Monorepo scaffolded. React+Vite frontend with Tailwind v3, Express backend skeleton with SQLite ready.
**Decisions made**: SQLite over MongoDB for zero-config simplicity. Tailwind v3 for stability.
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 1: Database Models + Auth System

- **Status**: ✅ COMPLETED
- **Completed**: 2026-03-29 11:00 IST
- **Estimated Time**: 45 minutes
- **Depends on**: Phase 0 ✅

### Goal
SQLite database schema, signup (auto-creates company + admin), login, JWT middleware.

### Tasks

- [x] Create SQLite database initialization script (`server/db/init.js`)
- [x] Define tables: `companies`, `users`, `expenses`, `expense_approvals`
- [x] Create `server/middleware/auth.js` — JWT verification + role-checking
- [x] Create `server/routes/auth.js` — signup & login endpoints
- [x] `POST /api/auth/signup` → creates company + admin user, returns JWT
- [x] `POST /api/auth/login` → validates credentials, returns JWT
- [x] Create `client/src/pages/AuthPage.jsx` — signup/login toggle form
- [x] Create `client/src/context/AuthContext.jsx` — React context for auth state
- [x] Wire up frontend to backend auth endpoints
- [x] Test full signup → login flow

### Files to Create
```
server/
├── db/
│   ├── init.js             (schema creation + connection)
│   └── smartclaimr.db      (auto-generated SQLite file)
├── middleware/
│   └── auth.js             (JWT verify + role check)
└── routes/
    └── auth.js             (signup + login)

client/src/
├── pages/
│   └── AuthPage.jsx        (signup/login form)
├── context/
│   └── AuthContext.jsx      (auth state management)
└── services/
    └── api.js              (axios/fetch wrapper with JWT)
```

### Database Schema
```sql
CREATE TABLE companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  currency_code TEXT NOT NULL DEFAULT 'INR',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'employee')),
  manager_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (manager_id) REFERENCES users(id)
);

CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  currency_code TEXT NOT NULL,
  amount_in_company_currency REAL,
  category TEXT NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
  receipt_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES users(id)
);

CREATE TABLE expense_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_id INTEGER NOT NULL,
  approver_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('approved', 'rejected')),
  comment TEXT,
  acted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (expense_id) REFERENCES expenses(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);
```

### Acceptance Criteria
- [x] SQLite DB file is auto-created on server start with correct schema
- [x] Signup creates a new company + admin user, returns valid JWT
- [x] Login with correct creds returns JWT; wrong creds returns 401
- [x] Protected route returns 403 without valid JWT
- [x] Frontend signup form connects to backend successfully

### Git
```
git add .
git commit -m "feat(phase-1): auth system — signup with auto company creation, login, JWT, SQLite schema"
```

### Journal Entry Template
```markdown
## Phase 1: Database + Auth — <TIMESTAMP>
**Duration**: Xm actual / 45m planned
**What was built**: SQLite schema (companies, users, expenses, approvals). Signup + login with JWT. Auth context on frontend.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 2: User Management — Admin Panel

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 30 minutes
- **Depends on**: Phase 1 ✅
- **Priority**: P2 (can be dropped if behind schedule)

### Goal
Admin can create employees and managers, assign manager relationships.

### Tasks

- [ ] Create `server/routes/users.js`
- [ ] `GET /api/users` — list all company users (admin only)
- [ ] `POST /api/users` — create user with role + managerId (admin only)
- [ ] `PATCH /api/users/:id` — update role or managerId
- [ ] Create `client/src/pages/AdminPage.jsx`
- [ ] Card-based user list (NOT a table)
- [ ] "Add User" modal: name, email, role dropdown, manager dropdown
- [ ] Each user card: name, role badge, assigned manager
- [ ] Add route/nav link for admin page
- [ ] Test: admin creates employee, assigns manager

### Files to Create
```
server/routes/users.js
client/src/pages/AdminPage.jsx
client/src/components/UserCard.jsx
```

### Acceptance Criteria
- [ ] Admin can view list of all company users
- [ ] Admin can create a new user (employee or manager)
- [ ] Admin can assign/change a user's manager
- [ ] Non-admin users cannot access these endpoints (403)

### Git
```
git add .
git commit -m "feat(phase-2): admin user management — create employees, assign managers"
```

### Journal Entry Template
```markdown
## Phase 2: Admin Panel — <TIMESTAMP>
**Duration**: Xm actual / 30m planned
**What was built**: Admin page with card-based user list. CRUD for users with role assignment.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 3: Expense Submission + Feed UI

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 45 minutes
- **Depends on**: Phase 1 ✅

### Goal
Employee can submit expenses with form, view their expense feed with status tracking.

### Tasks

- [ ] Create `server/routes/expenses.js`
- [ ] `POST /api/expenses` — create expense (employee)
- [ ] `GET /api/expenses` — scoped by role (employee: own, manager: team, admin: all)
- [ ] `GET /api/expenses/:id` — single expense with approval history
- [ ] Create `client/src/pages/Dashboard.jsx`
- [ ] Greeting header with summary stats (total pending, approved this month)
- [ ] Expense feed — vertical card list
- [ ] Floating "+ Add Expense" FAB button
- [ ] Filter tabs: All / Pending / Approved / Rejected
- [ ] Create `client/src/pages/AddExpense.jsx`
- [ ] Receipt upload area (top, prominent)
- [ ] Form: amount, currency dropdown, category dropdown, description, date
- [ ] "Amount in company currency" read-only display (placeholder for Phase 5)
- [ ] Submit button
- [ ] Create `client/src/components/ExpenseCard.jsx`
- [ ] Amount (big, bold), category icon + label, date
- [ ] Status badge (pending=yellow, approved=green, rejected=red)
- [ ] AI suggestion line (placeholder for Phase 6)

### Files to Create
```
server/routes/expenses.js
client/src/pages/Dashboard.jsx
client/src/pages/AddExpense.jsx
client/src/components/ExpenseCard.jsx
```

### Acceptance Criteria
- [ ] Employee can submit an expense via form
- [ ] Dashboard shows expense feed with card layout
- [ ] Filter tabs correctly filter by status
- [ ] Status badges display correct colors
- [ ] FAB button navigates to expense submission form

### Git
```
git add .
git commit -m "feat(phase-3): expense submission + feed-based dashboard with card UI"
```

### Journal Entry Template
```markdown
## Phase 3: Expense Feed — <TIMESTAMP>
**Duration**: Xm actual / 45m planned
**What was built**: Expense submission form + feed-based dashboard. Card UI with status badges and filter tabs.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 4: Approval Workflow

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 50 minutes
- **Depends on**: Phase 3 ✅

### Goal
Manager sees pending approvals in a feed, can approve/reject with one tap. Simple 2-level logic.

### Tasks

- [ ] Create `server/routes/approvals.js`
- [ ] `GET /api/approvals/pending` — expenses awaiting current user's approval
- [ ] `POST /api/approvals/:expenseId/approve` — approve + advance or finalize
- [ ] `POST /api/approvals/:expenseId/reject` — reject + finalize
- [ ] Implement approval logic:
  ```
  IF amount < threshold (₹5000):
      Manager approves → DONE
  IF amount >= threshold:
      Manager approves → goes to Admin → Admin approves → DONE
  ANY rejection → DONE (rejected)
  ```
- [ ] Create `client/src/pages/ApprovalsPage.jsx`
- [ ] Feed of pending expense cards
- [ ] Each card has Approve (green) + Reject (red) buttons
- [ ] Optional comment text input
- [ ] On action: card animates out, toast notification
- [ ] Modify `ExpenseCard.jsx` — add `variant` prop (`"view"` vs `"action"`)
- [ ] Action variant shows approve/reject buttons

### Files to Create/Modify
```
server/routes/approvals.js          (NEW)
client/src/pages/ApprovalsPage.jsx  (NEW)
client/src/components/ExpenseCard.jsx (MODIFY — add variant prop)
```

### Acceptance Criteria
- [ ] Manager sees only their team's pending expenses
- [ ] Manager can approve → expense status changes to "approved"
- [ ] Manager can reject → expense status changes to "rejected"
- [ ] High-value expenses (≥ ₹5000) go to admin after manager approval
- [ ] Admin can approve/reject escalated expenses
- [ ] Toast notification shows on approve/reject action

### Git
```
git add .
git commit -m "feat(phase-4): approval workflow — manager feed, approve/reject, 2-level logic"
```

### Journal Entry Template
```markdown
## Phase 4: Approval Workflow — <TIMESTAMP>
**Duration**: Xm actual / 50m planned
**What was built**: Manager approval feed with approve/reject actions. 2-level approval for high-value expenses.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 5: Currency Conversion

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 20 minutes
- **Depends on**: Phase 3 ✅

### Goal
Multi-currency expense submission with auto-conversion to company base currency.

### Tasks

- [ ] Create `server/services/currency.js`
- [ ] Fetch rates from `exchangerate-api.com`, cache for 1 hour (in-memory Map)
- [ ] `convertCurrency(amount, fromCurrency, toCurrency)` function
- [ ] Modify `server/routes/expenses.js`
- [ ] On expense creation: call `convertCurrency()`, store `amount_in_company_currency`
- [ ] Fallback: if API fails, allow manual entry
- [ ] Modify `client/src/pages/AddExpense.jsx`
- [ ] Currency dropdown populated from restcountries API
- [ ] Live converted amount display on currency/amount change

### Files to Create/Modify
```
server/services/currency.js         (NEW)
server/routes/expenses.js           (MODIFY)
client/src/pages/AddExpense.jsx     (MODIFY)
```

### Acceptance Criteria
- [ ] Selecting a foreign currency shows converted amount in company base currency
- [ ] Converted amount is stored in database alongside original
- [ ] Rates are cached (not fetched on every request)
- [ ] Graceful fallback if exchange rate API is down

### Git
```
git add .
git commit -m "feat(phase-5): multi-currency support — auto-conversion on expense submit"
```

### Journal Entry Template
```markdown
## Phase 5: Currency Conversion — <TIMESTAMP>
**Duration**: Xm actual / 20m planned
**What was built**: Currency conversion service with caching. Auto-conversion on expense submission. Live display in form.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 6: OCR Receipt Scanning + AI Suggestions

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 40 minutes
- **Depends on**: Phase 3 ✅

### Goal
Upload receipt → auto-fill form fields. AI suggestions displayed on every expense card.

### Tasks

- [ ] Create `server/routes/ocr.js`
- [ ] `POST /api/ocr/parse` — accepts image upload (multer), runs Tesseract.js
- [ ] Extract text, apply keyword matching for category detection
- [ ] Return: `{ amount, date, description, merchant, category }`
- [ ] Create `server/services/aiSuggestions.js`
- [ ] Rule-based engine (no ML):
  - Amount < 1000 → `"Safe to approve"`
  - 1000–5000 → `"Looks normal"`
  - Amount > 5000 → `"Unusual amount — review carefully"`
  - Same amount + same date → `"Possible duplicate expense"`
- [ ] Category detection via keywords: "uber" → Travel, "cafe" → Food, etc.
- [ ] Modify `client/src/pages/AddExpense.jsx`
- [ ] On receipt upload: call `/api/ocr/parse`, auto-fill form fields
- [ ] Show AI suggestion banner: `"🧠 Detected a Food expense from McDonald's"`
- [ ] Modify `client/src/components/ExpenseCard.jsx`
- [ ] Display AI suggestion line: `🧠 AI: Safe to approve`
- [ ] Color-coded: green (safe), orange (warning), red (risk)

### Files to Create/Modify
```
server/routes/ocr.js                (NEW)
server/services/aiSuggestions.js     (NEW)
client/src/pages/AddExpense.jsx      (MODIFY)
client/src/components/ExpenseCard.jsx (MODIFY)
```

### Acceptance Criteria
- [ ] Uploading a receipt image triggers OCR and auto-fills form fields
- [ ] Category is auto-detected from receipt text
- [ ] AI suggestion appears on every expense card (color-coded)
- [ ] Duplicate detection flags matching expenses
- [ ] User can override all auto-filled values before submitting

### Git
```
git add .
git commit -m "feat(phase-6): OCR receipt scanning + AI smart suggestions on expense cards"
```

### Journal Entry Template
```markdown
## Phase 6: OCR + AI — <TIMESTAMP>
**Duration**: Xm actual / 40m planned
**What was built**: Tesseract.js OCR receipt scanning. Rule-based AI suggestions. Auto-fill on receipt upload.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 7: UI Polish + Responsive Design

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 30 minutes
- **Depends on**: Phases 3, 4 ✅ (minimum)

### Goal
Make it look like a fintech app, not a hackathon project. Mobile-first responsive.

### Tasks

- [ ] Apply fintech color palette across all pages:
  - Indigo primary, emerald success, amber warning, rose danger, slate backgrounds
- [ ] Typography: Inter font, proper hierarchy (amount=2xl bold, labels=sm text-gray)
- [ ] Cards: rounded-xl, soft shadows, hover lift animation
- [ ] Buttons: large, pill-shaped, micro-animations on tap
- [ ] Smooth page transitions, card entry animations (stagger)
- [ ] Create `client/src/components/Toast.jsx` — success/error with auto-dismiss
- [ ] Create `client/src/components/Navbar.jsx`
  - Top nav: logo + user name + role badge + logout
  - Mobile: hamburger drawer or bottom tab bar
- [ ] Add skeleton loaders for data fetching states
- [ ] Mobile responsive: bottom nav bar, full-width cards, FAB button
- [ ] Dark mode (stretch — only if time allows)

### Files to Create/Modify
```
client/src/components/Navbar.jsx     (NEW)
client/src/components/Toast.jsx      (NEW)
client/src/index.css                 (MODIFY — global styles)
All pages and components              (MODIFY — polish)
```

### Acceptance Criteria
- [ ] App looks like a modern fintech product (not a hackathon prototype)
- [ ] All cards have shadows, rounded corners, hover effects
- [ ] Typography hierarchy is clear and consistent
- [ ] Toast notifications work for all user actions
- [ ] Navigation works on both desktop and mobile viewports
- [ ] Loading states show skeleton placeholders

### Git
```
git add .
git commit -m "feat(phase-7): UI polish — fintech styling, animations, responsive layout"
```

### Journal Entry Template
```markdown
## Phase 7: UI Polish — <TIMESTAMP>
**Duration**: Xm actual / 30m planned
**What was built**: Fintech-grade styling, animations, responsive layout, toast system, navbar.
**Decisions made**: <fill in>
**Blockers / Surprises**: <fill in>
**Commit**: `<hash>`
```

---

## Phase 8: Testing + Final Fixes + Release Tag

- **Status**: ⬜ NOT STARTED
- **Completed**: —
- **Estimated Time**: 20 minutes
- **Depends on**: All previous phases ✅

### Goal
Smoke test all flows, fix critical bugs, finalize journal, tag release.

### Testing Checklist

- [ ] Signup → creates company + admin
- [ ] Login → returns JWT, redirects to dashboard
- [ ] Admin creates employee + manager
- [ ] Employee submits expense (with currency conversion)
- [ ] Receipt upload → OCR auto-fills fields
- [ ] Expense shows in manager's approval feed with AI suggestion
- [ ] Manager approves → status updates
- [ ] Manager rejects → status updates
- [ ] Expense history filters work
- [ ] Mobile responsive layout works
- [ ] No console errors on any page

### Tasks

- [ ] Run through full testing checklist above
- [ ] Fix any critical bugs found
- [ ] Write final journal entry summarizing entire build
- [ ] Note known issues / tech debt in journal
- [ ] Create final git commit + tag

### Acceptance Criteria
- [ ] All testing checklist items pass
- [ ] No blocking bugs remain
- [ ] Journal has entries for all completed phases
- [ ] Git tag `v0.1.0-mvp` created

### Git
```
git add .
git commit -m "chore(phase-8): testing, bug fixes, final journal entry"
git tag -a v0.1.0-mvp -m "SmartClaimr MVP — 5 hour build"
```

### Journal Entry Template
```markdown
## Phase 8: Testing + Release — <TIMESTAMP>
**Duration**: Xm actual / 20m planned
**What was built**: Final testing pass. Bug fixes for: <list>. Tagged v0.1.0-mvp.
**Known issues**: <list tech debt>
**Total build time**: X hours Y minutes
**Commit**: `<hash>`
```

---

## 📋 Cross-Chat Instructions for AI Agents

> [!IMPORTANT]
> **Read this section at the start of every new chat session.**

1. **Always read `PHASE_PLAN.md` first** to determine the current state of the project.
2. **Execute only ONE phase per chat session** unless the user explicitly asks for more.
3. **After completing a phase:**
   - Update the phase status from `⬜ NOT STARTED` → `✅ COMPLETED`
   - Add the completion date next to **Completed**: `—` → `2026-03-29 10:30 IST`
   - Update the Progress Overview table at the top
   - Check off all completed task checkboxes in the phase
   - Update `journal.md` with the phase entry
   - Make the git commit as specified
4. **If a phase fails or is partially complete:**
   - Update status to `🟡 IN PROGRESS` or `⚠️ BLOCKED`
   - Note what was done and what remains in the phase section
5. **Never skip phases** unless the user explicitly requests it.
6. **If behind schedule**, refer to the Priority Tiers table — P2 phases can be dropped.
7. **SQLite is the database** — do NOT use MongoDB or any other database.
8. **Tailwind v3** — do NOT use v4 or any other CSS framework.

---

## 🗒️ Execution Log

> Record high-level notes here when completing phases across sessions.

| Date | Phase | Chat Session | Notes |
|------|-------|-------------|-------|
| 2026-03-29 10:10 IST | Phase 0 | cc1cca09 | Scaffold complete. Vite+React+TW3 client, Express server, all verified. Commit: c0f00b9 |
| 2026-03-29 11:00 IST | Phase 1 | 099316f9 | Auth system complete. SQLite schema (4 tables), signup/login/JWT, AuthContext, AuthPage, protected routes. All tests passing. |
