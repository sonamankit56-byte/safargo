import React from 'react';
import { Home, LayoutGrid, ShoppingBag, Package, User } from 'lucide-react';
import { useShopping } from '../../context/ShoppingContext';
import { AppView } from '../../types';

export const BottomNavBar: React.FC = () => {
  const { currentView, setCurrentView, orders, t } = useShopping();

  // Hide on deep checkout flows (address & payment) for focused purchase conversion
  if (currentView === 'payment' || currentView === 'order_success') {
    return null;
  }

  const activeOrdersCount = orders.filter(
    o => o.trackingStatus !== 'delivered' && o.trackingStatus !== 'cancelled'
  ).length;

  const navItems: { view: AppView; label: string; hindiLabel: string; icon: React.ReactNode; badge?: string | number }[] = [
    {
      view: 'home',
      label: 'Home',
      hindiLabel: 'होम',
      icon: <Home className="w-5 h-5" />
    },
    {
      view: 'categories',
      label: 'Categories',
      hindiLabel: 'कैटेगरीज',
      icon: <LayoutGrid className="w-5 h-5" />
    },
    {
      view: 'mall',
      label: 'Mall',
      hindiLabel: 'सफ़रगो मॉल',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: 'VERIFIED'
    },
    {
      view: 'orders',
      label: 'My Orders',
      hindiLabel: 'ऑर्डर्स',
      icon: <Package className="w-5 h-5" />,
      badge: activeOrdersCount > 0 ? activeOrdersCount : undefined
    },
    {
      view: 'account',
      label: 'Account',
      hindiLabel: 'अकाउंट',
      icon: <User className="w-5 h-5" />
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-sticky md:hidden">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`relative flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-[#9F2089]' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge && typeof item.badge === 'number' && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold px-1 rounded-full min-w-[14px] text-center">
                    {item.badge}
                  </span>
                )}
                {item.badge && typeof item.badge === 'string' && (
                  <span className="absolute -top-2.5 -right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-black px-1 rounded-full tracking-tighter">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[11px] mt-0.5 tracking-tight font-medium ${isActive ? 'font-bold text-[#9F2089]' : ''}`}>
                {t(item.hindiLabel, item.label)}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-[#9F2089] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
