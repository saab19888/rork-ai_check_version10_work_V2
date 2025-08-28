import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/auth-store";

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export default function EmailVerificationGuard({ 
  children, 
  requireVerification = true 
}: EmailVerificationGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (requireVerification && user && !user.emailVerified) {
      router.replace("/auth/verify-email");
      return;
    }
  }, [isAuthenticated, user, requireVerification, router]);

  // Show loading state while checking authentication
  if (!isAuthenticated || !user) {
    return null;
  }

  // If verification is required but user is not verified, show verification required screen
  if (requireVerification && !user.emailVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <View style={styles.iconBackground}>
            <AlertTriangle size={48} color={Colors.light.warning} />
          </View>
        </View>
        
        <Text style={styles.title}>Email Verification Required</Text>
        <Text style={styles.subtitle}>
          You must verify your email address to access this feature.
        </Text>
        
        <Text style={styles.description}>
          We&apos;ve sent a verification email to{"\n"}
          <Text style={styles.email}>{user.email}</Text>
        </Text>
        
        <Button
          title="Verify Email"
          size="large"
          onPress={() => router.push("/auth/verify-email")}
          style={styles.verifyButton}
        />
        
        <Button
          title="Back to Home"
          variant="outline"
          size="large"
          onPress={() => router.push("/")}
          style={styles.backButton}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.light.warning + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  email: {
    fontWeight: "600",
    color: Colors.light.primary,
  },
  verifyButton: {
    marginBottom: 12,
    minWidth: 200,
  },
  backButton: {
    minWidth: 200,
  },
});