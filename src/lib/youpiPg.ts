import { YoupiGatewayConfig } from '../types/travel';

export const DEFAULT_YOUPI_CONFIG: YoupiGatewayConfig = {
  enabled: true,
  apiUrl: 'http://localhost:6100', // YouPI Payment Core Port
  merchantId: 'SFG-MERCHANT-001',
  merchantUpiVpa: 'safargo.pay@icici',
  merchantName: 'SafarGo Travel Super App',
  autoConfirmSandbox: true
};

const STORAGE_KEY = 'safargo_youpi_config';

export function getYoupiConfig(): YoupiGatewayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_YOUPI_CONFIG, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load YouPI config from localStorage:', e);
  }
  return DEFAULT_YOUPI_CONFIG;
}

export function saveYoupiConfig(cfg: Partial<YoupiGatewayConfig>): YoupiGatewayConfig {
  const current = getYoupiConfig();
  const updated: YoupiGatewayConfig = { ...current, ...cfg };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save YouPI config:', e);
  }
  return updated;
}

export interface UpiIntentLinks {
  generic: string;
  phonepe: string;
  gpay: string;
  paytm: string;
  cred: string;
  bhim: string;
}

/**
 * Generates direct NPCI-compliant UPI deep links for mobile and dynamic vector QR
 */
export function generateUpiDeepLinks(
  amount: number,
  orderId: string,
  note: string = 'SafarGo Ticket Payment',
  customVpa?: string,
  customName?: string
): UpiIntentLinks {
  const config = getYoupiConfig();
  const vpa = customVpa || config.merchantUpiVpa || 'safargo.pay@icici';
  const name = encodeURIComponent(customName || config.merchantName || 'SafarGo Travel Services');
  const cleanNote = encodeURIComponent(note);
  const formattedAmount = amount.toFixed(2);
  const tr = encodeURIComponent(orderId);

  // Standard NPCI UPI URI
  const generic = `upi://pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${tr}`;

  return {
    generic,
    phonepe: `upi://pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${tr}`,
    gpay: `tez://upi/pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${tr}`,
    paytm: `paytmmp://pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${tr}`,
    cred: `cred://pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${tr}`,
    bhim: `bhim://pay?pa=${vpa}&pn=${name}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${tr}`
  };
}

export interface YoupiSessionResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  checkoutUrl?: string;
  intentLinks: UpiIntentLinks;
  utr?: string;
  isSimulatedFallback?: boolean;
}

/**
 * Creates a payment session via YouPI-PG REST API.
 * Gracefully falls back to zero-crash local session if YouPI server is starting up.
 */
export async function createYoupiPaymentSession(params: {
  orderId: string;
  amount: number;
  customer: {
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  metadata?: Record<string, any>;
}): Promise<YoupiSessionResponse> {
  const config = getYoupiConfig();
  const intentLinks = generateUpiDeepLinks(params.amount, params.orderId, `SafarGo Order ${params.orderId}`);

  // Attempt to call YouPI-PG REST API
  if (config.enabled && config.apiUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${config.apiUrl.replace(/\/+$/, '')}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Merchant-Id': config.merchantId || 'SFG-MERCHANT-001'
        },
        body: JSON.stringify({
          orderId: params.orderId,
          amount: params.amount,
          currency: 'INR',
          customer: {
            phoneNumber: params.customer.phoneNumber,
            fullName: params.customer.fullName
          },
          metadata: {
            ...params.metadata,
            source: 'safargo-meesho'
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          paymentId: data.paymentId || data.id || `yp_${Date.now()}`,
          orderId: params.orderId,
          amount: Number(data.amount || params.amount),
          status: (data.status as any) || 'PENDING',
          checkoutUrl: data.checkoutUrl,
          intentLinks,
          utr: data.utr,
          isSimulatedFallback: false
        };
      }
    } catch (err) {
      console.info('YouPI PG service not directly reached on localhost, running with local smart checkout session:', err);
    }
  }

  // Graceful standalone fallback: create a local robust session
  const fallbackPaymentId = `yp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return {
    paymentId: fallbackPaymentId,
    orderId: params.orderId,
    amount: params.amount,
    status: 'PENDING',
    checkoutUrl: `${config.apiUrl}/pay/${fallbackPaymentId}`,
    intentLinks,
    isSimulatedFallback: true
  };
}

/**
 * Polls payment status from YouPI-PG service
 */
export async function pollYoupiPaymentStatus(paymentId: string): Promise<{
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  utr?: string;
}> {
  const config = getYoupiConfig();
  if (config.apiUrl && !paymentId.startsWith('yp_sim_')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${config.apiUrl.replace(/\/+$/, '')}/api/v1/payments/${paymentId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return {
          status: data.status,
          utr: data.utr
        };
      }
    } catch (e) {
      // Ignore polling errors
    }
  }

  // Check if simulated success was triggered in session storage
  const simulated = sessionStorage.getItem(`youpi_success_${paymentId}`);
  if (simulated) {
    const parsed = JSON.parse(simulated);
    return {
      status: 'SUCCESS',
      utr: parsed.utr
    };
  }

  return { status: 'PENDING' };
}

/**
 * Simulates an instant automated UPI bank settlement (for test/sandbox demo)
 */
export function simulateYoupiPaymentSuccess(paymentId: string): string {
  // Generate realistic 12-digit Indian Bank UTR
  const randomBankDigits = Math.floor(1000000000 + Math.random() * 9000000000);
  const utr = `YOUPI${randomBankDigits}`;
  sessionStorage.setItem(
    `youpi_success_${paymentId}`,
    JSON.stringify({
      status: 'SUCCESS',
      utr,
      verifiedAt: new Date().toISOString()
    })
  );
  return utr;
}

/**
 * Pings YouPI-PG Gateway to test daemon connectivity
 */
export async function testYoupiConnection(apiUrl?: string): Promise<{
  online: boolean;
  message: string;
  latencyMs?: number;
}> {
  const targetUrl = (apiUrl || getYoupiConfig().apiUrl).replace(/\/+$/, '');
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    // Try pinging the health or payment API endpoint
    const res = await fetch(`${targetUrl}/api/v1/payments/ping`, {
      signal: controller.signal
    }).catch(() => null);

    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (res && (res.status === 200 || res.status === 404 || res.status === 405)) {
      return {
        online: true,
        message: `YouPI PG सक्रिय है (प्रतिक्रिया समय: ${latencyMs}ms)`,
        latencyMs
      };
    }

    return {
      online: false,
      message: `YouPI PG सर्वर (${targetUrl}) ऑफलाइन है या शुरू नहीं हुआ है। (स्मार्ट सैंडबॉक्स एक्टिव रहेगा)`
    };
  } catch (err: any) {
    return {
      online: false,
      message: `कनेक्शन त्रुटि: YouPI गेटवे अभी ${targetUrl} पर चालू नहीं है।`
    };
  }
}
