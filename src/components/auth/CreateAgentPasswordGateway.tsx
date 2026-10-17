import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import {
  getApplicationByToken,
  completeAgentPasswordSetup,
  OnboardingApplication,
} from '../../lib/onboardingStorage';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  User,
  Building,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateAgentPasswordGateway: React.FC = () => {
  const { registerAgent } = useAuth();
  const { success, error } = useToast();

  const [token, setToken] = useState('');
  const [emailParam, setEmailParam] = useState('');
  const [application, setApplication] = useState<OnboardingApplication | null>(null);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tok = urlParams.get('token') || '';
      const em = urlParams.get('email') || '';
      setToken(tok);
      setEmailParam(em);

      if (!tok) {
        setTokenError('सत्यापन टोकन अनुपलब्ध है। कृपया अपने ईमेल में दिए गए लिंक का उपयोग करें।');
        setIsVerifyingToken(false);
        return;
      }

      const app = getApplicationByToken(tok);
      if (!app) {
        setTokenError('अमान्य अथवा समाप्त हो चुका पासवर्ड टोकन। कृपया सुपर एडमिन से संपर्क करें।');
      } else if (app.passwordCreated) {
        setTokenError('इस खाते हेतु पासवर्ड पहले ही बनाया जा चुका है। कृपया सीधे लॉगिन करें।');
      } else {
        setApplication(app);
      }
    } catch {
      setTokenError('टोकन लोड करने में समस्या आई।');
    } finally {
      setIsVerifyingToken(false);
    }
  }, []);

  // Password Validation Rules
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasUpperAndLower = /[a-z]/.test(password) && /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = hasMinLength && hasNumber && hasSpecialChar && hasUpperAndLower && passwordsMatch;

  // Strength score: 0 to 4
  const strengthScore = [hasMinLength, hasNumber, hasSpecialChar, hasUpperAndLower].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !application) {
      error('पासवर्ड अमान्य', 'कृपया सभी सुरक्षा नियमों का पालन करें।');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Mark in onboarding storage
      const res = completeAgentPasswordSetup(token, password);
      if (!res.success) {
        error('त्रुटि', res.error || 'पासवर्ड सेट करने में समस्या');
        return;
      }

      // 2. Register/activate agent in AuthContext with full KYC details
      const cleanMobile = application.mobile.replace(/\D/g, '').slice(-10);
      await registerAgent({
        full_name: application.fullName.trim(),
        mobile: cleanMobile,
        email: application.email.trim(),
        city: application.city,
        district: application.city,
        address: application.address,
        shop_name: application.shopName,
        referral_code: application.referralCode,
        password: password.trim(),
        pan_number: application.panNumber,
        aadhaar_number: application.aadhaarNumber,
        bank_account_holder: application.accountHolder,
        bank_account_number: application.accountNumber,
        bank_ifsc: application.ifsc,
        bank_name: application.bankName,
        bank_upi_id: application.settlementUpiId,
      });

      setIsCompleted(true);
      success('पासवर्ड सफलतापूर्वक बन गया! 🎉', 'अब आप login.safargo.in से सीधे लॉगिन कर सकते हैं।');

      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {}
    } catch (err: any) {
      error('त्रुटि', err?.message || 'पासवर्ड निर्माण विफल');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 p-4 sm:px-8 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" showBadge={false} showTagline={false} />
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-full border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>100% VERIFIED SECURE PASSWORD SETUP</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          {isVerifyingToken ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">सुरक्षा टोकन का सत्यापन हो रहा है...</p>
            </div>
          ) : tokenError ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-black text-white">टोकन अमान्य अथवा समाप्त</h2>
              <p className="text-xs text-slate-400">{tokenError}</p>
              <div className="pt-2">
                <a
                  href={buildSubdomainUrl('login')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg transition"
                >
                  <span>लॉगिन पोर्टल पर जाएं</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : isCompleted ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">🎉 पासवर्ड सफलतापूर्वक सेट हुआ!</h2>
                <p className="text-xs text-slate-400">
                  आपका SafarGo एजेंट खाता अब पूरी तरह सक्रिय है। अब आप <strong>login.safargo.in</strong> से कभी भी सुरक्षित लॉगिन कर सकते हैं।
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-left text-xs space-y-1 font-mono text-slate-300">
                <div>User ID: <strong>{application?.mobile}</strong></div>
                <div>Agent Ref: <strong>{application?.id}</strong></div>
              </div>

              <div className="pt-2">
                <a
                  href={buildSubdomainUrl('login')}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <span>PROCEED TO SECURE LOGIN (login.safargo.in)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Profile Intro Banner */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-xs truncate">{application?.fullName}</h3>
                  <p className="text-[11px] text-slate-400 truncate">{application?.shopName}</p>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ID: {application?.id} • e-KYC Verified
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Create Agent Password</h2>
                <p className="text-xs text-slate-400">
                  एक मजबूत एवं सुरक्षित 8-अंकीय कंपनी पासवर्ड बनाएं।
                </p>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  New Password (नया पासवर्ड) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="कम से कम 8 अक्षर"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Confirm Password (पासवर्ड की पुष्टि) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="पासवर्ड पुनः दर्ज करें"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Realtime Enterprise Password Checklist */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 text-xs">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Password Strength & Security Rules
                </div>

                {/* Strength Meter Bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strengthScore === 1
                        ? 'w-1/4 bg-rose-500'
                        : strengthScore === 2
                        ? 'w-2/4 bg-amber-500'
                        : strengthScore === 3
                        ? 'w-3/4 bg-blue-500'
                        : strengthScore === 4
                        ? 'w-full bg-emerald-500'
                        : 'w-0'
                    }`}
                  />
                </div>

                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>कम से कम 8 अक्षर (8+ Characters)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>कम से कम 1 संख्या (Number 0-9)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasSpecialChar ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>कम से कम 1 स्पेशल कैरेक्टर (!@#$%^&*)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${hasUpperAndLower ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {hasUpperAndLower ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>अपरकेस एवं लोअरकेस अक्षर (A-Z, a-z)</span>
                  </div>

                  <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                    {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>दोनों पासवर्ड मेल खाते हैं (Passwords Match)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs shadow-xl shadow-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-98"
              >
                {isSubmitting ? (
                  <span>सुरक्षित पासवर्ड बनाया जा रहा है...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>SET PASSWORD & ACTIVATE AGENT</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        © 2026 SafarGo Technologies Private Limited • Enterprise Identity Management
      </footer>
    </div>
  );
};

export default CreateAgentPasswordGateway;
