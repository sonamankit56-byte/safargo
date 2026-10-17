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
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Smartphone,
  CreditCard,
  Percent,
  Play,
  RotateCcw,
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
  onNavigateTab,
}) => {
  const { currentUser } = useAuth();
  const { bookings, busTrips } = useData();

  // Jio Top Segmented Bar: 'traveler' | 'agent' | 'operator' | 'cargo'
  const [activeSegment, setActiveSegment] = useState<'traveler' | 'agent' | 'operator' | 'cargo'>('traveler');

  // Jio-Style Floating Action Tabs: 'book_bus' | 'track_pnr' | 'wallet_recharge'
  const [activeCardTab, setActiveCardTab] = useState<'book_bus' | 'track_pnr' | 'wallet_recharge'>('book_bus');

  // Hero Carousel State (Auto sliding with manual control)
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = [
    {
      badge: 'मध्य प्रदेश का #1 अधिकृत बस नेटवर्क',
      title: 'मध्य प्रदेश का सबसे आधुनिक बस टिकटिंग नेटवर्क',
      subtitle: 'हर टिकट पर ₹20 तुरंत नकद कमीशन • हर रविवार सीधा बैंक/UPI पेआउट • शून्य निवेश',
      ctaPrimaryText: 'बस टिकट खोजें',
      ctaSecondaryText: 'मुफ्त GO एजेंट बनें (कमाएं ₹20/सीट)',
      busImg: busHero,
      themeColor: 'from-[#0A2885] via-[#0D38A5] to-[#071E66]',
    },
    {
      badge: '100% ऑन-टाइम व सुरक्षित यात्रा',
      title: 'शून्य कैंसलेशन शुल्क • तत्काल WhatsApp QR ई-टिकट',
      subtitle: 'योजना बदली? पाएं 100% तुरंत रिफंड। मोबाइल फोन पर बस की सटीक लाइव लोकेशन जीपीएस से ट्रैक करें।',
      ctaPrimaryText: 'लाइव PNR चेक करें',
      ctaSecondaryText: 'सीटें देखें व बुक करें',
      busImg: busFleet1,
      themeColor: 'from-[#07246F] via-[#09359B] to-[#05184B]',
    },
    {
      badge: 'दुकानदार व CSC भाइयों का साथी',
      title: 'अपनी दुकान को बनाएं अधिकृत बस बुकिंग केंद्र!',
      subtitle: 'बिना किसी पूर्व जमा राशि के तुरंत शुरू करें। 5,000+ संतुष्ट एजेंट पहले से कमा रहे हैं स्थायी आमदनी।',
      ctaPrimaryText: 'GO एजेंट रजिस्ट्रेशन करें',
      ctaSecondaryText: 'एजेंट लॉगिन',
      busImg: busFleet2,
      themeColor: 'from-[#0A2885] via-[#1040B5] to-[#071E66]',
    },
  ];

  // Auto-play hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

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

  // Quick Wallet Recharge Simulator
  const [rechargeAmount, setRechargeAmount] = useState<number>(2000);
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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
    setActiveCardTab('book_bus');
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
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 font-sans selection:bg-[#0A2885] selection:text-white overflow-x-hidden">
      
      {/* ============================================================== */}
      {/* 1. JIO TOP SLIM UTILITY STRIP (Traveler / Agent / Operator)     */}
      {/* ============================================================== */}
      <div className="bg-[#05184B] text-slate-300 text-xs border-b border-white/10 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveSegment('traveler')}
              className={`font-bold transition cursor-pointer relative py-2 ${
                activeSegment === 'traveler' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              यात्री (Traveler)
              {activeSegment === 'traveler' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6500]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSegment('agent');
                handleJoinAgent();
              }}
              className={`font-bold transition cursor-pointer relative py-2 ${
                activeSegment === 'agent' ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              GO एजेंट (Business & CSC)
              {activeSegment === 'agent' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6500]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = buildSubdomainUrl('operator');
              }}
              className="text-slate-400 hover:text-white font-medium transition cursor-pointer"
            >
              बस ऑपरेटर (Operators)
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = buildSubdomainUrl('kisan');
              }}
              className="text-slate-400 hover:text-white font-medium transition cursor-pointer"
            >
              किसान कार्गो (Kisan)
            </button>
          </div>

          <div className="flex items-center gap-5 text-slate-300">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Phone className="w-3 h-3 text-[#FF6500]" />
              <span>24x7 हेल्पलाइन: 1800-SAFARGO</span>
            </span>
            <a
              href="https://help.safargo.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white text-[11px] transition"
            >
              सहायता केंद्र
            </a>
            <span className="text-[11px] font-bold text-amber-300 bg-white/10 px-2 py-0.5 rounded-full">
              🌐 हिन्दी
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. JIO SIGNATURE CATEGORY QUICK-STRIP (8 CIRCULAR ICON BUTTONS)*/}
      {/* ============================================================== */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-4 sm:gap-6">
            {[
              {
                id: 'bus',
                label: 'बस टिकट',
                icon: Bus,
                color: 'bg-[#0A2885] text-white',
                action: () => {
                  setActiveCardTab('book_bus');
                  if (busInventoryRef.current) {
                    busInventoryRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                },
                active: activeCardTab === 'book_bus',
              },
              {
                id: 'pnr',
                label: 'लाइव PNR',
                icon: Search,
                color: 'bg-emerald-600 text-white',
                action: () => setActiveCardTab('track_pnr'),
                active: activeCardTab === 'track_pnr',
              },
              {
                id: 'agent',
                label: 'GO एजेंट',
                icon: Zap,
                color: 'bg-[#FF6500] text-white',
                action: handleJoinAgent,
                badge: 'कमाएं ₹20',
              },
              {
                id: 'wallet',
                label: 'गो वॉलेट',
                icon: Wallet,
                color: 'bg-indigo-600 text-white',
                action: () => setActiveCardTab('wallet_recharge'),
                active: activeCardTab === 'wallet_recharge',
              },
              {
                id: 'fleet',
                label: 'सत्यापित बसें',
                icon: ShieldCheck,
                color: 'bg-cyan-600 text-white',
                action: () => {
                  if (busInventoryRef.current) {
                    busInventoryRef.current.scrollIntoView({ behavior: 'smooth' });
                  }
                },
              },
              {
                id: 'offers',
                label: 'ऑफ़र्स & छूट',
                icon: Percent,
                color: 'bg-rose-600 text-white',
                action: () => {
                  alert('SafarGo डिस्काउंट प्रोमो कोड: WELCOME50 (फ्लैट ₹50 की छूट)');
                },
              },
              {
                id: 'uber',
                label: 'Uber राइड',
                icon: Smartphone,
                color: 'bg-slate-900 text-amber-400',
                action: () => {
                  window.open('https://m.uber.com/looking', '_blank');
                },
                badge: 'ऑटो/कैब',
              },
              {
                id: 'support',
                label: '24x7 सपोर्ट',
                icon: Phone,
                color: 'bg-blue-600 text-white',
                action: () => {
                  window.open('https://help.safargo.in', '_blank');
                },
              },
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={cat.action}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 shadow-md relative ${
                      cat.color
                    } ${cat.active ? 'ring-4 ring-[#FF6500]/40 shadow-lg' : ''}`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    {cat.badge && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 shadow-xs">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-bold whitespace-nowrap transition ${
                      cat.active ? 'text-[#0A2885]' : 'text-slate-700 group-hover:text-[#0A2885]'
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. JIO-STYLE FULL-WIDTH HERO CAROUSEL STAGE                    */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0A2885] via-[#0D38A5] to-[#05184B] text-white pt-8 pb-24 sm:pt-12 sm:pb-32 px-4 sm:px-6 lg:px-8">
        
        {/* Soft Background Wave Glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#FF6500]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold shadow-inner">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{heroSlides[currentSlide].badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-[1.18]">
                {heroSlides[currentSlide].title}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                {heroSlides[currentSlide].subtitle}
              </p>

              {/* Dual Action Buttons (Jio Rounded Full Pills) */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCardTab('book_bus');
                    if (busInventoryRef.current) {
                      busInventoryRef.current.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="px-8 py-3.5 rounded-full bg-[#FF6500] hover:bg-[#e65c00] text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-600/30 transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>{heroSlides[currentSlide].ctaPrimaryText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleJoinAgent}
                  className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/30 transition-all duration-300 active:scale-95 flex items-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>{heroSlides[currentSlide].ctaSecondaryText}</span>
                </button>
              </div>

              {/* Slide Indicators (Jio style rounded dots) */}
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-4">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right Bus Showcase Visual */}
            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative group max-w-md w-full">
                <div className="w-full h-64 sm:h-80 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-md flex items-center justify-center p-6 relative overflow-hidden shadow-2xl">
                  <img
                    src={heroSlides[currentSlide].busImg}
                    alt="SafarGo Bus"
                    className="max-h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)] transform group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Floating Certified Pill */}
                  <div className="absolute top-4 left-4 bg-slate-950/80 px-3 py-1 rounded-full border border-amber-400 text-xs font-black text-amber-300 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SafarGo Verified Bus ✓</span>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-[#FF6500] px-3 py-1 rounded-full text-white text-[11px] font-black shadow-lg">
                    +₹20 एजेंट कमीशन
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. JIO-STYLE FLOATING RECHARGE & BOOKING CARD (White Rounded-3XL)*/}
      {/* ============================================================== */}
      <section className="relative z-20 -mt-16 sm:-mt-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,40,133,0.15)] space-y-6">
          
          {/* Card Top Tabs (Jio Styled Pill Bar) */}
          <div className="flex bg-slate-100 p-1.5 rounded-full max-w-lg mx-auto border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveCardTab('book_bus')}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                activeCardTab === 'book_bus'
                  ? 'bg-[#0A2885] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Bus className="w-4 h-4" />
              <span>बस टिकट खोजें</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCardTab('track_pnr')}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                activeCardTab === 'track_pnr'
                  ? 'bg-[#0A2885] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>लाइव PNR चेक</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCardTab('wallet_recharge')}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                activeCardTab === 'wallet_recharge'
                  ? 'bg-[#0A2885] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>वॉलेट रीचार्ज</span>
            </button>
          </div>

          {/* TAB 1: BUS SEARCH & AUTOCOMPLETE */}
          {activeCardTab === 'book_bus' && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Popular Routes Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-slate-400 text-[11px] font-bold shrink-0 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-[#0A2885]" />
                  <span>लोकप्रिय रूट:</span>
                </span>
                {[
                  { from: 'Bhopal', to: 'Indore', label: 'भोपाल ➔ इंदौर (₹350 से)' },
                  { from: 'Indore', to: 'Ujjain', label: 'इंदौर ➔ उज्जैन (₹120 से)' },
                  { from: 'Bhopal', to: 'Jabalpur', label: 'भोपाल ➔ जबलपुर (₹450 से)' },
                  { from: 'Sironj', to: 'Bhopal', label: 'सिरोंज ➔ भोपाल (₹220 से)' },
                  { from: 'Gwalior', to: 'Bhopal', label: 'ग्वालियर ➔ भोपाल (₹600 से)' },
                  { from: 'Ratlam', to: 'Indore', label: 'रतलाम ➔ इंदौर (₹250 से)' },
                ].map((r) => (
                  <button
                    key={`${r.from}-${r.to}`}
                    type="button"
                    onClick={() => handleSelectPopularRoute(r.from, r.to)}
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                      searchSource === r.from && searchDestination === r.to
                        ? 'bg-[#0A2885] text-white border-[#0A2885] font-black shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-[#0A2885]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs">
                
                {/* 1. From City */}
                <div className="sm:col-span-4 relative" ref={sourceDropdownRef}>
                  <label className="block text-slate-600 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0A2885]" />
                      <span>कहाँ से (Source City) *</span>
                    </span>
                    <span className="text-[10px] text-blue-600 font-normal">ऑटो-सजेशन</span>
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
                      className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#0A2885] focus:bg-white rounded-2xl text-slate-900 font-black text-sm outline-none transition placeholder:text-slate-400"
                    />
                    {searchSource && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchSource('');
                          setShowSourceDropdown(true);
                        }}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showSourceDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#0A2885] rounded-2xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto no-scrollbar animate-fadeIn">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 mb-1">
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
                            className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition flex items-center justify-between text-left group"
                          >
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#0A2885] text-xs">
                                {item.hindiName} ({item.cityName})
                              </div>
                              <div className="text-[11px] text-slate-500">
                                📍 {item.station}
                              </div>
                            </div>
                            {item.popular && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#0A2885]">
                                प्रमुख
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-500 text-xs">कोई शहर नहीं मिला।</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. City Swap Button */}
                <div className="sm:col-span-1 flex justify-center pb-1">
                  <button
                    type="button"
                    onClick={handleSwapCities}
                    className="p-3 rounded-full bg-slate-100 hover:bg-blue-50 border border-slate-300 hover:border-[#0A2885] text-[#0A2885] transition-all duration-300 active:rotate-180 cursor-pointer shadow-xs"
                    title="शहर बदलें"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3. To City */}
                <div className="sm:col-span-4 relative" ref={destDropdownRef}>
                  <label className="block text-slate-600 font-bold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF6500]" />
                      <span>कहाँ तक (Destination City) *</span>
                    </span>
                    <span className="text-[10px] text-orange-600 font-normal">ऑटो-सजेशन</span>
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
                      className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#0A2885] focus:bg-white rounded-2xl text-slate-900 font-black text-sm outline-none transition placeholder:text-slate-400"
                    />
                    {searchDestination && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchDestination('');
                          setShowDestDropdown(true);
                        }}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  {showDestDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#0A2885] rounded-2xl shadow-2xl p-2 z-50 max-h-64 overflow-y-auto no-scrollbar animate-fadeIn">
                      <div className="px-3 py-1.5 text-[10px] uppercase font-black text-slate-400 border-b border-slate-100 mb-1">
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
                            className="p-2.5 rounded-xl hover:bg-blue-50 cursor-pointer transition flex items-center justify-between text-left group"
                          >
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#0A2885] text-xs">
                                {item.hindiName} ({item.cityName})
                              </div>
                              <div className="text-[11px] text-slate-500">
                                📍 {item.station}
                              </div>
                            </div>
                            {item.popular && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-[#0A2885]">
                                प्रमुख
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-center text-slate-500 text-xs">कोई शहर नहीं मिला।</div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. Journey Date */}
                <div className="sm:col-span-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-600 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0A2885]" />
                      <span>यात्रा की तारीख *</span>
                    </label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(0)}
                        className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-100 text-[#0A2885] text-[10px] font-bold cursor-pointer"
                      >
                        आज
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetQuickDate(1)}
                        className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-blue-100 text-[#0A2885] text-[10px] font-bold cursor-pointer"
                      >
                        कल
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#0A2885] focus:bg-white rounded-2xl text-slate-900 font-black text-sm outline-none transition"
                  />
                </div>

              </div>

              {/* Jio Pill Search CTA */}
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={() => {
                    if (busInventoryRef.current) {
                      busInventoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className="w-full sm:w-auto px-12 py-4 rounded-full bg-[#0A2885] hover:bg-[#081F66] text-white font-black text-sm shadow-xl shadow-blue-900/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>उपलब्ध बसें व सीटें खोजें ({searchSource} ➔ {searchDestination})</span>
                </button>
              </div>

            </div>
          )}

          {/* TAB 2: PNR TRACKER */}
          {activeCardTab === 'track_pnr' && (
            <div className="space-y-4 animate-fadeIn">
              <form onSubmit={handleTrackPnr} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
                  <input
                    type="text"
                    value={pnrInput}
                    onChange={(e) => setPnrInput(e.target.value)}
                    placeholder="अपना 6-अंकीय PNR, बुकिंग कोड (SFG-...) या यात्री मोबाइल नंबर दर्ज करें..."
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-[#0A2885] focus:bg-white rounded-2xl text-slate-900 font-mono text-xs outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#0A2885] hover:bg-[#081F66] text-white font-black rounded-full text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Search className="w-4 h-4" />
                  <span>PNR ट्रैक करें</span>
                </button>
              </form>

              {pnrSearched && (
                <div>
                  {trackedBooking ? (
                    <div className="p-5 rounded-3xl bg-slate-50 border-2 border-emerald-500/50 space-y-4 animate-fadeIn text-xs shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 text-base font-mono">{trackedBooking.booking_code}</strong>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                              PNR: {trackedBooking.ticket_pnr || 'CONFIRMED'} ✓
                            </span>
                          </div>
                          <p className="text-slate-700 font-bold mt-1 text-sm">
                            {trackedBooking.from_city} ➔ {trackedBooking.to_city} • यात्रा: {trackedBooking.journey_date}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xl font-black text-[#0A2885] font-mono">
                            ₹{(trackedBooking.total_fare || trackedBooking.actual_fare || 450).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-600 block font-bold">स्थिति: कन्फर्म ✓</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
                        <div>यात्री: <strong className="text-slate-900 block">{trackedBooking.customer_name}</strong></div>
                        <div>मोबाइल: <strong className="text-slate-900 font-mono block">+91 {trackedBooking.customer_mobile}</strong></div>
                        <div>सीट: <strong className="text-emerald-700 font-mono block">{trackedBooking.confirmed_seats || '1 Seat'}</strong></div>
                        <div>बस ऑपरेटर: <strong className="text-slate-900 block">{trackedBooking.actual_operator || 'SafarGo Superfast Express'}</strong></div>
                      </div>

                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const msg = getWhatsAppTicketMessage(trackedBooking);
                            window.open(`https://wa.me/91${trackedBooking.customer_mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                          }}
                          className="py-2.5 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>WhatsApp पर टिकट प्राप्त करें</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPrintBooking(trackedBooking)}
                          className="py-2.5 px-4 rounded-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रिंट / PDF टिकट डाउनलोड</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-200 space-y-1">
                      <p className="text-sm font-bold text-rose-600">कोई कन्फर्म टिकट नहीं मिली!</p>
                      <p className="text-xs text-slate-500">कृपया अपना PNR, बुकिंग कोड अथवा रजिस्टर्ड मोबाइल नंबर सही से जांचें।</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AGENT WALLET RECHARGE QUICK SIMULATOR */}
          {activeCardTab === 'wallet_recharge' && (
            <div className="space-y-4 animate-fadeIn text-xs">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#0A2885] text-sm">GO Agent प्रीपेड वॉलेट रीचार्ज</h4>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    न्यूनतम ₹2,000 रीचार्ज मॉडल। शून्य गेटवे चार्ज, तुरंत 10-मिनट QR अप्रूवल।
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">कमीशन लाभ</span>
                  <span className="text-emerald-700 font-bold text-xs">+₹20 नकद/टिकट</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {[2000, 3000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setRechargeAmount(amt);
                      setRechargeSuccess(false);
                    }}
                    className={`flex-1 py-3 rounded-2xl font-black text-sm border-2 transition cursor-pointer ${
                      rechargeAmount === amt
                        ? 'border-[#0A2885] bg-blue-50 text-[#0A2885]'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={handleJoinAgent}
                  className="px-10 py-3.5 rounded-full bg-[#0A2885] hover:bg-[#081F66] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>₹{rechargeAmount.toLocaleString('en-IN')} रीचार्ज करें (Agent Terminal)</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. JIO "IN THE SPOTLIGHT" / विशेष आकर्षण 4-COLUMN CARDS         */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <span className="text-xs uppercase font-black text-[#0A2885] tracking-wider block">
              IN THE SPOTLIGHT
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              विशेष आकर्षण व सफ़ारगो लाभ
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            मध्य प्रदेश के प्रत्येक यात्री और अधिकृत GO एजेंट को मिलने वाले अद्वितीय लाभ।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Flat ₹20 Commission */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#0A2885] transition-all duration-300 hover:shadow-xl space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0A2885] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Wallet className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                एजेंट कमाई
              </span>
              <h3 className="text-base font-black text-slate-900">फ्लैट ₹20 नकद कमीशन</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                प्रत्येक कन्फर्म सीट बुकिंग पर सीधे ₹20 आपके Go Wallet में तुरंत जमा होते हैं। शून्य निवेश, 5 मिनट एक्टिवेशन।
              </p>
            </div>
          </div>

          {/* Card 2: Sunday Payouts */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-600 transition-all duration-300 hover:shadow-xl space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Calendar className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                साप्ताहिक पेआउट
              </span>
              <h3 className="text-base font-black text-slate-900">हर रविवार सीधा बैंक पेआउट</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                कोई लंबा इंतजार नहीं! हर रविवार आपकी समस्त कमाई बिना किसी शुल्क के आपके बैंक खाते या UPI में ट्रांसफर होती है।
              </p>
            </div>
          </div>

          {/* Card 3: Zero Cancellation Fee */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-orange-500 transition-all duration-300 hover:shadow-xl space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6500] flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
                यात्री सुविधा
              </span>
              <h3 className="text-base font-black text-slate-900">शून्य कैंसलेशन शुल्क</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                प्लान बदल गया? यात्रा से पहले टिकट रद्द करने पर बिना किसी कटौती के 100% रिफंड सीधे वॉलेट या बैंक में।
              </p>
            </div>
          </div>

          {/* Card 4: Live GPS Tracking */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-indigo-600 transition-all duration-300 hover:shadow-xl space-y-4 group">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black group-hover:scale-110 transition-transform">
              <Navigation className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                सटीक लोकेशन
              </span>
              <h3 className="text-base font-black text-slate-900">लाइव GPS बस ट्रैकिंग</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                बस स्टॉप पर घंटों इंतजार नहीं। अपने मोबाइल फोन व WhatsApp पर बस की रियल-टाइम लोकेशन और बोर्डिंग समय देखें।
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. ABHIBUS / REDBUS LIVE BUS INVENTORY & SEAT SELECTION        */}
      {/* ============================================================== */}
      <section ref={busInventoryRef} className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        
        {/* Header with Bus Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                उपलब्ध बसें: {searchSource} ➔ {searchDestination}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              दिनांक: <span className="text-[#0A2885] font-bold">{formattedDisplayDate} ({searchDate})</span> • {availableBusesList.length} प्रमाणित बसें उपलब्ध
            </p>
          </div>

          {/* Category Filter Pills */}
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
                className={`px-4 py-2 rounded-full font-bold transition whitespace-nowrap cursor-pointer ${
                  activeBusFilter === f.id
                    ? 'bg-[#0A2885] text-white font-black shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bus Cards List */}
        <div className="space-y-4">
          {availableBusesList.map((bus) => (
            <div
              key={bus.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 hover:border-[#0A2885] transition-all duration-300 shadow-sm hover:shadow-lg group space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                
                {/* Left: Thumbnail & Operator Details */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-24 h-20 sm:w-28 sm:h-20 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative group-hover:scale-105 transition-transform">
                    <img src={bus.image} alt={bus.name} className="w-full h-full object-contain" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[8px] leading-none">
                      SafarGo
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">{bus.name}</h3>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{bus.rating} / 5.0</span>
                        <span className="text-slate-400 font-normal">({bus.reviewsCount})</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0A2885] text-[10px] font-bold border border-blue-200">
                        🛡️ SafarGo Verified Bus ✓
                      </span>
                    </div>

                    <div className="text-xs text-slate-500">
                      प्रकार: <span className="text-slate-800 font-bold">{bus.type}</span> • ऑपरेटर: <span className="text-slate-900 font-bold">{bus.operator}</span>
                    </div>

                    {/* Amenities Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {bus.amenities.map((amenity, aIdx) => (
                        <span key={aIdx} className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[10px] font-mono border border-slate-200">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Middle: Timing Journey Line */}
                <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-base font-black text-[#0A2885] block">{bus.time}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[110px] block">{bus.boarding}</span>
                  </div>

                  <div className="text-center flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-mono">{bus.duration}</span>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-[#0A2885] to-[#FF6500] relative my-1">
                      <div className="w-2 h-2 rounded-full bg-[#0A2885] absolute -top-0.75 left-1/2 -translate-x-1/2" />
                    </div>
                    <span className="text-[9px] text-emerald-700 font-bold">{bus.seats} सीटें खाली</span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 block">{bus.reachTime}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[110px] block">{bus.dropping}</span>
                  </div>
                </div>

                {/* Right: Fare & Booking Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div className="text-left lg:text-right">
                    <span className="text-2xl font-black text-[#0A2885] font-mono block">₹{bus.fare}</span>
                    <span className="text-[10px] text-emerald-600 font-bold block">+₹20 एजेंट कमीशन</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewSeatBus(bus)}
                      className="py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer border border-slate-300"
                    >
                      सीटें देखें
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSeatBus(bus)}
                      className="py-2.5 px-5 rounded-full bg-[#FF6500] hover:bg-[#e65c00] text-white font-black text-xs transition cursor-pointer shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <span>सीट चुनें</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ============================================================== */}
      {/* 7. OFFICIAL PARTNER OPERATORS CAROUSEL                         */}
      {/* ============================================================== */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-black text-[#0A2885] tracking-wider block">
                OFFICIAL PARTNERS
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                मध्य प्रदेश के प्रमुख प्रमाणित बस ऑपरेटर
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
                className="p-4 rounded-3xl bg-slate-50 border border-slate-200 hover:border-[#0A2885] transition-all duration-300 hover:shadow-md space-y-2 group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 text-[#0A2885] flex items-center justify-center font-black mx-auto group-hover:scale-110 transition-transform">
                  <Bus className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#0A2885] transition">{op.name}</h4>
                <span className="inline-block text-[10px] text-[#0A2885] font-mono bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {op.rating}
                </span>
                <p className="text-[10px] text-slate-500 leading-tight">{op.type}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. JIO-STYLE FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)        */}
      {/* ============================================================== */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-black text-[#0A2885] tracking-wider block">
            HELP & FAQs
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            अक्सर पूछे जाने वाले प्रश्न (FAQs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            SafarGo बस टिकटिंग व GO एजेंट नेटवर्क से जुड़े सामान्य प्रश्नों के उत्तर।
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'SafarGo पर टिकट बुक करने के बाद ई-टिकट कैसे प्राप्त होगी?',
              a: 'बुकिंग कन्फर्म होते ही आधिकारिक डिजिटल ई-टिकट सीधे आपके द्वारा दर्ज मोबाइल नंबर पर WhatsApp के माध्यम से तत्काल भेजी जाती है, जिसमें PNR, सीट संख्या, बोर्डिंग पॉइंट व QR कोड शामिल होता है।'
            },
            {
              q: 'GO एजेंट को प्रत्येक टिकट पर कितना कमीशन मिलता है?',
              a: 'प्रत्येक कन्फर्म टिकट पर GO एजेंट को फ्लैट ₹20 नकद कमीशन मिलता है। यह राशि सीधे आपके Go Wallet में तुरंत क्रेडिट होती है।'
            },
            {
              q: 'साप्ताहिक पेआउट कब और कैसे प्राप्त होता है?',
              a: 'हर रविवार को आपके वॉलेट की समस्त कमीशन राशि बिना किसी शुल्क के सीधे आपके रजिस्टर्ड बैंक खाते अथवा UPI ID में स्वतः ट्रांसफर कर दी जाती है।'
            },
            {
              q: 'यदि बस में सीट नहीं मिली या टिकट रद्द हो गई तो रिफंड कैसे मिलेगा?',
              a: 'यदि ऑपरेटर स्तर पर सीट उपलब्ध नहीं होती है या आप यात्रा से पूर्व टिकट रद्द करते हैं, तो 100% राशि तुरंत बिना किसी कैंसलेशन चार्ज के आपके वॉलेट या मूल भुगतान माध्यम में रिफंड की जाती है।'
            },
            {
              q: 'क्या GO एजेंट बनने के लिए कोई रजिस्ट्रेशन शुल्क या डिपॉजिट देना पड़ता है?',
              a: 'बिल्कुल नहीं! SafarGo GO एजेंट बनना 100% मुफ्त है। आपको शून्य निवेश में केवल 5 मिनट में अपनी दुकान को अधिकृत टिकटिंग केंद्र बनाने की सुविधा मिलती है।'
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <button
                type="button"
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-black text-slate-900 text-xs sm:text-sm flex items-center justify-between gap-4 cursor-pointer hover:text-[#0A2885]"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#0A2885] shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-fadeIn">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. JIO-STYLE MEGA FOOTER (DEEP MIDNIGHT BLUE)                  */}
      {/* ============================================================== */}
      <footer className="bg-[#05184B] text-slate-300 text-xs pt-12 pb-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand Info */}
            <div className="space-y-4">
              <SafarGoLogo size="md" variant="light" showTagline={false} />
              <p className="text-slate-400 leading-relaxed text-[11px]">
                मध्य प्रदेश का सबसे बड़ा डिजिटल व अधिकृत GO एजेंट बस टिकटिंग नेटवर्क। स्थानीय जन सेवा केंद्रों व किराना दुकानदारों को स्थायी स्वरोजगार।
              </p>
              <div className="text-[11px] text-amber-400 font-bold">
                टैगलाइन: "अब हर सफर होगा आसान"
              </div>
            </div>

            {/* Col 2: Services */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-xs uppercase tracking-wider">हमारी सेवाएं</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><button onClick={() => { setActiveCardTab('book_bus'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">ऑनलाइन बस टिकटिंग</button></li>
                <li><button onClick={handleJoinAgent} className="hover:text-white transition">GO एजेंट नेटवर्क</button></li>
                <li><button onClick={() => { setActiveCardTab('track_pnr'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition">लाइव PNR ट्रैकिंग</button></li>
                <li><a href="https://pay.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">3D Go Wallet</a></li>
                <li><a href="https://operator.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">ऑपरेटर कंसोल</a></li>
              </ul>
            </div>

            {/* Col 3: Support */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-xs uppercase tracking-wider">सपोर्ट व सहायता</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li><a href="https://help.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">हेल्प सेंटर (help.safargo.in)</a></li>
                <li><span className="text-[11px]">हेल्पलाइन: 1800-SAFARGO (टोल-फ्री)</span></li>
                <li><span className="text-[11px]">WhatsApp सहायता: +91 98765 43210</span></li>
                <li><span className="text-[11px]">ईमेल: support@safargo.in</span></li>
                <li><span className="text-[11px]">24 घंटे समाधान गारंटी</span></li>
              </ul>
            </div>

            {/* Col 4: Trust Badges */}
            <div className="space-y-3">
              <h4 className="font-black text-white text-xs uppercase tracking-wider">सुरक्षा व गारंटी</h4>
              <div className="space-y-2 text-slate-400 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% सत्यापित बस ऑपरेटर</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>0% कैंसलेशन झंझट गारंटी</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>हर रविवार सीधा बैंक पेआउट</span>
                </div>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              © {new Date().getFullYear()} SafarGo Technologies India Private Limited. सर्वाधिकार सुरक्षित।
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button type="button" onClick={handleLoginAgent} className="hover:text-white">एजेंट लॉगिन</button>
              <a href="https://admin.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">एडमिन कंसोल</a>
              <a href="https://help.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">प्राइवेसी पॉलिसी</a>
              <a href="https://help.safargo.in" target="_blank" rel="noopener noreferrer" className="hover:text-white">नियम व शर्तें</a>
            </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-5 animate-scaleUp text-xs max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-10 bg-slate-50 rounded-xl p-1 border border-slate-200 flex items-center justify-center shrink-0">
                  <img src={previewSeatBus.image} alt={previewSeatBus.name} className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-black text-slate-900">{previewSeatBus.name}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[9px] font-black border border-emerald-200">
                      SafarGo Verified ✓
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">{previewSeatBus.type} • प्रस्थान: {previewSeatBus.time}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewSeatBus(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Deck Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setDeckTab('lower')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer ${
                  deckTab === 'lower' ? 'bg-[#0A2885] text-white font-black shadow-xs' : 'text-slate-600'
                }`}
              >
                लोअर डेक (Lower)
              </button>
              <button
                type="button"
                onClick={() => setDeckTab('upper')}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition cursor-pointer ${
                  deckTab === 'upper' ? 'bg-[#0A2885] text-white font-black shadow-xs' : 'text-slate-600'
                }`}
              >
                अपर डेक (Upper)
              </button>
            </div>

            {/* Interactive Seat Matrix */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-slate-200 pb-2">
                <span>केबिन फ्रंट (Driver 💺)</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-white border border-slate-300" /> खाली
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-[#0A2885]" /> चुनी हुई
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-slate-300 opacity-60" /> बुक
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
                          ? 'bg-slate-200 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#0A2885] text-white font-black shadow-md scale-105 border-2 border-[#0A2885]'
                          : 'bg-white hover:bg-blue-50 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {seatNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selection Summary */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">चुनी गई सीटें:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'कोई नहीं'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px]">कुल किराया:</span>
                <span className="text-base font-black text-[#0A2885] font-mono">
                  ₹{(previewSeatBus.fare * Math.max(1, selectedSeats.length)).toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-600 block font-bold">+₹20 नकद कमीशन</span>
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
                className="flex-1 py-3.5 rounded-full bg-[#FF6500] hover:bg-[#e65c00] text-white font-black text-xs transition cursor-pointer shadow-lg text-center"
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
