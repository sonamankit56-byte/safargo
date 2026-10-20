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
