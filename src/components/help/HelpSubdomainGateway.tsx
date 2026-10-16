import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { GoAgentSupportDesk } from '../agent/GoAgentSupportDesk';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  LifeBuoy,
  ShieldCheck,
  MessageSquare,
  Clock,
  Phone,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const HelpSubdomainGateway: React.FC = () => {
  const { currentUser, role } = useAuth();
  const { settings } = useData();

  const supportPhone = settings?.support_whatsapp || '919876543210';
  const whatsappUrl = `https://wa.me/${supportPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
    'नमस्ते SafarGo सपोर्ट टीम, मुझे एजेंट पोर्टल संबंधी सहायता चाहिए।'
  )}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Header */}
      <header className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" />
          <div className="h-6 w-px bg-slate-800 hidden sm:block" />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                24x7 एजेंट हेल्प एवं सपोर्ट केंद्र
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                24h समाधान गारंटी
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400">help.safargo.in</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={buildSubdomainUrl('agent')}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400/50"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">GO एजेंट डैशबोर्ड</span>
            <span className="sm:hidden">डैशबोर्ड</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-950 flex items-center gap-1.5 transition px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-slate-950" />
            <span className="hidden sm:inline">WhatsApp हेल्पलाइन</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* Hero SLA Guarantee Banner */}
      <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border-b border-blue-900/30 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h1 className="text-lg sm:text-xl font-black text-white">
                SafarGo आधिकारिक एजेंट सहायता डेस्क (24-Hour SLA)
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              बस टिकट, वॉलेट पेआउट, KYC और तकनीकी समस्याओं के लिए अपना सहायता टिकट दर्ज करें। SafarGo एडमिन टीम द्वारा <strong>24 घंटे के भीतर 100% समाधान की गारंटी</strong> दी जाती है।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">औसत समाधान समय</span>
              <strong className="text-sm font-black text-emerald-400">4 से 6 घंटे</strong>
            </div>
            <div className="px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 block">संतुष्टि दर</span>
              <strong className="text-sm font-black text-amber-400">99.8%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Support Desk Content */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1">
        <GoAgentSupportDesk />
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800/80 text-center text-xs text-slate-500 bg-slate-950">
        SafarGo 24x7 एजेंट समाधान डेस्क • आधिकारिक सबडोमेन help.safargo.in • हेल्पलाइन: +91 {supportPhone}
      </footer>
    </div>
  );
};
