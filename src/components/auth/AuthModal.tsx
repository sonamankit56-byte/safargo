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
  RotateCw
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login'
}) => {
  const { login, initiateAgentLogin, verifyLoginOtp, pendingLoginOtps, registerAgent, resetPassword } = useAuth();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'otp_verify' | 'register' | 'forgot_password' | 'registered_success'>(initialTab);

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

  // Multi-tab sync: If admin approves or OTP is verified in another tab, automatically close and complete login
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

  // Register inputs
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Saved registration state to show in success screen
  const [registeredInfo, setRegisteredInfo] = useState<{
    name: string;
    mobile: string;
    shop: string;
    city: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      error('Input Required', 'कृपया अपना पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }

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
  };

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
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
              ? 'पंजीकरण प्राप्त हुआ'
              : activeTab === 'otp_verify'
              ? 'सुरक्षा सत्यापन (Free OTP Verification)'
              : activeTab === 'register'
              ? 'अधिकृत एजेंट पंजीकरण'
              : activeTab === 'forgot_password'
              ? 'पासवर्ड रीसेट करें'
              : 'सफ़ारगो पोर्टल लॉगिन'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'registered_success'
              ? 'आपकी आईडी सफ़ारगो टीम के सत्यापन के बाद सक्रिय होगी'
              : activeTab === 'otp_verify'
              ? '100% फ्री सुरक्षा कोड दर्ज कर अपना अधिकृत एजेंट सत्र सत्यापित करें'
              : activeTab === 'register'
              ? 'गाँव के यात्रियों को बस टिकट दें और हर टिकट पर ₹19.34 कमीशन पाएं'
              : activeTab === 'forgot_password'
              ? 'पंजीकृत मोबाइल या ईमेल दर्ज कर नया पासवर्ड बनाएं'
              : 'अपने अधिकृत क्रेडेंशियल्स दर्ज कर सुरक्षित लॉगिन करें'}
          </p>

          {/* Sub Navigation Tabs (Hidden during success & otp verify screens) */}
          {activeTab !== 'registered_success' && activeTab !== 'otp_verify' && (
            <div className="flex bg-slate-800/80 p-1 rounded-xl mt-4 border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === 'login'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                लॉगिन (Sign In)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                  activeTab === 'register'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                नया एजेंट पंजीकरण
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('forgot_password')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
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
          {/* 1. REGISTRATION SUBMITTED CONFIRMATION SCREEN               */}
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
                  पंजीकरण सफलतापूर्वक जमा हो गया! 🎉
                </h3>
              </div>

              {/* Mandatory Prominent Notice Box */}
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 text-emerald-950 shadow-sm text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm sm:text-base">
                  <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>आपकी आईडी SafarGo टीम वेरिफिकेशन के बाद एक्टिव हो जाएगी</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                  सफ़ारगो की एडमिन टीम आपके जन सेवा केंद्र / दुकान के विवरण की पुष्टि करेगी। आईडी सक्रिय (Active) होते ही आपको SMS/WhatsApp संदेश प्राप्त होगा और आप लॉगिन करके बस टिकट बुक करना एवं ₹19.34 प्रति टिकट कमीशन कमाना शुरू कर सकेंगे।
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
            /* 2. REGISTRATION FORM                                       */
            /* ========================================================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-blue-900 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>सत्यापन नियम:</strong> पंजीकरण के बाद खाता <em>Pending Approval</em> स्थिति में रहेगा। सफ़ारगो एडमिन द्वारा दुकान व विवरण सत्यापन के बाद खाता सक्रिय होगा।
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
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
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ईमेल पता (वैकल्पिक)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@gmail.com"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  दुकान / जन सेवा केंद्र का नाम
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="उदा. किसान जन सेवा केंद्र"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* MP Cities Autocomplete */}
              <datalist id="mp-auth-cities">
                {MP_NETWORK_CITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    शहर (City) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="mp-auth-cities"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="उदा. Bhopal / Indore / Sironj / Guna"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                  />
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
                    placeholder="उदा. Vidisha / Bhopal / Guna / Ashok Nagar"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  दुकान का पूरा पता (Address) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ब्लॉक ऑफिस के पास, मुख्य मार्ग..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  लॉगिन पासवर्ड बनाएं (Create Password) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="कम से कम 4 अक्षर (उदा. Agent@123)"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono uppercase font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  यदि किसी मित्र एजेंट ने रेफ़र किया है तो उनका कोड डालें (5 बुकिंग्स पूर्ण होने पर उन्हें ₹50 बोनस प्राप्त होगा)।
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? 'पंजीकरण जमा हो रहा है...' : 'एजेंट पंजीकरण सबमिट करें'}
              </button>
            </form>
          ) : activeTab === 'forgot_password' ? (
            /* ========================================================== */
            /* 3. FORGOT PASSWORD FORM                                    */
            /* ========================================================== */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-orange-950 flex items-start gap-2.5 text-xs">
                <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>पासवर्ड रिकवरी:</strong> अपना पंजीकृत मोबाइल नंबर या ईमेल दर्ज करें और नया पासवर्ड सेट करें।
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
                  placeholder="उदा. 9450123456 या agent@gmail.com"
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
            /* 3. FREE 2-STEP OTP & DEVICE SECURITY VERIFICATION SCREEN   */
            /* ========================================================== */
            <div className="space-y-4 animate-fadeIn">
              {/* Top Security Banner */}
              <div className="bg-orange-500/10 border-2 border-orange-500/40 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-200">
                    2-चरण सुरक्षा (Free OTP Verification)
                  </span>
                  <h3 className="font-black text-slate-900 text-sm">
                    एजेंट पहचान एवं डिवाइस सत्यापन
                  </h3>
                  <p className="text-xs text-slate-600">
                    एजेंट <strong>{currentPendingOtp.agent_name}</strong> (+91 {maskMobileNumber(currentPendingOtp.agent_mobile)}) के लिए 6-अंकों का सुरक्षा कोड तैयार है।
                  </p>
                </div>
              </div>

              {/* Free Security Test Code Banner (Instant Fill - 100% Free, Zero SMS charge!) */}
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
                  सफ़ारगो में कोई महंगा SMS गेटवे चार्ज नहीं लगता। आप नीचे दिए गए कोड से तुरंत लॉगिन कर सकते हैं या WhatsApp से एडमिन पुष्टि ले सकते हैं।
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
                href={`https://wa.me/919876543210?text=${encodeURIComponent(`नमस्ते SafarGo Admin, मेरा एजेंट लॉगिन OTP कोड: ${currentPendingOtp.otp_code} है।\nएजेंट: ${currentPendingOtp.agent_name}\nमोबाइल: ${currentPendingOtp.agent_mobile}\nIP: ${currentPendingOtp.ip_address}\nडिवाइस: ${currentPendingOtp.device_info}\nकृपया लॉगिन अधिकृत करें।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Phone className="w-4 h-4" />
                <span>WhatsApp पर एडमिन से पुष्टि करें (फ्री)</span>
              </a>

              {/* Security Audit Trail info box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>सुरक्षा एवं डिवाइस ऑडिट रिकॉर्ड:</span>
                </div>
                <div className="text-slate-600">
                  • IP पता: <span className="font-mono font-bold text-slate-800">{currentPendingOtp.ip_address}</span>
                </div>
                <div className="text-slate-600">
                  • डिवाइस: <span className="font-medium text-slate-800">{currentPendingOtp.device_info}</span>
                </div>
              </div>

              {/* Resend and Back buttons */}
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
          ) : (
            /* ========================================================== */
            /* 4. CLEAN REAL LOGIN FORM (NO PUBLIC SUPER ADMIN LEAKS)     */
            /* ========================================================== */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-2.5 text-xs text-orange-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>🔒 2-Step OTP सुरक्षित लॉगिन (100% फ्री - कोई SMS चार्ज नहीं)</span>
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
                    पासवर्ड (Password) *
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
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="पासवर्ड दर्ज करें"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs"
              >
                {isSubmitting ? 'सुरक्षा सत्यापन प्रारंभ हो रहा है...' : 'लॉगिन करें (Sign In & Verify)'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
