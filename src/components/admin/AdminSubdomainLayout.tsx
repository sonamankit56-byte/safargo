import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminBookingsTable } from './AdminBookingsTable';
import { AdminBookingReviewModal } from './AdminBookingReviewModal';
import { AdminAgentManagement } from './AdminAgentManagement';
import { AdminBusTripManagement } from './AdminBusTripManagement';
import { AdminCommissionAndSalary } from './AdminCommissionAndSalary';
import { AdminSettings } from './AdminSettings';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminSecurityDesk } from './AdminSecurityDesk';
import { AdminPromoterManagement } from './AdminPromoterManagement';
import { AdminSupportDesk } from './AdminSupportDesk';
import { AdminGoAgentDesk } from './AdminGoAgentDesk';
import { AdminOnboardingKycDesk } from './AdminOnboardingKycDesk';
import { getOnboardingApplications } from '../../lib/onboardingStorage';
import { SafarGoLogo } from '../common/SafarGoLogo';
import { buildSubdomainUrl } from '../../lib/subdomain';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Bus,
  DollarSign,
  Settings,
  History,
  ShieldCheck,
  Award,
  LogOut,
  ExternalLink,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Globe,
  LifeBuoy,
  Briefcase
} from 'lucide-react';

interface AdminSubdomainLayoutProps {
  onOpenBookingReview?: (bookingId: string) => void;
}

export const AdminSubdomainLayout: React.FC<AdminSubdomainLayoutProps> = () => {
  const { currentUser, role, isAdmin, login, logout, pendingLoginOtps } = useAuth();
  const { walletRecharges, bookings, supportTickets } = useData();

  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  const [selectedReviewBookingId, setSelectedReviewBookingId] = useState<string | null>(null);

  // Dedicated Admin Login State
  const [loginIdentifier, setLoginIdentifier] = useState('9876543210'); // Default demo admin mobile
  const [loginPassword, setLoginPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const pendingRechargesCount = (walletRecharges || []).filter((r) => r.status === 'pending').length;
  const pendingBookingsCount = (bookings || []).filter(
    (b) => b.status === 'booking_request' || b.status === 'awaiting_operator_confirmation'
  ).length;
  const pendingTicketsCount = (supportTickets || []).filter(
    (t) => t.status === 'pending' || t.status === 'open'
  ).length;

  const nowIsoStr = new Date().toISOString();
  const activeOtpCount = (pendingLoginOtps || []).filter(
    (o) => o.status === 'pending' && o.expires_at > nowIsoStr
  ).length;

  const onboardingApps = getOnboardingApplications();
  const pendingOnboardingCount = onboardingApps.filter((a) => a.status === 'pending').length;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const ok = await login(loginIdentifier.trim(), loginPassword);
      if (!ok) {
        setLoginError('गलत मोबाइल नंबर अथवा पासवर्ड। केवल सुपर एडमिन लॉगिन अनुमत है।');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'लॉगिन विफल। पुनः प्रयास करें।');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // If not logged in as Admin, show isolated Admin Gateway
  if (!currentUser || (!isAdmin && role !== 'admin')) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between font-sans">
        
        {/* Top Minimal Admin Bar */}
        <header className="p-4 sm:p-6 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SafarGoLogo size="sm" variant="light" showTagline={false} />
            <span className="px-2.5 py-1 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider">
              admin.safargo.in
            </span>
          </div>

          <a
            href={buildSubdomainUrl('main')}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>मुख्य पब्लिक पोर्टल पर जाएं</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        {/* Central Dedicated Admin Login Card */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] space-y-6 animate-in fade-in zoom-in-95">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-700 text-white flex items-center justify-center mx-auto shadow-xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                सुपर एडमिन कंट्रोल गेटवे
              </h1>
              <p className="text-xs text-slate-400">
                सुरक्षित सबडोमेन: <strong className="text-red-400 font-mono">admin.safargo.in</strong>
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  एडमिन मोबाइल / ईमेल *
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  पासवर्ड (Password) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                ℹ️ <strong>डेमो सुपर एडमिन:</strong> मोबाइल: <code className="text-amber-400">9876543210</code> | पासवर्ड: <code className="text-amber-400">admin123</code>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-sm rounded-xl shadow-lg transition active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>कंट्रोल डेस्क में प्रवेश करें ➔</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-500">
                256-bit SSL एन्क्रिप्टेड एडमिन कंसोल • अनधिकृत प्रयास रिकॉर्ड होते हैं
              </span>
            </div>

          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 text-center text-xs text-slate-500 border-t border-slate-900">
          SafarGo Super Admin Enterprise System • Dedicated Subdomain Environment
        </footer>

      </div>
    );
  }

  // Admin Logged In: Dedicated Fullscreen Admin Console with Isolated Admin Navbar
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Dedicated Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-red-500/40 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Admin Brand & Subdomain Badge */}
            <div className="flex items-center gap-3">
              <SafarGoLogo size="sm" variant="light" showTagline={false} />
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] font-black tracking-widest uppercase text-red-400">
                  Super Admin Console
                </span>
                <span className="text-xs font-mono text-slate-400">
                  admin.safargo.in
                </span>
              </div>
            </div>

            {/* Middle: Admin Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-bold">
              {[
                { id: 'dashboard', label: 'डैशबोर्ड', icon: LayoutDashboard },
                { id: 'onboarding-kyc', label: `📋 ऑनबोर्डिंग KYC (${pendingOnboardingCount})`, icon: FileText },
                { id: 'go-agent-desk', label: '👑 GO एजेंट डेस्क', icon: Award },
                { id: 'bookings', label: `बुकिंग्स (${pendingBookingsCount})`, icon: FileCheck },
                { id: 'agents', label: 'एजेंट प्रबंधन', icon: Users },
                { id: 'trips', label: 'बस ट्रिप्स', icon: Bus },
                { id: 'wallet', label: `Go Wallet (${pendingRechargesCount})`, icon: DollarSign },
                { id: 'settings', label: 'सेटिंग्स व डोमेन', icon: Settings },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeAdminTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id)}
                    className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                      active
                        ? 'bg-red-600 text-white shadow-md font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right: Switch Subdomain link & Logout */}
            <div className="flex items-center gap-2">
              <a
                href={buildSubdomainUrl('main')}
                target="_blank"
                rel="noreferrer"
                className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-amber-400/40 transition"
                title="पब्लिक वेबसाइट देखें"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>पब्लिक साइट</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">लॉगआउट</span>
              </button>
            </div>

          </div>

          {/* Mobile Admin Nav Row */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-800 text-xs">
            {[
              { id: 'dashboard', label: 'डैशबोर्ड' },
              { id: 'onboarding-kyc', label: `📋 KYC (${pendingOnboardingCount})` },
              { id: 'go-agent-desk', label: '👑 GO एजेंट' },
              { id: 'bookings', label: `बुकिंग्स (${pendingBookingsCount})` },
              { id: 'agents', label: 'एजेंट' },
              { id: 'trips', label: 'बसें' },
              { id: 'wallet', label: `वॉलेट (${pendingRechargesCount})` },
              { id: 'settings', label: 'सेटिंग्स' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl shrink-0 font-bold transition ${
                  activeAdminTab === tab.id
                    ? 'bg-red-600 text-white font-black'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

        </div>
      </header>

      {/* Main Admin Subdomain Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeAdminTab === 'dashboard' && (
          <AdminDashboard
            onNavigate={(tab) => {
              if (tab === 'onboarding-kyc' || tab === 'admin-kyc-desk' || tab === 'admin-onboarding') setActiveAdminTab('onboarding-kyc');
              else if (tab === 'go-agent-desk' || tab === 'admin-go-desk') setActiveAdminTab('go-agent-desk');
              else if (tab === 'admin-bookings') setActiveAdminTab('bookings');
              else if (tab === 'admin-agents') setActiveAdminTab('agents');
              else if (tab === 'admin-trips') setActiveAdminTab('trips');
              else if (tab === 'admin-settings') setActiveAdminTab('settings');
              else if (tab === 'go-wallet') setActiveAdminTab('wallet');
              else setActiveAdminTab(tab);
            }}
            onOpenBooking={(id) => setSelectedReviewBookingId(id)}
          />
        )}

        {activeAdminTab === 'onboarding-kyc' && (
          <AdminOnboardingKycDesk />
        )}

        {activeAdminTab === 'go-agent-desk' && (
          <AdminGoAgentDesk />
        )}

        {activeAdminTab === 'bookings' && (
          <AdminBookingsTable onOpenBooking={(id) => setSelectedReviewBookingId(id)} />
        )}

        {activeAdminTab === 'agents' && (
          <AdminAgentManagement />
        )}

        {activeAdminTab === 'wallet' && (
          <AdminCommissionAndSalary initialTab="wallet_requests" />
        )}

        {activeAdminTab === 'trips' && (
          <AdminBusTripManagement />
        )}

        {activeAdminTab === 'settings' && (
          <AdminSettings />
        )}
      </main>

      {/* Admin Booking Review Modal */}
      {selectedReviewBookingId && (
        <AdminBookingReviewModal
          booking={bookings.find((b) => b.id === selectedReviewBookingId) || null}
          onClose={() => setSelectedReviewBookingId(null)}
        />
      )}

      {/* Admin Footer */}
      <footer className="p-4 border-t border-slate-900 text-center text-xs text-slate-500 bg-slate-950">
        SafarGo Super Admin Console • Isolated Subdomain Environment [admin.safargo.in]
      </footer>

    </div>
  );
};
