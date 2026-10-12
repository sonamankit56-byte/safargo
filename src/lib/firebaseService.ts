/**
 * SafarGo Firebase Service
 * Handles Authentication, Email Verification, Firestore Database, and Cloud Storage.
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  updateProfile,
  User,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, isFirebaseConfigured } from './firebase';
import { Profile, Booking, WalletRechargeRequest } from '../types';

/**
 * Register a user and automatically dispatch an Email Verification link
 */
export async function registerWithEmailVerification(
  email: string,
  pass: string,
  fullName: string,
  mobile: string,
  role: 'agent' | 'customer' | 'promoter' = 'agent'
): Promise<{ success: boolean; user?: User; message: string }> {
  if (!isFirebaseConfigured || !auth || !db) {
    return {
      success: false,
      message: 'Firebase क्रेडेंशियल्स अभी कॉन्फ़िगर नहीं हैं।',
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const user = cred.user;

    // Set display name in Firebase Auth
    await updateProfile(user, {
      displayName: fullName,
    });

    // Send Email Verification
    try {
      await sendEmailVerification(user, {
        url: window.location.origin,
        handleCodeInApp: true,
      });
    } catch (verErr: any) {
      console.warn('[Firebase] Verification email send warning:', verErr);
    }

    // Save profile to Firestore 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    const profileData: Partial<Profile> = {
      id: user.uid,
      email,
      mobile,
      full_name: fullName,
      role,
      agent_status: role === 'agent' ? 'pending_approval' : 'approved',
      created_at: new Date().toISOString(),
    };
    await setDoc(userDocRef, profileData, { merge: true });

    return {
      success: true,
      user,
      message: 'पंजीकरण सफल! सत्यापन ईमेल आपके इनबॉक्स पर भेज दिया गया है।',
    };
  } catch (err: any) {
    console.error('[Firebase] Sign up error:', err);
    return {
      success: false,
      message: err.message || 'Firebase पंजीकरण में त्रुटि हुई।',
    };
  }
}

/**
 * Resend verification email to current logged-in user
 */
export async function resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
  if (!auth?.currentUser) {
    return { success: false, message: 'कोई लॉगिन यूजर नहीं मिला।' };
  }

  try {
    await sendEmailVerification(auth.currentUser, {
      url: window.location.origin,
    });
    return {
      success: true,
      message: 'ईमेल सत्यापन लिंक पुनः भेज दिया गया है। कृपया अपना इनबॉक्स / स्पैम फोल्डर चेक करें।',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'सत्यापन लिंक भेजने में त्रुटि हुई।',
    };
  }
}

/**
 * Upload screenshot to Firebase Cloud Storage and return public URL
 */
export async function uploadScreenshotToFirebase(
  dataUrlOrBase64: string,
  folder = 'wallet_receipts'
): Promise<string | null> {
  if (!isFirebaseConfigured || !storage) return null;

  try {
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
    const storageRef = ref(storage, filename);
    
    // Upload base64 data url
    await uploadString(storageRef, dataUrlOrBase64, 'data_url');
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (err) {
    console.error('[Firebase Storage] Upload error:', err);
    return null;
  }
}

/**
 * Save wallet recharge request to Firestore
 */
export async function saveWalletRechargeToFirestore(recharge: WalletRechargeRequest): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const docRef = doc(db, 'wallet_recharges', recharge.id);
    await setDoc(docRef, recharge, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Recharge save error:', err);
    return false;
  }
}

/**
 * Save booking to Firestore
 */
export async function saveBookingToFirestore(booking: Booking): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;

  try {
    const docRef = doc(db, 'bookings', booking.id);
    await setDoc(docRef, booking, { merge: true });
    return true;
  } catch (err) {
    console.error('[Firebase Firestore] Booking save error:', err);
    return false;
  }
}
