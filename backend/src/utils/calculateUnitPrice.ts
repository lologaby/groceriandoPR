/**
 * Precio unitario (por oz, etc.) a partir de size en nombre o string.
 * Ej: "8oz" -> oz, "6 pack 8oz" -> aproximado.
 */

const SIZE_REGEX = /(\d+(?:\.\d+)?)\s*(oz|lb|ml|g|kg|pk|pack|ct|unit)/gi;

export interface UnitInfo {
  /** Precio por unidad de medida (ej. por oz). */
  pricePerUnit: number;
  /** Unidad inferida (oz, lb, etc.). */
  unit: string;
  /** Cantidad de unidades (ej. 8 en "8oz"). */
  amount: number;
}

/**
 * Intenta extraer tamaño de nombre de producto y calcular precio por unidad.
 */
export function calculateUnitPrice(price: number, productNameOrSize?: string): UnitInfo | null {
  if (!productNameOrSize || price <= 0) return null;
  const s = String(productNameOrSize);
  const m = s.match(SIZE_REGEX);
  if (!m || m.length === 0) return null;

  let amount = 0;
  let unit = 'oz';
  for (const part of m) {
    const n = parseFloat(part.replace(/[^0-9.]/g, ''));
    const u = part.replace(/[0-9.]/g, '').toLowerCase();
    if (u.includes('oz')) {
      amount += n;
      unit = 'oz';
    } else if (u.includes('lb')) {
      amount += n * 16;
      unit = 'oz';
    } else if (u.includes('g') && !u.includes('kg')) {
      amount += n / 28.35;
      unit = 'oz';
    } else if (u.includes('kg')) {
      amount += (n * 1000) / 28.35;
      unit = 'oz';
    } else if (u.includes('ml')) {
      amount += n / 29.57;
      unit = 'oz';
    } else if (u.includes('pk') || u.includes('pack') || u.includes('ct')) {
      amount += n; // tratamos como "unidades"
      unit = 'unit';
    }
  }
  if (amount <= 0) return null;

  const pricePerUnit = price / amount;
  return { pricePerUnit, unit, amount };
}
