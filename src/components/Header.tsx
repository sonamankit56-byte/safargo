import React from 'react';
import { Bus, HelpCircle, Ticket, User, LogOut, Phone, ShieldCheck, Briefcase } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

export const Header: React.FC = () => {
  const { currentView, setCurrentView, user, logout, setIsAuthModalOpen } = useBooking();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top micro banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe & Sanitized Buses
            </span>
            <span>Primo Certified Operators</span>
            <span>24x7 Customer Support</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> Helpline: 1800-SAFAR-GO
            </span>
            <span>|</span>
            <span className="text-white font-medium">India's Modern Bus Platform</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Service Tabs */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Bus className="w-6 h-6 transform -scale-x-100" />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight text-slate-900 flex items-center">
                SAFAR<span className="text-red-600 font-extrabold ml-1">GO</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-1">
                Smart Bus Journey
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'home' || currentView === 'search'
                  ? 'text-red-600 bg-red-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Bus className="w-4 h-4" />
              Bus Tickets
            </button>
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => alert('Cab Rentals launching soon on Safar Go!')}
            >
              Cab Rentals
            </button>
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              onClick={() => alert('Train Bookings feature coming in next release!')}
            >
              Train Tickets
              <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded">NEW</span>
            </button>
            <button
              onClick={() => setCurrentView('agent')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentView === 'agent'
                  ? 'text-red-600 bg-red-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Briefcase className="w-4 h-4 text-red-600" />
              <span>Become an Agent</span>
              <span className="bg-red-100 text-red-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                ₹19.34
              </span>
            </button>
          </nav>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentView('my-bookings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
              currentView === 'my-bookings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span className="hidden sm:inline">My Bookings</span>
          </button>

          <button
            onClick={() => alert('Safar Go 24/7 Helpline: 1800-SAFAR-GO\nEmail: support@safargo.in\nInstant Chat Support is Active.')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>

          {/* User Auth Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-bold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-slate-400">{user.phone}</p>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCurrentView('login')}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm shadow-red-200 transition-all active:scale-95 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Login / Sign Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
