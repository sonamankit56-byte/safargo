import React, { useState } from 'react';
import { CATEGORIES_DATA } from '../../data/categories';
import { useShopping } from '../../context/ShoppingContext';
import { 
  Sparkles, 
  Shirt, 
  User, 
  Smile, 
  Home, 
  Heart, 
  Gem, 
  Headphones,
  ArrowRight
} from 'lucide-react';
import { ProductCategory } from '../../types';

export const CategoryHub: React.FC = () => {
  const [activeCategoryId, setActiveCategoryId] = useState<ProductCategory>('women_ethnic');
  const { setSelectedCategory, setCurrentView, t } = useShopping();

  const activeCategory = CATEGORIES_DATA.find((c) => c.id === activeCategoryId) || CATEGORIES_DATA[0];

  const getCategoryIcon = (id: ProductCategory) => {
    switch (id) {
      case 'women_ethnic': return <Sparkles className="w-5 h-5" />;
      case 'western_wear': return <Shirt className="w-5 h-5" />;
      case 'men_fashion': return <User className="w-5 h-5" />;
      case 'kids_toys': return <Smile className="w-5 h-5" />;
      case 'home_kitchen': return <Home className="w-5 h-5" />;
      case 'beauty_health': return <Heart className="w-5 h-5" />;
      case 'jewellery': return <Gem className="w-5 h-5" />;
      case 'electronics': return <Headphones className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleSubCategoryClick = (subName: string) => {
    setSelectedCategory(activeCategoryId);
    setCurrentView('home');
  };

  return (
    <div className="flex h-[calc(100vh-112px)] md:h-[calc(100vh-64px)] max-w-7xl mx-auto bg-white overflow-hidden">
      {/* Left Vertical Category Nav Rail */}
      <div className="w-24 sm:w-32 bg-gray-50 border-r border-gray-200 overflow-y-auto no-scrollbar shrink-0">
        {CATEGORIES_DATA.map((cat) => {
          const isActive = cat.id === activeCategoryId;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`w-full py-3 px-1.5 flex flex-col items-center justify-center text-center transition-all relative ${
                isActive 
                  ? 'bg-white text-[#9F2089] font-bold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#9F2089] rounded-r" />
              )}
              <div className={`p-2 rounded-full mb-1 ${
                isActive ? 'bg-pink-100 text-[#9F2089]' : 'bg-gray-200/60 text-gray-600'
              }`}>
                {getCategoryIcon(cat.id)}
              </div>
              <span className="text-[11px] leading-tight line-clamp-2 px-1">
                {t(cat.hindiName, cat.name)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Sub-Category Grid & Banners */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-white">
        {/* Category Header Banner */}
        <div className="relative rounded-xl overflow-hidden mb-4 bg-gradient-to-r from-[#9F2089] to-pink-700 text-white p-4 shadow-sm">
          <div className="relative z-10 max-w-[70%]">
            <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {t('पॉपुलर कलेक्शन', 'Trending Hub')}
            </span>
            <h2 className="text-base sm:text-xl font-extrabold mt-1">
              {t(activeCategory.hindiName, activeCategory.name)}
            </h2>
            <p className="text-[11px] text-white/90 mt-0.5">
              {t('सीधे सूरत, तिरुपुर एवं जयपुर के होलसेलर्स से', 'Direct from verified wholesale textile hubs')}
            </p>
          </div>
          <img 
            src={activeCategory.bannerImage}
            alt={activeCategory.name}
            className="absolute right-0 top-0 bottom-0 w-28 sm:w-40 object-cover object-top opacity-75"
          />
        </div>

        {/* Subcategories Heading */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 uppercase tracking-wider">
            {t('सब-कैटेगरी चुनें', 'Explore Collections')}
          </h3>
          <button 
            onClick={() => {
              setSelectedCategory(activeCategoryId);
              setCurrentView('home');
            }}
            className="text-xs font-bold text-[#9F2089] hover:underline flex items-center gap-0.5"
          >
            <span>{t('सभी देखें', 'View All')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subcategories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {activeCategory.subCategories.map((sub, idx) => (
            <div
              key={idx}
              onClick={() => handleSubCategoryClick(sub.name)}
              className="group bg-gray-50 hover:bg-pink-50/50 rounded-xl p-2 border border-gray-100 hover:border-pink-200 transition-all cursor-pointer flex flex-col items-center text-center"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200 mb-2 shadow-xs">
                <img 
                  src={sub.image} 
                  alt={sub.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-bold text-gray-800 group-hover:text-[#9F2089] line-clamp-1">
                {t(sub.hindiName, sub.name)}
              </h4>
              <span className="text-[10px] text-gray-500 mt-0.5 font-medium">
                {sub.itemCount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
