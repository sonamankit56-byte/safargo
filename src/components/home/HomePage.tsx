import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bus,
  ShieldCheck,
  Award,
  Clock,
  Gift,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Phone,
  Search,
  ExternalLink,
  Zap,
  Repeat,
  Wallet,
  MessageSquare,
  ChevronRight,
  FileText,
  Printer,
  Users,
  Wifi,
  BatteryCharging,
  Wind,
  Check,
  Send,
  X,
} from 'lucide-react';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { getWhatsAppTicketMessage } from '../../lib/whatsappService';
import { buildSubdomainUrl } from '../../lib/subdomain';
import { Booking } from '../../types';

import busHero from '../../assets/bus1.png';
import busFleet1 from '../../assets/bus2.png';
import busFleet2 from '../../assets/bus3.png';
import busFleet3 from '../../assets/bus5.png';
import busFleet4 from '../../assets/bus6.png';
import busBg from '../../assets/bg1.jpg';
import safargoLogoPng from '../../assets/logo.png';

interface HomePageProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
  onOpenGoAuth?: (mode?: 'login' | 'register') => void;
  onOpenPromoterApply?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAuth,
  onOpenGoAuth,
}) => {
  const { currentUser, role } = useAuth();
  const { bookings, busTrips } = useData();

  // Widget Mode: 'search' vs 'track_pnr'
  const [widgetTab, setWidgetTab] = useState<'search' | 'track_pnr'>('search');

  // Search Route State
  const [searchSource, setSearchSource] = useState('भोपाल');
  const [searchDestination, setSearchDestination] = useState('इंदौर');
  const [searchDate, setSearchDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // PNR Search State
  const [pnrInput, setPnrInput] = useState('');
  const [trackedBooking, setTrackedBooking] = useState<Booking | null>(null);
  const [pnrSearched, setPnrSearched] = useState(false);
  const [selectedPrintBooking, setSelectedPrintBooking] = useState<Booking | null>(null);

  // Quick Interactive Seat Map Preview Modal State
  const [previewSeatBus, setPreviewSeatBus] = useState<{
    name: string;
    time: string;
    fare: number;
    type: string;
    image: string;
  } | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([12]);
  const [deckTab, setDeckTab] = useState<'lower' | 'upper'>('lower');

  const handleSwapCities = () => {
    const temp = searchSource;
    setSearchSource(searchDestination);
    setSearchDestination(temp);
  };

  const handleTrackPnr = (e: React.FormEvent) => {
    e.preventDefault();
    setPnrSearched(true);
    const cleanPnr = pnrInput.trim().toLowerCase();
    if (!cleanPnr) {
      setTrackedBooking(null);
      return;
    }
    const found = (bookings || []).find((b) => {
      const pnr = (b.ticket_pnr || '').toLowerCase();
      const code = (b.booking_code || '').toLowerCase();
      const mobile = (b.customer_mobile || '').toLowerCase();
      return pnr.includes(cleanPnr) || code.includes(cleanPnr) || mobile.includes(cleanPnr);
    });
    setTrackedBooking(found || null);
  };

  const handleJoinAgent = () => {
    window.location.href = buildSubdomainUrl('login', { role: 'agent', mode: 'register' });
  };

  const handleLoginAgent = () => {
    window.location.href = buildSubdomainUrl('login', { role: 'agent', mode: 'login' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* ============================================================== */}
      {/* 1. HERO SECTION                                                */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-black shadow-inner animate-fadeIn">
            <Award className="w-4 h-4 text-amber-400" />
            <span>मध्य प्रदेश का सबसे बड़ा अधिकृत GO एजेंट बस टिकटिंग नेटवर्क</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            अपनी दुकान को बनाएं <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 bg-clip-text text-transparent">
              अधिकृत बस टिकटिंग केंद्र
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SafarGo GO Agent नेटवर्क से जुड़ें। प्रत्येक बस टिकट बुकिंग पर <strong>फ्लैट ₹20 नकद कमीशन</strong> और <strong>हर रविवार सीधे बैंक/UPI में साप्ताहिक पेआउट</strong> पाएं। शून्य निवेश, 5 मिनट में तुरंत एक्टिवेशन!
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleJoinAgent}
              className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>मुफ्त में GO एजेंट बनें (Join Now)</span>
            </button>

            <button
              type="button"
              onClick={handleLoginAgent}
              className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400/60 text-white font-black text-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>एजेंट लॉगिन (Agent Login)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>

            <a
              href="https://help.safargo.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>हेल्प सपोर्ट (help.safargo.in)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Value Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-3xl mx-auto text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-black block text-lg font-mono">₹20</span>
              <span className="text-slate-400 text-[11px]">फ्लैट कमीशन प्रति सीट</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-emerald-400 font-black block text-lg font-mono">हर रविवार</span>
              <span className="text-slate-400 text-[11px]">साप्ताहिक बैंक/UPI पेआउट</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-cyan-400 font-black block text-lg font-mono">5 मिनट</span>
              <span className="text-slate-400 text-[11px]">फास्ट ऑपरेटर अप्रूवल</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-orange-400 font-black block text-lg font-mono">24 घंटे</span>
              <span className="text-slate-400 text-[11px]">समाधान गारंटी डेस्क</span>
            </div>
          </div>

          {/* Dynamic Visual Bus Stage with Floating Benefit Badges */}
          <div className="relative pt-6 max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-orange-500/10 to-transparent blur-3xl rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group">
                <img
                  src={busHero}
                  alt="SafarGo High-Deck Luxury Coach"
                  className="w-full max-w-lg h-auto object-contain drop-shadow-[0_20px_45px_rgba(245,158,11,0.35)] transform hover:scale-105 transition-all duration-500"
                />
                {/* SafarGo Brand Watermark & Verified Bus Badge */}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-slate-950/90 border border-amber-400 px-3 py-1 rounded-2xl shadow-xl flex items-center gap-2 backdrop-blur-md">
                  <img src={safargoLogoPng} alt="SafarGo Logo" className="w-5 h-5 object-contain" />
                  <span className="text-xs font-black text-white">SafarGo</span>
                  <span className="text-[10px] font-black text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/40">
                    प्रमाणित बस ✓
                  </span>
                </div>
              </div>

              {/* Floating Benefit Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 -mt-3 sm:-mt-6 relative z-20">
                <div className="px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500 shadow-lg text-[11px] font-black text-emerald-300 flex items-center gap-1.5 backdrop-blur-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>🛡️ SafarGo Verified Bus ✓</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-slate-900/95 border border-amber-400 shadow-lg text-[11px] font-black text-amber-300 flex items-center gap-1.5 backdrop-blur-md">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎫 SafarGo Verified Ticket ✓</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-slate-900/95 border border-cyan-400/70 shadow-lg text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 backdrop-blur-md">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>हर रविवार सीधा बैंक/UPI पेआउट</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-black/90 border border-slate-700 shadow-lg text-[11px] font-bold text-white flex items-center gap-1.5 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>🛺 Uber ऑटो/कैब राइड सेवा</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. LIVE BUS SEARCH & PNR TRACKER WIDGET                       */}
      {/* ============================================================== */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="max-w-4xl mx-auto bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6">
          
          {/* Widget Tabs */}
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setWidgetTab('search')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                widgetTab === 'search'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>बस रूट व सीटें खोजें</span>
            </button>

            <button
              type="button"
              onClick={() => setWidgetTab('track_pnr')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                widgetTab === 'track_pnr'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>लाइव PNR स्टेटस चेक करें</span>
            </button>
          </div>

          {/* TAB A: BUS SEARCH */}
          {widgetTab === 'search' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
                
                {/* From City */}
                <div className="sm:col-span-4">
                  <label className="block text-slate-400 font-bold mb-1">कहाँ से (Source) *</label>
                  <select
                    value={searchSource}
                    onChange={(e) => setSearchSource(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-amber-400 outline-none"
                  >
                    {MP_NETWORK_CITIES.map((c) => (
                      <option key={`src-${c}`} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="sm:col-span-1 flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition"
                    title="बदलें"
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* To City */}
                <div className="sm:col-span-4">
                  <label className="block text-slate-400 font-bold mb-1">कहाँ तक (Destination) *</label>
                  <select
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-amber-400 outline-none"
                  >
                    {MP_NETWORK_CITIES.map((c) => (
                      <option key={`dest-${c}`} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 font-bold mb-1">तारीख (Date) *</label>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-xs focus:border-amber-400 outline-none"
                  />
                </div>
              </div>

              {/* Sample Bus Options for Route with Visual Thumbnails & Amenities */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-400 block">
                  उपलब्ध बसें: {searchSource} ➔ {searchDestination} ({searchDate})
                </span>

                {[
                  {
                    name: 'SafarGo Superfast Express (AC)',
                    time: 'सुबह 07:30',
                    fare: 450,
                    seats: 14,
                    type: '2x2 AC Pushback',
                    image: busHero,
                    amenities: ['AC', 'WiFi', 'Charging', 'Pushback'],
                  },
                  {
                    name: 'Royal AC Sleeper Deluxe (2+1)',
                    time: 'दोपहर 01:15',
                    fare: 650,
                    seats: 8,
                    type: 'Luxury AC Sleeper',
                    image: busFleet1,
                    amenities: ['AC', 'WiFi', 'Charging', 'Blanket', 'Water'],
                  },
                  {
                    name: 'MP Tourism InterCity Superfast',
                    time: 'शाम 05:45',
                    fare: 550,
                    seats: 19,
                    type: 'Multi-Axle AC Seater',
                    image: busFleet2,
                    amenities: ['AC', 'Charging', 'Pushback', 'GPS'],
                  },
                  {
                    name: 'Gramin Regional Connect Seater',
                    time: 'रात 09:00',
                    fare: 350,
                    seats: 22,
                    type: 'Fast Express Seater',
                    image: busFleet4,
                    amenities: ['Pushback', 'Luggage Space'],
                  },
                ].map((bus, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-24 h-16 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shrink-0 overflow-hidden group-hover:scale-105 transition-transform relative">
                        <img src={bus.image} alt={bus.name} className="w-full h-full object-contain" />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px] leading-none shadow">
                          SafarGo
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <strong className="text-white text-sm">{bus.name}</strong>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>SafarGo Verified Bus ✓</span>
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[10px] font-black border border-amber-400/40">
                            🎫 SafarGo Verified Ticket ✓
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 text-[10px] font-bold border border-slate-800">
                            {bus.seats} सीटें खाली
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          प्रस्थान: <span className="text-amber-300 font-bold">{bus.time}</span> • प्रकार: {bus.type} • 5-मिनट अप्रूवल
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          {bus.amenities.map((a, aIdx) => (
                            <span key={aIdx} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[9px] font-mono border border-slate-800">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                      <div className="text-left md:text-right">
                        <span className="text-xl font-black text-amber-400 font-mono">₹{bus.fare}</span>
                        <span className="text-[10px] text-emerald-400 font-bold block">+₹20 एजेंट कमीशन</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewSeatBus(bus)}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition cursor-pointer"
                        >
                          सीटें देखें
                        </button>
                        <button
                          type="button"
                          onClick={handleJoinAgent}
                          className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-md"
                        >
                          बुक करें ➔
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB B: PNR TRACKER */}
          {widgetTab === 'track_pnr' && (
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleTrackPnr} className="flex gap-2">
                <input
                  type="text"
                  value={pnrInput}
                  onChange={(e) => setPnrInput(e.target.value)}
                  placeholder="अपना 6-अंकीय PNR या बुकिंग कोड या मोबाइल नंबर दर्ज करें..."
                  className="flex-1 p-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-xs focus:border-amber-400 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  <span>खोजें</span>
                </button>
              </form>

              {pnrSearched && (
                <div>
                  {trackedBooking ? (
                    <div className="p-5 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 space-y-3 animate-fadeIn text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-sm font-mono">{trackedBooking.booking_code}</strong>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 font-bold text-[10px]">
                              PNR: {trackedBooking.ticket_pnr || 'CONFIRMED'} ✓
                            </span>
                          </div>
                          <p className="text-slate-300 font-bold mt-1">
                            {trackedBooking.from_city} ➔ {trackedBooking.to_city} • यात्रा: {trackedBooking.journey_date}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-white font-mono">
                            ₹{(trackedBooking.total_fare || trackedBooking.actual_fare || 450).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-bold">स्थिति: कन्फर्म</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-slate-400">
                        <div>यात्री: <strong className="text-white">{trackedBooking.customer_name}</strong></div>
                        <div>मोबाइल: <strong className="text-white font-mono">+91 {trackedBooking.customer_mobile}</strong></div>
                        <div>सीट: <strong className="text-emerald-400 font-mono">{trackedBooking.confirmed_seats || '1 Seat'}</strong></div>
                        <div>ऑपरेटर: <strong className="text-white">{trackedBooking.actual_operator || 'SafarGo Superfast'}</strong></div>
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const msg = getWhatsAppTicketMessage(trackedBooking);
                            window.open(`https://wa.me/91${trackedBooking.customer_mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp पर टिकट प्राप्त करें</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPrintBooking(trackedBooking)}
                          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रिंट टिकट</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <p className="text-sm font-bold text-rose-400">कोई टिकट नहीं मिली!</p>
                      <p className="text-xs text-slate-500">कृपया अपना PNR अथवा बुकिंग कोड सही से जांचें।</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ============================================================== */}
      {/* 2.5 LUXURY BUS FLEET SHOWCASE (आधुनिक व सुरक्षित बस बेड़ा)       */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/60 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
              PREMIUM FLEET PORTFOLIO
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              SafarGo का आधुनिक व सुरक्षित बस बेड़ा
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
              मध्य प्रदेश के सभी मुख्य हाईवे व ग्रामीण मार्गों पर चलने वाली अत्याधुनिक लग्जरी, स्लीपर एवं सुपरफास्ट बसें।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bus 1: Volvo 9600 AC Sleeper */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 group relative">
              <div className="h-32 rounded-2xl bg-slate-950/80 flex items-center justify-center p-2 overflow-hidden border border-slate-800/80 relative">
                <img
                  src={busFleet1}
                  alt="Volvo Multi-Axle Sleeper"
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-amber-400/50 text-[9px] font-black text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>SafarGo Verified Bus ✓</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                    2+1 Luxury Sleeper
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">₹650 से</span>
                </div>
                <h3 className="text-base font-black text-white">Volvo 9600 AC स्लीपर</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  व्यक्तिगत केबिन बर्थ, साइलेंट केबिन, मिनरल वॉटर एवं लाइव जीपीएस ट्रैकिंग।
                </p>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 pt-0.5">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>🎫 SafarGo Verified Ticket गारंटी</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">❄️ Dual AC</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">📶 Free WiFi</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">🔌 220V Socket</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus({
                  name: 'Volvo 9600 Multi-Axle AC Sleeper',
                  time: 'दोपहर 01:15',
                  fare: 650,
                  type: '2+1 Luxury Sleeper',
                  image: busFleet1,
                })}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                सीट लेआउट देखें
              </button>
            </div>

            {/* Bus 2: BharatBenz Superfast */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 group relative">
              <div className="h-32 rounded-2xl bg-slate-950/80 flex items-center justify-center p-2 overflow-hidden border border-slate-800/80 relative">
                <img
                  src={busHero}
                  alt="BharatBenz High-Deck Express"
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-amber-400/50 text-[9px] font-black text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>SafarGo Verified Bus ✓</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                    2+2 Semi-Sleeper
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">₹450 से</span>
                </div>
                <h3 className="text-base font-black text-white">BharatBenz हाई-डेक एक्सप्रेस</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  एर्गोनॉमिक पुशबैक सीटें, आपातकालीन सुरक्षा सेंसर व ऑन-टाइम गारंटी।
                </p>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 pt-0.5">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>🎫 SafarGo Verified Ticket गारंटी</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">💺 Pushback</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">❄️ Climate Control</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">📍 Live GPS</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus({
                  name: 'BharatBenz High-Deck Superfast (2x2 AC)',
                  time: 'सुबह 07:30',
                  fare: 450,
                  type: '2x2 AC Pushback',
                  image: busHero,
                })}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                सीट लेआउट देखें
              </button>
            </div>

            {/* Bus 3: Scania InterCity Express */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 group relative">
              <div className="h-32 rounded-2xl bg-slate-950/80 flex items-center justify-center p-2 overflow-hidden border border-slate-800/80 relative">
                <img
                  src={busFleet2}
                  alt="Scania InterCity Express"
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-amber-400/50 text-[9px] font-black text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>SafarGo Verified Bus ✓</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">
                    InterCity Superfast
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">₹550 से</span>
                </div>
                <h3 className="text-base font-black text-white">Scania इंटरसिटी डीलक्स</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  सुपरफास्ट हाईवे कनेक्टिविटी, रीडिंग लैंप, अतिरिक्त लेगरूम व CCTV।
                </p>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 pt-0.5">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>🎫 SafarGo Verified Ticket गारंटी</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">💡 Reading Light</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">🛡️ CCTV Secure</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">🔋 Fast USB</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus({
                  name: 'Scania InterCity Express Deluxe',
                  time: 'शाम 05:45',
                  fare: 550,
                  type: 'Multi-Axle InterCity',
                  image: busFleet2,
                })}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                सीट लेआउट देखें
              </button>
            </div>

            {/* Bus 4: Gramin Express Seater */}
            <div className="rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/60 p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 group relative">
              <div className="h-32 rounded-2xl bg-slate-950/80 flex items-center justify-center p-2 overflow-hidden border border-slate-800/80 relative">
                <img
                  src={busFleet4}
                  alt="Gramin Link Regional Fast Seater"
                  className="max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded-lg border border-amber-400/50 text-[9px] font-black text-amber-300 flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  <span>SafarGo Verified Bus ✓</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full">
                    Regional Connect
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">₹350 से</span>
                </div>
                <h3 className="text-base font-black text-white">ग्रामीण एक्सप्रेस सीटर</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  तहसील व ग्रामीण क्षेत्रों को सीधे जिला मुख्यालय से जोड़ने वाली सीधी सेवा।
                </p>
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 pt-0.5">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>🎫 SafarGo Verified Ticket गारंटी</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] text-slate-400 font-mono">
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">📦 Luggage Space</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">⏱️ On-Time</span>
                <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800">🎫 E-Ticket</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus({
                  name: 'Gramin Regional Connect Seater',
                  time: 'रात 09:00',
                  fare: 350,
                  type: 'Fast Regional Express',
                  image: busFleet4,
                })}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-300 font-bold text-xs transition cursor-pointer"
              >
                सीट लेआउट देखें
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. WHY BECOME A GO AGENT SECTION                               */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-900/30">
        <div className="max-w-5xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
              EXCLUSIVE AGENT BENEFITS
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              SafarGo GO Agent क्यों बनें?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              मध्य प्रदेश के ग्रामीण और शहरी सीएससी, ऑनलाइन कैफे एवं किराना दुकानदारों का सबसे भरोसेमंद साथी।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">फ्लैट ₹20 कमीशन</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                प्रत्येक कन्फर्म टिकट पर बिना किसी न्यूनतम लक्ष्य के सीधे ₹20 आपके Go Wallet में तुरंत जमा होते हैं।
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-400/50 transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-black">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">हर रविवार साप्ताहिक पेआउट</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                कोई लंबा इंतजार नहीं! हर रविवार आपकी समस्त कमाई सीधे आपके बैंक खाते या UPI में बिना किसी शुल्क के ट्रांसफर की जाती है।
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center font-black">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">5-मिनट फास्ट अप्रूवल</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                ग्राहक को खड़ा नहीं रखना पड़ेगा। औसतन 5 मिनट में ऑपरेटर PNR कन्फर्मेशन और लाइव व्हाट्सएप टिकट शेयरिंग।
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-400/50 transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-400/20 text-indigo-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">24 घंटे में समाधान गारंटी</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                डेडिकेटेड सपोर्ट पोर्टल (help.safargo.in) द्वारा किसी भी ऑपरेटर या टिकट समस्या का 24 घंटे के अंदर 100% समाधान।
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-rose-400/50 transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-400/20 text-rose-400 flex items-center justify-center font-black">
                <Gift className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">रेफर & अर्न ₹100</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                अन्य मित्रों व दुकानदारों को GO Agent बनाएं। प्रत्येक 5 सफल बुकिंग पर ₹100 का नकद बोनस सीधे वॉलेट में पाएं।
              </p>
            </div>

            {/* Card 6: Uber First-Mile & Last-Mile Cab/Auto Assist */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-black border border-slate-700 text-white flex items-center justify-center font-black">
                Uber
              </div>
              <h3 className="text-lg font-black text-white">🛺 Uber ऑटो व कैब असिस्ट</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                फर्स्ट-माइल व लास्ट-माइल कनेक्टिविटी! यात्री के घर से बस स्टैंड एवं गंतव्य स्टेशन से घर/होटल तक 1-क्लिक में Uber ऑटो/कैब की सुविधा।
              </p>
            </div>

          </div>

          {/* CTA Banner */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-2 border-amber-400 text-center space-y-4">
            <h3 className="text-2xl font-black text-white">
              आज ही अपने गांव या शहर के अधिकृत GO एजेंट बनें!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
              हजारों संतुष्ट एजेंट पहले से ही SafarGo के साथ हर महीने अतिरिक्त आमदनी कमा रहे हैं।
            </p>
            <button
              type="button"
              onClick={handleJoinAgent}
              className="py-3 px-8 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer shadow-lg"
            >
              रजिस्ट्रेशन प्रारंभ करें ➔
            </button>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. FOOTER                                                      */}
      {/* ============================================================== */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-900 text-xs text-slate-500 bg-slate-950">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <SafarGoLogo size="sm" variant="light" showTagline={false} />
            <span className="text-slate-400">
              © {new Date().getFullYear()} SafarGo GO Agent Network. सर्वाधिकार सुरक्षित।
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-bold">
            <button type="button" onClick={handleLoginAgent} className="hover:text-amber-400 transition cursor-pointer">
              एजेंट लॉगिन
            </button>
            <a href="https://help.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
              सहायता केंद्र
            </a>
            <a href="https://admin.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
              एडमिन कंसोल
            </a>
          </div>
        </div>
      </footer>

      {/* Print Ticket Modal */}
      {selectedPrintBooking && (
        <PrintTicketModal
          booking={selectedPrintBooking}
          onClose={() => setSelectedPrintBooking(null)}
        />
      )}

      {/* Quick Interactive Seat Map Preview Modal */}
      {previewSeatBus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400 rounded-3xl shadow-2xl p-6 space-y-5 animate-scaleUp text-xs max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-9 bg-slate-950 rounded-lg p-0.5 border border-slate-800 flex items-center justify-center shrink-0">
                  <img src={previewSeatBus.image} alt={previewSeatBus.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">{previewSeatBus.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-black border border-emerald-500/40">
                      SafarGo Verified Bus ✓
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 text-[9px] font-black border border-amber-400/40">
                      🎫 Verified Ticket ✓
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{previewSeatBus.type} • प्रस्थान: {previewSeatBus.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Deck Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setDeckTab('lower')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  deckTab === 'lower' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                लोअर डेक (Lower)
              </button>
              <button
                type="button"
                onClick={() => setDeckTab('upper')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  deckTab === 'upper' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                अपर डेक (Upper)
              </button>
            </div>

            {/* Interactive 2x2 / 2x1 Seat Grid */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                <span>केबिन फ्रंट (Driver 💺)</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" /> खाली
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-400" /> चुनी हुई
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-700 opacity-40" /> बुक
                  </span>
                </div>
              </div>

              {/* Seat Matrix */}
              <div className="grid grid-cols-4 gap-2 py-2 max-w-xs mx-auto">
                {(deckTab === 'lower'
                  ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
                  : [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32]
                ).map((seatNum) => {
                  const isSelected = selectedSeats.includes(seatNum);
                  const isBooked = [3, 7, 14, 22].includes(seatNum);
                  return (
                    <button
                      key={seatNum}
                      type="button"
                      disabled={isBooked}
                      onClick={() => {
                        if (isSelected) setSelectedSeats(selectedSeats.filter((s) => s !== seatNum));
                        else setSelectedSeats([...selectedSeats, seatNum]);
                      }}
                      className={`h-10 rounded-xl font-mono text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                        isBooked
                          ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-400 text-slate-950 font-black shadow-lg scale-105 border-2 border-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">चुनी गई सीटें:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'कोई नहीं'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">कुल किराया:</span>
                <span className="text-base font-black text-white font-mono">
                  ₹{(previewSeatBus.fare * Math.max(1, selectedSeats.length)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-400 block font-bold">+₹20 कमीशन</span>
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setPreviewSeatBus(null);
                  handleJoinAgent();
                }}
                className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg text-center"
              >
                GO एजेंट के माध्यम से कन्फर्म बुक करें ➔
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
