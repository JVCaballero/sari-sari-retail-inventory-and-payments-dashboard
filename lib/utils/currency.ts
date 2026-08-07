// Integer Centavo Currency Utilities for PHP (Philippine Peso)

/**
 * Formats centavos to Philippine Peso string
 * e.g., 1250 centavos -> "₱12.50"
 */
export function formatCentavos(centavos: number | null | undefined): string {
  if (centavos === null || centavos === undefined || isNaN(centavos)) {
    return '₱0.00';
  }
  const pesos = centavos / 100;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pesos);
}

/**
 * Parses user input peso string or number into integer centavos
 * e.g., "12.50" or 12.5 -> 1250
 */
export function parseToCentavos(value: string | number): number {
  if (typeof value === 'number') {
    return Math.round(value * 100);
  }
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Calculates cart subtotal, discount, and total in centavos
 */
export function calculateCartTotals(
  items: { line_total_centavos: number }[],
  discountCentavos: number = 0
): { subtotalCentavos: number; discountCentavos: number; totalCentavos: number } {
  const subtotalCentavos = items.reduce((sum, item) => sum + item.line_total_centavos, 0);
  const totalCentavos = Math.max(0, subtotalCentavos - discountCentavos);
  return {
    subtotalCentavos,
    discountCentavos,
    totalCentavos,
  };
}

/**
 * Calculates change in centavos
 */
export function calculateChange(
  amountReceivedCentavos: number,
  totalCentavos: number
): number {
  return Math.max(0, amountReceivedCentavos - totalCentavos);
}
