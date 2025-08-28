import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { Platform } from 'react-native';

// Error handling for Firebase initialization
let app: any;
let auth: any;
let db: any;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyCNgY6TSMIpS1SZ35SfiXvAX7QN9nD-mdQ",
    authDomain: "aicheckapp.firebaseapp.com",
    projectId: "aicheckapp",
    storageBucket: "aicheckapp.firebasestorage.app",
    messagingSenderId: "238521808677",
    appId: "1:238521808677:web:4fd1f6e69e4c7eb75d8ccc",
    measurementId: "G-NXMGT387J8"
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);

  // Initialize Firebase Auth
  auth = getAuth(app);

  // Initialize Firestore
  db = getFirestore(app);

  // For development, you can connect to emulators
  // Uncomment these lines if you want to use Firebase emulators
  // if (__DEV__ && Platform.OS !== 'web') {
  //   connectAuthEmulator(auth, 'http://localhost:9099');
  //   connectFirestoreEmulator(db, 'localhost', 8080');
  // }
} catch (error) {
  // Firebase initialization failed - create mock objects to prevent crashes
  app = null;
  auth = null;
  db = null;
}

export { auth, db };
export default app;

// Firestore Collections Structure:
// 
// users/{userId} - User profiles and subscription data
//   - id: string (Firebase Auth UID)
//   - email: string
//   - name: string
//   - role: "free" | "basic" | "premium" | "enterprise" | "admin"
//   - subscriptionType: "trial" | "basic" | "premium" | null
//   - subscriptionEndsAt: string | null
//   - usageCount: number (current month usage)
//   - usageLimit: number (plan limit)
//   - createdAt: string
//   - emailVerified: boolean
//   - stripeCustomerId?: string
//   - subscriptionId?: string
//
// analyses/{analysisId} - User-specific analysis results
//   - userId: string (reference to users collection - ensures data isolation)
//   - text: string (analyzed text)
//   - classification: "human" | "ai" | "mixed"
//   - confidenceScore: number (0-100)
//   - highlights: array (suspicious text segments)
//   - suggestions: array (improvement recommendations)
//   - createdAt: string (ISO timestamp)
//
// Security Rules:
// - Users can only read/write their own data
// - Analysis documents are filtered by userId
// - Usage limits are enforced server-side