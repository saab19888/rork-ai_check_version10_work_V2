import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet } from "react-native";
import { AuthProvider } from "@/hooks/auth-store";
import { AnalysisProvider } from "@/hooks/analysis-store";
import { StripeProvider } from "@/hooks/stripe-store";
import { useInactivityTracker } from "@/hooks/inactivity-tracker";
import { InactivityWarning } from "@/components/InactivityWarning";
import Colors from "@/constants/colors";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error for debugging
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            The app encountered an error. Please restart the app.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});

function RootLayoutNav() {
  // Initialize inactivity tracker
  const { showWarning, countdown, onStayLoggedIn, onLogout } = useInactivityTracker();

  return (
    <>
      <Stack screenOptions={{ headerBackTitle: "Back" }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: "Login", headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ title: "Register", headerShown: false }} />
        <Stack.Screen name="auth/forgot-password" options={{ title: "Reset Password", headerShown: false }} />
        <Stack.Screen name="auth/verify-email" options={{ title: "Verify Email", headerShown: false }} />
        <Stack.Screen name="report/[id]" options={{ title: "Analysis Report" }} />
        <Stack.Screen name="subscription-management" options={{ title: "Subscription Management" }} />
      </Stack>
      
      <InactivityWarning
        visible={showWarning}
        countdown={countdown}
        onStayLoggedIn={onStayLoggedIn}
        onLogout={onLogout}
      />
    </>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StripeProvider>
            <AnalysisProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </AnalysisProvider>
          </StripeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}