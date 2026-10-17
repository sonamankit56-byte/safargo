import React, { useState } from 'react';
import { Bus } from '../types';
import { SeatLayout } from './SeatLayout';
import {
  Star,
  Sparkles,
  Wifi,
  Droplet,
  BatteryCharging,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  Navigation,
  Clock,
} from 'lucide-react';

interface Props {
  bus: Bus;
}

export const BusCard: React.FC<Props> = ({ bus }) => {
  const [showSeats, setShowSeats] = useState(false);

  // Helper to map amenity names to icons
  const renderAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3.5 h-3.5 text-blue-500" />;
    if (lower.includes('water')) return <Droplet className="w-3.5 h-3.5 text-cyan-500" />;
    if (lower.includes('charg')) return <BatteryCharging className="w-3.5 h-3.5 text-amber-500" />;
    if (lower.includes('track')) return <Navigation className="w-3.5 h-3.5 text-emerald-500" />;
    return <Shield className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden">
      {/* Top Banner for Primo */}
      {bus.operator.isPrimo && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-black px-4 py-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> PRIMO VERIFIED OPERATOR
          </span>
          <span className="font-medium text-amber-100 hidden sm:inline">
            Guaranteed On-Time • Punctual • Sanitized
          </span>
        </div>
      )}

      {/* Main Bus Row */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* OPERATOR & BUS TYPE */}
          <div className="md:col-span-4 text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                {bus.operator.name}
              </h3>
              <div className="flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded-md text-xs font-black">
                <span>{bus.operator.rating}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              {bus.operator.busType}
            </p>

            {/* Amenities pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {bus.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                >
                  {renderAmenityIcon(amenity)}
                  {amenity}
                </span>
              ))}
              {bus.amenities.length > 3 && (
                <span className="text-[10px] text-slate-400 font-bold">
                  +{bus.amenities.length - 3} more
                </span>
              )}
            </div>
          </div>

          {/* TIMINGS & ROUTE DURATION */}
          <div className="md:col-span-5 flex items-center justify-between text-center px-2">
            <div className="text-left">
              <div className="text-lg font-black text-slate-900">{bus.departureTime}</div>
              <div className="text-xs font-bold text-slate-700">{bus.fromCity}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                {bus.boardingPoints[0]?.location || 'Main Stand'}
              </div>
            </div>

            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3" /> {bus.duration}
              </span>
              <div className="w-20 sm:w-28 h-0.5 bg-slate-300 relative flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-red-600 absolute -top-[3px] left-0" />
                <div className="w-2 h-2 rounded-full bg-emerald-600 absolute -top-[3px] right-0" />
              </div>
              <span className="text-[9px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
                Direct
              </span>
            </div>

            <div className="text-right">
              <div className="text-lg font-black text-slate-900">{bus.arrivalTime}</div>
              <div className="text-xs font-bold text-slate-700">{bus.toCity}</div>
              <div className="text-[10px] text-slate-400 truncate max-w-[100px]">
                {bus.droppingPoints[0]?.location || 'Main Drop'}
              </div>
            </div>
          </div>

          {/* FARE & CTA BUTTON */}
          <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Starting at</div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-slate-900">₹{bus.basePrice}</span>
                <span className="text-xs text-slate-400 line-through">
                  ₹{Math.round(bus.basePrice * 1.25)}
                </span>
              </div>
              <div className="text-[11px] font-bold text-emerald-600">
                {bus.seatsAvailable} Seats left
                {bus.singleSeatsAvailable > 0 && ` (${bus.singleSeatsAvailable} Single)`}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSeats(!showSeats)}
              className={`mt-2 flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer ${
                showSeats
                  ? 'bg-slate-900 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200'
              }`}
            >
              <span>{showSeats ? 'HIDE SEATS' : 'VIEW SEATS'}</span>
              {showSeats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Seat Layout Accordion */}
      {showSeats && <SeatLayout bus={bus} onClose={() => setShowSeats(false)} />}
    </div>
  );
};
