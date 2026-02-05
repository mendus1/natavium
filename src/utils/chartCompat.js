/**
 * Backwards compatibility helpers for dual zodiac chart data
 *
 * Handles migration from old flat chart format to new nested format:
 * Old: { sun: {...}, moon: {...}, ... }
 * New: { tropical: {...}, sidereal: {...}, meta: {...} }
 */

/**
 * Normalize chart data to the new dual format
 * @param {Object} chartData - Chart data (old flat or new nested format)
 * @returns {Object} Normalized chart data with tropical, sidereal, and meta keys
 */
export function normalizeChartData(chartData) {
  if (!chartData) return null;

  // Already in new format
  if (chartData.tropical || chartData.sidereal) {
    return chartData;
  }

  // Old flat format - treat as tropical only
  // Extract meta if it exists at the top level
  const { meta, ...chartWithoutMeta } = chartData;

  return {
    tropical: chartWithoutMeta,
    sidereal: null,
    meta: meta || {},
  };
}

/**
 * Get chart data for a specific zodiac system
 * @param {Object} chartData - Chart data (any format)
 * @param {string} zodiacSystem - 'tropical' or 'sidereal'
 * @returns {Object|null} Chart data for the requested system
 */
export function getChartForSystem(chartData, zodiacSystem) {
  const normalized = normalizeChartData(chartData);
  if (!normalized) return null;

  return normalized[zodiacSystem] || normalized.tropical;
}

/**
 * Normalize a product ID to include zodiac system prefix
 * Old IDs without prefix are assumed to be tropical
 * @param {string} productId - Product ID (e.g., 'natal' or 'tropical_natal')
 * @returns {string} Prefixed product ID
 */
export function normalizeProductId(productId) {
  if (!productId) return productId;

  // Already prefixed
  if (productId.startsWith('tropical_') || productId.startsWith('sidereal_')) {
    return productId;
  }

  // Old format - assume tropical
  return `tropical_${productId}`;
}

/**
 * Parse zodiac system and base product from a prefixed product ID
 * @param {string} productId - Prefixed product ID (e.g., 'tropical_natal')
 * @returns {{ zodiacSystem: string, baseProduct: string }}
 */
export function parseProductId(productId) {
  if (!productId) {
    return { zodiacSystem: 'tropical', baseProduct: productId };
  }

  if (productId.startsWith('tropical_')) {
    return {
      zodiacSystem: 'tropical',
      baseProduct: productId.replace('tropical_', ''),
    };
  }

  if (productId.startsWith('sidereal_')) {
    return {
      zodiacSystem: 'sidereal',
      baseProduct: productId.replace('sidereal_', ''),
    };
  }

  // Old format - assume tropical
  return {
    zodiacSystem: 'tropical',
    baseProduct: productId,
  };
}

/**
 * Normalize an array of product IDs
 * @param {string[]} productIds - Array of product IDs
 * @returns {string[]} Array of normalized (prefixed) product IDs
 */
export function normalizeProductIds(productIds) {
  if (!Array.isArray(productIds)) return [];
  return productIds.map(normalizeProductId);
}

/**
 * Check if chart data is in the new dual format
 * @param {Object} chartData - Chart data to check
 * @returns {boolean} True if in new format
 */
export function isDualFormat(chartData) {
  return chartData && (chartData.tropical !== undefined || chartData.sidereal !== undefined);
}
