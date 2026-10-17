import React from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { ProductCard } from '../home/ProductCard';
import { Sparkles, ShieldCheck, CheckCircle2, Award, Zap } from 'lucide-react';

export const SafarGoMall: React.FC = () => {
  const { products, t } = useShopping();

  // Filter only Mall products
  const mallProducts = products.filter(p => p.isMallProduct);

  return (
    <div className="max-w-7xl mx-auto px-3 py-3 space-y-4">
      {/* Mall Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-700 via-rose-900 to-purple-950 text-white p-4 sm:p-6 shadow-md">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-amber-400 text-gray-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>SAFARGO MALL • VERIFIED OUTLET</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
            {t('सफ़रगो मॉल • 100% ओरिजिनल ब्रांड्स', 'SafarGo Mall • 100% Verified Factory Direct')}
          </h1>

          <p className="text-xs sm:text-sm text-amber-100 mt-1.5 leading-relaxed">
            {t('सीधे ब्रांड्स और ओरिजिनल मैन्युफैक्चरर्स से मंगाएं। बिचौलियों का कोई कमीशन नहीं, इसलिए सबसे कम दाम।', 'Shop genuine products straight from authorized brand factories. No middlemen, highest quality assured.')}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t('100% असली प्रोडक्ट', '100% Authentic')}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{t('7 दिन आसान रिटर्न', '7-Day Easy Returns')}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-lg">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>{t('सुपरफास्ट एक्सप्रेस डिलीवरी', 'Fast Express Dispatch')}</span>
            </div>
          </div>
        </div>

        {/* Decorative corner light */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-amber-500/20 to-transparent pointer-events-none" />
      </div>

      {/* Featured Mall Brands Strip */}
      <div className="bg-white rounded-xl p-3 border border-gray-200">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          {t('पॉपुलर मॉल ब्रांड्स', 'Featured Mall Brands')}
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['SoundBeat Pro', 'PulseFit Pro', 'Varanasi Weaves', 'Tokyo Bella', 'KitchenPro', 'SafarGo Glam'].map((brand, i) => (
            <div 
              key={i}
              className="bg-gray-50 border border-gray-200 hover:border-pink-300 hover:bg-pink-50/40 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-800 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-[#9F2089]" />
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-extrabold text-gray-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#9F2089]" />
            <span>{t('मॉल एक्सक्लूसिव डील्स', 'Mall Exclusive Deals')}</span>
            <span className="text-xs text-gray-500 font-normal">({mallProducts.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
          {mallProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};
