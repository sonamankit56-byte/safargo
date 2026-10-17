import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Star,
  Coffee,
  Shield,
  ArrowLeftRight,
  Navigation,
  Radio,
  Tv,
  Luggage,
} from 'lucide-react';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { getWhatsAppTicketMessage } from '../../lib/whatsappService';
import { buildSubdomainUrl } from '../../lib/subdomain';
import { Booking } from '../../types';

import busHero from '../../assets/bus1.png';
import busFleet1 from '../../assets/bus2.png';
import busFleet2 from '../../assets/bus3.png';
import busFleet3 from '../../assets/bus5.png';
import busFleet4 from '../../assets/bus6.png';
import safargoLogoPng from '../../assets/logo.png';

interface HomePageProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onNavigateTab: (tab: string) => void;
  onOpenGoAuth?: (mode?: 'login' | 'register') => void;
  onOpenPromoterApply?: () => void;
}

// =====================================================================
// MP & CONNECTED NETWORK STATION AUTOCOMPLETE DATABASE
// =====================================================================
interface StationSuggestion {
  cityName: string;
  hindiName: string;
  station: string;
  state: string;
  popular?: boolean;
}

const CITY_STATIONS: StationSuggestion[] = [
  { cityName: 'Bhopal', hindiName: 'भोपाल', station: 'नादरा बस स्टैंड & ISBT हबीबगंज', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Indore', hindiName: 'इंदौर', station: 'सरवटे बस स्टैंड & AICTSL टर्मिनल', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Ujjain', hindiName: 'उज्जैन', station: 'नानाखेड़ा बस स्टैंड & देवास गेट', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Jabalpur', hindiName: 'जबलपुर', station: 'दीनदयाल उपाध्याय ISBT', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Gwalior', hindiName: 'ग्वालियर', station: 'रेलवे स्टेशन रोड बस डिपो', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Sironj', hindiName: 'सिरोंज', station: 'पुराना बस स्टैंड & शिवाजी चौक', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Vidisha', hindiName: 'विदिशा', station: 'स्टेशन रोड मुख्य बस स्टैंड', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Guna', hindiName: 'गुना', station: 'AB रोड कैंट बस स्टैंड', state: 'मध्य प्रदेश', popular: true },
  { cityName: 'Ashok Nagar', hindiName: 'अशोक नगर', station: 'सिटी बस डिपो & स्टेशन रोड', state: 'मध्य प्रदेश' },
  { cityName: 'Chanderi', hindiName: 'चंदेरी', station: 'राजघाट रोड बस स्टैंड', state: 'मध्य प्रदेश' },
  { cityName: 'Shivpuri', hindiName: 'शिवपुरी', station: 'सर्कुलर रोड बस टर्मिनल', state: 'मध्य प्रदेश' },
  { cityName: 'Sagar', hindiName: 'सागर', station: 'तिल्ली मुख्य बस स्टैंड', state: 'मध्य प्रदेश' },
  { cityName: 'Ratlam', hindiName: 'रतलाम', station: 'दो बत्ती & स्टेशन बस स्टैंड', state: 'मध्य प्रदेश' },
  { cityName: 'Khandwa', hindiName: 'खंडवा', station: 'आनंद नगर बस टर्मिनल', state: 'मध्य प्रदेश' },
  { cityName: 'Bina', hindiName: 'बीना', station: 'जंक्शन स्टेशन बस डिपो', state: 'मध्य प्रदेश' },
  { cityName: 'Kurwai', hindiName: 'कुरवाई', station: 'मुख्य बस स्टैंड', state: 'मध्य प्रदेश' },
  { cityName: 'Lateri', hindiName: 'लटेरी', station: 'सेंट्रल बस स्टैंड', state: 'मध्य प्रदेश' },
  { cityName: 'Jhansi', hindiName: 'झाँसी', station: 'एलीट चौराहा & बस स्टैंड', state: 'उत्तर प्रदेश' },
  { cityName: 'Lalitpur', hindiName: 'ललितपुर', station: 'स्टेशन रोड बस स्टैंड', state: 'उत्तर प्रदेश' },
  { cityName: 'Jaipur', hindiName: 'जयपुर', station: 'सिंधी कैंप सेंट्रल बस टर्मिनल', state: 'राजस्थान' },
  { cityName: 'Pune', hindiName: 'पुणे', station: 'वाकड / स्वारगेट इंटर-सिटी', state: 'महाराष्ट्र' },
  { cityName: 'Agra', hindiName: 'आगरा', station: 'ईदगाह इंटर-स्टेट बस स्टैंड', state: 'उत्तर प्रदेश' },
];

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAuth,
  onOpenGoAuth,
}) => {
  const { currentUser } = useAuth();
  const { bookings, busTrips } = useData();

  // Widget Mode: 'search' vs 'track_pnr'
  const [widgetTab, setWidgetTab] = useState<'search' | 'track_pnr'>('search');

  // Search Route State (Bilingual autocomplete enabled)
  const [searchSource, setSearchSource] = useState('Bhopal');
  const [searchDestination, setSearchDestination] = useState('Indore');
  const [searchDate, setSearchDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Autocomplete UI dropdown toggles
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const sourceDropdownRef = useRef<HTMLDivElement>(null);
  const destDropdownRef = useRef<HTMLDivElement>(null);

  // Bus Filter Type
  const [activeBusFilter, setActiveBusFilter] = useState<'all' | 'ac_sleeper' | 'seater' | 'deluxe'>('all');

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
    rating?: number;
    reviewsCount?: number;
    duration?: string;
  } | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([12]);
  const [deckTab, setDeckTab] = useState<'lower' | 'upper'>('lower');

  // Bus inventory section ref for smooth scroll
  const busInventoryRef = useRef<HTMLDivElement>(null);

  // Close autocomplete dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sourceDropdownRef.current && !sourceDropdownRef.current.contains(event.target as Node)) {
        setShowSourceDropdown(false);
      }
      if (destDropdownRef.current && !destDropdownRef.current.contains(event.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Source Suggestions
  const filteredSources = useMemo(() => {
    const q = searchSource.trim().toLowerCase();
    if (!q) return CITY_STATIONS;
    return CITY_STATIONS.filter(
      (c) =>
        c.cityName.toLowerCase().includes(q) ||
        c.hindiName.includes(q) ||
        c.station.toLowerCase().includes(q)
    );
  }, [searchSource]);

  // Filtered Destination Suggestions
  const filteredDestinations = useMemo(() => {
    const q = searchDestination.trim().toLowerCase();
    if (!q) return CITY_STATIONS;
    return CITY_STATIONS.filter(
      (c) =>
        c.cityName.toLowerCase().includes(q) ||
        c.hindiName.includes(q) ||
        c.station.toLowerCase().includes(q)
    );
  }, [searchDestination]);

  // Swap From & To Cities
  const handleSwapCities = () => {
    const temp = searchSource;
    setSearchSource(searchDestination);
    setSearchDestination(temp);
  };

  // Quick Date Helpers
  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSearchDate(d.toISOString().split('T')[0]);
  };

  // Quick Popular Route Selection
  const handleSelectPopularRoute = (from: string, to: string) => {
    setSearchSource(from);
    setSearchDestination(to);
    setWidgetTab('search');
    if (busInventoryRef.current) {
      busInventoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Format date for readable display (e.g. 17 Oct 2026, Sat)
  const formattedDisplayDate = useMemo(() => {
    try {
      const d = new Date(searchDate);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        weekday: 'short',
      });
    } catch {
      return searchDate;
    }
  }, [searchDate]);

  // Track PNR
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

  // Sample dynamic bus inventory matching route
  const availableBusesList = useMemo(() => {
    const all = [
      {
        id: 'bus-1',
        name: 'SafarGo Superfast Express (AC)',
        time: 'सुबह 07:30',
        reachTime: 'सुबह 11:00',
        duration: '3 घंटे 30 मिनट',
        fare: 350,
        seats: 16,
        type: '2x2 AC Pushback Hi-Tech',
        category: 'seater',
        rating: 4.9,
        reviewsCount: 348,
        operator: 'SafarGo Gold Express',
        image: busHero,
        amenities: ['❄️ High-Cool AC', '📶 Free WiFi', '🔌 Fast Charging', '📍 GPS Tracked', '💺 Pushback'],
        boarding: `${searchSource} मुख्य बस स्टैंड (Nadra / Sarwate)`,
        dropping: `${searchDestination} सेंट्रल बस टर्मिनल`,
      },
      {
        id: 'bus-2',
        name: 'Royal AC Multi-Axle Sleeper (2+1)',
        time: 'दोपहर 01:15',
        reachTime: 'शाम 05:00',
        duration: '3 घंटे 45 मिनट',
        fare: 650,
        seats: 9,
        type: 'Luxury AC Sleeper (Single & Double)',
        category: 'ac_sleeper',
        rating: 4.8,
        reviewsCount: 412,
        operator: 'Royal Star Travels & SafarGo',
        image: busFleet1,
        amenities: ['🛏️ Pillow & Blanket', '❄️ Climate Control', '🔌 220V Socket', '💧 Mineral Water', '📺 Personal TV'],
        boarding: `${searchSource} ISBT प्लेटफॉर्म 4`,
        dropping: `${searchDestination} न्यू बस स्टैंड`,
      },
      {
        id: 'bus-3',
        name: 'MP Tourism InterCity Superfast',
        time: 'शाम 05:45',
        reachTime: 'रात 09:15',
        duration: '3 घंटे 30 मिनट',
        fare: 550,
        seats: 21,
        type: 'Multi-Axle AC Air-Suspension',
        category: 'deluxe',
        rating: 4.9,
        reviewsCount: 520,
        operator: 'MP State Tourism Partner',
        image: busFleet2,
        amenities: ['❄️ Dual AC', '🔌 USB Port', '💺 Luxury Recliner', '🛡️ CCTV Monitored', '⏱️ 100% On-Time'],
        boarding: `${searchSource} रेलवे स्टेशन बस स्टैंड`,
        dropping: `${searchDestination} AICTSL डिपो`,
      },
      {
        id: 'bus-4',
        name: 'Gramin Regional Connect Seater',
        time: 'रात 09:00',
        reachTime: 'रात 12:15',
        duration: '3 घंटे 15 मिनट',
        fare: 280,
        seats: 26,
        type: 'Fast Highway Express Seater',
        category: 'seater',
        rating: 4.7,
        reviewsCount: 198,
        operator: 'SafarGo Regional Network',
        image: busFleet4,
        amenities: ['💺 Pushback Seat', '📦 Heavy Luggage Space', '⏱️ Fast Highway Route', '🎫 E-Ticket'],
        boarding: `${searchSource} लोकल बस स्टॉप`,
        dropping: `${searchDestination} मेन चौराहा बस स्टैंड`,
      },
      {
        id: 'bus-5',
        name: 'Volvo 9600 Gold Ultra Sleeper',
        time: 'रात 10:30',
        reachTime: 'सुबह 02:15',
        duration: '3 घंटे 45 मिनट',
        fare: 750,
        seats: 6,
        type: 'Ultra Luxury Volvo 9600 Sleeper',
        category: 'ac_sleeper',
        rating: 5.0,
        reviewsCount: 640,
        operator: 'Chartered & SafarGo Gold',
        image: busFleet3,
        amenities: ['🛏️ Soft Mattress', '❄️ Central AC', '📶 High-Speed WiFi', '☕ Complimentary Snacks', '📍 Live GPS'],
        boarding: `${searchSource} प्राइवेट ट्रैवल्स लाउंज`,
        dropping: `${searchDestination} बाईपास जंक्शन`,
      },
    ];

    if (activeBusFilter === 'all') return all;
    return all.filter((b) => b.category === activeBusFilter || (activeBusFilter === 'deluxe' && b.fare >= 500));
  }, [activeBusFilter, searchSource, searchDestination]);

  return (
    <div className="min-h-screen bg-[#070d19] text-white font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">
      
      {/* ============================================================== */}
      {/* 1. JIO-STYLE CLEAN HERO SECTION WITH MODERN AMBIENT LIGHTS     */}
      {/* ============================================================== */}
      <section className="relative pt-10 pb-12 sm:pt-14 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900 overflow-hidden">
        {/* Soft Modern Glow Blobs */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-amber-500/15 via-orange-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          
          {/* Trust Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-400/40 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>मध्य प्रदेश का सबसे आधुनिक बस टिकटिंग नेटवर्क • SafarGo Official</span>
          </div>

          {/* Clean Jio-Inspired Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            सरल, सुरक्षित और सबसे तेज <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent">
              ऑनलाइन बस टिकटिंग प्लेटफॉर्म
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            लाइव सीट चयन, तत्काल WhatsApp टिकट, शून्य कैंसलेशन शुल्क एवं अधिकृत <strong>GO एजेंट</strong> द्वारा हर टिकट पर <strong>फ्लैट ₹20 नकद कमीशन</strong>।
          </p>

          {/* Top Quick Actions (Hero Buttons) */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleJoinAgent}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>मुफ्त GO एजेंट बनें (कमाएं ₹20/टिकट)</span>
            </button>

            <button
              type="button"
              onClick={handleLoginAgent}
              className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-white font-bold text-xs sm:text-sm transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <span>एजेंट लॉगिन (Agent Terminal)</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>

          {/* Jio-Style 4 Quick Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 max-w-3xl mx-auto text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <span className="text-amber-400 font-black text-xl font-mono block">₹20</span>
              <span className="text-slate-400 text-[11px] font-medium">फ्लैट कमीशन प्रति सीट</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <span className="text-emerald-400 font-black text-xl font-mono block">हर रविवार</span>
              <span className="text-slate-400 text-[11px] font-medium">सीधा बैंक/UPI पेआउट</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <span className="text-cyan-400 font-black text-xl font-mono block">5 मिनट</span>
              <span className="text-slate-400 text-[11px] font-medium">फास्ट ऑपरेटर कन्फर्मेशन</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
              <span className="text-orange-400 font-black text-xl font-mono block">100%</span>
              <span className="text-slate-400 text-[11px] font-medium">सत्यापित बस ऑपरेटर</span>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. ABHIBUS / REDBUS ADVANCED SMART SEARCH & AUTOCOMPLETE WIDGET */}
      {/* ============================================================== */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 -mt-8 relative z-30">
        <div className="max-w-5xl mx-auto bg-slate-900/95 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl space-y-5">
          
          {/* Header Switcher: Bus Search vs Live PNR Status */}
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

          {/* TAB 1: ADVANCED BUS SEARCH WITH AUTOCOMPLETE */}
          {widgetTab === 'search' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Popular Quick Route Suggestion Chips (AbhiBus Style) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-slate-400 text-[11px] font-bold shrink-0 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span>पॉपुलर रूट:</span>
                </span>
                {[
                  { from: 'Bhopal', to: 'Indore', label: 'भोपाल ➔ इंदौर (₹350 से)' },
                  { from: 'Indore', to: 'Ujjain', label: 'इंदौर ➔ उज्जैन (₹120 से)' },
                  { from: 'Bhopal', to: 'Jabalpur', label: 'भोपाल ➔ जबलपुर (₹450 से)' },
                  { from: 'Sironj', to: 'Bhopal', label: 'सिरोंज ➔ भोपाल (₹220 से)' },
                  { from: 'Gwalior', to: 'Bhopal', label: 'ग्वालियर ➔ भोपाल (₹600 से)' },
                  { from: 'Ratlam', to: 'Indore', label: 'रतलाम ➔ इंदौर (₹250 से)' },
                  { from: 'Indore', to: 'Pune', label: 'इंदौर ➔ पुणे (₹850 से)' },
                ].map((r) => (
                  <button
                    key={`${r.from}-${r.to}`}
                    type="button"
                    onClick={() => handleSelectPopularRoute(r.from, r.to)}
                    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                      searchSource === r.from && searchDestination === r.to
                        ? 'bg-amber-400 text-slate-950 border-amber-400 font-black shadow-sm'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-amber-300'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Main Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
                
                {/* 1. From City (with real-time suggestions popup) */}
                <div className="sm:col-span-4 relative" ref={sourceDropdownRef}>
                  <label className="block text-slate-400 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>कहाँ से (Source City) *</span>
                    </span>
                    <span className="text-[10px] text-amber-400/80">सुझाव उपलब्ध</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchSource}
                      onChange={(e) => {
                        setSearchSource(e.target.value);
                        setShowSourceDropdown(true);
                      }}
                      onFocus={() => setShowSourceDropdown(true)}
                      placeholder="उदा. Bhopal / भोपाल"
                      className="w-full p-3.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white font-black text-sm outline-none transition placeholder:text-slate-600"
                    />
                    {searchSource && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchSource('');
                          setShowSourceDropdown(true);
                        }}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showSourceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border-2 border-amber-400/50 rounded-2xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto no-scrollbar animate-fadeIn">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-black text-slate-500 border-b border-slate-800 mb-1">
                        मध्य प्रदेश के प्रमुख बस स्टैंड व टर्मिनल
                      </div>
                      {filteredSources.length > 0 ? (
                        filteredSources.map((item) => (
                          <div
                            key={item.cityName}
                            onClick={() => {
                              setSearchSource(item.cityName);
                              setShowSourceDropdown(false);
                            }}
                            className="p-2.5 rounded-xl hover:bg-slate-900 cursor-pointer transition flex items-center justify-between text-left group"
                          >
                            <div>
                              <div className="font-bold text-white group-hover:text-amber-400 text-xs">
                                {item.hindiName} ({item.cityName})
                              </div>
                              <div className="text-[11px] text-slate-400">
                                📍 {item.station}
                              </div>
                            </div>
                            {item.popular && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                प्रमुख
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-500 text-xs">
                          कोई शहर नहीं मिला।
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. City Swap Button */}
                <div className="sm:col-span-1 flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 text-amber-400 transition-all duration-300 active:rotate-180 cursor-pointer shadow-lg"
                    title="शहर आपस में बदलें (Swap Origin & Destination)"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. To City (with real-time suggestions popup) */}
                <div className="sm:col-span-4 relative" ref={destDropdownRef}>
                  <label className="block text-slate-400 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400" />
                      <span>कहाँ तक (Destination City) *</span>
                    </span>
                    <span className="text-[10px] text-orange-400/80">सुझाव उपलब्ध</span>
                  </label>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={searchDestination}
                      onChange={(e) => {
                        setSearchDestination(e.target.value);
                        setShowDestDropdown(true);
                      }}
                      onFocus={() => setShowDestDropdown(true)}
                      placeholder="उदा. Indore / इंदौर"
                      className="w-full p-3.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white font-black text-sm outline-none transition placeholder:text-slate-600"
                    />
                    {searchDestination && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchDestination('');
                          setShowDestDropdown(true);
                        }}
                        className="absolute right-3 top-3.5 text-slate-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showDestDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950 border-2 border-amber-400/50 rounded-2xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto no-scrollbar animate-fadeIn">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-black text-slate-500 border-b border-slate-800 mb-1">
                        मध्य प्रदेश के प्रमुख बस स्टैंड व टर्मिनल
                      </div>
                      {filteredDestinations.length > 0 ? (
                        filteredDestinations.map((item) => (
                          <div
                            key={item.cityName}
                            onClick={() => {
                              setSearchDestination(item.cityName);
                              setShowDestDropdown(false);
                            }}
                            className="p-2.5 rounded-xl hover:bg-slate-900 cursor-pointer transition flex items-center justify-between text-left group"
                          >
                            <div>
                              <div className="font-bold text-white group-hover:text-amber-400 text-xs">
                                {item.hindiName} ({item.cityName})
                              </div>
                              <div className="text-[11px] text-slate-400">
                                📍 {item.station}
                              </div>
                            </div>
                            {item.popular && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                प्रमुख
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-500 text-xs">
                          कोई शहर नहीं मिला।
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Journey Date with Quick Today / Tomorrow Chips */}
                <div className="sm:col-span-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>यात्रा की तारीख *</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(0)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold"
                      >
                        आज
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(1)}
                        className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold"
                      >
                        कल
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full p-3.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white font-black text-sm outline-none transition"
                  />
                </div>

              </div>

              {/* Big Prominent Search Button */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (busInventoryRef.current) {
                      busInventoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Search className="w-4 h-4 fill-slate-950" />
                  <span>उपलब्ध बसें व सीटें खोजें ({searchSource} ➔ {searchDestination})</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: LIVE PNR TRACKER WIDGET */}
          {widgetTab === 'track_pnr' && (
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleTrackPnr} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-4 pointer-events-none" />
                  <input
                    type="text"
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                    placeholder="अपना 6-अंकीय PNR, बुकिंग कोड (SFG-...) या यात्री मोबाइल नंबर दर्ज करें..."
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-950 border-2 border-slate-700 focus:border-amber-400 rounded-2xl text-white font-mono text-xs outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black rounded-2xl text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Search className="w-4 h-4" />
                  <span>PNR ट्रैक करें</span>
                </button>
              </form>

              {pnrSearched && (
                <div>
                  {trackedBooking ? (
                    <div className="p-5 rounded-3xl bg-slate-950 border-2 border-emerald-500/50 space-y-4 animate-fadeIn text-xs shadow-xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white text-base font-mono">{trackedBooking.booking_code}</strong>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">
                              PNR: {trackedBooking.ticket_pnr || 'CONFIRMED'} ✓
                            </span>
                          </div>
                          <p className="text-slate-300 font-bold mt-1 text-sm">
                            {trackedBooking.from_city} ➔ {trackedBooking.to_city} • यात्रा: {trackedBooking.journey_date}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xl font-black text-amber-400 font-mono">
                            ₹{(trackedBooking.total_fare || trackedBooking.actual_fare || 450).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-bold">स्थिति: कन्फर्म ✓</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-400">
                        <div>यात्री का नाम: <strong className="text-white block">{trackedBooking.customer_name}</strong></div>
                        <div>मोबाइल नंबर: <strong className="text-white font-mono block">+91 {trackedBooking.customer_mobile}</strong></div>
                        <div>सीट संख्या: <strong className="text-emerald-400 font-mono block">{trackedBooking.confirmed_seats || '1 Seat'}</strong></div>
                        <div>बस ऑपरेटर: <strong className="text-white block">{trackedBooking.actual_operator || 'SafarGo Superfast Express'}</strong></div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const msg = getWhatsAppTicketMessage(trackedBooking);
                            window.open(`https://wa.me/91${trackedBooking.customer_mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp पर टिकट प्राप्त करें</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPrintBooking(trackedBooking)}
                          className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रिंट / PDF टिकट डाउनलोड</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-950 rounded-3xl border border-slate-800 space-y-1">
                      <p className="text-sm font-bold text-rose-400">कोई कन्फर्म टिकट नहीं मिली!</p>
                      <p className="text-xs text-slate-500">कृपया अपना PNR, बुकिंग कोड (SFG-...) अथवा रजिस्टर्ड मोबाइल नंबर सही से जांचें।</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. ABHIBUS / REDBUS INSPIRED LIVE BUS INVENTORY CARDS          */}
      {/* ============================================================== */}
      <section ref={busInventoryRef} className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        
        {/* Section Header with Category Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                उपलब्ध बसें: {searchSource} ➔ {searchDestination}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              दिनांक: <span className="text-amber-400 font-bold">{formattedDisplayDate} ({searchDate})</span> • {availableBusesList.length} प्रमाणित बसें उपलब्ध
            </p>
          </div>

          {/* AbhiBus Style Quick Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: 'all', label: 'सभी बसें (All)' },
              { id: 'ac_sleeper', label: 'AC स्लीपर (Sleeper)' },
              { id: 'seater', label: 'सीटर (Seater)' },
              { id: 'deluxe', label: 'लक्ज़री वोल्वो (Volvo)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveBusFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                  activeBusFilter === f.id
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bus List Cards */}
        <div className="space-y-4">
          {availableBusesList.map((bus) => (
            <div
              key={bus.id}
              className="p-5 sm:p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 transition-all duration-300 shadow-xl group space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Left: Thumbnail & Operator Details */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                    <img src={bus.image} alt={bus.name} className="w-full h-full object-contain" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px] leading-none">
                      SafarGo
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">{bus.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-500/40 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{bus.rating} / 5.0</span>
                        <span className="text-slate-400 font-normal">({bus.reviewsCount})</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 text-[10px] font-bold border border-amber-400/40">
                        🛡️ SafarGo Verified Bus ✓
                      </span>
                    </div>

                    <div className="text-xs text-slate-400">
                      प्रकार: <span className="text-slate-300 font-bold">{bus.type}</span> • ऑपरेटर: <span className="text-white font-bold">{bus.operator}</span>
                    </div>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {bus.amenities.map((amenity, aIdx) => (
                        <span key={aIdx} className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 text-[10px] font-mono border border-slate-800">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle: Timing & Station Journey Progression */}
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-base font-black text-amber-300 block">{bus.time}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[110px] block">{bus.boarding}</span>
                  </div>

                  <div className="text-center flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-mono">{bus.duration}</span>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 relative my-1">
                      <div className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.75 left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold">{bus.seats} सीटें खाली</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-white block">{bus.reachTime}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[110px] block">{bus.dropping}</span>
                  </div>
                </div>

                {/* Right: Fare & Instant Booking Action */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                  <div className="text-left lg:text-right">
                    <span className="text-2xl font-black text-amber-400 font-mono block">₹{bus.fare}</span>
                    <span className="text-[10px] text-emerald-400 font-bold block">+₹20 एजेंट कमीशन</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSeatBus(bus)}
                      className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition cursor-pointer border border-slate-700 hover:border-amber-400"
                    >
                      सीटें देखें
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSeatBus(bus)}
                      className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5"
                    >
                      <span>सीट चुनें</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ============================================================== */}
      {/* 4. JIO-STYLE 4 SPOTLIGHT VALUE CARDS (THE SAFARGO ADVANTAGE)   */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/70 relative">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center space-y-2">
            <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
              SAFARGO ADVANTAGE
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              SafarGo से बस टिकट क्यों बुक करें?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              पारदर्शी नियम, शून्य छुपे शुल्क और मध्य प्रदेश का सबसे भरोसेमंद कस्टमर सपोर्ट नेटवर्क।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: Zero Cancellation Fee */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1 space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">शून्य कैंसलेशन शुल्क</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                योजना बदल गई? कोई चिंता नहीं! यात्रा से पहले टिकट रद्द करने पर बिना किसी झंझट के तुरंत 100% रिफंड पॉलिसी।
              </p>
            </div>

            {/* Card 2: Live GPS Tracking */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-400/50 transition-all duration-300 hover:-translate-y-1 space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 text-emerald-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Navigation className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">लाइव GPS बस ट्रैकिंग</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                बस स्टॉप पर खड़े होकर इंतजार करने की जरूरत नहीं। अपने मोबाइल फोन पर बस की लाइव लोकेशन व बोर्डिंग समय ट्रैक करें।
              </p>
            </div>

            {/* Card 3: WhatsApp E-Ticket */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 transition-all duration-300 hover:-translate-y-1 space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">तुरंत WhatsApp टिकट</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                बुकिंग कन्फर्म होते ही आधिकारिक QR कोड एवं PNR सहित डिजिटल ई-टिकट सीधे आपके और यात्री के WhatsApp पर पहुंचता है।
              </p>
            </div>

            {/* Card 4: 24x7 Support */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-400/50 transition-all duration-300 hover:-translate-y-1 space-y-3 group">
              <div className="w-14 h-14 rounded-2xl bg-orange-400/10 text-orange-400 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7" />
              </div>
              <h3 className="text-base font-black text-white">24x7 ग्राहक सेवा डेस्क</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                हिंदी और इंग्लिश में 24 घंटे सातों दिन समर्पित कस्टमर केयर डेस्क। हर समस्या का 5 मिनट में समाधान।
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. TOP OPERATOR PARTNERS CAROUSEL (ABHIBUS STYLE)              */}
      {/* ============================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-900 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-black text-amber-400 tracking-wider">
              OFFICIAL TRAVEL PARTNERS
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white mt-1">
              मध्य प्रदेश के प्रमुख प्रमाणित बस ऑपरेटर
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% ऑपरेटर वेरीफाइड बसें</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          {[
            { name: 'SafarGo Gold Express', rating: '★ 4.9', type: 'लक्ज़री वोल्वो व स्लीपर' },
            { name: 'MP Tourism InterCity', rating: '★ 4.8', type: 'राज्य पर्यटन साझेदारी' },
            { name: 'Chartered Bus', rating: '★ 4.9', type: 'सुपरफास्ट एक्सप्रेस' },
            { name: 'Hans Travels', rating: '★ 4.7', type: 'डीलक्स स्लीपर कोच' },
            { name: 'Verma Travels', rating: '★ 4.8', type: 'प्रीमियम हाईवे लाइन' },
            { name: 'InterCity Superfast', rating: '★ 4.8', type: 'दैनिक इंटर-स्टेट सेवा' },
          ].map((op, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-400/50 transition space-y-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 flex items-center justify-center font-black mx-auto group-hover:scale-110 transition-transform">
                <Bus className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-xs group-hover:text-amber-400 transition">{op.name}</h4>
              <span className="inline-block text-[10px] text-amber-300 font-mono bg-amber-400/10 px-2 py-0.5 rounded-md">
                {op.rating}
              </span>
              <p className="text-[10px] text-slate-500 leading-tight">{op.type}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. JIO-STYLE AGENT EARNING SPOTLIGHT BANNER                     */}
      {/* ============================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-600/15 to-amber-500/15 border-2 border-amber-400/60 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                GO AGENT PARTNER NETWORK
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                अपनी दुकान को बनाएं अधिकृत बस बुकिंग सेंटर!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                प्रत्येक टिकट पर <strong>फ्लैट ₹20 नकद कमीशन</strong> और हर रविवार को बिना किसी कटौती के <strong>सीधे बैंक/UPI में साप्ताहिक पेआउट</strong>। शून्य निवेश, 5 मिनट में तुरंत एक्टिवेशन।
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-emerald-400 font-bold">
                  ✓ शून्य डिपॉजिट
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-amber-300 font-bold">
                  ✓ ₹20 प्रति सीट
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-cyan-300 font-bold">
                  ✓ रविवार पेआउट
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleJoinAgent}
                className="py-3.5 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl transition cursor-pointer text-center"
              >
                मुफ्त GO एजेंट रजिस्ट्रेशन प्रारंभ करें ➔
              </button>
              <button
                type="button"
                onClick={handleLoginAgent}
                className="py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs transition cursor-pointer text-center"
              >
                विद्यमान एजेंट लॉगिन
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. CLEAN MINIMALIST FOOTER                                     */}
      {/* ============================================================== */}
      <footer className="py-10 px-4 sm:px-6 lg:px-8 border-t border-slate-900 text-xs text-slate-500 bg-[#070d19]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <SafarGoLogo size="sm" variant="light" showTagline={false} />
            <span className="text-slate-400">
              © {new Date().getFullYear()} SafarGo Mobility Network. सर्वाधिकार सुरक्षित।
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 font-bold">
            <button type="button" onClick={handleLoginAgent} className="hover:text-amber-400 transition cursor-pointer">
              एजेंट टर्मिनल
            </button>
            <a href="https://help.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
              सहायता केंद्र
            </a>
            <a href="https://admin.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition">
              प्रशासक कंसोल
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
                <div className="relative w-14 h-10 bg-slate-950 rounded-xl p-1 border border-slate-800 flex items-center justify-center shrink-0">
                  <img src={previewSeatBus.image} alt={previewSeatBus.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-black text-white">{previewSeatBus.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[9px] font-black border border-emerald-500/40">
                      SafarGo Verified ✓
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">{previewSeatBus.type} • प्रस्थान: {previewSeatBus.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Deck Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setDeckTab('lower')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  deckTab === 'lower' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                लोअर डेक (Lower)
              </button>
              <button
                type="button"
                onClick={() => setDeckTab('upper')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  deckTab === 'upper' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400'
                }`}
              >
                अपर डेक (Upper)
              </button>
            </div>

            {/* Interactive Seat Matrix */}
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
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
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
                <span className="text-[10px] text-amber-400 block font-bold">+₹20 नकद कमीशन</span>
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
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg text-center"
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
