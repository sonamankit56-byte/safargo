import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { BusSeat } from '../../types/travel';
import { ArrowLeft, Check, Info, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
import { BusCabin3D } from '../3d/BusCabin3D';

export const SeatLayoutPicker: React.FC = () => {
  const { 
    selectedBus, 
    selectedSeats, 
    toggleSeatSelection, 
    clearSeatSelection, 
    setCurrentStep,
    isAgentLoggedIn,
    isCustomerLoggedIn,
    setIsAuthModalOpen,
    t 
  } = useTravel();

  const isAnyUserLoggedIn = isAgentLoggedIn || isCustomerLoggedIn;

  const [activeDeckTab, setActiveDeckTab] = useState<'lower' | 'upper'>('lower');
  const [cabinViewMode, setCabinViewMode] = useState<'3d' | 'classic'>('3d');

  if (!selectedBus) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <p className="text-slate-600 mb-4">{t('कोई बस चयनित नहीं है', 'No bus selected')}</p>
        <button
          onClick={() => setCurrentStep('bus_list')}
          className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl"
        >
          {t('बस सूची देखें', 'View Bus List')}
        </button>
      </div>
    );
  }

  const lowerDeckSeats = selectedBus.seats.filter(s => s.deck === 'lower');
  const upperDeckSeats = selectedBus.seats.filter(s => s.deck === 'upper');
  const activeDeckSeats = activeDeckTab === 'lower' ? lowerDeckSeats : upperDeckSeats;

  // Group seats by row (assuming rows 1 to 5)
  const rows = [1, 2, 3, 4, 5];

  const totalFare = selectedSeats.reduce((acc, seat) => acc + seat.fare, 0);

  const renderSeatItem = (seat: BusSeat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id);
    const isBooked = seat.status === 'booked';
    const isLadies = seat.status === 'ladies_reserved';
    const isSleeper = seat.type === 'sleeper';

    let bgClass = 'bg-white border-slate-300 text-slate-800 hover:border-emerald-500';
    if (isBooked) {
      bgClass = 'bg-slate-200 border-slate-200 text-slate-400 cursor-not-allowed';
    } else if (isSelected) {
      bgClass = 'bg-emerald-600 border-emerald-700 text-white shadow-md shadow-emerald-600/30 font-bold';
    } else if (isLadies) {
      bgClass = 'bg-pink-50 border-pink-300 text-pink-700 hover:bg-pink-100';
    }

    return (
      <button
        key={seat.id}
        type="button"
        disabled={isBooked}
        onClick={() => toggleSeatSelection(seat)}
        title={`${seat.seatNumber} - ₹${seat.fare} (${seat.type}${isLadies ? ', Ladies' : ''}${isBooked ? ', Booked' : ''})`}
        className={`relative transition-all duration-150 rounded-lg border flex flex-col items-center justify-center p-1.5 ${
          isSleeper ? 'h-24 w-12 sm:w-14' : 'h-14 w-12 sm:w-14'
        } ${bgClass}`}
      >
        {/* Sleeper pillow accent */}
        {isSleeper && (
          <div className={`w-3/4 h-2 rounded-t mb-1 border-b ${isSelected ? 'bg-emerald-400 border-emerald-500' : isBooked ? 'bg-slate-300' : 'bg-slate-100 border-slate-200'}`} />
        )}

        <span className="text-xs font-bold leading-none">{seat.seatNumber}</span>

        {!isBooked && (
          <span className={`text-[10px] mt-1 font-semibold leading-none ${isSelected ? 'text-emerald-100' : isLadies ? 'text-pink-600' : 'text-slate-500'}`}>
            ₹{seat.fare}
          </span>
        )}

        {/* Selected badge */}
        {isSelected && (
          <div className="absolute -top-1.5 -right-1.5 bg-white text-emerald-700 rounded-full p-0.5 shadow-sm border border-emerald-200">
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        )}

        {/* Ladies badge */}
        {isLadies && !isSelected && !isBooked && (
          <span className="absolute -bottom-1 -right-1 bg-pink-500 text-[8px] text-white font-bold px-1 rounded-full">
            F
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-28">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep('bus_list')}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-900 text-lg sm:text-xl">{selectedBus.operatorName}</h2>
              {selectedBus.isPrimo && (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                  PRIMO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {selectedBus.sourceCity} → {selectedBus.destinationCity} • {selectedBus.busType}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
          <div className="text-right">
            <p className="text-slate-500 font-medium">{t('प्रस्थान', 'Departure')}</p>
            <p className="font-bold text-slate-900 text-sm">{selectedBus.departureTime}</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <p className="text-slate-500 font-medium">{t('अवधि', 'Duration')}</p>
            <p className="font-bold text-emerald-700 text-sm">{selectedBus.duration}</p>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <p className="text-slate-500 font-medium">{t('पहुंचना', 'Arrival')}</p>
            <p className="font-bold text-slate-900 text-sm">{selectedBus.arrivalTime}</p>
          </div>
        </div>
      </div>

      {/* Main Seat Selector Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Bus Container (2 cols on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          {/* Deck & View Mode Switcher Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>{t('सीट चुनें', 'Select Seat')}</span>
                <span className="text-xs font-normal text-slate-500">({t('अधिकतम 6 सीटें', 'Max 6 seats')})</span>
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* 3D vs 2D View Switcher */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setCabinViewMode('3d')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                    cabinViewMode === '3d'
                      ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>3D केबिन</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCabinViewMode('classic')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    cabinViewMode === 'classic'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>क्लासिक 2D</span>
                </button>
              </div>

              {/* Deck Tabs */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveDeckTab('lower')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDeckTab === 'lower' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('लोअर डेक', 'Lower')} ({lowerDeckSeats.filter(s => s.status !== 'booked').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeckTab('upper')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDeckTab === 'upper' 
                      ? 'bg-emerald-600 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('अपर डेक', 'Upper')} ({upperDeckSeats.filter(s => s.status !== 'booked').length})
                </button>
              </div>
            </div>
          </div>

          {/* Conditional Layout: 3D Cabin vs Classic 2D Chassis */}
          {cabinViewMode === '3d' ? (
            <BusCabin3D
              seats={selectedBus.seats}
              selectedSeats={selectedSeats.map(s => s.seatNumber)}
              deck={activeDeckTab}
              onToggleSeat={(seatNum) => {
                const target = selectedBus.seats.find(s => s.seatNumber === seatNum);
                if (target) {
                  toggleSeatSelection(target);
                }
              }}
            />
          ) : (
            /* Classic 2D Seat Layout Diagram / Bus Chassis */
            <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-4 sm:p-6 relative max-w-md mx-auto">
              {/* Front of Bus Driver Steering Indicator */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {t('आगे का भाग (फ्रंट)', 'Front / Driver Side')}
                </div>
                {/* Steering Wheel Graphic */}
                <div className="flex items-center gap-2 text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium">
                  <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 0 0 20M12 12l7 4M12 12l-7 4M12 12V2" />
                  </svg>
                  <span>{t('चालक', 'Driver')}</span>
                </div>
              </div>

              {/* Seat Grid - Rows */}
              <div className="space-y-4">
                {rows.map((rowNum) => {
                  const rowSeats = activeDeckSeats.filter(s => s.row === rowNum);
                  const col1 = rowSeats.find(s => s.col === 1);
                  const col2 = rowSeats.find(s => s.col === 2);
                  const col3 = rowSeats.find(s => s.col === 3);

                  return (
                    <div key={rowNum} className="flex items-center justify-between px-2">
                      {/* Left Single Seat or Sleeper */}
                      <div className="flex items-center justify-center">
                        {col1 ? renderSeatItem(col1) : <div className="w-12 h-14" />}
                      </div>

                      {/* Aisle Walking Space */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="h-full border-r border-dashed border-slate-300 py-3 text-[10px] text-slate-400 font-mono tracking-widest select-none">
                          AISLE
                        </div>
                      </div>

                      {/* Right Pair Seats */}
                      <div className="flex items-center gap-3">
                        {col2 ? renderSeatItem(col2) : <div className="w-12 h-14" />}
                        {col3 ? renderSeatItem(col3) : <div className="w-12 h-14" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rear of bus */}
              <div className="mt-6 pt-3 border-t border-slate-200 text-center">
                <p className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                  {t('बस का पिछला भाग (रियर)', 'Rear / Back Side')}
                </p>
              </div>
            </div>
          )}

          {/* Seat Legend */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
              <span className="text-slate-700">{t('उपलब्ध (Available)', 'Available')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span className="text-slate-700 font-medium">{t('चयनित (Selected)', 'Selected')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-pink-100 border border-pink-400" />
              <span className="text-slate-700">{t('महिला आरक्षित (Ladies)', 'Ladies Seat')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slate-200 border border-slate-300" />
              <span className="text-slate-400">{t('बुक हो चुकी (Booked)', 'Booked')}</span>
            </div>
          </div>
        </div>

        {/* Sidebar Order & Selection Breakdown */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-bold text-slate-900 text-base">{t('सीट सारांश', 'Booking Summary')}</h4>
              {selectedSeats.length > 0 && (
                <button
                  type="button"
                  onClick={clearSeatSelection}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  {t('सभी हटाएं', 'Clear All')}
                </button>
              )}
            </div>

            {selectedSeats.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">{t('कृपया बस लेआउट से सीट चुनें', 'Please click on seats in the layout to select')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map(seat => (
                    <div 
                      key={seat.id}
                      className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg text-xs font-bold"
                    >
                      <span>{seat.seatNumber} ({seat.deck === 'lower' ? 'L' : 'U'})</span>
                      <span className="text-slate-500 font-normal">₹{seat.fare}</span>
                      <button
                        onClick={() => toggleSeatSelection(seat)}
                        className="text-slate-400 hover:text-rose-600 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>{t('मूल किराया (Base Fare)', 'Base Fare')} ({selectedSeats.length} {t('सीटें', 'Seats')}):</span>
                    <span className="font-semibold text-slate-900">₹{totalFare}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (5%):</span>
                    <span className="font-semibold text-slate-900">₹{Math.round(totalFare * 0.05)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t('सफ़रगो एश्योर्ड गारंटी', 'SafarGo Assured')}</span>
                    <span className="text-emerald-600 font-bold">{t('मुफ्त ₹0', 'FREE ₹0')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                    <span>{t('कुल देय राशि', 'Total Payable')}:</span>
                    <span className="text-emerald-700 text-base">₹{totalFare + Math.round(totalFare * 0.05)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Assured badge */}
            <div className="mt-4 p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{t('सफ़रगो प्राइमर गारंटी', 'SafarGo Prime Guarantee')}</p>
                <p className="text-[11px] text-emerald-700">
                  {t('100% रिफंड अगर बस 30 मिनट से अधिक लेट हो। महिला सुरक्षा हेतु 24x7 हेल्पलाइन।', '100% refund if bus delayed over 30 mins. 24x7 women safety helpline.')}
                </p>
              </div>
            </div>

            {/* Next Step Button */}
            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() => {
                if (!isAnyUserLoggedIn) {
                  setIsAuthModalOpen(true);
                  return;
                }
                setCurrentStep('boarding_select');
              }}
              className={`w-full mt-5 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                selectedSeats.length > 0
                  ? !isAnyUserLoggedIn
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-rose-600/30 cursor-pointer'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>
                {!isAnyUserLoggedIn
                  ? t('🔒 लॉगिन करके आगे बढ़ें', '🔒 Login to Continue')
                  : t('बोर्डिंग और ड्रॉपिंग पॉइंट चुनें', 'Select Boarding & Drop Points')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
