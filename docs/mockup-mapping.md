📄 Document 7: Mockup Implementation Mapping Doc
🎯 Purpose

Convert your Excalidraw mockups into:

Structured implementation plan
Clear mapping → UI + backend
Ensure nothing from problem statement is missed
🧩 This doc acts like:

“Blueprint connecting PRD + UI + Code”

📊 SECTION 1: Screen Mapping

1. 🔐 Auth & Company Setup
   From Mockup:
   Signup form
   Country → Currency
   Login page
   Implementation:

Frontend:

Page: /auth
Fields:
Name
Email
Password
Country

Backend:

Create:
Company
Admin user 2. 👨‍💼 Admin Panel (User Management)
From Mockup:
Add employee
Assign role
Assign manager
Implementation:

Frontend:

Page: /admin
Table or card list:
Name
Role
Manager

Backend:

API:
POST /users
GET /users 3. 👤 Employee Dashboard
From Mockup:
Expense table
Status tracking
Implementation:

👉 Replace table with card feed

Frontend:

Page: /
Component:
ExpenseCard

Fields:

Amount
Category
Date
Status 4. ➕ Add Expense Form
From Mockup:
Receipt upload
Category
Description
Amount
Date
Implementation:

Frontend:

Page: /add

Flow:

Upload receipt
OCR auto-fill
Edit fields
Submit 5. 👨‍💼 Manager Approval Panel
From Mockup:
Table with:
Expense
User
Status
Approve/Reject
Implementation:

👉 Replace with Approval Cards

Frontend:

Page: /approvals

Each card:

Expense info
AI suggestion
Approve / Reject buttons
🔄 SECTION 2: Data Flow Mapping
Expense Lifecycle
Employee → Submit → Manager → Approve/Reject → (Admin if needed)
Backend Flow
POST /expenses → Save expense

GET /expenses → Fetch all

GET /expenses/pending → Manager view

POST /approve → Update status

POST /reject → Update status
🧠 SECTION 3: Approval Logic Mapping

From Mockup:

Manager approval first
Multi-level optional
Conditional rules
MVP Implementation:
IF amount < threshold:
Manager approves → DONE

IF amount > threshold:
Manager → Admin → DONE
🤖 SECTION 4: AI Layer Mapping
Add ON TOP of mockup (not present originally)
On Expense Submission:
OCR → extract data
AI → suggest category
On Approval:
AI → suggest:
Safe
Warning
Risk
⚡ SECTION 5: What We Simplify

From Mockup → Simplified:

Feature Mockup MVP
Multi-level approvals Complex 2-level only
Approval rules UI Detailed Hardcoded
Tables Heavy Cards
Admin controls Full Minimal
🚀 SECTION 6: Final Build Mapping
Pages You Will Build:
/ → Dashboard
/add → Add Expense
/approvals → Manager view
/admin → (optional if time)
