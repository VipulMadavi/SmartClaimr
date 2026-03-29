/**
 * SmartClaimr — AI Suggestions Service
 *
 * Rule-based engine (no ML) for:
 *   1. Category detection from text (keyword matching)
 *   2. Approval suggestions based on amount thresholds
 *   3. Duplicate expense detection
 *   4. OCR text parsing for amount, date, merchant extraction
 */

// ── Category keyword map ─────────────────────────
const CATEGORY_KEYWORDS = {
  food: [
    'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining',
    'lunch', 'dinner', 'breakfast', 'meal', 'eat', 'mcdonald', 'starbucks',
    'subway', 'domino', 'swiggy', 'zomato', 'kitchen', 'bakery', 'snack',
    'biryani', 'chai', 'tea', 'beverages', 'bar', 'grill', 'deli',
  ],
  travel: [
    'uber', 'ola', 'lyft', 'flight', 'airline', 'airways', 'airport',
    'travel', 'trip', 'journey', 'boarding', 'ticket', 'rail', 'train',
    'indigo', 'spicejet', 'vistara', 'air india', 'makemytrip', 'goibibo',
  ],
  lodging: [
    'hotel', 'stay', 'resort', 'lodge', 'accommodation', 'airbnb', 'hostel',
    'inn', 'motel', 'room', 'booking', 'oyo', 'taj', 'marriott', 'hyatt',
  ],
  transport: [
    'taxi', 'cab', 'auto', 'rickshaw', 'bus', 'metro', 'fuel', 'petrol',
    'diesel', 'gas', 'parking', 'toll', 'rapido', 'namma', 'yulu',
  ],
  office_supplies: [
    'stationery', 'paper', 'pen', 'printer', 'ink', 'office', 'supply',
    'amazon', 'flipkart', 'desk', 'chair', 'notebook', 'folder',
  ],
  software: [
    'subscription', 'license', 'saas', 'cloud', 'software', 'app',
    'figma', 'notion', 'slack', 'github', 'aws', 'microsoft', 'google',
    'adobe', 'zoom', 'canva', 'jira', 'atlassian', 'vercel',
  ],
  entertainment: [
    'movie', 'cinema', 'theater', 'concert', 'game', 'event', 'show',
    'netflix', 'spotify', 'pvr', 'inox', 'bookmyshow',
  ],
  communication: [
    'phone', 'mobile', 'recharge', 'airtel', 'jio', 'vodafone', 'bsnl',
    'internet', 'wifi', 'sim', 'telecom', 'broadband', 'postpaid',
  ],
};

// ── Friendly category names for display ──────────
const CATEGORY_LABELS = {
  food: 'Food & Dining',
  travel: 'Travel',
  lodging: 'Lodging',
  transport: 'Transport',
  office_supplies: 'Office Supplies',
  software: 'Software',
  entertainment: 'Entertainment',
  communication: 'Communication',
  other: 'Other',
};

/**
 * Detect category from text using keyword matching.
 * Returns the best-matching category or null.
 */
function detectCategory(text) {
  if (!text) return null;
  const lower = text.toLowerCase();

  let bestMatch = null;
  let bestCount = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let count = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) count++;
    }
    if (count > bestCount) {
      bestCount = count;
      bestMatch = category;
    }
  }

  return bestMatch;
}

/**
 * Extract amount from OCR text.
 * Looks for "total" keywords first, then falls back to largest number.
 */
function extractAmount(text) {
  if (!text) return null;

  // Try to find "total" lines first (most receipts have a total)
  const totalPattern = /(?:total|grand\s*total|amount|net\s*amount|bill\s*amount|payable|due|subtotal)[\s:=₹$€£¥]*(\d[\d,]*\.?\d*)/gi;
  const totalMatches = [...text.matchAll(totalPattern)];

  if (totalMatches.length > 0) {
    // Take the last "total" match (usually the grand total)
    const lastMatch = totalMatches[totalMatches.length - 1];
    const amount = parseFloat(lastMatch[1].replace(/,/g, ''));
    if (!isNaN(amount) && amount > 0) return amount;
  }

  // Fallback: find all numbers with decimals and pick the largest
  const numberPattern = /[₹$€£¥Rs.]*\s*(\d[\d,]*\.\d{1,2})\b/g;
  const amounts = [];
  let match;
  while ((match = numberPattern.exec(text)) !== null) {
    const val = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(val) && val > 0 && val < 10000000) {
      amounts.push(val);
    }
  }

  if (amounts.length > 0) {
    return Math.max(...amounts);
  }

  // Last resort: find any standalone large number
  const anyNumberPattern = /\b(\d{2,7})\b/g;
  const numbers = [];
  while ((match = anyNumberPattern.exec(text)) !== null) {
    const val = parseInt(match[1], 10);
    if (val >= 10 && val < 10000000) {
      numbers.push(val);
    }
  }

  return numbers.length > 0 ? Math.max(...numbers) : null;
}

/**
 * Extract date from OCR text.
 * Tries multiple common date formats.
 */
function extractDate(text) {
  if (!text) return null;

  // ISO format: YYYY-MM-DD
  const isoMatch = text.match(/(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
  if (isoMatch) {
    const d = new Date(`${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  // DD/MM/YYYY or MM/DD/YYYY
  const slashMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    // Assume DD/MM/YYYY (common in India)
    const month = parseInt(b, 10);
    const day = parseInt(a, 10);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const d = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
  }

  // Named month: "15 Mar 2026" or "Mar 15, 2026"
  const monthNames = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
  const namedPattern1 = new RegExp(`(\\d{1,2})\\s+(${monthNames})[a-z]*[,\\s]+(\\d{4})`, 'i');
  const namedPattern2 = new RegExp(`(${monthNames})[a-z]*\\s+(\\d{1,2})[,\\s]+(\\d{4})`, 'i');

  const named1 = text.match(namedPattern1);
  if (named1) {
    const d = new Date(`${named1[2]} ${named1[1]}, ${named1[3]}`);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  const named2 = text.match(namedPattern2);
  if (named2) {
    const d = new Date(`${named2[1]} ${named2[2]}, ${named2[3]}`);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }

  return null;
}

/**
 * Extract merchant name from OCR text.
 * Usually the first meaningful line of a receipt.
 */
function extractMerchant(text) {
  if (!text) return null;

  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && l.length < 80);

  // First non-numeric, non-date line is likely the merchant
  for (const line of lines.slice(0, 5)) {
    // Skip lines that are mostly numbers
    const numericRatio = (line.match(/\d/g) || []).length / line.length;
    if (numericRatio < 0.5) {
      return line.substring(0, 100);
    }
  }

  return lines.length > 0 ? lines[0].substring(0, 100) : null;
}

/**
 * Full OCR text extraction — parses all fields from receipt text.
 * Returns: { amount, date, description, merchant, category }
 */
function extractDataFromText(text) {
  const merchant = extractMerchant(text);
  const amount = extractAmount(text);
  const date = extractDate(text);
  const category = detectCategory(text);

  // Build a human-friendly description
  let description = '';
  if (merchant) {
    description = merchant;
    if (category) {
      description = `${CATEGORY_LABELS[category] || 'Expense'} at ${merchant}`;
    }
  }

  return {
    amount,
    date,
    description: description || null,
    merchant: merchant || null,
    category,
  };
}

/**
 * Generate a user-facing suggestion message for an OCR parse result.
 * This is shown on the AddExpense form after receipt upload.
 */
function generateOcrSuggestion(extracted) {
  const parts = [];

  if (extracted.category) {
    const label = CATEGORY_LABELS[extracted.category] || extracted.category;
    if (extracted.merchant) {
      parts.push(`Detected a ${label} expense from ${extracted.merchant}`);
    } else {
      parts.push(`Looks like a ${label} expense`);
    }
  } else if (extracted.merchant) {
    parts.push(`Detected expense from ${extracted.merchant}`);
  }

  if (extracted.amount) {
    parts.push(`Amount: ₹${extracted.amount.toLocaleString()}`);
  }

  if (parts.length === 0) {
    return 'Couldn\'t extract details — please fill in manually.';
  }

  return parts.join('. ') + '.';
}

/**
 * Generate approval-level AI suggestion for an expense.
 * Used to display on ExpenseCard.
 *
 * Returns: { text: string, level: 'safe' | 'normal' | 'warning' | 'danger' }
 */
function generateApprovalSuggestion(expense, db) {
  // Check for duplicates first (same employee, same amount, same date)
  if (db) {
    try {
      const dupCount = db.prepare(`
        SELECT COUNT(*) as cnt FROM expenses
        WHERE employee_id = ? AND amount = ? AND expense_date = ? AND id != ?
      `).get(expense.employee_id, expense.amount, expense.expense_date, expense.id);

      if (dupCount && dupCount.cnt > 0) {
        return { text: 'Possible duplicate expense', level: 'danger' };
      }
    } catch (err) {
      console.warn('Duplicate check failed:', err.message);
    }
  }

  // Amount-based suggestion
  if (expense.amount < 1000) {
    return { text: 'Safe to approve', level: 'safe' };
  } else if (expense.amount <= 5000) {
    return { text: 'Looks normal', level: 'normal' };
  } else {
    return { text: 'Unusual amount — review carefully', level: 'warning' };
  }
}

module.exports = {
  detectCategory,
  extractAmount,
  extractDate,
  extractMerchant,
  extractDataFromText,
  generateOcrSuggestion,
  generateApprovalSuggestion,
  CATEGORY_KEYWORDS,
  CATEGORY_LABELS,
};
