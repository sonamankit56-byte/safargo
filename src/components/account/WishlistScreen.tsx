import React from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { ProductCard } from '../home/ProductCard';
import { Heart, Sparkles, ArrowLeft } from 'lucide-react';

export const WishlistScreen: React.FC = () => {
  const { wishlistIds, products, setCurrentView, t } = useShopping();

  const wishlistedProducts = products.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="bg-gray-100 min-h-screen pb-24 pt-2">
      <div className="max-w-4xl mx-auto px-3 space-y-3">
        <div className="bg-white rounded-xl p-3 border border-gray-200 flex items-center justify-between shadow-soft">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#9F2089] fill-[#9F2089]" />
            <h1 className="text-sm sm:text-base font-extrabold text-gray-900">
              {t('मेरी विशलिस्ट (My Wishlist)', 'My Wishlist')}
            </h1>
            <span className="text-xs text-gray-500 font-normal">
              ({wishlistedProducts.length})
            </span>
          </div>

          <button
            onClick={() => setCurrentView('home')}
            className="text-xs font-bold text-[#9F2089] hover:underline"
          >
            {t('+ और प्रोडक्ट्स जोड़ें', '+ Add More')}
          </button>
        </div>

        {wishlistedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {wishlistedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 max-w-sm mx-auto my-8">
            <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-gray-800">
              {t('आपकी विशलिस्ट खाली है', 'Your Wishlist is Empty')}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {t('प्रोडक्ट्स पर दिल (❤️) आइकन दबाकर उन्हें यहां सहेजें', 'Tap heart icon on any product to save it here for later')}
            </p>
            <button
              onClick={() => setCurrentView('home')}
              className="mt-4 px-5 py-2 bg-[#9F2089] text-white text-xs font-bold rounded-lg shadow-sm"
            >
              {t('प्रोडक्ट्स देखें', 'Explore Products')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
