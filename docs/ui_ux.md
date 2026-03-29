📄 Document 3: UI/UX Direction Doc
🎯 Objective

Guide the AI agent to design a modern, clean, and visually impressive UI that stands out instantly during demo.

Without this, you’ll get a boring table-based dashboard.

🧠 Design Philosophy

“Looks like a fintech app, not an admin panel.”

The UI should feel:

Clean
Fast
Minimal
Mobile-first
🎨 Design Inspiration

Base the visual style loosely on:

Razorpay
Stripe
🎯 Core UI Principles

1. Minimal Input, Maximum Output
   Reduce typing
   Prefer:
   Auto-fill
   Dropdowns
   Suggestions
2. Card-Based Layout (MANDATORY)

Replace:

❌ Tables
❌ Dense grids

With:

✅ Cards
✅ Sections
✅ Visual grouping 3. Feed-Based Experience

Main screen should look like:

Activity feed (like social apps)

Each item = Expense Card

4. Visual Hierarchy

Each expense card should clearly show:

🔹 Amount (BIG + bold)
🔹 Category
🔹 User name
🔹 Date
🔹 AI suggestion (highlighted)
📱 Key Screens Design

1. Dashboard (Feed Screen)
   Layout:
   Top: Greeting / Summary
   Middle: Expense feed
   Bottom: Floating “+ Add Expense” button
   Expense Card Example:
   [ ₹450 ] (Food)

Rahul Sharma  
Today, 2:30 PM

🧠 AI: Safe to approve

[ Approve ] [ Reject ]

Optional:

Show receipt thumbnail 2. Submit Expense Screen
Layout:
Upload receipt (top)
Auto-filled fields (below)
Submit button
Behavior:
When receipt uploaded:
Fields auto-populate
Show AI suggestion 3. Approval Screen (Manager)

Same as dashboard but filtered:

Only pending approvals
🎨 Color Guidelines

Keep it simple:

Primary: Blue / Indigo
Success: Green
Warning: Orange
Error: Red
Background: Light grey / white
🧩 Component Guidelines

Use:

Rounded cards
Soft shadows
Clean spacing
Large buttons

Avoid:

Sharp edges
Overcrowded UI
Too many colors
⚡ Interaction Design
Buttons:
Large and tappable
Clear labels:
Approve
Reject
Feedback:
On approve:
Show toast → “Approved successfully”
Loading:
Use skeleton loaders (if possible)
🚫 What to STRICTLY Avoid
Sidebar-heavy layout
Complex navigation
Too many pages
Tables as primary UI
Tiny fonts
🧠 UX Microcopy (Important)

Use friendly, human text:

Instead of:

“Submit Expense”

Use:

“Add Expense”

Instead of:

“Pending Approvals”

Use:

“Needs your approval”
