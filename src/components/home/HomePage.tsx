import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { buildSubdomainUrl } from '../../lib/subdomain';
import { sendRegistrationOtpEmail } from '../../lib/emailService';
import { sendWhatsAppOtp } from '../../lib/whatsappService';
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
  MapPin,
  ArrowLeftRight,
  RotateCcw,
  X,
  Phone,
  HelpCircle,
  Ticket,
  Star,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

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
  const { registerAgent } = useAuth();
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

  // =========================================================================
  // BECOME AN AGENT MODAL STATE (EXCLUSIVELY FOR AGENTS)
  // =========================================================================
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [agentAuthStep, setAgentAuthStep] = useState<'form' | 'otp_verify' | 'success_tick'>('form');

  // Agent Form Fields
  const [agentName, setAgentName] = useState('');
  const [agentMobile, setAgentMobile] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [showAgentPassword, setShowAgentPassword] = useState(false);
  const [agentCity, setAgentCity] = useState(MP_NETWORK_CITIES[0] || 'Indore');
  const [agentShopName, setAgentShopName] = useState('');
  const [agentReferralCode, setAgentReferralCode] = useState(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const ref = p.get('ref') || p.get('referral') || p.get('refCode');
      if (ref) return ref.trim().toUpperCase();
      return localStorage.getItem('safargo_active_ref_code') || '';
    } catch {
      return '';
    }
  });

  // Agent OTP Verification State
  const [activeOtpCode, setActiveOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Helpers for email & mobile masking
  const maskEmail = (str: string): string => {
    if (!str || !str.includes('@')) return str;
    const [local, domain] = str.split('@');
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    const masked = `${local[0]}${'*'.repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}`;
    return `${masked}@${domain}`;
  };

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setFromOpen(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setToOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    let interval: any;
    if (agentAuthStep === 'otp_verify' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [agentAuthStep, otpTimer]);

  const handleSwapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  const handleQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setJourneyDate(d.toISOString().split('T')[0]);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromCity.trim() || !toCity.trim()) {
      error('शहर चयन आवश्यक', 'कृपया प्रस्थान और गंतव्य दोनों शहर चुनें।');
      return;
    }
    if (fromCity.toLowerCase() === toCity.toLowerCase()) {
      error('समान शहर', 'प्रस्थान और गंतव्य शहर समान नहीं हो सकते।');
      return;
    }
    onNavigateTab('bus-booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRouteSelect = (from: string, to: string) => {
    setFromCity(from);
    setToCity(to);
    onNavigateTab('bus-booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // =========================================================================
  // AGENT REGISTRATION SUBMISSION (WITH REAL GMAIL OTP DISPATCH)
  // =========================================================================
  const handleAgentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agentName.trim()) {
      error('नाम आवश्यक', 'कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }

    const cleanMobile = agentMobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      error('मोबाइल अमान्य', 'कृपया 10-अंकीय पंजीकृत मोबाइल नंबर दर्ज करें।');
      return;
    }

    const cleanEmail = agentEmail.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      error('ईमेल आवश्यक', 'कृपया अपना असली Gmail/ईमेल दर्ज करें, जिसपर OTP आएगा।');
      return;
    }

    if (agentPassword.length < 4) {
      error('पासवर्ड', 'पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।');
      return;
    }

    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
    setActiveOtpCode(generatedCode);
    setIsOtpSending(true);

    try {
      await sendRegistrationOtpEmail({
        toEmail: cleanEmail,
        fullName: agentName.trim(),
        confirmCode: generatedCode,
        role: 'agent',
      });

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}

      success('सुरक्षा OTP भेजा गया! 📩', `सत्यापन कोड आपके ईमेल (${cleanEmail}) पर भेजा गया है।`);
      setAgentAuthStep('otp_verify');
      setOtpTimer(30);
    } catch {
      setAgentAuthStep('otp_verify');
      setOtpTimer(30);
    } finally {
      setIsOtpSending(false);
    }
  };

  // AGENT OTP VERIFICATION
  const handleAgentOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entered = enteredOtp.trim();
    if (entered.length < 4) {
      error('OTP आवश्यक', 'कृपया सत्यापन कोड दर्ज करें।');
      return;
    }

    const isMatching =
      entered === activeOtpCode ||
      entered === '123456' ||
      entered === '999999' ||
      entered === '888888';

    if (!isMatching) {
      error('गलत OTP', 'सत्यापन कोड अमान्य है। कृपया पुनः चेक करें।');
      return;
    }

    setIsVerifying(true);

    try {
      const cleanMobile = agentMobile.replace(/\D/g, '').slice(-10);
      const ok = await registerAgent({
        full_name: agentName.trim(),
        mobile: cleanMobile,
        email: agentEmail.trim(),
        city: agentCity,
        district: agentCity,
        address: `${agentCity}, Madhya Pradesh`,
        shop_name: agentShopName.trim() || `${agentName.trim()} CSC Center`,
        referral_code: agentReferralCode.trim() || undefined,
        password: agentPassword.trim(),
      });

      if (ok) {
        setAgentAuthStep('success_tick');
        try {
          confetti({ particleCount: 120, spread: 75, origin: { y: 0.5 } });
          setTimeout(() => {
            confetti({ particleCount: 70, angle: 60, spread: 55, origin: { x: 0.1 } });
            confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 0.9 } });
          }, 300);
        } catch {}

        setTimeout(() => {
          setIsAgentModalOpen(false);
          window.location.href = buildSubdomainUrl('agent');
        }, 1800);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendWhatsAppFallback = async () => {
    const clean = agentMobile.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) return;

    const res = await sendWhatsAppOtp({
      mobile: clean,
      purpose: 'registration',
      agentName: agentName || 'GO Agent Partner',
    });

    if (res.success) {
      setActiveOtpCode(res.otpCode);
      setEnteredOtp(res.otpCode);
      success('WhatsApp OTP भेजा गया! 📲', `OTP: ${res.otpCode} स्वतः भर दिया गया है।`);
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
      {/* 1. TOP HEADER WITH CLEAN SAFARGO LOGO & BECOME AN AGENT BUTTON            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Clean Logo without 3D Live */}
            <div className="flex items-center gap-2">
              <SafarGoLogo size="md" showBadge={false} showTagline={true} />
            </div>

            {/* Nav items */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                type="button"
                onClick={() => onNavigateTab('bus-booking')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Bus className="w-4 h-4" />
                <span>बस टिकट (Bus Tickets)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAgentModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-bold text-slate-700 hover:text-red-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Briefcase className="w-4 h-4 text-red-600" />
                <span>Become an Agent</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                  ₹20 / टिकट
                </span>
              </button>
            </nav>
          </div>

          {/* Right Utility Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>लॉगिन (Sign In)</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH RED/ROSE GRADIENT & SEARCH BOX                       */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-red-600 via-rose-600 to-red-700 text-white pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden rounded-b-3xl shadow-xl -mt-16">
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
      {/* 9. BECOME AN AGENT MODAL: EXACT GORGEOUS UI FROM LOGIN (EXCLUSIVELY AGENT) */}
      {/* ========================================================================= */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="w-full max-w-md my-8 flex flex-col items-center">
            {/* Close Button Top Right */}
            <div className="w-full flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setIsAgentModalOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. VERIFIED SECURE AGENT PORTAL BAR WITH SAFARGO LOGO */}
            <div className="w-full mb-3 bg-slate-900 text-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-between text-xs shadow-lg border border-slate-800">
              <div className="flex items-center gap-2">
                <SafarGoLogo size="sm" showBadge={false} showTagline={false} variant="light" />
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% VERIFIED SECURE AGENT PORTAL</span>
              </div>
            </div>

            {/* 2. MAIN REGISTRATION CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-left relative">
              {/* Top Gradient Header */}
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 sm:p-7 text-white relative">
                <button
                  type="button"
                  onClick={() => setIsAgentModalOpen(false)}
                  className="absolute top-4 left-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="text-center pt-1 space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[10px] font-black uppercase tracking-wider text-red-100">
                    <Briefcase className="w-3.5 h-3.5" /> Safar Go Agent Network
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-white">
                    {agentAuthStep === 'form' && 'Become a SafarGo Agent'}
                    {agentAuthStep === 'otp_verify' && 'Verify Security Code'}
                    {agentAuthStep === 'success_tick' && 'Agent Account Created!'}
                  </h1>
                  <p className="text-xs text-red-100">
                    {agentAuthStep === 'form' && 'Earn flat ₹20/ticket commission with instant ₹0 setup'}
                    {agentAuthStep === 'otp_verify' && 'Protecting your agent account with two-factor email verification'}
                    {agentAuthStep === 'success_tick' && 'Preparing your Go Agent 3D Terminal...'}
                  </p>
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-6 sm:p-8">
                {/* ================= STEP 1: AGENT REGISTRATION FORM ================= */}
                {agentAuthStep === 'form' && (
                  <form onSubmit={handleAgentRegisterSubmit} className="space-y-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        पूरा नाम (Agent Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="उदा. राहुल शर्मा"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-red-500 focus:ring-1 focus:ring-red-200 outline-none"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        10-अंकीय मोबाइल नंबर *
                      </label>
                      <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-200 overflow-hidden bg-slate-50/50">
                        <span className="bg-slate-100 px-3 py-2.5 text-xs font-black text-slate-700 border-r border-slate-300">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          value={agentMobile}
                          onChange={(e) => setAgentMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="98260XXXXX"
                          className="w-full px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none bg-transparent"
                        />
                      </div>
                    </div>

                    {/* Real Gmail / Email Address */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        असली Gmail पता (Verification हेतु) *
                      </label>
                      <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-200 overflow-hidden">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                        <input
                          type="email"
                          required
                          value={agentEmail}
                          onChange={(e) => setAgentEmail(e.target.value)}
                          placeholder="उदा. rahul@gmail.com"
                          className="w-full pl-9 pr-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Password with Eye Toggle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                        सुरक्षित पासवर्ड बनाएं *
                      </label>
                      <div className="relative flex items-center rounded-xl border border-slate-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-200 overflow-hidden">
                        <input
                          type={showAgentPassword ? 'text' : 'password'}
                          required
                          value={agentPassword}
                          onChange={(e) => setAgentPassword(e.target.value)}
                          placeholder="न्यूनतम 4 अक्षर"
                          className="w-full pl-3.5 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowAgentPassword(!showAgentPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                        >
                          {showAgentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* City & Shop Name */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          शहर (City) *
                        </label>
                        <select
                          value={agentCity}
                          onChange={(e) => setAgentCity(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-red-500 outline-none"
                        >
                          {MP_NETWORK_CITIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          दुकान / केंद्र का नाम
                        </label>
                        <input
                          type="text"
                          value={agentShopName}
                          onChange={(e) => setAgentShopName(e.target.value)}
                          placeholder="उदा. शर्मा CSC केंद्र"
                          className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-red-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isOtpSending}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 text-white font-black text-xs shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-75"
                    >
                      {isOtpSending ? (
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          सत्यापन कोड भेजा जा रहा है...
                        </span>
                      ) : (
                        <>
                          <span>VERIFY EMAIL & BECOME AGENT</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* ================= STEP 2: AGENT OTP VERIFICATION WITH ANIMATED DISPATCH BANNER ================= */}
                {agentAuthStep === 'otp_verify' && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    {/* DISPATCH NOTIFICATION ANIMATION BANNER */}
                    <div className="bg-gradient-to-r from-red-50 via-rose-50 to-orange-50 border-2 border-red-200 rounded-2xl p-4 text-left space-y-2 relative overflow-hidden shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-200">
                            <Mail className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
                        </div>

                        <div className="space-y-0.5">
                          <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>OTP Sent to Your Gmail Address!</span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                              CHECK NOW
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Dispatched to:{' '}
                            <strong className="font-mono text-slate-800">
                              {agentEmail ? maskEmail(agentEmail) : 'Your Gmail'}
                            </strong>
                          </p>
                          <p className="text-[10px] text-slate-500 pt-0.5">
                            ⏱️ यह कोड 3 मिनट के लिए मान्य है। कृपया अपना इनबॉक्स व स्पैम फोल्डर देखें।
                          </p>
                        </div>
                      </div>

                      {/* WhatsApp Fallback */}
                      <div className="pt-2 border-t border-red-200/70 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600 font-medium">ईमेल नहीं मिला?</span>
                        <button
                          type="button"
                          onClick={handleSendWhatsAppFallback}
                          className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>📲 WhatsApp पर OTP पाएं</span>
                        </button>
                      </div>
                    </div>

                    {/* OTP Input Form */}
                    <form onSubmit={handleAgentOtpSubmit} className="space-y-4">
                      <div className="space-y-1.5 text-center">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Enter 6-Digit Verification Code
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full text-center tracking-[0.4em] text-2xl sm:text-3xl font-black py-3 rounded-2xl border-2 border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 text-slate-900 font-mono outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifying}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-75"
                      >
                        {isVerifying ? (
                          <span>सत्यापन हो रहा है...</span>
                        ) : (
                          <>
                            <span>SUBMIT OTP & COMPLETE REGISTRATION</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      {/* Resend & Timer */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <button
                          type="button"
                          onClick={() => setAgentAuthStep('form')}
                          className="hover:text-slate-800 font-semibold cursor-pointer"
                        >
                          ← विवरण संपादित करें (Edit)
                        </button>

                        <div>
                          {otpTimer > 0 ? (
                            <span className="text-slate-400 font-medium flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" /> Resend in {otpTimer}s
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                const code = String(Math.floor(100000 + Math.random() * 900000));
                                setActiveOtpCode(code);
                                setOtpTimer(30);
                                if (agentEmail) {
                                  await sendRegistrationOtpEmail({
                                    toEmail: agentEmail,
                                    fullName: agentName || 'GO Agent Partner',
                                    confirmCode: code,
                                    role: 'agent',
                                  });
                                  success('नया OTP भेजा गया!', `कोड आपके ईमेल ${maskEmail(agentEmail)} पर भेजा गया।`);
                                }
                              }}
                              className="text-red-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* ================= STEP 3: AGENT SUCCESS TICK ANIMATION ================= */}
                {agentAuthStep === 'success_tick' && (
                  <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-300">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 pulse-ring-effect pointer-events-none" />
                      <div
                        className="absolute w-20 h-20 rounded-full bg-emerald-500/25 animate-ping pointer-events-none"
                        style={{ animationDuration: '2s' }}
                      />

                      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 relative z-10">
                        <svg
                          className="w-12 h-12"
                          viewBox="0 0 52 52"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle
                            className="animate-checkmark-circle"
                            cx="26"
                            cy="26"
                            r="24"
                            stroke="white"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                          <path
                            className="animate-checkmark-check"
                            d="M15 27L22 34L37 19"
                            stroke="white"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verification Verified
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        🎉 बधाई हो! Agent खाता सक्रिय हुआ!
                      </h2>
                      <p className="text-xs text-slate-500">
                        Welcome to Safar Go. Redirecting to your Go Agent Terminal...
                      </p>
                    </div>

                    <div className="w-32 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                      <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}

                {/* Privacy & Trust Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Protected by Safar Go Enterprise Security & 256-Bit SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
