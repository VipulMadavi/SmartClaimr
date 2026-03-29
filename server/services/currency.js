/**
 * SmartClaimr — Currency Conversion Service
 *
 * Fetches exchange rates from exchangerate-api.com and caches them in-memory
 * for 1 hour to avoid rate limits.
 *
 * API: https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}
 *
 * Exports:
 *   - convertCurrency(amount, fromCurrency, toCurrency) → converted amount
 *   - getRate(fromCurrency, toCurrency) → exchange rate
 */

// In-memory cache: Map<baseCurrency, { rates, fetchedAt }>
const rateCache = new Map();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const API_BASE = 'https://api.exchangerate-api.com/v4/latest';

/**
 * Fetch exchange rates for a base currency.
 * Uses cache if available and not expired.
 *
 * @param {string} baseCurrency — e.g. 'USD', 'INR'
 * @returns {Object} rates map — { USD: 1, INR: 83.5, EUR: 0.92, ... }
 */
async function fetchRates(baseCurrency) {
  const upperBase = baseCurrency.toUpperCase();

  // Check cache
  const cached = rateCache.get(upperBase);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }

  // Fetch fresh rates
  try {
    const response = await fetch(`${API_BASE}/${upperBase}`);
    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`);
    }

    const data = await response.json();

    // Cache the rates
    rateCache.set(upperBase, {
      rates: data.rates,
      fetchedAt: Date.now(),
    });

    console.log(`💱 Fetched exchange rates for ${upperBase} (${Object.keys(data.rates).length} currencies cached)`);
    return data.rates;
  } catch (err) {
    console.error(`Currency API error for ${upperBase}:`, err.message);

    // Return stale cache if available
    if (cached) {
      console.warn(`Using stale cached rates for ${upperBase}`);
      return cached.rates;
    }

    throw new Error(`Unable to fetch exchange rates for ${upperBase}. Please try again later.`);
  }
}

/**
 * Get the exchange rate between two currencies.
 *
 * @param {string} fromCurrency — source currency code
 * @param {string} toCurrency — target currency code
 * @returns {number|null} exchange rate, or null on failure
 */
async function getRate(fromCurrency, toCurrency) {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) return 1;

  try {
    const rates = await fetchRates(from);
    const rate = rates[to];

    if (rate === undefined) {
      console.warn(`No rate found for ${from} → ${to}`);
      return null;
    }

    return rate;
  } catch {
    return null;
  }
}

/**
 * Convert an amount from one currency to another.
 *
 * @param {number} amount — the amount to convert
 * @param {string} fromCurrency — source currency code (e.g. 'USD')
 * @param {string} toCurrency — target currency code (e.g. 'INR')
 * @returns {{ convertedAmount: number, rate: number } | null} — result or null on failure
 */
async function convertCurrency(amount, fromCurrency, toCurrency) {
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  if (from === to) {
    return { convertedAmount: amount, rate: 1 };
  }

  const rate = await getRate(from, to);
  if (rate === null) {
    return null;
  }

  const convertedAmount = Math.round(amount * rate * 100) / 100; // Round to 2 decimal places
  return { convertedAmount, rate };
}

/**
 * Get cache stats (for debugging/health checks)
 */
function getCacheStats() {
  const stats = {};
  for (const [key, value] of rateCache.entries()) {
    const ageMs = Date.now() - value.fetchedAt;
    stats[key] = {
      currencyCount: Object.keys(value.rates).length,
      ageMinutes: Math.round(ageMs / 60000),
      stale: ageMs > CACHE_TTL_MS,
    };
  }
  return stats;
}

module.exports = {
  convertCurrency,
  getRate,
  getCacheStats,
};
