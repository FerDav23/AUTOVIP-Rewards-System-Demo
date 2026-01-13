import { getColorsByMembership, shadows, borderRadius, spacing } from './colors';

/**
 * Initialize CSS custom properties based on the colors config
 * @param {string} membershipType - Optional membership type ('gold', 'platinum', 'black')
 */
export function initColors(membershipType = null) {
  const root = document.documentElement;
  const colors = getColorsByMembership(membershipType);
  
  // Set membership data attribute for CSS targeting
  if (membershipType) {
    root.setAttribute('data-membership', membershipType.toLowerCase());
  } else {
    root.removeAttribute('data-membership');
  }
  
  // Set colors
  for (const [key, value] of Object.entries(colors)) {
    root.style.setProperty(`--color-${kebabCase(key)}`, value);
  }
  
  // Set shadows
  for (const [key, value] of Object.entries(shadows)) {
    root.style.setProperty(`--shadow-${kebabCase(key)}`, value);
  }
  
  // Set border radius
  for (const [key, value] of Object.entries(borderRadius)) {
    root.style.setProperty(`--radius-${kebabCase(key)}`, value);
  }
  
  // Set spacing
  for (const [key, value] of Object.entries(spacing)) {
    root.style.setProperty(`--space-${kebabCase(key)}`, value);
  }
}

/**
 * Convert camelCase to kebab-case
 */
function kebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export default initColors; 