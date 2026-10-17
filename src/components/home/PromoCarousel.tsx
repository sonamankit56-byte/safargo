import React, { useState, useEffect } from 'react';
import { PROMO_BANNERS } from '../../data/banners';
import { useShopping } from '../../context/ShoppingContext';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const PromoCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setCurrentView, setSelectedCategory, t } = useShopping();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const banner = PROMO_BANNERS[currentIndex];

  const handleBannerClick = () => {
    if (banner.id === 'banner-02') {
      setCurrentView('mall');
    } else if (banner.id === 'banner-03') {
      setCurrentView('resell_desk');
    } else {
      setSelectedCategory('women_ethnic');
    }
  };

  return (
    <div className="px-3 pt-3 pb-2 max-w-7xl mx-auto">
      <div 
        onClick={handleBannerClick}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${banner.bgGradient} text-white cursor-pointer shadow-md transition-all duration-300 min-h-[140px] sm:min-h-[170px] flex items-center`}
      >
        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        {/* Banner Content */}
        <div className="relative z-10 p-4 sm:p-6 w-3/5 sm:w-2/3 flex flex-col justify-center">
          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1.5 w-fit">
            <Sparkles className="w-3 h-3 text-yellow-300" />
            <span>{banner.tag}</span>
          </div>

          <h2 className="text-base sm:text-2xl font-black leading-tight drop-shadow-sm">
            {t(banner.hindiTitle, banner.title)}
          </h2>

          <p className="text-xs sm:text-sm text-white/90 mt-1 line-clamp-1">
            {banner.subtitle}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span className="bg-yellow-400 text-gray-950 font-black text-xs sm:text-sm px-2.5 py-1 rounded-md shadow-sm">
              {banner.discountBadge}
            </span>
            <div className="inline-flex items-center text-xs font-bold text-white hover:underline gap-0.5">
              <span>{t('शॉप करें', 'Shop Now')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Right Product Image */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 sm:w-1/3 overflow-hidden">
          <img 
            src={banner.imageUrl} 
            alt={banner.title}
            className="w-full h-full object-cover object-center transform scale-105 hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent sm:hidden" />
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center items-center gap-1.5 mt-2">
        {PROMO_BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Banner ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-5 bg-[#9F2089]' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
