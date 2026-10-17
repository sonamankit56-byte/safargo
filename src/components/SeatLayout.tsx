import React, { useState } from 'react';
import { Bus, Seat, DeckType } from '../types';
import { useBooking } from '../context/BookingContext';
import { BoardingDroppingPicker } from './BoardingDroppingPicker';
import { Check, ShieldAlert, ArrowRight, Layers } from 'lucide-react';

interface Props {
  bus: Bus;
  onClose: () => void;
}

export const SeatLayout: React.FC<Props> = ({ bus, onClose }) => {
  const {
    selectedSeats,
    toggleSeat,
    selectedBoarding,
    setSelectedBoarding,
    selectedDropping,
    setSelectedDropping,
    setSelectedBus,
    setCurrentView,
  } = useBooking();

  const [activeDeck, setActiveDeck] = useState<DeckType>('lower');

  const hasUpperDeck = bus.seats.some(s => s.deck === 'upper');
  const deckSeats = bus.seats.filter(s => s.deck === activeDeck);

  // Group by rows (1 to 6)
  const rows = Array.from(new Set(deckSeats.map(s => s.row))).sort((a, b) => a - b);

  const totalPrice = selectedSeats.reduce((acc, s) => acc + s.price, 0);

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least 1 seat to continue');
      return;
    }
    if (!selectedBoarding) {
      alert('Please select a boarding point');
      return;
    }
    if (!selectedDropping) {
      alert('Please select a dropping point');
      return;
    }
    setSelectedBus(bus);
    setCurrentView('checkout');
  };

  // Helper to render a seat button
  const renderSeat = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const isBooked = seat.status === 'booked';
    const isFemale = seat.status === 'female_reserved';
    const isSleeper = seat.type === 'sleeper';

    let bgClass = 'bg-white border-slate-300 hover:border-slate-500 hover:shadow-xs text-slate-700';
    if (isBooked) {
      bgClass = 'bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed';
    } else if (isFemale) {
      bgClass = 'bg-pink-50 border-pink-400 text-pink-700 hover:bg-pink-100';
    }

    if (isSelected) {
      bgClass = 'bg-emerald-600 border-emerald-700 text-white shadow-md ring-2 ring-emerald-300';
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isBooked}
        onClick={() => toggleSeat(seat)}
        title={`${seat.number} (${seat.type}) - ₹${seat.price} ${isFemale ? '[Female Reserved]' : ''}`}
        className={`group relative flex flex-col items-center justify-between border rounded-lg transition-all active:scale-95 ${bgClass} ${
          isSleeper ? 'w-11 h-20 p-1.5' : 'w-11 h-12 p-1'
        }`}
      >
        {/* Sleeper pillow or seat backrest top */}
        <div
          className={`w-full rounded-xs ${
            isSleeper ? 'h-3.5 border-b' : 'h-2 border-b'
          } ${
            isSelected
              ? 'border-emerald-400 bg-emerald-700'
              : isBooked
              ? 'border-slate-300 bg-slate-300'
              : isFemale
              ? 'border-pink-300 bg-pink-100'
              : 'border-slate-200 bg-slate-100'
          }`}
        />

        <div className="flex items-center justify-center my-auto">
          {isSelected ? (
            <Check className="w-4 h-4 stroke-[3]" />
          ) : (
            <span className="text-[10px] font-bold tracking-tighter">{seat.number}</span>
          )}
        </div>

        <span className={`text-[8px] font-semibold ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
          ₹{seat.price}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-white border-t border-slate-200 p-4 sm:p-6 rounded-b-2xl shadow-inner space-y-6 animate-in slide-in-from-top-4 duration-200">
      {/* Deck Selector & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Deck Tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveDeck('lower')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDeck === 'lower'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Lower Deck
          </button>
          {hasUpperDeck && (
            <button
              type="button"
              onClick={() => setActiveDeck('upper')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeDeck === 'upper'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Upper Deck
            </button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
              <Check className="w-2.5 h-2.5" />
            </div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-pink-100 border border-pink-400" />
            <span>Female Reserved</span>
          </div>
        </div>
      </div>

      {/* Main Bus Layout & Walkway */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* BUS CABIN CONTAINER */}
        <div className="lg:col-span-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center">
          {/* Front / Driver Area */}
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-200 text-xs font-bold text-slate-400">
            <span className="uppercase tracking-widest text-[10px]">
              {activeDeck.toUpperCase()} DECK
            </span>
            <div className="flex items-center gap-1 text-slate-600 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs">
              <div className="w-3 h-3 rounded-full border-2 border-slate-600 flex items-center justify-center">
                <div className="w-1 h-1 bg-slate-600 rounded-full" />
              </div>
              <span className="text-[10px]">DRIVER</span>
            </div>
          </div>

          {/* Seat Rows Matrix */}
          <div className="space-y-3 w-full">
            {rows.map((rowNum) => {
              const rowSeats = deckSeats.filter(s => s.row === rowNum);
              const leftSeat = rowSeats.find(s => s.col === 1);
              const rightSeat1 = rowSeats.find(s => s.col === 2);
              const rightSeat2 = rowSeats.find(s => s.col === 3);

              return (
                <div key={rowNum} className="flex items-center justify-between gap-4 w-full">
                  {/* Left Column (Single window seat) */}
                  <div className="flex justify-center w-12">
                    {leftSeat ? renderSeat(leftSeat) : <div className="w-11" />}
                  </div>

                  {/* Walkway Aisle */}
                  <div className="flex-1 border-t border-dashed border-slate-200 text-center">
                    <span className="text-[9px] text-slate-300 font-mono tracking-widest uppercase">
                      AISLE
                    </span>
                  </div>

                  {/* Right Columns (Double seat) */}
                  <div className="flex items-center gap-2">
                    {rightSeat1 ? renderSeat(rightSeat1) : <div className="w-11" />}
                    {rightSeat2 ? renderSeat(rightSeat2) : <div className="w-11" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400 font-medium">
            Rear of the Bus
          </div>
        </div>

        {/* BOARDING & DROPPING + PRICE SUMMARY */}
        <div className="lg:col-span-7 space-y-4">
          <BoardingDroppingPicker
            boardingPoints={bus.boardingPoints}
            droppingPoints={bus.droppingPoints}
            selectedBoarding={selectedBoarding}
            selectedDropping={selectedDropping}
            onSelectBoarding={setSelectedBoarding}
            onSelectDropping={setSelectedDropping}
          />

          {/* Sticky Summary Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Selected Seats:</span>
                <span className="font-extrabold text-sm text-emerald-400">
                  {selectedSeats.length > 0
                    ? selectedSeats.map(s => s.number).join(', ')
                    : 'None'}
                </span>
                {selectedSeats.length > 0 && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xs text-slate-400">Total Price:</span>
                <span className="text-xl font-black text-white">₹{totalPrice}</span>
                <span className="text-[10px] text-slate-400">(incl. taxes)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleProceed}
                disabled={selectedSeats.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${
                  selectedSeats.length > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-red-900/50'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>PROCEED TO BOOK</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
