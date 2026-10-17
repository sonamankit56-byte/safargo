import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Award, 
  TrendingUp, 
  Wallet, 
  Users, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  Copy, 
  PlusCircle, 
  FileText,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

import { WalletRechargeModal } from '../../components/agent/WalletRechargeModal';

export const GoPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();
  const { setActivePortal } = usePortal();

  // Find Go Agent details
  const agentDetails = state.agents.find((a) => a.agentType === 'go_agent') || state.agents[0];
  const config = state.goAgentConfig;

  // Active sub-tab & wallet modal state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'new_booking' | 'salary' | 'commission' | 'referrals'>('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Agent's bookings
  const agentBookings = state.bookings.filter((b) => b.agentId === agentDetails.id);
  const confirmedBookings = agentBookings.filter((b) => b.status === 'confirmed');
  const pendingBookings = agentBookings.filter((b) => b.status === 'pending');

  // Commissions for this agent
  const agentCommissions = state.commissions.filter((c) => c.agentId === agentDetails.id);
  const totalCommissionEarned = agentCommissions
    .filter((c) => c.status === 'eligible' || c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // Salary records for this agent
  const salaryRecords = state.salaryRecords.filter((s) => s.agentId === agentDetails.id);

  // Referrals
  const referrals = state.referrals.filter((r) => r.referrerId === agentDetails.id);

  // Monthly progress calculation (e.g. Current Month)
  const currentMonthTarget = config.monthlyTarget; // 150
  const currentMonthConfirmed = confirmedBookings.length;
  const progressPercent = Math.min(100, Math.round((currentMonthConfirmed / currentMonthTarget) * 100));

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(agentDetails.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Quick assisted booking from agent portal
  const [selectedServiceId, setSelectedServiceId] = useState(state.services[0]?.id || '');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const handleCreateAgentBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    const srv = state.services.find((s) => s.id === selectedServiceId);
    if (!srv) return;

    const res = store.createBooking({
      bookingChannel: 'agent_assisted',
      agentId: agentDetails.id,
      customerName: custName,
      customerPhone: custPhone,
      serviceId: srv.id,
      boardingPoint: srv.boardingPoints[0]?.name || 'Central Terminal',
      droppingPoint: srv.droppingPoints[0]?.name || 'Destination Terminal',
      journeyDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: [{ fullName: custName, age: 30, gender: 'male', seatPreference: 'Lower Berth' }],
    });

    if (res.success && res.booking) {
      setBookingSuccessMsg(`Assisted booking ${res.booking.bookingRef} submitted for 15-min manual verification!`);
      setCustName('');
      setCustPhone('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Portal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">go.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Special Go Agent Program
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Partner: <strong>Vikram Singh</strong> (ID: {agentDetails.referralCode}) • KYC: <span className="text-emerald-600 font-semibold uppercase">{agentDetails.kycStatus}</span>
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'dashboard' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Performance HQ
          </button>
          <button
            onClick={() => setActiveTab('new_booking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'new_booking' ? 'bg-safargo-orange text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            + Book for Customer
          </button>
          <button
            onClick={() => setActiveTab('salary')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'salary' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Fixed Salary records
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'commission' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Commission Ledger (₹{config.commissionPerBooking})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'referrals' ? 'bg-purple-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Referrals (₹{config.referralReward})
          </button>
          <button
            onClick={() => setShowWalletModal(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Recharge Wallet (QR)</span>
          </button>
        </div>
      </div>

      {showWalletModal && (
        <WalletRechargeModal
          onClose={() => setShowWalletModal(false)}
          onSuccess={(amt) => {
            alert(`Recharge request of ₹${amt} submitted!`);
            setShowWalletModal(false);
          }}
        />
      )}

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Monthly Target Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Monthly Target</span>
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {currentMonthConfirmed} / {currentMonthTarget}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-purple-700 font-medium">
                {progressPercent}% Achieved towards ₹{config.fixedMonthlySalary} Salary
              </div>
            </div>

            {/* Per-Booking Commission */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Per-Booking Rate</span>
                <Wallet className="w-4 h-4 text-safargo-orange" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{config.commissionPerBooking}
              </div>
              <p className="text-[11px] text-slate-500">
                Credited only for genuine confirmed bookings. Total Earned: ₹{totalCommissionEarned.toFixed(2)}
              </p>
            </div>

            {/* Fixed Monthly Salary */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Fixed Monthly Salary</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">
                ₹{config.fixedMonthlySalary}
              </div>
              <p className="text-[11px] text-slate-500">
                Subject to completing 150 confirmed bookings per calendar month.
              </p>
            </div>

            {/* Referral Code & Rewards */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Agent Referral Bonus</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-700">
                ₹{config.referralReward}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xs font-bold text-slate-700">{agentDetails.referralCode}</span>
                <button
                  onClick={handleCopyReferral}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Business Rules Explanation Card */}
          <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 space-y-3">
            <div className="flex items-center space-x-2 text-purple-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <h3>Special Go Agent Operating Principles</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-purple-950">
              <div className="bg-white/80 p-3 rounded-xl border border-purple-200">
                <strong>1. Verified Confirmation Only:</strong> Commission of ₹{config.commissionPerBooking} is credited strictly when the bus operator confirms availability with a real PNR. Cancelled or rejected requests are not eligible.
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-purple-200">
                <strong>2. Separate Salary Ledger:</strong> The ₹{config.fixedMonthlySalary} fixed salary is evaluated at the end of each month against the 150-booking target and kept strictly separate from individual booking commissions.
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-purple-200">
                <strong>3. Audit-Backed Payouts:</strong> No payout is marked complete until the settlement transaction reference is recorded and verified by Admin operations.
              </div>
            </div>
          </div>

          {/* Recent Assisted Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Recent Customer Bookings Placed by You</h3>
              <button
                onClick={() => setActiveTab('new_booking')}
                className="text-xs font-semibold text-safargo-orange hover:underline"
              >
                + Place New Booking
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {agentBookings.map((b) => (
                <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900">{b.bookingRef}</span>
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Customer: <strong>{b.customerName}</strong> ({b.customerPhone}) • {b.originCity} → {b.destinationCity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">₹{b.finalAmount}</div>
                    <div className="text-[11px] text-slate-400">
                      {b.status === 'confirmed' ? `+₹${config.commissionPerBooking} Commission Earned` : 'Commission Pending Approval'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: BOOK FOR CUSTOMER */}
      {activeTab === 'new_booking' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-safargo-orange" />
            <h3 className="text-base font-bold text-slate-900">Agent-Assisted Customer Booking</h3>
          </div>
          <p className="text-xs text-slate-500">
            Submit booking requests on behalf of walk-in or offline customers. Eligible for ₹{config.commissionPerBooking} commission upon genuine confirmation.
          </p>

          {bookingSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              {bookingSuccessMsg}
            </div>
          )}

          <form onSubmit={handleCreateAgentBooking} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Full Name</label>
              <input
                type="text"
                required
                placeholder="Enter customer name"
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Mobile Number</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Configured Bus Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50 text-xs"
              >
                {state.services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.operatorName} - {srv.busType} (₹{srv.baseFare}) - Departs {srv.departureTime}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-safargo-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-colors"
            >
              Submit Assisted Booking for 15-Min Verification
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SALARY RECORDS */}
      {activeTab === 'salary' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Fixed Monthly Salary Ledger</h3>
              <p className="text-xs text-slate-500">Fixed salary of ₹{config.fixedMonthlySalary} requires achieving {config.monthlyTarget} confirmed bookings.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Fixed Monthly Package</span>
              <div className="text-xl font-black text-emerald-700">₹{config.fixedMonthlySalary}</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Month</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Achieved Bookings</th>
                  <th className="p-3">Fixed Salary</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaryRecords.map((s) => (
                  <tr key={s.id}>
                    <td className="p-3 font-bold text-slate-800">{s.monthYear}</td>
                    <td className="p-3 text-slate-600">{s.targetBookings} Bookings</td>
                    <td className="p-3 font-semibold text-slate-900">{s.achievedBookings} Bookings</td>
                    <td className="p-3 font-bold text-slate-900">₹{s.fixedSalary}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        s.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{s.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMMISSION LEDGER */}
      {activeTab === 'commission' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Per-Booking Commission Ledger</h3>
              <p className="text-xs text-slate-500">
                Each verified confirmed booking grants ₹{config.commissionPerBooking}. Strictly protected against duplicate crediting.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Total Commissions</div>
              <div className="text-xl font-black text-safargo-navy">₹{totalCommissionEarned.toFixed(2)}</div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Audit Description</th>
                  <th className="p-3">Credited At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentCommissions.length > 0 ? (
                  agentCommissions.map((c) => (
                    <tr key={c.id}>
                      <td className="p-3 font-mono font-bold text-safargo-navy">{c.bookingRef}</td>
                      <td className="p-3 font-bold text-emerald-700">₹{c.amount}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-100 text-emerald-800">
                          {c.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{c.description}</td>
                      <td className="p-3 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-400">
                      No commission records yet. Confirm bookings to receive credits.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Agent Referral Network</h3>
              <p className="text-xs text-slate-500">
                Earn ₹{config.referralReward} bonus when your referred agent completes {config.referralTargetBookings} confirmed bookings and is approved by Admin.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-bold">
                {agentDetails.referralCode}
              </span>
              <button
                onClick={handleCopyReferral}
                className="px-3 py-1.5 bg-safargo-navy text-white text-xs font-semibold rounded-lg"
              >
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Referred Agent</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Progress towards 5 Bookings</th>
                  <th className="p-3">Reward Value</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-semibold text-slate-800">{r.refereeName}</td>
                    <td className="p-3 text-slate-500 capitalize">{r.refereeType}</td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${(r.completedBookingsCount / r.requiredBookingsCount) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">
                          {r.completedBookingsCount}/{r.requiredBookingsCount}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-emerald-700">₹{r.rewardAmount}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        r.status === 'approved' || r.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
