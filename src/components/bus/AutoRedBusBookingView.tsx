import React, { useState, useMemo } from 'react';
import { BusTrip, Booking, SeatCategory } from '../../types';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { RedBusSeatMapModal, SelectedSeatItem } from './RedBusSeatMapModal';
import { AutoBusBookingCheckoutModal } from './AutoBusBookingCheckoutModal';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import {
  Bus,
  Search,
  MapPin,
  Calendar,
  Repeat,
  Zap,
  Coffee,
  Wifi,
  Clock,
  Sparkles,
  Crown,
  ShieldCheck,
  Tag,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle,
  HelpCircle,
  Phone,
  ArrowRight,
  Shield,
  Heart,
  Navigation,
  Train,
  Building,
  Radio,
  FileText
} from 'lucide-react';

interface AutoRedBusBookingViewProps {
  onBookingSuccess: (booking: Booking) => void;
  onSwitchToManual?: () => void;
}

export const AutoRedBusBookingView: React.FC<AutoRedBusBookingViewProps> = ({
  onBookingSuccess,
  onSwitchToManual,
}) => {
  const { busTrips, agentWalletBalance } = useData();
  const { role } = useAuth();

  // AbhiBus Navigation Service Ribbon
  const [activeServiceTab, setActiveServiceTab] = useState<'bus' | 'train' | 'hotel' | 'assured' | 'live_gps' | 'track_pnr'>('bus');

  // Search Parameters
  const [searchSource, setSearchSource] = useState('Bhopal');
  const [searchDestination, setSearchDestination] = useState('Indore');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Filters & Sorting (AbhiBus Style)
  const [filterType, setFilterType] = useState<'all' | 'ac' | 'seater' | 'sleeper' | 'assured' | 'brand_new' | 'ladies'>('all');
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'early' | 'rating'>('cheapest');

  // Expandable Card Tabs (Boarding Points, Amenities, Cancellation, Reviews)
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null);
  const [activeCardDrawer, setActiveCardDrawer] = useState<'boarding' | 'amenities' | 'cancellation' | 'reviews'>('boarding');

  // Modals
  const [selectedTripForSeatMap, setSelectedTripForSeatMap] = useState<BusTrip | null>(null);
  const [autoCheckoutData, setAutoCheckoutData] = useState<{
    trip: BusTrip;
    selectedSeats: SelectedSeatItem[];
    totalFare: number;
    seatCategory: SeatCategory;
    boardingPoint: string;
    dropPoint: string;
  } | null>(null);

  // Quick Route Selection Handler
  const handleSelectQuickRoute = (from: string, to: string) => {
    setSearchSource(from);
    setSearchDestination(to);
  };

  // Swap From & To Cities
  const handleSwap = () => {
    const temp = searchSource;
    setSearchSource(searchDestination);
    setSearchDestination(temp);
  };

  // Quick Date Helpers
  const handleSetDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSearchDate(d.toISOString().split('T')[0]);
  };

  // Filter & Sort Logic
  const filteredAndSortedBuses = useMemo(() => {
    let result = (busTrips || []).filter((trip) => {
      const matchSrc = trip.source.toLowerCase().includes(searchSource.toLowerCase().trim());
      const matchDst = trip.destination.toLowerCase().includes(searchDestination.toLowerCase().trim());
      if (!matchSrc || !matchDst) return false;

      if (filterType === 'ac') {
        return trip.bus_type.toLowerCase().includes('ac') || trip.bus_type.toLowerCase().includes('a/c');
      }
      if (filterType === 'seater') {
        return trip.available_seater > 0;
      }
      if (filterType === 'sleeper') {
        return trip.available_sleeper > 0;
      }
      if (filterType === 'assured') {
        return trip.operator_name.toLowerCase().includes('chartered') || trip.operator_name.toLowerCase().includes('hans') || trip.operator_name.toLowerCase().includes('verma');
      }
      if (filterType === 'brand_new') {
        return trip.bus_type.toLowerCase().includes('bharat') || trip.bus_type.toLowerCase().includes('volvo') || trip.bus_type.toLowerCase().includes('deluxe');
      }
      if (filterType === 'ladies') {
        return trip.available_seater > 0 || trip.available_sleeper > 0;
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'cheapest') {
        const fareA = a.seater_fare || a.sleeper_fare || 9999;
        const fareB = b.seater_fare || b.sleeper_fare || 9999;
        return fareA - fareB;
      }
      if (sortBy === 'rating') {
        return 1; // Default top operators
      }
      if (sortBy === 'early') {
        return a.departure_time.localeCompare(b.departure_time);
      }
      if (sortBy === 'fastest') {
        return a.departure_time.localeCompare(b.departure_time);
      }
      return 0;
    });

    return result;
  }, [busTrips, searchSource, searchDestination, filterType, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ========================================================================= */}
      {/* 1. ABHIBUS STYLE TOP SERVICE NAVIGATION RIBBON                             */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 rounded-3xl p-3 border border-slate-800 shadow-xl flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => setActiveServiceTab('bus')}
            className={`px-4 py-2 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
              activeServiceTab === 'bus'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Bus className="w-4 h-4 text-amber-300" />
            <span>बस टिकट (Bus Booking)</span>
            <span className="bg-white/20 text-[9px] px-1.5 py-0.2 rounded-full font-bold">लाइव</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveServiceTab('train')}
            className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
              activeServiceTab === 'train'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Train className="w-4 h-4 text-emerald-400" />
            <span>ट्रेन टिकट (IRCTC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveServiceTab('hotel')}
            className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
              activeServiceTab === 'hotel'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building className="w-4 h-4 text-blue-400" />
            <span>होटल बुकिंग (Hotels)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveServiceTab('assured')}
            className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
              activeServiceTab === 'assured'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>🛡️ SafarGo Assured</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveServiceTab('live_gps')}
            className={`px-3.5 py-2 rounded-2xl flex items-center gap-2 transition cursor-pointer ${
              activeServiceTab === 'live_gps'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>लाइव GPS ट्रैकिंग</span>
          </button>
        </div>

        {role === 'agent' && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-emerald-300 font-bold">एजेंट वॉलेट:</span>
            <strong className="text-amber-300 font-mono text-xs font-black">₹{agentWalletBalance.toFixed(2)}</strong>
            <span className="bg-emerald-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">+₹19.34 प्रति टिकट</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ABHIBUS BRAND HERO BANNER                                               */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-rose-600 shadow-sm flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 text-amber-500" /> SafarGo Premium Platform
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-xs">
                ⚡ 100% ऑनलाइन ऑटोमैटिक बस टिकटिंग
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                🛡️ SafarGo Assured
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">
              सफ़ारगो प्रीमियम बस बुकिंग नेटवर्क — लाइव सीट चयन एवं तत्काल PNR
            </h1>
            <p className="text-xs text-red-100 max-w-xl leading-relaxed">
              सफ़ारगो एक्सक्लूसिव प्रीमियम सीट मैप: स्लीपर (Sleeper) बर्थ, सीटर (Seater) कुर्सियां, महिला सुरक्षा सीट एवं बोर्डिंग पॉइंट्स के साथ तुरंत 1-क्लिक बुकिंग। 
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right shrink-0 space-y-1">
            <span className="text-[10px] text-red-100 uppercase font-black tracking-wider block">विश्वसनीय बस सेवा</span>
            <div className="text-lg font-black text-amber-300">
              1,50,000+ रूट • 4,500+ बसें
            </div>
            <span className="text-[10px] text-emerald-200 block font-bold">
              ✓ 100% ऑन-टाइम गारंटी • 0% कैंसलेशन झंझट
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ABHIBUS SEARCH WIDGET (Origin, Destination, Date, Swap & Quick Routes) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xl space-y-4">
        {/* Popular Quick Route Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-slate-400 text-[11px] font-bold shrink-0">लोकप्रिय रूट:</span>
          {[
            { from: 'Bhopal', to: 'Indore', label: 'भोपाल ➔ इंदौर (₹350+)' },
            { from: 'Indore', to: 'Pune', label: 'इंदौर ➔ पुणे (₹850+)' },
            { from: 'Bhopal', to: 'Jaipur', label: 'भोपाल ➔ जयपुर (₹750+)' },
            { from: 'Sironj', to: 'Bhopal', label: 'सिरोंज ➔ भोपाल (₹220+)' },
            { from: 'Guna', to: 'Bhopal', label: 'गुना ➔ भोपाल (₹320+)' },
            { from: 'Shivpuri', to: 'Agra', label: 'शिवपुरी ➔ आगरा (₹450+)' },
            { from: 'Ratlam', to: 'Indore', label: 'रतलाम ➔ इंदौर (₹250+)' },
            { from: 'Khandwa', to: 'Pune', label: 'खंडवा ➔ पुणे (₹750+)' },
          ].map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => handleSelectQuickRoute(r.from, r.to)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                searchSource === r.from && searchDestination === r.to
                  ? 'bg-red-50 border-red-500 text-red-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
          {/* From City */}
          <div className="sm:col-span-4">
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>कहाँ से (From City) *</span>
              <span className="text-[10px] text-slate-400 font-normal">शुरुआती शहर</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-red-500 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                list="mp-safargo-cities"
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                placeholder="उदा. Bhopal / Sironj"
                className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="sm:col-span-1 flex items-center justify-center my-0.5 sm:my-0 sm:pb-1">
            <button
              type="button"
              onClick={handleSwap}
              className="flex items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 transition cursor-pointer shadow-xs active:rotate-180"
              title="रूट आपस में बदलें (Swap Origin & Destination)"
            >
              <Repeat className="w-4 h-4 text-red-600 shrink-0" />
            </button>
          </div>

          {/* To Destination */}
          <div className="sm:col-span-4">
            <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>कहाँ तक (To Destination) *</span>
              <span className="text-[10px] text-slate-400 font-normal">गंतव्य शहर</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                list="mp-safargo-cities"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                placeholder="उदा. Indore / Pune / Jaipur"
                className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              />
            </div>
          </div>

          {/* Date Picker */}
          <div className="sm:col-span-3">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">यात्रा तारीख *</label>
              <div className="flex items-center gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => handleSetDate(0)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 font-bold text-slate-600 cursor-pointer"
                >
                  आज
                </button>
                <button
                  type="button"
                  onClick={() => handleSetDate(1)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 font-bold text-slate-600 cursor-pointer"
                >
                  कल
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full pl-9 pr-3 py-3 rounded-2xl border border-slate-300 font-bold focus:ring-2 focus:ring-red-500 outline-none text-sm bg-white"
              />
            </div>
          </div>
        </div>

        {/* Datalist */}
        <datalist id="mp-safargo-cities">
          {MP_NETWORK_CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/* ===================================================================== */}
        {/* 4. ABHIBUS FILTER & SORT BAR                                          */}
        {/* ===================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-slate-500 text-[11px] font-bold shrink-0 mr-1">फिल्टर:</span>
            {[
              { id: 'all', label: 'सभी बसें' },
              { id: 'ac', label: '❄️ AC बसें' },
              { id: 'seater', label: '💺 सीटर' },
              { id: 'sleeper', label: '🛏️ स्लीपर' },
              { id: 'assured', label: '🛡️ SafarGo Assured' },
              { id: 'brand_new', label: '✨ Brand New' },
              { id: 'ladies', label: '🌸 महिला सीट' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer text-xs ${
                  filterType === f.id
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500 text-[11px] font-bold">क्रमबद्ध (Sort By):</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-1.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 text-xs outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
            >
              <option value="cheapest">सबसे कम किराया (Lowest Fare)</option>
              <option value="rating">टॉप रेटेड ऑपरेटर (Top Rated)</option>
              <option value="early">जल्दी प्रस्थान (Early Departure)</option>
              <option value="fastest">कम समय (Fastest Route)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. OFFICIAL RTC PARTNER & PREMIER OPERATORS BANNER (AbhiBus Signature)    */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-black shadow-xs">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <strong className="text-slate-900 block font-black text-sm">
              सरकारी राज्य परिवहन एवं प्रमुख प्राइवेट फ्लीट पार्टनर
            </strong>
            <p className="text-slate-600 text-[11px]">
              MP State Transport, UPSRTC, RSRTC, Chartered Bus, Hans Travels, Verma Travels व NueGo Electric पार्टनर
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-[10px] font-black text-slate-700 shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">🏛️ MPSRTC (MP)</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">🏛️ UPSRTC</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">🚌 Chartered Bus</span>
          <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">⚡ NueGo Electric</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. BUS RESULTS LISTING (AbhiBus Signature Detailed Cards)                  */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Results Header with Date Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="font-bold text-slate-700 flex items-center gap-2">
            <span>उपलब्ध बसें ({filteredAndSortedBuses.length}) • {searchSource} ➔ {searchDestination}</span>
            <span className="bg-red-100 text-red-700 font-mono px-2 py-0.5 rounded-full text-[10px] font-black">
              {searchDate}
            </span>
          </div>

          <div className="text-slate-500 text-[11px] flex items-center gap-2">
            <span className="text-emerald-700 font-bold">💰 एजेंट कमीशन: ₹19 प्रति बुकिंग • 🛡️ मानक रिफंड नीति</span>
            {onSwitchToManual && (
              <button
                type="button"
                onClick={onSwitchToManual}
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                📝 मैनुअल पर्ची काउंटर पर जाएं
              </button>
            )}
          </div>
        </div>

        {filteredAndSortedBuses.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3 shadow-sm">
            <Bus className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-black text-slate-800 text-base">इस मार्ग पर कोई सीधी बस नहीं मिली</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              कृपया ऊपर से भोपाल ➔ इंदौर, इंदौर ➔ पुणे, या गुना ➔ भोपाल जैसे लोकप्रिय मार्ग चुनें अथवा यात्रा की तारीख बदलें।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchSource('Bhopal');
                setSearchDestination('Indore');
              }}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              भोपाल ➔ इंदौर मार्ग लोड करें
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedBuses.map((trip) => {
              const isExpanded = expandedTripId === trip.id;
              const originalSeater = trip.seater_fare ? trip.seater_fare + 100 : 0;
              const originalSleeper = trip.sleeper_fare ? trip.sleeper_fare + 150 : 0;

              return (
                <div
                  key={trip.id}
                  className="rounded-3xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-xl transition-all overflow-hidden"
                >
                  {/* Card Main Body */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Top Row: Operator, Bus Type & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-slate-900 text-base sm:text-lg flex items-center gap-2">
                            <Bus className="w-5 h-5 text-red-600 shrink-0" />
                            <span>{trip.operator_name}</span>
                          </h3>

                          {/* AbhiBus Tags */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> SafarGo Assured
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-600" /> Brand New (&lt; 1 Yr)
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-800 flex items-center gap-1">
                            🌸 महिला सीट उपलब्ध
                          </span>
                        </div>

                        <span className="text-xs text-slate-500 font-medium block">
                          {trip.bus_type} • BharatBenz / Volvo Multi-Axle
                        </span>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="bg-emerald-600 text-white px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>4.6</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          (840 समीक्षाएं)
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Schedule, Times, Duration & Landmarks */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-xs">
                      {/* Departure */}
                      <div className="sm:col-span-3 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">प्रस्थान (Departure)</span>
                        <div className="text-xl font-black text-slate-900 font-mono">
                          {trip.departure_time}
                        </div>
                        <strong className="text-slate-800 block text-xs truncate">
                          {trip.source}
                        </strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {trip.boarding_points && trip.boarding_points[0] ? trip.boarding_points[0] : 'Main Bus Stand'}
                        </span>
                      </div>

                      {/* Duration & Route Indicator Arrow */}
                      <div className="sm:col-span-3 text-center space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-2xs inline-block">
                          4h 30m यात्रा
                        </span>
                        <div className="flex items-center justify-center gap-1 text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                          <div className="w-16 h-0.5 bg-red-400 border-dashed" />
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold block">
                          ✓ डायरेक्ट नॉन-स्टॉप
                        </span>
                      </div>

                      {/* Arrival */}
                      <div className="sm:col-span-3 space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">पहुंच (Arrival)</span>
                        <div className="text-xl font-black text-slate-900 font-mono">
                          {trip.arrival_time}
                        </div>
                        <strong className="text-slate-800 block text-xs truncate">
                          {trip.destination}
                        </strong>
                        <span className="text-[11px] text-slate-500 block truncate">
                          {trip.drop_points && trip.drop_points[0] ? trip.drop_points[0] : 'Sarwate / Central Bus Station'}
                        </span>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="sm:col-span-3 sm:border-l sm:border-slate-200 sm:pl-4 space-y-2 text-right">
                        <div>
                          <span className="text-[10px] text-slate-400 block">शुरुआती किराया:</span>
                          <div className="flex items-baseline justify-end gap-1.5">
                            {originalSeater > 0 && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{originalSeater}
                              </span>
                            )}
                            <strong className="text-2xl font-black text-red-600 font-mono">
                              ₹{trip.seater_fare || trip.sleeper_fare}
                            </strong>
                          </div>
                          <span className="text-[10px] text-emerald-700 font-bold block">
                            🏷️ कोड SAFARGO50 पर ₹50 छूट
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedTripForSeatMap(trip)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs transition shadow-md shadow-red-600/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <Bus className="w-4 h-4" />
                          <span>सीटें चुनें (Select Seats ▾)</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Features Strip: Seats Available, Amenities & Drawer Toggles */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs border-t border-slate-100">
                      {/* Available Seats Pills */}
                      <div className="flex items-center gap-2 flex-wrap text-[11px]">
                        {trip.available_seater > 0 && (
                          <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 font-bold flex items-center gap-1">
                            💺 {trip.available_seater} सीटर सीटें (₹{trip.seater_fare})
                          </span>
                        )}
                        {trip.available_sleeper > 0 && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold flex items-center gap-1">
                            🛏️ {trip.available_sleeper} स्लीपर बर्थ (₹{trip.sleeper_fare})
                          </span>
                        )}
                        <span className="text-slate-400 text-[10px] hidden md:inline">
                          • 220V चार्जिंग सॉकेट • GPS ट्रैकिंग • AC
                        </span>
                      </div>

                      {/* Expandable Tabs (AbhiBus Style Drawers) */}
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
                        <button
                          type="button"
                          onClick={() => {
                            if (isExpanded && activeCardDrawer === 'boarding') {
                              setExpandedTripId(null);
                            } else {
                              setExpandedTripId(trip.id);
                              setActiveCardDrawer('boarding');
                            }
                          }}
                          className={`hover:text-red-600 transition flex items-center gap-0.5 cursor-pointer ${
                            isExpanded && activeCardDrawer === 'boarding' ? 'text-red-600 underline' : ''
                          }`}
                        >
                          <span>बोर्डिंग/ड्रॉप पॉइंट्स</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <span>•</span>

                        <button
                          type="button"
                          onClick={() => {
                            if (isExpanded && activeCardDrawer === 'amenities') {
                              setExpandedTripId(null);
                            } else {
                              setExpandedTripId(trip.id);
                              setActiveCardDrawer('amenities');
                            }
                          }}
                          className={`hover:text-red-600 transition flex items-center gap-0.5 cursor-pointer ${
                            isExpanded && activeCardDrawer === 'amenities' ? 'text-red-600 underline' : ''
                          }`}
                        >
                          <span>सुविधाएं (Amenities)</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        <span>•</span>

                        <button
                          type="button"
                          onClick={() => {
                            if (isExpanded && activeCardDrawer === 'cancellation') {
                              setExpandedTripId(null);
                            } else {
                              setExpandedTripId(trip.id);
                              setActiveCardDrawer('cancellation');
                            }
                          }}
                          className={`hover:text-red-600 transition flex items-center gap-0.5 cursor-pointer ${
                            isExpanded && activeCardDrawer === 'cancellation' ? 'text-red-600 underline' : ''
                          }`}
                        >
                          <span>रद्दीकरण नीति</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ========================================================= */}
                  {/* EXPANDABLE DRAWER DETAILS (Boarding, Amenities, Policy)   */}
                  {/* ========================================================= */}
                  {isExpanded && (
                    <div className="bg-slate-50 border-t border-slate-200 p-5 space-y-4 animate-fadeIn text-xs">
                      {/* Drawer Tab Navigation */}
                      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                        <button
                          type="button"
                          onClick={() => setActiveCardDrawer('boarding')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            activeCardDrawer === 'boarding'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          📍 बोर्डिंग व ड्रॉपिंग पॉइंट्स
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCardDrawer('amenities')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            activeCardDrawer === 'amenities'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ☕ सुविधाएं (Amenities)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCardDrawer('cancellation')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            activeCardDrawer === 'cancellation'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          📜 रद्दीकरण नीति (Cancellation Policy)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCardDrawer('reviews')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                            activeCardDrawer === 'reviews'
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          ⭐ समीक्षाएं (Reviews)
                        </button>
                      </div>

                      {/* Drawer Content: Boarding & Dropping Points */}
                      {activeCardDrawer === 'boarding' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                            <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                              <MapPin className="w-4 h-4 text-red-600" />
                              बोर्डिंग पॉइंट्स ({trip.source})
                            </strong>
                            <div className="space-y-2">
                              {(trip.boarding_points && trip.boarding_points.length > 0
                                ? trip.boarding_points
                                : ['आईएसबीटी नादरा बस स्टैंड', 'लालघाटी चौराहा', 'हबीबगंज स्टेशन ओवरब्रिज']
                              ).map((pt, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                                  <span className="text-slate-700 font-medium">{pt}</span>
                                  <span className="font-mono text-slate-500">{trip.departure_time}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2">
                            <strong className="text-slate-900 font-bold block flex items-center gap-1.5 text-xs">
                              <MapPin className="w-4 h-4 text-emerald-600" />
                              ड्रॉपिंग पॉइंट्स ({trip.destination})
                            </strong>
                            <div className="space-y-2">
                              {(trip.drop_points && trip.drop_points.length > 0
                                ? trip.drop_points
                                : ['सरवटे बस स्टैंड', 'विजय नगर चौराहा', 'बाईपास ब्रिज']
                              ).map((pt, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                                  <span className="text-slate-700 font-medium">{pt}</span>
                                  <span className="font-mono text-slate-500">{trip.arrival_time}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Drawer Content: Amenities */}
                      {activeCardDrawer === 'amenities' && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                          <strong className="text-slate-900 font-bold block text-xs">बस में उपलब्ध सुविधाएं (Onboard Facilities):</strong>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <Zap className="w-4 h-4 text-amber-500" />
                              <span>220V चार्जिंग सॉकेट</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <Radio className="w-4 h-4 text-rose-500" />
                              <span>लाइव GPS ट्रैकिंग</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <Coffee className="w-4 h-4 text-emerald-600" />
                              <span>सील्ड पानी की बोतल</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <Wifi className="w-4 h-4 text-indigo-500" />
                              <span>हाई-स्पीड वाई-फाई</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <ShieldCheck className="w-4 h-4 text-blue-600" />
                              <span>इमरजेंसी एग्जिट व हैमर</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span>ताजा कम्बल व चादर</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                              <span>प्राथमिक चिकित्सा किट</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                              <Clock className="w-4 h-4 text-teal-600" />
                              <span>रीडिंग नाइट लैंप</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Drawer Content: Cancellation Policy */}
                      {activeCardDrawer === 'cancellation' && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                          <strong className="text-slate-900 font-bold block text-xs">सफ़ारगो टिकट रद्दीकरण एवं रिफंड नीति:</strong>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                              <span className="font-bold text-emerald-900 block">प्रस्थान से 24 घंटे पहले</span>
                              <strong className="text-emerald-700 text-sm">100% रिफंड (शून्य शुल्क)</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                              <span className="font-bold text-amber-900 block">12 से 24 घंटे पहले</span>
                              <strong className="text-amber-700 text-sm">80% रिफंड (20% कटौती)</strong>
                            </div>
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                              <span className="font-bold text-rose-900 block">प्रस्थान से 6 घंटे पहले</span>
                              <strong className="text-rose-700 text-sm">50% रिफंड</strong>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 pt-1">
                            * यदि बस ऑपरेटर द्वारा यात्रा रद्द की जाती है, तो हमारे पूर्व नियमानुसार पूरी राशि एजेंट वॉलेट में तुरंत वापस की जाएगी।
                          </p>
                        </div>
                      )}

                      {/* Drawer Content: Reviews */}
                      {activeCardDrawer === 'reviews' && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <strong className="text-slate-900 font-bold text-xs">यात्री समीक्षाएं एवं रेटिंग्स:</strong>
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                              <Star className="w-4 h-4 fill-emerald-600" />
                              <span>4.6 / 5.0 (840 समीक्षाएं)</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 block">समय की पाबंदी:</span>
                              <strong className="text-slate-800">4.8 ★ (98% ऑन-टाइम)</strong>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 block">सफाई व स्वच्छता:</span>
                              <strong className="text-slate-800">4.7 ★ (बेहतरीन)</strong>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 block">स्टाफ का व्यवहार:</span>
                              <strong className="text-slate-800">4.6 ★ (सहयोगी)</strong>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-xl">
                              <span className="text-slate-400 block">सीट कम्फर्ट:</span>
                              <strong className="text-slate-800">4.7 ★ (आरामदायक)</strong>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 7. ABHIBUS / REDBUS INTERACTIVE SEAT SELECTION MODAL                      */}
      {/* ========================================================================= */}
      {selectedTripForSeatMap && (
        <RedBusSeatMapModal
          trip={selectedTripForSeatMap}
          onClose={() => setSelectedTripForSeatMap(null)}
          onConfirmSelection={({ selectedSeats, totalFare, seatCategory, boardingPoint, dropPoint }) => {
            setAutoCheckoutData({
              trip: selectedTripForSeatMap,
              selectedSeats,
              totalFare,
              seatCategory,
              boardingPoint,
              dropPoint,
            });
            setSelectedTripForSeatMap(null);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* 8. AUTOMATIC INSTANT CHECKOUT & PNR GENERATION MODAL                      */}
      {/* ========================================================================= */}
      {autoCheckoutData && (
        <AutoBusBookingCheckoutModal
          isOpen={true}
          onClose={() => setAutoCheckoutData(null)}
          trip={autoCheckoutData.trip}
          selectedSeats={autoCheckoutData.selectedSeats}
          totalFare={autoCheckoutData.totalFare}
          seatCategory={autoCheckoutData.seatCategory}
          boardingPoint={autoCheckoutData.boardingPoint}
          dropPoint={autoCheckoutData.dropPoint}
          onBookingSuccess={(confirmed) => {
            setAutoCheckoutData(null);
            onBookingSuccess(confirmed);
          }}
        />
      )}
    </div>
  );
};
