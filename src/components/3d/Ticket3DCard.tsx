import React, { useState } from 'react';
import { Bus, QrCode, Phone, ShieldCheck, MapPin, Calendar, Clock, RotateCw, CheckCircle2, Award, Wifi, Coffee, BatteryCharging } from 'lucide-react';
import { BusBooking } from '../../types/travel';

interface Ticket3DCardProps {
  booking: BusBooking;
}

export const Ticket3DCard: React.FC<Ticket3DCardProps> = ({ booking }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto my-6 perspective-1500 select-none">
      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative w-full h-[480px] sm:h-[460px] preserve-3d transition-transform duration-700 ease-out cursor-pointer group"
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ========================================================================= */}
        {/* FRONT SIDE: 3D HOLOGRAPHIC BOARDING PASS                                 */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#0B194C] via-[#1E3A8A] to-[#E11D48] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-white/20 flex flex-col justify-between overflow-hidden">
          {/* Holographic background sheen */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand & PNR Header */}
          <div className="relative z-10 flex items-start justify-between border-b border-white/20 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Bus className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-wider text-white">SafarGo Primo</h3>
                <span className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase">3D Digital Boarding Pass</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-white/70 block uppercase font-mono">PNR NUMBER</span>
              <span className="text-sm font-mono font-black text-yellow-300 tracking-wider">
                {booking.pnr || `SFG${booking.id.slice(-6).toUpperCase()}`}
              </span>
            </div>
          </div>

          {/* Route & Times */}
          <div className="relative z-10 grid grid-cols-3 items-center text-center my-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="text-left">
              <span className="text-[10px] text-white/70 block uppercase">प्रस्थान (From)</span>
              <span className="text-base sm:text-lg font-black text-white block truncate">{booking.from}</span>
              <span className="text-xs text-yellow-300 font-bold block">{booking.departureTime || '21:30'}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] text-white/60 font-semibold mb-1">डायरेक्ट एक्सप्रेस</span>
              <div className="w-full flex items-center gap-1">
                <div className="h-0.5 flex-1 bg-gradient-to-r from-yellow-300 to-rose-400" />
                <Bus className="w-4 h-4 text-white shrink-0 animate-pulse" />
                <div className="h-0.5 flex-1 bg-gradient-to-r from-rose-400 to-yellow-300" />
              </div>
              <span className="text-[10px] text-emerald-300 font-bold mt-1">पुष्टि (Confirmed)</span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-white/70 block uppercase">पहुंच (To)</span>
              <span className="text-base sm:text-lg font-black text-white block truncate">{booking.to}</span>
              <span className="text-xs text-yellow-300 font-bold block">{booking.arrivalTime || '06:00'}</span>
            </div>
          </div>

          {/* Passenger & Seats Info */}
          <div className="relative z-10 grid grid-cols-2 gap-3 text-xs bg-black/20 p-3.5 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-white/70 block uppercase">यात्री का नाम</span>
              <span className="font-bold text-white text-sm block truncate">
                {booking.passengerDetails?.name || 'अधिकृत यात्री'}
              </span>
              <span className="text-[11px] text-white/80 block mt-0.5">
                {booking.date || new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-white/70 block uppercase">सीट संख्या (Seats)</span>
              <span className="text-base font-black text-yellow-300 block">
                {booking.seats?.join(', ') || '12U, 14U'}
              </span>
              <span className="text-[10px] text-emerald-300 font-bold block mt-0.5">AC स्लीपर 2+1</span>
            </div>
          </div>

          {/* Bottom Flip Hint & Amenities */}
          <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/20">
            <div className="flex items-center gap-2 text-white/90 text-xs">
              <Wifi className="w-3.5 h-3.5 text-yellow-300" />
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-300" />
              <Coffee className="w-3.5 h-3.5 text-sky-300" />
              <span className="text-[10px] text-white/70">Primo Amenities</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-yellow-300 font-bold bg-white/20 px-3 py-1.5 rounded-full border border-white/30 group-hover:bg-white/30 transition">
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>3D कार्ड पलटें ➔</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BACK SIDE: 3D GPS TRACKER & QR VERIFICATION                              */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-indigo-500/30 flex flex-col justify-between overflow-hidden">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">लाइव GPS ट्रैकिंग व सुरक्षा</span>
            </div>
            <span className="text-xs text-yellow-400 font-bold flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              <span>वापस पलटें</span>
            </span>
          </div>

          {/* Center QR & Boarding Verification */}
          <div className="text-center py-2 space-y-2">
            <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl shadow-xl border-4 border-emerald-500/40 flex items-center justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SAFARGO-PNR-${booking.pnr || booking.id}`}
                alt="Ticket QR"
                className="w-full h-full rounded-lg"
              />
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              बस में चढ़ते समय कंडक्टर को यह QR कोड दिखाएं
            </p>
          </div>

          {/* Safety & Amenities Desk */}
          <div className="bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">बस ऑपरेटर हेल्पलाइन:</span>
              <span className="font-mono font-bold text-white">+91 98260 12345</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">ड्राइवर संपर्क:</span>
              <span className="text-emerald-400 font-bold">बोर्डिंग से 30 मिनट पहले SMS होगा</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">24x7 SafarGo SOS:</span>
              <span className="font-bold text-rose-400">1800-SAFARGO (टोल-फ्री)</span>
            </div>
          </div>

          {/* Verified Badge */}
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800 text-xs text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>₹5,00,000 यात्रा बीमा द्वारा पूर्णतः सुरक्षित (Insured)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
