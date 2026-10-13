import React, { useState } from 'react';
import { BusTrip, SeatCategory } from '../../types';
import {
  X,
  Bus,
  Check,
  User,
  ShieldCheck,
  ArrowRight,
  Info,
  Clock,
  MapPin,
  Sparkles,
  Wifi,
  Zap,
  Coffee,
  Shield
} from 'lucide-react';

export interface SelectedSeatItem {
  id: string;
  number: string;
  type: 'seater' | 'sleeper';
  deck: 'lower' | 'upper';
  fare: number;
  isLadies?: boolean;
}

interface RedBusSeatMapModalProps {
  trip: BusTrip;
  onClose: () => void;
  onConfirmSelection: (selection: {
    selectedSeats: SelectedSeatItem[];
    totalFare: number;
    seatCategory: SeatCategory;
    boardingPoint: string;
    dropPoint: string;
    passengerCount: number;
  }) => void;
}

export const RedBusSeatMapModal: React.FC<RedBusSeatMapModalProps> = ({
  trip,
  onClose,
  onConfirmSelection,
}) => {
  const [activeDeck, setActiveDeck] = useState<'lower' | 'upper'>('lower');
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState<string>(
    trip.boarding_points && trip.boarding_points.length > 0 ? trip.boarding_points[0] : `${trip.source} Main Stand`
  );
  const [dropPoint, setDropPoint] = useState<string>(
    trip.drop_points && trip.drop_points.length > 0 ? trip.drop_points[0] : `${trip.destination} ISBT`
  );
  const [boardingSathi, setBoardingSathi] = useState<boolean>(false);

  const seaterFare = trip.seater_fare || 650;
  const sleeperFare = trip.sleeper_fare || Math.round(seaterFare * 1.45);

  // Generate realistic Lower Deck Layout (Front Seaters + Lower Berths)
  // Lower deck: 4 rows of Seaters (2 on left, 1 on right) + back row
  const lowerDeckSeats: {
    id: string;
    number: string;
    type: 'seater' | 'sleeper';
    fare: number;
    status: 'available' | 'booked' | 'ladies';
    col: number; // 0, 1 (left pair), 2 (aisle), 3 (right single)
    row: number;
  }[] = [
    // Row 1
    { id: 'L1', number: 'L1', type: 'seater', fare: seaterFare, status: 'booked', col: 0, row: 1 },
    { id: 'L2', number: 'L2', type: 'seater', fare: seaterFare, status: 'available', col: 1, row: 1 },
    { id: 'L3', number: 'L3', type: 'seater', fare: seaterFare, status: 'available', col: 3, row: 1 },
    // Row 2
    { id: 'L4', number: 'L4', type: 'seater', fare: seaterFare, status: 'ladies', col: 0, row: 2 },
    { id: 'L5', number: 'L5', type: 'seater', fare: seaterFare, status: 'available', col: 1, row: 2 },
    { id: 'L6', number: 'L6', type: 'seater', fare: seaterFare, status: 'booked', col: 3, row: 2 },
    // Row 3
    { id: 'L7', number: 'L7', type: 'seater', fare: seaterFare, status: 'available', col: 0, row: 3 },
    { id: 'L8', number: 'L8', type: 'seater', fare: seaterFare, status: 'available', col: 1, row: 3 },
    { id: 'L9', number: 'L9', type: 'seater', fare: seaterFare, status: 'available', col: 3, row: 3 },
    // Row 4
    { id: 'L10', number: 'L10', type: 'seater', fare: seaterFare, status: 'available', col: 0, row: 4 },
    { id: 'L11', number: 'L11', type: 'seater', fare: seaterFare, status: 'booked', col: 1, row: 4 },
    { id: 'L12', number: 'L12', type: 'seater', fare: seaterFare, status: 'available', col: 3, row: 4 },
    // Row 5 (Rear Lower Sleepers)
    { id: 'L13', number: 'L13', type: 'sleeper', fare: sleeperFare, status: 'available', col: 0, row: 5 },
    { id: 'L14', number: 'L14', type: 'sleeper', fare: sleeperFare, status: 'available', col: 1, row: 5 },
    { id: 'L15', number: 'L15', type: 'sleeper', fare: sleeperFare, status: 'booked', col: 3, row: 5 },
  ];

  // Generate realistic Upper Deck Layout (All Sleeper Berths - Double on left, Single on right)
  const upperDeckSeats: {
    id: string;
    number: string;
    type: 'sleeper';
    fare: number;
    status: 'available' | 'booked' | 'ladies';
    col: number; // 0, 1 (double berth), 2 (aisle), 3 (single window berth)
    row: number;
  }[] = [
    // Row 1
    { id: 'U1', number: 'U1', type: 'sleeper', fare: sleeperFare, status: 'available', col: 0, row: 1 },
    { id: 'U2', number: 'U2', type: 'sleeper', fare: sleeperFare, status: 'available', col: 1, row: 1 },
    { id: 'U3', number: 'U3', type: 'sleeper', fare: sleeperFare, status: 'available', col: 3, row: 1 },
    // Row 2
    { id: 'U4', number: 'U4', type: 'sleeper', fare: sleeperFare, status: 'ladies', col: 0, row: 2 },
    { id: 'U5', number: 'U5', type: 'sleeper', fare: sleeperFare, status: 'booked', col: 1, row: 2 },
    { id: 'U6', number: 'U6', type: 'sleeper', fare: sleeperFare, status: 'available', col: 3, row: 2 },
    // Row 3
    { id: 'U7', number: 'U7', type: 'sleeper', fare: sleeperFare, status: 'available', col: 0, row: 3 },
    { id: 'U8', number: 'U8', type: 'sleeper', fare: sleeperFare, status: 'available', col: 1, row: 3 },
    { id: 'U9', number: 'U9', type: 'sleeper', fare: sleeperFare, status: 'booked', col: 3, row: 3 },
    // Row 4
    { id: 'U10', number: 'U10', type: 'sleeper', fare: sleeperFare, status: 'available', col: 0, row: 4 },
    { id: 'U11', number: 'U11', type: 'sleeper', fare: sleeperFare, status: 'available', col: 1, row: 4 },
    { id: 'U12', number: 'U12', type: 'sleeper', fare: sleeperFare, status: 'available', col: 3, row: 4 },
  ];

  const allSeatsMap = new Map<string, SelectedSeatItem>();
  lowerDeckSeats.forEach((s) =>
    allSeatsMap.set(s.id, {
      id: s.id,
      number: s.number,
      type: s.type,
      deck: 'lower',
      fare: s.fare,
      isLadies: s.status === 'ladies',
    })
  );
  upperDeckSeats.forEach((s) =>
    allSeatsMap.set(s.id, {
      id: s.id,
      number: s.number,
      type: 'sleeper',
      deck: 'upper',
      fare: s.fare,
      isLadies: s.status === 'ladies',
    })
  );

  const toggleSeat = (id: string, isBooked: boolean) => {
    if (isBooked) return;
    setSelectedSeatIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectedSeatItems: SelectedSeatItem[] = selectedSeatIds
    .map((id) => allSeatsMap.get(id))
    .filter(Boolean) as SelectedSeatItem[];

  const rawSeatsFare = selectedSeatItems.reduce((sum, item) => sum + item.fare, 0);
  const boardingSathiFee = boardingSathi ? 33 : 0;
  const totalAmount = rawSeatsFare + boardingSathiFee;

  // Determine primary category
  const hasSleeper = selectedSeatItems.some((s) => s.type === 'sleeper');
  const hasSeater = selectedSeatItems.some((s) => s.type === 'seater');
  const resolvedCategory: SeatCategory =
    hasSleeper && hasSeater
      ? 'ac_sleeper'
      : hasSleeper
      ? 'ac_sleeper'
      : 'ac_seater';

  const handleConfirm = () => {
    if (selectedSeatItems.length === 0) return;
    onConfirmSelection({
      selectedSeats: selectedSeatItems,
      totalFare: totalAmount,
      seatCategory: resolvedCategory,
      boardingPoint,
      dropPoint,
      passengerCount: selectedSeatItems.length,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 my-auto flex flex-col max-h-[92vh]">
        
        {/* 1. RedBus Style Header Bar */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 sm:p-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shadow-inner">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base sm:text-lg tracking-tight">
                  {trip.operator_name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 flex items-center gap-1 shadow-xs">
                  ⭐ 4.9 (SafarGo Verified Premium)
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                {trip.source} ➔ {trip.destination} • प्रस्थान: <strong>{trip.departure_time}</strong> ({trip.bus_type})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. RedBus Amenities & Route Highlights Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> लाइव जीपीएस ट्रैकिंग
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Wifi className="w-3.5 h-3.5 text-indigo-500" /> वाई-फाई
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Coffee className="w-3.5 h-3.5 text-emerald-600" /> पानी बोतल व तकिया
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" /> सेफ हाइजीन बस
            </span>
          </div>

          <div className="text-[11px] font-bold text-slate-500">
            तारीख: <span className="text-slate-900">{trip.journey_date}</span>
          </div>
        </div>

        {/* 3. Main Body: Bus Interior Seat Grid + Selection Summary */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-100/50">
          
          {/* Left Column: Interactive Bus Floor Layout (Lg: 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-5">
            
            {/* Deck Selector Tabs (RedBus Lower Deck vs Upper Deck) */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveDeck('lower')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeDeck === 'lower'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>💺 निचला तल (Lower Deck)</span>
                  <span className="text-[10px] opacity-80 font-normal">सीटर + स्लीपर</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDeck('upper')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                    activeDeck === 'upper'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <span>🛏️ ऊपरी तल (Upper Deck)</span>
                  <span className="text-[10px] opacity-80 font-normal">केवल स्लीपर</span>
                </button>
              </div>
            </div>

            {/* RedBus Seat Legend (बैठने वाले vs सोने वाले) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-slate-300 bg-white" />
                <span>उपलब्ध (Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                  ✓
                </div>
                <span>चुनी हुई (Selected)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-pink-100 border border-pink-400" />
                <span>महिला (Ladies)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slate-300 border border-slate-400" />
                <span>बुक हो चुकी (Sold)</span>
              </div>
            </div>

            {/* 🚌 Bus Interior Cabin Layout Container */}
            <div className="border-2 border-slate-300 rounded-3xl p-4 sm:p-6 bg-slate-50/60 relative shadow-inner">
              
              {/* Bus Front Driver Steering & Entrance Gate */}
              <div className="flex items-center justify-between border-b-2 border-dashed border-slate-300 pb-3 mb-5">
                <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>प्रवेश द्वार (Front Gate)</span>
                </div>

                {/* Driver Steering Wheel graphic on the right */}
                <div className="flex items-center gap-2 text-slate-600 text-xs font-black bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  <span>ड्राइवर स्टीयरिंग</span>
                  <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center font-bold text-[10px] bg-slate-100">
                    🛞
                  </div>
                </div>
              </div>

              {/* Deck Notice */}
              <div className="text-center mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-700 shadow-xs">
                  {activeDeck === 'lower' ? 'निचला तल (Seater & Sleeper)' : 'ऊपरी तल (Full AC Sleeper Berths)'}
                </span>
              </div>

              {/* SEAT GRID: 2 left columns | AISLE | 1 right column */}
              <div className="space-y-4 max-w-sm mx-auto">
                {activeDeck === 'lower' ? (
                  // Lower Deck Rows
                  [1, 2, 3, 4, 5].map((rowNum) => {
                    const rowSeats = lowerDeckSeats.filter((s) => s.row === rowNum);
                    const leftSeats = rowSeats.filter((s) => s.col < 2);
                    const rightSeat = rowSeats.find((s) => s.col === 3);

                    return (
                      <div key={`row-${rowNum}`} className="flex items-center justify-between gap-3">
                        {/* Left Pair of Seats */}
                        <div className="flex items-center gap-2.5">
                          {leftSeats.map((seat) => {
                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = seat.status === 'booked';
                            const isLadies = seat.status === 'ladies';

                            return seat.type === 'seater' ? (
                              // 💺 ERGONOMIC SEATER CHAIR GRAPHIC (बैठने वाले)
                              <button
                                key={seat.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat.id, isBooked)}
                                className={`relative w-12 sm:w-14 h-15 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-between p-1.5 border-2 shadow-xs group ${
                                  isBooked
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                                    : isLadies
                                    ? 'bg-pink-50 border-pink-400 text-pink-700 hover:border-pink-500'
                                    : 'bg-white border-slate-300 text-slate-700 hover:border-red-500 hover:shadow-md'
                                }`}
                                title={`सीट: ${seat.number} (सीटर) - ₹${seat.fare}`}
                              >
                                {/* Chair Headrest */}
                                <div className={`w-8 h-2 rounded-t-md border-b ${
                                  isSelected ? 'bg-emerald-400/80 border-emerald-500' : 'bg-slate-200/80 border-slate-300'
                                }`} />

                                {/* Sitting Chair Figure / Seat Number */}
                                <div className="text-center space-y-0.5">
                                  <span className="font-mono font-black text-xs block leading-none">
                                    {seat.number}
                                  </span>
                                  <span className="text-[9px] font-bold block leading-none opacity-90">
                                    ₹{seat.fare}
                                  </span>
                                </div>

                                {/* Chair Armrests on left & right */}
                                <div className="w-full flex justify-between px-0.5">
                                  <div className="w-1.5 h-3 rounded-full bg-slate-300 group-hover:bg-slate-400" />
                                  <div className="w-1.5 h-3 rounded-full bg-slate-300 group-hover:bg-slate-400" />
                                </div>

                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black border border-white">
                                    ✓
                                  </span>
                                )}
                              </button>
                            ) : (
                              // 🛏️ SLEEPER BERTH GRAPHIC (सोने वाले - Lower Sleeper)
                              <button
                                key={seat.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat.id, isBooked)}
                                className={`relative w-12 sm:w-14 h-24 rounded-2xl transition-all cursor-pointer flex flex-col justify-between p-2 border-2 shadow-sm group ${
                                  isBooked
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                                    : 'bg-white border-blue-300 text-slate-800 hover:border-red-500 hover:shadow-md'
                                }`}
                                title={`स्लीपर बर्थ: ${seat.number} - ₹${seat.fare}`}
                              >
                                {/* Pillow (तकिया) at the head */}
                                <div className={`w-full h-4 rounded-lg flex items-center justify-center text-[8px] font-bold ${
                                  isSelected ? 'bg-emerald-400/90 text-emerald-950' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  तकिया
                                </div>

                                {/* Quilted Mattress Lines & Berth Code */}
                                <div className="text-center py-1">
                                  <span className="font-mono font-black text-xs block">
                                    {seat.number}
                                  </span>
                                  <span className="text-[9px] font-extrabold block">
                                    ₹{seat.fare}
                                  </span>
                                  <span className="text-[8px] block opacity-75 font-medium">
                                    (स्लीपर)
                                  </span>
                                </div>

                                {/* Bed end border */}
                                <div className={`w-full h-1.5 rounded-full ${
                                  isSelected ? 'bg-emerald-400' : 'bg-slate-200'
                                }`} />

                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black border border-white">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Central Walking Aisle (रास्ता) */}
                        <div className="flex-1 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono tracking-widest px-2">
                          <span>||</span>
                          <span className="text-[9px]">रास्ता</span>
                          <span>||</span>
                        </div>

                        {/* Right Single Window Seat / Sleeper */}
                        <div>
                          {rightSeat && (
                            rightSeat.type === 'seater' ? (
                              <button
                                type="button"
                                disabled={rightSeat.status === 'booked'}
                                onClick={() => toggleSeat(rightSeat.id, rightSeat.status === 'booked')}
                                className={`relative w-12 sm:w-14 h-15 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-between p-1.5 border-2 shadow-xs group ${
                                  rightSeat.status === 'booked'
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                    : selectedSeatIds.includes(rightSeat.id)
                                    ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                                    : 'bg-white border-slate-300 text-slate-700 hover:border-red-500 hover:shadow-md'
                                }`}
                                title={`सीट: ${rightSeat.number} (विंडो सीटर) - ₹${rightSeat.fare}`}
                              >
                                <div className={`w-8 h-2 rounded-t-md border-b ${
                                  selectedSeatIds.includes(rightSeat.id) ? 'bg-emerald-400/80' : 'bg-slate-200/80'
                                }`} />
                                <div className="text-center space-y-0.5">
                                  <span className="font-mono font-black text-xs block leading-none">
                                    {rightSeat.number}
                                  </span>
                                  <span className="text-[9px] font-bold block leading-none opacity-90">
                                    ₹{rightSeat.fare}
                                  </span>
                                </div>
                                <div className="w-full flex justify-between px-0.5">
                                  <div className="w-1.5 h-3 rounded-full bg-slate-300" />
                                  <div className="w-1.5 h-3 rounded-full bg-slate-300" />
                                </div>
                                {selectedSeatIds.includes(rightSeat.id) && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black border border-white">
                                    ✓
                                  </span>
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={rightSeat.status === 'booked'}
                                onClick={() => toggleSeat(rightSeat.id, rightSeat.status === 'booked')}
                                className={`relative w-12 sm:w-14 h-24 rounded-2xl transition-all cursor-pointer flex flex-col justify-between p-2 border-2 shadow-sm group ${
                                  rightSeat.status === 'booked'
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                    : selectedSeatIds.includes(rightSeat.id)
                                    ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                                    : 'bg-white border-blue-300 text-slate-800 hover:border-red-500 hover:shadow-md'
                                }`}
                                title={`स्लीपर बर्थ: ${rightSeat.number} - ₹${rightSeat.fare}`}
                              >
                                <div className={`w-full h-4 rounded-lg flex items-center justify-center text-[8px] font-bold ${
                                  selectedSeatIds.includes(rightSeat.id) ? 'bg-emerald-400/90 text-emerald-950' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  तकिया
                                </div>
                                <div className="text-center py-1">
                                  <span className="font-mono font-black text-xs block">
                                    {rightSeat.number}
                                  </span>
                                  <span className="text-[9px] font-extrabold block">
                                    ₹{rightSeat.fare}
                                  </span>
                                  <span className="text-[8px] block opacity-75 font-medium">
                                    (स्लीपर)
                                  </span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full ${
                                  selectedSeatIds.includes(rightSeat.id) ? 'bg-emerald-400' : 'bg-slate-200'
                                }`} />
                                {selectedSeatIds.includes(rightSeat.id) && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black border border-white">
                                    ✓
                                  </span>
                                )}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // Upper Deck Rows (All Sleeper Berths)
                  [1, 2, 3, 4].map((rowNum) => {
                    const rowSeats = upperDeckSeats.filter((s) => s.row === rowNum);
                    const leftSeats = rowSeats.filter((s) => s.col < 2);
                    const rightSeat = rowSeats.find((s) => s.col === 3);

                    return (
                      <div key={`urow-${rowNum}`} className="flex items-center justify-between gap-3">
                        {/* Left Double Sleeper Berths */}
                        <div className="flex items-center gap-2.5">
                          {leftSeats.map((seat) => {
                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = seat.status === 'booked';
                            const isLadies = seat.status === 'ladies';

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                disabled={isBooked}
                                onClick={() => toggleSeat(seat.id, isBooked)}
                                className={`relative w-12 sm:w-14 h-26 rounded-2xl transition-all cursor-pointer flex flex-col justify-between p-2 border-2 shadow-sm group ${
                                  isBooked
                                    ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                                    : isLadies
                                    ? 'bg-pink-50 border-pink-400 text-pink-700 hover:border-pink-500'
                                    : 'bg-white border-blue-300 text-slate-800 hover:border-red-500 hover:shadow-md'
                                }`}
                                title={`अपर स्लीपर: ${seat.number} - ₹${seat.fare}`}
                              >
                                {/* Pillow (तकिया) at the head */}
                                <div className={`w-full h-4 rounded-lg flex items-center justify-center text-[8px] font-bold ${
                                  isSelected ? 'bg-emerald-400/90 text-emerald-950' : isLadies ? 'bg-pink-200 text-pink-900' : 'bg-blue-100 text-blue-900'
                                }`}>
                                  {isLadies ? 'महिला' : 'तकिया'}
                                </div>

                                {/* Quilted Mattress Lines & Berth Code */}
                                <div className="text-center py-1">
                                  <span className="font-mono font-black text-xs block">
                                    {seat.number}
                                  </span>
                                  <span className="text-[9px] font-extrabold block">
                                    ₹{seat.fare}
                                  </span>
                                  <span className="text-[8px] block opacity-75 font-medium">
                                    (अपर स्लीपर)
                                  </span>
                                </div>

                                <div className={`w-full h-1.5 rounded-full ${
                                  isSelected ? 'bg-emerald-400' : 'bg-slate-200'
                                }`} />

                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black border border-white">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Walking Aisle */}
                        <div className="flex-1 flex flex-col items-center justify-center text-[10px] text-slate-400 font-mono tracking-widest px-2">
                          <span>||</span>
                          <span className="text-[9px]">रास्ता</span>
                          <span>||</span>
                        </div>

                        {/* Right Single Window Sleeper */}
                        <div>
                          {rightSeat && (
                            <button
                              type="button"
                              disabled={rightSeat.status === 'booked'}
                              onClick={() => toggleSeat(rightSeat.id, rightSeat.status === 'booked')}
                              className={`relative w-12 sm:w-14 h-26 rounded-2xl transition-all cursor-pointer flex flex-col justify-between p-2 border-2 shadow-sm group ${
                                rightSeat.status === 'booked'
                                  ? 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed'
                                  : selectedSeatIds.includes(rightSeat.id)
                                  ? 'bg-emerald-600 border-emerald-700 text-white ring-4 ring-emerald-200 scale-105'
                                  : 'bg-white border-blue-300 text-slate-800 hover:border-red-500 hover:shadow-md'
                              }`}
                              title={`सिंगल विंडो स्लीपर: ${rightSeat.number} - ₹${rightSeat.fare}`}
                            >
                              <div className={`w-full h-4 rounded-lg flex items-center justify-center text-[8px] font-bold ${
                                selectedSeatIds.includes(rightSeat.id) ? 'bg-emerald-400/90 text-emerald-950' : 'bg-blue-100 text-blue-900'
                              }`}>
                                तकिया
                              </div>
                              <div className="text-center py-1">
                                <span className="font-mono font-black text-xs block">
                                  {rightSeat.number}
                                </span>
                                <span className="text-[9px] font-extrabold block">
                                  ₹{rightSeat.fare}
                                </span>
                                <span className="text-[8px] block opacity-75 font-medium">
                                  (विंडो स्लीपर)
                                </span>
                              </div>
                              <div className={`w-full h-1.5 rounded-full ${
                                selectedSeatIds.includes(rightSeat.id) ? 'bg-emerald-400' : 'bg-slate-200'
                              }`} />
                              {selectedSeatIds.includes(rightSeat.id) && (
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[9px] font-black border border-white">
                                  ✓
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rear Emergency Exit */}
              <div className="border-t-2 border-dashed border-slate-300 pt-3 mt-5 flex justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  आपातकालीन निकास (Rear Exit)
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: RedBus Trip Summary & Booking Checkout Panel (Lg: 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Selected Seats Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <span>चुनी हुई सीटें (Selected Seats)</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-black">
                    {selectedSeatItems.length}
                  </span>
                </h3>
                {selectedSeatItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSeatIds([])}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    हटाएं (Clear)
                  </button>
                )}
              </div>

              {selectedSeatItems.length === 0 ? (
                <div className="py-8 text-center space-y-2 text-slate-400 text-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <p className="font-medium">
                    कृपया बस में अपनी पसंद की <strong>सीटर</strong> या <strong>स्लीपर</strong> सीट पर क्लिक करें।
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {selectedSeatItems.map((seat) => (
                      <div
                        key={seat.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs"
                      >
                        <span className="font-mono font-black">{seat.number}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-950 font-bold">
                          {seat.type === 'seater' ? 'सीटर 💺' : 'स्लीपर 🛏️'}
                        </span>
                        <span className="font-black">₹{seat.fare}</span>
                        <button
                          type="button"
                          onClick={() => toggleSeat(seat.id, false)}
                          className="text-emerald-700 hover:text-rose-600 font-bold ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Boarding & Dropping Points Selectors */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                    <span>बैठने का स्थान (Boarding Point) *</span>
                  </label>
                  <select
                    value={boardingPoint}
                    onChange={(e) => setBoardingPoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium text-xs outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {trip.boarding_points && trip.boarding_points.length > 0 ? (
                      trip.boarding_points.map((bp) => (
                        <option key={bp} value={bp}>
                          {bp}
                        </option>
                      ))
                    ) : (
                      <option value={`${trip.source} Main Stand`}>{trip.source} Main Stand</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>उतरने का स्थान (Dropping Point) *</span>
                  </label>
                  <select
                    value={dropPoint}
                    onChange={(e) => setDropPoint(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 font-medium text-xs outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {trip.drop_points && trip.drop_points.length > 0 ? (
                      trip.drop_points.map((dp) => (
                        <option key={dp} value={dp}>
                          {dp}
                        </option>
                      ))
                    ) : (
                      <option value={`${trip.destination} ISBT`}>{trip.destination} ISBT</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Boarding Sathi (+₹33) Service Toggle */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1.5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-black text-amber-950">
                      बोर्डिंग साथी सेवा (Boarding Sathi) जोड़ें
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={boardingSathi}
                    onChange={(e) => setBoardingSathi(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded cursor-pointer"
                  />
                </label>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  +₹33 मात्र: स्टेशन पर एजेंट आपको बस में बैठाएगा और सामान रखवाने में सहायता करेगा।
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>सीटों का कुल किराया ({selectedSeatItems.length} सीटें):</span>
                  <strong className="text-slate-900 font-mono">₹{rawSeatsFare}</strong>
                </div>
                {boardingSathi && (
                  <div className="flex justify-between text-amber-900 font-bold">
                    <span>बोर्डिंग साथी सहायता शुल्क:</span>
                    <span className="font-mono">+₹33</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>SafarGo सुविधा शुल्क:</span>
                  <span className="text-emerald-600 font-bold">मुफ़्त (₹0)</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>कुल देय राशि (Total Amount):</span>
                  <span className="text-red-700 font-black text-lg font-mono">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Confirm CTA */}
              <button
                type="button"
                disabled={selectedSeatItems.length === 0}
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 disabled:opacity-50 text-white font-black text-sm shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>
                  {selectedSeatItems.length === 0
                    ? 'सीटें चुनें (Select Seats)'
                    : `₹${totalAmount} — आगे बढ़ें (${selectedSeatItems.length} सीटें)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
