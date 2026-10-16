import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Wallet,
  Bus,
  Search,
  MessageSquare,
  Gift,
  ArrowRight,
  ExternalLink,
  Send,
  Save,
  AlertCircle,
  Filter,
  DollarSign,
} from 'lucide-react';
import { Booking, SupportTicket } from '../../types';

export const AdminGoAgentDesk: React.FC = () => {
  const { allProfiles, approveAgentKyc, updateUserProfile } = useAuth();
  const {
    bookings,
    confirmBooking,
    rejectBooking,
    payoutRequests,
    approvePayout,
    updatePayoutStatus,
    supportTickets,
    replyToSupportTicket,
    resolveSupportTicket,
    settings,
    updateSettings,
  } = useData();
  const { success, error, info } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<'bookings' | 'kyc' | 'payouts' | 'support' | 'referral'>('bookings');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Booking Approval State
  const [approvingBookingId, setApprovingBookingId] = useState<string | null>(null);
  const [customPnr, setCustomPnr] = useState('');
  const [confirmedSeats, setConfirmedSeats] = useState('');
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('सीट अनुपलब्ध / ऑपरेटर कन्फर्मेशन समय समाप्त');

  // Payout Approval State
  const [approvingPayoutId, setApprovingPayoutId] = useState<string | null>(null);
  const [payoutUtr, setPayoutUtr] = useState('');

  // Support Reply State
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Refer & Earn Settings State
  const [referralBonus, setReferralBonus] = useState<number>(settings.referral_reward_amount || 100);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Filter pending bookings
  const pendingBookings = useMemo(() => {
    return bookings.filter(
      (b) => b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation'
    );
  }, [bookings]);

  // Filter pending KYC agents
  const pendingKycAgents = useMemo(() => {
    return allProfiles.filter(
      (p) => (p.role === 'agent' || p.agent_status) && p.kyc_status?.toLowerCase().trim() === 'pending'
    );
  }, [allProfiles]);

  // Filter pending payouts
  const pendingPayouts = useMemo(() => {
    return payoutRequests.filter(
      (p) => p.status === 'pending' || p.status === 'processing'
    );
  }, [payoutRequests]);

  // Filter pending support tickets
  const pendingTickets = useMemo(() => {
    return supportTickets.filter(
      (t) => t.status === 'pending' || t.status === 'open'
    );
  }, [supportTickets]);

  // Handle 1-Click Approve Booking with PNR
  const handleApproveBooking = async (b: Booking) => {
    const pnrToUse = customPnr.trim() || `SG-${Math.floor(100000 + Math.random() * 900000)}`;
    const seatsToUse = confirmedSeats.trim() || b.confirmed_seats || `${b.seat_count || 1} Seat(s)`;
    const fareToUse = Number(b.total_fare || b.actual_fare || b.total_estimated_amount || 450);

    const ok = await confirmBooking(b.id, {
      actual_fare: fareToUse,
      confirmed_seats: seatsToUse,
      actual_operator: b.actual_operator || b.operator_preference || 'SafarGo Superfast Express',
      actual_boarding_point: b.boarding_point || `${b.from_city} Bus Stand`,
      actual_drop_point: b.drop_point || `${b.to_city} Bus Stand`,
      ticket_pnr: pnrToUse,
      admin_notes: `Admin 1-Click Approved PNR: ${pnrToUse}`,
    });

    if (ok) {
      setApprovingBookingId(null);
      setCustomPnr('');
      setConfirmedSeats('');
      success('बुकिंग स्वीकृत! 🎫', `PNR ${pnrToUse} जारी किया गया। एजेंट के डैशबोर्ड पर टिकट कन्फर्म हो गई।`);
    }
  };

  // Handle Reject Booking
  const handleRejectBookingSubmit = async (bookingId: string) => {
    const ok = await rejectBooking(bookingId, rejectReason);
    if (ok) {
      setRejectingBookingId(null);
      setRejectReason('सीट अनुपलब्ध / ऑपरेटर कन्फर्मेशन समय समाप्त');
      info('बुकिंग अस्वीकृत', 'बुकिंग रद्द कर दी गई है।');
    }
  };

  // Handle 1-Click Approve KYC
  const handleApproveKyc = async (agentId: string) => {
    const ok = await approveAgentKyc(agentId);
    if (ok) {
      success('KYC स्वीकृत! ✓', 'एजेंट का KYC सफलतापूर्वक सत्यापित कर दिया गया है।');
    }
  };

  // Handle Reject KYC
  const handleRejectKyc = async (agentId: string) => {
    if (updateUserProfile) {
      await updateUserProfile(agentId, { kyc_status: 'rejected' });
      info('KYC अस्वीकृत', 'एजेंट की KYC अस्वीकृत कर दी गई है। एजेंट पुनः सबमिट कर सकेगा।');
    }
  };

  // Handle Approve Payout
  const handleApprovePayoutSubmit = async (payoutId: string) => {
    const utr = payoutUtr.trim() || `UTR${Date.now()}`;
    const ok = await approvePayout(payoutId, utr, 'साप्ताहिक रविवार पेआउट चुकता');
    if (ok) {
      setApprovingPayoutId(null);
      setPayoutUtr('');
      success('पेआउट स्वीकृत! 💰', `UTR: ${utr} दर्ज किया गया। एजेंट का पेआउट सफल घोषित हुआ।`);
    }
  };

  // Handle Reply to Support Ticket
  const handleReplyTicket = async (ticketId: string) => {
    if (!replyMessage.trim()) return;
    const ok = await replyToSupportTicket(ticketId, replyMessage.trim());
    if (ok) {
      setReplyMessage('');
      success('उत्तर भेजा गया', 'सपोर्ट टिकट पर आपका संदेश एजेंट को भेज दिया गया है।');
    }
  };

  // Handle Resolve Support Ticket
  const handleResolveTicket = async (ticketId: string) => {
    const ok = await resolveSupportTicket(ticketId, 'समाधान पूर्ण कर दिया गया है।');
    if (ok) {
      setSelectedTicketId(null);
      success('टिकट हल हुआ! ✓', 'सपोर्ट टिकट को सफलता पूर्वक हल (Resolved) घोषित किया गया।');
    }
  };

  // Handle Save Refer & Earn Settings
  const handleSaveReferralSettings = async () => {
    setIsSavingSettings(true);
    try {
      const ok = await updateSettings({
        referral_reward_amount: Number(referralBonus) || 100,
      });
      if (ok) {
        success('रेफरल सेटिंग्स सुरक्षित!', `अब प्रत्येक 5 बुकिंग पर ₹${referralBonus} रेफरल रिवॉर्ड लागू होगा।`);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 border-2 border-red-500/50 shadow-xl text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[10px] uppercase tracking-wider">
              GO AGENT OPERATIONS DESK
            </span>
            <h2 className="text-2xl font-black">GO एजेंट प्रबंधन एवं अप्रूवल टर्मिनल</h2>
            <p className="text-xs text-slate-400">
              बस बुकिंग अप्रूवल (1-क्लिक PNR), 24h KYC सत्यापन, साप्ताहिक निकासी सेटलमेंट एवं सपोर्ट टिकट डेस्क
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-amber-300">
              ⏳ लंबित बुकिंग्स: {pendingBookings.length}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-emerald-300">
              📋 लंबित KYC: {pendingKycAgents.length}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-cyan-300">
              💳 लंबित पेआउट्स: {pendingPayouts.length}
            </span>
          </div>
        </div>

        {/* 5 Core Desks Navigation Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-800">
          
          <button
            type="button"
            onClick={() => setActiveSubTab('bookings')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'bookings'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>लंबित बुकिंग्स ({pendingBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('kyc')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'kyc'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>KYC सत्यापन ({pendingKycAgents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('payouts')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'payouts'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>साप्ताहिक पेआउट्स ({pendingPayouts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('support')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'support'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>सपोर्ट टिकट्स ({pendingTickets.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('referral')}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeSubTab === 'referral'
                ? 'bg-red-600 text-white font-black shadow-md'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>रेफर & अर्न सेटिंग्स</span>
          </button>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. SUB-TAB: PENDING BOOKINGS (1-CLICK APPROVE WITH PNR)         */}
      {/* ============================================================== */}
      {activeSubTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                लंबित GO एजेंट बुकिंग्स ({pendingBookings.length})
              </h3>
              <p className="text-xs text-slate-500">
                स्वीकृति देते ही PNR जनरेट होगा, एजेंट को ₹20 कमीशन मिलेगा और एजेंट टर्मिनल तुरंत 'कन्फर्म' हो जाएगा।
              </p>
            </div>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-600">कोई भी लंबित बुकिंग नहीं है!</p>
              <p className="text-xs text-slate-400">सभी बस बुकिंग्स स्वीकृत अथवा प्रोसेस की जा चुकी हैं।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-3 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-mono text-sm">{b.booking_code}</strong>
                        <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold text-[10px]">
                          5-मिनट टाइमर सक्रिय
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-bold mt-1">
                        {b.from_city} ➔ {b.to_city} • यात्रा तिथि: {b.journey_date}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-slate-900 font-mono">
                        ₹{(b.total_fare || b.actual_fare || 450).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold block">
                        +₹20 एजेंट कमीशन देय
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div>
                      यात्री: <strong className="text-slate-900">{b.customer_name}</strong>
                    </div>
                    <div>
                      मोबाइल: <strong className="text-slate-900 font-mono">+91 {b.customer_mobile}</strong>
                    </div>
                    <div>
                      एजेंट: <strong className="text-slate-900">{b.agent_name || 'GO एजेंट'}</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {approvingBookingId === b.id ? (
                      <div className="w-full flex flex-col sm:flex-row items-center gap-2 bg-white p-3 rounded-xl border border-amber-300">
                        <input
                          type="text"
                          value={customPnr}
                          onChange={(e) => setCustomPnr(e.target.value)}
                          placeholder="कस्टम PNR दर्ज करें (या खाली छोड़ें)"
                          className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleApproveBooking(b)}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs transition cursor-pointer"
                        >
                          पुष्टि करें व PNR जारी करें ➔
                        </button>
                        <button
                          type="button"
                          onClick={() => setApprovingBookingId(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          रद्द
                        </button>
                      </div>
                    ) : rejectingBookingId === b.id ? (
                      <div className="w-full flex flex-col sm:flex-row items-center gap-2 bg-white p-3 rounded-xl border border-rose-300">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="अस्वीकृति का कारण"
                          className="flex-1 p-2 rounded-lg border border-slate-300 text-xs outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRejectBookingSubmit(b.id)}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-lg text-xs transition cursor-pointer"
                        >
                          अस्वीकृत करें
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejectingBookingId(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs"
                        >
                          रद्द
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-500">
                          ऑपरेटर: {b.actual_operator || b.operator_preference || 'SafarGo Superfast'}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCustomPnr(`SG-${Math.floor(100000 + Math.random() * 900000)}`);
                              setApprovingBookingId(b.id);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>1-क्लिक अप्रूव व PNR जारी करें</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectingBookingId(b.id)}
                            className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
                          >
                            रद्द करें
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUB-TAB: KYC VERIFICATION DESK                              */}
      {/* ============================================================== */}
      {activeSubTab === 'kyc' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              लंबित KYC सत्यापन अनुरोध ({pendingKycAgents.length})
            </h3>
            <p className="text-xs text-slate-500">
              एजेंटों द्वारा जमा किए गए आधार व पैन कार्ड का सत्यापन करें (24-Hour SLA Guarantee)।
            </p>
          </div>

          {pendingKycAgents.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-600">सभी एजेंट KYC सत्यापित हैं!</p>
              <p className="text-xs text-slate-400">कोई भी नया KYC अनुरोध लंबित नहीं है।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingKycAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{agent.full_name}</h4>
                      <p className="text-xs text-slate-600">
                        {agent.shop_name || 'दुकानदार'} • मोबाइल: <strong className="font-mono text-slate-900">+91 {agent.mobile}</strong>
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300">
                      समीक्षाधीन (Pending)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-400 block text-[11px]">आधार कार्ड नंबर:</span>
                      <strong className="font-mono text-slate-900 text-sm">
                        {agent.aadhaar_number || 'उपलब्ध नहीं'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">पैन कार्ड नंबर:</span>
                      <strong className="font-mono text-slate-900 text-sm">
                        {agent.pan_number || 'उपलब्ध नहीं'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleRejectKyc(agent.id)}
                      className="px-4 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs transition cursor-pointer"
                    >
                      अस्वीकृत करें
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveKyc(agent.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>KYC स्वीकृत करें (100% Verified Badge)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUB-TAB: WEEKLY WITHDRAWALS & PAYOUTS                       */}
      {/* ============================================================== */}
      {activeSubTab === 'payouts' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              साप्ताहिक रविवार पेआउट अनुरोध ({pendingPayouts.length})
            </h3>
            <p className="text-xs text-slate-500">
              एजेंटों द्वारा अनुरोधित Go Wallet कमाई की निकासी। UTR दर्ज कर 1-क्लिक में चुकता करें।
            </p>
          </div>

          {pendingPayouts.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Wallet className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-600">कोई भी लंबित पेआउट नहीं है!</p>
              <p className="text-xs text-slate-400">सभी साप्ताहिक निकासी अनुरोध प्रोसेस हो चुके हैं।</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{p.agent_name || 'एजेंट'}</h4>
                      <p className="text-xs text-slate-600 font-mono">+91 {p.agent_mobile || '9826011223'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-600 font-mono block">
                        ₹{p.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-500">साप्ताहिक सेटलमेंट</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">माध्यम:</span>
                      <strong className="uppercase">{p.payout_method === 'bank_transfer' ? '🏦 बैंक ट्रांसफर' : '📱 UPI'}</strong>
                    </div>
                    {p.upi_id && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">UPI ID:</span>
                        <strong className="font-mono text-emerald-600">{p.upi_id}</strong>
                      </div>
                    )}
                    {p.bank_account_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">बैंक खाता:</span>
                        <strong className="font-mono">{p.bank_name} A/c: {p.bank_account_number} ({p.bank_ifsc})</strong>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    {approvingPayoutId === p.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          value={payoutUtr}
                          onChange={(e) => setPayoutUtr(e.target.value)}
                          placeholder="बैंक UTR / Ref नंबर दर्ज करें"
                          className="flex-1 p-2 rounded-lg border border-slate-300 text-xs font-mono outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleApprovePayoutSubmit(p.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-lg text-xs"
                        >
                          भुगतान पूर्ण मार्क करें
                        </button>
                        <button
                          type="button"
                          onClick={() => setApprovingPayoutId(null)}
                          className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs"
                        >
                          रद्द
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setPayoutUtr(`UTR${Date.now()}`);
                          setApprovingPayoutId(p.id);
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>स्वीकृत करें व भुगतान चुकता करें</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUB-TAB: SUPPORT TICKETS DESK                               */}
      {/* ============================================================== */}
      {activeSubTab === 'support' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              एजेंट सहायता व सपोर्ट टिकट ({pendingTickets.length})
            </h3>
            <p className="text-xs text-slate-500">
              24 घंटे में समाधान गारंटी डेस्क • एजेंटों के प्रश्नों का उत्तर दें एवं हल मार्क करें।
            </p>
          </div>

          {pendingTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-600">कोई भी लंबित सपोर्ट टिकट नहीं है!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3"
                >
                  <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{t.subject}</h4>
                      <p className="text-xs text-slate-500 font-mono">#{t.ticket_code || t.id.slice(-6)} • एजेंट: {t.agent_name || t.agent_mobile}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                      24h SLA Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    {t.description}
                  </p>

                  {/* Messages Thread if any */}
                  {t.messages && t.messages.length > 0 && (
                    <div className="space-y-2 pt-1">
                      {t.messages.map((m) => (
                        <div key={m.id} className="p-2.5 rounded-xl bg-slate-100 text-xs text-slate-800">
                          <strong className="block text-[10px] text-slate-500 uppercase">{m.sender_role}:</strong>
                          {m.message}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                    <input
                      type="text"
                      value={selectedTicketId === t.id ? replyMessage : ''}
                      onChange={(e) => {
                        setSelectedTicketId(t.id);
                        setReplyMessage(e.target.value);
                      }}
                      placeholder="एजेंट को समाधान संदेश लिखें..."
                      className="flex-1 p-2 bg-white rounded-xl border border-slate-300 text-xs outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleReplyTicket(t.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>उत्तर भेजें</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveTicket(t.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>हल हुआ (Resolve)</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. SUB-TAB: REFER & EARN SETTINGS                              */}
      {/* ============================================================== */}
      {activeSubTab === 'referral' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              रेफर & अर्न सेटिंग्स (Refer & Earn Configuration)
            </h3>
            <p className="text-xs text-slate-500">
              प्रत्येक 5 सफल बस बुकिंग्स पर एजेंटों को मिलने वाला रेफरल बोनस यहाँ से कॉन्फ़िगर करें। यह पूरी वेबसाइट पर स्वतः लागू हो जाएगा।
            </p>
          </div>

          <div className="p-5 bg-indigo-50 border-2 border-indigo-200 rounded-2xl space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                रेफरल बोनस राशि (रुपये में) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  min="10"
                  max="1000"
                  value={referralBonus}
                  onChange={(e) => setReferralBonus(parseInt(e.target.value) || 100)}
                  className="w-full pl-8 pr-4 py-2 bg-white rounded-xl border border-slate-300 font-mono font-bold text-sm outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                डिफ़ॉल्ट नियम: प्रत्येक 5 सफल बुकिंग पर रेफर करने वाले एजेंट को यह राशि Go Wallet में स्वतः क्रेडिट होगी।
              </span>
            </div>

            <button
              type="button"
              disabled={isSavingSettings}
              onClick={handleSaveReferralSettings}
              className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'सेव हो रहा है...' : 'सेटिंग्स सुरक्षित करें'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
