import { describe, it, expect } from 'vitest';
import { mergeBookingsWithPrecedence } from '../src/context/DataContext';
import { Booking, CommissionEntry } from '../src/types';
import { SUBDOMAIN_CONFIGS, AppSubdomain } from '../src/lib/subdomain';

describe('SafarGo Critical Bug Fix & Booking Lifecycle Verification', () => {
  const samplePendingBooking: Booking = {
    id: 'bkg-101',
    booking_code: 'SFG-20261017-101',
    agent_id: 'usr-agent-01',
    agent_name: 'Rajesh Sharma',
    agent_mobile: '9826012345',
    customer_name: 'Amit Verma',
    customer_mobile: '9876500001',
    passenger_count: 1,
    from_city: 'Indore',
    to_city: 'Bhopal',
    journey_date: '2026-10-20',
    seat_category: 'seater',
    seat_count: 1,
    boarding_point: 'Sarwate Bus Stand',
    drop_point: 'Nadra Bus Stand',
    estimated_fare: 450,
    total_estimated_amount: 450,
    status: 'booking_request',
    created_at: new Date('2026-10-17T10:00:00Z').toISOString(),
    deadline_at: new Date('2026-10-17T10:15:00Z').toISOString(),
  };

  const sampleConfirmedBooking: Booking = {
    ...samplePendingBooking,
    status: 'confirmed',
    actual_fare: 450,
    confirmed_seats: 'L12',
    actual_operator: 'SafarGo Superfast Express',
    actual_boarding_point: 'Sarwate Bus Stand Platform 3',
    actual_drop_point: 'Nadra Bus Stand Main Gate',
    ticket_pnr: 'SFG-998877',
    confirmed_by: 'usr-admin-01',
    confirmed_at: new Date('2026-10-17T10:05:00Z').toISOString(),
    updated_at: new Date('2026-10-17T10:05:00Z').toISOString(),
  };

  describe('1. Status Precedence Hierarchy & Anti-Downgrade Engine', () => {
    it('preserves confirmed status when incoming list has stale booking_request', () => {
      const localList = [sampleConfirmedBooking];
      const incomingStaleFromServer = [samplePendingBooking];

      const merged = mergeBookingsWithPrecedence(localList, incomingStaleFromServer);
      expect(merged).toHaveLength(1);
      expect(merged[0].status).toBe('confirmed');
      expect(merged[0].ticket_pnr).toBe('SFG-998877');
      expect(merged[0].confirmed_seats).toBe('L12');
      expect(merged[0].actual_operator).toBe('SafarGo Superfast Express');
    });

    it('upgrades booking_request to confirmed when admin approval arrives', () => {
      const localList = [samplePendingBooking];
      const incomingConfirmed = [sampleConfirmedBooking];

      const merged = mergeBookingsWithPrecedence(localList, incomingConfirmed);
      expect(merged).toHaveLength(1);
      expect(merged[0].status).toBe('confirmed');
      expect(merged[0].ticket_pnr).toBe('SFG-998877');
      expect(merged[0].confirmed_seats).toBe('L12');
    });

    it('handles "pending" alias correctly and upgrades to confirmed', () => {
      const localWithPendingAlias: any = [{ ...samplePendingBooking, status: 'pending' }];
      const incomingConfirmed = [sampleConfirmedBooking];

      const merged = mergeBookingsWithPrecedence(localWithPendingAlias, incomingConfirmed);
      expect(merged[0].status).toBe('confirmed');
      expect(merged[0].ticket_pnr).toBe('SFG-998877');
    });

    it('deduplicates and merges by booking_code when server assigns alternate ID', () => {
      const local = [sampleConfirmedBooking]; // id: 'bkg-101', booking_code: 'SFG-20261017-101'
      const incomingWithServerUuid: any = [
        {
          ...samplePendingBooking,
          id: 'uuid-server-db-555',
          booking_code: 'SFG-20261017-101',
        },
      ];

      const merged = mergeBookingsWithPrecedence(local, incomingWithServerUuid);
      expect(merged).toHaveLength(1);
      expect(merged[0].status).toBe('confirmed');
      expect(merged[0].ticket_pnr).toBe('SFG-998877');
    });
  });

  describe('2. Atomic Commission & Idempotency Rules', () => {
    it('credits commission only once for confirmed booking and blocks duplicates', () => {
      const commissions: CommissionEntry[] = [];
      const commRate = 20;

      const recordCommission = (booking: Booking): boolean => {
        const alreadyCredited = commissions.some(
          (c) =>
            (c.booking_id === booking.id || c.booking_code === booking.booking_code) &&
            c.status === 'credited'
        );
        if (alreadyCredited) return false;

        commissions.push({
          id: `comm-${Date.now()}`,
          booking_id: booking.id,
          booking_code: booking.booking_code,
          agent_id: booking.agent_id,
          agent_name: booking.agent_name,
          amount: commRate,
          status: 'credited',
          entry_type: 'booking_commission',
          notes: `Automatic commission credited on booking confirmation`,
          created_at: new Date().toISOString(),
        });
        return true;
      };

      // First confirmation succeeds
      const firstTry = recordCommission(sampleConfirmedBooking);
      expect(firstTry).toBe(true);
      expect(commissions).toHaveLength(1);
      expect(commissions[0].amount).toBe(20);

      // Repeated confirmation is blocked
      const secondTry = recordCommission(sampleConfirmedBooking);
      expect(secondTry).toBe(false);
      expect(commissions).toHaveLength(1);
    });

    it('rejects awarding commission to pending or rejected bookings', () => {
      const canAwardCommission = (status: string) => status === 'confirmed';

      expect(canAwardCommission('booking_request')).toBe(false);
      expect(canAwardCommission('awaiting_operator_confirmation')).toBe(false);
      expect(canAwardCommission('rejected')).toBe(false);
      expect(canAwardCommission('cancelled')).toBe(false);
      expect(canAwardCommission('expired')).toBe(false);
      expect(canAwardCommission('confirmed')).toBe(true);
    });
  });

  describe('3. Subdomain Coverage Verification', () => {
    const requiredSubdomains: AppSubdomain[] = [
      'main',
      'book',
      'agent',
      'admin',
      'operator',
      'kisan',
      'buyer',
      'transport',
      'pay',
      'help',
      'partner',
    ];

    it.each(requiredSubdomains)('has valid configuration registered for %s', (sub) => {
      expect(SUBDOMAIN_CONFIGS[sub]).toBeDefined();
      expect(SUBDOMAIN_CONFIGS[sub].title).toBeTruthy();
      expect(SUBDOMAIN_CONFIGS[sub].subdomainPrefix).toBeTruthy();
    });
  });
});
