import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  Bus,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Gift,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  Phone,
  MessageSquare,
  ChevronDown,
  Quote,
  Star,
  Building,
  Heart,
  HelpCircle,
  Search,
  ExternalLink,
  Printer,
  AlertTriangle,
  Instagram,
  Youtube
} from 'lucide-react';
import { Booking, PromotionPlatform } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { PromotionClaimModal } from '../promotions/PromotionClaimModal';

interface HomePageProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuth, onNavigateTab }) => {
  const { currentUser, role } = useAuth();
  const { settings, busTrips, bookings } = useData();

  // Widget Mode: Routes vs PNR Tracker
  const [widgetTab, setWidgetTab] = useState<'routes' | 'track_pnr'>('routes');

  // Search routes state
  const [searchSource, setSearchSource] = useState('Lucknow');
  const [searchDestination, setSearchDestination] = useState('Delhi');
  const [searchDate, setSearchDate] = useState('2026-10-12');
  const [filteredTrips, setFilteredTrips] = useState(busTrips);

  // PNR / Ticket Tracker state
  const [pnrSearchInput, setPnrSearchInput] = useState('');
  const [trackedBooking, setTrackedBooking] = useState<Booking | null | 'not_found'>(null);
  const [printModalBooking, setPrintModalBooking] = useState<Booking | null>(null);

  // FAQ open/close accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Viral Creator Promotion Claim Modal State
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [claimModalPlatform, setClaimModalPlatform] = useState<PromotionPlatform>('instagram');

  const handleOpenClaimModal = (p: PromotionPlatform) => {
    setClaimModalPlatform(p);
    setIsClaimModalOpen(true);
  };

  const handleSearchRoutes = (e: React.FormEvent) => {
    e.preventDefault();
    const results = busTrips.filter((trip) => {
      const matchSource = trip.source.toLowerCase().includes(searchSource.toLowerCase().trim());
      const matchDest = trip.destination.toLowerCase().includes(searchDestination.toLowerCase().trim());
      return matchSource && matchDest;
    });
    setFilteredTrips(results.length > 0 ? results : busTrips);
  };

  const handleSelectQuickRoute = (src: string, dest: string) => {
    setSearchSource(src);
    setSearchDestination(dest);
    const results = busTrips.filter((t) =>
      t.source.toLowerCase().includes(src.toLowerCase()) &&
      t.destination.toLowerCase().includes(dest.toLowerCase())
    );
    setFilteredTrips(results.length > 0 ? results : busTrips);
  };

  const handleTrackBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const query = pnrSearchInput.trim().toLowerCase();
    if (!query) return;
    const cleanDigits = query.replace(/\D/g, '');
    const found = bookings.find(
      (b) =>
        b.booking_code.toLowerCase() === query ||
        (b.ticket_pnr && b.ticket_pnr.toLowerCase() === query) ||
        (cleanDigits.length >= 10 && b.customer_mobile.includes(cleanDigits))
    );
    setTrackedBooking(found || 'not_found');
  };

  const faqList = [
    {
      q: 'सफ़ारगो एजेंट बनने के लिए क्या कोई रजिस्ट्रेशन फीस या चार्ज लगता है?',
      a: 'नहीं, सफ़ारगो पर एजेंट रजिस्ट्रेशन 100% फ्री (मुफ्त) है। कोई भी सीएससी (CSC), जन सेवा केंद्र, ऑनलाइन कैफे या मोबाइल दुकानदार केवल 1 मिनट में निःशुल्क पंजीकरण कर सकता है।'
    },
    {
      q: 'टिकट बुकिंग से पहले ऑनलाइन पेमेंट कैसे करनी होती है? क्या वॉलेट का भी विकल्प है?',
      a: 'हाँ, सफ़ारगो के नियम के अनुसार बुकिंग से पहले अग्रिम ऑनलाइन पेमेंट अनिवार्य है। आपके पास 2 आसान विकल्प हैं: 1. सफ़ारगो के ऑफिशियल QR कोड या UPI ID (safargo.booking@icici) पर ग्राहक/दुकानदार से सीधे भुगतान कराएं, 12-अंकों का UTR व स्क्रीनशॉट दर्ज करें तथा 15 मिनट विंडो में WhatsApp पर भेजें। 2. एजेंट प्रीपेड वॉलेट - एजेंट अपने वॉलेट में न्यूनतम ₹2,000 या अधिक राशि ऐड कर सकते हैं। एडमिन अनुमोदन के बाद राशि वॉलेट में जमा होगी और बुकिंग का किराया सीधे वॉलेट से कट जाएगा।'
    },
    {
      q: '15 मिनट के टाइमर में WhatsApp पर एक्टिव रहना क्यों जरूरी है?',
      a: 'सफ़ारगो एक 100% सुरक्षित मैनुअल बुकिंग मॉडल है। जब आप ग्राहक की बुकिंग सबमिट करते हैं, तो हमारी बैकएंड टीम तुरंत बस ऑपरेटर से सीधे फोन/सिस्टम पर बात करती है। ऑपरेटर की उपलब्धता की पुष्टि SafarGo टीम आपके WhatsApp पर ही मांगती और भेजती है। इसलिए 15 मिनट तक WhatsApp एक्टिव रहना अनिवार्य है।'
    },
    {
      q: 'कमीशन और वेतन का भुगतान (Payout) किस दिन मिलता है?',
      a: 'सफ़ारगो का भुगतान चक्र हर रविवार (Every Sunday) को होता है। सभी कन्फर्म बुकिंग्स का कमीशन और 150 बुकिंग का लक्ष्य पूरा करने वाले एजेंटों का ₹5,000 का फिक्स्ड मानदेय हर रविवार को सीधे बैंक खाते या UPI में स्थानांतरित कर दिया जाता है।'
    },
    {
      q: 'प्रति टिकट ₹19.34 कमीशन कैसे और कब मिलता है?',
      a: 'जैसे ही एडमिन द्वारा बस ऑपरेटर से सीट कन्फर्म करके वास्तविक PNR जारी किया जाता है, ₹19.34 कमीशन उसी क्षण ऑटोमैटिक आपके एजेंट लेज़र में क्रेडिट हो जाता है। कोई देरी नहीं!'
    },
    {
      q: 'महीने का ₹5,000 फिक्स्ड मानदेय कैसे प्राप्त होता है?',
      a: 'जब आप एक कैलेंडर माह में 150 पात्र कन्फर्म बस बुकिंग्स पूरी कर लेते हैं और बीच में विथड्रॉल नहीं करते हैं, तो आपको आगामी रविवार को पूरा ₹5,000 का एकमुश्त वेतन प्रदान किया जाता है। आंशिक निकासी होने पर शेष राशि रविवार को ट्रांसफर की जाती है।'
    },
    {
      q: 'रेफर एंड अर्न में ₹50 और 5 बुकिंग्स का क्या नियम है?',
      a: 'आप अपने यूनिक रेफरल कोड से जितने चाहें साथी सीएससी एजेंटों को जोड़ सकते हैं। जब आपका रेफर्ड मित्र अपनी पहली 5 कन्फर्म बुकिंग्स पूरी कर लेता है, तो आपके कमीशन खाते में सीधे ₹50 का नकद बोनस क्रेडिट हो जाता है।'
    },
    {
      q: 'क्या यहाँ कोई फर्जी टिकट या डमी PNR जारी हो सकता है?',
      a: 'सख़्त मनाही है! सफ़ारगो केवल वास्तविक प्राइवेट व स्टेट बस ऑपरेटर्स के अधिकृत PNR, कंफर्म सीट नंबर और बस डिटेल्स ही एडमिन वेरिफिकेशन के बाद रिकॉर्ड करता है। ग्राहक की यात्रा 100% सुरक्षित रहती है।'
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24">
      
      {/* ======================================================== */}
      {/* 1. HERO SECTION                                          */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white pt-12 pb-20 lg:pt-20 lg:pb-28">
        
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-[350px] h-[350px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* 3D Animated SafarGo Emblem Logo */}
            <div className="flex justify-center pt-2">
              <SafarGoLogo size="xl" variant="light" />
            </div>

            {/* National Mission Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-orange-400">
                🇮🇳 ग्रामीण भारत का नंबर 1 बस बुकिंग एवं आजीविका मंच
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs text-slate-300 font-medium">CSC & Jan Seva Kendra Network</span>
            </div>

            {/* Main Punchy Hindi Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              गाँव के युवाओं और CSC केंद्रों को मिला <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                पक्का और सम्मानजनक रोजगार
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
              <strong>"अब हर सफर होगा आसान"</strong> — बिना किसी बड़े निवेश के अपने जन सेवा केंद्र या दुकान से स्लीपर व सीटर बस टिकट बुक करें। 
              प्रत्येक टिकट पर <span className="text-emerald-400 font-bold">₹19.34 कमीशन</span>, 150 बुकिंग पर <span className="text-amber-300 font-bold">₹5,000 मासिक मानदेय</span> और <span className="text-orange-400 font-bold">₹50 रेफरल बोनस</span>!
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {currentUser ? (
                <button
                  onClick={() => onNavigateTab(role === 'admin' ? 'admin-dashboard' : 'dashboard')}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                >
                  <span>मेरा डैशबोर्ड खोलें (Open Dashboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                  >
                    <span>मुफ़्त एजेंट बनें (Join as Agent)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAuth('login')}
                    className="px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm sm:text-base rounded-2xl border border-slate-700 transition"
                  >
                    एजेंट लॉगिन (Sign In)
                  </button>
                </>
              )}

              <a
                href={`https://wa.me/${settings.support_whatsapp}?text=${encodeURIComponent('नमस्ते SafarGo टीम, मुझे एजेंट बनने की जानकारी चाहिए।')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg transition flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp हेल्पलाइन</span>
              </a>
            </div>

            {/* Key Trust Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs text-left max-w-5xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">15-Min Timer</span>
                  <span className="text-[10px] text-slate-400">फास्ट रिस्पॉन्स</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">₹19.34 कमीशन</span>
                  <span className="text-[10px] text-slate-400">हर कन्फर्म टिकट</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">रविवार पेआउट</span>
                  <span className="text-[10px] text-slate-400">साप्ताहिक भुगतान</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">₹5,000 मानदेय</span>
                  <span className="text-[10px] text-slate-400">150 बुकिंग लक्ष्य</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">प्रीपेड वॉलेट</span>
                  <span className="text-[10px] text-slate-400">Min ₹2,000 टॉप-अप</span>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white block">₹50 रेफरल</span>
                  <span className="text-[10px] text-slate-400">5 बुकिंग पूरी पर</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. LIVE ROUTE SEARCH & FARE CHECKER WIDGET               */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-16 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                Interactive Bus Route Finder
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 mt-1">
                लोकप्रिय ग्रामीण रूट एवं अनुमानित बस किराया चेक करें
              </h2>
            </div>
            
            <p className="text-xs text-slate-500 max-w-xs">
              गाँव के यात्रियों के लिए दिल्ली, लखनऊ, जयपुर, वाराणसी, पटना आदि रूटों की बस सीटें खोजें
            </p>
          </div>

          {/* Widget Sub-Tabs: Route Finder vs PNR Status */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200 self-start text-xs font-bold">
            <button
              type="button"
              onClick={() => setWidgetTab('routes')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                widgetTab === 'routes'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              1. बस रूट व किराया खोजें
            </button>
            <button
              type="button"
              onClick={() => setWidgetTab('track_pnr')}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
                widgetTab === 'track_pnr'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              2. यात्री PNR / टिकट स्टेटस चेक करें
            </button>
          </div>

          {widgetTab === 'routes' ? (
            <>
              {/* Quick Route Pills */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2">
                  त्वरित लोकप्रिय मार्ग (Quick Select Corridors):
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Lucknow', 'Delhi')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition"
                  >
                    लखनऊ ➔ दिल्ली (₹650+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Varanasi', 'Jaipur')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition"
                  >
                    वाराणसी ➔ जयपुर (₹850+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Gorakhpur', 'Lucknow')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition"
                  >
                    गोरखपुर ➔ लखनऊ (₹450+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Patna', 'Delhi')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition"
                  >
                    पटना ➔ दिल्ली (₹900+)
                  </button>
                </div>
              </div>

              {/* Search Inputs Form */}
              <form onSubmit={handleSearchRoutes} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">कहाँ से (From City)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={searchSource}
                      onChange={(e) => setSearchSource(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="उदा. Lucknow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">कहाँ तक (To Destination)</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                      placeholder="उदा. Delhi"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">यात्रा तारीख (Journey Date)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 text-sm"
                  >
                    <Search className="w-4 h-4" />
                    बसें खोजें
                  </button>
                </div>
              </form>

              {/* Results Cards Grid */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-slate-500">
                  उपलब्ध बसें ({filteredTrips.length}) — <span className="text-orange-600">मैन्युअल ऑपरेटर स्टॉक</span>:
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-orange-400 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                            <Bus className="w-4 h-4 text-orange-500" />
                            {trip.operator_name}
                          </span>
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            उपलब्ध (Live)
                          </span>
                        </div>

                        <div className="text-xs text-slate-600">
                          <strong>{trip.source}</strong> ➔ <strong>{trip.destination}</strong>
                        </div>

                        <div className="text-[11px] text-slate-500 flex items-center gap-3">
                          <span>प्रस्थान: <strong className="text-slate-800">{trip.departure_time}</strong></span>
                          <span>पहुंच: <strong className="text-slate-800">{trip.arrival_time}</strong></span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-mono">
                          {trip.bus_type}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">अनुमानित किराया</span>
                          <span className="text-base font-black text-slate-900">
                            ₹{trip.seater_fare} <span className="text-xs font-normal text-slate-500">/ ₹{trip.sleeper_fare}</span>
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (currentUser) {
                              onNavigateTab('new-booking');
                            } else {
                              onOpenAuth('login');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition flex items-center gap-1 shadow-sm"
                        >
                          <span>टिकट बुक करें</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ======================================================== */
            /* PNR & TICKET STATUS CHECKER VIEW                         */
            /* ======================================================== */
            <div className="space-y-6">
              <form onSubmit={handleTrackBooking} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={pnrSearchInput}
                    onChange={(e) => setPnrSearchInput(e.target.value)}
                    placeholder="बुकिंग आईडी (उदा. SFG-20261010-001) या यात्री मोबाइल नंबर दर्ज करें..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl shadow-md transition shrink-0"
                >
                  स्टेटस खोजें (Track Status)
                </button>
              </form>

              {/* Track Result Display */}
              {trackedBooking === 'not_found' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    इस बुकिंग आईडी या मोबाइल नंबर से कोई टिकट नहीं मिली। कृपया आईडी दोबारा चेक करें या बुकिंग एजेंट से संपर्क करें।
                  </span>
                </div>
              )}

              {trackedBooking && trackedBooking !== 'not_found' && (
                <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                          {trackedBooking.booking_code}
                        </span>
                        <StatusBadge status={trackedBooking.status} size="sm" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1">
                        {trackedBooking.customer_name} ({trackedBooking.passenger_count} यात्री)
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">कुल किराया</span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{trackedBooking.actual_fare || trackedBooking.total_estimated_amount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">मार्ग (Route)</span>
                      <span className="font-bold text-slate-800">{trackedBooking.from_city} ➔ {trackedBooking.to_city}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">यात्रा तारीख</span>
                      <span className="font-bold text-slate-800">{trackedBooking.journey_date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">बस ऑपरेटर</span>
                      <span className="font-bold text-slate-800">{trackedBooking.actual_operator || trackedBooking.operator_preference}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">सीटें</span>
                      <span className="font-bold text-emerald-700">{trackedBooking.confirmed_seats || 'प्रतीक्षाधीन'}</span>
                    </div>
                  </div>

                  {/* Confirmed Details & Actions */}
                  {trackedBooking.status === 'confirmed' ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-emerald-900">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>टिकट कन्फर्म है!</strong> PNR: <strong className="font-mono">{trackedBooking.ticket_pnr}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPrintModalBooking(trackedBooking)}
                          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          ई-टिकट पर्ची प्रिंट करें
                        </button>
                      </div>
                    </div>
                  ) : trackedBooking.status === 'booking_request' || trackedBooking.status === 'awaiting_operator_confirmation' ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        टिकट वर्तमान में बस ऑपरेटर सत्यापन में है। 15-मिनट विंडो में SafarGo टीम द्वारा पुष्टि की जा रही है।
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2.5 VIRAL CREATOR & REELS PROMOTION SECTION (नकद रिवॉर्ड) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-purple-800/50 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-8">
            
            {/* Header Badge & Title */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 text-xs font-black uppercase tracking-wider text-pink-300">
                <Sparkles className="w-4 h-4 text-pink-400" />
                <span>🚀 SafarGo वायरल क्रिएटर व प्रमोशन धमाका</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">24 घंटे में पेमेंट</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                सोशल मीडिया पर वीडियो बनाएं, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-pink-400 via-purple-300 to-amber-300 bg-clip-text text-transparent">
                  व्यूज लाएं और पाएं सीधा नकद बोनस!
                </span>
              </h2>

              <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
                Instagram Reel पर 1 Million Views पर <strong className="text-pink-300">₹{settings.promo_instagram_reward || 500}</strong> और YouTube Video पर 10,000 Views पर <strong className="text-red-300">₹{settings.promo_youtube_reward || 100}</strong>! 
                जेनुइन और यूनिक व्यूज होने पर क्लेम सबमिट करें — 24 घंटे में गारंटीड वेरिफिकेशन और आपके वॉलेट/बैंक में भुगतान!
              </p>
            </div>

            {/* Two Main Promotion Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Instagram Card */}
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-pink-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-pink-400 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-pink-500/25">
                      <Instagram className="w-7 h-7" />
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase tracking-wider border border-pink-500/30">
                        1 Million Views Target
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                        ₹{settings.promo_instagram_reward || 500} <span className="text-xs font-bold text-pink-400">नकद बोनस</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      📸 Instagram Reel वायरल रिवॉर्ड
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      SafarGo बस बुकिंग सेवा या ऐप पर एक रियल व आकर्षक Reel पोस्ट करें। जब आपकी Reel पर <strong>10 लाख (1 Million) वास्तविक व यूनिक व्यूज</strong> आ जाएं, तो लिंक सबमिट करें।
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>टारगेट: 10,00,000 (1M) Genuine & Unique Views</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>SLA गारंटी: सबमिट के 24 घंटे में वेरिफिकेशन व पेमेंट</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenClaimModal('instagram')}
                  className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Gift className="w-4 h-4" />
                  <span>Instagram क्लेम सबमिट करें (₹{settings.promo_instagram_reward || 500})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* YouTube Card */}
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-red-500/30 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6 hover:border-red-400 transition-all group">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
                      <Youtube className="w-7 h-7" />
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black uppercase tracking-wider border border-red-500/30">
                        10,000 Views Target
                      </span>
                      <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                        ₹{settings.promo_youtube_reward || 100} <span className="text-xs font-bold text-red-400">नकद बोनस</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-white">
                      ▶️ YouTube Video / Shorts रिवॉर्ड
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      SafarGo बस बुकिंग कैसे करें या अपनी यात्रा अनुभव पर YouTube Video या Short बनाएं। <strong>10,000 (10K) वास्तविक व्यूज</strong> पूरे होने पर तुरंत लिंक सबमिट करें।
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>टारगेट: 10,00,0 (10K) Genuine Views (Video/Shorts)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400 shrink-0" />
                      <span>SLA गारंटी: सबमिट के 24 घंटे में वेरिफिकेशन व पेमेंट</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenClaimModal('youtube')}
                  className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98"
                >
                  <Gift className="w-4 h-4" />
                  <span>YouTube क्लेम सबमिट करें (₹{settings.promo_youtube_reward || 100})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. AGENT INSPIRATION STORIES IN HINDI (सफलता की कहानियाँ) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            सच्ची सफलता की कहानियाँ (Real Stories of Village Agents)
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            "SafarGo ने बदल दी हमारे गाँव और केंद्र की किस्मत"
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            जानिए कैसे उत्तर प्रदेश, बिहार और मध्य प्रदेश के साधारण जन सेवा केंद्र संचालकों ने SafarGo से जुड़कर सम्मानजनक अतिरिक्त आजीविका बनाई।
          </p>
        </div>

        {/* Testimonial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Story 1: Pawan Kumar Verma */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-orange-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                    PK
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">पवन कुमार वर्मा</h3>
                    <p className="text-xs text-slate-500">किसान जन सेवा केंद्र, सीतापुर (उत्तर प्रदेश)</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="relative">
                <Quote className="w-8 h-8 text-orange-200/60 absolute -top-3 -left-2 -z-0" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic relative z-10 pl-3">
                  "मेरी दुकान पर पहले केवल 2 रुपये वाली फोटोकॉपी और खतौनी का काम होता था। महीने में बमुश्किल ₹6,000 बचते थे। जब से SafarGo से जुड़ा हूँ, गाँव के मजदूर, छात्र और व्यापारी भाई जो दिल्ली, लखनऊ और सूरत जाते हैं, उनकी बस टिकट मेरी ही दुकान से बुक होती है। 
                  15 मिनट में WhatsApp पर टिकट कन्फर्म हो जाती है। पिछले महीने मैंने 182 बुकिंग पूरी करके ₹3,519 कमीशन और साथ में <strong>₹5,000 का फिक्स्ड मानदेय</strong> भी पाया! आज पूरे गाँव में मेरा सम्मान है।"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">मासिक कुल कमाई:</span>
              <span className="text-xs font-black px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                ₹8,519+ (कमीशन + मानदेय)
              </span>
            </div>
          </div>

          {/* Story 2: Sunita Devi */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-orange-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                    SD
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">सुनीता देवी</h3>
                    <p className="text-xs text-slate-500">डिजिटल नारी सेवा पॉइंट, दरभंगा (बिहार)</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="relative">
                <Quote className="w-8 h-8 text-rose-200/60 absolute -top-3 -left-2 -z-0" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic relative z-10 pl-3">
                  "हमारे इलाके में महिलाओं और परिवारों को बस टिकट के लिए 25 किलोमीटर दूर जिला बस स्टैंड जाना पड़ता था। SafarGo पर मैं सीधे अपनी दुकान से ग्राहक की पसंद (महिला स्लीपर सीट, AC/Non-AC) चुनकर रिक्वेस्ट डालती हूँ। 
                  15 मिनट में ऑपरेटर से कन्फर्मेशन आ जाता है। आज मैं अपने परिवार की मुख्य सहारा हूँ और गाँव की पहली आत्मनिर्भर महिला बस एजेंट बनी हूँ!"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">मासिक अतिरिक्त आय:</span>
              <span className="text-xs font-black px-3 py-1 bg-rose-50 text-rose-700 rounded-full border border-rose-200">
                ₹7,200+ प्रति माह
              </span>
            </div>
          </div>

          {/* Story 3: Rahul Vishwakarma */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-orange-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                    RV
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">राहुल विश्वकर्मा</h3>
                    <p className="text-xs text-slate-500">विश्वकर्मा ऑनलाइन हब, रीवा (मध्य प्रदेश)</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="relative">
                <Quote className="w-8 h-8 text-indigo-200/60 absolute -top-3 -left-2 -z-0" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic relative z-10 pl-3">
                  "त्यौहारों (दीवाली, छठ, होली) के समय जब ट्रेनों में 200-200 वेटिंग होती है, तब SafarGo हमारे गाँव के लिए वरदान बन जाता है। यहाँ कोई फेक टिकट नहीं होती, एडमिन सीधे ऑपरेटर से असली PNR और सीट नंबर लेकर 15 मिनट में देता है। 
                  मैंने 8 साथी सीएससी भाइयों को भी रेफर किया और 5 बुकिंग पूरी होने पर <strong>₹400 का अतिरिक्त रेफरल बोनस</strong> भी कमाया!"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">त्यौहार सीजन कमाई:</span>
              <span className="text-xs font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                ₹9,800+ (कमीशन + रेफरल)
              </span>
            </div>
          </div>

          {/* Story 4: Mohd. Imran Khan */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6 hover:shadow-lg hover:border-orange-300 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                    IK
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">मो. इमरान खान</h3>
                    <p className="text-xs text-slate-500">इमरान टेलीकॉम एवं साइबर पॉइंट, मुरादाबाद (यूपी)</p>
                  </div>
                </div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
              </div>

              <div className="relative">
                <Quote className="w-8 h-8 text-emerald-200/60 absolute -top-3 -left-2 -z-0" />
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic relative z-10 pl-3">
                  "सफ़ारगो का सबसे बढ़िया नियम है 15 मिनट का WhatsApp अलर्ट। कोई महंगा सॉफ्टवेयर या API खरीदने की जरूरत नहीं, बस कस्टमर की डिटेल डालो और व्हाट्सएप पर टीम सीट कन्फर्म कर देती है। 
                  समय पर ₹19.34 प्रति टिकट सीधे खाते में आ जाता है। कभी कोई फ्रॉड या कैंसलेशन का घाटा नहीं हुआ।"
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">औसत मासिक आय:</span>
              <span className="text-xs font-black px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                ₹6,400+ प्रति माह
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 4. FOUR PILLARS OF AGENT INCOME (कमाई के 4 मजबूत आधार)    */}
      {/* ======================================================== */}
      <section className="bg-slate-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest">
              Guaranteed Agent Economics
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
              सफ़ारगो एजेंट बनने पर कमाई के 4 मजबूत आधार
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              पारदर्शी डेटाबेस लेज़र और स्वतः कमीशन गणना, शून्य छिपे हुए शुल्क
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl">
                  ₹
                </div>
                <h3 className="text-lg font-black text-white">₹19.34 प्रति टिकट</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  प्रत्येक पात्र कन्फर्म बस टिकट पर ₹19.34 सुरक्षित कमीशन सीधे लेज़र में जुड़ता है। डुप्लीकेट अवार्ड की कोई गुंजाइश नहीं।
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                ✓ तत्काल लेज़र क्रेडिट
              </span>
            </div>

            {/* Pillar 2 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">₹5,000 मासिक मानदेय</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  कैलेंडर माह में 150 कन्फर्म बुकिंग्स का लक्ष्य पूरा करने पर स्वतंत्र रूप से ₹5,000 का फिक्स्ड वेतन प्राप्त करें।
                </p>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                ✓ 150 बुकिंग्स पर
              </span>
            </div>

            {/* Pillar 3 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">₹50 रेफरल बोनस</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  मित्र एजेंट को आमंत्रित करें। उनके 5 अनिवार्य बुकिंग्स पूरी होते ही आपके खाते में ₹50 सीधे क्रेडिट होंगे।
                </p>
              </div>
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                ✓ 5 बुकिंग्स अनिवार्य शर्त
              </span>
            </div>

            {/* Pillar 4 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-white">100% नो रिस्क मॉडल</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  कोई महंगा बस API नहीं खरीदना। एडमिन टीम सीधे बस ऑपरेटर से सीट कन्फर्म कराती है और असली PNR देती है।
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                ✓ 0% फ्रॉड या रिस्क
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW IT WORKS (4 आसान चरणों में काम कैसे करें)          */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black text-orange-600 uppercase tracking-wider">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            सफ़ारगो पर बस टिकट बुक करना बेहद आसान है
          </h2>
          <p className="text-xs text-slate-500">
            कस्टमर की पसंद से लेकर टिकट जारी होने तक की पारदर्शी प्रक्रिया
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">मुफ्त पंजीकरण (Free Sign Up)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              आधार व दुकान का नाम डालकर फॉर्म भरें। एडमिन टीम आपके केंद्र का सत्यापन करके अकाउंट एक्टिवेट करेगी।
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">कस्टमर की पसंद दर्ज करें</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              स्रोत, गंतव्य, यात्रा तारीख, सीट श्रेणी (सीटर/स्लीपर, AC/Non-AC) चुनकर टिकट रिक्वेस्ट सबमिट करें।
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">15 मिनट WhatsApp एक्टिव रहें</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              सफ़ारगो टीम तुरंत बस ऑपरेटर से सीट चेक करती है। WhatsApp पर आपसे कन्फर्मेशन लेकर असली PNR जारी करती है।
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">कमीशन व मानदेय प्राप्त करें</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              कन्फर्मेशन पर ₹19.34 कमीशन लेज़र में क्रेडिट। 150 बुकिंग पूरी होने पर ₹5,000 फिक्स्ड मानदेय प्राप्त करें!
            </p>
          </div>

        </div>

      </section>

      {/* ======================================================== */}
      {/* 6. HINDI FAQ ACCORDION                                   */}
      {/* ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5 text-orange-500" />
            अक्सर पूछे जाने वाले सवाल (FAQ)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            आपके मन में सवाल? यहाँ हैं स्पष्ट उत्तर
          </h2>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm hover:text-orange-600 transition"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-orange-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </section>

      {/* ======================================================== */}
      {/* 7. HIGH CONVERSION BOTTOM CTA BANNER                     */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-orange-100">
              100% Free Agent Onboarding
            </span>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              आज ही अपने जन सेवा केंद्र को अधिकृत बस बुकिंग सेंटर बनाएं!
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 font-medium">
              गाँव के यात्रियों को सुरक्षित सफर दें और हर महीने ₹15,000+ तक की सम्मानजनक आय अर्जित करें।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            {currentUser ? (
              <button
                onClick={() => onNavigateTab('new-booking')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>नई टिकट बुक करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <span>फ्री में एजेंट बनें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl border border-white/30 transition"
                >
                  लॉगिन करें
                </button>
              </>
            )}
          </div>

        </div>
      </section>

      {/* Passenger Printable E-Ticket Slip Modal */}
      {printModalBooking && (
        <PrintTicketModal
          booking={printModalBooking}
          onClose={() => setPrintModalBooking(null)}
        />
      )}

      {/* Viral Creator & Social Media Promotion Claim Modal */}
      <PromotionClaimModal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        defaultPlatform={claimModalPlatform}
      />

    </div>
  );
};
