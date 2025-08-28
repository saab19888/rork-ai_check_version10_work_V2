import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { FileText, Clock } from "lucide-react-native";
import Colors from "@/constants/colors";
import { AnalysisResult } from "@/types";

interface AnalysisHistoryItemProps {
  item: AnalysisResult;
  onPress: (item: AnalysisResult) => void;
}

export default function AnalysisHistoryItem({ item, onPress }: AnalysisHistoryItemProps) {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get classification color
  const getClassificationColor = () => {
    switch (item.classification) {
      case "human":
        return Colors.light.humanIndicator;
      case "ai":
        return Colors.light.aiIndicator;
      case "mixed":
        return Colors.light.mixedIndicator;
      default:
        return Colors.light.textSecondary;
    }
  };

  // Get classification label
  const getClassificationLabel = () => {
    switch (item.classification) {
      case "human":
        return "Human Written";
      case "ai":
        return "AI Generated";
      case "mixed":
        return "Mixed Content";
      default:
        return "Unknown";
    }
  };

  // Get truncated text preview
  const getTextPreview = () => {
    if (item.text.length <= 100) return item.text;
    return item.text.substring(0, 100) + "...";
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      testID="analysis-history-item"
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <FileText size={20} color={Colors.light.primary} />
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.dateContainer}>
            <Clock size={14} color={Colors.light.textSecondary} />
            <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
          </View>
          
          <View 
            style={[
              styles.classificationBadge, 
              { backgroundColor: getClassificationColor() + "20" }
            ]}
          >
            <Text 
              style={[
                styles.classificationText, 
                { color: getClassificationColor() }
              ]}
            >
              {getClassificationLabel()}
            </Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.textPreview}>{getTextPreview()}</Text>
      
      <View style={styles.footer}>
        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence:</Text>
          <Text 
            style={[
              styles.confidenceValue, 
              { color: getClassificationColor() }
            ]}
          >
            {item.confidenceScore}%
          </Text>
        </View>
        
        <Text style={styles.viewDetails}>View Details</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.light.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  classificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  classificationText: {
    fontSize: 12,
    fontWeight: "600",
  },
  textPreview: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  viewDetails: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: "500",
  },
});