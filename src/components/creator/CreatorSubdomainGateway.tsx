import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { PromotionClaimModal } from '../promotions/PromotionClaimModal';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  Sparkles,
  Instagram,
  Youtube,
  Award,
  CheckCircle2,
  Clock,
  Wallet,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Share2,
  DollarSign
} from 'lucide-react';

export const CreatorSubdomainGateway: React.FC = () => {
  const { currentUser } = useAuth();
  const { settings, promotionClaims } = useData();
  const { success } = useToast();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'youtube'>('instagram');

  const handleOpenClaim = (platform: 'instagram' | 'youtube') => {
    setSelectedPlatform(platform);
    setClaimModalOpen(true);
  };

  const instagramReward = settings.promo_instagram_reward || 500;
  const youtubeReward = settings.promo_youtube_reward || 100;

  // Recent approved public claims
  const approvedClaims = (promotionClaims || []).filter((c) => c.status === 'approved');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-purple-800/40 bg-slate-950/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SafarGoLogo size="sm" variant="light" showTagline={false} />
          <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30 text-[10px] font-black uppercase tracking-wider">
            creator.safargo.in
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={buildSubdomainUrl('main')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>पब्लिक बस पोर्टल</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => handleOpenClaim('instagram')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer"
          >
            क्लेम सबमिट करें
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 sm:py-14 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto animate-in fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/15 via-purple-500/15 to-red-500/15 border border-pink-500/30 text-xs font-black uppercase tracking-wider text-pink-300 shadow-md">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            <span>SafarGo आधिकारिक वायरल क्रिएटर व इन्फ्लुएंसर रिवॉर्ड प्रोग्राम</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">24 घंटे में भुगतान</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            वीडियो बनाएं, सोशल मीडिया पर व्यूज लाएं और <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
              पाएं सीधा गारंटीड नकद रिवॉर्ड!
            </span>
          </h1>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal">
            चाहे आप एक सामान्य यात्री हों, यूट्यूबर हों, रील क्रिएटर हों या SafarGo एजेंट—बस SafarGo बस बुकिंग सेवा पर एक रचनात्मक वीडियो/रील शेयर करें और टारगेट व्यूज पूरे होने पर तुरंत नकद इनाम पाएं।
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleOpenClaim('instagram')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-sm shadow-xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Instagram className="w-5 h-5" />
              <span>Instagram Reel क्लेम (₹{instagramReward})</span>
            </button>
            <button
              onClick={() => handleOpenClaim('youtube')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm shadow-xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Youtube className="w-5 h-5" />
              <span>YouTube Video क्लेम (₹{youtubeReward})</span>
            </button>
          </div>
        </div>

        {/* Reward Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Instagram Reel */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-pink-500/40 shadow-2xl space-y-6 relative overflow-hidden group hover:border-pink-400 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
                <Instagram className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase tracking-wider border border-pink-500/30">
                  1 Million Views
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  ₹{instagramReward} <span className="text-xs text-pink-400 font-bold">नकद बोनस</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">📸 Instagram Reel वायरल रिवॉर्ड</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                SafarGo की आसान बस बुकिंग, ₹20 एजेंट कमीशन या मध्य प्रदेश के रूटों (भोपाल, इंदौर, गुना, सिरोंज) पर एक दिलचस्प Reel बनाएं। जब Reel पर 10 लाख (1M) वास्तविक व्यूज हो जाएं, तो लिंक सबमिट करें।
              </p>
            </div>

            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reel में #SafarGo और @safargo.in टैग होना अनिवार्य</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>व्यूज 100% असली व ऑर्गेनिक होने चाहिए (बॉट अलाउड नहीं)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>भुगतान: सीधे UPI या Go Wallet में 24 घंटे में</span>
              </li>
            </ul>

            <button
              onClick={() => handleOpenClaim('instagram')}
              className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Instagram Reel क्लेम सबमिट करें ➔</span>
            </button>
          </div>

          {/* Card 2: YouTube Video */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-red-500/40 shadow-2xl space-y-6 relative overflow-hidden group hover:border-red-400 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
                <Youtube className="w-7 h-7" />
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black uppercase tracking-wider border border-red-500/30">
                  10,000 Views
                </span>
                <div className="text-3xl font-black text-white mt-1">
                  ₹{youtubeReward} <span className="text-xs text-red-400 font-bold">नकद बोनस</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">▶️ YouTube Video / Short रिवॉर्ड</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                SafarGo बस बुकिंग कैसे करें, जन सेवा केंद्र से टिकट बुकिंग का फायदा या ऐप रिव्यू पर एक उपयोगी YouTube Video या Short अपलोड करें। 10,000 व्यूज पूरे होते ही क्लेम करें।
              </p>
            </div>

            <ul className="text-xs text-slate-300 space-y-2 border-t border-slate-800 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>डिस्क्रिप्शन में SafarGo वेबसाइट लिंक (safargo.in) अनिवार्य</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>कम से कम 10,000 ऑर्गेनिक व्यूज पूरे होने चाहिए</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>समीक्षा समय: अधिकतम 24 घंटे</span>
              </li>
            </ul>

            <button
              onClick={() => handleOpenClaim('youtube')}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>YouTube Video क्लेम सबमिट करें ➔</span>
            </button>
          </div>
        </div>

        {/* 3 Step Process */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-xl font-black text-center text-white">
            सिर्फ 3 आसान चरणों में पाएं अपना इनाम
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 font-black text-base flex items-center justify-center mx-auto">
                1
              </div>
              <h4 className="font-bold text-white text-sm">वीडियो बनाएं व पोस्ट करें</h4>
              <p className="text-slate-400 text-[11px]">SafarGo पर आधारित वीडियो या Reel बनाएं और अपने सोशल मीडिया पर शेयर करें।</p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 font-black text-base flex items-center justify-center mx-auto">
                2
              </div>
              <h4 className="font-bold text-white text-sm">टारगेट व्यूज पर लिंक सबमिट करें</h4>
              <p className="text-slate-400 text-[11px]">टारगेट (10k या 1M व्यूज) पूरा होने पर वीडियो का लिंक व स्क्रीनशॉट दर्ज करें।</p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center mx-auto">
                3
              </div>
              <h4 className="font-bold text-white text-sm">24 घंटे में भुगतान प्राप्त करें</h4>
              <p className="text-slate-400 text-[11px]">एडमिन सत्यापन के बाद नकद रिवॉर्ड सीधे आपके बैंक/UPI खाते में जमा होगा।</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
        SafarGo Creator & Influencer Rewards Program • Dedicated Subdomain Environment [creator.safargo.in]
      </footer>

      {/* Promotion Claim Modal */}
      {claimModalOpen && (
        <PromotionClaimModal
          isOpen={claimModalOpen}
          defaultPlatform={selectedPlatform}
          onClose={() => setClaimModalOpen(false)}
        />
      )}
    </div>
  );
};
