import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Colors from "@/constants/colors";

interface UsageChartProps {
  used: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function UsageChart({ 
  used, 
  total, 
  size = 120, 
  strokeWidth = 12 
}: UsageChartProps) {
  // Calculate percentage
  const percentage = total === 0 ? 0 : Math.min(100, (used / total) * 100);
  
  // Calculate radius and center
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke dash offset
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Determine color based on usage
  const getColor = () => {
    if (percentage < 50) return Colors.light.success;
    if (percentage < 80) return Colors.light.warning;
    return Colors.light.error;
  };

  return (
    <View style={styles.container} testID="usage-chart">
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={Colors.light.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${center}, ${center})`}
        />
      </Svg>
      
      <View style={styles.textContainer}>
        <Text style={styles.percentageText}>{Math.round(percentage)}%</Text>
        <Text style={styles.usageText}>
          {used} / {total === Infinity ? "∞" : total}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  textContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentageText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  usageText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
});