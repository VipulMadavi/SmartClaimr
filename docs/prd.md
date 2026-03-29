**PRODUCT REQUIREMENTS DOCUMENT**

Reimbursement Management System

Version 1.0 | March 2026 | Odoo Project

| **Document Status**<br><br>Draft - Ready for Review | **Target Delivery**<br><br>5 Hours Hackathon Build |
| --------------------------------------------------- | -------------------------------------------------- |

# **1\. Overview**

Companies frequently struggle with manual expense reimbursement workflows that are slow, error-prone, and opaque. This PRD defines the requirements for a Reimbursement Management System that brings structured, transparent, and configurable expense approval workflows to organizations of any size.

**Problem Statement**

Manual expense reimbursement is time-consuming and error-prone.

No structured way to define approval flows based on expense thresholds.

Multi-level approvals are impossible to manage without tooling.

Flexible, conditional approval rules cannot be configured without code changes.

Employees have no visibility into where their expense claim currently stands.

# **2\. Goals & Success Criteria**

## **2.1 Project Goals**

- Automate the end-to-end expense submission and approval workflow.
- Support multi-role access: Admin, Manager, and Employee.
- Enable configurable sequential multi-level approvals with conditional logic.
- Support multi-currency expense submission with real-time conversion.
- Provide OCR-powered receipt scanning to reduce manual data entry.
- Deliver a fully functional MVP within a 5-hour build window.

## **2.2 Success Criteria**

- An employee can sign up, submit an expense in any currency, and track its status.
- A manager can see pending approvals and act on them with comments.
- An admin can configure approval chains with percentage, specific-approver, or hybrid rules.
- Currency conversion works correctly for all submitted expenses.
- OCR auto-populates expense fields from a scanned receipt image.

# **3\. Scope**

## **3.1 In Scope**

- Authentication: signup, login, session management.
- Auto-creation of Company and Admin User on first signup.
- User management by Admin (create, assign roles, define manager relationships).
- Expense submission by Employee with multi-currency support.
- Sequential multi-step approval workflow.
- Manager-first approval flag (IS MANAGER APPROVER).
- Conditional approval rules: percentage, specific approver, hybrid.
- Combination of sequential and conditional flows.
- Currency conversion via external API.
- OCR receipt scanning to auto-fill expense fields.
- Expense history (approved, rejected) for employees.
- Admin expense dashboard (all expenses, override capability).

## **3.2 Out of Scope**

- Payment/disbursement processing (the system approves; payment is external).
- Mobile native apps (responsive web is sufficient).
- Third-party ERP integrations (e.g., SAP, QuickBooks) in v1.
- Analytics dashboards and reporting beyond basic expense history.

# **4\. User Roles & Permissions**

Three roles exist in the system. A user's role is set by the Admin and can be changed at any time.

| **Role** | **Permissions**                                                                                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Admin    | Create company (auto on signup), manage users, set roles, configure approval rules, view all expenses, override approvals |
| Manager  | Approve/reject expenses (amount visible in company's default currency), view team expenses, escalate as per rules         |
| Employee | Submit expenses, view their own expenses, check approval status                                                           |

**Important: Role Assignment Rules**

On first signup, the registering user is automatically assigned the Admin role and a new Company is created.

Only Admins can create new users and change roles.

A Manager can also hold the Employee role and submit their own expenses.

Manager relationships are defined by Admin and determine the first-step approver.

# **5\. Feature Specifications**

## **5.1 Authentication & User Management**

### **5.1.1 Signup & Auto-Company Creation**

- On first signup, the system auto-creates a Company record.
- Company currency is set based on the selected country (using restcountries API).
- The signing-up user is assigned the Admin role automatically.
- Subsequent signups (invite links or admin-created accounts) do not create new companies.

### **5.1.2 Admin User Management**

- Admin can create new Employees and Managers from the admin panel.
- Admin can assign and change roles (Employee, Manager).
- Admin can define manager relationships: link an Employee to their Manager.
- Admin can override any approval and view all company expenses.

## **5.2 Expense Submission (Employee)**

### **5.2.1 Submit Expense**

Employees can submit expense claims through a dedicated form with the following fields:

- Amount - can be entered in any currency (not limited to company currency).
- Currency - selected from a dropdown populated via the restcountries API.
- Amount in Company Currency - auto-calculated using exchange rate API (read-only display).
- Category - dropdown (e.g., Travel, Meals, Accommodation, Office Supplies, Other).
- Description - free-text field.
- Date - date of the expense.
- Receipt - optional image upload; triggers OCR auto-fill when provided.

### **5.2.2 Expense History**

- Employees can view a list of their own expenses.
- Filter by status: All, Pending, Approved, Rejected.
- Each expense shows: amount, currency, converted amount, category, date, current approver, status, comments.

## **5.3 Approval Workflow**

### **5.3.1 Sequential Multi-Level Approval**

The Admin configures an ordered list of approvers (an approval chain). Expenses move through the chain one step at a time:

- Expense submitted by Employee.
- If IS MANAGER APPROVER is checked for the employee's assigned manager, the manager is automatically inserted as Step 1.
- The current approver receives a pending notification/request in their dashboard.
- Approver reviews, then Approves or Rejects with a comment.
- On Approval: expense moves to the next step in the chain.
- On Rejection: expense is immediately marked Rejected and the employee is notified.
- After all steps are approved: expense is marked Approved.

**Example Approval Chain**

Step 1 → Manager (auto-inserted if IS MANAGER APPROVER is checked)

Step 2 → Finance

Step 3 → Director

Each step only becomes active after the previous step approves.

### **5.3.2 IS MANAGER APPROVER Flag**

- Each employee has an IS MANAGER APPROVER boolean field.
- When true, the employee's assigned Manager is prepended as the first approver, before the configured approval chain.
- When false, the expense goes directly into the configured chain.

## **5.4 Conditional Approval Flow**

Admin can configure conditional rules that trigger auto-approval based on approver actions, independent of (or combined with) the sequential flow.

### **5.4.1 Rule Types**

- Percentage Rule - If X% of the assigned approvers approve the expense, it is automatically marked Approved regardless of remaining steps. Example: 60% of approvers approve.
- Specific Approver Rule - If a designated approver (e.g., CFO) approves, the expense is automatically approved and remaining steps are bypassed. Example: CFO approves.
- Hybrid Rule - A combination of both conditions. Example: If 60% of approvers OR the CFO approves, the expense is auto-approved.

### **5.4.2 Combined Flow**

- Sequential multi-step approval and conditional rules can be active simultaneously.
- Whichever condition is met first (sequential completion OR conditional trigger) determines the final outcome.

## **5.5 Manager Dashboard**

- Managers see a list of expenses awaiting their approval.
- Each expense displays: employee name, amount (in company's default currency), category, date, description, receipt link.
- Manager can Approve or Reject with a mandatory/optional comment.
- After acting, the expense moves to the next step (or is marked rejected).

## **5.6 Currency Conversion**

- When submitting an expense, the employee selects any world currency.
- The system calls the exchange rate API to convert the amount to the company's base currency.
- The converted amount is stored on the expense record for consistent reporting.
- Managers always see amounts in the company's default currency.

**APIs Used:**

| **Purpose**             | **Endpoint**                                                 |
| ----------------------- | ------------------------------------------------------------ |
| Country & Currency List | <https://restcountries.com/v3.1/all?fields=name,currencies>  |
| Currency Conversion     | <https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}> |

## **5.7 OCR Receipt Scanning**

- Employees can upload a receipt image (JPEG, PNG) when submitting an expense.
- The system uses an OCR algorithm to extract key fields from the receipt automatically.
- Auto-filled fields include: amount, date, description, expense lines, expense type, merchant/restaurant name.
- The employee can review and edit extracted values before submitting.
- If OCR fails to read a field, the field is left blank for manual entry.

**OCR Implementation Note (5-Hour Context)**

Use Claude Vision API (claude-sonnet) or Tesseract.js for receipt parsing.

Prompt the model to return structured JSON: { amount, currency, date, description, merchant, category }.

Map the JSON fields directly to the expense form for review before submission.

Fallback gracefully: if parsing fails, show the raw upload and let the user fill manually.

# **6\. Data Model**

Below is the recommended data model. Adjust field types to match the chosen stack (e.g., Postgres, SQLite, MongoDB).

| **Model / Table** | **Key Fields**                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Company           | id, name, country, currency_code, created_at                                                                                     |
| User              | id, company_id, name, email, password_hash, role (admin \| manager \| employee), manager_id                                      |
| Expense           | id, employee_id, amount, currency_code, amount_in_company_currency, category, description, date, status, receipt_url, created_at |
| ApprovalRule      | id, company_id, name, rule_type (percentage \| specific \| hybrid), threshold_pct, specific_approver_id, sequence                |
| ApprovalStep      | id, rule_id, approver_id, step_order, is_manager_approver (bool)                                                                 |
| ExpenseApproval   | id, expense_id, step_id, approver_id, status (pending \| approved \| rejected), comment, acted_at                                |

# **7\. API Contracts (REST)**

## **7.1 Auth**

- POST /api/auth/signup - body: { name, email, password, country }. Creates Company + Admin user. Returns JWT.
- POST /api/auth/login - body: { email, password }. Returns JWT.

## **7.2 Users (Admin only)**

- GET /api/users - List all users in company.
- POST /api/users - Create new user: { name, email, role, manager_id }.
- PATCH /api/users/:id - Update role or manager_id.

## **7.3 Expenses**

- POST /api/expenses - Submit new expense (Employee). Body: { amount, currency_code, category, description, date, receipt_url }.
- GET /api/expenses - List expenses. Employees see own; Managers see team; Admins see all.
- GET /api/expenses/:id - Single expense detail with full approval history.

## **7.4 Approvals**

- GET /api/approvals/pending - List expenses awaiting the current user's approval.
- POST /api/approvals/:expense_id/approve - Body: { comment }. Advance to next step or mark approved.
- POST /api/approvals/:expense_id/reject - Body: { comment }. Mark expense rejected.

## **7.5 Approval Rules (Admin only)**

- GET /api/rules - List all approval rules for the company.
- POST /api/rules - Create rule: { name, rule_type, threshold_pct, specific_approver_id, steps: \[{ approver_id, step_order, is_manager_approver }\] }.
- PATCH /api/rules/:id - Update rule.
- DELETE /api/rules/:id - Delete rule.

## **7.6 OCR**

- POST /api/ocr/parse - Body: multipart form-data with receipt image. Returns: { amount, currency, date, description, merchant, category }.

# **8\. Key User Flows**

## **8.1 Employee - Submit Expense**

- Employee logs in.
- Navigates to 'Submit Expense'.
- Optionally uploads receipt image → OCR auto-fills fields.
- Reviews/edits: amount, currency, category, description, date.
- Sees auto-converted amount in company currency.
- Clicks Submit.
- Expense appears in 'My Expenses' with status: Pending.

## **8.2 Manager - Approve Expense**

- Manager logs in.
- Sees pending expenses in their approval queue.
- Opens expense detail (amount shown in company currency).
- Reads description, views receipt if uploaded.
- Clicks Approve (with optional comment) or Reject (with mandatory comment).
- Expense moves to next step or is closed.

## **8.3 Admin - Configure Approval Rule**

- Admin navigates to Approval Rules settings.
- Creates a new rule: names it, selects rule type (sequential / conditional / hybrid).
- Adds approver steps in order (Step 1, Step 2, Step 3...).
- Toggles IS MANAGER APPROVER on/off for relevant employees.
- Sets threshold percentage or specific approver for conditional rules.
- Saves - rule is now applied to all new expense submissions.

# **9\. Non-Functional Requirements**

## **9.1 Performance**

- Page load time under 2 seconds for all primary views.
- Currency conversion API call must complete within 3 seconds; use cached rates (TTL: 1 hour) to avoid rate limits.
- OCR parsing must return results within 10 seconds.

## **9.2 Security**

- All routes are protected by JWT authentication.
- Role-based access control enforced on every API endpoint.
- Passwords are hashed using bcrypt (minimum 10 salt rounds).
- Expense data is scoped to company - no cross-company data leakage.

## **9.3 Reliability**

- Graceful degradation: if currency API is unavailable, flag the field and allow manual entry.
- OCR failure returns a clear error and allows fully manual entry.

# **10\. Recommended Tech Stack (5-Hour Build)**

**Recommended Stack**

Frontend: React (Vite) + Tailwind CSS - fast to scaffold, minimal config.

Backend: Node.js (Express) or Python (FastAPI) - rapid REST API development.

Database: PostgreSQL (Supabase free tier) or SQLite for local dev.

Auth: JWT + bcrypt - simple, stateless.

OCR: Claude Vision API (claude-sonnet) - structured JSON output from receipt images.

Currency: restcountries.com + exchangerate-api.com - both free, no API key needed.

Deployment: Vercel (frontend) + Railway or Render (backend) - free tier, 1-command deploy.

# **11\. Build Timeline (5 Hours)**

Suggested breakdown for a single developer or a pair:

| **Phase** | **Task**                                                                                   | **Duration** |
| --------- | ------------------------------------------------------------------------------------------ | ------------ |
| Phase 1   | Project setup, DB schema, auth scaffold (signup/login, company + admin auto-creation)      | ~45 min      |
| Phase 2   | User management (create employees/managers, assign roles, define manager relationships)    | ~30 min      |
| Phase 3   | Expense submission (form, currency selector, category, description, date, history view)    | ~45 min      |
| Phase 4   | Approval workflow (sequential approvers, manager-first flag, approve/reject with comments) | ~60 min      |
| Phase 5   | Conditional approval rules (percentage, specific approver, hybrid)                         | ~45 min      |
| Phase 6   | Currency conversion integration (API calls on expense submit + manager view)               | ~20 min      |
| Phase 7   | OCR receipt scanning (image upload + Claude Vision or Tesseract auto-fill)                 | ~30 min      |
| Phase 8   | Testing, bug fixes, UI polish                                                              | ~25 min      |
| Total     | End-to-end Reimbursement Management System                                                 | **~5 hours** |

**Priority Order for Time Constraints**

P0 (Must Have): Auth + Company setup, User management, Expense submission, Basic sequential approval.

P1 (Should Have): Conditional approval rules, Currency conversion, Manager dashboard comments.

P2 (Nice to Have): OCR receipt scanning, Hybrid rules, Admin override, UI polish.

If time runs short, deliver P0 + P1 fully functional before attempting P2.

# **12\. Assumptions & Constraints**

- One company per signup; multi-tenant isolation is enforced at the DB query level.
- Currency exchange rates are fetched fresh per submission and cached for 1 hour.
- OCR is best-effort; employees are always able to manually enter or override all fields.
- The system does not process actual payments - it only tracks approval status.
- Email notifications are out of scope for v1; in-app notification badges are sufficient.
- The Excalidraw mockup (<https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA>) should be used as the UI reference during development.

# **13\. Open Questions**

- Should expense categories be fixed or configurable per company by the Admin?
- Is there a maximum expense amount threshold above which an additional approval level is always required?
- Should rejected expenses be re-submittable after correction, or must a new expense be created?
- Are approval rules global per company, or can they differ per category or department?
- Should the IS MANAGER APPROVER flag be per-employee or a global company setting?

_End of Document - Reimbursement Management PRD v1.0_
