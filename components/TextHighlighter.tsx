import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import Colors from "@/constants/colors";

interface Highlight {
  start: number;
  end: number;
  reason: string;
}

interface TextHighlighterProps {
  text: string;
  highlights: Highlight[];
  maxHeight?: number;
}

export default function TextHighlighter({ 
  text, 
  highlights, 
  maxHeight = 300 
}: TextHighlighterProps) {
  // Sort highlights by start position
  const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);
  
  // Create text segments with highlights
  const renderTextSegments = () => {
    const segments = [];
    let lastEnd = 0;
    
    sortedHighlights.forEach((highlight, index) => {
      // Add non-highlighted text before this highlight
      if (highlight.start > lastEnd) {
        segments.push(
          <Text key={`text-${index}`} style={styles.normalText}>
            {text.substring(lastEnd, highlight.start)}
          </Text>
        );
      }
      
      // Add highlighted text
      segments.push(
        <Text 
          key={`highlight-${index}`} 
          style={styles.highlightedText}
        >
          {text.substring(highlight.start, highlight.end)}
        </Text>
      );
      
      lastEnd = highlight.end;
    });
    
    // Add any remaining text after the last highlight
    if (lastEnd < text.length) {
      segments.push(
        <Text key="text-end" style={styles.normalText}>
          {text.substring(lastEnd)}
        </Text>
      );
    }
    
    return segments;
  };

  return (
    <View style={styles.container} testID="text-highlighter">
      <ScrollView 
        style={[styles.textContainer, { maxHeight }]}
        contentContainerStyle={styles.textContent}
      >
        <Text style={styles.textWrapper}>
          {renderTextSegments()}
        </Text>
      </ScrollView>
      
      {highlights.length > 0 && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Highlighted sections:</Text>
          {highlights.map((highlight, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>{highlight.reason}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  textContainer: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  textContent: {
    padding: 16,
  },
  normalText: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  highlightedText: {
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderRadius: 2,
    color: Colors.light.text,
    textDecorationLine: "underline",
    textDecorationColor: Colors.light.accent,
    textDecorationStyle: "dotted",
  },
  legendContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.light.text,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.accent,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  textWrapper: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
});