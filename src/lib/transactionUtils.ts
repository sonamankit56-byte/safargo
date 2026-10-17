import { WalletTransaction, WalletTransactionSource } from '../types';

export interface TransactionSourceMeta {
  category: WalletTransactionSource;
  label: string;
  shortLabel: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export const TRANSACTION_SOURCE_METAS: Record<WalletTransactionSource, TransactionSourceMeta> = {
  bus_ticket_commission: {
    category: 'bus_ticket_commission',
    label: '🎟️ बस टिकट कमीशन (Flat ₹20)',
    shortLabel: 'टिकट कमीशन',
    icon: '🎟️',
    badgeBg: 'bg-emerald-950',
    badgeText: 'text-emerald-300',
    borderClass: 'border-emerald-500/40',
  },
  referral_bonus: {
    category: 'referral_bonus',
    label: '🎁 रेफरल बोनस (Refer & Earn ₹100)',
    shortLabel: 'रेफरल बोनस',
    icon: '🎁',
    badgeBg: 'bg-purple-950',
    badgeText: 'text-purple-300',
    borderClass: 'border-purple-500/40',
  },
  boarding_sathi: {
    category: 'boarding_sathi',
    label: '🛡️ बोर्डिंग साथी मानदेय (+₹23)',
    shortLabel: 'बोर्डिंग साथी',
    icon: '🛡️',
    badgeBg: 'bg-cyan-950',
    badgeText: 'text-cyan-300',
    borderClass: 'border-cyan-500/40',
  },
  wallet_recharge: {
    category: 'wallet_recharge',
    label: '💳 वॉलेट रिचार्ज / पैसे जोड़े',
    shortLabel: 'वॉलेट रिचार्ज',
    icon: '💳',
    badgeBg: 'bg-blue-950',
    badgeText: 'text-blue-300',
    borderClass: 'border-blue-500/40',
  },
  monthly_salary: {
    category: 'monthly_salary',
    label: '💼 फिक्स्ड मासिक वेतन (₹10,000 / ₹5,000)',
    shortLabel: 'मासिक वेतन',
    icon: '💼',
    badgeBg: 'bg-indigo-950',
    badgeText: 'text-indigo-300',
    borderClass: 'border-indigo-500/40',
  },
  admin_adjustment: {
    category: 'admin_adjustment',
    label: '⚡ एडमिन क्रेडिट / बोनस',
    shortLabel: 'एडमिन क्रेडिट',
    icon: '⚡',
    badgeBg: 'bg-amber-950',
    badgeText: 'text-amber-300',
    borderClass: 'border-amber-500/40',
  },
  ticket_booking_debit: {
    category: 'ticket_booking_debit',
    label: '🚌 बस टिकट बुकिंग भुगतान',
    shortLabel: 'टिकट बुकिंग',
    icon: '🚌',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-slate-300',
    borderClass: 'border-slate-700',
  },
  bank_withdrawal: {
    category: 'bank_withdrawal',
    label: '🏦 बैंक निकासी (Sunday Payout)',
    shortLabel: 'बैंक निकासी',
    icon: '🏦',
    badgeBg: 'bg-rose-950',
    badgeText: 'text-rose-300',
    borderClass: 'border-rose-500/40',
  },
  quick_commerce: {
    category: 'quick_commerce',
    label: '🛍️ दुकान सामान बिक्री / डिलीवरी',
    shortLabel: 'दुकान बिक्री',
    icon: '🛍️',
    badgeBg: 'bg-teal-950',
    badgeText: 'text-teal-300',
    borderClass: 'border-teal-500/40',
  },
  refund: {
    category: 'refund',
    label: '↩️ टिकट रिफंड वापसी',
    shortLabel: 'रिफंड वापसी',
    icon: '↩️',
    badgeBg: 'bg-green-950',
    badgeText: 'text-green-300',
    borderClass: 'border-green-500/40',
  },
  other: {
    category: 'other',
    label: '📌 अन्य लेनदेन',
    shortLabel: 'अन्य',
    icon: '📌',
    badgeBg: 'bg-slate-900',
    badgeText: 'text-slate-400',
    borderClass: 'border-slate-800',
  },
};

export function inferTransactionCategory(tx: Partial<WalletTransaction>): {
  transaction_name: string;
  source_name: string;
  source_category: WalletTransactionSource;
  source_details?: string;
} {
  const desc = (tx.description || '').toLowerCase();
  const type = tx.type;

  // 1. Boarding sathi
  if (desc.includes('बोर्डिंग') || desc.includes('boarding')) {
    return {
      transaction_name: '🛡️ बोर्डिंग साथी मानदेय (+₹23)',
      source_name: 'यात्री बस बोर्डिंग सहायता सेवा',
      source_category: 'boarding_sathi',
      source_details: 'यात्री को बस में सुरक्षित बैठाने का सेवा मानदेय',
    };
  }

  // 2. Referral bonus
  if (desc.includes('refer') || desc.includes('रेफरल') || desc.includes('बोनस')) {
    return {
      transaction_name: '🎁 रेफरल बोनस (Refer & Earn ₹100)',
      source_name: 'साथी एजेंट रेफरल नेटवर्क (5 सफल बुकिंग्स)',
      source_category: 'referral_bonus',
      source_details: 'सफरगो पार्टनर प्रोग्राम के अंतर्गत अर्जित नकद इनाम',
    };
  }

  // 3. Bus ticket commission
  if (
    desc.includes('कमीशन') ||
    desc.includes('commission') ||
    (type === 'recharge' && (tx.booking_code || desc.includes('booking') || desc.includes('टिकट')))
  ) {
    return {
      transaction_name: '🎟️ बस टिकट कमीशन (फ्लैट ₹20)',
      source_name: tx.booking_code ? `सफरगो बस टिकट बुकिंग (${tx.booking_code})` : 'सफरगो अधिकृत बस टिकट बुकिंग',
      source_category: 'bus_ticket_commission',
      source_details: tx.booking_code ? `बुकिंग संदर्भ: ${tx.booking_code}` : 'प्रत्येक कन्फर्म टिकट पर त्वरित नकद कमीशन',
    };
  }

  // 4. Monthly salary
  if (type === 'monthly_salary' || desc.includes('वेतन') || desc.includes('salary')) {
    return {
      transaction_name: '💼 फिक्स्ड मासिक वेतन (₹10,000 / ₹5,000)',
      source_name: 'मासिक टिकट लक्ष्य पूर्ति वेतन',
      source_category: 'monthly_salary',
      source_details: 'मासिक लक्ष्य पूर्ण करने पर आधिकारिक मानदेय',
    };
  }

  // 5. Bank / UPI Withdrawal
  if (type === 'bank_withdrawal' || desc.includes('निकासी') || desc.includes('withdrawal') || desc.includes('payout')) {
    return {
      transaction_name: '🏦 बैंक निकासी (Sunday Payout)',
      source_name: 'साप्ताहिक रविवार बैंक/UPI ट्रांसफर',
      source_category: 'bank_withdrawal',
      source_details: tx.description || 'साप्ताहिक रविवार सेटलमेंट निकासी',
    };
  }

  // 6. Ticket booking debit
  if (type === 'ticket_booking' || desc.includes('कटौती') || (desc.includes('टिकट बुकिंग') && (tx.amount || 0) < 0)) {
    return {
      transaction_name: '🚌 बस टिकट बुकिंग भुगतान',
      source_name: 'यात्री बस टिकट बुकिंग (Go Wallet कटौती)',
      source_category: 'ticket_booking_debit',
      source_details: tx.booking_code ? `बुकिंग कोड: ${tx.booking_code}` : tx.description,
    };
  }

  // 7. Wallet recharge
  if (type === 'recharge' || tx.recharge_id || desc.includes('रिचार्ज') || desc.includes('recharge') || desc.includes('utr')) {
    return {
      transaction_name: '💳 वॉलेट रिचार्ज / पैसे जोड़े',
      source_name: 'SafarGo UPI QR / बैंक ट्रांसफर',
      source_category: 'wallet_recharge',
      source_details: desc || 'Go Wallet में बैलेंस टॉप-अप',
    };
  }

  // 8. Quick commerce
  if (type === 'quick_commerce_sale' || desc.includes('क्विक कॉमर्स') || desc.includes('दुकान') || desc.includes('delivery')) {
    return {
      transaction_name: '🛍️ दुकान सामान बिक्री / डिलीवरी',
      source_name: 'क्विक डिलीवरी पार्टनर सेवा',
      source_category: 'quick_commerce',
      source_details: desc,
    };
  }

  // 9. Refund
  if (type === 'refund' || desc.includes('रिफंड') || desc.includes('refund') || desc.includes('वापसी')) {
    return {
      transaction_name: '↩️ टिकट रिफंड वापसी',
      source_name: 'रद्द टिकट राशि वापसी',
      source_category: 'refund',
      source_details: desc,
    };
  }

  // 10. Admin adjustment
  if (type === 'adjustment' || desc.includes('एडमिन') || desc.includes('admin') || desc.includes('इंसेंटिव')) {
    return {
      transaction_name: '⚡ एडमिन क्रेडिट / इंसेंटिव',
      source_name: 'सफरगो एडमिन समायोजन व बोनस',
      source_category: 'admin_adjustment',
      source_details: desc,
    };
  }

  return {
    transaction_name: (tx.amount || 0) >= 0 ? '💰 वॉलेट जमा राशि' : '💸 वॉलेट कटौती राशि',
    source_name: 'SafarGo Go Wallet',
    source_category: 'other',
    source_details: tx.description || 'खाता बही प्रविष्टि',
  };
}

export function enrichWalletTransaction(tx: WalletTransaction): WalletTransaction {
  if (tx.transaction_name && tx.source_name && tx.source_category) {
    return tx;
  }
  const inferred = inferTransactionCategory(tx);
  return {
    ...tx,
    transaction_name: tx.transaction_name || inferred.transaction_name,
    source_name: tx.source_name || inferred.source_name,
    source_category: tx.source_category || inferred.source_category,
    source_details: tx.source_details || inferred.source_details,
  };
}
