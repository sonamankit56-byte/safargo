import React, { useState } from 'react';
import { useShopping } from '../../context/ShoppingContext';
import { 
  Search, 
  ArrowLeft, 
  X, 
  Mic, 
  Camera, 
  Sparkles, 
  TrendingUp, 
  Clock,
  Filter
} from 'lucide-react';
import { ProductCard } from '../home/ProductCard';

export const SearchModal: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    navigateBack, 
    products, 
    setCurrentView,
    t 
  } = useShopping();

  const [isListening, setIsListening] = useState(false);
  const [activeFilterTag, setActiveFilterTag] = useState<string>('all');

  const popularSearches = [
    'Banarasi Saree',
    'Rayon Kurti',
    'Men Casual Shirt',
    'Bluetooth Earbuds',
    'King Size Bedsheet',
    'Kundan Jewellery',
    'Flared Jeans',
    'Baby Dungaree'
  ];

  const handleVoiceSearch = () => {
    setIsListening(true);
    setTimeout(() => {
      setSearchQuery('Banarasi Saree');
      setIsListening(false);
    }, 1500);
  };

  const handleCameraSearch = () => {
    setSearchQuery('Rayon Kurti');
    alert(t('फोटो आधारित सर्च: सिमिलर कुर्ती सर्च की गई!', 'Image recognized: Searching similar kurtis!'));
  };

  // Filter matching products
  const matchingProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesText = 
      p.title.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q) ||
      p.fabricOrMaterial.toLowerCase().includes(q);

    if (activeFilterTag === 'under_299') return matchesText && p.dealPrice <= 299;
    if (activeFilterTag === 'rating_4') return matchesText && p.rating >= 4.2;
    if (activeFilterTag === 'mall') return matchesText && p.isMallProduct;
    return matchesText;
  });

  return (
    <div className="bg-white min-h-screen z-50">
      {/* Top Search Input Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-3 shadow-xs flex items-center gap-2">
        <button
          onClick={navigateBack}
          aria-label="Back"
          className="p-1.5 text-gray-700 hover:text-[#9F2089] rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('साड़ी, कुर्ती, शर्ट या गैजेट्स खोजें...', 'Try Sarees, Kurtis, Shirts, Earbuds...')}
            className="w-full pl-9 pr-16 py-2.5 bg-gray-100 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#9F2089] focus:outline-none transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-[#9F2089]'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleCameraSearch}
              className="p-1.5 text-gray-500 hover:text-[#9F2089]"
              title="Search by Camera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Listening Prompt */}
      {isListening && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-center text-xs text-red-700 font-bold animate-pulse flex items-center justify-center gap-2">
          <Mic className="w-4 h-4" />
          <span>{t('सुन रहे हैं... बोलिए "बनारसी साड़ी" या "कुर्ती"', 'Listening... Say "Banarasi Saree" or "Kurti"')}</span>
        </div>
      )}

      {/* Filter Quick Pills */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <button
          onClick={() => setActiveFilterTag('all')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${
            activeFilterTag === 'all' ? 'bg-[#9F2089] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {t('सभी (All)', 'All')}
        </button>
        <button
          onClick={() => setActiveFilterTag('under_299')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${
            activeFilterTag === 'under_299' ? 'bg-[#9F2089] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {t('₹299 से कम', 'Under ₹299')}
        </button>
        <button
          onClick={() => setActiveFilterTag('rating_4')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${
            activeFilterTag === 'rating_4' ? 'bg-[#9F2089] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {t('4★+ रेटिंग', '4★+ Rating')}
        </button>
        <button
          onClick={() => setActiveFilterTag('mall')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors ${
            activeFilterTag === 'mall' ? 'bg-[#9F2089] text-white' : 'bg-gray-100 text-gray-700'
          }`}
        >
          {t('सफ़रगो मॉल', 'SafarGo Mall')}
        </button>
      </div>

      {/* Popular Trending Suggestions (If empty query) */}
      {!searchQuery && (
        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#9F2089]" />
              <span>{t('पॉपुलर सर्च ट्रेंड्स', 'Popular Searches')}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="px-3 py-1.5 bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-300 rounded-full text-xs text-gray-700 hover:text-[#9F2089] font-medium transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="p-3">
        {matchingProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
            {matchingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm font-bold">{t('कोई मैचिंग प्रोडक्ट नहीं मिला', 'No matching products found')}</p>
            <p className="text-xs mt-1">{t('कृपया कोई अन्य शब्द सर्च करें', 'Try searching for something else like "Saree" or "Shirt"')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
