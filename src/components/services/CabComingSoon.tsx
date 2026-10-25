import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Car, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Users, 
  ArrowRight, 
  PhoneCall,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CabComingSoon: React.FC = () => {
  const { t, setActiveService, isAgentLoggedIn, isCustomerLoggedIn, setIsAuthModalOpen } = useTravel();
  const [notifyCity, setNotifyCity] = useState('Bhopal');
  const [notifyMobile, setNotifyMobile] = useState('');
  const [isNotified, setIsNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgentLoggedIn && !isCustomerLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!notifyMobile) return;
    setIsNotified(true);
    try {
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } catch {}
  };

  const routes = [
    { from: 'Bhopal', to: 'Indore', fare: '₹2,499 (Sedan)', time: '3h 30m' },
    { from: 'Indore', to: 'Ujjain (Mahakal)', fare: '₹1,299 (SUV)', time: '1h 15m' },
    { from: 'Bhopal', to: 'Jabalpur', fare: '₹4,199 (Innova)', time: '6h 00m' },
    { from: 'Delhi Airport (T3)', to: 'Jaipur', fare: '₹3,299 (Sedan)', time: '4h 30m' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-950 text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> {t('जल्द आ रहा है • Launching Soon', 'Coming Soon')}
            </span>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              🚗 {t('सफ़रगो आउटस्टेशन एवं एयरपोर्ट कैब्स', 'SafarGo Outstation & Airport Cabs')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t(
              'सफ़रगो कैब सेवा • डोरस्टेप पिकअप और शून्य कैंसिलेशन • जल्द लाइव होगी!',
              'SafarGo Cabs • Doorstep Pickup & Zero Cancellation • Launching Soon!'
            )}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-2xl">
            {t(
              'सत्यापित पेशेवर ड्राइवर, टोल व राज्य टैक्स शामिल, एसी सेडान, एसयूवी व इनोवा क्रिस्टा। बिना किसी छिपे किराए या सर्ज प्राइसिंग के सुरक्षित सफर!',
              'Verified commercial chauffeurs, AC Sedans, SUVs & Innova Crysta with tolls included. No surge pricing, zero surprise charges.'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveService('bus')}
              className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('🚌 अभी बस टिकट बुक करें', 'Book Bus Tickets Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveService('recharge')}
              className="px-6 py-3 bg-emerald-500/30 hover:bg-emerald-500/40 border border-emerald-300/40 text-white font-black text-xs sm:text-sm rounded-2xl backdrop-blur-md transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('⚡ मोबाइल रिचार्ज (लाइव)', 'Mobile Recharge (Live)')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">{t('100% सत्यापित ड्राइवर', '100% Police Verified Drivers')}</h3>
          <p className="text-xs text-slate-500">{t('पुलिस वेरिफिकेशन व कमर्शियल ड्राइविंग लाइसेंस वाले अनुभवी सारथी।', 'Experienced drivers with complete background checks and commercial permits.')}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">{t('ऑन-टाइम पिकअप गारंटी', 'On-Time Doorstep Guarantee')}</h3>
          <p className="text-xs text-slate-500">{t('कैब 15 मिनट पहले आपके दरवाजे पर तैयार, कोई ड्राइवर कैंसिलेशन नहीं।', 'Guaranteed cab arrival at your doorstep 15 minutes before scheduled departure.')}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">{t('फिक्स ऑल-इंक्लूसिव रेट', 'All-Inclusive Transparent Pricing')}</h3>
          <p className="text-xs text-slate-500">{t('टोल टैक्स, स्टेट टैक्स व ड्राइवर भत्ता पहले से किराए में शामिल।', 'All toll charges, state border permits, and driver allowance included in the upfront fare.')}</p>
        </div>
      </div>

      {/* Popular Routes Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900">{t('आगामी कैब रूट्स (Preview Routes)', 'Upcoming Outstation Cab Routes')}</h3>
            <p className="text-xs text-slate-500">{t('मध्य प्रदेश एवं निकटवर्ती राज्यों के लिए वन-वे और राउंड ट्रिप कैब्स', 'One-way and roundtrip cabs across MP and neighboring states')}</p>
          </div>
          <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            {t('वन-वे किराया • नो रिटर्न फेयर', 'One-Way Fares • No Return Charge')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {routes.map((r, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>{r.time}</span>
                <span className="bg-amber-100 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-full">SOON</span>
              </div>
              <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <span>{r.from}</span>
                <span className="text-emerald-600">→</span>
                <span>{r.to}</span>
              </div>
              <p className="text-xs font-black text-emerald-700">{r.fare}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Launch Notification Signup Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
            <Sparkles className="w-3 h-3" /> VIP Early Access
          </div>
          <h3 className="text-lg sm:text-xl font-black">
            {t('कैब सेवा शुरू होते ही ₹200 का लॉन्च वाउचर पाएं!', 'Get ₹200 Welcome Credit on Launch Day!')}
          </h3>
          <p className="text-xs text-slate-300">
            {t('अपना मोबाइल नंबर दर्ज करें, सेवा शुरू होते ही व्हाट्सएप पर सूचित किया जाएगा।', 'Enter your mobile number to receive priority access and discount coupon.')}
          </p>
        </div>

        {!isNotified ? (
          <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-2 shrink-0">
            <input
              type="tel"
              required
              maxLength={10}
              placeholder="10-अंकीय मोबाइल नंबर"
              value={notifyMobile}
              onChange={(e) => setNotifyMobile(e.target.value.replace(/\D/g, ''))}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
            >
              {t('सूचित करें (Notify Me)', 'Notify Me')}
            </button>
          </form>
        ) : (
          <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{t('धन्यवाद! लॉन्च होते ही आपको ₹200 कूपन के साथ सूचित किया जाएगा।', 'Subscribed! We will notify you with your ₹200 voucher.')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
