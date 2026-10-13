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
  Check,
  X,
  Search,
  ExternalLink,
  Eye,
  AlertCircle,
  Layers,
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
  onOpenAuth?: (initialTab?: 'login' | 'register' | 'promoter_login') => void;
}

export const GoWalletHub: React.FC<GoWalletHubProps> = ({ onNavigate, onOpenAuth }) => {
  const { currentUser, role, isAdmin } = useAuth();

  // If user is not logged in, show Login Required screen immediately (no wallet options for guests)
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center mx-auto shadow-xl border-2 border-amber-200">
          <Wallet className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-center">
            <Go3DLogoBadge size="lg" showWalletText={true} exclusive={true} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3">
            Go Wallet एक्सेस करने के लिए कृपया लॉगिन करें
          </h2>
          <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
            Go Wallet बैलेंस देखने, पैसे जोड़ने, बस टिकट बुक करने या बैंक निकासी के लिए अपने अधिकृत मोबाइल नंबर से लॉगिन करें।
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth('login');
              else if (onNavigate) onNavigate('home');
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs shadow-lg transition cursor-pointer active:scale-95"
          >
            🔑 अभी लॉगिन करें (Login) ➔
          </button>
          <button
            onClick={() => {
              if (onOpenAuth) onOpenAuth('register');
              else if (onNavigate) onNavigate('home');
            }}
            className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
          >
            नया अकाउंट बनाएं (Register)
          </button>
        </div>
      </div>
    );
  }

  const {
    agentWalletBalance,
    agentWalletRecharges,
    agentWalletTransactions,
    walletRecharges,
    walletTransactions,
    approveWalletRecharge,
    rejectWalletRecharge,
    partnerShops,
    withdrawFromGoWallet,
    boostShopOnSafarGoTop,
  } = useData();

  // Navigation tab state
  const [activeSection, setActiveSection] = useState<'overview' | 'recharge_requests' | 'transactions' | 'top_ad' | 'withdraw'>('overview');
  const [txnFilter, setTxnFilter] = useState<'all' | 'sales_in' | 'recharges_in' | 'money_out'>('all');
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

  // Super Admin Recharge Requests Filter & Screenshot Modal
  const [adminReqFilter, setAdminReqFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [viewingScreenshotUrl, setViewingScreenshotUrl] = useState<string | null>(null);
  const [processingReqId, setProcessingReqId] = useState<string | null>(null);

  // Withdrawal Form State
  const [withdrawMethod, setWithdrawMethod] = useState<'upi' | 'bank'>('upi');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState((currentUser as any)?.upi_id || '');
  const [bankAccount, setBankAccount] = useState((currentUser as any)?.bank_account_number || '');
  const [bankIfsc, setBankIfsc] = useState((currentUser as any)?.ifsc_code || '');
  const [bankHolder, setBankHolder] = useState((currentUser as any)?.account_holder_name || currentUser?.full_name || '');

  // Top Ad Boost State (for Shopkeeper)
  const userMobClean = currentUser?.mobile ? currentUser.mobile.replace(/\D/g, '') : '';
  const myDefaultShop =
    (partnerShops || []).find(
      (s) =>
        (currentUser?.shop_id && s.id === currentUser.shop_id) ||
        s.user_id === currentUser?.id ||
        (userMobClean && s.mobile.replace(/\D/g, '') === userMobClean)
    ) || (partnerShops && partnerShops[0] ? partnerShops[0] : null);

  const [selectedShopId, setSelectedShopId] = useState<string>(myDefaultShop?.id || '');

  // Super Admin Specific Metrics
  const allRechargeRequests = walletRecharges || [];
  const pendingRecharges = allRechargeRequests.filter((r) => r.status === 'pending');
  const approvedRecharges = allRechargeRequests.filter((r) => r.status === 'approved');
  const rejectedRecharges = allRechargeRequests.filter((r) => r.status === 'rejected');
  const totalApprovedAmount = approvedRecharges.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalPendingAmount = pendingRecharges.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  // User/Agent/Shopkeeper Metrics Calculation
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

  // Admin Approve Handler
  const handleAdminApprove = async (rechargeId: string) => {
    setProcessingReqId(rechargeId);
    try {
      await approveWalletRecharge(rechargeId, 'Super Admin 1-Click Approved');
    } finally {
      setProcessingReqId(null);
    }
  };

  // Admin Reject Handler
  const handleAdminReject = async (rechargeId: string) => {
    const reason = window.prompt('अस्वीकृत करने का कारण दर्ज करें (उदा. गलत UTR या पेमेंट अपूर्ण):', 'UTR अमान्य / पेमेंट नॉट रिसीव्ड');
    if (!reason) return;
    setProcessingReqId(rechargeId);
    try {
      await rejectWalletRecharge(rechargeId, reason);
    } finally {
      setProcessingReqId(null);
    }
  };

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

  // =========================================================================
  // VIEW 1: SUPER ADMIN MASTER DESK (WHEN role === 'admin' OR isAdmin)
  // Super Admin does NOT see Agent booking tasks or Dukandar shop options.
  // Super Admin sees: Live Agent/User Recharge Requests Approval Desk & Platform Ledger.
  // =========================================================================
  if (isAdmin || role === 'admin') {
    const filteredAdminRequests = allRechargeRequests
      .filter((r) => {
        if (adminReqFilter === 'pending') return r.status === 'pending';
        if (adminReqFilter === 'approved') return r.status === 'approved';
        if (adminReqFilter === 'rejected') return r.status === 'rejected';
        return true;
      })
      .filter((r) => {
        if (!adminSearchTerm.trim()) return true;
        const q = adminSearchTerm.toLowerCase();
        return (
          (r.agent_name || '').toLowerCase().includes(q) ||
          (r.agent_mobile || '').toLowerCase().includes(q) ||
          (r.utr_number || '').toLowerCase().includes(q) ||
          (r.amount || '').toString().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 🌟 SUPER ADMIN GO WALLET HERO BANNER */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 border-2 border-amber-400/50 shadow-2xl overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Go3DLogoBadge size="lg" showWalletText={true} exclusive={true} />
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/50 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  सुपर एडमिन Go Wallet मास्टर कंट्रोल डेस्क
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                यहाँ से आप <strong>एजेंटों, दुकानदारों और प्रमोटरों द्वारा Go Wallet में पैसे जोड़ने के लाइव अनुरोधों (Recharge Requests)</strong> को तुरंत <strong>1-क्लिक में सत्यापित व स्वीकृत (Approve)</strong> कर सकते हैं। स्वीकृत करते ही बैलेंस तुरंत उनके Go Wallet में क्रेडिट हो जाएगा।
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
                <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> 10-मिनट वेरिफिकेशन डेस्क एक्टिव
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 1-क्लिक इंस्टेंट ऑटो-क्रेडिट
                </span>
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> UTR व रसीद स्क्रीनशॉट सत्यापन
                </span>
              </div>
            </div>

            {/* Admin Live Summary Card */}
            <div className="bg-slate-900/90 backdrop-blur-md border-2 border-amber-400/50 rounded-3xl p-5 sm:p-6 min-w-[290px] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  सत्यापन शेष अनुरोध (Pending)
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs animate-bounce">
                  {pendingRecharges.length} PENDING
                </span>
              </div>

              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                ₹{totalPendingAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>

              <p className="text-[11px] text-slate-400">
                कुल {pendingRecharges.length} यूज़र्स पैसे जोड़ने हेतु एडमिन अप्रूवल का इंतज़ार कर रहे हैं।
              </p>
            </div>
          </div>

          {/* 4 Admin Platform Metrics */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="text-[11px] text-amber-300 block font-bold">
                ⏳ सत्यापन शेष अनुरोध (Pending)
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5 block">
                {pendingRecharges.length}
              </span>
              <span className="text-[10px] text-slate-400">राशि: ₹{totalPendingAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="text-[11px] text-emerald-300 block font-bold">
                ✅ स्वीकृत अनुरोध (Approved)
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
                {approvedRecharges.length}
              </span>
              <span className="text-[10px] text-slate-400">राशि: +₹{totalApprovedAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="text-[11px] text-rose-300 block font-bold">
                ❌ अस्वीकृत (Rejected)
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-400 mt-0.5 block">
                {rejectedRecharges.length}
              </span>
              <span className="text-[10px] text-slate-400">अमान्य UTR / मिसमैच</span>
            </div>

            <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-3.5">
              <span className="text-[11px] text-emerald-200 block font-bold">
                💎 कुल अनुरोध दर्ज (All Requests)
              </span>
              <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
                {allRechargeRequests.length}
              </span>
              <span className="text-[10px] text-emerald-300">प्लेटफॉर्म लाइव Go Wallet डेटा</span>
            </div>
          </div>
        </div>

        {/* 🧭 SUPER ADMIN NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              activeSection === 'overview'
                ? 'bg-slate-900 text-white shadow'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>⚡ पैसे जोड़ने के अनुरोध (Approval Desk)</span>
            {pendingRecharges.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                {pendingRecharges.length}
              </span>
            )}
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
            <span>📜 मास्टर Go Wallet ट्रांजेक्शन लेज़र</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-800 font-bold">
              {(walletTransactions || []).length}
            </span>
          </button>
        </div>

        {/* ADMIN TAB 1: RECHARGE REQUESTS APPROVAL DESK */}
        {activeSection === 'overview' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <span>एजेंट व यूज़र द्वारा पैसे जोड़ने के अनुरोध (Live Approval Desk)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  कृपया UTR नंबर और पेमेंट रसीद की पुष्टि कर तुरंत स्वीकार (Approve) या अस्वीकार करें।
                </p>
              </div>

              {/* Status Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={adminSearchTerm}
                    onChange={(e) => setAdminSearchTerm(e.target.value)}
                    placeholder="खोजें: नाम, मोबाइल या UTR..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none w-48 sm:w-56"
                  />
                </div>

                {(['pending', 'approved', 'rejected', 'all'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setAdminReqFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer capitalize ${
                      adminReqFilter === st
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'pending'
                      ? `⏳ सत्यापन शेष (${pendingRecharges.length})`
                      : st === 'approved'
                      ? `✅ स्वीकृत (${approvedRecharges.length})`
                      : st === 'rejected'
                      ? `❌ अस्वीकृत (${rejectedRecharges.length})`
                      : `सभी (${allRechargeRequests.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* List / Table of Requests */}
            {filteredAdminRequests.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm space-y-2">
                <Clock className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="font-bold">इस श्रेणी में कोई अनुरोध नहीं मिला।</p>
                <p className="text-xs">जब कोई एजेंट या यूज़र पैसे जोड़ने का अनुरोध भेजेगा, वह यहाँ तुरंत दिखेगा।</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAdminRequests.map((req) => (
                  <div
                    key={req.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      req.status === 'pending'
                        ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                        : req.status === 'approved'
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-rose-50/30 border-rose-200'
                    }`}
                  >
                    {/* User & Request Info */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse'
                              : req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {req.status === 'pending'
                            ? '⏳ PENDING (10-MIN REVIEW)'
                            : req.status === 'approved'
                            ? '✅ APPROVED & CREDITED'
                            : '❌ REJECTED'}
                        </span>

                        <span className="text-sm font-black text-slate-900">
                          {req.agent_name || 'SafarGo User'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                          +91 {req.agent_mobile || 'N/A'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
                        <span>
                          <strong>UTR / Ref No:</strong>{' '}
                          <code className="bg-white px-2 py-0.5 rounded font-mono font-black text-indigo-700 border border-slate-200">
                            {req.utr_number || 'N/A'}
                          </code>
                        </span>
                        <span>
                          <strong>विधि:</strong>{' '}
                          {req.payment_method === 'upi_qr' ? 'SafarGo UPI QR' : 'Bank Transfer'}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          🕒 {new Date(req.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </span>
                      </div>

                      {req.admin_notes && (
                        <p className="text-[11px] text-slate-600 italic">
                          नोट: <strong>{req.admin_notes}</strong>
                        </p>
                      )}
                    </div>

                    {/* Amount & Admin Actions */}
                    <div className="flex flex-wrap items-center gap-3 lg:justify-end shrink-0">
                      <div className="text-left lg:text-right mr-2">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">अनुरोध राशि</span>
                        <span className="text-2xl font-black text-slate-950 font-mono">
                          ₹{(Number(req.amount) || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Screenshot Preview Button */}
                      {req.screenshot_url && (
                        <button
                          type="button"
                          onClick={() => setViewingScreenshotUrl(req.screenshot_url || null)}
                          className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>रसीद देखें</span>
                        </button>
                      )}

                      {/* 1-Click Approve / Reject for Pending Requests */}
                      {req.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={processingReqId === req.id}
                            onClick={() => handleAdminApprove(req.id)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>{processingReqId === req.id ? 'स्वीकृत हो रहा...' : '✓ स्वीकार करें & जोड़ें'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={processingReqId === req.id}
                            onClick={() => handleAdminReject(req.id)}
                            className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-black text-xs transition flex items-center gap-1 active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>अस्वीकार</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'approved' && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          क्रेडिट हो चुका है
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN TAB 2: MASTER PLATFORM TRANSACTIONS LEDGER */}
        {activeSection === 'transactions' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white">📜 प्लेटफ़ॉर्म मास्टर Go Wallet ट्रांजेक्शन लेज़र</h3>
                <p className="text-xs text-slate-300">
                  प्लेटफ़ॉर्म के सभी एजेंट्स, दुकानदारों व प्रमोटरों के Go Wallet का पूरा लेन-देन रिकॉर्ड
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-mono font-bold">
                {(walletTransactions || []).length} कुल ट्रांजेक्शन
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              {(walletTransactions || []).length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  अभी तक कोई प्लेटफ़ॉर्म ट्रांजेक्शन दर्ज नहीं है।
                </div>
              ) : (
                (walletTransactions || []).slice(0, 50).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            tx.amount >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type}
                        </span>
                        <span className="font-bold text-slate-900">{tx.description}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(tx.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} • ID: {tx.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-base font-black font-mono ${
                          tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.amount >= 0 ? '+' : ''}₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Screenshot Zoom Modal */}
        {viewingScreenshotUrl && (
          <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-3">
                <h4 className="font-black text-slate-900 text-sm">भुगतान रसीद / स्क्रीनशॉट</h4>
                <button
                  onClick={() => setViewingScreenshotUrl(null)}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[70vh] overflow-auto rounded-2xl border bg-slate-50 flex items-center justify-center p-2">
                <img src={viewingScreenshotUrl} alt="Receipt Slip" className="max-w-full rounded-xl object-contain" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ROLE-SPECIFIC VIEWS FOR AGENT, DUKANDAR & PROMOTER
  // =========================================================================
  const isAgent = role === 'agent';
  const isShopkeeper = role === 'shopkeeper';
  const isPromoter = role === 'promoter';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 🌟 3D GO WALLET HERO BANNER */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 border-2 border-amber-400/40 shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* 3D SafarGo Logo + Go Wallet */}
            <div className="flex flex-wrap items-center gap-3">
              <Go3DLogoBadge size="lg" showWalletText={true} exclusive={true} />
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase bg-white/10 text-amber-300 border border-amber-400/30">
                {isShopkeeper
                  ? '🏪 दुकानदार (Quick Commerce) Go Wallet'
                  : isPromoter
                  ? '👑 प्रमोटर (Promoter) Go Wallet'
                  : '⚡ एजेंट Exclusive Go Wallet'}
              </span>
            </div>

            {/* Role-Specific Description */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isShopkeeper ? (
                <>
                  दुकानदार का जो भी सामान <strong>SafarGo 15-Minute Quick Commerce</strong> में बिकता है, उसकी पूरी कमाई सीधे <strong>Go Wallet</strong> में जमा होती है। आप इसे कभी भी अपने <strong>बैंक खाते / UPI ID</strong> में निकाल सकते हैं या अपनी दुकान को <strong>SafarGo Top (#1 Ad Boost)</strong> पर प्रमोट कर सकते हैं!
                </>
              ) : isPromoter ? (
                <>
                  प्रमोटर की <strong>दुकान ऑनबोर्डिंग व वायरल रील शेयरिंग कमाई</strong> सीधे <strong>Go Wallet</strong> में आती है! इसे आप <strong>बैंक / UPI में निकाल सकते हैं</strong>, या <strong>Exclusive Go बस टिकट बुकिंग</strong> में उपयोग कर सकते हैं।
                </>
              ) : (
                <>
                  एजेंट का <strong>Exclusive 3D Go Wallet</strong>! वॉलेट में पैसे जोड़कर तुरंत <strong>बस टिकट बुक करें</strong>, अपना कमीशन कमाएं और अपनी पूरी कमाई सीधे <strong>बैंक खाते या UPI ID में ट्रांसफर करें</strong>।
                </>
              )}
            </p>

            {/* Quick Role Highlights */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold">
              {isShopkeeper ? (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ✓ 15-Min क्विक कॉमर्स सामान बिक्री आय
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-400/30">
                    ✓ SafarGo #1 Top Shop Ad Boost
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    ✓ बैंक / UPI में तुरंत निकासी
                  </span>
                </>
              ) : isPromoter ? (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    ✓ दुकान ऑनबोर्डिंग & वायरल रील इंसेंटिव
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    ✓ बैंक / UPI में तुरंत निकासी
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    ✓ Exclusive Go बस टिकट बुकिंग
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ✓ 10-मिनट टाइमर सत्यापन के साथ + पैसे जोड़ें
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30">
                    ✓ Exclusive Go बस टिकट बुकिंग (₹19+ कमीशन)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    ✓ बैंक / UPI में तुरंत निकासी
                  </span>
                </>
              )}
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
                  ⏳ 10-Min Pending
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

        {/* Role-Specific 4 Summary Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          {isShopkeeper ? (
            <>
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
                  💰 वॉलेट में जोड़े गए पैसे
                </span>
                <span className="text-lg sm:text-xl font-black text-teal-300 mt-0.5 block">
                  +₹{promoterAndRechargeTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">Ad व अन्य उपयोग हेतु</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  💸 Top Ad खर्च व बैंक निकासी
                </span>
                <span className="text-lg sm:text-xl font-black text-orange-400 mt-0.5 block">
                  -₹{totalMoneySpentOrWithdrawn.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">दुकान प्रमोशन व पेआउट</span>
              </div>
            </>
          ) : isPromoter ? (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  👑 प्रमोटर कमाई व रिवॉर्ड्स
                </span>
                <span className="text-lg sm:text-xl font-black text-indigo-400 mt-0.5 block">
                  +₹{promoterAndRechargeTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">ऑनबोर्डिंग व वायरल रील</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  💰 वॉलेट में जोड़े गए पैसे
                </span>
                <span className="text-lg sm:text-xl font-black text-teal-300 mt-0.5 block">
                  +₹{promoterAndRechargeTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">कुल जमा राशि</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  💸 बस टिकट व बैंक निकासी
                </span>
                <span className="text-lg sm:text-xl font-black text-orange-400 mt-0.5 block">
                  -₹{totalMoneySpentOrWithdrawn.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">उपयोग व ट्रांसफर</span>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  💰 Go Wallet में जोड़े गए पैसे
                </span>
                <span className="text-lg sm:text-xl font-black text-teal-300 mt-0.5 block">
                  +₹{promoterAndRechargeTotal.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">10-मिनट वेरीफाइड रिचार्ज</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  🚌 बस टिकट बुकिंग खर्च
                </span>
                <span className="text-lg sm:text-xl font-black text-rose-400 mt-0.5 block">
                  -₹{totalMoneySpentOrWithdrawn.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">टिकट भुगतान</span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
                <span className="text-[11px] text-slate-300 block font-semibold">
                  🏦 बैंक / UPI में निकासी
                </span>
                <span className="text-lg sm:text-xl font-black text-amber-400 mt-0.5 block">
                  -₹{totalMoneySpentOrWithdrawn.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-400">कमीशन पेआउट</span>
              </div>
            </>
          )}

          <div className="bg-emerald-500/15 border border-emerald-400/40 rounded-2xl p-3.5">
            <span className="text-[11px] text-emerald-200 block font-semibold">
              👑 कुल उपलब्ध Go Wallet बैलेंस
            </span>
            <span className="text-lg sm:text-xl font-black text-white mt-0.5 block">
              ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-300">1-क्लिक तुरंत उपलब्ध</span>
          </div>
        </div>
      </div>

      {/* 🧭 ROLE-FILTERED NAVIGATION TABS */}
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
          <span>Go Wallet फीचर्स</span>
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
          <span>📜 Transactions (कहाँ आया / कहाँ गया)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black">
            {(agentWalletTransactions || []).length}
          </span>
        </button>

        {/* Shopkeeper Only: Top Ad Boost Tab */}
        {isShopkeeper && (
          <button
            onClick={() => setActiveSection('top_ad')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer ${
              activeSection === 'top_ad'
                ? 'bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow'
                : 'text-slate-700 hover:bg-orange-50'
            }`}
          >
            <Megaphone className="w-4 h-4 text-orange-500" />
            <span>🚀 दुकान को TOP पर दिखाएं (Ad Boost)</span>
          </button>
        )}

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

      {/* SECTION 1: ROLE-SPECIFIC OVERVIEW CARDS */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* ================= AGENT OVERVIEW CARDS ================= */}
          {isAgent && (
            <>
              {/* Agent Card 1: Exclusive Go Bus Ticket Booking */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Go3DLogoBadge size="sm" showWalletText={true} exclusive={true} />
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px]">
                      +₹19.34 प्रति टिकट कमीशन
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Exclusive Go Wallet से बस टिकट बुकिंग
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    एजेंट सीधे अपने <strong>Go Wallet बैलेंस से 1-क्लिक में बस टिकट बुक</strong> कर सकते हैं। टिकट बुकिंग पर आपका कमीशन तुरंत वॉलेट में जमा होता है और ग्राहक को टिकट तुरंत मिल जाता है।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('new-booking');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
                  >
                    🚌 Go Wallet से बस टिकट बुक करें ➔
                  </button>
                  <button
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                  >
                    + पैसे जोड़ें (10m Timer)
                  </button>
                </div>
              </div>

              {/* Agent Card 2: 10-Minute Add Money Desk */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      10-मिनट टाइमर वेरिफिकेशन
                    </span>
                    <span className="text-xs font-black text-emerald-600">सुरक्षित QR व UPI</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    Go Wallet में पैसे जोड़ें — 10 मिनट में सत्यापन!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    SafarGo आधिकारिक QR कोड या UPI से भुगतान करें और UTR नंबर दर्ज करें। <strong>10-मिनट टाइमर</strong> स्क्रीन पर एडमिन सत्यापन की पुष्टि लाइव दिखाई देती है और राशि तुरंत आपके वॉलेट में जुड़ जाती है।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    + Go Wallet में पैसे जोड़ें ➔
                  </button>
                  <button
                    onClick={() => setActiveSection('transactions')}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    📜 रिचार्ज इतिहास देखें
                  </button>
                </div>
              </div>

              {/* Agent Card 3: Bank / UPI Payout */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      इंस्टेंट बैंक ट्रांसफर
                    </span>
                    <span className="text-xs font-bold text-slate-500">24x7 उपलब्ध</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    कमीशन व कमाई सीधे बैंक या UPI ID में निकालें
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    एजेंट अपने Go Wallet से कमाई को कभी भी सीधे अपने <strong>Google Pay / PhonePe / Paytm UPI ID</strong> या <strong>बैंक खाते</strong> में ट्रांसफर कर सकते हैं।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('withdraw')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer"
                  >
                    🏦 अभी बैंक / UPI में निकालें ➔
                  </button>
                </div>
              </div>

              {/* Agent Card 4: Agent Passbook */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center gap-1.5">
                      <History className="w-4 h-4 text-indigo-600" />
                      एजेंट पासबुक
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    एजेंट का पूरा लेन-देन इतिहास (Transactions)
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    देखें कि आपका पैसा कहाँ से आया (रिचार्ज, टिकट कमीशन) और कहाँ गया (बस बुकिंग, बैंक निकासी)।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('transactions')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    📜 पूरा Transactions इतिहास देखें ➔
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= DUKANDAR (SHOPKEEPER) OVERVIEW CARDS ================= */}
          {isShopkeeper && (
            <>
              {/* Dukandar Card 1: Quick Commerce Sales */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-emerald-600" />
                      दुकानदार क्विक कॉमर्स स्पेशल
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

              {/* Dukandar Card 2: Top Shop Ad Boost */}
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
                    अपनी दुकान को SafarGo पर सबसे TOP में दिखाएं!
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    दुकानदार अपने <strong>Go Wallet</strong> बैलेंस से अपनी दुकान को <strong>SafarGo Quick Commerce में सबसे ऊपर (#1 Top Sponsored)</strong> दिखा सकते हैं, जिससे ग्राहकों के सबसे ज़्यादा ऑर्डर आपकी दुकान पर आएंगे!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('top_ad')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-500 hover:to-rose-500 text-white font-black text-xs shadow transition cursor-pointer"
                  >
                    🚀 दुकान को TOP पर दिखाएं ➔
                  </button>
                  <button
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs transition cursor-pointer"
                  >
                    + पैसे जोड़ें (Add Money)
                  </button>
                </div>
              </div>

              {/* Dukandar Card 3: Bank Withdrawal */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      दुकानदार निकासी
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    बिक्री कमाई बैंक या UPI ID में ट्रांसफर करें
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    दुकानदार अपने किसी भी बैंक खाते या UPI ID (PhonePe, GPay) में 1-क्लिक में सुरक्षित निकासी कर सकते हैं।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('withdraw')}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    🏦 पैसे निकालें ➔
                  </button>
                </div>
              </div>

              {/* Dukandar Card 4: Passbook */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-1.5">
                      <History className="w-4 h-4" />
                      दुकानदार पासबुक
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    दुकान बिक्री व खर्च का पूरा रिकॉर्ड
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    हर क्विक कॉमर्स बिक्री, टॉप ऐड बूस्ट खर्च और बैंक निकासी का पूरा ब्यौरा।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('transactions')}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
                  >
                    📜 पूरा लेन-देन देखें ➔
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= PROMOTER OVERVIEW CARDS ================= */}
          {isPromoter && (
            <>
              {/* Promoter Card 1: Promoter Rewards */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      प्रमोटर रिवॉर्ड्स
                    </span>
                    <span className="text-xs font-bold text-indigo-600">Active</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    दुकान ऑनबोर्डिंग व वायरल रील की कमाई सीधे Go Wallet में!
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    प्रमोटर अपने ऑनबोर्डिंग इंसेंटिव व वायरल वीडियो रिवॉर्ड्स को <strong>Go Wallet</strong> में देख सकते हैं, और इसे कभी भी बैंक/UPI में ट्रांसफर कर सकते हैं या बस टिकट बुक कर सकते हैं।
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
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    + पैसे जोड़ें
                  </button>
                </div>
              </div>

              {/* Promoter Card 2: Exclusive Go Bus Ticket Booking */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Go3DLogoBadge size="sm" showWalletText={true} exclusive={true} />
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px]">
                      प्रमोटर स्पेशल
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Exclusive Go Wallet से बस टिकट बुकिंग
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    प्रमोटर अपनी कमाई से सीधे प्रीमियम बस टिकट बुक कर सकते हैं और यात्रा का आनंद ले सकते हैं।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('new-booking');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer"
                  >
                    🚌 Go Wallet से बस टिकट बुक करें ➔
                  </button>
                </div>
              </div>

              {/* Promoter Card 3: Passbook */}
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-1.5">
                      <History className="w-4 h-4" />
                      प्रमोटर पासबुक
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900">
                    रिवॉर्ड्स व लेन-देन का पूरा इतिहास
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    देखें कि कौन सा रिवॉर्ड कब जमा हुआ और आपने कब निकासी की।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('transactions')}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
                  >
                    📜 पूरा लेन-देन देखें ➔
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ================= CUSTOMER / GENERAL PASSENGER CARDS ================= */}
          {!isAgent && !isShopkeeper && !isPromoter && (
            <>
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 border border-indigo-500/30 shadow-md space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Go3DLogoBadge size="sm" showWalletText={true} exclusive={true} />
                  </div>
                  <h3 className="text-lg font-black text-white">
                    Exclusive Go Wallet से 1-क्लिक बस टिकट बुक करें
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    अपने Go Wallet में पैसे जोड़ें और बिना किसी बैंक देरी के सीधे बस टिकट बुक करें!
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (onNavigate) onNavigate('home');
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer"
                  >
                    🚌 बस खोजें व बुक करें ➔
                  </button>
                  <button
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
                  >
                    + पैसे जोड़ें (10m Timer)
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-slate-900">
                    बैंक या UPI ID में पैसे निकालें
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Go Wallet से अपने शेष पैसे को कभी भी वापस अपने बैंक या UPI ID में ट्रांसफर करें।
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5 pt-2">
                  <button
                    onClick={() => setActiveSection('withdraw')}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    🏦 पैसे निकालें ➔
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* SECTION 2: TRANSACTIONS TAB */}
      {activeSection === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Go3DLogoBadge size="sm" showWalletText={false} />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>📜 Go Wallet Transactions (पासबुक हिस्ट्री)</span>
                </h2>
                <p className="text-xs text-slate-300">
                  यहाँ देखें कि आपका पैसा कहाँ से आया (+₹) और कहाँ गया (-₹)
                </p>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'सभी (All)' },
                ...(isShopkeeper ? [{ id: 'sales_in', label: '🏪 + दुकान बिक्री' }] : []),
                { id: 'recharges_in', label: '💰 + रिचार्ज व कमाई' },
                { id: 'money_out', label: '💸 - निकासी व खर्च' },
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

              // 1. Pending / Rejected Recharges for this user
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
                    statusBadge: r.status === 'pending' ? '⏳ 10-MIN PENDING' : '❌ REJECTED',
                    statusColor:
                      r.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300',
                    createdAt: r.created_at,
                    filterGroup: 'recharges_in',
                  });
                }
              });

              // 2. All Transactions
              (agentWalletTransactions || []).forEach((t) => {
                const isCred = t.amount >= 0 && t.type !== 'ticket_booking' && t.type !== 'shop_ad_boost' && t.type !== 'bank_withdrawal';
                let categoryLabel = 'Go Wallet ट्रांजेक्शन';
                let statusBadge = isCred ? '✅ CREDITED' : '➖ DEBITED';
                let statusColor = isCred
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-orange-100 text-orange-800 border-orange-300';
                let filterGroup: 'sales_in' | 'recharges_in' | 'money_out' = isCred ? 'recharges_in' : 'money_out';

                if (t.type === 'quick_commerce_sale') {
                  categoryLabel = '🏪 क्विक कॉमर्स सामान बिक्री की कमाई';
                  statusBadge = '✅ SALE CREDITED';
                  filterGroup = 'sales_in';
                } else if (t.type === 'promoter_earning') {
                  categoryLabel = '👑 प्रमोटर कमाई';
                  statusBadge = '✅ PROMOTER EARNING';
                  filterGroup = 'recharges_in';
                } else if (t.type === 'recharge') {
                  categoryLabel = '💰 Go Wallet में पैसे जोड़े गए';
                  statusBadge = '✅ VERIFIED & ADDED';
                  filterGroup = 'recharges_in';
                } else if (t.type === 'ticket_booking') {
                  categoryLabel = '🚌 बस टिकट बुकिंग भुगतान';
                  statusBadge = '🚌 BUS TICKET BOOKED';
                  filterGroup = 'money_out';
                } else if (t.type === 'shop_ad_boost') {
                  categoryLabel = '🚀 दुकान को SafarGo TOP पर दिखाने में खर्च';
                  statusBadge = '👑 TOP AD BOOST';
                  statusColor = 'bg-purple-100 text-purple-800 border-purple-300';
                  filterGroup = 'money_out';
                } else if (t.type === 'bank_withdrawal') {
                  categoryLabel = '🏦 बैंक / UPI ID में पैसा निकाला गया';
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

      {/* SECTION 3: SHOPKEEPER ONLY - TOP AD BOOST */}
      {isShopkeeper && activeSection === 'top_ad' && (
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
                अपनी कमाई या शेष राशि सीधे अपने बैंक खाते या UPI ID में प्राप्त करें
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">उपलब्ध बैलेंस</span>
              <span className="text-lg font-black text-emerald-600 font-mono">
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
                  placeholder="उदा. 9876543210@ybl या user@okaxis"
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
