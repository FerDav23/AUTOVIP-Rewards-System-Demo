/**
 * Mock data for demo mode (VITE_DEMO_MODE=true).
 * No real backend is called when using this data.
 */

const DEMO_TOKEN = 'demo-jwt-token';

export const demoClient = {
  id: 1,
  name: 'Demo Client',
  card_number: '1234-5678-9012-3456',
  ruc_ci: '1234567890001',
  token: DEMO_TOKEN,
  membership_id: 2
};

export const demoManager = {
  id: 1,
  name: 'Demo Manager',
  username: 'manager',
  token: DEMO_TOKEN
};

export const memberships = [
  { id: 1, name: 'Gold', type: 'gold' },
  { id: 2, name: 'Platinum', type: 'platinum' },
  { id: 3, name: 'Black', type: 'black' }
];

export const demoVehicles = [
  { id: 1, plate: 'ABC-1234', make: 'Toyota', model: 'Corolla', year: 2022, color: 'Silver' },
  { id: 2, plate: 'XYZ-5678', make: 'Honda', model: 'Civic', year: 2021, color: 'White' }
];

// Demo image URLs (placeholder images for rewards – stable seeds)
const DEMO_IMG = (seed, w = 400, h = 300) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const demoRewards = [
  { id: 1, title: 'Oil Change Discount', description: '20% off your next oil change', points_cost: 500, reward_type: 'Service', category: 'Service', visible: true, imageUrl: DEMO_IMG('reward-oil') },
  { id: 2, title: 'Free Car Wash', description: 'Complimentary full car wash', points_cost: 200, reward_type: 'Service', category: 'Service', visible: true, imageUrl: DEMO_IMG('reward-wash') },
  { id: 3, title: 'Premium Detail', description: 'Interior and exterior detail', points_cost: 1500, reward_type: 'Service', category: 'Service', visible: true, imageUrl: DEMO_IMG('reward-detail') }
];

export const demoPromotions = [
  { id: 1, title: 'Double Points Week', description: 'Earn double points on all services this week.', expires_at: null, imageUrl: DEMO_IMG('promo-points') },
  { id: 2, title: 'Birthday Bonus', description: 'Get 100 bonus points on your birthday month.', expires_at: null, imageUrl: DEMO_IMG('promo-birthday') }
];

export const demoRedeemedRewards = [
  { reward_title: 'Free Car Wash', points_before: 450, points_used: 200, points_after: 250, redeemedAt: '2024-01-15T10:00:00Z' }
];

export const rewardTypes = [
  { id: 1, name: 'Service' },
  { id: 2, name: 'Product' },
  { id: 3, name: 'Experience' }
];

export const transactionTypes = [
  { id: 1, name: 'Purchase', type: 'add' },
  { id: 2, name: 'Redemption', type: 'remove' },
  { id: 3, name: 'Bonus', type: 'add' }
];

export const demoPointsBalance = 850;

export const demoAutovipUsers = [
  {
    id: 1,
    name: 'Demo Client',
    card_number: demoClient.card_number,
    ruc_ci: demoClient.ruc_ci,
    membership: memberships[0],
    points_balance: demoPointsBalance
  },
  {
    id: 2,
    name: 'Jane Doe',
    card_number: '2345-6789-0123-4567',
    ruc_ci: '0987654321001',
    membership: memberships[1],
    points_balance: 420
  }
];

export const birthdayMessageLogs = [
  { user_id: 1, user_name: 'Demo Client', birthday: '1990-05-15', url: 'https://example.com/bday-demo' }
];

export const DEMO_TOKEN_VALUE = DEMO_TOKEN;
