import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  Bus,
  User,
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigateTab }) => {
  const { currentUser, role } = useAuth();
  const { agentWalletBalance } = useData();

  // Strictly only show BottomNav when user is logged in
  if (!currentUser) return null;

  // If in dedicated Go Ultra Agent Dashboard, it renders its own 4-tab bottom navigation
  if (currentTab === 'go-agent') return null;

  // Determine appropriate dashboard tab for the user's role
  const getDashboardTab = () => {
    if (!currentUser) return 'home';
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'agent') return 'go-agent';
    if (role === 'customer') return 'customer-portal';
    if (role === 'shopkeeper') return 'shopkeeper-portal';
    if (role === 'promoter') return 'promoter-dashboard';
    return 'dashboard';
  };

  const getProfileTab = () => {
    if (!currentUser) return 'go-wallet';
    if (role === 'agent') return 'go-agent';
    if (role === 'customer') return 'customer-portal';
    if (role === 'shopkeeper') return 'shopkeeper-portal';
    if (role === 'promoter') return 'promoter-dashboard';
    return 'dashboard';
  };

  const isDashboardActive =
    currentTab === 'dashboard' ||
    currentTab === 'admin-dashboard' ||
    currentTab === 'customer-portal' ||
    currentTab === 'shopkeeper-portal' ||
    currentTab === 'promoter-dashboard';

  const isBookingActive = currentTab === 'new-booking' || currentTab === 'home';
  const isGoWalletActive = currentTab === 'go-wallet';
  const isAccountActive = currentTab === 'agent-profile';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2 border-amber-400/50 shadow-2xl py-1.5 px-3 sm:px-6">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center items-center">
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => onNavigateTab(getDashboardTab())}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer ${
            isDashboardActive ? 'text-red-600 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
        >
          <div className={`p-1 rounded-lg ${isDashboardActive ? 'bg-red-50' : ''}`}>
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">डैशबोर्ड</span>
        </button>

        {/* 2. Booking */}
        <button
          type="button"
          onClick={() => onNavigateTab(currentUser ? 'new-booking' : 'home')}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer ${
            isBookingActive ? 'text-red-600 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
        >
          <div className={`p-1 rounded-lg ${isBookingActive ? 'bg-red-50' : ''}`}>
            <Bus className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">बुकिंग</span>
        </button>

        {/* 3. 3D Go Wallet (Replaces 'सफ़ारगो के बारे में') */}
        <button
          type="button"
          onClick={() => onNavigateTab('go-wallet')}
          className={`relative flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition cursor-pointer ${
            isGoWalletActive
              ? 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-amber-300 shadow-lg ring-2 ring-amber-400 scale-105'
              : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:scale-105 shadow-md border border-amber-400/50'
          }`}
          style={{ perspective: '600px' }}
        >
          {/* 3D Animated SafarGo Emblem + Go */}
          <div className="flex items-center gap-1">
            <div
              className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 via-orange-500 to-rose-600 flex items-center justify-center shadow animate-float3d border border-amber-200/70"
            >
              <svg width="15" height="15" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 44L20 32H28L34 44H14Z" fill="rgba(15, 23, 42, 0.4)" />
                <rect x="11" y="7" width="26" height="27" rx="5" fill="#FFFFFF" stroke="#EA580C" strokeWidth="1.5" />
                <path d="M13 12C13 9.79086 14.7909 8 17 8H31C33.2091 8 35 9.79086 35 12V14H13V12Z" fill="#EA580C" />
                <rect x="14" y="15" width="20" height="9" rx="2" fill="#0F172A" />
                <circle cx="16.5" cy="29.5" r="2" fill="#F59E0B" />
                <circle cx="31.5" cy="29.5" r="2" fill="#F59E0B" />
              </svg>
            </div>
            <span className="text-xs font-black bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300 bg-clip-text text-transparent">
              Go
            </span>
          </div>
          <span className="text-[10px] font-black text-white leading-tight mt-0.5">
            Go Wallet {currentUser ? `₹${(agentWalletBalance || 0).toLocaleString('en-IN')}` : ''}
          </span>
        </button>

        {/* 4. My Account */}
        <button
          type="button"
          onClick={() => onNavigateTab(getProfileTab())}
          className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer ${
            isAccountActive ? 'text-red-600 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
          }`}
        >
          <div className={`p-1 rounded-lg ${isAccountActive ? 'bg-red-50' : ''}`}>
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">माय अकाउंट</span>
        </button>
      </div>
    </div>
  );
};

