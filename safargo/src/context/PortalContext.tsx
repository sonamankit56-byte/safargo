import React, { createContext, useContext, useState, useEffect } from 'react';
import { SubdomainId } from '../lib/types';

export interface SubdomainMeta {
  id: SubdomainId;
  hostname: string;
  name: string;
  hindiName: string;
  description: string;
  badge: string;
  color: string;
}

export const SUBDOMAINS: SubdomainMeta[] = [
  {
    id: 'www',
    hostname: 'www.safargo.in',
    name: 'Main Portal',
    hindiName: 'मुख्य पोर्टल',
    description: 'Brand introduction, services overview, search widget, offers, FAQs, and registration.',
    badge: 'Public',
    color: 'bg-blue-600',
  },
  {
    id: 'book',
    hostname: 'book.safargo.in',
    name: 'Customer Booking',
    hindiName: 'बस बुकिंग',
    description: 'Search routes, submit booking requests, 15-min assistance timer, status tracking & receipts.',
    badge: 'Customer',
    color: 'bg-orange-600',
  },
  {
    id: 'agent',
    hostname: 'agent.safargo.in',
    name: 'Regular Agent',
    hindiName: 'नियमित एजेंट',
    description: 'Agent booking requests, commission tracking, KYC verification, and payout requests.',
    badge: 'Agent',
    color: 'bg-amber-600',
  },
  {
    id: 'go',
    hostname: 'go.safargo.in',
    name: 'Special Go Agent',
    hindiName: 'गो एजेंट (विशेष)',
    description: 'Monthly target (150), fixed salary (₹5,000), per-booking commission (₹19.34), and referral rewards.',
    badge: 'Go Agent',
    color: 'bg-purple-600',
  },
  {
    id: 'admin',
    hostname: 'admin.safargo.in',
    name: 'Admin Operations',
    hindiName: 'प्रशासन नियंत्रण',
    description: 'Assisted booking queue, delayed alerts, operator confirmations, commission ledgers, and audit logs.',
    badge: 'Admin Only',
    color: 'bg-red-700',
  },
  {
    id: 'operator',
    hostname: 'operator.safargo.in',
    name: 'Bus Operator',
    hindiName: 'बस संचालक',
    description: 'Operator profiles, assigned requests, availability verification, schedules, and genuine PNR input.',
    badge: 'Operator',
    color: 'bg-indigo-600',
  },
  {
    id: 'kisan',
    hostname: 'kisan.safargo.in',
    name: 'Kisan Agriculture',
    hindiName: 'किसान सेवा',
    description: 'Farmer registration, crop listings, harvest dates, mandi pickup requests, and payment tracking.',
    badge: 'Farmer',
    color: 'bg-emerald-600',
  },
  {
    id: 'buyer',
    hostname: 'buyer.safargo.in',
    name: 'Agri Buyer Mandi',
    hindiName: 'कृषि खरीदार',
    description: 'Buyer registration, crop procurement, listings, purchase inquiries, and transaction records.',
    badge: 'Buyer',
    color: 'bg-teal-600',
  },
  {
    id: 'transport',
    hostname: 'transport.safargo.in',
    name: 'Kisan Transport',
    hindiName: 'कृषि परिवहन',
    description: 'Transporter logistics, vehicle capacities, rural pickup and mandi delivery requests.',
    badge: 'Transport',
    color: 'bg-cyan-700',
  },
  {
    id: 'pay',
    hostname: 'pay.safargo.in',
    name: 'Payment & Receipts',
    hindiName: 'भुगतान व रसीद',
    description: 'Payment status verification, transaction history, breakdown, and refund progress.',
    badge: 'Finance',
    color: 'bg-emerald-700',
  },
  {
    id: 'help',
    hostname: 'help.safargo.in',
    name: 'Help & Support',
    hindiName: 'सहायता केंद्र',
    description: 'Support tickets, booking complaints, WhatsApp assistance, and resolution tracking.',
    badge: 'Support',
    color: 'bg-sky-600',
  },
  {
    id: 'partner',
    hostname: 'partner.safargo.in',
    name: 'Business Partner',
    hindiName: 'पार्टनर नेटवर्क',
    description: 'B2B travel partners, referral campaigns, reward tracking, and partner settlements.',
    badge: 'Partner',
    color: 'bg-slate-700',
  },
];

interface PortalContextType {
  activePortal: SubdomainId;
  activeMeta: SubdomainMeta;
  setActivePortal: (id: SubdomainId) => void;
  allPortals: SubdomainMeta[];
  getPortalUrl: (id: SubdomainId, path?: string) => string;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const detectInitialPortal = (): SubdomainId => {
    // 1. Check URL query param first (for testing and local preview e.g. ?portal=admin)
    const urlParams = new URLSearchParams(window.location.search);
    const portalParam = urlParams.get('portal') as SubdomainId;
    if (portalParam && SUBDOMAINS.some((s) => s.id === portalParam)) {
      return portalParam;
    }

    // 2. Check localStorage dev preference
    const saved = localStorage.getItem('safargo_active_subdomain') as SubdomainId;
    if (saved && SUBDOMAINS.some((s) => s.id === saved)) {
      return saved;
    }

    // 3. Check actual window.location.hostname
    const hostname = window.location.hostname.toLowerCase();
    for (const sub of SUBDOMAINS) {
      if (hostname === sub.hostname || hostname.startsWith(`${sub.id}.`)) {
        return sub.id;
      }
    }

    // Default to www portal
    return 'www';
  };

  const [activePortal, setActivePortalState] = useState<SubdomainId>(detectInitialPortal);

  useEffect(() => {
    localStorage.setItem('safargo_active_subdomain', activePortal);
  }, [activePortal]);

  const setActivePortal = (id: SubdomainId) => {
    setActivePortalState(id);
    localStorage.setItem('safargo_active_subdomain', id);
    // Update URL query param cleanly without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('portal', id);
    window.history.pushState({}, '', url.toString());
  };

  const activeMeta = SUBDOMAINS.find((s) => s.id === activePortal) || SUBDOMAINS[0];

  const getPortalUrl = (id: SubdomainId, path: string = ''): string => {
    // In local dev, generate internal URL with portal query param
    return `/?portal=${id}${path ? `&path=${encodeURIComponent(path)}` : ''}`;
  };

  return (
    <PortalContext.Provider
      value={{
        activePortal,
        activeMeta,
        setActivePortal,
        allPortals: SUBDOMAINS,
        getPortalUrl,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
