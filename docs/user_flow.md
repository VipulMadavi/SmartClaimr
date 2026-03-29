📄 Document 4: User Flow Doc
🎯 Objective

Define exact step-by-step user journeys so the AI builds:

Smooth interactions
Minimal clicks
Demo-friendly flows

This is what turns your app from “functional” → “feels amazing”

🧠 Core Principle

“Every task should be completed in the least number of steps possible.”

👤 1. Employee Flow (Submit Expense)
🎬 Flow: Add Expense in <10 seconds
Step 1: Open App
User lands on Dashboard (Feed)
Step 2: Tap “+ Add Expense”
Floating button at bottom
Step 3: Upload Receipt (Primary Action)
Camera / Upload option
Step 4: OCR + AI Auto-Fill (KEY MOMENT)

System automatically fills:

Amount
Date
Merchant
Category (suggested)
Step 5: User Reviews (Minimal Editing)
User can:
Edit fields if needed
Or directly submit
Step 6: Tap “Submit”
Expense created
Status → “Pending”
Step 7: Instant Feedback

Toast:

“Expense submitted successfully”

🧠 Experience Goal

User should feel:

“I barely had to type anything”
👨‍💼 2. Manager Flow (Approve Expense)
🎬 Flow: Approve in 1 Tap
Step 1: Open App
Lands on “Needs your approval” screen
Step 2: View Expense Feed

Each card shows:

Amount
User
Category
Receipt (optional)
AI suggestion
Step 3: Read AI Insight (KEY MOMENT)

Example:

✅ “Safe to approve”
⚠️ “Unusual amount”
Step 4: Quick Action

Manager can:

Tap Approve
Tap Reject
Step 5: Optional Comment
Small input (optional, not mandatory)
Step 6: Instant Update
Card disappears from feed
Next item appears
🧠 Experience Goal

Manager should feel:

“This is fast and effortless”
👑 3. Admin Flow (Minimal for MVP)
🎬 Flow: Setup Users
Step 1: Login (Admin)
Step 2: Add Users
Create:
Employees
Managers
Step 3: Assign Manager
Link employee → manager
Step 4: (Optional) Set Rule
If amount > X → needs admin approval
🧠 Experience Goal

Keep admin flow:

Simple
Fast
Minimal UI
🔁 System Flow (Behind the Scenes)
Expense Lifecycle
Submitted → Pending → Approved / Rejected
Approval Logic (MVP)
Employee submits expense
Goes to Manager
If amount > threshold:
Goes to Admin
Else:
Approved directly
⚡ Smart Behavior Flow (AI Layer)
On Expense Creation:
OCR extracts data
AI suggests category
AI checks:
Amount range
Duplicate patterns
On Approval Screen:
AI adds recommendation:
Safe / Warning / Risk
📱 Navigation Flow (Simple)

Keep navigation minimal:

Dashboard (Feed)
Add Expense
Approvals

👉 Max 3 main screens

🚀 Demo Flow (VERY IMPORTANT)

This is how YOU should present:

Step 1:

Upload receipt
👉 Show auto-fill

Step 2:

Submit expense
👉 Show instant update

Step 3:

Switch to manager
👉 Show approval feed

Step 4:

Tap approve
👉 Show instant action

🎯 Total Demo Time:

< 60 seconds

❌ Bad Flow (Avoid This)
Multiple forms
Too many steps
Manual entry everywhere
Clicking through many pages
✅ Good Flow (Your Goal)
Upload → Auto-fill → Submit
View → Tap → Done
