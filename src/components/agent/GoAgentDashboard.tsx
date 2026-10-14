import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Go3DUltraLogo } from '../common/Go3DUltraLogo';
import { WalletRechargeModal } from './WalletRechargeModal';
import { GoInstantAddMoneyModal } from './GoInstantAddMoneyModal';
import { GoAgentWithdrawalModal } from './GoAgentWithdrawalModal';
import { GoAgentSupportDesk } from './GoAgentSupportDesk';
import { GoAccountHistoryDesk } from './GoAccountHistoryDesk';
import { ReferAndEarn } from './ReferAndEarn';
import { LiveTicketGreenCard } from '../common/LiveTicketGreenCard';
import { PrintTicketModal } from '../common/PrintTicketModal';
import { RedBusSeatMapModal, SelectedSeatItem } from '../bus/RedBusSeatMapModal';
import { AutoBusBookingCheckoutModal } from '../bus/AutoBusBookingCheckoutModal';
import { MP_NETWORK_CITIES } from '../../lib/mockData';
import { Booking, BookingStatus, RefundStatus, BusTrip, SeatCategory } from '../../types';
import { compressImage } from '../../lib/storageUtils';
import {
  LayoutDashboard,
  Bus,
  Wallet,
  User,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
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
  CreditCard,
  Building,
  MapPin,
  Phone,
  Mail,
  Award,
  Upload,
  LogOut,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  FileText,
  BadgeAlert,
  Send,
  Calendar,
  Repeat,
  Coffee,
  Wifi,
  Crown,
  Lock,
  Gift,
  Camera,
  Save,
} from 'lucide-react';

interface GoAgentDashboardProps {
  onNavigateHome?: () => void;
  onOpenBookingModal?: () => void;
}

// Dedicated 3-Minute Live Countdown Timer for GO Agent Bookings
const TicketCountdownTimer: React.FC<{ createdAt: string; deadlineAt?: string }> = ({
  createdAt,
  deadlineAt,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    const target = deadlineAt
      ? new Date(deadlineAt).getTime()
      : new Date(createdAt).getTime() + 3 * 60 * 1000;
    return Math.max(0, Math.floor((target - Date.now()) / 1000));
  });

  useEffect(() => {
    const updateCountdown = () => {
      const target = deadlineAt
        ? new Date(deadlineAt).getTime()
        : new Date(createdAt).getTime() + 3 * 60 * 1000;
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
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-300 text-[10px] font-mono font-bold animate-pulse">
        <Clock className="w-3 h-3 text-orange-400" />
        <span>स्वीकृति प्रक्रियाधीन (High Priority Desk)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-950/90 border border-amber-400/60 text-amber-300 text-[11px] font-mono font-black shadow-inner">
      <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
      <span className="font-sans text-[10px] font-bold text-slate-300">3m अप्रूवल:</span>
      <span className="text-xs font-black text-amber-300 tracking-wider bg-slate-950/90 px-1.5 py-0.5 rounded border border-amber-400/40">
        {formatted}
      </span>
    </div>
  );
};

// Safe Booking Data Extraction Helpers (prevents undefined.toLocaleString crashes)
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
  const operator = b.actual_operator || b.operator_preference || (b as any).bus_operator || 'SafarGo Regular';
  return { from, to, operator };
};

export const GoAgentDashboard: React.FC<GoAgentDashboardProps> = ({
  onNavigateHome,
  onOpenBookingModal,
}) => {
  const { currentUser, role, logout, submitAgentKyc, updateProfile } = useAuth();

  // Strict Security Guard: Prevent unauthenticated users or non-agents from viewing or leaking state
  if (!currentUser || role !== 'agent') {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <Go3DUltraLogo size="md" showBadge={false} />
        <div className="space-y-2 max-w-md">
          <h2 className="text-xl font-black text-amber-400">लॉगिन आवश्यक है (Agent Login Required)</h2>
          <p className="text-xs text-slate-400">
            GO Agent 3D Terminal का उपयोग करने हेतु कृपया अपने अधिकृत एजेंट क्रेडेंशियल्स से लॉगिन करें।
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
  const {
    agentBookings,
    agentWalletBalance,
    agentWalletRecharges,
    agentWalletTransactions,
    requestCancellation,
    busTrips,
  } = useData();
  const { success, error, info } = useToast();

  // Exactly 4 Bottom Navigation Options:
  // 1: 'dashboard', 2: 'bookings', 3: 'wallet', 4: 'account'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'wallet' | 'account'>('dashboard');

  // Sub-Tab in Bookings & Refund Desk: 'auto_book' (GO Edition Booking) vs 'history' (My Bookings & Refund)
  const [bookingSubTab, setBookingSubTab] = useState<'auto_book' | 'history'>('auto_book');

  // Sub-Tab in Go Account Desk: 'profile' (Profile & Photo) vs 'tickets' (24h SLA) vs 'history' (Add Money 3m) vs 'refer' (Refer & Earn ₹100) vs 'kyc' (KYC Desk)
  const [accountSubTab, setAccountSubTab] = useState<'profile' | 'tickets' | 'history' | 'refer' | 'kyc'>('profile');

  // Go Agent Profile State (Editable: Name, Address, Shop Name, City, District, Avatar; Locked: Mobile, Email)
  const [profileName, setProfileName] = useState(currentUser?.full_name || '');
  const [profileShopName, setProfileShopName] = useState(currentUser?.shop_name || '');
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || '');
  const [profileCity, setProfileCity] = useState(currentUser?.city || '');
  const [profileDistrict, setProfileDistrict] = useState(currentUser?.district || '');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 400, 400, 0.8);
      setProfileAvatarUrl(compressed);
      success('फोटो तैयार', 'प्रोफाइल फोटो चुन ली गई है। कृपया "प्रोफाइल सेव करें" बटन दबाएं।');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
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
        success('प्रोफाइल सेव हो गई!', 'आपकी GO Agent प्रोफाइल विवरण सफलतापूर्वक अपडेट कर दी गई है।');
      } else {
        error('त्रुटि', 'प्रोफाइल सेव करने में समस्या आई।');
      }
    } catch (err: any) {
      error('अपडेट विफल', err?.message || 'प्रोफाइल सेव नहीं हो सकी।');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Auto Bus Booking Engine State (GO Bus Special Bus System)
  const [searchSource, setSearchSource] = useState('Bhopal');
  const [searchDestination, setSearchDestination] = useState('Indore');
  const [searchDate, setSearchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterBusType, setFilterBusType] = useState<'all' | 'ac' | 'sleeper' | 'seater'>('all');

  // Seat selection and Checkout Modals
  const [selectedTripForSeatMap, setSelectedTripForSeatMap] = useState<BusTrip | null>(null);
  const [autoCheckoutData, setAutoCheckoutData] = useState<{
    trip: BusTrip;
    selectedSeats: SelectedSeatItem[];
    totalFare: number;
    seatCategory: SeatCategory;
    boardingPoint: string;
    dropPoint: string;
  } | null>(null);

  // Modals
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isInstantAddMoneyModalOpen, setIsInstantAddMoneyModalOpen] = useState(false);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [selectedGreenCardBooking, setSelectedGreenCardBooking] = useState<Booking | null>(null);
  const [selectedPrintBooking, setSelectedPrintBooking] = useState<Booking | null>(null);
  const [refundBooking, setRefundBooking] = useState<Booking | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Bookings filter and search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending' | 'refunded'>('all');

  // KYC Form State in Go Account
  const [aadhaarNumber, setAadhaarNumber] = useState(currentUser?.aadhaar_number || '');
  const [panNumber, setPanNumber] = useState(currentUser?.pan_number || '');
  const [bankHolder, setBankHolder] = useState(currentUser?.bank_account_holder || currentUser?.full_name || '');
  const [bankAccount, setBankAccount] = useState(currentUser?.bank_account_number || '');
  const [confirmBankAccount, setConfirmBankAccount] = useState(currentUser?.bank_account_number || '');
  const [bankIfsc, setBankIfsc] = useState(currentUser?.bank_ifsc || '');
  const [bankName, setBankName] = useState(currentUser?.bank_name || '');
  const [aadhaarFrontUrl, setAadhaarFrontUrl] = useState(currentUser?.aadhaar_front_url || '');
  const [panCardUrl, setPanCardUrl] = useState(currentUser?.pan_card_url || '');
  const [isSubmittingKyc, setIsSubmittingKyc] = useState(false);

  // Filter Bookings to Strictly Show ONLY this GO Agent's real bookings (No old dummy data from other users!)
  const myGoBookings = useMemo(() => {
    if (!currentUser) return [];
    return agentBookings.filter(
      (b) =>
        b.agent_id === currentUser.id ||
        (currentUser.mobile && b.agent_mobile === currentUser.mobile)
    );
  }, [agentBookings, currentUser]);

  const isKycVerified = currentUser?.kyc_status === 'verified' || currentUser?.agent_status === 'approved';

  // GO USER Business Rules: Flat ₹20 Commission & ₹10,000 Fixed Salary at 280 tickets
  const FLAT_GO_COMMISSION = 20;
  const TARGET_SALARY_TICKETS = 280;
  const FIXED_MONTHLY_SALARY = 10000;

  const confirmedBookings = myGoBookings.filter((b) => b.status === 'confirmed');
  const confirmedCount = confirmedBookings.length;
  const totalCommissionEarned = confirmedCount * FLAT_GO_COMMISSION;

  const remainingSalaryTickets = Math.max(0, TARGET_SALARY_TICKETS - confirmedCount);
  const isSalaryEligible = confirmedCount >= TARGET_SALARY_TICKETS;
  const earnedSalary = isSalaryEligible ? FIXED_MONTHLY_SALARY : 0;
  const totalProjectedEarnings = totalCommissionEarned + earnedSalary;
  const salaryProgressPercent = Math.min(100, Math.round((confirmedCount / TARGET_SALARY_TICKETS) * 100));

  // Audio chime synthesizer for real-time ticket confirmation notification
  const playApprovalChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.18); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }, []);

  // Real-Time Approval Detection: Watch for newly confirmed tickets by admin and generate Live Green Card instantly!
  const knownConfirmedRef = useRef<Set<string>>(
    new Set(myGoBookings.filter((b) => b.status === 'confirmed').map((b) => b.id))
  );

  useEffect(() => {
    const known = knownConfirmedRef.current;
    const newlyConfirmed = myGoBookings.find(
      (b) => b.status === 'confirmed' && !known.has(b.id)
    );

    if (newlyConfirmed) {
      known.add(newlyConfirmed.id);
      playApprovalChime();
      success(
        '🎉 टिकट एडमिन द्वारा स्वीकृत व कन्फर्म!',
        `PNR: ${newlyConfirmed.ticket_pnr || 'SFG-CONFIRMED'} • लाइव ग्रीन कार्ड स्वतः स्क्रीन पर सक्रिय हो गया है (+₹20 कमीशन Go Wallet में क्रेडिट)!`
      );
      // Instantly generate and display the Live Ticket Green Card in real time!
      setSelectedGreenCardBooking(newlyConfirmed);
    }
  }, [myGoBookings, playApprovalChime, success]);

  // Swap Source and Destination
  const handleSwapCities = () => {
    const temp = searchSource;
    setSearchSource(searchDestination);
    setSearchDestination(temp);
  };

  // Matching Trips for GO Bus Special Bus System
  const matchingTrips = useMemo(() => {
    const filtered = busTrips.filter((trip) => {
      const matchSrc = trip.source.toLowerCase().includes(searchSource.toLowerCase().trim());
      const matchDest = trip.destination.toLowerCase().includes(searchDestination.toLowerCase().trim());

      if (!matchSrc || !matchDest) return false;

      if (filterBusType === 'ac') return trip.bus_type?.toLowerCase().includes('ac') || trip.is_ac;
      if (filterBusType === 'sleeper') return trip.has_sleeper || trip.sleeper_fare;
      if (filterBusType === 'seater') return trip.has_seater || trip.seater_fare;

      return true;
    });

    // If exact route matched, return it; otherwise show popular MP network buses
    return filtered.length > 0 ? filtered : busTrips;
  }, [busTrips, searchSource, searchDestination, filterBusType]);

  // Filtered Bookings for History
  const filteredBookings = useMemo(() => {
    return myGoBookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.booking_code.toLowerCase().includes(q) ||
        (b.ticket_pnr && b.ticket_pnr.toLowerCase().includes(q)) ||
        b.customer_name.toLowerCase().includes(q) ||
        b.customer_mobile.includes(q) ||
        b.bus_operator.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (statusFilter === 'confirmed') return b.status === 'confirmed';
      if (statusFilter === 'pending')
        return b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation';
      if (statusFilter === 'refunded')
        return (
          b.status === 'cancelled' ||
          b.status === 'cancellation_requested' ||
          b.refund_status === 'approved' ||
          b.refund_status === 'completed'
        );

      return true;
    });
  }, [myGoBookings, searchQuery, statusFilter]);

  // Handle Refund Submit
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundBooking) return;
    if (!refundReason.trim()) {
      error('कारण अनिवार्य', 'कृपया रिफंड या कैंसिलेशन का कारण बताएं।');
      return;
    }

    setIsSubmittingRefund(true);
    try {
      const ok = await requestCancellation(refundBooking.id, refundReason.trim());
      if (ok) {
        success('रिफंड अनुरोध दर्ज!', 'एडमिन अनुमोदन के बाद राशि आपके Go Wallet में क्रेडिट हो जाएगी।');
        setRefundBooking(null);
        setRefundReason('');
      }
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  // Handle File Upload for KYC
  const handleKycFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'aadhaar' | 'pan'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file, 800, 800, 0.7);
      if (type === 'aadhaar') setAadhaarFrontUrl(compressed);
      else setPanCardUrl(compressed);
      success('दस्तावेज़ अपलोड हुआ', 'दस्तावेज़ सफलतापूर्वक जोड़ दिया गया है।');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'aadhaar') setAadhaarFrontUrl(reader.result as string);
        else setPanCardUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle KYC Submit
  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      error('अमान्य आधार', 'कृपया सही 12-अंकीय आधार कार्ड नंबर दर्ज करें।');
      return;
    }
    const cleanPan = panNumber.trim().toUpperCase();
    if (cleanPan.length !== 10) {
      error('अमान्य पैन', 'कृपया सही 10-अंकीय पैन कार्ड नंबर दर्ज करें।');
      return;
    }
    if (bankAccount !== confirmBankAccount) {
      error('खाता संख्या बेमेल', 'बैंक खाता संख्या और पुनः दर्ज संख्या मेल नहीं खाती।');
      return;
    }
    if (!bankIfsc.trim() || !bankName.trim()) {
      error('विवरण अधूरा', 'कृपया IFSC कोड और बैंक का नाम भरें।');
      return;
    }

    setIsSubmittingKyc(true);
    try {
      const ok = await submitAgentKyc({
        aadhaar_number: cleanAadhaar,
        pan_number: cleanPan,
        bank_account_holder: bankHolder.trim(),
        bank_account_number: bankAccount.trim(),
        bank_ifsc: bankIfsc.trim().toUpperCase(),
        bank_name: bankName.trim(),
        aadhaar_front_url: aadhaarFrontUrl || undefined,
        pan_card_url: panCardUrl || undefined,
      });

      if (ok) {
        success('Go KYC अनुरोध सबमिट!', 'आपका KYC सत्यापन अनुरोध एडमिन डेस्क को भेज दिया गया है।');
      }
    } finally {
      setIsSubmittingKyc(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 pb-24">
      
      {/* ============================================================== */}
      {/* TOP HEADER: NO THREE DOTS! ULTRA PROFESSIONAL & 3D CLEAN        */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-amber-400/40 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: 3D GO Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Go3DUltraLogo size="sm" showBadge={false} />
            <div className="hidden md:block border-l border-slate-700 pl-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                GO EDITION TERMINAL
              </span>
              <span className="text-xs font-black text-slate-200 block truncate max-w-[160px]">
                {currentUser?.shop_name || 'GO Special Agent Desk'}
              </span>
            </div>
          </div>

          {/* Center: Live Commission Badge (Flat ₹20) */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-emerald-500/20 border border-amber-400/50 rounded-2xl px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-inner">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] sm:text-[11px] flex items-center justify-center shadow">
              ₹20
            </div>
            <div className="leading-tight text-left">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-amber-300 block">
                कमीशन
              </span>
              <span className="text-[11px] sm:text-xs font-extrabold text-white whitespace-nowrap">
                फ्लैट ₹20
              </span>
            </div>
          </div>

          {/* Right: Go Wallet Balance Quick Pill & Quick Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setIsInstantAddMoneyModalOpen(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs px-2.5 sm:px-3.5 py-1.5 rounded-xl shadow-md transition flex items-center gap-1 sm:gap-1.5 cursor-pointer active:scale-95"
              title="⚡ GO Instant Add Money — तुरंत बैलेंस लोड करें"
            >
              <Zap className="w-3.5 h-3.5 shrink-0 fill-slate-950" />
              <span className="font-mono">₹{(agentWalletBalance || 0).toLocaleString('en-IN')}</span>
              <span className="text-[9px] bg-slate-950/30 text-white px-1 py-0.2 rounded font-bold">+</span>
            </button>

            <button
              type="button"
              onClick={() => {
                logout();
                if (onNavigateHome) {
                  onNavigateHome();
                } else {
                  window.location.href = '/';
                }
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-900/80 text-slate-300 hover:text-rose-100 border border-slate-700/80 text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
              title="सुरक्षित लॉगआउट करें (Sign Out)"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">लॉगआउट</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA BY TAB                                       */}
      {/* ============================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6 pb-28 sm:pb-32">
        
        {/* ============================================================ */}
        {/* 1. TAB: ⚡ 3D DASHBOARD                                      */}
        {/* ============================================================ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* 3D Holographic Hero Card */}
            <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-900 border-2 border-amber-400/60 p-6 sm:p-8 shadow-[0_20px_50px_rgba(245,158,11,0.15)] overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-sm flex items-center gap-1">
                      <Award className="w-3 h-3 text-slate-950" />
                      GO Certified Special Agent
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      100% Real Gmail Verified
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    नमस्ते, <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200 bg-clip-text text-transparent">{currentUser?.full_name || 'GO एजेंट'}</span>!
                  </h1>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                    SafarGo 3D स्पेशल एजेंट टर्मिनल में आपका स्वागत है। आपके खाते में प्रत्येक कन्फर्म बुकिंग पर <strong>फ्लैट ₹20 नकद कमीशन</strong> सीधे Go Wallet में जमा होता है।
                  </p>
                </div>

                {/* Instant Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('bookings');
                      setBookingSubTab('auto_book');
                    }}
                    className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-xl transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Bus className="w-4 h-4" />
                    <span>⚡ GO Edition Bus Booking (Auto)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsInstantAddMoneyModalOpen(true)}
                    className="py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>⚡ GO Instant Add Money</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SPECIAL HUGE GREEN TICK BADGE FOR KYC VERIFIED GO AGENT */}
            {isKycVerified ? (
              <div className="relative rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-2 border-emerald-400 p-4 sm:p-6 shadow-[0_0_35px_rgba(16,185,129,0.35)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-300 to-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-[0_0_25px_#10b981] shrink-0 animate-pulse">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[3] text-slate-950" />
                  </div>
                  <div className="space-y-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base sm:text-lg font-black text-white tracking-wide">
                        100% KYC सत्यापित अधिकृत GO एजेंट
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase shadow-xs">
                        OFFICIAL VERIFIED BADGE
                      </span>
                    </div>
                    <p className="text-xs text-emerald-300 font-medium">
                      सत्यापन नंबर: <strong className="font-mono text-white">{currentUser?.aadhaar_number ? `Aadhaar XXXX-XXXX-${currentUser.aadhaar_number.slice(-4)}` : `GO-VERIFIED-${currentUser?.id?.slice(-6).toUpperCase()}`}</strong> • पैन: {currentUser?.pan_number ? `${currentUser.pan_number.slice(0, 5)}XXXX${currentUser.pan_number.slice(-1)}` : 'सत्यापित'} • मध्य प्रदेश शासन व अधिकृत बस नेटवर्क
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    🟢 लाइव सक्रिय स्टेटस
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-amber-500/10 border border-amber-500/40 p-3.5 flex items-center justify-between gap-3 text-xs text-amber-300">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
                  <span>
                    <strong>KYC सत्यापन आवश्यक:</strong> स्पेशल बड़ा ग्रीन टिक बैज व पूर्ण पेआउट्स अनलॉक करने हेतु KYC फॉर्म भरें।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('account');
                    setAccountSubTab('kyc');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition shrink-0 cursor-pointer"
                >
                  KYC जमा करें
                </button>
              </div>
            )}

            {/* 4 Metric Stats Cards in 3D Fintech Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Go Wallet Balance */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-2 relative overflow-hidden group hover:border-emerald-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">Go Wallet बैलेंस</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
                </div>
                <button
                  type="button"
                  onClick={() => setIsInstantAddMoneyModalOpen(true)}
                  className="text-[10px] font-bold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡ तुरंत पैसे जोड़ें (Instant Add)</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Card 2: Total Commission Earned (₹20 per booking) */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-2 relative overflow-hidden group hover:border-amber-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">कुल कमीशन अर्जित</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  ₹{totalCommissionEarned.toLocaleString('en-IN')}
                </div>
                <p className="text-[10px] text-slate-400">
                  {confirmedCount} कन्फर्म बुकिंग्स × ₹20
                </p>
              </div>

              {/* Card 3: Total Bookings */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-xl space-y-2 relative overflow-hidden group hover:border-cyan-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">मेरी GO बस टिकटें</span>
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Bus className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono">
                  {myGoBookings.length}
                </div>
                <p className="text-[10px] text-slate-400">
                  {confirmedCount} कन्फर्म | {myGoBookings.length - confirmedCount} प्रोसेस में
                </p>
              </div>

              {/* Card 4: KYC & Account Status */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-indigo-500/40 shadow-xl space-y-2 relative overflow-hidden group hover:border-indigo-400 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">GO KYC स्थिति</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {currentUser?.kyc_status === 'verified' ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> 100% सत्यापित
                    </span>
                  ) : currentUser?.kyc_status === 'pending' ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> समीक्षाधीन
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> सत्यापन लंबित
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('account')}
                  className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>KYC विवरण देखें / अपडेट करें</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

            </div>

            {/* GO USER Salary Eligibility & Commission Breakdown Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-2 border-blue-500/40 shadow-2xl space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-lg">
                    ₹10k
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white">
                        GO USER वेतन नियम (Salary Rule)
                      </span>
                      {isSalaryEligible ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          🎉 लक्ष्य पूर्ण! ₹10,000 फिक्स्ड वेतन अर्जित
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {remainingSalaryTickets} टिकट बाकी ₹10,000 फिक्स्ड वेतन के लिए
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      280 कन्फर्म टिकट = ₹10,000 फिक्स्ड वेतन + ₹20/टिकट कमीशन
                    </h3>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      <strong>सख्त नियम:</strong> 280 टिकट पूरे होने पर ₹10,000 का फिक्स्ड वेतन मिलता है। 280 से कम होने पर वेतन 'अर्जित नहीं' रहेगा (कोई आंशिक कटौती नहीं)।
                      280 टिकट पर: <strong>₹5,600 कमीशन (280 × ₹20) + ₹10,000 वेतन = ₹15,600 कुल कमाई</strong>!
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 text-right shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">कुल अनुमानित कमाई</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    ₹{totalProjectedEarnings.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    ₹{totalCommissionEarned.toLocaleString('en-IN')} कमीशन + ₹{earnedSalary.toLocaleString('en-IN')} वेतन
                  </span>
                </div>
              </div>

              {/* Progress bar towards 280 tickets */}
              <div className="pt-2 border-t border-slate-800 space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>प्रगति: {confirmedCount} / {TARGET_SALARY_TICKETS} टिकट ({salaryProgressPercent}%)</span>
                  <span>
                    {isSalaryEligible ? 'सैलरी पात्रता: पूर्ण (Eligible)' : `लक्ष्य शेष: ${remainingSalaryTickets} टिकट`}
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 shadow-md ${
                      isSalaryEligible
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        : 'bg-gradient-to-r from-amber-400 via-orange-500 to-blue-500'
                    }`}
                    style={{ width: `${salaryProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Subtle Animation Toast Banner: You earned ₹20 commission */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-black animate-pulse">
                  ⚡
                </div>
                <span className="text-amber-200 font-bold">
                  "You earned ₹20 commission" — हर कन्फर्म बुकिंग पर फ्लैट ₹20 नकद कमीशन स्वतः क्रेडिट होता है!
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[10px] font-mono font-bold shrink-0">
                100% Guaranteed
              </span>
            </div>

            {/* System Live Updates Section ("system update hoga") */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-xs sm:text-sm font-black text-white">
                    सिस्टम लाइव अपडेट्स (Live System Updates & Ticker)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-400">99.9% Uptime</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-black text-amber-400 uppercase">⚡ ऑपरेटर स्पीड</span>
                  <p className="text-slate-300 font-medium">
                    मध्य प्रदेश के 25+ शहरों में औसत 8 मिनट के अंदर ऑपरेटर PNR कन्फर्मेशन जारी।
                  </p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase">💰 कमीशन इंजन</span>
                  <p className="text-slate-300 font-medium">
                    फ्लैट ₹20 कमीशन बिना किसी कटौती के प्रत्येक सीट कन्फर्मेशन पर स्वतः क्रेडिट।
                  </p>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-black text-cyan-400 uppercase">🛡️ Go Wallet सुरक्षा</span>
                  <p className="text-slate-300 font-medium">
                    10-मिनट पेमेंट टाइमर व UTR बैंक वेरिफिकेशन लाइव सक्रिय है।
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Bookings Quick Table */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-white">
                  हाल की बुकिंग्स (Recent Bookings)
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('bookings');
                    setBookingSubTab('history');
                  }}
                  className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>सभी देखें ({myGoBookings.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {myGoBookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Bus className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs">आपके GO खाते में अभी कोई पुरानी टिकट नहीं है।</p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('bookings');
                      setBookingSubTab('auto_book');
                    }}
                    className="py-2.5 px-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 font-black rounded-xl text-xs inline-block cursor-pointer"
                  >
                    ⚡ GO Edition बस टिकट बुक करें (कमाएं फ्लैट ₹20) ➔
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {myGoBookings.slice(0, 4).map((b) => (
                    <div
                      key={b.id}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                          <Bus className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white font-mono">{b.booking_code}</strong>
                            {b.status === 'confirmed' ? (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.2 rounded-full border border-emerald-500/30">
                                कन्फर्म PNR: {b.ticket_pnr || 'OK'}
                              </span>
                            ) : b.status === 'cancellation_requested' || b.refund_status === 'requested' ? (
                              <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.2 rounded-full border border-rose-500/30">
                                रिफंड प्रतीक्षारत ⏳
                              </span>
                            ) : (
                              <TicketCountdownTimer createdAt={b.created_at} deadlineAt={b.deadline_at} />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {b.customer_name} • {getBookingRoute(b).from} ➔ {getBookingRoute(b).to} • {b.journey_date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <div className="text-right">
                          <span className="text-sm font-black text-white font-mono block">
                            ₹{getBookingFare(b).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-bold text-amber-400">
                            +₹20.00 कमीशन
                          </span>
                        </div>
                        {b.status === 'confirmed' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedGreenCardBooking(b)}
                            className="py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                            title="🟢 लाइव ग्रीन कार्ड देखें"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                            <span>ग्रीन कार्ड</span>
                          </button>
                        ) : (
                          <div className="py-1 px-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400 animate-spin" />
                            <span>सत्यापन जारी (टिकट लॉक)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* 2. TAB: 🎫 BOOKING & REFUND (GO EDITION BUS SYSTEM)          */}
        {/* ============================================================ */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header with Title & Flat ₹20 Commission Badge */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/80 shadow-xl">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-slate-950" />
                    GO Edition Booking
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    🎁 फ्लैट ₹20 नकद कमीशन
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                    ⚡ 3-मिनट एडमिन अप्रूवल गारंटी
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  GO Bus Special Bus System (3-Min Fast Track)
                </h2>
                <p className="text-xs text-slate-300">
                  सीट चुनें, Go Wallet से 1-क्लिक भुगतान करें — 3 मिनट में एडमिन अप्रूवल एवं प्रति टिकट तुरंत ₹20 कमीशन पाएं!
                </p>
              </div>

              {/* Sub-Tab Navigation Switcher */}
              <div className="flex bg-slate-950 p-1 rounded-2xl border border-amber-400/50 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setBookingSubTab('auto_book')}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    bookingSubTab === 'auto_book'
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>स्वचालित बस बुकिंग</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingSubTab('history')}
                  className={`py-2 px-3.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                    bookingSubTab === 'history'
                      ? 'bg-slate-800 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>माई टिकट व रिफंड ({myGoBookings.length})</span>
                </button>
              </div>
            </div>

            {/* -------------------------------------------------------- */}
            {/* 2A. SUB-TAB: GO EDITION AUTOMATIC BUS BOOKING ENGINE     */}
            {/* -------------------------------------------------------- */}
            {bookingSubTab === 'auto_book' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Search Bar Widget */}
                <div className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    
                    {/* From City */}
                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        कहाँ से (From City) *
                      </label>
                      <select
                        value={searchSource}
                        onChange={(e) => setSearchSource(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={`src-${c}`} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Swap Button */}
                    <div className="sm:col-span-1 flex justify-center pb-2">
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
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        कहाँ तक (To City) *
                      </label>
                      <select
                        value={searchDestination}
                        onChange={(e) => setSearchDestination(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                      >
                        {MP_NETWORK_CITIES.map((c) => (
                          <option key={`dest-${c}`} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Date */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">
                        यात्रा की तारीख (Date) *
                      </label>
                      <input
                        type="date"
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      <span className="text-[11px] text-slate-400 font-bold mr-1">फिल्टर:</span>
                      {(['all', 'ac', 'sleeper', 'seater'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFilterBusType(t)}
                          className={`px-3 py-1.5 rounded-xl font-bold transition text-xs ${
                            filterBusType === t
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {t === 'all' ? 'सभी बसें' : t === 'ac' ? 'AC बस' : t === 'sleeper' ? 'स्लीपर' : 'सीटर'}
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] font-bold text-slate-400">
                      उपलब्ध बसें: <strong className="text-amber-400">{matchingTrips.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Live Bus Cards Listing */}
                <div className="space-y-4">
                  {matchingTrips.map((trip) => {
                    const minFare = trip.seater_fare || trip.sleeper_fare || 550;
                    return (
                      <div
                        key={trip.id}
                        className="p-5 sm:p-6 rounded-3xl bg-slate-900/95 border border-slate-800 hover:border-amber-400/60 transition-all shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative group"
                      >
                        {/* Bus Operator & Features */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                              {trip.bus_type || 'AC Seater / Sleeper 2+1'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                              <Crown className="w-3 h-3 text-slate-950" />
                              🎁 फ्लैट ₹20 नकद कमीशन
                            </span>
                          </div>

                          <h3 className="text-base sm:text-lg font-black text-white">
                            {trip.operator_name || 'SafarGo Premium Express'}
                          </h3>

                          {/* Timings */}
                          <div className="flex items-center gap-4 text-xs text-slate-300 font-mono">
                            <div>
                              <strong className="text-sm font-black text-white block">
                                {trip.departure_time || '07:30 AM'}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-sans">{trip.source}</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className="text-[10px] text-slate-400 font-sans">4h 30m</span>
                              <div className="w-16 h-0.5 bg-slate-700 relative my-0.5">
                                <div className="w-2 h-2 rounded-full bg-amber-400 absolute -top-[3px] right-0" />
                              </div>
                            </div>

                            <div>
                              <strong className="text-sm font-black text-white block">
                                {trip.arrival_time || '12:00 PM'}
                              </strong>
                              <span className="text-[10px] text-slate-400 font-sans">{trip.destination}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Wifi className="w-3.5 h-3.5 text-cyan-400" /> Free WiFi
                            </span>
                            <span className="flex items-center gap-1">
                              <Coffee className="w-3.5 h-3.5 text-amber-400" /> वाटर बोतल
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> सत्यापित ऑपरेटर
                            </span>
                          </div>
                        </div>

                        {/* Fares & Booking CTA */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-slate-400 block">किराया प्रति सीट</span>
                            <div className="text-2xl font-black font-mono text-emerald-400">
                              ₹{minFare.toLocaleString('en-IN')}
                            </div>
                            <span className="text-[10px] font-bold text-amber-400">
                              कमीशन: +₹20.00
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedTripForSeatMap(trip)}
                            className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                          >
                            <Bus className="w-4 h-4" />
                            <span>सीट चुनें व टिकट बुक करें ➔</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* -------------------------------------------------------- */}
            {/* 2B. SUB-TAB: MY BOOKINGS & 1-CLICK REFUND DESK           */}
            {/* -------------------------------------------------------- */}
            {bookingSubTab === 'history' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Search Box & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="PNR, बुकिंग कोड, मोबाइल नंबर या ऑपरेटर खोजें..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                    />
                  </div>

                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
                    {(['all', 'confirmed', 'pending', 'refunded'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`flex-1 py-1.5 rounded-lg font-bold transition capitalize ${
                          statusFilter === st
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'all'
                          ? 'सभी'
                          : st === 'confirmed'
                          ? 'कन्फर्म'
                          : st === 'pending'
                          ? 'पेंडिंग'
                          : 'रिफंड'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
                    <Bus className="w-12 h-12 mx-auto text-slate-600 opacity-50" />
                    <h4 className="text-sm font-bold text-slate-300">कोई पुरानी बुकिंग नहीं है</h4>
                    <p className="text-xs max-w-sm mx-auto text-slate-400">
                      आपके GO स्पेशल एजेंट खाते में अभी तक कोई पुरानी बुकिंग नहीं है। GO Edition बस बुकिंग टर्मिनल से नई टिकट बुक करें और तुरंत फ्लैट ₹20 कमीशन पाएं!
                    </p>
                    <button
                      type="button"
                      onClick={() => setBookingSubTab('auto_book')}
                      className="py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs transition inline-block cursor-pointer"
                    >
                      ⚡ नई बस टिकट बुक करें ➔
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBookings.map((b) => (
                      <div
                        key={b.id}
                        className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/50 transition-all space-y-3 relative group"
                      >
                        {/* Header: Code & Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-amber-400 text-xs">
                              {b.booking_code}
                            </span>
                            {b.ticket_pnr && (
                              <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                                PNR: {b.ticket_pnr}
                              </span>
                            )}
                          </div>

                          {b.status === 'confirmed' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                              कन्फर्म ✅
                            </span>
                          ) : b.status === 'cancellation_requested' || b.refund_status === 'requested' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
                              रिफंड प्रतीक्षारत ⏳
                            </span>
                          ) : b.status === 'cancelled' || b.refund_status === 'approved' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-400">
                              रिफंडेड 💸
                            </span>
                          ) : (
                            <TicketCountdownTimer createdAt={b.created_at} deadlineAt={b.deadline_at} />
                          )}
                        </div>

                        {/* Route & Passenger */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-black text-white">
                            <span>{getBookingRoute(b).from}</span>
                            <span className="text-amber-400">➔</span>
                            <span>{getBookingRoute(b).to}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {getBookingRoute(b).operator} • यात्रा: <strong className="text-slate-300">{b.journey_date}</strong> ({b.departure_time_pref || 'Regular'})
                          </p>
                          <p className="text-xs text-slate-400">
                            यात्री: <strong className="text-slate-200">{b.customer_name}</strong> (+91 {b.customer_mobile}) • सीट: {getBookingSeats(b)}
                          </p>
                        </div>

                        {/* Financials & Commission */}
                        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">कुल किराया</span>
                            <strong className="text-sm font-black text-white font-mono">
                              ₹{getBookingFare(b).toLocaleString('en-IN')}
                            </strong>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">GO एजेंट कमीशन</span>
                            <span className="text-xs font-black text-amber-400">
                              +₹20.00 (Flat)
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons: Green Card, Print & Refund */}
                        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          {b.status === 'confirmed' ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setSelectedGreenCardBooking(b)}
                                className="flex-1 min-w-[130px] py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                                <span>🟢 लाइव ग्रीन कार्ड</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedPrintBooking(b)}
                                className="flex-1 min-w-[110px] py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>ई-टिकट प्रिंट / डाउनलोड</span>
                              </button>
                            </>
                          ) : (
                            <div className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                                <span>ई-टिकट डाउनलोड लॉक: एडमिन अप्रूवल के बाद ही जारी होगा</span>
                              </span>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                                {b.status === 'booking_request' ? 'सत्यापन जारी' : b.status === 'awaiting_operator_confirmation' ? 'ऑपरेटर जांच' : b.status}
                              </span>
                            </div>
                          )}

                          {b.status === 'confirmed' && b.refund_status !== 'approved' && b.refund_status !== 'requested' && (
                            <button
                              type="button"
                              onClick={() => setRefundBooking(b)}
                              className="py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/30 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>रिफंड अनुरोध</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Refund Modal */}
            {refundBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                <div className="bg-slate-900 border-2 border-rose-500/80 rounded-3xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base text-rose-400 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5 text-rose-400" />
                      <span>रिफंड / कैंसिलेशन अनुरोध</span>
                    </h3>
                    <button
                      onClick={() => setRefundBooking(null)}
                      className="p-1 rounded-full text-slate-400 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1">
                    <p>बुकिंग: <strong>{refundBooking.booking_code}</strong></p>
                    <p>रूट: <strong>{getBookingRoute(refundBooking).from} ➔ {getBookingRoute(refundBooking).to}</strong></p>
                    <p>किराया: <strong>₹{getBookingFare(refundBooking).toLocaleString('en-IN')}</strong></p>
                  </div>

                  <form onSubmit={handleRefundSubmit} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        रिफंड का कारण बताएं *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="उदा. यात्री की यात्रा योजना रद्द हुई / बस लेट हुई..."
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white outline-none focus:border-rose-400"
                      />
                    </div>

                    <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-500/30 text-[11px] text-rose-200">
                      एडमिन अनुमोदन के पश्चात रिफंड राशि सीधे आपके <strong>Go Wallet</strong> में क्रेडिट कर दी जाएगी।
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setRefundBooking(null)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                      >
                        रद्द करें
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingRefund}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black transition disabled:opacity-50"
                      >
                        {isSubmittingRefund ? 'भेजा जा रहा है...' : 'अनुरोध सबमिट करें'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* 3. TAB: 💳 GO WALLET MANAGEMENT                              */}
        {/* ============================================================ */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  <span>Go Wallet संपूर्ण प्रबंधन</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  10-मिनट टाइमर आधारित सुरक्षित रीचार्ज, फ्लैट ₹20 कमीशन क्रेडिट एवं लाइव लेजर
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsInstantAddMoneyModalOpen(true)}
                  className="py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs transition flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
                >
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>⚡ GO Instant Add Money</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsWithdrawalModalOpen(true)}
                  className="py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40 font-black text-xs transition flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
                >
                  <TrendingDown className="w-4 h-4" />
                  <span>🏦 बैंक / UPI निकासी</span>
                </button>
              </div>
            </div>

            {/* 3D Fintech Virtual Card Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Virtual 3D GO Card */}
              <div
                className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border-2 border-amber-400/80 shadow-[0_20px_40px_rgba(245,158,11,0.2)] text-white space-y-6 overflow-hidden"
                style={{ perspective: '1000px' }}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                {/* Card Top: Chip & Logo */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    {/* Metallic Golden Chip */}
                    <div className="w-10 h-7 rounded-md bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 border border-yellow-200 shadow-inner flex items-center justify-center">
                      <div className="w-6 h-4 border border-amber-600/40 rounded-xs" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                      GO ULTRA PASS
                    </span>
                  </div>

                  <Go3DUltraLogo size="sm" showBadge={false} />
                </div>

                {/* Card Balance */}
                <div className="relative z-10 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    उपलब्ध Go Wallet बैलेंस
                  </span>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                    ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}.00
                  </div>
                </div>

                {/* Card Bottom: Holder Name & ID */}
                <div className="relative z-10 flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">कार्ड धारक (Agent)</span>
                    <strong className="text-slate-200 font-mono">{currentUser?.full_name || 'GO AGENT'}</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase block">GO ID</span>
                    <strong className="text-amber-400 font-mono">{currentUser?.id?.slice(0, 10).toUpperCase() || 'GO-AGT-01'}</strong>
                  </div>
                </div>
              </div>

              {/* Commission Ledger Summary Card */}
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <h3 className="font-black text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>फ्लैट ₹20 कमीशन खाता स्थिति</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">प्रति बस टिकट कमीशन दर:</span>
                    <strong className="text-amber-400 text-sm font-black">₹20.00 / सीट</strong>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">कुल कन्फर्म टिकटें:</span>
                    <strong className="text-white font-mono">{confirmedCount} टिकट</strong>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">कुल संचित कमीशन:</span>
                    <strong className="text-emerald-400 text-base font-black font-mono">
                      ₹{totalCommissionEarned.toLocaleString('en-IN')}.00
                    </strong>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug">
                    * कमीशन राशि आपके Go Wallet बैलेंस में स्वतः क्रेडिट होती है, जिसका उपयोग आप नई टिकटें बुक करने में कर सकते हैं।
                  </p>
                </div>
              </div>

            </div>

            {/* Wallet Recharges & History Table */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Go Wallet रीचार्ज अनुरोध इतिहास (Recharge Logs)</span>
              </h3>

              {agentWalletRecharges.length === 0 ? (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Wallet className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs">कोई रीचार्ज अनुरोध रिकॉर्ड मौजूद नहीं है।</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {agentWalletRecharges.map((r) => (
                    <div
                      key={r.id}
                      className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            r.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : r.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          <ArrowDownLeft className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-white font-mono">UTR: {r.utr_number}</strong>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                                r.status === 'approved'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                                  : r.status === 'rejected'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-500/40'
                                  : 'bg-amber-950 text-amber-400 border border-amber-500/40'
                              }`}
                            >
                              {r.status === 'approved' ? 'स्वीकृत' : r.status === 'rejected' ? 'अस्वीकृत' : 'समीक्षाधीन (10m)'}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(r.created_at).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <strong className="text-sm font-black text-emerald-400 font-mono">
                        +₹{Number(r.amount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* 4. TAB: 👤 GO ACCOUNT & GO KYC VERIFICATION                  */}
        {/* ============================================================ */}
        {activeTab === 'account' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-400" />
                  <span>Go Account एवं अधिकृत Go KYC सत्यापन</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  आधार कार्ड, पैन कार्ड एवं बैंक खाता सत्यापन — 100% प्रोफेशनल GO यूजर प्रोफाइल
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  if (onNavigateHome) {
                    onNavigateHome();
                  } else {
                    window.location.href = '/';
                  }
                }}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>लॉगआउट करें (Sign Out)</span>
              </button>
            </div>

            {/* Account Sub-Navigation Switcher */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => setAccountSubTab('profile')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  accountSubTab === 'profile'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>👤 माई प्रोफाइल (Profile)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountSubTab('tickets')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  accountSubTab === 'tickets'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>🎫 टिकट व सहायता (24h SLA)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountSubTab('history')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  accountSubTab === 'history'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>📊 ऐड मनी हिस्ट्री व 3m टाइमर</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountSubTab('refer')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  accountSubTab === 'refer'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>🎁 Refer & Earn (₹100)</span>
              </button>

              <button
                type="button"
                onClick={() => setAccountSubTab('kyc')}
                className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer ${
                  accountSubTab === 'kyc'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>🛡️ Go KYC सत्यापन</span>
              </button>
            </div>

            {/* TAB: GO AGENT PROFILE (PHOTO UPLOAD, EDITABLE DETAILS & LOCKED CONTACTS) */}
            {accountSubTab === 'profile' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Profile Digital ID Card with SPECIAL HUGE GREEN TICK */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profileAvatarUrl ? (
                        <img
                          src={profileAvatarUrl}
                          alt="Agent Profile"
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-cyan-400 text-slate-950 font-black text-3xl flex items-center justify-center shadow-lg shrink-0">
                          {currentUser?.full_name?.charAt(0) || 'G'}
                        </div>
                      )}
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center cursor-pointer shadow-md transition">
                        <Camera className="w-4 h-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-black text-white">
                          {currentUser?.full_name || 'GO Special Agent'}
                        </h3>
                        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                          GO AGENT
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">
                        दुकान / केंद्र: <strong className="text-white">{currentUser?.shop_name || 'डिजिटल सेवा केंद्र'}</strong>
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {currentUser?.city}, {currentUser?.district}
                      </p>
                    </div>
                  </div>

                  {/* Special Huge Green Tick Badge in Profile */}
                  {isKycVerified ? (
                    <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-3 shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-300 text-slate-950 flex items-center justify-center shadow-md shrink-0">
                        <CheckCircle2 className="w-8 h-8 stroke-[3] text-slate-950" />
                      </div>
                      <div className="text-left">
                        <span className="text-xs font-black text-white uppercase block">100% KYC सत्यापित</span>
                        <span className="text-[10px] font-mono text-emerald-300 block">स्पेशल ग्रीन टिक अधिकृत</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-amber-300 shrink-0 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                      <span>KYC सत्यापन प्रक्रियाधीन</span>
                    </div>
                  )}
                </div>

                {/* Profile Edit Form */}
                <form onSubmit={handleSaveProfile} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-base font-black text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-400" />
                        <span>GO Agent प्रोफाइल विवरण (View & Edit)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        आप अपना नाम, दुकान का नाम व पता एडिट कर सकते हैं। मोबाइल नंबर व जीमेल सुरक्षा कारणों से लॉक हैं।
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Full Name (Editable) */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        एजेंट का पूरा नाम (Full Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="आपका पूरा नाम"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Shop Name (Editable) */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        दुकान / केंद्र का नाम (Shop / CSC Center Name)
                      </label>
                      <input
                        type="text"
                        value={profileShopName}
                        onChange={(e) => setProfileShopName(e.target.value)}
                        placeholder="जैसे: माँ वैष्णो डिजिटल सेवा केंद्र"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* LOCKED: Mobile Number */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span>मोबाइल नंबर (Mobile Number - Locked)</span>
                        <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> परिवर्तन अनुमत नहीं
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled
                          value={`+91 ${currentUser?.mobile || ''}`}
                          className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-mono font-bold cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-3 text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        सुरक्षा कारणों एवं OTP सत्यापन के कारण मोबाइल नंबर बदला नहीं जा सकता।
                      </p>
                    </div>

                    {/* LOCKED: Email / Gmail */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                        <span>जीमेल / ईमेल (Gmail - Locked)</span>
                        <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                          <Lock className="w-3 h-3" /> परिवर्तन अनुमत नहीं
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          disabled
                          value={currentUser?.email || ''}
                          className="w-full p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 font-mono font-bold cursor-not-allowed"
                        />
                        <div className="absolute right-3 top-3 text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        सुरक्षा कारणों एवं प्राथमिक क्रेडेंशियल होने से जीमेल बदला नहीं जा सकता।
                      </p>
                    </div>

                    {/* Address (Editable) */}
                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-300 mb-1">
                        दुकान / केंद्र का पूरा पता (Complete Address)
                      </label>
                      <textarea
                        rows={2}
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="वार्ड नंबर, मुख्य बाजार, लैंडमार्क, तहसील आदि"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* City (Editable) */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        शहर / कस्बा (City / Town)
                      </label>
                      <input
                        type="text"
                        value={profileCity}
                        onChange={(e) => setProfileCity(e.target.value)}
                        placeholder="जैसे: सिरोंज, विदिशा, भोपाल"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* District (Editable) */}
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        जिला (District)
                      </label>
                      <input
                        type="text"
                        value={profileDistrict}
                        onChange={(e) => setProfileDistrict(e.target.value)}
                        placeholder="जैसे: विदिशा, भोपाल, इंदौर"
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Profile Photo Uploader */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {profileAvatarUrl ? (
                        <img
                          src={profileAvatarUrl}
                          alt="Avatar"
                          className="w-12 h-12 rounded-xl object-cover border border-amber-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400">
                          <User className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-white block">प्रोफाइल फोटो अपलोड करें</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG (अधिकतम 5MB)</span>
                      </div>
                    </div>

                    <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl transition border border-amber-400/30 cursor-pointer flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" />
                      <span>फोटो चुनें (Change Photo)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingProfile ? 'सेव हो रहा है...' : 'प्रोफाइल सेव करें (Save Changes)'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB: REFER & EARN ₹100 DESK */}
            {accountSubTab === 'refer' && (
              <div className="animate-fadeIn">
                <ReferAndEarn />
              </div>
            )}

            {/* TAB: SUPPORT TICKETS & HELPDESK (24-Hour SLA) */}
            {accountSubTab === 'tickets' && (
              <div className="animate-fadeIn">
                <GoAgentSupportDesk />
              </div>
            )}

            {/* TAB: ADD MONEY HISTORY & 3-MINUTE TIMERS */}
            {accountSubTab === 'history' && (
              <div className="animate-fadeIn">
                <GoAccountHistoryDesk />
              </div>
            )}

            {/* TAB: KYC & PROFILE DETAILS */}
            {accountSubTab === 'kyc' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Profile Digital ID Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-amber-400/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-cyan-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shrink-0">
                  {currentUser?.full_name?.charAt(0) || 'G'}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white">
                      {currentUser?.full_name || 'GO Special Agent'}
                    </h3>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full">
                      GO AGENT
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    दुकान / केंद्र: <strong className="text-white">{currentUser?.shop_name || 'डिजिटल सेवा केंद्र'}</strong>
                  </p>
                  <p className="text-xs text-slate-400">
                    {currentUser?.email} • +91 {currentUser?.mobile} • {currentUser?.city}, {currentUser?.district}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1 text-right shrink-0">
                <span className="text-[10px] text-slate-400 block">सत्यापन स्थिति</span>
                {currentUser?.kyc_status === 'verified' ? (
                  <span className="text-emerald-400 font-black flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-4 h-4" /> 100% KYC सत्यापित
                  </span>
                ) : currentUser?.kyc_status === 'pending' ? (
                  <span className="text-amber-400 font-bold flex items-center justify-end gap-1">
                    <Clock className="w-4 h-4" /> सत्यापन समीक्षाधीन
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold flex items-center justify-end gap-1">
                    <AlertCircle className="w-4 h-4" /> KYC अधूरा (जमा करें)
                  </span>
                )}
              </div>
            </div>

            {/* Go KYC Verification Module */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                    <span>Go KYC सत्यापन फॉर्म (Aadhaar, PAN & Bank Desk)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    GO यूजर्स के लिए आधिकारिक सत्यापन अनिवार्य है ताकि पेआउट्स एवं वॉलेट निकासी में कोई रुकावट न आए।
                  </p>
                </div>
              </div>

              <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
                
                {/* Aadhaar & PAN Card inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      12-अंकीय आधार कार्ड नंबर (Aadhaar Number) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={12}
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="XXXX XXXX XXXX"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      10-अंकीय पैन कार्ड नंबर (PAN Number) *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={10}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="ABCDE1234F"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                {/* Bank Account Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      बैंक खाता धारक का नाम (Account Holder Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      placeholder="उदा. पवन कुमार"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      बैंक का नाम (Bank Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="उदा. State Bank of India / HDFC"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      बैंक खाता संख्या (Account Number) *
                    </label>
                    <input
                      type="text"
                      required
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                      placeholder="खाता नंबर दर्ज करें"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      खाता संख्या पुनः दर्ज करें (Confirm Account Number) *
                    </label>
                    <input
                      type="text"
                      required
                      value={confirmBankAccount}
                      onChange={(e) => setConfirmBankAccount(e.target.value.replace(/\D/g, ''))}
                      placeholder="पुनः खाता नंबर दर्ज करें"
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    IFSC कोड (Bank IFSC Code) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={bankIfsc}
                    onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                    placeholder="उदा. SBIN0001234"
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono uppercase focus:border-amber-400 outline-none"
                  />
                </div>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 block">आधार कार्ड फोटो अपलोड</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKycFileUpload(e, 'aadhaar')}
                      className="text-xs text-slate-400"
                    />
                    {aadhaarFrontUrl && (
                      <span className="text-[10px] text-emerald-400 font-bold block">✓ आधार फोटो संलग्न</span>
                    )}
                  </div>

                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 block">पैन कार्ड फोटो अपलोड</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleKycFileUpload(e, 'pan')}
                      className="text-xs text-slate-400"
                    />
                    {panCardUrl && (
                      <span className="text-[10px] text-emerald-400 font-bold block">✓ पैन कार्ड फोटो संलग्न</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingKyc}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 text-slate-950 font-black rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>{isSubmittingKyc ? 'KYC सत्यापन भेजा जा रहा है...' : 'Go KYC सत्यापन अनुरोध भेजें ➔'}</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    )}

      </main>

      {/* ============================================================== */}
      {/* 4 EXCLUSIVE BOTTOM NAVIGATION OPTIONS (NO CLUTTER!)            */}
      {/* ============================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t-2 border-amber-400/60 shadow-[0_-10px_25px_rgba(0,0,0,0.5)] py-2 px-3 sm:px-6">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center items-center">
          
          {/* Option 1: ⚡ Dashboard */}
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">डैशबोर्ड</span>
          </button>

          {/* Option 2: 🎫 Bookings & Refund */}
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition cursor-pointer ${
              activeTab === 'bookings'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <Bus className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">बुकिंग व रिफंड</span>
          </button>

          {/* Option 3: 💳 Go Wallet */}
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition cursor-pointer ${
              activeTab === 'wallet'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Go Wallet</span>
          </button>

          {/* Option 4: 👤 Go Account & KYC */}
          <button
            type="button"
            onClick={() => setActiveTab('account')}
            className={`flex flex-col items-center justify-center py-1 rounded-2xl transition cursor-pointer ${
              activeTab === 'account'
                ? 'text-amber-400 font-black bg-amber-400/15'
                : 'text-slate-400 hover:text-white font-bold'
            }`}
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Go अकाउंट</span>
          </button>

        </div>
      </nav>

      {/* RedBus Interactive Seat Selection Modal */}
      {selectedTripForSeatMap && (
        <RedBusSeatMapModal
          trip={selectedTripForSeatMap}
          onClose={() => setSelectedTripForSeatMap(null)}
          onConfirmSelection={(selection) => {
            const currentTrip = selectedTripForSeatMap;
            setSelectedTripForSeatMap(null);
            setAutoCheckoutData({
              trip: currentTrip,
              selectedSeats: selection.selectedSeats,
              totalFare: selection.totalFare,
              seatCategory: selection.seatCategory,
              boardingPoint: selection.boardingPoint,
              dropPoint: selection.dropPoint,
            });
          }}
        />
      )}

      {/* Auto Bus Booking Checkout Modal (With Go Wallet 1-Click Pay & ₹20 Commission Credit) */}
      {autoCheckoutData && (
        <AutoBusBookingCheckoutModal
          isOpen={true}
          trip={autoCheckoutData.trip}
          selectedSeats={autoCheckoutData.selectedSeats}
          totalFare={autoCheckoutData.totalFare}
          seatCategory={autoCheckoutData.seatCategory}
          boardingPoint={autoCheckoutData.boardingPoint}
          dropPoint={autoCheckoutData.dropPoint}
          onClose={() => setAutoCheckoutData(null)}
          onBookingSuccess={(booking) => {
            setAutoCheckoutData(null);
            setBookingSubTab('history');
            success(
              '🎉 GO बस टिकट कन्फर्म!',
              `PNR ${booking.ticket_pnr || booking.booking_code} जारी हो चुका है। +₹20.00 कमीशन आपके Go Wallet में जुड़ चुका है!`
            );
          }}
        />
      )}

      {/* Wallet Recharge Modal (With 10-Minute Lock & Strict Warnings) */}
      {isRechargeModalOpen && (
        <WalletRechargeModal onClose={() => setIsRechargeModalOpen(false)} />
      )}

      {/* ⚡ GO Instant Add Money Modal */}
      {isInstantAddMoneyModalOpen && (
        <GoInstantAddMoneyModal onClose={() => setIsInstantAddMoneyModalOpen(false)} />
      )}

      {/* 🏦 GO Agent Advance Withdrawal Modal */}
      {isWithdrawalModalOpen && (
        <GoAgentWithdrawalModal onClose={() => setIsWithdrawalModalOpen(false)} />
      )}

      {/* 🟢 Live Ticket Green Card Modal */}
      {selectedGreenCardBooking && (
        <LiveTicketGreenCard
          booking={selectedGreenCardBooking}
          onClose={() => setSelectedGreenCardBooking(null)}
        />
      )}

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
