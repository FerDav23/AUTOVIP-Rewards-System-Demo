import { getColorsByMembership, shadows, borderRadius, spacing } from './colors';

/**
 * Initialize CSS custom properties based on the colors config
 * @param {string} membershipType - Optional membership type ('gold', 'platinum', 'black')
 */
export function initColors(membershipId = null) {
  const root = document.documentElement;
  let membershipType = "default";

  if (membershipId == 1) {
    console.log('membershipId', membershipId);
    membershipType = 'gold';
  } else if (membershipId == 2) {
    membershipType = 'black';
  } else if (membershipId == 3) {
    membershipType = 'platinum';
  }

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