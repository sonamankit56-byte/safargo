import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { GoAgentWithdrawalModal } from './GoAgentWithdrawalModal';
import { GoInstantAddMoneyModal } from './GoInstantAddMoneyModal';
import { WalletRechargeModal } from './WalletRechargeModal';
import { LiveTicketGreenCard } from '../common/LiveTicketGreenCard';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { RedBusSeatMapModal, SelectedSeatItem } from '../bus/RedBusSeatMapModal';
import { AutoBusBookingCheckoutModal } from '../bus/AutoBusBookingCheckoutModal';
import { AutoRedBusBookingView } from '../bus/AutoRedBusBookingView';
import { UberAgentAssistModal } from './UberAgentAssistModal';
import { buildUberRideUrl, getUberBoardingAssistUrl, getUberDropAssistUrl } from '../../lib/uberService';
import {
  enrichWalletTransaction,
  TRANSACTION_SOURCE_METAS,
} from '../../lib/transactionUtils';
import { WalletTransactionSource } from '../../types';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { Booking, BookingStatus, BusTrip, SeatCategory } from '../../types';
import { compressImage } from '../../lib/storageUtils';
import { getWhatsAppTicketMessage } from '../../lib/whatsappService';
import { buildSubdomainUrl } from '../../lib/subdomain';

import busImgSuperfast from '../../assets/bus1.png';
import busImgSleeper from '../../assets/bus2.png';
import busImgIntercity from '../../assets/bus3.png';
import busImgGramin from '../../assets/bus4.png';
import {
  LayoutDashboard,
  Bus,
  Car,
  Wallet,
  User,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  RotateCcw,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Sparkles,
  Building,
  MapPin,
  Phone,
  Mail,
  Award,
  Upload,
  LogOut,
  Zap,
  ArrowRight,
  X,
  FileText,
  Send,
  Calendar,
  Repeat,
  Lock,
  Gift,
  Camera,
  Save,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  Tag,
  History,
  RefreshCw,
} from 'lucide-react';

interface GoAgentDashboardProps {
  onNavigateHome?: () => void;
  onOpenBookingModal?: () => void;
}

// Dedicated 5-Minute Live Countdown Timer for GO Agent Bookings
const BookingApprovalTimer: React.FC<{ createdAt: string; deadlineAt?: string }> = ({
  createdAt,
  deadlineAt,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const target = deadlineAt
      ? new Date(deadlineAt).getTime()
      : new Date(createdAt).getTime() + 5 * 60 * 1000;
    return Math.max(0, Math.floor((target - Date.now()) / 1000));
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = deadlineAt
        ? new Date(deadlineAt).getTime()
        : new Date(createdAt).getTime() + 5 * 60 * 1000;
      const diff = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setSecondsLeft(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [createdAt, deadlineAt]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (secondsLeft <= 0) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-950/90 border border-orange-500/50 text-orange-300 text-xs font-mono font-bold animate-pulse">
        <Clock className="w-3.5 h-3.5 text-orange-400" />
        <span>स्वीकृति प्रक्रियाधीन (High Priority Desk)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/90 border border-amber-400/80 text-amber-300 font-mono font-black shadow-inner">
      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
      <span className="font-sans text-xs font-bold text-slate-300">5-मिनट अप्रूवल टाइमर:</span>
      <span className="text-sm font-black text-amber-300 tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-amber-400/50">
        {formatted}
      </span>
    </div>
  );
};

// Safe Booking Data Extraction Helpers
const getBookingFare = (b: Booking | null | undefined): number => {
  if (!b) return 0;
  return Number(b.actual_fare ?? b.total_estimated_amount ?? b.estimated_fare ?? (b as any).total_fare ?? 0);
};

const getBookingSeats = (b: Booking): string => {
  if (b.confirmed_seats) return b.confirmed_seats;
  if (Array.isArray((b as any).seat_numbers)) return (b as any).seat_numbers.join(', ');
  if (Array.isArray(b.passenger_details)) {
    const seats = b.passenger_details.map((p) => p.seat_number).filter(Boolean);
    if (seats.length > 0) return seats.join(', ');
  }
  return `${b.seat_count || 1} Seat(s)`;
};

const getBookingRoute = (b: Booking) => {
  const from = b.from_city || (b as any).source || 'Sironj';
  const to = b.to_city || (b as any).destination || 'Bhopal';
  const operator = b.actual_operator || b.operator_preference || (b as any).bus_operator || 'SafarGo Express';
  return { from, to, operator };
};

export const GoAgentDashboard: React.FC<GoAgentDashboardProps> = ({
  onNavigateHome,
}) => {
  const { currentUser, role, logout, submitAgentKyc, updateProfile } = useAuth();
  const {
    agentBookings,
    agentWalletBalance,
    agentWalletTransactions,
    createBooking,
    busTrips,
    agentSupportTickets,
    createSupportTicket,
    agentPayoutRequests,
  } = useData();
  const { success, error, info } = useToast();

  // Exactly 4 Bottom Navigation Options:
  // 1: 'dashboard', 2: 'booking', 3: 'history', 4: 'account'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'booking' | 'history' | 'account'>('dashboard');

  // Booking Tab Mode: 'auto' (Interactive Bus Search & RedBus Seat Map) vs 'manual' (Fast Track Form)
  const [bookingMode, setBookingMode] = useState<'auto' | 'manual'>('auto');

  // Wallet History & Origin: Source Filter & Search
  const [walletSourceFilter, setWalletSourceFilter] = useState<WalletTransactionSource | 'all'>('all');
  const [walletSearchTerm, setWalletSearchTerm] = useState('');

  // Booking Tab: Active Pending Booking Id (for 5-min timer & auto-confirmation polling)
  const [activePendingBookingId, setActivePendingBookingId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(`safargo_pending_booking_${currentUser?.id}`);
      return saved || null;
    } catch {
      return null;
    }
  });

  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const handleManualRefreshStatus = () => {
    setIsRefreshingStatus(true);
    info('जांच जारी है...', 'एडमिन व ऑपरेटर स्टेटस पुनः चेक किया जा रहा है...');
    setTimeout(() => {
      setIsRefreshingStatus(false);
      try {
        const raw = localStorage.getItem('safargo_bookings_v1');
        if (raw) {
          const list = JSON.parse(raw);
          const found = list.find((b: any) => b.id === activePendingBookingId || b.booking_code === activePendingBookingId);
          if (found && (found.status === 'confirmed' || found.status === 'approved')) {
            success('🎉 टिकट कन्फर्म हो गई!', `PNR: ${found.ticket_pnr || 'CONFIRMED'} जारी हो चुका है। ₹20 कमीशन Go Wallet में जमा!`);
          } else {
            info('प्रक्रियाधीन', 'आपकी टिकट ऑपरेटर सत्यापन में है, कृपया कुछ क्षण प्रतीक्षा करें।');
          }
        }
      } catch {}
    }, 600);
  };

  // History Tab: Filter ('all' | 'pending' | 'confirmed' | 'cancelled') & Search
  const [historyFilter, setHistoryFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled'>('all');
  const [historySearchTerm, setHistorySearchTerm] = useState('');

  // Modals
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isInstantAddMoneyModalOpen, setIsInstantAddMoneyModalOpen] = useState(false);
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isUberModalOpen, setIsUberModalOpen] = useState(false);
  const [uberDefaultDestination, setUberDefaultDestination] = useState('');
  const [selectedGreenCardBooking, setSelectedGreenCardBooking] = useState<Booking | null>(null);
  const [selectedPrintBooking, setSelectedPrintBooking] = useState<Booking | null>(null);
  const [selectedTripForSeatMap, setSelectedTripForSeatMap] = useState<BusTrip | null>(null);
  const [autoCheckoutData, setAutoCheckoutData] = useState<{
    trip: BusTrip;
    selectedSeats: SelectedSeatItem[];
    totalFare: number;
    seatCategory: SeatCategory;
    boardingPoint: string;
    dropPoint: string;
  } | null>(null);

  // New Ticket Booking Form State
  const [bookingSource, setBookingSource] = useState('Sironj');
  const [bookingDestination, setBookingDestination] = useState('Bhopal');
  const [bookingDate, setBookingDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [passengerName, setPassengerName] = useState('');
  const [passengerAge, setPassengerAge] = useState('28');
  const [passengerGender, setPassengerGender] = useState<'M' | 'F' | 'O'>('M');
  const [passengerMobile, setPassengerMobile] = useState('');
  const [selectedSeatCount, setSelectedSeatCount] = useState<number>(1);
  const [selectedBusOperator, setSelectedBusOperator] = useState('SafarGo Superfast Express (AC)');
  const [baseFarePerSeat, setBaseFarePerSeat] = useState<number>(450);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Profile Edit State
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profileShopName, setProfileShopName] = useState(currentUser?.shop_name || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileDistrict, setProfileDistrict] = useState(currentUser?.district || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // KYC Submission Form State (for not_submitted / rejected agents)
  const [kycAadhaar, setKycAadhaar] = useState('');
  const [kycPan, setKycPan] = useState('');
  const [kycBankHolder, setKycBankHolder] = useState(currentUser?.full_name || '');
  const [kycBankName, setKycBankName] = useState('');
  const [kycBankAcc, setKycBankAcc] = useState('');
  const [kycBankIfsc, setKycBankIfsc] = useState('');
  const [kycUpiId, setKycUpiId] = useState('');
  const [kycAadhaarFrontUrl, setKycAadhaarFrontUrl] = useState('');
  const [kycPanCardUrl, setKycPanCardUrl] = useState('');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Support Ticket Form State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportDescription, setSupportDescription] = useState('');
  const [isSubmittingSupportTicket, setIsSubmittingSupportTicket] = useState(false);
  const [isSupportFormOpen, setIsSupportFormOpen] = useState(false);

  // Safe Guard: Check Role
  if (!currentUser || role !== 'agent') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <Go3DUltraLogo size="md" showBadge={false} />
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-black text-amber-400">लॉगिन आवश्यक है (Agent Login Required)</h2>
          <p className="text-xs text-slate-400">
            GO Agent टर्मिनल का उपयोग करने हेतु कृपया अपने अधिकृत एजेंट क्रेडेंशियल्स से लॉगिन करें।
          </p>
        </div>
        <button
          onClick={() => {
            if (onNavigateHome) onNavigateHome();
            else window.location.href = '/';
          }}
          className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer"
        >
          पोर्टल होम पर जाएं
        </button>
      </div>
    );
  }

  // Load profile values on currentUser change
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.full_name || '');
      setProfileShopName(currentUser.shop_name || '');
      setProfileAddress(currentUser.address || '');
      setProfileCity(currentUser.city || '');
      setProfileDistrict(currentUser.district || '');
      setProfileAvatarUrl(currentUser.avatar_url || '');
    }
  }, [currentUser]);

  // BACK BUTTON TRAP: Prevent exiting website when back is pressed
  useEffect(() => {
    window.history.pushState({ app: 'safargo_agent_terminal' }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // Re-push state so user stays inside the app
      window.history.pushState({ app: 'safargo_agent_terminal' }, '', window.location.href);

      if (activePendingBookingId) {
        info('बुकिंग प्रक्रियाधीन है', 'आपकी टिकट अप्रूवल प्रक्रियाधीन है, कृपया बैक न जाएं।');
      } else {
        // If on another tab, navigate back to dashboard
        setActiveTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activePendingBookingId]);

  // AUTO-POLLING FOR PENDING BOOKING: Detects admin approval in real-time
  const myGoBookings = useMemo(() => {
    return (agentBookings || []).filter(
      (b) => b.agent_id === currentUser?.id || (currentUser?.mobile && b.agent_mobile === currentUser.mobile)
    );
  }, [agentBookings, currentUser]);

  const activePendingBooking = useMemo(() => {
    if (!activePendingBookingId) return null;
    return (
      myGoBookings.find(
        (b) => b.id === activePendingBookingId || b.booking_code === activePendingBookingId
      ) || null
    );
  }, [activePendingBookingId, myGoBookings]);

  useEffect(() => {
    if (activePendingBooking) {
      if (activePendingBooking.status === 'confirmed' || (activePendingBooking as any).status === 'approved') {
        success('🎉 टिकट कन्फर्म हो गई!', `PNR: ${activePendingBooking.ticket_pnr || 'OK'} जारी हो चुका है। ₹20 कमीशन Go Wallet में जमा!`);
      }
    }
  }, [activePendingBooking?.status]);

  // Metric Stats
  const confirmedBookings = myGoBookings.filter((b) => b.status === 'confirmed' || (b as any).status === 'approved');
  const confirmedCount = confirmedBookings.length;
  const totalCommissionEarned = confirmedCount * 20;

  // Support Tickets Stats
  const pendingSupportCount = (agentSupportTickets || []).filter(
    (t) => t.status === 'pending' || t.status === 'open'
  ).length;
  const resolvedSupportCount = (agentSupportTickets || []).filter(
    (t) => t.status === 'resolved' || t.status === 'closed'
  ).length;

  // Pending Payout Request check
  const activePendingPayout = (agentPayoutRequests || []).find(
    (p) => p.status === 'pending' || p.status === 'processing'
  );

  // Enriched and Filtered Wallet Transactions for Money Origin History
  const enrichedWalletTransactions = useMemo(() => {
    return (agentWalletTransactions || []).map(enrichWalletTransaction);
  }, [agentWalletTransactions]);

  const filteredWalletTransactions = useMemo(() => {
    return enrichedWalletTransactions.filter((tx) => {
      // 1. Source Filter
      if (walletSourceFilter !== 'all' && tx.source_category !== walletSourceFilter) {
        return false;
      }
      // 2. Search Filter
      if (walletSearchTerm.trim()) {
        const q = walletSearchTerm.toLowerCase().trim();
        const matchName = tx.transaction_name?.toLowerCase().includes(q);
        const matchSrc = tx.source_name?.toLowerCase().includes(q);
        const matchDesc = tx.description?.toLowerCase().includes(q);
        const matchCode = tx.booking_code?.toLowerCase().includes(q);
        const matchDetails = tx.source_details?.toLowerCase().includes(q);
        if (!matchName && !matchSrc && !matchDesc && !matchCode && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [enrichedWalletTransactions, walletSourceFilter, walletSearchTerm]);

  // Filtered History
  const filteredHistoryBookings = useMemo(() => {
    return myGoBookings.filter((b) => {
      // Status Filter
      if (historyFilter === 'pending') {
        return b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation';
      } else if (historyFilter === 'confirmed') {
        return b.status === 'confirmed' || (b as any).status === 'approved';
      } else if (historyFilter === 'cancelled') {
        return (
          b.status === 'cancelled' ||
          b.status === 'cancellation_requested' ||
          (b as any).status === 'refund_processed' ||
          b.status === 'rejected' ||
          b.status === 'expired'
        );
      }

      // Search Filter
      if (historySearchTerm.trim()) {
        const q = historySearchTerm.toLowerCase();
        const route = `${b.from_city || ''} ${b.to_city || ''}`.toLowerCase();
        const name = (b.customer_name || '').toLowerCase();
        const mobile = (b.customer_mobile || '').toLowerCase();
        const pnr = (b.ticket_pnr || b.booking_code || '').toLowerCase();
        return route.includes(q) || name.includes(q) || mobile.includes(q) || pnr.includes(q);
      }
      return true;
    });
  }, [myGoBookings, historyFilter, historySearchTerm]);

  // Handle Profile Photo Upload
  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setProfileAvatarUrl(compressed);
      success('फोटो तैयार', 'प्रोफाइल फोटो चुन ली गई है। "प्रोफाइल सेव करें" पर क्लिक करें।');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      error('नाम अनिवार्य', 'कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }
    setIsSavingProfile(true);
    try {
      const ok = await updateProfile({
        full_name: profileName.trim(),
        shop_name: profileShopName.trim(),
        address: profileAddress.trim(),
        city: profileCity.trim(),
        district: profileDistrict.trim(),
        avatar_url: profileAvatarUrl || undefined,
      });
      if (ok) {
        success('प्रोफाइल सेव हो गई!', 'आपकी GO Agent प्रोफाइल सफलतापूर्वक अपडेट हो गई।');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle KYC Submit
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = kycAadhaar.replace(/\s+/g, '');
    if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
      error('अमान्य आधार नंबर', 'कृपया 12-अंकीय मान्य आधार कार्ड नंबर दर्ज करें।');
      return;
    }
    const cleanPan = kycPan.trim().toUpperCase();
    if (cleanPan.length !== 10 || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(cleanPan)) {
      error('अमान्य पैन कार्ड', 'कृपया 10-अंकीय वैध पैन नंबर दर्ज करें (उदा. ABCDE1234F)।');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const ok = await submitAgentKyc({
        aadhaar_number: cleanAadhaar,
        pan_number: cleanPan,
        bank_account_holder: kycBankHolder.trim() || currentUser.full_name,
        bank_name: kycBankName.trim() || 'State Bank of India',
        bank_account_number: kycBankAcc.trim() || '1234567890',
        bank_ifsc: kycBankIfsc.trim().toUpperCase() || 'SBIN0001234',
        bank_upi_id: kycUpiId.trim() || undefined,
        aadhaar_front_url: kycAadhaarFrontUrl || undefined,
        pan_card_url: kycPanCardUrl || undefined,
      });
      if (ok) {
        success('KYC सबमिट हुआ!', 'आपके दस्तावेज जांच हेतु भेज दिए गए हैं। 24 घंटे के भीतर सत्यापन पूर्ण होगा।');
      }
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  // Handle Create Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passengerName.trim()) {
      error('यात्री का नाम', 'कृपया यात्री का पूरा नाम दर्ज करें।');
      return;
    }
    const cleanMobile = passengerMobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      error('मोबाइल नंबर', 'कृपया यात्री का 10-अंकीय मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsSubmittingBooking(true);
    try {
      const calculatedTotalFare = baseFarePerSeat * selectedSeatCount;
      const created = await createBooking({
        agent_id: currentUser.id,
        agent_name: currentUser.full_name,
        agent_mobile: currentUser.mobile,
        customer_name: passengerName.trim(),
        customer_mobile: cleanMobile,
        customer_email: currentUser.email || 'ticket@safargo.in',
        passenger_name: passengerName.trim(),
        passenger_mobile: cleanMobile,
        passenger_age: parseInt(passengerAge) || 28,
        passenger_gender: passengerGender,
        from_city: bookingSource,
        to_city: bookingDestination,
        journey_date: bookingDate,
        total_fare: calculatedTotalFare,
        actual_fare: calculatedTotalFare,
        seat_count: selectedSeatCount,
        confirmed_seats: `${selectedSeatCount} Seat(s)`,
        operator_preference: selectedBusOperator,
        actual_operator: selectedBusOperator,
        payment_status: 'paid',
        payment_method: 'agent_wallet',
        source_channel: 'go_agent_direct',
        agent_commission: 20,
        agent_notes: `⚡ GO Agent Fast Track Booking: ${bookingSource} to ${bookingDestination}`,
      });

      if (created) {
        setActivePendingBookingId(created.id);
        try {
          localStorage.setItem(`safargo_pending_booking_${currentUser.id}`, created.id);
        } catch {}
        success('बुकिंग सबमिट हुई! 🎫', '5-मिनट एडमिन अप्रूवल विंडो सक्रिय हो गई है। कृपया प्रतीक्षा करें।');
      }
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // Handle Create Support Ticket
  const handleSupportTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportDescription.trim()) {
      error('विवरण आवश्यक', 'कृपया विषय एवं समस्या का विवरण दर्ज करें।');
      return;
    }
    setIsSubmittingSupportTicket(true);
    try {
      const ok = await createSupportTicket({
        category: 'ticket_booking_issue',
        priority: 'high',
        subject: supportSubject.trim(),
        description: supportDescription.trim(),
      });
      if (ok) {
        setSupportSubject('');
        setSupportDescription('');
        setIsSupportFormOpen(false);
        success('सपोर्ट टिकट दर्ज!', '24 घंटे के अंदर आपकी समस्या का समाधान सुनिश्चित किया जाएगा।');
      }
    } finally {
      setIsSubmittingSupportTicket(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 select-none">
      
      {/* ============================================================== */}
      {/* TOP HEADER: CLEAN ULTRA TERMINAL                               */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-amber-400/40 px-3 sm:px-6 py-2.5 sm:py-3 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Left: 3D GO Terminal Logo & Agent Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Go3DUltraLogo size="sm" showBadge={false} />
            <div className="border-l border-slate-700 pl-2.5 sm:pl-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>GO AGENT TERMINAL</span>
              </span>
              <p className="text-xs sm:text-sm font-black text-white truncate max-w-[130px] sm:max-w-xs">
                {currentUser?.shop_name || currentUser?.full_name || 'एजेंट टर्मिनल'}
              </p>
            </div>
          </div>

          {/* Right: Go Wallet Balance Quick Pill & Logout */}
          <div className="flex items-center gap-2">
            
            {/* Quick Wallet Pill */}
            <button
              type="button"
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="py-1.5 px-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-slate-900 to-amber-500/20 border border-emerald-400/60 hover:border-emerald-300 transition flex items-center gap-2 cursor-pointer shadow-md group"
              title="Go Wallet बैलेंस व निकासी"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-[9px] font-bold text-slate-400 block leading-none">Go Wallet</span>
                <span className="text-xs font-black text-emerald-400 font-mono">
                  ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={() => {
                logout();
                if (onNavigateHome) onNavigateHome();
                else window.location.href = '/';
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/60 text-slate-300 hover:text-rose-300 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="लॉगआउट करें"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>

          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTAINER: 4 EXCLUSIVE CORE TABS                          */}
      {/* ============================================================== */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">

        {/* ============================================================ */}
        {/* TAB 1: ⚡ DASHBOARD (डैशबोर्ड)                                 */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 1. TOP SOLITARY GO WALLET CARD */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400 p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.2)] overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Balance & Earnings Information */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                      <Wallet className="w-3 h-3" />
                      GO WALLET
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      प्रत्येक कन्फर्म टिकट पर फ्लैट ₹20 नकद कमाई
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                      कुल उपलब्ध Go Wallet बैलेंस
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight flex items-baseline gap-2">
                      <span>₹{(agentWalletBalance || 0).toLocaleString('en-IN')}</span>
                      <span className="text-xs font-sans text-slate-400 font-normal">
                        ({confirmedCount} टिकट × ₹20 = ₹{totalCommissionEarned.toLocaleString('en-IN')} अर्जित)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    आपकी समस्त टिकट बुकिंग की कमाई सीधे Go Wallet में जमा होती है। <strong>हर रविवार साप्ताहिक सेटलमेंट</strong> के तहत आप इसे बिना किसी कटौती के सीधे अपने बैंक या UPI में निकाल सकते हैं।
                  </p>
                </div>

                {/* Instant Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>
                      {activePendingPayout
                        ? '⏳ निकासी प्रक्रियाधीन देखें'
                        : 'साप्ताहिक निकासी अनुरोध (Every Sunday)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/50 text-emerald-400 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-emerald-400" />
                    <span>वॉलेट में पैसे जोड़ें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUberDefaultDestination('Bhopal ISBT Stand');
                      setIsUberModalOpen(true);
                    }}
                    className="py-3 px-4 rounded-2xl bg-black hover:bg-slate-900 border border-slate-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    title="यात्रियों के लिए बस स्टैंड व स्टेशन तक Uber ऑटो/कैब सेवा"
                  >
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>🛺 Uber ऑटो / कैब</span>
                  </button>
                </div>

              </div>

              {/* Pending Payout Persistent Banner */}
              {activePendingPayout && (
                <div className="mt-5 p-3.5 rounded-2xl bg-amber-950/80 border border-amber-400/80 text-amber-200 text-xs flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>निकासी प्रक्रियाधीन:</strong> ₹{activePendingPayout.amount} का सेटलमेंट अनुरोध एडमिन के पास समीक्षाधीन है। रविवार को भुगतान होगा।
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-lg text-[10px] shrink-0"
                  >
                    विवरण देखें
                  </button>
                </div>
              )}
            </div>

            {/* 2. STATS QUICK TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">कुल GO टिकटें</span>
                <div className="text-2xl font-black text-white font-mono">{myGoBookings.length}</div>
                <span className="text-[10px] text-emerald-400">{confirmedCount} कन्फर्म</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">कमीशन कमाई</span>
                <div className="text-2xl font-black text-amber-400 font-mono">₹{totalCommissionEarned}</div>
                <span className="text-[10px] text-slate-400">फ्लैट ₹20 / सीट</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">KYC सत्यापन</span>
                <div className="text-sm font-black text-white pt-1">
                  {currentUser?.kyc_status === 'verified' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% सत्यापित
                    </span>
                  ) : currentUser?.kyc_status === 'pending' ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 24h प्रक्रियाधीन
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> बाकी है
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">ऑफिशियल बैज</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">सपोर्ट डेस्क SLA</span>
                <div className="text-sm font-black text-cyan-400 pt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> 24h समाधान
                </div>
                <span className="text-[10px] text-slate-400">{pendingSupportCount} लंबित टिकट</span>
              </div>
            </div>

            {/* 3. TICKET DESK & 24-HOUR RESOLUTION GUARANTEE (In-Wallet System) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-400" />
                      <span>एजेंट सहायता व सपोर्ट डेस्क</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong>24 घंटे में समाधान गारंटी (24-Hour SLA Guarantee)</strong> • बस ऑपरेटर, टिकट रिफंड या वॉलेट से संबंधित किसी भी समस्या का त्वरित समाधान।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://help.safargo.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>help.safargo.in</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsSupportFormOpen(!isSupportFormOpen)}
                    className="py-2 px-3.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>नया टिकट बनाएं</span>
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">प्रतीक्षारत टिकट (Pending)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs font-mono">
                    {pendingSupportCount}
                  </span>
                </div>
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">समाधान किए गए (Solved)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs font-mono">
                    {resolvedSupportCount}
                  </span>
                </div>
              </div>

              {/* Create Ticket Modal / Inline Form */}
              {isSupportFormOpen && (
                <form onSubmit={handleSupportTicketSubmit} className="p-4 bg-slate-950 rounded-2xl border border-amber-400/50 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    नया हेल्प टिकट दर्ज करें (24-Hour Guaranteed Desk)
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      समस्या का विषय (Subject) *
                    </label>
                    <input
                      type="text"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="उदा. टिकट बुकिंग अप्रूवल या रिफंड समस्या"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      समस्या का संपूर्ण विवरण (Description) *
                    </label>
                    <textarea
                      rows={3}
                      value={supportDescription}
                      onChange={(e) => setSupportDescription(e.target.value)}
                      placeholder="विस्तार से अपनी समस्या बताएं..."
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSupportFormOpen(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSupportTicket}
                      className="px-4 py-1.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 disabled:opacity-50"
                    >
                      {isSubmittingSupportTicket ? 'सबमिट हो रहा है...' : 'सबमिट करें'}
                    </button>
                  </div>
                </form>
              )}

              {/* Recent Support Tickets List */}
              {(agentSupportTickets || []).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">हाल के सपोर्ट टिकट</span>
                  {(agentSupportTickets || []).slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white">{t.subject}</strong>
                          <span className="font-mono text-[10px] text-slate-500">#{t.ticket_code || t.id.slice(-6)}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-sm">{t.description}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        t.status === 'resolved' || t.status === 'closed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {t.status === 'resolved' || t.status === 'closed' ? 'हल हुआ ✓' : 'प्रक्रियाधीन ⏳'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. GO WALLET TRANSACTIONS & MONEY ORIGIN HUB (कहाँ-कहाँ से पैसा आया - स्रोत ब्योरा) */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                      <History className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      <span>Go Wallet खाता-बही व पैसे का स्रोत</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                        लाइव अपडेट्स
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    कहाँ-कहाँ से पैसा आया और कहाँ खर्च हुआ — टिकट कमीशन, रेफरल बोनस, वॉलेट रिचार्ज, सैलरी व निकासी का संपूर्ण ब्योरा
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>पैसे जोड़ें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>निकासी</span>
                  </button>
                </div>
              </div>

              {/* Source Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setWalletSourceFilter('all')}
                  className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    walletSourceFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🌟 सभी स्रोत ({enrichedWalletTransactions.length})
                </button>

                {(Object.keys(TRANSACTION_SOURCE_METAS) as WalletTransactionSource[]).map((catKey) => {
                  const meta = TRANSACTION_SOURCE_METAS[catKey];
                  const count = enrichedWalletTransactions.filter((t) => t.source_category === catKey).length;
                  if (count === 0 && catKey !== 'bus_ticket_commission' && catKey !== 'referral_bonus' && catKey !== 'wallet_recharge') {
                    return null;
                  }
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setWalletSourceFilter(catKey)}
                      className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        walletSourceFilter === catKey
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.shortLabel}</span>
                      <span className="text-[10px] opacity-75">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Search Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={walletSearchTerm}
                  onChange={(e) => setWalletSearchTerm(e.target.value)}
                  placeholder="स्रोत, लेन-देन नाम, UTR, PNR या विवरण से खोजें..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400 placeholder:text-slate-600"
                />
              </div>

              {/* Transactions List */}
              {filteredWalletTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2 bg-slate-950/60 rounded-2xl border border-slate-800">
                  <History className="w-8 h-8 text-slate-600 mx-auto opacity-50" />
                  <p className="text-xs">चयनित फ़िल्टर के अनुसार कोई लेन-देन नहीं मिला।</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {filteredWalletTransactions.map((tx) => {
                    const isPositive = Number(tx.amount) > 0;
                    const meta = tx.source_category ? TRANSACTION_SOURCE_METAS[tx.source_category] : undefined;
                    return (
                      <div
                        key={tx.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shrink-0 ${
                              isPositive
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowDownLeft className="w-5 h-5" />
                            ) : (
                              <ArrowUpRight className="w-5 h-5" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-white text-sm">
                                {tx.transaction_name || (isPositive ? 'जमा राशि' : 'निकासी राशि')}
                              </span>
                              {meta && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${meta.badgeBg} ${meta.badgeText} border ${meta.borderClass}`}
                                >
                                  {meta.shortLabel}
                                </span>
                              )}
                            </div>

                            {/* Source of Funds (कहाँ-कहाँ से पैसा आया) */}
                            <div className="text-[11px] text-amber-300/90 flex items-center gap-1 font-medium">
                              <span className="text-slate-400">स्रोत:</span>
                              <span>{tx.source_name || tx.description}</span>
                            </div>

                            {/* Details / Booking Code */}
                            {tx.source_details && tx.source_details !== tx.source_name && (
                              <p className="text-[10px] text-slate-400 line-clamp-1">
                                {tx.source_details}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                          <span
                            className={`text-base font-black font-mono ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${Math.abs(tx.amount).toLocaleString('en-IN')}`}
                          </span>

                          <div className="text-[10px] text-slate-500 space-x-1">
                            <span>{new Date(tx.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}</span>
                            <span>•</span>
                            <span>{new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {tx.balance_after !== undefined && (
                            <span className="text-[10px] font-mono text-slate-400">
                              शेष: ₹{tx.balance_after.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Action to New Booking */}
            <div
              onClick={() => setActiveTab('booking')}
              className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-2 border-amber-400/80 flex items-center justify-between gap-4 cursor-pointer hover:border-amber-300 transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white group-hover:text-amber-300 transition">
                    नई बस टिकट बुक करें (New Bus Booking)
                  </h4>
                  <p className="text-xs text-slate-300">
                    मध्य प्रदेश के सभी मुख्य रूटों पर 5 मिनट में टिकट अप्रूवल व तुरंत ₹20 कमीशन
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 🎫 BOOKING (नई बस बुकिंग — 5-MIN TIMER & BACK TRAP)   */}
        {/* ============================================================ */}
        {activeTab === 'booking' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* If there is an Active Pending Booking: Show 5-Min Timer Screen */}
            {activePendingBooking && activePendingBooking.status !== 'confirmed' && activePendingBooking.status !== 'cancelled' ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-amber-400 shadow-[0_20px_50px_rgba(245,158,11,0.2)] text-center space-y-6 animate-fadeIn">
                
                {/* 5-Min Live Timer Banner */}
                <div className="space-y-3">
                  <div className="inline-block">
                    <BookingApprovalTimer
                      createdAt={activePendingBooking.created_at}
                      deadlineAt={activePendingBooking.deadline_at}
                    />
                  </div>
                  <h3 className="text-2xl font-black text-white">
                    बुकिंग एडमिन स्वीकृति प्रक्रियाधीन है
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    कृपया इस पेज पर बने रहें और बैक बटन न दबाएं। एडमिन द्वारा अप्रूव होते ही यह पेज स्वतः रिफ्रेश होकर आपकी कन्फर्म टिकट प्रदर्शित करेगा।
                  </p>
                </div>

                {/* Ticket Details Card */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 text-left space-y-3 max-w-lg mx-auto">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="text-xs text-slate-400">बुकिंग कोड:</span>
                    <span className="font-mono font-black text-amber-400">{activePendingBooking.booking_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">रूट:</span>
                    <span className="font-bold text-white">
                      {getBookingRoute(activePendingBooking).from} ➔ {getBookingRoute(activePendingBooking).to}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">यात्री:</span>
                    <span className="font-bold text-white">{activePendingBooking.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">सीट संख्या:</span>
                    <span className="font-bold text-emerald-400">{getBookingSeats(activePendingBooking)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">कुल किराया:</span>
                    <span className="font-mono font-black text-white">
                      ₹{getBookingFare(activePendingBooking).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-xs text-slate-400">एजेंट कमीशन:</span>
                    <span className="text-xs font-black text-amber-400">+₹20.00 Go Wallet में</span>
                  </div>
                </div>

                {/* Safety Back-Trap Warning */}
                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-xs text-amber-300 max-w-lg mx-auto flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    सुरक्षा गार्ड सक्रिय: ब्राउज़र का बैक बटन दबाने पर भी आप इसी स्क्रीन पर सुरक्षित रहेंगे।
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={handleManualRefreshStatus}
                    disabled={isRefreshingStatus}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshingStatus ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingStatus ? 'जांच जारी है...' : '🔄 स्थिति रिफ्रेश करें'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePendingBookingId(null);
                      try {
                        localStorage.removeItem(`safargo_pending_booking_${currentUser?.id}`);
                      } catch {}
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    नया फॉर्म खोलें
                  </button>
                </div>
              </div>
            ) : activePendingBooking && activePendingBooking.status === 'confirmed' ? (
              /* Confirmed Ticket Green Screen */
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.25)] text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950">
                    कन्फर्म (CONFIRMED)
                  </span>
                  <h3 className="text-2xl font-black text-white pt-2">
                    🎉 बस टिकट सफलतापूर्वक कन्फर्म हो गई!
                  </h3>
                  <p className="text-xs text-emerald-300 font-bold">
                    PNR नंबर: <span className="font-mono text-base text-white">{activePendingBooking.ticket_pnr || 'CONFIRMED'}</span> • ₹20 कमीशन Go Wallet में क्रेडिट हुआ!
                  </p>
                </div>

                {/* Ticket Details */}
                <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/40 text-left space-y-2.5 max-w-lg mx-auto text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">रूट:</span>
                    <span className="font-bold text-white text-sm">
                      {getBookingRoute(activePendingBooking).from} ➔ {getBookingRoute(activePendingBooking).to}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">यात्री का नाम:</span>
                    <span className="font-bold text-white">{activePendingBooking.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">सीट संख्या:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {getBookingSeats(activePendingBooking)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ऑपरेटर:</span>
                    <span className="text-slate-300">{getBookingRoute(activePendingBooking).operator}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <span className="text-slate-400">कुल भुगतान:</span>
                    <span className="font-mono font-black text-white text-base">
                      ₹{getBookingFare(activePendingBooking).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Share Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = getWhatsAppTicketMessage(activePendingBooking);
                      window.open(`https://wa.me/91${activePendingBooking.customer_mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>WhatsApp पर टिकट भेजें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUberDefaultDestination(`${getBookingRoute(activePendingBooking).to} Bus Stand`);
                      setIsUberModalOpen(true);
                    }}
                    className="w-full py-3.5 px-5 rounded-2xl bg-black hover:bg-slate-900 border border-slate-700 text-white font-black text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
                    title="यात्री के लिए Uber ऑटो / कैब लिंक"
                  >
                    <Car className="w-4 h-4 text-amber-400" />
                    <span>🛺 Uber राइड सहायता</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActivePendingBookingId(null);
                      try {
                        localStorage.removeItem(`safargo_pending_booking_${currentUser?.id}`);
                      } catch {}
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition cursor-pointer"
                  >
                    नई टिकट बुक करें ➔
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. TOP BOOKING MODE SWITCHER */}
                <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode('auto')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                      bookingMode === 'auto'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Bus className="w-4 h-4" />
                    <span>🚌 ऑटोमैटिक बस सर्च व सीट मैप (Live Bus Booking)</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-950 text-amber-300 border border-amber-400/40">
                      पसंदीदा
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingMode('manual')}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                      bookingMode === 'manual'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>⚡ त्वरित फॉर्म बुकिंग (Fast Track Form)</span>
                  </button>
                </div>

                {/* 2. MODE CONTENT: AUTO SEARCH OR FAST TRACK FORM */}
                {bookingMode === 'auto' ? (
                  <AutoRedBusBookingView
                    onBookingSuccess={(confirmed) => {
                      setActivePendingBookingId(confirmed.id);
                      setSelectedGreenCardBooking(confirmed);
                      try {
                        localStorage.setItem(`safargo_pending_booking_${currentUser?.id}`, confirmed.id);
                      } catch {}
                      success(
                        '🎉 बस टिकट सफलतापूर्वक कन्फर्म हो गई!',
                        `PNR: ${confirmed.ticket_pnr || 'CONFIRMED'} • ₹20 कमीशन Go Wallet में क्रेडिट हुआ!`
                      );
                    }}
                    onSwitchToManual={() => setBookingMode('manual')}
                  />
                ) : (
                  /* NEW BUS BOOKING FORM */
                  <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                          <Bus className="w-5 h-5 text-amber-400" />
                          <span>त्वरित बस टिकट फॉर्म (Fast Track Booking)</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          सीट चुनें और कन्फर्म करें • प्रत्येक टिकट पर फ्लैट ₹20 नकद कमीशन Go Wallet में जुड़ेगा
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/40 shrink-0">
                        ⚡ 5-Min Fast Track
                      </span>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                  
                  {/* Origin & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        कहाँ से (Source City) *
                      </label>
                      <select
                        value={bookingSource}
                        onChange={(e) => setBookingSource(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-amber-400 outline-none"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={`src-${c}`} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        कहाँ तक (Destination City) *
                      </label>
                      <select
                        value={bookingDestination}
                        onChange={(e) => setBookingDestination(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-amber-400 outline-none"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={`dest-${c}`} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date & Bus Operator */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        यात्रा की तारीख (Journey Date) *
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-amber-400 outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">
                        बस ऑपरेटर / सर्विस प्रकार *
                      </label>
                      <select
                        value={selectedBusOperator}
                        onChange={(e) => {
                          setSelectedBusOperator(e.target.value);
                          if (e.target.value.includes('Royal AC Sleeper')) setBaseFarePerSeat(650);
                          else if (e.target.value.includes('Deluxe')) setBaseFarePerSeat(550);
                          else if (e.target.value.includes('Gramin')) setBaseFarePerSeat(350);
                          else setBaseFarePerSeat(450);
                        }}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:border-amber-400 outline-none"
                      >
                        <option value="SafarGo Superfast Express (AC)">SafarGo Superfast Express (AC) - ₹450</option>
                        <option value="Royal AC Sleeper Deluxe">Royal AC Sleeper Deluxe - ₹650</option>
                        <option value="MP Tourism InterCity (2x2)">MP Tourism InterCity (2x2) - ₹550</option>
                        <option value="Gramin Express Seater">Gramin Express Seater - ₹350</option>
                      </select>
                    </div>
                  </div>

                  {/* Visual Bus Fleet Selection Cards */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400 block">
                      उपलब्ध बस प्रकार (क्लिक करके चुनें):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        {
                          name: 'SafarGo Superfast Express (AC)',
                          label: 'Superfast AC',
                          sub: '2x2 Pushback',
                          fare: 450,
                          img: busImgSuperfast,
                        },
                        {
                          name: 'Royal AC Sleeper Deluxe',
                          label: 'Royal Sleeper',
                          sub: '2+1 AC Sleeper',
                          fare: 650,
                          img: busImgSleeper,
                        },
                        {
                          name: 'MP Tourism InterCity (2x2)',
                          label: 'InterCity Deluxe',
                          sub: 'Fast Express',
                          fare: 550,
                          img: busImgIntercity,
                        },
                        {
                          name: 'Gramin Express Seater',
                          label: 'Gramin Seater',
                          sub: 'Regional Express',
                          fare: 350,
                          img: busImgGramin,
                        },
                      ].map((busOpt) => {
                        const isChosen = selectedBusOperator === busOpt.name;
                        return (
                          <div
                            key={busOpt.name}
                            onClick={() => {
                              setSelectedBusOperator(busOpt.name);
                              setBaseFarePerSeat(busOpt.fare);
                            }}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-1 ${
                              isChosen
                                ? 'bg-amber-400/15 border-2 border-amber-400 shadow-md scale-[1.02]'
                                : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="h-12 w-full flex items-center justify-center p-1 relative">
                              <img src={busOpt.img} alt={busOpt.label} className="max-h-full object-contain" />
                              <span className="absolute top-0 right-0 px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[7px] leading-tight">
                                SafarGo ✓
                              </span>
                            </div>
                            <span className="text-[11px] font-black text-white leading-tight block">
                              {busOpt.label}
                            </span>
                            <span className="text-[8px] text-emerald-400 font-bold block">
                              🛡️ SafarGo Verified Bus
                            </span>
                            <span className="text-[9px] text-slate-400 block">{busOpt.sub}</span>
                            <span className="text-xs font-black text-amber-400 font-mono">
                              ₹{busOpt.fare}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block">
                      यात्री विवरण (Passenger Information)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 text-[11px] font-bold mb-1">
                          यात्री का पूरा नाम *
                        </label>
                        <input
                          type="text"
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          placeholder="उदा. राहुल शर्मा"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] font-bold mb-1">
                          उम्र (Age) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={passengerAge}
                          onChange={(e) => setPassengerAge(e.target.value)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 text-[11px] font-bold mb-1">
                          यात्री का मोबाइल नंबर (WhatsApp Ticket) *
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={passengerMobile}
                          onChange={(e) => setPassengerMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-अंकीय मोबाइल नंबर"
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] font-bold mb-1">
                          सीटों की संख्या (Seats) *
                        </label>
                        <select
                          value={selectedSeatCount}
                          onChange={(e) => setSelectedSeatCount(parseInt(e.target.value) || 1)}
                          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400 font-bold"
                        >
                          <option value={1}>1 सीट</option>
                          <option value={2}>2 सीटें</option>
                          <option value={3}>3 सीटें</option>
                          <option value={4}>4 सीटें</option>
                          <option value={5}>5 सीटें</option>
                          <option value={6}>6 सीटें</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Fare & Commission Summary Banner */}
                  <div className="p-4 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/70 rounded-2xl border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">कुल टिकट किराया</span>
                      <span className="text-2xl font-black text-white font-mono">
                        ₹{(baseFarePerSeat * selectedSeatCount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">आपकी शुद्ध कमाई (Commission)</span>
                      <span className="text-lg font-black text-amber-400 font-mono">
                        +₹20.00 नकद
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Bus className="w-5 h-5" />
                    <span>
                      {isSubmittingBooking
                        ? 'बुकिंग सबमिट हो रही है...'
                        : `कन्फर्म बुकिंग सबमिट करें (₹${(baseFarePerSeat * selectedSeatCount).toLocaleString('en-IN')})`}
                    </span>
                  </button>

                </form>
              </div>
            )}
          </div>
        )}
      </div>
    )}

        {/* ============================================================ */}
        {/* TAB 3: 📜 HISTORY (माई टिकट्स व हिस्ट्री)                    */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Filter Bar */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span>बुकिंग हिस्ट्री व टिकट्स (Booking History)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    आपकी सभी बस टिकटों की लाइव स्थिति, PNR एवं WhatsApp टिकट प्रेषण
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-400 font-mono">
                  कुल टिकटें: {myGoBookings.length}
                </span>
              </div>

              {/* 4 Core Filter Buttons: All, Pending, Confirmed, Cancelled */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setHistoryFilter('all')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    historyFilter === 'all'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>सभी (All)</span>
                  <span className="text-[10px] opacity-80">({myGoBookings.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryFilter('pending')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    historyFilter === 'pending'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>प्रतीक्षारत (Pending)</span>
                  <span className="text-[10px] opacity-80">
                    ({myGoBookings.filter((b) => b.status !== 'confirmed' && b.status !== 'cancelled' && b.status !== 'refund_processed').length})
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryFilter('confirmed')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    historyFilter === 'confirmed'
                      ? 'bg-emerald-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>कन्फर्म (Confirmed)</span>
                  <span className="text-[10px] opacity-80">({confirmedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryFilter('cancelled')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    historyFilter === 'cancelled'
                      ? 'bg-rose-500 text-white font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>रद्द (Cancelled)</span>
                  <span className="text-[10px] opacity-80">
                    ({myGoBookings.filter((b) => b.status === 'cancelled' || b.status === 'cancellation_requested' || b.status === 'refund_processed').length})
                  </span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={historySearchTerm}
                  onChange={(e) => setHistorySearchTerm(e.target.value)}
                  placeholder="PNR, यात्री का नाम, मोबाइल या शहर से खोजें..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Bookings List */}
            {filteredHistoryBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-3 bg-slate-900/50 rounded-3xl border border-slate-800">
                <Bus className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
                <p className="text-sm font-bold text-slate-400">कोई टिकट नहीं मिली।</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className="py-2.5 px-4 bg-amber-400 text-slate-950 font-black rounded-xl text-xs cursor-pointer inline-block"
                >
                  नई बस टिकट बुक करें ➔
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistoryBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm font-mono">{b.booking_code}</strong>
                          {b.status === 'confirmed' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-black">
                              PNR: {b.ticket_pnr || 'OK'} ✓
                            </span>
                          ) : b.status === 'cancelled' || b.status === 'refund_processed' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 text-[10px] font-black">
                              रद्द / रिफंड
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-spin" />
                              सत्यापन प्रक्रियाधीन
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-300 font-bold mt-1">
                          {getBookingRoute(b).from} ➔ {getBookingRoute(b).to} • यात्रा: {b.journey_date}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-black text-white font-mono block">
                          ₹{getBookingFare(b).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400">+₹20 कमीशन</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                      <div>
                        यात्री: <strong className="text-white">{b.customer_name}</strong> (+91 {b.customer_mobile}) • सीट: <span className="text-emerald-400 font-mono font-bold">{getBookingSeats(b)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => {
                              const msg = getWhatsAppTicketMessage(b);
                              window.open(`https://wa.me/91${b.customer_mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp पर भेजें</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedPrintBooking(b)}
                          className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रिंट</span>
                        </button>

                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => setSelectedGreenCardBooking(b)}
                            className="py-1.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <span>ग्रीन कार्ड</span>
                          </button>
                        )}

                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => {
                              setUberDefaultDestination(`${getBookingRoute(b).to} Bus Stand`);
                              setIsUberModalOpen(true);
                            }}
                            className="py-1.5 px-3 rounded-xl bg-black hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                            title="यात्री के लिए Uber कैब/ऑटो राइड लिंक"
                          >
                            <Car className="w-3.5 h-3.5 text-amber-400" />
                            <span>Uber राइड</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: 👤 ACCOUNT (प्रोफाइल, KYC 24H LOCK & REFER & EARN)    */}
        {/* ============================================================ */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 1. AGENT PROFILE & EDIT FORM */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profileAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400"
                    />
                    <label className="absolute -bottom-1 -right-1 p-1.5 bg-amber-400 text-slate-950 rounded-lg cursor-pointer shadow hover:bg-amber-300">
                      <Camera className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{currentUser?.full_name || 'GO एजेंट'}</h3>
                    <p className="text-xs text-slate-400">{currentUser?.shop_name || 'अधिकृत केंद्र'} • ID: {currentUser?.id?.slice(-6).toUpperCase()}</p>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">अधिकृत GO एजेंट नेटवर्क</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser?.kyc_status === 'verified' ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> KYC सत्यापित
                    </span>
                  ) : currentUser?.kyc_status === 'pending' ? (
                    <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> KYC समीक्षाधीन (24h)
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-500/40 text-xs font-bold">
                      KYC लंबित
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">पूरा नाम (Full Name) *</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">दुकान / केंद्र का नाम (Shop Name)</label>
                    <input
                      type="text"
                      value={profileShopName}
                      onChange={(e) => setProfileShopName(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">पता (Address)</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">शहर (City)</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">जिला (District)</label>
                    <input
                      type="text"
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Read-only Mobile & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">पंजीकृत मोबाइल (सुरक्षित)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.mobile || ''}
                      className="w-full p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 text-xs cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">पंजीकृत ईमेल (सुरक्षित)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-2.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'सेव हो रहा है...' : 'प्रोफाइल सेव करें'}</span>
                  </button>
                </div>
              </form>

            </div>

            {/* 2. KYC VERIFICATION SECTION */}
            <div className="p-5 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base sm:text-lg font-black text-white">KYC सत्यापन डेस्क</h3>
                </div>
                <span className="text-xs text-slate-400">सुरक्षा मानक • 24 घंटे में अप्रूवल</span>
              </div>

              {/* CASE A: KYC SUBMITTED & PENDING (User CANNOT edit or view upload form again) */}
              {currentUser?.kyc_status === 'pending' ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/60 via-slate-950 to-slate-900 border-2 border-amber-400 text-center space-y-4 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-amber-400/20 border-2 border-amber-400 text-amber-300 mx-auto flex items-center justify-center animate-pulse">
                    <Clock className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                      KYC VERIFICATION PENDING (24 HOURS)
                    </span>
                    <h4 className="text-lg font-black text-white pt-2">
                      KYC सत्यापन प्रक्रियाधीन (24 घंटे का समय)
                    </h4>
                    <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                      आपके आधार कार्ड एवं पैन कार्ड के विवरण सुरक्षित रूप से हमारे सत्यापन डेस्क को प्राप्त हो चुके हैं। SafarGo एडमिन डेस्क द्वारा 24 घंटे के भीतर आपका सत्यापन पूर्ण कर दिया जाएगा।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/30 text-[11px] text-amber-300/90 max-w-sm mx-auto">
                    🔒 सुरक्षा कारणों से सबमिट किए गए दस्तावेजों में परिवर्तन लॉक कर दिया गया है।
                  </div>
                </div>
              ) : currentUser?.kyc_status === 'verified' ? (
                /* CASE B: KYC VERIFIED */
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-950 to-teal-950 border-2 border-emerald-400 text-center space-y-3 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-emerald-400 text-slate-950 mx-auto flex items-center justify-center font-black shadow-[0_0_20px_#10b981]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-white">100% KYC सत्यापित अधिकृत GO एजेंट</h4>
                  <p className="text-xs text-emerald-300">
                    आपका खाता पूरी तरह सत्यापित है। सभी साप्ताहिक पेआउट्स व लाइव बस टिकटिंग सक्रिय हैं।
                  </p>
                </div>
              ) : (
                /* CASE C: KYC NOT SUBMITTED (Show Form) */
                <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-amber-300">
                    कृपया अपना 12-अंकीय आधार कार्ड एवं 10-अंकीय पैन कार्ड दर्ज करें। सबमिट करने के बाद 24 घंटे के अंदर एडमिन द्वारा सत्यापन पूरा किया जाएगा।
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">आधार कार्ड नंबर (12 अंक) *</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={kycAadhaar}
                        onChange={(e) => setKycAadhaar(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234 5678 9012"
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400 font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">पैन कार्ड नंबर (10 अक्षर/अंक) *</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={kycPan}
                        onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-400 font-mono uppercase"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmittingKyc ? 'सबमिट हो रहा है...' : 'KYC सत्यापन हेतु सबमिट करें (24-Hour SLA)'}</span>
                  </button>
                </form>
              )}

            </div>

            {/* 3. REFER & EARN ₹100 PER 5 BOOKINGS (At bottom of Account Tab) */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-400/80 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white">
                    REFER & EARN ₹100
                  </span>
                  <h3 className="text-lg font-black text-white">
                    साथी एजेंटों को जोड़ें और कमाएं ₹100 सीधा कैश
                  </h3>
                  <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                    अपने रेफरल लिंक से नए बस एजेंटों या दुकानदारों को जोड़ें। आपके रेफर किए गए एजेंट की पहली <strong>5 सफल बुकिंग</strong> होते ही आपको ₹100 का नकद बोनस सीधे Go Wallet में प्राप्त होगा!
                  </p>
                </div>

                <div className="bg-slate-950/90 border border-indigo-500/40 rounded-2xl p-4 text-center shrink-0">
                  <span className="text-[10px] text-slate-400 font-bold block">रेफरल कोड</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {currentUser?.referral_code || `GO${currentUser?.mobile?.slice(-4) || '2026'}`}
                  </span>
                </div>
              </div>

              {/* WhatsApp Share Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const refCode = currentUser?.referral_code || `GO${currentUser?.mobile?.slice(-4) || '2026'}`;
                    const shareText = `नमस्ते! SafarGo GO Agent नेटवर्क से जुड़ें और बस टिकट बुकिंग पर तुरंत ₹20 कमीशन व साप्ताहिक पेआउट पाएं। मेरा रेफरल कोड है: ${refCode}। अभी रजिस्टर करें: https://safargo.in/`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
                  }}
                  className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp पर रेफरल लिंक भेजें</span>
                </button>

                <span className="text-[11px] text-slate-400 text-center sm:text-left">
                  प्रत्येक 5 बुकिंग पर ₹100 स्वतः Go Wallet में जुड़ता है।
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* 4 EXCLUSIVE BOTTOM NAVIGATION OPTIONS                          */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t-2 border-amber-400/60 shadow-[0_-10px_25px_rgba(0,0,0,0.6)] py-2 px-3 sm:px-6">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2 text-center items-center">
          
          {/* Option 1: Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">डैशबोर्ड</span>
          </button>

          {/* Option 2: Booking (5-Min Timer & Fast Track) */}
          <button
            type="button"
            onClick={() => setActiveTab('booking')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'booking'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <Bus className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">बुकिंग</span>
          </button>

          {/* Option 3: History (Filtered Bookings) */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'history'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">हिस्ट्री</span>
          </button>

          {/* Option 4: Account (Profile, KYC Lock & Refer) */}
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-2xl transition cursor-pointer ${
              activeTab === 'account'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">अकाउंट</span>
          </button>

        </div>
      </nav>

      {/* ============================================================== */}
      {/* MODALS                                                         */}
      {/* ============================================================== */}
      {isWithdrawalModalOpen && (
        <GoAgentWithdrawalModal onClose={() => setIsWithdrawalModalOpen(false)} />
      )}

      {isRechargeModalOpen && (
        <WalletRechargeModal onClose={() => setIsRechargeModalOpen(false)} />
      )}

      {isInstantAddMoneyModalOpen && (
        <GoInstantAddMoneyModal onClose={() => setIsInstantAddMoneyModalOpen(false)} />
      )}

      {selectedGreenCardBooking && (
        <LiveTicketGreenCard
          booking={selectedGreenCardBooking}
          onClose={() => setSelectedGreenCardBooking(null)}
        />
      )}

      {selectedPrintBooking && (
        <PrintTicketModal
          booking={selectedPrintBooking}
          onClose={() => setSelectedPrintBooking(null)}
        />
      )}

      {/* 🛺 Uber Local Ride Assist Modal */}
      {isUberModalOpen && (
        <UberAgentAssistModal
          defaultDestination={uberDefaultDestination}
          onClose={() => setIsUberModalOpen(false)}
        />
      )}

    </div>
  );
};
