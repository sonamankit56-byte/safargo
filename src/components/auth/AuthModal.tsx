import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { PendingLoginOtp } from '../../types';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { maskMobileNumber } from '../../lib/securityUtils';
import {
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  KeyRound,
  RotateCw,
  Store,
  Bike,
  ShoppingBag,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot_password' | 'promoter_login';
  onOpenTrackPromoter?: () => void;
  onOpenApplyPromoter?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onOpenTrackPromoter,
  onOpenApplyPromoter,
}) => {
  const {
    login,
    initiateAgentLogin,
    verifyLoginOtp,
    pendingLoginOtps,
    registerAgent,
    registerCustomer,
    registerShopkeeper,
    resetPassword,
  } = useAuth();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<
    'login' | 'otp_verify' | 'register' | 'forgot_password' | 'registered_success' | 'promoter_login'
  >(initialTab);

  // Promoter Login state
  const [promoterIdentifier, setPromoterIdentifier] = useState('9826012345');
  const [promoterPassword, setPromoterPassword] = useState('Promoter@123');

  // Registration role switcher
  const [registerRole, setRegisterRole] = useState<'customer' | 'agent' | 'shopkeeper'>('customer');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Free OTP state
  const [currentPendingOtp, setCurrentPendingOtp] = useState<PendingLoginOtp | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(180);

  // Countdown timer for OTP
  useEffect(() => {
    if (activeTab !== 'otp_verify' || otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, otpCountdown]);

  // Multi-tab sync: If admin approves or OTP is verified in another tab, automatically close
  useEffect(() => {
    if (activeTab === 'otp_verify' && currentPendingOtp) {
      const live = pendingLoginOtps.find((o) => o.id === currentPendingOtp.id);
      if (live && (live.status === 'admin_approved' || live.status === 'verified')) {
        onClose();
      }
    }
  }, [pendingLoginOtps, activeTab, currentPendingOtp, onClose]);

  // Forgot password inputs
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Common Register inputs
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(MP_NETWORK_CITIES[0] || 'Indore');
  const [district, setDistrict] = useState('Indore');
  const [address, setAddress] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');

  // Shopkeeper specific inputs
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState<
    'kirana' | 'medical' | 'dairy' | 'bakery' | 'hardware' | 'general_store'
  >('kirana');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved registration state to show in success screen for agents
  const [registeredInfo, setRegisteredInfo] = useState<{
    name: string;
    mobile: string;
    shop: string;
    city: string;
  } | null>(null);

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      error('Input Required', 'कृपया अपना पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      // If password provided, attempt direct password login
      if (loginPassword.trim()) {
        const ok = await login(loginIdentifier.trim(), loginPassword.trim());
        if (ok) {
          onClose();
          return;
        }
      }

      // Fallback / OTP flow if no password or password check failed
      const res = await initiateAgentLogin(loginIdentifier.trim(), loginPassword.trim());
      if (res.isSuperAdmin) {
        onClose();
        return;
      }
      if (res.success && res.pendingOtp) {
        setCurrentPendingOtp(res.pendingOtp);
        setEnteredOtp('');
        setOtpCountdown(180);
        setActiveTab('otp_verify');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Dedicated Promoter Login Submit
  const handlePromoterLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoterIdentifier.trim()) {
      error('Input Required', 'कृपया अपना प्रमोटर यूजर आईडी, मोबाइल नंबर या प्रमोटर कोड दर्ज करें।');
      return;
    }
    if (!promoterPassword.trim()) {
      error('Password Required', 'कृपया अपना प्रमोटर पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(promoterIdentifier.trim(), promoterPassword.trim());
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Verify OTP Submit
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPendingOtp) return;
    if (!enteredOtp.trim() || enteredOtp.trim().length !== 6) {
      error('OTP Required', 'कृपया सही 6-अंकों का OTP सुरक्षा कोड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await verifyLoginOtp(currentPendingOtp.id, enteredOtp.trim());
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (!loginIdentifier.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await initiateAgentLogin(loginIdentifier.trim(), loginPassword.trim());
      if (res.success && res.pendingOtp) {
        setCurrentPendingOtp(res.pendingOtp);
        setEnteredOtp('');
        setOtpCountdown(180);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      error('Input Required', 'कृपया अपना पंजीकृत मोबाइल या ईमेल दर्ज करें।');
      return;
    }
    if (!forgotNewPassword.trim() || forgotNewPassword.length < 4) {
      error('Password Too Short', 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      error('Password Mismatch', 'नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await resetPassword(forgotIdentifier.trim(), forgotNewPassword.trim());
      if (ok) {
        setLoginIdentifier(forgotIdentifier.trim());
        setLoginPassword(forgotNewPassword.trim());
        setActiveTab('login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Customer Registration Submit (Instant Activation)
  const handleCustomerRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('Invalid Mobile', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!fullName.trim() || !address.trim()) {
      error('Required Fields', 'कृपया अपना पूरा नाम और डिलीवरी पता दर्ज करें।');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 4) {
      error('Password Required', 'कृपया कम से कम 4 अक्षरों का पासवर्ड बनाएं।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await registerCustomer({
        full_name: fullName.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        city: city.trim(),
        district: district.trim() || city.trim(),
        address: address.trim(),
        password: registerPassword.trim(),
      });
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Shopkeeper Registration Submit (Instant Shop Activation)
  const handleShopkeeperRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('Invalid Mobile', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!shopName.trim() || !fullName.trim() || !address.trim()) {
      error('Required Fields', 'कृपया दुकान का नाम, मालिक का नाम और पता भरें।');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 4) {
      error('Password Required', 'कृपया कम से कम 4 अक्षरों का पासवर्ड बनाएं।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await registerShopkeeper({
        shop_name: shopName.trim(),
        full_name: fullName.trim(),
        mobile: cleanMobile,
        email: email.trim() || undefined,
        city: city.trim(),
        district: district.trim() || city.trim(),
        address: address.trim(),
        category: shopCategory,
        password: registerPassword.trim(),
      });
      if (ok) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSC Agent Registration Submit (Verification Required)
  const handleAgentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('Invalid Mobile', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!fullName.trim() || !city.trim() || !district.trim() || !address.trim()) {
      error('Required Fields', 'कृपया सभी अनिवार्य विवरण भरें।');
      return;
    }
    if (!registerPassword.trim() || registerPassword.length < 4) {
      error('Password Required', 'कृपया कम से कम 4 अक्षरों का पासवर्ड बनाएं।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await registerAgent({
        full_name: fullName.trim(),
        mobile: cleanMobile,
        email: email.trim(),
        shop_name: shopName.trim() || 'जन सेवा केंद्र',
        city: city.trim(),
        district: district.trim(),
        address: address.trim(),
        password: registerPassword.trim(),
        referral_code: referralCodeInput.trim() || undefined,
      });

      if (ok) {
        setRegisteredInfo({
          name: fullName.trim(),
          mobile: cleanMobile,
          shop: shopName.trim() || 'जन सेवा केंद्र',
          city: city.trim(),
        });
        setActiveTab('registered_success');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-scaleUp max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="mb-3">
            <SafarGoLogo size="md" variant="light" showBadge={true} showTagline={false} />
          </div>

          <h2 className="text-xl font-black mt-2">
            {activeTab === 'registered_success'
              ? 'एजेंट पंजीकरण प्राप्त हुआ'
              : activeTab === 'otp_verify'
              ? 'सुरक्षा सत्यापन (Free OTP Verification)'
              : activeTab === 'register'
              ? 'सफ़ारगो नया खाता बनाएं (Sign Up)'
              : activeTab === 'forgot_password'
              ? 'पासवर्ड रीसेट करें (Reset Password)'
              : activeTab === 'promoter_login'
              ? '🤝 प्रमोटिंग पार्टनर लॉगिन (Exclusive Desk)'
              : 'सफ़ारगो पोर्टल लॉगिन (Sign In)'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'registered_success'
              ? 'आपकी आईडी सफ़ारगो टीम के सत्यापन के बाद सक्रिय होगी'
              : activeTab === 'otp_verify'
              ? '100% फ्री सुरक्षा कोड दर्ज कर अपना अधिकृत सत्र सत्यापित करें'
              : activeTab === 'register'
              ? 'ग्राहक, स्थानीय दुकानदार या सीएससी एजेंट के रूप में तुरंत पंजीकरण करें'
              : activeTab === 'forgot_password'
              ? 'पंजीकृत मोबाइल या ईमेल दर्ज कर नया पासवर्ड बनाएं'
              : activeTab === 'promoter_login'
              ? 'सीमित 5 प्रमोटर पद | ₹15,000 मासिक वेतन | अधिकृत क्रेडेंशियल्स दर्ज करें'
              : 'अपने अधिकृत क्रेडेंशियल्स दर्ज कर सुरक्षित लॉगिन करें'}
          </p>

          {/* Top Sub-Navigation Tabs */}
          {activeTab !== 'registered_success' && activeTab !== 'otp_verify' && (
            <div className="flex bg-slate-800/80 p-1 rounded-xl mt-4 border border-slate-700 gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'login'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                लॉगिन
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('promoter_login')}
                className={`flex-1 py-1.5 px-2 text-xs font-black rounded-lg transition whitespace-nowrap flex items-center justify-center gap-1 ${
                  activeTab === 'promoter_login'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-amber-300 hover:text-white bg-amber-400/10'
                }`}
              >
                <span>🤝 प्रमोटर लॉगिन</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'register'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                नया खाता
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('forgot_password')}
                className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  activeTab === 'forgot_password'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                पासवर्ड भूल गए?
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* ========================================================== */}
          {/* 1. AGENT REGISTRATION SUBMITTED SUCCESS SCREEN              */}
          {/* ========================================================== */}
          {activeTab === 'registered_success' && registeredInfo ? (
            <div className="space-y-5 text-center py-2 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-black uppercase tracking-wider">
                  सत्यापन प्रक्रियाधीन (Verification Pending)
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  एजेंट पंजीकरण सफलतापूर्वक जमा हो गया! 🎉
                </h3>
              </div>

              {/* Mandatory Prominent Notice Box */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 text-emerald-950 shadow-sm text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm sm:text-base">
                  <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>आपकी आईडी SafarGo टीम वेरिफिकेशन के बाद एक्टिव हो जाएगी</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  सफ़ारगो की एडमिन टीम आपके जन सेवा केंद्र / दुकान के विवरण की पुष्टि करेगी। आईडी सक्रिय होते ही आपको SMS/WhatsApp संदेश प्राप्त होगा और आप लॉगिन करके बस टिकट बुक करना, 15-मिनट डिलीवरी रनर बनना एवं ₹19.34 प्रति टिकट कमीशन कमाना शुरू कर सकेंगे।
                </p>
              </div>

              {/* Summary of Registered Details */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  दर्ज किया गया विवरण:
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px]">एजेंट नाम:</span>
                    <strong className="text-slate-900">{registeredInfo.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">मोबाइल नंबर:</span>
                    <strong className="text-slate-900 font-mono">+91 {registeredInfo.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">दुकान / केंद्र:</span>
                    <strong className="text-slate-900">{registeredInfo.shop}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">शहर:</span>
                    <strong className="text-slate-900">{registeredInfo.city}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`नमस्ते SafarGo टीम, मैंने नया एजेंट पंजीकरण फॉर्म जमा किया है।\nनाम: ${registeredInfo.name}\nमोबाइल: ${registeredInfo.mobile}\nदुकान: ${registeredInfo.shop}\nकृपया मेरी आईडी सत्यापित और सक्रिय (Activate) करें।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>SafarGo टीम से WhatsApp पर संपर्क करें</span>
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier(registeredInfo.mobile);
                      setActiveTab('login');
                    }}
                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
                  >
                    लॉगिन पेज पर जाएं
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    होमपेज पर जाएं (बंद करें)
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === 'register' ? (
            /* ========================================================== */
            /* 2. MULTI-ROLE REGISTRATION FORMS                           */
            /* ========================================================== */
            <div className="space-y-4 text-xs">
              
              {/* Account Type Selector (Customer vs Agent vs Shopkeeper) */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  खाता प्रकार चुनें (Select Account Type):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegisterRole('customer')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center text-center gap-1 ${
                      registerRole === 'customer'
                        ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className={`w-5 h-5 ${registerRole === 'customer' ? 'text-orange-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">👤 ग्राहक (Customer)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('shopkeeper')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center text-center gap-1 ${
                      registerRole === 'shopkeeper'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Store className={`w-5 h-5 ${registerRole === 'shopkeeper' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">🏪 दुकानदार (Merchant)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('agent')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col items-center justify-center text-center gap-1 ${
                      registerRole === 'agent'
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Bike className={`w-5 h-5 ${registerRole === 'agent' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span className="text-[11px] leading-tight">🤝 सीएससी एजेंट (Runner)</span>
                  </button>
                </div>
              </div>

              {/* SUB-FORM A: CUSTOMER REGISTRATION (Instant Active) */}
              {registerRole === 'customer' && (
                <form onSubmit={handleCustomerRegisterSubmit} className="space-y-3 pt-1">
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>तुरंत सक्रिय (Instant Access):</strong> ग्राहक खाता बिना किसी दस्तावेज़ सत्यापन के तुरंत चालू हो जाता है। आप सीधे बस टिकट व 15-मिनट डिलीवरी ऑर्डर कर सकते हैं।
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      पूरा नाम (Full Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. अजय शर्मा"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        मोबाइल नंबर (10-digit) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10 अंकों का मोबाइल"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        शहर (MP City) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setDistrict(e.target.value);
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      डिलीवरी पता / घर का पता <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="मकान नंबर, वार्ड, लैंडमार्क, गली..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      लॉगिन पासवर्ड (Create Password) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="कम से कम 4 अक्षर (उदा. Cust@123)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'खाता तैयार हो रहा है...' : 'ग्राहक खाता बनाएं (Create Account)'}
                  </button>
                </form>
              )}

              {/* SUB-FORM B: SHOPKEEPER REGISTRATION */}
              {registerRole === 'shopkeeper' && (
                <form onSubmit={handleShopkeeperRegisterSubmit} className="space-y-3 pt-1">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-900 flex items-start gap-2">
                    <Store className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>दुकानदार पोर्टल:</strong> अपनी दुकान को SafarGo पर लिस्ट करें। प्रमोटर पार्टनर से संपर्क, कैटलॉग प्रबंधन और रनर डिलीवरी की सुविधा पाएं।
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        दुकान का नाम <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="उदा. गुप्ता किराना स्टोर्स"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        दुकान की श्रेणी <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={shopCategory}
                        onChange={(e) => setShopCategory(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        <option value="kirana">किराना एवं जनरल स्टोर</option>
                        <option value="medical">मेडिकल एवं दवाइयां</option>
                        <option value="dairy">डेयरी एवं दूध उत्पाद</option>
                        <option value="bakery">बेकरी एवं स्नैक्स</option>
                        <option value="hardware">हार्डवेयर एवं इलेक्ट्रिकल्स</option>
                        <option value="general_store">अन्य जनरल मर्चेंट</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        मालिक का नाम <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="उदा. मोहन लाल गुप्ता"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        मोबाइल नंबर <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10 अंकों का मोबाइल"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        शहर (MP City) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setDistrict(e.target.value);
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        दुकान का पूरा पता <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="मेन मार्केट, बस स्टैंड..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      लॉगिन पासवर्ड बनाएं <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="कम से कम 4 अक्षर (उदा. Shop@123)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'पंजीकरण हो रहा है...' : 'दुकानदार खाता पंजीकृत करें'}
                  </button>
                </form>
              )}

              {/* SUB-FORM C: CSC AGENT REGISTRATION */}
              {registerRole === 'agent' && (
                <form onSubmit={handleAgentRegisterSubmit} className="space-y-3 pt-1">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">
                      <strong>सत्यापन नियम:</strong> एजेंट पंजीकरण के बाद खाता <em>Pending Approval</em> रहेगा। सफ़ारगो एडमिन व प्रमोटर सत्यापन के बाद खाता सक्रिय होगा।
                    </p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      पूरा नाम (Full Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="उदा. पवन कुमार वर्मा"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        मोबाइल नंबर <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="10-अंकों का मोबाइल"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        सीएससी / दुकान का नाम
                      </label>
                      <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="उदा. वर्मा जन सेवा केंद्र"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        शहर (City) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          setDistrict(e.target.value);
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        जिला (District) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="उदा. Vidisha / Bhopal / Guna"
                        className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      दुकान का पूरा पता <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ब्लॉक ऑफिस के पास, मुख्य मार्ग..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      लॉगिन पासवर्ड बनाएं <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="कम से कम 4 अक्षर (उदा. Agent@123)"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      रेफरल कोड (Referral Code - Optional)
                    </label>
                    <input
                      type="text"
                      value={referralCodeInput}
                      onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                      placeholder="उदा. SFG-REF-PAWAN50"
                      className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50"
                  >
                    {isSubmitting ? 'पंजीकरण जमा हो रहा है...' : 'एजेंट पंजीकरण सबमिट करें'}
                  </button>
                </form>
              )}

            </div>
          ) : activeTab === 'forgot_password' ? (
            /* ========================================================== */
            /* 3. FORGOT PASSWORD FORM (UNIVERSAL)                        */
            /* ========================================================== */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-950 flex items-start gap-2.5 text-xs">
                <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>पासवर्ड रिकवरी:</strong> अपना पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें और नया पासवर्ड सेट करें। यह सभी ग्राहकों, दुकानदारों व एजेंटों के लिए उपलब्ध है।
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  पंजीकृत मोबाइल नंबर या ईमेल *
                </label>
                <input
                  type="text"
                  required
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  placeholder="उदा. 9827011223 या pawan@gmail.com"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  नया पासवर्ड (New Password) *
                </label>
                <input
                  type="password"
                  required
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  placeholder="कम से कम 4 अक्षर"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  नए पासवर्ड की पुष्टि करें *
                </label>
                <input
                  type="password"
                  required
                  value={forgotConfirmPassword}
                  onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  placeholder="पासवर्ड दोबारा दर्ज करें"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center justify-between text-[11px] text-slate-600">
                <span>हेल्पडेस्क से WhatsApp सहायता:</span>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent('नमस्ते सफ़ारगो हेल्पडेस्क, मैं अपना पासवर्ड भूल गया हूँ और रिसेट करना चाहता हूँ।')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-bold hover:underline"
                >
                  WhatsApp सपोर्ट
                </a>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="w-1/3 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-xs"
                >
                  लॉगिन पर लौटें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs"
                >
                  {isSubmitting ? 'Updating...' : 'नया पासवर्ड सुरक्षित करें'}
                </button>
              </div>
            </form>
          ) : activeTab === 'otp_verify' && currentPendingOtp ? (
            /* ========================================================== */
            /* 4. FREE 2-STEP OTP & DEVICE SECURITY SCREEN                */
            /* ========================================================== */
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-200">
                    2-चरण सुरक्षा (Free OTP Verification)
                  </span>
                  <h3 className="font-black text-slate-900 text-sm">
                    सुरक्षित पहचान एवं डिवाइस सत्यापन
                  </h3>
                  <p className="text-xs text-slate-600">
                    उपयोगकर्ता <strong>{currentPendingOtp.agent_name}</strong> (+91 {maskMobileNumber(currentPendingOtp.agent_mobile)}) के लिए 6-अंकों का सुरक्षा कोड तैयार है।
                  </p>
                </div>
              </div>

              {/* Free Security Test Code Banner */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                    <span>🛡️ 100% फ्री सुरक्षा कोड (Zero SMS Charge):</span>
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs tracking-widest">
                    {currentPendingOtp.otp_code}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  सफ़ारगो में कोई महंगा SMS गेटवे चार्ज नहीं लगता। नीचे दिए गए कोड से तुरंत लॉगिन करें या WhatsApp पुष्टि लें।
                </p>
                <button
                  type="button"
                  onClick={() => setEnteredOtp(currentPendingOtp.otp_code)}
                  className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition"
                >
                  ⚡ यह सुरक्षा कोड ऑटो-भरें ({currentPendingOtp.otp_code})
                </button>
              </div>

              {/* OTP Input Form */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 text-xs">
                      6-अंकों का OTP कोड दर्ज करें *
                    </label>
                    <span className="text-[11px] font-mono font-bold text-slate-500">
                      समय शेष: {Math.floor(otpCountdown / 60)}:{(otpCountdown % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-digit code"
                    className="w-full p-3.5 rounded-2xl border-2 border-slate-300 text-center text-xl font-mono font-black tracking-[0.4em] focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || enteredOtp.length !== 6}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs"
                >
                  {isSubmitting ? 'सत्यापन हो रहा है...' : 'सुरक्षित लॉगिन सत्यापित करें (Verify & Login)'}
                </button>
              </form>

              {/* WhatsApp 1-Click Verification Link */}
              <a
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`नमस्ते SafarGo Admin, मेरा लॉगिन OTP कोड: ${currentPendingOtp.otp_code} है।\nयूजर: ${currentPendingOtp.agent_name}\nमोबाइल: ${currentPendingOtp.agent_mobile}\nIP: ${currentPendingOtp.ip_address}\nडिवाइस: ${currentPendingOtp.device_info}\nकृपया लॉगिन अधिकृत करें।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp पर एडमिन से पुष्टि करें (फ्री)</span>
              </a>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← वापस लॉगिन पर जाएं
                </button>
                <button
                  type="button"
                  disabled={otpCountdown > 0 || isSubmitting}
                  onClick={handleResendOtp}
                  className="text-orange-600 hover:text-orange-700 font-bold disabled:text-slate-400 disabled:no-underline underline"
                >
                  नया OTP भेजें {otpCountdown > 0 && `(${otpCountdown}s)`}
                </button>
              </div>
            </div>
          ) : activeTab === 'promoter_login' ? (
            /* ========================================================== */
            /* 4. EXCLUSIVE PROMOTING PARTNER LOGIN FORM                  */
            /* ========================================================== */
            <form onSubmit={handlePromoterLoginSubmit} className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-amber-500/15 border-2 border-amber-400/80 rounded-2xl p-4 text-slate-900 space-y-1.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    सीमित 5 पद (Slot #1 - #5)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                    फिक्स्ड वेतन: ₹15,000 / माह
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  सफ़ारगो प्रमोटिंग पार्टनर अधिकृत लॉगिन
                </h4>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  यह विशेष पोर्टल केवल शॉर्टलिस्ट व सुपर एडमिन द्वारा ऑनबोर्ड किए गए अधिकृत प्रमोटर पार्टनर्स के लिए है। यहां से आप एजेंट अप्रूवल, KYC सत्यापन एवं लोकल दुकान लिस्टिंग डैशबोर्ड एक्सेस कर सकते हैं।
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">
                  प्रमोटर यूजर आईडी, मोबाइल नंबर या कोड *
                </label>
                <input
                  type="text"
                  required
                  value={promoterIdentifier}
                  onChange={(e) => setPromoterIdentifier(e.target.value)}
                  placeholder="उदा. 9826012345 या PRM-MP-01"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 text-xs">
                    प्रमोटर पासवर्ड (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(promoterIdentifier);
                      setActiveTab('forgot_password');
                    }}
                    className="text-amber-700 hover:text-amber-800 font-bold text-xs underline"
                  >
                    पासवर्ड भूल गए?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={promoterPassword}
                  onChange={(e) => setPromoterPassword(e.target.value)}
                  placeholder="एडमिन द्वारा सेट पासवर्ड दर्ज करें"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none font-mono"
                />
              </div>

              {/* Official Secure Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-[11px] font-medium">
                  अधिकृत प्रमोटर अपने पंजीकृत मोबाइल नंबर, प्रमोटर कोड (उदा. PRM-MP-01) या यूजर आईडी और पासवर्ड से लॉगिन करें।
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 hover:from-slate-900 hover:to-slate-900 text-amber-300 hover:text-amber-200 font-black rounded-xl shadow-xl transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer border border-amber-400/40"
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>{isSubmitting ? 'लॉगिन हो रहा है...' : '🚀 प्रमोटर पोर्टल लॉगिन करें (Open Dashboard)'}</span>
              </button>

              {/* Status Tracking Link */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                {onOpenTrackPromoter && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTrackPromoter();
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>🔎 प्रमोटर आवेदन स्टेटस ट्रैक करें</span>
                  </button>
                )}
                {onOpenApplyPromoter && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenApplyPromoter();
                    }}
                    className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>📝 नया प्रमोटर आवेदन करें (₹149)</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* ========================================================== */
            /* 5. UNIVERSAL SIGN IN FORM                                  */
            /* ========================================================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-xs text-orange-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>🔒 ग्राहक, दुकानदार, एजेंट एवं एडमिन के लिए सुरक्षित लॉगिन</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  पंजीकृत मोबाइल नंबर या ईमेल (Mobile or Email) *
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="मोबाइल नंबर या ईमेल दर्ज करें"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 text-xs">
                    पासवर्ड (Password)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(loginIdentifier);
                      setActiveTab('forgot_password');
                    }}
                    className="text-orange-600 hover:text-orange-700 font-bold text-xs underline"
                  >
                    पासवर्ड भूल गए?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="पासवर्ड दर्ज करें"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  पासवर्ड दर्ज करके तुरंत लॉगिन करें या नीचे दिए बटन से Free OTP प्राप्त करें।
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'लॉगिन हो रहा है...' : 'सुरक्षित लॉगिन करें (Sign In)'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || !loginIdentifier.trim()}
                  onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      const res = await initiateAgentLogin(loginIdentifier.trim(), loginPassword.trim());
                      if (res.isSuperAdmin) {
                        onClose();
                        return;
                      }
                      if (res.success && res.pendingOtp) {
                        setCurrentPendingOtp(res.pendingOtp);
                        setEnteredOtp('');
                        setOtpCountdown(180);
                        setActiveTab('otp_verify');
                      }
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="w-full py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold rounded-xl transition text-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free OTP कोड द्वारा लॉगिन करें</span>
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-slate-500">
                नया खाता खोलना चाहते हैं?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-orange-600 font-bold hover:underline"
                >
                  यहाँ क्लिक करें (Register)
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
