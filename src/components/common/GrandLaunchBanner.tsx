import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Clock,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Store,
  Crown,
  Bell,
  Calendar,
  Lock
} from 'lucide-react';
import { Go3DLogoBadge } from '../wallet/GoWalletHub';

interface GrandLaunchBannerProps {
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
}

export const GrandLaunchBanner: React.FC<GrandLaunchBannerProps> = ({
  onOpenRegister,
  onOpenLogin,
}) => {
  // Target Grand Launch Date: 15 October 2026, 09:00:00 IST
  const launchTimestamp = new Date('2026-10-15T09:00:00+05:30').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLaunched: boolean;
  }>({ days: 1, hours: 23, minutes: 1, seconds: 15, isLaunched: false });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diff = launchTimestamp - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLaunched: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isLaunched: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [launchTimestamp]);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border-2 border-amber-400 shadow-2xl overflow-hidden my-4">
      {/* 3D Ambient Light Orbs */}
      <div className="absolute -top-28 -left-28 w-80 h-80 bg-orange-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-28 w-80 h-80 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column: Launch Header & Agent Call-To-Action */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 flex items-center gap-1.5 shadow-md shadow-orange-500/30 animate-pulse">
              <Rocket className="w-3.5 h-3.5" /> 15 अक्टूबर 2026: सफ़ारगो महा-लॉन्च (Grand Launch)
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
              🟢 प्री-लॉन्च रजिस्ट्रेशन चालू है!
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight">
              हम आ रहे हैं! <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-emerald-300 bg-clip-text text-transparent">15 अक्टूबर</span> को SafarGo का आधिकारिक शुभारंभ!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              <strong>मध्य प्रदेश व पूरे भारत के सीएससी एजेंट्स, स्थानीय दुकानदार और प्रमोटर साथी तैयार हो जाएं!</strong> 15 अक्टूबर को SafarGo लाइव हो रहा है। अभी प्री-लॉन्च रजिस्ट्रेशन खुला है — अपनी दुकान व आईडी तुरंत पंजीकृत करें ताकि 15 अक्टूबर को सबसे पहले बुकिंग और कमाई शुरू कर सकें!
            </p>
          </div>

          {/* Quick Perks Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>₹19+ प्रति टिकट तत्काल कमीशन</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Crown className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3D Go Wallet लाइव पेआउट</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-400 shrink-0" />
              <span>15-मिनट दुकान डिलीवरी बिक्री</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-400 shrink-0" />
              <span>लॉगिन 15 अक्टूबर से लाइव</span>
            </div>
          </div>
        </div>

        {/* Right Column: 15 October Countdown Clock Box */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-400/50 shadow-2xl space-y-4 shrink-0 min-w-[310px] text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              15 अक्टूबर महा-लॉन्च काउंटडाउन
            </span>
          </div>

          {/* 4 Clock Boxes: Days : Hours : Minutes : Seconds */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-amber-400/30">
              <div className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {pad(timeLeft.days)}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">दिन (Days)</span>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-amber-400/30">
              <div className="text-2xl sm:text-3xl font-black font-mono text-orange-400">
                {pad(timeLeft.hours)}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">घंटे (Hrs)</span>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-amber-400/30">
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {pad(timeLeft.minutes)}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">मिनट (Mins)</span>
            </div>

            <div className="bg-slate-950/80 rounded-2xl p-2.5 border border-amber-400/30">
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400 animate-pulse">
                {pad(timeLeft.seconds)}
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block mt-0.5">सेकंड (Secs)</span>
            </div>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-3 text-left space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>लॉन्च तिथि: 15 अक्टूबर 2026, सुबह 09:00 बजे</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              ⚠️ <strong>लॉगिन केवल 15 अक्टूबर से शुरू होगा।</strong> वर्तमान में सभी एजेंटों व दुकानदारों के लिए <strong>प्री-रजिस्ट्रेशन खुला है</strong>!
            </p>
          </div>

          {/* Action CTA Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={onOpenRegister}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
            >
              <Rocket className="w-4 h-4" />
              <span>📝 अभी रजिस्ट्रेशन करें (Register Open Now) ➔</span>
            </button>

            {onOpenLogin && (
              <button
                onClick={onOpenLogin}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
              >
                सुपर एडमिन / अधिकृत पार्टनर लॉगिन (15 Oct)
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
