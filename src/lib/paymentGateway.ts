// ============================================================================
// SafarGo Sovereign Multi-Gateway Engine (Razorpay Live + UPI Intent + Cashfree)
// ============================================================================

export interface GatewayConfig {
  provider: 'razorpay' | 'cashfree' | 'phonepe' | 'youpi';
  isLive: boolean;
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  merchantName: string;
  merchantVpa: string;
  themeColor: string;
}

const STORAGE_KEY = 'safargo_payment_gateway_config';

export const REAL_RAZORPAY_KEY_ID = 'rzp_live_Ts22ERsXSrUTOG';
export const REAL_RAZORPAY_SECRET = 'h4r597kKdRcIfMUbtz6ttjO8';

export const DEFAULT_GATEWAY_CONFIG: GatewayConfig = {
  provider: 'razorpay',
  isLive: true,
  razorpayKeyId: REAL_RAZORPAY_KEY_ID,
  razorpayKeySecret: REAL_RAZORPAY_SECRET,
  merchantName: 'SafarGo Super App',
  merchantVpa: 'safargo.pay@icici',
  themeColor: '#0B194C'
};

export function getGatewayConfig(): GatewayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.razorpayKeyId || parsed.razorpayKeyId.startsWith('rzp_test')) {
        parsed.razorpayKeyId = REAL_RAZORPAY_KEY_ID;
        parsed.razorpayKeySecret = REAL_RAZORPAY_SECRET;
        parsed.isLive = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return { ...DEFAULT_GATEWAY_CONFIG, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load gateway config:', e);
  }
  return DEFAULT_GATEWAY_CONFIG;
}

export function saveGatewayConfig(cfg: Partial<GatewayConfig>): GatewayConfig {
  const current = getGatewayConfig();
  const updated: GatewayConfig = { ...current, ...cfg };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save gateway config:', e);
  }
  return updated;
}

export interface PaymentOrderParams {
  amount: number; // in Rupees (e.g. 550)
  orderId: string; // e.g. SFG-BUS-1729
  title: string; // e.g. "Indore to Bhopal Volvo Bus Ticket"
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes?: Record<string, string>;
}

export interface PaymentSuccessResult {
  paymentId: string;
  orderId: string;
  signature?: string;
  provider: string;
}

/**
 * Dynamically loads official Razorpay Checkout SDK v1
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Opens the Official Real Indian Payment Gateway Modal (PhonePe, GPay, Paytm, Cards, NetBanking)
 */
export async function openPaymentGateway(
  params: PaymentOrderParams,
  onSuccess: (res: PaymentSuccessResult) => void,
  onFailure: (errorMsg: string) => void
): Promise<void> {
  const config = getGatewayConfig();

  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !(window as any).Razorpay) {
    onFailure('पेमेंट गेटवे लोड नहीं हो सका। कृपया इंटरनेट कनेक्शन जांचें।');
    return;
  }

  // Attempt to create server-side order on Razorpay API if serverless endpoint is available
  let razorpayOrderId: string | undefined = undefined;
  try {
    const orderRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: params.amount,
        receipt: params.orderId,
        notes: params.notes
      })
    });
    if (orderRes.ok) {
      const orderData = await orderRes.json();
      if (orderData.success && orderData.order?.id) {
        razorpayOrderId = orderData.order.id;
      }
    }
  } catch (e) {
    console.warn('Serverless order creation skipped, using client checkout:', e);
  }

  // Convert amount to paise (1 INR = 100 paise)
  const amountPaise = Math.round(params.amount * 100);

  const options: any = {
    key: config.razorpayKeyId || REAL_RAZORPAY_KEY_ID,
    amount: amountPaise,
    currency: 'INR',
    name: config.merchantName || 'SafarGo',
    description: params.title || 'SafarGo Online Booking',
    image: 'https://cdn-icons-png.flaticon.com/512/1048/1048314.png',
    handler: function (response: any) {
      if (response && response.razorpay_payment_id) {
        onSuccess({
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id || razorpayOrderId || params.orderId,
          signature: response.razorpay_signature,
          provider: 'razorpay'
        });
      } else {
        onFailure('पेमेंट कन्फर्मेशन प्राप्त नहीं हुआ।');
      }
    },
    prefill: {
      name: params.customer.name || '',
      email: params.customer.email || 'customer@safargo.in',
      contact: params.customer.phone ? params.customer.phone.replace(/\D/g, '').slice(-10) : ''
    },
    notes: {
      app: 'SafarGo Super App',
      serviceOrder: params.orderId,
      ...(params.notes || {})
    },
    theme: {
      color: config.themeColor || '#0B194C'
    },
    modal: {
      ondismiss: function () {
        console.log('User closed payment gateway modal');
      },
      confirm_close: true
    }
  };

  if (razorpayOrderId) {
    options.order_id = razorpayOrderId;
  }

  try {
    const rzpInstance = new (window as any).Razorpay(options);
    rzpInstance.on('payment.failed', function (response: any) {
      console.warn('Razorpay payment failed:', response.error);
      const desc = response.error?.description || response.error?.reason || 'भुगतान असफल रहा';
      if (desc.toLowerCase().includes('domain') || desc.toLowerCase().includes('not register')) {
        onFailure('Razorpay सुरक्षा अलर्ट: कृपया अपने Razorpay Dashboard में जाकर Account & Settings > Website Details में अपना यह डोमेन जोड़ें।');
      } else {
        onFailure(desc);
      }
    });
    rzpInstance.open();
  } catch (err: any) {
    console.error('Error opening Razorpay:', err);
    onFailure(err.message || 'पेमेंट गेटवे शुरू करने में समस्या आई।');
  }
}
