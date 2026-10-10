import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Booking } from '../../types';
import { Award, CheckCircle2, MapPin, User, Calendar, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

interface CommissionCelebrationProps {
  booking: Booking | null;
  onClose: () => void;
}

export const CommissionCelebration: React.FC<CommissionCelebrationProps> = ({ booking, onClose }) => {
  const { settings } = useData();

  useEffect(() => {
    if (booking) {
      // Fire confetti burst!
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ['#f97316', '#0f2744', '#10b981'],
      });
      fire(0.2, {
        spread: 60,
        colors: ['#fbbf24', '#3b82f6', '#ea580c'],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ['#10b981', '#f97316', '#ffffff'],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    }
  }, [booking]);

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-orange-200 transform transition-all animate-scaleUp">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg mb-3 animate-bounce">
            <Award className="w-10 h-10 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-black tracking-tight">बधाई हो! Congratulations!</h2>
          <p className="text-orange-100 text-sm font-medium mt-1">
            Booking Confirmed by SafarGo Admin
          </p>
          
          {/* Big Commission Amount Tag */}
          <div className="mt-4 inline-block bg-white text-slate-900 px-6 py-2.5 rounded-full shadow-md">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500 block">Commission Earned</span>
            <span className="text-3xl font-black text-emerald-600">
              ₹{settings.commission_rate.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Booking Details Body */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-sm space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500 font-medium">Booking ID:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {booking.booking_code}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" /> Customer:
              </span>
              <span className="font-semibold text-slate-900">{booking.customer_name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" /> Route:
              </span>
              <span className="font-medium text-slate-900">
                {booking.from_city} → {booking.to_city}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" /> Journey Date:
              </span>
              <span className="font-medium text-slate-900">{booking.journey_date}</span>
            </div>

            {booking.confirmed_seats && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Seat(s):</span>
                <span className="font-semibold text-orange-600">{booking.confirmed_seats}</span>
              </div>
            )}

            {booking.ticket_pnr && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Operator PNR:</span>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {booking.ticket_pnr}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 text-xs">
              <span className="text-slate-500">Confirmation Time:</span>
              <span className="text-slate-600 font-medium">
                {booking.confirmed_at ? new Date(booking.confirmed_at).toLocaleTimeString() : 'Just now'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-lg text-xs font-medium border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Amount automatically added to your Commission Ledger source of truth.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition shadow-md active:scale-95"
          >
            Awesome, Check Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
