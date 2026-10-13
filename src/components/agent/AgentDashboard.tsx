import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CountdownTimer } from '../common/CountdownTimer';
import { StatusBadge } from '../common/StatusBadge';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Target,
  Award,
  Wallet,
  XCircle,
  Building2,
  ChevronRight,
  Gift,
  Phone,
  Megaphone,
  Instagram,
  Youtube,
  Sparkles,
  CheckCircle,
  CreditCard,
  Printer,
  Bike,
  Tag
} from 'lucide-react';
import { NewFeaturesSection } from './NewFeaturesSection';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { Go3DLogoBadge } from '../wallet/GoWalletHub';
import { WalletRechargeModal } from './WalletRechargeModal';
import { AgentKycModal } from './AgentKycModal';
import { AgentPosterModal } from './AgentPosterModal';
import { AgentOffersModal } from './AgentOffersModal';

interface AgentDashboardProps {
  onNavigate: (tab: string) => void;
}

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, isApprovedAgent } = useAuth();
  const { agentBookings, agentCommissions, agentSalaryRecord, settings, agentWalletBalance, agentWalletRecharges, agentWalletTransactions } = useData();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [walletHistoryFilter, setWalletHistoryFilter] = useState<'all' | 'credit' | 'debit' | 'pending'>('all');
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  // Current calendar month in Asia/Kolkata
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Metrics calculations
  const stats = useMemo(() => {
    let todayRequests = 0;
    let todayConfirmed = 0;
    let monthRequests = 0;
    let monthConfirmed = 0;
    let pending = 0;
    let rejected = 0;
    let expired = 0;

    (agentBookings || []).forEach((b) => {
      const bDate = b.created_at.split('T')[0];
      const bMonth = b.created_at.substring(0, 7);

      if (bDate === todayStr) {
        todayRequests++;
        if (b.status === 'confirmed') todayConfirmed++;
      }

      if (bMonth === currentMonth) {
        monthRequests++;
        if (b.status === 'confirmed') monthConfirmed++;
      }

      if (b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') {
        pending++;
      } else if (b.status === 'rejected') {
        rejected++;
      } else if (b.status === 'expired') {
        expired++;
      }
    });

    // Commission metrics from ledger source of truth
    let totalEarned = 0;
    let paidCommission = 0;

    (agentCommissions || []).forEach((c) => {
      if (c.status === 'credited') {
        totalEarned += c.amount;
      } else if (c.status === 'reversed') {
        totalEarned += c.amount; // Negative amount
      } else if (c.status === 'paid') {
        paidCommission += c.amount;
      }
    });

    const pendingCommission = Math.max(0, totalEarned - paidCommission);

    // Target calculation
    const monthlyTarget = settings?.monthly_target || 150;
    const remainingToTarget = Math.max(0, monthlyTarget - monthConfirmed);
    const progressPercent = Math.min(100, Math.round((monthConfirmed / monthlyTarget) * 100));

    return {
      todayRequests,
      todayConfirmed,
      monthRequests,
      monthConfirmed,
      pending,
      rejected,
      expired,
      totalEarned,
      pendingCommission,
      paidCommission,
      monthlyTarget,
      remainingToTarget,
      progressPercent,
    };
  }, [agentBookings, agentCommissions, todayStr, currentMonth, settings?.monthly_target]);

  const recentBookings = useMemo(() => {
    return [...(agentBookings || [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
  }, [agentBookings]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Account Verification Status Banner (If Pending) */}
      {!isApprovedAgent && (
        <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-amber-900">
              खाता सत्यापन प्रगति पर है (Account Pending Approval)
            </h2>
            <p className="text-xs text-amber-800 leading-relaxed">
              नमस्ते {currentUser?.full_name}, आपका एजेंट रजिस्ट्रेशन प्राप्त हो गया है। सफ़ारगो एडमिन टीम आपके जन सेवा केंद्र / दुकान का सत्यापन कर रही है।
              सत्यापन पूरा होते ही आप बुकिंग और ₹{settings.commission_rate.toFixed(2)} कमीशन कमाना शुरू कर सकेंगे।
            </p>
          </div>
        </div>
      )}

      {/* ⚡ EXTRA EARNING OPPORTUNITY: NEARBY ORDER DELIVERY */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-2 border-emerald-400 rounded-2xl p-5 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shrink-0 shadow-lg font-black">
            <Bike className="w-7 h-7 text-slate-950" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 shadow-xs">
                ⚡ अतिरिक्त कमाई का मौका (Extra Earning Opportunity)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-emerald-200 border border-emerald-400/30">
                ₹18 से ₹50+ अतिरिक्त नकद प्रति डिलीवरी
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              अपने नजदीकी ऑर्डर डिलीवर करें और अतिरिक्त कमाई करें
            </h2>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              बस बुकिंग के साथ खाली समय में अपने नजदीकी लोकल दुकान से सामान उठाकर ग्राहक तक पहुंचाएं और प्रति किलोमीटर के अनुसार सीधी कमाई अपने वॉलेट में पाएं!
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('agent-deliveries')}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <span>नजदीकी ऑर्डर देखें</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mandatory WhatsApp Active Notice for 15-Minute Timer */}
      <div className="bg-emerald-950 text-white border-2 border-emerald-500 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
          <Phone className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-500 text-slate-900">
              जरूरी सूचना (Mandatory Rule)
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-black text-emerald-200">
            15 मिनट के टाइमर में एजेंट को WhatsApp पर एक्टिव रहना अनिवार्य है!
          </h2>
          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
            टिकट सबमिट करने के बाद <strong>SafarGo की टीम आपसे WhatsApp पर ही ऑपरेटर सीट, बोर्डिंग पॉइंट और टिकट की डिटेल मांगेगी</strong>। कृपया 15 मिनट की विंडो में अपना WhatsApp चेक करते रहें ताकि आपकी बुकिंग समय पर कन्फर्म हो सके।
          </p>
        </div>
      </div>

      {/* Refer & Earn ₹50 Incentive Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white text-orange-600 flex items-center justify-center shrink-0 font-bold shadow">
            <Gift className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base flex items-center gap-2">
              <span>रेफर करें और पाएं ₹50 नकद बोनस!</span>
              <span className="text-[10px] bg-slate-900 text-yellow-300 px-2 py-0.5 rounded-full font-bold">
                5 बुकिंग अनिवार्य
              </span>
            </h3>
            <p className="text-xs text-orange-100">
              अपने मित्र सीएससी ऑपरेटर को जोड़ें। उनके 5 कन्फर्म बुकिंग्स पूरे होते ही आपके खाते में ₹50 क्रेडिट होंगे!
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('refer-earn')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-yellow-300 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow"
        >
          <span>रेफरल डैशबोर्ड देखें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 🎟️ Active Promo Codes & Discounts Banner for Agents */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                ऑफर एवं कूपन्स (Promo Offers)
              </span>
              <span className="text-xs font-bold text-amber-300">
                💰 प्रति टिकट अतिरिक्त नकद इंसेंटिव!
              </span>
            </div>
            <h3 className="font-black text-sm sm:text-base">
              सक्रिय प्रोमो कोड्स: यात्रियों को ₹50 तक छूट दिलाएं और अतिरिक्त नकद बोनस कमाएं!
            </h3>
            <p className="text-xs text-emerald-200">
              SAFAR50, MPEXPRESS आदि प्रोमो कोड्स 1-क्लिक व्हाट्सएप से अपने यात्रियों को शेयर करें या बुकिंग में लगाएं।
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setIsOffersModalOpen(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>प्रोमो कोड्स देखें व शेयर करें</span>
          </button>
        </div>
      </div>

      {/* Social Media Viral Creator & Reels Offer Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg border border-pink-500/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                नई क्रिएटर योजना
              </span>
              <span className="text-xs font-bold text-emerald-300">
                ⚡ 24-घंटे में भुगतान
              </span>
            </div>
            <h3 className="font-black text-sm sm:text-base">
              Instagram Reel पर 1M Views = ₹{settings.promo_instagram_reward || 500} | YouTube पर 10K Views = ₹{settings.promo_youtube_reward || 100}!
            </h3>
            <p className="text-xs text-purple-200">
              SafarGo का वीडियो बनाएं, व्यूज लाएं और 24 घंटे में सीधा बोनस अपने वॉलेट या बैंक में पाएं!
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('viral-promotions')}
          className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md"
        >
          <span>रिवॉर्ड्स देखें व क्लेम करें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Weekly Sunday Payout Schedule & Salary Base Notice */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-500 text-white tracking-wider">
                  साप्ताहिक पेआउट दिवस: हर रविवार (Weekly Payout: Every Sunday)
                </span>
                <span className="text-xs font-bold text-amber-300">
                  ⚡ स्वतः बैंक / UPI ट्रांसफर
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                हर रविवार को कमीशन व वेतन भुगतान • 150 बुकिंग पर पूरा ₹5,000 फिक्स्ड वेतन!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                <strong>सैलरी बेस मॉडल (Salary Base Model):</strong> यदि आप महीने के दौरान कमीशन विथड्रॉ नहीं करते हैं, तो 150 कन्फर्म बुकिंग का लक्ष्य पूरा होने पर आपको आगामी रविवार को पूरा <strong>₹5,000 एकमुश्त वेतन</strong> मिलेगा! यदि आप बीच में आंशिक विथड्रॉल करते हैं, तो 150 पूरा होने पर शेष राशि रविवार को मिलेगी।
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('commission')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-2 shrink-0 self-start md:self-center shadow-md active:scale-95"
          >
            <Wallet className="w-4 h-4" />
            <span>कमीशन व पेआउट खाता</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Aadhaar & PAN KYC Action Banner (if not verified) */}
      {currentUser?.kyc_status !== 'verified' && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-2 border-amber-500/40 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-900 flex items-center justify-center shrink-0 font-black shadow">
              <CreditCard className="w-5 h-5 text-slate-900" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500 text-slate-900">
                  विथड्रॉल लॉक
                </span>
                <span className="text-xs font-bold text-amber-900">
                  {currentUser?.kyc_status === 'pending'
                    ? 'KYC समीक्षाधीन (Under Admin Review)'
                    : 'आधार व पैन KYC आवश्यक है'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-amber-950">
                कमीशन निकासी और रविवार स्वतः पेआउट अनलॉक करने हेतु KYC पूरा करें
              </h3>
              <p className="text-xs text-amber-900/80 leading-relaxed max-w-2xl">
                {currentUser?.kyc_status === 'pending'
                  ? 'आपके दस्तावेज प्राप्त हो गए हैं। 12 घंटे के अंदर एडमिन सत्यापन के बाद प्रोफाइल पर Verified Tick (✓) सक्रिय हो जाएगा।'
                  : 'आधार कार्ड (12 अंक) व पैन कार्ड सबमिट करें। 12 घंटे में अप्रूवल के बाद प्रोफाइल पर Verified Tick मिलेगा!'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsKycModalOpen(true)}
            className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-md active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            <span>{currentUser?.kyc_status === 'pending' ? 'KYC स्टेटस देखें' : 'अभी KYC पूरा करें'}</span>
          </button>
        </div>
      )}

      {/* Hero Welcome & Quick Action */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Agent Avatar with Verified Tick Badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-md bg-slate-800 flex items-center justify-center">
                {currentUser?.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-black text-orange-400">
                    {currentUser?.full_name?.charAt(0) || 'A'}
                  </span>
                )}
              </div>

              {currentUser?.photo_verified ? (
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-md"
                  title="SafarGo Verified Partner"
                >
                  <CheckCircle className="w-4 h-4" />
                </div>
              ) : (
                <div
                  className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center border-2 border-slate-900 shadow-md font-bold text-[10px]"
                  title="KYC Pending"
                >
                  !
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-widest text-orange-400">
                  SafarGo Agent Portal
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-300 font-medium">
                  {currentUser?.shop_name || 'Partner Outlet'}
                </span>
                {currentUser?.photo_verified ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>Verified Partner ✓</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsKycModalOpen(true)}
                    className="text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 flex items-center gap-1 transition"
                  >
                    <span>KYC अधूरा (पूरा करें)</span>
                  </button>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                नमस्ते, {currentUser?.full_name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                "अब हर सफर होगा आसान" • प्रत्येक कन्फर्म बस टिकट पर ₹{settings.commission_rate.toFixed(2)} सुरक्षित कमीशन • साप्ताहिक रविवार पेआउट।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPosterModalOpen(true)}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm transition flex items-center gap-1.5 border border-amber-400/30 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>दुकान पोस्टर (Print A4)</span>
            </button>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>+ Go Wallet रिचार्ज (Min ₹{settings.min_wallet_recharge.toLocaleString('en-IN')})</span>
            </button>
            <button
              onClick={() => onNavigate('new-booking')}
              className="px-5 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-orange-500/25 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              नया टिकट बुक करें
            </button>
            <button
              onClick={() => onNavigate('my-bookings')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition"
            >
              मेरी बुकिंग्स ({(agentBookings || []).length})
            </button>
          </div>
        </div>
      </div>

      {/* 💰 3D GO WALLET & 10-MINUTE RECHARGE DESK */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-7 text-white border-2 border-amber-400/40 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Go3DLogoBadge size="md" showWalletText={true} exclusive={true} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {agentWalletRecharges && agentWalletRecharges.some((r) => r.status === 'pending') ? (
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">
                    ⏳ 10-Min Pending Verification
                  </span>
                ) : agentWalletBalance > 0 ? (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    ✓ Verified & Active
                  </span>
                ) : null}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Go Wallet बैलेंस: <span className="text-emerald-400">₹{(agentWalletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('go-wallet')}
              className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>👑 Exclusive Go Wallet (बैंक निकासी व ट्रांजेक्शन)</span>
            </button>
            {agentWalletBalance > 0 && (
              <button
                onClick={() => onNavigate('new-booking')}
                className="px-4 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Exclusive Go बस टिकट बुक करें</span>
              </button>
            )}
            <button
              onClick={() => setShowRechargeModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              <span>+ पैसे जोड़ें (Add Money)</span>
            </button>
          </div>
        </div>

        {/* Live Pending Recharges Banner with 10-minute countdown */}
        {agentWalletRecharges &&
          agentWalletRecharges
            .filter((r) => r.status === 'pending')
            .map((pendingRec) => (
              <div
                key={pendingRec.id}
                className="bg-amber-500/15 border-2 border-amber-500/40 rounded-2xl p-4 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                        ⏳ PENDING (वेरिफिकेशन चल रहा है)
                      </span>
                      <span className="font-mono text-amber-300 font-bold">UTR: {pendingRec.utr_number}</span>
                    </div>
                    <strong className="text-amber-300 font-bold block text-sm mt-1">
                      💥 Boom! ₹{pendingRec.amount.toLocaleString('en-IN')} का रिचार्ज अनुरोध Pending है — हम वेरीफाई कर रहे हैं!
                    </strong>
                    <span className="text-amber-200/90 text-xs block">
                      एडमिन द्वारा वेरीफाई व अप्रूव करते ही यह राशि तुरंत आपके वॉलेट में जुड़ जाएगी और यहाँ Verified दिखेगा।
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRechargeModal(true)}
                  className="px-3.5 py-2 bg-amber-400 text-slate-950 font-black rounded-xl text-xs self-start sm:self-auto hover:bg-amber-300 transition shrink-0 cursor-pointer"
                >
                  10-मिनट टाइमर देखें ➔
                </button>
              </div>
            ))}

        {/* Verified & Credited Recharges Banner */}
        {agentWalletRecharges &&
          !agentWalletRecharges.some((r) => r.status === 'pending') &&
          agentWalletRecharges
            .filter((r) => r.status === 'approved')
            .slice(0, 1)
            .map((approvedRec) => (
              <div
                key={approvedRec.id}
                className="bg-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl p-4 text-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] uppercase">
                        ✅ VERIFIED & CREDITED (सत्यापित व वॉलेट में जमा)
                      </span>
                      <span className="font-mono text-emerald-300 font-bold">UTR: {approvedRec.utr_number}</span>
                    </div>
                    <strong className="text-white font-black block text-sm mt-1">
                      🎉 ₹{approvedRec.amount.toLocaleString('en-IN')} वेरीफाई होकर आपके वॉलेट में जमा हो गए हैं! (कुल बैलेंस: ₹{agentWalletBalance.toLocaleString('en-IN')})
                    </strong>
                    <span className="text-emerald-200 text-xs block">
                      अब आप इस वॉलेट बैलेंस का उपयोग सीधे बस टिकट बुक करने में कर सकते हैं!
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('new-booking')}
                  className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-xl text-xs self-start sm:self-auto transition shrink-0 cursor-pointer"
                >
                  बस टिकट में उपयोग करें ➔
                </button>
              </div>
            ))}

        {/* 📜 WALLET TRANSACTION HISTORY & PASSBOOK */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>📜 वॉलेट ट्रांजेक्शन हिस्ट्री (Wallet Passbook)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-bold">
                    Live Statement
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  सभी वॉलेट रिचार्ज (+ जमा), बस टिकट बुकिंग (- कटौती) और वेरिफिकेशन स्टेटस का पूरा हिसाब
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'सभी (All)' },
                { id: 'credit', label: '+ जमा (Added)' },
                { id: 'debit', label: '- टिकट (Used)' },
                { id: 'pending', label: '⏳ Pending' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setWalletHistoryFilter(tab.id as 'all' | 'credit' | 'debit' | 'pending')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    walletHistoryFilter === tab.id
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Summary Counters */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold">कुल वेरीफाइड रिचार्ज (+ जमा)</span>
              <span className="text-sm sm:text-base font-black text-emerald-400">
                +₹
                {(agentWalletRecharges || [])
                  .filter((r) => r.status === 'approved')
                  .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
              <span className="text-[10px] text-slate-400 block font-semibold">बस टिकट में उपयोग (- खर्च)</span>
              <span className="text-sm sm:text-base font-black text-orange-400">
                -₹
                {(agentWalletTransactions || [])
                  .filter((t) => t.type === 'ticket_booking' || t.amount < 0)
                  .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0)
                  .toLocaleString('en-IN')}
              </span>
            </div>
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-2.5">
              <span className="text-[10px] text-emerald-300 block font-semibold">उपलब्ध वॉलेट बैलेंस</span>
              <span className="text-sm sm:text-base font-black text-white">
                ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Unified Chronological Passbook Entries */}
          {(() => {
            type PassbookEntry = {
              id: string;
              title: string;
              subtitle: string;
              amount: number;
              isCredit: boolean;
              status: 'pending' | 'verified' | 'rejected' | 'debit';
              statusLabel: string;
              reference: string;
              balanceAfter?: number;
              createdAt: string;
            };

            const entries: PassbookEntry[] = [];

            // 1. Add Pending & Rejected recharge requests from agentWalletRecharges
            (agentWalletRecharges || []).forEach((r) => {
              if (r.status === 'pending' || r.status === 'rejected') {
                entries.push({
                  id: `rec-${r.id}`,
                  title:
                    r.status === 'pending'
                      ? 'वॉलेट रिचार्ज अनुरोध (वेरिफिकेशन जारी)'
                      : 'वॉलेट रिचार्ज अस्वीकृत (Rejected)',
                  subtitle: r.admin_notes
                    ? `नोट: ${r.admin_notes}`
                    : `${r.payment_method === 'upi_qr' ? 'UPI / QR पेमेंट' : 'बैंक ट्रांसफर'} • 10-मिनट वेरिफिकेशन डेस्क`,
                  amount: Number(r.amount) || 0,
                  isCredit: true,
                  status: r.status === 'pending' ? 'pending' : 'rejected',
                  statusLabel: r.status === 'pending' ? '⏳ PENDING' : '❌ REJECTED',
                  reference: `UTR: ${r.utr_number}`,
                  createdAt: r.created_at,
                });
              }
            });

            // 2. Add all completed transactions (Verified Recharges, Ticket Bookings, Refunds, Adjustments)
            (agentWalletTransactions || []).forEach((t) => {
              const isCred = t.amount >= 0 && t.type !== 'ticket_booking';
              entries.push({
                id: `txn-${t.id}`,
                title:
                  t.type === 'recharge'
                    ? 'वॉलेट में पैसे जमा (Verified & Credited)'
                    : t.type === 'ticket_booking'
                    ? 'बस टिकट बुकिंग में वॉलेट उपयोग'
                    : t.type === 'refund'
                    ? 'टिकट रिफंड वॉलेट में वापस जमा'
                    : 'एडमिन वॉलेट समायोजन (Adjustment)',
                subtitle: t.description || '',
                amount: Math.abs(Number(t.amount) || 0),
                isCredit: isCred,
                status: isCred ? 'verified' : 'debit',
                statusLabel:
                  t.type === 'recharge'
                    ? '✅ VERIFIED & ADDED'
                    : t.type === 'ticket_booking'
                    ? '🚌 TICKET BOOKED'
                    : isCred
                    ? '✅ CREDITED'
                    : '➖ DEBITED',
                reference: t.booking_code
                  ? `Booking: ${t.booking_code}`
                  : t.recharge_id
                  ? `ID: ${t.recharge_id}`
                  : `TXN: ${t.id}`,
                balanceAfter: t.balance_after,
                createdAt: t.created_at,
              });
            });

            const sortedEntries = entries
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .filter((item) => {
                if (walletHistoryFilter === 'credit') return item.status === 'verified';
                if (walletHistoryFilter === 'debit') return item.status === 'debit';
                if (walletHistoryFilter === 'pending') return item.status === 'pending' || item.status === 'rejected';
                return true;
              });

            if (sortedEntries.length === 0) {
              return (
                <div className="text-center py-6 bg-slate-900/50 rounded-xl border border-slate-800/80 text-slate-400 text-xs">
                  अभी इस श्रेणी में कोई वॉलेट ट्रांजेक्शन नहीं है। "+ पैसे जोड़ें" पर क्लिक करके वॉलेट रिचार्ज करें।
                </div>
              );
            }

            return (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {sortedEntries.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3 border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition ${
                      item.status === 'pending'
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : item.status === 'verified'
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : item.status === 'debit'
                        ? 'bg-slate-900/90 border-slate-700/80'
                        : 'bg-rose-500/10 border-rose-500/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            item.status === 'pending'
                              ? 'bg-amber-400 text-slate-950'
                              : item.status === 'verified'
                              ? 'bg-emerald-400 text-slate-950'
                              : item.status === 'debit'
                              ? 'bg-orange-500 text-white'
                              : 'bg-rose-500 text-white'
                          }`}
                        >
                          {item.statusLabel}
                        </span>
                        <span className="text-xs font-bold text-white">{item.title}</span>
                        <span className="text-[11px] font-mono text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded">
                          {item.reference}
                        </span>
                      </div>
                      {item.subtitle && <p className="text-[11px] text-slate-300">{item.subtitle}</p>}
                      <p className="text-[10px] text-slate-400">
                        🕒 {new Date(item.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div
                        className={`text-base font-black ${
                          item.status === 'pending'
                            ? 'text-amber-300'
                            : item.status === 'rejected'
                            ? 'text-rose-400 line-through'
                            : item.isCredit
                            ? 'text-emerald-400'
                            : 'text-orange-400'
                        }`}
                      >
                        {item.isCredit ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      {typeof item.balanceAfter === 'number' && item.status !== 'pending' && (
                        <span className="text-[10px] text-slate-400 block">
                          शेष बैलेंस: ₹{item.balanceAfter.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Target & Fixed Salary Progress Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  मासिक लक्ष्य एवं निश्चित मानदेय (Monthly Target & Salary)
                </h2>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                  {currentMonth}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                150 पात्र कन्फर्म बुकिंग पूरा करने पर <strong>₹{settings.monthly_salary.toLocaleString('en-IN')} का निश्चित मानदेय</strong> अनलॉक होता है।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Guaranteed Salary Base</span>
              <span className="text-xl font-black text-slate-900">
                ₹{settings.monthly_salary.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Commission Rate</span>
              <span className="text-xl font-black text-emerald-600">
                ₹{settings.commission_rate.toFixed(2)} <span className="text-xs font-normal text-slate-500">/booking</span>
              </span>
            </div>
          </div>
        </div>

        {/* Salary Base Model Explanation Banner inside card */}
        <div className="mb-5 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
          <Award className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">
              💡 सैलरी बेस मॉडल नियम (Salary Base Benefit):
            </p>
            <p className="text-amber-800 leading-relaxed">
              150 टिकट का सामान्य कमीशन ₹{((stats.monthlyTarget) * settings.commission_rate).toFixed(2)} बनता है, परन्तु SafarGo सैलरी बेस मॉडल के तहत 150 बुकिंग पूरी करने पर आपको <strong>पूरा ₹{settings.monthly_salary.toLocaleString('en-IN')}</strong> मिलता है! यदि आप बीच में विथड्रॉल नहीं करते हैं, तो 150 पूरा होने पर आगामी रविवार को पूरे ₹5,000 एकमुश्त आपके बैंक खाते में ट्रांसफर किए जाएंगे।
            </p>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">
              प्रगति (Target Progress): {stats.monthConfirmed} / {stats.monthlyTarget} Confirmed Bookings
            </span>
            <span className="text-orange-600 font-mono">
              {stats.progressPercent}% ({stats.remainingToTarget > 0 ? `${stats.remainingToTarget} शेष` : 'Target Achieved! 🎉 Sunday Payout Eligible!'})
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>0 Bookings</span>
            <span>75 (Halfway)</span>
            <span className="font-bold text-orange-700">150 Goal (₹5,000 Full Salary Base)</span>
          </div>
        </div>
      </div>


      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        
        {/* Agent Prepaid Wallet Balance */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl border border-blue-800 shadow-md flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">प्रीपेड वॉलेट</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ₹{agentWalletBalance.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-800/80">
              <span className="text-[10px] text-blue-300">
                Min ₹{settings.min_wallet_recharge.toLocaleString('en-IN')}
              </span>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="text-[11px] font-black text-yellow-300 hover:text-yellow-200 underline"
              >
                + जोड़ें
              </button>
            </div>

            {agentWalletRecharges && agentWalletRecharges.filter(r => r.status === 'pending').slice(0, 1).map(pendingRec => (
              <div key={pendingRec.id} className="mt-3 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-[11px] text-amber-100 flex items-start gap-2 animate-fadeIn">
                <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-300 block">
                    ₹{pendingRec.amount.toLocaleString('en-IN')} का अनुरोध एडमिन के पास लंबित है
                  </span>
                  <p className="text-[10px] text-amber-200">
                    आपका पैसा कुछ ही देर में आपके वॉलेट में होगा (सत्यापन प्रक्रियाधीन)।
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Commission Earned */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">कुल कमीशन</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600">
              ₹{stats.totalEarned.toFixed(2)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              ₹{stats.pendingCommission.toFixed(2)} देय (Payable)
            </p>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">आज की बुकिंग</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {stats.todayConfirmed}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.todayRequests} कुल रिक्वेस्ट आज
            </p>
          </div>
        </div>

        {/* Pending Confirmations */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">लंबित रिक्वेस्ट</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {stats.pending}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              15 मिनट विंडो में ऑपरेटर चेकिंग
            </p>
          </div>
        </div>

        {/* Monthly Confirmed */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">महीने के कन्फर्म टिकट</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-orange-600">
              {stats.monthConfirmed}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.monthRequests} कुल मासिक रिक्वेस्ट
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Status Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Expired Requests:</span>
          <span className="font-bold text-slate-800">{stats.expired}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Rejected Requests:</span>
          <span className="font-bold text-rose-700">{stats.rejected}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Commission Paid:</span>
          <span className="font-bold text-emerald-700">₹{stats.paidCommission.toFixed(2)}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600 font-medium">Salary Status:</span>
          <span className="font-bold uppercase text-orange-700">
            {agentSalaryRecord?.status || 'In Progress'}
          </span>
        </div>
      </div>

      {/* New Admin Features & Dynamic Services Section */}
      <NewFeaturesSection onNavigateTab={onNavigate} />

      {/* Recent Bookings Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">हालिया बुकिंग रिक्वेस्ट (Recent Requests)</h2>
            <p className="text-xs text-slate-500">लाइव 15 मिनट रिस्पॉन्स टाइमर और स्टेटस</p>
          </div>
          <button
            onClick={() => onNavigate('my-bookings')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition"
          >
            सभी देखें <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <p className="text-sm">अभी तक कोई बुकिंग रिक्वेस्ट नहीं बनाई गई है।</p>
            <button
              onClick={() => onNavigate('new-booking')}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition"
            >
              पहली टिकट बुक करें
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {b.booking_code}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {b.customer_name} • <span className="font-medium text-slate-600">{b.from_city} → {b.to_city}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    यात्रा: {b.journey_date} • {b.passenger_count} यात्री • सीट: {b.seat_category.replace(/_/g, ' ')}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">कुल किराया</span>
                    <span className="text-sm font-black text-slate-900">₹{b.total_estimated_amount}</span>
                  </div>

                  <CountdownTimer
                    deadlineAt={b.deadline_at}
                    status={b.status}
                    compact
                  />

                  <button
                    onClick={() => onNavigate('my-bookings')}
                    className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition"
                    aria-label="View details"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet Recharge Modal */}
      {showRechargeModal && (
        <WalletRechargeModal onClose={() => setShowRechargeModal(false)} />
      )}

      {/* KYC Modal */}
      <AgentKycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
      />

      {/* Shop Poster Modal */}
      <AgentPosterModal
        isOpen={isPosterModalOpen}
        onClose={() => setIsPosterModalOpen(false)}
      />

      {/* Agent Offers & Promo Codes Modal */}
      <AgentOffersModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        onApplyInBooking={(code) => onNavigate('new-booking')}
      />

    </div>
  );
};
