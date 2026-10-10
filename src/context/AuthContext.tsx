import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole, AgentStatus } from '../types';
import { INITIAL_PROFILES } from '../lib/mockData';
import { useToast } from './ToastContext';
import { db } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  currentUser: Profile | null;
  allProfiles: Profile[];
  role: UserRole | null;
  isApprovedAgent: boolean;
  isAdmin: boolean;
  login: (emailOrMobile: string, password?: string) => Promise<boolean>;
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
  logout: () => void;
  updateProfile: (updated: Partial<Profile>) => Promise<boolean>;
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
}

const STORAGE_KEY_PROFILES = 'safargo_profiles_v1';
const STORAGE_KEY_CURRENT_USER = 'safargo_current_user_id_v1';

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
          return liveProfiles.map((remote) => {
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
        });
      }
    }).catch((err) => console.error('Error fetching Supabase profiles:', err));
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
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  // Persist current user id
  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentUserId);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUserId]);

  const currentUser = currentUserId ? profiles.find((p) => p.id === currentUserId) || null : null;
  const role: UserRole | null = currentUser ? currentUser.role : null;
  const isAdmin = currentUser?.role === 'admin';
  const isApprovedAgent = currentUser?.role === 'agent' && currentUser?.agent_status === 'approved';

  const login = async (emailOrMobile: string, password?: string): Promise<boolean> => {
    const term = emailOrMobile.trim().toLowerCase();

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
      (p) => p.email.toLowerCase() === term || p.mobile.replace(/\D/g, '') === term.replace(/\D/g, '')
    );

    if (found) {
      if (found.password && password && found.password !== password) {
        error('Invalid Password', 'गलत पासवर्ड दर्ज किया गया है। कृपया सही पासवर्ड डालें या "Forgot Password" का उपयोग करें।');
        return false;
      }
      setCurrentUserId(found.id);
      success(`Welcome back, ${found.full_name}!`, `लॉगिन सफल (${found.role === 'admin' ? 'एडमिन' : 'एजेंट'})`);
      return true;
    } else {
      error('User Not Found', 'यह ईमेल या मोबाइल नंबर पंजीकृत नहीं है। कृपया नया एजेंट रजिस्ट्रेशन करें।');
      return false;
    }
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
      password: details.password?.trim() || 'Agent@123',
      created_at: nowIso,
      updated_at: nowIso,
    };

    setProfiles((prev) => [...prev, newAgent]);

    if (isSupabaseConfigured) {
      db.createProfile(newAgent).catch((e) => console.error('Supabase profile create error:', e));
    }

    success(
      'पंजीकरण जमा हुआ!',
      'आपकी आईडी SafarGo टीम द्वारा सत्यापन के बाद एक्टिव हो जाएगी।'
    );
    return true;
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    info('लॉगआउट सफल', 'आप सुरक्षित रूप से लॉगआउट हो चुके हैं।');
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

    const nowIso = new Date().toISOString();
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === currentUser.id
          ? { ...p, ...updated, updated_at: nowIso }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updateProfile(currentUser.id, { ...updated, updated_at: nowIso }).catch((e) =>
        console.error('Supabase updateProfile error:', e)
      );
    }

    success('Profile Updated', 'आपकी प्रोफाइल जानकारी सुरक्षित हो गई है।');
    return true;
  };

  const approveAgent = async (agentId: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Permission Denied', 'केवल एडमिन ही एजेंट स्वीकृत कर सकते हैं।');
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
    if (!isAdmin) {
      error('Permission Denied', 'केवल एडमिन ही एजेंट अस्वीकृत कर सकते हैं।');
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
    if (!isAdmin) {
      error('Permission Denied', 'केवल एडमिन ही एजेंट KYC स्वीकृत कर सकते हैं।');
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
    if (!isAdmin) {
      error('Permission Denied', 'केवल एडमिन ही एजेंट KYC अस्वीकृत कर सकते हैं।');
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

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allProfiles: profiles,
        role,
        isApprovedAgent,
        isAdmin,
        login,
        registerAgent,
        logout,
        updateProfile,
        approveAgent,
        rejectAgent,
        suspendAgent,
        approveAgentKyc,
        rejectAgentKyc,
        submitAgentKyc,
        resetPassword,
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
