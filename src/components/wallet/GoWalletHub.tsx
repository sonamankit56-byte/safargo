import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { WalletRechargeModal } from '../agent/WalletRechargeModal';
import {
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Store,
  Bus,
  Building2,
  Smartphone,
  CheckCircle2,
  Clock,
  TrendingUp,
  Award,
  PlusCircle,
  Megaphone,
  ShieldCheck,
  History,
  Zap,
  Crown,
  CreditCard,
} from 'lucide-react';

/**
 * 3D Animated SafarGo Emblem + "Go" / "Go Wallet" Badge
 * ("pehle 3d logo fir Go likha" — 3D rotating/floating SafarGo emblem followed by Go)
 */
export const Go3DLogoBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  showWalletText?: boolean;
  exclusive?: boolean;
}> = ({ size = 'md', showWalletText = true, exclusive = false }) => {
  const dims = {
    sm: { box: 'w-7 h-7', svg: 18, text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'w-10 h-10', svg: 24, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-14 h-14', svg: 34, text: 'text-2xl sm:text-3xl', sub: 'text-xs' },
  }[size];

  return (
    <div className="inline-flex items-center gap-2.5 select-none group" style={{ perspective: '900px' }}>
      {/* Triple-Layered 3D Animated SafarGo Emblem */}
      <div className="relative flex items-center">
        {/* Outer 3D Orbit Glow Ring */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-400 opacity-75 blur-xs animate-pulse" />

        {/* Main 3D Rotating / Floating Cube-Bus Emblem */}
        <div
          className={`relative ${dims.box} rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 border-2 border-amber-200/80 flex items-center justify-center shadow-xl transform-gpu animate-float3d transition-transform duration-500 group-hover:rotate-y-12 group-hover:scale-110`}
          style={{
            boxShadow:
              '0 10px 25px -4px rgba(249, 115, 22, 0.65), inset 0 2px 5px rgba(255, 255, 255, 0.65)',
          }}
        >
          {/* 3D Shimmer Sweep */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-[-25deg] animate-pulse" />
          </div>

          {/* 3D SafarGo Bus SVG */}
          <svg
            width={dims.svg}
            height={dims.svg}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative z-10 drop-shadow"
          >
            <path d="M14 44L20 32H28L34 44H14Z" fill="rgba(15, 23, 42, 0.4)" />
            <line x1="24" y1="34" x2="24" y2="42" stroke="#FEF08A" strokeWidth="2" strokeDasharray="2 2" />
            <rect x="11" y="7" width="26" height="27" rx="5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.5" />
            <path d="M13 12C13 9.79086 14.7909 8 17 8H31C33.2091 8 35 9.79086 35 12V14H13V12Z" fill="#EA580C" />
            <rect x="14" y="15" width="20" height="9" rx="2" fill="#0F172A" />
            <circle cx="16.5" cy="29.5" r="2" fill="#F59E0B" />
            <circle cx="31.5" cy="29.5" r="2" fill="#F59E0B" />
          </svg>

          {/* 3D Floating Coin Badge */}
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-400 text-slate-950 font-black text-[9px] flex items-center justify-center border border-white shadow">
            ₹
          </span>
        </div>
      </div>

      {/* "Go" + "Go Wallet" Brand Text */}
      <div className="flex flex-col leading-none">
        {exclusive && (
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 flex items-center gap-1 mb-0.5">
            <Crown className="w-3 h-3 text-amber-400 inline" />
            EXCLUSIVE GO • PREMIUM
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <span
            className={`${dims.text} font-black tracking-tight bg-gradient-to-r from-amber-300 via-orange-400 to-emerald-300 bg-clip-text text-transparent drop-shadow-xs`}
          >
            Go
          </span>
          {showWalletText && (
            <span className={`${dims.text} font-black text-white tracking-tight`}>Wallet</span>
          )}
          <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-black text-[9px] uppercase">
            3D LIVE
          </span>
        </div>
      </div>
    </div>
  );
};

interface GoWalletHubProps {
  onNavigate?: (tab: string) => void;
}

export const GoWalletHub: React.FC<GoWalletHubProps> = ({ onNavigate }) => {
  const { currentUser, role } = useAuth();
  const {
    agentWalletBalance,
    agentWalletRecharges,
    agentWalletTransactions,
    partnerShops,
    quickDeliveryOrders,
    withdrawFromGoWallet,
    boostShopOnSafarGoTop,
  } = useData();

  const [activeSection, setActiveSection] = useState<'overview' | 'transactions' | 'top_ad' | 'withdraw'>('overview');
  const [txnFilter, setTxnFilter] = useState<'all' | 'sales_in' | 'recharges_in' | 'money_out'>('all');
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  // Withdrawal Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState((currentUser as any)?.upi_id || '');
  const [bankAccount, setBankAccount] = useState(currentUser?.bank_account_number || '');
  const [bankIfsc, setBankIfsc] = useState(currentUser?.ifsc_code || '');
  const [bankHolder, setBankHolder] = useState(currentUser?.account_holder_name || currentUser?.full_name || '');

  // Top Ad Boost State
  const userMobClean = currentUser?.mobile ? currentUser.mobile.replace(/\D/g, '') : '';
  const myDefaultShop =
    (partnerShops || []).find(
      (s) =>
        (currentUser?.shop_id && s.id === currentUser.shop_id) ||
        s.user_id === currentUser?.id ||
        (userMobClean && s.mobile.replace(/\D/g, '') === userMobClean)
    ) || (partnerShops && partnerShops[0] ? partnerShops[0] : null);

  const [selectedShopId, setSelectedShopId] = useState<string>(myDefaultShop?.id || '');

  // Metrics Calculation
  const quickCommerceSalesTotal = (agentWalletTransactions || [])
    .filter((t) => t.type === 'quick_commerce_sale')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const promoterAndRechargeTotal = (agentWalletTransactions || [])
    .filter((t) => t.type === 'recharge' || t.type === 'promoter_earning' || t.type === 'refund')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const totalMoneySpentOrWithdrawn = (agentWalletTransactions || [])
    .filter(
      (t) =>
        t.type === 'ticket_booking' ||
        t.type === 'shop_ad_boost' ||
        t.type === 'bank_withdrawal' ||
        t.amount < 0
    )
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount) || 0;
    const dest =
      withdrawMethod === 'upi'
        ? upiId.trim()
        : `${bankHolder.trim()} | A/C: ${bankAccount.trim()} (${bankIfsc.trim()})`;
    if (!dest || (withdrawMethod === 'upi' && !upiId.trim()) || (withdrawMethod === 'bank' && !bankAccount.trim())) {
      return;
    }
    const ok = await withdrawFromGoWallet(amt, withdrawMethod, dest);
    if (ok) {
      setWithdrawAmount('');
      setActiveSection('transactions');
    }
  };

  const handleAdBoost = async (planPrice: number, durationDays: number, planTitle: string) => {
    const targetShop = (partnerShops || []).find((s) => s.id === selectedShopId) || myDefaultShop;
    const shopName = targetShop?.shop_name || currentUser?.full_name || 'SafarGo Partner Shop';
    const shopId = targetShop?.id || 'shop-1';
    const ok = await boostShopOnSafarGoTop(shopId, shopName, planPrice, durationDays, planTitle);
    if (ok) {
      setActiveSection('transactions');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 🌟 3D GO WALLET HERO BANNER (FOR AGENT, DUKANDAR & PROMOTER) */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border-2 border-amber-400/40 shadow-2xl overflow-hidden">
        {/* Ambient 3D Glows */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* 3D SafarGo Logo + Go Wallet */}
            <div className="flex flex-wrap items-center gap-3">
              <Go3DLogoBadge size="lg" showWalletText={true} exclusive={true} />
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-white/10 text-amber-300 border border-amber-400/30">
                {role === 'shopkeeper'
                  ? '🏪 दुकानदार (Quick Commerce) Go Wallet'
                  : role === 'promoter'
                  ? '👑 प्रमोटर (Promoter) Go Wallet'
                  : '⚡ एजेंट एवं ऑल-इन-वन Go Wallet'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong>एजेंट, दुकानदार (Quick Commerce) और प्रमोटर</strong> का यूनिवर्सल 3D वॉलेट! दुकानदार के क्विक कॉमर्स में बिके सामान का पैसा, प्रमोटर की कमाई और वॉलेट रिचार्ज सीधे <strong>Go Wallet</strong> में आता है — जिसे आप <strong>बैंक / UPI में निकाल सकते हैं</strong>, <strong>दुकान को SafarGo Top पर दिखाने (Ad Boost)</strong> में या <strong>बस टिकट बुकिंग</strong> में तुरंत उपयोग कर सकते हैं!
            </p>

            {/* Quick Role Highlights */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ✓ क्विक कॉमर्स सामान बिक्री आय ऑटो-क्रेडिट
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                ✓ बैंक / UPI में तुरंत निकासी
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                ✓ SafarGo #1 Top Shop Ad Boost
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30">
                ✓ Exclusive Go बस टिकट बुकिंग
              </span>
            </div>
          </div>

          {/* Live 3D Balance Display Card */}
          <div className="bg-slate-900/90 backdrop-blur-md border-2 border-emerald-400/50 rounded-3xl p-5 sm:p-6 min-w-[280px] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                उपलब्ध Go Wallet बैलेंस
              </span>
              {agentWalletRecharges && agentWalletRecharges.some((r) => r.status === 'pending') ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                  ⏳ Pending
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                  ✓ Verified
                </span>
              )}
            </div>

            <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
              ₹{(agentWalletBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ पैसे जोड़ें</span>
              </button>
              <button
                onClick={() => setActiveSection('withdraw')}
                className="px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-95"
              >
                <Building2 className="w-4 h-4" />
                <span>बैंक / UPI में लें</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-300 block font-semibold">
              🏪 क्विक कॉमर्स सामान बिक्री आय
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5 block">
              +₹{quickCommerceSalesTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">दुकान के बिके सामान का पैसा</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-300 block font-semibold">
              💰 रिचार्ज एवं प्रमोटर आय (+ जमा)
            </span>
            <span className="text-lg sm:text-xl font-black text-teal-300 mt-0.5 block">
              +₹{promoterAndRechargeTotal.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">वॉलेट में जोड़ा व कमाया धन</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
            <span className="text-[11px] text-slate-300 block font-semibold">
              💸 उपयोग व निकासी (- कहाँ गया)
            </span>
            <span className="text-lg sm:text-xl font-black text-orange-400 mt-0.5 block">
              -₹{totalMoneySpentOrWithdrawn.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400">बस टिकट, Top Ad व बैंक निकासी</span>
          </div>

          <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-3.5">
            <span className="text-[11px] text-emerald-200 block font-semibold">
              👑 कुल उपलब्ध Go Wallet बैलेंस
            </span>
            <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">
              ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-300">सभी सेवाओं में 1-क्लिक उपयोग</span>
          </div>
        </div>
      </div>

      {/* 🧭 GO WALLET NAVIGATION TABS (INCLUDING DEDICATED "TRANSACTIONS" OPTION) */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setActiveSection('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-slate-900 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-4 h-4 text-amber-400" />
          <span>Go Wallet फीचर्स (All Options)</span>
        </button>

        <button
          onClick={() => setActiveSection('transactions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            activeSection === 'transactions'
              ? 'bg-indigo-600 text-white shadow'
              : 'text-slate-700 hover:bg-indigo-50'
          }`}
        >
          <History className="w-4 h-4 text-indigo-400" />
          <span>📜 Transactions (पैसा कहाँ आया / कहाँ गया)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
            {(agentWalletTransactions || []).length + (agentWalletRecharges || []).filter((r) => r.status !== 'approved').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('top_ad')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            activeSection === 'top_ad'
              ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow'
              : 'text-slate-700 hover:bg-orange-50'
          }`}
        >
          <Megaphone className="w-4 h-4 text-orange-500" />
          <span>🚀 दुकान को SafarGo TOP पर दिखाएं (Ad Boost)</span>
        </button>

        <button
          onClick={() => setActiveSection('withdraw')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
            activeSection === 'withdraw'
              ? 'bg-emerald-600 text-white shadow'
              : 'text-slate-700 hover:bg-emerald-50'
          }`}
        >
          <Building2 className="w-4 h-4 text-emerald-500" />
          <span>🏦 बैंक या UPI ID में पैसे निकालें</span>
        </button>
      </div>

      {/* SECTION 1: GO WALLET ALL-IN-ONE FEATURES FOR AGENT, DUKANDAR & PROMOTER */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Dukandar Quick Commerce Sales & Bank/UPI Payout */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-emerald-600" />
                  दुकानदार (Quick Commerce) स्पेशल
                </span>
                <span className="text-xs font-black text-emerald-600">
                  बिक्री आय: +₹{quickCommerceSalesTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                क्विक कॉमर्स में बिके सामान का पैसा सीधे Go Wallet में!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                दुकानदार का जो भी सामान <strong>SafarGo 15-Minute Quick Commerce</strong> में बिकता है, उसकी पूरी कमाई अपने-आप इस <strong>Go Wallet</strong> में जमा होती है। आप इसे कभी भी अपने <strong>बैंक खाते या UPI ID</strong> में निकाल सकते हैं।
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => setActiveSection('withdraw')}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
              >
                🏦 बैंक / UPI में पैसे निकालें ➔
              </button>
              <button
                onClick={() => setActiveSection('transactions')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                📜 बिक्री Transactions देखें
              </button>
            </div>
          </div>

          {/* Card 2: Promote Shop on SafarGo TOP (#1 Ad Boost) */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl p-6 border-2 border-orange-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-orange-500 text-white font-black text-xs flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  SafarGo TOP #1 Ad Boost
                </span>
                <span className="text-xs font-black text-orange-700">₹49 से शुरू</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                अपनी दुकान का विज्ञापन करें — SafarGo पर सबसे TOP में दिखाएं!
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                दुकानदार या प्रमोटर अपने <strong>Go Wallet</strong> में पैसे जोड़कर या अपनी कमाई से अपनी दुकान को <strong>SafarGo Quick Commerce में सबसे ऊपर (#1 Top Sponsored)</strong> दिखा सकते हैं, जिससे ग्राहकों के सबसे ज़्यादा ऑर्डर आपकी दुकान पर आएंगे!
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => setActiveSection('top_ad')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-black text-xs shadow transition cursor-pointer"
              >
                🚀 अपनी दुकान को TOP पर दिखाएं ➔
              </button>
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs transition cursor-pointer"
              >
                + Ad के लिए पैसे जोड़ें
              </button>
            </div>
          </div>

          {/* Card 3: Exclusive Go Wallet Bus Ticket Booking (For Agent, Promoter & Dukandar) */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-md space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Go3DLogoBadge size="sm" showWalletText={true} exclusive={true} />
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                  +₹19.34 कमीशन
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Exclusive Go Wallet से प्रीमियम बस टिकट बुकिंग (एजेंट, प्रमोटर व दुकानदार)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                बस टिकट बुकिंग में <strong>Exclusive Go Wallet (3D Logo के साथ)</strong> ऑटोमैटिक प्रीमियम पेमेंट ऑप्शन के रूप में सेट है! एजेंट, प्रमोटर और दुकानदार सभी अपने Go Wallet बैलेंस से तुरंत बस टिकट बुक कर सकते हैं।
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(role === 'agent' || role === 'promoter' ? 'new-booking' : 'home');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
              >
                🚌 Go Wallet से बस टिकट बुक करें ➔
              </button>
              {onNavigate && (
                <button
                  onClick={() => onNavigate('home')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                >
                  ⚡ ऑटोमैटिक सीट बस बुकिंग
                </button>
              )}
            </div>
          </div>

          {/* Card 4: Promoter & Agent All-Rounder Go Wallet Controls */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  प्रमोटर एवं एजेंट फुल एक्सेस
                </span>
                <span className="text-xs font-bold text-indigo-600">All Features Active</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">
                प्रमोटर, दुकानदार और एजेंट — सभी के लिए संपूर्ण सुविधाएं!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                प्रमोटर अपनी दुकान ऑनबोर्डिंग व वायरल रील की कमाई को <strong>Go Wallet</strong> में देख सकते हैं, उसे बस टिकट बुकिंग में इस्तेमाल कर सकते हैं, दुकानों को Top Ad में प्रमोट कर सकते हैं या सीधे बैंक/UPI में ले सकते हैं।
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => setActiveSection('transactions')}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer"
              >
                📜 पूरा Transactions इतिहास देखें ➔
              </button>
              <button
                onClick={() => setIsRechargeModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                + पैसे जोड़ें (Add Money)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: DEDICATED "TRANSACTIONS" TAB (जहाँ एजेंट, दुकानदार और प्रमोटर देख सकें कि उनका पैसा कहाँ आया और कहाँ गया) */}
      {activeSection === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Go3DLogoBadge size="sm" showWalletText={false} />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>📜 Go Wallet Transactions (लेन-देन पासबुक हिस्ट्री)</span>
                </h2>
                <p className="text-xs text-slate-300">
                  यहाँ एजेंट, दुकानदार और प्रमोटर देख सकते हैं कि उनका पैसा कहाँ से आया (+₹) और कहाँ गया (-₹)
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'सभी (All History)' },
                { id: 'sales_in', label: '🏪 + दुकान बिक्री (Quick Commerce)' },
                { id: 'recharges_in', label: '💰 + रिचार्ज व प्रमोटर आय' },
                { id: 'money_out', label: '💸 - पैसा कहाँ गया (Ticket / Ad / Bank)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setTxnFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    txnFilter === f.id
                      ? 'bg-amber-400 text-slate-950 shadow'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-3">
            {(() => {
              type UnifiedRow = {
                id: string;
                categoryLabel: string;
                title: string;
                reference: string;
                amount: number;
                isCredit: boolean;
                statusBadge: string;
                statusColor: string;
                balanceAfter?: number;
                createdAt: string;
                filterGroup: 'sales_in' | 'recharges_in' | 'money_out';
              };

              const rows: UnifiedRow[] = [];

              // 1. Pending / Rejected Recharges
              (agentWalletRecharges || []).forEach((r) => {
                if (r.status === 'pending' || r.status === 'rejected') {
                  rows.push({
                    id: `rec-${r.id}`,
                    categoryLabel: '⏳ Go Wallet रिचार्ज अनुरोध',
                    title:
                      r.status === 'pending'
                        ? '10-मिनट वेरिफिकेशन डेस्क पर जांच जारी है'
                        : `अस्वीकृत: ${r.admin_notes || 'UTR मिसमैच'}`,
                    reference: `UTR: ${r.utr_number}`,
                    amount: Number(r.amount) || 0,
                    isCredit: true,
                    statusBadge: r.status === 'pending' ? '⏳ PENDING' : '❌ REJECTED',
                    statusColor:
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300',
                    createdAt: r.created_at,
                    filterGroup: 'recharges_in',
                  });
                }
              });

              // 2. All Go Wallet Transactions
              (agentWalletTransactions || []).forEach((t) => {
                const isCred = t.amount >= 0 && t.type !== 'ticket_booking' && t.type !== 'shop_ad_boost' && t.type !== 'bank_withdrawal';
                let categoryLabel = 'Go Wallet ट्रांजेक्शन';
                let statusBadge = isCred ? '✅ CREDITED' : '➖ DEBITED';
                let statusColor = isCred
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-orange-100 text-orange-800 border-orange-300';
                let filterGroup: 'sales_in' | 'recharges_in' | 'money_out' = isCred ? 'recharges_in' : 'money_out';

                if (t.type === 'quick_commerce_sale') {
                  categoryLabel = '🏪 क्विक कॉमर्स सामान बिक्री की कमाई (Dukandar Sale)';
                  statusBadge = '✅ SALE CREDITED';
                  filterGroup = 'sales_in';
                } else if (t.type === 'promoter_earning') {
                  categoryLabel = '👑 प्रमोटर कमाई (Promoter Reward)';
                  statusBadge = '✅ PROMOTER EARNING';
                  filterGroup = 'recharges_in';
                } else if (t.type === 'recharge') {
                  categoryLabel = '💰 Go Wallet में पैसे जोड़े गए (Verified Recharge)';
                  statusBadge = '✅ VERIFIED & ADDED';
                  filterGroup = 'recharges_in';
                } else if (t.type === 'ticket_booking') {
                  categoryLabel = '🚌 बस टिकट बुकिंग में पैसा गया (Bus Ticket Paid)';
                  statusBadge = '🚌 BUS TICKET BOOKED';
                  filterGroup = 'money_out';
                } else if (t.type === 'shop_ad_boost') {
                  categoryLabel = '🚀 दुकान को SafarGo TOP पर दिखाने में पैसा गया (Top Ad Boost)';
                  statusBadge = '👑 TOP AD BOOST';
                  statusColor = 'bg-purple-100 text-purple-800 border-purple-300';
                  filterGroup = 'money_out';
                } else if (t.type === 'bank_withdrawal') {
                  categoryLabel = '🏦 बैंक / UPI ID में पैसा निकाला गया (Bank/UPI Withdrawal)';
                  statusBadge = '🏦 SENT TO BANK / UPI';
                  statusColor = 'bg-blue-100 text-blue-800 border-blue-300';
                  filterGroup = 'money_out';
                }

                rows.push({
                  id: `tx-${t.id}`,
                  categoryLabel,
                  title: t.description,
                  reference: t.booking_code || t.recharge_id || t.id,
                  amount: Math.abs(Number(t.amount) || 0),
                  isCredit: isCred,
                  statusBadge,
                  statusColor,
                  balanceAfter: t.balance_after,
                  createdAt: t.created_at,
                  filterGroup,
                });
              });

              const filtered = rows
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .filter((r) => (txnFilter === 'all' ? true : r.filterGroup === txnFilter));

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-12 text-slate-500 text-sm">
                    इस श्रेणी में अभी कोई ट्रांजेक्शन नहीं है।
                  </div>
                );
              }

              return filtered.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${item.statusColor}`}>
                        {item.statusBadge}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-slate-900">{item.categoryLabel}</span>
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.reference}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{item.title}</p>
                    <p className="text-[11px] text-slate-400">
                      🕒 {new Date(item.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <div
                      className={`text-lg font-black font-mono ${
                        item.isCredit ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.isCredit ? '+' : '-'}₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    {typeof item.balanceAfter === 'number' && (
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        शेष Go Wallet: ₹{item.balanceAfter.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* SECTION 3: PROMOTE SHOP ON SAFARGO TOP (#1 SPONSORED AD BOOST) */}
      {activeSection === 'top_ad' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-black text-xs inline-flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-orange-600" />
                SafarGo Top Shop Ad Manager
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                🚀 अपनी दुकान को SafarGo पर सबसे TOP (#1) में दिखाएं!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                अपने Go Wallet बैलेंस का उपयोग करके अपनी दुकान को Quick Commerce में सबसे ऊपर स्पॉन्सर्ड दिखाएं और 3 गुना ज़्यादा ऑर्डर पाएं।
              </p>
            </div>

            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shrink-0">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">उपलब्ध Go Wallet बैलेंस</span>
              <span className="text-xl font-black text-emerald-400">
                ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Select Shop to Promote */}
          <div className="max-w-xl space-y-2">
            <label className="block text-xs font-black text-slate-700 uppercase">
              किस दुकान को SafarGo Top #1 पर प्रमोट करना चाहते हैं?
            </label>
            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-slate-50 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              {(partnerShops || []).map((shop) => (
                <option key={shop.id} value={shop.id}>
                  🏪 {shop.shop_name} — {shop.city} ({shop.owner_name})
                  {shop.is_top_sponsored ? ' [👑 ACTIVE TOP #1]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 3 Ad Boost Packages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: '⚡ Flash Top Ad',
                days: 3,
                price: 49,
                badge: '3 दिन Top रैंकिंग',
                desc: '3 दिनों तक आपकी दुकान लोकल डिलीवरी में सबसे ऊपर हाईलाइट होकर दिखेगी।',
                color: 'border-slate-200 bg-slate-50',
                btn: 'bg-slate-900 hover:bg-slate-800 text-white',
              },
              {
                title: '🔥 Super Top #1 Ad',
                days: 7,
                price: 99,
                badge: 'सबसे लोकप्रिय (7 दिन)',
                desc: 'पूरे 7 दिनों तक 👑 #1 TOP SPONSORED गोल्ड बैज के साथ सबसे पहले नंबर पर दिखेगी!',
                color: 'border-orange-400 bg-orange-50/60 ring-2 ring-orange-300',
                btn: 'bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white',
              },
              {
                title: '👑 Mega Royal #1 Shop',
                days: 30,
                price: 249,
                badge: '30 दिन #1 गारंटीड',
                desc: 'पूरे 1 महीने तक शहर के सभी ग्राहकों को आपकी दुकान और सामान सबसे ऊपर दिखेगा!',
                color: 'border-emerald-400 bg-emerald-50/50',
                btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 ${plan.color}`}
              >
                <div className="space-y-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-white border border-slate-200 text-slate-800">
                    {plan.badge}
                  </span>
                  <h3 className="text-lg font-black text-slate-900">{plan.title}</h3>
                  <div className="text-3xl font-black text-slate-900 font-mono">
                    ₹{plan.price}
                    <span className="text-xs font-semibold text-slate-500"> / {plan.days} दिन</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{plan.desc}</p>
                </div>

                <button
                  onClick={() => handleAdBoost(plan.price, plan.days, plan.title)}
                  className={`w-full py-3 rounded-xl font-black text-xs shadow transition cursor-pointer active:scale-95 ${plan.btn}`}
                >
                  🚀 Go Wallet से ₹{plan.price} देकर Top पर लगाएं
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: WITHDRAW TO BANK OR UPI ID */}
      {activeSection === 'withdraw' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                🏦 Go Wallet से बैंक या UPI ID में पैसे निकालें
              </h2>
              <p className="text-xs text-slate-500">
                दुकानदार की क्विक कॉमर्स बिक्री या प्रमोटर/एजेंट की कमाई सीधे अपने बैंक या UPI में लें
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">उपलब्ध बैलेंस</span>
              <span className="text-lg font-black text-emerald-600">
                ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWithdrawMethod('upi')}
                className={`p-3.5 rounded-2xl border font-black flex items-center justify-center gap-2 cursor-pointer transition ${
                  withdrawMethod === 'upi'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>UPI ID में लें (GPay / PhonePe)</span>
              </button>
              <button
                type="button"
                onClick={() => setWithdrawMethod('bank')}
                className={`p-3.5 rounded-2xl border font-black flex items-center justify-center gap-2 cursor-pointer transition ${
                  withdrawMethod === 'bank'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>बैंक खाते (Bank A/C) में लें</span>
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                निकालने की राशि (Amount in ₹) *
              </label>
              <input
                type="number"
                required
                min={1}
                max={Math.max(1, agentWalletBalance)}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="उदा. 500"
                className="w-full p-3 rounded-xl border border-slate-300 font-black font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {withdrawMethod === 'upi' ? (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  आपकी UPI ID (PhonePe / Google Pay / Paytm) *
                </label>
                <input
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="उदा. 9876543210@ybl या shopkeeper@okaxis"
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">खाताधारक का नाम (Account Holder) *</label>
                  <input
                    type="text"
                    required
                    value={bankHolder}
                    onChange={(e) => setBankHolder(e.target.value)}
                    placeholder="उदा. रमेश कुमार"
                    className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">बैंक खाता संख्या (Account No.) *</label>
                    <input
                      type="text"
                      required
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="Account Number"
                      className="w-full p-3 rounded-xl border border-slate-300 font-mono font-bold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">IFSC कोड *</label>
                    <input
                      type="text"
                      required
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                      placeholder="SBIN0001234"
                      className="w-full p-3 rounded-xl border border-slate-300 font-mono font-bold text-sm uppercase"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg transition cursor-pointer"
            >
              🏦 अभी बैंक / UPI में ट्रांसफर करें
            </button>
          </form>
        </div>
      )}

      {/* Recharge Modal */}
      {isRechargeModalOpen && <WalletRechargeModal onClose={() => setIsRechargeModalOpen(false)} />}
    </div>
  );
};
