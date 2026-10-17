export interface OnboardingApplication {
  id: string; // e.g. SFG-KYC-2026-8912
  fullName: string;
  mobile: string;
  email: string;
  shopName: string;
  businessType: string;
  city: string;
  address: string;
  pincode: string;
  panNumber: string;
  aadhaarNumber: string;
  gstin?: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  settlementUpiId: string;
  referralCode?: string;
  aadhaarDocUrl?: string;
  panDocUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: string;
  approvedAt?: string;
  setPasswordToken?: string;
  passwordCreated?: boolean;
}

const STORAGE_KEY = 'safargo_onboarding_applications';

const SEED_APPLICATIONS: OnboardingApplication[] = [
  {
    id: 'SFG-KYC-2026-9041',
    fullName: 'राजेश कुमार शर्मा (Rajesh Sharma)',
    mobile: '9826011111',
    email: 'rajesh.sharma.csc@gmail.com',
    shopName: 'शर्मा ऑनलाइन एमपी ऑनलाइन कियोस्क',
    businessType: 'Proprietorship',
    city: 'Bhopal',
    address: 'दुकान नं. 14, न्यू मार्केट, टीटी नगर, भोपाल',
    pincode: '462001',
    panNumber: 'ABCPS1234F',
    aadhaarNumber: '8921-4321-9988',
    gstin: '23ABCPS1234F1Z5',
    accountHolder: 'Rajesh Kumar Sharma',
    accountNumber: '30987654321',
    ifsc: 'SBIN0001056',
    bankName: 'State Bank of India',
    settlementUpiId: 'rajesh.sharma@sbi',
    referralCode: 'SAFAR100',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600 * 1000 * 3).toISOString(), // 3 hours ago
  },
  {
    id: 'SFG-KYC-2026-8874',
    fullName: 'अमित पटेल (Amit Patel)',
    mobile: '9826022222',
    email: 'amit.patel.tours@gmail.com',
    shopName: 'पटेल टूर्स एंड ट्रेवल्स सेंटर',
    businessType: 'Individual',
    city: 'Indore',
    address: 'प्लॉट 45, विजयनगर स्क्वायर, इंदौर',
    pincode: '452010',
    panNumber: 'BKRPA5678K',
    aadhaarNumber: '7612-9901-4455',
    accountHolder: 'Amit Patel',
    accountNumber: '50100234567890',
    ifsc: 'HDFC0000240',
    bankName: 'HDFC Bank',
    settlementUpiId: 'amitpatel@hdfcbank',
    referralCode: 'GOAGENT20',
    status: 'pending',
    submittedAt: new Date(Date.now() - 3600 * 1000 * 7).toISOString(), // 7 hours ago
  },
];

export function getOnboardingApplications(): OnboardingApplication[] {
  if (typeof window === 'undefined') return SEED_APPLICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
      return SEED_APPLICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_APPLICATIONS));
    return SEED_APPLICATIONS;
  } catch {
    return SEED_APPLICATIONS;
  }
}

export function saveOnboardingApplication(
  data: Omit<OnboardingApplication, 'id' | 'status' | 'submittedAt'>
): OnboardingApplication {
  const all = getOnboardingApplications();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newApp: OnboardingApplication = {
    ...data,
    id: `SFG-KYC-2026-${randomSuffix}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };

  const updated = [newApp, ...all];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to persist onboarding application:', e);
    }
  }
  return newApp;
}

export function approveOnboardingApplication(id: string): {
  application: OnboardingApplication;
  token: string;
} {
  const all = getOnboardingApplications();
  const token = 'tok_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  
  let target: OnboardingApplication | null = null;
  const updated = all.map((app) => {
    if (app.id === id) {
      target = {
        ...app,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        setPasswordToken: token,
      };
      return target;
    }
    return app;
  });

  if (target && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  if (!target) {
    throw new Error('Application with ID ' + id + ' not found');
  }

  return { application: target, token };
}

export function rejectOnboardingApplication(
  id: string,
  reason: string = 'दस्तावेज सत्यापन अपूर्ण अथवा त्रुटिपूर्ण'
): OnboardingApplication {
  const all = getOnboardingApplications();
  let target: OnboardingApplication | null = null;
  const updated = all.map((app) => {
    if (app.id === id) {
      target = {
        ...app,
        status: 'rejected',
        rejectionReason: reason,
      };
      return target;
    }
    return app;
  });

  if (target && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  if (!target) {
    throw new Error('Application not found');
  }
  return target;
}

export function getApplicationByToken(token: string): OnboardingApplication | null {
  if (!token) return null;
  const all = getOnboardingApplications();
  return all.find((app) => app.setPasswordToken === token) || null;
}

export function completeAgentPasswordSetup(
  token: string,
  passwordHashOrPlain: string
): { success: boolean; agent?: OnboardingApplication; error?: string } {
  const all = getOnboardingApplications();
  const targetIndex = all.findIndex((app) => app.setPasswordToken === token);
  if (targetIndex === -1) {
    return { success: false, error: 'अमान्य अथवा समाप्त हो चुका पासवर्ड टोकन।' };
  }

  const app = all[targetIndex];
  all[targetIndex] = {
    ...app,
    passwordCreated: true,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }

  return { success: true, agent: all[targetIndex] };
}
