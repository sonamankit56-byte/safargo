import React from 'react';
import { getUberBoardingAssistUrl, getUberDropAssistUrl, getEstimatedCabFare } from '../../lib/uberService';
import { Car, ExternalLink, MapPin, Navigation, Sparkles, CheckCircle } from 'lucide-react';

interface UberAssistCardProps {
  booking: {
    from_city: string;
    to_city: string;
    boarding_point?: string;
    drop_point?: string;
    actual_drop_point?: string;
    customer_name?: string;
  };
  mode?: 'boarding' | 'drop' | 'both';
  compact?: boolean;
}

export const UberAssistCard: React.FC<UberAssistCardProps> = ({
  booking,
  mode = 'both',
  compact = false,
}) => {
  const boardingUberUrl = getUberBoardingAssistUrl(booking);
  const dropUberUrl = getUberDropAssistUrl(booking);
  const fareEst = getEstimatedCabFare(booking.from_city, booking.to_city);

  if (compact) {
    return (
      <div className="bg-slate-950 text-white p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black border border-slate-700 flex items-center justify-center font-black text-xs text-white">
            Uber
          </div>
          <div>
            <span className="text-xs font-bold block text-slate-200">
              बस स्टैंड तक कैब / ऑटो
            </span>
            <span className="text-[10px] text-slate-400">
              बोर्डिंग स्टैंड: {booking.boarding_point || booking.from_city}
            </span>
          </div>
        </div>

        <a
          href={boardingUberUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
        >
          <span>Uber बुक करें</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-5 rounded-3xl border-2 border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded-xl bg-black border border-slate-700 text-white font-black text-xs tracking-wider">
            Uber
          </div>
          <div>
            <h4 className="text-sm font-black flex items-center gap-1.5 text-white">
              <span>SafarGo + Uber कनेक्टिविटी</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                लाइव पार्टनर
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              घर से बस स्टैंड और बस स्टैंड से घर तक सुरक्षित व आसान यात्रा
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] text-amber-400 font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Filled Destination</span>
        </div>
      </div>

      {/* Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(mode === 'boarding' || mode === 'both') && (
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Navigation className="w-3.5 h-3.5" />
                <span>1. बस स्टैंड तक ऑटो / कैब</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                पिकअप: आपके वर्तमान पते से <br />
                ड्रॉप: <strong className="text-white">{booking.boarding_point || `${booking.from_city} स्टैंड`}</strong>
              </p>
            </div>

            <a
              href={boardingUberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow transition active:scale-95"
            >
              <Car className="w-3.5 h-3.5" />
              <span>Uber से बस स्टैंड पहुँचें ➔</span>
            </a>
          </div>
        )}

        {(mode === 'drop' || mode === 'both') && (
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>2. उतरकर घर / होटल के लिए कैब</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                पिकअप: <strong className="text-white">{booking.actual_drop_point || booking.drop_point || `${booking.to_city} स्टैंड`}</strong> <br />
                ड्रॉप: आपके घर या गंतव्य तक
              </p>
            </div>

            <a
              href={dropUberUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs flex items-center justify-center gap-1.5 border border-slate-700 shadow transition active:scale-95"
            >
              <Car className="w-3.5 h-3.5 text-amber-300" />
              <span>Uber से घर / होटल जाएँ ➔</span>
            </a>
          </div>
        )}
      </div>

      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
        <span>Uber ऐप में बोर्डिंग और ड्रॉप एड्रेस पहले से सेट रहेगा।</span>
        <span className="font-mono text-slate-400">ID: {import.meta.env.VITE_UBER_CLIENT_ID ? 'CONNECTED' : 'STANDBY'}</span>
      </div>
    </div>
  );
};
