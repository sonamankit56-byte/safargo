import React from 'react';
import { Bus, Hotel, Ticket, Briefcase, User, Utensils, Zap, Plane } from 'lucide-react';
import { useTravel } from '../../context/TravelContext';
import { TravelService } from '../../types/travel';

export const TravelBottomNav: React.FC = () => {
  const { 
    activeService, 
    setActiveService, 
    bookings, 
    isAgentLoggedIn, 
    isCustomerLoggedIn,
    setIsAuthModalOpen, 
    t 
  } = useTravel();

  const isAnyUserLoggedIn = isAgentLoggedIn || isCustomerLoggedIn;
  const activeCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'boarding_soon').length;

  const handleNavClick = (service: TravelService) => {
    setActiveService(service);
  };

  const items: { 
    service: TravelService; 
    label: string; 
    hindiLabel: string; 
    icon: React.ReactNode; 
    badge?: number | string;
    isComingSoon?: boolean;
    isLive?: boolean;
  }[] = [
    { 
      service: 'bus', 
      label: 'Buses', 
      hindiLabel: 'बसें', 
      icon: <Bus className="w-5 h-5" />,
      badge: 'Live',
      isLive: true
    },
    { 
      service: 'tiffin', 
      label: 'GoTifin', 
      hindiLabel: 'गो टिफिन', 
      icon: <Utensils className="w-5 h-5" />,
      badge: 'Soon',
      isComingSoon: true
    },
    { 
      service: 'recharge', 
      label: 'Recharge', 
      hindiLabel: 'रिचार्ज', 
      icon: <Zap className="w-5 h-5" />,
      badge: 'Live',
      isLive: true
    },
    { 
      service: 'trips', 
      label: 'Bookings', 
      hindiLabel: 'बुकिंग', 
      icon: <Ticket className="w-5 h-5" />, 
      badge: activeCount > 0 ? activeCount : undefined 
    },
    { 
      service: 'agent', 
      label: 'Agent Hub', 
      hindiLabel: 'एजेंट हब', 
      icon: <Briefcase className="w-5 h-5" /> 
    },
    { 
      service: 'account', 
      label: 'Account', 
      hindiLabel: 'अकाउंट', 
      icon: <User className="w-5 h-5" /> 
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg xl:hidden">
      <div className="grid grid-cols-6 h-14">
        {items.map((item) => {
          const isActive = activeService === item.service;
          return (
            <button
              key={item.service}
              onClick={() => handleNavClick(item.service)}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-[#0B194C]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className={`absolute -top-1.5 -right-2 text-[8px] font-black px-1 rounded-full text-center ${
                    item.isComingSoon 
                      ? 'bg-amber-500 text-slate-950' 
                      : item.isLive 
                        ? 'bg-emerald-600 text-white min-w-[14px]' 
                        : 'bg-rose-600 text-white min-w-[14px]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-black text-[#0B194C]' : ''}`}>
                {t(item.hindiLabel, item.label)}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-[#0B194C] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
