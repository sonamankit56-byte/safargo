import React, { useState, useEffect } from 'react';
import { Check, X, Wallet, MessageCircle, ExternalLink, ShieldCheck } from 'lucide-react';

interface WithdrawalDetail {
  amount: number;
  destination: string;
  utr: string;
  agentName: string;
  timestamp: string;
  text: string;
}

interface WhatsAppNotification {
  mobile: string;
  directWebUrl: string;
  purpose?: string;
}

export const IncomingSmsToast: React.FC = () => {
  const [activeWithdrawal, setActiveWithdrawal] = useState<WithdrawalDetail | null>(null);
  const [activeWhatsAppNotice, setActiveWhatsAppNotice] = useState<WhatsAppNotification | null>(null);

  useEffect(() => {
    const handleWithdrawal = (e: any) => {
      if (e.detail) {
        setActiveWithdrawal(e.detail);
        const timer = setTimeout(() => {
          setActiveWithdrawal(null);
        }, 12000);
        return () => clearTimeout(timer);
      }
    };

    const handleWhatsApp = (e: any) => {
      if (e.detail) {
        // Notice ONLY: Never show the secret OTP code on the screen!
        setActiveWhatsAppNotice({
          mobile: e.detail.mobile,
          directWebUrl: e.detail.directWebUrl,
          purpose: e.detail.purpose
        });

        const timer = setTimeout(() => {
          setActiveWhatsAppNotice(null);
        }, 15000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('safargo_withdrawal_alert', handleWithdrawal);
    window.addEventListener('safargo_whatsapp_otp_sent', handleWhatsApp);

    return () => {
      window.removeEventListener('safargo_withdrawal_alert', handleWithdrawal);
      window.removeEventListener('safargo_whatsapp_otp_sent', handleWhatsApp);
    };
  }, []);

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] w-[94%] max-w-md space-y-2 pointer-events-none">
      {/* 0. WHATSAPP DISPATCH NOTICE (Zero OTP Code Leaks) */}
      {activeWhatsAppNotice && (
        <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-500 animate-bounce">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <MessageCircle className="w-5 h-5 animate-pulse" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">
                    🟢 WhatsApp OTP भेजा गया
                  </span>
                  <span className="text-[10px] text-slate-400">• अभी</span>
                </div>
                <button
                  onClick={() => setActiveWhatsAppNotice(null)}
                  className="text-slate-400 hover:text-white p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                आपके WhatsApp नंबर (<strong>+91 {activeWhatsAppNotice.mobile}</strong>) पर 6-अंकीय सत्यापन कोड भेजा गया है।
              </p>

              <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>WhatsApp चैट चेक करें</span>
                </span>

                {activeWhatsAppNotice.directWebUrl && (
                  <a
                    href={activeWhatsAppNotice.directWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-md"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>WhatsApp खोलें</span>
                  </a>
                )}
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
                  <Check className="w-3.5 h-3.5" />
                  <span>बैंक को भेजा गया</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
