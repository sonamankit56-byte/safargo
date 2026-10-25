import React, { useState, useRef, useEffect } from 'react';
import { 
  MapPin, 
  ArrowLeftRight, 
  Calendar, 
  Search, 
  ShieldCheck, 
  Clock, 
  Zap,
  TrendingUp,
  X,
  Check
} from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import { POPULAR_ROUTES } from '../../data/busData';
import { MP_LOCATIONS, ALL_INDIA_CITIES } from '../../data/mpCitiesData';

export const BusSearchCard: React.FC = () => {
  const { 
    fromCity, 
    setFromCity, 
    toCity, 
    setToCity, 
    journeyDate, 
    setJourneyDate, 
    swapCities,
    busFilter,
    setBusFilter,
    setCurrentStep,
    isAgentLoggedIn,
    isCustomerLoggedIn,
    setIsAuthModalOpen,
    t 
  } = useTravel();

  // Autocomplete Dropdown State
  const [activeDropdown, setActiveDropdown] = useState<'from' | 'to' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgentLoggedIn && !isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentStep('bus_list');
  };

  const handleSelectPopularRoute = (from: string, to: string) => {
    if (!isAgentLoggedIn && !isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    setFromCity(from);
    setToCity(to);
    setCurrentStep('bus_list');
  };

  // Filtered Cities for Smart Search Dropdown
  const filteredMPLocations = MP_LOCATIONS.filter(loc => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return loc.name.toLowerCase().includes(q) ||
           loc.hindiName.toLowerCase().includes(q) ||
           loc.district.toLowerCase().includes(q) ||
           loc.hindiDistrict.toLowerCase().includes(q);
  });

  const filteredNationalCities = [
    'Delhi', 'Jaipur', 'Mumbai', 'Goa', 'Bengaluru', 'Hyderabad', 
    'Ahmedabad', 'Surat', 'Lucknow', 'Manali', 'Chandigarh', 'Udaipur'
  ].filter(c => {
    if (!searchQuery.trim()) return true;
    return c.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectCity = (cityName: string) => {
    if (activeDropdown === 'from') {
      setFromCity(cityName);
    } else if (activeDropdown === 'to') {
      setToCity(cityName);
    }
    setActiveDropdown(null);
    setSearchQuery('');
  };

  return (
    <div className="max-w-4xl mx-auto px-3 py-3 space-y-4" ref={dropdownRef}>
      {/* Hero Headline */}
      <div className="text-center sm:text-left pt-2 pb-1">
        <h1 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
          {t('भारत और मध्य प्रदेश के हर गाँव-शहर की बसें बुक करें', "Book Buses Across India & MP's Smallest Towns")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          {t('MP के 55 जिले, 150+ कस्बे व गाँव • लाइव बस जीपीएस ट्रैकिंग • जीरो कैंसिलेशन शुल्क', 'Covering 55 MP Districts, Tehsils & Villages • Live GPS Tracking on Route')}
        </p>
      </div>

      {/* Main Search Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-4 sm:p-6 space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* From - To City Row with Swap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
            
            {/* From City Interactive Input */}
            <div 
              onClick={() => {
                setActiveDropdown('from');
                setSearchQuery('');
              }}
              className={`border rounded-xl p-3 transition-colors cursor-pointer relative bg-gray-50/50 ${
                activeDropdown === 'from' ? 'border-[#0A2885] ring-2 ring-blue-100 bg-white' : 'border-gray-200 hover:border-[#0A2885]'
              }`}
            >
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('कहाँ से (From City / Village / Stand)', 'From')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-5 h-5 text-[#0A2885] shrink-0" />
                <span className="w-full font-extrabold text-sm sm:text-base text-gray-900 truncate">
                  {fromCity}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">ISBT / Tehsil / Bypass Stand</span>
            </div>

            {/* Middle Swap Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                swapCities();
              }}
              title="Swap From and To"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-300 text-gray-700 hover:text-[#0A2885] shadow-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* To City Interactive Input */}
            <div 
              onClick={() => {
                setActiveDropdown('to');
                setSearchQuery('');
              }}
              className={`border rounded-xl p-3 transition-colors cursor-pointer relative bg-gray-50/50 ${
                activeDropdown === 'to' ? 'border-[#D8232A] ring-2 ring-red-100 bg-white' : 'border-gray-200 hover:border-[#D8232A]'
              }`}
            >
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('कहाँ तक (To Destination / Town)', 'To')}
              </label>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-5 h-5 text-[#D8232A] shrink-0" />
                <span className="w-full font-extrabold text-sm sm:text-base text-gray-900 truncate">
                  {toCity}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 block mt-0.5">Main Stand / City Terminal</span>
            </div>

            {/* Comprehensive Smart Search Dropdown (for MP & All-India) */}
            {activeDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 sm:p-4 animate-fadeIn max-h-[380px] overflow-hidden flex flex-col">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('शहर, गाँव, तहसील या स्टैंड सर्च करें (उदा. आष्टा, मनावर, पीथमपुर)...', 'Search any city, tehsil or town (e.g. Ashta, Manawar, Indore)...')}
                    autoFocus
                    className="w-full text-xs sm:text-sm font-bold text-slate-900 focus:outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="overflow-y-auto mt-2 space-y-3 pr-1 divide-y divide-slate-100">
                  {/* Madhya Pradesh Locations Section */}
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                      🏛️ मध्य प्रदेश के शहर, तहसीलें व गाँव (MP Network)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {filteredMPLocations.map((loc) => {
                        const isCurrent = (activeDropdown === 'from' ? fromCity : toCity) === loc.name;
                        return (
                          <div
                            key={loc.name}
                            onClick={() => selectCity(loc.name)}
                            className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between text-xs ${
                              isCurrent 
                                ? 'bg-emerald-50 text-emerald-900 font-black border border-emerald-200' 
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <div>
                                <span className="font-bold text-slate-900 block">{loc.name} ({loc.hindiName})</span>
                                <span className="text-[10px] text-slate-400">{loc.hindiDistrict} ज़िला • {loc.division}</span>
                              </div>
                            </div>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* All-India Metros Section */}
                  <div className="pt-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1.5">
                      🇮🇳 प्रमुख भारतीय महानगर (Interstate Hubs)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {filteredNationalCities.map((c) => {
                        const isCurrent = (activeDropdown === 'from' ? fromCity : toCity) === c;
                        return (
                          <div
                            key={c}
                            onClick={() => selectCity(c)}
                            className={`p-2 rounded-xl cursor-pointer transition flex items-center justify-between text-xs ${
                              isCurrent 
                                ? 'bg-blue-50 text-blue-900 font-black border border-blue-200' 
                                : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="font-bold text-slate-800">{c}</span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Picker & Quick Days */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Journey Date Input */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 sm:col-span-2 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-[#0A2885] shrink-0" />
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                    {t('यात्रा की तारीख (Date of Journey)', 'Date of Journey')}
                  </label>
                  <span className="font-extrabold text-sm sm:text-base text-gray-900">
                    {journeyDate}
                  </span>
                </div>
              </div>

              {/* Quick Day Selector Pills */}
              <div className="flex gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setJourneyDate('Today, 19 Oct')}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    journeyDate.includes('Today') 
                      ? 'bg-[#0A2885] text-white border-[#0A2885]' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t('आज (Today)', 'Today')}
                </button>
                <button
                  type="button"
                  onClick={() => setJourneyDate('Tomorrow, 20 Oct')}
                  className={`px-2.5 py-1 rounded-lg border transition-colors ${
                    journeyDate.includes('Tomorrow') 
                      ? 'bg-[#0A2885] text-white border-[#0A2885]' 
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {t('कल (Tomorrow)', 'Tomorrow')}
                </button>
              </div>
            </div>

            {/* Quick Bus Type Filter */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                {t('बस का प्रकार (Bus Type)', 'Bus Type')}
              </label>
              <select
                value={busFilter}
                onChange={(e) => setBusFilter(e.target.value as any)}
                className="w-full font-bold text-xs sm:text-sm text-gray-800 bg-transparent focus:outline-none cursor-pointer mt-1"
              >
                <option value="all">{t('सभी बसें (All Buses)', 'All Buses')}</option>
                <option value="ac">{t('AC बसें (AC Only)', 'AC Only')}</option>
                <option value="sleeper">{t('स्लीपर (AC Sleeper)', 'AC Sleeper')}</option>
                <option value="primo">{t('सफ़रगो प्राइमो (Primo Luxury)', 'Primo Luxury')}</option>
              </select>
            </div>
          </div>

          {/* Big Red "Search Buses" Button */}
          <button
            type="submit"
            className="w-full py-3.5 sm:py-4 px-6 bg-gradient-to-r from-[#D8232A] to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-sm sm:text-base rounded-xl shadow-md shadow-red-200 flex items-center justify-center gap-2 transition-all active:scale-[0.99] tracking-wide cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[2.5]" />
            <span>{t('बसें खोजें (SEARCH BUSES)', 'SEARCH BUSES')}</span>
          </button>
        </form>

        {/* Value Guarantees Strip */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100 text-center text-xs">
          <div className="flex items-center justify-center gap-1.5 px-1">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700">{t('इंस्टेंट कन्फर्म टिकट', 'Instant E-Ticket')}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 px-1">
            <Clock className="w-4 h-4 text-[#0A2885] shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700">{t('समय पर गारंटी (On-Time)', 'On-Time Guarantee')}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 px-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold text-gray-700">{t('100% रिफंड पॉलिसी', '100% Refundable')}</span>
          </div>
        </div>
      </div>

      {/* Popular Routes Shortcuts - Featuring MP & Interstate Corridors */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#D8232A]" />
            <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
              {t('लोकप्रिय बस रूट्स (Popular MP & National Routes)', 'Popular Bus Routes')}
            </h3>
          </div>
          <span className="text-[10px] text-gray-400 font-semibold">{t('सबसे कम किराया', 'Best Fares')}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {POPULAR_ROUTES.map((route, i) => (
            <div
              key={i}
              onClick={() => handleSelectPopularRoute(route.from, route.to)}
              className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between font-bold text-xs text-gray-800">
                <span>{route.from} ➔ {route.to}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-gray-400">{route.duration} • {route.busesCount} buses</span>
                <span className="font-extrabold text-[#D8232A]">{route.fare}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
