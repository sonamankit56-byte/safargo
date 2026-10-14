import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoAgentDashboard } from './GoAgentDashboard';
import { GoAgentAuthModal } from './GoAgentAuthModal';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  ShieldCheck,
  Zap,
  TrendingUp,
  Award,
  Wallet,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Crown
} from 'lucide-react';

export const GoAgentSubdomainGateway: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // If already logged in as agent, render the isolated 3D dashboard directly!
  if (currentUser && role === 'agent') {
    return (
      <GoAgentDashboard
        onNavigateHome={() => {
          window.location.href = buildSubdomainUrl('main');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
      
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-amber-400/30 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Go3DUltraLogo size="sm" showBadge={false} interactive={false} />
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              GO Agent 3D Terminal
            </span>
            <span className="text-xs font-mono text-slate-400">
              agent.safargo.in
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
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
          >
            एजेंट लॉगिन
          </button>
        </div>
      </header>

      {/* Main Hero & Features */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/40 text-amber-300 text-xs font-black shadow-lg">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>अधिकृत ग्रामीण CSC बस टिकटिंग एवं रोजगार पोर्टल [agent.safargo.in]</span>
        </div>

        {/* 3D Big Logo */}
        <div className="py-2">
          <Go3DUltraLogo size="lg" showBadge={true} interactive={true} />
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            GO Agent 3D Ultra Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            हर कन्फर्म बस टिकट पर <strong>फ्लैट ₹20 नकद कमीशन</strong> तुरंत Go Wallet में! 280 टिकट पूरे करने पर <strong>₹10,000 फिक्स्ड मासिक वेतन</strong>, 3-मिनट लाइव ऑपरेटर अप्रूवल एवं Go Instant Add Money।
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-amber-400">⚡ 0-Second Credit</span>
            <h3 className="font-bold text-white text-sm">Go Instant Add Money</h3>
            <p className="text-slate-400 text-[11px]">बिना एडमिन अप्रूवल के तुरंत वॉलेट में पैसे जोड़ें और बिना रुके टिकट बुक करें।</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-emerald-400">💰 गारंटीड कमाई</span>
            <h3 className="font-bold text-white text-sm">फ्लैट ₹20 कमीशन</h3>
            <p className="text-slate-400 text-[11px]">प्रत्येक कन्फर्म टिकट पर ₹20 कमीशन सीधे Go Wallet में, तुरंत निकासी उपलब्ध।</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-indigo-400">🟢 लाइव टिकट</span>
            <h3 className="font-bold text-white text-sm">डिजिटल ग्रीन कार्ड</h3>
            <p className="text-slate-400 text-[11px]">कन्फर्म टिकट का लाइव डिजिटल पास, QR कोड व 1-क्लिक WhatsApp शेयर।</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl transition active:scale-95 cursor-pointer"
          >
            एजेंट 3D पोर्टल में लॉगिन करें ➔
          </button>

          <button
            onClick={() => {
              setAuthMode('register');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition cursor-pointer"
          >
            नया GO एजेंट रजिस्ट्रेशन
          </button>
        </div>

      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        SafarGo GO Special Agent Network • Dedicated Subdomain Environment [agent.safargo.in]
      </footer>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <GoAgentAuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

    </div>
  );
};
