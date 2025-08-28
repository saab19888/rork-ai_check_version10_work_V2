import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import Colors from "@/constants/colors";
import { SubscriptionPlan } from "@/types";
import Card from "./Card";
import Button from "./Button";

interface PlanCardProps {
  plan: SubscriptionPlan;
  isSelected?: boolean;
  onSelect?: () => void;
  billingCycle?: "monthly" | "yearly";
  isLoading?: boolean;
}

export default function PlanCard({ 
  plan, 
  isSelected = false,
  onSelect,
  billingCycle = "monthly",
  isLoading = false
}: PlanCardProps) {
  const isEnterprise = plan.id === "enterprise";
  const isFree = plan.id === "free-trial";
  
  return (
    <Card 
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        plan.highlighted && styles.highlightedContainer,
      ]}
      elevation={plan.highlighted ? 3 : 1}
    >
      {plan.highlighted && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.description}>{plan.description}</Text>
      
      <View style={styles.priceContainer}>
        {!isEnterprise ? (
          <>
            <Text style={styles.currency}>€</Text>
            <Text style={styles.price}>
              {billingCycle === "monthly" 
                ? plan.price.monthly.toFixed(2) 
                : plan.price.yearly.toFixed(2)}
            </Text>
            <Text style={styles.period}>
              /{billingCycle === "monthly" ? "month" : "year"}
            </Text>
          </>
        ) : (
          <Text style={styles.customPrice}>Custom Pricing</Text>
        )}
      </View>
      
      <View style={styles.featuresContainer}>
        {plan.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Check size={16} color={Colors.light.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <Button
        title={isLoading && isSelected ? "Processing..." : isEnterprise ? "Contact Sales" : isFree ? "Start Free Trial" : "Select Plan"}
        variant={isSelected ? "secondary" : "primary"}
        fullWidth
        onPress={onSelect}
        disabled={isLoading && isSelected}
        style={styles.button}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginVertical: 12,
    width: "100%",
  },
  selectedContainer: {
    borderColor: Colors.light.secondary,
    borderWidth: 2,
  },
  highlightedContainer: {
    borderColor: Colors.light.accent,
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 20,
  },
  currency: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.text,
    marginLeft: 2,
  },
  period: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 2,
    marginBottom: 6,
  },
  customPrice: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 8,
  },
  button: {
    marginTop: 8,
  },
});