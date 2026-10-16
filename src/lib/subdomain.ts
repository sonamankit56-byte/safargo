/**
 * Subdomain Detection and Management Utility for SafarGo
 * Supports:
 * - admin.yourdomain.com -> Super Admin Operations Center
 * - agent.yourdomain.com / go.yourdomain.com -> GO Agent 3D Terminal
 * - promoter.yourdomain.com -> Promoter Partner Program
 * - shop.yourdomain.com / partner.yourdomain.com -> Shopkeeper Quick Commerce Desk
 * - www.yourdomain.com / yourdomain.com -> Public Passenger Portal
 *
 * Also supports:
 * - Localhost subdomains: admin.localhost, agent.localhost, promoter.localhost, shop.localhost
 * - Query parameter overrides for instant browser testing: ?subdomain=admin | agent | promoter | shop
 * - Session/LocalStorage persistence
 */

export type AppSubdomain = 'main' | 'admin' | 'agent' | 'promoter' | 'shop' | 'creator' | 'careers' | 'login' | 'help';

export interface SubdomainConfig {
  id: AppSubdomain;
  title: string;
  badge: string;
  description: string;
  pathFallback: string;
  subdomainPrefix: string;
  themeColor: string;
}

export const SUBDOMAIN_CONFIGS: Record<AppSubdomain, SubdomainConfig> = {
  main: {
    id: 'main',
    title: 'SafarGo मुख्य पब्लिक यात्री पोर्टल',
    badge: 'Passenger Public',
    description: 'ऑनलाइन बस बुकिंग, लाइव सीट चयन, डिलीवरी ऑर्डर ट्रैकिंग व ग्राहक सेवाएं',
    pathFallback: '/',
    subdomainPrefix: 'www',
    themeColor: 'from-orange-500 to-amber-500',
  },
  admin: {
    id: 'admin',
    title: 'SafarGo सुपर एडमिन कंट्रोल पैनल',
    badge: 'Super Admin Desk',
    description: 'एजेंट अनुमोदन, टिकट कन्फर्मेशन, Go Instant Add Money रिव्यू, सैलरी व सुरक्षा डेस्क',
    pathFallback: '/admin/dashboard',
    subdomainPrefix: 'admin',
    themeColor: 'from-red-600 to-slate-900',
  },
  agent: {
    id: 'agent',
    title: 'GO Special Agent 3D Terminal',
    badge: 'GO CSC Agent',
    description: 'फ्लैट ₹20 कमीशन, 3-मिनट अप्रूवल, Go Instant Add Money एवं एडवांस निकासी',
    pathFallback: '/go-agent',
    subdomainPrefix: 'agent',
    themeColor: 'from-amber-400 via-orange-500 to-yellow-300',
  },
  promoter: {
    id: 'promoter',
    title: 'सफ़ारगो प्रमोटर पार्टनर प्रोग्राम',
    badge: 'Promoter Partner',
    description: '₹15,000 फिक्स्ड मासिक वेतन, 5 स्लॉट, एजेंट ऑनबोर्डिंग व मर्चेंट लिस्टिंग',
    pathFallback: '/promoter/dashboard',
    subdomainPrefix: 'promoter',
    themeColor: 'from-indigo-600 to-purple-600',
  },
  shop: {
    id: 'shop',
    title: 'सफ़ारगो दुकानदार मर्चेंट पोर्टल',
    badge: 'Merchant Dukandar',
    description: 'स्थानीय दुकान सूचीकरण, 15-मिनट डिलीवरी ऑर्डर प्रबंधन व Go Wallet कमाई',
    pathFallback: '/shop',
    subdomainPrefix: 'shop',
    themeColor: 'from-emerald-600 to-teal-600',
  },
  creator: {
    id: 'creator',
    title: 'SafarGo वायरल क्रिएटर व प्रमोशन धमाका',
    badge: 'Creator Rewards',
    description: 'Instagram Reel (1M = ₹500) व YouTube (10k = ₹100) नकद रिवॉर्ड क्लेम पोर्टल',
    pathFallback: '/creator',
    subdomainPrefix: 'creator',
    themeColor: 'from-pink-600 via-purple-600 to-indigo-700',
  },
  careers: {
    id: 'careers',
    title: 'SafarGo करियर व जॉब्स पोर्टल',
    badge: 'Careers & Hiring',
    description: 'मध्य प्रदेश व ग्रामीण भारत में स्थायी रोजगार, जॉब्स व ऑनलाइन आवेदन',
    pathFallback: '/careers',
    subdomainPrefix: 'careers',
    themeColor: 'from-blue-600 to-indigo-800',
  },
  login: {
    id: 'login',
    title: 'SafarGo यूनिफाइड लॉगिन एवं ऑथेंटिकेशन गेटवे',
    badge: 'Unified Auth Gateway',
    description: 'GO स्पेशल एजेंट, दुकानदार व यात्री सुरक्षित प्रवेश द्वार एवं पासवर्ड रिकवरी',
    pathFallback: '/login',
    subdomainPrefix: 'login',
    themeColor: 'from-amber-400 via-orange-500 to-red-600',
  },
  help: {
    id: 'help',
    title: 'SafarGo 24x7 एजेंट सहायता व समाधान केंद्र',
    badge: '24h SLA Guarantee',
    description: '24 घंटे में समाधान गारंटी, लाइव टिकट ट्रैकिंग, वॉलेट व पेआउट सहायता डेस्क',
    pathFallback: '/help',
    subdomainPrefix: 'help',
    themeColor: 'from-blue-600 via-indigo-600 to-slate-900',
  },
};

const STORAGE_KEY_CUSTOM_DOMAIN = 'safargo_custom_domain';
const STORAGE_KEY_SUBDOMAIN_OVERRIDE = 'safargo_subdomain_override';

export function getCustomDomain(): string {
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_DOMAIN) || 'safargo.in';
  } catch {
    return 'safargo.in';
  }
}

export function setCustomDomain(domain: string): void {
  try {
    const clean = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    localStorage.setItem(STORAGE_KEY_CUSTOM_DOMAIN, clean);
  } catch (e) {
    console.error('Failed to save custom domain:', e);
  }
}

/**
 * Detect current subdomain from hostname or query parameters
 */
export function detectSubdomain(): AppSubdomain {
  if (typeof window === 'undefined') return 'main';

  // 1. Priority: URL query parameter for testing (e.g. ?subdomain=admin)
  const searchParams = new URLSearchParams(window.location.search);
  const querySub = searchParams.get('subdomain')?.toLowerCase().trim();
  if (querySub && ['admin', 'agent', 'promoter', 'shop', 'creator', 'careers', 'login', 'help', 'main'].includes(querySub)) {
    return querySub as AppSubdomain;
  }

  // 2. LocalStorage override if set manually by developer/admin switcher
  try {
    const storedOverride = sessionStorage.getItem(STORAGE_KEY_SUBDOMAIN_OVERRIDE);
    if (storedOverride && ['admin', 'agent', 'promoter', 'shop', 'creator', 'careers', 'login', 'help', 'main'].includes(storedOverride)) {
      return storedOverride as AppSubdomain;
    }
  } catch {}

  // 3. Hostname inspection (e.g. admin.safargo.in, agent.mysite.com, admin.localhost)
  const hostname = window.location.hostname.toLowerCase();

  // Admin subdomains
  if (hostname.startsWith('admin.') || hostname === 'admin.localhost') {
    return 'admin';
  }

  // Login subdomains (login.safargo.in, auth.safargo.in)
  if (
    hostname.startsWith('login.') ||
    hostname.startsWith('auth.') ||
    hostname === 'login.localhost' ||
    hostname === 'auth.localhost'
  ) {
    return 'login';
  }

  // GO Agent subdomains
  if (
    hostname.startsWith('agent.') ||
    hostname.startsWith('go.') ||
    hostname === 'agent.localhost' ||
    hostname === 'go.localhost'
  ) {
    return 'agent';
  }

  // Promoter subdomains
  if (hostname.startsWith('promoter.') || hostname === 'promoter.localhost') {
    return 'promoter';
  }

  // Shopkeeper subdomains
  if (
    hostname.startsWith('shop.') ||
    hostname.startsWith('dukaan.') ||
    hostname.startsWith('partner.') ||
    hostname === 'shop.localhost'
  ) {
    return 'shop';
  }

  // Creator subdomains (creator.safargo.in)
  if (
    hostname.startsWith('creator.') ||
    hostname.startsWith('influencer.') ||
    hostname === 'creator.localhost'
  ) {
    return 'creator';
  }

  // Careers / Jobs subdomains (careers.safargo.in)
  if (
    hostname.startsWith('careers.') ||
    hostname.startsWith('career.') ||
    hostname.startsWith('jobs.') ||
    hostname === 'careers.localhost' ||
    hostname === 'jobs.localhost'
  ) {
    return 'careers';
  }

  // Help & Support subdomains (help.safargo.in, support.safargo.in)
  if (
    hostname.startsWith('help.') ||
    hostname.startsWith('support.') ||
    hostname === 'help.localhost' ||
    hostname === 'support.localhost'
  ) {
    return 'help';
  }

  return 'main';
}

/**
 * Set active subdomain override (useful for dev testing / preview deployments)
 */
export function setSubdomainOverride(sub: AppSubdomain | null): void {
  try {
    if (!sub || sub === 'main') {
      sessionStorage.removeItem(STORAGE_KEY_SUBDOMAIN_OVERRIDE);
    } else {
      sessionStorage.setItem(STORAGE_KEY_SUBDOMAIN_OVERRIDE, sub);
    }
  } catch {}
}

/**
 * Extract root apex domain even with multi-part TLDs (e.g. safargo.in, safargo.co.in)
 */
export function extractBaseDomain(hostname: string): string {
  const parts = hostname.toLowerCase().split('.');
  if (parts.length <= 2) return hostname;
  const knownTwoPartTlds = ['co.in', 'net.in', 'org.in', 'gov.in', 'edu.in', 'co.uk', 'org.uk', 'com.au', 'com.br'];
  const lastTwo = parts.slice(-2).join('.');
  if (knownTwoPartTlds.includes(lastTwo) && parts.length > 2) {
    return parts.slice(-3).join('.');
  }
  return parts.slice(-2).join('.');
}

/**
 * Build target URL for a given subdomain
 */
export function buildSubdomainUrl(
  targetSub: AppSubdomain,
  params?: Record<string, string | number | boolean>
): string {
  if (typeof window === 'undefined') return '/';

  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  let url = '/';

  // Local development handling
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    if (targetSub === 'main') {
      url = `${protocol}//localhost${port}/`;
    } else {
      // Supports query parameter testing locally:
      url = `${protocol}//localhost${port}/?subdomain=${targetSub}`;
    }
  } else if (hostname.endsWith('.vercel.app')) {
    // Vercel preview domain handling (e.g. safargo-xyz.vercel.app)
    if (targetSub === 'main') {
      url = `${protocol}//${hostname}${port}/`;
    } else {
      url = `${protocol}//${hostname}${port}/?subdomain=${targetSub}`;
    }
  } else {
    // Production custom domain handling (e.g. safargo.in, safargo.co.in)
    const baseDomain = extractBaseDomain(hostname);

    if (targetSub === 'main') {
      url = `${protocol}//${baseDomain}${port}/`;
    } else {
      const prefix = SUBDOMAIN_CONFIGS[targetSub].subdomainPrefix;
      url = `${protocol}//${prefix}.${baseDomain}${port}/`;
    }
  }

  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) {
        qs.append(k, String(v));
      }
    });
    const qsStr = qs.toString();
    if (qsStr) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}${qsStr}`;
    }
  }

  return url;
}
