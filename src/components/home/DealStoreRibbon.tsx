import React from 'react';
import { DEAL_BUCKETS } from '../../data/banners';
import { useShopping } from '../../context/ShoppingContext';
import { Truck, RotateCcw, ShieldCheck, Banknote } from 'lucide-react';

export const DealStoreRibbon: React.FC = () => {
  const { setSortBy, setSelectedCategory, t } = useShopping();

  return (
    <div className="max-w-7xl mx-auto px-3 py-2 space-y-2.5">
      {/* 4 Deal Bucket Cards */}
      <div className="grid grid-cols-4 gap-2">
        {DEAL_BUCKETS.map((deal) => (
          <div
            key={deal.id}
            onClick={() => {
              if (deal.id === 'under-99' || deal.id === 'under-199' || deal.id === 'under-299') {
                setSortBy('price_asc');
              } else {
                setSelectedCategory('all');
              }
            }}
            className={`${deal.bg} rounded-xl p-2 sm:p-3 text-white text-center cursor-pointer shadow-sm hover:opacity-95 active:scale-95 transition-all select-none`}
          >
            <span className={`text-[10px] sm:text-xs font-semibold block uppercase tracking-wider opacity-90 ${deal.tagColor}`}>
              {deal.subtext}
            </span>
            <div className="text-xs sm:text-sm md:text-base font-extrabold truncate">
              {t(deal.hindiLabel, deal.label)}
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges Strip (Authentic Meesho Value Proposition) */}
      <div className="bg-white rounded-xl p-2.5 border border-gray-200 grid grid-cols-3 divide-x divide-gray-100 text-center text-gray-700">
        <div className="flex flex-col items-center justify-center px-1">
          <Truck className="w-4 h-4 text-emerald-600 mb-0.5" />
          <span className="text-[11px] font-bold text-gray-800">{t('फ्री डिलीवरी', 'Free Delivery')}</span>
          <span className="text-[9px] text-gray-400">{t('सभी ऑर्डर्स पर', 'On all orders')}</span>
        </div>
        <div className="flex flex-col items-center justify-center px-1">
          <Banknote className="w-4 h-4 text-[#9F2089] mb-0.5" />
          <span className="text-[11px] font-bold text-gray-800">{t('कैश ऑन डिलीवरी', 'Cash On Delivery')}</span>
          <span className="text-[9px] text-gray-400">{t('सामान मिलने पर दें', 'Pay at doorstep')}</span>
        </div>
        <div className="flex flex-col items-center justify-center px-1">
          <RotateCcw className="w-4 h-4 text-blue-600 mb-0.5" />
          <span className="text-[11px] font-bold text-gray-800">{t('7 दिन में वापसी', '7 Days Returns')}</span>
          <span className="text-[9px] text-gray-400">{t('100% रिफंड गारंटी', 'Instant refund')}</span>
        </div>
      </div>
    </div>
  );
};
