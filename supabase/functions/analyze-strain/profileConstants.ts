export interface ProfileItem {
  name: string;
  emoji: string;
  color: string;
}

export const SUPPORTED_EFFECTS: { [key: string]: ProfileItem } = {
  'Relaxed': { name: 'Relaxed', emoji: '😌', color: '#5B21B6' },   // Deep Purple
  'Happy': { name: 'Happy', emoji: '😊', color: '#F59E0B' },       // Amber
  'Euphoric': { name: 'Euphoric', emoji: '🤩', color: '#D946EF' }, // Fuchsia
  'Uplifted': { name: 'Uplifted', emoji: '⬆️', color: '#10B981' }, // Emerald
  'Creative': { name: 'Creative', emoji: '🎨', color: '#8B5CF6' }, // Violet
  'Focused': { name: 'Focused', emoji: '🎯', color: '#3B82F6' },   // Blue
  'Sleepy': { name: 'Sleepy', emoji: '😴', color: '#374151' },     // Dark Gray
  'Hungry': { name: 'Hungry', emoji: '🍽️', color: '#EF4444' },    // Red
};

export const SUPPORTED_FLAVORS: { [key: string]: ProfileItem } = {
  'Earthy': { name: 'Earthy', emoji: '🌍', color: '#A16207' },     // Brown
  'Sweet': { name: 'Sweet', emoji: '🍯', color: '#FBBF24' },       // Light Amber
  'Citrus': { name: 'Citrus', emoji: '🍋', color: '#FACC15' },     // Yellow
  'Pine': { name: 'Pine', emoji: '🌲', color: '#15803D' },         // Dark Green
  'Berry': { name: 'Berry', emoji: '🫐', color: '#6D28D9' },       // Deep Indigo
  'Diesel': { name: 'Diesel', emoji: '⛽', color: '#475569' },     // Slate Gray
  'Skunk': { name: 'Skunk', emoji: '🦨', color: '#44403C' },       // Dark Stone
  'Floral': { name: 'Floral', emoji: '🌸', color: '#DB2777' },     // Pink
};

// Default profile items for cases where a generated effect/flavor isn't in our supported list
export const DEFAULT_EFFECT_PROFILE: ProfileItem = { name: 'Effect', emoji: '✨', color: '#6B7280' };
export const DEFAULT_FLAVOR_PROFILE: ProfileItem = { name: 'Flavor', emoji: '🌿', color: '#6B7280' };
