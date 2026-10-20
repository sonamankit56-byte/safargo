import React from 'react';
import { useTravel } from '../../context/TravelContext';
import { Building2, Calendar, Users, Search, Sparkles, MapPin, ShieldCheck } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  { name: 'Jaipur', tag: 'Heritage' },
  { name: 'Goa', tag: 'Beaches' },
  { name: 'Manali', tag: 'Mountains' },
  { name: 'Delhi', tag: 'Business/Sightseeing' },
  { name: 'Udaipur', tag: 'Lakes' }
];

export const HotelSearchCard: React.FC = () => {
  const { 
    hotelCity, 
    setHotelCity, 
    checkInDate, 
    setCheckInDate, 
    checkOutDate, 
    setCheckOutDate, 
    guestsCount, 
    setGuestsCount,
    setCurrentStep,
    t 
  } = useTravel();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('bus_list'); // in hotel view, this switches to hotels list view
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-7 relative overflow-hidden">
      {/* Decorative Gradient Top Header */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {t('होटल व रिसॉर्ट्स', 'Hotels & Luxury Resorts')}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {t('भारत के 50,000+ सत्यापित होटल्स', 'Book Verified Hotels & Homestays')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('बिना किसी अग्रिम शुल्क के तुरंत रूम बुक करें • 100% कपल फ्रेंडली', 'Zero cancellation charges • Couple friendly • Free breakfast')}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{t('सफ़रगो प्राइमर गारंटी', 'SafarGo Assured Stays')}</span>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Destination City */}
          <div className="md:col-span-2 relative bg-slate-50 border border-slate-200 rounded-2xl p-3 hover:border-emerald-500 transition">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              {t('शहर या होटल का नाम', 'City or Location')}
            </label>
            <select
              value={hotelCity}
              onChange={(e) => setHotelCity(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 mt-1 focus:outline-none cursor-pointer"
            >
              <option value="Jaipur">Jaipur (जयपुर, राजस्थान)</option>
              <option value="Goa">Goa (गोवा बीच रिसॉर्ट्स)</option>
              <option value="Manali">Manali (मनाली, हिमाचल प्रदेश)</option>
              <option value="Delhi">Delhi (नई दिल्ली / NCR)</option>
              <option value="Udaipur">Udaipur (उदयपुर, झीलों की नगरी)</option>
            </select>
          </div>

          {/* Check-in & Check-out Dates */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3 hover:border-emerald-500 transition">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {t('चेक-इन तिथि', 'Check-In Date')}
            </label>
            <input
              type="text"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 mt-1 focus:outline-none"
            />
          </div>

          {/* Guests & Rooms */}
          <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-3 hover:border-emerald-500 transition">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              {t('अतिथि (Guests)', 'Guests & Rooms')}
            </label>
            <select
              value={guestsCount}
              onChange={(e) => setGuestsCount(Number(e.target.value))}
              className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 mt-1 focus:outline-none cursor-pointer"
            >
              <option value={1}>1 Guest • 1 Room</option>
              <option value={2}>2 Guests • 1 Room (Couple)</option>
              <option value={3}>3 Guests • 1 Room</option>
              <option value={4}>4 Guests • 2 Rooms (Family)</option>
            </select>
          </div>
        </div>

        {/* Popular Destination shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-semibold text-slate-400">{t('लोकप्रिय गंतव्य:', 'Popular:')}</span>
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => setHotelCity(dest.name)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                hotelCity === dest.name
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dest.name} ({dest.tag})
            </button>
          ))}
        </div>

        {/* Search CTA Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-[0.99] transition flex items-center justify-center gap-2"
        >
          <Search className="w-5 h-5 stroke-[2.5]" />
          <span>{t('होटल खोजें (Search Hotels)', 'Search Hotels')}</span>
        </button>
      </form>
    </div>
  );
};
