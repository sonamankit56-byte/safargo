import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { TicketCard } from '../components/TicketCard';
import {
  Ticket,
  Search,
  Calendar,
  AlertTriangle,
  XCircle,
  Eye,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Booking } from '../types';

export const MyBookingsView: React.FC = () => {
  const { confirmedBookings, cancelBooking, setCurrentView } = useBooking();
  const [searchPnr, setSearchPnr] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);
  const [cancellingTicket, setCancellingTicket] = useState<Booking | null>(null);

  const filteredTickets = confirmedBookings.filter(b =>
    searchPnr ? b.pnr.toLowerCase().includes(searchPnr.toLowerCase()) : true
  );

  const handleConfirmCancel = () => {
    if (!cancellingTicket) return;
    const ok = cancelBooking(cancellingTicket.pnr);
    if (ok) {
      alert(`Booking ${cancellingTicket.pnr} has been cancelled successfully.\nRefund amount of ₹${Math.round(cancellingTicket.totalAmount * 0.9)} will be credited within 24 hours.`);
      setCancellingTicket(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-red-600" /> My Bus Bookings
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Manage your bus tickets, download PDF passes, and process trip cancellations
          </p>
        </div>

        {/* PNR Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchPnr}
            onChange={(e) => setSearchPnr(e.target.value)}
            placeholder="Search by PNR (e.g. SG...)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500 uppercase tracking-wider"
          />
        </div>
      </div>

      {/* Ticket List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => {
            const isCancelled = ticket.status === 'cancelled';
            return (
              <div
                key={ticket.pnr}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                      PNR: {ticket.pnr}
                    </span>
                    {isCancelled ? (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        Confirmed
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    Booked on {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  <div className="sm:col-span-5">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {ticket.bus.operator.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {ticket.bus.fromCity} → {ticket.bus.toCity}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Date: {new Date(ticket.journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <div className="sm:col-span-4 text-left sm:text-center">
                    <div className="text-xs font-bold text-slate-600">
                      Seats: <span className="text-red-600 font-black">{ticket.selectedSeats.map(s => s.number).join(', ')}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Pickup: {ticket.boardingPoint.time} ({ticket.boardingPoint.location})
                    </div>
                  </div>

                  <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between gap-2">
                    <div className="text-base font-black text-slate-900">
                      ₹{ticket.totalAmount}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTicket(ticket)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>

                      {!isCancelled && (
                        <button
                          type="button"
                          onClick={() => setCancellingTicket(ticket)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
            <Ticket className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't booked any bus trips yet or no tickets matched your PNR query.
          </p>
          <button
            onClick={() => setCurrentView('home')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            Book Your First Bus Now
          </button>
        </div>
      )}

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 z-10"
            >
              ✕
            </button>
            <TicketCard booking={selectedTicket} />
          </div>
        </div>
      )}

      {/* CANCELLATION CONFIRMATION MODAL */}
      {cancellingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                Cancel Bus Booking ({cancellingTicket.pnr})?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to cancel this booking? As per Safar Go's cancellation policy:
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>Total Ticket Price:</span>
                <span className="font-bold">₹{cancellingTicket.totalAmount}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Cancellation Charges (10%):</span>
                <span>-₹{Math.round(cancellingTicket.totalAmount * 0.1)}</span>
              </div>
              <div className="flex justify-between font-black text-emerald-600 pt-1 border-t border-slate-200">
                <span>Refund to Original Payment:</span>
                <span>₹{Math.round(cancellingTicket.totalAmount * 0.9)}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingTicket(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-100"
              >
                No, Keep Ticket
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-200"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
