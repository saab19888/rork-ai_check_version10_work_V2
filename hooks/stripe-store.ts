import { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import createContextHook from '@nkzw/create-context-hook';

import { 
  initializeStripe, 
  createSubscription, 
  createCustomer, 
  cancelSubscription,
  getSubscriptionStatus,
  STRIPE_PRICE_IDS
} from '@/services/stripe';
import { useAuth } from '@/hooks/auth-store';

export interface SubscriptionData {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export const [StripeProvider, useStripeStore] = createContextHook(() => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Initialize mock service on mount
  useEffect(() => {
    const init = async () => {
      try {
        await initializeStripe();
        setIsInitialized(true);
        console.log('Mock subscription service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize subscription service:', error);
        setIsInitialized(true); // Always set as initialized for mock service
      }
    };

    init();
  }, []);

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: ({ email, name }: { email: string; name: string }) =>
      createCustomer(email, name),
    onSuccess: (data) => {
      if (data.success && data.customerId) {
        console.log('✅ Customer created successfully:', data.customerId);
        setCustomerId(data.customerId);
        if (user) {
          updateUser({
            ...user,
            stripeCustomerId: data.customerId,
          });
        }
      } else {
        console.error('❌ Customer creation failed:', data.error);
        throw new Error(data.error || 'Failed to create customer');
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create customer:', error);
      Alert.alert('Error', 'Failed to create customer account. Please check your internet connection and try again.');
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: ({ planId, billingCycle, customerId: customerIdParam }: { planId: string; billingCycle: 'monthly' | 'yearly'; customerId: string }) => {
      const priceId = STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS]?.[billingCycle];
      if (!priceId) {
        throw new Error('Invalid plan or billing cycle');
      }
      if (!customerIdParam) {
        throw new Error('Customer ID not found');
      }
      return createSubscription(priceId, customerIdParam);
    },
    onSuccess: (data) => {
      if (data.success && data.subscription) {
        console.log('✅ Subscription created successfully:', data.subscription.id);
        setSubscription(data.subscription);
        if (user) {
          updateUser({
            ...user,
            role: data.subscription.planId as any,
            subscriptionId: data.subscription.id,
          });
        }
        Alert.alert(
          'Payment Successful! 🎉', 
          `Your ${data.subscription.planId} subscription is now active. You can start using all premium features!`,
          [{ text: 'Start Using', onPress: () => router.push('/(tabs)/analyze') }]
        );
      } else {
        console.error('❌ Subscription creation failed:', data.error);
        throw new Error(data.error || 'Failed to create subscription');
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create subscription:', error);
      Alert.alert('Payment Failed', 'There was an issue processing your payment. Please check your payment details and try again.');
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: (subscriptionId: string) => cancelSubscription(subscriptionId),
    onSuccess: () => {
      if (subscription) {
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
        });
      }
      Alert.alert('Success', 'Subscription will be canceled at the end of the billing period');
    },
    onError: (error) => {
      console.error('Failed to cancel subscription:', error);
      Alert.alert('Error', 'Failed to cancel subscription');
    },
  });

  // Load subscription status
  const loadSubscriptionStatus = useCallback(async () => {
    if (!customerId) return;
    
    try {
      const data = await getSubscriptionStatus(customerId);
      if (data.success) {
        setSubscription(data.subscription || null);
      }
    } catch (error) {
      console.error('Failed to load subscription status:', error);
    }
  }, [customerId]);

  // Load subscription data when user changes
  useEffect(() => {
    if (user?.stripeCustomerId) {
      setCustomerId(user.stripeCustomerId);
      loadSubscriptionStatus();
    }
  }, [user?.stripeCustomerId, loadSubscriptionStatus]);

  // Handle subscription purchase
  const handleSubscription = useCallback(async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    console.log('🚀 Starting subscription process:', { planId, billingCycle, isInitialized, user: user?.email });
    
    if (!isInitialized) {
      console.error('❌ Subscription service is not initialized');
      Alert.alert('Error', 'Subscription service is not initialized');
      return;
    }

    if (!user) {
      console.error('❌ User not logged in');
      Alert.alert('Error', 'Please log in to subscribe');
      return;
    }

    try {
      // Create customer if doesn't exist
      let currentCustomerId = customerId;
      if (!currentCustomerId) {
        console.log('🔄 Creating new Stripe customer for:', user.email);
        try {
          const customerResult = await createCustomerMutation.mutateAsync({
            email: user.email,
            name: user.name || 'Unknown',
          });
          if (customerResult.success && customerResult.customerId) {
            currentCustomerId = customerResult.customerId;
            console.log('✅ Customer created with ID:', currentCustomerId);
          } else {
            throw new Error(customerResult.error || 'Failed to create customer');
          }
        } catch (customerError) {
          console.error('❌ Failed to create customer:', customerError);
          Alert.alert('Error', 'Failed to create customer account. Please check your internet connection and try again.');
          return;
        }
      } else {
        console.log('✅ Using existing customer ID:', currentCustomerId);
      }

      // Validate price ID
      const priceId = STRIPE_PRICE_IDS[planId as keyof typeof STRIPE_PRICE_IDS]?.[billingCycle];
      if (!priceId) {
        console.error('❌ Invalid plan/billing cycle:', { planId, billingCycle });
        Alert.alert('Error', 'Invalid plan selected');
        return;
      }
      console.log('✅ Price ID found:', priceId);

      // Show payment confirmation for demo
      const planName = planId.charAt(0).toUpperCase() + planId.slice(1);
      const price = planId === 'basic' ? (billingCycle === 'monthly' ? '€10.00' : '€100.00') : (billingCycle === 'monthly' ? '€20.00' : '€200.00');
      
      console.log('💳 Showing payment confirmation');
      Alert.alert(
        'Confirm Subscription',
        `You're about to subscribe to the ${planName} plan for ${price}/${billingCycle.slice(0, -2)}. This is a demo - no real payment will be processed.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Subscribe Now', 
            onPress: async () => {
              try {
                console.log('🔄 Processing subscription for:', { planId, billingCycle, customerId: currentCustomerId });
                if (currentCustomerId) {
                  await subscribeMutation.mutateAsync({ planId, billingCycle, customerId: currentCustomerId });
                }
              } catch (error) {
                console.error('❌ Subscription processing error:', error);
                Alert.alert('Error', 'Failed to process subscription. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Subscription error:', error);
      Alert.alert('Error', 'Failed to process subscription');
    }
  }, [isInitialized, user, customerId, createCustomerMutation.mutateAsync, subscribeMutation.mutateAsync]);

  // Cancel subscription
  const handleCancelSubscription = useCallback(async () => {
    if (!subscription?.id) {
      Alert.alert('Error', 'No active subscription found');
      return;
    }

    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => cancelSubscriptionMutation.mutate(subscription.id),
        },
      ]
    );
  }, [subscription, cancelSubscriptionMutation.mutate]);

  return useMemo(() => ({
    isInitialized,
    subscription,
    customerId,
    handleSubscription,
    handleCancelSubscription,
    loadSubscriptionStatus,
    isLoading: createCustomerMutation.isPending || subscribeMutation.isPending || cancelSubscriptionMutation.isPending,
  }), [
    isInitialized,
    subscription,
    customerId,
    handleSubscription,
    handleCancelSubscription,
    loadSubscriptionStatus,
    createCustomerMutation.isPending,
    subscribeMutation.isPending,
    cancelSubscriptionMutation.isPending,
  ]);
});