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

export type AppSubdomain = 'main' | 'admin' | 'agent' | 'promoter' | 'shop';

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
  if (querySub && ['admin', 'agent', 'promoter', 'shop', 'main'].includes(querySub)) {
    return querySub as AppSubdomain;
  }

  // 2. LocalStorage override if set manually by developer/admin switcher
  try {
    const storedOverride = sessionStorage.getItem(STORAGE_KEY_SUBDOMAIN_OVERRIDE);
    if (storedOverride && ['admin', 'agent', 'promoter', 'shop', 'main'].includes(storedOverride)) {
      return storedOverride as AppSubdomain;
    }
  } catch {}

  // 3. Hostname inspection (e.g. admin.safargo.in, agent.mysite.com, admin.localhost)
  const hostname = window.location.hostname.toLowerCase();

  // Admin subdomains
  if (hostname.startsWith('admin.') || hostname === 'admin.localhost') {
    return 'admin';
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
export function buildSubdomainUrl(targetSub: AppSubdomain): string {
  if (typeof window === 'undefined') return '/';

  const hostname = window.location.hostname;
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  // Local development handling
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    if (targetSub === 'main') {
      return `${protocol}//localhost${port}/`;
    }
    // Supports query parameter testing locally:
    return `${protocol}//localhost${port}/?subdomain=${targetSub}`;
  }

  // Vercel preview domain handling (e.g. safargo-xyz.vercel.app)
  if (hostname.endsWith('.vercel.app')) {
    if (targetSub === 'main') {
      return `${protocol}//${hostname}${port}/`;
    }
    return `${protocol}//${hostname}${port}/?subdomain=${targetSub}`;
  }

  // Production custom domain handling (e.g. safargo.in, safargo.co.in)
  const baseDomain = extractBaseDomain(hostname);

  if (targetSub === 'main') {
    return `${protocol}//${baseDomain}${port}/`;
  }

  const prefix = SUBDOMAIN_CONFIGS[targetSub].subdomainPrefix;
  return `${protocol}//${prefix}.${baseDomain}${port}/`;
}
