import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatusBadge } from '../common/StatusBadge';
import { CountdownTimer } from '../common/CountdownTimer';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  ArrowRight,
  Eye,
  Bus,
  FileCheck,
  Sparkles,
  CreditCard,
  ShieldCheck,
  Wallet
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenBooking: (bookingId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onOpenBooking }) => {
  const { allProfiles, approveAgent, approveAgentKyc, pendingLoginOtps } = useAuth();
  const { bookings, commissions, salaryRecords, settings, promotionClaims, walletRecharges, approveWalletRecharge, rejectWalletRecharge, confirmBooking } = useData();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const metrics = useMemo(() => {
    const agents = allProfiles.filter((p) => p.role === 'agent');
    const totalAgents = agents.length;
    const pendingAgentApprovals = agents.filter((a) => a.agent_status === 'pending_approval').length;

    let todayRequests = 0;
    let pendingConfirmations = 0;
    let confirmedBookings = 0;
    let rejectedBookings = 0;
    let expiredRequests = 0;
    let monthlyConfirmed = 0;
    let totalBookingValue = 0;

    bookings.forEach((b) => {
      const bDate = b.created_at.split('T')[0];
      const bMonth = b.created_at.substring(0, 7);

      if (bDate === todayStr) todayRequests++;
      if (bMonth === currentMonth && b.status === 'confirmed') monthlyConfirmed++;

      if (b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') {
        pendingConfirmations++;
      } else if (b.status === 'confirmed') {
        confirmedBookings++;
        totalBookingValue += b.actual_fare || b.total_estimated_amount;
      } else if (b.status === 'rejected') {
        rejectedBookings++;
      } else if (b.status === 'expired') {
        expiredRequests++;
      }
    });

    const totalCommissionCredited = commissions
      .filter((c) => c.status === 'credited')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalCommissionReversed = commissions
      .filter((c) => c.status === 'reversed')
      .reduce((sum, c) => sum + Math.abs(c.amount), 0);

    const commissionPayable = totalCommissionCredited - totalCommissionReversed;

    const salaryPayable = salaryRecords
      .filter((s) => s.status === 'unpaid' || s.status === 'approved')
      .reduce((sum, s) => sum + s.payable_salary, 0);

    return {
      totalAgents,
      pendingAgentApprovals,
      todayRequests,
      pendingConfirmations,
      confirmedBookings,
      rejectedBookings,
      expiredRequests,
      monthlyConfirmed,
      commissionPayable,
      salaryPayable,
      totalBookingValue,
    };
  }, [allProfiles, bookings, commissions, salaryRecords, todayStr, currentMonth]);

  const urgentBookings = useMemo(() => {
    return bookings
      .filter((b) => b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation')
      .sort((a, b) => new Date(a.deadline_at).getTime() - new Date(b.deadline_at).getTime());
  }, [bookings]);

  const pendingAgents = useMemo(() => {
    return allProfiles.filter((p) => p.role === 'agent' && p.agent_status === 'pending_approval');
  }, [allProfiles]);

  const pendingKycAgents = useMemo(() => {
    return allProfiles.filter(
      (p) =>
        (p.role === 'agent' || (!p.role && p.agent_status)) &&
        p.kyc_status?.toLowerCase().trim() === 'pending'
    );
  }, [allProfiles]);

  const pendingKycCount = pendingKycAgents.length;

  const pendingPromotionsCount = useMemo(() => {
    return promotionClaims.filter((c) => c.status === 'pending').length;
  }, [promotionClaims]);

  const activeOtpCount = useMemo(() => {
    const nowIsoStr = new Date().toISOString();
    return pendingLoginOtps
      ? pendingLoginOtps.filter((o) => o.status === 'pending' && o.expires_at > nowIsoStr).length
      : 0;
  }, [pendingLoginOtps]);

  const instantTicketBookings = useMemo(() => {
    return bookings.filter(
      (b) =>
        (b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') &&
        (b.agent_notes?.includes('Instant Ticket') || b.agent_notes?.includes('Automatic') || b.payment_status === 'paid')
    );
  }, [bookings]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-orange-400">
              SafarGo Admin Operations Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">कंट्रोल डैशबोर्ड (System Overview)</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            मैनुअल बस टिकटिंग एवं ग्रामीण एजेंट रोजगार प्रबंधन (Manual Bus Ticketing & Rural CSC Desk)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              const el = document.getElementById('instant-ticket-desk');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition ${
              instantTicketBookings.length > 0
                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <Bus className="w-4 h-4 text-amber-300" />
            <span>⚡ इंस्टेंट टिकट ({instantTicketBookings.length})</span>
          </button>
          <button
            onClick={() => onNavigate('go-wallet')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg transition cursor-pointer ${
              (walletRecharges || []).filter((r) => r.status === 'pending').length > 0
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 animate-pulse ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 hover:from-amber-300 hover:to-orange-400'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>👑 Go Wallet अनुरोध ({(walletRecharges || []).filter((r) => r.status === 'pending').length})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-security-desk')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition ${
              activeOtpCount > 0
                ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>सुरक्षा एवं OTP ({activeOtpCount})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-kyc-desk')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-lg transition ${
              pendingKycCount > 0
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>KYC सत्यापन डेस्क ({pendingKycCount})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-promotions')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition"
          >
            <Sparkles className="w-4 h-4 text-purple-200" />
            <span>वायरल प्रमोशन ({pendingPromotionsCount})</span>
          </button>
          <button
            onClick={() => onNavigate('admin-bookings')}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            बुकिंग्स डेस्क ({bookings.length})
          </button>
          <button
            onClick={() => onNavigate('admin-agents')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            एजेंट्स ({metrics.totalAgents})
          </button>
          <button
            onClick={() => onNavigate('admin-settings')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            सेटिंग्स
          </button>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        
        <button
          onClick={() => onNavigate('admin-security-desk')}
          className={`p-4 rounded-2xl border text-left transition ${
            activeOtpCount > 0
              ? 'bg-emerald-50/80 border-emerald-300 shadow-sm hover:border-emerald-500 hover:bg-emerald-100/50'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">Live OTP Desk</span>
            {activeOtpCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {activeOtpCount}
          </span>
          <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            {activeOtpCount > 0 ? 'सक्रिय OTP →' : 'Zero-Cost 2FA'}
          </span>
        </button>

        <button
          onClick={() => onNavigate('admin-kyc-desk')}
          className={`p-4 rounded-2xl border text-left transition ${
            pendingKycCount > 0
              ? 'bg-amber-50/80 border-amber-300 shadow-sm hover:border-amber-500 hover:bg-amber-100/50'
              : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase">Pending KYC</span>
            {pendingKycCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {pendingKycCount}
          </span>
          <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
            {pendingKycCount > 0 ? 'सत्यापन लंबित →' : 'सभी सत्यापित'}
          </span>
        </button>
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Pending Confirmations</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">
            {metrics.pendingConfirmations}
          </span>
          <span className="text-[10px] text-slate-500">15m Window Active</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Pending Agents</span>
          <span className="text-2xl font-black text-orange-600 mt-1 block">
            {metrics.pendingAgentApprovals}
          </span>
          <span className="text-[10px] text-slate-500">Need Approval</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Today's Requests</span>
          <span className="text-2xl font-black text-blue-600 mt-1 block">
            {metrics.todayRequests}
          </span>
          <span className="text-[10px] text-slate-500">Received Today</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Confirmed (Month)</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {metrics.monthlyConfirmed}
          </span>
          <span className="text-[10px] text-slate-500">{metrics.confirmedBookings} All-Time</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Commission Payable</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{metrics.commissionPayable.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500">₹{settings.commission_rate.toFixed(2)} / Booking</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Booking Value</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            ₹{metrics.totalBookingValue.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500">Verified GTV</span>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600">Total Registered Agents:</span>
          <span className="font-bold text-slate-900">{metrics.totalAgents}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600">Rejected Requests:</span>
          <span className="font-bold text-rose-700">{metrics.rejectedBookings}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600">Expired Requests:</span>
          <span className="font-bold text-slate-700">{metrics.expiredRequests}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between">
          <span className="text-slate-600">Estimated Salary Payable:</span>
          <span className="font-bold text-orange-700">₹{metrics.salaryPayable.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* 💰 Urgent Pending Wallet Recharges (1-Click Instant Approval) */}
      {walletRecharges && walletRecharges.filter(r => r.status === 'pending').length > 0 && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-lg overflow-hidden animate-fadeIn">
          <div className="p-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow">
                <Wallet className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <span>लंबित एजेंट वॉलेट रिचार्ज अनुरोध ({walletRecharges.filter(r => r.status === 'pending').length})</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                    ⚡ 10 मिनट SLA
                  </span>
                </h2>
                <p className="text-xs text-emerald-200">
                  एजेंट के UTR सत्यापन के बाद 1-क्लिक से वॉलेट में तुरंत राशि क्रेडिट करें!
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('go-wallet')}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
            >
              सभी देखें ➔
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {walletRecharges
              .filter(r => r.status === 'pending')
              .map((recharge) => (
                <div key={recharge.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center shrink-0">
                      ₹{recharge.amount}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-sm font-black">{recharge.agent_name}</strong>
                        <span className="font-mono text-xs text-slate-500">({recharge.agent_mobile})</span>
                      </div>
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-2">
                        <span>UTR / Ref: <strong className="font-mono text-slate-900">{recharge.utr_number}</strong></span>
                        <span>•</span>
                        <span>विधि: <strong>{recharge.payment_method === 'upi_qr' ? 'UPI QR' : 'बैंक'}</strong></span>
                        <span>•</span>
                        <span className="text-slate-400">{new Date(recharge.created_at).toLocaleTimeString('hi-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={async () => {
                        await approveWalletRecharge(recharge.id, 'Super Admin 1-Click Approved');
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>तुरंत स्वीकृत करें (+₹{recharge.amount})</span>
                    </button>
                    <button
                      onClick={async () => {
                        await rejectWalletRecharge(recharge.id, 'UTR नॉट फाउंड / इनवैलिड');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs transition cursor-pointer"
                    >
                      अस्वीकार
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ⚡ Instant Ticket Desk (5-Minute SLA Auto-Bookings) */}
      <div id="instant-ticket-desk" className="bg-white rounded-3xl border-2 border-red-500 shadow-xl overflow-hidden animate-fadeIn">
        <div className="p-5 bg-gradient-to-r from-red-900 via-rose-900 to-red-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-md">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black flex items-center gap-2">
                <span>⚡ इंस्टेंट टिकट डेस्क ({instantTicketBookings.length})</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black">
                  5 मिनट SLA
                </span>
              </h2>
              <p className="text-xs text-red-200">
                ऑटोमैटिक बस टिकटिंग: 1-क्लिक से टिकट स्वीकार करें और तत्काल PNR जारी करें!
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin-bookings')}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
          >
            सभी बुकिंग्स ➔
          </button>
        </div>

        {instantTicketBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            🎉 कोई लंबित इंस्टेंट टिकट अनुरोध नहीं है। सभी ऑटोमैटिक टिकट संसाधित हो चुके हैं।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {instantTicketBookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-50/40 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-red-100 text-red-900 px-2.5 py-0.5 rounded">
                      {b.booking_code}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      ⚡ 5-Minute Timer Active
                    </span>
                    <span className="text-xs text-slate-500">एजेंट: {b.agent_name}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {b.customer_name} (+91 {b.customer_mobile}) • {b.from_city} ➔ {b.to_city}
                  </p>
                  <p className="text-xs text-slate-600">
                    ऑपरेटर: <strong>{b.operator_preference}</strong> • सीटें: <strong>{b.seat_category || 'Reserved Seats'}</strong> • राशि: <strong className="text-red-600 font-mono">₹{b.total_estimated_amount}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    onClick={async () => {
                      const autoPnr = `SFG-${Math.floor(100000 + Math.random() * 900000)}`;
                      await confirmBooking(b.id, {
                        actual_fare: b.total_estimated_amount,
                        confirmed_seats: b.seat_category || 'Confirmed Seat',
                        actual_operator: b.operator_preference || 'Verified Bus Operator',
                        actual_boarding_point: b.boarding_point || `${b.from_city} Stand`,
                        actual_drop_point: b.drop_point || `${b.to_city} Stand`,
                        ticket_pnr: autoPnr,
                        admin_notes: '1-Click Instant Ticket Approved by Admin',
                      });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>स्वीकृत करें व टिकट जारी करें</span>
                  </button>
                  <button
                    onClick={() => onOpenBooking(b.id)}
                    className="px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    विवरण
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Urgent Bookings Section (Action Required within 15 mins) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                लंबित सत्यापन रिक्वेस्ट (Pending Verification - 15 Minute Window)
              </h2>
              <p className="text-xs text-slate-500">
                तुरंत बस ऑपरेटर से सीट चेक करें और टिकट विवरण भरें
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('admin-bookings')}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            सभी देखें <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {urgentBookings.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            बधाई! कोई भी पेंडिंग रिक्वेस्ट नहीं है। सभी बुकिंग्स सत्यापित हैं।
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {urgentBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 sm:p-5 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded">
                      {b.booking_code}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                    <span className="text-xs text-slate-500">एजेंट: {b.agent_name}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900">
                    {b.customer_name} (+91 {b.customer_mobile}) • {b.from_city} → {b.to_city}
                  </p>
                  <p className="text-xs text-slate-500">
                    यात्रा: {b.journey_date} • {b.passenger_count} Passenger(s) • सीट: {b.seat_category.replace(/_/g, ' ')} • किराया: ₹{b.total_estimated_amount}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <CountdownTimer deadlineAt={b.deadline_at} status={b.status} />
                  <button
                    onClick={() => onOpenBooking(b.id)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    सत्यापित करें (Verify)
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Agent KYC Verification Section (1-12 Hour SLA) */}
      {pendingKycAgents.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-3xl border-2 border-amber-300 shadow-md overflow-hidden">
          <div className="p-6 bg-amber-500/10 border-b border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    एजेंट KYC दस्तावेज़ सत्यापन रिक्वेस्ट ({pendingKycAgents.length} पेंडिंग)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                    1-12 Hour SLA
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  एजेंट ने आधार, पैन व बैंक विवरण सबमिट किया है। कमीशन विथड्रॉल हेतु सत्यापन आवश्यक है।
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('admin-kyc-desk')}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
            >
              <span>पूर्ण KYC डेस्क खोलें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-amber-100">
            {pendingKycAgents.map((ag) => (
              <div
                key={ag.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white/70 hover:bg-white transition"
              >
                <div className="flex items-start gap-4">
                  {ag.avatar_url ? (
                    <img
                      src={ag.avatar_url}
                      alt={ag.full_name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg border border-amber-300 flex-shrink-0">
                      {ag.full_name.charAt(0)}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-slate-900 text-sm">{ag.full_name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        {ag.shop_name || 'जन सेवा केंद्र'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        +91 {ag.mobile}
                      </span>
                      {ag.city && (
                        <span className="text-[10px] text-slate-500">
                          • {ag.city}, {ag.district}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">आधार नंबर:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {ag.aadhaar_number ? `XXXX-XXXX-${ag.aadhaar_number.slice(-4)}` : 'दर्ज नहीं'}
                        </span>
                      </div>
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">पैन नंबर:</span>
                        <span className="font-mono font-bold text-slate-900">
                          {ag.pan_number || 'दर्ज नहीं'}
                        </span>
                      </div>
                      <div className="bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] text-slate-400 block font-semibold">बैंक खाता:</span>
                        <span className="font-mono font-bold text-slate-900 truncate block">
                          {ag.bank_account_number ? `...${ag.bank_account_number.slice(-4)} (${ag.bank_ifsc || 'IFSC'})` : 'दर्ज नहीं'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => onNavigate('admin-kyc-desk')}
                    className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>दस्तावेज़ देखें (Verify)</span>
                  </button>
                  <button
                    onClick={() => approveAgentKyc(ag.id)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>तुरंत अप्रूव (Quick Approve)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending Agent Approvals Section */}
      {pendingAgents.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  नए एजेंट पंजीकरण अनुमोदन (New Agent Approvals Pending)
                </h2>
                <p className="text-xs text-slate-500">
                  सत्यापन के बिना नए एजेंट लाइव बुकिंग नहीं कर सकते
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin-agents')}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              एजेंट्स सूची <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingAgents.map((ag) => (
              <div
                key={ag.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{ag.full_name}</h3>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Pending Approval
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    दुकान / केंद्र: <strong>{ag.shop_name}</strong> • {ag.city}, {ag.district}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Mobile: +91 {ag.mobile} • Email: {ag.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveAgent(ag.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    Approve Agent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
