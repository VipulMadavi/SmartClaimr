# SmartClaimr 💸

**Intelligent Expense Reimbursement Management System**

SmartClaimr automates the end-to-end expense submission and approval workflow for organizations. It features multi-currency support, OCR receipt scanning, AI-powered expense suggestions, and a modern fintech-inspired UI.

---

## ✨ Features

- **Multi-Role Access** — Admin, Manager, and Employee roles with scoped permissions
- **Expense Submission** — Submit expenses with multi-currency support and real-time conversion
- **Approval Workflow** — Configurable sequential multi-level approvals with conditional logic
- **OCR Receipt Scanning** — Upload receipts and auto-fill expense fields via Tesseract.js
- **AI Suggestions** — Rule-based intelligence flags duplicates, unusual amounts, and safe-to-approve expenses
- **Modern UI** — Card-based, feed-style dashboard inspired by Razorpay/Stripe design language

## 🛠️ Tech Stack

| Layer      | Technology                       |
|------------|----------------------------------|
| Frontend   | React (Vite) + Tailwind CSS v3  |
| Backend    | Node.js + Express               |
| Database   | SQLite (better-sqlite3)         |
| OCR        | Tesseract.js                    |
| Auth       | JWT + bcryptjs                  |
| APIs       | exchangerate-api, restcountries |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

```bash
# Install all dependencies
npm install

# Start the client (Vite dev server)
cd client && npm run dev

# Start the server (Express)
cd server && node app.js
```

## 📁 Project Structure

```
SmartClaimr/
├── client/           # React + Vite frontend
├── server/           # Express.js backend
├── docs/             # PRD, architecture, and design docs
├── journal.md        # Build journal
├── PHASE_PLAN.md     # Phase execution tracker
└── README.md
```

## 📄 License

MIT
