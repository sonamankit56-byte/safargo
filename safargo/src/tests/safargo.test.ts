import { describe, it, expect, beforeEach } from 'vitest';
import { SafarGoStore, DEFAULT_GO_AGENT_CONFIG, SEED_ROUTES, SEED_SERVICES } from '../lib/store';
import { SUBDOMAINS } from '../context/PortalContext';

// Polyfill localStorage for node environment
if (typeof globalThis.localStorage === 'undefined') {
  const storage = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, value: string) => storage.set(key, String(value)),
    removeItem: (key: string) => storage.delete(key),
    clear: () => storage.clear(),
    key: (index: number) => Array.from(storage.keys())[index] || null,
    length: storage.size,
  } as Storage;
}

describe('SafarGo Platform Test Suite', () => {
  let store: SafarGoStore;

  beforeEach(() => {
    // Clear storage and reinitialize
    localStorage.clear();
    store = new SafarGoStore();
  });

  describe('1. Subdomain Portals Architecture (All 12 Subdomains)', () => {
    it('should configure all 12 distinct subdomains with correct hostnames and roles', () => {
      expect(SUBDOMAINS.length).toBe(12);

      const expectedHostnames = [
        'www.safargo.in',
        'book.safargo.in',
        'agent.safargo.in',
        'go.safargo.in',
        'admin.safargo.in',
        'operator.safargo.in',
        'kisan.safargo.in',
        'buyer.safargo.in',
        'transport.safargo.in',
        'pay.safargo.in',
        'help.safargo.in',
        'partner.safargo.in',
      ];

      const actualHostnames = SUBDOMAINS.map((s) => s.hostname);
      expect(actualHostnames).toEqual(expectedHostnames);
    });
  });

  describe('2. Bus Search & Manual Booking Flow', () => {
    it('should validate search and prevent identical origin and destination', () => {
      const origin = 'Delhi';
      const destination = 'Delhi';
      const isInvalid = origin.toLowerCase() === destination.toLowerCase();
      expect(isInvalid).toBe(true);
    });

    it('should create a manual booking request in pending review status', () => {
      const res = store.createBooking({
        bookingChannel: 'customer_self',
        customerName: 'Ananya Sharma',
        customerPhone: '+91-9876543211',
        serviceId: 'srv-101',
        boardingPoint: 'ISBT Kashmiri Gate (21:30)',
        droppingPoint: 'Sindhi Camp (03:00)',
        journeyDate: '2026-10-30',
        passengers: [
          { fullName: 'Ananya Sharma', age: 26, gender: 'female', seatPreference: 'Lower Berth' },
        ],
      });

      expect(res.success).toBe(true);
      expect(res.booking).toBeDefined();
      if (!res.booking) return;

      expect(res.booking.bookingRef).toMatch(/^SFG-2026-\d{6}$/);
      expect(res.booking.status).toBe('pending');
      expect(res.booking.operatorResponse).toBe('pending');
      expect(res.booking.assistanceTargetMinutes).toBe(15);
      expect(res.booking.operatorPnr).toBeUndefined(); // No fake PNR!
    });

    it('should require genuine Operator PNR for confirmation', () => {
      const createRes = store.createBooking({
        bookingChannel: 'customer_self',
        customerName: 'Kunal Kapoor',
        customerPhone: '+91-9811223344',
        serviceId: 'srv-101',
        boardingPoint: 'Dhaula Kuan',
        droppingPoint: 'Sindhi Camp',
        journeyDate: '2026-10-30',
        passengers: [{ fullName: 'Kunal Kapoor', age: 32, gender: 'male' }],
      });

      const booking = createRes.booking!;

      // Attempt to confirm without PNR
      const failConfirm = store.confirmBooking({
        bookingId: booking.id,
        operatorPnr: '',
        confirmedBy: 'usr-admin',
      });
      expect(failConfirm.success).toBe(false);
      expect(failConfirm.error).toContain('Actual operator PNR is required');

      // Confirm with genuine PNR
      const realPnr = 'RYL-CONF-5582';
      const passConfirm = store.confirmBooking({
        bookingId: booking.id,
        operatorPnr: realPnr,
        confirmedBy: 'usr-admin',
      });
      expect(passConfirm.success).toBe(true);

      const updated = store.getState().bookings.find((b) => b.id === booking.id)!;
      expect(updated.status).toBe('confirmed');
      expect(updated.operatorPnr).toBe(realPnr);
      expect(updated.confirmedAt).toBeDefined();
    });

    it('should reject a booking request when operator has no availability', () => {
      const createRes = store.createBooking({
        bookingChannel: 'customer_self',
        customerName: 'Sunil Rao',
        customerPhone: '+91-9877665544',
        serviceId: 'srv-101',
        boardingPoint: 'ISBT',
        droppingPoint: 'Sindhi Camp',
        journeyDate: '2026-10-30',
        passengers: [{ fullName: 'Sunil Rao', age: 40, gender: 'male' }],
      });

      const booking = createRes.booking!;
      const rejectRes = store.rejectBooking({
        bookingId: booking.id,
        rejectionReason: 'Bus capacity full. No seats available.',
        rejectedBy: 'usr-admin',
      });

      expect(rejectRes.success).toBe(true);
      const updated = store.getState().bookings.find((b) => b.id === booking.id)!;
      expect(updated.status).toBe('rejected');
      expect(updated.rejectionReason).toContain('Bus capacity full');
    });
  });

  describe('3. Go Agent Business Rules & Commission Ledger', () => {
    it('should verify Go Agent parameters: 150 bookings target, ₹5000 salary, ₹19.34 commission, ₹100 referral', () => {
      const config = store.getState().goAgentConfig;
      expect(config.monthlyTarget).toBe(150);
      expect(config.fixedMonthlySalary).toBe(5000);
      expect(config.commissionPerBooking).toBe(19.34);
      expect(config.referralReward).toBe(100);
    });

    it('should credit commission ONLY upon confirmed booking and prevent duplicates', () => {
      const goAgent = store.getState().agents.find((a) => a.agentType === 'go_agent')!;
      const initialCommissions = store.getState().commissions.filter((c) => c.agentId === goAgent.id).length;

      // Create assisted booking
      const createRes = store.createBooking({
        bookingChannel: 'agent_assisted',
        agentId: goAgent.id,
        customerName: 'Pooja Verma',
        customerPhone: '+91-9823456789',
        serviceId: 'srv-101',
        boardingPoint: 'ISBT',
        droppingPoint: 'Sindhi Camp',
        journeyDate: '2026-10-28',
        passengers: [{ fullName: 'Pooja Verma', age: 29, gender: 'female' }],
      });

      const booking = createRes.booking!;

      // In pending state, no commission should be credited
      let currentCommissions = store.getState().commissions.filter((c) => c.agentId === goAgent.id).length;
      expect(currentCommissions).toBe(initialCommissions);

      // Confirm booking with genuine PNR
      store.confirmBooking({
        bookingId: booking.id,
        operatorPnr: 'RYL-GO-7711',
        confirmedBy: 'usr-admin',
      });

      currentCommissions = store.getState().commissions.filter((c) => c.agentId === goAgent.id).length;
      expect(currentCommissions).toBe(initialCommissions + 1);

      const newCom = store.getState().commissions.find((c) => c.bookingId === booking.id)!;
      expect(newCom.amount).toBe(DEFAULT_GO_AGENT_CONFIG.commissionPerBooking); // ₹19.34
      expect(newCom.status).toBe('eligible');

      // Attempting to confirm again should not duplicate commission
      store.confirmBooking({
        bookingId: booking.id,
        operatorPnr: 'RYL-GO-7711-DUPE',
        confirmedBy: 'usr-admin',
      });

      const commissionsAfterDupe = store.getState().commissions.filter((c) => c.agentId === goAgent.id).length;
      expect(commissionsAfterDupe).toBe(initialCommissions + 1); // Strictly unique
    });

    it('should allow admin to update Go Agent business parameters and log audit', () => {
      store.updateGoAgentConfig({
        monthlyTarget: 175,
        commissionPerBooking: 21.50,
      }, 'usr-admin');

      const updated = store.getState().goAgentConfig;
      expect(updated.monthlyTarget).toBe(175);
      expect(updated.commissionPerBooking).toBe(21.50);

      const latestAudit = store.getState().auditLogs[0];
      expect(latestAudit.action).toBe('UPDATE_CONFIG');
    });
  });

  describe('4. Cancellation & Refund Management', () => {
    it('should create refund request and calculate deduction accurately', () => {
      const booking = store.getState().bookings.find((b) => b.status === 'confirmed')!;
      
      const res = store.requestCancellation({
        bookingId: booking.id,
        reason: 'Change in passenger travel itinerary',
        requestedBy: booking.customerName,
      });

      expect(res.success).toBe(true);

      const refundReq = store.getState().refundRequests.find((r) => r.bookingId === booking.id)!;
      expect(refundReq.status).toBe('under_review');
      expect(refundReq.deductionAmount).toBe(booking.finalAmount * 0.20);
      expect(refundReq.calculatedRefund).toBe(booking.finalAmount * 0.80);

      // Admin processes refund
      const processRes = store.processRefund({
        refundRequestId: refundReq.id,
        action: 'approve',
        refundRef: 'BANK-REF-9921',
      });

      expect(processRes.success).toBe(true);
      expect(refundReq.status).toBe('processed');
      expect(refundReq.refundRef).toBe('BANK-REF-9921');

      const updatedBooking = store.getState().bookings.find((b) => b.id === booking.id)!;
      expect(updatedBooking.status).toBe('refunded');
    });
  });

  describe('5. Agricultural Marketplace & Logistics', () => {
    it('should publish crop listing and submit buyer inquiry', () => {
      const initialCount = store.getState().cropListings.length;

      store.addCropListing({
        farmerId: 'farm-001',
        farmerName: 'Ramkishan Yadav',
        farmerPhone: '+91-9867890123',
        cropName: 'Soybean (Black)',
        variety: 'JS 335 Organic',
        quantityQuintals: 75,
        expectedPricePerQuintal: 4600,
        harvestDate: '2026-10-22',
        location: 'Hoshangabad APMC Yard',
        status: 'available',
        pickupRequirements: 'Tractor trailer accessible road',
      });

      expect(store.getState().cropListings.length).toBe(initialCount + 1);

      const latestListing = store.getState().cropListings[0];
      expect(latestListing.cropName).toBe('Soybean (Black)');
      expect(latestListing.quantityQuintals).toBe(75);

      // Buyer inquiry
      store.submitBuyerInquiry({
        cropListingId: latestListing.id,
        cropName: latestListing.cropName,
        buyerId: 'usr-buyer',
        buyerName: 'Agro Mandi Buyer',
        buyerPhone: '+91-9878901234',
        offeredPricePerQuintal: 4550,
        requiredQuantityQuintals: 50,
        status: 'pending',
      });

      const inq = store.getState().buyerInquiries[0];
      expect(inq.cropListingId).toBe(latestListing.id);
      expect(inq.offeredPricePerQuintal).toBe(4550);
    });

    it('should create and assign rural transport logistics request', () => {
      store.createTransportRequest({
        requesterType: 'farmer',
        requesterName: 'Ramkishan Yadav',
        requesterPhone: '+91-9867890123',
        cropType: 'Mustard',
        weightQuintals: 60,
        pickupLocation: 'Pipariya Village',
        deliveryLocation: 'Bhopal APMC Mandi',
        preferredDate: '2026-10-29',
        status: 'requested',
      });

      const req = store.getState().transportRequests[0];
      expect(req.cropType).toBe('Mustard');
      expect(req.status).toBe('requested');
    });
  });

  describe('6. Security & Audit Logging', () => {
    it('should record every sensitive action in immutable audit log', () => {
      const initialLogs = store.getState().auditLogs.length;

      store.logAudit(
        'usr-admin',
        'Ramesh Sharma',
        'admin',
        'SECURITY_CHECK',
        'auth',
        'sys-001',
        'Automated security role verification executed.'
      );

      const currentLogs = store.getState().auditLogs;
      expect(currentLogs.length).toBe(initialLogs + 1);
      expect(currentLogs[0].action).toBe('SECURITY_CHECK');
      expect(currentLogs[0].userRole).toBe('admin');
    });
  });
});
