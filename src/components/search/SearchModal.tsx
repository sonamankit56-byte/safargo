import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Flame,
  ChevronRight,
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';
import { ProductCard } from '../home/ProductCard';

// Autocomplete dictionary covering Indian apparel, ethnic wear, electronics, home & jewelry
const AUTOCOMPLETE_SUGGESTIONS = [
  'Banarasi Saree',
  'Silk Saree with Blouse Piece',
  'Saree Party Wear',
  'Rayon Kurti',
  'Anarkali Kurti Set',
  'Cotton Kurti with Pant',
  'Casual Shirt Men',
  'Slim Fit Cotton Shirt',
  'Bluetooth Earbuds 5.3',
  'Wireless Headphones',
  'King Size Double Bedsheet',
  'Glaze Cotton Bedsheets',
  'Flared Denim Jeans',
  'High Rise Stretchable Jeans',
  'Kundan Choker Jewellery Set',
  'Gold Plated Jhumka Earrings',
  'Mini Electric Garlic Chopper',
  'Baby Dungaree T-shirt Set',
  'Matte Liquid Lipstick Set',
  'Smart Watch Bluetooth Calling'
];

export const SearchModal: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    navigateBack, 
    products, 
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    setCurrentView,
    t 
  } = useShopping();

  const [isListening, setIsListening] = useState(false);
  const [activeFilterTag, setActiveFilterTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'rating'>('popular');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live filtered suggestions
  const liveSuggestions = searchQuery.trim()
    ? AUTOCOMPLETE_SUGGESTIONS.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Voice Search with real Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'hi-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript);
          addRecentSearch(transcript);
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
          // Fallback demo
          setSearchQuery('Banarasi Saree');
          addRecentSearch('Banarasi Saree');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch {
        setIsListening(false);
        setSearchQuery('Banarasi Saree');
        addRecentSearch('Banarasi Saree');
      }
    } else {
      // Fallback
      setIsListening(true);
      setTimeout(() => {
        setSearchQuery('Banarasi Saree');
        addRecentSearch('Banarasi Saree');
        setIsListening(false);
      }, 1200);
    }
  };

  // Camera Visual Search with real file selection or simulated recognition
  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name.toLowerCase();
      let matchedTerm = 'Rayon Kurti';
      if (fileName.includes('saree')) matchedTerm = 'Banarasi Saree';
      else if (fileName.includes('shirt')) matchedTerm = 'Casual Shirt Men';
      else if (fileName.includes('watch')) matchedTerm = 'Smart Watch';

      setSearchQuery(matchedTerm);
      addRecentSearch(matchedTerm);
      alert(t(`फोटो पहचान सफल! "${matchedTerm}" से मिलते-जुलते प्रोडक्ट्स सर्च किए गए।`, `Visual match found for "${matchedTerm}"! Showing similar products.`));
    }
  };

  const handleSelectTerm = (term: string) => {
    setSearchQuery(term);
    addRecentSearch(term);
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

    if (activeFilterTag === 'under_199') return matchesText && p.dealPrice <= 199;
    if (activeFilterTag === 'under_299') return matchesText && p.dealPrice <= 299;
    if (activeFilterTag === 'rating_4') return matchesText && p.rating >= 4.2;
    if (activeFilterTag === 'mall') return matchesText && p.isMallProduct;
    return matchesText;
  });

  const sortedProducts = [...matchingProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.dealPrice - b.dealPrice;
    if (sortBy === 'price_desc') return b.dealPrice - a.dealPrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.ratingCount - a.ratingCount;
  });

  return (
    <div className="bg-white min-h-screen z-50 flex flex-col">
      {/* Hidden file input for camera/photo search */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Top Search Input Header (Exact Meesho Styling) */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-2.5 sm:p-3 shadow-xs flex items-center gap-2 z-10">
        <button
          onClick={navigateBack}
          aria-label="Back"
          className="p-1.5 text-gray-700 hover:text-[#9F2089] rounded-full transition-colors active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="relative flex-1">
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery.trim()) {
                addRecentSearch(searchQuery.trim());
              }
            }}
            placeholder={t('साड़ी, कुर्ती, शर्ट या गैजेट्स खोजें...', 'Search by Keyword or Product ID')}
            className="w-full pl-9 pr-20 py-2.5 bg-gray-100 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-[#9F2089] focus:outline-none transition-all placeholder-gray-400 text-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`p-1.5 rounded-full transition-colors ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:text-[#9F2089]'
              }`}
              title="Voice Search"
            >
              <Mic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCameraClick}
              className="p-1.5 text-gray-500 hover:text-[#9F2089]"
              title="Search by Camera"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Listening Bar */}
      {isListening && (
        <div className="bg-red-50 border-b border-red-200 p-3 text-center text-xs text-red-700 font-bold animate-pulse flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
          <span>{t('सुन रहे हैं... बोलिए "बनारसी साड़ी", "कुर्ती" या "शर्ट"', 'Listening... Speak now e.g. "Banarasi Saree"')}</span>
        </div>
      )}

      {/* Live Autocomplete Suggestions Dropdown (Meesho Autocomplete) */}
      {searchQuery.trim() && liveSuggestions.length > 0 && (
        <div className="bg-white border-b border-gray-100 divide-y divide-gray-50 shadow-sm">
          {liveSuggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectTerm(item)}
              className="px-4 py-2.5 flex items-center justify-between text-xs text-gray-700 hover:bg-pink-50/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-medium text-gray-800">{item}</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-gray-400" />
            </div>
          ))}
        </div>
      )}

      {/* Filter & Sort Bar (When search has content or browsing) */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        {/* Sort Selector */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-1 text-xs shrink-0 shadow-xs">
          <SlidersHorizontal className="w-3 h-3 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent border-none text-[11px] font-bold focus:outline-none cursor-pointer"
          >
            <option value="popular">{t('पॉपुलर', 'Popular')}</option>
            <option value="price_asc">{t('कीमत: कम से ज्यादा', 'Price: Low to High')}</option>
            <option value="price_desc">{t('कीमत: ज्यादा से कम', 'Price: High to Low')}</option>
            <option value="rating">{t('रेटिंग', 'Rating')}</option>
          </select>
        </div>

        {/* Filter Pills */}
        <button
          onClick={() => setActiveFilterTag('all')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 text-[11px] ${
            activeFilterTag === 'all' ? 'bg-[#9F2089] text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          {t('सभी (All)', 'All')}
        </button>
        <button
          onClick={() => setActiveFilterTag('under_199')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 text-[11px] ${
            activeFilterTag === 'under_199' ? 'bg-[#9F2089] text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          {t('₹199 से कम', 'Under ₹199')}
        </button>
        <button
          onClick={() => setActiveFilterTag('under_299')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 text-[11px] ${
            activeFilterTag === 'under_299' ? 'bg-[#9F2089] text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          {t('₹299 से कम', 'Under ₹299')}
        </button>
        <button
          onClick={() => setActiveFilterTag('rating_4')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 text-[11px] ${
            activeFilterTag === 'rating_4' ? 'bg-[#9F2089] text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          {t('4★+ रेटिंग', '4★+ Rating')}
        </button>
        <button
          onClick={() => setActiveFilterTag('mall')}
          className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-colors shrink-0 text-[11px] ${
            activeFilterTag === 'mall' ? 'bg-[#9F2089] text-white' : 'bg-white border border-gray-200 text-gray-700'
          }`}
        >
          {t('सफ़रगो मॉल', 'SafarGo Mall')}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-50 p-3 overflow-y-auto">
        {/* If Query is Empty: Show Recent & Trending Searches */}
        {!searchQuery.trim() ? (
          <div className="max-w-3xl mx-auto space-y-4 pt-1">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{t('हाल ही में खोजा गया (Recent Searches)', 'Recent Searches')}</span>
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-[11px] text-[#9F2089] font-bold hover:underline"
                  >
                    {t('साफ करें', 'Clear All')}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectTerm(term)}
                      className="px-3 py-1 bg-gray-100 hover:bg-pink-50 border border-gray-200 rounded-full text-xs text-gray-800 font-medium transition-colors flex items-center gap-1.5"
                    >
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-soft">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-2.5">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>{t('ट्रेंडिंग सर्च (Trending on SafarGo)', 'Trending Searches')}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  'Banarasi Saree',
                  'Rayon Kurti',
                  'Casual Shirt Men',
                  'Bluetooth Earbuds',
                  'King Size Bedsheet',
                  'Kundan Jewellery',
                  'Flared Jeans',
                  'Baby Dungaree'
                ].map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSelectTerm(term)}
                    className="px-3 py-1.5 bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-300 rounded-full text-xs text-gray-700 hover:text-[#9F2089] font-medium transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommended Products Grid */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 px-1">
                {t('आपके लिए सुझाये गए प्रोडक्ट्स', 'Popular Right Now')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                {products.slice(0, 8).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results Grid */
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2.5 px-1 text-xs text-gray-600">
              <span>
                {t('खोज परिणाम:', 'Search Results for:')} <b className="text-gray-900 font-bold">"{searchQuery}"</b>
              </span>
              <span className="font-semibold text-gray-500">
                ({sortedProducts.length} {t('प्रोडक्ट्स', 'products')})
              </span>
            </div>

            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
                {sortedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 my-6 max-w-sm mx-auto">
                <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-gray-800">
                  {t('कोई प्रोडक्ट नहीं मिला', 'No Products Found')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t('कृपया कोई अन्य शब्द सर्च करें या फ़िल्टर हटाएं', 'Try searching for something else like "Saree" or "Kurti"')}
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-[#9F2089] text-white text-xs font-bold rounded-lg"
                >
                  {t('सर्च रीसेट करें', 'Reset Search')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
