import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PromoterDashboard } from './PromoterDashboard';
import { PromoterApplicationModal } from './PromoterApplicationModal';
import { AuthModal } from '../auth/AuthModal';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  Award,
  DollarSign,
  ShieldCheck,
  Users,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Crown
} from 'lucide-react';

export const PromoterSubdomainGateway: React.FC = () => {
  const { currentUser, role, isPromoter } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If already logged in as promoter, show isolated Promoter Dashboard!
  if (currentUser && (role === 'promoter' || isPromoter)) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
        {/* Dedicated Promoter Subdomain Header */}
        <header className="p-4 sm:p-5 border-b border-indigo-500/30 bg-slate-950 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafarGoLogo size="sm" variant="light" showTagline={false} />
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                Promoter Partner Desk
              </span>
              <span className="text-xs font-mono text-slate-400">
                promoter.safargo.in
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={buildSubdomainUrl('main')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition px-3 py-1.5 rounded-xl border border-slate-800"
            >
              <span>पब्लिक पोर्टल</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <PromoterDashboard onNavigate={(tab) => {
            if (tab === 'home') {
              window.location.href = buildSubdomainUrl('main');
            }
          }} />
        </main>

        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950">
          SafarGo Promoter Partner Desk • Isolated Subdomain [promoter.safargo.in]
        </footer>
      </div>
    );
  }

  // Gateway for unauthenticated or non-promoter visitors on promoter.safargo.in
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-indigo-500/30 bg-slate-950 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" showTagline={false} />
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
              Promoter Partner Program
            </span>
            <span className="text-xs font-mono text-slate-400">
              promoter.safargo.in
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={buildSubdomainUrl('main')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>पब्लिक पोर्टल</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md transition cursor-pointer"
          >
            प्रमोटर लॉगिन
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/40 text-indigo-300 text-xs font-black shadow-lg">
          <Crown className="w-4 h-4 text-indigo-400" />
          <span>नेटवर्क में केवल 5 एक्सक्लूसिव पद [promoter.safargo.in]</span>
        </div>

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            सफ़ारगो प्रमोटर पार्टनर प्रोग्राम
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ₹15,000 फिक्स्ड मासिक वेतन + 100% फीस रिफंड गारंटी (₹648 वापस) + सुपर एडमिन के नीचे <strong>एजेंट रजिस्ट्रेशन व KYC अप्रूवल डेस्क</strong> + लोकल मर्चेंट पैकेज लिस्टिंग।
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-indigo-400">💼 फिक्स्ड सैलरी</span>
            <h3 className="font-bold text-white text-sm">₹15,000 / माह</h3>
            <p className="text-slate-400 text-[11px]">मासिक निर्धारित वेतन सीधे आपके बैंक अथवा Go Wallet में।</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-amber-400">🛡️ अप्रूवल अधिकार</span>
            <h3 className="font-bold text-white text-sm">CSC एजेंट व KYC अप्रूवल</h3>
            <p className="text-slate-400 text-[11px]">सुपर एडमिन के साथ मिलकर नए एजेंटों के डाक्यूमेंट्स व KYC वेरीफाई करें।</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-emerald-400">✨ 100% रिफंड</span>
            <h3 className="font-bold text-white text-sm">गारंटीड फीस रिफंड</h3>
            <p className="text-slate-400 text-[11px]">लक्ष्य पूर्ण होने पर पूरी आवेदन फीस ₹648 वापस क्रेडिट होगी।</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-xl transition active:scale-95 cursor-pointer"
          >
            प्रमोटर पद हेतु आवेदन करें (₹149 UTR) ➔
          </button>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition cursor-pointer"
          >
            प्रमोटर लॉगिन (Existing Partner)
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        SafarGo Promoter Partner Network • Isolated Subdomain Environment [promoter.safargo.in]
      </footer>

      {isApplyModalOpen && (
        <PromoterApplicationModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab="promoter_login"
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
};
