
// Deterministic THC generator for edge function (identical logic to src/utils/thcGenerator.ts)

/**
 * Generate two deterministic THC percentages given a strain name.
 * Each value always between 20.5% and 26.5%.
 * Returns a tuple: [min, max] (as numbers rounded to 2 decimals).
 */
export function getDeterministicTHCRange(strainName: string): [number, number] {
  // Slightly modified FNV-1a hash
  function fnv1a(str: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash) % 100000;
  }
  const low = fnv1a(strainName, 2166136261);
  const high = fnv1a(strainName, 424242424);
  const fracLow = low / 100000;
  const fracHigh = high / 100000;
  const a = +(20.5 + fracLow * (26.5 - 20.5)).toFixed(2);
  const b = +(20.5 + fracHigh * (26.5 - 20.5)).toFixed(2);
  return a < b ? [a, b] : [b, a];
}
