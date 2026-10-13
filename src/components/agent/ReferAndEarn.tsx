import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  Gift,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Users,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export const ReferAndEarn: React.FC = () => {
  const { currentUser, allProfiles } = useAuth();
  const { bookings, commissions, settings } = useData();
  const { success } = useToast();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralCode = currentUser?.referral_code || `SFG-REF-${currentUser?.full_name?.slice(0, 4).toUpperCase()}50`;
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  // Find all agents referred by this agent
  const myReferredAgents = allProfiles.filter(
    (p) => p.referred_by_id === currentUser?.id || p.referred_by_code === referralCode
  );

  // Calculate progress for each referred agent toward 5 compulsory bookings
  const reqBookings = settings.referral_required_bookings || 5;
  const bonusAmount = settings.referral_bonus || 50;

  const referredStats = myReferredAgents.map((ag) => {
    const confirmedCount = bookings.filter(
      (b) => b.agent_id === ag.id && b.status === 'confirmed'
    ).length;

    const isQualified = confirmedCount >= reqBookings;
    const remainingNeeded = Math.max(0, reqBookings - confirmedCount);

    const bonusCredited = commissions.some(
      (c) => c.entry_type === 'referral_bonus' && c.referred_agent_id === ag.id
    );

    return {
      agent: ag,
      confirmedCount,
      isQualified,
      remainingNeeded,
      bonusCredited,
    };
  });

  const totalBonusEarned = commissions
    .filter((c) => c.agent_id === currentUser?.id && c.entry_type === 'referral_bonus')
    .reduce((sum, c) => sum + c.amount, 0);

  const qualifiedCount = referredStats.filter((r) => r.isQualified).length;
  const inProgressCount = referredStats.filter((r) => !r.isQualified).length;

const monthlySalaryFormatted = (settings?.monthly_salary || 10000).toLocaleString('en-IN');
const commissionRateFormatted = (settings?.commission_rate || 20).toFixed(2);
const whatsappShareText = `भाई, अपनी दुकान या जन सेवा केंद्र से बस टिकट बुक करना शुरू करो SafarGo के साथ!
प्रत्येक कन्फर्म टिकट पर ₹${commissionRateFormatted} कमीशन + 150 बुकिंग पर ₹${monthlySalaryFormatted} मासिक मानदेय।

पंजीकरण करते समय मेरा रेफरल कोड दर्ज करें:
👉 *${referralCode}*

रजिस्ट्रेशन लिंक: ${referralLink}`;

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(whatsappShareText)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    success('Referral Code Copied!', referralCode);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    success('Referral Link Copied!', 'Send this link to other shopkeepers / CSC operators.');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
              <Gift className="w-4 h-4 text-yellow-200" />
              SafarGo ग्रामीण मित्र प्रोत्साहन (Agent Referral Program)
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              रेफर करें और पाएं ₹{bonusAmount} नकद बोनस!
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
              अपने साथी सीएससी संचालक, साइबर कैफ़े या दुकानदार को सफ़ारगो से जोड़ें। जैसे ही आपका रेफ़र किया गया मित्र अपनी <strong>5 कन्फर्म बुकिंग्स</strong> पूरी करता है, आपके खाते में सीधे ₹{bonusAmount} बोनस जमा हो जाएगा!
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center min-w-52">
            <span className="text-[11px] text-orange-200 uppercase font-bold tracking-wider block">Total Referral Bonus</span>
            <span className="text-3xl font-black mt-1 block text-yellow-300">
              ₹{totalBonusEarned.toFixed(2)}
            </span>
            <span className="text-[11px] text-orange-100 mt-1 block">
              {qualifiedCount} मित्र 5/5 बुकिंग्स पूर्ण कर चुके हैं
            </span>
          </div>
        </div>
      </div>

      {/* Compulsory 5-Booking Rule Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4 shadow-sm text-xs text-amber-900">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 font-bold shadow">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="font-bold text-sm text-amber-950">
            अनिवार्य नियम: रेफरल बोनस के लिए 5 बुकिंग्स आवश्यक (5 Bookings Compulsory)
          </h2>
          <p className="leading-relaxed text-amber-900">
            यह योजना केवल सक्रिय और वास्तविक एजेंटों को प्रोत्साहित करने के लिए है। केवल पंजीकरण कराने पर बोनस नहीं मिलेगा। जब आपका रेफ़र किया गया एजेंट कम से कम <strong>5 वास्तविक कन्फर्म टिकट</strong> बुक कर लेता है, तब सिस्टम आपके लेजर में <strong>₹{bonusAmount}</strong> स्वतः क्रेडिट कर देगा।
          </p>
        </div>
      </div>

      {/* Share / Invite Action Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Referral Code Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
            आपका व्यक्तिगत रेफरल कोड (Your Referral Code)
          </span>

          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-900 text-orange-400 font-mono font-black text-xl px-4 py-3 rounded-2xl tracking-wider text-center border border-slate-800">
              {referralCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition flex items-center gap-1.5 text-xs shrink-0"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <p className="text-[11px] text-slate-500">
            नए एजेंट को बताएं कि रजिस्ट्रेशन फॉर्म में 'Referral Code' में यह कोड डालें।
          </p>
        </div>

        {/* 1-Click WhatsApp Share Box */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block">
              सीधे व्हाट्सएप पर इनवाइट भेजें (WhatsApp Invite)
            </span>
            <p className="text-xs text-slate-600">
              एक क्लिक में अपने दुकानदार ग्रुप्स और मित्रों को प्री-फिल्ड संदेश भेजें।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md transition text-xs"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              Share on WhatsApp (+ ₹{bonusAmount} Bonus)
            </a>

            <button
              onClick={handleCopyLink}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition text-xs flex items-center justify-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Referral Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">कुल रेफ़र किए गए एजेंट</span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            {myReferredAgents.length}
          </span>
          <span className="text-[11px] text-slate-500">Total Friends Joined</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">पात्र (5/5 बुकिंग्स पूर्ण)</span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            {qualifiedCount}
          </span>
          <span className="text-[11px] text-slate-500">Earned ₹{(qualifiedCount * bonusAmount).toFixed(2)}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 block uppercase">प्रगति पर (&lt; 5 बुकिंग्स)</span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[11px] text-slate-500">Working towards 5 bookings</span>
        </div>
      </div>

      {/* Referred Agents Tracking Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              रेफरल नेटवर्क प्रगति (Referred Agents & 5-Booking Progress)
            </h2>
            <p className="text-xs text-slate-500">
              प्रत्येक मित्र की कन्फर्म बुकिंग संख्या और बोनस स्थिति
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            Reward: ₹{bonusAmount} per 5 bookings
          </span>
        </div>

        {referredStats.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600 text-sm">अभी तक कोई रेफरल नहीं जुड़ा है</p>
            <p>ऊपर दिए गए व्हाट्सएप बटन से अपने साथी सीएससी ऑपरेटरों को आमंत्रित करें!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {referredStats.map((r) => (
              <div
                key={r.agent.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{r.agent.full_name}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {r.agent.shop_name || r.agent.city}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    शामिल होने की तिथि: {new Date(r.agent.created_at).toLocaleDateString('en-IN')} • Mobile: +91 {r.agent.mobile}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress towards 5 bookings */}
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-800 block">
                      {r.confirmedCount} / {reqBookings} Confirmed Bookings
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {r.isQualified ? (
                        <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 5/5 Bookings Completed!
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          {r.remainingNeeded} और बुकिंग्स शेष (₹{bonusAmount} बोनस के लिए)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Bonus Badge */}
                  <div>
                    {r.isQualified ? (
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300">
                        ₹{bonusAmount} Bonus Awarded 🎉
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        In Progress ({Math.round((r.confirmedCount / reqBookings) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
