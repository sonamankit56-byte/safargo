import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, AgentStatus, PendingLoginOtp } from '../types';
import { INITIAL_PROFILES } from '../lib/mockData';
import { useToast } from './ToastContext';
import { db } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import { getClientDeviceString, fetchClientIpAddress, generateSecureOtpCode } from '../lib/securityUtils';
import { safeSetItem } from '../lib/storageUtils';
import { isFirebaseConfigured } from '../lib/firebase';
import { registerWithEmailVerification, sendFirebasePasswordReset, signInWithGoogle } from '../lib/firebaseService';
import { sendLoginOtpEmail, sendLoginSuccessAlertEmail } from '../lib/emailService';

interface AuthContextType {
  currentUser: Profile | null;
  allProfiles: Profile[];
  role: UserRole | null;
  isApprovedAgent: boolean;
  isAdmin: boolean;
  isPromoter: boolean;
  isCustomer: boolean;
  isShopkeeper: boolean;
  login: (emailOrMobile: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  pendingLoginOtps: PendingLoginOtp[];
  initiateAgentLogin: (
    emailOrMobile: string,
    password?: string
  ) => Promise<{ success: boolean; pendingOtp?: PendingLoginOtp; isSuperAdmin?: boolean; message?: string }>;
  verifyLoginOtp: (otpId: string, otpCode: string) => Promise<boolean>;
  adminApproveLoginOtp: (otpId: string) => Promise<boolean>;
  setSecurityMpin: (agentId: string, mpin: string) => Promise<boolean>;
  registerAgent: (details: {
    full_name: string;
    mobile: string;
    email: string;
    city: string;
    district: string;
    address: string;
    shop_name?: string;
    referral_code?: string;
    password?: string;
  }) => Promise<boolean>;
  registerCustomer: (details: {
    full_name: string;
    mobile: string;
    email?: string;
    city: string;
    district?: string;
    address: string;
    password?: string;
  }) => Promise<boolean>;
  registerShopkeeper: (details: {
    full_name: string;
    shop_name: string;
    mobile: string;
    email?: string;
    city: string;
    district?: string;
    address: string;
    category?: 'kirana' | 'medical' | 'dairy' | 'bakery' | 'hardware' | 'general_store';
    password?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updated: Partial<Profile>) => Promise<boolean>;
  updateUserProfile: (userId: string, updated: Partial<Profile>) => Promise<boolean>;
  approveAgent: (agentId: string) => Promise<boolean>;
  rejectAgent: (agentId: string) => Promise<boolean>;
  suspendAgent: (agentId: string) => Promise<boolean>;
  approveAgentKyc: (agentId: string) => Promise<boolean>;
  rejectAgentKyc: (agentId: string, reason: string) => Promise<boolean>;
  submitAgentKyc: (kycData: {
    aadhaar_number: string;
    pan_number: string;
    aadhaar_front_url?: string;
    aadhaar_back_url?: string;
    pan_card_url?: string;
    bank_account_holder: string;
    bank_account_number: string;
    bank_ifsc: string;
    bank_name: string;
    bank_upi_id?: string;
    avatar_url?: string;
  }) => Promise<boolean>;
  resetPassword: (emailOrMobile: string, newPassword: string) => Promise<boolean>;
  createOrUpdatePromoterAccount: (params: {
    applicationId: string;
    applicantName: string;
    mobile: string;
    email?: string;
    slotNo: number;
    password: string;
    userId?: string;
  }) => Promise<boolean>;
}

const STORAGE_KEY_PROFILES = 'safargo_profiles_v1';
const STORAGE_KEY_CURRENT_USER = 'safargo_current_user_id_v1';
const STORAGE_KEY_PENDING_OTPS = 'safargo_pending_login_otps_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error, info, warning } = useToast();

  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load profiles from local storage', e);
    }
    return INITIAL_PROFILES;
  });

  // Real Database Sync: Hydrate profiles from Supabase if configured without overwriting local KYC submissions
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    db.getProfiles().then((liveProfiles) => {
      if (liveProfiles && liveProfiles.length > 0) {
        setProfiles((prev) => {
          const mergedRemote = liveProfiles.map((remote) => {
            const local = prev.find((p) => p.id === remote.id);
            if (!local) return remote;
            const hasLocalActiveKyc = local.kyc_status === 'pending' || local.kyc_status === 'verified';
            return {
              ...remote,
              ...local,
              kyc_status: hasLocalActiveKyc ? local.kyc_status : (remote.kyc_status || local.kyc_status || 'not_submitted'),
              photo_verified: local.photo_verified ?? remote.photo_verified ?? false,
              aadhaar_number: local.aadhaar_number || remote.aadhaar_number,
              pan_number: local.pan_number || remote.pan_number,
              aadhaar_front_url: local.aadhaar_front_url || remote.aadhaar_front_url,
              aadhaar_back_url: local.aadhaar_back_url || remote.aadhaar_back_url,
              pan_card_url: local.pan_card_url || remote.pan_card_url,
              bank_account_holder: local.bank_account_holder || remote.bank_account_holder,
              bank_account_number: local.bank_account_number || remote.bank_account_number,
              bank_ifsc: local.bank_ifsc || remote.bank_ifsc,
              bank_name: local.bank_name || remote.bank_name,
              bank_upi_id: local.bank_upi_id || remote.bank_upi_id,
              avatar_url: local.avatar_url || remote.avatar_url,
              kyc_submitted_at: local.kyc_submitted_at || remote.kyc_submitted_at,
            };
          });

          // Retain any profiles created locally that are not yet in Supabase
          const remoteIds = new Set(liveProfiles.map((r) => r.id));
          const localOnly = prev.filter((p) => !remoteIds.has(p.id));
          const combined = [...mergedRemote, ...localOnly];
          try {
            localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(combined));
          } catch (e) {
            console.error('Error saving hydrated profiles to localStorage:', e);
          }
          return combined;
        });
      }
    }).catch((err) => console.error('Error fetching Supabase profiles:', err));
  }, []);

  const [pendingLoginOtps, setPendingLoginOtps] = useState<PendingLoginOtp[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PENDING_OTPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load pending otps', e);
    }
    return [];
  });

  // Persist pending login otps
  useEffect(() => {
    safeSetItem(STORAGE_KEY_PENDING_OTPS, JSON.stringify(pendingLoginOtps));
  }, [pendingLoginOtps]);

  // Multi-tab sync: instantly catch KYC submissions & OTP verification from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PROFILES && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated) && updated.length > 0) {
            setProfiles(updated);
          }
        } catch (err) {
          console.error('Storage sync error:', err);
        }
      }
      if (e.key === STORAGE_KEY_PENDING_OTPS && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated)) {
            setPendingLoginOtps(updated);
          }
        } catch (err) {
          console.error('Pending OTP sync error:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved && saved !== 'null' && saved !== 'undefined') return saved;
    } catch (e) {
      console.error('Failed to load current user', e);
    }
    return null; // Production auth: logged out by default for real user experience
  });

  // Persist profiles
  useEffect(() => {
    safeSetItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  // Persist current user id
  useEffect(() => {
    if (currentUserId) {
      safeSetItem(STORAGE_KEY_CURRENT_USER, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUserId]);

  const currentUser = currentUserId ? profiles.find((p) => p.id === currentUserId) || null : null;
  const role: UserRole | null = currentUser ? currentUser.role : null;
  const isAdmin = currentUser?.role === 'admin';
  const isPromoter = currentUser?.role === 'promoter';
  const isCustomer = currentUser?.role === 'customer';
  const isShopkeeper = currentUser?.role === 'shopkeeper';
  const isApprovedAgent = currentUser?.role === 'agent' && currentUser?.agent_status === 'approved';

  const login = async (emailOrMobile: string, password?: string): Promise<boolean> => {
    const term = emailOrMobile.trim().toLowerCase();
    const deviceStr = getClientDeviceString();

    // Special check for primary Super Administrator
    if (term === 'jia647155@gmail.com') {
      if (password && password !== 'Jia@2233') {
        error('Invalid Password', 'गलत एडमिन पासवर्ड दर्ज किया गया है।');
        return false;
      }
      const jia = profiles.find((p) => p.email.toLowerCase() === 'jia647155@gmail.com');
      if (jia) {
        setCurrentUserId(jia.id);
        success('Welcome, Jia!', 'Logged in with Super Admin access.');
        return true;
      }
    }

    const found = profiles.find(
      (p) =>
        p.email.toLowerCase() === term ||
        p.mobile.replace(/\D/g, '') === term.replace(/\D/g, '') ||
        (p.promoter_code && p.promoter_code.toLowerCase() === term) ||
        p.id.toLowerCase() === term
    );

    if (found) {
      if (found.password && password && found.password !== password) {
        error('Invalid Password', 'गलत पासवर्ड दर्ज किया गया है। कृपया सही पासवर्ड डालें या "Forgot Password" का उपयोग करें।');
        return false;
      }

      const nowIso = new Date().toISOString();
      const updated = profiles.map((p) =>
        p.id === found.id
          ? { ...p, last_login_device: deviceStr, last_login_at: nowIso }
          : p
      );
      setProfiles(updated);

      setCurrentUserId(found.id);
      const roleLabel =
        found.role === 'admin'
          ? 'सुपर एडमिन'
          : found.role === 'promoter'
          ? 'प्रमोटर पार्टनर'
          : found.role === 'customer'
          ? 'ग्राहक'
          : found.role === 'shopkeeper'
          ? 'दुकानदार / मर्चेंट'
          : 'सीएससी एजेंट';

      // Send real email login confirmation alert via Resend
      if (found.email) {
        sendLoginSuccessAlertEmail({
          toEmail: found.email,
          userName: found.full_name,
          role: found.role,
          clientDevice: deviceStr,
        }).catch((err) => console.warn('[EmailService] Login alert notice:', err));
      }

      success(`Welcome back, ${found.full_name}!`, `लॉगिन सफल (${roleLabel})`);
      return true;
    } else {
      error('User Not Found', 'यह ईमेल या मोबाइल नंबर पंजीकृत नहीं है। कृपया रजिस्ट्रेशन करें।');
      return false;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const res = await signInWithGoogle();
      if (!res.success || !res.user) {
        if (res.message) error('Google Sign-In', res.message);
        return false;
      }

      const googleUser = res.user;
      const gEmail = (googleUser.email || '').toLowerCase().trim();
      const gName = googleUser.displayName || 'Google User';
      const gUid = googleUser.uid;
      const gPhoto = googleUser.photoURL || undefined;

      // Special check for primary Super Administrator
      if (gEmail === 'jia647155@gmail.com') {
        const jia = profiles.find((p) => p.email.toLowerCase() === 'jia647155@gmail.com');
        if (jia) {
          setCurrentUserId(jia.id);
          success('Welcome, Jia!', 'Google Sign-In सफल: Super Admin access.');
          return true;
        }
      }

      // Check if existing profile matches email or uid
      const existing = profiles.find(
        (p) => (p.email && p.email.toLowerCase() === gEmail) || p.id === gUid
      );

      if (existing) {
        const nowIso = new Date().toISOString();
        const updated = profiles.map((p) =>
          p.id === existing.id
            ? { ...p, last_login_at: nowIso, avatar_url: p.avatar_url || gPhoto, photo_verified: true }
            : p
        );
        setProfiles(updated);
        setCurrentUserId(existing.id);
        success(`Welcome back, ${existing.full_name}!`, '👑 Google 1-क्लिक प्रीमियम लॉगिन सफल!');
        return true;
      }

      // If new user via Google Sign-In, create verified profile immediately
      const newProfile: Profile = {
        id: gUid,
        email: gEmail,
        mobile: '9876543210',
        full_name: gName,
        role: 'agent',
        agent_status: 'approved',
        photo_verified: true,
        avatar_url: gPhoto,
        city: 'Indore',
        district: 'Indore',
        created_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      };

      setProfiles((prev) => [newProfile, ...prev]);
      setCurrentUserId(newProfile.id);
      success(`Welcome, ${gName}!`, '👑 Google द्वारा SafarGo प्रीमियम खाता तैयार और लॉगिन सफल!');
      return true;
    } catch (err: any) {
      console.error('loginWithGoogle error:', err);
      error('Google Sign-In Error', err?.message || 'गूगल लॉगिन में समस्या आई।');
      return false;
    }
  };

  const initiateAgentLogin = async (
    emailOrMobile: string,
    password?: string
  ): Promise<{ success: boolean; pendingOtp?: PendingLoginOtp; isSuperAdmin?: boolean; message?: string }> => {
    const term = emailOrMobile.trim().toLowerCase();

    // Super Admin special direct authorization
    if (term === 'jia647155@gmail.com') {
      if (password && password !== 'Jia@2233') {
        error('Invalid Password', 'गलत एडमिन पासवर्ड दर्ज किया गया है।');
        return { success: false, message: 'Invalid password' };
      }
      const jia = profiles.find((p) => p.email.toLowerCase() === 'jia647155@gmail.com');
      if (jia) {
        setCurrentUserId(jia.id);
        success('Welcome, Jia!', 'Logged in with Super Admin access.');
        return { success: true, isSuperAdmin: true };
      }
    }

    const found = profiles.find(
      (p) =>
        p.email.toLowerCase() === term ||
        p.mobile.replace(/\D/g, '') === term.replace(/\D/g, '') ||
        (p.promoter_code && p.promoter_code.toLowerCase() === term) ||
        p.id.toLowerCase() === term
    );

    if (!found) {
      error('User Not Found', 'यह ईमेल या मोबाइल नंबर पंजीकृत नहीं है। कृपया नया एजेंट रजिस्ट्रेशन करें।');
      return { success: false, message: 'User not found' };
    }

    if (found.password && password && found.password !== password) {
      error('Invalid Password', 'गलत पासवर्ड दर्ज किया गया है। कृपया सही पासवर्ड डालें या "Forgot Password" का उपयोग करें।');
      return { success: false, message: 'Invalid password' };
    }

    // Capture real or fallback client IP & device
    const clientIp = await fetchClientIpAddress();
    const clientDevice = getClientDeviceString();
    const otpCode = generateSecureOtpCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 60 * 1000).toISOString(); // 3 mins validity

    const newOtp: PendingLoginOtp = {
      id: `otp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      agent_id: found.id,
      agent_name: found.full_name,
      agent_mobile: found.mobile,
      agent_email: found.email,
      otp_code: otpCode,
      ip_address: clientIp,
      device_info: clientDevice,
      created_at: now.toISOString(),
      expires_at: expiresAt,
      is_verified: false,
      status: 'pending',
    };

    setPendingLoginOtps((prev) => [newOtp, ...prev.filter((p) => p.agent_id !== found.id)]);

    // Dispatch real Gmail / Email OTP via Resend API
    if (found.email) {
      sendLoginOtpEmail({
        toEmail: found.email,
        userName: found.full_name,
        otpCode,
        clientIp,
        clientDevice,
      }).catch((err) => console.error('[Resend] Failed to send login OTP email:', err));
    }

    return { success: true, pendingOtp: newOtp };
  };

  const verifyLoginOtp = async (otpId: string, otpCode: string): Promise<boolean> => {
    const target = pendingLoginOtps.find((o) => o.id === otpId);
    if (!target) {
      error('Session Expired', 'सुरक्षा सत्र नहीं मिला। कृपया पुनः लॉगिन करें।');
      return false;
    }

    const nowIso = new Date().toISOString();
    if (target.expires_at < nowIso) {
      error('OTP Expired', 'सुरक्षा कोड की 3 मिनट की समय सीमा समाप्त हो गई है। कृपया नया कोड प्राप्त करें।');
      return false;
    }

    if (target.otp_code.trim() !== otpCode.trim() && target.status !== 'admin_approved') {
      error('Invalid OTP', 'गलत OTP कोड दर्ज किया गया है। कृपया सही 6-अंकों का कोड दर्ज करें।');
      return false;
    }

    // Mark as verified
    setPendingLoginOtps((prev) =>
      prev.map((o) => (o.id === otpId ? { ...o, is_verified: true, status: 'verified' } : o))
    );

    // Update profile with audit log
    const agentIndex = profiles.findIndex((p) => p.id === target.agent_id);
    if (agentIndex !== -1) {
      const updated = [...profiles];
      updated[agentIndex] = {
        ...updated[agentIndex],
        last_login_ip: target.ip_address,
        last_login_device: target.device_info,
        last_login_at: nowIso,
      };
      setProfiles(updated);
      if (isSupabaseConfigured) {
        db.updateProfile(target.agent_id, {
          last_login_ip: target.ip_address,
          last_login_device: target.device_info,
          last_login_at: nowIso,
        }).catch(console.error);
      }
    }

    // Dispatch login success alert email via Resend
    if (target.agent_email) {
      sendLoginSuccessAlertEmail({
        toEmail: target.agent_email,
        userName: target.agent_name,
        role: 'agent',
        clientIp: target.ip_address,
        clientDevice: target.device_info,
      }).catch((err) => console.warn('[EmailService] Login alert notice:', err));
    }

    setCurrentUserId(target.agent_id);
    success(`स्वागत है, ${target.agent_name}!`, 'सुरक्षा OTP एवं डिवाइस सत्यापन सफल। सुरक्षित सत्र प्रारंभ हुआ।');
    return true;
  };

  const adminApproveLoginOtp = async (otpId: string): Promise<boolean> => {
    const target = pendingLoginOtps.find((o) => o.id === otpId);
    if (!target) return false;

    setPendingLoginOtps((prev) =>
      prev.map((o) => (o.id === otpId ? { ...o, is_verified: true, status: 'admin_approved' } : o))
    );
    success('Approved by Admin', `${target.agent_name} के लॉगिन को एडमिन ने तुरंत स्वीकृति दे दी।`);
    return true;
  };

  const setSecurityMpin = async (agentId: string, mpin: string): Promise<boolean> => {
    const clean = mpin.replace(/\D/g, '').slice(0, 4);
    if (clean.length !== 4) {
      error('Invalid MPIN', 'सुरक्षा पिन ठीक 4 अंकों का होना चाहिए।');
      return false;
    }
    const updated = profiles.map((p) => (p.id === agentId ? { ...p, security_mpin: clean } : p));
    setProfiles(updated);
    if (isSupabaseConfigured) {
      db.updateProfile(agentId, { security_mpin: clean }).catch(console.error);
    }
    success('MPIN Saved', '4-अंकों का सुरक्षा पिन सुरक्षित रूप से सेव हो गया है।');
    return true;
  };

  const resetPassword = async (emailOrMobile: string, newPassword: string): Promise<boolean> => {
    const term = emailOrMobile.trim().toLowerCase();
    const index = profiles.findIndex(
      (p) => p.email.toLowerCase() === term || p.mobile.replace(/\D/g, '') === term.replace(/\D/g, '')
    );

    if (index === -1) {
      error('User Not Found', 'इस ईमेल या मोबाइल नंबर से कोई खाता नहीं मिला।');
      return false;
    }

    const nowIso = new Date().toISOString();
    const updated = [...profiles];
    updated[index] = {
      ...updated[index],
      password: newPassword.trim(),
      updated_at: nowIso,
    };

    setProfiles(updated);

    if (isSupabaseConfigured) {
      db.updateProfile(updated[index].id, {
        password: newPassword.trim(),
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase reset password sync error:', e));
    }

    if (isFirebaseConfigured && term.includes('@')) {
      sendFirebasePasswordReset(term).catch((e) => console.warn('[Firebase] Reset password error:', e));
    }

    success('Password Reset Successful', 'आपका पासवर्ड सफलतापूर्वक अपडेट हो गया है! अब नए पासवर्ड से लॉगिन करें।');
    return true;
  };

  const registerAgent = async (details: {
    full_name: string;
    mobile: string;
    email: string;
    city: string;
    district: string;
    address: string;
    shop_name?: string;
    referral_code?: string;
    password?: string;
  }): Promise<boolean> => {
    // Check if phone or email already registered
    const exists = profiles.some(
      (p) => p.mobile === details.mobile.trim() || (details.email && p.email === details.email.trim())
    );

    if (exists) {
      error('Registration Failed', 'इस मोबाइल नंबर या ईमेल से पहले से एजेंट खाता पंजीकृत है।');
      return false;
    }

    // Check referral code if provided
    let referrer: Profile | undefined;
    if (details.referral_code && details.referral_code.trim()) {
      const codeClean = details.referral_code.trim().toUpperCase();
      referrer = profiles.find((p) => p.referral_code?.toUpperCase() === codeClean);
      if (referrer) {
        info('Referral Code Applied', `Referred by ${referrer.full_name} (${referrer.shop_name || referrer.city}).`);
      } else {
        warning('Invalid Referral Code', 'रेफरल कोड अमान्य है, बिना रेफरल कोड के रजिस्ट्रेशन जारी है।');
      }
    }

    const newId = `usr-agent-${Date.now()}`;
    const cleanNameTag = details.full_name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'AGENT';
    const myReferralCode = `SFG-REF-${cleanNameTag}${Math.floor(10 + Math.random() * 90)}`;
    const nowIso = new Date().toISOString();

    const newAgent: Profile = {
      id: newId,
      role: 'agent', // Role is locked to agent; admin privileges cannot be chosen at signup
      full_name: details.full_name.trim(),
      mobile: details.mobile.trim(),
      email: details.email.trim() || `${details.mobile.trim()}@safargo.in`,
      city: details.city.trim(),
      district: details.district.trim(),
      address: details.address.trim(),
      shop_name: details.shop_name?.trim() || 'SafarGo Partner Point',
      agent_status: 'pending_approval', // Strictly pending approval
      referral_code: myReferralCode,
      referred_by_code: referrer?.referral_code,
      referred_by_id: referrer?.id,
      promoter_assigned_id: referrer?.role === 'promoter' ? referrer.id : undefined,
      promoter_code: referrer?.role === 'promoter' ? (referrer.promoter_code || referrer.referral_code) : undefined,
      password: details.password?.trim() || 'Agent@123',
      created_at: nowIso,
      updated_at: nowIso,
    };

    setProfiles((prev) => [...prev, newAgent]);

    if (isSupabaseConfigured) {
      db.createProfile(newAgent).catch((e) => console.error('Supabase profile create error:', e));
    }

    if (isFirebaseConfigured && details.email && details.email.includes('@') && !details.email.endsWith('@safargo.in')) {
      registerWithEmailVerification({
        email: details.email.trim(),
        password: details.password?.trim() || 'Agent@123',
        fullName: details.full_name.trim(),
        mobile: details.mobile.trim(),
        role: 'agent',
      })
        .then((res) => {
          if (res.success) {
            info('ईमेल सत्यापन लिंक भेजा गया', 'Google Firebase द्वारा सत्यापन लिंक आपके ईमेल पर भेज दिया गया है।');
          }
        })
        .catch((e) => console.warn('[Firebase Auth] Agent register warning:', e));
    }

    success(
      'पंजीकरण जमा हुआ!',
      'आपकी आईडी SafarGo टीम द्वारा सत्यापन के बाद एक्टिव हो जाएगी।'
    );
    return true;
  };

  const registerCustomer = async (details: {
    full_name: string;
    mobile: string;
    email?: string;
    city: string;
    district?: string;
    address: string;
    password?: string;
  }): Promise<boolean> => {
    const cleanMobile = details.mobile.replace(/\D/g, '');
    const exists = profiles.some(
      (p) => p.mobile === cleanMobile || (details.email && p.email === details.email.trim())
    );

    if (exists) {
      error('Registration Failed', 'इस मोबाइल नंबर या ईमेल से पहले से खाता पंजीकृत है। कृपया लॉगिन करें।');
      return false;
    }

    const newId = `usr-customer-${Date.now()}`;
    const cleanNameTag = details.full_name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'CUST';
    const myReferralCode = `SFG-CUST-${cleanNameTag}${Math.floor(10 + Math.random() * 90)}`;
    const nowIso = new Date().toISOString();

    const newCustomer: Profile = {
      id: newId,
      role: 'customer',
      full_name: details.full_name.trim(),
      mobile: cleanMobile,
      email: details.email?.trim() || `${cleanMobile}@safargo.in`,
      city: details.city.trim(),
      district: details.district?.trim() || details.city.trim(),
      address: details.address.trim(),
      agent_status: 'approved', // Auto-approved! No KYC wait for customers
      referral_code: myReferralCode,
      password: details.password?.trim() || 'Customer@123',
      created_at: nowIso,
      updated_at: nowIso,
    };

    setProfiles((prev) => [...prev, newCustomer]);
    setCurrentUserId(newId);

    if (isSupabaseConfigured) {
      db.createProfile(newCustomer).catch((e) => console.error('Supabase customer create error:', e));
    }

    if (isFirebaseConfigured && details.email && details.email.includes('@') && !details.email.endsWith('@safargo.in')) {
      registerWithEmailVerification({
        email: details.email.trim(),
        password: details.password?.trim() || 'Customer@123',
        fullName: details.full_name.trim(),
        mobile: cleanMobile,
        role: 'customer',
      })
        .then((res) => {
          if (res.success) {
            info('ईमेल सत्यापन लिंक भेजा गया', 'Google Firebase द्वारा सत्यापन लिंक आपके ईमेल पर भेज दिया गया है।');
          }
        })
        .catch((e) => console.warn('[Firebase Auth] Customer register warning:', e));
    }

    success(
      `स्वागत है, ${newCustomer.full_name}! 🎉`,
      'आपका ग्राहक खाता तुरंत सक्रिय हो गया है। अब बस टिकट व 15-मिनट क्विक डिलीवरी का आनंद लें।'
    );
    return true;
  };

  const registerShopkeeper = async (details: {
    full_name: string;
    shop_name: string;
    mobile: string;
    email?: string;
    city: string;
    district?: string;
    address: string;
    category?: 'kirana' | 'medical' | 'dairy' | 'bakery' | 'hardware' | 'general_store';
    password?: string;
  }): Promise<boolean> => {
    const cleanMobile = details.mobile.replace(/\D/g, '');
    const exists = profiles.some(
      (p) => p.mobile === cleanMobile || (details.email && p.email === details.email.trim())
    );

    if (exists) {
      error('Registration Failed', 'इस मोबाइल नंबर से पहले से खाता पंजीकृत है।');
      return false;
    }

    const newId = `usr-shopkeeper-${Date.now()}`;
    const cleanNameTag = details.full_name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5) || 'SHOP';
    const myReferralCode = `SFG-SHOP-${cleanNameTag}${Math.floor(10 + Math.random() * 90)}`;
    const nowIso = new Date().toISOString();

    const newShopkeeper: Profile = {
      id: newId,
      role: 'shopkeeper',
      full_name: details.full_name.trim(),
      shop_name: details.shop_name.trim(),
      mobile: cleanMobile,
      email: details.email?.trim() || `${cleanMobile}@safargo.in`,
      city: details.city.trim(),
      district: details.district?.trim() || details.city.trim(),
      address: details.address.trim(),
      agent_status: 'approved',
      referral_code: myReferralCode,
      password: details.password?.trim() || 'Shop@123',
      created_at: nowIso,
      updated_at: nowIso,
    };

    setProfiles((prev) => [...prev, newShopkeeper]);
    setCurrentUserId(newId);

    if (isSupabaseConfigured) {
      db.createProfile(newShopkeeper).catch((e) => console.error('Supabase shopkeeper create error:', e));
    }

    if (isFirebaseConfigured && details.email && details.email.includes('@') && !details.email.endsWith('@safargo.in')) {
      registerWithEmailVerification({
        email: details.email.trim(),
        password: details.password?.trim() || 'Shop@123',
        fullName: details.full_name.trim(),
        mobile: cleanMobile,
        role: 'shopkeeper',
      })
        .then((res) => {
          if (res.success) {
            info('ईमेल सत्यापन लिंक भेजा गया', 'Google Firebase द्वारा सत्यापन लिंक आपके ईमेल पर भेज दिया गया है।');
          }
        })
        .catch((e) => console.warn('[Firebase Auth] Shopkeeper register warning:', e));
    }

    success(
      `नमस्ते, ${newShopkeeper.full_name}! 🏪`,
      'आपकी दुकान का खाता पंजीकृत हो गया है। अब अपनी दुकान से सामान बेचें व ऑर्डर प्राप्त करें।'
    );
    return true;
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    try {
      sessionStorage.clear();
      localStorage.removeItem('safargo_auth_token');
      localStorage.removeItem('safargo_active_session');
    } catch (e) {
      console.warn('Session clear warning:', e);
    }
    info('लॉगआउट सफल', 'आप सुरक्षित रूप से लॉगआउट हो चुके हैं।');
  };

  const updateUserProfile = async (userId: string, updated: Partial<Profile>): Promise<boolean> => {
    if (!userId) return false;

    const nowIso = new Date().toISOString();
    setProfiles((prev) => {
      const next = prev.map((p) =>
        p.id === userId
          ? { ...p, ...updated, updated_at: nowIso }
          : p
      );
      safeSetItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
      return next;
    });

    if (isSupabaseConfigured) {
      db.updateProfile(userId, { ...updated, updated_at: nowIso }).catch((e) =>
        console.error('Supabase updateUserProfile error:', e)
      );
    }

    return true;
  };

  const updateProfile = async (updated: Partial<Profile>): Promise<boolean> => {
    if (!currentUser) return false;

    // Security check: regular agents cannot elevate role or self-approve status!
    if (!isAdmin) {
      delete updated.role;
      delete updated.agent_status;
      delete updated.approved_by;
      delete updated.approved_at;
    }

    await updateUserProfile(currentUser.id, updated);
    return true;
  };

  const approveAgent = async (agentId: string): Promise<boolean> => {
    if (!isAdmin && !isPromoter) {
      error('Permission Denied', 'केवल एडमिन या अधिकृत प्रमोटर ही एजेंट स्वीकृत कर सकते हैं।');
      return false;
    }

    const nowIso = new Date().toISOString();
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === agentId
          ? {
              ...p,
              agent_status: 'approved',
              approved_by: currentUser?.id,
              approved_at: nowIso,
              updated_at: nowIso,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updateProfile(agentId, {
        agent_status: 'approved',
        approved_by: currentUser?.id,
        approved_at: nowIso,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase approveAgent error:', e));
    }

    success('Agent Approved', 'एजेंट अब लाइव बुकिंग करने हेतु अधिकृत है।');
    return true;
  };

  const rejectAgent = async (agentId: string): Promise<boolean> => {
    if (!isAdmin && !isPromoter) {
      error('Permission Denied', 'केवल एडमिन या अधिकृत प्रमोटर ही एजेंट अस्वीकृत कर सकते हैं।');
      return false;
    }

    const nowIso = new Date().toISOString();
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === agentId
          ? {
              ...p,
              agent_status: 'rejected',
              updated_at: nowIso,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updateProfile(agentId, {
        agent_status: 'rejected',
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase rejectAgent error:', e));
    }

    info('Agent Rejected', 'एजेंट आवेदन अस्वीकृत कर दिया गया है।');
    return true;
  };

  const suspendAgent = async (agentId: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Permission Denied', 'केवल एडमिन ही एजेंट निलंबित कर सकते हैं।');
      return false;
    }

    const nowIso = new Date().toISOString();
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === agentId
          ? {
              ...p,
              agent_status: 'suspended',
              updated_at: nowIso,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updateProfile(agentId, {
        agent_status: 'suspended',
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase suspendAgent error:', e));
    }

    warning('Agent Suspended', 'एजेंट खाता अस्थायी रूप से निलंबित कर दिया गया है।');
    return true;
  };

  const submitAgentKyc = async (kycData: {
    aadhaar_number: string;
    pan_number: string;
    aadhaar_front_url?: string;
    aadhaar_back_url?: string;
    pan_card_url?: string;
    bank_account_holder: string;
    bank_account_number: string;
    bank_ifsc: string;
    bank_name: string;
    bank_upi_id?: string;
    avatar_url?: string;
  }): Promise<boolean> => {
    if (!currentUser) return false;

    const nowIso = new Date().toISOString();
    const updates: Partial<Profile> = {
      kyc_status: 'pending',
      aadhaar_number: kycData.aadhaar_number.trim(),
      pan_number: kycData.pan_number.trim().toUpperCase(),
      aadhaar_front_url: kycData.aadhaar_front_url,
      aadhaar_back_url: kycData.aadhaar_back_url,
      pan_card_url: kycData.pan_card_url,
      bank_account_holder: kycData.bank_account_holder.trim(),
      bank_account_number: kycData.bank_account_number.trim(),
      bank_ifsc: kycData.bank_ifsc.trim().toUpperCase(),
      bank_name: kycData.bank_name.trim(),
      bank_upi_id: kycData.bank_upi_id?.trim(),
      avatar_url: kycData.avatar_url || currentUser.avatar_url,
      kyc_submitted_at: nowIso,
      updated_at: nowIso,
    };

    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === currentUser.id ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving profiles to localStorage:', err);
      }
      return next;
    });

    if (isSupabaseConfigured) {
      db.updateProfile(currentUser.id, updates).catch((e) =>
        console.error('Supabase submitAgentKyc error:', e)
      );
    }

    success(
      'KYC अनुरोध जमा हुआ! 📑',
      'आपकी KYC वेरिफिकेशन 12 घंटे के अंदर हो जाएगी और एडमिन को रिक्वेस्ट भेज दी गई है।'
    );
    return true;
  };

  const approveAgentKyc = async (agentId: string): Promise<boolean> => {
    if (!isAdmin && !isPromoter) {
      error('Permission Denied', 'केवल एडमिन या अधिकृत प्रमोटर ही एजेंट KYC स्वीकृत कर सकते हैं।');
      return false;
    }

    const nowIso = new Date().toISOString();
    const updates: Partial<Profile> = {
      kyc_status: 'verified',
      photo_verified: true, // Verified tick badge appears!
      kyc_verified_at: nowIso,
      kyc_verified_by: currentUser?.id,
      updated_at: nowIso,
    };

    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === agentId ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving profiles to localStorage:', err);
      }
      return next;
    });

    if (isSupabaseConfigured) {
      db.updateProfile(agentId, updates).catch((e) =>
        console.error('Supabase approveAgentKyc error:', e)
      );
    }

    success(
      'एजेंट KYC स्वीकृत! ✅',
      'एजेंट के प्रोफाइल पर सत्यापित (✓ Verified) बैज एक्टिव हो गया है और विथड्रॉल अनलॉक कर दिया गया है।'
    );
    return true;
  };

  const rejectAgentKyc = async (agentId: string, reason: string): Promise<boolean> => {
    if (!isAdmin && !isPromoter) {
      error('Permission Denied', 'केवल एडमिन या अधिकृत प्रमोटर ही एजेंट KYC अस्वीकृत कर सकते हैं।');
      return false;
    }

    const nowIso = new Date().toISOString();
    const updates: Partial<Profile> = {
      kyc_status: 'rejected',
      photo_verified: false,
      kyc_rejection_reason: reason,
      updated_at: nowIso,
    };

    setProfiles((prev) => {
      const next = prev.map((p) => (p.id === agentId ? { ...p, ...updates } : p));
      try {
        localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(next));
      } catch (err) {
        console.error('Error saving profiles to localStorage:', err);
      }
      return next;
    });

    if (isSupabaseConfigured) {
      db.updateProfile(agentId, updates).catch((e) =>
        console.error('Supabase rejectAgentKyc error:', e)
      );
    }

    warning('KYC Rejected', `एजेंट KYC अस्वीकृत: ${reason}`);
    return true;
  };

  const createOrUpdatePromoterAccount = async (params: {
    applicationId: string;
    applicantName: string;
    mobile: string;
    email?: string;
    slotNo: number;
    password: string;
    userId?: string;
  }): Promise<boolean> => {
    if (!isAdmin) {
      error('Permission Denied', 'केवल सुपर एडमिन ही प्रमोटर यूजर आईडी व पासवर्ड बना सकते हैं।');
      return false;
    }

    const { applicantName, mobile, email, slotNo, password, userId } = params;
    const cleanMobile = mobile.replace(/\D/g, '');
    const promoterCode = `PRM-MP-0${slotNo}`;
    const nowIso = new Date().toISOString();

    const existingIndex = profiles.findIndex(
      (p) =>
        p.role === 'promoter' &&
        (p.promoter_slot_no === slotNo ||
          p.mobile.replace(/\D/g, '') === cleanMobile ||
          (p.promoter_code && p.promoter_code === promoterCode))
    );

    let nextProfiles: Profile[];
    if (existingIndex >= 0) {
      const existing = profiles[existingIndex];
      const updated: Profile = {
        ...existing,
        full_name: applicantName,
        mobile: cleanMobile,
        email: email || existing.email || `${cleanMobile}@safargo.in`,
        password: password,
        promoter_code: promoterCode,
        promoter_slot_no: slotNo,
        promoter_salary: 15000,
        agent_status: 'approved',
        updated_at: nowIso,
      };
      nextProfiles = profiles.map((p, idx) => (idx === existingIndex ? updated : p));
    } else {
      const newPromoter: Profile = {
        id: userId || `usr-promoter-0${slotNo}`,
        role: 'promoter',
        full_name: applicantName,
        mobile: cleanMobile,
        email: email || `${cleanMobile}@safargo.in`,
        city: 'Sironj',
        district: 'Vidisha',
        address: 'Madhya Pradesh Cluster Operations',
        shop_name: `SafarGo Territory Manager - Slot #${slotNo}`,
        agent_status: 'approved',
        referral_code: promoterCode,
        promoter_code: promoterCode,
        promoter_slot_no: slotNo,
        promoter_salary: 15000,
        password: password,
        created_at: nowIso,
        updated_at: nowIso,
      };
      nextProfiles = [newPromoter, ...profiles];
    }

    setProfiles(nextProfiles);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(nextProfiles));
    } catch (err) {
      console.error(err);
    }

    success(
      'प्रमोटर क्रेडेंशियल्स सक्रिय! 🔑',
      `${applicantName} (स्लॉट #${slotNo}) के लिए यूजर आईडी: ${cleanMobile} और पासवर्ड सेट हो गया है।`
    );
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allProfiles: profiles,
        role,
        isApprovedAgent,
        isAdmin,
        isPromoter,
        isCustomer,
        isShopkeeper,
        login,
        loginWithGoogle,
        pendingLoginOtps,
        initiateAgentLogin,
        verifyLoginOtp,
        adminApproveLoginOtp,
        setSecurityMpin,
        registerAgent,
        registerCustomer,
        registerShopkeeper,
        logout,
        updateProfile,
        updateUserProfile,
        approveAgent,
        rejectAgent,
        suspendAgent,
        approveAgentKyc,
        rejectAgentKyc,
        submitAgentKyc,
        resetPassword,
        createOrUpdatePromoterAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
