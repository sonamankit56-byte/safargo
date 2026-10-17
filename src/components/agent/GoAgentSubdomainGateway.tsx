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
  Crown,
  Calendar,
  Sparkles,
  Phone
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
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 flex flex-col justify-between font-sans selection:bg-[#0A2885] selection:text-white">
      
      {/* Top Jio-Style Utility & Header */}
      <div className="bg-[#05184B] text-slate-300 text-xs border-b border-white/10 hidden sm:block">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          <div className="flex items-center gap-4 text-xs font-bold text-white">
            <span>GO Agent Business Terminal</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-amber-400">agent.safargo.in</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#FF6500]" />
              <span>हेल्पलाइन: 1800-SAFARGO</span>
            </span>
            <a
              href="https://help.safargo.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition"
            >
              सहायता केंद्र
            </a>
          </div>
        </div>
      </div>

      <header className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-[#071E66] bg-[#0A2885] text-white sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <Go3DUltraLogo size="sm" showBadge={false} interactive={false} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
              GO Agent Enterprise
            </span>
            <span className="text-xs font-mono text-blue-100">
              agent.safargo.in
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={buildSubdomainUrl('main')}
            className="text-xs text-blue-100 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 flex items-center gap-1 transition"
          >
            <span>मुख्य वेबसाइट</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="px-5 py-2 rounded-full bg-white text-[#0A2885] hover:bg-blue-50 font-black text-xs shadow-md transition cursor-pointer"
          >
            एजेंट लॉगिन
          </button>
        </div>
      </header>

      {/* Main Hero & Features */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 sm:py-16 flex flex-col items-center justify-center text-center space-y-8 animate-fadeIn">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0A2885] text-xs font-bold shadow-xs">
          <Crown className="w-4 h-4 text-amber-500" />
          <span>अधिकृत ग्रामीण CSC बस टिकटिंग एवं रोजगार पोर्टल [agent.safargo.in]</span>
        </div>

        {/* 3D Big Logo */}
        <div className="py-1">
          <Go3DUltraLogo size="lg" showBadge={true} interactive={true} />
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
            SafarGo GO Agent टर्मिनल
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            हर कन्फर्म बस टिकट पर <strong>फ्लैट ₹20 नकद कमीशन</strong> तुरंत Go Wallet में! <strong>हर रविवार साप्ताहिक सीधा बैंक/UPI पेआउट</strong>, शून्य निवेश एवं 5-मिनट फास्ट अप्रूवल।
          </p>
        </div>

        {/* Jio-Style 3 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full text-left text-xs">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md space-y-2.5 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              तत्काल क्रेडिट
            </span>
            <h3 className="font-black text-slate-900 text-sm">Go Instant Add Money</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              बिना किसी इंतजार के सीधे QR से वॉलेट में पैसे जोड़ें और निर्बाध बस टिकटें बुक करें।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md space-y-2.5 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              गारंटीड कमाई
            </span>
            <h3 className="font-black text-slate-900 text-sm">फ्लैट ₹20 कमीशन प्रति सीट</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              प्रत्येक टिकट बुकिंग पर ₹20 की सीधी नकद कमाई Go Wallet में। रविवार को स्वतः पेआउट।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md space-y-2.5 transition">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0A2885] flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] uppercase font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              लाइव टिकट
            </span>
            <h3 className="font-black text-slate-900 text-sm">डिजिटल ई-टिकट पास</h3>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              कन्फर्म टिकट का लाइव डिजिटल पास, QR कोड व 1-क्लिक WhatsApp शेयर और प्रिंट सुविधा।
            </p>
          </div>
        </div>

        {/* Jio-Style Rounded Pill CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto pt-2">
          <button
            onClick={() => {
              setAuthMode('login');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0A2885] hover:bg-[#071E66] text-white font-black text-xs sm:text-sm shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>एजेंट टर्मिनल में लॉगिन करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setAuthMode('register');
              setIsAuthModalOpen(true);
            }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FF6500] hover:bg-[#e65c00] text-white font-black text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer"
          >
            मुफ्त GO एजेंट रजिस्ट्रेशन
          </button>
        </div>

      </main>

      {/* Jio Deep Navy Footer */}
      <footer className="p-4 text-center text-xs text-slate-400 bg-[#05184B] border-t border-white/10">
        © {new Date().getFullYear()} SafarGo Mobility Network • GO Agent Enterprise Terminal [agent.safargo.in]
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
