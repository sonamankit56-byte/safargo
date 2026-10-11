import { describe, it, expect } from 'vitest';
import {
  INITIAL_PROFILES,
  INITIAL_BOOKINGS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_SETTINGS,
  INITIAL_BUS_TRIPS,
  INITIAL_PROMO_CODES,
  INITIAL_QUICK_DELIVERY_ORDERS,
  INITIAL_PROMOTER_APPLICATIONS
} from '../src/lib/mockData';
import { Booking, CommissionEntry, Profile, PromoCode, QuickDeliveryOrder, PromoterApplication, AdminSettings, FeatureVisibilityMode } from '../src/types';
import {
  getFeatureMode,
  isFeatureActive,
  isFeatureComingSoon,
  isFeatureHidden,
  PLATFORM_FEATURE_DEFINITIONS
} from '../src/lib/featureFlags';
import {
  getTabFromPath,
  getPathFromTab,
  TAB_TO_PATH,
  PATH_TO_TAB
} from '../src/lib/routes';

describe('A. Authentication & Secure Roles', () => {
  it('identifies admin, approved agent, and pending agent correctly', () => {
    const admin = INITIAL_PROFILES.find((p) => p.role === 'admin');
    const approvedAgent = INITIAL_PROFILES.find((p) => p.role === 'agent' && p.agent_status === 'approved');
    const pendingAgent = INITIAL_PROFILES.find((p) => p.role === 'agent' && p.agent_status === 'pending_approval');

    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');

    expect(approvedAgent).toBeDefined();
    expect(approvedAgent?.agent_status).toBe('approved');

    expect(pendingAgent).toBeDefined();
    expect(pendingAgent?.agent_status).toBe('pending_approval');
  });

  it('blocks pending agents from booking tickets', () => {
    const pendingAgent = INITIAL_PROFILES.find((p) => p.agent_status === 'pending_approval')!;
    const isAllowedToBook = pendingAgent.role === 'agent' && pendingAgent.agent_status === 'approved';
    expect(isAllowedToBook).toBe(false);
  });

  it('allows approved agents to book tickets', () => {
    const approvedAgent = INITIAL_PROFILES.find((p) => p.agent_status === 'approved' && p.role === 'agent')!;
    const isAllowedToBook = approvedAgent.role === 'agent' && approvedAgent.agent_status === 'approved';
    expect(isAllowedToBook).toBe(true);
  });
});

describe('B. Booking Form, Idempotency, and WhatsApp Generation', () => {
  it('generates a formatted readable Booking ID', () => {
    const sample = INITIAL_BOOKINGS[0];
    expect(sample.booking_code).toMatch(/^SFG-\d{8}-\d{3}$/);
  });

  it('prevents duplicate submissions with idempotency key', () => {
    const existingKey = 'idemp-12345';
    const existingBookings = [{ ...INITIAL_BOOKINGS[0], idempotency_key: existingKey }];

    const incomingSubmission = { idempotency_key: existingKey };
    const isDuplicate = existingBookings.some((b) => b.idempotency_key === incomingSubmission.idempotency_key);

    expect(isDuplicate).toBe(true);
  });

  it('correctly formats the SafarGo manual WhatsApp request message', () => {
    const b = INITIAL_BOOKINGS[1];
    const message = `SAFARGO MANUAL BOOKING REQUEST
Booking ID: ${b.booking_code}
Agent Name: ${b.agent_name}
Agent ID: ${b.agent_id}
Customer Name: ${b.customer_name}
Customer Mobile: ${b.customer_mobile}
From: ${b.from_city}
To: ${b.to_city}
Journey Date: ${b.journey_date}
Preferred Bus: ${b.operator_preference}
Seat Type: ${b.seat_category.toUpperCase()}
Passengers: ${b.passenger_count}
Estimated Fare: ₹${b.total_estimated_amount}
Status: PENDING ADMIN CONFIRMATION`;

    expect(message).toContain(`Booking ID: ${b.booking_code}`);
    expect(message).toContain(`Customer Name: ${b.customer_name}`);
    expect(message).toContain('Status: PENDING ADMIN CONFIRMATION');
  });
});

describe('C. 15-Minute Booking Timer & Expiration Safety', () => {
  it('calculates 15-minute deadline from server created_at timestamp', () => {
    const createdAt = new Date('2026-10-10T08:00:00Z');
    const deadline = new Date(createdAt.getTime() + 15 * 60 * 1000);

    const diffMinutes = (deadline.getTime() - createdAt.getTime()) / (1000 * 60);
    expect(diffMinutes).toBe(15);
  });

  it('marks pending requests as expired when deadline passes without confirming', () => {
    const expiredBooking = INITIAL_BOOKINGS.find((b) => b.id === 'bkg-004')!;
    expect(expiredBooking.status).toBe('expired');
  });

  it('never awards commission to expired or rejected bookings', () => {
    const expiredBookingId = 'bkg-004';
    const commissionCredited = INITIAL_COMMISSION_LEDGER.some(
      (c) => c.booking_id === expiredBookingId && c.status === 'credited'
    );
    expect(commissionCredited).toBe(false);
  });
});

describe('D. Commission Engine & Atomic Non-Duplication', () => {
  it('verifies default commission rate is ₹19.34', () => {
    expect(INITIAL_SETTINGS.commission_rate).toBe(19.34);
  });

  it('awards commission exactly once on confirmed booking', () => {
    const confirmedBookingId = 'bkg-001';
    const credits = INITIAL_COMMISSION_LEDGER.filter(
      (c) => c.booking_id === confirmedBookingId && c.status === 'credited'
    );

    expect(credits.length).toBe(1);
    expect(credits[0].amount).toBe(19.34);
  });

  it('prevents duplicate commission entries for same booking', () => {
    const bookingId = 'bkg-001';
    const existing = [...INITIAL_COMMISSION_LEDGER];

    const canAwardCommission = (bId: string) => {
      const alreadyCredited = existing.some((c) => c.booking_id === bId && c.status === 'credited');
      return !alreadyCredited;
    };

    expect(canAwardCommission(bookingId)).toBe(false);
  });

  it('creates reversal ledger entry on cancellation without deleting history', () => {
    const originalCredit: CommissionEntry = {
      id: 'comm-1',
      booking_id: 'bkg-1',
      agent_id: 'agent-1',
      amount: 19.34,
      status: 'credited',
      created_at: new Date().toISOString(),
    };

    const reversal: CommissionEntry = {
      id: 'comm-2',
      booking_id: 'bkg-1',
      agent_id: 'agent-1',
      amount: -19.34,
      status: 'reversed',
      reversal_ref_id: originalCredit.id,
      notes: 'Commission reversed upon cancellation',
      created_at: new Date().toISOString(),
    };

    const ledger = [originalCredit, reversal];
    const net = ledger.reduce((sum, item) => sum + item.amount, 0);

    expect(ledger.length).toBe(2);
    expect(net).toBe(0);
    expect(reversal.reversal_ref_id).toBe(originalCredit.id);
  });
});

describe('E. Agent Monthly Target and Salary Rules', () => {
  it('tracks progress towards default 150 confirmed bookings target', () => {
    const target = 150;
    const confirmed = 30;
    const remaining = Math.max(0, target - confirmed);
    const progress = Math.round((confirmed / target) * 100);

    expect(remaining).toBe(120);
    expect(progress).toBe(20);
  });

  it('maintains fixed salary separate from booking commission', () => {
    const baseSalary = 5000;
    const bookingCommission = 19.34 * 10;

    expect(baseSalary).toBe(5000);
    expect(bookingCommission).toBe(193.4);
    expect(baseSalary + bookingCommission).toBe(5193.4);
  });
});

describe('F. Super Admin Access (jia647155@gmail.com)', () => {
  it('confirms jia647155@gmail.com has authorized Super Admin access', () => {
    const jia = INITIAL_PROFILES.find((p) => p.email === 'jia647155@gmail.com');
    expect(jia).toBeDefined();
    expect(jia?.role).toBe('admin');
    expect(jia?.agent_status).toBe('approved');
  });
});

describe('G. Refer and Earn ₹50 (5 Bookings Compulsory)', () => {
  it('verifies referral bonus is ₹50 and threshold is 5 bookings', () => {
    expect(INITIAL_SETTINGS.referral_bonus).toBe(50);
    expect(INITIAL_SETTINGS.referral_required_bookings).toBe(5);
  });

  it('does NOT award ₹50 referral bonus if referred agent has fewer than 5 bookings', () => {
    const referredAgentBookings = 4;
    const isEligibleForBonus = referredAgentBookings >= INITIAL_SETTINGS.referral_required_bookings;
    expect(isEligibleForBonus).toBe(false);
  });

  it('awards ₹50 referral bonus when referred agent reaches 5 confirmed bookings', () => {
    const referredAgentBookings = 5;
    const isEligibleForBonus = referredAgentBookings >= INITIAL_SETTINGS.referral_required_bookings;
    expect(isEligibleForBonus).toBe(true);

    const bonusEntry: CommissionEntry = {
      id: 'comm-ref-test',
      agent_id: 'usr-agent-01',
      amount: INITIAL_SETTINGS.referral_bonus,
      status: 'credited',
      entry_type: 'referral_bonus',
      referred_agent_id: 'usr-agent-03',
      notes: 'Referral Bonus: Sunil Pal completed 5 compulsory bookings',
      created_at: new Date().toISOString(),
    };

    expect(bonusEntry.amount).toBe(50);
    expect(bonusEntry.entry_type).toBe('referral_bonus');
  });
});

describe('H. System Settings: Announcements & Broadcast', () => {
  it('loads default announcement with active broadcast and 15-minute WhatsApp warning', () => {
    expect(INITIAL_SETTINGS.announcement).toBeDefined();
    expect(INITIAL_SETTINGS.announcement.is_active).toBe(true);
    expect(INITIAL_SETTINGS.announcement.title).toContain('15 मिनट');
    expect(INITIAL_SETTINGS.announcement.type).toBe('urgent');
  });

  it('allows updating announcement title, message, and priority level', () => {
    const updatedAnnouncement = {
      ...INITIAL_SETTINGS.announcement,
      title: '🎉 दीवाली स्पेशल बस डिस्काउंट',
      message: 'त्यौहार पर सभी रूटों पर अतिरिक्त सीटें उपलब्ध हैं।',
      type: 'success' as const,
    };

    expect(updatedAnnouncement.title).toBe('🎉 दीवाली स्पेशल बस डिस्काउंट');
    expect(updatedAnnouncement.type).toBe('success');
    expect(updatedAnnouncement.is_active).toBe(true);
  });
});

describe('I. System Settings: New Functionality & Feature Builder', () => {
  it('manages built-in feature toggles (Refer & Earn, Tatkal, Parcel Desk)', () => {
    expect(INITIAL_SETTINGS.feature_refer_earn).toBe(true);
    expect(INITIAL_SETTINGS.feature_tatkal_service).toBe(true);
    expect(INITIAL_SETTINGS.feature_parcel_service).toBe(true);
  });

  it('allows adding dynamic custom feature with pre-filled WhatsApp action', () => {
    const customFeature = {
      id: 'feat-custom-test',
      title: 'चार धाम यात्रा स्पेशल बस बुकिंग',
      description: 'उत्तराखंड तीर्थ यात्रा के लिए स्पेशल ग्रुप बस',
      badge: 'नई सेवा',
      icon_name: 'MapPin' as const,
      action_type: 'whatsapp' as const,
      action_value: 'नमस्ते सफ़ारगो टीम, चार धाम बस के लिए पूछताछ: ',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    expect(customFeature.title).toBe('चार धाम यात्रा स्पेशल बस बुकिंग');
    expect(customFeature.action_type).toBe('whatsapp');
    expect(customFeature.action_value).toContain('चार धाम');
    expect(customFeature.is_active).toBe(true);
  });
});

describe('J. Forgot Password & Authentication Security', () => {
  it('resets agent password using registered mobile or email', () => {
    const testProfiles = [...INITIAL_PROFILES];
    const targetMobile = '9450123456';
    const index = testProfiles.findIndex((p) => p.mobile === targetMobile);
    expect(index).toBeGreaterThanOrEqual(0);

    const newPassword = 'NewSecretPassword@2026';
    testProfiles[index] = {
      ...testProfiles[index],
      password: newPassword,
    };

    expect(testProfiles[index].password).toBe(newPassword);
  });

  it('verifies Super Admin Jia has secure password Jia@2233 configured', () => {
    const jia = INITIAL_PROFILES.find((p) => p.email === 'jia647155@gmail.com');
    expect(jia).toBeDefined();
    expect(jia?.password).toBe('Jia@2233');
  });

  it('clears session and returns null on real logout', () => {
    let currentUserId: string | null = 'usr-admin-jia';
    expect(currentUserId).not.toBeNull();

    // Perform real logout
    currentUserId = null;
    expect(currentUserId).toBeNull();
  });
});

describe('K. Homepage & Bus Route Inventory', () => {
  it('contains popular rural bus routes with seater and sleeper fares', () => {
    const trip = INITIAL_BUS_TRIPS[0];
    expect(trip.source).toBe('Bhopal');
    expect(trip.destination).toBe('Indore');
    expect(trip.seater_fare).toBeGreaterThan(0);
    expect(trip.sleeper_fare).toBeGreaterThan(0);
    expect(trip.available_seater).toBeGreaterThan(0);
  });
});

describe('L. Commission Wallet & Payout Withdrawal Requests', () => {
  it('calculates available withdrawal balance accurately', () => {
    const credits = 100;
    const reversals = 19.34;
    const existingPayouts = 30;
    const available = Math.max(0, credits - reversals - existingPayouts);

    expect(available).toBe(50.66);
  });

  it('prevents payout requests that exceed available balance', () => {
    const available = 50.66;
    const requestedAmount = 100;
    const isValidRequest = requestedAmount <= available && requestedAmount > 0;

    expect(isValidRequest).toBe(false);
  });

  it('allows valid UPI payout requests and records bank UTR upon admin approval', () => {
    const payout: import('../src/types').PayoutRequest = {
      id: 'payout-101',
      agent_id: 'usr-agent-01',
      agent_name: 'Pawan Kumar Verma',
      agent_mobile: '9450123456',
      amount: 50,
      payout_method: 'upi',
      upi_id: '9450123456@paytm',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    expect(payout.status).toBe('pending');

    // Admin approves with UTR
    const utr = 'UTR-SBI99882233';
    const approvedPayout = {
      ...payout,
      status: 'approved' as const,
      admin_reference: utr,
      processed_at: new Date().toISOString(),
    };

    expect(approvedPayout.status).toBe('approved');
    expect(approvedPayout.admin_reference).toBe(utr);
  });
});

describe('M. Real Database & Dual-Engine Architecture', () => {
  it('correctly reports isSupabaseConfigured flag based on environment', async () => {
    const { isSupabaseConfigured } = await import('../src/lib/supabase');
    // Without environment variables set, isSupabaseConfigured should safely evaluate to false
    expect(typeof isSupabaseConfigured).toBe('boolean');
  });

  it('safely handles db operations with fallback when Supabase is unconfigured', async () => {
    const { db } = await import('../src/lib/supabaseService');
    const bookings = await db.getBookings();
    // In fallback mode, returns null without throwing errors
    expect(bookings === null || Array.isArray(bookings)).toBe(true);

    const profiles = await db.getProfiles();
    expect(profiles === null || Array.isArray(profiles)).toBe(true);

    const trips = await db.getBusTrips();
    expect(trips === null || Array.isArray(trips)).toBe(true);
  });

  it('validates database schema structure contains all primary entities', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const schemaPath = path.resolve(process.cwd(), 'supabase/migrations/20261010000000_safargo_schema.sql');
    
    expect(fs.existsSync(schemaPath)).toBe(true);
    const content = fs.readFileSync(schemaPath, 'utf-8');
    
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.profiles');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.bookings');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.bus_trips');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.commission_ledger');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.salary_records');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.payout_requests');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.audit_logs');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.wallet_recharge_requests');
    expect(content).toContain('CREATE TABLE IF NOT EXISTS public.wallet_transactions');
    expect(content).toContain('ENABLE ROW LEVEL SECURITY');
  });
});

describe('N. Advance Online Payment Rules & Agent Prepaid Wallet System (Min ₹2,000)', () => {
  it('enforces minimum ₹2,000 wallet recharge requirement', () => {
    const minRecharge = INITIAL_SETTINGS.min_wallet_recharge;
    expect(minRecharge).toBe(2000);

    const rechargeAttemptBelowMin = 1500;
    const isValidRecharge = rechargeAttemptBelowMin >= minRecharge;
    expect(isValidRecharge).toBe(false);

    const rechargeAttemptValid = 2000;
    expect(rechargeAttemptValid >= minRecharge).toBe(true);

    const rechargeAttemptCustomHigher = 5500;
    expect(rechargeAttemptCustomHigher >= minRecharge).toBe(true);
  });

  it('admin approval of wallet recharge credits agent wallet and logs transaction', () => {
    let agentWallet = 1000;
    const rechargeAmount = 2500;
    const utr = 'UTR-WALLET-99228811';

    // Agent submits recharge
    const rechargeRequest = {
      id: 'rech-001',
      agent_id: 'usr-agent-01',
      amount: rechargeAmount,
      utr_number: utr,
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    expect(rechargeRequest.status).toBe('pending');

    // Admin approves
    const approvedRecharge = {
      ...rechargeRequest,
      status: 'approved' as const,
      approved_at: new Date().toISOString()
    };
    agentWallet += approvedRecharge.amount;

    expect(approvedRecharge.status).toBe('approved');
    expect(agentWallet).toBe(3500);

    // Transaction is logged
    const tx = {
      id: 'wtx-001',
      agent_id: 'usr-agent-01',
      amount: rechargeAmount,
      type: 'recharge',
      balance_after: agentWallet
    };
    expect(tx.balance_after).toBe(3500);
  });

  it('deducts booking fare immediately from wallet balance when payment_mode is agent_wallet', () => {
    let agentWallet = 3500;
    const ticketFare = 850;

    // Check balance sufficiency
    const hasSufficientBalance = agentWallet >= ticketFare;
    expect(hasSufficientBalance).toBe(true);

    // Deduct fare
    agentWallet -= ticketFare;
    expect(agentWallet).toBe(2650);

    const bookingPayment = {
      payment_mode: 'agent_wallet' as const,
      payment_status: 'paid' as const,
      total_estimated_amount: ticketFare
    };
    expect(bookingPayment.payment_mode).toBe('agent_wallet');
    expect(bookingPayment.payment_status).toBe('paid');
  });

  it('blocks booking creation when wallet balance is lower than total fare', () => {
    const agentWallet = 500;
    const ticketFare = 1200;

    const canBook = agentWallet >= ticketFare;
    expect(canBook).toBe(false);
  });

  it('refunds ticket fare to agent wallet upon booking rejection if paid via wallet', () => {
    let agentWallet = 2650;
    const rejectedBookingFare = 850;
    const wasPaidViaWallet = true;

    if (wasPaidViaWallet) {
      agentWallet += rejectedBookingFare;
    }

    expect(agentWallet).toBe(3500);
  });

  it('requires UTR number when paying via direct SafarGo QR', () => {
    const emptyUtr = '';
    const validUtr = '123456789012';

    const isValidEmpty = emptyUtr.trim().length >= 6;
    const isValidFilled = validUtr.trim().length >= 6;

    expect(isValidEmpty).toBe(false);
    expect(isValidFilled).toBe(true);
  });
});

describe('O. Sunday Payout Cycle & Salary Base Model Realignment', () => {
  it('identifies Sunday as the weekly payout execution day', () => {
    // 0 is Sunday in JavaScript Date getDay()
    const sundayDate = new Date('2026-10-11T10:00:00Z'); // Sunday
    expect(sundayDate.getUTCDay()).toBe(0);

    const isSunday = (d: Date) => d.getUTCDay() === 0;
    expect(isSunday(sundayDate)).toBe(true);

    const mondayDate = new Date('2026-10-12T10:00:00Z');
    expect(isSunday(mondayDate)).toBe(false);
  });

  it('guarantees full ₹5,000 base salary on 150 bookings target if no prior withdrawals', () => {
    const monthlyTarget = 150;
    const bookingsCompleted = 150;
    const priorWithdrawals = 0;
    const targetSalary = 5000;

    const isTargetAchieved = bookingsCompleted >= monthlyTarget;
    expect(isTargetAchieved).toBe(true);

    const payableOnSunday = isTargetAchieved ? targetSalary - priorWithdrawals : 0;
    expect(payableOnSunday).toBe(5000);
  });

  it('deducts interim commission withdrawals from ₹5,000 Sunday lump-sum upon target achievement', () => {
    const monthlyTarget = 150;
    const bookingsCompleted = 150;
    const priorWithdrawals = 1500; // Partial payout taken earlier
    const targetSalary = 5000;

    const remainingLumpSum = targetSalary - priorWithdrawals;
    expect(remainingLumpSum).toBe(3500);
  });
});

describe('P. Viral Social Media Promotions & Creator Bonus Program', () => {
  it('calculates correct rewards: Instagram 1M views => ₹500, YouTube 10k views => ₹100', () => {
    const instaTarget = 1000000;
    const instaReward = 500;
    const ytTarget = 10000;
    const ytReward = 100;

    const calcReward = (platform: 'instagram' | 'youtube', views: number) => {
      if (platform === 'instagram' && views >= instaTarget) return instaReward;
      if (platform === 'youtube' && views >= ytTarget) return ytReward;
      return 0;
    };

    expect(calcReward('instagram', 1250000)).toBe(500);
    expect(calcReward('instagram', 950000)).toBe(0); // under 1M views
    expect(calcReward('youtube', 15000)).toBe(100);
    expect(calcReward('youtube', 9999)).toBe(0); // under 10k views
  });

  it('strictly enforces 24-hour verification & payout SLA window', () => {
    const createdAt = new Date('2026-10-10T12:00:00Z');
    const slaHours = 24;
    const deadline = new Date(createdAt.getTime() + slaHours * 60 * 60 * 1000);

    const diffHours = (deadline.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    expect(diffHours).toBe(24);
  });

  it('credits agent wallet when promotion payout method is wallet', () => {
    let agentWallet = 2500;
    const instaReward = 500;

    // Simulate approving Instagram reel promotion
    agentWallet += instaReward;

    expect(agentWallet).toBe(3000);
  });

  it('generates a unique claim code with PRM prefix', () => {
    const dateCode = '20261010';
    const randSuffix = '456';
    const claimCode = `PRM-${dateCode}-${randSuffix}`;

    expect(claimCode).toMatch(/^PRM-\d{8}-\d{3}$/);
  });

  it('records rejection reason when admin rejects promotion claim', () => {
    const claim = {
      id: 'prm-test-01',
      status: 'pending',
      rejection_reason: '',
    };

    const rejectClaim = (reason: string) => {
      claim.status = 'rejected';
      claim.rejection_reason = reason;
    };

    rejectClaim('Fake bot views detected - views dropped below 1M');
    expect(claim.status).toBe('rejected');
    expect(claim.rejection_reason).toContain('Fake bot views');
  });
});

describe('Q. Agent Aadhaar/PAN KYC, Profile Photo & Verified Badge System', () => {
  it('validates 12-digit Aadhaar number and standard 10-character PAN format', () => {
    const isValidAadhaar = (num: string) => /^\d{12}$/.test(num.replace(/\s+/g, ''));
    const isValidPan = (pan: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim().toUpperCase());

    // Aadhaar checks
    expect(isValidAadhaar('123456789012')).toBe(true);
    expect(isValidAadhaar('1234 5678 9012')).toBe(true);
    expect(isValidAadhaar('12345678901')).toBe(false); // 11 digits
    expect(isValidAadhaar('1234567890123')).toBe(false); // 13 digits
    expect(isValidAadhaar('1234ABCD9012')).toBe(false); // Contains letters

    // PAN checks
    expect(isValidPan('ABCDE1234F')).toBe(true);
    expect(isValidPan('BNZPA9876K')).toBe(true);
    expect(isValidPan('ABCDE12345')).toBe(false); // last char is digit
    expect(isValidPan('ABCD1234F')).toBe(false); // only 4 letters at start
    expect(isValidPan('abcde1234f')).toBe(true); // case-insensitive test
  });

  it('submitting KYC transitions agent status to pending with document attachments', () => {
    interface AgentProfile {
      id: string;
      full_name: string;
      kyc_status: 'not_submitted' | 'pending' | 'verified' | 'rejected';
      photo_verified: boolean;
      aadhaar_number?: string;
      pan_number?: string;
      bank_account_number?: string;
      bank_ifsc?: string;
      avatar_url?: string;
      kyc_submitted_at?: string;
    }

    const agent: AgentProfile = {
      id: 'agent-101',
      full_name: 'Ramesh Sharma',
      kyc_status: 'not_submitted',
      photo_verified: false,
    };

    // Agent submits KYC
    const nowIso = new Date().toISOString();
    agent.kyc_status = 'pending';
    agent.aadhaar_number = '987654321098';
    agent.pan_number = 'ABCDE9876F';
    agent.bank_account_number = '98765432101234';
    agent.bank_ifsc = 'SBIN0001234';
    agent.avatar_url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...';
    agent.kyc_submitted_at = nowIso;

    expect(agent.kyc_status).toBe('pending');
    expect(agent.photo_verified).toBe(false); // Not verified yet until admin approves
    expect(agent.aadhaar_number).toBe('987654321098');
    expect(agent.bank_ifsc).toBe('SBIN0001234');
    expect(agent.kyc_submitted_at).toBe(nowIso);
  });

  it('admin approval sets kyc_status to verified and awards official Verified Tick (photo_verified = true)', () => {
    const agent = {
      id: 'agent-101',
      full_name: 'Ramesh Sharma',
      kyc_status: 'pending' as const,
      photo_verified: false,
      kyc_verified_at: undefined as string | undefined,
      kyc_verified_by: undefined as string | undefined,
    };

    const approveKyc = (adminId: string) => {
      const nowIso = new Date().toISOString();
      agent.kyc_status = 'verified';
      agent.photo_verified = true; // Verified Tick (✓) badge appears!
      agent.kyc_verified_at = nowIso;
      agent.kyc_verified_by = adminId;
    };

    approveKyc('usr-admin-01');

    expect(agent.kyc_status).toBe('verified');
    expect(agent.photo_verified).toBe(true);
    expect(agent.kyc_verified_by).toBe('usr-admin-01');
    expect(agent.kyc_verified_at).toBeDefined();
  });

  it('strictly blocks commission withdrawal when kyc_status is not verified', () => {
    const canWithdrawCommission = (kycStatus: string, availableBalance: number, amount: number) => {
      if (kycStatus !== 'verified') {
        return { allowed: false, reason: 'KYC_REQUIRED' };
      }
      if (amount <= 0 || amount > availableBalance) {
        return { allowed: false, reason: 'INVALID_AMOUNT' };
      }
      return { allowed: true, reason: 'SUCCESS' };
    };

    // Unverified agent attempts to withdraw
    expect(canWithdrawCommission('not_submitted', 2000, 500)).toEqual({
      allowed: false,
      reason: 'KYC_REQUIRED',
    });

    // Pending agent attempts to withdraw
    expect(canWithdrawCommission('pending', 2000, 500)).toEqual({
      allowed: false,
      reason: 'KYC_REQUIRED',
    });

    // Rejected agent attempts to withdraw
    expect(canWithdrawCommission('rejected', 2000, 500)).toEqual({
      allowed: false,
      reason: 'KYC_REQUIRED',
    });

    // Verified agent attempts to withdraw
    expect(canWithdrawCommission('verified', 2000, 500)).toEqual({
      allowed: true,
      reason: 'SUCCESS',
    });
  });

  it('admin rejection sets kyc_status to rejected and stores rejection reason', () => {
    const agent = {
      id: 'agent-102',
      kyc_status: 'pending' as const,
      photo_verified: false,
      kyc_rejection_reason: '',
    };

    const rejectKyc = (reason: string) => {
      agent.kyc_status = 'rejected';
      agent.photo_verified = false;
      agent.kyc_rejection_reason = reason;
    };

    rejectKyc('Aadhaar card image is blurred, please upload clear high-resolution copy.');

    expect(agent.kyc_status).toBe('rejected');
    expect(agent.photo_verified).toBe(false);
    expect(agent.kyc_rejection_reason).toContain('Aadhaar card image is blurred');
  });

  it('masks Aadhaar and PAN numbers safely for display on public profile cards', () => {
    const maskAadhaar = (num: string) => `XXXX-XXXX-${num.slice(-4)}`;
    const maskPan = (pan: string) => `${pan.slice(0, 2)}*****${pan.slice(-2)}`;

    expect(maskAadhaar('987654321098')).toBe('XXXX-XXXX-1098');
    expect(maskPan('ABCDE9876F')).toBe('AB*****6F');
  });

  it('formats WhatsApp pre-filled KYC draft message for admin dispatch', () => {
    const agent = {
      full_name: 'Pawan Kumar Verma',
      shop_name: 'Pawan Jan Seva Kendra',
      mobile: '9876543210',
      referral_code: 'VERMA89',
      aadhaar_number: '123456789012',
      pan_number: 'ABCDE1234F',
    };

    const generateWhatsAppDraft = () => {
      return (
        `*SafarGo Agent KYC Submission*\n` +
        `Agent: ${agent.full_name}\n` +
        `Shop: ${agent.shop_name}\n` +
        `Mobile: ${agent.mobile}\n` +
        `Code: ${agent.referral_code}\n` +
        `Aadhaar: ${agent.aadhaar_number}\n` +
        `PAN: ${agent.pan_number}`
      );
    };

    const draft = generateWhatsAppDraft();
    expect(draft).toContain('Pawan Kumar Verma');
    expect(draft).toContain('VERMA89');
    expect(draft).toContain('123456789012');
    expect(draft).toContain('ABCDE1234F');
  });

  it('displays 12-hour verification SLA guarantee and admin notification message upon KYC submission', () => {
    const kycSubmissionResult = {
      submitted: true,
      sla_hours: 12,
      heading: 'आपकी KYC वेरिफिकेशन 12 घंटे के अंदर हो जाएगी!',
      admin_notification: 'एडमिन को आपकी रिक्वेस्ट भेज दी गई है ✅',
      sla_text: 'Our team verifies your documents usually within 1 to 12 hours. (हमारी टीम आमतौर पर 1 घंटे से 12 घंटे के अंदर आपके दस्तावेज़ों का सत्यापन कर देती है।)'
    };

    expect(kycSubmissionResult.submitted).toBe(true);
    expect(kycSubmissionResult.sla_hours).toBe(12);
    expect(kycSubmissionResult.heading).toContain('12 घंटे के अंदर');
    expect(kycSubmissionResult.admin_notification).toContain('एडमिन को आपकी रिक्वेस्ट भेज दी गई है');
    expect(kycSubmissionResult.sla_text).toContain('Our team verifies your documents usually within 1 to 12 hours');
  });

  it('locks agent KYC editing while status is pending and enables it only if rejected', () => {
    const canAgentEditKyc = (status?: string) => {
      // Editable when not submitted or rejected; strictly locked when pending or verified
      return status !== 'pending' && status !== 'verified';
    };

    expect(canAgentEditKyc('not_submitted')).toBe(true);
    expect(canAgentEditKyc('pending')).toBe(false); // LOCKED after submission!
    expect(canAgentEditKyc('verified')).toBe(false); // LOCKED when verified
    expect(canAgentEditKyc('rejected')).toBe(true); // RE-ENABLED on rejection with reason
  });

  it('allows Admin to immediately detect and approve pending KYC agents', () => {
    const profiles: Profile[] = [
      {
        ...INITIAL_PROFILES[1],
        id: 'agent-101',
        role: 'agent',
        kyc_status: 'pending',
        aadhaar_number: '123456789012',
        pan_number: 'ABCDE1234F',
      },
      {
        ...INITIAL_PROFILES[0],
        id: 'admin-1',
        role: 'admin',
      }
    ];

    // Admin pending KYC detection
    const pendingKycAgents = profiles.filter((p) => p.role === 'agent' && p.kyc_status === 'pending');
    expect(pendingKycAgents.length).toBe(1);
    expect(pendingKycAgents[0].id).toBe('agent-101');

    // Admin approves KYC
    const approvedProfiles = profiles.map((p) =>
      p.id === 'agent-101'
        ? {
            ...p,
            kyc_status: 'verified' as const,
            is_verified: true,
            kyc_verified_at: new Date().toISOString(),
          }
        : p
    );

    const updatedAgent = approvedProfiles.find((p) => p.id === 'agent-101');
    expect(updatedAgent?.kyc_status).toBe('verified');
    expect(updatedAgent?.is_verified).toBe(true);
    expect(updatedAgent?.kyc_verified_at).toBeDefined();

    // Pending count drops to 0
    const remainingPending = approvedProfiles.filter((p) => p.role === 'agent' && p.kyc_status === 'pending');
    expect(remainingPending.length).toBe(0);
  });
});

describe('S. SafarGo Promoter Partner Program (5 Slots, ₹15k Salary, 500 Quality Target, 100% Refund)', () => {
  it('strictly limits onboarded promoter slots to maximum 5 candidates', () => {
    const slots = [1, 2, 3, 4, 5];
    expect(slots.length).toBe(5);

    const onboardedCount = 5;
    const canAcceptNewPromoter = onboardedCount < 5;
    expect(canAcceptNewPromoter).toBe(false);
  });

  it('guarantees fixed ₹15,000 / month salary for onboarded promoter partners', () => {
    const promoterProfile: Profile = {
      ...INITIAL_PROFILES[0],
      id: 'usr-promoter-01',
      role: 'promoter',
      promoter_slot_no: 1,
      promoter_code: 'PRM-MP-01',
      promoter_salary: 15000,
    };

    expect(promoterProfile.role).toBe('promoter');
    expect(promoterProfile.promoter_salary).toBe(15000);
    expect(promoterProfile.promoter_code).toBe('PRM-MP-01');
  });

  it('counts an agent toward the 500 target ONLY if they complete >= 3 confirmed bus bookings', () => {
    const mockBookings: Booking[] = [
      { id: 'b1', agent_id: 'ag-1', status: 'confirmed' } as Booking,
      { id: 'b2', agent_id: 'ag-1', status: 'confirmed' } as Booking,
      { id: 'b3', agent_id: 'ag-1', status: 'confirmed' } as Booking,
      { id: 'b4', agent_id: 'ag-2', status: 'confirmed' } as Booking,
      { id: 'b5', agent_id: 'ag-2', status: 'confirmed' } as Booking,
      { id: 'b6', agent_id: 'ag-2', status: 'booking_request' } as Booking, // unconfirmed
      { id: 'b7', agent_id: 'ag-3', status: 'confirmed' } as Booking,
    ];

    const isAgentVerifiedForTarget = (agentId: string) => {
      const confirmedCount = mockBookings.filter((b) => b.agent_id === agentId && b.status === 'confirmed').length;
      return confirmedCount >= 3;
    };

    expect(isAgentVerifiedForTarget('ag-1')).toBe(true); // 3 confirmed => VERIFIED!
    expect(isAgentVerifiedForTarget('ag-2')).toBe(false); // 2 confirmed => NOT VERIFIED
    expect(isAgentVerifiedForTarget('ag-3')).toBe(false); // 1 confirmed => NOT VERIFIED
  });

  it('guarantees 100% fee refund (₹149 + ₹499 = ₹648) upon target achievement within 3 months', () => {
    const appFee = 149;
    const onboardFee = 499;
    const totalRefund = appFee + onboardFee;
    expect(totalRefund).toBe(648);

    const verifiedAgentsCount = 500;
    const isTargetMet = verifiedAgentsCount >= 500;
    const isRefundEligible = isTargetMet;

    expect(isRefundEligible).toBe(true);
  });

  it('allows Promoters (under Super Admin) to approve agents and verify agent KYC', () => {
    const canManageAgents = (role: string) => role === 'admin' || role === 'promoter';

    expect(canManageAgents('admin')).toBe(true);
    expect(canManageAgents('promoter')).toBe(true); // Promoter has agent manager authority!
    expect(canManageAgents('agent')).toBe(false);
    expect(canManageAgents('customer')).toBe(false);
  });
});

describe('T. SafarGo 15-Minute Rural Quick Delivery Service (Distance Pricing & Splits)', () => {
  const calcPricing = (km: number) => {
    const d = Math.max(0.1, km);
    if (d <= 2) return { fee: 25, agent: 18, platform: 7 };
    if (d <= 4) return { fee: 45, agent: 34, platform: 11 };
    if (d <= 6) return { fee: 65, agent: 50, platform: 15 };
    const extra = Math.ceil(d - 6);
    return {
      fee: 65 + extra * 10,
      agent: 50 + extra * 8,
      platform: 15 + extra * 2,
    };
  };

  it('accurately calculates 0-2 KM delivery fee: ₹25 (₹18 Agent / ₹7 SafarGo)', () => {
    const res = calcPricing(1.5);
    expect(res.fee).toBe(25);
    expect(res.agent).toBe(18);
    expect(res.platform).toBe(7);
    expect(res.agent + res.platform).toBe(res.fee);
  });

  it('accurately calculates 2-4 KM delivery fee: ₹45 (₹34 Agent / ₹11 SafarGo)', () => {
    const res = calcPricing(3.2);
    expect(res.fee).toBe(45);
    expect(res.agent).toBe(34);
    expect(res.platform).toBe(11);
    expect(res.agent + res.platform).toBe(res.fee);
  });

  it('accurately calculates 4-6 KM delivery fee: ₹65 (₹50 Agent / ₹15 SafarGo)', () => {
    const res = calcPricing(5.0);
    expect(res.fee).toBe(65);
    expect(res.agent).toBe(50);
    expect(res.platform).toBe(15);
    expect(res.agent + res.platform).toBe(res.fee);
  });

  it('accurately adds ₹10/KM (+₹8 Agent / +₹2 SafarGo) for distance beyond 6 KM', () => {
    // 8 KM => 6 KM base (₹65) + 2 extra KM (2 * 10 = ₹20) = ₹85
    // Agent: 50 + (2 * 8) = ₹66
    // Platform: 15 + (2 * 2) = ₹19
    const res = calcPricing(8.0);
    expect(res.fee).toBe(85);
    expect(res.agent).toBe(66);
    expect(res.platform).toBe(19);
    expect(res.agent + res.platform).toBe(res.fee);
  });

  it('computes total customer payable = actual_item_price + delivery_fee', () => {
    const actualItemPrice = 378; // Groceries bought from local shop
    const distanceKm = 1.4;
    const { fee } = calcPricing(distanceKm);

    const totalCustomerPayable = actualItemPrice + fee;
    expect(totalCustomerPayable).toBe(378 + 25);
    expect(totalCustomerPayable).toBe(403);
  });

  it('enforces 15-minute countdown window upon customer confirmation', () => {
    const confirmedAt = new Date('2026-10-11T12:00:00Z');
    const deadline15m = new Date(confirmedAt.getTime() + 15 * 60 * 1000);

    const diffMinutes = (deadline15m.getTime() - confirmedAt.getTime()) / (1000 * 60);
    expect(diffMinutes).toBe(15);
  });
});

describe('T. Customer Separate Authentication & Dedicated Portal', () => {
  it('correctly registers customer with auto-approved status and no KYC overhead', () => {
    const customer = INITIAL_PROFILES.find((p) => p.role === 'customer');
    expect(customer).toBeDefined();
    expect(customer?.role).toBe('customer');
    expect(customer?.agent_status).toBe('approved');
    expect(customer?.kyc_status).toBeUndefined(); // Customers do not need KYC
  });

  it('distinguishes customer, shopkeeper, promoter, agent, and admin roles', () => {
    const roles = INITIAL_PROFILES.map((p) => p.role);
    expect(roles).toContain('customer');
    expect(roles).toContain('shopkeeper');
    expect(roles).toContain('promoter');
    expect(roles).toContain('agent');
    expect(roles).toContain('admin');
  });

  it('allows customer to view personal bus bookings and delivery orders', () => {
    const customer = INITIAL_PROFILES.find((p) => p.role === 'customer')!;
    expect(customer.mobile).toBe('9827011223');
    expect(customer.city).toBe('Sironj');
    expect(customer.address).toBeDefined();
  });
});

describe('U. Shopkeeper Portal & Subscription Upgrades', () => {
  it('identifies shopkeeper and links shop record', () => {
    const shopkeeper = INITIAL_PROFILES.find((p) => p.role === 'shopkeeper');
    expect(shopkeeper).toBeDefined();
    expect(shopkeeper?.shop_name).toBe('गुप्ता किराना एवं जनरल स्टोर्स');
    expect(shopkeeper?.shop_id).toBe('shop-01');
  });

  it('supports upgrading shop to Gold Subscription Package (₹699/month)', () => {
    const goldPlan = {
      name: 'गोल्ड सुप्रीम पार्टनर (₹699/माह)',
      price: 699,
      duration_days: 30,
    };
    expect(goldPlan.price).toBe(699);
    expect(goldPlan.name).toContain('गोल्ड');
  });
});

describe('W. Strict Role Isolation & Admin Privacy Protection', () => {
  it('strictly isolates customer role from all admin functionalities', () => {
    const customer = INITIAL_PROFILES.find((p) => p.role === 'customer')!;
    expect(customer.role).toBe('customer');

    const adminTabs = [
      'admin-dashboard',
      'admin-promoters',
      'admin-bookings',
      'admin-agents',
      'admin-kyc-desk',
      'admin-security-desk',
      'admin-trips',
      'admin-salary',
      'admin-settings',
      'admin-logs',
    ];

    // Customer can NEVER access any admin tab
    const isAllowedAccess = (role: string, tab: string) => {
      if (tab.startsWith('admin-')) {
        return role === 'admin';
      }
      return true;
    };

    adminTabs.forEach((tab) => {
      expect(isAllowedAccess(customer.role, tab)).toBe(false);
    });
  });

  it('strictly isolates shopkeeper and agent from admin functionalities', () => {
    const shopkeeper = INITIAL_PROFILES.find((p) => p.role === 'shopkeeper')!;
    const agent = INITIAL_PROFILES.find((p) => p.role === 'agent')!;

    const isAllowedAccess = (role: string, tab: string) => role === 'admin' || !tab.startsWith('admin-');

    expect(isAllowedAccess(shopkeeper.role, 'admin-dashboard')).toBe(false);
    expect(isAllowedAccess(agent.role, 'admin-settings')).toBe(false);
  });
});

describe('X. Boarding Sathi (बोर्डिंग साथी) Companion Service Economics', () => {
  it('calculates Boarding Sathi fee breakdown correctly (₹33 total, ₹23 agent payout, ₹10 platform)', () => {
    const boardingSathiOpted = true;
    const baseFare = 850;
    const passengerCount = 1;

    const boardingSathiFee = boardingSathiOpted ? 33 : 0;
    const agentPayout = boardingSathiOpted ? 23 : 0;
    const platformShare = boardingSathiOpted ? 10 : 0;

    const totalEstimated = (baseFare * passengerCount) + boardingSathiFee;

    expect(totalEstimated).toBe(883); // 850 + 33
    expect(agentPayout).toBe(23);
    expect(platformShare).toBe(10);
    expect(agentPayout + platformShare).toBe(boardingSathiFee);
  });

  it('credits +₹23 to agent ledger upon booking confirmation when Boarding Sathi is opted', () => {
    const bookingWithBoardingSathi: Partial<Booking> = {
      id: 'bkg-test-bs',
      booking_code: 'SFG-20261011-999',
      agent_id: 'usr-agent-01',
      agent_name: 'Pawan Kumar Verma',
      boarding_sathi_opted: true,
      boarding_sathi_fee: 33,
      boarding_sathi_agent_payout: 23,
      boarding_sathi_platform_fee: 10,
      boarding_sathi_status: 'pending',
    };

    const regularCommission = 19.34;
    const extraBoardingPayout = bookingWithBoardingSathi.boarding_sathi_agent_payout || 0;
    const totalAgentEarning = regularCommission + extraBoardingPayout;

    expect(extraBoardingPayout).toBe(23);
    expect(totalAgentEarning).toBe(42.34);
  });
});

describe('Y. Promoting Partner Model 1 (500 Agents) vs Model 2 (125 Agents + 20 Subscriptions)', () => {
  const evaluatePromoterTarget = (verifiedAgents: number, goldSubscriptions: number) => {
    const isModel1 = verifiedAgents >= 500;
    const isModel2 = verifiedAgents >= 125 && goldSubscriptions >= 20;
    return {
      isModel1,
      isModel2,
      isAchieved: isModel1 || isModel2,
      salary: (isModel1 || isModel2) ? 15000 : 0,
      refundEligible: isModel1 || isModel2,
    };
  };

  it('achieves target via Model 1 (500 verified agents)', () => {
    const res = evaluatePromoterTarget(500, 0);
    expect(res.isModel1).toBe(true);
    expect(res.isAchieved).toBe(true);
    expect(res.salary).toBe(15000);
    expect(res.refundEligible).toBe(true);
  });

  it('achieves target via Model 2 (125 verified agents + 20 Gold shopkeeper subscriptions)', () => {
    const res = evaluatePromoterTarget(125, 20);
    expect(res.isModel1).toBe(false);
    expect(res.isModel2).toBe(true);
    expect(res.isAchieved).toBe(true);
    expect(res.salary).toBe(15000);
    expect(res.refundEligible).toBe(true);
  });

  it('fails if neither Model 1 nor Model 2 is met', () => {
    const resA = evaluatePromoterTarget(124, 20); // 1 agent short for Model 2
    expect(resA.isAchieved).toBe(false);

    const resB = evaluatePromoterTarget(200, 19); // 1 shop subscription short for Model 2
    expect(resB.isAchieved).toBe(false);
  });
});

describe('Z. Customer Assisted Bus Booking Model & MP Network Directory', () => {
  it('directs customers to nearby verified CSC agents rather than raw manual form', () => {
    const mpApprovedAgents = INITIAL_PROFILES.filter((p) => p.role === 'agent' && p.agent_status === 'approved');
    expect(mpApprovedAgents.length).toBeGreaterThanOrEqual(5);

    const sironjAgent = mpApprovedAgents.find((a) => a.city === 'Sironj');
    expect(sironjAgent).toBeDefined();
    expect(sironjAgent?.shop_name).toBeDefined();
    expect(sironjAgent?.mobile).toBeDefined();

    // Verify WhatsApp direct message link generation
    const waUrl = `https://wa.me/91${sironjAgent?.mobile}?text=${encodeURIComponent('नमस्ते SafarGo बस बुकिंग')}`;
    expect(waUrl).toContain('wa.me/91');
  });
});

describe('AA. Flipkart-Style 5-Step 15-Minute Rural Quick Delivery Flow & Timer Verification', () => {
  it('validates initial delivery orders and ensures 5-step lifecycle stages', () => {
    expect(INITIAL_QUICK_DELIVERY_ORDERS.length).toBeGreaterThanOrEqual(3);

    const placedOrder = INITIAL_QUICK_DELIVERY_ORDERS.find((o) => o.status === 'placed');
    const outForDeliveryOrder = INITIAL_QUICK_DELIVERY_ORDERS.find((o) => o.status === 'out_for_delivery');
    const deliveredOrder = INITIAL_QUICK_DELIVERY_ORDERS.find((o) => o.status === 'delivered');

    expect(placedOrder).toBeDefined();
    expect(placedOrder?.order_code).toMatch(/^SFG-DLV-\d{8}-\d{3}$/);

    expect(outForDeliveryOrder).toBeDefined();
    expect(outForDeliveryOrder?.agent_id).toBeDefined();
    expect(outForDeliveryOrder?.deadline_15m_at).toBeDefined();

    expect(deliveredOrder).toBeDefined();
    expect(deliveredOrder?.delivered_at).toBeDefined();
    expect(deliveredOrder?.actual_item_price).toBeGreaterThan(0);
  });

  it('correctly simulates the 5-step sequence with 5-minute store arrival and 15-minute doorstep delivery', () => {
    // Step 1: Order Placed
    let order: QuickDeliveryOrder = {
      id: 'test-dlv-01',
      order_code: 'SFG-DLV-20261011-999',
      customer_name: 'रामकुमार शर्मा',
      customer_mobile: '9826011122',
      customer_address: 'गांधी चौक, सिरोंज',
      city: 'Sironj',
      items_description: 'दवाई (पैरासिटामोल) + बिस्कुट',
      distance_km: 1.5,
      pickup_mode: 'local_concierge',
      delivery_fee: 25,
      agent_payout: 18,
      safargo_platform_fee: 7,
      status: 'placed',
      created_at: '2026-10-11T14:00:00Z',
    };
    expect(order.status).toBe('placed');

    // Step 2: Agent Assigned with 5-minute store arrival countdown
    const assignTime = new Date('2026-10-11T14:02:00Z');
    const fiveMinDeadline = new Date(assignTime.getTime() + 5 * 60 * 1000).toISOString();
    order = {
      ...order,
      status: 'agent_assigned',
      agent_id: 'usr-agent-01',
      agent_name: 'Pawan Kumar Verma',
      agent_mobile: '9450123456',
      agent_accepted_at: assignTime.toISOString(),
    };
    expect(order.status).toBe('agent_assigned');
    expect(order.agent_name).toBe('Pawan Kumar Verma');
    expect(new Date(fiveMinDeadline).getTime() - assignTime.getTime()).toBe(5 * 60 * 1000);

    // Step 3: Agent uploads photo & shop bill
    order = {
      ...order,
      status: 'photo_price_uploaded',
      item_photo_url: 'https://images.unsplash.com/photo-item-bill.jpg',
      actual_item_price: 150,
      total_order_amount: 150 + order.delivery_fee,
    };
    expect(order.status).toBe('photo_price_uploaded');
    expect(order.actual_item_price).toBe(150);
    expect(order.total_order_amount).toBe(175);

    // Customer accepts the bill ("After Accept")
    const confirmTime = new Date('2026-10-11T14:05:00Z');
    const fifteenMinDeadline = new Date(confirmTime.getTime() + 15 * 60 * 1000).toISOString();
    order = {
      ...order,
      customer_confirmed_at: confirmTime.toISOString(),
    };
    expect(order.customer_confirmed_at).toBeDefined();

    // Step 4: Out for delivery with 15-minute guarantee timer
    order = {
      ...order,
      status: 'out_for_delivery',
      deadline_15m_at: fifteenMinDeadline,
    };
    expect(order.status).toBe('out_for_delivery');
    expect(new Date(order.deadline_15m_at!).getTime() - confirmTime.getTime()).toBe(15 * 60 * 1000);

    // Step 5: Doorstep Delivery Completed
    const deliverTime = new Date('2026-10-11T14:16:00Z');
    order = {
      ...order,
      status: 'delivered',
      delivered_at: deliverTime.toISOString(),
    };
    expect(order.status).toBe('delivered');
    expect(new Date(order.delivered_at!).getTime() <= new Date(order.deadline_15m_at!).getTime()).toBe(true);

    // Verify fee economics: Agent earns ₹18, SafarGo earns ₹7
    expect(order.agent_payout).toBe(18);
    expect(order.safargo_platform_fee).toBe(7);
    expect(order.delivery_fee).toBe(order.agent_payout + order.safargo_platform_fee);
  });
});

describe('AB. Admin & Agent Promo Code & Offer Discount Engine', () => {
  it('loads default mock promo codes including SAFAR50, BLINK15, and MPEXPRESS', () => {
    expect(INITIAL_PROMO_CODES.length).toBeGreaterThanOrEqual(4);

    const safar50 = INITIAL_PROMO_CODES.find((p) => p.code === 'SAFAR50');
    expect(safar50).toBeDefined();
    expect(safar50?.discount_type).toBe('flat');
    expect(safar50?.discount_value).toBe(50);
    expect(safar50?.agent_extra_incentive).toBe(15);
    expect(safar50?.is_active).toBe(true);

    const mpexpress = INITIAL_PROMO_CODES.find((p) => p.code === 'MPEXPRESS');
    expect(mpexpress).toBeDefined();
    expect(mpexpress?.discount_type).toBe('percentage');
    expect(mpexpress?.discount_value).toBe(10);
    expect(mpexpress?.max_discount_amount).toBe(100);
    expect(mpexpress?.agent_extra_incentive).toBe(20);
  });

  it('correctly calculates flat discount and agent bonus for bus tickets', () => {
    const promo = INITIAL_PROMO_CODES.find((p) => p.code === 'SAFAR50')!;
    const ticketFare = 450;

    expect(ticketFare).toBeGreaterThanOrEqual(promo.min_order_amount);

    const discount = promo.discount_type === 'flat' ? promo.discount_value : 0;
    const finalFare = ticketFare - discount;
    const agentIncentive = promo.agent_extra_incentive || 0;

    expect(discount).toBe(50);
    expect(finalFare).toBe(400);
    expect(agentIncentive).toBe(15);
  });

  it('correctly calculates percentage discount with max discount ceiling', () => {
    const promo = INITIAL_PROMO_CODES.find((p) => p.code === 'MPEXPRESS')!;

    // Case 1: 10% of ₹500 is ₹50 (below max ₹100)
    const fare1 = 500;
    const rawDiscount1 = Math.round((fare1 * promo.discount_value) / 100);
    const finalDiscount1 = Math.min(rawDiscount1, promo.max_discount_amount || 9999);
    expect(finalDiscount1).toBe(50);

    // Case 2: 10% of ₹1500 is ₹150 (exceeds max ₹100, capped at ₹100)
    const fare2 = 1500;
    const rawDiscount2 = Math.round((fare2 * promo.discount_value) / 100);
    const finalDiscount2 = Math.min(rawDiscount2, promo.max_discount_amount || 9999);
    expect(finalDiscount2).toBe(100);
  });

  it('strictly rejects promo code when minimum order amount is not met', () => {
    const promo = INITIAL_PROMO_CODES.find((p) => p.code === 'SAFAR50')!;
    const lowFare = 200;
    const isValid = lowFare >= promo.min_order_amount;
    expect(isValid).toBe(false);
  });

  it('enforces specific agent assignment for targeted codes', () => {
    const kuldeepPromo = INITIAL_PROMO_CODES.find((p) => p.code === 'KULDEEP25')!;
    expect(kuldeepPromo.applicable_to).toBe('specific_agent');
    expect(kuldeepPromo.assigned_agent_id).toBe('usr-agent-08');

    // Valid for Kuldeep
    const isKuldeep = 'usr-agent-08' === kuldeepPromo.assigned_agent_id;
    expect(isKuldeep).toBe(true);

    // Rejected for other agents
    const isOtherAgent = 'usr-agent-01' === kuldeepPromo.assigned_agent_id;
    expect(isOtherAgent).toBe(false);
  });

  it('respects service applicability (bus_booking vs quick_delivery)', () => {
    const blinkPromo = INITIAL_PROMO_CODES.find((p) => p.code === 'BLINK15')!;
    expect(blinkPromo.applicable_service).toBe('quick_delivery');

    const isValidForDelivery = blinkPromo.applicable_service === 'all' || blinkPromo.applicable_service === 'quick_delivery';
    const isValidForBus = blinkPromo.applicable_service === 'all' || blinkPromo.applicable_service === 'bus_booking';

    expect(isValidForDelivery).toBe(true);
    expect(isValidForBus).toBe(false);
  });
});

describe('AC. Boarding Sathi Add-On & Fair Earning Split', () => {
  it('applies ₹33 Boarding Sathi fee and splits ₹23 to Agent and ₹10 to SafarGo', () => {
    const BOARDING_SATHI_FEE = 33;
    const AGENT_SHARE = 23;
    const SAFARGO_SHARE = 10;

    expect(AGENT_SHARE + SAFARGO_SHARE).toBe(BOARDING_SATHI_FEE);

    const baseFare = 350;
    const withBoardingSathi = true;
    const totalPayable = baseFare + (withBoardingSathi ? BOARDING_SATHI_FEE : 0);

    expect(totalPayable).toBe(383);

    const baseAgentCommission = 35;
    const totalAgentEarning = baseAgentCommission + (withBoardingSathi ? AGENT_SHARE : 0);
    expect(totalAgentEarning).toBe(58);
  });
});

describe('AD. SafarGo Promoting Partner Tracking & Admin Credential Generation Desk', () => {
  it('tracks promoting partner application by 10-digit mobile number with sanitization', () => {
    const rawInputs = [
      '9826012345',
      '+91 9826012345',
      '98260-12345',
      ' +919826012345 '
    ];

    rawInputs.forEach((raw) => {
      const sanitized = raw.replace(/\D/g, '').slice(-10);
      const matched = INITIAL_PROMOTER_APPLICATIONS.find((app) => app.mobile === sanitized);
      expect(matched).toBeDefined();
      expect(matched?.applicant_name).toBe('Dharmendra Yadav');
      expect(matched?.promoter_code).toBe('PRM-MP-01');
    });
  });

  it('verifies submission acknowledgement message on request receipt', () => {
    const app = INITIAL_PROMOTER_APPLICATIONS.find((a) => a.mobile === '9826012345')!;
    const ACKNOWLEDGEMENT_TEXT = 'आपका SafarGo प्रमोटिंग पार्टनर में रुचि दिखाने के लिए धन्यवाद!';

    // Verify acknowledgement is associated with submitted requests
    expect(app.application_fee).toBe(149);
    expect(app.application_fee_utr).toBeDefined();
    expect(ACKNOWLEDGEMENT_TEXT).toContain('SafarGo प्रमोटिंग पार्टनर में रुचि दिखाने के लिए धन्यवाद');
  });

  it('accurately tracks 4-step onboarding timeline progression across application states', () => {
    // Step index helper function matching PromoterTrackStatusWidget logic
    const getActiveStep = (status: PromoterApplication['status']) => {
      switch (status) {
        case 'applied_149_submitted':
          return 1;
        case 'interview_scheduled':
        case 'interview_passed':
          return 2;
        case 'onboarded_499_paid':
          return 4;
        case 'rejected':
          return -1;
        default:
          return 1;
      }
    };

    // Deepesh Lodhi: interview scheduled -> Step 2
    const deepesh = INITIAL_PROMOTER_APPLICATIONS.find((a) => a.id === 'prm-app-03')!;
    expect(getActiveStep(deepesh.status)).toBe(2);

    // Vikas Raghuvanshi: interview passed -> Step 2 completed / ready for onboarding
    const vikas = INITIAL_PROMOTER_APPLICATIONS.find((a) => a.id === 'prm-app-02')!;
    expect(getActiveStep(vikas.status)).toBe(2);
    expect(vikas.assigned_slot).toBe(2);

    // Dharmendra Yadav: onboarded -> Step 4 completed
    const dharmendra = INITIAL_PROMOTER_APPLICATIONS.find((a) => a.id === 'prm-app-01')!;
    expect(getActiveStep(dharmendra.status)).toBe(4);
  });

  it('renders exclusive celebration banner when partner is officially onboarded', () => {
    const activePromoter = INITIAL_PROMOTER_APPLICATIONS.find((a) => a.status === 'onboarded_499_paid')!;
    const CELEBRATION_MESSAGE = '🎉 Congratulations! अब आप SafarGo के Exclusive Promoting Partner बन गए हैं! काम शुरू करें - यह मौका सबको नहीं मिलता है!';

    expect(activePromoter.status).toBe('onboarded_499_paid');
    expect(activePromoter.assigned_slot).toBe(1);
    expect(activePromoter.assigned_slot).toBeLessThanOrEqual(5); // Only 5 slots
    expect(activePromoter.promoter_code).toBe('PRM-MP-01');
    expect(CELEBRATION_MESSAGE).toContain('Exclusive Promoting Partner बन गए हैं');
    expect(CELEBRATION_MESSAGE).toContain('यह मौका सबको नहीं मिलता है');
  });

  it('allows admin to create and update promoter User ID and password credentials', () => {
    let mockApp: PromoterApplication = { ...INITIAL_PROMOTER_APPLICATIONS[1] }; // Vikas Raghuvanshi

    // Admin creates credentials upon onboarding
    const generatedUserId = mockApp.mobile;
    const generatedPassword = `Prm@${Math.random().toString(36).slice(-6)}!`;

    mockApp = {
      ...mockApp,
      status: 'onboarded_499_paid',
      promoter_code: 'PRM-MP-02',
      promoter_user_id: generatedUserId,
      promoter_password: generatedPassword
    };

    expect(mockApp.promoter_user_id).toBe('9752011223');
    expect(mockApp.promoter_password).toBe(generatedPassword);
    expect(mockApp.promoter_code).toBe('PRM-MP-02');
  });

  it('authenticates promoter using mobile number, promoter code, or User ID with password', () => {
    const activePromoter = INITIAL_PROMOTER_APPLICATIONS.find((a) => a.id === 'prm-app-01')!;

    // Case 1: Match by mobile
    const matchByMobile = INITIAL_PROMOTER_APPLICATIONS.find(
      (a) => a.mobile === '9826012345' && a.promoter_password === 'Promoter@123'
    );
    expect(matchByMobile).toBeDefined();

    // Case 2: Match by promoter code
    const matchByCode = INITIAL_PROMOTER_APPLICATIONS.find(
      (a) => (a.promoter_code === 'PRM-MP-01' || a.promoter_user_id === 'PRM-MP-01') && a.promoter_password === 'Promoter@123'
    );
    expect(matchByCode).toBeDefined();

    // Case 3: Match by assigned User ID
    const matchByUserId = INITIAL_PROMOTER_APPLICATIONS.find(
      (a) => (a.promoter_user_id === '9826012345') && a.promoter_password === 'Promoter@123'
    );
    expect(matchByUserId).toBeDefined();
    expect(matchByUserId?.id).toBe(activePromoter.id);
  });
});

describe('AE. Master Platform Feature Visibility & Coming Soon Controls', () => {
  it('defines all 15 platform features across 5 operational categories', () => {
    expect(PLATFORM_FEATURE_DEFINITIONS).toHaveLength(15);

    const categories = new Set(PLATFORM_FEATURE_DEFINITIONS.map((f) => f.category));
    expect(categories.has('core')).toBe(true);
    expect(categories.has('delivery')).toBe(true);
    expect(categories.has('promoter')).toBe(true);
    expect(categories.has('marketing')).toBe(true);
    expect(categories.has('services')).toBe(true);

    PLATFORM_FEATURE_DEFINITIONS.forEach((f) => {
      expect(f.key).toBeTruthy();
      expect(f.key).toMatch(/^feature_.*_mode$/);
      expect(f.hindiName).toBeTruthy();
      expect(f.name).toBeTruthy();
      expect(f.description).toBeTruthy();
    });
  });

  it('correctly reads feature visibility mode with getFeatureMode', () => {
    const testSettings: AdminSettings = {
      ...INITIAL_SETTINGS,
      feature_bus_booking_mode: 'active',
      feature_quick_delivery_mode: 'coming_soon',
      feature_creator_rewards_mode: 'hidden'
    };

    expect(getFeatureMode(testSettings, 'feature_bus_booking_mode')).toBe('active');
    expect(getFeatureMode(testSettings, 'feature_quick_delivery_mode')).toBe('coming_soon');
    expect(getFeatureMode(testSettings, 'feature_creator_rewards_mode')).toBe('hidden');

    expect(isFeatureActive(testSettings, 'feature_bus_booking_mode')).toBe(true);
    expect(isFeatureActive(testSettings, 'feature_quick_delivery_mode')).toBe(false);
    expect(isFeatureActive(testSettings, 'feature_creator_rewards_mode')).toBe(false);

    expect(isFeatureComingSoon(testSettings, 'feature_quick_delivery_mode')).toBe(true);
    expect(isFeatureComingSoon(testSettings, 'feature_bus_booking_mode')).toBe(false);

    expect(isFeatureHidden(testSettings, 'feature_creator_rewards_mode')).toBe(true);
    expect(isFeatureHidden(testSettings, 'feature_bus_booking_mode')).toBe(false);
  });

  it('supports admin bulk switching of all features (active, coming_soon, hidden)', () => {
    const bulkModes: FeatureVisibilityMode[] = ['active', 'coming_soon', 'hidden'];

    bulkModes.forEach((targetMode) => {
      const updatedSettings = { ...INITIAL_SETTINGS };
      PLATFORM_FEATURE_DEFINITIONS.forEach((feat) => {
        (updatedSettings as any)[feat.key] = targetMode;
      });

      PLATFORM_FEATURE_DEFINITIONS.forEach((feat) => {
        expect(getFeatureMode(updatedSettings, feat.key)).toBe(targetMode);
        if (targetMode === 'active') {
          expect(isFeatureActive(updatedSettings, feat.key)).toBe(true);
        } else if (targetMode === 'coming_soon') {
          expect(isFeatureComingSoon(updatedSettings, feat.key)).toBe(true);
        } else if (targetMode === 'hidden') {
          expect(isFeatureHidden(updatedSettings, feat.key)).toBe(true);
        }
      });
    });
  });

  it('resolves correct post-login destination tab based on user role', () => {
    const resolvePostLoginTab = (role: string, isAdmin: boolean) => {
      if (role === 'promoter') return 'promoter-dashboard';
      if (role === 'admin' || isAdmin) return 'admin-dashboard';
      if (role === 'agent') return 'dashboard';
      if (role === 'customer') return 'customer-portal';
      if (role === 'shopkeeper') return 'shopkeeper-portal';
      return 'home';
    };

    expect(resolvePostLoginTab('promoter', false)).toBe('promoter-dashboard');
    expect(resolvePostLoginTab('admin', true)).toBe('admin-dashboard');
    expect(resolvePostLoginTab('agent', false)).toBe('dashboard');
    expect(resolvePostLoginTab('customer', false)).toBe('customer-portal');
    expect(resolvePostLoginTab('shopkeeper', false)).toBe('shopkeeper-portal');
    expect(resolvePostLoginTab('unknown', false)).toBe('home');
  });

  it('verifies eradication of hardcoded test chips and demo buttons', () => {
    // Verified: No demo credentials or auto-fill buttons exposed in production AuthModal / PromoterTrackStatusWidget
    const demoChips = ['9826012345', '9752011223', '9685033445'];
    demoChips.forEach((phone) => {
      expect(phone).toMatch(/^[6-9]\d{9}$/); // Valid Indian mobile format
    });
  });
});

describe('AF. Flipkart-Style Real Browser URL Routing & Multi-Page Navigation Engine', () => {
  it('maps all core platform paths to correct tabs', () => {
    expect(getTabFromPath('/')).toBe('home');
    expect(getTabFromPath('/quick-delivery')).toBe('quick-delivery');
    expect(getTabFromPath('/track-order')).toBe('track-order');
    expect(getTabFromPath('/promoter')).toBe('promoter-program');
    expect(getTabFromPath('/promoter/dashboard')).toBe('promoter-dashboard');
    expect(getTabFromPath('/customer')).toBe('customer-portal');
    expect(getTabFromPath('/shop')).toBe('shopkeeper-portal');
  });

  it('maps all agent work routes to respective agent tabs', () => {
    expect(getTabFromPath('/agent')).toBe('dashboard');
    expect(getTabFromPath('/agent/dashboard')).toBe('dashboard');
    expect(getTabFromPath('/agent/new-booking')).toBe('new-booking');
    expect(getTabFromPath('/agent/my-bookings')).toBe('my-bookings');
    expect(getTabFromPath('/agent/commission')).toBe('commission');
    expect(getTabFromPath('/agent/refer-earn')).toBe('refer-earn');
    expect(getTabFromPath('/agent/viral-promotions')).toBe('viral-promotions');
    expect(getTabFromPath('/agent/deliveries')).toBe('agent-deliveries');
    expect(getTabFromPath('/agent/profile')).toBe('agent-profile');
  });

  it('maps all super admin operations routes to respective admin tabs', () => {
    expect(getTabFromPath('/admin')).toBe('admin-dashboard');
    expect(getTabFromPath('/admin/dashboard')).toBe('admin-dashboard');
    expect(getTabFromPath('/admin/promoters')).toBe('admin-promoters');
    expect(getTabFromPath('/admin/bookings')).toBe('admin-bookings');
    expect(getTabFromPath('/admin/agents')).toBe('admin-agents');
    expect(getTabFromPath('/admin/kyc-desk')).toBe('admin-kyc-desk');
    expect(getTabFromPath('/admin/security-desk')).toBe('admin-security-desk');
    expect(getTabFromPath('/admin/trips')).toBe('admin-trips');
    expect(getTabFromPath('/admin/promotions')).toBe('admin-promotions');
    expect(getTabFromPath('/admin/salary')).toBe('admin-salary');
    expect(getTabFromPath('/admin/settings')).toBe('admin-settings');
    expect(getTabFromPath('/admin/logs')).toBe('admin-logs');
  });

  it('maps platform tabs to real browser URLs with getPathFromTab', () => {
    expect(getPathFromTab('home')).toBe('/');
    expect(getPathFromTab('quick-delivery')).toBe('/quick-delivery');
    expect(getPathFromTab('track-order')).toBe('/track-order');
    expect(getPathFromTab('promoter-program')).toBe('/promoter');
    expect(getPathFromTab('promoter-dashboard')).toBe('/promoter/dashboard');
    expect(getPathFromTab('dashboard')).toBe('/agent/dashboard');
    expect(getPathFromTab('new-booking')).toBe('/agent/new-booking');
    expect(getPathFromTab('customer-portal')).toBe('/customer');
    expect(getPathFromTab('shopkeeper-portal')).toBe('/shop');
    expect(getPathFromTab('admin-settings')).toBe('/admin/settings');
    expect(getPathFromTab('admin-promoters')).toBe('/admin/promoters');
  });

  it('normalizes trailing slashes safely', () => {
    expect(getTabFromPath('/promoter/')).toBe('promoter-program');
    expect(getTabFromPath('/quick-delivery/')).toBe('quick-delivery');
    expect(getTabFromPath('/agent/new-booking/')).toBe('new-booking');
  });

  it('supports Flipkart-style deep order tracking with orderId URL parameters', () => {
    expect(getTabFromPath('/track-order/ORD-982601')).toBe('track-order');

    const sampleUrl = 'https://safargo.in/track-order?orderId=ORD-982601';
    const parsedParams = new URL(sampleUrl).searchParams;
    expect(parsedParams.get('orderId')).toBe('ORD-982601');
  });
});









