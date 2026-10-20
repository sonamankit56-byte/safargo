import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { BusCard } from './BusCard';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Filter, Sparkles } from 'lucide-react';

export const BusList: React.FC = () => {
  const { 
    fromCity, 
    toCity, 
    journeyDate, 
    filteredBuses, 
    busFilter, 
    setBusFilter, 
    setCurrentStep, 
    t 
  } = useTravel();

  const [sortBy, setSortBy] = useState<'price_asc' | 'duration_asc' | 'rating_desc' | 'time_asc'>('price_asc');

  const sortedBuses = [...filteredBuses].sort((a, b) => {
    if (sortBy === 'price_asc') return a.fare - b.fare;
    if (sortBy === 'rating_desc') return b.rating - a.rating;
    if (sortBy === 'time_asc') return a.departureTime.localeCompare(b.departureTime);
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-24">
      {/* Route & Search Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentStep('search')}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{fromCity}</span>
              <span className="text-emerald-600">→</span>
              <span>{toCity}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {journeyDate} • <span className="text-emerald-700 font-bold">{sortedBuses.length} {t('बसें उपलब्ध', 'buses found')}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setCurrentStep('search')}
          className="self-start md:self-auto px-4 py-2 border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-600 transition"
        >
          {t('खोज बदलें (Modify)', 'Modify Search')}
        </button>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> {t('फ़िल्टर', 'Filters')}:
          </span>
          <button
            onClick={() => setBusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              busFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('सभी बसें', 'All Buses')}
          </button>
          <button
            onClick={() => setBusFilter('ac')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              busFilter === 'ac'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('एसी (AC Only)', 'AC Only')}
          </button>
          <button
            onClick={() => setBusFilter('sleeper')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              busFilter === 'sleeper'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('स्लीपर (Sleeper)', 'Sleeper')}
          </button>
          <button
            onClick={() => setBusFilter('primo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              busFilter === 'primo'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" /> SafarGo PRIMO
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> {t('क्रमबद्ध', 'Sort')}:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="price_asc">{t('किराया: कम से ज्यादा (Cheapest)', 'Price: Low to High')}</option>
            <option value="rating_desc">{t('रेटिंग: सर्वोत्तम (Top Rated)', 'Rating: Highest First')}</option>
            <option value="time_asc">{t('प्रस्थान: पहले (Earliest)', 'Departure: Earliest')}</option>
          </select>
        </div>
      </div>

      {/* Bus Cards List */}
      {sortedBuses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <SlidersHorizontal className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800 mb-1">{t('कोई बस नहीं मिली', 'No Buses Available')}</h3>
          <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
            {t('आपके द्वारा चुने गए फ़िल्टर के लिए कोई बस उपलब्ध नहीं है। कृपया फ़िल्टर रीसेट करें।', 'No buses match your current filters. Try changing filters or route.')}
          </p>
          <button
            onClick={() => setBusFilter('all')}
            className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
          >
            {t('सभी फ़िल्टर साफ़ करें', 'Reset All Filters')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedBuses.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      )}
    </div>
  );
};
