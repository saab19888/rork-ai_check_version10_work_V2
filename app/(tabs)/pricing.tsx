import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Info } from "lucide-react-native";
import Colors from "@/constants/colors";
import PlanCard from "@/components/PlanCard";
import { subscriptionPlans } from "@/mocks/plans";
import { useAuth } from "@/hooks/auth-store";
import { useStripeStore } from "@/hooks/stripe-store";

export default function PricingScreen() {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { handleSubscription, isLoading } = useStripeStore();
  

  
  // Handle plan selection
  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Authentication Required",
        "Please sign in to select a subscription plan.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => router.push("/auth/login") }
        ]
      );
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'User information not found. Please try logging in again.');
      return;
    }
    
    setSelectedPlanId(planId);
    
    // Handle different plan types
    if (planId === "enterprise") {
      Alert.alert(
        "Contact Sales",
        "Please contact our sales team for Enterprise pricing and setup.",
        [{ text: "OK" }]
      );
      setSelectedPlanId(null);
      return;
    }
    
    if (planId === "free-trial") {
      Alert.alert(
        "Free Trial Activated",
        "Your 7-day free trial has been activated. Enjoy!",
        [{ 
          text: "Start Using", 
          onPress: () => {
            router.push("/(tabs)/analyze");
          }
        }]
      );
      setSelectedPlanId(null);
      return;
    }
    
    // Handle paid plans with mock subscription system
    if (planId === "basic" || planId === "premium") {
      try {
        await handleSubscription(planId, "monthly");
      } catch (error) {
        Alert.alert(
          'Subscription Error', 
          `Failed to process ${planId} subscription. Please try again.`
        );
      } finally {
        setSelectedPlanId(null);
      }
    } else {
      Alert.alert('Error', 'Unknown plan selected. Please try again.');
      setSelectedPlanId(null);
    }
  };
  

  
  // Check if user's current plan
  const isCurrentPlan = (planId: string) => {
    if (!user) return false;
    
    switch (user.role) {
      case "free":
        return planId === "free-trial";
      case "basic":
        return planId === "basic";
      case "premium":
        return planId === "premium";
      case "enterprise":
        return planId === "enterprise";
      default:
        return false;
    }
  };
  
  // Check if user is on free trial (hide free trial option)
  const isOnFreeTrial = user?.role === "free";
  
  // Filter plans to show only monthly and exclude free trial if user is already on it
  const filteredPlans = subscriptionPlans.filter(plan => {
    if (plan.id === "free-trial" && isOnFreeTrial) {
      return false;
    }
    return true;
  });
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>
        Select the plan that best fits your needs
      </Text>
      

      
      {/* Plans */}
      <View style={styles.plansContainer}>
        {filteredPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            billingCycle="monthly"
            isSelected={isCurrentPlan(plan.id) || selectedPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id)}
            isLoading={selectedPlanId === plan.id || isLoading}
          />
        ))}
      </View>
      
      {/* FAQ Section */}
      <View style={styles.faqContainer}>
        <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
        
        <View style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <Info size={16} color={Colors.light.primary} />
            <Text style={styles.questionText}>
              What happens when I reach my usage limit?
            </Text>
          </View>
          <Text style={styles.answerText}>
            When you reach your monthly limit, you&apos;ll need to upgrade your plan or wait until the next billing cycle to continue analyzing content.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <Info size={16} color={Colors.light.primary} />
            <Text style={styles.questionText}>
              Can I cancel my subscription anytime?
            </Text>
          </View>
          <Text style={styles.answerText}>
            Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your current billing period.
          </Text>
        </View>
        
        <View style={styles.faqItem}>
          <View style={styles.faqQuestion}>
            <Info size={16} color={Colors.light.primary} />
            <Text style={styles.questionText}>
              How accurate is the AI detection?
            </Text>
          </View>
          <Text style={styles.answerText}>
            Our AI detection technology provides high accuracy results, but no system is perfect. We continuously improve our algorithms to provide the most reliable results possible.
          </Text>
        </View>
      </View>
      

      
      {/* Contact Section */}
      <View style={styles.contactContainer}>
        <Text style={styles.contactTitle}>Need Help Choosing?</Text>
        <Text style={styles.contactText}>
          Our team is ready to help you find the perfect plan for your needs.
        </Text>
        <TouchableOpacity 
          style={styles.contactButton}
          onPress={() => Alert.alert("Contact Us", "Please email us at support@ai-check.com for assistance.")}
        >
          <Text style={styles.contactButtonText}>Contact Us</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },

  plansContainer: {
    marginBottom: 32,
  },
  faqContainer: {
    marginBottom: 32,
  },
  faqTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  faqItem: {
    marginBottom: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 16,
    borderRadius: 12,
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 8,
  },
  answerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: Colors.light.primary + "10",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  contactButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },

});