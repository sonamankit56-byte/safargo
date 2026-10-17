import React, { useState } from 'react';
import { SearchBox } from '../components/SearchBox';
import { useBooking } from '../context/BookingContext';
import { POPULAR_ROUTES } from '../data/mockData';
import {
  Sparkles,
  Ticket,
  ShieldCheck,
  Zap,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Tag,
  Star,
  CheckCircle2,
  Smartphone,
  Briefcase,
  Calendar,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { setFromCity, setToCity, setCurrentView, applyCoupon, setCouponCode } = useBooking();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleRouteSelect = (from: string, to: string) => {
    setFromCity(from);
    setToCity(to);
    setCurrentView('search');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offers = [
    {
      code: 'SAFAR100',
      title: 'Flat ₹100 Off',
      subtitle: 'On your first bus booking',
      badge: 'POPULAR',
      validTill: '31 Oct',
    },
    {
      code: 'FIRST50',
      title: 'Save up to ₹150',
      subtitle: 'Exclusive discount on Primo AC Volvo buses',
      badge: 'PRIMO',
      validTill: '30 Nov',
    },
    {
      code: 'WEEKEND',
      title: '10% Cashback',
      subtitle: 'Applicable on round trips and weekend gateways',
      badge: 'WEEKEND',
      validTill: 'Ongoing',
    },
  ];

  const faqs = [
    {
      q: 'How do I choose between Lower Deck and Upper Deck sleeper berths?',
      a: 'When you select your preferred bus and click "View Seats", Safar Go displays an interactive dual-deck map. You can toggle seamlessly between Lower and Upper decks to select window, aisle, single, or double berths with live pricing.',
    },
    {
      q: 'What is a Primo bus and why should I choose it?',
      a: 'Primo buses are verified top-rated operators that have high customer satisfaction ratings (4.5+ ★), guaranteed on-time departure, polite crew, and sanitized cabins with live GPS tracking.',
    },
    {
      q: 'Can I cancel my ticket and how fast do I get my refund?',
      a: 'Yes, you can cancel your ticket directly from the "My Bookings" section using your PNR number. Refunds are processed automatically with clear transparency on cancellation fees.',
    },
    {
      q: 'Are there special seat reservations for female solo travelers?',
      a: 'Yes! Safar Go highlights female-reserved adjacent seats in soft pink on the seat selection layout to ensure safe, comfortable travel for women travelers.',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* HERO SECTION */}
      <section className="relative bg-gradient-to-b from-red-600 via-rose-600 to-red-700 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl">
        {/* Decorative background circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-black/10 pointer-events-none blur-xl" />

        <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-black tracking-wider uppercase text-red-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> India's Most Loved Bus Booking Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Book Bus Tickets Online with <span className="underline decoration-amber-400 decoration-wavy">Safar Go</span>
          </h1>

          <p className="text-sm sm:text-lg text-red-100 max-w-2xl mx-auto font-medium">
            Over 36,000+ daily routes, AC sleeper luxury buses, live bus tracking, and zero booking fee.
          </p>

          {/* Embedded Search Box */}
          <div className="pt-4">
            <SearchBox variant="hero" />
          </div>
        </div>
      </section>

      {/* OFFERS & COUPONS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-6 h-6 text-red-600" /> Trending Travel Offers
            </h2>
            <p className="text-xs text-slate-500 font-medium">Save extra on every bus journey with Safar Go vouchers</p>
          </div>
          <span className="text-xs font-bold text-red-600 hover:underline cursor-pointer hidden sm:inline">
            View All 14 Offers →
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 bg-red-100 text-red-700 text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                {offer.badge}
              </div>

              <div>
                <h3 className="font-extrabold text-lg text-slate-900">{offer.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{offer.subtitle}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                    {offer.code}
                  </span>
                  <span className="text-[10px] text-slate-400">Valid till {offer.validTill}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCouponCode(offer.code);
                    applyCoupon(offer.code);
                    alert(`Coupon "${offer.code}" copied and ready for checkout!`);
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                >
                  Apply Code
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRIMO SPOTLIGHT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" /> Safar Go Primo Certified
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Upgrade to India’s Best Rated Bus Travel
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
                Primo is our highest benchmark for travel quality. Experience curated fleet operators with 4.5+ star ratings, trained friendly drivers, live GPS tracking, clean linen, and zero cancellations.
              </p>

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>On-Time Guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sanitized Berths</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Top Rated Drivers</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setFromCity('Delhi');
                  setToCity('Manali');
                  setCurrentView('search');
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-2"
              >
                <span>EXPLORE PRIMO BUSES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* BECOME A SAFARGO AGENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-200">
                <Briefcase className="w-4 h-4" /> Agent Partner Program
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Become a SafarGo Agent & Earn <span className="underline decoration-amber-300">₹19.34</span> Per Booking
              </h2>

              <p className="text-red-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                Join India's fastest-growing bus ticketing partner network. Earn a fixed commission of <strong>₹19.34 (19.34 paise/ticket)</strong> on every seat booked, with <strong>automated weekly payouts deposited directly to your UPI/Bank every Sunday</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-red-200 font-bold uppercase">Commission Rate</div>
                  <div className="text-lg font-black text-amber-300">₹19.34 / Booking</div>
                  <div className="text-[10px] text-red-100">Guaranteed flat payout</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-red-200 font-bold uppercase">Weekly Payout Day</div>
                  <div className="text-lg font-black text-white flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-amber-300" /> Every Sunday
                  </div>
                  <div className="text-[10px] text-red-100">Direct UPI / Bank Transfer</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10">
                  <div className="text-[10px] text-red-200 font-bold uppercase">Investment Required</div>
                  <div className="text-lg font-black text-emerald-300">₹0 (Zero)</div>
                  <div className="text-[10px] text-red-100">Instant free activation</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('agent');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BECOME AN AGENT (JOIN NOW)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-red-200 font-medium">
                ⚡ Instant approval for shops, agents & individuals
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR BUS ROUTES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Popular Bus Routes
            </h2>
            <p className="text-xs text-slate-500 font-medium">Daily departures on top travel corridors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {POPULAR_ROUTES.map((route) => (
            <div
              key={`${route.from}-${route.to}`}
              onClick={() => handleRouteSelect(route.from, route.to)}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-red-400 hover:shadow-md transition-all cursor-pointer group text-left"
            >
              <div className="flex items-center justify-between">
                <div className="font-extrabold text-base text-slate-900 group-hover:text-red-600 transition-colors">
                  {route.from} → {route.to}
                </div>
                <span className="text-sm font-black text-red-600">{route.price}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {route.duration}
                </span>
                <span className="font-semibold text-slate-600">{route.buses}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">Everything you need to know about booking with Safar Go</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-slate-800 hover:text-red-600"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>
              {openFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 animate-in fade-in">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* APP DOWNLOAD PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-left">
            <span className="bg-white/20 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              MOBILE READY
            </span>
            <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
              Get the Safar Go App on Your Phone
            </h3>
            <p className="text-red-100 text-xs sm:text-sm max-w-lg leading-relaxed">
              Track your bus in real time, show digital tickets to the conductor, and get notifications on platform changes and boarding alarms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => alert('Safar Go Android App link: Coming soon to Google Play!')}
              className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Smartphone className="w-4 h-4" /> Google Play
            </button>
            <button
              onClick={() => alert('Safar Go iOS App link: Coming soon to Apple App Store!')}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Smartphone className="w-4 h-4" /> App Store
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
