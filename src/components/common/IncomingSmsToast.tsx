import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, X, ArrowDownToLine, CheckCircle2, Wallet, MessageCircle, ExternalLink } from 'lucide-react';

interface SmsDetail {
  sender: string;
  mobile: string;
  otpCode: string;
  text: string;
}

interface WithdrawalDetail {
  amount: number;
  destination: string;
  utr: string;
  agentName: string;
  timestamp: string;
  text: string;
}

interface WhatsAppDetail {
  mobile: string;
  otpCode: string;
  directWebUrl: string;
  text: string;
  purpose?: string;
}

export const IncomingSmsToast: React.FC = () => {
  const [activeSms, setActiveSms] = useState<SmsDetail | null>(null);
  const [activeWithdrawal, setActiveWithdrawal] = useState<WithdrawalDetail | null>(null);
  const [activeWhatsApp, setActiveWhatsApp] = useState<WhatsAppDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [waCopied, setWaCopied] = useState(false);

  useEffect(() => {
    const handleSms = (e: any) => {
      if (e.detail) {
        setActiveSms(e.detail);
        setCopied(false);

        // Auto dismiss after 12 seconds
        const timer = setTimeout(() => {
          setActiveSms(null);
        }, 12000);
        return () => clearTimeout(timer);
      }
    };

    const handleWithdrawal = (e: any) => {
      if (e.detail) {
        setActiveWithdrawal(e.detail);

        // Auto dismiss after 12 seconds
        const timer = setTimeout(() => {
          setActiveWithdrawal(null);
        }, 12000);
        return () => clearTimeout(timer);
      }
    };

    const handleWhatsApp = (e: any) => {
      if (e.detail) {
        setActiveWhatsApp(e.detail);
        setWaCopied(false);

        // Auto dismiss after 20 seconds
        const timer = setTimeout(() => {
          setActiveWhatsApp(null);
        }, 20000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('safargo_incoming_sms', handleSms);
    window.addEventListener('safargo_withdrawal_alert', handleWithdrawal);
    window.addEventListener('safargo_whatsapp_otp_sent', handleWhatsApp);

    return () => {
      window.removeEventListener('safargo_incoming_sms', handleSms);
      window.removeEventListener('safargo_withdrawal_alert', handleWithdrawal);
      window.removeEventListener('safargo_whatsapp_otp_sent', handleWhatsApp);
    };
  }, []);

  const handleCopy = () => {
    if (activeSms) {
      navigator.clipboard.writeText(activeSms.otpCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWaCopy = () => {
    if (activeWhatsApp) {
      navigator.clipboard.writeText(activeWhatsApp.otpCode);
      setWaCopied(true);
      setTimeout(() => setWaCopied(false), 2000);
    }
  };

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-md space-y-2 pointer-events-none">
      {/* 0. REAL-TIME WHATSAPP OTP BANNER */}
      {activeWhatsApp && (
        <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-500/80 animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 shadow-inner">
              <MessageCircle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                    🟢 WhatsApp OTP • SafarGo
                  </span>
                  <span className="text-[10px] text-slate-400">• अभी</span>
                </div>
                <button
                  onClick={() => setActiveWhatsApp(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                आपके WhatsApp (+91 {activeWhatsApp.mobile}) पर सत्यापन कोड भेजा गया है:
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className="text-sm font-mono font-black text-amber-400 tracking-widest bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700">
                  {activeWhatsApp.otpCode}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleWaCopy}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg transition flex items-center gap-1 border border-slate-700"
                  >
                    {waCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{waCopied ? 'कॉपी हुआ!' : 'कॉपी'}</span>
                  </button>

                  {activeWhatsApp.directWebUrl && (
                    <a
                      href={activeWhatsApp.directWebUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg transition flex items-center gap-1 shadow-md"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>WhatsApp खोलें</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. REAL-TIME WITHDRAWAL NOTIFICATION BANNER */}
      {activeWithdrawal && (
        <div className="pointer-events-auto bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-500/80 animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5 shadow-inner">
              <Wallet className="w-6 h-6 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                    ⚡ विड्रॉल ट्रांसफर सूचना • SafarGo Payout
                  </span>
                  <span className="text-[10px] text-slate-400">• अभी</span>
                </div>
                <button
                  onClick={() => setActiveWithdrawal(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-black text-emerald-300 tracking-tight">
                  ₹{activeWithdrawal.amount.toFixed(2)}
                </span>
                <span className="text-[11px] font-bold text-slate-300">
                  सफलतापूर्वक ट्रांसफर हुआ
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
                {activeWithdrawal.text}
              </p>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="font-mono text-amber-300 font-bold bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                  {activeWithdrawal.utr}
                </span>

                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>बैंक को भेजा गया</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REAL-TIME MOBILE SMS OTP BANNER */}
      {activeSms && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 flex items-start gap-3 animate-bounce">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                  नया SMS • {activeSms.sender}
                </span>
                <span className="text-[10px] text-slate-400">• अभी</span>
              </div>
              <button
                onClick={() => setActiveSms(null)}
                className="text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
              {activeSms.text}
            </p>

            <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-mono font-black text-amber-400 tracking-widest bg-slate-800 px-2 py-0.5 rounded-md">
                OTP: {activeSms.otpCode}
              </span>

              <button
                onClick={handleCopy}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'कॉपी हो गया!' : 'OTP कॉपी करें'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
