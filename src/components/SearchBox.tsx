import React, { useState, useRef, useEffect } from 'react';
import { Bus, MapPin, Calendar, ArrowLeftRight, Search, Sparkles } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { CITIES } from '../data/mockData';

export const SearchBox: React.FC<{ variant?: 'hero' | 'compact' }> = ({ variant = 'hero' }) => {
  const {
    fromCity,
    setFromCity,
    toCity,
    setToCity,
    journeyDate,
    setJourneyDate,
    swapCities,
    setCurrentView,
  } = useBooking();

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setToOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim() || !toCity.trim()) {
      alert('Please choose both departure and destination cities');
      return;
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      alert('Departure and destination cities cannot be identical');
      return;
    }
    setCurrentView('search');
  };

  const filteredFromCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(fromCity.toLowerCase())
  );
  const filteredToCities = CITIES.filter(c =>
    c.name.toLowerCase().includes(toCity.toLowerCase())
  );

  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setJourneyDate(d.toISOString().split('T')[0]);
  };

  const isCompact = variant === 'compact';

  return (
    <div className={`w-full ${isCompact ? '' : 'max-w-5xl mx-auto'}`}>
      <form
        onSubmit={handleSearch}
        className={`bg-white rounded-2xl shadow-xl border border-slate-200 p-2 sm:p-3 transition-all ${
          isCompact ? 'p-2' : ''
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-center">
          {/* FROM CITY */}
          <div className="md:col-span-4 relative" ref={fromRef}>
            <div
              onClick={() => setFromOpen(true)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all cursor-pointer bg-slate-50/50"
            >
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Bus className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  From City
                </label>
                <input
                  type="text"
                  value={fromCity}
                  onChange={(e) => {
                    setFromCity(e.target.value);
                    setFromOpen(true);
                  }}
                  placeholder="Enter source city"
                  className="w-full bg-transparent font-bold text-slate-800 text-base focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* From City Autocomplete */}
            {fromOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase">
                  Popular Departure Cities
                </div>
                {filteredFromCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setFromCity(c.name);
                      setFromOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg text-left transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {c.name}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{c.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SWAP BUTTON */}
          <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
            <button
              type="button"
              onClick={swapCities}
              title="Swap Departure and Destination"
              className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md hover:shadow-lg text-slate-600 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* TO CITY */}
          <div className="md:col-span-4 relative" ref={toRef}>
            <div
              onClick={() => setToOpen(true)}
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all cursor-pointer bg-slate-50/50"
            >
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  To Destination
                </label>
                <input
                  type="text"
                  value={toCity}
                  onChange={(e) => {
                    setToCity(e.target.value);
                    setToOpen(true);
                  }}
                  placeholder="Enter destination city"
                  className="w-full bg-transparent font-bold text-slate-800 text-base focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            {/* To City Autocomplete */}
            {toOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase">
                  Popular Destinations
                </div>
                {filteredToCities.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setToCity(c.name);
                      setToOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 rounded-lg text-left transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      {c.name}
                    </span>
                    <span className="text-xs text-slate-400 font-normal">{c.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DATE PICKER */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all bg-slate-50/50">
              <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Journey Date
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="text-slate-500 hover:text-red-600 font-semibold"
                    >
                      Today
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setQuickDate(1)}
                      className="text-red-600 font-bold"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={journeyDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full bg-transparent font-bold text-slate-800 text-sm focus:outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH SUBMIT BUTTON */}
        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto w-full sm:w-auto py-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Popular:
            </span>
            <button
              type="button"
              onClick={() => { setFromCity('Delhi'); setToCity('Manali'); }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 font-medium shrink-0 transition-colors"
            >
              Delhi → Manali
            </button>
            <button
              type="button"
              onClick={() => { setFromCity('Mumbai'); setToCity('Goa'); }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 font-medium shrink-0 transition-colors"
            >
              Mumbai → Goa
            </button>
            <button
              type="button"
              onClick={() => { setFromCity('Bangalore'); setToCity('Hyderabad'); }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-red-50 hover:text-red-600 font-medium shrink-0 transition-colors"
            >
              Bangalore → Hyderabad
            </button>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-base px-8 py-3.5 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer shrink-0"
          >
            <Search className="w-5 h-5" />
            <span>SEARCH BUSES</span>
          </button>
        </div>
      </form>
    </div>
  );
};
