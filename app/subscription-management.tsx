import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  ArrowLeft 
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import EmailVerificationGuard from '@/components/EmailVerificationGuard';
import { useAuth } from '@/hooks/auth-store';
import { useStripeStore } from '@/hooks/stripe-store';
import { subscriptionPlans } from '@/mocks/plans';

export default function SubscriptionManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, handleCancelSubscription, isLoading } = useStripeStore();

  if (!user) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Subscription Management' }} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Please log in to view your subscription</Text>
        </View>
      </View>
    );
  }

  const currentPlan = subscriptionPlans.find(plan => plan.id === user.role);
  const isSubscribed = subscription && subscription.status === 'active';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = () => {
    if (!subscription) return <XCircle size={20} color={Colors.light.error} />;
    
    switch (subscription.status) {
      case 'active':
        return <CheckCircle size={20} color={Colors.light.success} />;
      case 'past_due':
        return <AlertCircle size={20} color={Colors.light.warning} />;
      case 'canceled':
        return <XCircle size={20} color={Colors.light.error} />;
      default:
        return <AlertCircle size={20} color={Colors.light.textSecondary} />;
    }
  };

  const getStatusText = () => {
    if (!subscription) return 'No active subscription';
    
    switch (subscription.status) {
      case 'active':
        return subscription.cancelAtPeriodEnd ? 'Canceling at period end' : 'Active';
      case 'past_due':
        return 'Payment overdue';
      case 'canceled':
        return 'Canceled';
      default:
        return subscription.status;
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancelConfirm = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: handleCancelSubscription,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen 
        options={{ 
          title: 'Subscription Management',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.light.text} />
            </TouchableOpacity>
          ),
        }} 
      />

      {/* Current Plan Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Plan</Text>
        <View style={styles.planCard}>
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{currentPlan?.name || 'Unknown Plan'}</Text>
              <Text style={styles.planDescription}>{currentPlan?.description}</Text>
            </View>
            <View style={styles.statusContainer}>
              {getStatusIcon()}
              <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>
          </View>
          
          {currentPlan && (
            <View style={styles.planDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Monthly Checks:</Text>
                <Text style={styles.detailValue}>
                  {currentPlan.checkLimit === Infinity ? 'Unlimited' : currentPlan.checkLimit}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Used This Month:</Text>
                <Text style={styles.detailValue}>{user.usageCount}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Remaining:</Text>
                <Text style={styles.detailValue}>
                  {currentPlan.checkLimit === Infinity 
                    ? 'Unlimited' 
                    : Math.max(0, currentPlan.checkLimit - user.usageCount)
                  }
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Subscription Details */}
      {subscription && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <CreditCard size={16} color={Colors.light.textSecondary} />
              <Text style={styles.detailLabel}>Billing Cycle:</Text>
              <Text style={styles.detailValue}>
                {subscription.billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Calendar size={16} color={Colors.light.textSecondary} />
              <Text style={styles.detailLabel}>Next Billing Date:</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>

            {subscription.cancelAtPeriodEnd && (
              <View style={styles.warningContainer}>
                <AlertCircle size={16} color={Colors.light.warning} />
                <Text style={styles.warningText}>
                  Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        {user.role === 'free' && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={handleUpgrade}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Plan</Text>
          </TouchableOpacity>
        )}

        {isSubscribed && !subscription?.cancelAtPeriodEnd && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelConfirm}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>
              {isLoading ? 'Processing...' : 'Cancel Subscription'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.viewPlansButton}
          onPress={() => router.push('/pricing')}
        >
          <Text style={styles.viewPlansButtonText}>View All Plans</Text>
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Need Help?</Text>
        <Text style={styles.supportText}>
          If you have questions about your subscription or need assistance, 
          please contact our support team.
        </Text>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => console.log('Contact support')}
        >
          <Text style={styles.supportButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 12,
  },
  planCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 6,
  },
  planDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  detailsCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: Colors.light.warning,
    marginLeft: 8,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  viewPlansButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  viewPlansButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
  },
  supportText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  supportButton: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
});