import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generate6DigitOtp,
  cleanPhoneNumber,
  sendWhatsAppOtp,
  verifyWhatsAppOtp,
  getStoredOtps,
  saveOtpRecord,
  getWhatsAppTicketMessage,
  META_APP_ID,
  META_APP_SECRET,
} from '../src/lib/whatsappService';

describe('WhatsApp & Meta Dual OTP System Verification', () => {
  // In-memory mock for localStorage in test environment
  let storageState: Record<string, string> = {};

  beforeEach(() => {
    storageState = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storageState[key] || null,
      setItem: (key: string, value: string) => {
        storageState[key] = value;
      },
      removeItem: (key: string) => {
        delete storageState[key];
      },
      clear: () => {
        storageState = {};
      },
    });
  });

  describe('1. Meta Credentials & Configuration', () => {
    it('has valid SafarGo Meta App ID and Secret configured', () => {
      expect(META_APP_ID).toBe('3612156912275307');
      expect(META_APP_SECRET).toBe('0d19b5b89175877f2275438844fceaa9');
    });
  });

  describe('2. Utilities (OTP Generation & Phone Sanitization)', () => {
    it('generates a valid 6-digit numeric OTP', () => {
      for (let i = 0; i < 20; i++) {
        const otp = generate6DigitOtp();
        expect(otp).toHaveLength(6);
        expect(/^\d{6}$/.test(otp)).toBe(true);
        const num = parseInt(otp, 10);
        expect(num).toBeGreaterThanOrEqual(100000);
        expect(num).toBeLessThanOrEqual(999999);
      }
    });

    it('cleans various Indian mobile number formats to 10 digits', () => {
      expect(cleanPhoneNumber('9826012345')).toBe('9826012345');
      expect(cleanPhoneNumber('+91 98260 12345')).toBe('9826012345');
      expect(cleanPhoneNumber('+91-98260-12345')).toBe('9826012345');
      expect(cleanPhoneNumber('09826012345')).toBe('9826012345');
      expect(cleanPhoneNumber('919826012345')).toBe('9826012345');
    });
  });

  describe('3. Flow 1: Agent Registration / Signup WhatsApp OTP', () => {
    it('dispatches registration OTP and generates valid WhatsApp deep link', async () => {
      const res = await sendWhatsAppOtp({
        mobile: '9826011111',
        purpose: 'registration',
        agentName: 'Ramesh Sharma',
        email: 'ramesh@gmail.com',
      });

      expect(res.success).toBe(true);
      expect(res.otpCode).toHaveLength(6);
      expect(res.directWhatsAppUrl).toContain('https://wa.me/919826011111');
      expect(res.directWhatsAppUrl).toContain(encodeURIComponent(res.otpCode));
      expect(res.directWhatsAppUrl).toContain(encodeURIComponent('SAFARGO OFFICIAL SECURITY OTP'));

      // Check stored in localStorage
      const otps = getStoredOtps();
      expect(otps.length).toBe(1);
      expect(otps[0].mobile).toBe('9826011111');
      expect(otps[0].purpose).toBe('registration');
      expect(otps[0].otpCode).toBe(res.otpCode);
      expect(otps[0].isVerified).toBe(false);
    });

    it('verifies correct registration OTP successfully', async () => {
      const res = await sendWhatsAppOtp({
        mobile: '9826011111',
        purpose: 'registration',
      });

      const verification = verifyWhatsAppOtp('9826011111', res.otpCode, 'registration');
      expect(verification.verified).toBe(true);
      expect(verification.message).toContain('सफल');

      // OTP cannot be reused after verification
      const repeatVerify = verifyWhatsAppOtp('9826011111', res.otpCode, 'registration');
      expect(repeatVerify.verified).toBe(false);
    });

    it('rejects incorrect registration OTP', async () => {
      await sendWhatsAppOtp({
        mobile: '9826011111',
        purpose: 'registration',
      });

      const verification = verifyWhatsAppOtp('9826011111', '000000', 'registration');
      expect(verification.verified).toBe(false);
      expect(verification.message).toContain('गलत OTP');
    });
  });

  describe('4. Flow 2: Agent WhatsApp OTP Login', () => {
    it('sends login OTP and verifies agent login session', async () => {
      const res = await sendWhatsAppOtp({
        mobile: '9826022222',
        purpose: 'login',
        agentName: 'Deepak Patel',
      });

      expect(res.success).toBe(true);
      expect(res.directWhatsAppUrl).toContain('wa.me/919826022222');

      const verification = verifyWhatsAppOtp('9826022222', res.otpCode, 'login');
      expect(verification.verified).toBe(true);
    });

    it('rejects login OTP for another purpose or phone number', async () => {
      const res = await sendWhatsAppOtp({
        mobile: '9826022222',
        purpose: 'login',
      });

      // Different purpose
      const wrongPurpose = verifyWhatsAppOtp('9826022222', res.otpCode, 'forgot_password');
      expect(wrongPurpose.verified).toBe(false);

      // Different phone
      const wrongPhone = verifyWhatsAppOtp('9826099999', res.otpCode, 'login');
      expect(wrongPhone.verified).toBe(false);
    });
  });

  describe('5. Flow 3: Forgot Password WhatsApp OTP', () => {
    it('sends password reset OTP and verifies for new password setup', async () => {
      const res = await sendWhatsAppOtp({
        mobile: '9826033333',
        purpose: 'forgot_password',
        agentName: 'Sunil Verma',
      });

      expect(res.success).toBe(true);
      const verification = verifyWhatsAppOtp('9826033333', res.otpCode, 'forgot_password');
      expect(verification.verified).toBe(true);
    });
  });

  describe('6. Flow 4: Withdrawal 2FA WhatsApp OTP', () => {
    it('sends withdrawal 2FA OTP with specified payout amount', async () => {
      const res = await sendWhatsAppOtp({
        mobile: '9826044444',
        purpose: 'withdrawal',
        agentName: 'Aman Jain',
        amount: 10000,
      });

      expect(res.success).toBe(true);
      expect(res.directWhatsAppUrl).toContain(encodeURIComponent('₹10000'));

      const verification = verifyWhatsAppOtp('9826044444', res.otpCode, 'withdrawal');
      expect(verification.verified).toBe(true);
    });

    it('blocks expired withdrawal OTP', () => {
      // Manually save an expired OTP
      saveOtpRecord({
        id: 'test-expired',
        mobile: '9826044444',
        otpCode: '555555',
        purpose: 'withdrawal',
        createdAt: Date.now() - 10 * 60 * 1000,
        expiresAt: Date.now() - 1000, // Expired 1s ago
        isVerified: false,
      });

      const verification = verifyWhatsAppOtp('9826044444', '555555', 'withdrawal');
      expect(verification.verified).toBe(false);
      expect(verification.message).toContain('Expired');
    });
  });

  describe('7. Ticket Generation WhatsApp Alert Dispatch', () => {
    it('generates complete WhatsApp ticket message with PNR and route', () => {
      const ticket = getWhatsAppTicketMessage({
        customer_name: 'Rahul Sharma',
        customer_mobile: '9826055555',
        booking_code: 'SFG-20261016-001',
        ticket_pnr: 'SFG-748291',
        from_city: 'Indore',
        to_city: 'Bhopal',
        journey_date: '2026-10-18',
        confirmed_seats: 'L1, L2',
        actual_fare: 750,
        actual_operator: 'Chartered Bus Ltd',
        actual_boarding_point: 'Sarwate Bus Stand',
        actual_drop_point: 'ISBT Bhopal',
      });

      expect(ticket.text).toContain('SAFARGO ई-टिकट कन्फर्मेशन');
      expect(ticket.text).toContain('Rahul Sharma');
      expect(ticket.text).toContain('SFG-748291');
      expect(ticket.text).toContain('Indore ➔ Bhopal');
      expect(ticket.text).toContain('L1, L2');
      expect(ticket.text).toContain('₹750');
      expect(ticket.text).toContain('Chartered Bus Ltd');
      expect(ticket.url).toContain('https://wa.me/919826055555');
      expect(ticket.url).toContain(encodeURIComponent('SFG-748291'));
    });
  });
});
