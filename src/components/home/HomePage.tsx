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
} from 'lucide-react';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { getWhatsAppTicketMessage } from '../../lib/whatsappService';
import { Booking } from '../../types';

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
    if (onOpenGoAuth) onOpenGoAuth('register');
    else onOpenAuth('register');
  };

  const handleLoginAgent = () => {
    if (onOpenGoAuth) onOpenGoAuth('login');
    else onOpenAuth('login');
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-xs">
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

              {/* Sample Bus Options for Route */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-400 block">
                  उपलब्ध बसें: {searchSource} ➔ {searchDestination} ({searchDate})
                </span>

                {[
                  { name: 'SafarGo Superfast Express (AC)', time: 'सुबह 07:30', fare: 450, seats: 14, type: '2x2 AC Seater' },
                  { name: 'Royal AC Sleeper Deluxe', time: 'दोपहर 01:15', fare: 650, seats: 8, type: 'AC Sleeper' },
                  { name: 'MP Tourism InterCity (2x2)', time: 'शाम 05:45', fare: 550, seats: 19, type: 'Fast Express' },
                ].map((bus, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">{bus.name}</strong>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                          {bus.seats} सीटें खाली
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        प्रस्थान: {bus.time} • प्रकार: {bus.type} • 5-मिनट अप्रूवल
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-lg font-black text-amber-400 font-mono">₹{bus.fare}</span>
                        <span className="text-[10px] text-slate-500 block">+₹20 एजेंट कमीशन</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleJoinAgent}
                        className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer"
                      >
                        सीट बुक करें ➔
                      </button>
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

    </div>
  );
};
