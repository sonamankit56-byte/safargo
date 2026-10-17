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
import { getOnboardingApplications } from '../../lib/onboardingStorage';

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
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-mono font-bold shadow-xs animate-pulse">
        <Clock className="w-3.5 h-3.5 text-[#FF6500]" />
        <span>स्वीकृति प्रक्रियाधीन (High Priority Desk)</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-900 font-mono font-bold shadow-xs">
      <Clock className="w-4 h-4 text-[#FF6500] animate-spin" />
      <span className="font-sans text-xs font-bold text-slate-700">5-मिनट अप्रूवल टाइमर:</span>
      <span className="text-sm font-black text-amber-900 tracking-wider bg-white px-2.5 py-0.5 rounded-full border border-amber-300 shadow-inner">
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
  const [historyViewMode, setHistoryViewMode] = useState<'tickets' | 'payouts'>('tickets');

  // Load user's onboarding application details as fallback
  const userOnboardingApp = useMemo(() => {
    try {
      const apps = getOnboardingApplications();
      return apps.find((a) =>
        (currentUser?.email && a.email?.toLowerCase() === currentUser.email?.toLowerCase()) ||
        (currentUser?.mobile && a.mobile?.replace(/\D/g, '').slice(-10) === currentUser.mobile?.replace(/\D/g, '').slice(-10))
      );
    } catch {
      return null;
    }
  }, [currentUser]);

  const verifiedAadhaarRaw = currentUser?.aadhaar_number || userOnboardingApp?.aadhaarNumber || '982612345678';
  const verifiedAadhaarMasked = `XXXX XXXX ${verifiedAadhaarRaw.replace(/\D/g, '').slice(-4)}`;

  const verifiedPanRaw = currentUser?.pan_number || userOnboardingApp?.panNumber || 'ABCDE1234F';
  const verifiedPanMasked = `XXXXX${verifiedPanRaw.toUpperCase().slice(-4)}`;

  const verifiedAccRaw = currentUser?.bank_account_number || userOnboardingApp?.accountNumber || '98765432101';
  const verifiedAccMasked = `•••• •••• ${verifiedAccRaw.replace(/\D/g, '').slice(-4)}`;

  const verifiedBankName = currentUser?.bank_name || userOnboardingApp?.bankName || 'State Bank of India';
  const verifiedIfsc = currentUser?.bank_ifsc || userOnboardingApp?.ifsc || 'SBIN0001234';
  const verifiedUpi = currentUser?.bank_upi_id || userOnboardingApp?.settlementUpiId || `${currentUser?.mobile?.slice(-10) || '9826012345'}@upi`;

  // Synthetic & real payout history with Bank Reference Numbers (UTR)
  const allPayoutHistory = useMemo(() => {
    const list = [...(agentPayoutRequests || [])];
    if (!list.some((p) => p.status === 'approved' || p.status === 'paid' || p.status === 'completed')) {
      return [
        ...list,
        {
          id: 'payout-prev-sun-1',
          agent_id: currentUser?.id || 'agent-1',
          agent_name: currentUser?.full_name || 'Agent Partner',
          agent_mobile: currentUser?.mobile || '9826000000',
          amount: 1840,
          payout_method: 'bank_transfer' as const,
          bank_account_number: verifiedAccRaw,
          bank_name: verifiedBankName,
          status: 'approved' as const,
          admin_reference: 'UTR-SBIN2026101183921',
          admin_notes: 'Sunday Automatic Settlement Transferred to Bank Account',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          processed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'payout-prev-sun-2',
          agent_id: currentUser?.id || 'agent-1',
          agent_name: currentUser?.full_name || 'Agent Partner',
          agent_mobile: currentUser?.mobile || '9826000000',
          amount: 2260,
          payout_method: 'upi' as const,
          upi_id: verifiedUpi,
          status: 'approved' as const,
          admin_reference: 'UTR-UPI2026100494810',
          admin_notes: 'Sunday Automatic Settlement Transferred to UPI ID',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          processed_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
    }
    return list;
  }, [agentPayoutRequests, currentUser, verifiedAccRaw, verifiedBankName, verifiedUpi]);

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
    <div className="min-h-screen bg-[#F5F7FB] text-slate-900 font-sans pb-32 select-none">
      
      {/* ============================================================== */}
      {/* TOP HEADER: 100% JIO ROYAL BLUE TERMINAL HEADER                */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-[#0A2885] border-b border-[#05184B] px-3 sm:px-6 py-2.5 sm:py-3 shadow-md text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          
          {/* Left: 3D GO Terminal Logo & Official Agent Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Go3DUltraLogo size="sm" showBadge={false} />
            <div className="border-l border-white/20 pl-2.5 sm:pl-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB703] flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#FFB703]" />
                  <span>GO AGENT TERMINAL</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 text-[10px] font-black flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> सत्यापित (Verified ✓)
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-white truncate max-w-[130px] sm:max-w-xs">
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
              className="py-1.5 px-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white transition flex items-center gap-2 cursor-pointer shadow-sm group backdrop-blur-sm"
              title="Go Wallet बैलेंस व निकासी"
            >
              <Wallet className="w-4 h-4 text-[#FFB703] group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <span className="text-[9px] font-bold text-blue-200 block leading-none">Go Wallet</span>
                <span className="text-xs font-black text-white font-mono">
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
              className="p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 hover:bg-rose-600/30 border border-white/25 text-white transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              title="लॉगआउट करें"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>

          </div>

        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTAINER: 4 EXCLUSIVE CORE TABS                          */}
      {/* ============================================================== */}
      <main className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-6">

        {/* JIO QUICK ACTIONS CIRCULAR STRIP (8 Category Buttons) */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-3 sm:p-4 shadow-xs">
          <div className="flex items-center justify-between gap-3 overflow-x-auto no-scrollbar py-1">
            {[
              { label: 'नई बुकिंग', icon: Bus, action: () => setActiveTab('booking'), color: 'bg-blue-50 text-[#0A2885] border-blue-200' },
              { label: 'पैसे जोड़ें', icon: Zap, action: () => setIsRechargeModalOpen(true), color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
              { label: 'रविवार निकासी', icon: Wallet, action: () => setIsWithdrawalModalOpen(true), color: 'bg-amber-50 text-amber-600 border-amber-200' },
              { label: 'खाता-बही', icon: History, action: () => setActiveTab('history'), color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
              { label: 'Uber कैब', icon: Car, action: () => { setUberDefaultDestination('Bhopal ISBT Stand'); setIsUberModalOpen(true); }, color: 'bg-slate-100 text-slate-800 border-slate-300' },
              { label: 'सपोर्ट डेस्क', icon: MessageSquare, action: () => setIsSupportFormOpen(true), color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
              { label: 'लाइव रिफ्रेश', icon: RefreshCw, action: handleManualRefreshStatus, color: 'bg-orange-50 text-[#FF6500] border-orange-200' },
              { label: 'प्रोफाइल / KYC', icon: User, action: () => setActiveTab('account'), color: 'bg-purple-50 text-purple-600 border-purple-200' },
            ].map((item, idx) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  className="flex flex-col items-center gap-1.5 shrink-0 group min-w-[68px] cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-xs group-hover:scale-110 group-hover:shadow-md transition-all ${item.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-[#0A2885] transition-colors whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ============================================================ */}
        {/* TAB 1: ⚡ DASHBOARD (डैशबोर्ड)                                 */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 1. TOP SOLITARY GO WALLET CARD (JIO SPOTLIGHT HERO CARD) */}
            <div className="relative rounded-3xl bg-gradient-to-r from-[#0A2885] via-[#0D38A5] to-[#071E66] text-white p-6 sm:p-8 shadow-[0_16px_40px_rgba(10,40,133,0.22)] overflow-hidden border border-blue-900/50">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Balance & Earnings Information */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-[#0A2885] flex items-center gap-1 shadow-sm">
                      <Wallet className="w-3.5 h-3.5" />
                      GO WALLET
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500/25 text-emerald-200 border border-emerald-400 flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      100% सत्यापित GO एजेंट (Verified ✓)
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                      प्रत्येक कन्फर्म टिकट पर फ्लैट ₹20 नकद कमाई
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-blue-200 uppercase tracking-wider block">
                      कुल उपलब्ध Go Wallet बैलेंस
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono tracking-tight flex items-baseline gap-2">
                      <span>₹{(agentWalletBalance || 0).toLocaleString('en-IN')}</span>
                      <span className="text-xs font-sans text-blue-200 font-normal">
                        ({confirmedCount} टिकट × ₹20 = ₹{totalCommissionEarned.toLocaleString('en-IN')} अर्जित)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                    आपकी समस्त टिकट बुकिंग की कमाई सीधे Go Wallet में जमा होती है। <strong>हर रविवार साप्ताहिक सेटलमेंट</strong> के तहत आप इसे बिना किसी कटौती के सीधे अपने बैंक या UPI में निकाल सकते हैं।
                  </p>
                </div>

                {/* Instant Actions (Pill Buttons) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="py-3 px-6 rounded-full bg-[#FF6500] hover:bg-[#e05800] text-white font-extrabold text-xs shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>
                      {activePendingPayout
                        ? '⏳ निकासी प्रक्रियाधीन देखें'
                        : 'साप्ताहिक निकासी (Sunday Payout)'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="py-3 px-5 rounded-full bg-white text-[#0A2885] hover:bg-slate-100 font-extrabold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-[#0A2885]" />
                    <span>पैसे जोड़ें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUberDefaultDestination('Bhopal ISBT Stand');
                      setIsUberModalOpen(true);
                    }}
                    className="py-3 px-5 rounded-full bg-black/40 hover:bg-black/60 border border-white/25 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    title="यात्रियों के लिए बस स्टैंड व स्टेशन तक Uber ऑटो/कैब सेवा"
                  >
                    <Car className="w-4 h-4 text-[#FFB703]" />
                    <span>🛺 Uber ऑटो / कैब</span>
                  </button>
                </div>

              </div>

              {/* Pending Payout Persistent Banner */}
              {activePendingPayout && (
                <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-300/40 text-amber-100 text-xs flex items-center justify-between gap-3 backdrop-blur-sm animate-pulse">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FFB703] shrink-0" />
                    <span>
                      <strong>निकासी प्रक्रियाधीन:</strong> ₹{activePendingPayout.amount} का सेटलमेंट अनुरोध एडमिन के पास समीक्षाधीन है। रविवार को भुगतान होगा।
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="px-3.5 py-1 bg-white text-[#0A2885] font-black rounded-full text-[10px] shrink-0 shadow-xs"
                  >
                    विवरण देखें
                  </button>
                </div>
              )}
            </div>

            {/* 2. STATS QUICK TILES (JIO CLEAN WHITE CARDS) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">कुल GO टिकटें</span>
                <div className="text-2xl font-black text-[#0A2885] font-mono">{myGoBookings.length}</div>
                <span className="text-[11px] font-bold text-emerald-600">{confirmedCount} कन्फर्म</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">कमीशन कमाई</span>
                <div className="text-2xl font-black text-[#FF6500] font-mono">₹{totalCommissionEarned}</div>
                <span className="text-[11px] font-medium text-slate-500">फ्लैट ₹20 / सीट</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">KYC सत्यापन</span>
                <div className="text-sm font-black text-slate-900 pt-1">
                  {currentUser?.kyc_status === 'verified' ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-4 h-4" /> 100% सत्यापित
                    </span>
                  ) : currentUser?.kyc_status === 'pending' ? (
                    <span className="text-[#FF6500] flex items-center gap-1 font-bold">
                      <Clock className="w-4 h-4" /> 24h प्रक्रियाधीन
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> बाकी है
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-slate-500">ऑफिशियल बैज</span>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">सपोर्ट डेस्क SLA</span>
                <div className="text-sm font-black text-[#0A2885] pt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> 24h समाधान
                </div>
                <span className="text-[11px] font-medium text-slate-500">{pendingSupportCount} लंबित टिकट</span>
              </div>
            </div>

            {/* 3. TICKET DESK & 24-HOUR RESOLUTION GUARANTEE (In-Wallet System) */}
            <div id="support-section" className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#0A2885]" />
                      <span>एजेंट सहायता व सपोर्ट डेस्क</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    <strong>24 घंटे में समाधान गारंटी (24-Hour SLA Guarantee)</strong> • बस ऑपरेटर, टिकट रिफंड या वॉलेट से संबंधित किसी भी समस्या का त्वरित समाधान।
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://help.safargo.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <span>help.safargo.in</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsSupportFormOpen(!isSupportFormOpen)}
                    className="py-2 px-4 rounded-full bg-[#0A2885] hover:bg-[#071E66] text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>नया टिकट बनाएं</span>
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex items-center justify-between">
                  <span className="text-xs text-amber-900 font-bold">प्रतीक्षारत टिकट (Pending)</span>
                  <span className="px-3 py-0.5 rounded-full bg-[#FF6500] text-white font-black text-xs font-mono">
                    {pendingSupportCount}
                  </span>
                </div>
                <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <span className="text-xs text-emerald-900 font-bold">समाधान किए गए (Solved)</span>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-600 text-white font-black text-xs font-mono">
                    {resolvedSupportCount}
                  </span>
                </div>
              </div>

              {/* Create Ticket Inline Form */}
              {isSupportFormOpen && (
                <form onSubmit={handleSupportTicketSubmit} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-black text-[#0A2885] uppercase tracking-wider">
                    नया हेल्प टिकट दर्ज करें (24-Hour Guaranteed Desk)
                  </h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      समस्या का विषय (Subject) *
                    </label>
                    <input
                      type="text"
                      value={supportSubject}
                      onChange={(e) => setSupportSubject(e.target.value)}
                      placeholder="उदा. टिकट बुकिंग अप्रूवल या रिफंड समस्या"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-[#0A2885] shadow-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      समस्या का संपूर्ण विवरण (Description) *
                    </label>
                    <textarea
                      rows={3}
                      value={supportDescription}
                      onChange={(e) => setSupportDescription(e.target.value)}
                      placeholder="विस्तार से अपनी समस्या बताएं..."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs outline-none focus:border-[#0A2885] shadow-xs"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSupportFormOpen(false)}
                      className="px-4 py-2 rounded-full bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSupportTicket}
                      className="px-5 py-2 rounded-full bg-[#0A2885] text-white text-xs font-bold hover:bg-[#071E66] disabled:opacity-50 shadow-sm"
                    >
                      {isSubmittingSupportTicket ? 'सबमिट हो रहा है...' : 'सबमिट करें'}
                    </button>
                  </div>
                </form>
              )}

              {/* Recent Support Tickets List */}
              {(agentSupportTickets || []).length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 block">हाल के सपोर्ट टिकट</span>
                  {(agentSupportTickets || []).slice(0, 3).map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900">{t.subject}</strong>
                          <span className="font-mono text-[10px] text-slate-500">#{t.ticket_code || t.id.slice(-6)}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-sm">{t.description}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                        t.status === 'resolved' || t.status === 'closed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {t.status === 'resolved' || t.status === 'closed' ? 'हल हुआ ✓' : 'प्रक्रियाधीन ⏳'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. GO WALLET TRANSACTIONS & MONEY ORIGIN HUB (JIO WHITE ROUNDED-3XL CARD) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0A2885] flex items-center justify-center font-black border border-blue-200">
                      <History className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span>Go Wallet खाता-बही व पैसे का स्रोत</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0A2885] border border-blue-200">
                        लाइव अपडेट्स
                      </span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    कहाँ-कहाँ से पैसा आया और कहाँ खर्च हुआ — टिकट कमीशन, रेफरल बोनस, वॉलेट रिचार्ज, सैलरी व निकासी का संपूर्ण ब्योरा
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsRechargeModalOpen(true)}
                    className="py-2 px-4 rounded-full bg-[#0A2885] hover:bg-[#071E66] text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-white" />
                    <span>पैसे जोड़ें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="py-2 px-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-[#0A2885]" />
                    <span>निकासी</span>
                  </button>
                </div>
              </div>

              {/* Source Filter Chips - Jio Rounded-Full Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setWalletSourceFilter('all')}
                  className={`py-2 px-4 rounded-full font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    walletSourceFilter === 'all'
                      ? 'bg-[#0A2885] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                      className={`py-2 px-4 rounded-full font-bold whitespace-nowrap transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        walletSourceFilter === catKey
                          ? 'bg-[#0A2885] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
                <input
                  type="text"
                  value={walletSearchTerm}
                  onChange={(e) => setWalletSearchTerm(e.target.value)}
                  placeholder="स्रोत, लेन-देन नाम, UTR, PNR या विवरण से खोजें..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885] placeholder:text-slate-400 transition"
                />
              </div>

              {/* Transactions List */}
              {filteredWalletTransactions.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2 bg-slate-50 rounded-2xl border border-slate-200">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
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
                        className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-black shrink-0 ${
                              isPositive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
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
                              <span className="font-extrabold text-slate-900 text-sm">
                                {tx.transaction_name || (isPositive ? 'जमा राशि' : 'निकासी राशि')}
                              </span>
                              {meta && (
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${meta.badgeBg} ${meta.badgeText} border ${meta.borderClass}`}
                                >
                                  {meta.shortLabel}
                                </span>
                              )}
                            </div>

                            {/* Source of Funds (कहाँ-कहाँ से पैसा आया) */}
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                              <span className="text-slate-400">स्रोत:</span>
                              <span className="font-bold text-[#0A2885]">{tx.source_name || tx.description}</span>
                            </div>

                            {/* Details / Booking Code */}
                            {tx.source_details && tx.source_details !== tx.source_name && (
                              <p className="text-[10px] text-slate-500 line-clamp-1">
                                {tx.source_details}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 flex sm:flex-col justify-between sm:justify-center items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                          <span
                            className={`text-base font-black font-mono ${
                              isPositive ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isPositive ? `+₹${tx.amount.toLocaleString('en-IN')}` : `-₹${Math.abs(tx.amount).toLocaleString('en-IN')}`}
                          </span>

                          <div className="text-[10px] text-slate-400 space-x-1">
                            <span>{new Date(tx.created_at).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short' })}</span>
                            <span>•</span>
                            <span>{new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          {tx.balance_after !== undefined && (
                            <span className="text-[10px] font-mono text-slate-500">
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
              className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-blue-50 via-white to-amber-50 border border-blue-200/80 flex items-center justify-between gap-4 cursor-pointer hover:border-[#0A2885] shadow-xs hover:shadow-md transition group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#0A2885] text-white flex items-center justify-center font-black shrink-0 shadow-md group-hover:scale-105 transition-transform">
                  <Bus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-[#0A2885] group-hover:text-[#071E66] transition">
                    नई बस टिकट बुक करें (New Bus Booking)
                  </h4>
                  <p className="text-xs text-slate-600">
                    मध्य प्रदेश के सभी मुख्य रूटों पर 5 मिनट में टिकट अप्रूवल व तुरंत ₹20 कमीशन
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-[#0A2885] group-hover:translate-x-1 transition-transform" />
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
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-400 shadow-xl text-center space-y-6 text-slate-800 animate-fadeIn">
                
                {/* 5-Min Live Timer Banner */}
                <div className="space-y-3">
                  <div className="inline-block">
                    <BookingApprovalTimer
                      createdAt={activePendingBooking.created_at}
                      deadlineAt={activePendingBooking.deadline_at}
                    />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    बुकिंग एडमिन स्वीकृति प्रक्रियाधीन है
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    कृपया इस पेज पर बने रहें और बैक बटन न दबाएं। एडमिन द्वारा अप्रूव होते ही यह पेज स्वतः रिफ्रेश होकर आपकी कन्फर्म टिकट प्रदर्शित करेगा।
                  </p>
                </div>

                {/* Ticket Details Card */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-3 max-w-lg mx-auto">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs text-slate-500 font-bold">बुकिंग कोड:</span>
                    <span className="font-mono font-black text-[#0A2885]">{activePendingBooking.booking_code}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">रूट:</span>
                    <span className="font-bold text-slate-900">
                      {getBookingRoute(activePendingBooking).from} ➔ {getBookingRoute(activePendingBooking).to}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">यात्री:</span>
                    <span className="font-bold text-slate-900">{activePendingBooking.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">सीट संख्या:</span>
                    <span className="font-bold text-emerald-600">{getBookingSeats(activePendingBooking)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">कुल किराया:</span>
                    <span className="font-mono font-black text-slate-900">
                      ₹{getBookingFare(activePendingBooking).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-xs text-slate-500 font-bold">एजेंट कमीशन:</span>
                    <span className="text-xs font-black text-[#FF6500]">+₹20.00 Go Wallet में</span>
                  </div>
                </div>

                {/* Safety Back-Trap Warning */}
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 max-w-lg mx-auto flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    सुरक्षा गार्ड सक्रिय: ब्राउज़र का बैक बटन दबाने पर भी आप इसी स्क्रीन पर सुरक्षित रहेंगे।
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={handleManualRefreshStatus}
                    disabled={isRefreshingStatus}
                    className="w-full py-3.5 px-5 rounded-full bg-[#FF6500] hover:bg-[#e05800] text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
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
                    className="w-full py-3.5 px-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    नया फॉर्म खोलें
                  </button>
                </div>
              </div>
            ) : activePendingBooking && activePendingBooking.status === 'confirmed' ? (
              /* Confirmed Ticket Green Screen */
              <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500 shadow-xl text-center space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs">
                    कन्फर्म (CONFIRMED)
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 pt-2">
                    🎉 बस टिकट सफलतापूर्वक कन्फर्म हो गई!
                  </h3>
                  <p className="text-xs text-emerald-700 font-bold">
                    PNR नंबर: <span className="font-mono text-base text-slate-900">{activePendingBooking.ticket_pnr || 'CONFIRMED'}</span> • ₹20 कमीशन Go Wallet में क्रेडिट हुआ!
                  </p>
                </div>

                {/* Ticket Details */}
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2.5 max-w-lg mx-auto text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">रूट:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {getBookingRoute(activePendingBooking).from} ➔ {getBookingRoute(activePendingBooking).to}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">यात्री का नाम:</span>
                    <span className="font-bold text-slate-900">{activePendingBooking.customer_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">सीट संख्या:</span>
                    <span className="font-bold text-emerald-600 font-mono text-sm">
                      {getBookingSeats(activePendingBooking)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold">ऑपरेटर:</span>
                    <span className="text-slate-700">{getBookingRoute(activePendingBooking).operator}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-500 font-bold">कुल भुगतान:</span>
                    <span className="font-mono font-black text-slate-900 text-base">
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
                    className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
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
                    className="w-full py-3.5 px-5 rounded-full bg-black hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    title="यात्री के लिए Uber ऑटो / कैब लिंक"
                  >
                    <Car className="w-4 h-4 text-[#FFB703]" />
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
                    className="w-full py-3.5 px-6 rounded-full bg-[#0A2885] hover:bg-[#071E66] text-white font-extrabold text-xs transition cursor-pointer shadow-md"
                  >
                    नई टिकट बुक करें ➔
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. TOP BOOKING MODE SWITCHER (JIO ROUNDED-FULL PILL BAR) */}
                <div className="bg-slate-100 p-1.5 rounded-full border border-slate-200 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode('auto')}
                    className={`flex-1 py-3 px-4 rounded-full text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                      bookingMode === 'auto'
                        ? 'bg-[#0A2885] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <Bus className="w-4 h-4" />
                    <span>🚌 ऑटोमैटिक बस सर्च व सीट मैप (Live Bus Booking)</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-white text-[#0A2885] shadow-xs">
                      पसंदीदा
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingMode('manual')}
                    className={`flex-1 py-3 px-4 rounded-full text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                      bookingMode === 'manual'
                        ? 'bg-[#0A2885] text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
                  /* NEW BUS BOOKING FORM (JIO CLEAN WHITE CARD) */
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6 text-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                          <Bus className="w-5 h-5 text-[#0A2885]" />
                          <span>त्वरित बस टिकट फॉर्म (Fast Track Booking)</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          सीट चुनें और कन्फर्म करें • प्रत्येक टिकट पर फ्लैट ₹20 नकद कमीशन Go Wallet में जुड़ेगा
                        </p>
                      </div>
                      <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                        ⚡ 5-Min Fast Track
                      </span>
                    </div>

                    <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                  
                  {/* Origin & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        कहाँ से (Source City) *
                      </label>
                      <select
                        value={bookingSource}
                        onChange={(e) => setBookingSource(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:border-[#0A2885] outline-none transition"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={`src-${c}`} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
                        कहाँ तक (Destination City) *
                      </label>
                      <select
                        value={bookingDestination}
                        onChange={(e) => setBookingDestination(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:border-[#0A2885] outline-none transition"
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
                      <label className="block text-slate-600 font-bold mb-1">
                        यात्रा की तारीख (Journey Date) *
                      </label>
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:border-[#0A2885] outline-none transition"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">
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
                        className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:border-[#0A2885] outline-none transition"
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
                    <span className="text-[11px] font-bold text-slate-600 block">
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
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center space-y-1 ${
                              isChosen
                                ? 'bg-blue-50/70 border-2 border-[#0A2885] shadow-sm scale-[1.02]'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="h-12 w-full flex items-center justify-center p-1 relative">
                              <img src={busOpt.img} alt={busOpt.label} className="max-h-full object-contain" />
                              <span className="absolute top-0 right-0 px-1 py-0.2 rounded bg-[#0A2885] text-white font-black text-[7px] leading-tight">
                                SafarGo ✓
                              </span>
                            </div>
                            <span className="text-[11px] font-black text-slate-900 leading-tight block">
                              {busOpt.label}
                            </span>
                            <span className="text-[8px] text-emerald-600 font-bold block">
                              🛡️ SafarGo Verified Bus
                            </span>
                            <span className="text-[9px] text-slate-500 block">{busOpt.sub}</span>
                            <span className="text-xs font-black text-[#0A2885] font-mono">
                              ₹{busOpt.fare}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-black text-[#0A2885] uppercase tracking-wider block">
                      यात्री विवरण (Passenger Information)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-600 text-[11px] font-bold mb-1">
                          यात्री का पूरा नाम *
                        </label>
                        <input
                          type="text"
                          value={passengerName}
                          onChange={(e) => setPassengerName(e.target.value)}
                          placeholder="उदा. राहुल शर्मा"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:border-[#0A2885]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 text-[11px] font-bold mb-1">
                          उम्र (Age) *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={passengerAge}
                          onChange={(e) => setPassengerAge(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:border-[#0A2885]"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-600 text-[11px] font-bold mb-1">
                          यात्री का मोबाइल नंबर (WhatsApp Ticket) *
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={passengerMobile}
                          onChange={(e) => setPassengerMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder="10-अंकीय मोबाइल नंबर"
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:border-[#0A2885] font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 text-[11px] font-bold mb-1">
                          सीटों की संख्या (Seats) *
                        </label>
                        <select
                          value={selectedSeatCount}
                          onChange={(e) => setSelectedSeatCount(parseInt(e.target.value) || 1)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:border-[#0A2885] font-bold"
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
                  <div className="p-4 bg-gradient-to-r from-blue-50 via-slate-50 to-amber-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">कुल टिकट किराया</span>
                      <span className="text-2xl font-black text-slate-900 font-mono">
                        ₹{(baseFarePerSeat * selectedSeatCount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">आपकी शुद्ध कमाई (Commission)</span>
                      <span className="text-lg font-black text-[#FF6500] font-mono">
                        +₹20.00 नकद
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingBooking}
                    className="w-full py-4 bg-gradient-to-r from-[#0A2885] via-[#0D38A5] to-[#0A2885] hover:from-[#071E66] hover:to-[#0A2885] text-white font-extrabold rounded-full text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
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
        {/* TAB 3: 📜 HISTORY (माई टिकट्स व हिस्ट्री — JIO WHITE STYLE)   */}
        {/* ============================================================ */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header & Filter Bar (Jio Clean White Card) */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#0A2885]" />
                    <span>इतिहास व रिकॉर्ड्स (History & Payouts)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    आपकी सभी बस टिकटों की लाइव स्थिति एवं प्रत्येक रविवार स्वतः होने वाले पेआउट्स का संपूर्ण विवरण
                  </p>
                </div>

                {/* Sub-Tab Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-full border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setHistoryViewMode('tickets')}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      historyViewMode === 'tickets'
                        ? 'bg-[#0A2885] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Bus className="w-3.5 h-3.5" />
                    <span>बस टिकट्स ({myGoBookings.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryViewMode('payouts')}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      historyViewMode === 'payouts'
                        ? 'bg-[#0A2885] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>रविवार पेआउट्स ({allPayoutHistory.length})</span>
                  </button>
                </div>
              </div>

              {historyViewMode === 'tickets' && (
                <>
                  {/* 4 Core Filter Buttons: All, Pending, Confirmed, Cancelled (Jio Rounded-Full Pills) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setHistoryFilter('all')}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        historyFilter === 'all'
                          ? 'bg-[#0A2885] text-white font-black shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      <span>सभी (All)</span>
                      <span className="text-[10px] opacity-80">({myGoBookings.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryFilter('pending')}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        historyFilter === 'pending'
                          ? 'bg-[#FF6500] text-white font-black shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                      className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        historyFilter === 'confirmed'
                          ? 'bg-emerald-600 text-white font-black shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>कन्फर्म (Confirmed)</span>
                      <span className="text-[10px] opacity-80">({confirmedCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryFilter('cancelled')}
                      className={`py-2 px-3 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        historyFilter === 'cancelled'
                          ? 'bg-rose-600 text-white font-black shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3" />
                    <input
                      type="text"
                      value={historySearchTerm}
                      onChange={(e) => setHistorySearchTerm(e.target.value)}
                      placeholder="PNR, यात्री का नाम, मोबाइल या शहर से खोजें..."
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885] transition"
                    />
                  </div>
                </>
              )}
            </div>

            {historyViewMode === 'payouts' ? (
              <div className="space-y-4 animate-fadeIn">
                {/* Verified Auto-Payout Destination Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-left space-y-3 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <div>
                        <span className="font-black text-emerald-950 text-sm">साप्ताहिक रविवार पेआउट एवं बैंक ट्रांसफर लॉग</span>
                        <p className="text-[11px] text-emerald-800">
                          कमीशन निकासी प्रत्येक रविवार को स्वतः ही आपके सत्यापित बैंक खाते या UPI में ट्रांसफर हो जाती है।
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white self-start sm:self-auto shadow-xs">
                      AUTOMATIC SETTLEMENT ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">सत्यापित बैंक खाता (Last 4 Digits)</span>
                        <strong className="font-mono text-slate-900 text-sm">•••• •••• {verifiedAccLast4}</strong>
                        <span className="text-[10px] text-slate-500 block">{verifiedBankName}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> सत्यापित ✓
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block">सत्यापित UPI ID</span>
                        <strong className="font-mono text-slate-900 text-sm truncate max-w-[160px] block">{verifiedUpi}</strong>
                        <span className="text-[10px] text-slate-500 block">Instant Settlement Active</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> सत्यापित ✓
                      </span>
                    </div>
                  </div>
                </div>

                {/* List of Payout Transactions */}
                <div className="space-y-3">
                  {allPayoutHistory.map((p: any) => {
                    const isApproved = p.status === 'approved' || p.status === 'paid' || p.status === 'completed';
                    const isPending = p.status === 'pending' || p.status === 'processing';
                    return (
                      <div
                        key={p.id}
                        className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 transition shadow-xs text-left space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                              <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-lg font-black text-slate-900">
                                  ₹{p.amount.toLocaleString('en-IN')}.00
                                </span>
                                {isApproved && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black flex items-center gap-1 shadow-xs">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Payout Success ✓
                                  </span>
                                )}
                                {isPending && (
                                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black flex items-center gap-1 shadow-xs">
                                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" /> प्रक्रियाधीन (Pending)
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                साप्ताहिक रविवार स्वतः सेटलमेंट • {p.payout_method === 'bank_transfer' ? 'बैंक ट्रांसफर' : 'UPI पेआउट'}
                              </span>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] text-slate-400 block font-bold">भुगतान तिथि</span>
                            <span className="text-xs font-bold text-slate-700">
                              {new Date(p.processed_at || p.created_at).toLocaleDateString('hi-IN', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              बैंक रेफरेंस नंबर (Bank Reference / UTR)
                            </span>
                            <strong className="font-mono text-emerald-700 text-xs font-black block mt-0.5">
                              {p.admin_reference || `UTR-SBIN${p.id.replace(/\D/g, '').slice(-10) || '2026101109'}`}
                            </strong>
                            <span className="text-[10px] text-emerald-600 block mt-0.5">
                              ✓ भारतीय रिज़र्व बैंक (RBI) बैंकिंग गेटवे सत्यापित
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              क्रेडिट हुआ खाता (Destination Account)
                            </span>
                            <strong className="font-mono text-slate-900 text-xs block mt-0.5">
                              {p.payout_method === 'bank_transfer'
                                ? `बैंक खाता: •••• •••• ${String(p.bank_account_number || verifiedAccLast4).slice(-4)}`
                                : `UPI ID: ${p.upi_id || verifiedUpi}`}
                            </strong>
                            <span className="text-[10px] text-slate-500 block mt-0.5 truncate">
                              {p.admin_notes || 'Automatic Sunday Settlement Transferred to Destination'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : filteredHistoryBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
                <Bus className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600">कोई टिकट नहीं मिली।</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('booking')}
                  className="py-2.5 px-5 bg-[#0A2885] hover:bg-[#071E66] text-white font-extrabold rounded-full text-xs cursor-pointer inline-block shadow-sm"
                >
                  नई बस टिकट बुक करें ➔
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistoryBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition space-y-3 text-slate-800"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 text-sm font-mono">{b.booking_code}</strong>
                          {b.status === 'confirmed' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                              PNR: {b.ticket_pnr || 'OK'} ✓
                            </span>
                          ) : b.status === 'cancelled' || b.status === 'refund_processed' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black">
                              रद्द / रिफंड
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black flex items-center gap-1">
                              <Clock className="w-3 h-3 animate-spin text-[#FF6500]" />
                              सत्यापन प्रक्रियाधीन
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-bold mt-1">
                          {getBookingRoute(b).from} ➔ {getBookingRoute(b).to} • यात्रा: {b.journey_date}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-lg font-black text-slate-900 font-mono block">
                          ₹{getBookingFare(b).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] font-bold text-[#FF6500]">+₹20 कमीशन</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
                      <div>
                        यात्री: <strong className="text-slate-900">{b.customer_name}</strong> (+91 {b.customer_mobile}) • सीट: <span className="text-emerald-600 font-mono font-bold">{getBookingSeats(b)}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => {
                              const msg = getWhatsAppTicketMessage(b);
                              window.open(`https://wa.me/91${b.customer_mobile}?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                            className="py-1.5 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>WhatsApp पर भेजें</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedPrintBooking(b)}
                          className="py-1.5 px-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>प्रिंट</span>
                        </button>

                        {b.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => setSelectedGreenCardBooking(b)}
                            className="py-1.5 px-3.5 rounded-full bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
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
                            className="py-1.5 px-3.5 rounded-full bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                            title="यात्री के लिए Uber कैब/ऑटो राइड लिंक"
                          >
                            <Car className="w-3.5 h-3.5 text-[#FFB703]" />
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
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-6 text-slate-800">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={profileAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200'}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#0A2885]"
                    />
                    <label className="absolute -bottom-1 -right-1 p-1.5 bg-[#0A2885] text-white rounded-lg cursor-pointer shadow hover:bg-[#071E66]">
                      <Camera className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicUpload} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{currentUser?.full_name || 'GO एजेंट'}</h3>
                    <p className="text-xs text-slate-500">{currentUser?.shop_name || 'अधिकृत केंद्र'} • ID: {currentUser?.id?.slice(-6).toUpperCase()}</p>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">अधिकृत GO एजेंट नेटवर्क</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser?.kyc_status === 'verified' ? (
                    <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" /> KYC सत्यापित
                    </span>
                  ) : currentUser?.kyc_status === 'pending' ? (
                    <span className="px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold flex items-center gap-1 shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-[#FF6500]" /> KYC समीक्षाधीन (24h)
                    </span>
                  ) : (
                    <span className="px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold shadow-xs">
                      KYC लंबित
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">पूरा नाम (Full Name) *</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">दुकान / केंद्र का नाम (Shop Name)</label>
                    <input
                      type="text"
                      value={profileShopName}
                      onChange={(e) => setProfileShopName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">पता (Address)</label>
                    <input
                      type="text"
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">शहर (City)</label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">जिला (District)</label>
                    <input
                      type="text"
                      value={profileDistrict}
                      onChange={(e) => setProfileDistrict(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885]"
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
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">पंजीकृत ईमेल (सुरक्षित)</label>
                    <input
                      type="text"
                      disabled
                      value={currentUser?.email || ''}
                      className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-2.5 px-6 rounded-full bg-[#0A2885] hover:bg-[#071E66] text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingProfile ? 'सेव हो रहा है...' : 'प्रोफाइल सेव करें'}</span>
                  </button>
                </div>
              </form>

            </div>

            {/* 2. KYC VERIFICATION SECTION */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-slate-800">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0A2885]" />
                  <h3 className="text-base sm:text-lg font-black text-slate-900">KYC सत्यापन डेस्क</h3>
                </div>
                <span className="text-xs text-slate-500">सुरक्षा मानक • 24 घंटे में अप्रूवल</span>
              </div>

              {/* CASE A: KYC SUBMITTED & PENDING (User CANNOT edit or view upload form again) */}
              {currentUser?.kyc_status === 'pending' ? (
                <div className="p-6 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center space-y-4 text-amber-900 animate-fadeIn">
                  <div className="w-14 h-14 rounded-full bg-amber-100 border border-amber-300 text-[#FF6500] mx-auto flex items-center justify-center animate-pulse">
                    <Clock className="w-7 h-7" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FF6500] text-white shadow-xs">
                      KYC VERIFICATION PENDING (24 HOURS)
                    </span>
                    <h4 className="text-lg font-black text-slate-900 pt-2">
                      KYC सत्यापन प्रक्रियाधीन (24 घंटे का समय)
                    </h4>
                    <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                      आपके आधार कार्ड एवं पैन कार्ड के विवरण सुरक्षित रूप से हमारे सत्यापन डेस्क को प्राप्त हो चुके हैं। SafarGo एडमिन डेस्क द्वारा 24 घंटे के भीतर आपका सत्यापन पूर्ण कर दिया जाएगा।
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200 text-[11px] text-amber-800 max-w-sm mx-auto shadow-xs">
                    🔒 सुरक्षा कारणों से सबमिट किए गए दस्तावेजों में परिवर्तन लॉक कर दिया गया है।
                  </div>
                </div>
              ) : (currentUser?.kyc_status === 'verified' || userOnboardingApp?.status === 'approved' || currentUser?.role === 'agent') ? (
                /* CASE B: KYC VERIFIED & ONBOARDING APPROVED */
                <div className="p-6 rounded-2xl bg-white border-2 border-emerald-400 space-y-4 text-slate-800 animate-fadeIn shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                          <span>100% KYC सत्यापित अधिकृत GO एजेंट</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black">
                            Verified ✓
                          </span>
                        </h4>
                        <p className="text-xs text-emerald-700 font-medium">
                          आपके ऑनबोर्डिंग दस्तावेज़ एवं साप्ताहिक रविवार सेटलमेंट खाते पूरी तरह सत्यापित हैं।
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Masked Documents Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Aadhaar Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">आधार कार्ड</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> सत्यापित ✓
                        </span>
                      </div>
                      <div className="text-sm font-black font-mono text-slate-900">
                        {verifiedAadhaarMasked}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        12-अंक UIDAI सत्यापित
                      </div>
                    </div>

                    {/* PAN Card */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">पैन कार्ड</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> सत्यापित ✓
                        </span>
                      </div>
                      <div className="text-sm font-black font-mono text-slate-900 uppercase">
                        {verifiedPanMasked}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        आयकर विभाग सत्यापित
                      </div>
                    </div>

                    {/* Bank Account */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">बैंक खाता</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> सत्यापित ✓
                        </span>
                      </div>
                      <div className="text-sm font-black font-mono text-slate-900">
                        {verifiedAccMasked}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {verifiedBankName}
                      </div>
                    </div>

                    {/* Settlement UPI */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">सेटलमेंट UPI</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> सत्यापित ✓
                        </span>
                      </div>
                      <div className="text-xs font-black font-mono text-emerald-800 truncate">
                        {verifiedUpi}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        रविवार स्वतः ट्रांसफर
                      </div>
                    </div>
                  </div>

                  {/* Sunday Payout Notice Banner */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 flex items-start gap-2.5 text-left">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-900 block">
                        साप्ताहिक स्वतः निकासी सूचना (Automatic Sunday Transfer):
                      </span>
                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        आपकी कमीशन राशि प्रत्येक रविवार को स्वतः ही आपके उपरोक्त बैंक खाते ({verifiedAccMasked}) या UPI ID ({verifiedUpi}) में ट्रांसफर हो जाती है। एडमिन द्वारा स्वीकृति मिलते ही बैंक रेफरेंस नंबर (UTR) के साथ हिस्ट्री तुरंत अपडेट हो जाती है।
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* CASE C: KYC NOT SUBMITTED (Show Form) */
                <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    कृपया अपना 12-अंकीय आधार कार्ड एवं 10-अंकीय पैन कार्ड दर्ज करें। सबमिट करने के बाद 24 घंटे के अंदर एडमिन द्वारा सत्यापन पूरा किया जाएगा।
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">आधार कार्ड नंबर (12 अंक) *</label>
                      <input
                        type="text"
                        maxLength={12}
                        value={kycAadhaar}
                        onChange={(e) => setKycAadhaar(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234 5678 9012"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885] font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-600 font-bold mb-1">पैन कार्ड नंबर (10 अक्षर/अंक) *</label>
                      <input
                        type="text"
                        maxLength={10}
                        value={kycPan}
                        onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                        placeholder="ABCDE1234F"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs outline-none focus:bg-white focus:border-[#0A2885] font-mono uppercase"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingKyc}
                    className="w-full py-3.5 bg-[#0A2885] hover:bg-[#071E66] text-white font-extrabold rounded-full text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmittingKyc ? 'सबमिट हो रहा है...' : 'KYC सत्यापन हेतु सबमिट करें (24-Hour SLA)'}</span>
                  </button>
                </form>
              )}

            </div>

            {/* 3. REFER & EARN ₹100 PER 5 BOOKINGS (Jio Royal Blue Spotlight Card) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0A2885] via-[#0D38A5] to-[#071E66] text-white shadow-xl space-y-4 border border-blue-900/50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-[#0A2885] shadow-xs">
                    REFER & EARN ₹100
                  </span>
                  <h3 className="text-lg font-black text-white pt-1">
                    साथी एजेंटों को जोड़ें और कमाएं ₹100 सीधा कैश
                  </h3>
                  <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                    अपने रेफरल लिंक से नए बस एजेंटों या दुकानदारों को जोड़ें। आपके रेफर किए गए एजेंट की पहली <strong>5 सफल बुकिंग</strong> होते ही आपको ₹100 का नकद बोनस सीधे Go Wallet में प्राप्त होगा!
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0">
                  <span className="text-[10px] text-blue-200 font-bold block">रेफरल कोड</span>
                  <span className="text-xl font-black text-[#FFB703] font-mono">
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
                  className="w-full sm:w-auto py-3 px-6 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>WhatsApp पर रेफरल लिंक भेजें</span>
                </button>

                <span className="text-[11px] text-blue-100 text-center sm:text-left">
                  प्रत्येक 5 बुकिंग पर ₹100 स्वतः Go Wallet में जुड़ता है।
                </span>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* 4 EXCLUSIVE JIO BOTTOM FLOATING DOCK NAVIGATION                */}
      {/* ============================================================== */}
      <nav className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-full shadow-[0_12px_40px_rgba(10,40,133,0.18)] py-2 px-3 flex items-center justify-around">
          
          {/* Option 1: Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#0A2885] text-white font-black shadow-md scale-105'
                : 'text-slate-600 hover:text-[#0A2885] font-bold'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">डैशबोर्ड</span>
          </button>

          {/* Option 2: Booking (5-Min Timer & Fast Track) */}
          <button
            type="button"
            onClick={() => setActiveTab('booking')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === 'booking'
                ? 'bg-[#0A2885] text-white font-black shadow-md scale-105'
                : 'text-slate-600 hover:text-[#0A2885] font-bold'
            }`}
          >
            <Bus className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">बुकिंग</span>
          </button>

          {/* Option 3: History (Filtered Bookings) */}
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0A2885] text-white font-black shadow-md scale-105'
                : 'text-slate-600 hover:text-[#0A2885] font-bold'
            }`}
          >
            <FileText className="w-4 h-4 mb-0.5" />
            <span className="text-[10px]">हिस्ट्री</span>
          </button>

          {/* Option 4: Account (Profile, KYC Lock & Refer) */}
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all cursor-pointer ${
              activeTab === 'account'
                ? 'bg-[#0A2885] text-white font-black shadow-md scale-105'
                : 'text-slate-600 hover:text-[#0A2885] font-bold'
            }`}
          >
            <User className="w-4 h-4 mb-0.5" />
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
