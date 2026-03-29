📄 Document 2: MVP Differentiation Doc (Your Secret Sauce)
🎯 Objective

Ensure the product does NOT look like a basic reimbursement system and instead feels like an AI-powered assistant.

This document forces the AI agent to build something unique.

🚨 Instruction to AI Agent (VERY IMPORTANT)

“Do NOT build a standard CRUD expense dashboard.
Focus on automation, intelligence, and interaction.
The product should feel like a smart assistant, not a form-based tool.”

🔥 Core Differentiators (Pick These EXACTLY)

To stay within 5 hours, we focus on 3 high-impact features only:

1. 🤖 AI Expense Assistant (Primary Differentiator)
   What it does:
   When user uploads receipt:
   Auto-fill:
   Amount
   Date
   Merchant
   AI suggests:
   Category (Food, Travel, etc.)
   Validity check
   UI Behavior:

Show suggestion like:

“Looks like a Food expense from McDonald's. Auto-filled for you.”

MVP Implementation (simple logic)
OCR → extract text
Use basic keyword matching:
“Uber” → Travel
“Cafe” → Food

👉 No need for heavy ML

2. ⚡ Smart Approval Suggestions
   What it does:

System helps manager decide quickly.

Show message on each expense:
✅ “Safe to approve (normal range)”
⚠️ “Unusual amount”
❗ “Possible duplicate expense”
Rules (simple logic)
If amount < ₹1000 → Safe
If repeated same amount/date → Duplicate warning
If amount > threshold → Flag
UI Impact:

Instead of manager thinking → system guides them

3. 📱 Feed-Based Approval UI (BIG VISUAL WIN)
   Replace:

❌ Tables
❌ Rows

With:

✅ Card Feed (like Instagram / WhatsApp)

Each Expense Card Shows:
User name
Amount
Category
Receipt image
AI suggestion
Approve / Reject buttons
Interaction:
Tap → Approve
Tap → Reject
Optional: Swipe gesture (if possible)

👉 This is what judges notice instantly

✨ Bonus Differentiation (If Time Allows)

Pick ONLY ONE if extra time:

🗣️ Voice Input (Quick Win)
“Add ₹200 food expense”
Convert to expense automatically

OR

🚨 Fraud Detection Lite
Detect:
Same receipt uploaded twice
Same amount within short time
❌ Features to STRICTLY AVOID

These will waste time and reduce uniqueness:

Complex multi-level approval engine
Heavy admin panels
Detailed analytics dashboards
Role management UI (keep minimal)
🧠 Final Product Feel

After building, your app should feel like:

A mix of:
Expense app
AI assistant
Social feed

NOT like:

ERP
Accounting software
Spreadsheet tool
