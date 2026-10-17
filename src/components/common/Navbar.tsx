import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SafarGoLogo } from './SafarGoLogo';
import { Go3DLogoBadge } from '../wallet/GoWalletHub';
import { Go3DUltraLogo } from './Go3DUltraLogo';
import { WalletRechargeModal } from '../agent/WalletRechargeModal';
import {
  Bus,
  LayoutDashboard,
  PlusCircle,
  FileText,
  DollarSign,
  UserCheck,
  Settings,
  ShieldAlert,
  LogOut,
  Users,
  Menu,
  X,
  History,
  AlertCircle,
  Gift,
  Home,
  LogIn,
  UserPlus,
  User,
  Wallet,
  Sparkles,
  CheckCircle,
  CreditCard,
  ShieldCheck,
  Bike,
  Award,
  Store,
  Tag,
  Clock,
  Package,
  Globe
} from 'lucide-react';
import { ComingSoonModal } from './ComingSoonModal';
import { getFeatureMode } from '../../lib/featureFlags';
import { buildSubdomainUrl } from '../../lib/subdomain';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (initialTab?: 'login' | 'register' | 'promoter_login') => void;
  onOpenGoAuth?: (mode?: 'login' | 'register') => void;
  onOpenSubdomains?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth, onOpenGoAuth, onOpenSubdomains }) => {
  const { currentUser, role, isApprovedAgent, isAdmin, isPromoter, logout, allProfiles, pendingLoginOtps } = useAuth();
  const { settings, agentWalletBalance } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<{
    isOpen: boolean;
    name: string;
    desc?: string;
  }>({ isOpen: false, name: '' });

  const qdMode = getFeatureMode(settings, 'feature_quick_delivery_mode');
  const prmMode = getFeatureMode(settings, 'feature_promoter_program_mode');
  const custMode = getFeatureMode(settings, 'feature_customer_portal_mode');
  const shopMode = getFeatureMode(settings, 'feature_shopkeeper_portal_mode');

  const pendingKycCount = allProfiles
    ? allProfiles.filter(
        (p) =>
          (p.role === 'agent' || (!p.role && p.agent_status)) &&
          p.kyc_status?.toLowerCase().trim() === 'pending'
      ).length
    : 0;

  const nowIso = new Date().toISOString();
  const activeOtpCount = pendingLoginOtps
    ? pendingLoginOtps.filter((o) => o.status === 'pending' && o.expires_at > nowIso).length
    : 0;


  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setCurrentTab('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A2885] border-b border-[#071E66] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 3D Animated Logo & Brand */}
          <div className="flex items-center cursor-pointer py-1" onClick={() => handleTabChange('home')}>
            <SafarGoLogo size="md" variant="light" showBadge={true} showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {/* Global Home link */}
            <button
              onClick={() => handleTabChange('home')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentTab === 'home'
                  ? 'bg-white/20 text-white shadow-xs'
                  : 'text-blue-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>होम (Home)</span>
            </button>

            {/* RedBus / Live Bus Booking */}
            <button
              onClick={() => handleTabChange('bus-booking')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                currentTab === 'bus-booking'
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
                  : 'text-amber-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>बस टिकटिंग (Book Bus)</span>
              <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                LIVE
              </span>
            </button>

            {/* Nearby / Quick Delivery */}
            {qdMode !== 'hidden' && (
              <button
                onClick={() => {
                  if (qdMode === 'coming_soon') {
                    setComingSoonModal({
                      isOpen: true,
                      name: 'नजदीकी ऑर्डर डिलीवरी',
                      desc: 'सिरोंज, कुरवाई, लटेरी, चंदेरी, गुना, बीना आदि कस्बों में डिलीवरी सेवा बहुत जल्द शुरू हो रही है!'
                    });
                  } else {
                    handleTabChange(role === 'agent' ? 'agent-deliveries' : 'quick-delivery');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  currentTab === 'quick-delivery' || currentTab === 'agent-deliveries'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bike className="w-4 h-4 text-emerald-400" />
                <span>{role === 'agent' ? 'नजदीकी ऑर्डर डिलीवर करें' : 'लोकल डिलीवरी'}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black ${
                  qdMode === 'coming_soon' ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-emerald-400 text-slate-900'
                }`}>
                  {qdMode === 'coming_soon' ? '⏳ जल्द' : '⚡ MP'}
                </span>
              </button>
            )}

            {/* SafarGo Order Track */}
            <button
              onClick={() => handleTabChange('track-order')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                currentTab === 'track-order'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Package className="w-4 h-4 text-indigo-400" />
              <span>SafarGo आर्डर ट्रैक</span>
            </button>

            {/* Promoter Partner Program */}
            {prmMode !== 'hidden' && (
              <button
                onClick={() => {
                  if (prmMode === 'coming_soon' && role !== 'promoter' && role !== 'admin') {
                    setComingSoonModal({
                      isOpen: true,
                      name: 'सफ़ारगो प्रमोटर पार्टनर प्रोग्राम',
                      desc: 'सुपर एडमिन के नीचे 5 एक्सक्लूसिव पद व ₹15,000 मासिक वेतन प्रोग्राम का अगला चरण जल्द शुरू हो रहा है!'
                    });
                  } else {
                    handleTabChange(role === 'promoter' ? 'promoter-dashboard' : role === 'admin' ? 'admin-promoters' : 'promoter-program');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                  currentTab === 'promoter-program' || currentTab === 'promoter-dashboard' || currentTab === 'admin-promoters'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>{role === 'promoter' ? 'प्रमोटर डैशबोर्ड' : role === 'admin' ? 'प्रमोटर (5 स्लॉट)' : 'प्रमोटर (₹15,000)'}</span>
                {prmMode === 'coming_soon' && role !== 'promoter' && role !== 'admin' && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                    ⏳ जल्द
                  </span>
                )}
              </button>
            )}

            {currentUser && role === 'promoter' && (
              <button
                onClick={() => handleTabChange('promoter-dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  currentTab === 'promoter-dashboard'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                प्रमोटर डेस्क
              </button>
            )}

            {currentUser && role === 'customer' && (
              <button
                onClick={() => handleTabChange('customer-portal')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  currentTab === 'customer-portal'
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User className="w-4 h-4 text-orange-400" />
                <span>ग्राहक डैशबोर्ड</span>
              </button>
            )}

            {currentUser && role === 'shopkeeper' && (
              <button
                onClick={() => handleTabChange('shopkeeper-portal')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  currentTab === 'shopkeeper-portal'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>दुकानदार पोर्टल</span>
              </button>
            )}

            {/* ⚡ GO Special Agent Ultra 3D Terminal Option (Direct Subdomain Redirection) */}
            {(!isAdmin && role !== 'admin') && (
              <button
                onClick={() => {
                  window.location.href = buildSubdomainUrl('agent');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-xs shadow-md transition border cursor-pointer active:scale-95 ${
                  currentTab === 'go-agent'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 text-slate-950 border-white ring-2 ring-amber-400'
                    : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 hover:border-amber-400 text-white border-amber-400/70 shadow-amber-500/20'
                }`}
                title="👑 GO Special Agent Ultra 3D Terminal — फ्लैट ₹20/टिकट कमीशन (agent.safargo.in)"
              >
                <Go3DUltraLogo size="sm" showBadge={false} interactive={false} />
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-400 text-slate-950">
                  ₹20/टिकट
                </span>
              </button>
            )}

            {/* Universal 3D Go Wallet Option (For Agent, Dukandar, Promoter & All Users) */}
            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth('login');
                } else {
                  handleTabChange('go-wallet');
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-xs shadow-md transition border cursor-pointer ${
                currentTab === 'go-wallet'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 text-slate-950 border-white'
                  : 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 hover:from-indigo-900 hover:to-slate-800 text-white border-amber-400/50'
              }`}
              title="3D Go Wallet — दुकानदार बिक्री, प्रमोटर कमाई, बस बुकिंग, Top Ad व Transactions"
            >
              <Go3DLogoBadge size="sm" showWalletText={true} />
              {currentUser && (
                <span className="bg-emerald-400 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-black">
                  ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
                </span>
              )}
            </button>

            {currentUser && role === 'agent' && (
              <>

                <button
                  onClick={() => handleTabChange('go-agent')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-black transition ${
                    currentTab === 'go-agent'
                      ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 text-slate-950 shadow-sm'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  GO एजेंट 3D टर्मिनल
                </button>

                <button
                  onClick={() => handleTabChange('new-booking')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'new-booking'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  New Booking
                </button>

                <button
                  onClick={() => handleTabChange('my-bookings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'my-bookings'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Bookings
                </button>

                <button
                  onClick={() => handleTabChange('commission')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'commission'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Commission & Ledger
                </button>

                <button
                  onClick={() => handleTabChange('refer-earn')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'refer-earn'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                  Refer & Earn (₹50)
                </button>

                <button
                  onClick={() => {
                    window.location.href = buildSubdomainUrl('creator');
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'viral-promotions'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title="क्रिएटर रिवॉर्ड पोर्टल (creator.safargo.in)"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  क्रिएटर बोनस (Earn ₹500)
                </button>

                <button
                  onClick={() => handleTabChange('agent-deliveries')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'agent-deliveries'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bike className="w-4 h-4 text-emerald-400" />
                  डिलीवरी रनर
                </button>
              </>
            )}

            {currentUser && role === 'admin' && (
              <>
                <button
                  onClick={() => handleTabChange('admin-dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-dashboard'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Overview
                </button>

                <button
                  onClick={() => handleTabChange('admin-promoters')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-promoters'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-indigo-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  प्रमोटर (5 स्लॉट)
                </button>

                <button
                  onClick={() => handleTabChange('admin-bookings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-bookings'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Bookings Desk
                </button>

                <button
                  onClick={() => handleTabChange('admin-promotions')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-promotions'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Tag className="w-4 h-4 text-emerald-400" />
                  <span>प्रोमो कोड व ऑफर्स</span>
                </button>

                <button
                  onClick={() => handleTabChange('admin-agents')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-agents'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Agents
                </button>

                <button
                  onClick={() => handleTabChange('admin-kyc-desk')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-kyc-desk'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-amber-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>KYC Desk</span>
                  {pendingKycCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 animate-pulse">
                      {pendingKycCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('admin-security-desk')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-security-desk'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Security & OTP</span>
                  {activeOtpCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-900 animate-pulse">
                      {activeOtpCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('admin-trips')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-trips'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  Bus Inventory
                </button>

                <button
                  onClick={() => handleTabChange('admin-salary')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-salary'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  Payouts & Salary
                </button>

                <button
                  onClick={() => handleTabChange('admin-settings')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-settings'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </button>

                <button
                  onClick={() => handleTabChange('admin-logs')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'admin-logs'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Audit Logs
                </button>
              </>
            )}
          </nav>

          {/* Right Area: Auth Buttons (Guest) or User Profile (Logged in) */}
          <div className="flex items-center gap-3">
            
            {!currentUser ? (
              /* Guest Actions: Real Login & Register buttons */
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.location.href = buildSubdomainUrl('login');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-full border border-white/20 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-amber-300" />
                  <span>लॉगिन</span>
                </button>

                {prmMode !== 'hidden' && (
                  <button
                    onClick={() => {
                      if (prmMode === 'coming_soon') {
                        setComingSoonModal({
                          isOpen: true,
                          name: 'प्रमोटिंग पार्टनर प्रोग्राम (₹15,000/माह)',
                          desc: 'प्रमोटिंग पार्टनर प्रोग्राम व लॉगिन पोर्टल बहुत जल्द लाइव किया जा रहा है!'
                        });
                      } else {
                        window.location.href = `${buildSubdomainUrl('login')}?role=promoter`;
                      }
                    }}
                    className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-full transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                    title="विशेष प्रमोटिंग पार्टनर लॉगिन पोर्टल (₹15,000/माह)"
                  >
                    <Award className="w-3.5 h-3.5 text-slate-950" />
                    <span>प्रमोटर</span>
                    {prmMode === 'coming_soon' && (
                      <span className="text-[9px] font-extrabold bg-slate-950 text-amber-300 px-1 rounded">
                        जल्द
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    window.location.href = `${buildSubdomainUrl('login')}?role=agent`;
                  }}
                  className="px-4 py-2 bg-[#FF6500] hover:bg-[#e65c00] text-white font-extrabold text-xs rounded-full transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                  title="अधिकृत SafarGo एजेंट बनें (login.safargo.in)"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>GO एजेंट बनें</span>
                </button>
              </div>
            ) : (
              /* Logged In User Profile & Sign Out */
              <div className="flex items-center gap-2.5">
                {/* Agent Approval Status */}
                {role === 'agent' && (
                  <div className="hidden sm:flex items-center gap-2">
                    {/* Agent Prepaid Wallet Balance Pill */}
                    <button
                      onClick={() => setIsWalletModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-950 to-slate-800 hover:from-emerald-900 hover:to-slate-700 text-white rounded-xl border border-emerald-500/40 transition shadow-xs group"
                      title="वॉलेट बैलेंस देखें व रिचार्ज करें (न्यूनतम ₹2,000)"
                    >
                      <Wallet className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-emerald-300">
                        ₹{agentWalletBalance.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded-full">
                        +जोड़ें
                      </span>
                    </button>

                    {isApprovedAgent ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                        <UserCheck className="w-3.5 h-3.5" />
                        Verified Agent
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Pending Approval
                      </span>
                    )}
                  </div>
                )}


                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 text-left transition"
                  >
                    <div className="relative shrink-0">
                      <div className="w-7 h-7 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-orange-400 border border-slate-600">
                        {currentUser?.avatar_url ? (
                          <img src={currentUser.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          currentUser?.full_name?.charAt(0) || 'U'
                        )}
                      </div>
                      {currentUser?.photo_verified && (
                        <div
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white border border-slate-900"
                          title="Verified Partner ✓"
                        >
                          <CheckCircle className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                      <div className="hidden lg:block text-xs">
                      <div className="font-semibold text-white leading-tight flex items-center gap-1">
                        <span>{currentUser?.full_name}</span>
                        {currentUser?.photo_verified && (
                          <span className="text-[10px] text-emerald-400">✓</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {isAdmin
                          ? 'SUPER ADMIN'
                          : role === 'customer'
                          ? 'CUSTOMER'
                          : role === 'shopkeeper'
                          ? 'SHOPKEEPER'
                          : role === 'promoter'
                          ? 'PROMOTER'
                          : currentUser?.shop_name || 'AGENT'}
                      </div>
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 text-xs">
                      <div className="px-4 py-3 border-b border-slate-700">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-sm">{currentUser?.full_name}</p>
                          {currentUser?.photo_verified && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-black px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                              Verified ✓
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs truncate mt-0.5">{currentUser?.email || currentUser?.mobile}</p>
                        <p className="text-orange-400 text-[11px] font-semibold mt-1">
                          रोल: {isAdmin
                            ? 'सुपर एडमिन'
                            : role === 'promoter'
                            ? 'प्रमोटर'
                            : role === 'customer'
                            ? 'ग्राहक'
                            : role === 'shopkeeper'
                            ? 'दुकानदार'
                            : 'अधिकृत एजेंट'}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
                        {role === 'customer' && (
                          <button
                            onClick={() => {
                              handleTabChange('customer-portal');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl flex items-center gap-2 transition"
                          >
                            <User className="w-4 h-4 text-orange-400" />
                            <span>मेरी टिकटें व डिलीवरी</span>
                          </button>
                        )}

                        {role === 'shopkeeper' && (
                          <button
                            onClick={() => {
                              handleTabChange('shopkeeper-portal');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl flex items-center gap-2 transition"
                          >
                            <Store className="w-4 h-4 text-emerald-400" />
                            <span>दुकानदार पोर्टल व कैटलॉग</span>
                          </button>
                        )}

                        {role === 'agent' && (
                          <button
                            onClick={() => {
                              handleTabChange('agent-profile');
                              setUserDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl flex items-center gap-2 transition"
                          >
                            <User className="w-4 h-4 text-slate-400" />
                            <span>प्रोफ़ाइल एवं KYC सत्यापन</span>
                          </button>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl flex items-center gap-2 font-bold transition"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>लॉगआउट करें (Sign Out)</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-3 space-y-1">
            <button
              onClick={() => handleTabChange('home')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                currentTab === 'home' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" /> Home
            </button>

            {/* ⚡ GO Special Agent Ultra 3D Option (Mobile) - Hidden for Super Admin */}
            {(!isAdmin && role !== 'admin') && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (!currentUser) {
                    if (onOpenGoAuth) onOpenGoAuth('login');
                    else onOpenAuth('login');
                  } else {
                    handleTabChange('go-agent');
                  }
                }}
                className={`w-full text-left px-3 py-2.5 rounded-2xl text-sm font-black flex items-center justify-between border cursor-pointer ${
                  currentTab === 'go-agent'
                    ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-300 text-slate-950 border-white shadow-lg'
                    : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-amber-400/60 shadow-md'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Go3DUltraLogo size="sm" showBadge={false} interactive={false} />
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950">
                  ₹20/टिकट
                </span>
              </button>
            )}

            <button
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth('login');
                } else {
                  handleTabChange('go-wallet');
                }
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-black flex items-center justify-between border ${
                currentTab === 'go-wallet'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 text-slate-950 border-white'
                  : 'bg-slate-950/90 text-white border-amber-400/40'
              }`}
            >
              <Go3DLogoBadge size="sm" showWalletText={true} />
              {currentUser && (
                <span className="bg-emerald-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-black">
                  ₹{(agentWalletBalance || 0).toLocaleString('en-IN')}
                </span>
              )}
            </button>


            {qdMode !== 'hidden' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (qdMode === 'coming_soon') {
                    setComingSoonModal({
                      isOpen: true,
                      name: 'नजदीकी ऑर्डर डिलीवरी',
                      desc: 'डिलीवरी सेवा बहुत जल्द शुरू हो रही है!'
                    });
                  } else {
                    handleTabChange(role === 'agent' ? 'agent-deliveries' : 'quick-delivery');
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  currentTab === 'quick-delivery' || currentTab === 'agent-deliveries' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Bike className="w-4 h-4 text-emerald-400" /> {role === 'agent' ? 'अपने नजदीकी ऑर्डर डिलीवर करें और अतिरिक्त कमाई करें' : 'लोकल डिलीवरी'}
                </span>
                {qdMode === 'coming_soon' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                    ⏳ जल्द
                  </span>
                )}
              </button>
            )}

            {/* SafarGo Order Track */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleTabChange('track-order');
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                currentTab === 'track-order' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-400" /> SafarGo आर्डर ट्रैक
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                📦 लाइव
              </span>
            </button>

            {prmMode !== 'hidden' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (prmMode === 'coming_soon' && role !== 'promoter' && role !== 'admin') {
                    setComingSoonModal({
                      isOpen: true,
                      name: 'सफ़ारगो प्रमोटर पार्टनर प्रोग्राम',
                      desc: 'प्रमोटर पार्टनर प्रोग्राम का अगला चरण जल्द शुरू हो रहा है!'
                    });
                  } else {
                    handleTabChange(role === 'promoter' ? 'promoter-dashboard' : role === 'admin' ? 'admin-promoters' : 'promoter-program');
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                  currentTab === 'promoter-program' || currentTab === 'promoter-dashboard' || currentTab === 'admin-promoters' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> प्रमोटर पार्टनर (₹15,000/माह)
                </span>
                {prmMode === 'coming_soon' && role !== 'promoter' && role !== 'admin' && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-400 text-slate-950">
                    ⏳ जल्द
                  </span>
                )}
              </button>
            )}

            {!currentUser ? (
              <div className="pt-2 border-t border-slate-800 space-y-2 px-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = buildSubdomainUrl('login', { mode: 'login' });
                  }}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-orange-400" />
                  लॉगिन करें
                </button>
                {prmMode !== 'hidden' && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (prmMode === 'coming_soon') {
                        setComingSoonModal({
                          isOpen: true,
                          name: 'प्रमोटिंग पार्टनर प्रोग्राम',
                          desc: 'प्रमोटर पार्टनर पोर्टल बहुत जल्द लाइव हो रहा है!'
                        });
                      } else {
                        window.location.href = buildSubdomainUrl('login', { role: 'promoter', mode: 'login' });
                      }
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm border border-amber-300 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>🤝 प्रमोटर लॉगिन (₹15,000/माह)</span>
                    {prmMode === 'coming_soon' && (
                      <span className="text-[9px] bg-slate-950 text-amber-300 px-1 rounded font-extrabold ml-1">
                        जल्द
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    window.location.href = buildSubdomainUrl('login', { role: 'agent', mode: 'register' });
                  }}
                  className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <UserPlus className="w-4 h-4" />
                  फ्री एजेंट बनें (login.safargo.in)
                </button>
              </div>
            ) : role === 'agent' ? (
              <>
                <button
                  onClick={() => {
                    setIsWalletModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-black flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md my-1 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-300" />
                    <span>एजेंट वॉलेट (Wallet)</span>
                  </div>
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-lg text-xs">
                    ₹{(agentWalletBalance || 0).toLocaleString('en-IN')} (+जोड़ें)
                  </span>
                </button>

                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'dashboard' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => handleTabChange('new-booking')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'new-booking' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" /> New Booking
                </button>
                <button
                  onClick={() => handleTabChange('my-bookings')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'my-bookings' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" /> My Bookings
                </button>
                <button
                  onClick={() => handleTabChange('commission')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'commission' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> Commission & Ledger
                </button>
                <button
                  onClick={() => handleTabChange('refer-earn')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'refer-earn' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Gift className="w-4 h-4" /> Refer & Earn (₹50)
                </button>
                <button
                  onClick={() => handleTabChange('viral-promotions')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'viral-promotions' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" /> क्रिएटर बोनस (Earn ₹500)
                </button>
                <button
                  onClick={() => handleTabChange('agent-deliveries')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'agent-deliveries' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  <Bike className="w-4 h-4 text-emerald-400" /> अपने नजदीकी ऑर्डर डिलीवर करें और अतिरिक्त कमाई करें
                </button>
                <button
                  onClick={() => handleTabChange('agent-profile')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'agent-profile' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> लॉगआउट (Sign Out)
                </button>
              </>
            ) : role === 'promoter' ? (
              <>
                <button
                  onClick={() => handleTabChange('promoter-dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'promoter-dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-indigo-400" /> प्रमोटर डैशबोर्ड (₹15,000)
                </button>
                <button
                  onClick={() => handleTabChange('quick-delivery')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'quick-delivery' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Bike className="w-4 h-4 text-emerald-400" /> डिलीवरी हब
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> लॉगआउट (Sign Out)
                </button>
              </>
            ) : role === 'customer' ? (
              <>
                <button
                  onClick={() => handleTabChange('customer-portal')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'customer-portal' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <User className="w-4 h-4 text-orange-400" /> ग्राहक पोर्टल (मेरी बस टिकटें)
                </button>
                <button
                  onClick={() => handleTabChange('quick-delivery')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'quick-delivery' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  <Bike className="w-4 h-4 text-emerald-400" /> नजदीकी सामान मंगवाएं
                </button>
                <button
                  onClick={() => handleTabChange('home')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'home' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Bus className="w-4 h-4 text-orange-400" /> नजदीकी SafarGo बस एजेंट खोजें
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> लॉगआउट (Sign Out)
                </button>
              </>
            ) : role === 'shopkeeper' ? (
              <>
                <button
                  onClick={() => handleTabChange('shopkeeper-portal')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'shopkeeper-portal' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Store className="w-4 h-4 text-emerald-400" /> दुकानदार पोर्टल व कैटलॉग
                </button>
                <button
                  onClick={() => handleTabChange('quick-delivery')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'quick-delivery' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  <Bike className="w-4 h-4 text-emerald-400" /> 15-मिनट रनर ऑर्डर्स
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> लॉगआउट (Sign Out)
                </button>
              </>
            ) : (currentUser && role === 'admin' && isAdmin) ? (
              <>
                <button
                  onClick={() => handleTabChange('admin-dashboard')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-dashboard' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Admin Overview
                </button>
                <button
                  onClick={() => handleTabChange('admin-promoters')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-promoters' ? 'bg-indigo-600 text-white' : 'text-indigo-300 hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-4 h-4 text-amber-400" /> प्रमोटर प्रबंधन (5 स्लॉट)
                </button>
                <button
                  onClick={() => handleTabChange('admin-bookings')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-bookings' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" /> Bookings Desk
                </button>
                <button
                  onClick={() => handleTabChange('admin-promotions')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-promotions' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-slate-800'
                  }`}
                >
                  <Tag className="w-4 h-4 text-purple-400" /> 🎟️ प्रोमो कोड व ऑफर्स
                </button>
                <button
                  onClick={() => handleTabChange('admin-agents')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-agents' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" /> Agents
                </button>
                <button
                  onClick={() => handleTabChange('admin-kyc-desk')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                    currentTab === 'admin-kyc-desk' ? 'bg-amber-600 text-white' : 'text-amber-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" /> KYC Desk (सत्यापन)
                  </span>
                  {pendingKycCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900 animate-pulse">
                      {pendingKycCount} Pending
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('admin-security-desk')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center justify-between ${
                    currentTab === 'admin-security-desk' ? 'bg-emerald-600 text-white' : 'text-emerald-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security & OTP (सुरक्षा)
                  </span>
                  {activeOtpCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-slate-900 animate-pulse">
                      {activeOtpCount} Active
                    </span>
                  )}
                </button>
                <button
                  onClick={() => handleTabChange('admin-trips')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-trips' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Bus className="w-4 h-4" /> Bus Inventory
                </button>
                <button
                  onClick={() => handleTabChange('admin-salary')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-salary' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <DollarSign className="w-4 h-4" /> Payouts & Salary
                </button>
                <button
                  onClick={() => handleTabChange('admin-settings')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-settings' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <button
                  onClick={() => handleTabChange('admin-logs')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 ${
                    currentTab === 'admin-logs' ? 'bg-orange-500 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <History className="w-4 h-4" /> Audit Logs
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> लॉगआउट (Sign Out)
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> लॉगआउट (Sign Out)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Wallet Recharge Modal */}
      {isWalletModalOpen && (
        <WalletRechargeModal onClose={() => setIsWalletModalOpen(false)} />
      )}

      {/* Coming Soon Notice Modal */}
      <ComingSoonModal
        isOpen={comingSoonModal.isOpen}
        onClose={() => setComingSoonModal({ isOpen: false, name: '' })}
        featureName={comingSoonModal.name}
        featureDescription={comingSoonModal.desc}
        supportWhatsapp={settings?.support_whatsapp}
      />
    </header>
  );
};

