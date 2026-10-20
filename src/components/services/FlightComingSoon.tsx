import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Plane, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Percent, 
  Award,
  Compass,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FlightComingSoon: React.FC = () => {
  const { t, setActiveService, isAgentLoggedIn, setIsAuthModalOpen } = useTravel();
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotified, setIsNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgentLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }
    if (!notifyEmail) return;
    setIsNotified(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const routes = [
    { from: 'Delhi (DEL)', to: 'Mumbai (BOM)', fare: '₹3,499' },
    { from: 'Bengaluru (BLR)', to: 'Goa (GOI)', fare: '₹2,199' },
    { from: 'Indore (IDR)', to: 'Delhi (DEL)', fare: '₹2,899' },
    { from: 'Jaipur (JAI)', to: 'Ahmedabad (AMD)', fare: '₹2,450' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-700 to-slate-900 text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> {t('जल्द आ रहा है • Launching Soon', 'Coming Soon')}
            </span>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              ✈️ {t('सफ़रगो फ्लाइट्स', 'SafarGo Flights')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t(
              'सफ़रगो फ्लाइट बुकिंग • सबसे कम किराए की गारंटी • जल्द आ रहा है!',
              'SafarGo Flight Tickets • Lowest Airfare Guarantee • Coming Soon!'
            )}
          </h1>

          <p className="text-sm sm:text-base text-sky-100 font-medium leading-relaxed max-w-2xl">
            {t(
              'इंडिगो, एयर इंडिया, स्पाइसजेट व आकासा एयर की सभी घरेलू व अंतरराष्ट्रीय उड़ानों पर शून्य सुविधा शुल्क और एजेंटों के लिए विशेष कमीशन!',
              'Book domestic and international flights across IndiGo, Air India, Akasa Air, and SpiceJet with zero convenience fee and top agent commissions!'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveService('bus')}
              className="px-6 py-3 bg-white text-sky-800 hover:bg-sky-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('🚌 अभी बस टिकट बुक करें', 'Book Bus Tickets Now')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl w-fit">
            <Percent className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">{t('शून्य सुविधा शुल्क (Zero Fee)', 'Zero Convenience Fee')}</h3>
          <p className="text-xs text-slate-500">{t('सफ़रगो गोल्ड मेंबर्स व एजेंट्स के लिए कोई अतिरिक्त चार्ज नहीं', 'No hidden markups or convenience charges for members')}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl w-fit">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">{t('तुरंत रिफंड व कैंसिलेशन', 'Instant Cancellation Refund')}</h3>
          <p className="text-xs text-slate-500">{t('फ्लाइट कैंसिल होने पर 100% फुल रिफंड सीधे आपके खाते में', 'Direct 100% instant refund guarantee on flight delays')}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl w-fit">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-black text-slate-900 text-sm">{t('एजेंट्स हेतु फिक्स कमीशन', 'Guaranteed Agent Commission')}</h3>
          <p className="text-xs text-slate-500">{t('प्रत्येक डोमेस्टिक टिकट पर शानदार आकर्षक कमीशन', 'Earn highest margins across all airlines')}</p>
        </div>
      </div>

      {/* Popular Routes Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">{t('लोकप्रिय आगामी रूट्स (Sample Air Routes)', 'Popular Upcoming Routes')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {routes.map((r, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>{r.from}</span>
                <Plane className="w-3.5 h-3.5 text-sky-600 rotate-45" />
                <span>{r.to}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Starting From</span>
                <span className="font-mono font-black text-sm text-sky-700">{r.fare}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notify Form */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="text-lg font-black">{t('फ्लाइट बुकिंग शुरू होते ही ईमेल प्राप्त करें', 'Get Notified on Launch')}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{t('लॉन्च के दिन पहले 1,000 टिकट्स पर ₹1,000 का अतिरिक्त डिस्काउंट कूपन!', 'Exclusive ₹1,000 off coupon for early subscribers')}</p>
        </div>

        {!isNotified ? (
          <form onSubmit={handleNotify} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="email"
              required
              placeholder="name@gmail.com"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-sky-500 focus:outline-none w-full sm:w-64"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-black text-xs rounded-xl shrink-0 transition"
            >
              {t('सूचित करें', 'Notify Me')}
            </button>
          </form>
        ) : (
          <div className="p-3 bg-emerald-900/60 border border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{t('धन्यवाद! आपका ईमेल सुरक्षित दर्ज हो चुका है।', 'Thank you! You are on the priority flight list.')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
