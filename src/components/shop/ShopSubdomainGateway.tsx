import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShopkeeperPortal } from './ShopkeeperPortal';
import { AuthModal } from '../auth/AuthModal';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  Store,
  Package,
  Bike,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

export const ShopSubdomainGateway: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // If already logged in as shopkeeper, show isolated Shopkeeper Portal!
  if (currentUser && role === 'shopkeeper') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
        {/* Dedicated Shopkeeper Subdomain Header */}
        <header className="p-4 sm:p-5 border-b border-emerald-500/30 bg-slate-950 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafarGoLogo size="sm" variant="light" showTagline={false} />
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Merchant Dukandar Desk
              </span>
              <span className="text-xs font-mono text-slate-400">
                shop.safargo.in
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
          <ShopkeeperPortal onNavigate={(tab) => {
            if (tab === 'home') {
              window.location.href = buildSubdomainUrl('main');
            }
          }} />
        </main>

        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950">
          SafarGo Merchant Network • Isolated Subdomain [shop.safargo.in]
        </footer>
      </div>
    );
  }

  // Gateway for unauthenticated shopkeeper visitors on shop.safargo.in
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-emerald-500/30 bg-slate-950 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" showTagline={false} />
          <div className="hidden sm:flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
              Merchant Quick Commerce Desk
            </span>
            <span className="text-xs font-mono text-slate-400">
              shop.safargo.in
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
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition cursor-pointer"
          >
            दुकानदार लॉगिन
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-black shadow-lg">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <span>स्थानीय दुकानदार क्विक कॉमर्स नेटवर्क [shop.safargo.in]</span>
        </div>

        <div className="space-y-4 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
            सफ़ारगो दुकानदार मर्चेंट पोर्टल
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            अपनी किराना, इलेक्ट्रॉनिक्स, मोबाइल, फल-सब्जी दुकान को ऑनलाइन लाएं। 15-मिनट लोकल डिलीवरी का लाभ उठाएं और बिक्री का पैसा सीधे <strong>Go Wallet</strong> में प्राप्त करें।
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-emerald-400">⚡ 15-Min Delivery</span>
            <h3 className="font-bold text-white text-sm">क्विक कॉमर्स डिलीवरी</h3>
            <p className="text-slate-400 text-[11px]">सफ़ारगो राइडर्स आपके स्टोर से पिकअप करके ग्राहकों तक 15 मिनट में पहुंचाएंगे।</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-amber-400/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-amber-400">💰 0% कमीशन शुरुआत</span>
            <h3 className="font-bold text-white text-sm">सीधी ग्राहक बिक्री</h3>
            <p className="text-slate-400 text-[11px]">बिना किसी बिचौलिए के सीधे ग्राहकों से ऑर्डर व भुगतान प्राप्त करें।</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-teal-500/30 space-y-1.5 shadow-lg">
            <span className="text-[10px] uppercase font-black text-teal-400">📦 डिजिटल कैटलॉग</span>
            <h3 className="font-bold text-white text-sm">1-क्लिक स्टॉक प्रबंधन</h3>
            <p className="text-slate-400 text-[11px]">अपने सामान की सूची, कीमतें व स्टॉक उपलब्धता आसानी से अपडेट करें।</p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl transition active:scale-95 cursor-pointer"
          >
            दुकानदार पोर्टल में लॉगिन करें ➔
          </button>

          <a
            href={buildSubdomainUrl('main')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm border border-slate-700 transition cursor-pointer text-center"
          >
            पब्लिक यात्री वेबसाइट देखें
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        SafarGo Merchant Quick Commerce Network • Isolated Subdomain Environment [shop.safargo.in]
      </footer>

      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          initialTab="login"
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </div>
  );
};
