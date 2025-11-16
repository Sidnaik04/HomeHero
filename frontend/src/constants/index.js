// User types
export const USER_TYPES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
  ADMIN: 'admin',
};

// Service categories
export const SERVICE_CATEGORIES = [
  'plumber',
  'electrician',
  'carpenter',
  'cleaner',
  'painter',
  'appliance_repair',
  'pest_control',
  'gardening',
];

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Goa locations
export const GOA_LOCATIONS = [
  { name: 'Panaji', pincode: '403001' },
  { name: 'Margao', pincode: '403601' },
  { name: 'Calangute', pincode: '403516' },
  { name: 'Mapusa', pincode: '403507' },
  { name: 'Vasco da Gama', pincode: '403802' },
  { name: 'Baga', pincode: '403516' },
];

// Validation patterns
export const VALIDATION = {
  EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  PHONE: /^[0-9]{10}$/,
  PASSWORD_MIN_LENGTH: 8,
};