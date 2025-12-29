// Dummy user data with membership types and card numbers
// In production, this data would come from the database
//
// ============================================
// TO TEST DIFFERENT MEMBERSHIP COLORS:
// ============================================
// Change the TEST_MEMBERSHIP constant below (line 69) to:
// - 'gold' for Gold membership (golden colors)
// - 'platinum' for Platinum membership (silver/platinum colors)
// - 'black' for Black membership (black/dark colors)
// Then refresh the page to see the color changes!
// ============================================

export const dummyUsers = {
  'user1': {
    userName: 'user1',
    cardNumber: '1234-5678-9012-3456',
    membershipType: 'gold',
    email: 'user1@example.com',
    phoneNumber: '+1 (555) 123-4567'
  },
  'user2': {
    userName: 'user2',
    cardNumber: '2345-6789-0123-4567',
    membershipType: 'platinum',
    email: 'user2@example.com',
    phoneNumber: '+1 (555) 234-5678'
  },
  'user3': {
    userName: 'user3',
    cardNumber: '3456-7890-1234-5678',
    membershipType: 'black',
    email: 'user3@example.com',
    phoneNumber: '+1 (555) 345-6789'
  },
  'admin': {
    userName: 'admin',
    cardNumber: '0000-0000-0000-0000',
    membershipType: 'platinum',
    email: 'admin@example.com',
    phoneNumber: '+1 (555) 000-0000'
  },
  'test': {
    userName: 'test',
    cardNumber: '9999-9999-9999-9999',
    membershipType: 'gold',
    email: 'test@example.com',
    phoneNumber: '+1 (555) 999-9999'
  }
};

/**
 * Get user data by username
 * @param {string} username - The username to look up
 * @returns {object|null} User data object or null if not found
 */
export function getUserData(username) {
  const cleanUsername = username?.replace(/"/g, '');
  return dummyUsers[cleanUsername] || null;
}

/**
 * Get membership type for a user
 * @param {string} username - The username to look up
 * @returns {string|null} Membership type ('gold', 'platinum', 'black') or null
 */
export function getMembershipType(username) {
  const userData = getUserData(username);
  return userData?.membershipType || null;
}

/**
 * Initialize dummy user data in localStorage
 * This ensures there's always dummy data available for testing
 * 
 * TO TEST DIFFERENT MEMBERSHIPS: Change the TEST_MEMBERSHIP variable below
 * Options: 'gold', 'platinum', 'black'
 */
const TEST_MEMBERSHIP = 'gold'; // Change this to 'gold', 'platinum', or 'black' to test different colors

export function initializeDummyUserData() {
  // Get current user from localStorage
  const currentUser = localStorage.getItem('user');
  const cleanUsername = currentUser?.replace(/"/g, '');
  
  // For testing: Always use the hardcoded membership type
  // Find a user with the desired membership type
  let testUser = null;
  for (const [key, user] of Object.entries(dummyUsers)) {
    if (user.membershipType === TEST_MEMBERSHIP) {
      testUser = user;
      break;
    }
  }
  
  // Fallback to first user if no match found
  if (!testUser) {
    testUser = dummyUsers['user1'];
  }
  
  // Always set dummy data for testing (overwrites existing)
  localStorage.setItem('userMembership', testUser.membershipType);
  localStorage.setItem('userCardNumber', testUser.cardNumber);
  localStorage.setItem('userEmail', testUser.email);
  localStorage.setItem('userPhoneNumber', testUser.phoneNumber);
  
  // Also set username if not set
  if (!cleanUsername) {
    localStorage.setItem('user', JSON.stringify(testUser.userName));
  }
}

export default dummyUsers;

