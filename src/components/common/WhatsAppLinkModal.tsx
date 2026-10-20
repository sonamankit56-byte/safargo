import React, { useState, useEffect } from 'react';
import {
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  Phone,
  KeyRound,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  LogOut
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  getLinkedWhatsAppNumber,
  isWhatsAppLinked,
  setLinkedWhatsAppNumber,
  unlinkWhatsAppNumber,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  sanitizeMobileNumber
} from '../../lib/whatsappService';

interface WhatsAppLinkModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: (linkedNumber: string) => void;
}

export const WhatsAppLinkModal: React.FC<WhatsAppLinkModalProps> = ({
  isOpen: propsIsOpen,
  onClose: propsOnClose,
  onSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [otpTimer, setOtpTimer] = useState(45);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [linkedNumber, setLinkedNumber] = useState('');
  const [isLinked, setIsLinked] = useState(false);

  // Sync with prop isOpen or custom browser events
  useEffect(() => {
    if (propsIsOpen !== undefined) {
      setIsOpen(propsIsOpen);
    }
  }, [propsIsOpen]);

  // Load current linked state
  const refreshLinkedState = () => {
    const num = getLinkedWhatsAppNumber();
    const linked = isWhatsAppLinked();
    setLinkedNumber(num);
    setIsLinked(linked);
    if (num && !mobile) {
      setMobile(num);
    }
  };

  useEffect(() => {
    refreshLinkedState();

    const handleOpen = () => {
      refreshLinkedState();
      setIsOpen(true);
      setErrorMessage('');
      setSuccessMessage('');
    };

    window.addEventListener('safargo_open_whatsapp_link_modal', handleOpen);
    window.addEventListener('safargo_whatsapp_linked', refreshLinkedState);
    window.addEventListener('safargo_whatsapp_unlinked', refreshLinkedState);

    return () => {
      window.removeEventListener('safargo_open_whatsapp_link_modal', handleOpen);
      window.removeEventListener('safargo_whatsapp_linked', refreshLinkedState);
      window.removeEventListener('safargo_whatsapp_unlinked', refreshLinkedState);
    };
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (isOtpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  const handleClose = () => {
    setIsOpen(false);
    if (propsOnClose) propsOnClose();
  };

  const handleSendCode = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    const clean = sanitizeMobileNumber(mobile);

    if (!clean || clean.length !== 10) {
      setErrorMessage('कृपया सही 10-अंकीय भारतीय WhatsApp मोबाइल नंबर दर्ज करें (उदा. 9826012345)');
      return;
    }

    setIsSending(true);

    try {
      const res = await sendWhatsAppOtp(clean, 'नंबर लिंकिंग व ऑल-सर्विस सत्यापन');
      setIsSending(false);
      setIsOtpSent(true);
      setActiveCode(res.otpCode);
      setDirectUrl(res.directWebUrl);
      setOtpTimer(45);
      setSuccessMessage(`WhatsApp OTP कोड तैयार है! नीचे "WhatsApp खोलें" बटन पर क्लिक करें।`);

      // Trigger popup
      try {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      } catch {}
    } catch (err: any) {
      setIsSending(false);
      setErrorMessage(err?.message || 'WhatsApp पर कोड भेजने में समस्या हुई। कृपया पुनः प्रयास करें।');
    }
  };

  const handleVerify = () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!enteredOtp || enteredOtp.trim().length < 4) {
      setErrorMessage('कृपया WhatsApp में प्राप्त 6-अंकीय OTP कोड दर्ज करें।');
      return;
    }

    const clean = sanitizeMobileNumber(mobile);
    const result = verifyWhatsAppOtp(enteredOtp, clean);

    if (result.success) {
      setLinkedWhatsAppNumber(clean);
      refreshLinkedState();
      setSuccessMessage(`🎉 बधाई! आपका WhatsApp नंबर (+91 ${clean}) सफलतापूर्वक लिंक और सत्यापित हो गया है! अब सभी सर्विसेज में WhatsApp OTP चालू है।`);
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.5 } });
      } catch {}
      if (onSuccess) onSuccess(clean);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleUnlink = () => {
    if (window.confirm('क्या आप अपना लिंक्ड WhatsApp नंबर हटाना चाहते हैं?')) {
      unlinkWhatsAppNumber();
      refreshLinkedState();
      setIsOtpSent(false);
      setEnteredOtp('');
      setSuccessMessage('WhatsApp नंबर अनलिंक कर दिया गया है।');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
                <MessageCircle className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">WhatsApp OTP व नंबर लिंकिंग</h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isLinked
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {isLinked ? '🟢 लिंक्ड व सक्रिय' : '🟡 लिंक आवश्यक'}
                </span>
              </div>
              <p className="text-xs text-slate-400">सभी सर्विसेज में 100% फ्री WhatsApp OTP वेरिफिकेशन</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Status Box */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            isLinked
              ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
              : 'bg-slate-800/60 border-slate-700 text-slate-300'
          }`}>
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${isLinked ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-white">
                  {isLinked ? `लिंक्ड नंबर: +91 ${linkedNumber}` : 'कोई WhatsApp नंबर लिंक्ड नहीं'}
                </p>
                {isLinked && (
                  <button
                    onClick={handleUnlink}
                    className="text-[11px] font-bold text-rose-400 hover:underline flex items-center gap-1"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>अनलिंक करें</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {isLinked
                  ? 'यह नंबर SafarGo के साथ 100% सत्यापित है। एजेंट लॉगिन, बस बुकिंग और रिचार्ज के सभी OTP सीधे इस WhatsApp पर आएंगे।'
                  : 'अपना व्यक्तिगत WhatsApp नंबर लिंक करें। SMS API के पैसे बचाएं और सीधे WhatsApp पर त्वरित OTP प्राप्त करें।'}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>आपका 10-अंकीय WhatsApp नंबर:</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="98260XXXXX"
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Send Code Action */}
            <button
              type="button"
              onClick={handleSendCode}
              disabled={isSending}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>WhatsApp OTP कोड भेजा जा रहा है...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isOtpSent ? 'नया WhatsApp OTP कोड भेजें (Resend)' : '📲 WhatsApp पर रियल OTP कोड भेजें'}
                  </span>
                </>
              )}
            </button>

            {/* Step 2: Code Sent State & Verification */}
            {isOtpSent && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp OTP तैयार है</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded font-bold">
                    {otpTimer > 0 ? `${otpTimer}s मान्य` : 'एक्सपायर'}
                  </span>
                </div>

                {/* 1-Click WhatsApp Direct Open Button */}
                {directUrl && (
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🟢 WhatsApp खोलें और OTP कोड देखें (Open in WhatsApp)</span>
                  </a>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    WhatsApp में प्राप्त 6-अंकीय OTP कोड दर्ज करें:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full text-center tracking-widest text-xl font-black py-2.5 bg-slate-900 border border-emerald-400 rounded-xl text-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleVerify}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>सत्यापित करें व SafarGo से लिंक करें</span>
                </button>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 text-emerald-200 text-xs rounded-xl flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">
            SafarGo 100% Free WhatsApp Mobility Protocol
          </span>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition"
          >
            पूर्ण करें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
