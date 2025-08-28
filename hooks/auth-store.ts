import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";

import { User, AuthState } from "@/types";
import * as authService from "@/services/auth";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });
  const [verificationSent, setVerificationSent] = useState<boolean>(false);

  const queryClient = useQueryClient();

  // Set up Firebase auth listener
  useEffect(() => {
    const unsubscribe = authService.setupAuthListener((user) => {
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    });

    return unsubscribe;
  }, []);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => 
      authService.login(email, password),
    onSuccess: (user) => {
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    },
    onError: (error: Error) => {
      setAuthState({
        user: null,
        isLoading: false,
        error: error.message,
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: ({ name, email, password }: { name: string; email: string; password: string }) => 
      authService.register(name, email, password),
    onSuccess: ({ user, needsVerification }) => {
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
      // Store verification status for UI handling
      if (needsVerification) {
        setVerificationSent(true);
      }
    },
    onError: (error: Error) => {
      setAuthState({
        user: null,
        isLoading: false,
        error: error.message,
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      queryClient.clear();
    },
    onError: (error: Error) => {
      setAuthState({
        ...authState,
        error: error.message,
      });
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (email: string) => authService.resetPassword(email),
  });

  // Resend email verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authService.resendEmailVerification,
  });

  // Check email verification mutation
  const checkVerificationMutation = useMutation({
    mutationFn: authService.checkEmailVerification,
    onSuccess: (isVerified) => {
      if (isVerified && authState.user) {
        setAuthState({
          ...authState,
          user: {
            ...authState.user,
            emailVerified: true,
          },
        });
      }
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: (user: User) => authService.updateUser(user),
    onSuccess: (user) => {
      setAuthState({
        user,
        isLoading: false,
        error: null,
      });
    },
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: authService.deleteAccount,
    onSuccess: () => {
      setAuthState({
        user: null,
        isLoading: false,
        error: null,
      });
      setVerificationSent(false);
      queryClient.clear();
    },
    onError: (error: Error) => {
      setAuthState({
        ...authState,
        error: error.message,
      });
    },
  });

  // Increment usage count
  const incrementUsage = async () => {
    if (!authState.user) {
      return;
    }
    
    const updatedUser = {
      ...authState.user,
      usageCount: (authState.user.usageCount || 0) + 1,
    };
    
    // Update local state immediately for better UX
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, usageCount: updatedUser.usageCount } : null
    }));
    
    updateUserMutation.mutate(updatedUser);
  };

  // Check if user can perform analysis based on their plan limits
  const canPerformAnalysis = (): boolean => {
    if (!authState.user) return false;
    return (authState.user.usageCount || 0) < (authState.user.usageLimit || 5);
  };

  // Get remaining checks
  const getRemainingChecks = (): number => {
    if (!authState.user) return 0;
    return Math.max(0, (authState.user.usageLimit || 5) - (authState.user.usageCount || 0));
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    error: authState.error,
    isAuthenticated: !!authState.user,
    verificationSent,
    setVerificationSent,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    deleteAccount: deleteAccountMutation.mutate,
    resetPassword: resetPasswordMutation.mutate,
    updateUser: updateUserMutation.mutate,
    resendVerification: resendVerificationMutation.mutate,
    checkVerification: checkVerificationMutation.mutate,
    incrementUsage,
    canPerformAnalysis,
    getRemainingChecks,
    loginIsLoading: loginMutation.isPending,
    registerIsLoading: registerMutation.isPending,
    logoutIsLoading: logoutMutation.isPending,
    deleteAccountIsLoading: deleteAccountMutation.isPending,
    resetPasswordIsLoading: resetPasswordMutation.isPending,
    resendVerificationIsLoading: resendVerificationMutation.isPending,
    checkVerificationIsLoading: checkVerificationMutation.isPending,
  };
});