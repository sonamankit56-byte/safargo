import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, PhoneCall, CheckCircle } from 'lucide-react';

interface AssistanceTimerProps {
  startedAt: string;
  targetMinutes?: number;
  status: string;
  bookingRef: string;
}

export const AssistanceTimer: React.FC<AssistanceTimerProps> = ({
  startedAt,
  targetMinutes = 15,
  status,
  bookingRef,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const startTime = new Date(startedAt).getTime();
    const targetMs = targetMinutes * 60 * 1000;
    const elapsed = Date.now() - startTime;
    return Math.max(0, Math.floor((targetMs - elapsed) / 1000));
  });

  const [isDelayed, setIsDelayed] = useState<boolean>(() => {
    const startTime = new Date(startedAt).getTime();
    const targetMs = targetMinutes * 60 * 1000;
    return Date.now() - startTime > targetMs;
  });

  useEffect(() => {
    // If already finalized, timer is stopped
    if (status === 'confirmed' || status === 'rejected' || status === 'cancelled') {
      return;
    }

    const interval = setInterval(() => {
      const startTime = new Date(startedAt).getTime();
      const targetMs = targetMinutes * 60 * 1000;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((targetMs - elapsed) / 1000));
      
      setSecondsRemaining(remaining);
      if (remaining === 0) {
        setIsDelayed(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, targetMinutes, status]);

  if (status === 'confirmed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800 text-xs flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          <strong>Assistance Completed:</strong> Operator verified and seat confirmed. Genuine operator reference recorded.
        </span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-800 text-xs flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
        <span>
          <strong>Booking Request Declined:</strong> Operator indicated no seats or service unavailable.
        </span>
      </div>
    );
  }

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <div className={`rounded-xl border p-4 ${isDelayed ? 'bg-amber-50 border-amber-300' : 'bg-blue-50 border-blue-200'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-lg ${isDelayed ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
            <Clock className={`w-5 h-5 ${!isDelayed && 'animate-spin'}`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800 text-sm">
                {isDelayed ? 'Assistance Response Taking Longer Than Usual' : 'Manual Booking Verification in Progress'}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200 font-mono text-slate-700">
                Target: {targetMinutes} Mins
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-lg">
              {isDelayed
                ? 'Our operations team is contacting the operator directly to verify seat availability. We will update your status shortly.'
                : 'Our operations team is manually coordinating with the authorized bus operator to verify seat availability.'}
            </p>
          </div>
        </div>

        {/* Timer display */}
        <div className="flex items-center space-x-4 self-end sm:self-center">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Service Target</div>
            <div className={`font-mono text-xl font-bold ${isDelayed ? 'text-amber-700' : 'text-blue-700'}`}>
              {isDelayed ? 'Delayed' : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
            </div>
          </div>

          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(
              `Hello SafarGo Support, checking status for my manual booking request ${bookingRef}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>WhatsApp Desk</span>
          </a>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
        <span>* Service target time is an operational goal. Confirmation requires genuine operator authorization.</span>
        <span className="font-mono text-[10px] text-slate-400">Ref: {bookingRef}</span>
      </div>
    </div>
  );
};
