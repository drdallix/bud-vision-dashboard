
/**
 * Convert strain name to URL-friendly format
 * Examples:
 * "Sour Diesel" -> "sour_diesel"
 * "OG Kush #1" -> "og_kush_1"
 * "Blue Dream" -> "blue_dream"
 */
export const strainNameToUrl = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
};

/**
 * Convert URL-friendly format back to readable strain name
 * Examples:
 * "sour_diesel" -> "Sour Diesel"
 * "og_kush_1" -> "Og Kush 1"
 * "blue_dream" -> "Blue Dream"
 */
export const urlToStrainName = (urlName: string): string => {
  return urlName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Generate a shareable URL for a strain
 */
export const getStrainUrl = (strainName: string): string => {
  const urlFriendlyName = strainNameToUrl(strainName);
  return `/strains/${urlFriendlyName}`;
};
