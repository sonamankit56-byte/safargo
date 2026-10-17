import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePortal } from '../../context/PortalContext';
import { Search, ArrowLeftRight, Calendar, Users, MapPin, AlertCircle } from 'lucide-react';

interface BusSearchWidgetProps {
  onSearch?: (criteria: { origin: string; destination: string; date: string; passengers: number }) => void;
  compact?: boolean;
}

export const BusSearchWidget: React.FC<BusSearchWidgetProps> = ({ onSearch, compact = false }) => {
  const { state } = useStore();
  const { setActivePortal } = usePortal();

  // Extract unique origins and destinations from active routes
  const activeRoutes = state.routes.filter((r) => r.isActive);
  const cities = Array.from(new Set(activeRoutes.flatMap((r) => [r.originCity, r.destinationCity])));

  const [origin, setOrigin] = useState<string>('Delhi');
  const [destination, setDestination] = useState<string>('Jaipur');
  
  // Default date: tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [journeyDate, setJourneyDate] = useState<string>(tomorrow);
  const [passengers, setPassengers] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
    setError(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!origin.trim() || !destination.trim()) {
      setError('Please select both departure and destination cities.');
      return;
    }

    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setError('Origin and destination cannot be the same city.');
      return;
    }

    if (!journeyDate) {
      setError('Please select a journey date.');
      return;
    }

    if (onSearch) {
      onSearch({ origin, destination, date: journeyDate, passengers });
    } else {
      // Navigate to book portal with query params
      setActivePortal('book');
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-safargo-navy flex items-center gap-2">
            <span>Bus Ticket Booking</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 font-sans">
              Manual Verification
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare verified operator schedules with dedicated 15-minute booking assistance.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Origin */}
          <div className="md:col-span-3 relative">
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Leaving From
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-safargo-orange focus:border-safargo-orange focus:bg-white"
              >
                {cities.map((city) => (
                  <option key={`from-${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center -my-2 md:my-0">
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Cities"
              className="p-2.5 rounded-full bg-slate-100 hover:bg-safargo-orange hover:text-white text-slate-600 transition-colors border border-slate-300 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination */}
          <div className="md:col-span-3 relative">
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Going To
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-safargo-orange absolute left-3 top-3" />
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-safargo-orange focus:border-safargo-orange focus:bg-white"
              >
                {cities.map((city) => (
                  <option key={`to-${city}`} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Journey Date */}
          <div className="md:col-span-3 relative">
            <label className="block text-[11px] font-semibold uppercase text-slate-500 mb-1">
              Journey Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-safargo-orange focus:border-safargo-orange focus:bg-white"
              />
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-safargo-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Search className="w-4 h-4" />
              <span>Search Buses</span>
            </button>
          </div>
        </div>

        {/* Popular Route Shortcuts */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Popular Routes:</span>
          {activeRoutes.slice(0, 4).map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setOrigin(r.originCity);
                setDestination(r.destinationCity);
                setError(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-safargo-orange text-slate-700 transition-colors"
            >
              {r.originCity} → {r.destinationCity}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
