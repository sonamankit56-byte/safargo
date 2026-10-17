import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import { BusFilters } from '../components/BusFilters';
import { BusCard } from '../components/BusCard';
import { SearchBox } from '../components/SearchBox';
import { Bus, Filter, ArrowUpDown, SlidersHorizontal, AlertCircle, ArrowLeft } from 'lucide-react';

export const SearchResultsView: React.FC = () => {
  const {
    fromCity,
    setFromCity,
    toCity,
    setToCity,
    journeyDate,
    matchedBuses,
    filters,
    setFilters,
    resetFilters,
    setCurrentView,
  } = useBooking();

  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Simulate smooth loading skeleton on route change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [fromCity, toCity, journeyDate]);

  const handleSortChange = (sortBy: typeof filters.sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
      {/* Top Breadcrumb & Route Ribbon */}
      <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {fromCity} → {toCity}
            </h1>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
              {matchedBuses.length} Buses Available
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Travel date: {new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Compact Search Trigger / Editor */}
        <div className="w-full md:w-auto">
          <SearchBox variant="compact" />
        </div>
      </div>

      {/* SORTING TABS & MOBILE FILTER BUTTON */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto py-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
          </span>

          {[
            { id: 'price_asc', label: 'Cheapest Fare' },
            { id: 'rating_desc', label: 'Top Rated' },
            { id: 'departure_asc', label: 'Earliest' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSortChange(tab.id as typeof filters.sortBy)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filters.sortBy === tab.id
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Filter Toggle Button */}
        <div className="lg:hidden w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>{mobileFilterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: FILTERS + BUS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* FILTERS SIDEBAR */}
        <div className={`lg:col-span-4 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-24">
            <BusFilters />
          </div>
        </div>

        {/* BUS LIST COLUMN */}
        <div className="lg:col-span-8 space-y-4">
          {isLoading ? (
            // Loading Skeletons
            <div className="space-y-4">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-6 bg-slate-200 rounded w-16" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-slate-100 rounded" />
                    <div className="h-10 bg-slate-100 rounded" />
                    <div className="h-10 bg-slate-100 rounded" />
                  </div>
                  <div className="h-8 bg-slate-100 rounded w-1/4 ml-auto" />
                </div>
              ))}
            </div>
          ) : matchedBuses.length > 0 ? (
            // Matching Buses List
            <div className="space-y-4">
              {matchedBuses.map((bus) => (
                <BusCard key={bus.id} bus={bus} />
              ))}
            </div>
          ) : (
            // Empty State
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900">No Buses Found For This Route</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No operators currently match your filter criteria for {fromCity} to {toCity}. Try relaxing filters or clearing selected bus types.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md hover:bg-red-700 transition-colors"
                >
                  Reset All Filters
                </button>
                <button
                  type="button"
                  onClick={() => { setFromCity('Delhi'); setToCity('Manali'); }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  Try Delhi → Manali
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
