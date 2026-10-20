// Government UIDAI Verhoeff Checksum Algorithm & Anti-Fraud KYC Engine

// The multiplication table (d)
const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// The permutation table (p)
const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

/**
 * Validates a 12-digit Indian Aadhaar number using official UIDAI Verhoeff Checksum.
 * Catches 100% of single-digit errors and consecutive transposed digit errors.
 */
export const validateAadhaarVerhoeff = (aadhaarStr: string): boolean => {
  const clean = aadhaarStr.replace(/\D/g, '');
  if (clean.length !== 12) return false;

  // Cannot start with 0 or 1 per UIDAI rules
  if (clean.startsWith('0') || clean.startsWith('1')) return false;

  // Repetitive patterns check (e.g., 999999999999 or 888888888888)
  if (/^(\d)\1{11}$/.test(clean)) return false;

  let c = 0;
  const invertedArray = clean.split('').reverse().map(Number);

  for (let i = 0; i < invertedArray.length; i++) {
    c = VERHOEFF_D[c][VERHOEFF_P[i % 8][invertedArray[i]]];
  }

  return c === 0;
};

/**
 * Validates Indian Income Tax PAN Card Structure and Entity
 */
export const validatePanCard = (panStr: string): { valid: boolean; entityType?: string; error?: string } => {
  const clean = panStr.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

  if (!panRegex.test(clean)) {
    return { valid: false, error: 'पैन कार्ड 10 अक्षरों का होना चाहिए (जैसे: ABCDE1234F)' };
  }

  const fourthChar = clean.charAt(3);
  const entityMap: Record<string, string> = {
    P: 'व्यक्तिगत (Individual)',
    C: 'कंपनी (Company)',
    H: 'हिन्दू अविभाजित परिवार (HUF)',
    F: 'फर्म (Firm / Partnership)',
    A: 'एसोसिएशन (AOP)',
    T: 'ट्रस्ट (Trust)',
    B: 'व्यक्तियों का निकाय (BOI)',
    L: 'स्थानीय प्राधिकरण (Local Authority)',
    J: 'कृत्रिम न्यायिक व्यक्ति (AJP)',
    G: 'सरकारी एजेंसी (Government)'
  };

  const entityType = entityMap[fourthChar];
  if (!entityType) {
    return { valid: false, error: 'अमान्य पैन इकाई कोड (Invalid PAN Entity Type)' };
  }

  return { valid: true, entityType };
};

/**
 * Auto-detects Indian Bank from 11-digit RBI IFSC Code
 */
export const getBankFromIfsc = (ifscStr: string): { valid: boolean; bankName: string } => {
  const clean = ifscStr.trim().toUpperCase();
  if (clean.length !== 11) {
    return { valid: false, bankName: '' };
  }

  const prefix = clean.slice(0, 4);
  const ifscMap: Record<string, string> = {
    SBIN: 'भारतीय स्टेट बैंक (State Bank of India)',
    HDFC: 'HDFC Bank Ltd.',
    ICIC: 'ICICI Bank Ltd.',
    PUNB: 'पंजाब नेशनल बैंक (Punjab National Bank)',
    BARB: 'बैंक ऑफ बड़ौदा (Bank of Baroda)',
    CNRB: 'केनरा बैंक (Canara Bank)',
    UBIN: 'यूनियन बैंक ऑफ इंडिया (Union Bank of India)',
    CBIN: 'सेंट्रल बैंक ऑफ इंडिया (Central Bank of India)',
    BKID: 'बैंक ऑफ इंडिया (Bank of India)',
    IDIB: 'इंडियन बैंक (Indian Bank)',
    IOBA: 'इंडियन ओवरसीज बैंक (Indian Overseas Bank)',
    UTIB: 'एक्सिस बैंक (Axis Bank Ltd.)',
    KKBK: 'कोटक महिंद्रा बैंक (Kotak Mahindra Bank)',
    INDB: 'इंडसइंड बैंक (IndusInd Bank)',
    YESB: 'यस बैंक (Yes Bank Ltd.)',
    IDFB: 'IDFC First Bank Ltd.',
    MAHB: 'बैंक ऑफ महाराष्ट्र (Bank of Maharashtra)',
    PSIB: 'पंजाब एंड सिंध बैंक (Punjab & Sind Bank)'
  };

  const detected = ifscMap[prefix] || 'मान्य अनुसूचित बैंक (Scheduled Commercial Bank)';
  return { valid: true, bankName: detected };
};
