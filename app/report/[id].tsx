import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Share,
  Alert,
  Platform,
} from "react-native";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams, useRouter } from "expo-router";
import { 
  Download, 
  Share2, 
  Clock, 
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Card from "@/components/Card";
import Button from "@/components/Button";
import ConfidenceGauge from "@/components/ConfidenceGauge";
import TextHighlighter from "@/components/TextHighlighter";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import { useAnalysis } from "@/hooks/analysis-store";
import { useAuth } from "@/hooks/auth-store";
import { AnalysisResult } from "@/types";
import { getAnalysisById } from "@/services/analysis";

export default function ReportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const { getAnalysisById: getAnalysisFromStore } = useAnalysis();
  const { user } = useAuth();
  
  // Load report data
  useEffect(() => {
    const loadReport = async () => {
      if (!id || !user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        // First try to get from local store
        const localReport = getAnalysisFromStore(id);
        if (localReport) {
          setReport(localReport);
          setLoading(false);
          return;
        }
        
        // If not found locally, try to fetch from Firestore with user verification
        const firestoreReport = await getAnalysisById(id, user.id);
        if (firestoreReport) {
          setReport(firestoreReport);
        } else {
          console.log(`⚠️ Analysis ${id} not found or doesn't belong to user ${user.id}`);
        }
      } catch (error) {
        console.log('❌ Error loading report:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadReport();
  }, [id, user?.id, getAnalysisFromStore]);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Get classification icon
  const getClassificationIcon = () => {
    if (!report) return null;
    
    switch (report.classification) {
      case "human":
        return <CheckCircle2 size={24} color={Colors.light.humanIndicator} />;
      case "ai":
        return <XCircle size={24} color={Colors.light.aiIndicator} />;
      case "mixed":
        return <AlertCircle size={24} color={Colors.light.mixedIndicator} />;
      default:
        return null;
    }
  };
  
  // Get classification label
  const getClassificationLabel = () => {
    if (!report) return "";
    
    switch (report.classification) {
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
  
  // Handle share report
  const handleShareReport = async () => {
    if (!report) return;
    
    try {
      await Share.share({
        title: "AI-Check Analysis Report",
        message: `AI-Check Analysis Report\n\nClassification: ${getClassificationLabel()}\nConfidence: ${report.confidenceScore}%\nDate: ${formatDate(report.createdAt)}\n\nText: ${report.text.substring(0, 100)}...`,
      });
    } catch (error) {
      console.error("Error sharing report:", error);
    }
  };
  
  // Generate HTML report content
  const generateHTMLReport = () => {
    if (!report) return '';
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>AI-Check Analysis Report</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #fff;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007AFF;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007AFF;
                margin-bottom: 10px;
            }
            .date {
                color: #666;
                font-size: 14px;
            }
            .result-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            }
            .classification {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .human { color: #28a745; }
            .ai { color: #dc3545; }
            .mixed { color: #ffc107; }
            .confidence {
                font-size: 18px;
                color: #666;
            }
            .text-section {
                margin-bottom: 20px;
            }
            .section-title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 15px;
                color: #007AFF;
            }
            .analyzed-text {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #007AFF;
                white-space: pre-wrap;
                word-wrap: break-word;
            }
            .suggestions {
                margin-bottom: 20px;
            }
            .suggestion-item {
                margin-bottom: 10px;
                padding-left: 20px;
                position: relative;
            }
            .suggestion-item:before {
                content: '•';
                color: #007AFF;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
            .footer {
                text-align: center;
                color: #666;
                font-size: 12px;
                font-style: italic;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">AI-Check Analysis Report</div>
            <div class="date">Generated on ${formatDate(report.createdAt)}</div>
        </div>
        
        <div class="result-section">
            <div class="classification ${report.classification}">
                ${getClassificationLabel()}
            </div>
            <div class="confidence">
                Confidence Score: ${report.confidenceScore}%
            </div>
        </div>
        
        <div class="text-section">
            <div class="section-title">Analyzed Text</div>
            <div class="analyzed-text">${report.text}</div>
        </div>
        
        <div class="suggestions">
            <div class="section-title">Suggestions</div>
            ${report.suggestions.map(suggestion => 
                `<div class="suggestion-item">${suggestion}</div>`
            ).join('')}
        </div>
        
        <div class="footer">
            Note: This analysis is for demonstration purposes only. Results may vary in a production environment.
        </div>
    </body>
    </html>
    `;
    
    return html;
  };

  // Handle download report
  const handleDownloadReport = async () => {
    if (!report) return;
    
    try {
      if (Platform.OS === 'web') {
        // Web download
        const htmlContent = generateHTMLReport();
        const blob = new (window as any).Blob([htmlContent], { type: 'text/html' });
        const url = (window as any).URL.createObjectURL(blob);
        
        const link = (window as any).document.createElement('a');
        link.href = url;
        link.download = `ai-check-report-${report.id}.html`;
        (window as any).document.body.appendChild(link);
        link.click();
        (window as any).document.body.removeChild(link);
        (window as any).URL.revokeObjectURL(url);
        
        Alert.alert('Success', 'Report downloaded successfully!');
      } else {
        // Mobile download
        const htmlContent = generateHTMLReport();
        const fileUri = `${FileSystem.documentDirectory}ai-check-report-${report.id}.html`;
        
        await FileSystem.writeAsStringAsync(fileUri, htmlContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/html',
            dialogTitle: 'Save AI-Check Report',
          });
        } else {
          Alert.alert(
            'Report Generated', 
            `Report saved to: ${fileUri}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      Alert.alert(
        'Download Error',
        'Failed to download the report. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading report...</Text>
      </View>
    );
  }
  
  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Report not found</Text>
        <Button
          title="Go Back"
          variant="outline"
          onPress={() => router.back()}
          style={styles.errorButton}
        />
      </View>
    );
  }
  
  return (
    <EmailVerificationGuard>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={Colors.light.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Analysis Report</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShareReport}
          >
            <Share2 size={20} color={Colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleDownloadReport}
          >
            <Download size={20} color={Colors.light.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.dateContainer}>
        <Clock size={16} color={Colors.light.textSecondary} />
        <Text style={styles.dateText}>{formatDate(report.createdAt)}</Text>
      </View>
      
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.classificationContainer}>
            {getClassificationIcon()}
            <Text style={styles.classificationText}>
              {getClassificationLabel()}
            </Text>
          </View>
        </View>
        
        <ConfidenceGauge 
          score={report.confidenceScore} 
          classification={report.classification}
          size={200}
        />
      </Card>
      
      <Card style={styles.textCard}>
        <View style={styles.cardHeader}>
          <FileText size={20} color={Colors.light.primary} />
          <Text style={styles.cardTitle}>Analyzed Text</Text>
        </View>
        
        <TextHighlighter 
          text={report.text} 
          highlights={report.highlights}
          maxHeight={300}
        />
      </Card>
      
      <Card style={styles.suggestionsCard}>
        <Text style={styles.suggestionsTitle}>Suggestions</Text>
        
        {report.suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionBullet} />
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </View>
        ))}
      </Card>
      
      <View style={styles.actionsContainer}>
        <Button
          title="Download Report"
          icon={<Download size={16} color="#fff" />}
          onPress={handleDownloadReport}
          style={styles.downloadButton}
        />
        
        <Button
          title="New Analysis"
          variant="outline"
          onPress={() => router.push("/analyze")}
          style={styles.newAnalysisButton}
        />
      </View>
      
        <Text style={styles.disclaimer}>
          Note: This analysis is for demonstration purposes only. Results may vary in a production environment.
        </Text>
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.error,
    marginBottom: 16,
  },
  errorButton: {
    minWidth: 120,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 6,
  },
  resultCard: {
    marginBottom: 16,
    alignItems: "center",
  },
  resultHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  classificationContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  classificationText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  textCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginLeft: 8,
  },
  suggestionsCard: {
    marginBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 16,
  },
  suggestionItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  suggestionBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginTop: 6,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    flex: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  downloadButton: {
    flex: 1,
    marginRight: 8,
  },
  newAnalysisButton: {
    flex: 1,
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});