📄 Document 5: Tech Constraints + Architecture Doc
🎯 Objective

Ensure the AI agent builds:

Fast
Simple
Complete MVP within 5 hours

This doc is your guardrail against overengineering.

⏱️ Hard Constraints (Non-Negotiable)
Total build time: 5 hours
Team size: Assume 1–2 developers
Focus: Working demo > perfect system
🧠 Core Instruction to AI Agent

“Prioritize speed, simplicity, and demo-ability over scalability and perfection.”

🧱 Tech Stack (Strictly Follow)
Frontend
React (with Vite)
Tailwind CSS

👉 Reason:

Fast setup
Easy styling
Component reuse
Backend

Choose ONE:

Node.js + Express (recommended)
OR
Python FastAPI

👉 Keep it simple REST APIs only

Database
MongoDB (local or Atlas)

👉 Reason:

Flexible schema
Fast to implement
OCR
Tesseract.js (frontend or backend)

👉 No custom ML model

APIs

1. Country + Currency
   https://restcountries.com/v3.1/all?fields=name,currencies
2. Currency Conversion
   https://api.exchangerate-api.com/v4/latest/{BASE}
   🧩 Architecture Overview
   High-Level Flow
   Frontend (React)
   ↓
   Backend (Express API)
   ↓
   Database (MongoDB)
   Data Flow
   User submits expense
   Backend:
   Stores data
   Converts currency
   Manager fetches pending expenses
   Approval updates status
   🗂️ Project Structure (Recommended)
   Frontend
   src/
   ├── pages/
   │ ├── Dashboard.jsx
   │ ├── AddExpense.jsx
   │ ├── Approvals.jsx
   │
   ├── components/
   │ ├── ExpenseCard.jsx
   │ ├── Navbar.jsx
   │
   ├── services/
   │ ├── api.js
   Backend
   server/
   ├── routes/
   │ ├── auth.js
   │ ├── expenses.js
   │
   ├── models/
   │ ├── User.js
   │ ├── Expense.js
   │
   ├── controllers/
   ├── app.js
   ⚙️ Feature Scope Control (VERY IMPORTANT)
   ✅ MUST BUILD
   Authentication (basic)
   Expense submission
   OCR (basic working)
   Expense feed UI
   Manager approval system
   Currency conversion
   ⚠️ BUILD ONLY IF TIME LEFT
   Admin panel UI
   Advanced rules
   Voice input
   ❌ DO NOT BUILD
   Complex workflow engines
   Multi-level approval chains
   Microservices
   Role-based access perfection
   Full analytics dashboard
   🔌 API Design (Simple)
   Auth
   POST /login
   POST /signup
   Expenses
   POST /expenses
   GET /expenses
   GET /expenses/pending
   Approvals
   POST /approve
   POST /reject
   🧠 Logic Simplification Rules
   Approval Logic (Keep Simple)
   IF amount < threshold:
   Manager approves → DONE

IF amount > threshold:
Manager approves → Admin approves → DONE
AI Suggestions (No ML Needed)

Use simple rules:

Amount < 1000 → Safe
Amount > 5000 → Warning
Same amount + same date → Duplicate
⚡ Performance Strategy
No heavy computations
No background jobs
No queues

Everything:

Synchronous
Instant feedback
🧪 Testing Strategy (Minimal)

Just test:

Can submit expense
Can approve expense
OCR fills something
Currency converts
🚀 Deployment (Optional)

If time:

Frontend → Vercel
Backend → Render
🧠 Golden Rule

“If a feature takes more than 30 minutes, simplify it.”

⚠️ Common Mistakes to Avoid
Spending too long on backend
Overdesigning database
Building features not used in demo
Styling everything perfectly
🏁 Final Build Priority Order
UI (feed + cards)
Expense submission
Approval flow
OCR
Currency conversion
