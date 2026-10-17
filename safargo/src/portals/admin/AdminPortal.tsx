import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AssistanceTimer } from '../../components/common/AssistanceTimer';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  MapPin, 
  Bus, 
  Users, 
  DollarSign, 
  Tag, 
  FileText, 
  RotateCcw, 
  Sprout, 
  Activity,
  Plus,
  Edit2
} from 'lucide-react';
import { Booking, BusService, RouteItem } from '../../lib/types';

export const AdminPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'queue' | 'operators' | 'agents' | 'routes' | 'offers' | 'refunds' | 'agri' | 'audit' | 'settings'
  >('dashboard');

  // Confirmation modal state
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<Booking | null>(null);
  const [operatorPnrInput, setOperatorPnrInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Operator reported bus fully booked.');
  const [actionError, setActionError] = useState<string | null>(null);

  // Refund modal state
  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);
  const [refundRefInput, setRefundRefInput] = useState('');
  const [refundNotesInput, setRefundNotesInput] = useState('');

  // Settings state (Go Agent configuration)
  const [monthlyTargetInput, setMonthlyTargetInput] = useState(state.goAgentConfig.monthlyTarget);
  const [fixedSalaryInput, setFixedSalaryInput] = useState(state.goAgentConfig.fixedMonthlySalary);
  const [commissionInput, setCommissionInput] = useState(state.goAgentConfig.commissionPerBooking);
  const [referralRewardInput, setReferralRewardInput] = useState(state.goAgentConfig.referralReward);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // New Route state
  const [newOrigin, setNewOrigin] = useState('');
  const [newDest, setNewDest] = useState('');
  const [newDistance, setNewDistance] = useState(250);

  // Real statistics derived from database
  const totalBookings = state.bookings.length;
  const pendingQueue = state.bookings.filter((b) => b.status === 'pending');
  const delayedQueue = pendingQueue.filter((b) => {
    const elapsedMs = Date.now() - new Date(b.assistanceStartedAt).getTime();
    return elapsedMs > 15 * 60 * 1000;
  });
  const confirmedBookings = state.bookings.filter((b) => b.status === 'confirmed');
  const totalGrossRevenue = confirmedBookings.reduce((sum, b) => sum + b.finalAmount, 0);

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedBookingForAction) return;

    if (!operatorPnrInput.trim()) {
      setActionError('Genuine Operator PNR is required to confirm booking.');
      return;
    }

    const res = store.confirmBooking({
      bookingId: selectedBookingForAction.id,
      operatorPnr: operatorPnrInput,
      adminNotes: adminNotesInput,
      confirmedBy: currentUser.id,
    });

    if (res.success) {
      setSelectedBookingForAction(null);
      setOperatorPnrInput('');
      setAdminNotesInput('');
    } else {
      setActionError(res.error || 'Failed to confirm booking.');
    }
  };

  const handleRejectAction = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    if (!selectedBookingForAction) return;

    const res = store.rejectBooking({
      bookingId: selectedBookingForAction.id,
      rejectionReason: rejectionReasonInput,
      rejectedBy: currentUser.id,
    });

    if (res.success) {
      setSelectedBookingForAction(null);
      setRejectionReasonInput('');
    } else {
      setActionError(res.error || 'Failed to reject booking.');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateGoAgentConfig({
      monthlyTarget: Number(monthlyTargetInput),
      fixedMonthlySalary: Number(fixedSalaryInput),
      commissionPerBooking: Number(commissionInput),
      referralReward: Number(referralRewardInput),
    }, currentUser.id);

    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 2500);
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDest) return;

    const newR: RouteItem = {
      id: `route-${Date.now()}`,
      originCity: newOrigin.trim(),
      destinationCity: newDest.trim(),
      distanceKm: Number(newDistance),
      isActive: true,
      popularRank: state.routes.length + 1,
    };
    state.routes.push(newR);
    store.logAudit(currentUser.id, currentUser.fullName, 'admin', 'ADD_ROUTE', 'route', newR.id, `Added route ${newOrigin} -> ${newDest}`);
    store.save();
    setNewOrigin('');
    setNewDest('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">admin.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold border border-red-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Central Operations Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Super Administrator: <strong>{currentUser.fullName}</strong> • Strict audit logging active
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'dashboard', label: 'Overview' },
            { id: 'queue', label: `Queue (${pendingQueue.length})` },
            { id: 'operators', label: 'Operators' },
            { id: 'agents', label: 'Agents' },
            { id: 'routes', label: 'Routes' },
            { id: 'offers', label: 'Offers' },
            { id: 'refunds', label: `Refunds (${state.refundRequests.length})` },
            { id: 'agri', label: 'Agri Mandi' },
            { id: 'audit', label: 'Audit Logs' },
            { id: 'settings', label: 'Settings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id ? 'bg-red-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Delayed alerts banner */}
          {delayedQueue.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    {delayedQueue.length} Booking Requests Exceeded 15-Minute Assistance Target!
                  </h4>
                  <p className="text-xs text-rose-700">
                    Immediate operator coordination required to avoid customer cancellation.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('queue')}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg shadow"
              >
                Open Queue →
              </button>
            </div>
          )}

          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Pending Assistance Queue</span>
              <div className="text-3xl font-black text-amber-600">{pendingQueue.length}</div>
              <div className="text-[11px] text-slate-500">
                {delayedQueue.length} marked delayed (&gt;15 mins)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Confirmed Bookings</span>
              <div className="text-3xl font-black text-emerald-700">{confirmedBookings.length}</div>
              <div className="text-[11px] text-slate-500">Verified with genuine operator PNR</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Total Verified Revenue</span>
              <div className="text-3xl font-black text-safargo-navy">₹{totalGrossRevenue.toLocaleString()}</div>
              <div className="text-[11px] text-slate-500">Real customer settlements</div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs text-slate-400 font-medium">Authorized Agent Network</span>
              <div className="text-3xl font-black text-purple-700">{state.agents.length}</div>
              <div className="text-[11px] text-slate-500">Go Agents & Regular Agents</div>
            </div>
          </div>

          {/* Quick pending queue preview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Assisted Bookings Pending Review</h3>
              <button
                onClick={() => setActiveTab('queue')}
                className="text-xs font-semibold text-safargo-orange hover:underline"
              >
                View Full Queue →
              </button>
            </div>

            {pendingQueue.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {pendingQueue.map((b) => (
                  <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{b.bookingRef}</span>
                        <StatusBadge status={b.status} size="sm" />
                        {b.isDelayed && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                            Delayed
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        Customer: <strong>{b.customerName}</strong> ({b.customerPhone}) • {b.originCity} → {b.destinationCity} ({b.operatorName})
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBookingForAction(b);
                          setActiveTab('queue');
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg"
                      >
                        Confirm with PNR
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBookingForAction(b);
                          setActiveTab('queue');
                        }}
                        className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs rounded-lg"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 py-6 text-center">
                All booking requests have been reviewed and processed!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANUAL BOOKING QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Manual Booking Operations Queue</h3>
              <p className="text-xs text-slate-500">
                Verify operator availability, assign operator response, and input genuine operator PNR to confirm.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 font-bold">
              {pendingQueue.length} Pending
            </span>
          </div>

          {/* Action modal / panel if booking selected */}
          {selectedBookingForAction && (
            <div className="p-6 rounded-2xl bg-white border-2 border-slate-300 shadow-xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-xs font-bold uppercase text-safargo-orange">Processing Booking Request</span>
                  <h4 className="text-lg font-bold text-slate-900">
                    {selectedBookingForAction.bookingRef} — {selectedBookingForAction.customerName}
                  </h4>
                  <div className="text-xs text-slate-500">
                    {selectedBookingForAction.originCity} → {selectedBookingForAction.destinationCity} ({selectedBookingForAction.operatorName})
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBookingForAction(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>

              {actionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {actionError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Confirm section */}
                <form onSubmit={handleConfirmAction} className="space-y-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Confirm Booking (Requires Genuine PNR)</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Genuine Operator PNR (Provided by Bus Operator)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RYL-JP-9941"
                      value={operatorPnrInput}
                      onChange={(e) => setOperatorPnrInput(e.target.value.toUpperCase())}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Internal Notes / Seat Allotment</label>
                    <input
                      type="text"
                      placeholder="e.g. Seat 4L confirmed by operator Mahesh Verma"
                      value={adminNotesInput}
                      onChange={(e) => setAdminNotesInput(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow"
                  >
                    Authorize & Issue Genuine Confirmation
                  </button>
                </form>

                {/* Reject section */}
                <form onSubmit={handleRejectAction} className="space-y-3 p-4 bg-rose-50/50 rounded-xl border border-rose-200">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Reject Booking (Service / Seat Unavailable)</span>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Rejection Reason</label>
                    <textarea
                      rows={2}
                      required
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow"
                  >
                    Reject Booking Request
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Full Queue Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer & Phone</th>
                  <th className="p-3">Route & Operator</th>
                  <th className="p-3">Journey Date</th>
                  <th className="p-3">Assistance Timer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.bookings.map((b) => (
                  <tr key={b.id} className={b.isDelayed && b.status === 'pending' ? 'bg-amber-50/40' : ''}>
                    <td className="p-3 font-mono font-bold text-safargo-navy">{b.bookingRef}</td>
                    <td className="p-3">
                      <div className="font-medium text-slate-900">{b.customerName}</div>
                      <div className="text-slate-400">{b.customerPhone}</div>
                    </td>
                    <td className="p-3">
                      <div>{b.originCity} → {b.destinationCity}</div>
                      <div className="text-slate-400">{b.operatorName}</div>
                    </td>
                    <td className="p-3">{b.journeyDate} at {b.departureTime}</td>
                    <td className="p-3">
                      {b.status === 'pending' ? (
                        <AssistanceTimer
                          startedAt={b.assistanceStartedAt}
                          status={b.status}
                          bookingRef={b.bookingRef}
                        />
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-3 text-right">
                      {b.status === 'pending' && (
                        <button
                          onClick={() => setSelectedBookingForAction(b)}
                          className="px-3 py-1 bg-safargo-navy hover:bg-slate-800 text-white font-bold rounded-lg"
                        >
                          Review
                        </button>
                      )}
                      {b.status === 'confirmed' && (
                        <span className="font-mono text-emerald-700 font-semibold">{b.operatorPnr}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OPERATORS */}
      {activeTab === 'operators' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Authorized Bus Operators</h3>
              <p className="text-xs text-slate-500">Verified travel operators partner network</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {state.services.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{s.operatorName}</h4>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                    Verified
                  </span>
                </div>
                <div className="text-slate-600">Bus Type: {s.busType} • Base Fare: ₹{s.baseFare}</div>
                <div className="text-slate-500">Contact: {s.operatorContact || '+91 98765 43201'}</div>
                <div className="text-[11px] text-slate-400">Policy: {s.cancellationPolicy}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AGENTS & GO AGENTS */}
      {activeTab === 'agents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Agent Network & KYC Verifications</h3>
              <p className="text-xs text-slate-500">Manage Regular and Special Go Agent partners</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Agent Code</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">KYC Status</th>
                  <th className="p-3">Bank Details</th>
                  <th className="p-3">Total Earnings</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.agents.map((a) => (
                  <tr key={a.id}>
                    <td className="p-3 font-mono font-bold text-safargo-navy">{a.referralCode}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        a.agentType === 'go_agent' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {a.agentType.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                        {a.kycStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {a.bankDetails?.bankName} ({a.bankDetails?.accountNumber.slice(-4)})
                    </td>
                    <td className="p-3 font-bold text-emerald-700">₹{a.totalEarnings + a.pendingEarnings}</td>
                    <td className="p-3">
                      <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700">
                        View KYC Files
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ROUTES & SERVICES */}
      {activeTab === 'routes' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add New Bus Route</h3>
            <form onSubmit={handleAddRoute} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-end">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Origin City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chandigarh"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Destination City</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manali"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Distance (km)</label>
                <input
                  type="number"
                  min={10}
                  value={newDistance}
                  onChange={(e) => setNewDistance(Number(e.target.value))}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-slate-50"
                />
              </div>
              <button
                type="submit"
                className="py-2.5 bg-safargo-orange hover:bg-orange-600 text-white font-bold rounded-lg shadow"
              >
                + Add Route
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900">Configured Routes List</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Route ID</th>
                    <th className="p-3">Origin</th>
                    <th className="p-3">Destination</th>
                    <th className="p-3">Distance</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.routes.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-mono font-bold text-slate-700">{r.id}</td>
                      <td className="p-3 font-medium text-slate-900">{r.originCity}</td>
                      <td className="p-3 font-medium text-slate-900">{r.destinationCity}</td>
                      <td className="p-3">{r.distanceKm} km</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: OFFERS & COUPONS */}
      {activeTab === 'offers' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Configured Coupons & Discounts</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Coupon Code</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Discount</th>
                  <th className="p-3">Min Amount</th>
                  <th className="p-3">Max Discount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {state.offers.map((o) => (
                  <tr key={o.id}>
                    <td className="p-3 font-mono font-bold text-safargo-orange">{o.code}</td>
                    <td className="p-3 font-medium">{o.title}</td>
                    <td className="p-3 font-bold text-emerald-700">
                      {o.discountType === 'percentage' ? `${o.discountValue}%` : `₹${o.discountValue}`}
                    </td>
                    <td className="p-3">₹{o.minBookingAmount}</td>
                    <td className="p-3">₹{o.maxDiscount}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: REFUNDS REVIEW */}
      {activeTab === 'refunds' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Cancellation & Refund Queue</h3>
              <p className="text-xs text-slate-500">Review requested refunds against operator deduction terms.</p>
            </div>
          </div>

          {state.refundRequests.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Booking Ref</th>
                    <th className="p-3">Requested By</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Eligible Refund</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {state.refundRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="p-3 font-mono font-bold text-safargo-navy">{r.bookingRef}</td>
                      <td className="p-3">{r.requestedBy}</td>
                      <td className="p-3 text-slate-600">{r.reason}</td>
                      <td className="p-3 font-bold text-emerald-700">₹{r.calculatedRefund}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {r.status === 'under_review' && (
                          <button
                            onClick={() => {
                              store.processRefund({
                                refundRequestId: r.id,
                                action: 'approve',
                                refundRef: `RFD-TXN-${Date.now()}`,
                                adminNotes: 'Verified with bus operator deduction rules.',
                              });
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                          >
                            Approve Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-slate-400">No pending refund requests.</div>
          )}
        </div>
      )}

      {/* TAB 8: AGRICULTURAL DESK */}
      {activeTab === 'agri' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Kisan & Rural Mandi Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Active Crop Harvest Listings ({state.cropListings.length})</h4>
              <ul className="space-y-1 text-slate-600">
                {state.cropListings.map((c) => (
                  <li key={c.id} className="flex justify-between border-b border-slate-200 py-1">
                    <span>{c.cropName} ({c.farmerName})</span>
                    <strong>{c.quantityQuintals} Qtl • ₹{c.expectedPricePerQuintal}/Qtl</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900">Transport Logistics Requests ({state.transportRequests.length})</h4>
              <ul className="space-y-1 text-slate-600">
                {state.transportRequests.map((t) => (
                  <li key={t.id} className="flex justify-between border-b border-slate-200 py-1">
                    <span>{t.cropType} ({t.pickupLocation} → {t.deliveryLocation})</span>
                    <span className="font-semibold text-emerald-700">{t.status.toUpperCase()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Immutable Audit Logs</h3>
              <p className="text-xs text-slate-500">Every sensitive action, confirmation, and refund is recorded.</p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Action</th>
                  <th className="p-2.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {state.auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-2.5 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="p-2.5 text-slate-800 font-sans font-medium">{log.userName}</td>
                    <td className="p-2.5 text-slate-500 font-sans capitalize">{log.userRole}</td>
                    <td className="p-2.5 font-bold text-red-700">{log.action}</td>
                    <td className="p-2.5 text-slate-600 font-sans">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 10: SETTINGS (GO AGENT & BUSINESS RULES CONFIGURATION) */}
      {activeTab === 'settings' && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-safargo-navy" />
            <h3 className="text-base font-bold text-slate-900">Platform Business Rules & Parameters</h3>
          </div>
          <p className="text-slate-500">
            Configure Special Go Agent target numbers, fixed salary rates, per-booking commissions, and referral bonuses.
          </p>

          {settingsSavedMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Go Agent settings updated and audit logged successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Go Agent Monthly Target (Eligible Confirmed Bookings)
              </label>
              <input
                type="number"
                min={1}
                value={monthlyTargetInput}
                onChange={(e) => setMonthlyTargetInput(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
              <span className="text-[10px] text-slate-400">Default: 150 bookings</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Go Agent Fixed Monthly Salary (₹)
              </label>
              <input
                type="number"
                min={0}
                value={fixedSalaryInput}
                onChange={(e) => setFixedSalaryInput(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
              <span className="text-[10px] text-slate-400">Default: ₹5,000 (subject to employment terms)</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Per-Booking Commission Rate (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={commissionInput}
                onChange={(e) => setCommissionInput(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
              <span className="text-[10px] text-slate-400">Default: ₹19.34 per confirmed booking</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Referral Reward Value (₹)
              </label>
              <input
                type="number"
                min={0}
                value={referralRewardInput}
                onChange={(e) => setReferralRewardInput(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-lg bg-slate-50"
              />
              <span className="text-[10px] text-slate-400">Default: ₹100 upon 5 confirmed bookings by referred agent</span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-800 hover:bg-red-700 text-white font-bold rounded-xl shadow transition-colors"
            >
              Save Platform Configuration & Commit Audit
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
