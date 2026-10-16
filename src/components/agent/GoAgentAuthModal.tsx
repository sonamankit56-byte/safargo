import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import {
  registerWithEmailVerification,
  checkIsEmailVerified,
  resendVerificationEmail,
} from '../../lib/firebaseService';
import { sendRegistrationOtpEmail, sendPasswordResetOtpEmail } from '../../lib/emailService';
import {
  X,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  RotateCw,
  Crown,
  Zap,
  ArrowRight,
  Send,
  AlertTriangle,
  Gift,
  KeyRound,
} from 'lucide-react';

interface GoAgentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: () => void;
  initialMode?: 'login' | 'register';
}

export const GoAgentAuthModal: React.FC<GoAgentAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  initialMode = 'login',
}) => {
  const { login, loginWithGoogle, registerAgent, resetPassword, allProfiles, currentUser } = useAuth();
  const { error, success, info } = useToast();

  const [mode, setMode] = useState<'login' | 'register' | 'confirm_gmail' | 'forgot_password'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Forgot password inputs
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResetCodeSent, setForgotResetCodeSent] = useState(false);
  const [generatedResetCode, setGeneratedResetCode] = useState('');
  const [enteredResetOtp, setEnteredResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Registration inputs
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [city, setCity] = useState(MP_NETWORK_CITIES[0] || 'Indore');
  const [district, setDistrict] = useState('Indore');
  const [address, setAddress] = useState('');

  // Referral code input with automatic link capture
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

  // Pending Gmail confirmation
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    code: string;
    email: string;
    name: string;
    mobile: string;
    agency: string;
    city: string;
    district: string;
    address: string;
    password: string;
    referral_code?: string;
  } | null>(null);
  const [enteredConfirmCode, setEnteredConfirmCode] = useState('');
  const [isCheckingGmailLink, setIsCheckingGmailLink] = useState(false);

  // Background 3D Canvas Animation Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Interactive 3D Cyber Particle & Speed Lines Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 3D perspective stars/lines
    const particles = Array.from({ length: 65 }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: Math.random() * 800 + 100,
      size: Math.random() * 2.2 + 0.8,
      speed: Math.random() * 2 + 1.2,
      color: Math.random() > 0.4 ? '#F59E0B' : '#06B6D4',
    }));

    const render = () => {
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, width, height);

      // Radial glowing core
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width * 0.7
      );
      gradient.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.06)');
      gradient.addColorStop(1, 'rgba(3, 7, 18, 0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Render 3D flying particle trails
      particles.forEach((p) => {
        p.z -= p.speed;
        if (p.z <= 0) {
          p.z = 800;
          p.x = (Math.random() - 0.5) * width * 1.5;
          p.y = (Math.random() - 0.5) * height * 1.5;
        }

        const k = 250 / p.z;
        const px = p.x * k + width / 2;
        const py = p.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.min(1, (800 - p.z) / 400);
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.arc(px, py, p.size * k * 0.8, 0, Math.PI * 2);
          ctx.fill();

          // Speed trail
          ctx.beginPath();
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1 * k;
          ctx.globalAlpha = alpha * 0.4;
          ctx.moveTo(px, py);
          ctx.lineTo(px - (p.x * 0.05 * k), py - (p.y * 0.05 * k));
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Google 1-Click Sign In
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        success('लॉगिन सफल!', 'GO स्पेशल एजेंट डैशबोर्ड में आपका स्वागत है!');
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Login with Verified Gmail & Password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      error('विवरण अधूरा', 'कृपया पंजीकृत Gmail और पासवर्ड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await login(loginEmail.trim(), loginPassword.trim());
      if (ok) {
        success('लॉगिन सफल!', 'GO स्पेशल एजेंट पोर्टल में आपका स्वागत है!');
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Send Forgot Password Reset OTP via Resend
  const handleSendForgotPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      error('अमान्य Gmail', 'कृपया अपना पंजीकृत Gmail पता दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedResetCode(code);

      const dispatched = await sendPasswordResetOtpEmail({
        toEmail: forgotEmail.trim(),
        resetCode: code,
        userName: 'GO Special Agent',
      });

      if (dispatched) {
        setForgotResetCodeSent(true);
        success('OTP भेजा गया! ✉️', `6-अंकीय पासवर्ड रीसेट कोड ${forgotEmail.trim()} पर भेज दिया गया है।`);
      } else {
        error('ईमेल प्रेषण विफल', 'ईमेल भेजने में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Complete Forgot Password Reset
  const handleCompleteForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredResetOtp.trim() !== generatedResetCode.trim()) {
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
      const resetOk = await resetPassword(forgotEmail.trim(), newPassword.trim());
      if (resetOk) {
        // Automatically log in with new password
        await login(forgotEmail.trim(), newPassword.trim());
        success('पासवर्ड अपडेट हुआ! 🎉', 'नया पासवर्ड सेट हो गया और GO एजेंट डैशबोर्ड में लॉगिन सफल हुआ!');
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle GO Special Agent Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('अमान्य मोबाइल', 'कृपया सही 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      error('वैध Gmail अनिवार्य', 'GO स्पेशल एजेंट के लिए असली Gmail पता अनिवार्य है।');
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
      // Generate 6-digit confirmation code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Send professional real registration confirmation email via Resend (safargo.in)
      await sendRegistrationOtpEmail({
        toEmail: email.trim(),
        fullName: fullName.trim(),
        confirmCode: code,
        role: 'agent',
      });

      // Trigger Firebase email verification if available in parallel
      try {
        await registerWithEmailVerification(email.trim(), password.trim());
      } catch (err: any) {
        console.warn('Firebase registration notice:', err?.message);
      }

      setPendingConfirmation({
        code,
        email: email.trim(),
        name: fullName.trim(),
        mobile: cleanMobile,
        agency: agencyName.trim() || 'GO Digital Seva Kendra',
        city: city.trim(),
        district: district.trim(),
        address: address.trim() || city.trim(),
        password: password.trim(),
        referral_code: referralCode.trim() ? referralCode.trim().toUpperCase() : undefined,
      });

      setEnteredConfirmCode('');
      setMode('confirm_gmail');
      info(
        'Gmail पुष्टिकरण भेजा गया! ✉️',
        `6-अंकीय सत्यापन कोड आपके Gmail (${email.trim()}) पर भेज दिया गया है। कृपया इनबॉक्स या स्पैम चेक करें।`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Confirm Gmail and Complete Registration
  const handleConfirmGmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingConfirmation) return;

    if (enteredConfirmCode.trim() !== pendingConfirmation.code) {
      error('गलत कोड', 'कृपया Gmail पर भेजा गया सही 6-अंकीय कोड दर्ज करें।');
      return;
    }

    setIsSubmitting(true);
    try {
      // Register with AuthContext as approved agent + GO Special Agent flag
      const registered = await registerAgent({
        full_name: pendingConfirmation.name,
        mobile: pendingConfirmation.mobile,
        email: pendingConfirmation.email,
        city: pendingConfirmation.city,
        district: pendingConfirmation.district,
        address: pendingConfirmation.address,
        shop_name: pendingConfirmation.agency,
        password: pendingConfirmation.password,
        referral_code: pendingConfirmation.referral_code,
      });

      if (registered) {
        // Automatically login the agent
        await login(pendingConfirmation.email, pendingConfirmation.password);
        success(
          '🎉 GO स्पेशल एजेंट एक्टिवेटेड!',
          'आपका Gmail सफलतापूर्वक सत्यापित हुआ! ₹20 फ्लैट कमीशन डैशबोर्ड सक्रिय है।'
        );
        onClose();
        if (onSuccessLogin) onSuccessLogin();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if link clicked in Gmail
  const handleCheckEmailLink = async () => {
    setIsCheckingGmailLink(true);
    try {
      const isVerified = await checkIsEmailVerified();
      if (isVerified && pendingConfirmation) {
        setEnteredConfirmCode(pendingConfirmation.code);
        success('Gmail सत्यापित! 🎉', 'आपका ईमेल लिंक से सफलतापूर्वक कन्फर्म हो चुका है। अब सक्रियण बटन दबाएं।');
      } else {
        info('Gmail इनबॉक्स चेक करें', 'ईमेल की पुष्टि प्रतीक्षारत है। कृपया अपने Gmail में SafarGo से आया 6-अंकीय कोड देखें और यहाँ दर्ज करें।');
      }
    } finally {
      setIsCheckingGmailLink(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* 3D Container with Cyber Depth */}
      <div className="relative w-full max-w-xl bg-slate-900/95 border-2 border-amber-400/70 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        
        {/* Dynamic 3D Canvas Video-Style Background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        />

        {/* Ambient Top Glow Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-cyan-400 shrink-0" />

        {/* Modal Header */}
        <div className="relative p-5 sm:p-6 pb-3 text-white shrink-0 z-10 flex flex-col items-center text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* 3D Floating GO Ultra Logo */}
          <div className="mb-2 transform hover:scale-105 transition-transform duration-300">
            <Go3DUltraLogo size="lg" showBadge={true} badgeText="ULTRA 3D SPECIAL AGENT" />
          </div>

          <p className="text-xs text-slate-300 max-w-md mt-1 leading-relaxed">
            विशेष अधिकृत GO स्पेशल एजेंट टर्मिनल — <strong>प्रत्येक टिकट पर फ्लैट ₹20 नकद कमीशन</strong> एवं 3D अल्ट्रा डैशबोर्ड एक्सेस!
          </p>

          {/* Dedicated Dual Mode Switcher (NO OTHER CLUTTER!) */}
          {mode !== 'confirm_gmail' && mode !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1 bg-slate-950/90 rounded-2xl border border-amber-400/40 w-full max-w-sm mt-4 gap-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>GO एजेंट लॉगिन</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>नया GO रजिस्ट्रेशन</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 pt-2 overflow-y-auto space-y-4 flex-1 relative z-10 text-white text-xs">
          
          {/* ========================================================== */}
          {/* 1. GO SPECIAL AGENT LOGIN FORM                              */}
          {/* ========================================================== */}
          {mode === 'login' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Highlight Perks Banner */}
              <div className="p-3 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-cyan-500/15 border border-amber-400/50 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    ₹20
                  </div>
                  <div>
                    <h4 className="font-black text-amber-300 text-xs">फ्लैट ₹20 कमीशन प्रति टिकट</h4>
                    <p className="text-[10px] text-slate-300">बिना किसी देरी सीधे Go Wallet में क्रेडिट</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  100% Real
                </span>
              </div>

              {/* Verified Gmail & Password Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    सत्यापित Gmail या मोबाइल नंबर *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="उदा. agent.pawan@gmail.com"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-300 text-xs">
                      पासवर्ड (Password) *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail.includes('@') ? loginEmail : '');
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
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="पासवर्ड दर्ज करें"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-slate-950" />
                  <span>{isSubmitting ? 'लॉगिन हो रहा है...' : '🚀 GO स्पेशल एजेंट 3D डैशबोर्ड खोलें'}</span>
                </button>
              </form>

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
            </div>
          )}

          {/* ========================================================== */}
          {/* FORGOT PASSWORD VIEW                                       */}
          {/* ========================================================== */}
          {mode === 'forgot_password' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-200 leading-snug">
                  <strong>पासवर्ड रीसेट सुरक्षा सत्यापन:</strong> अपने पंजीकृत Gmail पर 6-अंकीय पासवर्ड रीसेट कोड प्राप्त करके नया पासवर्ड सेट करें।
                </p>
              </div>

              {!forgotResetCodeSent ? (
                <form onSubmit={handleSendForgotPasswordOtp} className="space-y-3.5">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      पंजीकृत Gmail पता *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="उदा. agent.pawan@gmail.com"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-red-400 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4" />
                    <span>{isSubmitting ? 'OTP भेजा जा रहा है...' : 'पासवर्ड रीसेट OTP भेजें ➔'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCompleteForgotPassword} className="space-y-3.5">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400">सत्यापन कोड भेजा गया: </span>
                    <strong className="text-amber-300 font-mono">{forgotEmail}</strong>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1 text-xs">
                      Gmail पर प्राप्त 6-अंकीय OTP कोड *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={enteredResetOtp}
                      onChange={(e) => setEnteredResetOtp(e.target.value.replace(/\D/g, ''))}
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
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none font-mono"
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
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'पासवर्ड अपडेट हो रहा है...' : 'नया पासवर्ड सेव करें व डैशबोर्ड खोलें ➔'}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setForgotResetCodeSent(false);
                  }}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ← वापस लॉगिन पर लौटें
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* 2. GO SPECIAL AGENT ULTRA REGISTRATION FORM                */}
          {/* ========================================================== */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 animate-fadeIn">
              
              <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-cyan-200 leading-snug">
                  <strong>सख्त GO सुरक्षा नियम:</strong> रजिस्ट्रेशन सबमिट होने के बाद आपके Gmail पते पर कन्फर्मेशन लिंक व 6-अंकीय कोड भेजा जाएगा। ईमेल सत्यापन के बाद ही आपका एजेंट अकाउंट चालू होगा।
                </p>
              </div>

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
                      placeholder="उदा. पवन कुमार"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none"
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
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1 text-xs">
                  असली Gmail पता (Real Gmail for Verification) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="उदा. aapka_naam@gmail.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  इस Gmail पर खाता सक्रिय करने के लिए सत्यापन लिंक भेजा जाएगा।
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    एजेंसी / दुकान का नाम *
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="उदा. पवन ऑनलाइन CSC सेन्टर"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    पासवर्ड बनाएं *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="कम से कम 4 अक्षर"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    शहर (City / Hub) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setDistrict(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-cyan-400 outline-none"
                  >
                    {MP_NETWORK_CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    दुकान / ब्लॉक का पता *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="ब्लॉक ऑफिस के पास, मुख्य मार्ग"
                    className="w-full p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-cyan-400 outline-none"
                  />
                </div>
              </div>

              {/* Apply Referral Code Section (Automatic URL link capture & manual entry) */}
              {(() => {
                const matchedReferrer = allProfiles?.find(
                  (p) => p.referral_code && p.referral_code.toUpperCase() === referralCode.trim().toUpperCase()
                );
                return (
                  <div className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                        <Gift className="w-3.5 h-3.5 text-amber-400" />
                        <span>रेफरल कोड (Apply Referral Code)</span>
                      </label>
                      {matchedReferrer ? (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          सत्यापित रेफरल कोड ✓
                        </span>
                      ) : referralCode.trim() ? (
                        <span className="text-[10px] font-medium text-amber-300">
                          रेफरल कोड दर्ज
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">वैकल्पिक (Optional)</span>
                      )}
                    </div>

                    <div className="relative flex items-center gap-2">
                      <input
                        type="text"
                        value={referralCode}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setReferralCode(val);
                          try {
                            if (val) localStorage.setItem('safargo_active_ref_code', val);
                            else localStorage.removeItem('safargo_active_ref_code');
                          } catch {}
                        }}
                        placeholder="उदा. SFG-REF-PAWAN50"
                        className="flex-1 p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono font-bold uppercase focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                      {referralCode.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            setReferralCode('');
                            try {
                              localStorage.removeItem('safargo_active_ref_code');
                            } catch {}
                          }}
                          className="px-2.5 py-2 text-slate-400 hover:text-white bg-slate-700/60 hover:bg-slate-700 rounded-xl text-xs transition cursor-pointer"
                          title="हटाएं"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {matchedReferrer ? (
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[11px] text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>
                          रेफरल लिंक ऑटोमैटिक लागू: <strong>{matchedReferrer.full_name}</strong> ({matchedReferrer.shop_name || matchedReferrer.city}) के रेफरल से जुड़ रहे हैं।
                        </span>
                      </div>
                    ) : referralCode.trim() ? (
                      <p className="text-[10px] text-slate-400">
                        रेफरल कोड <strong>{referralCode}</strong> रजिस्ट्रेशन के साथ स्वतः लिंक हो जाएगा।
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 leading-snug">
                        💡 यदि किसी साथी एजेंट ने आपको लिंक भेजा है, तो रेफरल कोड ऑटोमैटिक भर जाएगा या यहाँ टाइप करें।
                      </p>
                    )}
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Gmail पर कोड भेजा जा रहा है...' : 'Gmail पर सत्यापन कोड भेजें ➔'}</span>
              </button>

              <div className="pt-1 text-center text-xs text-slate-400">
                पहले से GO एजेंट हैं?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-cyan-400 font-bold hover:underline cursor-pointer"
                >
                  सीधे लॉगिन करें ➔
                </button>
              </div>
            </form>
          )}

          {/* ========================================================== */}
          {/* 3. GMAIL CONFIRMATION & ACTIVATION WAITING SCREEN          */}
          {/* ========================================================== */}
          {mode === 'confirm_gmail' && pendingConfirmation && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border-2 border-cyan-400 rounded-2xl p-4 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                  <Mail className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black text-cyan-300">
                  Gmail सत्यापन प्रतीक्षारत (Confirmation Pending)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  हमने आपके Gmail पते <strong className="text-white font-mono">{pendingConfirmation.email}</strong> पर 6-अंकीय सुरक्षा कोड और सक्रियण लिंक भेज दिया है।
                </p>
              </div>

              {/* Professional Real Gmail Security Notice (No OTP on screen) */}
              <div className="bg-slate-800/90 border border-cyan-500/30 rounded-2xl p-4 text-left space-y-2 shadow-inner">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>सख्त सुरक्षा नियम: Gmail से 6-अंकीय कोड प्राप्त करें</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  सुरक्षा कारणों से कोड स्क्रीन पर प्रदर्शित नहीं किया जाता। कृपया अपने Gmail ऐप अथवा ब्राउज़र में <strong className="text-white font-mono">{pendingConfirmation.email}</strong> खोलें और SafarGo द्वारा भेजा गया 6-अंकीय सत्यापन कोड यहाँ दर्ज करें।
                </p>
              </div>

              {/* Code input form */}
              <form onSubmit={handleConfirmGmailSubmit} className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1 text-xs">
                    Gmail से 6-अंकीय कोड दर्ज करें *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredConfirmCode}
                    onChange={(e) => setEnteredConfirmCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-Digit Code"
                    className="w-full p-3.5 rounded-xl bg-slate-800/90 border border-cyan-400 text-center text-2xl font-mono font-black tracking-[0.4em] text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || enteredConfirmCode.length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'सत्यापित हो रहा है...' : '✅ कोड सत्यापित कर GO एजेंट खाता खोलें'}</span>
                </button>
              </form>

              <button
                type="button"
                onClick={handleCheckEmailLink}
                disabled={isCheckingGmailLink}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isCheckingGmailLink ? 'animate-spin' : ''}`} />
                <span>ईमेल लिंक स्टेटस जांचें</span>
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="hover:text-white"
                >
                  ← वापस विवरण बदलें
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={async () => {
                    if (pendingConfirmation) {
                      setIsSubmitting(true);
                      try {
                        await sendRegistrationOtpEmail({
                          toEmail: pendingConfirmation.email,
                          fullName: pendingConfirmation.name,
                          confirmCode: pendingConfirmation.code,
                          role: 'agent',
                        });
                        await resendVerificationEmail().catch(() => {});
                        info('पुनः भेजा गया ✉️', `सत्यापन कोड आपके Gmail (${pendingConfirmation.email}) पर पुनः भेज दिया गया है।`);
                      } catch {
                        error('त्रुटि', 'ईमेल भेजने में समस्या आई।');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }
                  }}
                  className="text-amber-400 hover:underline font-bold disabled:opacity-50"
                >
                  पुनः ईमेल भेजें ➔
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
