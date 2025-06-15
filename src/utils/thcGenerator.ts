
/**
 * Generate two deterministic THC percentages given a strain name and two seeds.
 * Each value always between 20.5% and 26.5%.
 * Returns a tuple: [min, max] (as numbers rounded to 2 decimals).
 */
export function getDeterministicTHCRange(strainName: string): [number, number] {
  // Modified FNV-1a hash to make two deterministic values per name, with different seeds.
  function fnv1a(str: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash) % 100000;
  }
  // Use different seeds for "low" and "high" values so names get two separate, deterministic values.
  const low = fnv1a(strainName, 2166136261);
  const high = fnv1a(strainName, 424242424);

  // Normalize both to [0,1]
  const fracLow = low / 100000;
  const fracHigh = high / 100000;

  // Linearly interpolate for each value
  const a = +(20.5 + fracLow * (26.5 - 20.5)).toFixed(2);
  const b = +(20.5 + fracHigh * (26.5 - 20.5)).toFixed(2);

  // Ensure min ≤ max
  return a < b ? [a, b] : [b, a];
}
