import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { 
  Shield, 
  Zap, 
  BarChart, 
  Users, 
  Mail, 
  Twitter, 
  Linkedin, 
  Facebook,
  Trash2,
  LogOut
} from "lucide-react-native";
import Colors from "@/constants/colors";
import Button from "@/components/Button";
import { clearAllData } from "@/services/backend";
import { useAuth } from "@/hooks/auth-store";
import { useRouter } from "expo-router";

export default function AboutScreen() {
  const { isAuthenticated, logout, logoutIsLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.push('/');
          }
        }
      ]
    );
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.title}>About AI-Check</Text>
        <Text style={styles.subtitle}>
          Verifying the authenticity of content in the age of AI
        </Text>
        
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1965&auto=format&fit=crop" }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        
        <Text style={styles.paragraph}>
          AI-Check was founded in 2025 with a mission to help people identify AI-generated content in an increasingly AI-driven world. Our team of experts in artificial intelligence, natural language processing, and content analysis has developed a sophisticated system to detect patterns and markers that distinguish AI-written text from human-authored content.
        </Text>
        
        <Text style={styles.paragraph}>
          As AI language models become more advanced, the line between human and machine-generated content grows increasingly blurred. AI-Check provides individuals, educators, publishers, and businesses with the tools they need to verify content authenticity and maintain trust in digital communications.
        </Text>
      </View>
      
      {/* Our Mission Section */}
      <View style={styles.missionSection}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          To promote transparency and authenticity in digital content by providing accessible tools for AI detection.
        </Text>
      </View>
      
      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose AI-Check?</Text>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.light.primary + "20" }]}>
            <Shield size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Advanced Detection</Text>
            <Text style={styles.featureDescription}>
              Our sophisticated algorithms analyze multiple dimensions of text to identify AI patterns with high accuracy.
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.light.success + "20" }]}>
            <Zap size={24} color={Colors.light.success} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Fast Results</Text>
            <Text style={styles.featureDescription}>
              Get instant analysis of your content with clear, actionable insights and visual indicators.
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.light.accent + "20" }]}>
            <BarChart size={24} color={Colors.light.accent} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>Detailed Reports</Text>
            <Text style={styles.featureDescription}>
              Receive comprehensive reports with highlighted sections and confidence scores to understand results.
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <View style={[styles.featureIcon, { backgroundColor: Colors.light.warning + "20" }]}>
            <Users size={24} color={Colors.light.warning} />
          </View>
          <View style={styles.featureContent}>
            <Text style={styles.featureTitle}>For Everyone</Text>
            <Text style={styles.featureDescription}>
              From students and educators to publishers and businesses, our tools are designed for all users.
            </Text>
          </View>
        </View>
      </View>
      
      {/* Team Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Team</Text>
        <Text style={styles.teamIntro}>
          AI-Check is built by a dedicated team of experts in artificial intelligence, natural language processing, and content analysis.
        </Text>
        
        <View style={styles.teamGrid}>
          <View style={styles.teamMember}>
            <View style={styles.teamAvatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <Text style={styles.teamName}>Dr. Jane Doe</Text>
            <Text style={styles.teamRole}>Chief AI Scientist</Text>
          </View>
          
          <View style={styles.teamMember}>
            <View style={styles.teamAvatar}>
              <Text style={styles.avatarText}>JS</Text>
            </View>
            <Text style={styles.teamName}>John Smith</Text>
            <Text style={styles.teamRole}>CTO</Text>
          </View>
          
          <View style={styles.teamMember}>
            <View style={styles.teamAvatar}>
              <Text style={styles.avatarText}>AW</Text>
            </View>
            <Text style={styles.teamName}>Alex Wong</Text>
            <Text style={styles.teamRole}>Lead Developer</Text>
          </View>
          
          <View style={styles.teamMember}>
            <View style={styles.teamAvatar}>
              <Text style={styles.avatarText}>SJ</Text>
            </View>
            <Text style={styles.teamName}>Sarah Johnson</Text>
            <Text style={styles.teamRole}>UX Designer</Text>
          </View>
        </View>
      </View>
      
      {/* Contact Section */}
      <View style={styles.contactSection}>
        <Text style={styles.contactTitle}>Get In Touch</Text>
        <Text style={styles.contactDescription}>
          Have questions or need assistance? Our team is here to help.
        </Text>
        
        <Button
          title="Contact Us"
          size="large"
          onPress={() => console.log("Contact us pressed")}
          style={styles.contactButton}
        />
        
        <View style={styles.socialContainer}>
          <TouchableOpacity style={styles.socialButton}>
            <Mail size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Twitter size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Linkedin size={20} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.socialButton}>
            <Facebook size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Section */}
      {isAuthenticated && (
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={logoutIsLoading}
          >
            <LogOut size={20} color={Colors.light.error} />
            <Text style={styles.logoutButtonText}>
              {logoutIsLoading ? 'Logging out...' : 'Logout'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Debug Section (for development) */}
      {__DEV__ && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Debug (Development Only)</Text>
          
          <TouchableOpacity 
            style={[styles.debugButton]}
            onPress={() => {
              Alert.alert(
                'Clear All Data',
                'This will clear all stored subscription and customer data. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear Data',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await clearAllData();
                        Alert.alert('Success', 'All backend data has been cleared.');
                      } catch (error) {
                        Alert.alert('Error', 'Failed to clear data.');
                      }
                    }
                  }
                ]
              );
            }}
          >
            <Trash2 size={20} color={Colors.light.error} />
            <Text style={[styles.debugButtonText]}>Clear Backend Data</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  paragraph: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  missionSection: {
    backgroundColor: Colors.light.primary,
    padding: 24,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  missionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 28,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
  },
  teamIntro: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  teamGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  teamMember: {
    width: "48%",
    alignItems: "center",
    marginBottom: 24,
  },
  teamAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.primary + "30",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  teamRole: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  contactSection: {
    backgroundColor: Colors.light.backgroundSecondary,
    padding: 24,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 8,
  },
  contactDescription: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  contactButton: {
    minWidth: 200,
    marginBottom: 24,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.error + '30',
  },
  debugButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.error + '10',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.error + '30',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.error,
    marginLeft: 12,
  },
});