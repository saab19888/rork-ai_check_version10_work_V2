// Simple backend service without Stripe integration
// This provides basic subscription management without payment processing

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const CUSTOMERS_KEY = 'backend_customers';
const SUBSCRIPTIONS_KEY = 'backend_subscriptions';

// Types
interface Customer {
  id: string;
  email: string;
  name: string;
  created: number;
}

interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  priceId: string;
  created: number;
}

// Helper functions for local storage
const getStoredData = async <T>(key: string): Promise<T[]> => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting stored data for ${key}:`, error);
    return [];
  }
};

const setStoredData = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error storing data for ${key}:`, error);
  }
};

// Generate unique IDs
const generateId = (prefix: string) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Simple backend API without payment processing
export const backendAPI = {
  // Create customer (local storage)
  createCustomer: async (email: string, name: string) => {
    console.log('Creating customer:', { email, name });
    
    try {
      const customers = await getStoredData<Customer>(CUSTOMERS_KEY);
      
      // Check if customer already exists
      const existingCustomer = customers.find(c => c.email === email);
      if (existingCustomer) {
        return {
          success: true,
          customerId: existingCustomer.id,
          customer: existingCustomer,
        };
      }
      
      // Create new customer
      const customer: Customer = {
        id: generateId('cus'),
        email,
        name,
        created: Date.now(),
      };
      
      customers.push(customer);
      await setStoredData(CUSTOMERS_KEY, customers);
      
      console.log('Customer created successfully:', customer.id);
      
      return {
        success: true,
        customerId: customer.id,
        customer,
      };
    } catch (error) {
      console.error('Error creating customer:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Create subscription (local storage)
  createSubscription: async (customerId: string, priceId: string) => {
    console.log('Creating subscription:', { customerId, priceId });
    
    try {
      const subscriptions = await getStoredData<Subscription>(SUBSCRIPTIONS_KEY);
      
      // Determine plan from price ID
      let planId = 'basic';
      let billingCycle: 'monthly' | 'yearly' = 'monthly';
      
      if (priceId.includes('premium')) {
        planId = 'premium';
      }
      if (priceId.includes('yearly')) {
        billingCycle = 'yearly';
      }
      
      // Calculate period end (30 days for monthly, 365 days for yearly)
      const periodDays = billingCycle === 'yearly' ? 365 : 30;
      const currentPeriodEnd = Date.now() + (periodDays * 24 * 60 * 60 * 1000);
      
      // Create new subscription
      const subscription: Subscription = {
        id: generateId('sub'),
        customerId,
        planId,
        billingCycle,
        status: 'active',
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        priceId,
        created: Date.now(),
      };
      
      subscriptions.push(subscription);
      await setStoredData(SUBSCRIPTIONS_KEY, subscriptions);
      
      console.log('Subscription created successfully:', subscription.id);
      
      return {
        success: true,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          planId: subscription.planId,
          billingCycle: subscription.billingCycle,
          currentPeriodEnd: subscription.currentPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          customerId: subscription.customerId,
          priceId: subscription.priceId,
        },
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Cancel subscription (local storage)
  cancelSubscription: async (subscriptionId: string) => {
    console.log('Canceling subscription:', subscriptionId);
    
    try {
      const subscriptions = await getStoredData<Subscription>(SUBSCRIPTIONS_KEY);
      const subscriptionIndex = subscriptions.findIndex(s => s.id === subscriptionId);
      
      if (subscriptionIndex === -1) {
        return {
          success: false,
          error: 'Subscription not found',
        };
      }
      
      // Mark subscription for cancellation at period end
      subscriptions[subscriptionIndex].cancelAtPeriodEnd = true;
      await setStoredData(SUBSCRIPTIONS_KEY, subscriptions);
      
      console.log('Subscription marked for cancellation:', subscriptionId);
      
      return {
        success: true,
        subscription: {
          id: subscriptions[subscriptionIndex].id,
          cancelAtPeriodEnd: true,
          canceledAt: null,
        },
      };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Get subscription status (local storage)
  getSubscriptionStatus: async (customerId: string) => {
    console.log('Getting subscription status for customer:', customerId);
    
    try {
      const subscriptions = await getStoredData<Subscription>(SUBSCRIPTIONS_KEY);
      const activeSubscription = subscriptions.find(s => 
        s.customerId === customerId && 
        (s.status === 'active' || s.status === 'past_due')
      );
      
      if (!activeSubscription) {
        return {
          success: true,
          subscription: null,
        };
      }
      
      // Check if subscription should be expired
      const now = Date.now();
      if (now > activeSubscription.currentPeriodEnd && activeSubscription.cancelAtPeriodEnd) {
        // Update subscription status to canceled
        const subscriptionIndex = subscriptions.findIndex(s => s.id === activeSubscription.id);
        subscriptions[subscriptionIndex].status = 'canceled';
        await setStoredData(SUBSCRIPTIONS_KEY, subscriptions);
        
        return {
          success: true,
          subscription: null,
        };
      }
      
      console.log('Found active subscription:', activeSubscription.id);
      
      return {
        success: true,
        subscription: {
          id: activeSubscription.id,
          status: activeSubscription.status,
          planId: activeSubscription.planId,
          billingCycle: activeSubscription.billingCycle,
          currentPeriodEnd: activeSubscription.currentPeriodEnd,
          cancelAtPeriodEnd: activeSubscription.cancelAtPeriodEnd,
          customerId: activeSubscription.customerId,
          priceId: activeSubscription.priceId,
        },
      };
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  // Create payment intent (mock implementation)
  createPaymentIntent: async (amount: number, currency: string = 'eur') => {
    console.log('Creating payment intent:', { amount, currency });
    
    try {
      // Mock payment intent for demo purposes
      const paymentIntent = {
        id: generateId('pi'),
        amount,
        currency,
        status: 'succeeded',
        clientSecret: `${generateId('pi')}_secret`,
      };
      
      console.log('Payment intent created:', paymentIntent.id);
      
      return {
        success: true,
        paymentIntent,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

// Price mapping for plans (without real Stripe prices)
export const PRICE_MAPPING = {
  'price_basic_monthly': {
    planId: 'basic',
    billingCycle: 'monthly' as const,
    amount: 1000, // €10.00 in cents
  },
  'price_basic_yearly': {
    planId: 'basic',
    billingCycle: 'yearly' as const,
    amount: 10000, // €100.00 in cents
  },
  'price_premium_monthly': {
    planId: 'premium',
    billingCycle: 'monthly' as const,
    amount: 2000, // €20.00 in cents
  },
  'price_premium_yearly': {
    planId: 'premium',
    billingCycle: 'yearly' as const,
    amount: 20000, // €200.00 in cents
  },
};

// Helper to get plan details from price ID
export const getPlanFromPriceId = (priceId: string) => {
  return PRICE_MAPPING[priceId as keyof typeof PRICE_MAPPING] || null;
};

// Helper to clear all stored data (for testing)
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(CUSTOMERS_KEY);
    await AsyncStorage.removeItem(SUBSCRIPTIONS_KEY);
    console.log('All backend data cleared');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};