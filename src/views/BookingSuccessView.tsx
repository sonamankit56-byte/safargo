import React, { useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { TicketCard } from '../components/TicketCard';
import { CheckCircle2, Ticket, ArrowLeft, Home, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BookingSuccessView: React.FC = () => {
  const { activePnr, getBookingByPnr, setCurrentView } = useBooking();

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
  }, []);

  const booking = activePnr ? getBookingByPnr(activePnr) : undefined;

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No Booking Ticket Found</h2>
        <button
          onClick={() => setCurrentView('home')}
          className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-100">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" /> Booking Confirmed Successfully
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Congratulations! Your Journey is Booked
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          An SMS and WhatsApp message with your PNR number has been sent to {booking.contactPhone}.
        </p>
      </div>

      {/* Ticket Card Component */}
      <TicketCard booking={booking} />

      {/* Quick Action Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 print:hidden">
        <button
          type="button"
          onClick={() => setCurrentView('my-bookings')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all active:scale-95"
        >
          <Ticket className="w-4 h-4" />
          <span>MANAGE IN MY BOOKINGS</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>BOOK ANOTHER JOURNEY</span>
        </button>
      </div>
    </div>
  );
};
