
/**
 * Generate a deterministic THC percentage given a strain name. 
 * Resulting value always between 20.5% and 26.5%.
 */
export function getDeterministicTHC(strainName: string): number {
  // Simple FNV-1a hash for reproducibility, returns 20.5–26.5
  let hash = 2166136261;
  for (let i = 0; i < strainName.length; i++) {
    hash ^= strainName.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // Map hash to [0, 1]
  const frac = (Math.abs(hash) % 100000) / 100000;
  // Linearly interpolate between 20.5 and 26.5
  return +(20.5 + frac * (26.5 - 20.5)).toFixed(2);
}
