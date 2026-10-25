import React, { useState } from 'react';
import { BusSeat } from '../../types/travel';
import { Check, Sparkles, User, ShieldCheck } from 'lucide-react';

interface BusCabin3DProps {
  seats: BusSeat[];
  selectedSeats: string[];
  onToggleSeat: (seatNumber: string) => void;
  deck: 'lower' | 'upper';
}

export const BusCabin3D: React.FC<BusCabin3DProps> = ({
  seats,
  selectedSeats,
  onToggleSeat,
  deck
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  // Filter seats by deck
  const deckSeats = seats.filter(s => s.deck === deck);

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-indigo-500/20 perspective-1500 select-none overflow-hidden relative">
      {/* Ambient 3D Cabin Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabin Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-sm text-white">
              {deck === 'lower' ? 'लोअर डेक 3D केबिन (Lower Deck)' : 'अपर डेक 3D केबिन (Upper Deck Sleeper)'}
            </h4>
            <span className="text-[10px] text-slate-400">3D सीट पर क्लिक करके चुनें</span>
          </div>
        </div>

        {/* 3D Steering / Driver Cabin indicator */}
        <div className="px-3 py-1 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <span>🚍 स्टीयरिंग / फ्रंट</span>
        </div>
      </div>

      {/* 3D Isometric Bus Floor Container */}
      <div 
        className="my-6 mx-auto max-w-xl preserve-3d transition-transform duration-300"
        style={{
          transform: 'rotateX(24deg) rotateZ(0deg)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Bus Flooring Plate with Depth */}
        <div className="bg-slate-800/90 rounded-3xl p-4 sm:p-6 border-2 border-slate-700 shadow-2xl relative">
          {/* Center Aisle Carpet */}
          <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-8 sm:w-12 bg-slate-900/80 rounded-xl border border-dashed border-slate-700/60 flex flex-col justify-around items-center pointer-events-none">
            <span className="text-[9px] text-slate-600 font-bold -rotate-90">AISLE</span>
            <span className="text-[9px] text-slate-600 font-bold -rotate-90">रास्ता</span>
          </div>

          {/* Grid of 3D Seats */}
          <div className="grid grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-4 relative z-10">
            {deckSeats.map((seat) => {
              const isSelected = selectedSeats.includes(seat.number);
              const isAvailable = seat.status === 'available';
              const isFemale = seat.status === 'female_only';
              const isBooked = seat.status === 'booked';
              const isSleeper = seat.type === 'sleeper';
              const isHovered = hoveredSeat === seat.number;

              return (
                <div
                  key={seat.id || seat.number}
                  onMouseEnter={() => setHoveredSeat(seat.number)}
                  onMouseLeave={() => setHoveredSeat(null)}
                  onClick={() => {
                    if (isAvailable || isFemale || isSelected) {
                      onToggleSeat(seat.number);
                    }
                  }}
                  className={`relative transition-all duration-300 cursor-pointer ${
                    isBooked ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'
                  }`}
                  style={{
                    transform: isSelected
                      ? 'translateZ(26px) scale(1.05)'
                      : isHovered && !isBooked
                      ? 'translateZ(18px) scale(1.03)'
                      : 'translateZ(4px)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  {/* 3D Seat/Sleeper Box */}
                  <div
                    className={`rounded-2xl p-3 sm:p-3.5 border-2 transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-white shadow-lg shadow-emerald-500/50 text-white'
                        : isFemale
                        ? 'bg-gradient-to-tr from-pink-900/60 to-rose-950/80 border-pink-500/60 text-pink-200'
                        : isBooked
                        ? 'bg-slate-800 border-slate-700 text-slate-500'
                        : 'bg-gradient-to-tr from-slate-900 to-indigo-950 hover:from-indigo-900 hover:to-indigo-800 border-indigo-500/40 text-white shadow-md'
                    }`}
                    style={{
                      height: isSleeper ? '110px' : '75px'
                    }}
                  >
                    {/* 3D Pillow / Headrest for Sleeper */}
                    {isSleeper && (
                      <div className="w-full h-4 bg-white/20 rounded-lg mb-2 border border-white/30 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white/80 uppercase">Pillow</span>
                      </div>
                    )}

                    {/* Seat Number & Price */}
                    <div className="flex items-start justify-between">
                      <span className="font-mono font-black text-sm tracking-wider">
                        {seat.number}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white text-emerald-700 flex items-center justify-center shrink-0 shadow-sm animate-scale-in">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Seat Type Label */}
                    <div className="mt-1">
                      <span className="text-[10px] font-bold block opacity-90">
                        {isSleeper ? 'स्लीपर बर्थ' : 'पुशबैक सीट'}
                      </span>
                      <span className="text-xs font-black block mt-0.5 text-yellow-300">
                        ₹{seat.price}
                      </span>
                    </div>

                    {/* Female Only Badge */}
                    {isFemale && (
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-pink-500/30 text-pink-300 text-[8px] font-black uppercase">
                        महिला
                      </div>
                    )}
                  </div>

                  {/* 3D Under-seat Shadow */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-black/40 -z-10 blur-sm transition-all"
                    style={{
                      transform: isSelected
                        ? 'translateY(12px) scale(0.95)'
                        : isHovered
                        ? 'translateY(8px) scale(0.96)'
                        : 'translateY(2px)'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3D Legend Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 border-t border-white/10 text-xs text-white relative z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-indigo-900 border border-indigo-400" />
          <span className="text-slate-300 text-[11px]">उपलब्ध (Available)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-emerald-500 border border-white shadow-sm" />
          <span className="text-emerald-400 font-bold text-[11px]">चुनी गई (Selected)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-pink-900 border border-pink-400" />
          <span className="text-pink-300 text-[11px]">केवल महिला (Women)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md bg-slate-800 border border-slate-700 opacity-60" />
          <span className="text-slate-500 text-[11px]">बुक हो चुकी (Booked)</span>
        </div>
      </div>
    </div>
  );
};
