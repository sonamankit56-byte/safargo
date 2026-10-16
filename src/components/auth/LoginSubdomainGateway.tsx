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
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
} from '../../lib/whatsappService';
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
  Smartphone,
} from 'lucide-react';

export const LoginSubdomainGateway: React.FC = () => {
  const {
    currentUser,
    role,
    login,
    registerAgent,
    registerShopkeeper,
    registerCustomer,
    resetPassword,
  } = useAuth();
  const { error, success, info } = useToast();

  // Role selector tab: default 'agent' (Admin has its own dedicated admin.safargo.in subdomain)
  const [selectedRole, setSelectedRole] = useState<'agent' | 'shopkeeper' | 'promoter' | 'customer'>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const r = p.get('role')?.toLowerCase().trim();
      if (r === 'admin') {
        window.location.href = buildSubdomainUrl('admin');
        return 'agent';
      }
      if (r && ['agent', 'shopkeeper', 'promoter', 'customer'].includes(r)) {
        return r as any;
      }
    } catch {}
    return 'agent';
  });

  // Action Mode inside role: 'login' | 'register' | 'forgot_password' | 'verify_email'
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password' | 'verify_email'>(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const m = p.get('mode')?.toLowerCase().trim();
      if (m && ['login', 'register', 'forgot_password'].includes(m)) {
        return m as any;
      }
    } catch {}
    return 'login';
  });
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

  // Login Method: Password vs WhatsApp OTP
  const [loginMethod, setLoginMethod] = useState<'password' | 'whatsapp_otp'>('password');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginEnteredOtp, setLoginEnteredOtp] = useState('');
  const [loginOtpUrl, setLoginOtpUrl] = useState('');

  // WhatsApp OTP URLs
  const [regOtpUrl, setRegOtpUrl] = useState('');
  const [resetOtpUrl, setResetOtpUrl] = useState('');

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

  // Inline Mobile WhatsApp Verification State on Registration Form
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
  const [isSendingMobileOtp, setIsSendingMobileOtp] = useState(false);
  const [mobileInlineOtp, setMobileInlineOtp] = useState('');
  const [mobileInlineOtpUrl, setMobileInlineOtpUrl] = useState('');

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

  // Handle WhatsApp OTP Request for Login
  const handleSendLoginWhatsAppOtp = async () => {
    const clean = emailOrMobile.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      error('अमान्य मोबाइल', 'कृपया अपना 10-अंकों का पंजीकृत मोबाइल नंबर दर्ज करें।');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await sendWhatsAppOtp({
        mobile: clean,
        purpose: 'login',
        agentName: 'SafarGo Agent',
      });
      if (res.success) {
        setLoginOtpSent(true);
        setLoginOtpUrl(res.directWhatsAppUrl);
        success('WhatsApp OTP भेजा गया! 📲', `6-अंकीय लॉगिन OTP आपके WhatsApp (+91 ${clean}) पर भेज दिया गया है।`);
      } else {
        error('प्रेषण विफल', res.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle WhatsApp OTP Login Verification
  const handleVerifyLoginWhatsAppOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = emailOrMobile.replace(/\D/g, '').slice(-10);
    if (loginEnteredOtp.trim().length !== 6) {
      error('अमान्य OTP', 'कृपया 6-अंकीय WhatsApp OTP दर्ज करें।');
      return;
    }

    const verification = verifyWhatsAppOtp(clean, loginEnteredOtp.trim(), 'login');
    if (!verification.verified) {
      error('सत्यापन विफल', verification.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(clean);
      if (ok) {
        success('लॉगिन सफल! 🎉', 'WhatsApp 2FA सत्यापन सफल। डैशबोर्ड खुल रहा है...');
        performRoleRedirect(selectedRole);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send Password Reset OTP (WhatsApp + Gmail Dual)
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = resetEmail.trim();
    if (!input) {
      error('आवश्यक विवरण', 'कृपया अपना पंजीकृत मोबाइल नंबर अथवा Gmail पता दर्ज करें।');
      return;
    }

    const isEmail = input.includes('@');
    const cleanMobile = input.replace(/\D/g, '').slice(-10);

    setIsSubmitting(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedResetCode(code);

      // 1. Send WhatsApp OTP if valid 10-digit mobile
      if (cleanMobile.length === 10) {
        const waRes = await sendWhatsAppOtp({
          mobile: cleanMobile,
          purpose: 'forgot_password',
          agentName: 'SafarGo Agent',
          email: isEmail ? input : undefined,
        });
        if (waRes.success) {
          setResetOtpUrl(waRes.directWhatsAppUrl);
        }
      }

      // 2. Send Gmail OTP via Resend
      if (isEmail) {
        await sendPasswordResetOtpEmail({
          toEmail: input,
          resetCode: code,
          userName: 'SafarGo Agent',
        });
      }

      setResetOtpSent(true);
      success('OTP भेजा गया! 📲✉️', '6-अंकीय पासवर्ड रीसेट कोड WhatsApp और Email पर भेज दिया गया है।');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Password Reset
  const handleCompletePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredResetCode.trim() !== generatedResetCode.trim()) {
      error('गलत OTP कोड', 'कृपया भेजा गया सही 6-अंकीय OTP कोड दर्ज करें।');
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
        await login(resetEmail.trim(), newPassword.trim());
        success('पासवर्ड अपडेट हुआ! 🎉', 'नया पासवर्ड सफलतापूर्वक सेट हो गया। डैशबोर्ड खुल रहा है...');
        performRoleRedirect(selectedRole);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Inline WhatsApp Mobile Verification
  const handleSendMobileVerificationOtp = async () => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      error('अमान्य मोबाइल', 'कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें।');
      return;
    }
    setIsSendingMobileOtp(true);
    try {
      const res = await sendWhatsAppOtp({
        mobile: cleanMobile,
        purpose: 'phone_verify',
        agentName: fullName.trim() || 'SafarGo Agent',
        email: email.trim() || undefined,
      });
      if (res.success) {
        setIsMobileOtpSent(true);
        setMobileInlineOtpUrl(res.directWhatsAppUrl);
        success('WhatsApp OTP भेजा गया! 📲', `6-अंकीय सत्यापन कोड +91 ${cleanMobile} के WhatsApp पर भेजा गया है।`);
      } else {
        error('प्रेषण विफल', res.message);
      }
    } finally {
      setIsSendingMobileOtp(false);
    }
  };

  const handleVerifyMobileInlineOtp = () => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (mobileInlineOtp.trim().length !== 6) {
      error('अमान्य OTP', 'कृपया 6-अंकीय WhatsApp OTP दर्ज करें।');
      return;
    }
    const res = verifyWhatsAppOtp(cleanMobile, mobileInlineOtp.trim(), 'phone_verify');
    if (res.verified) {
      setIsMobileVerified(true);
      success('मोबाइल नंबर सत्यापित! ✅', 'आपका WhatsApp नंबर सफलतापूर्वक सत्यापित हो गया है।');
    } else {
      error('सत्यापन विफल', res.message);
    }
  };

  // Handle Registration Submit (Instant Real Database Registration + Direct to Login)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
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
      const regDetails = {
        full_name: fullName.trim(),
        mobile: cleanMobile,
        email: email.trim(),
        city: city.trim(),
        district: district.trim(),
        address: address.trim() || city.trim(),
        shop_name: shopName.trim() || 'GO Seva Kendra',
        password: password.trim(),
        referral_code: referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
      };

      let regOk = false;
      if (selectedRole === 'agent') {
        regOk = await registerAgent(regDetails);
      } else if (selectedRole === 'shopkeeper') {
        regOk = await registerShopkeeper(regDetails);
      } else {
        regOk = await registerCustomer(regDetails);
      }

      if (regOk) {
        success(
          '🎉 सफल पंजीकरण! (Registration Successful)',
          'आपका SafarGo खाता सफलतापूर्वक बन गया है। अब सीधे लॉगिन करें।'
        );
        setEmailOrMobile(cleanMobile);
        setPassword(password.trim());
        setMode('login');

        // Send confirmation email in background
        sendRegistrationOtpEmail({
          toEmail: email.trim(),
          fullName: fullName.trim(),
          confirmCode: 'WELCOME',
          role: selectedRole,
        }).catch(console.warn);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback OTP verification if invoked
  const handleVerifyEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingRegData) return;

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
        success(
          '🎉 सफल पंजीकरण! (Registration Successful)',
          'आपका SafarGo खाता सफलतापूर्वक बन गया है। अब सीधे लॉगिन करें।'
        );
        setEmailOrMobile(pendingRegData.details.mobile);
        setPassword(pendingRegData.details.password);
        setMode('login');
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
              </h1>
              <p className="text-xs text-slate-400">
                {selectedRole === 'agent' && 'फ्लैट ₹20/टिकट कमीशन, 3-मिनट अप्रूवल व 0-सेकंड Go Instant Add Money'}
                {selectedRole === 'shopkeeper' && 'दुकान सूचीकरण, 15-मिनट डिलीवरी व Go Wallet कमाई'}
                {selectedRole === 'promoter' && '₹15,000 फिक्स्ड मासिक वेतन व 5 स्लॉट पार्टनर प्रोग्राम'}
                {selectedRole === 'customer' && 'बस टिकट बुकिंग, लाइव ट्रैकिंग व सुरक्षित रिफंड'}
              </p>
            </div>

            {/* Role Switcher Pills (GO Agent, Shopkeeper, Promoter, Passenger - Admin is on admin.safargo.in) */}
            <div className="grid grid-cols-4 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-[10px] font-bold text-center gap-1">
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
            </div>

            {/* Mode Switcher inside role (Login vs Register vs Forgot Password) */}
            {mode !== 'verify_email' && selectedRole !== 'promoter' && (
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
                {/* Login Method Selector: Password vs WhatsApp OTP */}
                <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginMethod === 'password'
                        ? 'bg-slate-800 text-amber-400 font-black border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>पासवर्ड से लॉगिन</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('whatsapp_otp')}
                    className={`py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      loginMethod === 'whatsapp_otp'
                        ? 'bg-emerald-600 text-white font-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📲 WhatsApp OTP</span>
                  </button>
                </div>

                {loginMethod === 'whatsapp_otp' ? (
                  <form onSubmit={handleVerifyLoginWhatsAppOtp} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1 text-xs">
                        पंजीकृत मोबाइल नंबर (10 अंक) *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                          <input
                            type="tel"
                            maxLength={10}
                            required
                            value={emailOrMobile}
                            onChange={(e) => setEmailOrMobile(e.target.value.replace(/\D/g, ''))}
                            placeholder="उदा. 98260XXXXX"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-emerald-400 outline-none font-mono font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={isSubmitting || emailOrMobile.replace(/\D/g, '').length !== 10}
                          onClick={handleSendLoginWhatsAppOtp}
                          className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>{loginOtpSent ? 'पुनः भेजें' : '📲 OTP भेजें'}</span>
                        </button>
                      </div>
                    </div>

                    {loginOtpSent ? (
                      <div className="space-y-3 pt-1">
                        <div>
                          <label className="block font-bold text-slate-300 mb-1 text-xs text-center">
                            WhatsApp पर प्राप्त 6-अंकीय OTP कोड *
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={loginEnteredOtp}
                            onChange={(e) => setLoginEnteredOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-emerald-400 text-emerald-300 text-center font-mono text-xl font-black tracking-widest outline-none"
                          />
                        </div>

                        {loginOtpUrl && (
                          <div className="text-center">
                            <a
                              href={loginOtpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-emerald-400 hover:underline font-bold inline-flex items-center gap-1"
                            >
                              <span>WhatsApp चैट में OTP देखें ➔</span>
                            </a>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isSubmitting ? 'सत्यापन हो रहा है...' : 'सुरक्षित लॉगिन करें ➔'}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        मोबाइल नंबर दर्ज करके <strong>"📲 OTP भेजें"</strong> दबाएं। आपके WhatsApp पर 6-अंकीय कोड आएगा।
                      </p>
                    )}
                  </form>
                ) : (
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
                            setResetEmail(emailOrMobile);
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
                )}

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
                    <strong>पासवर्ड रीसेट सुरक्षा डेस्क:</strong> अपने पंजीकृत मोबाइल (WhatsApp) अथवा Gmail पते पर 6-अंकीय OTP प्राप्त करके नया पासवर्ड सेट करें।
                  </p>
                </div>

                {!resetOtpSent ? (
                  <form onSubmit={handleSendResetOtp} className="space-y-3.5">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1 text-xs">
                        पंजीकृत मोबाइल नंबर अथवा Gmail पता *
                      </label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="उदा. 98260XXXXX अथवा agent@gmail.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-red-400 outline-none font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{isSubmitting ? 'OTP भेजा जा रहा है...' : 'WhatsApp व Gmail पर OTP भेजें ➔'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleCompletePasswordReset} className="space-y-3.5">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px]">OTP प्रेषित: </span>
                        <strong className="text-amber-300 font-mono">{resetEmail}</strong>
                      </div>
                      {resetOtpUrl && (
                        <a
                          href={resetOtpUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline font-bold"
                        >
                          WhatsApp में देखें ➔
                        </a>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1 text-xs">
                        प्राप्त 6-अंकीय OTP कोड *
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
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-300 text-xs">
                        मोबाइल नंबर (10 अंक) *
                      </label>
                      {isMobileVerified ? (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          सत्यापित (Verified ✓)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendMobileVerificationOtp}
                          disabled={isSendingMobileOtp || mobile.replace(/\D/g, '').slice(-10).length !== 10}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline cursor-pointer disabled:opacity-40"
                        >
                          {isSendingMobileOtp ? 'भेजा जा रहा है...' : 'WhatsApp OTP भेजें'}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value.replace(/\D/g, ''));
                          setIsMobileVerified(false);
                          setIsMobileOtpSent(false);
                        }}
                        placeholder="98260XXXXX"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border ${
                          isMobileVerified ? 'border-emerald-500 text-emerald-300' : 'border-slate-700 text-white'
                        } placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono`}
                      />
                    </div>

                    {/* Inline WhatsApp OTP input if OTP sent but not verified */}
                    {isMobileOtpSent && !isMobileVerified && (
                      <div className="mt-2 p-2.5 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-2 animate-fadeIn">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-cyan-300 font-medium">WhatsApp OTP दर्ज करें:</span>
                          {mobileInlineOtpUrl && (
                            <a
                              href={mobileInlineOtpUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 font-bold hover:underline"
                            >
                              WhatsApp में देखें ➔
                            </a>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={mobileInlineOtp}
                            onChange={(e) => setMobileInlineOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-अंक OTP"
                            className="w-28 px-2 py-1.5 bg-slate-800 border border-cyan-400 text-cyan-300 rounded-lg text-center font-mono font-bold text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyMobileInlineOtp}
                            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
                          >
                            वेरीफाई करें
                          </button>
                        </div>
                      </div>
                    )}
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
                  <span>{isSubmitting ? 'सत्यापन कोड भेजा जा रहा है...' : 'WhatsApp व Gmail सत्यापन कोड भेजें ➔'}</span>
                </button>
              </form>
            )}

            {/* ======================================================== */}
            {/* 4. VERIFY EMAIL & WHATSAPP DUAL OTP SCREEN                */}
            {/* ======================================================== */}
            {mode === 'verify_email' && pendingRegData && (
              <form onSubmit={handleVerifyEmailSubmit} className="space-y-4 animate-fadeIn">
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-emerald-200 leading-snug">
                    सुरक्षा सत्यापन कोड आपके <strong>WhatsApp (+91 {pendingRegData.details.mobile})</strong> एवं Gmail (<strong>{pendingRegData.details.email}</strong>) दोनों पर भेज दिया गया है। कृपया 6-अंकीय कोड दर्ज करें।
                  </p>
                </div>

                {regOtpUrl && (
                  <div className="p-2.5 bg-emerald-900/30 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                    <span className="text-[11px] text-emerald-300 font-semibold">
                      📲 WhatsApp चैट में सीधा OTP देखें:
                    </span>
                    <a
                      href={regOtpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs transition"
                    >
                      WhatsApp खोलें ➔
                    </a>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs text-center">
                    6-अंकीय WhatsApp / Gmail OTP कोड *
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
