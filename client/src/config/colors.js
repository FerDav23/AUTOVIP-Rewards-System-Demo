// Membership-based color schemes with comprehensive palettes
const membershipColors = {
  gold: {
    // Primary colors - Shiny liquid metal gold with white highlights
    // Colors derived from liquid metal gold effect (shiny, reflective tones)
    primary: '#F4D03F',           // Bright light gold - vibrant and shiny (polished metallic)
    primaryDark: '#D4AF37',        // Classic gold - medium gold shadow
    primaryHover: '#FFE87C',       // Light golden yellow - luminous hover
    accent: '#FFD700',            // Bright gold - sparkling accent
    // Gradient colors for shiny liquid metal gold effect with white highlights
    gradientStart: '#FFFEF0',      // Almost white-gold - very light reflective
    gradientMid: '#F4D03F',        // Bright light gold - polished metallic
    gradientEnd: '#D4AF37',        // Classic gold - medium shiny shadow
    
    // Text colors - Warm dark tones for contrast
    text: '#2C1810',               // Rich brown-black
    textLight: '#5C3D2E',         // Medium brown
    textMuted: '#8B6F47',          // Muted brown-gold
    textOnPrimary: '#2C1810',      // Dark text on gold backgrounds
    
    // Background colors - Shiny liquid metal gold backgrounds with white
    bgColor: '#FFFEF5',            // Very light with white (almost white with gold tint)
    bgLight: '#FFFFFF',            // Pure white
    bgMedium: '#FFF8DC',           // Cornsilk (white with gold tint)
    bgHard: '#F5E6D3',             // Light liquid metal (warm cream)
    
    // Border and utility colors
    border: '#F4D03F',             // Bright light gold - vibrant border
    disabled: '#D4AF37',           // Classic gold - medium gold (shiny muted)
    
    // Gray shades - Warm grays
    darkGrey: '#6B5B3D',          // Warm dark gray
    mediumGrey: '#8B7355',        // Warm medium gray
    lightGrey: '#F5E6D3',         // Warm light gray
    
    // Error colors
    errorBg: '#FFF0E6',            // Warm error background
    errorText: '#CC6600'           // Warm error text
  },
  platinum: {
    // Primary colors - Darker metallic platinum for better text contrast
    primary: '#808080',            // Darker silver metallic for better contrast
    primaryDark: '#606060',        // Darker metallic
    primaryHover: '#707070',      // Hover metallic
    accent: '#909090',            // Medium metallic accent
    // Gradient colors for shiny metallic platinum effect (darker for readability)
    gradientStart: '#A0A0A0',      // Light metallic highlight
    gradientMid: '#808080',       // Medium metallic silver
    gradientEnd: '#606060',       // Darker metallic shadow
    
    // Text colors - Pure black for maximum readability
    text: '#000000',               // Pure black for maximum contrast
    textLight: '#000000',         // Pure black (no gray)
    textMuted: '#1A1A1A',          // Very dark gray
    textOnPrimary: '#FFFFFF',      // White text on platinum backgrounds for contrast
    
    // Background colors - White cards with subtle gray page background
    bgColor: '#F5F5F7',            // Cool light gray (page background)
    bgLight: '#FFFFFF',            // Pure white (cards)
    bgMedium: '#FFFFFF',           // White (cards)
    bgHard: '#FFFFFF',             // White (cards)
    
    // Border and utility colors
    border: '#E5E5EA',             // Light gray border
    disabled: '#C7C7CC',           // Muted platinum
    
    // Gray shades - Cool grays
    darkGrey: '#2C2C2E',          // Dark gray
    mediumGrey: '#48484A',        // Medium gray
    lightGrey: '#E5E5EA',         // Light gray
    
    // Error colors
    errorBg: '#FFF0F0',            // Light error background
    errorText: '#D32F2F'           // Standard error red
  },
  black: {
    // Primary colors - Metallic black/charcoal tones
    primary: '#2C2C2E',            // Metallic dark gray
    primaryDark: '#1C1C1E',        // Darker metallic
    primaryHover: '#3A3A3C',       // Hover metallic
    accent: '#4A4A4C',             // Light metallic accent
    // Gradient colors for shiny metallic black effect
    gradientStart: '#4A4A4C',      // Light metallic highlight
    gradientMid: '#2C2C2E',       // Medium metallic black
    gradientEnd: '#1C1C1E',       // Darker metallic shadow
    
    // Text colors - High contrast light tones
    text: '#1D1D1F',               // Deep black
    textLight: '#48484A',         // Medium gray
    textMuted: '#636366',          // Muted gray
    textOnPrimary: '#FFFFFF',      // White text on black backgrounds
    
    // Background colors - Light backgrounds for contrast
    bgColor: '#F5F5F7',            // Very light gray
    bgLight: '#FFFFFF',            // Pure white
    bgMedium: '#E8E8EA',           // Light gray
    bgHard: '#D1D1D6',             // Medium light gray
    
    // Border and utility colors
    border: '#C7C7CC',             // Light gray border
    disabled: '#8E8E93',          // Medium gray
    
    // Gray shades - Neutral grays
    darkGrey: '#48484A',          // Dark gray
    mediumGrey: '#636366',        // Medium gray
    lightGrey: '#E5E5EA',         // Light gray
    
    // Error colors
    errorBg: '#FFF0F0',            // Light error background
    errorText: '#D32F2F'           // Standard error red
  }
};

// Base colors (shared across all memberships - fallback only)
// Note: Each membership now has its own complete color palette
const baseColors = {
  // Text colors
  text: '#333333',
  textLight: '#555555',
  textMuted: '#777777',
  textOnPrimary: '#FFFFFF',        // Default white text on primary
  
  // Background colors
  bgColor: '#f5f5f5',
  bgLight: '#ffffff',
  bgMedium: '#f0f0f0',
  bgHard: '#e5e5e5',
  
  // Border and utility colors
  border: '#dddddd',
  disabled: '#999999',
  
  // Gray shades
  darkGrey: '#555555',
  mediumGrey: '#777777',
  lightGrey: '#eeeeee',
  
  // Error colors
  errorBg: '#fff0f0',
  errorText: '#d32f2f'
};

// Default colors (fallback)
const defaultColors = {
  primary: '#cf0000',
  primaryDark: '#a50000',
  primaryHover: '#a50000',
  accent: '#ca0000'
};

/**
 * Get colors based on membership type
 * @param {string} membershipType - 'gold', 'platinum', 'black', or null for default
 * @returns {object} Color configuration object
 */
export function getColorsByMembership(membershipType) {
  const membershipColor = membershipColors[membershipType?.toLowerCase()];
  
  if (membershipColor) {
    return {
      ...baseColors,
      ...membershipColor
    };
  }
  
  // Return default colors if membership type is not recognized
  return {
    ...baseColors,
    ...defaultColors
  };
}

// Export default colors (for backwards compatibility)
export const colors = {
  ...baseColors,
  ...defaultColors
};

// Shadows
export const shadows = {
  small: '0 2px 10px rgba(0, 0, 0, 0.05)',
  medium: '0 4px 15px rgba(0, 0, 0, 0.1)',
  hard: '0 8px 35px rgba(0, 0, 0, 0.15)'
};

// Border radius
export const borderRadius = {
  small: '4px',
  medium: '8px'
};

// Spacing variables
export const spacing = {
  xs: '5px',
  sm: '10px',
  md: '15px',
  lg: '20px',
  xl: '30px'
};

export default colors; 