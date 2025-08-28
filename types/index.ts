export type UserRole = "free" | "basic" | "premium" | "enterprise" | "admin";
export type SubscriptionType = "trial" | "basic" | "premium" | null;

export interface User {
  id: string;
  email: string;
  displayName: string;
  subscription: 'trial' | 'basic' | 'premium';
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  name?: string;
  role?: UserRole;
  subscriptionType?: SubscriptionType;
  subscriptionEndsAt?: string | null;
  usageCount?: number;
  usageLimit?: number;
  emailVerified?: boolean;
  stripeCustomerId?: string;
  subscriptionId?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  checkLimit: number;
  highlighted?: boolean;
}

export interface AnalysisHighlight {
  start: number;
  end: number;
  type: string;
  confidence: number;
}

export interface AnalysisResultData {
  confidence: number;
  prediction: string;
  highlights: {
    start: number;
    end: number;
    type: string;
    confidence: number;
  }[];
  metadata: any;
}

export interface Analysis {
  id: string;
  userId: string;
  originalText: string;
  analysisResult: {
    confidence: number;
    prediction: string;
    highlights: {
      start: number;
      end: number;
      type: string;
      confidence: number;
    };
    metadata: any;
  };
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  title?: string;
  tags?: string[];
  isBookmarked?: boolean;
  processingTime?: number;
  modelVersion?: string;
  analysisType?: string;
}

export type AnalysisResult = {
  id: string;
  text: string;
  classification: "human" | "ai" | "mixed";
  confidenceScore: number;
  highlights: Array<{
    start: number;
    end: number;
    reason: string;
  }>;
  suggestions: string[];
  createdAt: string;
};

export type AnalysisRequest = {
  text: string;
  fileName?: string;
  fileType?: string;
};