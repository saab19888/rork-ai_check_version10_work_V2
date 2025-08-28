// Mock Stripe service without any real Stripe integration
// This provides a simple interface for subscription management without payment processing

// Initialize mock Stripe service
export const initializeStripe = async () => {
  console.log('Mock Stripe service initialized');
  return Promise.resolve();
};

// Mock price IDs for each plan
export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: 'price_basic_monthly',
    yearly: 'price_basic_yearly',
  },
  premium: {
    monthly: 'price_premium_monthly',
    yearly: 'price_premium_yearly',
  },
};

// Mock payment and subscription functions
export const createPaymentIntent = async (amount: number, currency: string = 'eur') => {
  const { backendAPI } = await import('./backend');
  return await backendAPI.createPaymentIntent(amount, currency);
};

export const createSubscription = async (priceId: string, customerId: string) => {
  const { backendAPI } = await import('./backend');
  return await backendAPI.createSubscription(customerId, priceId);
};

export const createCustomer = async (email: string, name: string) => {
  const { backendAPI } = await import('./backend');
  return await backendAPI.createCustomer(email, name);
};

export const cancelSubscription = async (subscriptionId: string) => {
  const { backendAPI } = await import('./backend');
  return await backendAPI.cancelSubscription(subscriptionId);
};

export const getSubscriptionStatus = async (customerId: string) => {
  const { backendAPI } = await import('./backend');
  return await backendAPI.getSubscriptionStatus(customerId);
};

// Mock hooks for compatibility
export const useStripeHook = () => {
  return {
    confirmPayment: () => Promise.resolve({ paymentIntent: { status: 'succeeded' } }),
    createPaymentMethod: () => Promise.resolve({ paymentMethod: { id: 'pm_mock' } }),
  };
};

export const usePaymentSheetHook = () => {
  return {
    initPaymentSheet: () => Promise.resolve(),
    presentPaymentSheet: () => Promise.resolve({ error: null }),
  };
};