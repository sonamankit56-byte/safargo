import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AboutSafarGoModal } from './AboutSafarGoModal';
import {
  LayoutDashboard,
  Bus,
  Info,
  User,
  ShieldCheck,
  ShoppingBag,
  Bike
} from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigateTab }) => {
  const { currentUser, role } = useAuth();
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Strictly only show when user is logged in
  if (!currentUser) return null;

  // Determine appropriate dashboard tab for the user's role
  const getDashboardTab = () => {
    if (role === 'admin') return 'admin-dashboard';
    if (role === 'agent') return 'dashboard';
    if (role === 'customer') return 'customer-portal';
    if (role === 'shopkeeper') return 'shopkeeper-portal';
    if (role === 'promoter') return 'promoter-dashboard';
    return 'dashboard';
  };

  const getProfileTab = () => {
    if (role === 'agent') return 'agent-profile';
    if (role === 'customer') return 'customer-portal';
    if (role === 'shopkeeper') return 'shopkeeper-portal';
    return 'dashboard';
  };

  const isDashboardActive =
    currentTab === 'dashboard' ||
    currentTab === 'admin-dashboard' ||
    currentTab === 'customer-portal' ||
    currentTab === 'shopkeeper-portal' ||
    currentTab === 'promoter-dashboard';

  const isBookingActive = currentTab === 'new-booking' || currentTab === 'home';
  const isAccountActive = currentTab === 'agent-profile';

  return (
    <>
      {/* AbhiBus Inspired Sticky Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl py-2 px-3 sm:px-6">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          
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
            onClick={() => onNavigateTab('new-booking')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer ${
              isBookingActive ? 'text-red-600 font-black' : 'text-slate-500 hover:text-slate-800 font-bold'
            }`}
          >
            <div className={`p-1 rounded-lg ${isBookingActive ? 'bg-red-50' : ''}`}>
              <Bus className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">बुकिंग</span>
          </button>

          {/* 3. About SafarGo */}
          <button
            type="button"
            onClick={() => setIsAboutModalOpen(true)}
            className="flex flex-col items-center justify-center py-1 rounded-xl transition cursor-pointer text-slate-500 hover:text-red-600 font-bold"
          >
            <div className="p-1 rounded-lg hover:bg-slate-100">
              <Info className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 truncate max-w-[90px]">सफ़ारगो के बारे में</span>
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

      {/* About SafarGo Modal */}
      <AboutSafarGoModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
};
