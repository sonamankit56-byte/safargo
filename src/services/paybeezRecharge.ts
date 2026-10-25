// SafarGo Universal Telecom & Recharge Service
// Direct Cloud API Engine with Full CORS Support & Resilience for Custom Domains

export interface PlanItem {
  planCode: string;
  rs: number;
  validity: string;
  validityInDays?: number;
  name?: string;
  desc: string;
  data: string;
  talktime?: string;
  popular?: boolean;
}

export interface PlanGroup {
  type: string;
  label: string;
  count: number;
  plans: PlanItem[];
}

export interface DetectedOperator {
  company: string;
  circle: string;
  ekychubCircleCode?: string;
  operatorId: string;
  circleId: string;
}

/**
 * Instant local HLR Telecom Series detector for immediate operator and circle feedback
 */
export function detectIndianOperatorAndCircle(mobile: string): DetectedOperator {
  const clean = mobile.replace(/\D/g, '').slice(-10);
  const p3 = clean.slice(0, 3);
  const p4 = clean.slice(0, 4);

  let op = { company: 'Reliance Jio', operatorId: '140' };
  let cir = { circle: 'Madhya Pradesh & Chhattisgarh', circleId: '14' };

  // BSNL Series
  if (['940', '941', '942', '943', '944', '945', '946', '947', '948', '949'].includes(p3)) {
    op = { company: 'BSNL Mobile', operatorId: '3' };
  }
  // Vi (Vodafone Idea) Series
  else if (
    ['9826', '9827', '9893', '9755', '9977', '9926', '9098', '9179', '9165', '9171', '9009', '9039', '8109', '8120', '8871', '8878', '8989', '8982', '7869', '7879', '8223', '8224', '8225', '8226', '9820', '9821', '9833', '9867', '9819', '9892', '9822', '9823', '9850', '9860', '9890', '9921', '9922', '9923', '9762', '9763', '9764', '9765', '9766', '9767', '9960', '9011', '9021', '9028', '9049', '9158'].includes(p4) ||
    ['982', '989', '976', '992', '909', '917'].includes(p3)
  ) {
    op = { company: 'Vodafone Idea', operatorId: '338' };
  }
  // Airtel Series
  else if (
    ['704', '708', '740', '741', '742', '743', '744', '745', '746', '747', '748', '749', '763', '764', '765', '766', '767', '787', '788', '789', '800', '801', '805', '808', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '844', '845', '880', '881', '882', '883', '884', '885', '887', '895', '896', '900', '901', '902', '903', '904', '905', '910', '911', '912', '913', '914', '915', '916', '917', '919', '950', '951', '952', '953', '954', '955', '960', '961', '962', '963', '964', '965', '970', '971', '972', '973', '974', '975', '981', '983', '984', '987', '990', '991', '993', '994', '995', '998'].includes(p3)
  ) {
    op = { company: 'Airtel', operatorId: '1' };
  }
  // Jio Series (Default for 6xx and 7xx/8xx/93x)
  else {
    op = { company: 'Reliance Jio', operatorId: '140' };
  }

  // Circle Detection
  if (['9810', '9811', '9818', '9868', '9871', '9873', '9891', '9899', '9910', '9911', '9953', '9958', '9971', '9990', '9999'].includes(p4)) {
    cir = { circle: 'Delhi NCR', circleId: '5' };
  } else if (['9820', '9821', '9833', '9867', '9819', '9892'].includes(p4)) {
    cir = { circle: 'Mumbai', circleId: '6' };
  } else if (['9822', '9823', '9850', '9860', '9890', '9921', '9922', '9923'].includes(p4)) {
    cir = { circle: 'Maharashtra & Goa', circleId: '7' };
  } else if (['9415', '9450', '9451', '9452', '9453', '9454', '9455', '9839', '9838', '9935', '9936'].includes(p4)) {
    cir = { circle: 'UP East', circleId: '18' };
  } else {
    cir = { circle: 'Madhya Pradesh & Chhattisgarh', circleId: '14' };
  }

  return {
    company: op.company,
    operatorId: op.operatorId,
    circle: cir.circle,
    circleId: cir.circleId
  };
}

export interface AutoPlansResult {
  success: boolean;
  detected?: DetectedOperator;
  groups?: PlanGroup[];
  error?: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  paymentOrderId?: string;
  gatewayOrderId?: string;
  amountPaise?: string;
  feePaise?: string;
  error?: string;
}

export interface TelecomOperator {
  op: number;
  name: string;
}

export interface TelecomCircle {
  id: string;
  name: string;
}

// Direct Public API base supporting Full CORS
const PAYBEEZ_DIRECT_BASE = 'https://api.paybeez.in';

/**
 * Universal smart fetcher:
 * Tries direct CORS API first (works on any custom domain, Vercel, Netlify, Github Pages),
 * then falls back to local relative proxy path.
 */
async function smartRechargeFetch(localPath: string, directPath: string, options?: RequestInit): Promise<any> {
  const directUrl = `${PAYBEEZ_DIRECT_BASE}${directPath}`;

  // 1. Direct Public API (Official, CORS-enabled, Zero-delay on Custom Domains)
  try {
    const res = await fetch(directUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {})
      }
    });

    const text = await res.text();
    try {
      const data = JSON.parse(text);
      if (res.ok || (data && (data.success !== undefined || data.data || data.error))) {
        return data;
      }
    } catch {}
  } catch (directErr) {
    console.warn('Direct Telecom API attempt failed, trying local proxy:', directErr);
  }

  // 2. Local Proxy Fallback (Vite dev proxy or Serverless function)
  try {
    const res = await fetch(localPath, options);
    const text = await res.text();
    return JSON.parse(text);
  } catch (localErr) {
    console.error('All Telecom API routes failed:', localErr);
    throw localErr;
  }
}

/**
 * Instant fallback plans when offline or telecom gateway takes >2s
 */
export function getFallbackPlanGroups(companyName: string): PlanGroup[] {
  const comp = (companyName || '').toLowerCase();
  const rawPlans: PlanItem[] = comp.includes('airtel') ? [
    { planCode: 'AIRTEL-299', rs: 299, validity: '28 Din', data: '1.5 GB/Day', name: 'Truly Unlimited', desc: 'Unlimited Calls + 1.5GB/Day + 100 SMS/Day + Apollo 24|7 Circle + Free Hellotunes', popular: true },
    { planCode: 'AIRTEL-199', rs: 199, validity: '28 Din', data: '2 GB Kul', name: 'Voice + Data', desc: 'Unlimited Calls + 2GB High Speed Data + 100 SMS/Day' },
    { planCode: 'AIRTEL-349', rs: 349, validity: '28 Din', data: '2 GB/Day', name: 'Hero Unlimited 5G', desc: 'Unlimited Calls + 2GB/Day + Unlimited 5G Data + Disney+ Hotstar Mobile 3 Months' },
    { planCode: 'AIRTEL-859', rs: 859, validity: '84 Din', data: '1.5 GB/Day', name: 'Bestseller 3 Months', desc: 'Unlimited Calls + 1.5GB/Day + 100 SMS/Day + RewardsMini Subscription', popular: true },
    { planCode: 'AIRTEL-19', rs: 19, validity: '1 Din', data: '1 GB', name: 'Data Booster', desc: '1GB High Speed Data Booster Pack' }
  ] : (comp.includes('idea') || comp.includes('vi') || comp.includes('vodafone')) ? [
    { planCode: 'VI-299', rs: 299, validity: '28 Din', data: '1.5 GB/Day', name: 'Hero Unlimited', desc: 'Unlimited Calls + 1.5GB/Day + Binge All Night (12am-6am) + Weekend Data Rollover', popular: true },
    { planCode: 'VI-199', rs: 199, validity: '28 Din', data: '2 GB Kul', name: 'Voice Pack', desc: 'Unlimited Calls + 2GB Data + 300 SMS' },
    { planCode: 'VI-349', rs: 349, validity: '28 Din', data: '2.5 GB/Day', name: 'Daily Data Delight', desc: 'Unlimited Calls + 2.5GB/Day + Binge All Night + 2GB Backup Data Every Month' },
    { planCode: 'VI-859', rs: 859, validity: '84 Din', data: '1.5 GB/Day', name: 'Quarterly Hero', desc: 'Unlimited Calls + 1.5GB/Day + Binge All Night + Data Delight 84 Days', popular: true },
    { planCode: 'VI-19', rs: 19, validity: '1 Din', data: '1 GB', name: 'Data Booster', desc: '1GB High Speed Data Pack' }
  ] : comp.includes('bsnl') ? [
    { planCode: 'BSNL-199', rs: 199, validity: '30 Din', data: '2 GB/Day', name: 'Voice + Data Unlimited', desc: 'Unlimited Calls to Any Network + 2GB/Day Data + 100 SMS/Day', popular: true },
    { planCode: 'BSNL-299', rs: 299, validity: '30 Din', data: '3 GB/Day', name: 'Heavy Data Special', desc: 'Unlimited Calls + 3GB/Day High Speed Data + BSNL Tunes' },
    { planCode: 'BSNL-599', rs: 599, validity: '84 Din', data: '3 GB/Day', name: '84 Days Super Saver', desc: 'Unlimited Calls + 3GB/Day Data + 100 SMS/Day + Zing Music' }
  ] : [
    // Jio Default
    { planCode: 'JIO-299', rs: 299, validity: '28 Din', data: '1.5 GB/Day', name: 'Popular 1.5GB/Day', desc: 'Unlimited True 5G Data + Unlimited Calls + 1.5GB/Day 4G Data + 100 SMS/Day + JioCinema/JioTV', popular: true },
    { planCode: 'JIO-198', rs: 198, validity: '14 Din', data: '2 GB/Day', name: 'Speed Booster', desc: 'Unlimited Calls + 2GB/Day + Unlimited 5G Data' },
    { planCode: 'JIO-349', rs: 349, validity: '28 Din', data: '2 GB/Day', name: 'Hero True 5G', desc: 'Unlimited True 5G + 2GB/Day 4G Data + Unlimited Calls + 100 SMS/Day + Jio Apps' },
    { planCode: 'JIO-899', rs: 899, validity: '90 Din', data: '2 GB/Day', name: 'Long Term True 5G', desc: 'Unlimited True 5G + 2GB/Day + 20GB Extra Data + Unlimited Calls 90 Days', popular: true },
    { planCode: 'JIO-19', rs: 19, validity: 'Base Plan', data: '1 GB', name: 'Data Add-on', desc: '1GB High Speed 4G Data Add-on Voucher' },
    { planCode: 'JIO-29', rs: 29, validity: 'Base Plan', data: '2 GB', name: 'Data Add-on', desc: '2GB High Speed 4G Data Add-on' }
  ];

  return [
    { type: 'popular', label: 'पॉपुलर प्लान्स', count: rawPlans.length, plans: rawPlans },
    { type: 'unlimited', label: 'ट्रूली अनलिमिटेड (5G)', count: rawPlans.filter(p => p.rs >= 199).length, plans: rawPlans.filter(p => p.rs >= 199) },
    { type: 'data', label: 'डेटा बूस्टर', count: rawPlans.filter(p => p.rs < 100).length, plans: rawPlans.filter(p => p.rs < 100) }
  ];
}

export async function fetchOperators(): Promise<TelecomOperator[]> {
  try {
    const json = await smartRechargeFetch(
      '/api/recharge/operators',
      '/v1/recharge/prepaid/operators'
    );
    return json.success && json.data?.items ? json.data.items : [];
  } catch (err) {
    console.error('fetchOperators error:', err);
    return [
      { op: 140, name: 'Reliance Jio' },
      { op: 1, name: 'Airtel' },
      { op: 338, name: 'Vodafone Idea' },
      { op: 3, name: 'BSNL' }
    ];
  }
}

export async function fetchCircles(): Promise<TelecomCircle[]> {
  try {
    const json = await smartRechargeFetch(
      '/api/recharge/circles',
      '/v1/recharge/prepaid/circles'
    );
    return json.success && json.data?.items ? json.data.items : [];
  } catch (err) {
    console.error('fetchCircles error:', err);
    return [
      { id: '14', name: 'Madhya Pradesh & Chhattisgarh' },
      { id: '5', name: 'Delhi NCR' },
      { id: '6', name: 'Mumbai' },
      { id: '7', name: 'Maharashtra & Goa' },
      { id: '18', name: 'UP East' }
    ];
  }
}

export async function fetchPlansByOperator(opId: string | number, cirId: string | number): Promise<AutoPlansResult> {
  try {
    const json = await smartRechargeFetch(
      `/api/recharge/plans?opId=${encodeURIComponent(opId)}&cirId=${encodeURIComponent(cirId)}`,
      `/v1/recharge/prepaid/plans?opId=${encodeURIComponent(opId)}&cirId=${encodeURIComponent(cirId)}`
    );

    if (json.success && json.data?.groups && json.data.groups.length > 0) {
      return {
        success: true,
        groups: json.data.groups
      };
    }
  } catch (err: any) {
    console.error('fetchPlansByOperator error:', err);
  }

  // Fallback plans based on opId
  const opName = String(opId) === '1' ? 'Airtel' : String(opId) === '338' ? 'Vi' : String(opId) === '3' ? 'BSNL' : 'Jio';
  return {
    success: true,
    groups: getFallbackPlanGroups(opName)
  };
}

export async function fetchAutoPlans(mobile: string): Promise<AutoPlansResult> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, error: 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें' };
  }

  const localDetected = detectIndianOperatorAndCircle(cleanMobile);

  try {
    const json = await smartRechargeFetch(
      '/api/recharge/plans-auto',
      '/v1/recharge/prepaid/plans-auto',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile })
      }
    );

    if (json.success && json.data) {
      const groups = json.data.plans?.groups || [];
      if (groups.length > 0) {
        return {
          success: true,
          detected: json.data.detected || localDetected,
          groups: groups
        };
      }
    }
  } catch (err: any) {
    console.error('Recharge fetchAutoPlans failed:', err);
  }

  // Secondary Fallback: Fetch by operator id & circle id
  try {
    const opPlans = await fetchPlansByOperator(localDetected.operatorId, localDetected.circleId);
    if (opPlans.success && opPlans.groups && opPlans.groups.length > 0) {
      return {
        success: true,
        detected: localDetected,
        groups: opPlans.groups
      };
    }
  } catch {}

  // Tertiary Fallback: Instant curated categorized plans
  return {
    success: true,
    detected: localDetected,
    groups: getFallbackPlanGroups(localDetected.company)
  };
}

export async function createRechargeCheckout(params: {
  mobile: string;
  amountRupees: number;
  opId: string;
  cirId: string;
  planCode: string;
  planName?: string;
  company?: string;
}): Promise<CheckoutResult> {
  try {
    const cleanMobile = params.mobile.replace(/\D/g, '').slice(-10);
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://safargo.in';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const returnUrl = `${currentOrigin}${currentPath}?action=recharge_return`;

    const payload = {
      mobile: cleanMobile,
      amountRupees: params.amountRupees,
      opId: params.opId,
      cirId: params.cirId,
      planCode: params.planCode,
      planName: params.planName || 'Voice + 4G Data',
      company: params.company || 'Telecom Prepaid',
      utmSource: 'safargo',
      surface: 'quick',
      redeem: false,
      redirectUrl: returnUrl,
      returnUrl: returnUrl,
      callbackUrl: returnUrl,
      idempotencyKey: `safargo-${cleanMobile}-${params.amountRupees}-${Date.now()}`
    };

    const json = await smartRechargeFetch(
      '/api/recharge/checkout',
      '/v1/public/recharge/checkout',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (json.success && json.data) {
      return {
        success: true,
        checkoutUrl: json.data.checkoutUrl,
        paymentOrderId: json.data.paymentOrderId,
        gatewayOrderId: json.data.gatewayOrderId,
        amountPaise: json.data.amountPaise,
        feePaise: json.data.feePaise
      };
    } else {
      return {
        success: false,
        error: json.error?.message || 'पेमेंट गेटवे शुरू करने में समस्या। कृपया पुनः प्रयास करें।'
      };
    }
  } catch (err: any) {
    console.error('Recharge createCheckout failed:', err);
    return { success: false, error: err.message || 'नेटवर्क त्रुटि' };
  }
}

export interface OrderStatusData {
  id: string;
  paymentOrderId: string;
  gatewayOrderId: string;
  status: 'CREATED' | 'PENDING' | 'PAID' | 'FULFILLED' | 'FAILED' | 'REFUNDED';
  number: string;
  operator: string;
  circle: string;
  amountPaise: string;
  feePaise: string;
  totalPaise: string;
  operatorRef?: string | null;
  providerTxRef?: string | null;
  providerTxId?: string | null;
  rechargeAgent?: string | null;
  serviceOrderId?: string | null;
  errorMessage?: string | null;
  createdAt?: string;
  paidAt?: string | null;
  fulfilledAt?: string | null;
}

export interface OrderStatusResult {
  success: boolean;
  data?: OrderStatusData;
  error?: string;
}

export async function checkOrderStatus(orderId: string): Promise<OrderStatusResult> {
  try {
    const json = await smartRechargeFetch(
      `/api/recharge/orders/${encodeURIComponent(orderId)}`,
      `/v1/public/recharge/orders/${encodeURIComponent(orderId)}`
    );
    return json;
  } catch (err: any) {
    console.error('checkOrderStatus failed:', err);
    return { success: false, error: err.message || 'नेटवर्क समस्या' };
  }
}
