📄 Document 6: AI Behavior Spec + Demo Script
🎯 Objective

Define:

How the AI behaves inside your product
How YOU present it in the demo

This is what makes your app feel like an AI product, not just a system.

🤖 Part 1: AI Behavior Specification
🧠 AI Role

“Act as a smart finance assistant that helps users submit and approve expenses faster.”

🎯 AI Responsibilities

The AI should assist in:

1. Expense Creation
   Extract data from receipt (OCR)
   Suggest:
   Category
   Description
2. Expense Validation
   Check:
   Is amount reasonable?
   Is it a duplicate?
3. Approval Assistance
   Help manager decide:
   Approve
   Reject
   💬 AI Output Style (VERY IMPORTANT)

AI responses should feel:

Human
Short
Helpful
✅ Good Examples
“Looks like a food expense from a restaurant.”
“This seems like a normal expense. Safe to approve.”
“Unusual amount compared to past entries.”
❌ Avoid
Long paragraphs
Technical explanations
Robotic tone
⚙️ AI Logic (Simple Implementation)
Category Detection (Keyword Based)
IF text contains:
"uber", "ola" → Travel
"cafe", "restaurant", "pizza" → Food
"hotel", "stay" → Accommodation
Approval Suggestion
IF amount < 1000 → "Safe to approve"

IF amount between 1000–5000 → "Looks normal"

IF amount > 5000 → "Unusual amount"
Duplicate Detection
IF same amount + same date:
→ "Possible duplicate expense"
🎨 AI Placement in UI
On Expense Card

Show AI message clearly:

🧠 AI: Safe to approve
On Submission Screen
🧠 AI: Detected a food expense from receipt
🧠 Key Rule

AI should reduce thinking effort, not add more information.

🎬 Part 2: Demo Script (CRITICAL FOR WINNING)
⏱️ Total Demo Time: 45–60 seconds
🎤 Step-by-Step Demo Flow
🟢 Step 1: Problem Hook (5 sec)

Say:

“Expense reimbursement is slow, manual, and frustrating. We built an AI-powered assistant to make it instant.”

🟢 Step 2: Show OCR Magic (15 sec)
Upload receipt

Say:

“Instead of filling forms, just upload a receipt.”

👉 Show:

Auto-filled fields
AI suggestion
🟢 Step 3: Submit Expense (5 sec)
Click submit

Say:

“Expense submitted in seconds.”

🟢 Step 4: Switch to Manager View (15 sec)

Show:

Feed UI

Say:

“Managers don’t deal with spreadsheets anymore — they get a smart feed.”

🟢 Step 5: Show AI Suggestion (10 sec)

Point to AI message:

“Our AI even suggests whether this should be approved.”

🟢 Step 6: One-Tap Approval (5 sec)
Click approve

Say:

“One tap, and it’s done.”

🏁 Closing Line (IMPORTANT)

“We’re not just managing expenses — we’re eliminating the friction around them.”

🧠 Demo Tips (Game-Changer)

1. Don’t Explain Too Much
   Show > Tell
2. Focus on Flow
   Smooth transitions
   No confusion
3. Highlight AI Clearly
   Judges should NOTICE it
4. Keep Backup Ready
   If OCR fails → pre-filled data
