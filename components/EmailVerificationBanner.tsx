import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Mail, X } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/auth-store";

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
}

export default function EmailVerificationBanner({ onDismiss }: EmailVerificationBannerProps) {
  const router = useRouter();
  const { user } = useAuth();
  
  // Don't show banner if user is verified or not authenticated
  if (!user || user.emailVerified !== false) {
    return null;
  }
  
  const handleVerifyPress = () => {
    router.push("/auth/verify-email");
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Mail size={16} color={Colors.light.warning} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Email not verified</Text>
          <Text style={styles.subtitle}>
            Please verify your email to access all features
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.verifyButton}
          onPress={handleVerifyPress}
        >
          <Text style={styles.verifyButtonText}>Verify</Text>
        </TouchableOpacity>
        
        {onDismiss && (
          <TouchableOpacity 
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <X size={16} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.warning + "15",
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  verifyButton: {
    backgroundColor: Colors.light.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  verifyButtonText: {
    color: Colors.light.background,
    fontSize: 12,
    fontWeight: "600",
  },
  dismissButton: {
    padding: 4,
  },
});