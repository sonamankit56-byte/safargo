import React from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  User, 
  Package, 
  Heart, 
  TrendingUp, 
  MapPin, 
  Globe, 
  Store, 
  HelpCircle, 
  ShieldCheck, 
  ChevronRight,
  LogOut,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export const AccountScreen: React.FC = () => {
  const { 
    orders, 
    wishlistIds, 
    setCurrentView, 
    language, 
    toggleLanguage,
    t 
  } = useShopping();

  return (
    <div className="bg-gray-100 min-h-screen pb-24 pt-2">
      <div className="max-w-2xl mx-auto px-3 space-y-3">
        {/* User Profile Header */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-soft flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#9F2089] to-pink-500 text-white flex items-center justify-center font-black text-xl shadow-md">
              RS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-gray-900">Rahul Sharma</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">+91 98765 43210</p>
              <span className="text-[10px] text-[#9F2089] font-bold bg-pink-50 px-2 py-0.5 rounded-md inline-block mt-1">
                {t('सफ़रगो स्टार रीसेलर', 'SafarGo Star Reseller')}
              </span>
            </div>
          </div>

          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            <Globe className="w-4 h-4 text-[#9F2089]" />
            <span>{language === 'hi' ? 'हिंदी' : 'English'}</span>
          </button>
        </div>

        {/* 4 Quick Action Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div
            onClick={() => setCurrentView('orders')}
            className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft cursor-pointer hover:border-pink-300 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#9F2089] flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-900 block">{t('मेरे ऑर्डर्स', 'My Orders')}</span>
              <span className="text-[10px] text-gray-500">{orders.length} {t('ऑर्डर्स दर्ज', 'Total orders')}</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('resell_desk')}
            className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft cursor-pointer hover:border-emerald-300 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-900 block">{t('रीसेलर वॉलेट', 'Reseller Hub')}</span>
              <span className="text-[10px] text-emerald-600 font-bold">{t('कमाई व मार्जिन', 'Cash Margin')}</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('wishlist')}
            className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft cursor-pointer hover:border-pink-300 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-900 block">{t('विशलिस्ट', 'Wishlist')}</span>
              <span className="text-[10px] text-gray-500">{wishlistIds.length} {t('पसंदीदा आइटम', 'Saved items')}</span>
            </div>
          </div>

          <div
            onClick={() => setCurrentView('address_selection')}
            className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft cursor-pointer hover:border-blue-300 transition-colors flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-gray-900 block">{t('डिलीवरी पते', 'Saved Addresses')}</span>
              <span className="text-[10px] text-gray-500">{t('मैनेज करें', 'Manage')}</span>
            </div>
          </div>
        </div>

        {/* Sell on SafarGo (Supplier Hub) Banner */}
        <div 
          onClick={() => alert('SafarGo Supplier Onboarding: Register your GST & bank account to sell across India at 0% commission!')}
          className="bg-gradient-to-r from-purple-700 to-[#9F2089] text-white rounded-2xl p-4 shadow-sm cursor-pointer hover:opacity-95 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Store className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <span className="text-xs font-bold block">{t('सफ़रगो पर सामान बेचें (Supplier Hub)', 'Become a SafarGo Supplier')}</span>
              <p className="text-[11px] text-pink-100">{t('0% कमीशन पर पूरे भारत में लाखों ग्राहकों को बेचें', 'Sell to crores of customers at 0% Commission')}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </div>

        {/* Account Menu Items */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft divide-y divide-gray-100 overflow-hidden">
          <div 
            onClick={toggleLanguage}
            className="p-3.5 flex items-center justify-between text-xs text-gray-800 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{t('ऐप की भाषा (Change Language)', 'App Language')}</span>
            </div>
            <span className="font-bold text-[#9F2089]">{language === 'hi' ? 'हिंदी (Hindi)' : 'English'}</span>
          </div>

          <div 
            onClick={() => alert('Customer Support: Call toll-free 1800-SAFARGO or email support@safargo.in')}
            className="p-3.5 flex items-center justify-between text-xs text-gray-800 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{t('ग्राहक सहायता केंद्र (24x7 Help Center)', 'Customer Care & Help Center')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div 
            onClick={() => alert('SafarGo Trust & Privacy: All transactions are 100% encrypted under RBI e-commerce guidelines.')}
            className="p-3.5 flex items-center justify-between text-xs text-gray-800 hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{t('गोपनीयता नीति एवं नियम (Terms & Policies)', 'Privacy Policy & Terms')}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* Brand Version Info */}
        <div className="text-center text-xs text-gray-400 py-3 space-y-0.5">
          <p className="font-bold text-gray-500">SafarGo Shopping (सफ़रगो शॉपिंग)</p>
          <p className="text-[10px]">Version 1.0.0 • Made with pride in India 🇮🇳</p>
        </div>
      </div>
    </div>
  );
};
