/**
 * Extrae valor numérico de texto de precio. "$8.99" | "1,299.99" -> number.
 */

export function parsePrice(priceText: string | null | undefined): number {
  if (!priceText || typeof priceText !== 'string') return 0;
  const cleaned = priceText.replace(/,/g, '').replace(/[^0-9.]/g, '');
  const match = cleaned.match(/[\d.]+/);
  if (!match) return 0;
  const n = parseFloat(match[0]);
  return Number.isNaN(n) ? 0 : n;
}
