import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Briefcase, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  PlusCircle, 
  Users, 
  Copy, 
  FileText,
  ShieldCheck,
  Send
} from 'lucide-react';

export const AgentPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  // Find regular agent record
  const agentDetails = state.agents.find((a) => a.agentType === 'regular') || state.agents[0];

  const [activeTab, setActiveTab] = useState<'dashboard' | 'new_booking' | 'bookings' | 'commission' | 'referrals'>('dashboard');
  const [copiedCode, setCopiedCode] = useState(false);

  // Agent bookings
  const agentBookings = state.bookings.filter((b) => b.agentId === agentDetails.id);
  const confirmedCount = agentBookings.filter((b) => b.status === 'confirmed').length;

  // Agent commissions
  const commissions = state.commissions.filter((c) => c.agentId === agentDetails.id);
  const totalEarned = commissions
    .filter((c) => c.status === 'eligible' || c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);

  // Quick booking state
  const [selectedServiceId, setSelectedServiceId] = useState(state.services[0]?.id || '');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(agentDetails.referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAgentBooking = (e: React.FormEvent) => {
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
      boardingPoint: srv.boardingPoints[0]?.name || 'Origin Station',
      droppingPoint: srv.droppingPoints[0]?.name || 'Dropping Point',
      journeyDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      passengers: [{ fullName: custName, age: 28, gender: 'male', seatPreference: 'Lower Berth' }],
    });

    if (res.success && res.booking) {
      setSuccessMsg(`Assisted booking request ${res.booking.bookingRef} submitted for manual operator confirmation.`);
      setCustName('');
      setCustPhone('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">agent.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              Regular Agent Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Agent: <strong>Suresh Kumar</strong> • Code: <span className="font-mono font-bold text-slate-800">{agentDetails.referralCode}</span> • KYC: <span className="text-emerald-600 font-semibold uppercase">{agentDetails.kycStatus}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'dashboard' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('new_booking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'new_booking' ? 'bg-safargo-orange text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            + New Customer Booking
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'bookings' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Bookings ({agentBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'commission' ? 'bg-safargo-navy text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Commission Ledger
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Bookings Handled</span>
              <div className="text-2xl font-black text-slate-900">{agentBookings.length}</div>
              <div className="text-[11px] text-emerald-600 font-medium">
                {confirmedCount} Confirmed • {agentBookings.length - confirmedCount} Pending/In Review
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Verified Commission Earned</span>
              <div className="text-2xl font-black text-emerald-700">₹{totalEarned.toFixed(2)}</div>
              <div className="text-[11px] text-slate-400">
                Credited upon verified operator confirmation.
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Agent Referral Code</span>
              <div className="text-xl font-mono font-black text-safargo-navy">{agentDetails.referralCode}</div>
              <button
                onClick={handleCopyCode}
                className="text-[11px] text-safargo-orange font-semibold hover:underline"
              >
                {copiedCode ? 'Copied to Clipboard!' : 'Copy & Invite Agents'}
              </button>
            </div>
          </div>

          {/* Quick Booking Callout */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold">Provide In-Person Bus Booking in Your Area</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Enter your passenger journey details. Our operations desk contacts the authorized bus operator to verify seat availability within our 15-minute target.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('new_booking')}
              className="px-5 py-2.5 bg-safargo-orange hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow whitespace-nowrap"
            >
              + Place Assisted Booking
            </button>
          </div>

          {/* Recent Bookings List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Recent Customer Requests</h3>
            {agentBookings.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {agentBookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{b.bookingRef}</span>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                      <div className="text-slate-500 mt-0.5">{b.customerName} • {b.originCity} → {b.destinationCity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">₹{b.finalAmount}</div>
                      <div className="text-[10px] text-slate-400">{b.operatorName}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-4 text-center">No bookings placed yet.</div>
            )}
          </div>
        </div>
      )}

      {/* NEW BOOKING TAB */}
      {activeTab === 'new_booking' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-safargo-orange" />
            <h3 className="text-base font-bold text-slate-900">Place Booking on Behalf of Customer</h3>
          </div>

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAgentBooking} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={custName}
                onChange={(e) => setCustName(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Mobile</label>
              <input
                type="tel"
                required
                value={custPhone}
                onChange={(e) => setCustPhone(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bus Service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              >
                {state.services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.operatorName} - {s.busType} (₹{s.baseFare})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-safargo-orange hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow"
            >
              Submit Assisted Booking
            </button>
          </form>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Your Permitted Bookings</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Fare</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Operator PNR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {agentBookings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-mono font-bold text-safargo-navy">{b.bookingRef}</td>
                    <td className="p-3">{b.customerName} ({b.customerPhone})</td>
                    <td className="p-3">{b.originCity} → {b.destinationCity}</td>
                    <td className="p-3 font-bold">₹{b.finalAmount}</td>
                    <td className="p-3"><StatusBadge status={b.status} size="sm" /></td>
                    <td className="p-3 font-mono text-emerald-700">{b.operatorPnr || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMMISSION TAB */}
      {activeTab === 'commission' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Commission Ledger</h3>
          <p className="text-xs text-slate-500">
            Commissions are strictly authorized upon confirmed bookings. Excludes cancelled or rejected bookings.
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3 font-mono font-bold text-safargo-navy">{c.bookingRef}</td>
                    <td className="p-3 font-bold text-emerald-700">₹{c.amount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold text-[10px] bg-emerald-100 text-emerald-800">
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
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
