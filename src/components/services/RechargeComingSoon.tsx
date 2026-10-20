import React, { useState } from 'react';
import { useTravel } from '../../context/TravelContext';
import { 
  Smartphone, 
  Zap, 
  Tv, 
  Droplet, 
  Flame, 
  Wifi, 
  DollarSign, 
  Award, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Calculator,
  Building
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RechargeComingSoon: React.FC = () => {
  const { t, setActiveService } = useTravel();
  const [dailyVolume, setDailyVolume] = useState<number>(15000);
  const [operatorType, setOperatorType] = useState('mobile');
  const [registeredPhone, setRegisteredPhone] = useState('');
  const [isWaitlistDone, setIsWaitlistDone] = useState(false);

  // Commission calculation (3.5% avg commission)
  const monthlyCommission = Math.round((dailyVolume * 30 * 0.038));

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeredPhone) return;
    setIsWaitlistDone(true);
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const services = [
    {
      id: 'mobile',
      icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
      title: t('मोबाइल प्रीपेड व पोस्टपेड', 'Mobile Prepaid & Postpaid'),
      operators: 'Jio, Airtel, Vi, BSNL',
      commission: 'Up to 4.2%'
    },
    {
      id: 'electricity',
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: t('बिजली बिल भुगतान', 'Electricity Bill Payment'),
      operators: 'All 72+ State Power Boards',
      commission: 'Flat ₹5 - ₹15 / bill'
    },
    {
      id: 'dth',
      icon: <Tv className="w-6 h-6 text-rose-500" />,
      title: t('DTH टीवी रिचार्ज', 'DTH TV Recharge'),
      operators: 'Tata Play, Airtel, DishTV, Sun',
      commission: 'Up to 4.5%'
    },
    {
      id: 'gas',
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      title: t('गैस सिलेंडर व पाइपलाइन बिल', 'LPG Gas Booking & Piped Gas'),
      operators: 'Indane, Bharat Gas, HP Gas, IGL',
      commission: 'Flat ₹10 / booking'
    },
    {
      id: 'water',
      icon: <Droplet className="w-6 h-6 text-blue-500" />,
      title: t('जल कर / पानी बिल', 'Municipal Water Tax'),
      operators: 'All Nagar Nigams & Jal Boards',
      commission: 'Instant Commission'
    },
    {
      id: 'broadband',
      icon: <Wifi className="w-6 h-6 text-teal-500" />,
      title: t('ब्रॉडबैंड व लैंडलाइन', 'Broadband & Fiber Bills'),
      operators: 'Jio Fiber, Airtel Xstream, ACT',
      commission: 'Up to 3.5%'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-28 space-y-8 animate-fade-in">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 text-white p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5" /> {t('सर्विसेज जल्द आ रही हैं • Service Coming Soon', 'Service Coming Soon')}
            </span>
            <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              {t('⚡ BBPS भारत बिल पेमेंट', '⚡ BBPS Bharat Bill Pay')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t(
              'मोबाइल व बिजली बिल रिचार्ज करके पैसे कमाएं • जल्द ही लाइव होगा!',
              'Earn Money with Mobile & Utility Recharges • Going Live Soon!'
            )}
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 font-medium leading-relaxed max-w-2xl">
            {t(
              'सफ़रगो पर जल्द शुरू हो रही है देश की सबसे तीव्र मोबाइल, DTH व यूटिलिटी बिल पेमेंट सेवा। एजेंट व यूजर्स पाएंगे हर ट्रांजेक्शन पर 3% से 5% तक का फिक्स आकर्षक कमीशन सीधे वॉलेट में!',
              'Coming soon to SafarGo: Ultra-fast mobile recharges, electricity bills, and utility payments powered by BBPS. Agents and shop owners can earn 3% to 5% instant commissions directly into their wallets!'
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="#commission-calc"
              className="px-6 py-3 bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <span>{t('कमीशन कैलकुलेटर देखें', 'View Commission Calculator')}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setActiveService('bus')}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl backdrop-blur-md transition"
            >
              {t('🚌 बस टिकट बुक करें', 'Book Bus Tickets')}
            </button>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">{t('आगामी रिचार्ज सेवाएं (Upcoming Recharge Suite)', 'Upcoming Recharge Services')}</h2>
          <p className="text-xs text-slate-500">{t('एक ही डैशबोर्ड से सभी बड़े ऑपरेटर्स और 100+ सरकारी बिलर्स उपलब्ध होंगे', 'All major telecom operators & 100+ government billers')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div 
              key={srv.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  {srv.icon}
                </div>
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {srv.commission}
                </span>
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">{srv.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{srv.operators}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-400">
                <span>{t('स्थिति:', 'Status:')}</span>
                <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                  {t('जल्द आ रहा है (Soon)', 'Launching Soon')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission Calculator & Earnings Potential */}
      <div id="commission-calc" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-black">{t('एजेंट कमाई कैलकुलेटर (Agent Earning Potential)', 'Agent Earnings Calculator')}</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {t('देखें अपनी दुकान या सेंटर से आप रिचार्ज व बिल पेमेंट से कितना अतिरिक्त कमा सकते हैं', 'Calculate extra monthly income from recharge & bill payments')}
            </p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 px-4 py-2 rounded-2xl text-xs font-black">
            ⚡ 100% INSTANT WALLET CREDIT
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-slate-300">{t('दैनिक अनुमानित रिचार्ज वॉल्यूम (Daily Volume):', 'Daily Volume:')}</span>
                <span className="text-amber-400 font-mono text-base font-black">₹{dailyVolume.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="100000"
                step="2000"
                value={dailyVolume}
                onChange={(e) => setDailyVolume(Number(e.target.value))}
                className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>₹2,000 / day</span>
                <span>₹50,000 / day</span>
                <span>₹1,00,000 / day</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('मासिक कुल बिजनेस:', 'Monthly Turnover:')}</span>
                <span className="font-mono text-white font-bold">₹{(dailyVolume * 30).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('औसत कमीशन दर:', 'Avg Commission:')}</span>
                <span className="text-emerald-400 font-bold">~3.8%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('बस टिकट कमीशन (₹19.34 फिक्स):', 'Bus Ticket Commission:')}</span>
                <span className="text-white font-bold">+ ₹19.34 / ticket</span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-tr from-emerald-600/30 via-slate-800/80 to-teal-600/30 rounded-3xl border-2 border-emerald-500/40 text-center space-y-4">
            <span className="text-xs uppercase font-black tracking-widest text-emerald-400">
              {t('आपकी संभावित मासिक कमाई', 'YOUR ESTIMATED MONTHLY EARNINGS')}
            </span>
            <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
              ₹{monthlyCommission.toLocaleString('en-IN')}
              <span className="text-xs text-slate-300 font-normal block mt-1">{t('अतिरिक्त आय हर महीने', 'extra income every month')}</span>
            </div>

            {!isWaitlistDone ? (
              <form onSubmit={handleWaitlistSubmit} className="space-y-2 pt-2">
                <input
                  type="tel"
                  required
                  placeholder={t('अपना 10-अंकीय मोबाइल नंबर दर्ज करें', 'Enter your 10-digit mobile number')}
                  value={registeredPhone}
                  onChange={(e) => setRegisteredPhone(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:ring-2 focus:ring-emerald-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-emerald-500/30"
                >
                  {t('रिचार्ज सुविधा शुरू होते ही सूचित करें (Notify Me)', 'Notify Me on Launch')}
                </button>
              </form>
            ) : (
              <div className="p-3 bg-emerald-900/60 border border-emerald-400 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{t('धन्यवाद! जैसे ही रिचार्ज सेवा लाइव होगी, आपको SMS भेजा जाएगा।', 'Thank you! You will be alerted via SMS upon launch.')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
