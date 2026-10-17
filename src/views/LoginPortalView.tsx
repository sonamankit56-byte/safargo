import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import confetti from 'canvas-confetti';
import {
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Bus,
} from 'lucide-react';

export const LoginPortalView: React.FC = () => {
  const { login, loginAgent, setCurrentView } = useBooking();

  // Form State
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [gmailAddress, setGmailAddress] = useState('');

  // View Sub-states: 'credentials' | 'forgot_password' | 'otp_verify' | 'success_tick'
  const [authStep, setAuthStep] = useState<'credentials' | 'forgot_password' | 'otp_verify' | 'success_tick'>('credentials');

  // OTP State
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (authStep === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, otpTimer]);

  // Step 1: Submit Mobile & Password -> Trigger Dispatch Animation to Gmail
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }

    // Set estimated registered Gmail
    const maskedEmail = `user.${mobileNumber.slice(-4)}@gmail.com`;
    setGmailAddress(maskedEmail);

    setIsOtpSending(true);

    // eCommerce-style dispatch delay
    setTimeout(() => {
      setIsOtpSending(false);
      setAuthStep('otp_verify');
      setOtpTimer(30);

      // Light confetti celebration for OTP dispatch
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }, 900);
  };

  // Step 2: Submit OTP -> Trigger Verified Tick Animation & Auto-redirect
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      alert('Please enter the 4-digit verification code.');
      return;
    }

    // Show verified tick animation
    setAuthStep('success_tick');

    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.5 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 55,
          origin: { x: 0.1 },
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 55,
          origin: { x: 0.9 },
        });
      }, 300);
    } catch {
      // ignore
    }

    // Successfully log the user in and redirect to Agent Dashboard after 1.8 seconds
    setTimeout(() => {
      login(mobileNumber || '9876543210', 'Vikram Singh', gmailAddress || 'agent@safargo.in');
      loginAgent(mobileNumber || '9876543210');
      setCurrentView('agent');
    }, 1800);
  };

  // Demo auto-fill
  const handleQuickDemoFill = () => {
    setMobileNumber('9876543210');
    setPassword('Safar@2026');
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-8 px-4 sm:px-6">
      {/* SIMULATED SUBDOMAIN REDIRECT BROWSER BAR */}
      <div className="w-full max-w-md mb-4 bg-slate-900 text-slate-300 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs shadow-lg border border-slate-800">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-200 font-mono text-[11px] truncate">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-400 font-bold">https://</span>
            <span className="text-white font-extrabold">login.safargo.in</span>
            <span className="text-slate-400">/auth/v2/signin</span>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 shrink-0">
          SSL SECURE
        </span>
      </div>

      {/* MAIN AUTHENTICATION CARD */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-left relative">
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-7 text-white relative">
          <button
            onClick={() => setCurrentView('home')}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Return to Safar Go"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="text-center pt-1 space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider text-red-100">
              <Bus className="w-3.5 h-3.5" /> Safar Go Single Sign-On
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {authStep === 'credentials' && 'Welcome Back'}
              {authStep === 'forgot_password' && 'Reset Your Password'}
              {authStep === 'otp_verify' && 'Verify Security Code'}
              {authStep === 'success_tick' && 'Welcome Aboard!'}
            </h1>
            <p className="text-xs text-red-100">
              {authStep === 'credentials' && 'Sign in to access your tickets, refunds & discounts'}
              {authStep === 'forgot_password' && 'Enter your details to receive password recovery link'}
              {authStep === 'otp_verify' && 'Protecting your account with two-factor security'}
              {authStep === 'success_tick' && 'Preparing your dashboard...'}
            </p>
          </div>
        </div>

        {/* CARD BODY: DYNAMIC STEP TRANSITIONS */}
        <div className="p-6 sm:p-8">
          {/* ================= STEP 1: MOBILE & PASSWORD ================= */}
          {authStep === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              {/* Mobile Number Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 overflow-hidden transition-all bg-slate-50/50">
                  <span className="bg-slate-100 px-3.5 py-3 text-xs font-black text-slate-700 border-r border-slate-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit mobile"
                    className="w-full px-3.5 py-3 text-sm font-bold text-slate-900 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Password Field with Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthStep('forgot_password')}
                    className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 overflow-hidden transition-all bg-slate-50/50">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-3.5 pr-10 py-3 text-sm font-bold text-slate-900 focus:outline-none bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                  />
                  <span>Remember my login</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isOtpSending}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-75"
              >
                {isOtpSending ? (
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" />
                    Dispatching Security Code...
                  </span>
                ) : (
                  <>
                    <span>CONTINUE WITH SECURE OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Demo Fill Helper */}
              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  ⚡ Autofill Demo Credentials (+91 9876543210)
                </button>
              </div>
            </form>
          )}

          {/* ================= STEP 2: FORGOT PASSWORD FLOW ================= */}
          {authStep === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 leading-relaxed">
                Enter your registered mobile or email address. We will send a secure password reset link and verification code.
              </div>

              {forgotSubmitted ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-left space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-black text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Password Reset Link Sent!
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    We have dispatched a reset link to <strong className="font-mono">{forgotEmail || 'your Gmail address'}</strong>. Please check your inbox and spam folder.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotSubmitted(false);
                      setAuthStep('credentials');
                    }}
                    className="mt-2 text-xs font-bold text-red-600 hover:underline"
                  >
                    ← Back to Login
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!forgotEmail) {
                      alert('Please enter your email or mobile.');
                      return;
                    }
                    setForgotSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email or Mobile
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com or 9876543210"
                      className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    SEND PASSWORD RESET LINK
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthStep('credentials')}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= STEP 3: OTP VERIFICATION WITH ORDER-PLACED DISPATCH ANIMATION ================= */}
          {authStep === 'otp_verify' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* DISPATCH NOTIFICATION ANIMATION BANNER */}
              <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 text-left space-y-2 relative overflow-hidden shadow-xs">
                {/* Micro Animated Envelope / Pulse */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-200">
                      <Mail className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>OTP Sent to Your Gmail Address!</span>
                      <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                        CHECK NOW
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Dispatched to: <strong className="font-mono text-slate-800">{gmailAddress}</strong>
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold pt-0.5">
                      💡 Default Testing OTP: <span className="font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-slate-900 font-black">5892</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter 4-Digit Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="5892"
                    className="w-full text-center tracking-[0.5em] text-3xl font-black py-3 rounded-2xl border-2 border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-900 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>SUBMIT OTP & VERIFY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Resend & Timer */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setAuthStep('credentials')}
                    className="hover:text-slate-800 font-semibold"
                  >
                    ← Edit Mobile / Password
                  </button>

                  <div>
                    {otpTimer > 0 ? (
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Resend in {otpTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpTimer(30);
                          alert(`New OTP sent to ${gmailAddress}`);
                        }}
                        className="text-red-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ================= STEP 4: VERIFY TICK ANIMATION & SUCCESS MESSAGE ================= */}
          {authStep === 'success_tick' && (
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-300">
              {/* Animated Drawing Tick SVG with Expanding Pulse Ring */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 pulse-ring-effect pointer-events-none" />
                <div className="absolute w-20 h-20 rounded-full bg-emerald-500/25 animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />

                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 relative z-10">
                  <svg
                    className="w-12 h-12"
                    viewBox="0 0 52 52"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="animate-checkmark-circle"
                      cx="26"
                      cy="26"
                      r="24"
                      stroke="white"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      className="animate-checkmark-check"
                      d="M15 27L22 34L37 19"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Exact Success Confirmation Message */}
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authentication Verified
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  You Have Successfully Logged In!
                </h2>
                <p className="text-xs text-slate-500">
                  Welcome to Safar Go. Redirecting to your Agent Dashboard...
                </p>
              </div>

              <div className="w-32 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          )}

          {/* Privacy & Trust Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Protected by Safar Go Enterprise Security & 256-Bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
};
