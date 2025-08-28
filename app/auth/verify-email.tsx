import React, { useState, useEffect, useRef } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Mail, RefreshCw, CheckCircle } from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/auth-store";

export default function VerifyEmailScreen() {
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const router = useRouter();
  const { 
    user, 
    resendVerification, 
    checkVerification, 
    deleteAccount,
    resendVerificationIsLoading,
    checkVerificationIsLoading,
    deleteAccountIsLoading
  } = useAuth();
  
  // Redirect if user is not authenticated or already verified
  useEffect(() => {
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    
    if (user.emailVerified) {
      router.replace("/");
      return;
    }
  }, [user, router]);
  
  // Auto-check verification status every 5 seconds
  useEffect(() => {
    if (isChecking) {
      const interval = setInterval(() => {
        checkVerification();
      }, 5000);
      
      checkIntervalRef.current = interval;
      
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      };
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }
    }
  }, [isChecking, checkVerification]);
  
  const handleResendVerification = () => {
    resendVerification();
    Alert.alert(
      "Verification Email Sent",
      "We've sent another verification email to your inbox. Please check your email and spam folder.",
      [{ text: "OK" }]
    );
  };
  
  const handleCheckVerification = () => {
    setIsChecking(true);
    checkVerification();
    
    // Stop checking after 30 seconds
    setTimeout(() => {
      setIsChecking(false);
    }, 30000);
  };
  
  const handleCancelRegistration = () => {
    Alert.alert(
      "Cancel Registration",
      "Are you sure you want to permanently delete this account? This action cannot be undone and you'll be able to register again with the same email address.",
      [
        {
          text: "Keep Account",
          style: "cancel"
        },
        {
          text: "Delete Account",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🗑️ Starting account deletion process...');
              await deleteAccount();
              console.log('✅ Account deletion successful, waiting before navigation...');
              // Small delay to ensure auth state is updated
              setTimeout(() => {
                console.log('🧭 Navigating to register page...');
                router.replace("/auth/register");
              }, 100);
            } catch (error) {
              console.error('❌ Account deletion failed:', error);
              Alert.alert(
                "Error",
                "Failed to delete account. Please try again.",
                [{ text: "OK" }]
              );
            }
          }
        }
      ]
    );
  };
  

  
  if (!user) {
    return null;
  }
  
  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.iconContainer}>
        <View style={styles.iconBackground}>
          <Mail size={48} color={Colors.light.primary} />
        </View>
      </View>
      
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        We&apos;ve sent a verification email to{"\n"}
        <Text style={styles.email}>{user.email}</Text>
      </Text>
      
      <Text style={styles.description}>
        Please check your email and click the verification link to activate your account. 
        Don&apos;t forget to check your spam folder if you don&apos;t see the email.
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title={isChecking ? "Checking..." : "I&apos;ve Verified My Email"}
          size="large"
          onPress={handleCheckVerification}
          isLoading={checkVerificationIsLoading || isChecking}
          disabled={checkVerificationIsLoading || isChecking}
          fullWidth
          style={styles.primaryButton}
        />
        
        <Button
          title="Resend Verification Email"
          variant="outline"
          size="large"
          onPress={handleResendVerification}
          isLoading={resendVerificationIsLoading}
          disabled={resendVerificationIsLoading}
          fullWidth
          style={styles.secondaryButton}
        />
        
        <Button
          title="Delete Account"
          variant="text"
          size="large"
          onPress={handleCancelRegistration}
          isLoading={deleteAccountIsLoading}
          disabled={deleteAccountIsLoading}
          fullWidth
          style={styles.cancelButton}
        />
      </View>
      
      <View style={styles.statusContainer}>
        {isChecking && (
          <View style={styles.statusItem}>
            <RefreshCw size={16} color={Colors.light.primary} />
            <Text style={styles.statusText}>
              Checking verification status...
            </Text>
          </View>
        )}
        
        {user.emailVerified && (
          <View style={styles.statusItem}>
            <CheckCircle size={16} color={Colors.light.success} />
            <Text style={[styles.statusText, { color: Colors.light.success }]}>
              Email verified successfully!
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.helpContainer}>
        <Text style={styles.helpTitle}>Having trouble?</Text>
        <Text style={styles.helpText}>
          • Check your spam or junk folder{"\n"}
          • Make sure you entered the correct email address{"\n"}
          • Wait a few minutes for the email to arrive{"\n"}
          • Try resending the verification email
        </Text>
      </View>
      
      <Button
        title="Back to Landing Page"
        variant="text"
        size="large"
        onPress={() => router.push("/")}
        fullWidth
        style={styles.landingButton}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: Colors.light.background,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBackground: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  email: {
    fontWeight: "600",
    color: Colors.light.primary,
  },
  description: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 24,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    marginBottom: 16,
  },
  statusContainer: {
    width: "100%",
    marginBottom: 24,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  statusText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: 8,
    fontWeight: "500",
  },
  helpContainer: {
    width: "100%",
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  cancelButton: {
    marginBottom: 8,
  },
  landingButton: {
    marginTop: 8,
  },

});