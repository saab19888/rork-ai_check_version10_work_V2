import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

import { AnalysisRequest, AnalysisResult } from "@/types";
import * as analysisService from "@/services/analysis";
import { useAuth } from "@/hooks/auth-store";

export const [AnalysisProvider, useAnalysis] = createContextHook(() => {
  const [savedResults, setSavedResults] = useState<AnalysisResult[]>([]);
  const queryClient = useQueryClient();
  const { incrementUsage, canPerformAnalysis, user } = useAuth();

  // Load saved results from storage (user-specific)
  useEffect(() => {
    const loadSavedResults = async () => {
      if (!user?.id) {
        // Clear results when user logs out
        setSavedResults([]);
        return;
      }
      
      try {
        const userKey = `analysisResults_${user.id}`;
        const savedJson = await AsyncStorage.getItem(userKey);
        if (savedJson) {
          setSavedResults(JSON.parse(savedJson));
        } else {
          setSavedResults([]);
        }
      } catch (error) {
        setSavedResults([]);
      }
    };

    loadSavedResults();
  }, [user?.id]);

  // Save results to storage when they change (user-specific)
  useEffect(() => {
    const saveResults = async () => {
      if (!user?.id) return;
      
      try {
        const userKey = `analysisResults_${user.id}`;
        await AsyncStorage.setItem(userKey, JSON.stringify(savedResults));
      } catch (error) {
        // Ignore save errors
      }
    };

    if (savedResults.length > 0 && user?.id) {
      saveResults();
    }
  }, [savedResults, user?.id]);

  // Query for analysis history (user-specific)
  const historyQuery = useQuery({
    queryKey: ["analysisHistory", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }
      const results = await analysisService.getAnalysisHistory(user.id);
      return results;
    },
    enabled: !!user?.id,
  });

  // Mutation for analyzing text
  const analysisMutation = useMutation({
    mutationFn: async (request: AnalysisRequest) => {
      if (!canPerformAnalysis()) {
        throw new Error("You've reached your plan's usage limit");
      }
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const result = await analysisService.analyzeText(request);
      
      // Save to Firestore with user ID
      const savedId = await analysisService.saveAnalysisResult(result, user.id);
      
      // Update the result with the Firestore document ID
      return { ...result, id: savedId };
    },
    onSuccess: (result) => {
      // Update local state
      setSavedResults(prev => [result, ...prev]);
      
      // Increment usage count
      incrementUsage();
      
      // Invalidate history query
      queryClient.invalidateQueries({ queryKey: ["analysisHistory", user?.id] });
    },
  });

  // Get a specific analysis by ID
  const getAnalysisById = (id: string): AnalysisResult | undefined => {
    return savedResults.find(result => result.id === id) || 
           historyQuery.data?.find(result => result.id === id);
  };

  // Clear all saved analyses
  const clearAllAnalyses = async () => {
    try {
      if (!user?.id) return;
      
      // Clear local state
      setSavedResults([]);
      
      // Clear AsyncStorage
      const userKey = `analysisResults_${user.id}`;
      await AsyncStorage.removeItem(userKey);
      
      // Invalidate React Query cache
      queryClient.invalidateQueries({ queryKey: ["analysisHistory", user.id] });
    } catch (error) {
      // Ignore clear errors
    }
  };

  return {
    // Analysis state
    savedResults: savedResults || [],
    historyResults: historyQuery.data || [],
    isLoadingHistory: historyQuery.isLoading,
    
    // Analysis actions
    analyzeText: (request: AnalysisRequest) => analysisMutation.mutate(request),
    isAnalyzing: analysisMutation.isPending,
    analysisError: analysisMutation.error ? (analysisMutation.error as Error).message : null,
    getAnalysisById,
    clearAllAnalyses,
    
    // Current analysis result
    currentResult: analysisMutation.data,
  };
});