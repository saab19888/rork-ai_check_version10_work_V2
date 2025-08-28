import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react-native";
import * as DocumentPicker from "expo-document-picker";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import Card from "@/components/Card";
import EmailVerificationGuard from "@/components/EmailVerificationGuard";
import { useAuth } from "@/hooks/auth-store";
import { useAnalysis } from "@/hooks/analysis-store";
import { AnalysisRequest } from "@/types";

export default function AnalyzeScreen() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isTextFromFile, setIsTextFromFile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { canPerformAnalysis, getRemainingChecks } = useAuth();
  const { analyzeText, isAnalyzing, currentResult } = useAnalysis();

  // Clear result when navigating to this screen
  useEffect(() => {
    return () => {
      setText("");
      setFileName(null);
      setFileType(null);
      setIsTextFromFile(false);
      setError(null);
    };
  }, []);

  // Navigate to result if available
  useEffect(() => {
    if (currentResult) {
      router.push(`/report/${currentResult.id}`);
    }
  }, [currentResult, router]);



  const handleTextChange = (value: string) => {
    setText(value);
    setIsTextFromFile(false);
    setFileName(null);
    setFileType(null);
    setError(null);
  };

  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"],
        copyToCacheDirectory: true,
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      
      // In a real app, we would extract text from the file
      // For this demo, we'll simulate text extraction
      setFileName(file.name);
      setFileType(file.mimeType || "unknown");
      
      // Simulate text extraction based on file type
      let extractedText = "";
      
      if (file.mimeType?.includes("pdf")) {
        extractedText = "This is simulated text extracted from a PDF file. In a real application, we would use a PDF parsing library to extract the actual text content from the document.";
      } else if (file.mimeType?.includes("word")) {
        extractedText = "This is simulated text extracted from a Word document. In a real application, we would use a document parsing library to extract the actual text content from the file.";
      } else if (file.mimeType?.includes("text/plain")) {
        extractedText = "This is simulated text from a plain text file. In a real application, we would read the actual content of the text file.";
      } else {
        extractedText = "Text extracted from uploaded file. This is a placeholder for the actual content that would be extracted in a production application.";
      }
      
      setText(extractedText);
      setIsTextFromFile(true);
      setError(null);
    } catch {
      setError("Failed to upload file. Please try again.");
    }
  };

  const handleAnalyze = () => {
    if (!text.trim()) {
      setError("Please enter text or upload a file to analyze");
      return;
    }
    
    if (!canPerformAnalysis()) {
      Alert.alert(
        "Usage Limit Reached",
        "You've reached your plan's usage limit. Please upgrade to continue analyzing content.",
        [
          { text: "View Plans", onPress: () => router.push("/(tabs)/pricing") },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }
    
    const request: AnalysisRequest = {
      text,
      fileName: fileName || undefined,
      fileType: fileType || undefined,
    };
    
    analyzeText(request);
  };

  const remainingChecks = getRemainingChecks();

  return (
    <EmailVerificationGuard>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Analyze Content</Text>
      <Text style={styles.subtitle}>
        Enter text or upload a document to check if it was written by AI or human
      </Text>
      
      <Card style={styles.inputCard}>
        <Text style={styles.inputLabel}>Enter text to analyze:</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Paste or type text here..."
          value={text}
          onChangeText={handleTextChange}
          textAlignVertical="top"
        />
        
        {isTextFromFile && fileName && (
          <View style={styles.fileInfoContainer}>
            <CheckCircle2 size={16} color={Colors.light.success} />
            <Text style={styles.fileInfoText}>
              Text extracted from: {fileName}
            </Text>
          </View>
        )}
        
        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color={Colors.light.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </Card>
      
      <Text style={styles.orText}>OR</Text>
      
      <TouchableOpacity 
        style={styles.uploadContainer}
        onPress={handleFileUpload}
        activeOpacity={0.7}
      >
        <View style={styles.uploadIconContainer}>
          <FileUp size={24} color={Colors.light.primary} />
        </View>
        <Text style={styles.uploadText}>Upload Document</Text>
        <Text style={styles.uploadSubtext}>PDF, DOCX, or TXT files</Text>
      </TouchableOpacity>
      
      <View style={styles.usageContainer}>
        <Text style={styles.usageText}>
          Remaining checks: <Text style={styles.usageCount}>{remainingChecks}</Text>
        </Text>
      </View>
      
      <Button
        title={isAnalyzing ? "Analyzing..." : "Analyze Content"}
        size="large"
        isLoading={isAnalyzing}
        disabled={!text.trim() || isAnalyzing}
        onPress={handleAnalyze}
        style={styles.analyzeButton}
      />
      
        <Text style={styles.disclaimer}>
          Note: This is a demonstration of AI content detection. Results are for illustrative purposes only.
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  inputCard: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.light.text,
    marginBottom: 12,
  },
  textInput: {
    height: 200,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    color: Colors.light.text,
  },
  fileInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.light.success + "10",
    borderRadius: 8,
  },
  fileInfoText: {
    fontSize: 14,
    color: Colors.light.success,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    padding: 8,
    backgroundColor: Colors.light.error + "10",
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.light.error,
    marginLeft: 8,
  },
  orText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginVertical: 16,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: Colors.light.primary + "40",
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary + "05",
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.primary,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  usageContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: "center",
  },
  usageText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  usageCount: {
    fontWeight: "600",
    color: Colors.light.text,
  },
  analyzeButton: {
    marginTop: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 24,
    fontStyle: "italic",
  },
});