import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, Volume2, VolumeX, Bell } from 'lucide-react';

interface CountdownTimerProps {
  deadlineAt: string;
  status: string;
  onExpire?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  deadlineAt,
  status,
  onExpire,
  compact = false,
}) => {
  const [timeLeftMs, setTimeLeftMs] = useState<number>(() => {
    return Math.max(0, new Date(deadlineAt).getTime() - Date.now());
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const chimePlayedRef = useRef(false);

  // Soft Web Audio API Chime Synthesizer
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback might be restricted until user interaction
    }
  };

  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, new Date(deadlineAt).getTime() - Date.now());
      setTimeLeftMs(remaining);

      // Trigger chime when entering the last 60 seconds
      if (remaining > 0 && remaining <= 60000 && !chimePlayedRef.current) {
        chimePlayedRef.current = true;
        if (soundEnabled) {
          playChime();
        }
      }

      if (remaining === 0 && onExpire && (status === 'booking_request' || status === 'awaiting_operator_confirmation')) {
        onExpire();
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadlineAt, status, onExpire, soundEnabled]);

  // If already resolved or cancelled
  if (status === 'confirmed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
        Confirmed
      </span>
    );
  }

  if (status === 'rejected' || status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
        Closed
      </span>
    );
  }

  const isExpired = timeLeftMs <= 0 || status === 'expired';

  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
        <AlertTriangle className="w-3.5 h-3.5" />
        EXPIRED (15m window passed)
      </span>
    );
  }

  const totalSeconds = Math.floor(timeLeftMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Color coding by remaining time
  let colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  if (minutes < 1) {
    colorStyles = 'bg-rose-50 text-rose-700 border-rose-300 animate-bounce';
  } else if (minutes < 5) {
    colorStyles = 'bg-amber-50 text-amber-700 border-amber-300 animate-pulse';
  } else if (minutes < 10) {
    colorStyles = 'bg-sky-50 text-sky-700 border-sky-200';
  }

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded border ${colorStyles}`}
        title="15 मिनट टाइमर: WhatsApp पर एक्टिव रहें, SafarGo टीम विवरण मांगेगी"
      >
        <Clock className="w-3 h-3" />
        {formatted}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${colorStyles}`}
      title="15 मिनट टाइमर: एजेंट को WhatsApp पर एक्टिव रहना अनिवार्य है"
    >
      <Clock className="w-4 h-4 shrink-0" />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-sm tracking-tight">{formatted}</span>
          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100/90 px-1.5 py-0.2 rounded">
            WhatsApp Active
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playChime();
            }}
            className="text-slate-400 hover:text-slate-700 transition p-0.5"
            title={soundEnabled ? 'ऑडियो अलर्ट चालू है (क्लिक करके म्यूट करें)' : 'ऑडियो अलर्ट म्यूट है (क्लिक करके चालू करें)'}
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
        <div className="text-[10px] opacity-90 leading-tight mt-0.5">
          WhatsApp पर एक्टिव रहें (टीम डिटेल मांगेगी)
        </div>
      </div>
    </div>
  );
};
