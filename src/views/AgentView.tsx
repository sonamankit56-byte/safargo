import React, { useState, useEffect } from 'react';
import { useBooking } from '../context/BookingContext';
import confetti from 'canvas-confetti';
import {
  Calendar,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  CreditCard,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Search,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Zap,
  Award,
  BadgePercent,
  Gift,
  QrCode,
  Printer,
  Bus,
  Phone,
  LayoutDashboard,
  Wallet,
  History,
  Copy,
  ExternalLink,
  Check,
  Building,
  User,
  AlertCircle,
} from 'lucide-react';
import { SearchBox } from '../components/SearchBox';
import { TicketCard } from '../components/TicketCard';
import { Booking } from '../types';

export const AgentView: React.FC = () => {
  const {
    agent,
    isAgentLoggedIn,
    registerAgent,
    logoutAgent,
    setCurrentView,
    confirmedBookings,
    cancelBooking,
    setFromCity,
    setToCity,
  } = useBooking();

  // Navigation: 4 main tabs as requested
  // 1. Dashboard, 2. New Bus Booking, 3. History, 4. Account
  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'history' | 'account'>('dashboard');

  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [upiId, setUpiId] = useState('');

  // Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredRefId, setRegisteredRefId] = useState('');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<Booking | null>(null);

  // Edit UPI state
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [newUpiId, setNewUpiId] = useState('');
  const [upiSavedSuccess, setUpiSavedSuccess] = useState(false);

  // Earnings Calculator State
  const [calculatorTicketsPerDay, setCalculatorTicketsPerDay] = useState(25);

  // History Tab Filter & Search
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [copiedPnr, setCopiedPnr] = useState<string | null>(null);

  // Auto-scrolling Banner Carousel State
  const [activeBanner, setActiveBanner] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // Banners data
  const banners = [
    {
      id: 1,
      badge: 'AUTOMATED WEEKLY SETTLEMENT',
      badgeColor: 'bg-amber-400 text-slate-950',
      title: 'Weekly Sunday Payouts Automated',
      highlight: '₹19.34 / Booking',
      desc: 'All booking commissions are automatically deposited every Sunday at 06:00 AM straight to your registered UPI or Bank Account.',
      cta: 'View Settlement Schedule',
      action: () => setShowPayoutModal(true),
      gradient: 'from-slate-950 via-indigo-950 to-slate-900',
      accentGlow: 'bg-indigo-500/20',
      icon: Calendar,
    },
    {
      id: 2,
      badge: 'FESTIVAL RUSH BONUS',
      badgeColor: 'bg-rose-500 text-white',
      title: 'Double Booking Rush: Extra ₹500 Bonus',
      highlight: '₹500 Extra Cash',
      desc: 'Complete 50 bus reservations this week and unlock executive cash bonus directly credited in your upcoming Sunday payout.',
      cta: 'Book Tickets Now',
      action: () => setActiveTab('booking'),
      gradient: 'from-rose-900 via-red-900 to-slate-950',
      accentGlow: 'bg-rose-500/20',
      icon: Gift,
    },
    {
      id: 3,
      badge: 'PRIMO FLEET PRIORITY',
      badgeColor: 'bg-emerald-400 text-slate-950',
      title: 'Zero Cancellation Fee on Volvo & AC Sleepers',
      highlight: '100% Priority Allocation',
      desc: 'Authorized Safar Go agents enjoy priority seat locking, instant PDF e-tickets, and zero penalty cancellation on Primo buses.',
      cta: 'Book Primo Buses',
      action: () => setActiveTab('booking'),
      gradient: 'from-slate-950 via-slate-900 to-emerald-950',
      accentGlow: 'bg-emerald-500/20',
      icon: Zap,
    },
    {
      id: 4,
      badge: 'OFFICIAL BRANDING KIT',
      badgeColor: 'bg-blue-400 text-slate-950',
      title: 'Download Free Shop Counter Branding Kit',
      highlight: 'Free Posters & QR Code',
      desc: 'Transform your counter with printable high-resolution Safar Go banners, shop posters, and digital QR codes for passenger bookings.',
      cta: 'View Agent Certificate',
      action: () => setShowCertificateModal(true),
      gradient: 'from-slate-950 via-blue-950 to-slate-900',
      accentGlow: 'bg-blue-500/20',
      icon: Award,
    },
  ];

  // Auto-scroll banners every 3.5 seconds
  useEffect(() => {
    if (isBannerHovered) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isBannerHovered, banners.length]);

  const handleNextBanner = () => {
    setActiveBanner((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Agent Registration Submit
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !upiId) {
      alert('Please fill all required agent fields.');
      return;
    }
    const newAgent = registerAgent({
      fullName,
      agencyName: agencyName || `${fullName} Travel Agency`,
      phone,
      email: email || `${phone}@safargo.in`,
      city: city || 'New Delhi',
      upiId,
    });
    setRegisteredRefId(newAgent.agentId);
    setShowSuccessModal(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 60,
          origin: { x: 0.1 },
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 60,
          origin: { x: 0.9 },
        });
      }, 250);
    } catch {
      // ignore
    }
  };

  const handleDemoAgentRegister = () => {
    const newAgent = registerAgent({
      fullName: 'Vikram Singh',
      agencyName: 'Shree Ganesh Tour & Travels',
      phone: '9823019283',
      email: 'vikram.travels@gmail.com',
      city: 'Delhi',
      upiId: 'vikram@okaxis',
    });
    setRegisteredRefId(newAgent.agentId);
    setShowSuccessModal(true);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }
  };

  const handleCopyPnr = (pnr: string) => {
    navigator.clipboard.writeText(pnr);
    setCopiedPnr(pnr);
    setTimeout(() => setCopiedPnr(null), 2000);
  };

  const handleUpdateUpi = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUpiId && agent) {
      agent.upiId = newUpiId;
      localStorage.setItem('safar_go_agent', JSON.stringify(agent));
      setUpiSavedSuccess(true);
      setTimeout(() => {
        setIsEditingUpi(false);
        setUpiSavedSuccess(false);
      }, 1500);
    }
  };

  const handleSelectRoute = (from: string, to: string) => {
    setFromCity(from);
    setToCity(to);
    setCurrentView('search');
  };

  const weeklyCalculatedEarnings = (calculatorTicketsPerDay * 7 * 19.34).toFixed(2);
  const monthlyCalculatedEarnings = (calculatorTicketsPerDay * 30 * 19.34).toFixed(2);

  // Filter confirmed bookings for History tab
  const filteredHistoryBookings = confirmedBookings.filter((b) => {
    if (historyStatusFilter !== 'all' && b.status !== historyStatusFilter) return false;
    if (!historySearchQuery.trim()) return true;
    const query = historySearchQuery.toLowerCase();
    return (
      b.pnr.toLowerCase().includes(query) ||
      b.bus.fromCity.toLowerCase().includes(query) ||
      b.bus.toCity.toLowerCase().includes(query) ||
      b.bus.operator.name.toLowerCase().includes(query) ||
      b.passengers.some((p) => p.name.toLowerCase().includes(query)) ||
      b.contactPhone.includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 text-left pb-28">
      {/* ========================================================================= */}
      {/* CASE 1: LOGGED IN AGENT DASHBOARD                                         */}
      {/* ========================================================================= */}
      {isAgentLoggedIn && agent ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* ===================================================================== */}
          {/* SABSE UPAR WALLET (EXECUTIVE WALLET HEADER CARD)                       */}
          {/* ===================================================================== */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-slate-800 relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left Column: Wallet Balance & Payout Schedule */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/30">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" /> SAFAR GO AGENT WALLET
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Commission Accrual
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Unpaid Commission (Sunday Settlement)
                  </div>
                  <div className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                    <span className="text-emerald-400">₹{agent.unpaidEarnings}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400 font-sans">
                      INR Balance
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Fixed Commission: <strong className="text-white">₹19.34 / Booking</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    <span>Weekly Payout: <strong className="text-white">Every Sunday</strong> (Upcoming: {agent.nextPayoutDate})</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-xs">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>Payout UPI: <strong className="font-mono text-emerald-300">{agent.upiId}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Wallet Actions & Lifetime Stats */}
              <div className="flex flex-col sm:flex-row lg:flex-col justify-end gap-3 shrink-0">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Total Lifetime</div>
                    <div className="text-lg font-black text-white mt-0.5">₹{agent.totalEarnings}</div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Bookings Done</div>
                    <div className="text-lg font-black text-white mt-0.5">{agent.totalBookingsCount}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPayoutModal(true)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Payout Schedule</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingUpi(!isEditingUpi)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl border border-white/15 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-slate-300" />
                    <span>Edit UPI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Inline UPI Edit Drawer */}
            {isEditingUpi && (
              <form onSubmit={handleUpdateUpi} className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3 animate-in fade-in">
                <span className="text-xs text-slate-300 font-bold">Update Payout UPI ID:</span>
                <input
                  type="text"
                  required
                  defaultValue={agent.upiId}
                  onChange={(e) => setNewUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi or name@okaxis"
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:border-emerald-400 outline-none"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl text-xs font-black"
                >
                  Save UPI
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingUpi(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                {upiSavedSuccess && (
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
              </form>
            )}
          </div>

          {/* ===================================================================== */}
          {/* DESKTOP TOP TAB PILLS (EASY SWITCHING FOR BOTH DESKTOP & MOBILE)     */}
          {/* ===================================================================== */}
          <div className="hidden sm:flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>1. Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('booking')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'booking'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>2. New Bus Booking</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              <span>3. History</span>
              {confirmedBookings.length > 0 && (
                <span className={`text-[10px] px-2 py-0.2 rounded-full font-mono ${
                  activeTab === 'history' ? 'bg-white text-red-600 font-bold' : 'bg-red-100 text-red-600'
                }`}>
                  {confirmedBookings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-red-600 text-white shadow-md shadow-red-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>4. Account</span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* TAB CONTENT: 1. DASHBOARD                                             */}
          {/* ===================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* AUTO-SCROLLING PROMOTIONAL BANNERS CAROUSEL */}
              <div
                className="relative rounded-3xl overflow-hidden shadow-xl"
                onMouseEnter={() => setIsBannerHovered(true)}
                onMouseLeave={() => setIsBannerHovered(false)}
              >
                <div className="relative min-h-[260px] sm:min-h-[240px]">
                  {banners.map((b, index) => {
                    const isActive = index === activeBanner;
                    return (
                      <div
                        key={b.id}
                        className={`absolute inset-0 p-6 sm:p-10 text-white bg-gradient-to-r ${b.gradient} transition-all duration-700 ease-in-out flex flex-col justify-between ${
                          isActive
                            ? 'opacity-100 translate-x-0 z-10'
                            : 'opacity-0 translate-x-12 pointer-events-none z-0'
                        }`}
                      >
                        <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${b.accentGlow}`} />

                        <div className="max-w-3xl space-y-3 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${b.badgeColor}`}>
                              {b.badge}
                            </span>
                            <span className="text-xs text-slate-300 font-mono font-bold flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-400" /> Auto-Updating
                            </span>
                          </div>

                          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                            {b.title}
                          </h2>

                          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
                            {b.desc}
                          </p>
                        </div>

                        <div className="pt-4 flex flex-wrap items-center justify-between gap-4 relative z-10">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>Commission: ₹19.34 fixed per seat</span>
                          </div>

                          <button
                            type="button"
                            onClick={b.action}
                            className="bg-white hover:bg-slate-100 text-slate-950 font-black text-xs px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <span>{b.cta}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Left/Right Nav Arrows */}
                <button
                  type="button"
                  onClick={handlePrevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-90"
                  aria-label="Previous Banner"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-90"
                  aria-label="Next Banner"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Pagination Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {banners.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={() => setActiveBanner(dotIdx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        dotIdx === activeBanner ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Slide ${dotIdx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* QUICK SHORTCUT TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className="bg-white hover:bg-red-50/50 p-4 rounded-2xl border border-slate-200 hover:border-red-300 shadow-xs flex flex-col items-center text-center transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Bus className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">New Booking</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">+₹19.34 Payout</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className="bg-white hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-xs flex flex-col items-center text-center transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">Booking History</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Print & Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPayoutModal(true)}
                  className="bg-white hover:bg-emerald-50/50 p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs flex flex-col items-center text-center transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">Sunday Payout</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Automated UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCertificateModal(true)}
                  className="bg-white hover:bg-amber-50/50 p-4 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-xs flex flex-col items-center text-center transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">ID Certificate</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Official Partner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="bg-white hover:bg-indigo-50/50 p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs flex flex-col items-center text-center transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">Agent Account</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">Profile & UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSupportModal(true)}
                  className="bg-white hover:bg-purple-50/50 p-4 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs flex flex-col items-center text-center transition-all group active:scale-95"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900">Agent Help</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">24x7 Support</span>
                </button>
              </div>

              {/* 4 LIVE METRIC STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Total Bookings Done</span>
                    <Bus className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">{agent.totalBookingsCount}</div>
                  <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> +₹19.34 credited per seat
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Commission Rate</span>
                    <BadgePercent className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-3xl font-black text-red-600">₹19.34</div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
                    Fixed rate per confirmed booking
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Pending Sunday Payout</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-600">₹{agent.unpaidEarnings}</div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5 truncate">
                    Direct to {agent.upiId}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Next Payout Cycle</span>
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-black text-indigo-600 flex items-center gap-1.5">
                    Sunday 06:00 AM
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
                    Upcoming: {agent.nextPayoutDate}
                  </p>
                </div>
              </div>

              {/* EARNINGS FORECAST CALCULATOR */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" /> Weekly Sunday Earnings Calculator
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Forecast your weekly Sunday payout based on counter footfall
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Estimated Daily Bookings:</span>
                    <span className="text-sm font-black text-red-600">{calculatorTicketsPerDay} tickets/day</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={calculatorTicketsPerDay}
                    onChange={(e) => setCalculatorTicketsPerDay(parseInt(e.target.value, 10))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 tickets/day</span>
                    <span>25 tickets/day</span>
                    <span>50 tickets/day</span>
                    <span>100 tickets/day</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      Upcoming Sunday Payout Amount
                    </div>
                    <div className="text-3xl font-black text-emerald-700 mt-1">₹{weeklyCalculatedEarnings}</div>
                    <div className="text-[11px] text-emerald-600 mt-0.5">Deposited automatically every Sunday</div>
                  </div>

                  <div className="bg-slate-900 text-white p-4 rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Estimated Monthly Income
                    </div>
                    <div className="text-3xl font-black text-white mt-1">₹{monthlyCalculatedEarnings}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Calculated at flat ₹19.34 commission</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB CONTENT: 2. NEW BUS BOOKING (COUNTER SEARCH & 1-CLICK ROUTES)     */}
          {/* ===================================================================== */}
          {activeTab === 'booking' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Counter Ticket Booking Portal
                    </h2>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                      +₹19.34 Commission Auto-Tagged
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Book tickets for counter passengers across 3,500+ private & state bus operators in India.
                  </p>
                </div>

                <div className="text-xs text-slate-600 font-semibold bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 flex items-center gap-2 shrink-0">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Agent ID: <strong className="font-mono text-slate-900">{agent.agentId}</strong></span>
                </div>
              </div>

              {/* Embedded Hero SearchBox */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <SearchBox variant="hero" />
              </div>

              {/* Fast 1-Click Popular Counter Routes */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-600" /> Fast 1-Click Popular Counter Routes
                  </h3>
                  <span className="text-xs text-slate-400">Click to instantly populate and search</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { from: 'Delhi', to: 'Jaipur', fare: '₹499', buses: '140+ Daily Buses' },
                    { from: 'Mumbai', to: 'Pune', fare: '₹350', buses: '220+ Daily Buses' },
                    { from: 'Delhi', to: 'Manali', fare: '₹899', buses: '85+ Daily Buses' },
                    { from: 'Bangalore', to: 'Hyderabad', fare: '₹799', buses: '110+ Daily Buses' },
                    { from: 'Chennai', to: 'Coimbatore', fare: '₹550', buses: '95+ Daily Buses' },
                    { from: 'Ahmedabad', to: 'Udaipur', fare: '₹450', buses: '70+ Daily Buses' },
                  ].map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectRoute(r.from, r.to)}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50/40 text-left transition-all group flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-1">
                        <div className="font-black text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                          {r.from} → {r.to}
                        </div>
                        <div className="text-[11px] text-slate-400">{r.buses}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">Starts {r.fare}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">+₹19.34 Payout</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent Benefits at Counter */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> Instant Seat Hold
                  </div>
                  <p className="text-slate-500">
                    Lock seats instantly for 10 minutes while customer completes payment at your counter.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-blue-600" /> Printable E-Tickets with QR
                  </div>
                  <p className="text-slate-500">
                    Generate formatted PDF tickets with counter branding and passenger boarding barcode.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" /> Guaranteed Sunday Deposit
                  </div>
                  <p className="text-slate-500">
                    Flat ₹19.34 credited per seat directly to your UPI every Sunday without minimum limit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB CONTENT: 3. HISTORY (AGENT BOOKING HISTORY & COMMISSION LEDGER)   */}
          {/* ===================================================================== */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header & Filter Controls */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <History className="w-6 h-6 text-red-600" /> Agent Booking History & Commission Ledger
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      View all counter reservations, download printable tickets, and track Sunday commission payouts.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200">
                      Total Commission: ₹{(confirmedBookings.length * 19.34).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      placeholder="Search by PNR, passenger name, route, or phone..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setHistoryStatusFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        historyStatusFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({confirmedBookings.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryStatusFilter('confirmed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        historyStatusFilter === 'confirmed'
                          ? 'bg-white text-emerald-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Confirmed
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryStatusFilter('cancelled')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        historyStatusFilter === 'cancelled'
                          ? 'bg-white text-rose-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Cancelled
                    </button>
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              {filteredHistoryBookings.length > 0 ? (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">PNR</th>
                          <th className="py-3.5 px-4">Route & Date</th>
                          <th className="py-3.5 px-4">Operator</th>
                          <th className="py-3.5 px-4">Passengers / Seats</th>
                          <th className="py-3.5 px-4">Ticket Fare</th>
                          <th className="py-3.5 px-4">Commission</th>
                          <th className="py-3.5 px-4">Sunday Payout</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredHistoryBookings.map((b) => {
                          const isCancelled = b.status === 'cancelled';
                          return (
                            <tr key={b.pnr} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-slate-900">{b.pnr}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPnr(b.pnr)}
                                    title="Copy PNR"
                                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded"
                                  >
                                    {copiedPnr === b.pnr ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-bold text-slate-900">
                                  {b.bus.fromCity} → {b.bus.toCity}
                                </div>
                                <div className="text-[11px] text-slate-400">{b.journeyDate}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-slate-800 font-semibold truncate max-w-[130px]">
                                  {b.bus.operator.name}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                                  {b.bus.operator.busType}
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-black text-red-600">
                                  Seats: {b.selectedSeats.map((s) => s.number).join(', ')}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {b.passengers[0]?.name || 'Passenger'}
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-black text-slate-900">
                                ₹{b.totalAmount}
                              </td>

                              <td className="py-3.5 px-4">
                                {isCancelled ? (
                                  <span className="bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded text-[11px]">
                                    Refunded
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-0.5 rounded-md text-[11px]">
                                    +₹19.34
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4">
                                {isCancelled ? (
                                  <span className="text-[11px] text-slate-400">Cancelled</span>
                                ) : (
                                  <span className="bg-amber-50 text-amber-700 font-bold px-2.5 py-0.5 rounded-full text-[10px] border border-amber-200">
                                    Upcoming Sunday
                                  </span>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewTicket(b)}
                                    title="View & Print Ticket"
                                    className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>

                                  {!isCancelled && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to cancel ticket ${b.pnr}?`)) {
                                          cancelBooking(b.pnr);
                                        }
                                      }}
                                      title="Cancel Booking"
                                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors text-[10px] font-bold"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="md:hidden space-y-3">
                    {filteredHistoryBookings.map((b) => {
                      const isCancelled = b.status === 'cancelled';
                      return (
                        <div
                          key={b.pnr}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold">PNR NUMBER</div>
                              <div className="font-mono font-black text-slate-900">{b.pnr}</div>
                            </div>
                            <div>
                              {isCancelled ? (
                                <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Cancelled
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                                  +₹19.34 Commission
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-800">
                                {b.bus.fromCity} → {b.bus.toCity}
                              </div>
                              <div className="text-slate-500 text-[11px]">{b.bus.operator.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-slate-900">₹{b.totalAmount}</div>
                              <div className="text-red-600 font-bold text-[11px]">
                                Seats: {b.selectedSeats.map((s) => s.number).join(', ')}
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                            <span className="text-[11px] text-amber-700 font-bold">
                              Sunday Settlement: Active
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setPreviewTicket(b)}
                                className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                              >
                                <Printer className="w-3 h-3" /> Print
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center space-y-4 bg-white rounded-3xl border border-dashed border-slate-300">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Bus className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">No Booking Records Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {historySearchQuery
                        ? 'No bookings match your search query. Try searching with a different PNR or mobile number.'
                        : 'You haven\'t made any bookings yet. Book a bus for your counter customer and earn ₹19.34 instantly!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('booking')}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md transition-colors"
                  >
                    Start New Bus Booking
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB CONTENT: 4. ACCOUNT (AGENT PROFILE, BANKING & CERTIFICATE)        */}
          {/* ===================================================================== */}
          {activeTab === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-200 shrink-0">
                    {agent.fullName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {agent.agencyName}
                      </h2>
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> VERIFIED AGENT
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Agent ID: <span className="font-mono font-bold text-slate-900">{agent.agentId}</span> • Representative: <span className="font-bold text-slate-800">{agent.fullName}</span> • City: {agent.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCertificateModal(true)}
                    className="bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-xs px-4 py-3 rounded-xl border border-amber-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>View ID Certificate</span>
                  </button>

                  <button
                    type="button"
                    onClick={logoutAgent}
                    className="p-3 rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Logout Agent Session"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Account Details & Payout Settings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Agency Information */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-600" /> Registered Counter Details
                  </h3>

                  <div className="space-y-3 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400 font-semibold">Agency Name:</span>
                      <span className="font-bold text-slate-800">{agent.agencyName}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Agent Full Name:</span>
                      <span className="font-bold text-slate-800">{agent.fullName}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Agent ID:</span>
                      <span className="font-mono font-bold text-slate-900">{agent.agentId}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Registered Phone:</span>
                      <span className="font-bold text-slate-800">+91 {agent.phone}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Email Address:</span>
                      <span className="font-bold text-slate-800">{agent.email}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Operating City:</span>
                      <span className="font-bold text-slate-800">{agent.city}</span>
                    </div>
                  </div>
                </div>

                {/* Settlement & Banking Information */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" /> Sunday Payout & UPI Settings
                  </h3>

                  <div className="space-y-3 text-xs divide-y divide-slate-100">
                    <div className="flex justify-between pt-1 items-center">
                      <span className="text-slate-400 font-semibold">Linked UPI ID:</span>
                      <span className="font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {agent.upiId}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Payout Cycle:</span>
                      <span className="font-bold text-slate-800">Weekly Every Sunday (06:00 AM)</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Commission Rate:</span>
                      <span className="font-black text-red-600">₹19.34 Flat per booking</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Minimum Threshold:</span>
                      <span className="font-bold text-emerald-600">₹0 (No minimum limit)</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400 font-semibold">Upcoming Payout Date:</span>
                      <span className="font-extrabold text-indigo-600">{agent.nextPayoutDate}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingUpi(true)}
                      className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                    >
                      Update Payout UPI / Bank Account
                    </button>
                  </div>
                </div>
              </div>

              {/* Counter Support & Logout */}
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-900">Need Priority Counter Assistance?</h4>
                  <p className="text-xs text-slate-500">
                    Our dedicated agent desk is available 24 hours a day, 7 days a week.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSupportModal(true)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> 24x7 Helpline
                  </button>

                  <button
                    type="button"
                    onClick={logoutAgent}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* NICHE 4 OPTION (FIXED BOTTOM NAVIGATION BAR AS REQUESTED)             */}
          {/* ===================================================================== */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-3 sm:px-6">
            <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
              {/* Option 1: Dashboard */}
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'text-red-600 font-black'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-transform ${
                  activeTab === 'dashboard' ? 'bg-red-50 scale-110' : ''
                }`}>
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight truncate">1. Dashboard</span>
              </button>

              {/* Option 2: New Bus Booking */}
              <button
                type="button"
                onClick={() => setActiveTab('booking')}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeTab === 'booking'
                    ? 'text-red-600 font-black'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-transform ${
                  activeTab === 'booking' ? 'bg-red-50 scale-110' : ''
                }`}>
                  <Bus className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight truncate">2. New Booking</span>
              </button>

              {/* Option 3: History */}
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                  activeTab === 'history'
                    ? 'text-red-600 font-black'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-transform relative ${
                  activeTab === 'history' ? 'bg-red-50 scale-110' : ''
                }`}>
                  <History className="w-5 h-5" />
                  {confirmedBookings.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight truncate">3. History</span>
              </button>

              {/* Option 4: Account */}
              <button
                type="button"
                onClick={() => setActiveTab('account')}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                  activeTab === 'account'
                    ? 'text-red-600 font-black'
                    : 'text-slate-500 hover:text-slate-900 font-semibold'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-transform ${
                  activeTab === 'account' ? 'bg-red-50 scale-110' : ''
                }`}>
                  <UserCheck className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight truncate">4. Account</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        // =========================================================================
        // CASE 2: REGISTRATION VIEW (USER NOT LOGGED IN AS AGENT)                  
        // =========================================================================
        <div className="space-y-12">
          {/* Hero Banner for Prospective Agents */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/30 text-red-300 text-xs font-black uppercase tracking-wider border border-red-500/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Official Safar Go Agent Network
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Become a Safar Go Agent & Earn <span className="text-red-500">₹19.34</span> Per Booking
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Turn your travel agency, cyber cafe, or retail shop into an authorized Safar Go booking counter. Earn a guaranteed commission of <span className="text-white font-bold">₹19.34</span> on every bus booking with <span className="text-emerald-400 font-bold">automated weekly payouts directly every Sunday</span>!
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                  <Calendar className="w-4 h-4 text-amber-400" /> Weekly Payout Every Sunday
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Zero Security Deposit
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                  <CreditCard className="w-4 h-4 text-blue-400" /> Direct UPI / Bank Transfer
                </span>
              </div>
            </div>
          </div>

          {/* Already Registered Sign In Prompt */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900">Already Registered as a Safar Go Agent?</h3>
                <p className="text-xs text-slate-500">Log in with your registered mobile and password to open your Agent Dashboard.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentView('login')}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 shrink-0 flex items-center justify-center gap-1.5"
            >
              <span>LOGIN TO AGENT PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Registration Form & Benefits Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Register as a Safar Go Agent
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Zero onboarding fee • Instant submission • Weekly payout every Sunday
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Vikram Singh"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Agency / Shop Name
                    </label>
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      placeholder="e.g. Shree Ganesh Tour & Travels"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Mobile Phone (+91) *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="10-digit mobile number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      City / Town
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Delhi, Lucknow, Jaipur"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="agent@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Payout UPI ID or Bank A/C *
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okaxis or Bank Account"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:border-red-500"
                    />
                    <span className="text-[10px] text-slate-400">
                      Weekly payouts will be credited to this UPI/Account every Sunday
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 text-xs text-red-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                    Commission Rate: ₹19.34 fixed per confirmed bus booking
                  </p>
                  <p className="text-[11px] text-red-600">
                    Payout Cycle: Automated direct transfer every Sunday without minimum withdrawal threshold.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>SUBMIT AGENT REGISTRATION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleDemoAgentRegister}
                    className="text-xs text-red-600 font-bold hover:underline cursor-pointer"
                  >
                    ⚡ One-Click Instant Agent Demo Submission
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Calculator */}
            <div id="earnings-calculator" className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" /> Weekly Earnings Calculator
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Tickets Booked Per Day:</span>
                    <span className="text-sm font-black text-red-600">{calculatorTicketsPerDay} tickets/day</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    step="5"
                    value={calculatorTicketsPerDay}
                    onChange={(e) => setCalculatorTicketsPerDay(parseInt(e.target.value, 10))}
                    className="w-full accent-red-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 tickets</span>
                    <span>50 tickets</span>
                    <span>100 tickets</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">Every Sunday Payout</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">₹{weeklyCalculatedEarnings}</div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">Paid weekly</div>
                  </div>

                  <div className="bg-slate-900 text-white p-3.5 rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Monthly Income</div>
                    <div className="text-2xl font-black text-white mt-1">₹{monthlyCalculatedEarnings}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Pure profit</div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3 text-xs">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider">
                  Why 12,000+ Agents Choose Safar Go
                </h4>
                <ul className="space-y-2.5 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Guaranteed ₹19.34 per booking:</strong> Flat high commission with zero deductions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Weekly Sunday Payouts:</strong> Automated direct transfer to your UPI every Sunday morning.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>All Luxury Buses:</strong> Book Volvo, AC Sleeper, NueGo Electric, IntrCity across India.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: REGISTRATION SUBMISSION SUCCESS (REDIRECT TO LOGIN ONLY)         */}
      {/* ========================================================================= */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 border border-slate-200 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Animation Checkmark */}
            <div className="relative flex items-center justify-center pt-2">
              <div className="absolute w-28 h-28 rounded-full bg-emerald-500/15 pulse-ring-effect pointer-events-none" />
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" style={{ animationDuration: '2.5s' }} />

              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 relative z-10">
                <svg className="w-12 h-12" viewBox="0 0 52 52" fill="none">
                  <circle className="animate-checkmark-circle" cx="26" cy="26" r="24" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
                  <path className="animate-checkmark-check" d="M15 27L22 34L37 19" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5" /> Registration Submitted Successfully
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                Thank You for Showing Interest in Becoming a Safar Go Agent!
              </h2>
              <p className="text-xs text-slate-500">
                Application Reference No: <span className="font-mono font-bold text-slate-800">{registeredRefId || agent?.agentId}</span>
              </p>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 text-left space-y-1 shadow-xs">
              <div className="flex items-center gap-2 text-amber-800 font-extrabold text-sm">
                <Clock className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Your Account Will Be Activated Within 24 Hours</span>
              </div>
              <p className="text-xs text-amber-700/90 leading-relaxed pl-6">
                Our agent onboarding desk is validating your business details. Please log in using your registered mobile number and password to access the Agent Dashboard.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {/* As requested: User must log in to enter dashboard */}
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentView('login');
                }}
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>PROCEED TO AGENT LOGIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setCurrentView('home');
                }}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Back to Home Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OFFICIAL DIGITAL AGENT CERTIFICATE / ID CARD                     */}
      {/* ========================================================================= */}
      {showCertificateModal && agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 relative">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Official Certificate Design */}
            <div className="border-4 border-double border-red-600 p-6 rounded-2xl bg-gradient-to-b from-red-50/40 via-white to-amber-50/30 text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-black">
                  <Bus className="w-5 h-5 -scale-x-100" />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">
                  SAFAR<span className="text-red-600">GO</span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] font-black uppercase tracking-widest text-red-600">
                  OFFICIAL PARTNER CERTIFICATE
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  Authorized Bus Ticketing Partner
                </h3>
              </div>

              <div className="py-2 space-y-1">
                <p className="text-xs text-slate-500">This certifies that</p>
                <div className="text-lg font-black text-slate-900 underline decoration-red-500">
                  {agent.agencyName}
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  Represented by: {agent.fullName} ({agent.city})
                </p>
              </div>

              <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
                is an authorized agent of Safar Go Technologies Private Limited, entitled to issue confirmed tickets with priority seat locking and weekly Sunday commission settlement.
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-left text-[11px]">
                <div>
                  <div className="text-slate-400 font-bold uppercase text-[9px]">Agent ID</div>
                  <div className="font-mono font-black text-slate-900">{agent.agentId}</div>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-900 rounded-lg p-1.5 mx-auto text-white flex items-center justify-center">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">VERIFIED QR</span>
                </div>

                <div className="text-right">
                  <div className="text-slate-400 font-bold uppercase text-[9px]">Commission Rate</div>
                  <div className="font-black text-emerald-600">₹19.34 / Booking</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SUNDAY PAYOUT SETTLEMENT SCHEDULE                                */}
      {/* ========================================================================= */}
      {showPayoutModal && agent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-slate-200 relative text-left">
            <button
              onClick={() => setShowPayoutModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Weekly Sunday Payout Ledger</h3>
                <p className="text-xs text-slate-500">Automated UPI transfer every Sunday at 06:00 AM</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Linked Payout UPI:</span>
                <span className="font-mono font-bold text-slate-900">{agent.upiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Commission Rate:</span>
                <span className="font-bold text-emerald-600">₹19.34 per booking</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pending Sunday Amount:</span>
                <span className="text-base font-black text-slate-900">₹{agent.unpaidEarnings}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Upcoming Payout Date:</span>
                <span className="font-extrabold text-indigo-600">{agent.nextPayoutDate}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Zero minimum threshold! Even if you book 1 ticket, ₹19.34 is automatically credited every Sunday.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowPayoutModal(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: 24/7 AGENT HELPLINE SUPPORT                                      */}
      {/* ========================================================================= */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 relative text-left">
            <button
              onClick={() => setShowSupportModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">24x7 Agent Support Desk</h3>
                <p className="text-xs text-slate-500">Instant assistance for ticket bookings & payouts</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Toll-Free Agent Priority Helpline</div>
                <div className="text-base font-black text-red-600 font-mono">1800-SAFAR-AGENT</div>
                <p className="text-[11px] text-slate-500">Available 24 hours / 7 days a week</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Agent WhatsApp Support</div>
                <div className="text-sm font-black text-emerald-600 font-mono">+91 98765 43210</div>
                <p className="text-[11px] text-slate-500">Send PNR for instant cancellation and seat unlock</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">Sunday Payout Desk</div>
                <div className="text-sm font-semibold text-slate-700">payouts@safargo.in</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSupportModal(false)}
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: PRINTABLE TICKET PREVIEW MODAL                                   */}
      {/* ========================================================================= */}
      {previewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="relative max-w-3xl w-full my-8">
            <button
              onClick={() => setPreviewTicket(null)}
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-xl border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <TicketCard booking={previewTicket} />
          </div>
        </div>
      )}
    </div>
  );
};
