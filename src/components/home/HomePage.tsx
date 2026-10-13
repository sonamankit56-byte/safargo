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
  Youtube,
  Bike,
  Store,
  Package,
  Repeat,
  Zap,
  Wifi,
  Coffee
} from 'lucide-react';
import { Booking, PromotionPlatform, BusTrip } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { PromotionClaimModal } from '../promotions/PromotionClaimModal';
import { PromoterTrackStatusWidget } from '../promoter/PromoterTrackStatusWidget';
import { ComingSoonModal } from '../common/ComingSoonModal';
import { getFeatureMode } from '../../lib/featureFlags';
import { RedBusSeatMapModal, SelectedSeatItem } from '../bus/RedBusSeatMapModal';
import { AutoBusBookingCheckoutModal } from '../bus/AutoBusBookingCheckoutModal';
import { GrandLaunchBanner } from '../common/GrandLaunchBanner';
import { SeatCategory } from '../../types';
import { MP_NETWORK_CITIES } from '../../lib/mockData';

interface HomePageProps {
  onOpenAuth: (initialTab?: 'login' | 'register' | 'promoter_login') => void;
  onNavigateTab: (tab: string) => void;
  onOpenPromoterApply?: () => void;
  onOpenGoAuth?: (mode?: 'login' | 'register') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAuth, onNavigateTab, onOpenPromoterApply, onOpenGoAuth }) => {
  const { currentUser, role } = useAuth();
  const { settings, busTrips, bookings } = useData();

  const [comingSoonModal, setComingSoonModal] = useState<{
    isOpen: boolean;
    name: string;
    desc?: string;
  }>({ isOpen: false, name: '' });

  const prmMode = getFeatureMode(settings, 'feature_promoter_program_mode');
  const qdMode = getFeatureMode(settings, 'feature_quick_delivery_mode');
  const viralMode = getFeatureMode(settings, 'feature_creator_rewards_mode');
  const busMode = getFeatureMode(settings, 'feature_bus_booking_mode');
  const trackMode = getFeatureMode(settings, 'feature_live_tracking_mode');

  // Widget Mode: Routes vs PNR Tracker
  const [widgetTab, setWidgetTab] = useState<'routes' | 'track_pnr'>('routes');

  // Search routes state
  const [searchSource, setSearchSource] = useState('Bhopal');
  const [searchDestination, setSearchDestination] = useState('Indore');
  const [searchDate, setSearchDate] = useState('2026-10-12');
  const [filteredTrips, setFilteredTrips] = useState(busTrips);

  // RedBus Inspired Bus Seat Selection & Filter States
  const [selectedTripForSeatMap, setSelectedTripForSeatMap] = useState<BusTrip | null>(null);
  const [busFilterType, setBusFilterType] = useState<'all' | 'ac' | 'seater' | 'sleeper'>('all');
  const [autoCheckoutData, setAutoCheckoutData] = useState<{
    trip: BusTrip;
    selectedSeats: SelectedSeatItem[];
    totalFare: number;
    seatCategory: SeatCategory;
    boardingPoint: string;
    dropPoint: string;
  } | null>(null);

  const handleSwapCities = () => {
    const temp = searchSource;
    setSearchSource(searchDestination);
    setSearchDestination(temp);
  };

  const handleSetDateToday = () => {
    setSearchDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSearchDate(d.toISOString().split('T')[0]);
  };

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
      {/* 🚀 15 OCTOBER GRAND LAUNCH COUNTDOWN HERO BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <GrandLaunchBanner
          onOpenRegister={() => onOpenAuth('register')}
          onOpenLogin={() => onOpenAuth('login')}
        />
      </div>
      
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
            <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-md max-w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-xs font-bold text-orange-400 text-center">
                🇮🇳 मध्य प्रदेश (MP) का नंबर 1 बस बुकिंग एवं CSC आजीविका मंच
              </span>
              <span className="hidden sm:inline text-slate-500">|</span>
              <span className="hidden sm:inline text-xs text-slate-300 font-medium">Bhopal • Indore • Vidisha • Guna Network</span>
            </div>

            {/* Main Punchy Hindi Headline */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] sm:leading-[1.15]">
              गाँव के युवाओं और CSC केंद्रों को मिला <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                पक्का और सम्मानजनक रोजगार
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal px-2">
              <strong>"अब हर सफर होगा आसान"</strong> — भोपाल, इंदौर, गुना, अशोक नगर, चंदेरी, सिरोंज, कुरवाई, लटेरी, विदिशा, बीना, शिवपुरी, रतलाम, खंडवा, ललितपुर, झांसी, आगरा, इटावा, जयपुर व पुणे के लिए अधिकृत बस बुकिंग नेटवर्क। प्रत्येक टिकट पर <span className="text-emerald-400 font-bold">₹19.34 कमीशन</span>, 150 बुकिंग पर <span className="text-amber-300 font-bold">₹5,000 मासिक मानदेय</span> और <span className="text-orange-400 font-bold">₹50 रेफरल बोनस</span>!
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
              {currentUser ? (
                <button
                  onClick={() => onNavigateTab(role === 'admin' ? 'admin-dashboard' : 'dashboard')}
                  className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>मेरा डैशबोर्ड खोलें (Open Dashboard)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onOpenAuth('register')}
                    className="w-full sm:w-auto px-8 py-3.5 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>मुफ़्त एजेंट बनें (Join as Agent)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAuth('login')}
                    className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm sm:text-base rounded-2xl border border-slate-700 transition flex items-center justify-center cursor-pointer"
                  >
                    एजेंट लॉगिन (Sign In)
                  </button>
                </>
              )}

              <a
                href={`https://wa.me/${settings.support_whatsapp}?text=${encodeURIComponent('नमस्ते SafarGo टीम, मुझे एजेंट बनने की जानकारी चाहिए।')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 sm:py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp हेल्पलाइन</span>
              </a>
            </div>

            {/* Key Trust Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-xs text-left max-w-5xl mx-auto">
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 min-w-0 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">15-Min Timer</span>
                  <span className="text-[10px] text-slate-400 block truncate">फास्ट रिस्पॉन्स</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 min-w-0 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">₹19.34 कमीशन</span>
                  <span className="text-[10px] text-slate-400 block truncate">हर कन्फर्म टिकट</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 min-w-0 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">रविवार पेआउट</span>
                  <span className="text-[10px] text-slate-400 block truncate">साप्ताहिक भुगतान</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 min-w-0 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">₹5,000 मानदेय</span>
                  <span className="text-[10px] text-slate-400 block truncate">150 बुकिंग लक्ष्य</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 min-w-0 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">प्रीपेड वॉलेट</span>
                  <span className="text-[10px] text-slate-400 block truncate">Min ₹2,000 टॉप-अप</span>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center gap-2 min-w-0 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-white block truncate">₹50 रेफरल</span>
                  <span className="text-[10px] text-slate-400 block truncate">5 बुकिंग पूरी पर</span>
                </div>
              </div>
            </div>

            {/* 👑 ULTRA 3D GO SPECIAL AGENT FEATURE BANNER */}
            <div className="pt-8 max-w-4xl mx-auto">
              <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                  <Go3DUltraLogo size="lg" showBadge={false} />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 inline-block">
                      ⚡ नया GO स्पेशल एजेंट
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      प्रत्येक बुकिंग पर <span className="text-amber-400">फ्लैट ₹20 नकद कमीशन</span>!
                    </h3>
                    <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                      असली Gmail वेरिफिकेशन, 3D एडवांस्ड डैशबोर्ड, 1-क्लिक रिफंड प्रबंधन एवं Go Wallet सुरक्षा। कोई कचरा नहीं — केवल अधिकृत GO स्पेशल एजेंट।
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        if (onOpenGoAuth) onOpenGoAuth('register');
                        else onOpenAuth('register');
                      } else {
                        onNavigateTab('go-agent');
                      }
                    }}
                    className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 hover:from-amber-300 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    🚀 नया GO रजिस्ट्रेशन ➔
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        if (onOpenGoAuth) onOpenGoAuth('login');
                        else onOpenAuth('login');
                      } else {
                        onNavigateTab('go-agent');
                      }
                    }}
                    className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition cursor-pointer"
                  >
                    ⚡ GO एजेंट लॉगिन
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. LIVE ROUTE SEARCH & FARE CHECKER WIDGET               */}
      {/* ======================================================== */}
      {(busMode !== 'hidden' || trackMode !== 'hidden') && (
        <section id="bus-search-tool" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-16 relative z-20">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-8 space-y-5 sm:space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 inline-block">
                  Interactive Bus Route Finder
                </span>
                <h2 className="text-base sm:text-2xl font-black text-slate-900 mt-1">
                  लोकप्रिय ग्रामीण रूट एवं अनुमानित बस किराया चेक करें
                </h2>
              </div>
              
              <p className="text-xs text-slate-500 max-w-xs">
                मध्य प्रदेश व कनेक्टेड रूट: इंदौर, भोपाल, पुणे, जयपुर, सिरोंज, गुना, अशोक नगर, चंदेरी, झांसी आदि की बस सीटें खोजें
              </p>
            </div>

            {/* Widget Sub-Tabs: Route Finder vs PNR Status */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/90 w-full sm:w-auto text-xs font-bold">
              {busMode !== 'hidden' && (
                <button
                  type="button"
                  onClick={() => {
                    if (busMode === 'coming_soon') {
                      setComingSoonModal({
                        isOpen: true,
                        name: 'बस रूट व किराया खोज (Bus Booking)',
                        desc: 'विस्तृत बस रूट, समय सारिणी और सीट उपलब्धता सेवा जल्द ही शुरू की जा रही है।'
                      });
                    } else {
                      setWidgetTab('routes');
                    }
                  }}
                  className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    widgetTab === 'routes'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>1. बस रूट व किराया खोजें</span>
                  {busMode === 'coming_soon' && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full shrink-0">जल्द आ रहा है</span>
                  )}
                </button>
              )}
              {trackMode !== 'hidden' && (
                <button
                  type="button"
                  onClick={() => {
                    if (trackMode === 'coming_soon') {
                      setComingSoonModal({
                        isOpen: true,
                        name: 'यात्री PNR / लाइव ट्रैकिंग (Live Tracking)',
                        desc: 'लाइव बस लोकेशन और PNR ट्रैकिंग सिस्टम बहुत जल्द शुरू हो रहा है।'
                      });
                    } else {
                      setWidgetTab('track_pnr');
                    }
                  }}
                  className={`w-full sm:w-auto justify-center px-4 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer ${
                    widgetTab === 'track_pnr'
                      ? 'bg-white text-orange-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>2. यात्री PNR / टिकट स्टेटस चेक करें</span>
                  {trackMode === 'coming_soon' && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full shrink-0">जल्द आ रहा है</span>
                  )}
                </button>
              )}
            </div>

          {widgetTab === 'routes' ? (
            <>
              {/* Quick Route Pills */}
              <div>
                <span className="text-xs font-bold text-slate-600 block mb-2">
                  मध्य प्रदेश एवं कनेक्टेड मुख्य मार्ग (MP Top Corridors):
                </span>
                <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap pb-1.5 text-xs no-scrollbar">
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Bhopal', 'Indore')}
                    className="px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/80 hover:bg-orange-100 font-bold text-orange-950 transition whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
                  >
                    भोपाल ➔ इंदौर (₹350+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Indore', 'Pune')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    इंदौर ➔ पुणे (₹850+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Bhopal', 'Jaipur')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    भोपाल ➔ जयपुर (₹750+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Sironj', 'Bhopal')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    सिरोंज ➔ भोपाल (₹220+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Guna', 'Bhopal')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    गुना ➔ भोपाल (₹320+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Ashok Nagar', 'Bhopal')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    अशोक नगर ➔ भोपाल (₹340+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Chanderi', 'Jhansi')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    चंदेरी ➔ झांसी (₹180+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Kurwai', 'Bina')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    कुरवाई ➔ बीना (₹90+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Lateri', 'Bhopal')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    लटेरी ➔ भोपाल (₹250+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Shivpuri', 'Agra')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    शिवपुरी ➔ आगरा (₹450+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Ratlam', 'Indore')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    रतलाम ➔ इंदौर (₹250+)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectQuickRoute('Khandwa', 'Pune')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50 hover:border-orange-300 font-semibold text-slate-800 transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    खंडवा ➔ पुणे (₹750+)
                  </button>
                </div>
              </div>

              {/* Datalist for MP Cities Auto-suggest */}
              <datalist id="mp-home-cities">
                {MP_NETWORK_CITIES.map((city) => (
                  <option key={city} value={city} />
                ))}
              </datalist>

              {/* RedBus-Inspired Search Inputs Form */}
              <form onSubmit={handleSearchRoutes} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  {/* From City */}
                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1">कहाँ से (From City) *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        list="mp-home-cities"
                        value={searchSource}
                        onChange={(e) => setSearchSource(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                        placeholder="उदा. Bhopal / Sironj / Guna"
                      />
                    </div>
                  </div>

                  {/* Swap Button (RedBus style) */}
                  <div className="sm:col-span-1 flex items-center justify-center my-0.5 sm:my-0 sm:pb-1">
                    <button
                      type="button"
                      onClick={handleSwapCities}
                      className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-slate-200 transition cursor-pointer shadow-2xs active:rotate-180"
                      title="रूट आपस में बदलें (Swap Cities)"
                    >
                      <Repeat className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="sm:hidden font-bold text-xs">रूट बदलें (Swap)</span>
                    </button>
                  </div>

                  {/* To Destination */}
                  <div className="sm:col-span-4">
                    <label className="block font-bold text-slate-700 mb-1">कहाँ तक (To Destination) *</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="text"
                        required
                        list="mp-home-cities"
                        value={searchDestination}
                        onChange={(e) => setSearchDestination(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                        placeholder="उदा. Indore / Pune / Jaipur"
                      />
                    </div>
                  </div>

                  {/* Date & Quick Date Buttons */}
                  <div className="sm:col-span-3">
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">यात्रा तारीख *</label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={handleSetDateToday}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 font-bold text-slate-600 cursor-pointer"
                        >
                          आज
                        </button>
                        <button
                          type="button"
                          onClick={handleSetDateTomorrow}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-red-50 hover:text-red-600 font-bold text-slate-600 cursor-pointer"
                        >
                          कल
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none focus:ring-2 focus:ring-red-500 text-sm bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                  {/* RedBus Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-slate-500 text-[11px] font-bold shrink-0 mr-1">फ़िल्टर:</span>
                    <button
                      type="button"
                      onClick={() => setBusFilterType('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                        busFilterType === 'all'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      सभी बसें
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusFilterType('ac')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        busFilterType === 'ac'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>❄️ A/C बसें</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusFilterType('seater')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        busFilterType === 'seater'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>💺 सीटर (बैठने वाले)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBusFilterType('sleeper')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                        busFilterType === 'sleeper'
                          ? 'bg-red-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>🛏️ स्लीपर (सोने वाले)</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl shadow-md shadow-red-600/25 transition flex items-center justify-center gap-2 text-xs shrink-0 cursor-pointer active:scale-95"
                  >
                    <Search className="w-4 h-4" />
                    <span>बसें खोजें (Search Buses)</span>
                  </button>
                </div>
              </form>

              {/* Results Cards Grid */}
              <div className="space-y-3 pt-2">
                {/* 🚌 SafarGo Premium Live Booking Notice */}
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <strong className="text-slate-900 block font-black text-sm">
                          सफ़ारगो प्रीमियम बस टिकटिंग नेटवर्क (SafarGo Premium Bus Booking)
                        </strong>
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                          💰 ₹19 प्रति बुकिंग एजेंट कमीशन • 🛡️ 100% सुरक्षित
                        </span>
                      </div>
                      <span className="text-slate-600 text-[11px]">
                        सफ़ारगो लाइव सीट मैप (Lower व Upper Deck), सोने वाली (Sleeper) बर्थ, सीटर कुर्सियां, महिला सुरक्षा सीट एवं तत्काल PNR जारी!
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (currentUser && role === 'customer') {
                        onNavigateTab('customer-portal');
                      } else {
                        onOpenAuth('login');
                      }
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-xs shrink-0 flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>नजदीकी एजेंट से संपर्क करें</span>
                  </button>
                </div>

                {/* State RTC Partners Strip (AbhiBus Style) */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between overflow-x-auto gap-2 text-[10px] font-bold text-slate-600 no-scrollbar">
                  <span className="text-slate-400 shrink-0">पार्टनर फ्लीट:</span>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 shrink-0">🏛️ MPSRTC (मध्य प्रदेश)</span>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 shrink-0">🏛️ UPSRTC</span>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 shrink-0">🏛️ RSRTC</span>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 shrink-0">🚌 Chartered Bus</span>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 shrink-0">🚌 Hans Travels</span>
                  <span className="px-2 py-1 bg-white rounded-lg border border-slate-200 shrink-0">⚡ NueGo Electric</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-500">
                    उपलब्ध बसें ({filteredTrips.filter(t => {
                      if (busFilterType === 'ac') return t.bus_type.toLowerCase().includes('ac') || t.bus_type.toLowerCase().includes('a/c');
                      if (busFilterType === 'seater') return t.available_seater > 0;
                      if (busFilterType === 'sleeper') return t.available_sleeper > 0;
                      return true;
                    }).length}) — <span className="text-orange-600 font-extrabold">सफ़ारगो प्रीमियम लाइव इन्वेंट्री</span>:
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    सीट मैप देखने के लिए "सीटें चुनें" पर क्लिक करें
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTrips
                    .filter((t) => {
                      if (busFilterType === 'ac') return t.bus_type.toLowerCase().includes('ac') || t.bus_type.toLowerCase().includes('a/c');
                      if (busFilterType === 'seater') return t.available_seater > 0;
                      if (busFilterType === 'sleeper') return t.available_sleeper > 0;
                      return true;
                    })
                    .map((trip) => (
                    <div
                      key={trip.id}
                      className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-red-400 hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-black text-slate-900 text-base flex items-center gap-1.5 group-hover:text-red-600 transition">
                              <Bus className="w-4 h-4 text-red-600" />
                              {trip.operator_name}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              {trip.bus_type}
                            </span>
                          </div>
                          <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                            ⭐ 4.6
                          </span>
                        </div>

                        {/* Route & Times */}
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">प्रस्थान</span>
                            <span className="font-black text-slate-900 text-sm">{trip.departure_time}</span>
                            <span className="text-[11px] text-slate-600 block truncate max-w-[100px]">{trip.source}</span>
                          </div>

                          <div className="text-center px-2">
                            <span className="text-[9px] text-slate-400 font-mono block">➔</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                              एक्सप्रेस
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">पहुंच</span>
                            <span className="font-black text-slate-900 text-sm">{trip.arrival_time}</span>
                            <span className="text-[11px] text-slate-600 block truncate max-w-[100px]">{trip.destination}</span>
                          </div>
                        </div>

                        {/* Amenities Chips */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 flex-wrap">
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Zap className="w-3 h-3 text-amber-500" /> Live GPS
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Coffee className="w-3 h-3 text-emerald-600" /> पानी बोतल
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Wifi className="w-3 h-3 text-indigo-500" /> वाई-फाई
                          </span>
                        </div>

                        {/* Seater & Sleeper Badges & Fares */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200">
                            <span className="text-[10px] font-bold text-orange-800 flex items-center gap-1">
                              💺 बैठने वाली (Seater)
                            </span>
                            <div className="font-black text-slate-900 text-sm mt-0.5">
                              ₹{trip.seater_fare}
                            </div>
                            <span className="text-[9px] text-emerald-700 font-semibold">
                              {trip.available_seater} सीटें उपलब्ध
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200">
                            <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1">
                              🛏️ सोने वाली (Sleeper)
                            </span>
                            <div className="font-black text-slate-900 text-sm mt-0.5">
                              ₹{trip.sleeper_fare}
                            </div>
                            <span className="text-[9px] text-emerald-700 font-semibold">
                              {trip.available_sleeper} स्लीपर उपलब्ध
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive Seat Map CTA */}
                      <button
                        type="button"
                        onClick={() => setSelectedTripForSeatMap(trip)}
                        className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm cursor-pointer active:scale-95 group-hover:bg-red-600"
                      >
                        <Bus className="w-4 h-4" />
                        <span>सीटें चुनें (Select Seats ▾)</span>
                      </button>
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-bold text-sm outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl shadow-md transition shrink-0 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Search className="w-4 h-4" />
                  <span>स्टेटस खोजें (Track Status)</span>
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
                <div className="p-4 sm:p-6 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200">
                          {trackedBooking.booking_code}
                        </span>
                        <StatusBadge status={trackedBooking.status} size="sm" />
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mt-1">
                        {trackedBooking.customer_name} ({trackedBooking.passenger_count} यात्री)
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">कुल किराया</span>
                      <span className="text-xl font-black text-slate-900">
                        ₹{trackedBooking.actual_fare || trackedBooking.total_estimated_amount}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="min-w-0">
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">मार्ग (Route)</span>
                      <span className="font-bold text-slate-800 break-words">{trackedBooking.from_city} ➔ {trackedBooking.to_city}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">यात्रा तारीख</span>
                      <span className="font-bold text-slate-800 truncate block">{trackedBooking.journey_date}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">बस ऑपरेटर</span>
                      <span className="font-bold text-slate-800 break-words">{trackedBooking.actual_operator || trackedBooking.operator_preference}</span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-slate-400 block font-semibold text-[10px] uppercase">सीटें</span>
                      <span className="font-bold text-emerald-700 break-words">{trackedBooking.confirmed_seats || 'प्रतीक्षाधीन'}</span>
                    </div>
                  </div>

                  {/* Confirmed Details & Actions */}
                  {trackedBooking.status === 'confirmed' ? (
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>ई-टिकट पर्ची प्रिंट करें</span>
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
      )}

      {/* ======================================================== */}
      {/* 2.4 SAFARGO PROMOTER PARTNER & 15-MINUTE QUICK DELIVERY  */}
      {/* ======================================================== */}
      {(prmMode !== 'hidden' || qdMode !== 'hidden') && (
        <section id="agent-partner-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Card 1: Promoter Partner Program (Only 5 Candidates, ₹15,000/Month, 100% Refund) */}
            {prmMode !== 'hidden' && (
              <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-8 text-white border border-indigo-800/40 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                      <Award className="w-3.5 h-3.5" />
                      केवल 5 पद (5 Slots Only)
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
                      फिक्स्ड वेतन: ₹15,000 / माह
                    </span>
                    {prmMode === 'coming_soon' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 animate-pulse">
                        ⏳ जल्द आ रहा है (Under Launch)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        100% फीस रिफंड (₹648 वापस)
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    सफ़ारगो प्रमोटर पार्टनर प्रोग्राम
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    सुपर एडमिन के नीचे कार्य करें! 500 SafarGo एजेंट जोड़ें (शर्त: प्रति एजेंट <strong>न्यूनतम 3 कन्फर्म बस बुकिंग अनिवार्य</strong>), लोकल दुकानों को मंथली सब्सक्रिप्शन पैकेज दें तथा अपने नेटवर्क के एजेंटों का रजिस्ट्रेशन व KYC अप्रूव करें।
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-[11px]">आवेदन व ऑनबोर्डिंग</div>
                      <div className="font-bold text-amber-400">₹149 + ₹499</div>
                      <div className="text-[10px] text-emerald-300">लक्ष्य पर 100% रिफंड</div>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-[11px]">एजेंट मैनेजमेंट</div>
                      <div className="font-bold text-white">KYC व अप्रूवल डेस्क</div>
                      <div className="text-[10px] text-slate-300">दैनिक कॉलिंग ऑडिट</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  {currentUser && role === 'promoter' ? (
                    <button
                      onClick={() => onNavigateTab('promoter-dashboard')}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>आप अधिकृत प्रमोटर हैं — माई डैशबोर्ड खोलें (Open Dashboard)</span>
                    </button>
                  ) : prmMode === 'coming_soon' ? (
                    <button
                      onClick={() =>
                        setComingSoonModal({
                          isOpen: true,
                          name: 'सफ़ारगो प्रमोटर पार्टनर प्रोग्राम',
                          desc: 'सुपर एडमिन के नीचे 5 एक्सक्लूसिव पद व ₹15,000 मासिक वेतन का यह प्रोग्राम बहुत जल्द शुरू हो रहा है!'
                        })
                      }
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-4 h-4" />
                      <span>⏳ प्रमोटर प्रोग्राम — जल्द आ रहा है (Notify Me)</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => (onOpenPromoterApply ? onOpenPromoterApply() : onNavigateTab('promoter-modal'))}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>प्रमोटर पद हेतु आवेदन करें (Apply ₹149 UTR)</span>
                      </button>
                      <button
                        onClick={() => onOpenAuth('promoter_login')}
                        className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>🤝 प्रमोटर लॉगिन</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Card 2: 15-Minute Rural Quick Delivery (Blinkit Model for MP Gap Towns) */}
            {qdMode !== 'hidden' && (
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 rounded-3xl p-5 sm:p-8 text-white border border-emerald-800/40 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-sm">
                      <Bike className="w-3.5 h-3.5" />
                      ब्लिंकिट का ग्रामीण विकल्प
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-emerald-300 border border-white/10">
                      15 मिनट डिलीवरी गारंटी
                    </span>
                    {qdMode === 'coming_soon' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 animate-pulse">
                        ⏳ जल्द आ रहा है (Under Launch)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        शुरुआत मात्र ₹25
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    सफ़ारगो 15-मिनट क्विक डिलीवरी
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    सिरोंज, कुरवाई, लटेरी, चंदेरी, गुना, बीना, विदिशा - जहाँ ब्लिंकिट नहीं है, वहाँ सफ़ारगो एजेंट 5 मिनट में नजदीकी दुकान से सामान व बिल की फोटो खींचकर भेजेंगे, पुष्टि होने पर 15 मिनट में घर पहुँचाएंगे!
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-[11px]">0 से 2 KM</div>
                      <div className="font-bold text-emerald-400">₹25 कुल शुल्क</div>
                      <div className="text-[10px] text-slate-300">₹18 एजेंट + ₹7 सफ़ारगो</div>
                    </div>
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <div className="text-slate-400 text-[11px]">2 से 4 KM</div>
                      <div className="font-bold text-emerald-400">₹45 कुल शुल्क</div>
                      <div className="text-[10px] text-slate-300">₹34 एजेंट + ₹11 सफ़ारगो</div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 space-y-2.5">
                  {!currentUser ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => onOpenAuth('login')}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 hover:from-amber-500 hover:to-emerald-600 text-slate-950 font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>⚡ SafarGo क्विक डिलीवरी — लॉगिन कर ऑर्डर करें</span>
                      </button>
                      <button
                        onClick={() => onNavigateTab('track-order')}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-bold text-xs transition flex items-center justify-center gap-2 border border-white/15 cursor-pointer"
                      >
                        <Package className="w-4 h-4" />
                        <span>📦 SafarGo आर्डर ट्रैक करें (Track Order)</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          if (qdMode === 'coming_soon') {
                            setComingSoonModal({
                              isOpen: true,
                              name: '15-मिनट क्विक डिलीवरी (Rural Blinkit)',
                              desc: 'सिरोंज, कुरवाई, लटेरी, चंदेरी, गुना, बीना आदि कस्बों में 15 मिनट डिलीवरी सेवा बहुत जल्द शुरू हो रही है!'
                            });
                          } else {
                            onNavigateTab('quick-delivery');
                          }
                        }}
                        className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Bike className="w-4 h-4" />
                        <span>
                          {qdMode === 'coming_soon'
                            ? '⏳ 15-मिनट डिलीवरी — जल्द आ रही है'
                            : '15-मिनट डिलीवरी ऑर्डर हब खोलें'}
                        </span>
                      </button>
                      <button
                        onClick={() => onNavigateTab('track-order')}
                        className="py-3.5 px-5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-emerald-400" />
                        <span>आर्डर ट्रैक</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Promoting Partner Application Live Tracking System on Homepage */}
          {prmMode !== 'hidden' && (
            <div className="pt-4" id="promoter-track-section">
              <PromoterTrackStatusWidget
                onOpenApplyModal={() => (onOpenPromoterApply ? onOpenPromoterApply() : onNavigateTab('promoter-modal'))}
                onOpenPromoterLogin={() => onOpenAuth('promoter_login')}
                onNavigateTab={onNavigateTab}
              />
            </div>
          )}
        </section>
      )}

      {/* ======================================================== */}
      {/* 2.5 VIRAL CREATOR & REELS PROMOTION SECTION (नकद रिवॉर्ड) */}
      {/* ======================================================== */}
      {viralMode !== 'hidden' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white border border-purple-800/50 shadow-2xl relative overflow-hidden">
            
            {/* Ambient Glows */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              
              {/* Coming Soon Notice if viralMode is coming_soon */}
              {viralMode === 'coming_soon' && (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 backdrop-blur-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-amber-400 text-slate-950 rounded-xl font-black text-sm">⏳</span>
                    <div>
                      <h4 className="font-black text-amber-300 text-sm">सोशल मीडिया क्रिएटर रिवॉर्ड — जल्द आ रहा है (Under Launch)</h4>
                      <p className="text-xs text-amber-100/80">यह प्रोग्राम अभी परीक्षण में है। जल्द ही आप Reel और YouTube Video क्लेम सबमिट कर सकेंगे।</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setComingSoonModal({
                        isOpen: true,
                        name: 'SafarGo वायरल क्रिएटर व प्रमोशन धमाका',
                        desc: 'Instagram Reel व YouTube वीडियो प्रमोशन प्रोग्राम बहुत जल्द शुरू हो रहा है! लॉन्च होते ही नकद इनाम पाने के लिए WhatsApp नोटिफिकेशन ऑन करें।'
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 cursor-pointer"
                  >
                    Notify Me
                  </button>
                </div>
              )}

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
                    onClick={() => {
                      if (viralMode === 'coming_soon') {
                        setComingSoonModal({
                          isOpen: true,
                          name: 'Instagram Reel वायरल रिवॉर्ड',
                          desc: 'Instagram Reel क्लेम प्रोग्राम बहुत जल्द शुरू हो रहा है! 1 Million Views पर ₹500 पाने के लिए तैयार रहें।'
                        });
                      } else {
                        handleOpenClaimModal('instagram');
                      }
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>
                      {viralMode === 'coming_soon'
                        ? '⏳ Instagram क्लेम — जल्द आ रहा है'
                        : `Instagram क्लेम सबमिट करें (₹${settings.promo_instagram_reward || 500})`}
                    </span>
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
                        SafarGo बस बुकिंग कैसे करें या अपनी यात्रा अनुभव पर YouTube Video या Short बनाएं। <strong>10,00,0 (10K) वास्तविक व्यूज</strong> पूरे होने पर तुरंत लिंक सबमिट करें।
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 bg-white/5 p-3.5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>टारगेट: 10,000 (10K) Genuine Views (Video/Shorts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-400 shrink-0" />
                        <span>SLA गारंटी: सबमिट के 24 घंटे में वेरिफिकेशन व पेमेंट</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (viralMode === 'coming_soon') {
                        setComingSoonModal({
                          isOpen: true,
                          name: 'YouTube Video / Shorts रिवॉर्ड',
                          desc: 'YouTube Video क्लेम प्रोग्राम बहुत जल्द शुरू हो रहा है! 10K Views पर ₹100 पाने के लिए तैयार रहें।'
                        });
                      } else {
                        handleOpenClaimModal('youtube');
                      }
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-2xl shadow-lg transition flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                  >
                    <Gift className="w-4 h-4" />
                    <span>
                      {viralMode === 'coming_soon'
                        ? '⏳ YouTube क्लेम — जल्द आ रहा है'
                        : `YouTube क्लेम सबमिट करें (₹${settings.promo_youtube_reward || 100})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Pillar 1 */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between">
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
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between">
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
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between">
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
            <div className="bg-slate-800/80 border border-slate-700/80 p-5 sm:p-6 rounded-3xl space-y-4 flex flex-col justify-between">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-orange-500 text-white font-black text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">मुफ्त पंजीकरण (Free Sign Up)</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              आधार व दुकान का नाम डालकर फॉर्म भरें। एडमिन टीम आपके केंद्र का सत्यापन करके अकाउंट एक्टिवेट करेगी।
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">कस्टमर की पसंद दर्ज करें</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              स्रोत, गंतव्य, यात्रा तारीख, सीट श्रेणी (सीटर/स्लीपर, AC/Non-AC) चुनकर टिकट रिक्वेस्ट सबमिट करें।
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
            <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-extrabold text-slate-900 text-sm">15 मिनट WhatsApp एक्टिव रहें</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              सफ़ारगो टीम तुरंत बस ऑपरेटर से सीट चेक करती है। WhatsApp पर आपसे कन्फर्मेशन लेकर असली PNR जारी करती है।
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-3 relative">
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
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 rounded-3xl p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="text-xs font-black uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full text-orange-100 inline-block">
              100% Free Agent Onboarding
            </span>
            <h2 className="text-xl sm:text-4xl font-black tracking-tight leading-tight">
              आज ही अपने जन सेवा केंद्र को अधिकृत बस बुकिंग सेंटर बनाएं!
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 font-medium">
              गाँव के यात्रियों को सुरक्षित सफर दें और हर महीने ₹15,000+ तक की सम्मानजनक आय अर्जित करें।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
            {currentUser ? (
              <button
                onClick={() => onNavigateTab('new-booking')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>नई टिकट बुक करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>फ्री में एजेंट बनें</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl border border-white/30 transition cursor-pointer"
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

      {/* Platform Feature Coming Soon Modal */}
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        featureName={comingSoonModal.name}
        featureDescription={comingSoonModal.desc}
        onClose={() => setComingSoonModal({ isOpen: false, name: '' })}
      />

      {/* RedBus Interactive Seat Selection Modal (Seater Chairs & AC Sleeper Beds) */}
      {selectedTripForSeatMap && (
        <RedBusSeatMapModal
          trip={selectedTripForSeatMap}
          onClose={() => setSelectedTripForSeatMap(null)}
          onConfirmSelection={({ selectedSeats, totalFare, seatCategory, boardingPoint, dropPoint }) => {
            setAutoCheckoutData({
              trip: selectedTripForSeatMap,
              selectedSeats,
              totalFare,
              seatCategory,
              boardingPoint,
              dropPoint,
            });
            setSelectedTripForSeatMap(null);
          }}
        />
      )}

      {/* RedBus Inspired Automatic Instant Booking Checkout Modal */}
      {autoCheckoutData && (
        <AutoBusBookingCheckoutModal
          isOpen={true}
          onClose={() => setAutoCheckoutData(null)}
          trip={autoCheckoutData.trip}
          selectedSeats={autoCheckoutData.selectedSeats}
          totalFare={autoCheckoutData.totalFare}
          seatCategory={autoCheckoutData.seatCategory}
          boardingPoint={autoCheckoutData.boardingPoint}
          dropPoint={autoCheckoutData.dropPoint}
          onBookingSuccess={(confirmedBooking) => {
            setAutoCheckoutData(null);
            setPrintModalBooking(confirmedBooking);
          }}
        />
      )}

    </div>
  );
};
