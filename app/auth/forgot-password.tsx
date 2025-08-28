import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { KeyRound, ArrowLeft } from "lucide-react-native";
import Colors from "@/constants/colors";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/hooks/auth-store";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const router = useRouter();
  const { resetPassword, resetPasswordIsLoading } = useAuth();
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };
  
  const handleResetPassword = () => {
    if (validateEmail(email)) {
      resetPassword(email);
      setIsSubmitted(true);
      
      // In a real app, this would send a password reset email
      // For this demo, we'll just show a success message
      Alert.alert(
        "Reset Email Sent",
        "If an account exists with this email, you will receive password reset instructions.",
        [{ text: "OK" }]
      );
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.light.text} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <KeyRound size={32} color={Colors.light.primary} />
          </View>
        </View>
        
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we&apos;ll send you instructions to reset your password
        </Text>
        
        {!isSubmitted ? (
          <View style={styles.formContainer}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) validateEmail(text);
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
              fullWidth
            />
            
            <Button
              title="Send Reset Link"
              size="large"
              onPress={handleResetPassword}
              isLoading={resetPasswordIsLoading}
              disabled={resetPasswordIsLoading}
              fullWidth
              style={styles.resetButton}
            />
          </View>
        ) : (
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We&apos;ve sent password reset instructions to:
            </Text>
            <Text style={styles.emailText}>{email}</Text>
            <Button
              title="Back to Login"
              variant="outline"
              onPress={() => router.push("/auth/login")}
              style={styles.backToLoginButton}
            />
          </View>
        )}
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Remember your password?</Text>
          <Link href="/auth/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoBackground: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.light.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  formContainer: {
    width: "100%",
  },
  resetButton: {
    marginTop: 16,
    marginBottom: 24,
  },
  successContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  successIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.success,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 24,
  },
  backToLoginButton: {
    minWidth: 200,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  loginText: {
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
  loginLink: {
    color: Colors.light.primary,
    fontWeight: "600",
  },
});