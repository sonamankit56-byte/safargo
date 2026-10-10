import React, { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import {
  X,
  Printer,
  CheckCircle,
  Phone,
  MapPin,
  Bus,
  ShieldCheck,
  Sparkles,
  Download
} from 'lucide-react';

interface AgentPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgentPosterModal: React.FC<AgentPosterModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { settings } = useData();
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !currentUser) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Controls Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-orange-500 text-white px-2.5 py-0.5 rounded-full uppercase">
              Free Shop Poster
            </span>
            <span className="text-xs text-slate-300 font-bold">
              आपकी दुकान का आधिकारिक SafarGo पोस्टर (A4 Printable)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>पोस्टर प्रिंट करें (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Poster Area */}
        <div className="p-6 sm:p-10 bg-slate-100 flex justify-center overflow-auto">
          <div
            ref={printAreaRef}
            className="w-full max-w-[620px] bg-white rounded-3xl p-8 sm:p-10 shadow-xl border-4 border-orange-500 space-y-6 text-slate-900 relative overflow-hidden print:m-0 print:border-4 print:shadow-none"
          >
            {/* Ambient Background Watermark */}
            <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

            {/* Poster Header */}
            <div className="text-center space-y-3 border-b-2 border-dashed border-orange-200 pb-6">
              <div className="flex justify-center">
                <SafarGoLogo size="lg" variant="dark" showTagline={false} />
              </div>
              
              <div className="inline-block px-4 py-1 rounded-full bg-orange-500 text-white text-xs font-black tracking-widest uppercase shadow-sm">
                🇮🇳 भारत सरकार अधिकृत जन सेवा केंद्र बस टिकटिंग पार्टनर
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                यहाँ सभी रूटों की स्लीपर व AC बस टिकट बुक होती हैं
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-bold">
                "अब हर सफर होगा आसान — 15 मिनट में कन्फर्म PNR टिकट!"
              </p>
            </div>

            {/* Popular Routes Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-black text-orange-600 uppercase tracking-wider text-center">
                ★ प्रमुख बस मार्ग (Major Bus Routes Available) ★
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-center font-bold">
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                  दिल्ली / NCR ➔ लखनऊ / कानपुर
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                  सूरत / अहमदाबाद ➔ गोरखपुर
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                  जयपुर / अजमेर ➔ वाराणसी / पटना
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                  मुंबई / पुणे ➔ प्रयागराज / रीवा
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                  लुधियाना / चंडीगढ़ ➔ आजमगढ़
                </div>
                <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                  सीतापुर / हरदोई ➔ दिल्ली स्लीपर
                </div>
              </div>
            </div>

            {/* Agent Authorized Identity Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-amber-400 shadow-md">
              <div className="flex items-center gap-4">
                {/* Agent Avatar with Verified Tick */}
                <div className="relative">
                  {currentUser.avatar_url ? (
                    <img
                      src={currentUser.avatar_url}
                      alt={currentUser.full_name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white font-black text-2xl flex items-center justify-center border-2 border-amber-400">
                      {currentUser.full_name.charAt(0)}
                    </div>
                  )}

                  {currentUser.photo_verified && (
                    <div
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-md"
                      title="SafarGo Verified Agent"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="text-left space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-base text-amber-300">
                      {currentUser.shop_name || 'अधिकृत बस बुकिंग केंद्र'}
                    </span>
                  </div>
                  <div className="text-xs text-white font-bold flex items-center gap-1">
                    <span>संचालक: {currentUser.full_name}</span>
                    {currentUser.photo_verified && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-black border border-emerald-500/40">
                        ✓ KYC Verified
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span>{currentUser.address}, {currentUser.city} ({currentUser.district})</span>
                  </div>
                </div>
              </div>

              <div className="text-center sm:text-right bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">सीट बुकिंग हेल्पलाइन</span>
                <span className="text-base font-black text-amber-300 flex items-center gap-1 justify-center sm:justify-end">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  {currentUser.mobile}
                </span>
                <span className="text-[10px] text-slate-300 font-mono block">
                  एजेंट कोड: {currentUser.referral_code}
                </span>
              </div>
            </div>

            {/* Key Customer Benefits */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold text-slate-700 pt-1">
              <div className="p-2 rounded-xl bg-slate-100 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% असली बस PNR</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 flex flex-col items-center gap-1">
                <Bus className="w-4 h-4 text-blue-600" />
                <span>महिला/फैमिली स्पेशल सीट</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>तुरंत ई-टिकट प्रिंट आउट</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-slate-200 text-[10px] text-slate-500">
              SafarGo ग्रामीण बस बुकिंग नेटवर्क • अधिकृत जन सेवा केंद्र शाखा • हेल्पलाइन: {settings.support_whatsapp}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
