import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  Coffee, 
  Wifi, 
  MapPin, 
  Hotel,
  Percent
} from 'lucide-react';
import { MOCK_HOTELS } from '../../data/hotelData';
import confetti from 'canvas-confetti';

export const HotelComingSoon: React.FC = () => {
  const { t, setActiveService, isAgentLoggedIn, setIsAuthModalOpen } = useTravel();
  const [notifyCity, setNotifyCity] = useState('Jaipur');
  const [notifyMobile, setNotifyMobile] = useState('');
  const [isNotified, setIsNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgentLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!notifyMobile) return;
    setIsNotified(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-700 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-yellow-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> {t('जल्द आ रहा है • 50% छूट के साथ', 'Coming Soon • Flat 50% OFF')}
            </span>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              🏨 {t('सफ़रगो होटल्स व रिसॉर्ट्स', 'SafarGo Hotels & Resorts')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t(
              'होटल व रिसॉर्ट बुकिंग • 50% तक की छूट • जल्द ही लाइव होगा!',
              'Hotel & Luxury Resort Booking • Up to 50% OFF • Launching Soon!'
            )}
          </h1>

          <p className="text-sm sm:text-base text-rose-100 font-medium leading-relaxed max-w-2xl">
            {t(
              'जयपुर, गोवा, मनाली, उदयपुर व दिल्ली के 10,000+ सत्यापित कपल्स-फ्रेंडली, फैमिली और बिजनेस होटल्स। मुफ़्त ब्रेकफास्ट, स्विमिंग पूल व शून्य कैंसिलेशन शुल्क के साथ!',
              'Over 10,000+ handpicked couple-friendly, luxury family resorts, and corporate hotels with complimentary breakfast and zero cancellation fee.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveService('bus')}
              className="px-6 py-3 bg-white text-rose-800 hover:bg-rose-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('🚌 बस टिकट बुक करें', 'Book Bus Tickets Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Featured Hotels Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">{t('आगामी पार्टनर होटल्स (Preview Collection)', 'Upcoming Hotel Partners')}</h3>
            <p className="text-xs text-slate-500">{t('सफ़रगो अधिकृत 3-स्टार, 4-स्टार व हेरिटेज रिसॉर्ट्स', '3-Star, 4-Star & Heritage Palace stays')}</p>
          </div>
          <span className="text-xs font-black text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            {t('50% कूपन कोड: HOTELSTAY50', '50% Coupon: HOTELSTAY50')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_HOTELS.slice(0, 3).map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm space-y-4 pb-5">
              <div className="relative h-48 bg-slate-100">
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                  {hotel.city}
                </span>
                <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                  COMING SOON
                </span>
              </div>

              <div className="px-5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{hotel.rating}</span>
                    <span className="text-slate-400 font-normal">({hotel.reviewCount})</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                    Couple Friendly ✓
                  </span>
                </div>

                <h4 className="font-black text-slate-900 text-base">{hotel.name}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{hotel.area}, {hotel.city}</span>
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through">₹{hotel.originalPrice}</span>
                    <div className="font-mono text-lg font-black text-slate-900">
                      ₹{hotel.pricePerNight} <span className="text-[10px] font-normal text-slate-500">/ night</span>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold">
                    {t('जल्द आ रहा है', 'Coming Soon')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pre-Booking Alert Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-black">{t('होटल बुकिंग शुरू होने पर 50% छूट का वाउचर पाएं', 'Get 50% Off Voucher on Hotel Launch')}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{t('अपना मोबाइल नंबर दर्ज करें और वीआईपी अर्ली-एक्सेस कूपन प्राप्त करें', 'Enter mobile to get early-access pass')}</p>
        </div>

        {!isNotified ? (
          <form onSubmit={handleNotify} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="tel"
              required
              placeholder="98XXXXXXXX"
              value={notifyMobile}
              onChange={(e) => setNotifyMobile(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none w-full sm:w-60"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shrink-0 transition"
            >
              {t('कूपन क्लेम करें', 'Claim Pass')}
            </button>
          </form>
        ) : (
          <div className="p-3 bg-emerald-900/60 border border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('धन्यवाद! आपका 50% होटल डिस्काउंट कोड सुरक्षित कर लिया गया है।', 'Reserved! 50% off code secured.')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
