// Quantity Utilities for Integer Thousandths (Milli-Units)

/**
 * Converts integer thousandths to decimal quantity
 * e.g., 1000 -> 1, 500 -> 0.5, 1250 -> 1.25
 */
export function milliToQty(milli: number): number {
  if (isNaN(milli)) return 0;
  return milli / 1000;
}

/**
 * Converts decimal quantity to integer thousandths
 * e.g., 1 -> 1000, 0.5 -> 500, 1.25 -> 1250
 */
export function qtyToMilli(qty: number): number {
  if (isNaN(qty)) return 0;
  return Math.round(qty * 1000);
}

/**
 * Formats milli-quantity for display with clean decimal trailing removal
 * e.g., 1000 -> "1", 500 -> "0.5", 1250 -> "1.25"
 */
export function formatMilliQty(milli: number | null | undefined, unitLabel: string = ''): string {
  if (milli === null || milli === undefined || isNaN(milli)) return `0 ${unitLabel}`.trim();
  const qty = milli / 1000;
  const formatted = new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 3,
    minimumFractionDigits: 0,
  }).format(qty);
  return unitLabel ? `${formatted} ${unitLabel}` : formatted;
}

/**
 * Filipino unit display mapping
 */
export const UNIT_OPTIONS = [
  { value: 'piece', label: 'Piece (Pcs)', cebLabel: 'Pidaso' },
  { value: 'sachet', label: 'Sachet', cebLabel: 'Sachet' },
  { value: 'bottle', label: 'Bottle', cebLabel: 'Botelya' },
  { value: 'pack', label: 'Pack', cebLabel: 'Pakete' },
  { value: 'can', label: 'Can', cebLabel: 'Lata' },
  { value: 'kilo', label: 'Kilo (kg)', cebLabel: 'Kilo' },
  { value: 'half-kilo', label: 'Half Kilo (0.5 kg)', cebLabel: 'Tunga Kilo' },
  { value: 'cup', label: 'Cup (Carinderia)', cebLabel: 'Kopas / Cup' },
  { value: 'serving', label: 'Serving / Order', cebLabel: 'Serving / Putahe' },
  { value: 'order', label: 'Order', cebLabel: 'Order' },
  { value: 'tray', label: 'Tray (Eggs)', cebLabel: 'Tray' },
];
