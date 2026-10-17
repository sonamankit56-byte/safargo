import React, { useState } from 'react';
import { usePortal } from '../../context/PortalContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Bus, 
  Menu, 
  X, 
  Search, 
  Ticket, 
  ShieldCheck, 
  UserPlus, 
  PhoneCall, 
  Sprout, 
  Truck, 
  Wallet,
  HelpCircle,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import { SubdomainId } from '../../lib/types';
import { SafarGoLogo } from './SafarGoLogo';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { activePortal, activeMeta, setActivePortal } = usePortal();
  const { currentUser, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getPortalNavItems = () => {
    switch (activePortal) {
      case 'www':
        return [
          { id: 'home', label: 'Home', action: () => onSelectTab?.('home') },
          { id: 'search', label: 'Search Buses', action: () => setActivePortal('book') },
          { id: 'services', label: 'Services', action: () => onSelectTab?.('services') },
          { id: 'go_agent', label: 'Go Agent Program', action: () => setActivePortal('go') },
          { id: 'kisan', label: 'Kisan Services', action: () => setActivePortal('kisan') },
          { id: 'help', label: 'Support', action: () => setActivePortal('help') },
        ];
      case 'book':
        return [
          { id: 'search', label: 'Search Buses', action: () => onSelectTab?.('search') },
          { id: 'my_bookings', label: 'My Bookings', action: () => onSelectTab?.('my_bookings') },
          { id: 'lookup', label: 'Lookup by Ref', action: () => onSelectTab?.('lookup') },
          { id: 'cancellation', label: 'Cancel Booking', action: () => onSelectTab?.('cancellation') },
        ];
      case 'agent':
        return [
          { id: 'dashboard', label: 'Agent Hub', action: () => onSelectTab?.('dashboard') },
          { id: 'new_booking', label: 'Book for Customer', action: () => onSelectTab?.('new_booking') },
          { id: 'bookings', label: 'Booking Records', action: () => onSelectTab?.('bookings') },
          { id: 'commission', label: 'Commission Ledger', action: () => onSelectTab?.('commission') },
          { id: 'referrals', label: 'Referrals', action: () => onSelectTab?.('referrals') },
        ];
      case 'go':
        return [
          { id: 'dashboard', label: 'Target Progress', action: () => onSelectTab?.('dashboard') },
          { id: 'new_booking', label: 'Book Customer', action: () => onSelectTab?.('new_booking') },
          { id: 'salary', label: 'Fixed Salary (₹5K)', action: () => onSelectTab?.('salary') },
          { id: 'commission', label: 'Per-Booking (₹19.34)', action: () => onSelectTab?.('commission') },
          { id: 'referrals', label: 'Referral Rewards', action: () => onSelectTab?.('referrals') },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Operations Overview', action: () => onSelectTab?.('dashboard') },
          { id: 'queue', label: 'Booking Queue', action: () => onSelectTab?.('queue') },
          { id: 'operators', label: 'Bus Operators', action: () => onSelectTab?.('operators') },
          { id: 'agents', label: 'Agents & Go Network', action: () => onSelectTab?.('agents') },
          { id: 'routes', label: 'Routes & Services', action: () => onSelectTab?.('routes') },
          { id: 'offers', label: 'Coupons & Offers', action: () => onSelectTab?.('offers') },
          { id: 'refunds', label: 'Refunds Review', action: () => onSelectTab?.('refunds') },
          { id: 'agri', label: 'Agri Operations', action: () => onSelectTab?.('agri') },
          { id: 'audit', label: 'Audit Logs', action: () => onSelectTab?.('audit') },
          { id: 'settings', label: 'Settings', action: () => onSelectTab?.('settings') },
        ];
      case 'operator':
        return [
          { id: 'assigned', label: 'Assigned Requests', action: () => onSelectTab?.('assigned') },
          { id: 'services', label: 'My Bus Schedules', action: () => onSelectTab?.('services') },
          { id: 'history', label: 'Confirmation History', action: () => onSelectTab?.('history') },
        ];
      case 'kisan':
        return [
          { id: 'listings', label: 'My Crop Listings', action: () => onSelectTab?.('listings') },
          { id: 'new_listing', label: 'List Harvest', action: () => onSelectTab?.('new_listing') },
          { id: 'inquiries', label: 'Buyer Inquiries', action: () => onSelectTab?.('inquiries') },
          { id: 'transport', label: 'Transport Pickup', action: () => onSelectTab?.('transport') },
        ];
      case 'buyer':
        return [
          { id: 'marketplace', label: 'Browse Crops', action: () => onSelectTab?.('marketplace') },
          { id: 'inquiries', label: 'My Purchase Inquiries', action: () => onSelectTab?.('inquiries') },
          { id: 'logistics', label: 'Agri Logistics', action: () => setActivePortal('transport') },
        ];
      case 'transport':
        return [
          { id: 'requests', label: 'Available Transport Requests', action: () => onSelectTab?.('requests') },
          { id: 'active_trips', label: 'My Vehicle Deliveries', action: () => onSelectTab?.('active_trips') },
        ];
      case 'pay':
        return [
          { id: 'lookup', label: 'Check Payment Status', action: () => onSelectTab?.('lookup') },
          { id: 'refunds', label: 'Refund Records', action: () => onSelectTab?.('refunds') },
        ];
      case 'help':
        return [
          { id: 'faqs', label: 'FAQs', action: () => onSelectTab?.('faqs') },
          { id: 'new_ticket', label: 'Submit Ticket', action: () => onSelectTab?.('new_ticket') },
          { id: 'my_tickets', label: 'My Tickets', action: () => onSelectTab?.('my_tickets') },
        ];
      case 'partner':
        return [
          { id: 'dashboard', label: 'Partner Hub', action: () => onSelectTab?.('dashboard') },
          { id: 'referrals', label: 'Referral Performance', action: () => onSelectTab?.('referrals') },
          { id: 'payouts', label: 'Settlements', action: () => onSelectTab?.('payouts') },
        ];
      default:
        return [];
    }
  };

  const navItems = getPortalNavItems();

  return (
    <header className="bg-safargo-navy text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Tagline with 3D Emblem */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActivePortal('www')}>
            <SafarGoLogo size="md" variant="light" showTagline={true} showBadge={false} />
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-slate-800/80 px-2 py-0.5 rounded text-orange-400 border border-slate-700">
              {activePortal.toUpperCase()}
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentTab === item.id
                    ? 'bg-safargo-orange text-white shadow'
                    : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Quick Subdomain Shortcuts */}
          <div className="hidden md:flex items-center space-x-2">
            {activePortal !== 'book' && (
              <button
                onClick={() => setActivePortal('book')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-safargo-orange hover:bg-orange-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Book Bus</span>
              </button>
            )}

            {activePortal !== 'admin' && isAdmin && (
              <button
                onClick={() => setActivePortal('admin')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            )}

            {activePortal !== 'go' && (
              <button
                onClick={() => setActivePortal('go')}
                className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-medium rounded-lg border border-purple-700 transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-purple-400" />
                <span>Go Agent</span>
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
            {activeMeta.name} Menu
          </div>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                item.action();
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentTab === item.id
                  ? 'bg-safargo-orange text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
              Switch Subdomain Portal
            </div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button onClick={() => { setActivePortal('book'); setMobileMenuOpen(false); }} className="px-2 py-1.5 rounded bg-slate-800 text-orange-400 text-left">Bus Booking</button>
              <button onClick={() => { setActivePortal('agent'); setMobileMenuOpen(false); }} className="px-2 py-1.5 rounded bg-slate-800 text-amber-400 text-left">Regular Agent</button>
              <button onClick={() => { setActivePortal('go'); setMobileMenuOpen(false); }} className="px-2 py-1.5 rounded bg-slate-800 text-purple-400 text-left">Go Agent HQ</button>
              <button onClick={() => { setActivePortal('admin'); setMobileMenuOpen(false); }} className="px-2 py-1.5 rounded bg-slate-800 text-red-400 text-left">Admin Ops</button>
              <button onClick={() => { setActivePortal('kisan'); setMobileMenuOpen(false); }} className="px-2 py-1.5 rounded bg-slate-800 text-emerald-400 text-left">Kisan Services</button>
              <button onClick={() => { setActivePortal('operator'); setMobileMenuOpen(false); }} className="px-2 py-1.5 rounded bg-slate-800 text-indigo-400 text-left">Operator Desk</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
