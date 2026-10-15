import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  sendRegistrationOtpEmail,
  sendPasswordResetOtpEmail,
  sendLoginOtpEmail,
} from '../../lib/emailService';
import {
  Crown,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  RotateCw,
  ExternalLink,
  Store,
  Users,
  KeyRound,
  HelpCircle,
  Zap,
  Gift,
} from 'lucide-react';

export const LoginSubdomainGateway: React.FC = () => {
  const {
    currentUser,
    role,
    login,
    loginWithGoogle,
    registerAgent,
    registerShopkeeper,
    registerCustomer,
    resetPassword,
  } = useAuth();
  const { error, success, info } = useToast();

  // Role selector tab: default 'agent'
  const [selectedRole, setSelectedRole] = useState<'agent' | 'shopkeeper' | 'promoter' | 'customer' | 'admin'>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('role')?.toLowerCase().trim();
      if (r && ['agent', 'shopkeeper', 'promoter', 'customer', 'admin'].includes(r)) {
        return r as any;
      }
    } catch {}
    return 'agent';
  });

  // Action Mode inside role: 'login' | 'register' | 'forgot_password' | 'verify_email'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [redirectTargetUrl, setRedirectTargetUrl] = useState<string>('');

  // Form Fields
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [shopName, setShopName] = useState('');
  const [city, setCity] = useState(MP_NETWORK_CITIES[0] || 'Indore');
  const [district, setDistrict] = useState('Indore');
  const [address, setAddress] = useState('');

  // Referral Code (autofill from ?ref= or storage)
  const [referralCode, setReferralCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('ref') || params.get('referral') || params.get('refCode');
      if (fromUrl) {
        const clean = fromUrl.trim().toUpperCase();
        localStorage.setItem('safargo_active_ref_code', clean);
        return clean;
      }
      return localStorage.getItem('safargo_active_ref_code') || '';
    } catch {
      return '';
    }
  });

  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [generatedResetCode, setGeneratedResetCode] = useState('');
  const [enteredResetCode, setEnteredResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Pending Registration Email Verification state
  const [pendingRegData, setPendingRegData] = useState<{
    code: string;
    details: any;
    role: string;
  } | null>(null);
  const [enteredVerifyCode, setEnteredVerifyCode] = useState('');

  // Redirect execution helper
  const performRoleRedirect = (targetRole: string) => {
    setIsRedirecting(true);
    let url = buildSubdomainUrl('agent');
    if (targetRole === 'admin') url = buildSubdomainUrl('admin');
    else if (targetRole === 'promoter') url = buildSubdomainUrl('promoter');
    else if (targetRole === 'shopkeeper') url = buildSubdomainUrl('shop');
    else if (targetRole === 'customer') url = buildSubdomainUrl('main');

    setRedirectTargetUrl(url);
    setTimeout(() => {
      window.location.href = url;
    }, 1200);
  };

  // If already authenticated and matches selected role, auto-redirect
  useEffect(() => {
    if (currentUser && !isRedirecting) {
      if (role === 'agent') performRoleRedirect('agent');
      else if (role === 'admin') performRoleRedirect('admin');
      else if (role === 'promoter') performRoleRedirect('promoter');
      else if (role === 'shopkeeper') performRoleRedirect('shopkeeper');
      else if (role === 'customer') performRoleRedirect('customer');
    }
  }, [currentUser, role]);

  // Handle Google 1-Click Sign-In
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        success('लॉगिन सफल!', 'Google द्वारा ऑथेंटिकेशन संपन्न हुआ।');
        performRoleRedirect('agent');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrMobile.trim()) {
      error('आवश्यक विवरण', 'कृपया ईमेल या मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!password.trim()) {
      error('आवश्यक पासवर्ड', 'कृपया अपना पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(emailOrMobile.trim(), password.trim());
      if (ok) {
        success('लॉगिन सफल!', 'सुरक्षित सत्र प्रारंभ हुआ। डैशबोर्ड पर भेजा जा रहा है...');
        performRoleRedirect(selectedRole);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send Password Reset OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      error('अमान्य Gmail', 'कृपया अपना पंजीकृत Gmail पता दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedResetCode(code);

      const dispatched = await sendPasswordResetOtpEmail({
        toEmail: resetEmail.trim(),
        resetCode: code,
        userName: 'SafarGo Agent',
      });

      if (dispatched) {
        setResetOtpSent(true);
        success('OTP भेजा गया! ✉️', `6-अंकीय पासवर्ड रीसेट कोड ${resetEmail} पर भेज दिया गया है।`);
      } else {
        error('ईमेल प्रेषण विफल', 'ईमेल भेजने में समस्या आई। कृपया ईमेल जांचें व पुनः प्रयास करें।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Password Reset
  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredResetCode.trim() !== generatedResetCode.trim()) {
      error('गलत OTP कोड', 'कृपया Gmail पर भेजा गया सही 6-अंकीय कोड दर्ज करें।');
      return;
    }
    if (!newPassword.trim() || newPassword.length < 4) {
      error('कमजोर पासवर्ड', 'नया पासवर्ड न्यूनतम 4 अक्षरों का होना चाहिए।');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      error('पासवर्ड मेल नहीं खाया', 'नया पासवर्ड और कन्फर्म पासवर्ड एक समान होने चाहिए।');
      return;
    }

    setIsSubmitting(true);
    try {
      const resetOk = await resetPassword(resetEmail.trim(), newPassword.trim());
      if (resetOk) {
        // Automatically log in with new password
        await login(resetEmail.trim(), newPassword.trim());
        success('पासवर्ड अपडेट हुआ! 🎉', 'नया पासवर्ड सफलतापूर्वक सेट हो गया। डैशबोर्ड खुल रहा है...');
        performRoleRedirect(selectedRole);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration Submit with Resend Email OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('अमान्य मोबाइल', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      error('वैध Gmail अनिवार्य', 'सत्यापन हेतु वैध Gmail पता अनिवार्य है।');
      return;
    }
    if (!password.trim() || password.length < 4) {
      error('पासवर्ड आवश्यक', 'कृपया न्यूनतम 4 अक्षरों का सुरक्षित पासवर्ड बनाएं।');
      return;
    }
    if (!fullName.trim() || !city.trim()) {
      error('विवरण अधूरा', 'कृपया पूरा नाम और शहर भरें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      await sendRegistrationOtpEmail({
        toEmail: email.trim(),
        fullName: fullName.trim(),
        confirmCode: code,
        role: selectedRole,
      });

      setPendingRegData({
        code,
        role: selectedRole,
        details: {
          full_name: fullName.trim(),
          mobile: cleanMobile,
          email: email.trim(),
          city: city.trim(),
          district: district.trim(),
          address: address.trim() || city.trim(),
          shop_name: shopName.trim() || 'GO Seva Kendra',
          password: password.trim(),
          referral_code: referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
        },
      });

      setEnteredVerifyCode('');
      setMode('verify_email');
      info(
        'Gmail पुष्टिकरण भेजा गया! ✉️',
        `6-अंकीय सत्यापन कोड आपके Gmail (${email.trim()}) पर भेज दिया गया है।`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Email & Finalize Registration
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRegData) return;

    if (enteredVerifyCode.trim() !== pendingRegData.code.trim()) {
      error('गलत सत्यापन कोड', 'कृपया Gmail पर भेजा गया सही 6-अंकीय कोड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      let regOk = false;
      if (pendingRegData.role === 'agent') {
        regOk = await registerAgent(pendingRegData.details);
      } else if (pendingRegData.role === 'shopkeeper') {
        regOk = await registerShopkeeper(pendingRegData.details);
      } else {
        regOk = await registerCustomer(pendingRegData.details);
      }

      if (regOk) {
        await login(pendingRegData.details.email, pendingRegData.details.password);
        success('🎉 रजिस्ट्रेशन व सत्यापन सफल!', 'आपका खाता सक्रिय हो चुका है। डैशबोर्ड पर भेजा जा रहा है...');
        performRoleRedirect(pendingRegData.role);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Bar */}
      <header className="p-4 sm:p-6 border-b border-amber-400/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" />
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              यूनिफाइड ऑथेंटिकेशन गेटवे
            </span>
            <span className="text-xs font-mono text-slate-400">login.safargo.in</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={buildSubdomainUrl('main')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800"
          >
            <span>पब्लिक यात्री पोर्टल</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* Redirecting Overlay if actively transitioning */}
        {isRedirecting && (
          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-emerald-400/20 text-emerald-400 mx-auto flex items-center justify-center animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">सत्यापन व लॉगिन सफल!</h2>
            <p className="text-xs text-slate-300">
              आपको सुरक्षित रूप से अधिकृत डैशबोर्ड (<strong className="text-emerald-400">{redirectTargetUrl}</strong>) पर भेजा जा रहा है...
            </p>
            <div className="pt-2">
              <a
                href={redirectTargetUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition"
              >
                <span>तुरंत डैशबोर्ड खोलें</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {!isRedirecting && (
          <div className="relative bg-slate-900/95 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.2)] space-y-6 animate-fadeIn">
            
            {/* Top Amber Highlight Strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 rounded-t-3xl" />

            {/* Header Badge & Title */}
            <div className="text-center space-y-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-[11px] font-black">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>सुरक्षित SafarGo अधिकृत प्रवेश द्वार [login.safargo.in]</span>
              </div>

              {selectedRole === 'agent' && (
                <div className="flex justify-center py-1">
                  <Go3DUltraLogo size="sm" showBadge={true} badgeText="GO SPECIAL CSC AGENT" />
                </div>
              )}

              <h1 className="text-xl sm:text-2xl font-black text-white">
                {selectedRole === 'agent' && 'GO Special Agent लॉगिन व रजिस्ट्रेशन'}
                {selectedRole === 'shopkeeper' && 'सफ़ारगो दुकानदार मर्चेंट लॉगिन'}
                {selectedRole === 'promoter' && 'सफ़ारगो प्रमोटर पार्टनर लॉगिन'}
                {selectedRole === 'customer' && 'यात्री एवं ग्राहक लॉगिन'}
                {selectedRole === 'admin' && 'सुपर एडमिन कंट्रोल डेस्क'}
              </h1>
              <p className="text-xs text-slate-400">
                {selectedRole === 'agent' && 'फ्लैट ₹20/टिकट कमीशन, 3-मिनट अप्रूवल व 0-सेकंड Go Instant Add Money'}
                {selectedRole === 'shopkeeper' && 'दुकान सूचीकरण, 15-मिनट डिलीवरी व Go Wallet कमाई'}
                {selectedRole === 'promoter' && '₹15,000 फिक्स्ड मासिक वेतन व 5 स्लॉट पार्टनर प्रोग्राम'}
                {selectedRole === 'customer' && 'बस टिकट बुकिंग, लाइव ट्रैकिंग व सुरक्षित रिफंड'}
                {selectedRole === 'admin' && 'केवल अधिकृत सुपर एडमिन ऑपरेशन्स डेस्क'}
              </p>
            </div>

            {/* Role Switcher Pills */}
            <div className="grid grid-cols-5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] font-bold text-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('agent');
                  setMode('login');
                }}
                className={`py-2 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  selectedRole === 'agent'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>GO एजेंट</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('shopkeeper');
                  setMode('login');
                }}
                className={`py-2 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  selectedRole === 'shopkeeper'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>दुकानदार</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('promoter');
                  setMode('login');
                }}
                className={`py-2 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  selectedRole === 'promoter'
                    ? 'bg-indigo-600 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>प्रमोटर</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('customer');
                  setMode('login');
                }}
                className={`py-2 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  selectedRole === 'customer'
                    ? 'bg-orange-500 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>यात्री</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole('admin');
                  setMode('login');
                }}
                className={`py-2 rounded-xl transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  selectedRole === 'admin'
                    ? 'bg-red-600 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>एडमिन</span>
              </button>
            </div>

            {/* Mode Switcher inside role (Login vs Register vs Forgot Password) */}
            {mode !== 'verify_email' && selectedRole !== 'admin' && selectedRole !== 'promoter' && (
              <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    mode === 'login' || mode === 'forgot_password'
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  लॉगिन (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`py-2 rounded-lg transition cursor-pointer ${
                    mode === 'register'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  नया रजिस्ट्रेशन (Join)
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* 1. LOGIN FORM                                            */}
            {/* ======================================================== */}
            {mode === 'login' && (
              <div className="space-y-4 animate-fadeIn">
                {selectedRole === 'agent' && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-black rounded-xl border border-slate-300 shadow-md transition flex items-center justify-center gap-3 cursor-pointer text-xs disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google से 1-क्लिक स्पेशल एजेंट लॉगिन</span>
                  </button>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      ईमेल या पंजीकृत मोबाइल नंबर *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={emailOrMobile}
                        onChange={(e) => setEmailOrMobile(e.target.value)}
                        placeholder="उदा. agent@safargo.in या 98260XXXXX"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-300 text-xs">
                        पासवर्ड *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(emailOrMobile.includes('@') ? emailOrMobile : '');
                          setMode('forgot_password');
                        }}
                        className="text-[11px] text-amber-400 hover:underline cursor-pointer font-bold"
                      >
                        पासवर्ड भूल गए? (Forgot Password)
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="पासवर्ड दर्ज करें"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{isSubmitting ? 'प्रक्रियाधीन...' : 'सुरक्षित लॉगिन करें ➔'}</span>
                  </button>
                </form>

                {selectedRole === 'agent' && (
                  <div className="pt-2 text-center text-xs text-slate-400">
                    नया GO एजेंट बनना चाहते हैं?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      यहाँ 1 मिनट में रजिस्टर करें ➔
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* 2. FORGOT PASSWORD (पासवर्ड भूल गए?) FLOW                  */}
            {/* ======================================================== */}
            {mode === 'forgot_password' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-200 leading-snug">
                    <strong>पासवर्ड रीसेट सुरक्षा डेस्क:</strong> अपने पंजीकृत Gmail पते पर 6-अंकीय वन-टाइम पासवर्ड (OTP) प्राप्त करके नया पासवर्ड सेट करें।
                  </p>
                </div>

                {!resetOtpSent ? (
                  <form onSubmit={handleSendResetOtp} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1 text-xs">
                        पंजीकृत Gmail पता *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="उदा. agent.pawan@gmail.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-red-400 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{isSubmitting ? 'OTP भेजा जा रहा है...' : 'पासवर्ड रीसेट OTP भेजें ➔'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCompletePasswordReset} className="space-y-3.5">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-400">OTP भेजा गया: </span>
                      <strong className="text-amber-300 font-mono">{resetEmail}</strong>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1 text-xs">
                        Gmail पर प्राप्त 6-अंकीय OTP कोड *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={enteredResetCode}
                        onChange={(e) => setEnteredResetCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-amber-400 text-amber-300 text-center font-mono text-lg font-black tracking-widest outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1 text-xs">
                          नया पासवर्ड बनाएं *
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="न्यूनतम 4 अक्षर"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1 text-xs">
                          पासवर्ड दोबारा पुष्टि करें *
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="दोबारा पासवर्ड डालें"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isSubmitting ? 'अपडेट हो रहा है...' : 'नया पासवर्ड सेव करें व लॉगिन करें ➔'}</span>
                    </button>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setResetOtpSent(false);
                    }}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    ← वापस लॉगिन पर लौटें
                  </button>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 3. REGISTRATION FORM                                     */}
            {/* ======================================================== */}
            {mode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      पूरा नाम (Full Name) *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="उदा. राहुल शर्मा"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      मोबाइल नंबर (10 अंक) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="98260XXXXX"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    असली Gmail पता (Verification हेतु) *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="उदा. rahul@gmail.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      सुरक्षित पासवर्ड बनाएं *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="न्यूनतम 4 अक्षर"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      दुकान / एजेंसी का नाम
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        placeholder="उदा. राहुल ऑनलाइन कैफे"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      शहर / कस्बा *
                    </label>
                    <select
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setDistrict(e.target.value);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    >
                      {MP_NETWORK_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      रेफरल कोड (वैकल्पिक)
                    </label>
                    <div className="relative">
                      <Gift className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="SFG-REF-XXXXX"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-amber-400/50 text-amber-300 font-mono text-xs uppercase outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSubmitting ? 'सत्यापन कोड भेजा जा रहा है...' : 'Gmail सत्यापन कोड भेजें ➔'}</span>
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* 4. VERIFY EMAIL OTP SCREEN                               */}
            {/* ======================================================== */}
            {mode === 'verify_email' && pendingRegData && (
              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-200 leading-snug">
                    सत्यापन कोड आपके Gmail (<strong>{pendingRegData.details.email}</strong>) पर भेजा जा चुका है। कृपया इनबॉक्स या स्पैम फोल्डर चेक करके 6-अंकीय कोड दर्ज करें।
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs text-center">
                    6-अंकीय सत्यापन कोड (Gmail OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredVerifyCode}
                    onChange={(e) => setEnteredVerifyCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border-2 border-emerald-400 text-emerald-300 text-center font-mono text-2xl font-black tracking-widest outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'सत्यापन हो रहा है...' : 'सत्यापित करें व खाता चालू करें ➔'}</span>
                </button>

                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    ← विवरण संपादित करें
                  </button>
                </div>
              </form>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/80 text-center text-xs text-slate-500 bg-slate-950">
        SafarGo Security Desk • आधिकारिक सबडोमेन गेटवे login.safargo.in • 24x7 हेल्पलाइन: 919876543210
      </footer>

    </div>
  );
};
