import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { SafarGoLogo } from './SafarGoLogo';
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
  CreditCard
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { currentUser, role, isApprovedAgent, isAdmin, logout, allProfiles } = useAuth();
  const { agentWalletBalance } = useData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const pendingKycCount = allProfiles
    ? allProfiles.filter(
        (p) =>
          (p.role === 'agent' || (!p.role && p.agent_status)) &&
          p.kyc_status?.toLowerCase().trim() === 'pending'
      ).length
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
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 3D Animated Logo & Brand */}
          <div className="flex items-center cursor-pointer py-1" onClick={() => handleTabChange('home')}>
            <SafarGoLogo size="md" variant="light" showBadge={true} showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Global Home link */}
            <button
              onClick={() => handleTabChange('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                currentTab === 'home'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              Home
            </button>

            {currentUser && role === 'agent' && (
              <>
                <button
                  onClick={() => handleTabChange('dashboard')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'dashboard'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
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
                  onClick={() => handleTabChange('viral-promotions')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentTab === 'viral-promotions'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-purple-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  क्रिएटर बोनस (Earn ₹500)
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
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  वायरल प्रमोशन
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
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5 text-orange-400" />
                  <span>लॉगिन करें</span>
                </button>

                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>फ्री एजेंट बनें</span>
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
                        {isAdmin ? 'SUPER ADMIN' : currentUser?.shop_name || 'AGENT'}
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
                          रोल: {isAdmin ? 'सुपर एडमिन' : 'अधिकृत एजेंट'} • KYC: {currentUser?.kyc_status === 'verified' ? 'सत्यापित ✓' : currentUser?.kyc_status === 'pending' ? 'प्रक्रियाधीन ⏳' : 'अधूरा ⚠️'}
                        </p>
                      </div>

                      <div className="p-2 space-y-1">
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

            {!currentUser ? (
              <div className="pt-2 border-t border-slate-800 space-y-2 px-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-orange-400" />
                  लॉगिन करें
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  फ्री एजेंट बनें
                </button>
              </div>
            ) : role === 'agent' ? (
              <>
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
            ) : (
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
                  <Sparkles className="w-4 h-4 text-purple-400" /> वायरल प्रमोशन
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
            )}
          </div>
        )}
      </div>

      {/* Wallet Recharge Modal */}
      {isWalletModalOpen && (
        <WalletRechargeModal onClose={() => setIsWalletModalOpen(false)} />
      )}
    </header>
  );
};

