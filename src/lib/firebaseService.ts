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
  GoogleAuthProvider,
  signInWithPopup,
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
  emailOrParams:
    | string
    | {
        email: string;
        password?: string;
        fullName: string;
        mobile: string;
        role?: 'agent' | 'customer' | 'promoter' | 'shopkeeper';
      },
  pass?: string,
  fullNameParam?: string,
  mobileParam?: string,
  roleParam: 'agent' | 'customer' | 'promoter' | 'shopkeeper' = 'agent'
): Promise<{ success: boolean; user?: User; message: string }> {
  if (!isFirebaseConfigured || !auth || !db) {
    return {
      success: false,
      message: 'Firebase क्रेडेंशियल्स अभी कॉन्फ़िगर नहीं हैं।',
    };
  }

  const email = typeof emailOrParams === 'string' ? emailOrParams : emailOrParams.email;
  const passClean = typeof emailOrParams === 'string' ? pass || '' : emailOrParams.password || '';
  const fullName = typeof emailOrParams === 'string' ? fullNameParam || '' : emailOrParams.fullName;
  const mobile = typeof emailOrParams === 'string' ? mobileParam || '' : emailOrParams.mobile;
  const role = typeof emailOrParams === 'string' ? roleParam : emailOrParams.role || 'agent';

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, passClean);
    const user = cred.user;

    // Set display name in Firebase Auth
    await updateProfile(user, {
      displayName: fullName,
    });

    // Send Email Verification
    try {
      await sendEmailVerification(user);
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
 * Login with Firebase Auth
 */
export async function loginWithFirebase(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; message?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, message: 'Firebase कॉन्फ़िगर नहीं है।' };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    return { success: true, user: cred.user };
  } catch (err: any) {
    console.error('[Firebase] Sign in error:', err);
    return { success: false, message: err.message || 'लॉगिन में त्रुटि हुई।' };
  }
}

/**
 * Sign in with Google (1-Click Popup Auth)
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; message?: string }> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, message: 'Firebase कॉन्फ़िगर नहीं है।' };
  }

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return { success: true, user: cred.user };
  } catch (err: any) {
    console.error('[Firebase] Google sign in error:', err);
    if (err?.code === 'auth/popup-closed-by-user') {
      return { success: false, message: 'गूगल साइन-इन विंडो बंद कर दी गई।' };
    }
    return { success: false, message: err?.message || 'गूगल साइन-इन में समस्या आई।' };
  }
}

/**
 * Check if the currently authenticated Firebase user has verified their email
 */
export async function checkIsEmailVerified(): Promise<boolean> {
  if (!auth?.currentUser) return false;
  try {
    await auth.currentUser.reload();
    return Boolean(auth.currentUser.emailVerified);
  } catch {
    return false;
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
 * Send Password Reset Email
 */
export async function sendFirebasePasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!isFirebaseConfigured || !auth) {
    return { success: false, message: 'Firebase कॉन्फ़िगर नहीं है।' };
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: window.location.origin,
    });
    return {
      success: true,
      message: 'पासवर्ड रीसेट लिंक आपके ईमेल पर भेज दिया गया है।',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'पासवर्ड रीसेट लिंक भेजने में समस्या आई।',
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

/**
 * Fetch all bookings from Firestore
 */
export async function fetchFirestoreBookings(): Promise<Booking[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const coll = collection(db, 'bookings');
    const snap = await getDocs(coll);
    return snap.docs.map((d) => d.data() as Booking);
  } catch (err) {
    console.error('[Firebase Firestore] Fetch bookings error:', err);
    return [];
  }
}

/**
 * Fetch all wallet recharges from Firestore
 */
export async function fetchFirestoreWalletRecharges(): Promise<WalletRechargeRequest[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const coll = collection(db, 'wallet_recharges');
    const snap = await getDocs(coll);
    return snap.docs.map((d) => d.data() as WalletRechargeRequest);
  } catch (err) {
    console.error('[Firebase Firestore] Fetch recharges error:', err);
    return [];
  }
}
