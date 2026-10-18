import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Mic, 
  Camera, 
  ArrowLeft,
  Sparkles,
  Globe
} from 'lucide-react';
import { useShopping } from '../../context/ShoppingContext';

interface MeeshoHeaderProps {
  title?: string;
  showBack?: boolean;
}

const SEARCH_PLACEHOLDERS = [
  'Search by Keyword or Product ID',
  'Try Banarasi Saree...',
  'Try Rayon Kurti...',
  'Try Men Casual Shirt...',
  'Try Bluetooth Earbuds...',
  'Try King Size Bedsheet...',
  'Try Kundan Jewellery...',
  'Try Kids Dungaree...'
];

export const MeeshoHeader: React.FC<MeeshoHeaderProps> = ({ title, showBack = false }) => {
  const { 
    currentView, 
    navigateBack, 
    setCurrentView, 
    cartCount, 
    wishlistIds, 
    language, 
    toggleLanguage,
    searchQuery,
    setSearchQuery,
    t
  } = useShopping();

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const isSubPage = showBack || [
    'product_detail', 
    'cart', 
    'address_selection', 
    'payment', 
    'order_tracking', 
    'wishlist',
    'search_modal'
  ].includes(currentView);

  const currentPlaceholder = SEARCH_PLACEHOLDERS[placeholderIndex];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* Top Utility & Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Back Button or Logo */}
        <div className="flex items-center gap-2">
          {isSubPage ? (
            <button
              onClick={navigateBack}
              aria-label="Back"
              className="p-1.5 -ml-1 text-gray-700 hover:text-pink-700 active:scale-95 transition-transform rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : null}

          {title && isSubPage ? (
            <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h1>
          ) : (
            <div 
              onClick={() => setCurrentView('home')} 
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#9F2089] to-[#D81B60] flex items-center justify-center text-white shadow-sm shadow-pink-200">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-lg sm:text-xl text-[#9F2089] tracking-tight">SafarGo</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-100 text-[#9F2089] uppercase tracking-wider">Shopping</span>
                </div>
                <p className="text-[10px] text-gray-500 font-medium hidden sm:block">
                  {t('भारत की सबसे किफायती ऑनलाइन शॉपिंग', "India's Lowest Price Reselling & Shopping")}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Search Bar (Exact Meesho Search Input) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div 
            onClick={() => {
              if (currentView !== 'search_modal') setCurrentView('search_modal');
            }}
            className="relative w-full cursor-pointer"
          >
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder={currentPlaceholder}
              className="w-full pl-10 pr-20 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#9F2089] focus:bg-white transition-all text-gray-800 placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400">
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('search_modal');
                }} 
                title="Voice Search"
                className="hover:text-[#9F2089] p-1 rounded transition-colors"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentView('search_modal');
                }} 
                title="Search by Photo"
                className="hover:text-[#9F2089] p-1 rounded transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions: Language Switch, Wishlist, Bag */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-md text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            title="Switch Language (हिंदी / English)"
          >
            <Globe className="w-3.5 h-3.5 text-[#9F2089]" />
            <span>{language === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* Resell CTA Pill (Desktop) */}
          <button
            onClick={() => setCurrentView('resell_desk')}
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-full transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{t('कमाई डेस्क', 'Resell & Earn')}</span>
          </button>

          {/* Wishlist */}
          <button
            onClick={() => setCurrentView('wishlist')}
            aria-label="Wishlist"
            className="relative p-2 text-gray-700 hover:text-[#9F2089] rounded-full hover:bg-pink-50 transition-colors"
          >
            <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            {wishlistIds.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#9F2089] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Shopping Bag / Cart */}
          <button
            onClick={() => setCurrentView('cart')}
            aria-label="Shopping Bag"
            className="relative p-2 text-gray-700 hover:text-[#9F2089] rounded-full hover:bg-pink-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Exact Meesho Top Search Bar with Rotating Placeholder) */}
      {!isSubPage && (
        <div className="md:hidden px-3 pb-2.5">
          <div 
            onClick={() => setCurrentView('search_modal')}
            className="relative w-full flex items-center bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer text-gray-400 active:bg-gray-200 transition-colors shadow-xs"
          >
            <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <span className="text-xs truncate flex-1 text-gray-600 font-medium">
              {searchQuery || currentPlaceholder}
            </span>
            <div className="flex items-center gap-2 text-gray-500">
              <Mic className="w-4 h-4 hover:text-[#9F2089]" />
              <Camera className="w-4 h-4 hover:text-[#9F2089]" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
