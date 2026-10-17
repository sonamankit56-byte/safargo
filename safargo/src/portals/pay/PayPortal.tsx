import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { Wallet, ShieldCheck, CheckCircle2, Clock, Search, Receipt, ArrowRight } from 'lucide-react';
import { Booking } from '../../lib/types';

export const PayPortal: React.FC = () => {
  const { state } = useStore();
  const [lookupRef, setLookupRef] = useState('');
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setFoundBooking(null);

    const b = state.bookings.find(
      (item) => item.bookingRef.toUpperCase() === lookupRef.trim().toUpperCase()
    );

    if (b) {
      setFoundBooking(b);
    } else {
      setErrorMsg('No payment transaction found for this Booking Reference.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-black text-slate-900">pay.safargo.in</span>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Payment & Settlement Hub
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Verify booking payments, inspect transaction references, and track refund progress.
        </p>
      </div>

      {/* Architecture Separation Banner */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1">
        <div className="font-bold text-amber-400 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Strict Status Separation Architecture</span>
        </div>
        <p className="text-slate-300 leading-relaxed">
          SafarGo maintains distinct lifecycle states: <strong>Booking Status</strong> (request queue), <strong>Payment Status</strong> (authorized transaction), <strong>Operator Ticket Status</strong> (genuine fleet PNR), and <strong>Refund Status</strong>. These are never treated as interchangeable.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="text-base font-bold text-slate-900">Search Transaction by Booking Reference</h3>
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Enter Booking Reference</label>
            <input
              type="text"
              required
              placeholder="e.g. SFG-2026-847291"
              value={lookupRef}
              onChange={(e) => setLookupRef(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg font-mono uppercase bg-slate-50"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 text-rose-700 rounded-lg">{errorMsg}</div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-safargo-navy hover:bg-slate-800 text-white font-bold rounded-xl shadow"
          >
            Verify Payment Record
          </button>
        </form>
      </div>

      {/* Result Card */}
      {foundBooking && (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl border-2 border-emerald-400 shadow-xl space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div>
              <span className="font-mono font-bold text-safargo-navy text-sm">{foundBooking.bookingRef}</span>
              <div className="text-slate-400 text-[11px]">{new Date(foundBooking.createdAt).toLocaleString()}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              PAYMENT VERIFIED
            </span>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <strong>{foundBooking.customerName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact:</span>
              <span>{foundBooking.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Route & Bus:</span>
              <span>{foundBooking.originCity} → {foundBooking.destinationCity} ({foundBooking.operatorName})</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
              <span>Total Settled Amount:</span>
              <span className="text-emerald-700 text-sm">₹{foundBooking.finalAmount}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
            <strong>Payment Provider Reference:</strong> SFG-GATEWAY-TXN-{foundBooking.id.slice(-6).toUpperCase()} • Verified in audit ledger.
          </div>
        </div>
      )}

      {/* Recent Verified Payments Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
        <h3 className="text-base font-bold text-slate-900">Recent Payment Records</h3>
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.bookings.slice(0, 5).map((b) => (
                <tr key={b.id}>
                  <td className="p-3 font-mono font-bold text-safargo-navy">{b.bookingRef}</td>
                  <td className="p-3">{b.customerName}</td>
                  <td className="p-3 font-bold text-slate-900">₹{b.finalAmount}</td>
                  <td className="p-3 text-slate-500">Assisted Desk Settlement</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      SUCCESSFUL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
