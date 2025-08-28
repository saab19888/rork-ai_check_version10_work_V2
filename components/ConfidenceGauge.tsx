import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import Colors from "@/constants/colors";

interface ConfidenceGaugeProps {
  score: number;
  classification: "human" | "ai" | "mixed";
  size?: number;
}

export default function ConfidenceGauge({ 
  score, 
  classification, 
  size = 120 
}: ConfidenceGaugeProps) {
  // Calculate the color based on classification
  const getColor = () => {
    switch (classification) {
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

  // Calculate the angle for the gauge
  const calculateAngle = () => {
    // Convert score to angle (0-100 to 0-180 degrees)
    return (score / 100) * 180;
  };

  // Calculate the path for the gauge arc
  const calculatePath = () => {
    const radius = size / 2 - 10;
    const angle = calculateAngle();
    const startAngle = -90; // Start at top
    const endAngle = startAngle + angle;
    
    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Calculate start and end points
    const startX = size / 2 + radius * Math.cos(startRad);
    const startY = size / 2 + radius * Math.sin(startRad);
    const endX = size / 2 + radius * Math.cos(endRad);
    const endY = size / 2 + radius * Math.sin(endRad);
    
    // Determine if the arc should be drawn as a large arc
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    // Create the path
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  };

  // Get the label based on classification and score
  const getLabel = () => {
    if (score < 50) return "Low Confidence";
    if (score < 75) return "Medium Confidence";
    return "High Confidence";
  };

  return (
    <View style={styles.container} testID="confidence-gauge">
      <Svg width={size} height={size / 2 + 10}>
        {/* Background arc */}
        <Path
          d={`M ${10} ${size / 2} A ${size / 2 - 10} ${size / 2 - 10} 0 0 1 ${size - 10} ${size / 2}`}
          stroke={Colors.light.border}
          strokeWidth={8}
          fill="none"
        />
        
        {/* Colored arc based on score */}
        <Path
          d={calculatePath()}
          stroke={getColor()}
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Center point */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={4}
          fill={getColor()}
        />
      </Svg>
      
      <View style={styles.scoreContainer}>
        <Text style={[styles.score, { color: getColor() }]}>{score}%</Text>
        <Text style={styles.label}>{getLabel()}</Text>
        <Text style={[styles.classification, { color: getColor() }]}>
          {classification === "human" ? "Human Written" : 
           classification === "ai" ? "AI Generated" : "Mixed Content"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  scoreContainer: {
    alignItems: "center",
    marginTop: 8,
  },
  score: {
    fontSize: 28,
    fontWeight: "bold",
  },
  label: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  classification: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
});