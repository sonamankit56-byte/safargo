import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Booking,
  BusTrip,
  CommissionEntry,
  SalaryRecord,
  AdminSettings,
  AuditLog,
  BookingStatus,
  RefundStatus,
  AdminAnnouncement,
  CustomFeature,
  PayoutRequest,
  WalletRechargeRequest,
  WalletTransaction,
  PromotionClaim,
  PromotionPlatform,
  PromotionContentType
} from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_BUS_TRIPS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_SALARY_RECORDS,
  INITIAL_SETTINGS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PAYOUT_REQUESTS,
  INITIAL_WALLET_RECHARGES,
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_PROMOTION_CLAIMS
} from '../lib/mockData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { db } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface DataContextType {
  // Bookings
  bookings: Booking[];
  agentBookings: Booking[];
  createBooking: (bookingData: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'deadline_at' | 'status' | 'updated_at'>) => Promise<Booking | null>;
  confirmBooking: (bookingId: string, verificationData: {
    actual_fare: number;
    confirmed_seats: string;
    actual_operator: string;
    actual_boarding_point: string;
    actual_drop_point: string;
    ticket_pnr: string;
    ticket_doc_url?: string;
    admin_notes?: string;
  }) => Promise<boolean>;
  rejectBooking: (bookingId: string, reason: string) => Promise<boolean>;
  reopenBooking: (bookingId: string) => Promise<boolean>;
  requestCancellation: (bookingId: string, reason: string) => Promise<boolean>;
  processCancellation: (bookingId: string, refundStatus: RefundStatus, refundAmount: number, reverseCommission: boolean) => Promise<boolean>;

  // Bus Trips (Manual Inventory)
  busTrips: BusTrip[];
  addBusTrip: (trip: Omit<BusTrip, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateBusTrip: (id: string, trip: Partial<BusTrip>) => Promise<boolean>;
  deleteBusTrip: (id: string) => Promise<boolean>;

  // Commission & Salary
  commissions: CommissionEntry[];
  agentCommissions: CommissionEntry[];
  salaryRecords: SalaryRecord[];
  agentSalaryRecord: SalaryRecord | undefined;
  approveSalary: (salaryId: string) => Promise<boolean>;
  markSalaryPaid: (salaryId: string, paymentReference: string) => Promise<boolean>;

  // Payout Requests
  payoutRequests: PayoutRequest[];
  agentPayoutRequests: PayoutRequest[];
  requestPayout: (payoutData: Omit<PayoutRequest, 'id' | 'agent_id' | 'agent_name' | 'agent_mobile' | 'status' | 'created_at'>) => Promise<boolean>;
  approvePayout: (payoutId: string, adminReference: string, notes?: string) => Promise<boolean>;
  rejectPayout: (payoutId: string, reason: string) => Promise<boolean>;

  // Settings & Announcements & Custom Features
  settings: AdminSettings;
  updateSettings: (newSettings: Partial<AdminSettings>) => Promise<boolean>;
  updateAnnouncement: (announcement: Partial<AdminAnnouncement>) => Promise<boolean>;
  addCustomFeature: (feature: Omit<CustomFeature, 'id' | 'created_at'>) => Promise<boolean>;
  updateCustomFeature: (id: string, feature: Partial<CustomFeature>) => Promise<boolean>;
  deleteCustomFeature: (id: string) => Promise<boolean>;
  toggleCustomFeature: (id: string) => Promise<boolean>;

  // Audit Logs
  auditLogs: AuditLog[];

  // Prepaid Wallet System (Min ₹2,000 Recharge)
  walletRecharges: WalletRechargeRequest[];
  agentWalletRecharges: WalletRechargeRequest[];
  walletTransactions: WalletTransaction[];
  agentWalletTransactions: WalletTransaction[];
  agentWalletBalance: number;
  requestWalletRecharge: (amount: number, utr: string, screenshotUrl?: string, paymentMethod?: 'upi_qr' | 'bank_transfer') => Promise<boolean>;
  approveWalletRecharge: (rechargeId: string, adminNotes?: string) => Promise<boolean>;
  rejectWalletRecharge: (rechargeId: string, reason: string) => Promise<boolean>;

  // Viral Creator & Social Media Promotion (Instagram 1M => ₹500, YouTube 10k => ₹100, 24-hr SLA)
  promotionClaims: PromotionClaim[];
  agentPromotionClaims: PromotionClaim[];
  submitPromotionClaim: (claimData: {
    user_name: string;
    user_mobile: string;
    platform: PromotionPlatform;
    content_type: PromotionContentType;
    post_url: string;
    channel_or_handle: string;
    views_count: number;
    screenshot_url?: string;
    payout_method: 'wallet' | 'upi' | 'bank';
    upi_id?: string;
    bank_details?: string;
  }) => Promise<boolean>;
  approvePromotionClaim: (claimId: string, paymentReference?: string, notes?: string) => Promise<boolean>;
  rejectPromotionClaim: (claimId: string, reason: string) => Promise<boolean>;

  // Commission Celebration Modal Trigger
  celebrationBooking: Booking | null;
  dismissCelebration: () => void;
}

const STORAGE_KEY_BOOKINGS = 'safargo_bookings_v1';
const STORAGE_KEY_COMMISSION = 'safargo_commission_v1';
const STORAGE_KEY_SALARY = 'safargo_salary_v1';
const STORAGE_KEY_TRIPS = 'safargo_trips_v1';
const STORAGE_KEY_SETTINGS = 'safargo_settings_v1';
const STORAGE_KEY_LOGS = 'safargo_audit_logs_v1';
const STORAGE_KEY_SEEN_CONFIRMATIONS = 'safargo_seen_confirmations_v1';
const STORAGE_KEY_PAYOUTS = 'safargo_payouts_v1';
const STORAGE_KEY_WALLET_RECHARGES = 'safargo_wallet_recharges_v1';
const STORAGE_KEY_WALLET_TX = 'safargo_wallet_tx_v1';
const STORAGE_KEY_PROMOTIONS = 'safargo_promotion_claims_v1';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isApprovedAgent, allProfiles, updateProfile } = useAuth();
  const { success, error, info, warning } = useToast();


  // Load state from localStorage or mock defaults
  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BOOKINGS;
  });

  const [commissions, setCommissions] = useState<CommissionEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COMMISSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_COMMISSION_LEDGER;
  });

  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SALARY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SALARY_RECORDS;
  });

  const [busTrips, setBusTrips] = useState<BusTrip[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_BUS_TRIPS;
  });

  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_SETTINGS,
          ...parsed,
          announcement: {
            ...INITIAL_SETTINGS.announcement,
            ...(parsed.announcement || {}),
          },
          custom_features: parsed.custom_features || INITIAL_SETTINGS.custom_features,
        };
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYOUTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PAYOUT_REQUESTS;
  });

  const [walletRecharges, setWalletRecharges] = useState<WalletRechargeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLET_RECHARGES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WALLET_RECHARGES;
  });

  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLET_TX);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_WALLET_TRANSACTIONS;
  });

  const [promotionClaims, setPromotionClaims] = useState<PromotionClaim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROMOTIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROMOTION_CLAIMS;
  });

  // Track seen confirmation IDs so animation only plays once per confirmed booking
  const [seenConfirmations, setSeenConfirmations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEEN_CONFIRMATIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ['bkg-001']; // Initial confirmed booking already seen
  });

  const [celebrationBooking, setCelebrationBooking] = useState<Booking | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_COMMISSION, JSON.stringify(commissions));
  }, [commissions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SALARY, JSON.stringify(salaryRecords));
  }, [salaryRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(busTrips));
  }, [busTrips]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SEEN_CONFIRMATIONS, JSON.stringify(seenConfirmations));
  }, [seenConfirmations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PAYOUTS, JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WALLET_RECHARGES, JSON.stringify(walletRecharges));
  }, [walletRecharges]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WALLET_TX, JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROMOTIONS, JSON.stringify(promotionClaims));
  }, [promotionClaims]);

  // Real Database Sync: Load initial live data from Supabase when configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadLiveSupabaseData = async () => {
      try {
        const [liveBookings, liveTrips, liveCommissions, liveSalaries, livePayouts, liveRecharges, liveTxs, liveClaims] = await Promise.all([
          db.getBookings(),
          db.getBusTrips(),
          db.getCommissions(),
          db.getSalaryRecords(),
          db.getPayoutRequests(),
          db.getWalletRecharges(),
          db.getWalletTransactions(),
          db.getPromotionClaims(),
        ]);

        if (liveBookings && liveBookings.length > 0) setBookings(liveBookings);
        if (liveTrips && liveTrips.length > 0) setBusTrips(liveTrips);
        if (liveCommissions && liveCommissions.length > 0) setCommissions(liveCommissions);
        if (liveSalaries && liveSalaries.length > 0) setSalaryRecords(liveSalaries);
        if (livePayouts && livePayouts.length > 0) setPayoutRequests(livePayouts);
        if (liveRecharges && liveRecharges.length > 0) setWalletRecharges(liveRecharges);
        if (liveTxs && liveTxs.length > 0) setWalletTransactions(liveTxs);
        if (liveClaims && liveClaims.length > 0) setPromotionClaims(liveClaims);
      } catch (err) {
        console.error('Error fetching live Supabase data:', err);
      }
    };

    loadLiveSupabaseData();
  }, []);


  // Log helper
  const addAuditLog = useCallback(
    (action: string, record_type: string, record_id?: string, metadata?: Record<string, any>) => {
      const newLog: AuditLog = {
        id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        actor_id: currentUser?.id,
        actor_email: currentUser?.email,
        actor_role: currentUser?.role,
        action,
        record_type,
        record_id,
        metadata,
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [currentUser]
  );

  // Safe 15-Minute Expiration Evaluator (Runs every 10 seconds)
  // Ensures deadline is strictly respected and expired bookings are updated safely
  useEffect(() => {
    const interval = setInterval(() => {
      const nowTime = Date.now();
      setBookings((prev) => {
        let hasChanges = false;
        const updated = prev.map((b) => {
          if (
            (b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation') &&
            new Date(b.deadline_at).getTime() <= nowTime
          ) {
            hasChanges = true;
            return {
              ...b,
              status: 'expired' as BookingStatus,
              rejection_reason: '15-minute response deadline passed before operator confirmation.',
              updated_at: new Date().toISOString(),
            };
          }
          return b;
        });
        if (hasChanges) {
          addAuditLog('auto_expire_deadline', 'bookings', undefined, { timestamp: new Date().toISOString() });
        }
        return hasChanges ? updated : prev;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [addAuditLog]);

  // Check for newly confirmed bookings for the logged-in agent to trigger celebration
  useEffect(() => {
    if (currentUser?.role === 'agent') {
      const newlyConfirmed = bookings.find(
        (b) =>
          b.agent_id === currentUser.id &&
          b.status === 'confirmed' &&
          !seenConfirmations.includes(b.id)
      );

      if (newlyConfirmed) {
        setCelebrationBooking(newlyConfirmed);
        setSeenConfirmations((prev) => [...prev, newlyConfirmed.id]);
      }
    }
  }, [bookings, currentUser, seenConfirmations]);

  const dismissCelebration = () => {
    setCelebrationBooking(null);
  };

  // Agent's Bookings Filter (RLS frontend equivalent: agents only see their own)
  const agentBookings = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return bookings;
    return bookings.filter((b) => b.agent_id === currentUser.id);
  }, [bookings, currentUser]);

  // Agent's Commissions Filter
  const agentCommissions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return commissions;
    return commissions.filter((c) => c.agent_id === currentUser.id);
  }, [commissions, currentUser]);

  // Agent's Payout Requests Filter
  const agentPayoutRequests = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return payoutRequests;
    return payoutRequests.filter((p) => p.agent_id === currentUser.id);
  }, [payoutRequests, currentUser]);

  // Agent's Wallet Recharges Filter
  const agentWalletRecharges = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return walletRecharges;
    return walletRecharges.filter((r) => r.agent_id === currentUser.id);
  }, [walletRecharges, currentUser]);

  // Agent's Wallet Transactions Filter
  const agentWalletTransactions = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return walletTransactions;
    return walletTransactions.filter((t) => t.agent_id === currentUser.id);
  }, [walletTransactions, currentUser]);

  // Agent's Viral Promotion Claims Filter
  const agentPromotionClaims = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return promotionClaims;
    return promotionClaims.filter((p) => p.user_id === currentUser.id);
  }, [promotionClaims, currentUser]);

  // Agent's live wallet balance
  const agentWalletBalance = useMemo(() => {
    return currentUser?.wallet_balance ?? 0;
  }, [currentUser?.wallet_balance]);


  // Current month's salary record for current agent
  const currentMonthYear = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const agentSalaryRecord = useMemo(() => {
    if (!currentUser) return undefined;
    return salaryRecords.find(
      (s) => s.agent_id === currentUser.id && s.month_year === currentMonthYear
    );
  }, [salaryRecords, currentUser, currentMonthYear]);

  // Calculate agent target dynamically based on eligible confirmed bookings in current calendar month
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'agent') return;

    const confirmedThisMonth = bookings.filter((b) => {
      if (b.agent_id !== currentUser.id || b.status !== 'confirmed') return false;
      const bDate = new Date(b.created_at);
      const bMonthYear = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
      return bMonthYear === currentMonthYear;
    }).length;

    setSalaryRecords((prev) => {
      const existing = prev.find(
        (s) => s.agent_id === currentUser.id && s.month_year === currentMonthYear
      );

      const targetMet = confirmedThisMonth >= settings.monthly_target;
      const agentWithdrawnThisMonth = payoutRequests
        .filter(
          (p) =>
            p.agent_id === currentUser.id &&
            p.created_at.startsWith(currentMonthYear) &&
            p.status !== 'rejected'
        )
        .reduce((sum, p) => sum + p.amount, 0);

      // 150 Target Salary Model: If agent did not withdraw, they get the full ₹5,000 on Sunday.
      // If agent withdrew commission during the month, the remaining balance up to ₹5,000 is payable.
      const payableSalary = targetMet
        ? Math.max(0, settings.monthly_salary - agentWithdrawnThisMonth)
        : 0;

      if (existing) {
        if (
          existing.confirmed_bookings !== confirmedThisMonth ||
          existing.payable_salary !== payableSalary
        ) {
          return prev.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  confirmed_bookings: confirmedThisMonth,
                  target_met: targetMet,
                  target_bookings: settings.monthly_target,
                  base_salary: settings.monthly_salary,
                  payable_salary: payableSalary,
                  updated_at: new Date().toISOString(),
                }
              : s
          );
        }
        return prev;
      } else {
        // Create initial salary record for this month
        const newRecord: SalaryRecord = {
          id: `sal-${Date.now()}`,
          agent_id: currentUser.id,
          agent_name: currentUser.full_name,
          agent_mobile: currentUser.mobile,
          month_year: currentMonthYear,
          target_bookings: settings.monthly_target,
          confirmed_bookings: confirmedThisMonth,
          target_met: targetMet,
          base_salary: settings.monthly_salary,
          payable_salary: payableSalary,
          status: 'unpaid',
          notes: 'Automatic monthly target tracking (₹5,000 full salary on 150 target without early withdrawal; weekly Sunday payout)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [...prev, newRecord];
      }
    });
  }, [bookings, currentUser, currentMonthYear, settings.monthly_target, settings.monthly_salary, payoutRequests]);

  // CREATE BOOKING (Agents only)
  const createBooking = async (
    bookingData: Omit<Booking, 'id' | 'booking_code' | 'created_at' | 'deadline_at' | 'status' | 'updated_at'>
  ): Promise<Booking | null> => {
    if (!currentUser) {
      error('Not Authenticated', 'Please log in to submit a booking.');
      return null;
    }

    if (!isApprovedAgent && !isAdmin) {
      error(
        'Account Pending Approval',
        'Your agent account is pending verification. Only approved agents can create booking requests.'
      );
      return null;
    }

    // Idempotency check: prevent duplicate submissions within 30 seconds
    if (bookingData.idempotency_key) {
      const duplicate = bookings.find(
        (b) => b.idempotency_key === bookingData.idempotency_key
      );
      if (duplicate) {
        warning('Duplicate Submission Prevented', `Booking ${duplicate.booking_code} was already submitted.`);
        return duplicate;
      }
    }

    const now = new Date();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const bookingCode = `SFG-${dateCode}-${randomSuffix}`;
    const deadline = new Date(now.getTime() + 15 * 60 * 1000).toISOString();

    // Advance Payment Verification (SafarGo QR or Agent Prepaid Wallet)
    const paymentMode = bookingData.payment_mode || 'safargo_qr';
    let paymentStatus: 'paid' | 'pending_verification' = 'pending_verification';

    if (paymentMode === 'agent_wallet') {
      const currentWalletBal = currentUser.wallet_balance || 0;
      if (currentWalletBal < bookingData.total_estimated_amount) {
        error(
          'अपर्याप्त वॉलेट बैलेंस (Insufficient Wallet Balance)',
          `टिकट बुक करने के लिए ₹${bookingData.total_estimated_amount.toLocaleString('en-IN')} चाहिए, परन्तु आपके वॉलेट में केवल ₹${currentWalletBal.toLocaleString('en-IN')} हैं। कृपया वॉलेट में न्यूनतम ₹2,000 जोड़ें या SafarGo QR Code से भुगतान करें।`
        );
        return null;
      }

      // Deduct from wallet
      const newWalletBal = currentWalletBal - bookingData.total_estimated_amount;
      await updateProfile({ wallet_balance: newWalletBal });
      paymentStatus = 'paid';

      // Record wallet debit transaction
      const debitTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        agent_id: currentUser.id,
        amount: -bookingData.total_estimated_amount,
        type: 'ticket_booking',
        booking_code: bookingCode,
        description: `टिकट बुकिंग कटौती: ${bookingData.from_city} → ${bookingData.to_city}`,
        balance_after: newWalletBal,
        created_at: now.toISOString(),
      };
      setWalletTransactions((prev) => [debitTx, ...prev]);
      if (isSupabaseConfigured) {
        db.createWalletTransaction(debitTx).catch(console.error);
      }
    } else {
      // SafarGo QR Code payment
      if (!bookingData.payment_utr || !bookingData.payment_utr.trim()) {
        error(
          'Payment UTR Required',
          'कृपया SafarGo QR Code / UPI पर भुगतान करने के बाद 12-अंकों का बैंक UTR / Transaction ID दर्ज करें।'
        );
        return null;
      }
      paymentStatus = 'pending_verification';
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `bkg-${Date.now()}`,
      booking_code: bookingCode,
      agent_id: currentUser.id,
      agent_name: currentUser.full_name,
      agent_mobile: currentUser.mobile,
      payment_mode: paymentMode,
      payment_status: paymentStatus,
      payment_utr: bookingData.payment_utr,
      payment_screenshot_url: bookingData.payment_screenshot_url,
      created_at: now.toISOString(),
      deadline_at: deadline,
      status: 'booking_request',
      updated_at: now.toISOString(),
    };


    setBookings((prev) => [newBooking, ...prev]);

    if (isSupabaseConfigured) {
      db.createBooking(newBooking).catch((err) => console.error('Supabase live booking insert:', err));
    }

    addAuditLog('create_booking', 'bookings', newBooking.id, {
      booking_code: bookingCode,
      customer: newBooking.customer_name,
      fare: newBooking.total_estimated_amount,
    });

    success(
      'Booking Request Saved!',
      `Booking ID: ${bookingCode}. 15-minute confirmation timer started.`
    );

    return newBooking;
  };

  // CONFIRM BOOKING & ATOMIC COMMISSION CREDIT (Admin only)
  const confirmBooking = async (
    bookingId: string,
    verificationData: {
      actual_fare: number;
      confirmed_seats: string;
      actual_operator: string;
      actual_boarding_point: string;
      actual_drop_point: string;
      ticket_pnr: string;
      ticket_doc_url?: string;
      admin_notes?: string;
    }
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can confirm bookings and award commission.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) {
      error('Error', 'Booking not found.');
      return false;
    }

    if (target.status === 'confirmed') {
      warning('Already Confirmed', 'This booking has already been confirmed and commission was credited.');
      return false;
    }

    if (target.status === 'rejected' || target.status === 'cancelled') {
      error('Invalid State', `Cannot confirm a ${target.status} booking.`);
      return false;
    }

    // Atomic commission check: ensure no prior credit ledger entry exists for this booking
    const alreadyCredited = commissions.some(
      (c) => c.booking_id === bookingId && c.status === 'credited'
    );
    if (alreadyCredited) {
      error('Duplicate Commission Prevented', 'Commission has already been credited for this booking.');
      return false;
    }

    const commRate = settings.commission_rate;
    const nowIso = new Date().toISOString();

    // 1. Update Booking
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'confirmed',
              actual_fare: verificationData.actual_fare,
              confirmed_seats: verificationData.confirmed_seats,
              actual_operator: verificationData.actual_operator,
              actual_boarding_point: verificationData.actual_boarding_point,
              actual_drop_point: verificationData.actual_drop_point,
              ticket_pnr: verificationData.ticket_pnr,
              ticket_doc_url: verificationData.ticket_doc_url,
              admin_notes: verificationData.admin_notes,
              confirmed_by: currentUser?.id,
              confirmed_at: nowIso,
              updated_at: nowIso,
            }
          : b
      )
    );

    // 2. Insert Commission Ledger Entry (₹19.34)
    const newCommissionEntry: CommissionEntry = {
      id: `comm-${Date.now()}`,
      booking_id: bookingId,
      booking_code: target.booking_code,
      agent_id: target.agent_id,
      agent_name: target.agent_name,
      amount: commRate,
      status: 'credited',
      entry_type: 'booking_commission',
      notes: `Automatic commission credited on booking confirmation by admin (${target.booking_code})`,
      created_at: nowIso,
    };

    // 2b. Check if the agent was referred by someone and has now achieved 5 confirmed bookings
    let newReferralBonusEntry: CommissionEntry | null = null;
    const bookedAgent = allProfiles.find((p) => p.id === target.agent_id);
    if (bookedAgent && bookedAgent.referred_by_id) {
      const referrer = allProfiles.find((p) => p.id === bookedAgent.referred_by_id);
      if (referrer) {
        // Count confirmed bookings by this agent (including this one)
        const agentConfirmedBookings = bookings.filter(
          (b) => b.agent_id === bookedAgent.id && b.status === 'confirmed' && b.id !== bookingId
        ).length + 1;

        const reqBookings = settings.referral_required_bookings || 5;
        const refBonus = settings.referral_bonus || 50;

        // Check if referral bonus was already awarded for this referred agent
        const bonusAlreadyAwarded = commissions.some(
          (c) => c.entry_type === 'referral_bonus' && c.referred_agent_id === bookedAgent.id
        );

        if (agentConfirmedBookings >= reqBookings && !bonusAlreadyAwarded) {
          newReferralBonusEntry = {
            id: `comm-ref-${Date.now()}`,
            agent_id: referrer.id,
            agent_name: referrer.full_name,
            amount: refBonus,
            status: 'credited',
            entry_type: 'referral_bonus',
            referred_agent_id: bookedAgent.id,
            referred_agent_name: bookedAgent.full_name,
            notes: `Referral Bonus: ${bookedAgent.full_name} completed ${reqBookings} compulsory confirmed bookings!`,
            created_at: nowIso,
          };
          addAuditLog('award_referral_bonus', 'commission_ledger', newReferralBonusEntry.id, {
            referrer: referrer.full_name,
            referred: bookedAgent.full_name,
            amount: refBonus,
            bookings_completed: agentConfirmedBookings,
          });
          info(
            'Referral Bonus Awarded!',
            `₹${refBonus} credited to ${referrer.full_name} (Referred agent ${bookedAgent.full_name} completed 5 bookings threshold)`
          );
        }
      }
    }

    setCommissions((prev) => {
      const list = [newCommissionEntry, ...prev];
      if (newReferralBonusEntry) {
        list.unshift(newReferralBonusEntry);
      }
      return list;
    });

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'confirmed',
        actual_fare: verificationData.actual_fare,
        confirmed_seats: verificationData.confirmed_seats,
        actual_operator: verificationData.actual_operator,
        actual_boarding_point: verificationData.actual_boarding_point,
        actual_drop_point: verificationData.actual_drop_point,
        ticket_pnr: verificationData.ticket_pnr,
        ticket_doc_url: verificationData.ticket_doc_url,
        admin_notes: verificationData.admin_notes,
        confirmed_by: currentUser?.id,
        confirmed_at: nowIso,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase confirm booking sync error:', e));

      db.createCommission(newCommissionEntry).catch((e) => console.error('Supabase commission entry sync error:', e));
    }

    // 3. Audit Log
    addAuditLog('confirm_booking', 'bookings', bookingId, {
      booking_code: target.booking_code,
      commission_credited: commRate,
      pnr: verificationData.ticket_pnr,
      actual_fare: verificationData.actual_fare,
    });

    success(
      'Booking Confirmed!',
      `PNR: ${verificationData.ticket_pnr}. ₹${commRate.toFixed(2)} commission credited to agent ${target.agent_name}.`
    );

    return true;
  };

  // REJECT BOOKING (Admin only)
  const rejectBooking = async (bookingId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can reject bookings.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    const nowIso = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'rejected',
              rejection_reason: reason,
              updated_at: nowIso,
            }
          : b
      )
    );

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'rejected',
        rejection_reason: reason,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase reject booking error:', e));
    }

    // Refund wallet balance if paid from agent_wallet
    if (target.payment_mode === 'agent_wallet') {
      const targetAgent = allProfiles.find((p) => p.id === target.agent_id);
      const refundedBal = (targetAgent?.wallet_balance || 0) + target.total_estimated_amount;
      if (currentUser?.id === target.agent_id) {
        await updateProfile({ wallet_balance: refundedBal });
      } else if (isSupabaseConfigured) {
        db.updateProfile(target.agent_id, { wallet_balance: refundedBal }).catch(console.error);
      }

      const refundTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        agent_id: target.agent_id,
        amount: target.total_estimated_amount,
        type: 'refund',
        booking_id: bookingId,
        booking_code: target.booking_code,
        description: `रिफंड: बुकिंग अस्वीकृत होने पर वॉलेट में राशि वापस (${target.booking_code})`,
        balance_after: refundedBal,
        created_at: nowIso,
      };
      setWalletTransactions((prev) => [refundTx, ...prev]);
      if (isSupabaseConfigured) {
        db.createWalletTransaction(refundTx).catch(console.error);
      }
    }


    addAuditLog('reject_booking', 'bookings', bookingId, {
      booking_code: target.booking_code,
      reason,
    });

    info('Booking Rejected', `Reason: ${reason}`);
    return true;
  };

  // REOPEN EXPIRED BOOKING (Admin only)
  const reopenBooking = async (bookingId: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can reopen expired bookings.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    // Extend deadline by another 15 minutes from now
    const nowIso = new Date().toISOString();
    const newDeadline = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'awaiting_operator_confirmation',
              deadline_at: newDeadline,
              rejection_reason: undefined,
              updated_at: nowIso,
            }
          : b
      )
    );

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'awaiting_operator_confirmation',
        deadline_at: newDeadline,
        rejection_reason: undefined,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase reopen booking error:', e));
    }

    addAuditLog('reopen_booking', 'bookings', bookingId, {
      booking_code: target.booking_code,
      new_deadline: newDeadline,
    });

    success('Booking Reopened', `New 15-minute response timer started for ${target.booking_code}.`);
    return true;
  };

  // REQUEST CANCELLATION (Agent)
  const requestCancellation = async (bookingId: string, reason: string): Promise<boolean> => {
    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    if (!isAdmin && target.agent_id !== currentUser?.id) {
      error('Unauthorized', 'You can only request cancellation for your own bookings.');
      return false;
    }

    const nowIso = new Date().toISOString();
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancellation_requested',
              cancellation_reason: reason,
              refund_status: 'requested',
              updated_at: nowIso,
            }
          : b
      )
    );

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'cancellation_requested',
        cancellation_reason: reason,
        refund_status: 'requested',
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase cancellation request error:', e));
    }

    addAuditLog('request_cancellation', 'bookings', bookingId, {
      booking_code: target.booking_code,
      reason,
    });

    info('Cancellation Requested', 'Admin team will review with bus operator.');
    return true;
  };

  // PROCESS CANCELLATION & REFUNDS (Admin only)
  const processCancellation = async (
    bookingId: string,
    refundStatus: RefundStatus,
    refundAmount: number,
    reverseCommission: boolean
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can process cancellations.');
      return false;
    }

    const target = bookings.find((b) => b.id === bookingId);
    if (!target) return false;

    const nowIso = new Date().toISOString();

    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'cancelled',
              refund_status: refundStatus,
              refund_amount: refundAmount,
              updated_at: nowIso,
            }
          : b
      )
    );

    // Apply commission reversal if applicable
    let reversalEntry: CommissionEntry | null = null;
    if (reverseCommission && target.status === 'confirmed') {
      const origCredit = commissions.find(
        (c) => c.booking_id === bookingId && c.status === 'credited'
      );
      if (origCredit) {
        reversalEntry = {
          id: `comm-rev-${Date.now()}`,
          booking_id: bookingId,
          booking_code: target.booking_code,
          agent_id: target.agent_id,
          agent_name: target.agent_name,
          amount: -origCredit.amount,
          status: 'reversed',
          reversal_ref_id: origCredit.id,
          notes: `Commission reversed upon cancellation (${target.booking_code})`,
          created_at: nowIso,
        };
        setCommissions((prev) => [reversalEntry!, ...prev]);
      }
    }

    if (isSupabaseConfigured) {
      db.updateBooking(bookingId, {
        status: 'cancelled',
        refund_status: refundStatus,
        refund_amount: refundAmount,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase cancel booking sync error:', e));

      if (reversalEntry) {
        db.createCommission(reversalEntry).catch((e) => console.error('Supabase commission reversal sync error:', e));
      }
    }

    addAuditLog('process_cancellation', 'bookings', bookingId, {
      booking_code: target.booking_code,
      refund_status: refundStatus,
      refund_amount: refundAmount,
      commission_reversed: reverseCommission,
    });

    success('Cancellation Finalized', `Status set to Cancelled. Refund: ₹${refundAmount}`);
    return true;
  };

  // BUS TRIPS INVENTORY MANAGEMENT (Admin)
  const addBusTrip = async (trip: Omit<BusTrip, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only admins can add bus routes.');
      return false;
    }

    const newTrip: BusTrip = {
      ...trip,
      id: `trip-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setBusTrips((prev) => [newTrip, ...prev]);

    if (isSupabaseConfigured) {
      db.createBusTrip(newTrip).catch((e) => console.error('Supabase addBusTrip error:', e));
    }

    addAuditLog('add_bus_trip', 'bus_trips', newTrip.id, { operator: trip.operator_name, route: `${trip.source} to ${trip.destination}` });
    success('Bus Trip Added', `${trip.operator_name} (${trip.source} → ${trip.destination}) is now listed.`);
    return true;
  };

  const updateBusTrip = async (id: string, trip: Partial<BusTrip>): Promise<boolean> => {
    if (!isAdmin) return false;
    const nowIso = new Date().toISOString();
    setBusTrips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...trip, updated_at: nowIso } : t))
    );

    if (isSupabaseConfigured) {
      db.updateBusTrip(id, { ...trip, updated_at: nowIso }).catch((e) => console.error('Supabase updateBusTrip error:', e));
    }

    success('Trip Updated', 'Bus route inventory updated.');
    return true;
  };

  const deleteBusTrip = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    setBusTrips((prev) => prev.filter((t) => t.id !== id));

    if (isSupabaseConfigured) {
      db.deleteBusTrip(id).catch((e) => console.error('Supabase deleteBusTrip error:', e));
    }

    info('Trip Removed', 'Bus route has been removed.');
    return true;
  };

  // SALARY MANAGEMENT (Admin)
  const approveSalary = async (salaryId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const nowIso = new Date().toISOString();
    setSalaryRecords((prev) =>
      prev.map((s) =>
        s.id === salaryId
          ? {
              ...s,
              status: 'approved',
              approved_by: currentUser?.id,
              approved_at: nowIso,
              updated_at: nowIso,
            }
          : s
      )
    );

    if (isSupabaseConfigured) {
      db.updateSalaryRecord(salaryId, {
        status: 'approved',
        approved_by: currentUser?.id,
        approved_at: nowIso,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase approveSalary error:', e));
    }

    success('Salary Approved', 'Agent monthly fixed salary approved for payout.');
    return true;
  };

  const markSalaryPaid = async (salaryId: string, paymentReference: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const nowIso = new Date().toISOString();
    setSalaryRecords((prev) =>
      prev.map((s) =>
        s.id === salaryId
          ? {
              ...s,
              status: 'paid',
              paid_by: currentUser?.id,
              paid_at: nowIso,
              payment_reference: paymentReference,
              updated_at: nowIso,
            }
          : s
      )
    );

    if (isSupabaseConfigured) {
      db.updateSalaryRecord(salaryId, {
        status: 'paid',
        paid_by: currentUser?.id,
        paid_at: nowIso,
        payment_reference: paymentReference,
        updated_at: nowIso,
      }).catch((e) => console.error('Supabase markSalaryPaid error:', e));
    }

    success('Salary Marked as Paid', `Payment Ref: ${paymentReference}`);
    return true;
  };

  // PAYOUT REQUESTS & PROCESSING
  const requestPayout = async (
    payoutData: Omit<PayoutRequest, 'id' | 'agent_id' | 'agent_name' | 'agent_mobile' | 'status' | 'created_at'>
  ): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'agent') {
      error('Unauthorized', 'केवल अधिकृत एजेंट ही निकासी अनुरोध दर्ज कर सकते हैं।');
      return false;
    }
    if (!isApprovedAgent) {
      error('Approval Required', 'केवल स्वीकृत एजेंट ही निकासी अनुरोध कर सकते हैं।');
      return false;
    }

    // Calculate available net commission
    const totalCredited = agentCommissions
      .filter((c) => c.status === 'credited')
      .reduce((sum, c) => sum + c.amount, 0);
    const totalReversed = agentCommissions
      .filter((c) => c.status === 'reversed')
      .reduce((sum, c) => sum + Math.abs(c.amount), 0);
    const totalWithdrawnOrPending = payoutRequests
      .filter((p) => p.agent_id === currentUser.id && p.status !== 'rejected')
      .reduce((sum, p) => sum + p.amount, 0);

    const netCommission = Math.max(0, totalCredited - totalReversed);

    // Check if 150 target is met in current calendar month
    const currentMonthConfirmed = bookings.filter((b) => {
      if (b.agent_id !== currentUser.id || b.status !== 'confirmed') return false;
      const bDate = new Date(b.created_at);
      const bMonthYear = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
      return bMonthYear === currentMonthYear;
    }).length;

    const isTargetMet = currentMonthConfirmed >= settings.monthly_target;
    // Salary Base Model: 150 bookings guarantees ₹5,000 base salary!
    // If agent didn't withdraw early, they get the full ₹5,000.
    const effectiveTotalEarnings = isTargetMet
      ? Math.max(netCommission, settings.monthly_salary)
      : netCommission;

    const availableBalance = Math.max(0, effectiveTotalEarnings - totalWithdrawnOrPending);

    if (payoutData.amount > availableBalance) {
      error('Insufficient Balance', `निकासी राशि उपलब्ध शेष (₹${availableBalance.toFixed(2)}) से अधिक नहीं हो सकती।`);
      return false;
    }

    if (payoutData.amount <= 0) {
      error('Invalid Amount', 'कृपया ₹1 या अधिक की मान्य राशि दर्ज करें।');
      return false;
    }

    const newPayout: PayoutRequest = {
      id: `payout-${Date.now()}`,
      agent_id: currentUser.id,
      agent_name: currentUser.full_name,
      agent_mobile: currentUser.mobile,
      ...payoutData,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setPayoutRequests((prev) => [newPayout, ...prev]);

    if (isSupabaseConfigured) {
      db.createPayoutRequest(newPayout).catch((e) => console.error('Supabase payout create sync error:', e));
    }

    addAuditLog('request_payout', 'payout_requests', newPayout.id, {
      amount: newPayout.amount,
      method: newPayout.payout_method,
    });
    success('Payout Requested', `₹${newPayout.amount.toFixed(2)} निकासी अनुरोध SafarGo एडमिन को भेज दिया गया है।`);
    return true;
  };

  const approvePayout = async (payoutId: string, adminReference: string, notes?: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही पेआउट स्वीकृत कर सकते हैं।');
      return false;
    }

    const processedAt = new Date().toISOString();
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'approved',
              admin_reference: adminReference,
              admin_notes: notes,
              processed_at: processedAt,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updatePayoutRequest(payoutId, {
        status: 'approved',
        admin_reference: adminReference,
        admin_notes: notes,
        processed_at: processedAt,
      }).catch((e) => console.error('Supabase approvePayout error:', e));
    }

    addAuditLog('approve_payout', 'payout_requests', payoutId, {
      admin_reference: adminReference,
      notes,
    });
    success('Payout Approved', `पेआउट संदर्भ (${adminReference}) के साथ स्वीकृत कर दिया गया है।`);
    return true;
  };

  const rejectPayout = async (payoutId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही पेआउट अस्वीकृत कर सकते हैं।');
      return false;
    }

    const processedAt = new Date().toISOString();
    setPayoutRequests((prev) =>
      prev.map((p) =>
        p.id === payoutId
          ? {
              ...p,
              status: 'rejected',
              admin_notes: reason,
              processed_at: processedAt,
            }
          : p
      )
    );

    if (isSupabaseConfigured) {
      db.updatePayoutRequest(payoutId, {
        status: 'rejected',
        admin_notes: reason,
        processed_at: processedAt,
      }).catch((e) => console.error('Supabase rejectPayout error:', e));
    }

    addAuditLog('reject_payout', 'payout_requests', payoutId, { reason });
    warning('Payout Rejected', 'निकासी अनुरोध अस्वीकृत कर दिया गया है।');
    return true;
  };

  // SETTINGS (Admin)
  const updateSettings = async (newSettings: Partial<AdminSettings>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can modify system settings.');
      return false;
    }
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('update_settings', 'admin_settings', undefined, newSettings);
    success('Settings Saved', 'Platform rates and operational rules updated.');
    return true;
  };

  const updateAnnouncement = async (announcementData: Partial<AdminAnnouncement>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can broadcast announcements.');
      return false;
    }
    const updatedAnnouncement: AdminAnnouncement = {
      ...settings.announcement,
      ...announcementData,
      updated_at: new Date().toISOString(),
    };
    setSettings((prev) => ({
      ...prev,
      announcement: updatedAnnouncement,
    }));
    addAuditLog('update_announcement', 'admin_settings', undefined, updatedAnnouncement);
    success(
      updatedAnnouncement.is_active ? 'घोषणा प्रसारित की गई (Broadcast Active)' : 'घोषणा निष्क्रिय की गई (Announcement Disabled)',
      updatedAnnouncement.title
    );
    return true;
  };

  const addCustomFeature = async (feature: Omit<CustomFeature, 'id' | 'created_at'>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can add custom features.');
      return false;
    }
    const newFeature: CustomFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setSettings((prev) => ({
      ...prev,
      custom_features: [...(prev.custom_features || []), newFeature],
    }));
    addAuditLog('add_custom_feature', 'custom_features', newFeature.id, { title: newFeature.title });
    success('नई फंक्शनैलिटी जोड़ी गई (Feature Added)', `"${newFeature.title}" अब एजेंटों के लिए उपलब्ध है।`);
    return true;
  };

  const updateCustomFeature = async (id: string, updatedFields: Partial<CustomFeature>): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can edit features.');
      return false;
    }
    setSettings((prev) => ({
      ...prev,
      custom_features: (prev.custom_features || []).map((f) =>
        f.id === id ? { ...f, ...updatedFields } : f
      ),
    }));
    addAuditLog('update_custom_feature', 'custom_features', id, updatedFields);
    success('Feature Updated', 'फंक्शनैलिटी सेटिंग्स अपडेट कर दी गई हैं।');
    return true;
  };

  const deleteCustomFeature = async (id: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'Only administrators can delete features.');
      return false;
    }
    setSettings((prev) => ({
      ...prev,
      custom_features: (prev.custom_features || []).filter((f) => f.id !== id),
    }));
    addAuditLog('delete_custom_feature', 'custom_features', id);
    info('Feature Removed', 'कस्टम फंक्शनैलिटी हटा दी गई है।');
    return true;
  };

  const toggleCustomFeature = async (id: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const target = settings.custom_features?.find((f) => f.id === id);
    if (!target) return false;
    const newStatus = !target.is_active;
    return updateCustomFeature(id, { is_active: newStatus });
  };

  // WALLET RECHARGE SYSTEM (Agents can deposit, Min ₹2,000)
  const requestWalletRecharge = async (
    amount: number,
    utr: string,
    screenshotUrl?: string,
    paymentMethod: 'upi_qr' | 'bank_transfer' = 'upi_qr'
  ): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'agent') {
      error('Unauthorized', 'केवल पंजीकृत एजेंट ही वॉलेट रिचार्ज कर सकते हैं।');
      return false;
    }
    if (amount < settings.min_wallet_recharge) {
      error(
        'न्यूनतम राशि अमान्य (Min ₹2,000)',
        `वॉलेट में न्यूनतम ₹${settings.min_wallet_recharge.toLocaleString('en-IN')} जोड़ना अनिवार्य है।`
      );
      return false;
    }
    if (!utr || !utr.trim()) {
      error('UTR Required', 'कृपया बैंक ट्रांसफर / UPI UTR नंबर दर्ज करें।');
      return false;
    }

    const newRecharge: WalletRechargeRequest = {
      id: `rech-${Date.now()}`,
      agent_id: currentUser.id,
      agent_name: currentUser.full_name,
      agent_mobile: currentUser.mobile,
      amount,
      payment_method: paymentMethod,
      utr_number: utr.trim(),
      screenshot_url: screenshotUrl,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setWalletRecharges((prev) => [newRecharge, ...prev]);
    if (isSupabaseConfigured) {
      db.createWalletRecharge(newRecharge).catch(console.error);
    }

    addAuditLog('request_wallet_recharge', 'wallet_recharge_requests', newRecharge.id, {
      amount,
      utr,
    });

    success(
      'रिचार्ज अनुरोध सबमिट!',
      `₹${amount.toLocaleString('en-IN')} का वॉलेट टॉप-अप अनुरोध SafarGo एडमिन को भेज दिया गया है। एडमिन सत्यापन के बाद राशि वॉलेट में जमा होगी।`
    );
    return true;
  };

  const approveWalletRecharge = async (rechargeId: string, adminNotes?: string): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही वॉलेट रिचार्ज स्वीकृत कर सकते हैं।');
      return false;
    }

    const recharge = walletRecharges.find((r) => r.id === rechargeId);
    if (!recharge || recharge.status !== 'pending') return false;

    const nowIso = new Date().toISOString();
    setWalletRecharges((prev) =>
      prev.map((r) =>
        r.id === rechargeId
          ? {
              ...r,
              status: 'approved',
              admin_notes: adminNotes,
              approved_by: currentUser?.id,
              approved_at: nowIso,
            }
          : r
      )
    );

    const targetProfile = allProfiles.find((p) => p.id === recharge.agent_id);
    const currentBal = targetProfile?.wallet_balance || 0;
    const newBal = currentBal + recharge.amount;

    if (currentUser?.id === recharge.agent_id) {
      await updateProfile({ wallet_balance: newBal });
    } else if (isSupabaseConfigured) {
      db.updateProfile(recharge.agent_id, { wallet_balance: newBal }).catch(console.error);
    }

    const creditTx: WalletTransaction = {
      id: `wtx-${Date.now()}`,
      agent_id: recharge.agent_id,
      amount: recharge.amount,
      type: 'recharge',
      recharge_id: recharge.id,
      description: `वॉलेट रिचार्ज स्वीकृत (UTR: ${recharge.utr_number})`,
      balance_after: newBal,
      created_at: nowIso,
    };
    setWalletTransactions((prev) => [creditTx, ...prev]);
    if (isSupabaseConfigured) {
      db.updateWalletRecharge(rechargeId, {
        status: 'approved',
        admin_notes: adminNotes,
        approved_by: currentUser?.id,
        approved_at: nowIso,
      }).catch(console.error);
      db.createWalletTransaction(creditTx).catch(console.error);
    }

    addAuditLog('approve_wallet_recharge', 'wallet_recharges', recharge.id, {
      agent_id: recharge.agent_id,
      amount: recharge.amount,
      new_balance: newBal,
    });

    success(
      'वॉलेट रिचार्ज स्वीकृत!',
      `${recharge.agent_name} के वॉलेट में ₹${recharge.amount.toLocaleString('en-IN')} जमा कर दिए गए हैं।`
    );
    return true;
  };

  const rejectWalletRecharge = async (rechargeId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const recharge = walletRecharges.find((r) => r.id === rechargeId);
    if (!recharge || recharge.status !== 'pending') return false;

    setWalletRecharges((prev) =>
      prev.map((r) =>
        r.id === rechargeId
          ? {
              ...r,
              status: 'rejected',
              admin_notes: reason,
              approved_by: currentUser?.id,
              approved_at: new Date().toISOString(),
            }
          : r
      )
    );

    if (isSupabaseConfigured) {
      db.updateWalletRecharge(rechargeId, {
        status: 'rejected',
        admin_notes: reason,
        approved_by: currentUser?.id,
        approved_at: new Date().toISOString(),
      }).catch(console.error);
    }

    warning('Recharge Rejected', `वॉलेट रिचार्ज अस्वीकृत: ${reason}`);
    return true;
  };

  // Viral Creator & Social Media Promotion Handlers
  const submitPromotionClaim = async (claimData: {
    user_name: string;
    user_mobile: string;
    platform: PromotionPlatform;
    content_type: PromotionContentType;
    post_url: string;
    channel_or_handle: string;
    views_count: number;
    screenshot_url?: string;
    payout_method: 'wallet' | 'upi' | 'bank';
    upi_id?: string;
    bank_details?: string;
  }): Promise<boolean> => {
    if (!claimData.post_url || !claimData.post_url.trim()) {
      error('URL Required', 'कृपया अपनी Instagram Reel या YouTube वीडियो का लिंक दर्ज करें।');
      return false;
    }

    const isInsta = claimData.platform === 'instagram';
    const targetViews = isInsta
      ? (settings.promo_instagram_target_views || 1000000)
      : (settings.promo_youtube_target_views || 10000);
    const rewardAmount = isInsta
      ? (settings.promo_instagram_reward || 500)
      : (settings.promo_youtube_reward || 100);

    const now = new Date();
    const slaHours = settings.promo_sla_hours || 24;
    const deadline = new Date(now.getTime() + slaHours * 60 * 60 * 1000).toISOString();
    const dateCode = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const claimCode = `PRM-${dateCode}-${randSuffix}`;

    const newClaim: PromotionClaim = {
      id: `prm-${Date.now()}`,
      claim_code: claimCode,
      user_id: currentUser?.id || `guest-${Date.now()}`,
      user_name: claimData.user_name.trim() || currentUser?.full_name || 'Creator',
      user_mobile: claimData.user_mobile.trim() || currentUser?.mobile || '',
      user_role: currentUser?.role || 'creator',
      platform: claimData.platform,
      content_type: claimData.content_type,
      post_url: claimData.post_url.trim(),
      channel_or_handle: claimData.channel_or_handle.trim() || '@creator',
      views_count: Number(claimData.views_count) || 0,
      reward_amount: rewardAmount,
      screenshot_url: claimData.screenshot_url,
      payout_method: claimData.payout_method,
      upi_id: claimData.upi_id?.trim(),
      bank_details: claimData.bank_details?.trim(),
      status: 'pending',
      created_at: now.toISOString(),
      deadline_at: deadline,
    };

    setPromotionClaims((prev) => [newClaim, ...prev]);
    if (isSupabaseConfigured) {
      db.createPromotionClaim(newClaim).catch(console.error);
    }

    addAuditLog('submit_promotion_claim', 'promotion_claims', newClaim.id, {
      platform: newClaim.platform,
      views: newClaim.views_count,
      reward: newClaim.reward_amount,
    });

    success(
      'प्रमोशन क्लेम सबमिट हुआ! 🚀',
      `आपका क्लेम ID #${newClaim.claim_code} दर्ज कर लिया गया है। SafarGo टीम 24 घंटे के अंदर व्यूज चेक करके ₹${newClaim.reward_amount} बोनस क्रेडिट करेगी!`
    );
    return true;
  };

  const approvePromotionClaim = async (
    claimId: string,
    paymentReference?: string,
    notes?: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      error('Unauthorized', 'केवल एडमिन ही प्रमोशन क्लेम स्वीकृत कर सकते हैं।');
      return false;
    }

    const claim = promotionClaims.find((c) => c.id === claimId);
    if (!claim || claim.status !== 'pending') return false;

    const nowIso = new Date().toISOString();
    const txnRef = paymentReference?.trim() || `TXN-PRM-${Date.now().toString().slice(-6)}`;

    setPromotionClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'paid',
              payment_reference: txnRef,
              admin_notes: notes || 'Verified genuine views & SafarGo mention.',
              reviewed_by: currentUser?.id,
              reviewed_at: nowIso,
            }
          : c
      )
    );

    // If payout method is 'wallet' and user is an agent, credit agent's wallet
    const targetProfile = allProfiles.find((p) => p.id === claim.user_id);
    if (claim.payout_method === 'wallet' && targetProfile && targetProfile.role === 'agent') {
      const currentBal = targetProfile.wallet_balance || 0;
      const newBal = currentBal + claim.reward_amount;

      if (currentUser?.id === claim.user_id) {
        await updateProfile({ wallet_balance: newBal });
      } else if (isSupabaseConfigured) {
        db.updateProfile(claim.user_id, { wallet_balance: newBal }).catch(console.error);
      }

      const creditTx: WalletTransaction = {
        id: `wtx-${Date.now()}`,
        agent_id: claim.user_id,
        amount: claim.reward_amount,
        type: 'adjustment',
        description: `Viral Promotion Bonus (${claim.platform.toUpperCase()} - ${claim.claim_code})`,
        balance_after: newBal,
        created_at: nowIso,
      };

      setWalletTransactions((prev) => [creditTx, ...prev]);
      if (isSupabaseConfigured) {
        db.createWalletTransaction(creditTx).catch(console.error);
      }
    }

    if (isSupabaseConfigured) {
      db.updatePromotionClaim(claimId, {
        status: 'paid',
        payment_reference: txnRef,
        admin_notes: notes || 'Verified genuine views & SafarGo mention.',
        reviewed_by: currentUser?.id,
        reviewed_at: nowIso,
      }).catch(console.error);
    }

    addAuditLog('approve_promotion_claim', 'promotion_claims', claimId, {
      reward_amount: claim.reward_amount,
      payout_method: claim.payout_method,
      payment_reference: txnRef,
    });

    success(
      'प्रमोशन स्वीकृत व भुगतान संपन्न! ✅',
      `${claim.user_name} को ${claim.platform.toUpperCase()} के लिए ₹${claim.reward_amount} बोनस स्वीकृत व भुगतान किया गया।`
    );
    return true;
  };

  const rejectPromotionClaim = async (claimId: string, reason: string): Promise<boolean> => {
    if (!isAdmin) return false;
    const claim = promotionClaims.find((c) => c.id === claimId);
    if (!claim) return false;

    const nowIso = new Date().toISOString();
    setPromotionClaims((prev) =>
      prev.map((c) =>
        c.id === claimId
          ? {
              ...c,
              status: 'rejected',
              rejection_reason: reason,
              reviewed_by: currentUser?.id,
              reviewed_at: nowIso,
            }
          : c
      )
    );

    if (isSupabaseConfigured) {
      db.updatePromotionClaim(claimId, {
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: currentUser?.id,
        reviewed_at: nowIso,
      }).catch(console.error);
    }

    addAuditLog('reject_promotion_claim', 'promotion_claims', claimId, { reason });
    warning('Promotion Rejected', `प्रमोशन क्लेम अस्वीकृत: ${reason}`);
    return true;
  };

  return (
    <DataContext.Provider
      value={{
        bookings,
        agentBookings,
        createBooking,
        confirmBooking,
        rejectBooking,
        reopenBooking,
        requestCancellation,
        processCancellation,
        busTrips,
        addBusTrip,
        updateBusTrip,
        deleteBusTrip,
        commissions,
        agentCommissions,
        salaryRecords,
        agentSalaryRecord,
        approveSalary,
        markSalaryPaid,
        payoutRequests,
        agentPayoutRequests,
        requestPayout,
        approvePayout,
        rejectPayout,
        walletRecharges,
        agentWalletRecharges,
        walletTransactions,
        agentWalletTransactions,
        agentWalletBalance,
        requestWalletRecharge,
        approveWalletRecharge,
        rejectWalletRecharge,
        promotionClaims,
        agentPromotionClaims,
        submitPromotionClaim,
        approvePromotionClaim,
        rejectPromotionClaim,
        settings,
        updateSettings,
        updateAnnouncement,
        addCustomFeature,
        updateCustomFeature,
        deleteCustomFeature,
        toggleCustomFeature,
        auditLogs,
        celebrationBooking,
        dismissCelebration,
      }}
    >
      {children}
    </DataContext.Provider>
  );

};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
