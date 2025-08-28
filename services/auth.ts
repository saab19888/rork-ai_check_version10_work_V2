import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from "@/types";

// Convert Firebase user to our User type
const convertFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Get additional user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.data();
  

  
  const user: User = {
    id: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName: firebaseUser.displayName || userData?.name || '',
    subscription: (userData?.role === 'premium' ? 'premium' : userData?.role === 'basic' ? 'basic' : 'trial') as 'trial' | 'basic' | 'premium',
    createdAt: userData?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Legacy fields for backward compatibility
    name: firebaseUser.displayName || userData?.name || '',
    role: userData?.role || 'free',
    subscriptionEndsAt: userData?.subscriptionEndsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    usageCount: userData?.usageCount || 0,
    usageLimit: userData?.usageLimit || 5,
    emailVerified: firebaseUser.emailVerified,
    stripeCustomerId: userData?.stripeCustomerId,
    subscriptionId: userData?.subscriptionId,
  };
  

  return user;
};

export const login = async (email: string, password: string): Promise<User> => {
  try {
    if (!auth) {
      throw new Error('Authentication service is not available');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = await convertFirebaseUser(userCredential.user);
    
    // Cache user data locally
    await AsyncStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (error: any) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

export const register = async (name: string, email: string, password: string): Promise<{ user: User; needsVerification: boolean }> => {
  try {
    if (!auth) {
      throw new Error('Authentication service is not available');
    }
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Update the user's display name
    await updateProfile(firebaseUser, {
      displayName: name
    });
    
    // Create Stripe customer
    let stripeCustomerId: string | undefined;
    try {
      const { createCustomer } = await import('./stripe');
      const stripeResponse = await createCustomer(email, name);
      if (stripeResponse.success) {
        stripeCustomerId = stripeResponse.customerId;
      }
    } catch (stripeError) {
      // Don't fail registration if Stripe customer creation fails
    }
    
    // Create user document in Firestore
    const userData = {
      name,
      email,
      role: 'free',
      subscriptionEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 0,
      usageLimit: 5,
      createdAt: new Date().toISOString(),
      stripeCustomerId,
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    // Send email verification
    await sendEmailVerification(firebaseUser);
    
    const user = await convertFirebaseUser(firebaseUser);
    
    // Cache user data locally
    await AsyncStorage.setItem("user", JSON.stringify(user));
    
    return { user, needsVerification: true };
  } catch (error: any) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

export const logout = async (): Promise<void> => {
  try {

    if (auth) {

      await signOut(auth);

    } else {

    }

    await AsyncStorage.removeItem("user");

  } catch (error: any) {

    throw new Error('Failed to logout');
  }
};

export const deleteAccount = async (): Promise<void> => {
  try {

    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user found to delete');
    }
    
    const userId = user.uid;

    
    // Delete user document from Firestore first
    try {
      await deleteDoc(doc(db, 'users', userId));

    } catch (firestoreError) {

      // Continue with auth deletion even if Firestore deletion fails
    }
    
    // Delete the Firebase Auth user
    await deleteUser(user);

    
    // Clear local storage
    await AsyncStorage.removeItem("user");

    

  } catch (error: any) {

    throw new Error(getFirebaseErrorMessage(error.code) || 'Failed to delete account');
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    if (!auth) {
      throw new Error('Authentication service is not available');
    }
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

export const resendEmailVerification = async (): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    } else {
      throw new Error('No user found or email already verified');
    }
  } catch (error: any) {
    throw new Error('Failed to resend verification email');
  }
};

export const checkEmailVerification = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser;
    if (user) {
      await user.reload(); // Refresh user data
      return user.emailVerified;
    }
    return false;
  } catch (error: any) {
    return false;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    // First check if we have cached user data
    const userJson = await AsyncStorage.getItem("user");
    if (userJson) {
      const cachedUser = JSON.parse(userJson);
      // If we have a current Firebase user, update the cached data
      if (auth.currentUser) {
        const updatedUser = await convertFirebaseUser(auth.currentUser);
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
      return cachedUser;
    }
    
    // If no cached data but we have a Firebase user, convert it
    if (auth.currentUser) {
      const user = await convertFirebaseUser(auth.currentUser);
      await AsyncStorage.setItem("user", JSON.stringify(user));
      return user;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {

    
    // Update Firestore document - only include defined fields
    const updateData: any = {
      name: user.name,
      role: user.role,
      subscriptionEndsAt: user.subscriptionEndsAt,
      usageCount: user.usageCount,
      usageLimit: user.usageLimit,
    };
    
    // Only include optional fields if they have values
    if (user.stripeCustomerId !== undefined) {
      updateData.stripeCustomerId = user.stripeCustomerId;
    }
    if (user.subscriptionId !== undefined) {
      updateData.subscriptionId = user.subscriptionId;
    }
    
    await updateDoc(doc(db, 'users', user.id), updateData);
    

    
    // Update Firebase Auth profile if name changed
    if (auth.currentUser && auth.currentUser.displayName !== user.name) {
      await updateProfile(auth.currentUser, {
        displayName: user.name
      });
    }
    
    // Update cached data
    await AsyncStorage.setItem("user", JSON.stringify(user));

    
    return user;
  } catch (error: any) {

    throw new Error('Failed to update user');
  }
};

// Set up auth state listener
export const setupAuthListener = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const user = await convertFirebaseUser(firebaseUser);
        await AsyncStorage.setItem("user", JSON.stringify(user));
        callback(user);
      } catch (error) {
        callback(null);
      }
    } else {
      await AsyncStorage.removeItem("user");
      callback(null);
    }
  });
};

// Helper function to convert Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'Email is already registered. Please use a different email or try logging in.';
    case 'auth/weak-password':
      return 'Password is too weak. Please choose a stronger password.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};