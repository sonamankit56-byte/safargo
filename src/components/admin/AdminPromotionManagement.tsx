import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { PromotionClaim, PromotionPlatform } from '../../types';
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
  UserCheck
} from 'lucide-react';

export const AdminPromotionManagement: React.FC = () => {
  const {
    promotionClaims,
    approvePromotionClaim,
    rejectPromotionClaim,
    settings,
  } = useData();
  const { error, success } = useToast();

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      
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
