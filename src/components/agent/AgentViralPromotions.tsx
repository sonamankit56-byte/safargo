import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { PromotionClaimModal } from '../promotions/PromotionClaimModal';
import { PromotionPlatform } from '../../types';
import {
  Sparkles,
  Instagram,
  Youtube,
  Gift,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  Wallet,
  ArrowRight,
  TrendingUp,
  Share2
} from 'lucide-react';

export const AgentViralPromotions: React.FC = () => {
  const { agentPromotionClaims, settings } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<PromotionPlatform>('instagram');

  const handleOpenClaim = (platform: PromotionPlatform) => {
    setSelectedPlatform(platform);
    setIsModalOpen(true);
  };

  const instaReward = settings.promo_instagram_reward || 500;
  const ytReward = settings.promo_youtube_reward || 100;
  const instaTarget = settings.promo_instagram_target_views || 1000000;
  const ytTarget = settings.promo_youtube_target_views || 10000;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>SafarGo वायरल क्रिएटर व रील्स धमाका</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            सोशल मीडिया पर वीडियो बनाएं, <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
              24 घंटे में सीधा नकद बोनस पाएं!
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            अपने जन सेवा केंद्र या दुकान से SafarGo बस बुकिंग की रील्स या यूट्यूब वीडियो पोस्ट करें। टारगेट व्यूज पूरे होने पर लिंक सबमिट करें — 24 घंटे में गारंटीड बोनस आपके सफ़ारगो वॉलेट या बैंक खाते में!
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenClaim('instagram')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-xs transition shadow-lg flex items-center gap-2"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram Reel क्लेम (₹{instaReward})</span>
            </button>

            <button
              onClick={() => handleOpenClaim('youtube')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs transition shadow-lg flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              <span>YouTube Video क्लेम (₹{ytReward})</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 2 Core Promotion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Instagram Reel Promo */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-xl shadow-pink-500/5 relative overflow-hidden group hover:border-pink-300 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-125 transition" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Instagram className="w-7 h-7" />
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-700 text-xs font-black uppercase tracking-wider border border-pink-200">
                1 Million Views Offer
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                ₹{instaReward} <span className="text-xs font-bold text-slate-500">बोनस</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-2">
            📸 Instagram Reel वायरल रिवॉर्ड
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            SafarGo बस टिकटिंग या ऐप पर एक आकर्षक Reel बनाएं। जब आपकी Reel <strong>{instaTarget.toLocaleString('en-IN')} (1M / 10 लाख)</strong> वास्तविक व्यूज छू ले, तो लिंक सबमिट करें और <strong>₹{instaReward}</strong> सीधा नकद बोनस पाएं!
          </p>

          <div className="space-y-2 text-xs text-slate-700 bg-pink-50/60 p-4 rounded-2xl border border-pink-100 mb-6">
            <div className="flex items-center gap-2 font-bold text-pink-900">
              <CheckCircle className="w-4 h-4 text-pink-600 shrink-0" />
              <span>टारगेट: 10,00,000 (1 Million) Genuine & Unique Views</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-pink-900">
              <Clock className="w-4 h-4 text-pink-600 shrink-0" />
              <span>सत्यापन अवधि: सबमिट करने के 24 घंटे के अंदर पेमेंट!</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-pink-600 shrink-0" />
              <span>सफ़ारगो ब्रांडिंग या बस बुकिंग का ज़िक्र अनिवार्य</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenClaim('instagram')}
            className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>Instagram Reel लिंक सबमिट करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card 2: YouTube Video Promo */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-xl shadow-red-500/5 relative overflow-hidden group hover:border-red-300 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:scale-125 transition" />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
              <Youtube className="w-7 h-7" />
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-black uppercase tracking-wider border border-red-200">
                10,000 Views Offer
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                ₹{ytReward} <span className="text-xs font-bold text-slate-500">बोनस</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-black text-slate-900 mb-2">
            ▶️ YouTube Video / Shorts रिवॉर्ड
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed mb-4">
            अपने YouTube चैनल पर SafarGo से बस टिकट बुकिंग का वीडियो या Short अपलोड करें। <strong>{ytTarget.toLocaleString('en-IN')} (10K / 10 हज़ार)</strong> व्यूज पूरे होते ही क्लेम सबमिट करें और <strong>₹{ytReward}</strong> नकद बोनस पाएं!
          </p>

          <div className="space-y-2 text-xs text-slate-700 bg-red-50/60 p-4 rounded-2xl border border-red-100 mb-6">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <CheckCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>टारगेट: 10,000 (10K) Genuine Views (Video or Shorts)</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-red-900">
              <Clock className="w-4 h-4 text-red-600 shrink-0" />
              <span>सत्यापन अवधि: सबमिट करने के 24 घंटे में गारंटीड क्रेडिट!</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
              <span>वीडियो में SafarGo का उल्लेख होना चाहिए</span>
            </div>
          </div>

          <button
            onClick={() => handleOpenClaim('youtube')}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 active:scale-98"
          >
            <span>YouTube वीडियो लिंक सबमिट करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* 3-Step Process Explanation */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800">
        <h2 className="text-lg sm:text-xl font-black mb-6 text-center">
          ⚡ 3 आसान चरणों में रिवॉर्ड प्राप्त करें (How It Works)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center text-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-white">वीडियो बनाएं और पोस्ट करें</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              SafarGo बस बुकिंग कैसे होती है, इस पर अपने इंस्टाग्राम पर रील या यूट्यूब पर वीडियो अपलोड करें।
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500 text-white font-black flex items-center justify-center text-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-white">टारगेट व्यूज छुएं</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instagram Reel पर 10 लाख (1M) व्यूज या YouTube पर 10 हज़ार (10K) व्यूज पूरा करें।
            </p>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center text-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-white">24 घंटे में भुगतान</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              यहाँ लिंक सबमिट करें। 24 घंटे के अंदर SafarGo एडमिन अप्रूव करके आपके वॉलेट या बैंक में बोनस क्रेडिट करेगा।
            </p>
          </div>
        </div>
      </div>

      {/* Agent's Submitted Claims History */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              आपके सबमिट किए गए क्लेम (My Promotion Claims)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              आपके द्वारा पोस्ट किए गए रील्स व वीडियो क्लेम्स का 24-घंटे का स्टेटस ट्रैक करें
            </p>
          </div>

          <button
            onClick={() => handleOpenClaim('instagram')}
            className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>नया क्लेम सबमिट करें</span>
          </button>
        </div>

        {agentPromotionClaims.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Gift className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-600 text-sm">अभी तक कोई क्लेम सबमिट नहीं किया गया है</p>
            <p className="text-xs text-slate-400">
              ऊपर दिए गए "Instagram Reel" या "YouTube Video" बटन पर क्लिक करके अपना पहला क्लेम दर्ज करें।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {agentPromotionClaims.map((claim) => {
              const isInsta = claim.platform === 'instagram';
              const isPending = claim.status === 'pending';
              const isPaid = claim.status === 'paid' || claim.status === 'approved';
              const isRejected = claim.status === 'rejected';

              return (
                <div
                  key={claim.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isInsta ? 'bg-pink-100 text-pink-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isInsta ? <Instagram className="w-5 h-5" /> : <Youtube className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">#{claim.claim_code}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isInsta ? 'bg-pink-50 text-pink-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {isInsta ? 'Instagram Reel (1M Views)' : 'YouTube Video (10K Views)'}
                        </span>
                      </div>

                      <div className="text-slate-600 mt-1">
                        हैंडल: <span className="font-bold text-slate-800">{claim.channel_or_handle}</span> • व्यूज:{' '}
                        <span className="font-bold text-slate-800">{claim.views_count.toLocaleString('en-IN')}</span>
                      </div>

                      <a
                        href={claim.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-orange-600 hover:underline font-semibold mt-1"
                      >
                        <span>वीडियो लिंक खोलें</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col md:items-end gap-1.5 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200">
                    <div className="font-black text-sm text-emerald-600">
                      ₹{claim.reward_amount} बोनस
                    </div>

                    {isPending && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        <Clock className="w-3 h-3" />
                        समीक्षा जारी (24h SLA)
                      </span>
                    )}

                    {isPaid && (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          भुगतान संपन्न (Paid)
                        </span>
                        {claim.payment_reference && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Ref: {claim.payment_reference}
                          </div>
                        )}
                      </div>
                    )}

                    {isRejected && (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                          <XCircle className="w-3 h-3 text-red-600" />
                          अस्वीकृत
                        </span>
                        {claim.rejection_reason && (
                          <p className="text-[10px] text-red-600 mt-0.5">
                            {claim.rejection_reason}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promotion Claim Modal */}
      <PromotionClaimModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultPlatform={selectedPlatform}
      />

    </div>
  );
};
