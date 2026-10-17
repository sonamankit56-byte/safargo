import { describe, it, expect } from 'vitest';
import {
  inferTransactionCategory,
  enrichWalletTransaction,
  TRANSACTION_SOURCE_METAS,
} from '../src/lib/transactionUtils';
import { WalletTransaction } from '../src/types';

describe('SafarGo Go Wallet Transaction Name & Source Categorization', () => {
  it('correctly categorizes Bus Ticket Commission (+₹20)', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'recharge',
      amount: 20,
      booking_code: 'SFG-20261017-001',
      description: '⚡ GO Agent बस टिकट कमीशन (₹20 इंस्टेंट क्रेडिट) - Booking: SFG-20261017-001',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('bus_ticket_commission');
    expect(inferred.transaction_name).toContain('बस टिकट कमीशन');
    expect(inferred.source_name).toContain('SFG-20261017-001');

    const enriched = enrichWalletTransaction({
      id: 'tx-1',
      agent_id: 'agent-1',
      amount: 20,
      type: 'recharge',
      description: rawTx.description!,
      booking_code: rawTx.booking_code,
      balance_after: 520,
      created_at: new Date().toISOString(),
    });
    expect(enriched.transaction_name).toContain('बस टिकट कमीशन');
    expect(enriched.source_category).toBe('bus_ticket_commission');
  });

  it('correctly categorizes Refer & Earn Bonus (₹100)', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'recharge',
      amount: 100,
      description: '🎁 GO Agent Refer & Earn बोनस (₹100 इंस्टेंट क्रेडिट) - रमेश शर्मा ने पूरी की 5 कन्फर्म बुकिंग्स!',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('referral_bonus');
    expect(inferred.transaction_name).toContain('रेफरल बोनस');
    expect(inferred.source_name).toContain('रेफरल');
  });

  it('correctly categorizes Boarding Sathi Allowance (+₹23)', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'recharge',
      amount: 23,
      booking_code: 'SFG-20261017-002',
      description: '🛡️ GO Agent बोर्डिंग साथी मानदेय (+₹23 इंस्टेंट क्रेडिट) - Booking: SFG-20261017-002',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('boarding_sathi');
    expect(inferred.transaction_name).toContain('बोर्डिंग साथी');
  });

  it('correctly categorizes Wallet Recharge via UPI / QR', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'recharge',
      amount: 2000,
      recharge_id: 'rchg-101',
      description: 'Go Wallet रिचार्ज सत्यापित (UTR: 987654321012)',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('wallet_recharge');
    expect(inferred.transaction_name).toContain('वॉलेट रिचार्ज');
  });

  it('correctly categorizes Fixed Monthly Salary (₹10,000 / ₹5,000)', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'monthly_salary',
      amount: 10000,
      description: '🎉 मासिक फिक्स्ड वेतन निकासी (280 टिकट लक्ष्य पूर्ण) -> UPI ID (agent@icici)',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('monthly_salary');
    expect(inferred.transaction_name).toContain('मासिक वेतन');
  });

  it('correctly categorizes Sunday Bank / UPI Withdrawal Payout', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'bank_withdrawal',
      amount: -1500,
      description: 'Go Wallet से बैंक खाते (SBI A/c: 123456789) में निकासी',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('bank_withdrawal');
    expect(inferred.transaction_name).toContain('बैंक निकासी');
  });

  it('correctly categorizes Ticket Booking Go Wallet Debit', () => {
    const rawTx: Partial<WalletTransaction> = {
      type: 'ticket_booking',
      amount: -450,
      booking_code: 'SFG-20261017-003',
      description: 'टिकट बुकिंग कटौती: भोपाल → इंदौर',
    };
    const inferred = inferTransactionCategory(rawTx);
    expect(inferred.source_category).toBe('ticket_booking_debit');
    expect(inferred.transaction_name).toContain('बस टिकट बुकिंग भुगतान');
  });

  it('preserves existing custom transaction_name and source_name', () => {
    const customTx: WalletTransaction = {
      id: 'tx-custom',
      agent_id: 'agent-1',
      amount: 50,
      type: 'adjustment',
      description: 'Custom Bonus',
      balance_after: 550,
      created_at: new Date().toISOString(),
      transaction_name: 'विशेष दीवाली बोनस',
      source_name: 'सफरगो स्पेशल प्रोमोशन',
      source_category: 'admin_adjustment',
      source_details: 'त्योहारी सीजन इंसेंटिव',
    };
    const enriched = enrichWalletTransaction(customTx);
    expect(enriched.transaction_name).toBe('विशेष दीवाली बोनस');
    expect(enriched.source_name).toBe('सफरगो स्पेशल प्रोमोशन');
    expect(enriched.source_category).toBe('admin_adjustment');
    expect(enriched.source_details).toBe('त्योहारी सीजन इंसेंटिव');
  });

  it('provides valid metadata for all transaction source categories', () => {
    const categories = Object.keys(TRANSACTION_SOURCE_METAS);
    expect(categories.length).toBeGreaterThanOrEqual(10);
    categories.forEach((cat) => {
      const meta = TRANSACTION_SOURCE_METAS[cat as keyof typeof TRANSACTION_SOURCE_METAS];
      expect(meta.label).toBeDefined();
      expect(meta.shortLabel).toBeDefined();
      expect(meta.icon).toBeDefined();
      expect(meta.badgeBg).toBeDefined();
      expect(meta.badgeText).toBeDefined();
    });
  });
});
