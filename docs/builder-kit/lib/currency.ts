const LE_RATE = 24;

/** Format a USD amount with Leones equivalent */
export function dualPrice(usd: number): string {
  return `$${usd.toFixed(2)} (Le${Math.round(usd * LE_RATE).toLocaleString()})`;
}

/** Format a USD integer (no decimals needed) with Leones equivalent */
export function dualPriceInt(usd: number): string {
  return `$${usd} (Le${Math.round(usd * LE_RATE).toLocaleString()})`;
}

/** Convert USD to Leones formatted string */
export function toLeones(usd: number): string {
  return `Le${Math.round(usd * LE_RATE).toLocaleString()}`;
}

/** JSX-friendly: returns the Leones portion only, for use next to an existing $ display */
export function leonesOf(usd: number): string {
  return `Le${Math.round(usd * LE_RATE).toLocaleString()}`;
}
