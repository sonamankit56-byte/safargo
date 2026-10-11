import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PromoCode, PromotionClaim, PromotionPlatform } from '../../types';
import {
  Sparkles,
  Instagram,
  Youtube,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Eye,
  Filter,
  DollarSign,
  TrendingUp,
  Search,
  Check,
  X,
  CreditCard,
  Wallet,
  ShieldCheck,
  UserCheck,
  Tag,
  Percent,
  Plus,
  Trash2,
  Copy,
  Share2,
  ToggleLeft,
  ToggleRight,
  MessageSquare,
  Gift,
  Users,
  Award,
  Calendar,
  Zap,
  ArrowRight
} from 'lucide-react';

export const AdminPromotionManagement: React.FC = () => {
  const { allProfiles } = useAuth();
  const {
    promotionClaims,
    approvePromotionClaim,
    rejectPromotionClaim,
    settings,
    promoCodes,
    createPromoCode,
    togglePromoCodeStatus,
    deletePromoCode,
  } = useData();
  const { error, success } = useToast();

  // Top Tab Switcher: Promo Codes & Offers Desk vs Viral Video Claims Desk
  const [activeMainTab, setActiveMainTab] = useState<'promo_codes' | 'viral_claims'>('promo_codes');

  // Approved Agents for specific agent promo assignment
  const approvedAgents = useMemo(() => {
    return allProfiles.filter((p) => p.role === 'agent' && p.agent_status === 'approved');
  }, [allProfiles]);

  // Promo Codes Search & Filters
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [promoServiceFilter, setPromoServiceFilter] = useState<'all' | 'bus_booking' | 'quick_delivery'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Promo Code Form State
  const [isCreatePromoModalOpen, setIsCreatePromoModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDiscountType, setNewDiscountType] = useState<'flat' | 'percentage'>('flat');
  const [newDiscountValue, setNewDiscountValue] = useState<number>(50);
  const [newMaxDiscount, setNewMaxDiscount] = useState<number>(100);
  const [newMinOrder, setNewMinOrder] = useState<number>(300);
  const [newService, setNewService] = useState<'all' | 'bus_booking' | 'quick_delivery'>('all');
  const [newApplicableTo, setNewApplicableTo] = useState<'all_agents' | 'specific_agent' | 'all_customers'>('all_agents');
  const [newAssignedAgentId, setNewAssignedAgentId] = useState<string>('');
  const [newAgentBonus, setNewAgentBonus] = useState<number>(15);
  const [newUsageLimit, setNewUsageLimit] = useState<number>(500);
  const [newValidUntil, setNewValidUntil] = useState<string>('2026-12-31');

  // Viral Claims Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'rejected'>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | 'instagram' | 'youtube'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected screenshot preview modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Approval modal state
  const [approvingClaim, setApprovingClaim] = useState<PromotionClaim | null>(null);
  const [approvalRef, setApprovalRef] = useState('');
  const [approvalNotes, setApprovalNotes] = useState('');

  // Rejection modal state
  const [rejectingClaim, setRejectingClaim] = useState<PromotionClaim | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Metrics
  const stats = useMemo(() => {
    let pendingCount = 0;
    let paidCount = 0;
    let rejectedCount = 0;
    let totalPaidAmount = 0;
    let instaCount = 0;
    let ytCount = 0;

    promotionClaims.forEach((c) => {
      if (c.status === 'pending') pendingCount++;
      else if (c.status === 'paid' || c.status === 'approved') {
        paidCount++;
        totalPaidAmount += c.reward_amount;
      } else if (c.status === 'rejected') rejectedCount++;

      if (c.platform === 'instagram') instaCount++;
      if (c.platform === 'youtube') ytCount++;
    });

    return {
      total: promotionClaims.length,
      pendingCount,
      paidCount,
      rejectedCount,
      totalPaidAmount,
      instaCount,
      ytCount,
    };
  }, [promotionClaims]);

  // Filtered claims
  const filteredClaims = useMemo(() => {
    return promotionClaims.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (platformFilter !== 'all' && c.platform !== platformFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = c.claim_code.toLowerCase().includes(q);
        const matchesName = c.user_name.toLowerCase().includes(q);
        const matchesPhone = c.user_mobile.includes(q);
        const matchesHandle = c.channel_or_handle.toLowerCase().includes(q);
        if (!matchesCode && !matchesName && !matchesPhone && !matchesHandle) return false;
      }

      return true;
    });
  }, [promotionClaims, statusFilter, platformFilter, searchQuery]);

  // SLA Time Helper
  const getSlaStatus = (claim: PromotionClaim) => {
    if (claim.status !== 'pending') return null;
    const now = Date.now();
    const deadline = new Date(claim.deadline_at).getTime();
    const diffMs = deadline - now;

    if (diffMs <= 0) {
      return {
        isExpired: true,
        text: '24-घंटे SLA समाप्त (Overdue)',
        color: 'text-red-700 bg-red-100 border-red-300',
      };
    }

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return {
      isExpired: false,
      text: `${diffHours}घं ${diffMins}मि शेष (SLA)`,
      color: diffHours < 4 ? 'text-amber-700 bg-amber-100 border-amber-300' : 'text-blue-700 bg-blue-100 border-blue-300',
    };
  };

  const handleOpenApprove = (c: PromotionClaim) => {
    setApprovingClaim(c);
    setApprovalRef(`TXN-PRM-${Date.now().toString().slice(-6)}`);
    setApprovalNotes('Verified genuine views & SafarGo branding.');
  };

  const handleConfirmApprove = async () => {
    if (!approvingClaim) return;
    const ok = await approvePromotionClaim(approvingClaim.id, approvalRef, approvalNotes);
    if (ok) {
      setApprovingClaim(null);
    }
  };

  const handleOpenReject = (c: PromotionClaim) => {
    setRejectingClaim(c);
    setRejectionReason('व्यूज टारगेट से कम हैं या बॉट/फेक व्यूज पाए गए।');
  };

  const handleConfirmReject = async () => {
    if (!rejectingClaim) return;
    if (!rejectionReason.trim()) {
      error('Reason Required', 'अस्वीकृत करने का कारण दर्ज करना अनिवार्य है।');
      return;
    }
    const ok = await rejectPromotionClaim(rejectingClaim.id, rejectionReason.trim());
    if (ok) {
      setRejectingClaim(null);
    }
  };

  // Filtered Promo Codes
  const filteredPromoCodes = useMemo(() => {
    return promoCodes.filter((p) => {
      if (promoServiceFilter !== 'all' && p.applicable_service !== 'all' && p.applicable_service !== promoServiceFilter) {
        return false;
      }
      if (promoSearchQuery.trim()) {
        const q = promoSearchQuery.toLowerCase().trim();
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesAgent = p.assigned_agent_name?.toLowerCase().includes(q);
        if (!matchesCode && !matchesTitle && !matchesAgent) return false;
      }
      return true;
    });
  }, [promoCodes, promoServiceFilter, promoSearchQuery]);

  const promoStats = useMemo(() => {
    const totalCodes = promoCodes.length;
    const activeCodes = promoCodes.filter((p) => p.is_active).length;
    const totalRedemptions = promoCodes.reduce((sum, p) => sum + p.used_count, 0);
    const totalAgentBonuses = promoCodes.reduce((sum, p) => sum + (p.agent_extra_incentive * p.used_count), 0);
    return { totalCodes, activeCodes, totalRedemptions, totalAgentBonuses };
  }, [promoCodes]);

  const handleCreatePromoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      error('Code Required', 'कृपया प्रोमो कोड (उदा. SAFAR50) दर्ज करें।');
      return;
    }
    if (!newTitle.trim()) {
      error('Title Required', 'कृपया ऑफर का शीर्षक दर्ज करें।');
      return;
    }
    if (newDiscountValue <= 0) {
      error('Invalid Discount', 'छूट का मान शून्य से अधिक होना चाहिए।');
      return;
    }

    const assignedAgent = approvedAgents.find((a) => a.id === newAssignedAgentId);

    const created = await createPromoCode({
      code: newCode.trim().toUpperCase(),
      title: newTitle.trim(),
      description: newDescription.trim() || `${newTitle.trim()} - SafarGo स्पेशल ऑफर`,
      discount_type: newDiscountType,
      discount_value: Number(newDiscountValue),
      max_discount_amount: newDiscountType === 'percentage' ? Number(newMaxDiscount) : undefined,
      min_order_amount: Number(newMinOrder) || 0,
      applicable_service: newService,
      applicable_to: newApplicableTo,
      assigned_agent_id: newApplicableTo === 'specific_agent' ? assignedAgent?.id : undefined,
      assigned_agent_name: newApplicableTo === 'specific_agent' ? assignedAgent?.full_name : undefined,
      agent_extra_incentive: Number(newAgentBonus) || 0,
      usage_limit: Number(newUsageLimit) || 100,
      valid_from: new Date().toISOString(),
      valid_until: new Date(`${newValidUntil}T23:59:59Z`).toISOString(),
      is_active: true,
    });

    if (created) {
      setIsCreatePromoModalOpen(false);
      setNewCode('');
      setNewTitle('');
      setNewDescription('');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
      {/* 1. Super Admin Desk Tabs: Promo Codes & Offers vs Viral Video Claims */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="inline-flex rounded-2xl bg-slate-200/80 p-1.5 text-xs font-bold shadow-inner">
          <button
            onClick={() => setActiveMainTab('promo_codes')}
            className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'promo_codes'
                ? 'bg-white text-indigo-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 text-indigo-600" />
            <span>🎟️ प्रोमो कोड एवं ऑफर्स डेस्क ({promoCodes.length})</span>
          </button>
          <button
            onClick={() => setActiveMainTab('viral_claims')}
            className={`px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeMainTab === 'viral_claims'
                ? 'bg-white text-purple-900 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>📹 वायरल वीडियो क्लेम्स ({stats.total})</span>
            {stats.pendingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                {stats.pendingCount}
              </span>
            )}
          </button>
        </div>

        {activeMainTab === 'promo_codes' && (
          <button
            onClick={() => setIsCreatePromoModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>नया प्रोमो कोड / ऑफर बनाएं (+ Create Offer)</span>
          </button>
        )}
      </div>

      {/* ===================================================================== */}
      {/* VIEW A: PROMO CODES & OFFERS MANAGEMENT (ACTIVE BY DEFAULT)           */}
      {/* ===================================================================== */}
      {activeMainTab === 'promo_codes' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Promo Desk Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-500/30">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>सफ़ारगो प्रोमो कोड एवं डिस्काउंट सिस्टम</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                प्रोमो कोड एवं विशेष डिस्काउंट ऑफर्स डेस्क
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                बस टिकट एवं 15-मिनट डिलीवरी हेतु डिस्काउंट कूपन बनाएं। एजेंट्स को प्रति बुकिंग अतिरिक्त कमीशन प्रोत्साहन (Incentive Bonus) देकर बुकिंग संख्या बढ़ाएं!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[110px]">
                <span className="block text-2xl font-black text-amber-300">
                  {promoStats.activeCodes} / {promoStats.totalCodes}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  सक्रिय ऑफर्स
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[110px]">
                <span className="block text-2xl font-black text-emerald-400">
                  {promoStats.totalRedemptions}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  कुल उपयोग (Redeemed)
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center min-w-[120px]">
                <span className="block text-2xl font-black text-indigo-300">
                  ₹{promoStats.totalAgentBonuses}
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  एजेंट बोनस पूल
                </span>
              </div>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promoSearchQuery}
                onChange={(e) => setPromoSearchQuery(e.target.value)}
                placeholder="प्रोमो कोड, शीर्षक या एजेंट का नाम खोजें..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setPromoServiceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    promoServiceFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  सभी सेवाएं ({promoCodes.length})
                </button>
                <button
                  onClick={() => setPromoServiceFilter('bus_booking')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    promoServiceFilter === 'bus_booking' ? 'bg-indigo-600 text-white shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  🚌 बस बुकिंग
                </button>
                <button
                  onClick={() => setPromoServiceFilter('quick_delivery')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    promoServiceFilter === 'quick_delivery' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'
                  }`}
                >
                  ⚡ 15-मिनट डिलीवरी
                </button>
              </div>
            </div>
          </div>

          {/* Promo Codes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPromoCodes.map((promo) => (
              <div
                key={promo.id}
                className={`bg-white rounded-3xl p-5 border-2 shadow-sm space-y-4 transition flex flex-col justify-between ${
                  promo.is_active ? 'border-slate-200 hover:border-indigo-400' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar with Code & Service */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" />
                        <span>{promo.code}</span>
                      </span>
                      <button
                        onClick={() => handleCopyCode(promo.code)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                        title="कोड कॉपी करें"
                      >
                        {copiedCode === promo.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      promo.applicable_service === 'bus_booking'
                        ? 'bg-blue-100 text-blue-800'
                        : promo.applicable_service === 'quick_delivery'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {promo.applicable_service === 'bus_booking' && '🚌 बस बुकिंग'}
                      {promo.applicable_service === 'quick_delivery' && '⚡ 15-मिनट डिलीवरी'}
                      {promo.applicable_service === 'all' && '🌐 सभी सेवाएं'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">{promo.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{promo.description}</p>
                  </div>

                  {/* Discount & Min Order Details */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">छूट (Discount):</span>
                      <strong className="text-emerald-700 font-black text-sm">
                        {promo.discount_type === 'flat' ? `₹${promo.discount_value} फ्लैट` : `${promo.discount_value}% छूट`}
                        {promo.max_discount_amount ? ` (अधिकतम ₹${promo.max_discount_amount})` : ''}
                      </strong>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">न्यूनतम ऑर्डर:</span>
                      <span className="font-bold text-slate-700">₹{promo.min_order_amount}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500">लागू टारगेट:</span>
                      <span className="font-bold text-slate-700">
                        {promo.applicable_to === 'specific_agent'
                          ? `🎯 ${promo.assigned_agent_name || 'विशिष्ट एजेंट'}`
                          : promo.applicable_to === 'all_agents'
                          ? '👥 सभी अधिकृत एजेंट्स'
                          : '👤 सभी ग्राहक'}
                      </span>
                    </div>
                  </div>

                  {/* Agent Extra Incentive Callout */}
                  {promo.agent_extra_incentive > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                      <span className="font-bold flex items-center gap-1.5">
                        <Gift className="w-4 h-4 text-amber-600" />
                        <span>एजेंट अतिरिक्त बोनस:</span>
                      </span>
                      <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                        +₹{promo.agent_extra_incentive} / बुकिंग
                      </span>
                    </div>
                  )}

                  {/* Usage Progress */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>उपयोग सीमा (Usage):</span>
                      <span className="font-bold text-slate-700">
                        {promo.used_count} / {promo.usage_limit} उपयोग
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (promo.used_count / promo.usage_limit) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>वैधता: {new Date(promo.valid_until).toLocaleDateString('hi-IN', { dateStyle: 'medium' })} तक</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => togglePromoCodeStatus(promo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      promo.is_active
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {promo.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{promo.is_active ? 'सक्रिय (Active)' : 'निष्क्रिय (Paused)'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* 1-Click WhatsApp Share */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`🎉 SafarGo स्पेशल ऑफर: ${promo.title}!\n\n🎟️ प्रोमो कोड: *${promo.code}*\n💰 छूट: ${promo.discount_type === 'flat' ? `₹${promo.discount_value} फ्लैट` : `${promo.discount_value}%`}\n\nआज ही अपनी बस टिकट या 15-मिनट डिलीवरी बुक करें: https://safargo.in`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition"
                      title="WhatsApp पर शेयर करें"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>

                    {/* Delete */}
                    <button
                      onClick={() => {
                        if (window.confirm(`क्या आप वाकई प्रोमो कोड "${promo.code}" हटाना चाहते हैं?`)) {
                          deletePromoCode(promo.id);
                        }
                      }}
                      className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
                      title="प्रोमो कोड हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPromoCodes.length === 0 && (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
              <Tag className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="text-base font-bold text-slate-700">कोई प्रोमो कोड नहीं मिला</h3>
              <p className="text-xs text-slate-500">ऊपर दिए बटन से नया प्रोमो कोड व डिस्काउंट ऑफर बनाएं।</p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW B: VIRAL VIDEO CLAIMS DESK (ORIGINAL)                            */}
      {/* ===================================================================== */}
      {activeMainTab === 'viral_claims' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>SafarGo Viral Creator Desk</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                वायरल क्रिएटर प्रमोशन सत्यापन (Promotion Verification)
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Instagram Reels (1M = ₹500) एवं YouTube Videos (10k = ₹100) के क्लेम्स की 24-घंटे में समीक्षा व बोनस भुगतान।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="block text-2xl font-black text-amber-300">
              {stats.pendingCount}
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              लंबित समीक्षा (Pending)
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="block text-2xl font-black text-emerald-400">
              ₹{stats.totalPaidAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              कुल भुगतान (Paid Bonus)
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
            {stats.total}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">कुल क्लेम्स</span>
            <span className="text-lg font-black text-slate-800">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Instagram Reels</span>
            <span className="text-lg font-black text-purple-900">{stats.instaCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">YouTube Videos</span>
            <span className="text-lg font-black text-red-900">{stats.ytCount}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">स्वीकृत व पेड</span>
            <span className="text-lg font-black text-emerald-800">{stats.paidCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ID, नाम, मोबाइल या हैंडल खोजें..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-orange-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              सभी ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              लंबित ({stats.pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'paid' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              पेड ({stats.paidCount})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'rejected' ? 'bg-red-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              अस्वीकृत ({stats.rejectedCount})
            </button>
          </div>

          {/* Platform Filter */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
            <button
              onClick={() => setPlatformFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                platformFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              ऑल प्लेटफॉर्म्स
            </button>
            <button
              onClick={() => setPlatformFilter('instagram')}
              className={`px-3 py-1.5 rounded-lg transition ${
                platformFilter === 'instagram' ? 'bg-purple-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Instagram (1M)
            </button>
            <button
              onClick={() => setPlatformFilter('youtube')}
              className={`px-3 py-1.5 rounded-lg transition ${
                platformFilter === 'youtube' ? 'bg-red-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              YouTube (10K)
            </button>
          </div>
        </div>
      </div>

      {/* Claims List Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredClaims.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">कोई प्रमोशन क्लेम नहीं मिला</p>
            <p className="text-xs text-slate-400">चुने गए फ़िल्टर के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-4">क्लेम ID व समय</th>
                  <th className="px-5 py-4">क्रिएटर / एजेंट</th>
                  <th className="px-5 py-4">प्लेटफॉर्म व लिंक</th>
                  <th className="px-5 py-4">व्यूज व रिवॉर्ड</th>
                  <th className="px-5 py-4">24-Hour SLA स्टेटस</th>
                  <th className="px-5 py-4">पेमेंट विवरण</th>
                  <th className="px-5 py-4 text-right">कार्रवाई (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredClaims.map((claim) => {
                  const isInsta = claim.platform === 'instagram';
                  const sla = getSlaStatus(claim);
                  const isPending = claim.status === 'pending';
                  const isPaid = claim.status === 'paid' || claim.status === 'approved';
                  const isRejected = claim.status === 'rejected';

                  return (
                    <tr key={claim.id} className="hover:bg-slate-50/80 transition">
                      
                      {/* ID & Time */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-slate-900 block">
                          {claim.claim_code}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(claim.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </td>

                      {/* Creator Info */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{claim.user_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{claim.user_mobile}</div>
                        <div className="text-[11px] text-purple-700 font-semibold">{claim.channel_or_handle}</div>
                        <span className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold ${
                          claim.user_role === 'agent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {claim.user_role === 'agent' ? '💼 SafarGo Agent' : '🎨 Public Creator'}
                        </span>
                      </td>

                      {/* Platform & Link */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isInsta ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold text-[11px]">
                              <Instagram className="w-3 h-3" />
                              Instagram Reel
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold text-[11px]">
                              <Youtube className="w-3 h-3" />
                              YouTube Video
                            </span>
                          )}
                        </div>

                        <a
                          href={claim.post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-[11px] underline max-w-[180px] truncate"
                        >
                          <span>रीयल वीडियो देखें</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>

                        {claim.screenshot_url && (
                          <div className="mt-1">
                            <button
                              type="button"
                              onClick={() => setPreviewScreenshotUrl(claim.screenshot_url || null)}
                              className="inline-flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 underline"
                            >
                              <Eye className="w-3 h-3 text-slate-400" />
                              <span>प्रूफ फोटो देखें</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Views & Reward */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-black text-slate-900 text-sm">
                          {claim.views_count.toLocaleString('en-IN')} Views
                        </div>
                        <div className="text-[11px] font-black text-emerald-600">
                          बोनस: ₹{claim.reward_amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          टारगेट: {isInsta ? '1,000,000 (1M)' : '10,000 (10K)'}
                        </div>
                      </td>

                      {/* SLA Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {isPending && sla ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${sla.color}`}>
                            <Clock className="w-3 h-3" />
                            {sla.text}
                          </span>
                        ) : isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            भुगतान संपन्न (Paid)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3 h-3 text-red-600" />
                            अस्वीकृत (Rejected)
                          </span>
                        )}

                        {claim.rejection_reason && (
                          <p className="text-[10px] text-red-600 mt-1 max-w-[150px] truncate" title={claim.rejection_reason}>
                            कारण: {claim.rejection_reason}
                          </p>
                        )}
                      </td>

                      {/* Payout Details */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 capitalize">
                          {claim.payout_method === 'wallet' && <Wallet className="w-3 h-3 text-orange-500" />}
                          {claim.payout_method === 'upi' && <Sparkles className="w-3 h-3 text-emerald-500" />}
                          {claim.payout_method === 'bank' && <CreditCard className="w-3 h-3 text-blue-500" />}
                          <span>{claim.payout_method === 'wallet' ? 'SafarGo Wallet' : claim.payout_method.toUpperCase()}</span>
                        </div>

                        {claim.upi_id && (
                          <div className="font-mono text-[10px] text-slate-600 truncate max-w-[150px]">
                            {claim.upi_id}
                          </div>
                        )}
                        {claim.bank_details && (
                          <div className="text-[10px] text-slate-600 truncate max-w-[150px]">
                            {claim.bank_details}
                          </div>
                        )}
                        {claim.payment_reference && (
                          <div className="font-mono text-[10px] text-emerald-700 font-bold">
                            Ref: {claim.payment_reference}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenApprove(claim)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center gap-1 shadow-sm active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>स्वीकृत करें (₹{claim.reward_amount})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenReject(claim)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold text-xs transition border border-slate-200"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>अस्वीकृत</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">
                            समीक्षित ({new Date(claim.reviewed_at || claim.created_at).toLocaleDateString('en-IN')})
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
      )}

      {/* ===================================================================== */}
      {/* CREATE NEW PROMO CODE / OFFER MODAL (FOR SUPER ADMIN)                 */}
      {/* ===================================================================== */}
      {isCreatePromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    नया प्रोमो कोड व डिस्काउंट ऑफर बनाएं
                  </h3>
                  <p className="text-xs text-slate-500">
                    यात्रियों को छूट दें एवं एजेंट्स को अतिरिक्त प्रोत्साहन बोनस दें
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreatePromoModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePromoSubmit} className="space-y-4 text-xs">
              {/* Row 1: Promo Code & Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    प्रोमो कोड (Promo Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="उदा. DIWALI50, SAFAR10"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-black text-sm uppercase tracking-wider outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">ऑटोमैटिक कैपिटल लेटर्स में दर्ज होगा</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    लागू सेवा (Service) *
                  </label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">🌐 सभी सेवाएं (All Services)</option>
                    <option value="bus_booking">🚌 केवल बस बुकिंग (Bus Booking)</option>
                    <option value="quick_delivery">⚡ केवल 15-मिनट डिलीवरी (Quick Delivery)</option>
                  </select>
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ऑफर का शीर्षक (Offer Title) *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="उदा. दीपावली महा धमाका: ₹50 फ्लैट छूट"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ऑफर विवरण (Description)
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="ऑफर की शर्तें, लाभ व जानकारी..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              {/* Discount Type & Values */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    छूट का प्रकार (Discount Type) *
                  </label>
                  <select
                    value={newDiscountType}
                    onChange={(e) => setNewDiscountType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="flat">₹ फ्लैट छूट (Flat Amount)</option>
                    <option value="percentage">% प्रतिशत छूट (Percentage)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    छूट मूल्य (Value) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newDiscountValue}
                    onChange={(e) => setNewDiscountValue(Number(e.target.value))}
                    placeholder={newDiscountType === 'flat' ? '50' : '10'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {newDiscountType === 'flat' ? 'रुपये में (₹)' : 'प्रतिशत में (%)'}
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    न्यूनतम ऑर्डर राशि (Min Order ₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Target Audience & Specific Agent Option */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      ऑफर टारगेट (Target Audience) *
                    </label>
                    <select
                      value={newApplicableTo}
                      onChange={(e) => setNewApplicableTo(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="all_agents">👥 सभी अधिकृत एजेंट्स (All Agents)</option>
                      <option value="specific_agent">🎯 विशिष्ट एजेंट (Specific Agent)</option>
                      <option value="all_customers">👤 सभी ग्राहक (All Customers)</option>
                    </select>
                  </div>

                  {newApplicableTo === 'specific_agent' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        अधिकृत एजेंट चुनें *
                      </label>
                      <select
                        value={newAssignedAgentId}
                        onChange={(e) => setNewAssignedAgentId(e.target.value)}
                        required
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">-- एजेंट चुनें --</option>
                        {approvedAgents.map((ag) => (
                          <option key={ag.id} value={ag.id}>
                            {ag.full_name} ({ag.city} - {ag.mobile})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block font-bold text-amber-900 mb-1 flex items-center gap-1">
                      <span>💰 एजेंट अतिरिक्त प्रोत्साहन बोनस (₹)</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newAgentBonus}
                      onChange={(e) => setNewAgentBonus(Number(e.target.value))}
                      placeholder="15"
                      className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-amber-50/50 font-black text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-amber-800 mt-0.5 block">
                      कूपन उपयोग होने पर एजेंट के वॉलेट में स्वतः जुड़ने वाला बोनस
                    </span>
                  </div>
                </div>
              </div>

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    अधिकतम उपयोग सीमा (Usage Limit)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={newUsageLimit}
                    onChange={(e) => setNewUsageLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">कुल कितनी बार यह कोड उपयोग हो सकता है</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    अंतिम वैधता तिथि (Expiry Date) *
                  </label>
                  <input
                    type="date"
                    required
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreatePromoModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-700 hover:from-emerald-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ऑफर लाइव करें (Publish Offer)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {approvingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  प्रमोशन रिवॉर्ड स्वीकृत व भुगतान
                </h3>
                <p className="text-xs text-slate-500">
                  ID: #{approvingClaim.claim_code} ({approvingClaim.platform.toUpperCase()})
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">क्रिएटर:</span>
                <span className="font-bold text-slate-900">{approvingClaim.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">सत्यापित व्यूज:</span>
                <span className="font-bold text-slate-900">{approvingClaim.views_count.toLocaleString('en-IN')} Views</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">बोनस राशि:</span>
                <span className="font-black text-emerald-700 text-sm">₹{approvingClaim.reward_amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">भुगतान माध्यम:</span>
                <span className="font-bold text-slate-900 capitalize">{approvingClaim.payout_method}</span>
              </div>
              {approvingClaim.payout_method === 'wallet' && approvingClaim.user_role === 'agent' && (
                <div className="pt-1 text-[11px] text-emerald-800 font-semibold">
                  ⚡ यह राशि सीधे एजेंट के SafarGo वॉलेट में अभी क्रेडिट हो जाएगी।
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  पेमेंट रेफरेंस / UTR / Txn ID
                </label>
                <input
                  type="text"
                  value={approvalRef}
                  onChange={(e) => setApprovalRef(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                  placeholder="उदा. TXN-PRM-123456"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  एडमिन सत्यापन टिप्पणी (Admin Notes)
                </label>
                <input
                  type="text"
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-xs"
                  placeholder="उदा. Verified authentic views & SafarGo branding."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApprovingClaim(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-md"
              >
                पुष्टि करें और ₹{approvingClaim.reward_amount} भेजें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  प्रमोशन क्लेम अस्वीकृत करें
                </h3>
                <p className="text-xs text-slate-500">
                  ID: #{rejectingClaim.claim_code} ({rejectingClaim.platform.toUpperCase()})
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                अस्वीकृति का कारण (Reason for Rejection) *
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-red-500 text-xs font-medium"
                placeholder="कारण दर्ज करें..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingClaim(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50 transition"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition shadow-md"
              >
                अस्वीकृत करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screenshot Preview Lightbox Modal */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-4 shadow-2xl border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-xs text-slate-700">एनालिटिक्स / स्क्रीनशॉट प्रमाण</span>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-3 flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewScreenshotUrl}
                alt="Uploaded Analytics Proof"
                className="max-h-[65vh] object-contain rounded-xl shadow-xs"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
