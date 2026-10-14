export const TAB_TO_PATH: Record<string, string> = {
  'home': '/',
  'quick-delivery': '/quick-delivery',
  'track-order': '/track-order',
  'promoter-program': '/promoter',
  'promoter-dashboard': '/promoter/dashboard',
  'customer-portal': '/customer',
  'shopkeeper-portal': '/shop',
  'go-wallet': '/go-wallet',

  // Agent tabs
  'go-agent': '/go-agent',
  'dashboard': '/agent/dashboard',
  'new-booking': '/agent/new-booking',
  'my-bookings': '/agent/my-bookings',
  'commission': '/agent/commission',
  'refer-earn': '/agent/refer-earn',
  'viral-promotions': '/agent/viral-promotions',
  'agent-deliveries': '/agent/deliveries',
  'agent-profile': '/agent/profile',

  // Special / Subdomain tabs
  'creator': '/creator',
  'careers': '/careers',

  // Admin tabs
  'admin-dashboard': '/admin/dashboard',
  'admin-promoters': '/admin/promoters',
  'admin-bookings': '/admin/bookings',
  'admin-agents': '/admin/agents',
  'admin-kyc-desk': '/admin/kyc-desk',
  'admin-security-desk': '/admin/security-desk',
  'admin-trips': '/admin/trips',
  'admin-promotions': '/admin/promotions',
  'admin-salary': '/admin/salary',
  'admin-settings': '/admin/settings',
  'admin-logs': '/admin/logs',
  'admin-support-desk': '/admin/support',
  'admin-jobs': '/admin/jobs',
};

export const PATH_TO_TAB: Record<string, string> = {
  '/': 'home',
  '/quick-delivery': 'quick-delivery',
  '/track-order': 'track-order',
  '/promoter': 'promoter-program',
  '/promoter/dashboard': 'promoter-dashboard',
  '/customer': 'customer-portal',
  '/customer-portal': 'customer-portal',
  '/shop': 'shopkeeper-portal',
  '/shopkeeper-portal': 'shopkeeper-portal',
  '/go-wallet': 'go-wallet',
  '/creator': 'creator',
  '/careers': 'careers',

  // Agent paths
  '/go-agent': 'go-agent',
  '/agent': 'dashboard',
  '/agent/dashboard': 'dashboard',
  '/agent/new-booking': 'new-booking',
  '/agent/my-bookings': 'my-bookings',
  '/agent/commission': 'commission',
  '/agent/refer-earn': 'refer-earn',
  '/agent/viral-promotions': 'viral-promotions',
  '/agent/deliveries': 'agent-deliveries',
  '/agent/profile': 'agent-profile',

  // Admin paths
  '/admin': 'admin-dashboard',
  '/admin/dashboard': 'admin-dashboard',
  '/admin/promoters': 'admin-promoters',
  '/admin/bookings': 'admin-bookings',
  '/admin/agents': 'admin-agents',
  '/admin/kyc-desk': 'admin-kyc-desk',
  '/admin/security-desk': 'admin-security-desk',
  '/admin/trips': 'admin-trips',
  '/admin/promotions': 'admin-promotions',
  '/admin/salary': 'admin-salary',
  '/admin/settings': 'admin-settings',
  '/admin/logs': 'admin-logs',
  '/admin/support': 'admin-support-desk',
  '/admin/jobs': 'admin-jobs',
};

export function getTabFromPath(pathname: string): string {
  // Remove trailing slash if present (except for root '/')
  const cleanPath = pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (cleanPath.startsWith('/track-order')) {
    return 'track-order';
  }

  return PATH_TO_TAB[cleanPath] || 'home';
}

export function getPathFromTab(tab: string): string {
  return TAB_TO_PATH[tab] || '/';
}
