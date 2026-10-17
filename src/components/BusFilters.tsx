import React from 'react';
import { RotateCcw, Sunrise, Sun, Sunset, Moon, Sparkles, UserCheck, Shield } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { MOCK_BUSES } from '../data/mockData';

export const BusFilters: React.FC = () => {
  const { filters, setFilters, resetFilters } = useBooking();

  // Extract unique operators from mock data
  const operators = Array.from(new Set(MOCK_BUSES.map(b => b.operator.name)));

  const handleBusTypeToggle = (key: keyof typeof filters.busTypes) => {
    setFilters(prev => ({
      ...prev,
      busTypes: {
        ...prev.busTypes,
        [key]: !prev.busTypes[key],
      },
    }));
  };

  const handleDepartureSlotToggle = (key: keyof typeof filters.departureSlots) => {
    setFilters(prev => ({
      ...prev,
      departureSlots: {
        ...prev.departureSlots,
        [key]: !prev.departureSlots[key],
      },
    }));
  };

  const handleOperatorToggle = (op: string) => {
    setFilters(prev => {
      const exists = prev.selectedOperators.includes(op);
      return {
        ...prev,
        selectedOperators: exists
          ? prev.selectedOperators.filter(o => o !== op)
          : [...prev.selectedOperators, op],
      };
    });
  };

  return (
    <aside className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">FILTERS</h3>
        <button
          onClick={resetFilters}
          className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          RESET ALL
        </button>
      </div>

      {/* Primo / Verified Badges */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Top Highlights
        </div>
        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-red-300 transition-colors cursor-pointer bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Primo Buses</p>
              <p className="text-[10px] text-slate-400">Top rated, punctual & clean</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={filters.primoOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, primoOnly: e.target.checked }))}
            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-red-300 transition-colors cursor-pointer bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Single Seats</p>
              <p className="text-[10px] text-slate-400">Solo window / aisle privacy</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={filters.singleSeatsOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, singleSeatsOnly: e.target.checked }))}
            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
          />
        </label>
      </div>

      {/* Departure Time Slots */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Departure Time
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleDepartureSlotToggle('earlyMorning')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
              filters.departureSlots.earlyMorning
                ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <Sunrise className="w-4 h-4 mb-1 text-amber-500" />
            <span className="text-[11px] font-semibold">Before 6 AM</span>
          </button>

          <button
            type="button"
            onClick={() => handleDepartureSlotToggle('morning')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
              filters.departureSlots.morning
                ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <Sun className="w-4 h-4 mb-1 text-orange-500" />
            <span className="text-[11px] font-semibold">6 AM - 12 PM</span>
          </button>

          <button
            type="button"
            onClick={() => handleDepartureSlotToggle('afternoon')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
              filters.departureSlots.afternoon
                ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <Sunset className="w-4 h-4 mb-1 text-rose-500" />
            <span className="text-[11px] font-semibold">12 PM - 6 PM</span>
          </button>

          <button
            type="button"
            onClick={() => handleDepartureSlotToggle('night')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
              filters.departureSlots.night
                ? 'border-red-600 bg-red-50 text-red-700 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <Moon className="w-4 h-4 mb-1 text-indigo-500" />
            <span className="text-[11px] font-semibold">After 6 PM</span>
          </button>
        </div>
      </div>

      {/* Bus Types */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Bus Types
        </div>
        <div className="space-y-2">
          {[
            { id: 'ac', label: 'AC Buses', key: 'ac' as const },
            { id: 'nonAc', label: 'Non-AC Buses', key: 'nonAc' as const },
            { id: 'sleeper', label: 'Sleeper Berths', key: 'sleeper' as const },
            { id: 'seater', label: 'Seater Chairs', key: 'seater' as const },
          ].map(type => (
            <label
              key={type.id}
              className="flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer py-1"
            >
              <span>{type.label}</span>
              <input
                type="checkbox"
                checked={filters.busTypes[type.key]}
                onChange={() => handleBusTypeToggle(type.key)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <span>Max Price</span>
          <span className="text-slate-900 font-extrabold text-sm">₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min="300"
          max="2500"
          step="50"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value, 10) }))}
          className="w-full accent-red-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>₹300</span>
          <span>₹2,500</span>
        </div>
      </div>

      {/* Operators */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Bus Operators
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {operators.map(op => (
            <label
              key={op}
              className="flex items-center justify-between text-xs text-slate-700 hover:text-slate-900 cursor-pointer py-1"
            >
              <span className="truncate pr-2 font-medium">{op}</span>
              <input
                type="checkbox"
                checked={filters.selectedOperators.includes(op)}
                onChange={() => handleOperatorToggle(op)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 shrink-0"
              />
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};
