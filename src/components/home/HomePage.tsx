import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  Bus,
  Sparkles,
  Tag,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Calendar,
  Smartphone,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Clock,
  ShieldCheck,
  Shield,
  Award,
  Heart,
  MapPin,
  ArrowLeftRight,
  RotateCcw,
  X,
  Phone,
  HelpCircle,
  Ticket,
  Star,
  Check,
  LogOut,
  User,
} from 'lucide-react';

interface HomePageProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
  onOpenGoAuth?: (mode?: 'login' | 'register') => void;
  onOpenPromoterApply?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAuth,
  onNavigateTab,
}) => {
  const { currentUser, logout } = useAuth();
  const { error, success } = useToast();

  // Search Box State
  const [fromCity, setFromCity] = useState('Bhopal');
  const [toCity, setToCity] = useState('Indore');
  const [journeyDate, setJourneyDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Open Onboarding Gateway in New Tab
  const handleOpenOnboarding = () => {
    const onboardingUrl = buildSubdomainUrl('onboarding');
    const win = window.open(onboardingUrl, '_blank', 'noopener,noreferrer');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      window.location.href = onboardingUrl;
    }
  };

  // Trending Offers Data
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

  // Popular Routes Data
  const popularRoutes = [
    { from: 'Bhopal', to: 'Indore', price: '₹350', duration: '3h 30m', buses: '42 daily buses' },
    { from: 'Indore', to: 'Ujjain', price: '₹120', duration: '1h 15m', buses: '65 daily buses' },
    { from: 'Bhopal', to: 'Jabalpur', price: '₹550', duration: '6h 15m', buses: '28 daily buses' },
    { from: 'Gwalior', to: 'Bhopal', price: '₹650', duration: '7h 45m', buses: '22 daily buses' },
    { from: 'Sironj', to: 'Bhopal', price: '₹220', duration: '2h 45m', buses: '18 daily buses' },
    { from: 'Guna', to: 'Bhopal', price: '₹320', duration: '4h 00m', buses: '24 daily buses' },
  ];

  // FAQs Data
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
      a: 'Yes, you can cancel your ticket directly using your PNR number. Refunds are processed automatically with full transparency on cancellation policies.',
    },
    {
      q: 'Are there special seat reservations for female solo travelers?',
      a: 'Yes! Safar Go highlights female-reserved adjacent seats in soft pink on the seat selection layout to ensure safe, comfortable travel for women travelers.',
    },
  ];

  return (
    <div className="space-y-16 pb-16 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER WITH MICRO BANNER, CLEAN SAFARGO LOGO & UTILITIES           */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        {/* Top micro banner */}
        <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe & Sanitized Buses
              </span>
              <span>Primo Certified Operators</span>
              <span>24x7 Customer Support</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" /> Helpline: 1800-SAFAR-GO
              </span>
              <span>|</span>
              <span className="text-white font-medium">India's Modern Bus Platform</span>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Service Tabs */}
          <div className="flex items-center gap-8">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2.5 text-left group transition-transform active:scale-95 cursor-pointer"
            >
              <SafarGoLogo size="md" showBadge={false} showTagline={true} />
            </button>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigateTab('bus-booking')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Bus className="w-4 h-4" />
                <span>Bus Tickets</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => alert('Cab Rentals launching soon on Safar Go!')}
              >
                Cab Rentals
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => alert('Train Bookings feature coming in next release!')}
              >
                Train Tickets
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAgentAuthStep('form');
                  setIsAgentModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-red-600" />
                <span>Become an Agent</span>
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  ₹19.34
                </span>
              </button>
            </nav>
          </div>

          {/* Right Utility Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab('my-bookings')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Bookings</span>
            </button>

            <button
              type="button"
              onClick={() => alert('Safar Go 24/7 Helpline: 1800-SAFAR-GO\nEmail: support@safargo.in\nInstant Chat Support is Active.')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>

            {/* User Auth Profile / Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <p className="font-bold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-slate-400">{currentUser.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 ml-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm shadow-red-200 transition-all active:scale-95 cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Login / Sign Up</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH RED/ROSE GRADIENT & SEARCH BOX                       */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-red-600 via-rose-600 to-red-700 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-black/10 pointer-events-none blur-xl" />

        <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-xs text-xs font-black tracking-wider uppercase text-red-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> India's Most Loved Bus Booking Platform
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Book Bus Tickets Online with <span className="underline decoration-amber-400 decoration-wavy">Safar Go</span>
          </h1>

          <p className="text-sm sm:text-base text-red-100 max-w-2xl mx-auto font-medium">
            Over 36,000+ daily routes, AC sleeper luxury buses, live bus tracking, and zero booking fee.
          </p>

          {/* Embedded Interactive Search Box */}
          <div className="pt-2 max-w-5xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 sm:p-4 text-left transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* FROM CITY */}
                <div className="md:col-span-4 relative" ref={fromRef}>
                  <div
                    onClick={() => setFromOpen(true)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all cursor-pointer bg-slate-50/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        From City (प्रस्थान)
                      </label>
                      <input
                        type="text"
                        value={fromCity}
                        onChange={(e) => {
                          setFromCity(e.target.value);
                          setFromOpen(true);
                        }}
                        placeholder="शहर दर्ज करें"
                        className="w-full bg-transparent font-black text-slate-900 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {fromOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto p-2">
                      <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">
                        MP Network Cities
                      </div>
                      {MP_NETWORK_CITIES.filter((c) =>
                        c.toLowerCase().includes(fromCity.toLowerCase())
                      ).map((city) => (
                        <div
                          key={city}
                          onClick={() => {
                            setFromCity(city);
                            setFromOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 text-slate-800 hover:text-red-600 font-bold text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>{city}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">MP Bus Stand</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SWAP BUTTON */}
                <div className="hidden md:flex md:col-span-1 justify-center">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="w-9 h-9 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 flex items-center justify-center transition-transform hover:rotate-180 cursor-pointer"
                    title="शहर बदलें"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* TO CITY */}
                <div className="md:col-span-4 relative" ref={toRef}>
                  <div
                    onClick={() => setToOpen(true)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-red-400 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100 transition-all cursor-pointer bg-slate-50/50"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        To City (गंतव्य)
                      </label>
                      <input
                        type="text"
                        value={toCity}
                        onChange={(e) => {
                          setToCity(e.target.value);
                          setToOpen(true);
                        }}
                        placeholder="शहर दर्ज करें"
                        className="w-full bg-transparent font-black text-slate-900 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  {toOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 max-h-56 overflow-y-auto p-2">
                      <div className="text-[10px] font-bold text-slate-400 px-3 py-1 uppercase">
                        MP Network Cities
                      </div>
                      {MP_NETWORK_CITIES.filter((c) =>
                        c.toLowerCase().includes(toCity.toLowerCase())
                      ).map((city) => (
                        <div
                          key={city}
                          onClick={() => {
                            setToCity(city);
                            setToOpen(false);
                          }}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-red-50 text-slate-800 hover:text-red-600 font-bold text-xs cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>{city}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-normal">Terminal</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* JOURNEY DATE */}
                <div className="md:col-span-3">
                  <div className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Date of Journey
                      </label>
                      <input
                        type="date"
                        value={journeyDate}
                        onChange={(e) => setJourneyDate(e.target.value)}
                        className="w-full bg-transparent font-black text-slate-900 text-xs focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Date Pills & Search CTA */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-bold text-[11px]">Quick Date:</span>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(0)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold text-[11px] transition cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDate(1)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 font-bold text-[11px] transition cursor-pointer"
                  >
                    Tomorrow
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>SEARCH BUSES (बसें खोजें)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. TRENDING TRAVEL OFFERS / COUPON CARDS                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 text-left">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-6 h-6 text-red-600" /> Trending Travel Offers
            </h2>
            <p className="text-xs text-slate-500 font-medium">Save extra on every bus journey with Safar Go vouchers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {offers.map((offer) => (
            <div
              key={offer.code}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
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
                  <span className="text-xs font-mono font-black bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200">
                    {offer.code}
                  </span>
                  <span className="text-[10px] text-slate-400">Valid till {offer.validTill}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    success('कूपन कोड कॉपी हुआ!', `कूपन "${offer.code}" चेकआउट पर लागू हो जाएगा।`);
                    onNavigateTab('bus-booking');
                  }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Apply Code ➔
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. PRIMO SPOTLIGHT SECTION                                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
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
                onClick={() => onNavigateTab('bus-booking')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-amber-400/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>EXPLORE PRIMO BUSES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. BECOME A SAFARGO AGENT SECTION (OPENS AGENT REGISTRATION UI)           */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-amber-200">
                <Briefcase className="w-4 h-4" /> Agent Partner Program
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Become a SafarGo Agent & Earn <span className="underline decoration-amber-300">₹20</span> Per Booking
              </h2>

              <p className="text-red-100 text-xs sm:text-sm max-w-xl leading-relaxed">
                Join Madhya Pradesh's fastest-growing bus ticketing partner network. Earn a fixed commission of <strong>flat ₹20 on every seat booked</strong>, with <strong>instant 0-second Add Money</strong> and automated weekly payouts deposited directly to your UPI/Bank every Sunday.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-red-200 font-bold uppercase">Commission Rate</div>
                  <div className="text-lg font-black text-amber-300">₹20 / Booking</div>
                  <div className="text-[10px] text-red-100">Guaranteed flat payout</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-red-200 font-bold uppercase">Weekly Payout Day</div>
                  <div className="text-lg font-black text-white flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-amber-300" /> Every Sunday
                  </div>
                  <div className="text-[10px] text-red-100">Direct UPI / Bank Transfer</div>
                </div>

                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
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
                  setAgentAuthStep('form');
                  setIsAgentModalOpen(true);
                }}
                className="w-full sm:w-auto bg-slate-900 hover:bg-black text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>BECOME AN AGENT (JOIN NOW)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-red-200 font-medium">
                ⚡ Instant approval for shops, kiosks & CSC agents
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. POPULAR BUS ROUTES GRID                                                */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Popular Bus Routes
            </h2>
            <p className="text-xs text-slate-500 font-medium">Daily departures on top MP travel corridors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {popularRoutes.map((route) => (
            <div
              key={`${route.from}-${route.to}`}
              onClick={() => handleRouteSelect(route.from, route.to)}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-red-400 hover:shadow-md transition-all cursor-pointer group"
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

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQS)                                      */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">Everything you need to know about booking with Safar Go</p>
        </div>

        <div className="space-y-3 text-left">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-sm text-slate-800 hover:text-red-600 cursor-pointer"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
              </button>
              {openFaq === idx && (
                <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MOBILE APP DOWNLOAD PROMO                                              */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl text-left">
          <div className="space-y-3">
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
              type="button"
              onClick={() => alert('Safar Go Android App link: Coming soon to Google Play!')}
              className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" /> Google Play
            </button>
            <button
              type="button"
              onClick={() => alert('Safar Go iOS App link: Coming soon to Apple App Store!')}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" /> App Store
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. COMPLETE REDBUS-STYLE FOOTER                                           */}
      {/* ========================================================================= */}
      <footer className="bg-slate-900 text-slate-400 text-xs pt-16 pb-12 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Top Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800 text-left">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 border border-red-500/20">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Safety First Guaranteed</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Emergency exit indicators, verified drivers, sanitized cabins, and real-time live GPS tracking on all Primo routes.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Lowest Fare Promise</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Direct operator inventory rates with zero hidden charges. Use code SAFAR100 for instant ₹100 flat savings on first booking.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">24x7 Customer Support</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated travel helpline, instant automated cancellation refund processing, and WhatsApp trip updates.
                </p>
              </div>
            </div>
          </div>

          {/* Directory Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {/* Brand Info */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <SafarGoLogo size="sm" variant="light" showBadge={false} showTagline={false} />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                India's fastest and most reliable online bus ticketing reservation engine. Rebuilding travel with comfort, reliability, and precision.
              </p>
              <div className="space-y-1.5 pt-2 text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-red-500" /> 1800-SAFAR-GO (Toll Free)
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-red-500" /> support@safargo.in
                </div>
              </div>
            </div>

            {/* Popular Routes */}
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Popular Routes</h5>
              <ul className="space-y-2">
                {popularRoutes.map((r) => (
                  <li key={`${r.from}-${r.to}`}>
                    <button
                      type="button"
                      onClick={() => handleRouteSelect(r.from, r.to)}
                      className="hover:text-red-400 text-left transition-colors cursor-pointer"
                    >
                      {r.from} to {r.to}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Bus Operators */}
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Top Operators</h5>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>IntrCity SmartBus</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>Zingbus Plus</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>NueGo Electric AC</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>VRL Travels</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>Orange Tours & Travels</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>Hans Travels</span></li>
              </ul>
            </div>

            {/* Company & Legal */}
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-3">About & Legal</h5>
              <ul className="space-y-2">
                <li><span className="hover:text-white cursor-pointer" onClick={() => alert('About Safar Go: India\'s modern bus platform.')}>About Safar Go</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => onNavigateTab('bus-booking')}>Offers & Promo Codes</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => alert('Safar Go Privacy Policy: Safe & 100% encrypted.')}>Privacy Policy</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => alert('Safar Go Terms of Service: Standard travel booking guidelines.')}>Terms of Service</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={handleOpenOnboarding}>Become Agent Partner</span></li>
                <li><span className="hover:text-white cursor-pointer" onClick={() => window.scrollTo({ top: 1200, behavior: 'smooth' })}>Frequently Asked Questions</span></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-[11px] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Safar Go Technologies Private Limited. All rights reserved.</p>
            <p className="text-slate-400">
              Engineered with high fidelity & clean-room parity • Safar Go Travel Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
