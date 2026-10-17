import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Bus, CheckCircle, XCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';
import { Booking } from '../../lib/types';

export const OperatorPortal: React.FC = () => {
  const { state, store } = useStore();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'assigned' | 'services' | 'history'>('assigned');

  // Find services and assigned bookings for this operator (e.g. Royal Travels)
  const operatorName = 'SafarGo Royal Travels';
  const operatorServices = state.services.filter((s) => s.operatorName === operatorName);
  
  const assignedBookings = state.bookings.filter((b) => b.operatorName === operatorName);
  const pendingRequests = assignedBookings.filter((b) => b.status === 'pending');
  const historyRequests = assignedBookings.filter((b) => b.status === 'confirmed' || b.status === 'rejected');

  // Action state
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [pnrInput, setPnrInput] = useState('');
  const [seatNoteInput, setSeatNoteInput] = useState('Seat confirmed - lower berth');

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !pnrInput.trim()) return;

    store.confirmBooking({
      bookingId: selectedBooking.id,
      operatorPnr: pnrInput.trim(),
      adminNotes: seatNoteInput,
      confirmedBy: currentUser.id,
    });

    setSelectedBooking(null);
    setPnrInput('');
  };

  const handleReject = () => {
    if (!selectedBooking) return;
    store.rejectBooking({
      bookingId: selectedBooking.id,
      rejectionReason: 'Bus capacity full - no seats available',
      rejectedBy: currentUser.id,
    });
    setSelectedBooking(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black text-slate-900">operator.safargo.in</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200">
              Bus Operator Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Operator: <strong>{operatorName}</strong> • Representative: {currentUser.fullName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'assigned' ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Assigned Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'services' ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            My Bus Schedules
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'history' ? 'bg-indigo-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            History & Confirmations
          </button>
        </div>
      </div>

      {/* TAB 1: ASSIGNED REQUESTS */}
      {activeTab === 'assigned' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pending Seat Availability Verification</h3>
                <p className="text-xs text-slate-500">
                  Customer bookings waiting for your operational verification. Enter genuine PNR upon confirmation.
                </p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg border border-indigo-200">
                {pendingRequests.length} Pending
              </span>
            </div>

            {/* Operator response modal */}
            {selectedBooking && (
              <div className="p-5 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-4 text-xs">
                <div className="flex justify-between items-center font-bold text-indigo-950">
                  <span>Responding to {selectedBooking.bookingRef} ({selectedBooking.customerName})</span>
                  <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
                </div>

                <form onSubmit={handleConfirm} className="space-y-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Enter Genuine Operator PNR (From your fleet reservation system)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RYL-JP-9941"
                      value={pnrInput}
                      onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
                      className="w-full p-2 border border-slate-300 rounded-lg font-mono uppercase bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Assigned Seat / Berths</label>
                    <input
                      type="text"
                      value={seatNoteInput}
                      onChange={(e) => setSeatNoteInput(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow"
                    >
                      Confirm Seat & Submit PNR
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow"
                    >
                      Reject (No Availability)
                    </button>
                  </div>
                </form>
              </div>
            )}

            {pendingRequests.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {pendingRequests.map((b) => (
                  <div key={b.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{b.bookingRef}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-800">{b.passengersCount} Passenger(s)</span>
                        <StatusBadge status={b.status} size="sm" />
                      </div>
                      <div className="text-slate-600 mt-1">
                        <strong>{b.customerName}</strong> ({b.customerPhone}) • Journey: {b.journeyDate} at {b.departureTime}
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        Boarding: {b.boardingPoint} → Dropping: {b.droppingPoint}
                      </div>
                      <div className="text-indigo-700 text-[11px] font-medium mt-1">
                        Seat Preference Requested: {b.passengers[0]?.seatPreference || 'Any available'}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedBooking(b)}
                        className="px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white font-bold rounded-lg shadow"
                      >
                        Respond / Provide PNR
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No pending booking requests assigned to your fleet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULES */}
      {activeTab === 'services' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Configured Fleet Schedules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {operatorServices.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 text-sm">{s.busType}</h4>
                  <span className="font-bold text-safargo-navy">₹{s.baseFare}</span>
                </div>
                <div className="text-slate-600">Departs: {s.departureTime} • Arrives: {s.arrivalTime}</div>
                <div className="text-slate-500">Boarding Points: {s.boardingPoints.map((bp) => bp.name).join(', ')}</div>
                <div className="text-[11px] text-slate-400">Amenities: {s.amenities.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONFIRMATION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-base font-bold text-slate-900">Confirmation & Verification History</h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Journey Date</th>
                  <th className="p-3">Assigned Operator PNR</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {historyRequests.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-mono font-bold text-safargo-navy">{b.bookingRef}</td>
                    <td className="p-3">{b.customerName}</td>
                    <td className="p-3">{b.journeyDate}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700">{b.operatorPnr || '—'}</td>
                    <td className="p-3"><StatusBadge status={b.status} size="sm" /></td>
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
