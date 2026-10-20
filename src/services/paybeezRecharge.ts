// SafarGo Headless Recharge Service (Powered by Automated Telecom Switch)

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
    op = { company: 'Vodafone Idea (Vi)', operatorId: '338' };
  }
  // Airtel Series
  else if (
    ['704', '708', '740', '741', '742', '743', '744', '745', '746', '747', '748', '749', '763', '764', '765', '766', '767', '787', '788', '789', '800', '801', '805', '808', '810', '811', '812', '813', '814', '815', '816', '817', '818', '819', '844', '845', '880', '881', '882', '883', '884', '885', '887', '895', '896', '900', '901', '902', '903', '904', '905', '910', '911', '912', '913', '914', '915', '916', '917', '919', '950', '951', '952', '953', '954', '955', '960', '961', '962', '963', '964', '965', '970', '971', '972', '973', '974', '975', '981', '983', '984', '987', '990', '991', '993', '994', '995', '998'].includes(p3)
  ) {
    op = { company: 'Bharti Airtel', operatorId: '1' };
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

export async function fetchOperators(): Promise<TelecomOperator[]> {
  try {
    const res = await fetch('/api/recharge/operators');
    const json = await res.json();
    return json.success && json.data?.items ? json.data.items : [];
  } catch (err) {
    console.error('fetchOperators error:', err);
    return [];
  }
}

export async function fetchCircles(): Promise<TelecomCircle[]> {
  try {
    const res = await fetch('/api/recharge/circles');
    const json = await res.json();
    return json.success && json.data?.items ? json.data.items : [];
  } catch (err) {
    console.error('fetchCircles error:', err);
    return [];
  }
}

export async function fetchPlansByOperator(opId: string | number, cirId: string | number): Promise<AutoPlansResult> {
  try {
    const res = await fetch(`/api/recharge/plans?opId=${encodeURIComponent(opId)}&cirId=${encodeURIComponent(cirId)}`);
    const json = await res.json();
    if (json.success && json.data?.groups) {
      return {
        success: true,
        groups: json.data.groups
      };
    } else {
      return {
        success: false,
        error: json.error?.message || 'प्लान्स लोड करने में असमर्थ'
      };
    }
  } catch (err: any) {
    console.error('fetchPlansByOperator error:', err);
    return { success: false, error: err.message || 'नेटवर्क समस्या' };
  }
}

export async function fetchAutoPlans(mobile: string): Promise<AutoPlansResult> {
  const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
  if (cleanMobile.length !== 10) {
    return { success: false, error: 'कृपया 10-अंकीय वैध मोबाइल नंबर दर्ज करें' };
  }

  try {
    const res = await fetch('/api/recharge/plans-auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: cleanMobile })
    });

    const json = await res.json();
    if (json.success && json.data) {
      return {
        success: true,
        detected: json.data.detected,
        groups: json.data.plans?.groups || []
      };
    } else {
      return {
        success: false,
        error: json.error?.message || 'प्लान्स लोड करने में असमर्थ'
      };
    }
  } catch (err: any) {
    console.error('Recharge fetchAutoPlans failed:', err);
    return { success: false, error: err.message || 'नेटवर्क समस्या' };
  }
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
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const returnUrl = `${currentOrigin}${currentPath}?action=recharge_return`;

    const res = await fetch('/api/recharge/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      })
    });

    const json = await res.json();
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
        error: json.error?.message || 'पेमेंट लिंक बनाने में समस्या'
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
    const res = await fetch(`/api/recharge/orders/${encodeURIComponent(orderId)}`);
    const json = await res.json();
    return json;
  } catch (err: any) {
    console.error('checkOrderStatus failed:', err);
    return { success: false, error: err.message || 'नेटवर्क समस्या' };
  }
}
