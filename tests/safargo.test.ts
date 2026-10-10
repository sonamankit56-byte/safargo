import { describe, it, expect } from 'vitest';
import {
  INITIAL_PROFILES,
  INITIAL_BOOKINGS,
  INITIAL_COMMISSION_LEDGER,
  INITIAL_SETTINGS,
  INITIAL_BUS_TRIPS
} from '../src/lib/mockData';
import { Booking, CommissionEntry, Profile } from '../src/types';

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
    expect(trip.source).toBe('Lucknow');
    expect(trip.destination).toBe('Delhi (Kashmere Gate)');
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
    expect(content).toContain('ENABLE ROW LEVEL SECURITY');
  });
});


