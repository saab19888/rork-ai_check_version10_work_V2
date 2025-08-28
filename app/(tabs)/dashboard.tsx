import React, { useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { 
  User as UserIcon, 
  Calendar, 
  Clock, 
  BarChart3,
  FileText,
  Settings,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Card from "@/components/Card";
import Button from "@/components/Button";
import UsageChart from "@/components/UsageChart";
import AnalysisHistoryItem from "@/components/AnalysisHistoryItem";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import { useAuth } from "@/hooks/auth-store";
import { useAnalysis } from "@/hooks/analysis-store";
import { AnalysisResult } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { db } from "@/services/firebase";


export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, logout, getRemainingChecks } = useAuth();
  const { savedResults, historyResults, isLoadingHistory } = useAnalysis();
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };
  
  // Get subscription end date
  const getSubscriptionEndDate = () => {
    if (!user?.subscriptionEndsAt) return "Lifetime";
    return formatDate(user.subscriptionEndsAt);
  };
  
  // Get plan name
  const getPlanName = () => {
    switch (user?.role) {
      case "free":
        return "Free Trial";
      case "basic":
        return "Basic Plan";
      case "premium":
        return "Premium Plan";
      case "enterprise":
        return "Enterprise Plan";
      case "admin":
        return "Admin Account";
      default:
        return "Unknown Plan";
    }
  };
  
  // Combine saved and history results, removing duplicates
  const allResults = React.useMemo(() => {
    // Ensure both arrays exist before processing
    const safeResults = savedResults || [];
    const safeHistoryResults = historyResults || [];
    
    // If both arrays are empty or undefined, return empty array
    if (safeResults.length === 0 && safeHistoryResults.length === 0) {
      return [];
    }
    
    const combinedResults = [...safeResults];
    
    safeHistoryResults.forEach(historyItem => {
      if (!combinedResults.some(savedItem => savedItem.id === historyItem.id)) {
        combinedResults.push(historyItem);
      }
    });
    
    // Sort by date, newest first
    return combinedResults.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [savedResults, historyResults]);
  

  
  // Handle refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Invalidate and refetch analysis history from Firebase
      await queryClient.invalidateQueries({ queryKey: ["analysisHistory", user?.id] });
    } catch (error) {
      // Ignore refresh errors
    } finally {
      setRefreshing(false);
    }
  }, [user?.id, queryClient]);
  
  // Handle view report
  const handleViewReport = (item: AnalysisResult) => {
    router.push(`/report/${item.id}`);
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    router.push("/");
  };
  

  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  
  return (
    <EmailVerificationGuard>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileIconContainer}>
          <UserIcon size={32} color={Colors.light.primary} />
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => router.push("/subscription-management")}
        >
          <Settings size={20} color={Colors.light.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Subscription Info */}
      <Card style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <Text style={styles.subscriptionTitle}>Current Plan</Text>
          <TouchableOpacity 
            style={styles.upgradeBadge}
            onPress={() => router.push("/subscription-management")}
          >
            <Text style={styles.upgradeText}>Manage</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.planName}>{getPlanName()}</Text>
        
        <View style={styles.subscriptionDetails}>
          <View style={styles.subscriptionItem}>
            <Calendar size={16} color={Colors.light.textSecondary} />
            <Text style={styles.subscriptionText}>
              Expires: {getSubscriptionEndDate()}
            </Text>
          </View>
          
          <View style={styles.subscriptionItem}>
            <Clock size={16} color={Colors.light.textSecondary} />
            <Text style={styles.subscriptionText}>
              Joined: {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>
      </Card>
      
      {/* Usage Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.usageCard}>
          <Text style={styles.usageTitle}>Usage</Text>
          <UsageChart 
            used={user.usageCount ?? 0} 
            total={user.usageLimit ?? 100} 
            size={120}
          />
          <Text style={styles.usageSubtext}>
            {getRemainingChecks()} checks remaining
          </Text>
        </Card>
        
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistics</Text>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: Colors.light.primary + "20" }]}>
              <BarChart3 size={16} color={Colors.light.primary} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Total Analyses</Text>
              <Text style={styles.statValue}>{user.usageCount}</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: Colors.light.accent + "20" }]}>
              <FileText size={16} color={Colors.light.accent} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Recent Analyses</Text>
              <Text style={styles.statValue}>{allResults?.length || 0}</Text>
            </View>
          </View>
        </Card>
      </View>
      
      {/* Recent Analyses */}
      <View style={styles.recentContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
          <TouchableOpacity onPress={() => router.push("/analyze")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {isLoadingHistory ? (
          <View style={styles.loadingState}>
            <Text style={styles.loadingText}>Loading analyses...</Text>
          </View>
        ) : !allResults || allResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No analyses yet</Text>
            <Button
              title="Analyze Content"
              variant="outline"
              onPress={() => router.push("/analyze")}
              style={styles.emptyStateButton}
            />
          </View>
        ) : (
          <View>
            {allResults?.slice(0, 5).map((item) => (
              <AnalysisHistoryItem 
                key={item.id} 
                item={item} 
                onPress={handleViewReport} 
              />
            ))}
          </View>
        )}
      </View>
      

      
      {/* Logout Button */}
      <Button
        title="Logout"
        variant="outline"
        onPress={handleLogout}
        style={styles.logoutButton}
        />
      </ScrollView>
    </EmailVerificationGuard>
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profileIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  subscriptionCard: {
    marginBottom: 20,
  },
  subscriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  upgradeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
  },
  upgradeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  planName: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  subscriptionDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subscriptionItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  subscriptionText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  usageCard: {
    width: "48%",
    alignItems: "center",
  },
  usageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  usageSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  statsCard: {
    width: "48%",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  recentContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  emptyStateButton: {
    minWidth: 150,
  },

  logoutButton: {
    marginTop: 8,
  },
  loadingState: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },

});